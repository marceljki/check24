import { useState } from 'react'
import { speak } from '../lib/elevenlabs'

const SAMPLES = [
  'Guten Tag! Willkommen bei Ihrem Steuer-Assistenten.',
  'Bitte geben Sie Ihre Einnahmen aus dem Jahr 2025 an.',
  'Haben Sie Werbungskosten, die Sie geltend machen möchten?',
  'Ihre Steuererklärung wurde erfolgreich erstellt und kann jetzt heruntergeladen werden.',
]

export function AudioTestPage() {
  const [speaking, setSpeaking] = useState(false)
  const [activeText, setActiveText] = useState<string | null>(null)
  const [customText, setCustomText] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSpeak(text: string) {
    if (speaking) return
    setSpeaking(true)
    setActiveText(text)
    setError(null)
    try {
      await speak(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
    } finally {
      setSpeaking(false)
      setActiveText(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-4 py-10 gap-8">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-2">
          <a
            href="/"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            ← Zurück
          </a>
        </div>
        <h1 className="text-2xl font-bold mb-1">Audio-Test</h1>
        <p className="text-slate-400 text-sm">
          Testet die ElevenLabs TTS-Integration. Drücke einen Button um den Text vorzulesen.
        </p>
      </div>

      {/* Status orb */}
      <div className="relative flex items-center justify-center">
        {speaking && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-violet-600 opacity-10 animate-ping" />
            <div className="absolute w-28 h-28 rounded-full bg-violet-600 opacity-20 animate-pulse" />
          </>
        )}
        <div
          className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
            speaking
              ? 'bg-gradient-to-br from-violet-500 to-purple-700'
              : 'bg-gradient-to-br from-blue-600 to-indigo-700'
          }`}
        >
          {speaking ? (
            <div className="flex gap-1 items-end h-7">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-1.5 bg-white rounded-full wave-bar"
                  style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : (
            <svg className="w-9 h-9 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M6.343 6.343a9 9 0 000 12.728M17.657 6.343a9 9 0 010 12.728" />
            </svg>
          )}
        </div>
      </div>

      <p className="text-slate-400 text-xs uppercase tracking-widest">
        {speaking ? `Spricht: „${activeText}"` : 'Bereit'}
      </p>

      {/* Sample buttons */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Beispieltexte</p>
        {SAMPLES.map((text, i) => (
          <button
            key={i}
            onClick={() => handleSpeak(text)}
            disabled={speaking}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 text-sm leading-relaxed ${
              activeText === text
                ? 'border-violet-500 bg-violet-500/10 text-white'
                : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <span className="text-slate-500 mr-2 text-xs font-mono">{i + 1}</span>
            {text}
          </button>
        ))}
      </div>

      {/* Custom text */}
      <div className="w-full max-w-md flex flex-col gap-2">
        <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Eigener Text</p>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Text eingeben..."
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
        />
        <button
          onClick={() => customText.trim() && handleSpeak(customText.trim())}
          disabled={speaking || !customText.trim()}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Vorlesen
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-md px-4 py-3 rounded-xl bg-red-900/30 border border-red-700 text-red-300 text-sm">
          <strong className="block mb-1">Fehler</strong>
          {error}
        </div>
      )}
    </div>
  )
}
