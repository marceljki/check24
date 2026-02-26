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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Success icon */}
      <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">Fertig!</h2>
      <p className="text-slate-400 mb-8 max-w-xs">
        Ihre Daten wurden erfolgreich gesammelt. Laden Sie jetzt Ihre Zusammenfassung herunter.
      </p>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-400">{selectedForms.length}</div>
          <div className="text-slate-400 text-sm mt-1">Formulare</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-400">{answeredFields}</div>
          <div className="text-slate-400 text-sm mt-1">von {totalFields} Feldern</div>
        </div>
      </div>

      {/* Forms list */}
      <div className="w-full max-w-md mb-8 space-y-2">
        {selectedForms.map((form) => (
          <div key={form.id} className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-3 text-left">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-slate-300 text-sm">{form.name}</span>
          </div>
        ))}
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="w-full max-w-xs bg-green-600 hover:bg-green-500 active:scale-95 text-white font-semibold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-green-900/40 transition-all duration-150 flex items-center justify-center gap-3 mb-4"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        PDF herunterladen
      </button>

      <button
        onClick={onRestart}
        className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
      >
        Neue Steuererklarung starten
      </button>
    </div>
  )
}
