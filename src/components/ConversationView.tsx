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
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Das Gespräch erscheint hier...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {turns.map((turn) => (
        <div
          key={turn.id}
          className={`flex ${turn.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {turn.speaker === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1" />
              </svg>
            </div>
          )}

          <div
            className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              turn.speaker === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-slate-800 text-slate-100 rounded-bl-sm'
            }`}
          >
            {turn.text}
          </div>

          {turn.speaker === 'user' && (
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
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
