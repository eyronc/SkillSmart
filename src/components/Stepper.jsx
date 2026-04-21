export default function Stepper({ currentStep }) {
  const steps = ['Input Resume', 'Analyzing...', 'Results']
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((label, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isDone = step < currentStep
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold
                  ${isActive ? 'bg-electric text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className={`text-sm font-medium ${isActive ? 'text-electric' : isDone ? 'text-green-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px ${isDone ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
