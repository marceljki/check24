interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-a w-96 h-96 bg-violet-600/30 top-[-10%] left-[-15%]" />
      <div className="orb orb-b w-80 h-80 bg-blue-500/25 bottom-[-5%] right-[-10%]" />
      <div className="orb orb-c w-64 h-64 bg-cyan-400/20 top-[40%] right-[-5%]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Mascot / logo */}
        <div className="mb-8 fade-in-up-1">
          <div className="relative inline-flex items-center justify-center mx-auto mb-5">
            {/* Outer spinning ring */}
            <div className="absolute w-36 h-36 rounded-full border border-violet-500/30 spin-slow" />
            <div className="absolute w-28 h-28 rounded-full border border-cyan-400/20 spin-slow-rev" />
            {/* Core icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-2xl glow-purple float">
              <span className="text-4xl">🤖</span>
            </div>
          </div>

          <h1 className="text-5xl font-black mb-3">
            <span className="gradient-text">Steuer</span>
            <span className="text-white">-Assistent</span>
          </h1>
          <p className="text-slate-400 text-base">
            Steuern zahlen wie ein Chef.{' '}
            <span className="text-violet-400 font-medium">Aber einfacher.</span>
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-3 mb-8 fade-in-up-2">
          {[
            {
              icon: '🎙️',
              title: 'Einfach sprechen',
              desc: 'Kein Tippen, kein Stress — nur reden',
              color: 'from-violet-500/10 to-violet-600/5',
              border: 'border-violet-500/20',
            },
            {
              icon: '🧠',
              title: 'KI denkt mit',
              desc: 'Findet Ihre Formulare automatisch',
              color: 'from-blue-500/10 to-blue-600/5',
              border: 'border-blue-500/20',
            },
            {
              icon: '📄',
              title: 'PDF ready',
              desc: 'Fertig zum Einreichen in Sekunden',
              color: 'from-cyan-500/10 to-cyan-600/5',
              border: 'border-cyan-500/20',
            },
          ].map((item, i) => (
            <div
              key={item.title}
              className={`flex items-center gap-4 bg-gradient-to-r ${item.color} border ${item.border} rounded-2xl p-4 text-left glass`}
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <span className="text-2xl flex-shrink-0">{item.icon}</span>
              <div>
                <div className="text-white font-semibold text-sm">{item.title}</div>
                <div className="text-slate-400 text-xs mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Start button */}
        <div className="fade-in-up-3">
          <button
            onClick={onStart}
            className="relative group w-full overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 active:scale-95 text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-2xl glow-purple transition-all duration-200"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Los geht's
              <span className="text-xl">🚀</span>
            </span>
          </button>

          <p className="mt-4 text-slate-600 text-xs max-w-xs mx-auto">
            Mikrofon-Zugriff nötig • Dauert ca. 5 Minuten •{' '}
            <span className="text-violet-500">Fast painless</span> 💅
          </p>
        </div>
      </div>
    </div>
  )
}
