import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import backgroundImg from '../assets/SkillSmart.png'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col relative bg-white overflow-hidden">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
         <img 
            src={backgroundImg} 
            alt="SkillSmart Background" 
            className="w-full h-full object-cover object-center"
         />
      </div>

      {/* Subtle Gradient Overlay so text is legible */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, rgba(67,44,122,0.85) 0%, rgba(215,180,243,0.3) 50%, rgba(255,255,255,0.7) 100%)'
        }}
      />

      {/* Content wrapper must have z-10 so it's above the video/gradient */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 flex flex-col items-end justify-center px-10 md:px-24 text-right">
          
          <div className="max-w-2xl w-full text-right flex flex-col items-end">
            <h1 className="font-['Plus_Jakarta_Sans'] font-black text-[12vw] md:text-[8.5rem] tracking-tight leading-none text-[#1E1B4B]">
              Skill<span className="text-[#8601CE]">Smart</span>
            </h1>
            
            {/* Playfair Display matching the subtitle style */}
            <h2 className="font-['Plus_Jakarta_Sans'] italic text-2xl md:text-3xl text-gray-700 tracking-wide mb-8 mt-2">
              Don't just apply. Qualify.
            </h2>
            
            <p className="text-lg md:text-xl text-gray-800 font-medium mb-10 leading-relaxed drop-shadow-sm">
              Analyze your resume, discover hidden skill gaps across top job profiles, and get personalized AI-generated interview practice instantly.
            </p>
            
            <Link 
              to="/upload" 
              className="inline-block px-12 py-4 bg-[#432C7A] text-white rounded-none font-bold text-lg tracking-widest uppercase
                hover:bg-[#1E1B4B] hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              Start Analysis
            </Link>
          </div>
          
        </main>
      </div>
    </div>
  )
}
