import { useState } from 'react'
import { generatePracticeInterview } from '../services/aiService'

function categorizeSkills(skills) {
  const categories = {
    'Technical & Tools': [],
    'Analytical & Data': [],
    'Management & Process': [],
    'Interpersonal & Soft Skills': []
  }
  
  skills.forEach(skill => {
    const norm = skill.toLowerCase()
    if (norm.match(/aws|cloud|software|ats|hris|database|sql|javascript|scripting|system|tech|code|react|node|api/)) {
      categories['Technical & Tools'].push(skill)
    } else if (norm.match(/data|analy|critical|problem-solving|logic|reporting|visuali/)) {
      categories['Analytical & Data'].push(skill)
    } else if (norm.match(/manage|project|organiza|resource|policy|business|regulatory|law|agile|scrum/)) {
      categories['Management & Process'].push(skill)
    } else {
      categories['Interpersonal & Soft Skills'].push(skill)
    }
  })
  
  Object.keys(categories).forEach(k => {
    if (categories[k].length === 0) delete categories[k]
  })
  
  return categories
}

export default function Results({ extractedSkills, results, onReset, saveState, saveMessage }) {
  const [expanded, setExpanded] = useState(null)
  
  // Interview Gen State
  const [interviewGenStatus, setInterviewGenStatus] = useState({}) 
  // { [jobTitle]: { status: 'idle' | 'loading' | 'success' | 'error', data: null, error: null } }

  function toggle(i) {
    setExpanded(expanded === i ? null : i)
  }

  async function handleGenerateInterview(jobTitle, missingSkills) {
    setInterviewGenStatus(prev => ({
      ...prev,
      [jobTitle]: { status: 'loading', data: null, error: null }
    }))
    
    try {
      const result = await generatePracticeInterview(missingSkills, jobTitle)
      setInterviewGenStatus(prev => ({
        ...prev,
        [jobTitle]: { status: 'success', data: result.questions, error: null }
      }))
    } catch (err) {
      console.error(err)
      setInterviewGenStatus(prev => ({
        ...prev,
        [jobTitle]: { status: 'error', data: null, error: 'Failed to generate interview.' }
      }))
    }
  }

  return (
    <div className="max-w-3xl mx-auto glass-panel p-8 rounded-xl shadow-xl">
      {/* Extracted Skills */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Your Extracted Skills</h2>
        <div className="flex flex-col gap-5">
          {Object.entries(categorizeSkills(extractedSkills)).map(([category, skills]) => (
            <div key={category}>
              <h3 className="text-[10px] font-bold text-pAccent tracking-widest uppercase mb-2">
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-pBrand/20 border border-pBrand/30 text-pLight rounded-full text-sm font-bold tracking-tight shadow-[0_0_10px_rgba(134,39,217,0.3)] transition-all hover:bg-pBrand/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {saveMessage && (
        <div
          className={`mb-8 rounded-lg border px-4 py-3 text-sm flex items-center gap-2 ${
            saveState === 'saved'
              ? 'border-pAccent/30 bg-pAccent/10 text-pAccent'
              : 'border-amber-400/30 bg-amber-400/10 text-amber-400'
          }`}
        >
          {saveState === 'saved' ? (
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ) : (
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          )}
          {saveMessage}
        </div>
      )}

      {/* Job Matches */}
      <h2 className="text-xl font-bold text-white mb-4">Job Matches</h2>
      <div className="flex flex-col gap-4">
        {results.map((job, i) => {
          const missingSkillNames = job.resources.map(r => r.skill)
          const interviewData = interviewGenStatus[job.job_title]

          return (
            <div key={job.job_title} className="border border-gray-500/30 rounded-lg bg-black/20 shadow-sm overflow-hidden transition-colors hover:border-gray-500/50">
              {/* Job header */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
                onClick={() => toggle(i)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-white tracking-wide">{job.job_title}</span>
                  <ScoreBadge score={job.score} />
                </div>
                <div className="flex items-center gap-4">
                  {/* Progress bar */}
                  <div className="w-32 h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${job.score}%`,
                        backgroundColor: scoreColor(job.score),
                        boxShadow: `0 0 8px ${scoreColor(job.score)}`
                      }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm">
                    {expanded === i ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    )}
                  </span>
                </div>
              </button>

              {/* Expanded details */}
              {expanded === i && (
                <div className="px-5 pb-5 border-t border-gray-500/30 pt-4 grid sm:grid-cols-2 gap-6 bg-black/10">
                  {/* Matched */}
                  <div>
                    <h3 className="text-xs font-bold text-pAccent tracking-widest uppercase mb-3 flex items-center gap-2">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                       Matched Skills
                    </h3>
                    {job.matched.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">None matched</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {job.matched.map((s) => (
                          <li key={s} className="text-sm text-gray-300 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-pAccent/50" /> {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Missing + Resources */}
                  <div>
                    <h3 className="text-xs font-bold text-red-400 tracking-widest uppercase mb-3 flex items-center gap-2">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                       Missing Skills
                    </h3>
                    {job.resources.length === 0 ? (
                      <p className="text-sm text-pAccent font-bold flex items-center gap-2">
                        No gaps — you qualify!
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><mpath href="#path"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                      </p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <ul className="flex flex-col gap-2.5">
                          {job.resources.map(({ skill, resource }) => (
                            <li key={skill} className="text-sm">
                              <span className="text-gray-200 font-medium">{skill}</span>
                              <span className="text-gray-500 mx-2">—</span>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pAccent hover:text-white hover:underline transition-colors block mt-0.5 text-xs font-bold"
                              >
                                {resource.label}
                              </a>
                            </li>
                          ))}
                        </ul>

                        {/* Interview Generation Section */}
                        <div className="mt-2 p-3 bg-pMain/10 border border-pMain/20 rounded-lg">
                          <h4 className="text-xs font-bold text-white mb-2">Practice Interview</h4>
                          {!interviewData || interviewData.status === 'idle' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleGenerateInterview(job.job_title, missingSkillNames);
                              }}
                              className="px-3 py-1.5 bg-pMain hover:bg-pBrand text-white text-xs font-bold rounded transition-colors shadow-[0_0_10px_rgba(134,39,217,0.4)] w-full flex items-center justify-center gap-2 tracking-tight"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              Generate AI Interview
                            </button>
                          ) : interviewData.status === 'loading' ? (
                            <div className="flex items-center justify-center gap-2 py-2">
                              <div className="w-4 h-4 border-2 border-pMain border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs text-gray-400 font-bold">Generating questions...</span>
                            </div>
                          ) : interviewData.status === 'error' ? (
                            <p className="text-xs text-red-500">{interviewData.error}</p>
                          ) : (
                            <div className="flex flex-col gap-3 mt-2">
                              {interviewData.data.map((q, idx) => (
                                <div key={idx} className="bg-black/30 p-2.5 rounded border border-gray-600/30">
                                  <p className="text-xs font-bold text-pLight mb-1">{q.skill}</p>
                                  <p className="text-sm text-gray-200 mb-2">{q.question}</p>
                                  <div className="pl-2 border-l-2 border-pAccent/50">
                                    <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Expected Points:</p>
                                    <ul className="list-disc list-inside text-xs text-gray-400">
                                      {q.expectedPoints.map((pt, pIdx) => (
                                        <li key={pIdx}>{pt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={onReset}
        className="mt-10 px-6 py-2.5 bg-transparent border border-gray-500/50 rounded-lg text-sm text-gray-300 hover:bg-white/5 hover:text-white hover:border-gray-400 transition-all flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Analyze Another Resume
      </button>
    </div>
  )
}

function ScoreBadge({ score }) {
  let cls = 'text-xs font-bold px-2.5 py-1 rounded-full border tracking-tight '
  if (score >= 76) cls += 'bg-pAccent/10 text-pAccent border-pAccent/30 shadow-[0_0_8px_rgba(237,155,255,0.3)]'
  else if (score >= 41) cls += 'bg-pLight/10 text-pLight border-pLight/30 shadow-[0_0_8px_rgba(153,97,255,0.3)]'
  else cls += 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  return <span className={cls}>{score}% Match</span>
}

function scoreColor(score) {
  if (score >= 76) return '#ED9BFF' // pAccent
  if (score >= 41) return '#9961FF' // pLight
  return '#59167F' // pDark
}
