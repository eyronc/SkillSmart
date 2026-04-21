import { useState } from 'react'

export default function Results({ extractedSkills, results, onReset, saveState, saveMessage }) {
  const [expanded, setExpanded] = useState(null)

  function toggle(i) {
    setExpanded(expanded === i ? null : i)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Extracted Skills */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-navy mb-2">Your Extracted Skills</h2>
        <div className="flex flex-wrap gap-2">
          {extractedSkills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 bg-blue-100 text-electric rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {saveMessage && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            saveState === 'saved'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Job Matches */}
      <h2 className="text-xl font-bold text-navy mb-3">Job Matches</h2>
      <div className="flex flex-col gap-3">
        {results.map((job, i) => (
          <div key={job.job_title} className="border border-gray-200 rounded-lg bg-white shadow-sm">
            {/* Job header */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 text-left"
              onClick={() => toggle(i)}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-navy">{job.job_title}</span>
                <ScoreBadge score={job.score} />
              </div>
              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${job.score}%`,
                      backgroundColor: scoreColor(job.score),
                    }}
                  />
                </div>
                <span className="text-gray-400 text-sm">{expanded === i ? '▲' : '▼'}</span>
              </div>
            </button>

            {/* Expanded details */}
            {expanded === i && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 grid sm:grid-cols-2 gap-4">
                {/* Matched */}
                <div>
                  <p className="text-xs font-semibold text-green-600 uppercase mb-2">✓ Matched Skills</p>
                  {job.matched.length === 0 ? (
                    <p className="text-xs text-gray-400">None matched</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {job.matched.map((s) => (
                        <li key={s} className="text-sm text-gray-700">• {s}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Missing + Resources */}
                <div>
                  <p className="text-xs font-semibold text-amber-500 uppercase mb-2">✗ Missing Skills</p>
                  {job.resources.length === 0 ? (
                    <p className="text-xs text-green-600">No gaps — you qualify! 🎉</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {job.resources.map(({ skill, resource }) => (
                        <li key={skill} className="text-sm">
                          <span className="text-gray-700">• {skill} — </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-electric hover:underline"
                          >
                            {resource.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="mt-8 px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
      >
        ← Analyze Another Resume
      </button>
    </div>
  )
}

function ScoreBadge({ score }) {
  let cls = 'text-xs font-bold px-2 py-0.5 rounded-full '
  if (score >= 70) cls += 'bg-green-100 text-green-700'
  else if (score >= 40) cls += 'bg-amber-100 text-amber-700'
  else cls += 'bg-red-100 text-red-600'
  return <span className={cls}>{score}%</span>
}

function scoreColor(score) {
  if (score >= 70) return '#10B981'
  if (score >= 40) return '#F59E0B'
  return '#F43F5E'
}
