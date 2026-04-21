const defaultSteps = ['Input Resume', 'Analyzing...', 'Results']

export default function Stepper({ currentStep, steps = defaultSteps }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-2 mb-8">
      {steps.map((label, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isDone = step < currentStep
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isActive ? 'bg-pBrand text-white shadow-[0_0_10px_rgba(134,39,217,0.6)]' : isDone ? 'bg-pAccent text-navy' : 'bg-white/10 text-gray-500'}`}
              >
                {isDone ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : step}
              </div>
              <span
                className={`text-sm font-bold tracking-tight ${isActive ? 'text-pLight' : isDone ? 'text-pAccent' : 'text-gray-500'}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block w-8 h-px ${isDone ? 'bg-pAccent/50' : 'bg-gray-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
