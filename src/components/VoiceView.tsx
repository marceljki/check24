import type { ConversationTurn } from '../types'

type VoiceState = 'idle' | 'recording' | 'processing' | 'speaking'

interface VoiceViewProps {
  state: VoiceState
  turns: ConversationTurn[]
}

export function VoiceView({ state, turns }: VoiceViewProps) {
  const lastAssistant = [...turns].reverse().find((t) => t.speaker === 'assistant')
  const lastUser = [...turns].reverse().find((t) => t.speaker === 'user')

  const orbColor = {
    idle: 'from-blue-600 to-indigo-700',
    recording: 'from-red-500 to-rose-600',
    processing: 'from-yellow-500 to-amber-600',
    speaking: 'from-violet-500 to-purple-700',
  }[state]

  const orbLabel = {
    idle: 'Bereit',
    recording: 'Ich höre zu...',
    processing: 'Ich denke...',
    speaking: 'Ich spreche...',
  }[state]

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
      {/* Animated orb */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow rings */}
        {(state === 'speaking' || state === 'recording') && (
          <>
            <div className={`absolute w-48 h-48 rounded-full bg-gradient-to-br ${orbColor} opacity-10 animate-ping`} />
            <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${orbColor} opacity-20 animate-pulse`} />
          </>
        )}
        {state === 'processing' && (
          <div className={`absolute w-36 h-36 rounded-full bg-gradient-to-br ${orbColor} opacity-20 animate-pulse`} />
        )}

        {/* Main orb */}
        <div
          className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${orbColor} shadow-2xl flex items-center justify-center transition-all duration-300`}
        >
          {state === 'speaking' && (
            <div className="flex gap-1 items-end h-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-white rounded-full wave-bar"
                  style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}
          {state === 'recording' && (
            <div className="flex gap-1 items-end h-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-white/90 rounded-full wave-bar"
                  style={{ height: `${6 + i * 5}px`, animationDelay: `${i * 0.08}s` }}
                />
              ))}
            </div>
          )}
          {state === 'processing' && (
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {state === 'idle' && (
            <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </div>
      </div>

      {/* Status label */}
      <p className="text-slate-400 text-sm tracking-wide uppercase font-medium">{orbLabel}</p>

      {/* Assistant message */}
      {lastAssistant && (
        <div className="w-full max-w-sm text-center">
          <p className="text-white text-lg leading-relaxed font-light">
            {lastAssistant.text}
          </p>
        </div>
      )}

      {/* User transcript (small, below) */}
      {lastUser && state !== 'recording' && (
        <div className="w-full max-w-sm text-center">
          <p className="text-slate-500 text-sm italic">
            Sie: „{lastUser.text}"
          </p>
        </div>
      )}
    </div>
  )
}
