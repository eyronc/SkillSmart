import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Stepper from '../components/Stepper'
import ResumeInput from '../components/ResumeInput'
import LoadingState from '../components/LoadingState'
import Results from '../components/Results'
import MockInterview from '../components/MockInterview'
import InterviewFeedback from '../components/InterviewFeedback'
import { getInterviewTemplate } from '../data/interviewTemplates'
import { evaluateInterviewResponse, extractSkillsFromResume } from '../services/aiService'
import { matchJobsByKeywords } from '../utils/matcher'
import { saveAnalysisSession, saveInterviewAttempt } from '../services/supabaseService'
import FloatingCoach from '../components/FloatingCoach'

const uploadSteps = ['Input Resume', 'Analyzing...', 'Results', 'Interview', 'Feedback']
const UPLOAD_SESSION_STORAGE_KEY = 'skillsmart.upload.session.v1'

function createDefaultUploadState() {
  return {
    step: 1,
    resumeText: '',
    extractedSkills: [],
    results: [],
    saveState: 'idle',
    saveMessage: '',
    analysisSession: { resumeId: null, jobIdByTitle: {} },
    selectedInterviewJob: null,
    selectedInterviewTemplate: null,
    interviewResult: null,
    interviewSaveState: 'idle',
    interviewSaveMessage: '',
  }
}

function readStoredUploadSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(UPLOAD_SESSION_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue)
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : null
  } catch (error) {
    console.warn('Unable to restore the previous upload session.', error)
    return null
  }
}

function serializeInterviewResult(result) {
  if (!result || typeof result !== 'object') {
    return null
  }

  const { audioBlob, localAudioPreviewUrl, ...persistedResult } = result
  const persistedAudioUrl =
    typeof persistedResult.audioPlaybackUrl === 'string' &&
    !persistedResult.audioPlaybackUrl.startsWith('blob:')
      ? persistedResult.audioPlaybackUrl
      : null

  return {
    ...persistedResult,
    audioPlaybackUrl: persistedAudioUrl,
  }
}

function resolveStepFromStage(stage, snapshot) {
  const hasResults = Array.isArray(snapshot.results) && snapshot.results.length > 0
  const hasInterviewContext =
    !!snapshot.selectedInterviewJob && !!snapshot.selectedInterviewTemplate
  const hasFeedback = hasInterviewContext && !!snapshot.interviewResult

  switch (stage) {
    case 'results':
      return hasResults ? 3 : 1
    case 'interview':
      return hasInterviewContext ? 4 : hasResults ? 3 : 1
    case 'feedback':
      return hasFeedback ? 5 : hasInterviewContext ? 4 : hasResults ? 3 : 1
    case 'analysis':
      return 1
    default:
      if (snapshot.step === 5 && hasFeedback) {
        return 5
      }

      if (snapshot.step === 4 && hasInterviewContext) {
        return 4
      }

      if (snapshot.step === 3 && hasResults) {
        return 3
      }

      return 1
  }
}

function getInitialUploadState() {
  const defaultState = createDefaultUploadState()
  const storedSession = readStoredUploadSession()

  if (!storedSession) {
    return defaultState
  }

  const requestedStage =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('stage')

  return {
    ...defaultState,
    ...storedSession,
    step: resolveStepFromStage(requestedStage, storedSession),
    analysisSession:
      storedSession.analysisSession && typeof storedSession.analysisSession === 'object'
        ? storedSession.analysisSession
        : defaultState.analysisSession,
    interviewResult: serializeInterviewResult(storedSession.interviewResult),
  }
}

function clearStoredUploadSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(UPLOAD_SESSION_STORAGE_KEY)
}

export default function Upload() {
  const [, setSearchParams] = useSearchParams()
  const [initialFlowState] = useState(() => getInitialUploadState())
  const [step, setStep] = useState(initialFlowState.step)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [resumeText, setResumeText] = useState(initialFlowState.resumeText || '')
  const [extractedSkills, setExtractedSkills] = useState(initialFlowState.extractedSkills)
  const [results, setResults] = useState(initialFlowState.results)
  const [error, setError] = useState(null)
  const [saveState, setSaveState] = useState(initialFlowState.saveState)
  const [saveMessage, setSaveMessage] = useState(initialFlowState.saveMessage)
  const [analysisSession, setAnalysisSession] = useState(initialFlowState.analysisSession)
  const [selectedInterviewJob, setSelectedInterviewJob] = useState(initialFlowState.selectedInterviewJob)
  const [selectedInterviewTemplate, setSelectedInterviewTemplate] = useState(initialFlowState.selectedInterviewTemplate)
  const [interviewResult, setInterviewResult] = useState(initialFlowState.interviewResult)
  const [interviewSaving, setInterviewSaving] = useState(false)
  const [interviewSaveState, setInterviewSaveState] = useState(initialFlowState.interviewSaveState)
  const [interviewSaveMessage, setInterviewSaveMessage] = useState(initialFlowState.interviewSaveMessage)

  function syncRouteStage(nextStep, { replace = false, jobTitle = null } = {}) {
    const nextParams =
      typeof window === 'undefined'
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search)
    const resolvedJobTitle =
      jobTitle || selectedInterviewJob?.job_title || selectedInterviewTemplate?.jobTitle || null

    if (nextStep === 1) {
      nextParams.delete('stage')
      nextParams.delete('job')
    } else if (nextStep === 2) {
      nextParams.set('stage', 'analysis')
      nextParams.delete('job')
    } else if (nextStep === 3) {
      nextParams.set('stage', 'results')
      nextParams.delete('job')
    } else if (nextStep === 4) {
      nextParams.set('stage', 'interview')

      if (resolvedJobTitle) {
        nextParams.set('job', resolvedJobTitle)
      } else {
        nextParams.delete('job')
      }
    } else if (nextStep === 5) {
      nextParams.set('stage', 'feedback')

      if (resolvedJobTitle) {
        nextParams.set('job', resolvedJobTitle)
      } else {
        nextParams.delete('job')
      }
    }

    setSearchParams(nextParams, { replace })
  }

  function goToStep(nextStep, options) {
    setStep(nextStep)
    syncRouteStage(nextStep, options)
  }

  function revokeLocalAudioPreview(result) {
    if (result?.localAudioPreviewUrl) {
      URL.revokeObjectURL(result.localAudioPreviewUrl)
    }
  }

  useEffect(() => {
    syncRouteStage(initialFlowState.step, {
      replace: true,
      jobTitle:
        initialFlowState.selectedInterviewJob?.job_title ||
        initialFlowState.selectedInterviewTemplate?.jobTitle ||
        null,
    })
  }, [])

  useEffect(() => {
    return () => {
      revokeLocalAudioPreview(interviewResult)
    }
  }, [interviewResult])

  useEffect(() => {
    const handlePopState = () => {
      const currentStage = new URLSearchParams(window.location.search).get('stage')
      const nextStep = resolveStepFromStage(currentStage, {
        results,
        selectedInterviewJob,
        selectedInterviewTemplate,
        interviewResult,
        step,
      })

      setStep(nextStep)
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [results, selectedInterviewJob, selectedInterviewTemplate, interviewResult, step])

  useEffect(() => {
    const persistedStep = step === 2 ? (results.length > 0 ? 3 : 1) : step
    const snapshot = {
      step: persistedStep,
      resumeText,
      extractedSkills,
      results,
      saveState,
      saveMessage,
      analysisSession,
      selectedInterviewJob,
      selectedInterviewTemplate,
      interviewResult: serializeInterviewResult(interviewResult),
      interviewSaveState,
      interviewSaveMessage,
    }

    const hasSavedProgress =
      snapshot.step > 1 ||
      snapshot.resumeText.trim().length > 0 ||
      snapshot.extractedSkills.length > 0 ||
      snapshot.results.length > 0 ||
      !!snapshot.selectedInterviewJob ||
      !!snapshot.interviewResult

    if (!hasSavedProgress) {
      clearStoredUploadSession()
      return
    }

    window.sessionStorage.setItem(UPLOAD_SESSION_STORAGE_KEY, JSON.stringify(snapshot))
  }, [
    step,
    resumeText,
    extractedSkills,
    results,
    saveState,
    saveMessage,
    analysisSession,
    selectedInterviewJob,
    selectedInterviewTemplate,
    interviewResult,
    interviewSaveState,
    interviewSaveMessage,
  ])

  async function handleResumeSubmit(resumeText) {
    setError(null)
    setSaveState('idle')
    setSaveMessage('')
    setResumeText(resumeText)
    goToStep(2, { replace: true })

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

      setAnalysisSession({
        resumeId: saveResult.resumeId || null,
        jobIdByTitle: saveResult.jobIdByTitle || {},
      })
      setSaveState(saveResult.success ? 'saved' : 'error')
      setSaveMessage(saveResult.message)
      goToStep(3, { replace: true })
    } catch (err) {
      console.error(err)
      setError('Something went wrong while analyzing the resume. Please try again.')
      goToStep(1, { replace: true })
    }
  }

  function handleReset() {
    revokeLocalAudioPreview(interviewResult)
    clearStoredUploadSession()
    goToStep(1, { replace: true })
    setResumeText('')
    setExtractedSkills([])
    setResults([])
    setError(null)
    setSaveState('idle')
    setSaveMessage('')
    setAnalysisSession({ resumeId: null, jobIdByTitle: {} })
    setSelectedInterviewJob(null)
    setSelectedInterviewTemplate(null)
    setInterviewResult(null)
    setInterviewSaving(false)
    setInterviewSaveState('idle')
    setInterviewSaveMessage('')
  }

  function handleStartInterview(job) {
    const interviewTemplate = getInterviewTemplate(job.job_title)

    if (!interviewTemplate) {
      setError('No mock interview template is configured for this job yet.')
      return
    }

    setError(null)
    setSelectedInterviewJob(job)
    setSelectedInterviewTemplate(interviewTemplate)
    setInterviewResult(null)
    setInterviewSaveState('idle')
    setInterviewSaveMessage('')
    goToStep(4, { jobTitle: job.job_title })
  }

  async function handleInterviewComplete(attempt) {
    if (!selectedInterviewJob || !selectedInterviewTemplate) {
      return
    }

    setInterviewSaving(true)

    let scoredAttempt = attempt

    try {
      const aiEvaluation = await evaluateInterviewResponse(
        selectedInterviewTemplate,
        attempt.answerText,
        attempt.transcriptText
      )

      scoredAttempt = {
        ...attempt,
        ...aiEvaluation,
      }
    } catch (evaluationError) {
      console.warn('AI interview scoring failed. Falling back to rules-based scoring.', evaluationError)
      scoredAttempt = {
        ...attempt,
        evaluationMethod: attempt.evaluationMethod || 'rules',
        evaluationMethodLabel: attempt.evaluationMethodLabel || 'Rules-Based Fallback',
      }
    }

    const localAudioPreviewUrl = scoredAttempt.audioBlob
      ? URL.createObjectURL(scoredAttempt.audioBlob)
      : null

    const saveResult = await saveInterviewAttempt({
      resumeId: analysisSession.resumeId,
      jobId: analysisSession.jobIdByTitle[selectedInterviewJob.job_title] || null,
      jobTitle: selectedInterviewJob.job_title,
      challengeType: selectedInterviewTemplate.challengeMode,
      promptUsed: scoredAttempt.promptUsed,
      answerText: scoredAttempt.answerText,
      transcriptText: scoredAttempt.transcriptText,
      audioBlob: scoredAttempt.audioBlob,
      score: scoredAttempt.score,
      rubricScores: scoredAttempt.rubricScores,
      feedback: {
        ...scoredAttempt.feedback,
        evaluationMethod: scoredAttempt.evaluationMethod,
        evaluationMethodLabel: scoredAttempt.evaluationMethodLabel,
      },
    })

    const evaluationMessage =
      scoredAttempt.evaluationMethod === 'ai-transcript'
        ? 'Scored with the AI transcript evaluator.'
        : 'AI scoring was unavailable, so the rules-based fallback was used.'

    revokeLocalAudioPreview(interviewResult)
    setInterviewResult({
      ...scoredAttempt,
      audioPlaybackUrl: saveResult.audioUrl || localAudioPreviewUrl,
      localAudioPreviewUrl,
    })
    setInterviewSaveState(saveResult.success ? 'saved' : 'error')
    setInterviewSaveMessage(`${saveResult.message} ${evaluationMessage}`.trim())
    setInterviewSaving(false)
    goToStep(5, { jobTitle: selectedInterviewJob.job_title })
  }

  function handleRetryInterview() {
    revokeLocalAudioPreview(interviewResult)
    setInterviewResult(null)
    setInterviewSaveState('idle')
    setInterviewSaveMessage('')
    goToStep(4, {
      replace: true,
      jobTitle: selectedInterviewJob?.job_title || null,
    })
  }

  function handleBackToResults() {
    revokeLocalAudioPreview(interviewResult)
    goToStep(3, { replace: true })
    setInterviewResult(null)
    setInterviewSaving(false)
    setInterviewSaveState('idle')
    setInterviewSaveMessage('')
  }

  const stageHeadline =
    step === 1
      ? 'Turn one resume into a sharper job strategy.'
      : step === 2
        ? 'Analyzing your resume against role requirements.'
        : step === 3
          ? 'Review your fit, ask the coach, and export a roadmap.'
          : step === 4
            ? 'Practice the role with the same resume context.'
            : 'Translate your interview feedback into a clearer next step.'

  const stageCopy =
    step === 1
      ? 'Upload once, get skill extraction, role matching, a resume coach, and a printable roadmap.'
      : step === 2
        ? 'SkillSmart is extracting signals from your resume and comparing them with the supported job profiles.'
        : step === 3
          ? 'Use the roadmap to prioritize gaps, then ask the coach how to tighten your resume and target the right role.'
          : step === 4
            ? 'The mock interview stays anchored to your selected role so practice feels consistent with the analysis.'
            : 'Use the interview notes and roadmap together so the next revision is more targeted than the last one.'

  const topResult = results[0] || null

  return (
    <div className="min-h-screen overflow-x-hidden relative bg-[#f5effe]">
      {/* Soft ambient violet blobs — no image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 5% 0%, rgba(134,1,206,0.10) 0%, transparent 55%), radial-gradient(ellipse 55% 40% at 95% 100%, rgba(153,97,255,0.12) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Navbar />
        {(step === 3 || step === 5) && (
          <FloatingCoach
            resumeText={resumeText}
            extractedSkills={extractedSkills}
            results={results}
          />
        )}

        <main className={`${step >= 4 ? 'max-w-6xl' : 'max-w-7xl'} w-full mx-auto px-4 sm:px-6 py-6 md:py-10 flex-1`}>
          <section className="mb-6 md:mb-8">
            <p className="text-[11px] font-black uppercase tracking-[0.32em] text-pBrand mb-3">SkillSmart Studio</p>
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="font-['Plus_Jakarta_Sans'] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[0.98] text-[#1E1B4B]">
                  {stageHeadline}
                </h1>
                <p className="mt-4 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl leading-8">
                  {stageCopy}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 min-w-0 xl:min-w-[360px]">
                <div className="rounded-3xl border border-violet-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500">Resume Skills</p>
                  <p className="mt-2 text-2xl font-black text-[#1E1B4B]">{extractedSkills.length || 0}</p>
                </div>
                <div className="rounded-3xl border border-violet-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500">Top<br />Match</p>
                  <p className="mt-2 text-2xl font-black text-[#1E1B4B]">{topResult ? `${topResult.score}%` : '--'}</p>
                </div>
                <div className="rounded-3xl border border-violet-200 bg-white px-4 py-4 shadow-sm col-span-2 sm:col-span-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500">Current Stage</p>
                  <p className="mt-2 text-lg font-black text-[#1E1B4B]">{uploadSteps[step - 1]}</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-white border border-violet-200 rounded-[28px] px-4 sm:px-6 py-4 mb-6 md:mb-8 shadow-sm">
            <Stepper currentStep={step} steps={uploadSteps} />
          </div>

          {error && (
            <div className="mb-6 max-w-3xl bg-red-50 border border-red-300 text-red-700 rounded-2xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {step === 1 && <ResumeInput onSubmit={handleResumeSubmit} initialText={resumeText} />}
          {step === 2 && <LoadingState message={loadingMsg} />}
          {step === 3 && (
            <Results
              resumeText={resumeText}
              extractedSkills={extractedSkills}
              results={results}
              onReset={handleReset}
              onStartInterview={handleStartInterview}
              saveState={saveState}
              saveMessage={saveMessage}
            />
          )}

          {step === 4 && selectedInterviewJob && selectedInterviewTemplate && (
            <MockInterview
              job={selectedInterviewJob}
              template={selectedInterviewTemplate}
              onBack={handleBackToResults}
              onComplete={handleInterviewComplete}
              submitting={interviewSaving}
            />
          )}

          {step === 5 && selectedInterviewJob && selectedInterviewTemplate && interviewResult && (
            <InterviewFeedback
              resumeText={resumeText}
              extractedSkills={extractedSkills}
              results={results}
              job={selectedInterviewJob}
              template={selectedInterviewTemplate}
              result={interviewResult}
              saveState={interviewSaveState}
              saveMessage={interviewSaveMessage}
              onRetry={handleRetryInterview}
              onBackToResults={handleBackToResults}
            />
          )}
        </main>
      </div>
    </div>
  )
}
