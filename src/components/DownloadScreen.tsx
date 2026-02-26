import type { FormDefinition, CollectedData } from '../types'
import { generateSummaryPDF } from '../lib/pdfGenerator'

interface DownloadScreenProps {
  selectedForms: FormDefinition[]
  collectedData: CollectedData
  onRestart: () => void
}

export function DownloadScreen({ selectedForms, collectedData, onRestart }: DownloadScreenProps) {
  const handleDownload = () => {
    generateSummaryPDF(selectedForms, collectedData)
  }

  const totalFields = selectedForms.reduce((acc, f) => acc + f.fields.length, 0)
  const answeredFields = Object.keys(collectedData).length

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-a w-80 h-80 bg-emerald-500/20 top-[-5%] right-[-10%]" />
      <div className="orb orb-b w-72 h-72 bg-violet-600/20 bottom-[-5%] left-[-10%]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Success ring + icon */}
        <div className="mb-6 celebration-pop">
          <div className="relative inline-flex items-center justify-center mx-auto">
            <div className="absolute w-36 h-36 rounded-full border border-emerald-500/30 spin-slow" />
            <div className="absolute w-28 h-28 rounded-full border border-emerald-400/20 spin-slow-rev" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl glow-green">
              <span className="text-4xl">🎉</span>
            </div>
          </div>
        </div>

        <div className="fade-in-up-1">
          <h2 className="text-4xl font-black mb-2">
            <span className="gradient-text">Geschafft!</span>
          </h2>
          <p className="text-slate-400 mb-8 max-w-xs mx-auto text-sm">
            Das Finanzamt wartet schon.{' '}
            <span className="text-emerald-400 font-medium">Fast freuen wir uns sogar drauf.</span>
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6 fade-in-up-2">
          <div className="glass border border-white/8 rounded-2xl p-4">
            <div className="text-3xl font-black gradient-text">{selectedForms.length}</div>
            <div className="text-slate-400 text-xs mt-1">Formulare</div>
          </div>
          <div className="glass border border-white/8 rounded-2xl p-4">
            <div className="text-3xl font-black text-emerald-400">{answeredFields}</div>
            <div className="text-slate-400 text-xs mt-1">von {totalFields} Feldern</div>
          </div>
        </div>

        {/* Forms list */}
        <div className="w-full mb-6 space-y-2 fade-in-up-3">
          {selectedForms.map((form) => (
            <div key={form.id} className="flex items-center gap-3 glass border border-white/8 rounded-xl px-4 py-3 text-left">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-slate-300 text-sm">{form.name}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 fade-in-up-4">
          <button
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-2xl glow-green transition-all duration-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PDF herunterladen
          </button>

          <button
            onClick={onRestart}
            className="w-full glass border border-white/8 hover:border-violet-500/30 text-slate-400 hover:text-white text-sm py-3 rounded-2xl transition-all duration-200"
          >
            Neue Steuererklärung starten 🔄
          </button>
        </div>
      </div>
    </div>
  )
}
