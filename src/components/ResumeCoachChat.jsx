import { useEffect, useRef, useState } from 'react'
import { answerResumeCoachQuestion } from '../services/aiService'
import { buildResumeCoachFallback } from '../utils/roadmap'

function defaultPrompts(roadmap) {
  if (!roadmap) {
    return []
  }

  return [
    'Which role fits me best?',
    'What should I improve first?',
    'How should I update my resume?',
    'What project should I build next?',
  ]
}

function introMessage(roadmap) {
  if (!roadmap) {
    return 'Upload a resume and I will turn it into a role-fit explanation, a gap list, and practical next steps.'
  }

  return `Your strongest fit right now is ${roadmap.primaryRole} at ${roadmap.primaryScore}%. Ask me about skill gaps, resume rewrites, project ideas, or interview prep based on this resume.`
}

export default function ResumeCoachChat({ resumeText, extractedSkills, results, roadmap }) {
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: introMessage(roadmap) },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [promptChips, setPromptChips] = useState(() => defaultPrompts(roadmap))
  const scrollRef = useRef(null)

  useEffect(() => {
    setMessages([{ role: 'assistant', content: introMessage(roadmap) }])
    setPromptChips(defaultPrompts(roadmap))
  }, [roadmap?.primaryRole, roadmap?.primaryScore])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function submitQuestion(rawQuestion) {
    const question = rawQuestion.trim()

    if (!question || loading || !roadmap) {
      return
    }

    const nextMessages = [...messages, { role: 'user', content: question }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await answerResumeCoachQuestion({
        resumeText,
        extractedSkills,
        results,
        roadmap,
        question,
        history: nextMessages,
      })

      setMessages((current) => [...current, { role: 'assistant', content: response.answer }])
      setPromptChips(response.followUps?.length ? response.followUps : defaultPrompts(roadmap))
    } catch (error) {
      const fallback = buildResumeCoachFallback(question, {
        resumeText,
        extractedSkills,
        results,
        roadmap,
      })

      setMessages((current) => [...current, { role: 'assistant', content: fallback.answer }])
      setPromptChips(fallback.followUps)
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitQuestion(input)
  }

  return (
    <section className="rounded-[28px] border border-white/15 bg-[linear-gradient(135deg,rgba(17,24,39,0.78),rgba(67,44,122,0.72))] p-6 sm:p-7 shadow-[0_28px_90px_rgba(17,24,39,0.35)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-pAccent mb-2">
            Resume Coach
          </p>
          <h3 className="text-2xl font-black text-white leading-tight">
            Ask about this resume
          </h3>
          <p className="mt-2 text-sm text-gray-300 max-w-xl leading-7">
            The coach answers from your uploaded resume, extracted skills, and role-match results. If AI is unavailable, it falls back to a deterministic planner.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-gray-300">Focus Role</p>
          <p className="mt-1 text-lg font-bold text-white">{roadmap?.primaryRole || 'Resume needed'}</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="h-[360px] overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${
                message.role === 'user'
                  ? 'bg-white text-[#1E1B4B] font-semibold'
                  : 'bg-white/10 text-gray-100 border border-white/10'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-3xl px-4 py-3 text-sm leading-7 bg-white/10 text-gray-100 border border-white/10">
              Thinking through your resume...
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {promptChips.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => submitQuestion(chip)}
            disabled={loading || !roadmap}
            className="px-3 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-gray-100 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask how to improve, what to rewrite, or which role to target next..."
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pLight"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading || !roadmap}
          className="px-5 py-3 rounded-2xl bg-white text-[#1E1B4B] font-black text-sm tracking-[0.14em] uppercase hover:bg-pAccent hover:text-[#1E1B4B] transition-colors disabled:opacity-50"
        >
          Ask Coach
        </button>
      </form>
    </section>
  )
}