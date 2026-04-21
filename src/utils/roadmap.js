function uniqueStrings(values) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
    )
  )
}

function createProjectSuggestion(jobTitle, skills) {
  const highlightedSkills = skills.slice(0, 2)
  const skillText = highlightedSkills.length > 0 ? highlightedSkills.join(' + ') : 'role-specific strengths'

  const suggestions = {
    'Frontend Developer': {
      title: 'Build a responsive feature showcase',
      outcome: `Create a polished multi-screen interface that proves ${skillText} in production-style UI work.`,
    },
    'Backend Developer': {
      title: 'Ship a documented API service',
      outcome: `Publish a small backend with auth, validation, and tests to demonstrate ${skillText}.`,
    },
    'Fullstack Developer': {
      title: 'Launch an end-to-end workflow app',
      outcome: `Build a product slice from UI to database so recruiters can see ${skillText} in one story.`,
    },
    'HR Specialist': {
      title: 'Create an HR operations playbook',
      outcome: `Package a hiring or employee-relations workflow that highlights ${skillText} with practical templates.`,
    },
    'Data Analyst': {
      title: 'Publish a decision-ready dashboard',
      outcome: `Turn one messy dataset into a concise insight deck that showcases ${skillText}.`,
    },
    'Customer Service Representative': {
      title: 'Design a service recovery playbook',
      outcome: `Document how you would resolve common support issues to prove ${skillText}.`,
    },
    'SEO Manager': {
      title: 'Run a mini SEO audit',
      outcome: `Audit one site and propose a growth plan that demonstrates ${skillText}.`,
    },
    'DevOps Engineer': {
      title: 'Automate one deployment pipeline',
      outcome: `Show ${skillText} by shipping CI/CD, infrastructure, and monitoring in one repeatable workflow.`,
    },
    'Cloud Engineer': {
      title: 'Map a cloud reference architecture',
      outcome: `Build a secure cloud deployment plan that makes ${skillText} visible to reviewers.`,
    },
    'IT Project Manager': {
      title: 'Package a delivery plan',
      outcome: `Create a roadmap, RAID log, and sprint plan that demonstrates ${skillText}.`,
    },
  }

  return (
    suggestions[jobTitle] || {
      title: `Build proof for ${jobTitle}`,
      outcome: `Create one artifact or mini project that makes ${skillText} concrete and measurable.`,
    }
  )
}

function createResumeActions(primaryRole, strengths, gaps) {
  return uniqueStrings([
    strengths[0]
      ? `Move ${strengths[0]} into the first two lines of your summary for ${primaryRole}.`
      : `Lead with the strongest evidence you already have for ${primaryRole}.`,
    strengths[1]
      ? `Rewrite one recent bullet to quantify business impact using ${strengths[1]}.`
      : 'Quantify impact in at least two recent bullets with metrics or outcomes.',
    gaps[0]
      ? `Add a proof point for ${gaps[0]} after you finish a focused practice project.`
      : `Keep the resume tightly aligned to ${primaryRole} instead of listing every skill equally.`,
  ])
}

function createInterviewFocus(gaps, interviewResult) {
  if (interviewResult?.feedback) {
    const combined = uniqueStrings([
      ...(interviewResult.feedback.improvements || []),
      ...(interviewResult.feedback.recommendedFollowUps || []),
    ])

    if (combined.length > 0) {
      return combined.slice(0, 4)
    }
  }

  if (gaps.length === 0) {
    return [
      'Keep answers structured with a clear situation, action, and result.',
      'Use measurable outcomes to support your strongest examples.',
      'Practice concise openings so you sound confident quickly.',
    ]
  }

  return gaps.slice(0, 4).map(
    (gap) => `Prepare a concise story that proves progress in ${gap}.`
  )
}

function createPhases(primaryRole, strengths, gaps, resources, projectSuggestion, interviewFocus) {
  const firstGap = gaps[0] || 'your highest-priority gap'
  const secondGap = gaps[1] || firstGap
  const firstResource = resources[0]
  const secondResource = resources[1]

  return [
    {
      label: 'Days 1-30',
      objective: `Stabilize your baseline for ${primaryRole}.`,
      tasks: uniqueStrings([
        strengths[0]
          ? `Keep ${strengths[0]} and ${strengths[1] || strengths[0]} visible in your top resume section.`
          : `Reorder the resume so your best evidence for ${primaryRole} appears first.`,
        `Close the gap in ${firstGap} with one focused learning sprint and written notes.`,
        firstResource
          ? `Finish ${firstResource.resource.label} and capture 3 takeaways you can mention in interviews.`
          : 'Finish one short course and turn it into a concise proof point.',
      ]),
    },
    {
      label: 'Days 31-60',
      objective: 'Turn learning into proof.',
      tasks: uniqueStrings([
        projectSuggestion.title,
        projectSuggestion.outcome,
        `Add one concrete example showing ${secondGap} or a related requirement in action.`,
        secondResource
          ? `Use ${secondResource.resource.label} to tighten the second priority skill gap.`
          : 'Tighten the next-highest gap with a second practice cycle.',
      ]),
    },
    {
      label: 'Days 61-90',
      objective: 'Convert proof into interviews.',
      tasks: uniqueStrings([
        `Update your resume and LinkedIn around ${primaryRole} with measurable outcomes and stronger ordering.`,
        interviewFocus[0] || 'Practice structured interview answers with clear impact statements.',
        'Apply to the strongest-fit roles first, then adjacent roles once your proof is polished.',
      ]),
    },
  ]
}

export function buildCareerRoadmap({
  extractedSkills = [],
  results = [],
  focusJobTitle = null,
  interviewResult = null,
} = {}) {
  if (!Array.isArray(results) || results.length === 0) {
    return null
  }

  const primaryRole =
    results.find((entry) => entry.job_title === focusJobTitle) || results[0]

  if (!primaryRole) {
    return null
  }

  const matchedCount = Array.isArray(primaryRole.matched) ? primaryRole.matched.length : 0
  const missingCount = Array.isArray(primaryRole.missing) ? primaryRole.missing.length : 0
  const totalRequired = matchedCount + missingCount
  const strengths = uniqueStrings(
    matchedCount > 0 ? primaryRole.matched.slice(0, 5) : extractedSkills.slice(0, 5)
  )
  const priorityGaps = uniqueStrings(primaryRole.missing || []).slice(0, 4)
  const resources = (primaryRole.resources || []).slice(0, 4)
  const adjacentRoles = results
    .filter((entry) => entry.job_title !== primaryRole.job_title)
    .slice(0, 3)
    .map((entry) => ({
      title: entry.job_title,
      score: entry.score,
    }))

  const projectSuggestion = createProjectSuggestion(primaryRole.job_title, priorityGaps)
  const interviewFocus = createInterviewFocus(priorityGaps, interviewResult)
  const resumeActions = createResumeActions(primaryRole.job_title, strengths, priorityGaps)
  const phases = createPhases(
    primaryRole.job_title,
    strengths,
    priorityGaps,
    resources,
    projectSuggestion,
    interviewFocus
  )

  return {
    primaryRole: primaryRole.job_title,
    primaryScore: primaryRole.score,
    matchedCount,
    missingCount,
    totalRequired,
    scoreFormula: `(${matchedCount} matched skills / ${totalRequired || 1} required skills) x 100 = ${primaryRole.score}%`,
    summary:
      priorityGaps.length > 0
        ? `You are already strongest for ${primaryRole.job_title}. The fastest path forward is to preserve your current strengths, close the ${priorityGaps.length} most visible gap${priorityGaps.length > 1 ? 's' : ''}, and package that work as proof.`
        : `You already look strong for ${primaryRole.job_title}. Focus on making your achievements sharper, measurable, and easier to defend in interviews.`,
    strengths,
    priorityGaps,
    resources,
    phases,
    projectSuggestion,
    interviewFocus,
    resumeActions,
    adjacentRoles,
  }
}

export function buildResumeCoachFallback(question, context = {}) {
  const roadmap = context.roadmap || buildCareerRoadmap(context)

  if (!roadmap) {
    return {
      answer: 'Upload a resume first so I can explain your strengths, gaps, and next steps from real match data.',
      followUps: [
        'Which role fits me best?',
        'What should I improve first?',
        'How can I strengthen my resume bullets?',
      ],
    }
  }

  const normalizedQuestion = String(question || '').toLowerCase()
  const strengths = roadmap.strengths.join(', ') || 'your strongest current skills'
  const gaps = roadmap.priorityGaps.join(', ') || 'resume positioning and measurable proof'
  const firstResource = roadmap.resources[0]?.resource?.label

  if (/best|fit|match|role|job/.test(normalizedQuestion)) {
    return {
      answer: `${roadmap.primaryRole} is your best current fit at ${roadmap.primaryScore}%. You already match ${roadmap.matchedCount} of ${roadmap.totalRequired} required skills, and your strongest signals are ${strengths}. The adjacent roles worth keeping in play are ${roadmap.adjacentRoles.map((role) => `${role.title} (${role.score}%)`).join(', ') || 'the next closest roles in your results'}.`,
      followUps: ['What should I improve first?', 'Which project should I build?', 'How should I update my resume?'],
    }
  }

  if (/improve|gap|missing|weak|learn/.test(normalizedQuestion)) {
    return {
      answer: `Your biggest improvement targets are ${gaps}. Start with ${roadmap.priorityGaps[0] || 'your highest-priority gap'}, then move to ${roadmap.priorityGaps[1] || 'the next missing skill'}. ${firstResource ? `A good first learning resource is ${firstResource}.` : 'Use one short, focused learning resource and turn it into proof quickly.'}`,
      followUps: ['How do I turn that into a project?', 'What should I say in interviews?', 'How do I reorder my resume?'],
    }
  }

  if (/summary|bullet|resume|rewrite|cv/.test(normalizedQuestion)) {
    return {
      answer: `For your resume, anchor everything around ${roadmap.primaryRole}. Lead with ${roadmap.resumeActions[0]} Then ${roadmap.resumeActions[1]} Finally, ${roadmap.resumeActions[2]} That gives recruiters a clear story: current strengths first, proof second, gaps closing third.`,
      followUps: ['Which role fits me best?', 'What should I improve first?', 'What project should I build?'],
    }
  }

  if (/project|portfolio|proof/.test(normalizedQuestion)) {
    return {
      answer: `${roadmap.projectSuggestion.title} is the best next proof piece. ${roadmap.projectSuggestion.outcome} Keep it small enough to finish, but concrete enough that you can show screenshots, a repo, or a one-page write-up.`,
      followUps: ['How should I describe it on my resume?', 'What skill gap does it close?', 'How do I prepare to discuss it in interviews?'],
    }
  }

  if (/interview|question|answer/.test(normalizedQuestion)) {
    return {
      answer: `For interviews, focus on ${roadmap.interviewFocus.join('; ')}. Give answers in a short structure: context, action, result. Tie every answer back to ${roadmap.primaryRole} and use your strongest evidence in ${strengths}.`,
      followUps: ['What should I improve first?', 'How do I update my resume?', 'Which project should I build?'],
    }
  }

  return {
    answer: `${roadmap.summary} Right now, your best path is: 1) keep ${strengths} visible, 2) close ${gaps}, and 3) package the work as proof for ${roadmap.primaryRole}.`,
    followUps: ['Which role fits me best?', 'What should I improve first?', 'How should I update my resume?'],
  }
}