const defaultSteps = ['Input Resume', 'Analyzing...', 'Results']

export default function Stepper({ currentStep, steps = defaultSteps }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-y-3 gap-x-2 sm:gap-x-3">
      {steps.map((label, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isDone = step < currentStep
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 sm:px-4 py-2.5 transition-all ${
                isActive
                  ? 'border-pBrand bg-pBrand text-white shadow-[0_8px_24px_rgba(134,39,217,0.35)]'
                  : isDone
                    ? 'border-violet-300 bg-violet-100 text-[#1E1B4B]'
                    : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex shrink-0 items-center justify-center text-sm font-black transition-all ${
                  isActive
                    ? 'bg-white text-pBrand'
                    : isDone
                      ? 'bg-pBrand text-white'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isDone ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : step}
              </div>
              <span
                className={`text-[13px] sm:text-sm font-bold tracking-tight whitespace-nowrap ${
                  isActive ? 'text-white' : isDone ? 'text-[#1E1B4B]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`hidden sm:block w-8 h-px ${isDone ? 'bg-pBrand/40' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
