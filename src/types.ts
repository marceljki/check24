export type AppState =
  | 'WELCOME'
  | 'DETECTING_FORM'
  | 'COLLECTING'
  | 'COMPLETE'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  role: MessageRole
  content: string
}

export interface FormField {
  id: string
  label: string
  question: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'select'
  options?: string[]
  required: boolean
  hint?: string
}

export interface FormDefinition {
  id: string
  name: string
  description: string
  triggerKeywords: string[]
  fields: FormField[]
}

export interface CollectedData {
  [fieldId: string]: string | number | boolean
}

export interface FormSession {
  selectedForms: FormDefinition[]
  collectedData: CollectedData
  currentFieldIndex: number
  phase: 'detecting' | 'collecting' | 'complete'
}

export interface ConversationTurn {
  id: string
  speaker: 'user' | 'assistant'
  text: string
  timestamp: Date
}
