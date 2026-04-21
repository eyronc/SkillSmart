import logo from '../../assets/SkillSmart.svg';

export default function Navbar() {
  return (
    <header className="bg-navy/80 py-4 px-6 border-b border-pDark/50 glass-panel sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center cursor-pointer group">
          <img src={logo} alt="SkillSmart Logo" className="h-8 w-auto relative z-10 group-hover:-rotate-[10deg] transition-transform duration-300" />
          <div className="flex items-center -ml-1.5 transition-transform duration-300 group-hover:translate-x-1">
            <span className="text-pLight font-extrabold text-2xl tracking-tighter">
              Skill<span className="text-white">Smart</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
