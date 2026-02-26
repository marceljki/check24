import { useEffect, useRef } from 'react'
import type { ConversationTurn } from '../types'

interface ConversationViewProps {
  turns: ConversationTurn[]
}

export function ConversationView({ turns }: ConversationViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  if (turns.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 fade-in">
        <div className="text-4xl float">💬</div>
        <p className="text-slate-500 text-sm">Das Gespräch erscheint hier...</p>
        <p className="text-slate-600 text-xs">Tippen Sie den Knopf unten um zu beginnen</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {turns.map((turn) => (
        <div
          key={turn.id}
          className={`flex ${turn.speaker === 'user' ? 'justify-end slide-in-right' : 'justify-start slide-in-left'}`}
        >
          {turn.speaker === 'assistant' && (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1 shadow-lg glow-purple">
              <span className="text-sm">🤖</span>
            </div>
          )}

          <div
            className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
              turn.speaker === 'user'
                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-br-sm glow-purple'
                : 'glass text-slate-100 rounded-bl-sm border border-white/8'
            }`}
          >
            {turn.text}
          </div>

          {turn.speaker === 'user' && (
            <div className="w-9 h-9 rounded-full glass border border-white/10 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
