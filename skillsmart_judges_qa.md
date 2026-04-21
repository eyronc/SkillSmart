# SkillSmart Judge Q&A

## Overview
This file is the judge-prep companion for SkillSmart. It covers the product pitch, technical design, scoring formulas, AI usage, persistence, voice features, and likely judge questions with concise answers.

## Quick Pitch
SkillSmart helps applicants understand how close they are to a role, what skills are missing, and how to practice job-specific interview scenarios with instant feedback.

## Current Stack
- Frontend: React + Vite + Tailwind CSS
- Database and storage: Supabase PostgreSQL + Supabase Storage
- Resume parsing: `pdfjs-dist` and `mammoth`
- AI provider: Groq using `llama-3.3-70b-versatile`
- Voice features: browser `SpeechRecognition`, `MediaRecorder`, and `speechSynthesis`

## Scoring Formulas

### 1. Job Match Score
Yes. The current implementation follows the standard matching formula used in the guidelines.

Basic formula:

```text
Match Score = (Matched Skills / Total Required Skills) x 100
```

Current code logic in `src/utils/matcher.js`:

```text
score = Math.round((matched.length / job.skills_required.length) * 100)
```

What counts as a matched skill:
- Exact skill matches found in the resume text
- Skill aliases and related terms from the job dataset
- AI-extracted skills merged with keyword matching

Example:
- Data Analyst has 8 required skills
- If the user matches 6 of those 8 skills, then:

```text
Match Score = (6 / 8) x 100 = 75%
```

Example output:
- Data Analyst -> 75% Match

### 2. Missing Skills
Missing skills are the required job skills that were not detected in the candidate profile.

Basic formula:

```text
Missing Skills = Total Required Skills - Matched Skills
```

Example:
- Data Analyst requires 8 skills
- Candidate matches 6 skills
- Missing Skills = 8 - 6 = 2

### 3. Interview Percentage Score
Each interview template has rubric items, and each rubric item is scored on a 0 to 5 scale.

Basic formula:

```text
Interview Score % = (Sum of Rubric Scores / (Number of Rubric Items x 5)) x 100
```

Current code logic in `src/utils/interviewScoring.js` and AI normalization:

```text
score = Math.round((totalScore / maxScore) * 100)
```

Example:
- Customer Service interview has 5 rubric items
- Suppose rubric scores are 4, 4, 3, 4, 3
- Total score = 18
- Max score = 25

```text
Interview Score % = (18 / 25) x 100 = 72%
```

If the passing score for that interview is 72, the candidate passes.

### 4. AI Interview Scoring vs Fallback Scoring
SkillSmart now supports two interview scoring modes.

AI transcript review:
- Uses Groq to evaluate the answer text and speech transcript against the rubric
- Produces rubric scores, summary feedback, strengths, improvements, and follow-up coaching

Rules-based fallback:
- Used if the AI call fails or is unavailable
- Uses rubric keywords and phrase matching to generate criterion scores and feedback

### 5. Is Raw Audio Scored?
Not yet.

Current behavior:
- Audio is recorded and stored for playback
- Live speech can generate transcript text
- The interview score is based on the typed answer and transcript text
- Raw audio tone, pacing, confidence, and pronunciation are not directly graded

## What AI Is Used For
- Resume skill extraction from uploaded or pasted resumes
- AI transcript-based interview scoring and feedback

AI is not currently used for:
- Final database persistence
- Session routing or workflow persistence
- Raw voice tone analysis
- File parsing itself

## Likely Judge Questions

### Product and Problem

#### 1. What problem does SkillSmart solve?
SkillSmart helps near-miss applicants understand why they are not a full match for a role, which skills are missing, and how to improve with guided practice and learning resources.

#### 2. Who is the target user?
Applicants who are close to qualifying for a job but are missing a few skills or need interview preparation.

#### 3. Why is this useful beyond a demo?
It combines resume analysis, role matching, learning guidance, and mock interviews in one workflow instead of requiring separate tools.

### AI and Scoring

#### 4. What parts of the system are actually AI-driven?
AI is used for resume skill extraction and transcript-based interview evaluation.

#### 5. Do you follow the standard job matching formula from the guidelines?
Yes. The current implementation uses `Math.round((matched skills / total required skills) * 100)`.

#### 6. Can you give a concrete score example?
Yes. If a Data Analyst role has 8 required skills and the candidate matches 6, then the score is `Math.round((6 / 8) * 100) = 75%`.

#### 7. How are matched skills detected?
The system combines AI-extracted skills with deterministic keyword and alias matching from the role dataset.

#### 8. How are missing skills computed?
Missing skills are the required skills for the job that are not found by the detection pipeline.

#### 9. How are interview scores calculated?
Each rubric item is scored from 0 to 5, summed, divided by the rubric maximum, and converted to a percentage.

#### 10. Why do you have both AI scoring and rules-based scoring?
AI gives richer feedback, but rules-based scoring keeps the product reliable and free to use when the model call fails.

#### 11. Is the recorded voice directly analyzed for tone or confidence?
No. The current system scores text and transcript content, not raw audio quality.

#### 12. What happens if the AI service is unavailable?
The app falls back to the deterministic rules-based interview scorer so the flow still works.

### Architecture and Data

#### 13. What technologies are used?
React, Vite, Tailwind CSS, Supabase, Groq, `pdfjs-dist`, `mammoth`, and browser voice APIs.

#### 14. What data is stored?
The app stores resumes, extracted skills, job matches, skill gaps, learning resources, interview attempts, and optional interview audio.

#### 15. How is session progress preserved?
The upload and interview flow are saved in browser session storage and reflected in the URL stage query param.

#### 16. Why Supabase?
It gives PostgreSQL, storage, and a fast backend setup with minimal infrastructure overhead, which suits a hackathon build.

### Voice and UX

#### 17. How does voice input work?
The app uses browser speech recognition for dictation, MediaRecorder for audio capture, and browser speech synthesis to read interview prompts aloud.

#### 18. What if the browser does not support voice features?
The interface keeps the controls visible and explains why they are unavailable, while the typed fallback still works.

### Safety and Quality

#### 19. How do you prevent spam or junk submissions in the resume box?
The app now blocks obvious spam indicators such as excessive link density, repeated characters, repeated long text blocks, and hidden honeypot field submission.

#### 20. How do you keep scoring explainable?
The app shows the rubric, criterion-level scores, matched evidence, overall percentage, and the scoring method label.

#### 21. How do you reduce hallucinations or incorrect scoring?
The role templates, scoring rubrics, fallback scoring, and deterministic job matching all constrain the system to predefined business logic.

### Limitations and Roadmap

#### 22. What is the biggest limitation right now?
Raw vocal qualities such as tone, pace, and confidence are not directly graded yet.

#### 23. What would you improve after the hackathon?
Full audio transcription from recordings, richer per-role practice packs, stronger auth, production-grade model retries, and analytics for user progress.

#### 24. Why is this hackathon-friendly?
It uses mostly browser-native capabilities plus a free Groq model path, with deterministic fallbacks to keep cost and operational complexity low.

## Short Demo Talking Points
- Resume upload or paste
- AI skill extraction
- Deterministic job matching with percentages
- Missing skill learning recommendations
- Job-specific mock interview
- Voice dictation, recording, and read-aloud prompt
- Free AI transcript review with fallback scoring
- Persisted session progress and saved attempts

## One-Line Summary for Judges
SkillSmart turns a resume into a measurable job-fit score, shows the exact skill gaps, and gives a role-specific mock interview with explainable scoring and coaching.