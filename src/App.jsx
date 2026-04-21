import { useState } from 'react'
import Stepper from './components/Stepper'
import ResumeInput from './components/ResumeInput'
import LoadingState from './components/LoadingState'
import Results from './components/Results'
import { extractSkillsFromResume } from './services/aiService'
import { matchJobsByKeywords } from './utils/matcher'
import { saveAnalysisSession } from './services/supabaseService'

export default function App() {
  const [step, setStep] = useState(1)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [extractedSkills, setExtractedSkills] = useState([])
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [saveState, setSaveState] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')

  async function handleResumeSubmit(resumeText) {
    setError(null)
    setSaveState('idle')
    setSaveMessage('')
    setStep(2)

    let aiExtractedSkills = []

    try {
      setLoadingMsg('Extracting your skills...')
      aiExtractedSkills = await extractSkillsFromResume(resumeText)
    } catch (extractError) {
      console.warn('AI extraction failed. Falling back to keyword-based matching.', extractError)
    }

    try {
      setLoadingMsg('Matching your resume against job keywords...')
      const { detectedSkills, results: matchedResults } = matchJobsByKeywords({
        resumeText,
        extractedSkills: aiExtractedSkills,
      })

      setExtractedSkills(detectedSkills)
      setResults(matchedResults)

      setLoadingMsg('Saving your analysis...')
      const saveResult = await saveAnalysisSession({
        resumeText,
        extractedSkills: detectedSkills,
        results: matchedResults,
      })

      setSaveState(saveResult.success ? 'saved' : 'error')
      setSaveMessage(saveResult.message)
      setStep(3)
    } catch (err) {
      console.error(err)
      setError('Something went wrong while analyzing the resume. Please try again.')
      setStep(1)
    }
  }

  function handleReset() {
    setStep(1)
    setExtractedSkills([])
    setResults([])
    setError(null)
    setSaveState('idle')
    setSaveMessage('')
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-navy py-4 px-6 shadow">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <span className="text-electric font-bold text-xl">Skill</span>
          <span className="text-white font-bold text-xl">Smart</span>
          <span className="ml-2 text-gray-400 text-xs hidden sm:block">
            — Don't just apply. Qualify.
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Stepper currentStep={step} />

        {error && (
          <div className="mb-6 max-w-2xl mx-auto bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {step === 1 && <ResumeInput onSubmit={handleResumeSubmit} />}
        {step === 2 && <LoadingState message={loadingMsg} />}
        {step === 3 && (
          <Results
            extractedSkills={extractedSkills}
            results={results}
            onReset={handleReset}
            saveState={saveState}
            saveMessage={saveMessage}
          />
        )}
      </main>
    </div>
  )
}
