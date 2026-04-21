import { supabase } from '../lib/supabase'
import { JOBS, LEARNING_RESOURCES } from '../data/jobs'

const INTERVIEW_AUDIO_BUCKET = 'interview-audio'

/**
 * Builds job rows from the static dataset.
 */
function buildJobRows() {
  return JOBS.map((job) => ({
    title: job.job_title,
    description_text: `${job.job_title} role`,
    raw_skills: job.skills_required,
  }))
}

function buildLearningResourceRows() {
  return Object.entries(LEARNING_RESOURCES).map(([skillTag, resource]) => ({
    skill_tag: skillTag,
    title: resource.label,
    url: resource.url,
    type: resource.url.includes('youtube') ? 'video' : 'course',
  }))
}

function formatSupabaseError(error) {
  if (!error) {
    return 'Unknown Supabase error.'
  }

  if (error.message?.toLowerCase().includes('bucket')) {
    return 'The Supabase storage bucket for interview audio is missing. Apply the updated migration first.'
  }

  if (error.message?.includes('row-level security')) {
    return 'Supabase blocked the insert because the table policies are missing. Run the new migration first.'
  }

  if (error.code === '42P01') {
    return 'The required Supabase tables do not exist yet. Run the new migration first.'
  }

  return error.message || 'Supabase request failed.'
}

function sanitizePathSegment(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'entry'
}

async function uploadInterviewAudio({ audioBlob, jobTitle, resumeId }) {
  if (!audioBlob) {
    return { audioUrl: null }
  }

  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  const extension =
    audioBlob.type?.split('/')[1]?.split(';')[0]?.trim() || 'webm'
  const objectPath = [
    'attempts',
    resumeId || 'anonymous',
    sanitizePathSegment(jobTitle),
    `${Date.now()}-${randomId}.${extension}`,
  ].join('/')

  const { error: uploadError } = await supabase.storage
    .from(INTERVIEW_AUDIO_BUCKET)
    .upload(objectPath, audioBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: audioBlob.type || 'audio/webm',
    })

  if (uploadError) {
    throw uploadError
  }

  const { data } = supabase.storage
    .from(INTERVIEW_AUDIO_BUCKET)
    .getPublicUrl(objectPath)

  return {
    audioUrl: data.publicUrl,
  }
}

/**
 * Saves the analysis using the documented flow:
 * jobs -> resumes -> skill_gaps -> learning_resources.
 */
export async function saveAnalysisSession({ resumeText, extractedSkills, results }) {
  try {
    const { data: jobRows, error: jobsError } = await supabase
      .from('jobs')
      .upsert(buildJobRows(), { onConflict: 'title' })
      .select('id, title')

    if (jobsError) {
      throw jobsError
    }

    const { error: learningResourcesError } = await supabase
      .from('learning_resources')
      .upsert(buildLearningResourceRows(), { onConflict: 'skill_tag' })

    if (learningResourcesError) {
      throw learningResourcesError
    }

    const { data: resumeRow, error: resumeError } = await supabase
      .from('resumes')
      .insert({
        resume_text: resumeText,
        extracted_skills: extractedSkills,
      })
      .select('id')
      .single()

    if (resumeError) {
      throw resumeError
    }

    const jobIdByTitle = new Map(jobRows.map((job) => [job.title, job.id]))
    const skillGapRows = results
      .map((result) => ({
        resume_id: resumeRow.id,
        job_id: jobIdByTitle.get(result.job_title),
        matched_skills: result.matched,
        missing_skills: result.missing,
        match_score: result.score,
      }))
      .filter((row) => row.job_id)

    const { error: gapsError } = await supabase
      .from('skill_gaps')
      .insert(skillGapRows)

    if (gapsError) {
      throw gapsError
    }

    return {
      success: true,
      message: 'Analysis saved.',
      resumeId: resumeRow.id,
      jobIdByTitle: Object.fromEntries(jobRows.map((job) => [job.title, job.id])),
    }
  } catch (error) {
    console.error('Error:', error)

    return {
      success: false,
      message: formatSupabaseError(error),
      resumeId: null,
      jobIdByTitle: {},
    }
  }
}

export async function saveInterviewAttempt({
  resumeId,
  jobId,
  jobTitle,
  challengeType,
  promptUsed,
  answerText,
  transcriptText,
  audioBlob,
  score,
  rubricScores,
  feedback,
}) {
  try {
    let audioUrl = null
    let audioWarning = null

    if (audioBlob) {
      try {
        const uploadedAudio = await uploadInterviewAudio({
          audioBlob,
          jobTitle,
          resumeId,
        })

        audioUrl = uploadedAudio.audioUrl
      } catch (audioError) {
        console.error('Error uploading interview audio:', audioError)
        audioWarning = formatSupabaseError(audioError)
      }
    }

    const { error } = await supabase
      .from('interview_attempts')
      .insert({
        resume_id: resumeId || null,
        job_id: jobId || null,
        job_title: jobTitle,
        challenge_type: challengeType,
        prompt_used: promptUsed,
        answer_text: answerText,
        transcript_text: transcriptText || null,
        audio_url: audioUrl,
        score,
        rubric_scores: rubricScores,
        feedback,
      })

    if (error) {
      throw error
    }

    return {
      success: true,
      message: audioWarning
        ? `Interview attempt saved, but the audio file could not be uploaded. ${audioWarning}`
        : 'Interview attempt saved.',
      audioUrl,
    }
  } catch (error) {
    console.error('Error:', error)

    return {
      success: false,
      message: formatSupabaseError(error),
      audioUrl: null,
    }
  }
}
