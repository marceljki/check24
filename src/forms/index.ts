import { estA2025 } from './estA2025'
import { anlageN2025 } from './anlageN2025'
import { anlageSonderausgaben2025 } from './anlageSonderausgaben2025'
import { anlageVorsorgeaufwand2025 } from './anlageVorsorgeaufwand2025'
import type { FormDefinition } from '../types'

export const ALL_FORMS: FormDefinition[] = [
  estA2025,
  anlageN2025,
  anlageSonderausgaben2025,
  anlageVorsorgeaufwand2025,
]

export const FORM_BY_ID: Record<string, FormDefinition> = Object.fromEntries(
  ALL_FORMS.map((f) => [f.id, f])
)

export { estA2025, anlageN2025, anlageSonderausgaben2025, anlageVorsorgeaufwand2025 }
