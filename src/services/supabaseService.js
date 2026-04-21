import { supabase } from '../lib/supabase'
import { JOBS, LEARNING_RESOURCES } from '../data/jobs'

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

  if (error.message?.includes('row-level security')) {
    return 'Supabase blocked the insert because the table policies are missing. Run the new migration first.'
  }

  if (error.code === '42P01') {
    return 'The required Supabase tables do not exist yet. Run the new migration first.'
  }

  return error.message || 'Supabase request failed.'
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
      message: 'Analysis saved to Supabase.',
    }
  } catch (error) {
    console.error('Supabase save error:', error)

    return {
      success: false,
      message: formatSupabaseError(error),
    }
  }
}
