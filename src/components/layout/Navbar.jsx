export default function Navbar() {
  return (
    <header className="bg-navy/80 py-4 px-6 border-b border-pDark/50 glass-panel sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-pAccent drop-shadow-[0_0_8px_rgba(237,155,255,0.6)] mr-3">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-pLight font-extrabold text-2xl tracking-tighter">
              Skill<span className="text-white">Smart</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
