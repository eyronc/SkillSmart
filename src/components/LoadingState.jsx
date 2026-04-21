export default function LoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 glass-panel max-w-lg mx-auto rounded-xl">
      <div className="w-12 h-12 border-4 border-pMain border-t-pLight rounded-full animate-spin shadow-[0_0_15px_rgba(153,97,255,0.5)]" />
      <p className="text-white font-semibold text-lg tracking-tight">
        {message || 'Analyzing your resume...'}
      </p>
      <p className="text-gray-400 text-sm">This may take a few seconds</p>
    </div>
  )
}
