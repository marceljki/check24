import type { FormDefinition } from '../types'

interface ProgressBarProps {
  selectedForms: FormDefinition[]
  currentFormIndex: number
  currentFieldIndex: number
  totalFields: number
}

export function ProgressBar({ selectedForms, currentFormIndex, currentFieldIndex, totalFields }: ProgressBarProps) {
  if (selectedForms.length === 0) return null

  const overallProgress = totalFields > 0 ? (currentFieldIndex / totalFields) * 100 : 0
  const currentForm = selectedForms[currentFormIndex]

  return (
    <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-slate-400 truncate max-w-[70%]">
          {currentForm?.name ?? 'Formularauswahl'}
        </span>
        <span className="text-xs text-slate-500">
          {currentFieldIndex}/{totalFields} Felder
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      {selectedForms.length > 1 && (
        <div className="flex gap-1.5 mt-2">
          {selectedForms.map((form, i) => (
            <div
              key={form.id}
              title={form.name}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < currentFormIndex
                  ? 'bg-blue-500'
                  : i === currentFormIndex
                  ? 'bg-blue-400'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
