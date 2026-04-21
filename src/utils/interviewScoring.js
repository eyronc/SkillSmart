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

function includesPhrase(text, phrase) {
  const normalizedPhrase = normalizeValue(phrase)

  if (!normalizedPhrase) {
    return false
  }

  const pattern = new RegExp(
    `(^|\\b)${escapeRegex(normalizedPhrase).replace(/\s+/g, '\\s+')}(\\b|$)`,
    'i'
  )

  return pattern.test(text)
}

function scoreCriterion(matchCount, wordCount) {
  if (wordCount === 0) {
    return 0
  }

  if (matchCount >= 3) {
    return 5
  }

  if (matchCount === 2) {
    return 4
  }

  if (matchCount === 1) {
    return 3
  }

  return wordCount >= 30 ? 2 : 1
}

export function scoreInterviewResponse(template, answerText, transcriptText = '') {
  const combinedResponse = [answerText, transcriptText].filter(Boolean).join(' ').trim()
  const normalizedResponse = normalizeValue(combinedResponse)
  const wordCount = combinedResponse.split(/\s+/).filter(Boolean).length

  const rubricScores = template.rubric.map((criterion) => {
    const matchedSignals = criterion.keywords.filter((keyword) =>
      includesPhrase(normalizedResponse, keyword)
    )

    return {
      key: criterion.key,
      label: criterion.label,
      description: criterion.description,
      score: scoreCriterion(matchedSignals.length, wordCount),
      matchedSignals,
    }
  })

  const maxScore = rubricScores.length * 5
  const totalScore = rubricScores.reduce((sum, criterion) => sum + criterion.score, 0)
  const score = maxScore === 0 ? 0 : Math.round((totalScore / maxScore) * 100)
  const passed = score >= template.passingScore

  const strengths = rubricScores
    .filter((criterion) => criterion.score >= 4)
    .map((criterion) => `${criterion.label}: ${criterion.description}`)

  const improvements = rubricScores
    .filter((criterion) => criterion.score < 4)
    .map((criterion) => `Add clearer evidence of ${criterion.label.toLowerCase()}.`)

  const summary =
    wordCount === 0
      ? 'No response was captured, so the interview could not be scored.'
      : passed
        ? `Strong response. You stayed aligned with the ${template.challengeMode.toLowerCase()} and covered enough of the rubric to pass.`
        : `Your response addresses part of the scenario, but it needs stronger coverage of the rubric to pass.`

  return {
    score,
    passed,
    wordCount,
    rubricScores,
    evaluationMethod: 'rules',
    evaluationMethodLabel: 'Rules-Based Fallback',
    feedback: {
      summary,
      strengths,
      improvements,
      recommendedFollowUps: template.followUpQuestions,
    },
  }
}