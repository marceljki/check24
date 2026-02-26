interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      {/* Logo / Icon */}
      <div className="mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Steuer-Assistent</h1>
        <p className="text-slate-400 text-lg">Ihre Steuererklärung per Sprache</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-4 mb-10 max-w-md w-full">
        {[
          { icon: '🎙️', text: 'Sprechen Sie einfach mit uns' },
          { icon: '🤖', text: 'KI erkennt Ihre passenden Formulare' },
          { icon: '📄', text: 'Download als PDF' },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-4 bg-slate-800/50 rounded-xl p-4 text-left">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-slate-300">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg shadow-blue-900/40 transition-all duration-150"
      >
        Jetzt starten
      </button>

      <p className="mt-6 text-slate-500 text-sm max-w-xs">
        Bitte erlauben Sie den Mikrofonzugriff, wenn der Browser danach fragt.
      </p>
    </div>
  )
}
