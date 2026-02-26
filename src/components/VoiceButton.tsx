interface VoiceButtonProps {
  isRecording: boolean
  isProcessing: boolean
  isSpeaking: boolean
  onToggle: () => void
  disabled?: boolean
}

export function VoiceButton({ isRecording, isProcessing, isSpeaking, onToggle, disabled }: VoiceButtonProps) {
  const getStatus = () => {
    if (isProcessing) return 'Verarbeite...'
    if (isSpeaking) return 'Assistent spricht...'
    if (isRecording) return 'Aufnahme... (tippen zum Stoppen)'
    return 'Tippen zum Sprechen'
  }

  const getButtonClass = () => {
    const base = 'w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 '
    if (isRecording) return base + 'bg-red-500 scale-110 pulse-ring'
    if (isProcessing) return base + 'bg-yellow-500 cursor-not-allowed'
    if (isSpeaking) return base + 'bg-blue-600 cursor-not-allowed'
    if (disabled) return base + 'bg-slate-700 cursor-not-allowed opacity-50'
    return base + 'bg-blue-600 hover:bg-blue-500 active:scale-95 cursor-pointer'
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onToggle}
        disabled={disabled || isProcessing || isSpeaking}
        className={getButtonClass()}
        aria-label={isRecording ? 'Aufnahme stoppen' : 'Sprechen'}
      >
        {isProcessing ? (
          <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isRecording ? (
          <div className="flex gap-1 items-end h-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-white rounded-full wave-bar"
                style={{ height: `${12 + i * 4}px` }}
              />
            ))}
          </div>
        ) : isSpeaking ? (
          <div className="flex gap-1 items-end h-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-white/80 rounded-full wave-bar"
                style={{ height: `${10 + i * 3}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : (
          <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      <p className="text-slate-400 text-sm">{getStatus()}</p>
    </div>
  )
}
