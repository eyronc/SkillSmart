import { Link, useLocation } from 'react-router-dom'
import logo from '../../assets/SkillSmart.svg';

export default function Navbar() {
  const location = useLocation()

  function navLink(to, label) {
    const isActive = location.pathname === to
    return (
      <Link
        to={to}
        className={`text-sm font-bold tracking-wide transition-colors ${
          isActive
            ? 'text-pBrand'
            : 'text-gray-500 hover:text-[#1E1B4B]'
        }`}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="bg-white/80 backdrop-blur-md py-3.5 px-6 border-b border-violet-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0.5 cursor-pointer group">
          <img src={logo} alt="SkillSmart Logo" className="h-7 w-auto relative z-10 group-hover:-rotate-[10deg] transition-transform duration-300" />
          <div className="flex items-center -ml-1 transition-transform duration-300 group-hover:translate-x-1">
            <span className="text-pBrand font-extrabold text-xl tracking-tighter">
              Skill<span className="text-[#1E1B4B]">Smart</span>
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-6">
          {navLink('/', 'Home')}
          {navLink('/upload', 'Analyze')}
          <Link
            to="/upload"
            className="px-5 py-2 rounded-full bg-pBrand text-white text-sm font-bold tracking-wide hover:bg-pMain transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}
