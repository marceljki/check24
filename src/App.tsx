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

// All mutable session data lives in a single ref so async callbacks
// always read the latest values without stale closures.
interface SessionData {
  appState: AppState
  messages: Message[]
  allFields: FormField[]
  fieldIndex: number
  collectedData: CollectedData
  selectedForms: FormDefinition[]
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('WELCOME')
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [turns, setTurns] = useState<ConversationTurn[]>([])

  // Reactive copies for rendering
  const [selectedForms, setSelectedForms] = useState<FormDefinition[]>([])
  const [collectedData, setCollectedData] = useState<CollectedData>({})
  const [allFields, setAllFields] = useState<FormField[]>([])
  const [fieldIndex, setFieldIndex] = useState(0)

  // Single ref for all values accessed inside async callbacks
  const session = useRef<SessionData>({
    appState: 'WELCOME',
    messages: [],
    allFields: [],
    fieldIndex: 0,
    collectedData: {},
    selectedForms: [],
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // ── helpers ─────────────────────────────────────────────────────────
  function addTurn(speaker: 'user' | 'assistant', text: string) {
    setTurns((prev) => [...prev, { id: generateId(), speaker, text, timestamp: new Date() }])
  }

  async function speakAndAdd(text: string) {
    addTurn('assistant', text)
    setIsSpeaking(true)
    try {
      await speak(text)
    } catch (err) {
      console.error('TTS error:', err)
    } finally {
      setIsSpeaking(false)
    }
  }

  function pushMessage(msg: Message) {
    session.current.messages = [...session.current.messages, msg]
    // no need to setMessages — messages only consumed inside async flow via ref
  }

  // ── WELCOME → DETECTING ──────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    session.current.appState = 'DETECTING_FORM'
    setAppState('DETECTING_FORM')

    const greeting =
      'Guten Tag! Ich bin Ihr digitaler Steuer-Assistent. Ich helfe Ihnen dabei, die richtigen Formulare für Ihre Steuererklärung 2025 auszufüllen. Erzählen Sie mir kurz: Sind Sie angestellt, selbstständig, oder beides? Und haben Sie besondere Ausgaben wie Spenden oder Versicherungsbeiträge?'

    pushMessage({ role: 'assistant', content: greeting })
    await speakAndAdd(greeting)
  }, [])

  // ── CORE: process audio blob after recording stops ───────────────────
  const handleUserSpeech = useCallback(async (audioBlob: Blob) => {
    setRecordingState('processing')

    // ── STT ──
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
    pushMessage({ role: 'user', content: transcript })

    // Read latest values from ref (no stale closure)
    const { appState: currentState, messages, allFields: fields, fieldIndex: idx } = session.current

    // ── DETECTING FORM ──
    if (currentState === 'DETECTING_FORM') {
      const { response, selectedFormIds } = await detectForms(messages)
      pushMessage({ role: 'assistant', content: response })

      if (selectedFormIds && selectedFormIds.length > 0) {
        const forms = selectedFormIds.map((id) => FORM_BY_ID[id]).filter((f): f is FormDefinition => !!f)
        const flatFields = forms.flatMap((f) => f.fields)

        // Update ref
        session.current.selectedForms = forms
        session.current.allFields = flatFields
        session.current.fieldIndex = 0
        session.current.appState = 'COLLECTING'

        // Update React state for rendering
        setSelectedForms(forms)
        setAllFields(flatFields)
        setFieldIndex(0)
        setAppState('COLLECTING')

        const firstQuestion = flatFields[0]?.question ?? ''
        const transitionMsg = `${response} Gut, ich habe die passenden Formulare für Sie ausgewählt. Fangen wir an! ${firstQuestion}`
        pushMessage({ role: 'assistant', content: firstQuestion })
        setRecordingState('idle')
        await speakAndAdd(transitionMsg)
      } else {
        // Need more info — keep asking
        setRecordingState('idle')
        await speakAndAdd(response)
      }
      return
    }

    // ── COLLECTING FIELDS ──
    if (currentState === 'COLLECTING') {
      const currentField = fields[idx]
      if (!currentField) {
        setRecordingState('idle')
        return
      }

      const nextField = fields[idx + 1] ?? null
      const isLast = idx === fields.length - 1

      const { response, value } = await collectField(messages, currentField, nextField)
      pushMessage({ role: 'assistant', content: response })

      // Save collected value
      const newData = { ...session.current.collectedData }
      if (value !== null && value !== undefined) {
        newData[currentField.id] = value as string | number | boolean
      }
      session.current.collectedData = newData
      setCollectedData(newData)

      if (isLast) {
        session.current.appState = 'COMPLETE'
        setAppState('COMPLETE')
        setRecordingState('idle')
        await speakAndAdd(response)
        return
      }

      // Advance to next field
      const nextIdx = idx + 1
      session.current.fieldIndex = nextIdx
      setFieldIndex(nextIdx)
      setRecordingState('idle')
      await speakAndAdd(response)
    }
  }, []) // intentionally empty deps — reads all mutable state from session ref

  // ── RECORDING ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      const recorder = new MediaRecorder(stream, { mimeType })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType })
        void handleUserSpeech(blob)
      }

      recorder.start()
      mediaRecorderRef.current = recorder
      setRecordingState('recording')
    } catch (err) {
      console.error('Microphone error:', err)
    }
  }, [handleUserSpeech])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
  }, [])

  const handleVoiceToggle = useCallback(() => {
    if (recordingState === 'idle') startRecording()
    else if (recordingState === 'recording') stopRecording()
  }, [recordingState, startRecording, stopRecording])

  // ── PROGRESS ─────────────────────────────────────────────────────────
  const currentFormIndex = (() => {
    let count = 0
    for (let i = 0; i < selectedForms.length; i++) {
      count += selectedForms[i]!.fields.length
      if (fieldIndex < count) return i
    }
    return Math.max(0, selectedForms.length - 1)
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
          session.current = {
            appState: 'WELCOME',
            messages: [],
            allFields: [],
            fieldIndex: 0,
            collectedData: {},
            selectedForms: [],
          }
          setAppState('WELCOME')
          setTurns([])
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
          {appState === 'DETECTING_FORM' ? 'Analyse' : `Feld ${fieldIndex + 1} / ${allFields.length}`}
        </span>
      </div>

      {/* Progress bar */}
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
