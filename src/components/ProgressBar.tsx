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
  const pct = Math.round(overallProgress)

  return (
    <div className="px-4 py-3 glass border-b border-white/8">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-violet-400">📋</span>
          <span className="text-xs text-slate-300 font-medium truncate max-w-[60%]">
            {currentForm?.name ?? 'Formularauswahl'}
          </span>
        </div>
        <span className="text-xs font-bold gradient-text">
          {pct}%
        </span>
      </div>

      {/* Progress track */}
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div
          className="shimmer-bar h-2 rounded-full transition-all duration-700"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Form dots for multi-form */}
      {selectedForms.length > 1 && (
        <div className="flex gap-1.5 mt-2.5">
          {selectedForms.map((form, i) => (
            <div
              key={form.id}
              title={form.name}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i < currentFormIndex
                  ? 'bg-violet-500'
                  : i === currentFormIndex
                  ? 'shimmer-bar'
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
