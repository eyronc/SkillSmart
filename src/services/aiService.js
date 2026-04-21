import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

function parseJSON(raw) {
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(cleaned)
}

/**
 * Uses Groq to extract a list of skills from resume text.
 * Returns an array of skill strings.
 */
export async function extractSkillsFromResume(resumeText) {
  const chat = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a resume parser. Extract all technical and soft skills from the resume text provided. Include both hard skills (tools, languages, frameworks) and soft skills (communication, leadership, etc.). Return ONLY a valid JSON array of skill strings. No explanation, no markdown, just the JSON array. Example: ["Python", "SQL", "Communication"]',
      },
      {
        role: 'user',
        content: resumeText,
      },
    ],
    temperature: 0.2,
  })

  return parseJSON(chat.choices[0].message.content.trim())
}

/**
 * Uses Groq to semantically match user skills against all job requirements.
 * Understands synonyms, related technologies, and contextual equivalence.
 * Returns an object keyed by job_title with { matched: [], missing: [] }.
 */
export async function semanticMatchJobs(userSkills, jobs) {
  const jobList = jobs.map((j) => ({
    title: j.job_title,
    required: j.skills_required,
  }))

  const prompt = `You are an expert career advisor and skill matcher.

Candidate's skills: ${JSON.stringify(userSkills)}

Jobs and their required skills:
${JSON.stringify(jobList, null, 2)}

For each job, determine which required skills the candidate satisfies — including:
- Exact matches ("React" matches "React")
- Synonyms and aliases ("ReactJS" matches "React", "NodeJS" matches "Node.js", "Postgres" matches "SQL")
- Broader category coverage ("JavaScript" can satisfy "Frontend Frameworks", "Python" or "Java" can satisfy "Backend Languages")
- Related/contextual coverage ("Express.js" helps satisfy "REST API", "MySQL" satisfies "Database Management", "GitHub Actions" satisfies "CI/CD")
- Inferred from context (if candidate knows React + Node.js + SQL, they satisfy "Fullstack" or "Web Development" categories)

Be generous but accurate. Only mark a skill as missing if the candidate clearly has no related experience.

Return ONLY a valid JSON object in this exact format, no explanation, no markdown:
{
  "Frontend Developer": { "matched": ["HTML", "CSS"], "missing": ["Git"] },
  "Backend Developer": { "matched": ["Python"], "missing": ["Docker"] }
}`

  const chat = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a career advisor. Analyze skill matches semantically and contextually. Return only valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1,
  })

  return parseJSON(chat.choices[0].message.content.trim())
}

/**
 * Uses Groq to generate a practice interview based on missing skills.
 */
export async function generatePracticeInterview(missingSkills, jobTitle) {
  const prompt = `You are an expert technical interviewer.
The candidate is applying for the role of ${jobTitle}.
They are missing the following required skills: ${missingSkills.join(', ')}.

Generate a practice interview consisting of 3 to 5 targeted questions (and brief expected points in the answer) to help them prepare and learn these missing skills.
Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "skill": "Matched Skill Name",
      "question": "The interview question",
      "expectedPoints": ["point 1", "point 2"]
    }
  ]
}`

  const chat = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a supportive technical interviewer helping a candidate close skill gaps. Return only valid JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
  })

  return parseJSON(chat.choices[0].message.content.trim())
}
