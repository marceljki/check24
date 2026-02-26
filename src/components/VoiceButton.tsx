interface VoiceButtonProps {
  isRecording: boolean
  isProcessing: boolean
  isSpeaking: boolean
  onToggle: () => void
  disabled?: boolean
}

export function VoiceButton({ isRecording, isProcessing, isSpeaking, onToggle, disabled }: VoiceButtonProps) {
  const getStatus = () => {
    if (isProcessing) return { text: 'Denke nach...', sub: 'KI verarbeitet Ihre Stimme' }
    if (isSpeaking)   return { text: 'Spricht...', sub: 'Tippen zum Unterbrechen' }
    if (isRecording)  return { text: 'Aufnahme läuft', sub: 'Tippen zum Stoppen' }
    return { text: 'Tippen zum Sprechen', sub: 'Bereit für Ihre Antwort' }
  }

  const status = getStatus()

  const getButtonGradient = () => {
    if (isRecording)  return 'from-red-600 via-rose-500 to-red-600'
    if (isProcessing) return 'from-amber-500 via-yellow-400 to-amber-500'
    if (isSpeaking)   return 'from-violet-600 via-purple-500 to-violet-600'
    return 'from-violet-600 via-indigo-600 to-blue-600'
  }

  const getGlowClass = () => {
    if (isRecording)  return 'pulse-ring-red'
    if (isSpeaking)   return 'pulse-ring'
    return ''
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Expanding rings for recording */}
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-red-500/15 ring-expand" style={{ animationDelay: '0s' }} />
            <div className="absolute w-28 h-28 rounded-full bg-red-500/10 ring-expand" style={{ animationDelay: '0.5s' }} />
            <div className="absolute w-28 h-28 rounded-full bg-red-500/08 ring-expand" style={{ animationDelay: '1s' }} />
          </>
        )}
        {isSpeaking && (
          <>
            <div className="absolute w-28 h-28 rounded-full bg-violet-500/15 ring-expand" style={{ animationDelay: '0s' }} />
            <div className="absolute w-28 h-28 rounded-full bg-violet-500/10 ring-expand" style={{ animationDelay: '0.6s' }} />
          </>
        )}

        {/* Spinning gradient ring for processing */}
        {isProcessing && (
          <div className="absolute w-28 h-28 rounded-full spin-slow"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(251,191,36,0.8) 50%, transparent 100%)',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 3px))',
              WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), white calc(100% - 3px))',
            }}
          />
        )}

        {/* Main button */}
        <button
          onClick={onToggle}
          disabled={disabled || isProcessing}
          className={`
            relative w-24 h-24 rounded-full
            bg-gradient-to-br ${getButtonGradient()}
            flex items-center justify-center
            shadow-2xl transition-all duration-300
            ${getGlowClass()}
            ${isProcessing ? 'cursor-not-allowed opacity-80' : 'active:scale-95 cursor-pointer hover:scale-105'}
          `}
          aria-label={isRecording ? 'Aufnahme stoppen' : 'Sprechen'}
        >
          {isProcessing ? (
            /* Pulsing dots */
            <div className="flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-white"
                  style={{ animation: `wave 0.8s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
            </div>
          ) : isRecording ? (
            /* Taller wave bars */
            <div className="flex gap-1 items-end h-9 pb-1">
              {[10, 16, 24, 20, 14, 20, 14].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full wave-bar"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          ) : isSpeaking ? (
            /* Speaker / stop icon */
            <div className="flex flex-col items-center gap-1">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="3" />
              </svg>
            </div>
          ) : (
            /* Mic icon */
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
      </div>

      {/* Status text */}
      <div className="flex flex-col items-center gap-0.5">
        <p className={`font-semibold text-sm ${
          isRecording  ? 'text-red-400' :
          isProcessing ? 'text-amber-400' :
          isSpeaking   ? 'text-violet-400' :
          'text-white'
        }`}>
          {status.text}
        </p>
        <p className="text-slate-500 text-xs">{status.sub}</p>
      </div>
    </div>
  )
}
