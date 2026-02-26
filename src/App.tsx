import { useState, useRef, useCallback } from 'react'
import type { AppState, Message, FormDefinition, CollectedData, ConversationTurn, FormField } from './types'
import { WelcomeScreen } from './components/WelcomeScreen'
import { VoiceButton } from './components/VoiceButton'
import { ConversationView } from './components/ConversationView'
import { ProgressBar } from './components/ProgressBar'
import { DownloadScreen } from './components/DownloadScreen'
import { transcribeAudio, detectForms, collectField } from './lib/openai'
import { speak } from './lib/elevenlabs'
import { FORM_BY_ID } from './forms'

type RecordingState = 'idle' | 'recording' | 'processing'

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('WELCOME')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [turns, setTurns] = useState<ConversationTurn[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedForms, setSelectedForms] = useState<FormDefinition[]>([])
  const [collectedData, setCollectedData] = useState<CollectedData>({})
  const [allFields, setAllFields] = useState<FormField[]>([])
  const [fieldIndex, setFieldIndex] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const addTurn = useCallback((speaker: 'user' | 'assistant', text: string) => {
    setTurns((prev) => [...prev, { id: generateId(), speaker, text, timestamp: new Date() }])
  }, [])

  const speakAndAdd = useCallback(async (text: string) => {
    addTurn('assistant', text)
    setIsSpeaking(true)
    try {
      await speak(text)
    } catch (err) {
      console.error('TTS error:', err)
    } finally {
      setIsSpeaking(false)
    }
  }, [addTurn])

  // ── WELCOME → DETECTING ──────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    setAppState('DETECTING_FORM')
    const greeting = 'Guten Tag! Ich bin Ihr digitaler Steuer-Assistent. Ich helfe Ihnen dabei, die richtigen Formulare für Ihre Steuererklärung 2025 auszufüllen. Erzählen Sie mir kurz: Sind Sie angestellt, selbstständig, oder beides? Und haben Sie besondere Ausgaben wie Spenden oder Versicherungsbeiträge?'
    const firstMsg: Message = { role: 'assistant', content: greeting }
    setMessages([firstMsg])
    await speakAndAdd(greeting)
  }, [speakAndAdd])

  // ── PROCESS USER SPEECH ──────────────────────────────────────────────
  const handleUserSpeech = useCallback(async (audioBlob: Blob) => {
    setRecordingState('processing')

    let transcript = ''
    try {
      transcript = await transcribeAudio(audioBlob)
    } catch (err) {
      console.error('Whisper error:', err)
      setRecordingState('idle')
      return
    }

    if (!transcript.trim()) {
      setRecordingState('idle')
      return
    }

    addTurn('user', transcript)
    const userMsg: Message = { role: 'user', content: transcript }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)

    if (appState === 'DETECTING_FORM') {
      const { response, selectedFormIds } = await detectForms(updatedMessages)
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])

      if (selectedFormIds && selectedFormIds.length > 0) {
        const forms = selectedFormIds
          .map((id) => FORM_BY_ID[id])
          .filter((f): f is FormDefinition => !!f)

        const fields = forms.flatMap((f) => f.fields)
        setSelectedForms(forms)
        setAllFields(fields)
        setFieldIndex(0)

        const transitionMsg = response + '\n\nIch habe die richtigen Formulare für Sie identifiziert. Jetzt werde ich Ihnen ein paar Fragen stellen. ' + fields[0]?.question
        setMessages((prev) => [...prev, { role: 'assistant', content: fields[0]?.question ?? '' }])
        setAppState('COLLECTING')
        setRecordingState('idle')
        await speakAndAdd(transitionMsg)
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: response }])
        setRecordingState('idle')
        await speakAndAdd(response)
      }
    } else if (appState === 'COLLECTING') {
      const currentField = allFields[fieldIndex]
      const fieldContext = `Aktuelles Feld: ${currentField?.id} - "${currentField?.label}"\nFrage: "${currentField?.question}"\nFeldtyp: ${currentField?.type}${currentField?.options ? '\nOptionen: ' + currentField.options.join(', ') : ''}`

      const { response, fieldAnswer } = await collectField(updatedMessages, fieldContext)
      setMessages((prev) => [...prev, { role: 'assistant', content: response }])

      let nextFieldIdx = fieldIndex
      let newCollectedData = collectedData

      if (fieldAnswer && fieldAnswer.fieldId) {
        if (fieldAnswer.value !== null && fieldAnswer.value !== undefined) {
          newCollectedData = { ...collectedData, [fieldAnswer.fieldId]: fieldAnswer.value as string | number | boolean }
          setCollectedData(newCollectedData)
        }

        if (fieldAnswer.done) {
          setAppState('COMPLETE')
          setRecordingState('idle')
          const doneMsg = 'Vielen Dank! Ich habe alle nötigen Informationen gesammelt. Sie können jetzt Ihre Zusammenfassung als PDF herunterladen.'
          await speakAndAdd(doneMsg)
          return
        }

        nextFieldIdx = fieldIndex + 1
        setFieldIndex(nextFieldIdx)
      }

      setRecordingState('idle')

      if (nextFieldIdx < allFields.length) {
        const nextQuestion = allFields[nextFieldIdx]?.question
        const fullResponse = response + (nextQuestion && !response.includes(nextQuestion) ? ' ' + nextQuestion : '')
        await speakAndAdd(fullResponse)
      } else {
        setAppState('COMPLETE')
        const doneMsg = 'Vielen Dank! Alle Felder wurden ausgefüllt. Sie können jetzt Ihre Zusammenfassung als PDF herunterladen.'
        await speakAndAdd(doneMsg)
      }
    }
  }, [appState, messages, allFields, fieldIndex, collectedData, addTurn, speakAndAdd])

  // ── RECORDING CONTROLS ───────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        await handleUserSpeech(blob)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setRecordingState('recording')
    } catch (err) {
      console.error('Microphone error:', err)
    }
  }, [handleUserSpeech])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const handleVoiceToggle = useCallback(() => {
    if (recordingState === 'idle') {
      startRecording()
    } else if (recordingState === 'recording') {
      stopRecording()
    }
  }, [recordingState, startRecording, stopRecording])

  // ── COMPUTE PROGRESS ─────────────────────────────────────────────────
  const currentFormIndex = (() => {
    if (allFields.length === 0) return 0
    let count = 0
    for (let i = 0; i < selectedForms.length; i++) {
      count += selectedForms[i]!.fields.length
      if (fieldIndex < count) return i
    }
    return selectedForms.length - 1
  })()

  // ── RENDER ────────────────────────────────────────────────────────────
  if (appState === 'WELCOME') {
    return <WelcomeScreen onStart={handleStart} />
  }

  if (appState === 'COMPLETE') {
    return (
      <DownloadScreen
        selectedForms={selectedForms}
        collectedData={collectedData}
        onRestart={() => {
          setAppState('WELCOME')
          setTurns([])
          setMessages([])
          setSelectedForms([])
          setCollectedData({})
          setAllFields([])
          setFieldIndex(0)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-semibold text-white">Steuer-Assistent</span>
        </div>
        <span className="text-xs text-slate-500 px-2 py-1 rounded-full bg-slate-800">
          {appState === 'DETECTING_FORM' ? 'Analyse' : 'Dateneingabe'}
        </span>
      </div>

      {/* Progress bar (only during collection) */}
      {appState === 'COLLECTING' && (
        <ProgressBar
          selectedForms={selectedForms}
          currentFormIndex={currentFormIndex}
          currentFieldIndex={fieldIndex}
          totalFields={allFields.length}
        />
      )}

      {/* Conversation */}
      <ConversationView turns={turns} />

      {/* Voice input */}
      <div className="border-t border-slate-800 bg-slate-900 px-4 py-6 flex justify-center">
        <VoiceButton
          isRecording={recordingState === 'recording'}
          isProcessing={recordingState === 'processing'}
          isSpeaking={isSpeaking}
          onToggle={handleVoiceToggle}
        />
      </div>
    </div>
  )
}
