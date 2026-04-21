export default function LoadingState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-electric border-t-transparent rounded-full animate-spin" />
      <p className="text-navy font-semibold text-lg">
        {message || 'Analyzing your resume...'}
      </p>
      <p className="text-gray-400 text-sm">This may take a few seconds</p>
    </div>
  )
}
