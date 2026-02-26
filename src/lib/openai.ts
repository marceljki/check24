import OpenAI from 'openai'
import type { Message, FormField } from '../types'
import { ALL_FORMS } from '../forms'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const file = new File([audioBlob], 'recording.webm', { type: audioBlob.type })
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'de',
  })
  return response.text
}

const SYSTEM_PROMPT_DETECT = `Du bist ein freundlicher deutscher Steuerberater-Assistent namens "TaxBot".
Deine Aufgabe ist es, durch ein kurzes Gespräch herauszufinden, welche Steuerformulare der Nutzer ausfüllen muss.

Verfügbare Formulare:
${ALL_FORMS.map((f) => `- ${f.id}: ${f.name} (${f.description}). Relevante Stichworte: ${f.triggerKeywords.join(', ')}`).join('\n')}

Führe ein freundliches, natürliches Gespräch auf Deutsch. Stelle maximal 2-3 kurze Fragen, um die Situation des Nutzers zu verstehen.

Wenn du genug Informationen hast, antworte mit folgendem JSON-Block am Ende deiner Nachricht (nach deinem freundlichen Text):
<FORMS_SELECTED>
{"selectedForms": ["form_id_1", "form_id_2"]}
</FORMS_SELECTED>

Wähle immer mindestens "est_1_a" aus (Grundformular). Füge weitere Formulare hinzu, wenn relevant.
Sprich den Nutzer mit "Sie" an. Sei warm, professionell und klar.`

export async function detectForms(messages: Message[]): Promise<{ response: string; selectedFormIds: string[] | null }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT_DETECT },
      ...messages,
    ],
    temperature: 0.7,
  })

  const text = response.choices[0]?.message?.content ?? ''
  const match = text.match(/<FORMS_SELECTED>([\s\S]*?)<\/FORMS_SELECTED>/)
  let selectedFormIds: string[] | null = null

  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim()) as { selectedForms: string[] }
      selectedFormIds = parsed.selectedForms
    } catch {
      // keep null
    }
  }

  const cleanResponse = text.replace(/<FORMS_SELECTED>[\s\S]*?<\/FORMS_SELECTED>/g, '').trim()
  return { response: cleanResponse, selectedFormIds }
}

export async function collectField(
  messages: Message[],
  currentField: FormField,
  nextField: FormField | null,
): Promise<{ response: string; value: string | number | boolean | null }> {
  const nextInstruction = nextField
    ? `Stelle danach direkt die nächste Frage: "${nextField.question}"`
    : `Dies ist die letzte Frage. Danke dem Nutzer herzlich und sage, dass alle Informationen gesammelt wurden und er jetzt das PDF herunterladen kann.`

  const systemPrompt = `Du bist ein freundlicher deutscher Steuerberater-Assistent namens TaxBot.

Du hast dem Nutzer soeben diese Frage gestellt: "${currentField.question}"
Feld-ID: ${currentField.id}
Feldtyp: ${currentField.type}${currentField.options ? '\nMögliche Werte: ' + currentField.options.join(', ') : ''}

Der Nutzer hat gerade geantwortet. Tue Folgendes:
1. Bestätige die Antwort kurz und freundlich auf Deutsch (1 kurzer Satz)
2. ${nextInstruction}

Füge am Ende IMMER diesen JSON-Block ein (kein anderer Text danach):
<VALUE>
{"fieldId": "${currentField.id}", "value": WERT}
</VALUE>

Regeln für WERT:
- Zahlen: nur die Zahl (z.B. 45000), kein Anführungszeichen
- Boolean: true oder false (kein Anführungszeichen)
- Text/Datum/Auswahl: als JSON-String (mit Anführungszeichen)
- Falls der Nutzer überspringen möchte oder unklar: null

Sprich den Nutzer immer mit "Sie" an. Antworte auf Deutsch.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
  })

  const text = response.choices[0]?.message?.content ?? ''
  const match = text.match(/<VALUE>([\s\S]*?)<\/VALUE>/)
  let value: string | number | boolean | null = null

  if (match) {
    try {
      const parsed = JSON.parse(match[1].trim()) as { fieldId: string; value: unknown }
      value = parsed.value as string | number | boolean | null
    } catch {
      // keep null
    }
  }

  const cleanResponse = text.replace(/<VALUE>[\s\S]*?<\/VALUE>/g, '').trim()
  return { response: cleanResponse, value }
}
