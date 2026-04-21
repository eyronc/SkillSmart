import CareerRoadmap from './CareerRoadmap'
import { buildCareerRoadmap } from '../utils/roadmap'
import { exportRoadmapToPdf } from '../utils/roadmapExport'

function rubricTone(score) {
  if (score >= 4) {
    return 'border-pAccent/30 bg-pAccent/10 text-pAccent'
  }

  if (score >= 3) {
    return 'border-pLight/30 bg-pLight/10 text-pLight'
  }

  return 'border-amber-400/30 bg-amber-400/10 text-amber-300'
}

export default function InterviewFeedback({
  extractedSkills,
  results,
  job,
  template,
  result,
  saveState,
  saveMessage,
  onRetry,
  onBackToResults,
}) {
  const practicePack = template.practicePack || null
  const roadmap = buildCareerRoadmap({
    extractedSkills,
    results,
    focusJobTitle: job.job_title,
    interviewResult: result,
  })

  function handleExportRoadmap() {
    exportRoadmapToPdf(roadmap)
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8 shadow-[0_28px_90px_rgba(17,24,39,0.28)] relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-56 h-56 rounded-full bg-pAccent/10 blur-3xl" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black tracking-[0.3em] uppercase text-pAccent mb-2">
              {job.job_title}
            </p>
            <h2 className="text-3xl font-black text-white">Interview Feedback</h2>
            <p className="text-sm text-gray-300 mt-3 max-w-2xl leading-7">{template.challengeMode}</p>
          </div>

          <div className="text-right">
            <div className="text-5xl font-black text-white leading-none">{result.score}%</div>
            <div
              className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                result.passed
                  ? 'bg-pAccent/10 text-pAccent border-pAccent/30'
                  : 'bg-amber-400/10 text-amber-300 border-amber-400/30'
              }`}
            >
              {result.passed ? 'Passed' : 'Needs another pass'}
            </div>
            {result.evaluationMethodLabel && (
              <div className="mt-2 inline-flex px-3 py-1 rounded-full text-[11px] font-bold border border-sky-300/30 bg-sky-400/10 text-sky-200">
                {result.evaluationMethodLabel}
              </div>
            )}
          </div>
        </div>
      </section>

      {saveMessage && (
        <div
          className={`rounded-[24px] border px-4 py-3 text-sm ${
            saveState === 'saved'
              ? 'border-pAccent/30 bg-pAccent/10 text-pAccent'
              : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
          }`}
        >
          {saveMessage}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
        <section className="rounded-[30px] border border-white/10 bg-[rgba(15,23,42,0.55)] p-6 backdrop-blur-md">
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">Summary</h3>
          <p className="text-sm text-gray-200 leading-7">{result.feedback.summary}</p>

          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-pAccent mb-3">Strengths</h4>
              {result.feedback.strengths.length === 0 ? (
                <p className="text-sm text-gray-400">No clear strengths were captured yet. Try a fuller response next round.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-200">
                  {result.feedback.strengths.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-pAccent">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-amber-300 mb-3">Improve Next</h4>
              {result.feedback.improvements.length === 0 ? (
                <p className="text-sm text-gray-400">You covered the full rubric well. Tighten delivery and keep practicing for speed.</p>
              ) : (
                <ul className="space-y-2 text-sm text-gray-200">
                  {result.feedback.improvements.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/10 bg-[rgba(15,23,42,0.55)] p-6 backdrop-blur-md">
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">Recommended Follow-Ups</h3>
          <ul className="space-y-3 text-sm text-gray-200">
            {result.feedback.recommendedFollowUps.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {result.audioPlaybackUrl && (
        <section className="rounded-[30px] border border-white/10 bg-[rgba(15,23,42,0.55)] p-6 backdrop-blur-md">
          <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">Recorded Answer</h3>
          <audio controls src={result.audioPlaybackUrl} className="w-full" />
        </section>
      )}

      <section>
        <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-300 mb-4">Rubric Breakdown</h3>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {result.rubricScores.map((criterion) => (
            <div key={criterion.key} className="rounded-[28px] border border-white/10 bg-[rgba(15,23,42,0.55)] p-5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-white">{criterion.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{criterion.description}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${rubricTone(criterion.score)}`}>
                  {criterion.score}/5
                </span>
              </div>
              {criterion.matchedSignals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {criterion.matchedSignals.map((signal) => (
                    <span
                      key={signal}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/5 border border-white/10 text-gray-200"
                    >
                      {signal}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No strong signal matched for this rubric item.</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {practicePack && (
        <section className="rounded-[30px] border border-pAccent/20 bg-pAccent/5 p-6 sm:p-7 backdrop-blur-md">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-pAccent mb-2">{practicePack.title}</h3>
              <p className="text-sm text-gray-200 max-w-3xl leading-7">{practicePack.overview}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-[11px] font-bold border border-pAccent/30 bg-pAccent/10 text-pAccent">
              Practice Pack
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
            <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">Strong Sample Answer</h4>
              <p className="text-sm text-gray-200 leading-7">{practicePack.sampleAnswer}</p>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">Likely Q and A</h4>
                <div className="space-y-4">
                  {practicePack.questionBank.map((entry) => (
                    <div key={entry.question} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="text-sm font-bold text-white mb-2">{entry.question}</p>
                      <ul className="space-y-2 text-sm text-gray-200">
                        {entry.strongPoints.map((point) => (
                          <li key={point} className="flex gap-2">
                            <span className="text-pAccent">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-gray-400 mb-3">Common Mistakes</h4>
                <ul className="space-y-2 text-sm text-gray-200">
                  {practicePack.commonMistakes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-300">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {roadmap && <CareerRoadmap roadmap={roadmap} compact />}

      <div className="flex flex-wrap gap-3 hidden-print">
        {roadmap && (
          <button
            type="button"
            onClick={handleExportRoadmap}
            className="px-5 py-3 bg-white text-[#1E1B4B] rounded-2xl font-black text-sm tracking-[0.14em] uppercase hover:bg-pAccent transition-colors"
          >
            Export Roadmap PDF
          </button>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-3 bg-pBrand text-white rounded-2xl font-black text-sm tracking-[0.14em] uppercase hover:bg-pMain transition-colors"
        >
          Retry Interview
        </button>
        <button
          type="button"
          onClick={onBackToResults}
          className="px-5 py-3 bg-transparent border border-white/20 text-white rounded-2xl font-black text-sm tracking-[0.14em] uppercase hover:bg-white/10 transition-colors"
        >
          Back to Results
        </button>
      </div>
    </div>
  )
}