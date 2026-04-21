import { useEffect, useRef, useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { scoreInterviewResponse } from '../utils/interviewScoring'

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function MicrophoneIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a3 3 0 0 1 3 3v5a3 3 0 1 1-6 0V7a3 3 0 0 1 3-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 0 1-14 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8" />
    </svg>
  )
}

function RecordingIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0 1 16 0" />
    </svg>
  )
}

function SpeakerIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6.5 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.5L11 19V5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 9.5a4.5 4.5 0 0 1 0 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 7a8 8 0 0 1 0 10" />
    </svg>
  )
}

function buildNarrationScript(job, template) {
  const sections = [
    `${job.job_title}. ${template.challengeMode}.`,
    `Scenario. ${template.scenarioPrompt}`,
    template.instructions.length > 0
      ? `Instructions. ${template.instructions
          .map((instruction, index) => `Step ${index + 1}. ${instruction}`)
          .join(' ')}`
      : '',
    job.missing?.length > 0 ? `Focus gaps. ${job.missing.join(', ')}.` : '',
    template.followUpQuestions.length > 0
      ? `Possible follow-up questions. ${template.followUpQuestions.join(' ')}`
      : '',
  ]

  return sections.filter(Boolean).join(' ')
}

export default function MockInterview({ job, template, onBack, onComplete, submitting }) {
  const [responseText, setResponseText] = useState('')
  const [started, setStarted] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(template.timeLimitSeconds)
  const [audioStatus, setAudioStatus] = useState('idle')
  const [audioError, setAudioError] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null)
  const [finalizing, setFinalizing] = useState(false)
  const [narrationStatus, setNarrationStatus] = useState('idle')
  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const audioChunksRef = useRef([])
  const stopRecordingResolverRef = useRef(null)
  const narrationUtteranceRef = useRef(null)
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition()

  const speechPreferred = template.inputMode === 'speech-preferred'
  const secureContextAvailable =
    typeof window === 'undefined' || window.isSecureContext !== false
  const browserHasAudioCapture =
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  const browserHasRecorder = typeof MediaRecorder !== 'undefined'
  const speechAvailable =
    browserSupportsSpeechRecognition && isMicrophoneAvailable !== false
  const audioRecordingAvailable =
    secureContextAvailable &&
    browserHasAudioCapture &&
    browserHasRecorder
  const narrationAvailable =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined'
  const timeExpired = started && remainingSeconds <= 0
  const busy = submitting || finalizing
  const minimumResponseLength = 30
  const answerText = responseText.trim()
  const transcriptText = transcript.trim()
  const submissionLength = Math.max(answerText.length, transcriptText.length)
  const canSubmit = submissionLength >= minimumResponseLength && !busy
  const narrationBlockedByCapture = listening || audioStatus === 'recording'
  const narrationBusy = !narrationAvailable || narrationBlockedByCapture || busy

  const speechUnavailableMessage = !browserSupportsSpeechRecognition
      ? 'Live speech-to-text is not supported in this browser. Use a current Chrome or Edge build.'
      : isMicrophoneAvailable === false
        ? 'Microphone access is blocked. Allow microphone access in the browser and reload the page.'
        : null

  const recordingUnavailableMessage = !secureContextAvailable
      ? 'Audio recording requires HTTPS or localhost so the browser can access your microphone.'
      : !browserHasAudioCapture
        ? 'This browser does not expose microphone recording APIs.'
        : !browserHasRecorder
          ? 'This browser cannot save audio recordings with MediaRecorder.'
          : null
  const narrationUnavailableMessage = !narrationAvailable
    ? 'Read-aloud is not supported in this browser.'
    : listening
      ? 'Turn off voice dictation before playing the scenario aloud.'
      : audioStatus === 'recording'
        ? 'Stop audio recording before playing the scenario aloud.'
        : null
  const voiceGuidance = speechPreferred
    ? 'Voice is recommended for this interview. Use the microphone button to fill your response box as you speak.'
    : 'Voice dictation is optional here. Use the microphone button if you want your speech turned into text.'
  const recordingGuidance = speechPreferred
    ? 'Recording is also available if you want to save the full spoken answer with this interview attempt.'
    : 'You can also record the full answer as audio and save it with the interview attempt.'

  function stopPromptNarration() {
    if (!narrationAvailable) {
      return
    }

    window.speechSynthesis.cancel()
    narrationUtteranceRef.current = null
    setNarrationStatus('idle')
  }

  function cleanupMediaStream() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
    mediaStreamRef.current = null
  }

  function resetAudioState() {
    setAudioError(null)
    setAudioStatus('idle')
    setAudioBlob(null)
    setAudioPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return null
    })
  }

  function discardActiveRecording() {
    const recorder = mediaRecorderRef.current

    if (recorder && recorder.state !== 'inactive') {
      recorder.ondataavailable = null
      recorder.onstop = null
      recorder.stop()
    }

    mediaRecorderRef.current = null
    audioChunksRef.current = []
    cleanupMediaStream()

    if (stopRecordingResolverRef.current) {
      stopRecordingResolverRef.current(null)
      stopRecordingResolverRef.current = null
    }
  }

  async function startAudioRecording() {
    if (!audioRecordingAvailable) {
      setAudioError('Audio recording is not available in this browser.')
      return
    }

    try {
      discardActiveRecording()
      resetAudioState()

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      mediaStreamRef.current = stream
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const nextAudioBlob =
          audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
            : null

        setAudioBlob(nextAudioBlob)
        setAudioPreviewUrl((currentPreviewUrl) => {
          if (currentPreviewUrl) {
            URL.revokeObjectURL(currentPreviewUrl)
          }

          return nextAudioBlob ? URL.createObjectURL(nextAudioBlob) : null
        })
        setAudioStatus(nextAudioBlob ? 'recorded' : 'idle')

        audioChunksRef.current = []
        mediaRecorderRef.current = null
        cleanupMediaStream()

        if (stopRecordingResolverRef.current) {
          stopRecordingResolverRef.current(nextAudioBlob)
          stopRecordingResolverRef.current = null
        }
      }

      recorder.onerror = () => {
        setAudioError('The browser could not continue recording audio.')
        setAudioStatus('error')
        mediaRecorderRef.current = null
        audioChunksRef.current = []
        cleanupMediaStream()

        if (stopRecordingResolverRef.current) {
          stopRecordingResolverRef.current(null)
          stopRecordingResolverRef.current = null
        }
      }

      recorder.start()
      setAudioStatus('recording')
    } catch (error) {
      console.error('Audio recording failed to start:', error)
      setAudioError('Microphone access was denied or unavailable.')
      setAudioStatus('error')
      cleanupMediaStream()
    }
  }

  function stopAudioRecording() {
    const recorder = mediaRecorderRef.current

    if (!recorder || recorder.state === 'inactive') {
      return Promise.resolve(audioBlob)
    }

    return new Promise((resolve) => {
      stopRecordingResolverRef.current = resolve
      recorder.stop()
    })
  }

  useEffect(() => {
    setResponseText('')
    setStarted(false)
    setRemainingSeconds(template.timeLimitSeconds)
    SpeechRecognition.stopListening()
    stopPromptNarration()
    resetTranscript()
    discardActiveRecording()
    resetAudioState()
  }, [template.jobTitle, template.timeLimitSeconds, resetTranscript])

  useEffect(() => {
    return () => {
      SpeechRecognition.stopListening()
      stopPromptNarration()
      discardActiveRecording()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl)
      }
    }
  }, [audioPreviewUrl])

  useEffect(() => {
    if (transcript.trim()) {
      setResponseText(transcript.trim())
    }
  }, [transcript])

  useEffect(() => {
    if (!started || timeExpired || submitting) {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setRemainingSeconds((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [started, timeExpired, remainingSeconds, submitting])

  useEffect(() => {
    if (!timeExpired) {
      return
    }

    SpeechRecognition.stopListening()

    if (audioStatus === 'recording') {
      void stopAudioRecording()
    }
  }, [audioStatus, timeExpired])

  function handleBack() {
    SpeechRecognition.stopListening()
    discardActiveRecording()
    onBack()
  }

  function handleStart() {
    setStarted(true)
    setRemainingSeconds(template.timeLimitSeconds)
  }

  function handleToggleNarration() {
    if (narrationStatus === 'speaking') {
      stopPromptNarration()
      return
    }

    if (narrationBusy) {
      return
    }

    const utterance = new SpeechSynthesisUtterance(buildNarrationScript(job, template))
    utterance.rate = 0.96
    utterance.pitch = 1
    utterance.onend = () => {
      narrationUtteranceRef.current = null
      setNarrationStatus('idle')
    }
    utterance.onerror = () => {
      narrationUtteranceRef.current = null
      setNarrationStatus('error')
    }

    narrationUtteranceRef.current = utterance
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setNarrationStatus('speaking')
  }

  function handleToggleListening() {
    if (!speechAvailable || busy) {
      return
    }

    if (listening) {
      SpeechRecognition.stopListening()
      return
    }

    void SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US',
    })
  }

  async function handleToggleRecording() {
    if (!audioRecordingAvailable || busy) {
      return
    }

    if (audioStatus === 'recording') {
      await stopAudioRecording()
      return
    }

    await startAudioRecording()
  }

  function handleResetResponse() {
    setResponseText('')
    resetTranscript()
    discardActiveRecording()
    resetAudioState()
  }

  async function handleSubmit() {
    setFinalizing(true)
    SpeechRecognition.stopListening()

    let recordedAudioBlob = audioBlob

    if (audioStatus === 'recording') {
      recordedAudioBlob = await stopAudioRecording()
    }

    const scoringTranscript = transcriptText && transcriptText !== answerText ? transcriptText : ''
    const scoredResult = scoreInterviewResponse(template, answerText, scoringTranscript)

    onComplete({
      ...scoredResult,
      answerText,
      transcriptText,
      promptUsed: template.scenarioPrompt,
      challengeType: template.challengeMode,
      audioBlob: recordedAudioBlob,
    })
  }

  return (
    <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.3fr,0.9fr] gap-6">
      <section className="glass-panel p-8 rounded-xl shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-pAccent mb-2">
              {job.job_title}
            </p>
            <h2 className="text-2xl font-bold text-white">{template.challengeMode}</h2>
            <p className="text-sm text-gray-300 mt-2 max-w-2xl">{template.scenarioPrompt}</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-pMain/15 border border-pMain/30 text-pLight">
                {formatDuration(remainingSeconds)} remaining
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-pAccent/10 border border-pAccent/30 text-pAccent">
                Pass at {template.passingScore}%
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleNarration}
              disabled={narrationBusy && narrationStatus !== 'speaking'}
              title={narrationUnavailableMessage || undefined}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                narrationStatus === 'speaking'
                  ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                  : 'bg-sky-400/10 border border-sky-300/30 text-sky-200'
              } ${(narrationBusy && narrationStatus !== 'speaking') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="inline-flex items-center gap-2">
                <SpeakerIcon />
                <span>{narrationStatus === 'speaking' ? 'Stop Read Aloud' : 'Read Scenario Aloud'}</span>
              </span>
            </button>
            {narrationUnavailableMessage && (
              <p className="text-xs text-amber-200 max-w-xs">{narrationUnavailableMessage}</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-5 mb-6">
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">
            Instructions
          </h3>
          <ul className="space-y-2 text-sm text-gray-200">
            {template.instructions.map((instruction) => (
              <li key={instruction} className="flex gap-2">
                <span className="text-pAccent">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {job.missing?.length > 0 && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-5 mb-6">
            <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-red-300 mb-3">
              Focus Gaps
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.missing.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs font-bold bg-black/25 border border-red-400/20 text-red-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {!started ? (
          <div className="rounded-xl border border-pMain/25 bg-pMain/8 p-6 text-center">
            <p className="text-sm text-gray-300 mb-4">
              Start the challenge when you are ready. The timer begins immediately, and you can answer with text or speech when available.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleStart}
                className="px-5 py-2.5 bg-pBrand text-white rounded-lg font-bold text-sm hover:bg-pMain transition-colors"
              >
                Start Challenge
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-transparent border border-gray-500/40 text-gray-300 rounded-lg font-bold text-sm hover:border-gray-300 hover:text-white transition-colors"
              >
                Back to Results
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5 mb-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full border border-pAccent/30 bg-pAccent/10 text-pAccent flex items-center justify-center shadow-[0_0_16px_rgba(237,155,255,0.18)]">
                    <MicrophoneIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-300">
                        Voice Tools
                      </h3>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        speechPreferred
                          ? 'bg-pAccent/10 border-pAccent/30 text-pAccent'
                          : 'bg-white/5 border-white/10 text-gray-300'
                      }`}>
                        {speechPreferred ? 'Recommended' : 'Optional'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 max-w-2xl">{voiceGuidance}</p>
                    <p className="text-xs text-gray-400 mt-2 max-w-2xl">{recordingGuidance}</p>
                  </div>
                </div>
              </div>

                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-gray-300">
                      {speechAvailable
                        ? 'Tap the microphone to start dictation. Your spoken words will appear in the response box below.'
                        : 'Voice input is unavailable right now, so use the textarea fallback below.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleToggleListening}
                      disabled={!speechAvailable || busy}
                      title={speechUnavailableMessage || undefined}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        listening
                          ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                          : 'bg-pAccent/15 border border-pAccent/30 text-pAccent'
                      } ${!speechAvailable || busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <MicrophoneIcon />
                        <span>{listening ? 'Turn Off Voice' : 'Turn On Voice'}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleRecording}
                      disabled={!audioRecordingAvailable || busy}
                      title={recordingUnavailableMessage || undefined}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                        audioStatus === 'recording'
                          ? 'bg-red-500/20 border border-red-400/30 text-red-200'
                          : 'bg-pMain/15 border border-pMain/30 text-pLight'
                      } ${!audioRecordingAvailable || busy ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <RecordingIcon />
                        <span>
                          {audioStatus === 'recording'
                            ? 'Stop Recording'
                            : audioBlob
                              ? 'Record Again'
                              : 'Start Recording'}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetResponse}
                      disabled={busy}
                      className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-500/40 text-gray-300 hover:text-white hover:border-gray-300 transition-colors"
                    >
                      Clear Response
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {listening
                    ? 'Listening now. Speak naturally and the transcript will update below.'
                    : audioStatus === 'recording'
                      ? 'Audio recording is running.'
                      : 'Microphone is idle.'}
                </div>
                {speechUnavailableMessage && (
                  <p className="text-xs text-amber-200 mt-3">{speechUnavailableMessage}</p>
                )}
                {recordingUnavailableMessage && (
                  <p className="text-xs text-amber-200 mt-2">{recordingUnavailableMessage}</p>
                )}
                {audioError && <p className="text-xs text-red-300 mt-3">{audioError}</p>}
                {audioPreviewUrl && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">
                      Recorded Audio Preview
                    </p>
                    <audio controls src={audioPreviewUrl} className="w-full" />
                  </div>
                )}
            </div>

            <label className="block">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 block">
                  Your Response
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-gray-400">
                  <MicrophoneIcon className="w-4 h-4 text-pAccent" />
                  Use Turn On Voice above to dictate into this box.
                </span>
              </div>
              <textarea
                value={responseText}
                onChange={(event) => setResponseText(event.target.value)}
                className="w-full min-h-[260px] p-4 bg-black/20 border border-gray-500/30 rounded-xl text-sm text-white placeholder-gray-500 resize-y focus:outline-none focus:ring-2 focus:ring-pLight whitespace-pre-wrap leading-relaxed"
                placeholder="Type your answer here, or use the microphone controls above to fill this box with speech."
                disabled={submitting}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
              <p className="text-sm text-gray-400">
                {timeExpired
                  ? 'Time is up. Review your answer and submit it for feedback.'
                  : canSubmit
                    ? 'Keep your response structured: diagnose, act, and close clearly.'
                    : `Add at least ${minimumResponseLength} characters before submitting.`}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded-lg text-sm font-bold border border-gray-500/40 text-gray-300 hover:text-white hover:border-gray-300 transition-colors"
                  disabled={busy}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="px-5 py-2.5 bg-pBrand text-white rounded-lg font-bold text-sm hover:bg-pMain transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {busy ? 'Scoring Response...' : 'Submit for Feedback'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <aside className="glass-panel p-6 rounded-xl shadow-xl space-y-6 h-fit">
        <div>
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">
            Rubric
          </h3>
          <div className="space-y-3">
            {template.rubric.map((criterion) => (
              <div key={criterion.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-bold text-white">{criterion.label}</p>
                <p className="text-xs text-gray-400 mt-1">{criterion.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">
            Follow-Up Questions
          </h3>
          <ul className="space-y-3 text-sm text-gray-200">
            {template.followUpQuestions.map((question) => (
              <li key={question} className="rounded-xl border border-white/10 bg-black/20 p-4">
                {question}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}