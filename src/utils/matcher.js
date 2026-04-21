import { JOBS, LEARNING_RESOURCES } from '../data/jobs'

/**
 * Normalizes strings for keyword matching.
 */
function normalizeValue(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildSearchSources(resumeText, extractedSkills = []) {
  return {
    text: normalizeValue(resumeText),
    skills: extractedSkills.map(normalizeValue).filter(Boolean),
  }
}

function hasKeywordMatch(keyword, sources) {
  const normalizedKeyword = normalizeValue(keyword)

  if (!normalizedKeyword) {
    return false
  }

  const keywordPattern = new RegExp(
    `(^|\\b)${escapeRegex(normalizedKeyword).replace(/\s+/g, '\\s+')}(\\b|$)`,
    'i'
  )

  return (
    sources.skills.some(
      (skill) =>
        skill === normalizedKeyword ||
        skill.includes(normalizedKeyword) ||
        normalizedKeyword.includes(skill)
    ) || keywordPattern.test(sources.text)
  )
}

function isSkillMatched(skill, job, sources) {
  const aliases = [skill, ...(job.skill_aliases?.[skill] || [])]

  return aliases.some((alias) => hasKeywordMatch(alias, sources))
}

export function detectKnownSkills(resumeText, extractedSkills = []) {
  const sources = buildSearchSources(resumeText, extractedSkills)
  const detectedSkills = new Set(
    extractedSkills.map((skill) => skill.trim()).filter(Boolean)
  )

  JOBS.forEach((job) => {
    job.skills_required.forEach((skill) => {
      if (isSkillMatched(skill, job, sources)) {
        detectedSkills.add(skill)
      }
    })
  })

  return Array.from(detectedSkills).sort((left, right) => left.localeCompare(right))
}

/**
 * Matches resume text against job-specific keyword groups.
 * Returns stable results even when AI extraction is incomplete.
 */
export function matchJobsByKeywords({ resumeText, extractedSkills = [] }) {
  const sources = buildSearchSources(resumeText, extractedSkills)
  const detectedSkills = detectKnownSkills(resumeText, extractedSkills)

  const results = JOBS.map((job) => {
    const matched = job.skills_required.filter((skill) =>
      isSkillMatched(skill, job, sources)
    )
    const missing = job.skills_required.filter(
      (skill) => !matched.includes(skill)
    )

    const score = Math.round((matched.length / job.skills_required.length) * 100)

    const resources = missing.map((skill) => ({
      skill,
      resource: LEARNING_RESOURCES[skill] || {
        label: `Learn ${skill}`,
        url: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}`,
      },
    }))

    return {
      job_title: job.job_title,
      score,
      matched,
      missing,
      resources,
    }
  }).sort((a, b) => b.score - a.score)

  return {
    detectedSkills,
    results,
  }
}
