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

      {/* Desktop Gradient Overlay so text is legible */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none hidden md:block"
        style={{
          background: 'linear-gradient(110deg, rgba(67,44,122,0.85) 0%, rgba(215,180,243,0.3) 50%, rgba(255,255,255,0.7) 100%)'
        }}
      />
      
      {/* Mobile Gradient Overlay (Darker for readability) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none block md:hidden"
        style={{
          background: 'linear-gradient(170deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.95) 70%, #0F172A 100%)'
        }}
      />

      {/* Content wrapper must have z-10 so it's above the video/gradient */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 flex flex-col items-center md:items-end justify-center px-6 md:px-24 text-center md:text-right pt-10 md:pt-0">
          
          <div className="max-w-2xl w-full flex flex-col items-center md:items-end">
            <h1 className="font-['Plus_Jakarta_Sans'] font-black text-[16vw] sm:text-[14vw] md:text-[8.5rem] tracking-tight leading-none text-white md:text-[#1E1B4B] animate-slide-up drop-shadow-md md:drop-shadow-none">
              Skill<span className="text-pLight md:text-[#8601CE]">Smart</span>
            </h1>
            
            {/* Playfair Display matching the subtitle style */}
            <h2 className="font-['Plus_Jakarta_Sans'] italic text-xl md:text-3xl text-gray-200 md:text-gray-700 tracking-wide mb-6 md:mb-8 mt-4 md:mt-2 animate-slide-up delay-100">
              Don't just apply. Qualify.
            </h2>
            
            <p className="text-base md:text-xl text-gray-300 md:text-gray-800 font-medium mb-10 leading-relaxed drop-shadow-md md:drop-shadow-sm animate-slide-up delay-200">
              Analyze your resume, discover hidden skill gaps across top job profiles, and get personalized AI-generated interview practice instantly.
            </p>
            
            <Link 
              to="/upload" 
              className="inline-block px-10 md:px-12 py-3.5 md:py-4 bg-pBrand md:bg-[#432C7A] text-white rounded-xl md:rounded-none font-bold text-base md:text-lg tracking-widest uppercase
                hover:bg-pMain md:hover:bg-[#1E1B4B] shadow-[0_0_20px_rgba(134,39,217,0.6)] md:shadow-none hover:shadow-2xl transition-all transform hover:-translate-y-1 animate-slide-up delay-300"
            >
              Start Analysis
            </Link>
          </div>
          
        </main>
      </div>
    </div>
  )
}
