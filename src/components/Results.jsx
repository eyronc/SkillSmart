import { useState } from 'react'
import { getInterviewTemplate } from '../data/interviewTemplates'
import CareerRoadmap from './CareerRoadmap'
import { buildCareerRoadmap } from '../utils/roadmap'
import { exportRoadmapToPdf } from '../utils/roadmapExport'

function categorizeSkills(skills) {
  const categories = {
    'Technical & Tools': [],
    'Analytical & Data': [],
    'Management & Process': [],
    'Interpersonal & Soft Skills': [],
  }

  skills.forEach((skill) => {
    const normalizedSkill = skill.toLowerCase()

    if (normalizedSkill.match(/aws|cloud|software|ats|hris|database|sql|javascript|scripting|system|tech|code|react|node|api/)) {
      categories['Technical & Tools'].push(skill)
    } else if (normalizedSkill.match(/data|analy|critical|problem-solving|logic|reporting|visuali/)) {
      categories['Analytical & Data'].push(skill)
    } else if (normalizedSkill.match(/manage|project|organiza|resource|policy|business|regulatory|law|agile|scrum/)) {
      categories['Management & Process'].push(skill)
    } else {
      categories['Interpersonal & Soft Skills'].push(skill)
    }
  })

  Object.keys(categories).forEach((key) => {
    if (categories[key].length === 0) {
      delete categories[key]
    }
  })

  return categories
}

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function scoreColor(score) {
  if (score >= 76) return '#ED9BFF'
  if (score >= 41) return '#8601CE'
  return '#B794F4'
}

function ScoreBadge({ score }) {
  let className = 'text-[11px] sm:text-xs font-black px-3 py-1.5 rounded-full border tracking-[0.12em] uppercase whitespace-nowrap '

  if (score >= 76) className += 'bg-pAccent/15 text-pMain border-pAccent/40'
  else if (score >= 41) className += 'bg-pLight/10 text-pMain border-pLight/30'
  else className += 'bg-amber-100 text-amber-700 border-amber-300/60'

  return <span className={className}>{score}% Match</span>
}

export default function Results({
  resumeText,
  extractedSkills,
  results,
  onReset,
  onStartInterview,
  saveState,
  saveMessage,
}) {
  const [expanded, setExpanded] = useState(null)
  const roadmap = buildCareerRoadmap({ extractedSkills, results })
  const topResult = results[0] || null

  function toggle(index) {
    setExpanded(expanded === index ? null : index)
  }

  function handleExportRoadmap() {
    exportRoadmapToPdf(roadmap)
  }

  if (!topResult || !roadmap) {
    return (
      <div className="glass-panel rounded-[30px] p-8 shadow-[0_28px_90px_rgba(17,24,39,0.28)]">
        <h2 className="text-2xl font-black text-white">No role matches yet</h2>
        <p className="mt-3 text-sm text-gray-200 leading-7">
          Submit a resume to generate match results, a coach conversation, and a roadmap export.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-[32px] p-6 sm:p-8 shadow-[0_28px_90px_rgba(17,24,39,0.28)] relative overflow-hidden">
        <div className="absolute -top-16 right-0 w-48 h-48 rounded-full bg-pAccent/10 blur-3xl" />
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-pAccent mb-3">Resume Intelligence</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              You are closest to <span className="text-pAccent">{topResult.job_title}</span> right now.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-200 leading-8 max-w-2xl">
              SkillSmart matched {topResult.matched.length} of {topResult.matched.length + topResult.missing.length} required skills using the formula <span className="font-bold text-white">(matched skills / total required skills) x 100</span>. Use the roadmap below to close the remaining gaps with intent.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {roadmap.adjacentRoles.map((role) => (
                <span
                  key={role.title}
                  className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-gray-100"
                >
                  {role.title} {role.score}%
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0 xl:min-w-[320px]">
            <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-gray-300">Top Match</p>
              <p className="mt-2 text-3xl font-black text-white">{topResult.score}%</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-gray-300">Detected Skills</p>
              <p className="mt-2 text-3xl font-black text-white">{extractedSkills.length}</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-md col-span-2">
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-gray-300">Primary Gaps</p>
              <p className="mt-2 text-sm font-semibold text-white leading-7">
                {roadmap.priorityGaps.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {saveMessage && (
        <div
          className={`rounded-[24px] border px-4 py-3 text-sm flex items-center gap-2 shadow-[0_18px_40px_rgba(17,24,39,0.15)] ${
            saveState === 'saved'
              ? 'border-pAccent/30 bg-pAccent/10 text-pAccent'
              : 'border-amber-400/30 bg-amber-400/10 text-amber-300'
          }`}
        >
          {saveMessage}
        </div>
      )}

      <CareerRoadmap roadmap={roadmap} onExport={handleExportRoadmap} />

      <section className="glass-panel rounded-[32px] p-6 sm:p-8 shadow-[0_28px_90px_rgba(17,24,39,0.24)]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-pAccent mb-2">Extracted Skills</p>
            <h3 className="text-2xl font-black text-white">Your resume signals</h3>
          </div>
          <p className="text-sm text-gray-300 max-w-xl leading-7">
            These grouped skills are the strongest signals we found in your resume text and job-match scan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {Object.entries(categorizeSkills(extractedSkills)).map(([category, skills]) => (
            <div key={category} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <h4 className="text-[11px] font-black uppercase tracking-[0.24em] text-pAccent mb-4">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm font-bold text-gray-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[32px] p-6 sm:p-8 shadow-[0_28px_90px_rgba(17,24,39,0.24)]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-pAccent mb-2">Role Comparison</p>
            <h3 className="text-2xl font-black text-white">Compare all supported job matches</h3>
          </div>
          <p className="text-sm text-gray-300 max-w-xl leading-7">
            Expand a role to inspect matched skills, missing skills, and the attached mock interview setup.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {results.map((job, index) => {
            const interviewTemplate = getInterviewTemplate(job.job_title)

            return (
              <div
                key={job.job_title}
                className="rounded-[28px] border border-white/10 bg-black/20 shadow-sm overflow-hidden transition-colors hover:border-white/20"
              >
                <button
                  className="w-full flex flex-col lg:flex-row lg:items-center justify-between px-5 sm:px-6 py-5 text-left gap-4"
                  onClick={() => toggle(index)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-lg font-black text-white tracking-tight leading-tight">{job.job_title}</span>
                      <ScoreBadge score={job.score} />
                    </div>
                    <p className="text-sm text-gray-300 leading-7 max-w-2xl">
                      {job.matched.length} matched skills, {job.missing.length} priority gaps.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <div className="flex-1 lg:w-48 h-3 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${job.score}%`,
                          backgroundColor: scoreColor(job.score),
                          boxShadow: `0 0 14px ${scoreColor(job.score)}`,
                        }}
                      />
                    </div>
                    <span className={`text-pAccent transition-transform duration-300 ${expanded === index ? 'rotate-180' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>
                </button>

                <div className={`grid transition-all duration-300 ease-in-out ${expanded === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-6 border-t border-white/10 pt-5 grid lg:grid-cols-2 gap-5 bg-black/10">
                      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.24em] text-pAccent mb-4">Matched Skills</h4>
                        {job.matched.length === 0 ? (
                          <p className="text-sm text-gray-400 italic">No direct matches yet.</p>
                        ) : (
                          <ul className="space-y-2.5 text-sm text-gray-200">
                            {job.matched.map((skill) => (
                              <li key={skill} className="flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-pAccent" />
                                <span>{skill}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-300 mb-4">Missing Skills</h4>
                        {job.resources.length === 0 ? (
                          <p className="text-sm text-pAccent font-bold">No visible gaps for this role. You already clear the current checklist.</p>
                        ) : (
                          <div className="space-y-3">
                            {job.resources.map(({ skill, resource }) => (
                              <div key={skill} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                <p className="text-sm font-bold text-white">{skill}</p>
                                <a
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-pAccent mt-1 inline-block hover:text-white transition-colors"
                                >
                                  {resource.label}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        {interviewTemplate && (
                          <div className="mt-5 rounded-3xl border border-pAccent/20 bg-pAccent/5 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-pAccent mb-2">Mock Interview</p>
                                <p className="text-sm text-white font-bold">{interviewTemplate.challengeMode}</p>
                                <p className="text-xs text-gray-300 mt-2 leading-6 max-w-md">{interviewTemplate.scenarioPrompt}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 border border-white/10 text-white">
                                  {formatDuration(interviewTemplate.timeLimitSeconds)}
                                </span>
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 border border-white/10 text-white">
                                  {interviewTemplate.inputMode === 'speech-preferred' ? 'Voice + text' : 'Written response'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                onStartInterview(job)
                              }}
                              className="px-4 py-2.5 bg-white text-[#1E1B4B] rounded-2xl font-black text-sm tracking-[0.14em] uppercase hover:bg-pAccent transition-colors"
                            >
                              Start Mock Interview
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <button
        onClick={onReset}
        className="px-6 py-3 bg-white border border-violet-200 rounded-2xl text-sm text-[#1E1B4B] font-bold tracking-[0.14em] uppercase hover:bg-violet-50 hover:border-pBrand transition-all flex items-center gap-2 shadow-sm"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Analyze Another Resume
      </button>
    </div>
  )
}