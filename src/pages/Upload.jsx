import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Stepper from '../components/Stepper'
import ResumeInput from '../components/ResumeInput'
import LoadingState from '../components/LoadingState'
import Results from '../components/Results'
import { extractSkillsFromResume } from '../services/aiService'
import { matchJobsByKeywords } from '../utils/matcher'
import { saveAnalysisSession } from '../services/supabaseService'

export default function Upload() {
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
    <div className="min-h-screen" style={{ backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #59167F 100%)' }}>
      <Navbar />

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <Stepper currentStep={step} />

        {error && (
          <div className="mb-6 max-w-2xl mx-auto bg-red-500/10 border border-red-500/50 text-red-100 rounded-lg px-4 py-3 text-sm">
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
