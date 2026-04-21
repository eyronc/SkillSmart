import { useState, useEffect, useRef } from 'react'
import { answerResumeCoachQuestion } from '../services/aiService'
import { buildCareerRoadmap } from '../utils/roadmap'

const PROMPT_CHIPS = [
  'What should I rewrite first?',
  'Which role fits me best?',
  'What 3 skills should I learn next?',
  'How do I close the top gap fast?',
]

function buildFallbackReply(question, roadmap) {
  if (!roadmap) {
    return 'Upload your resume first so I can give you specific guidance.'
  }

  const q = question.toLowerCase()

  if (q.includes('rewrite') || q.includes('improve') || q.includes('resume')) {
    const actions = roadmap.resumeActions?.slice(0, 3) || []
    if (actions.length) {
      return `Top resume actions for ${roadmap.primaryRole}:\n\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    }
    return `Focus on quantifying your achievements and aligning your language to ${roadmap.primaryRole} job descriptions.`
  }

  if (q.includes('skill') || q.includes('learn') || q.includes('gap')) {
    const gaps = roadmap.priorityGaps?.slice(0, 3) || []
    if (gaps.length) {
      return `Priority gaps to close: ${gaps.join(', ')}. Start with the first one and build a small project around it.`
    }
    return `You're looking strong. Focus on deepening your existing skills with real projects.`
  }

  if (q.includes('role') || q.includes('fit') || q.includes('best')) {
    const adj = roadmap.adjacentRoles?.slice(0, 2) || []
    return `Your primary fit is ${roadmap.primaryRole} (${roadmap.primaryScore}% match).${adj.length ? ` Adjacent options: ${adj.map((r) => `${r.title} (${r.score}%)`).join(', ')}.` : ''}`
  }

  if (q.includes('interview')) {
    const focus = roadmap.interviewFocus?.slice(0, 3) || []
    if (focus.length) {
      return `Interview prep focus areas: ${focus.join(', ')}.`
    }
    return 'Practice telling concise stories that highlight impact. Use the STAR format for behavioral questions.'
  }

  return `Based on your resume, here's what I'd prioritize for ${roadmap.primaryRole}: ${(roadmap.priorityGaps || []).slice(0, 2).join(' and ')}. ${roadmap.summary || ''}`
}

export default function FloatingCoach({ resumeText, extractedSkills, results, roadmap: roadmapProp }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything about your resume, skill gaps, or next steps.' },
  ])
  const [dynamicChips, setDynamicChips] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  const roadmap =
    roadmapProp ||
    (extractedSkills?.length && results?.length
      ? buildCareerRoadmap({ extractedSkills, results })
      : null)

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, open])

  async function submitQuestion(question) {
    if (!question.trim() || loading) return

    const userMsg = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await answerResumeCoachQuestion({
        question,
        resumeText: resumeText || '',
        extractedSkills: extractedSkills || [],
        results: results || [],
        roadmap,
        history: messages,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer }])
      if (Array.isArray(response.followUps) && response.followUps.length > 0) {
        setDynamicChips(response.followUps.slice(0, 3))
      }
    } catch {
      const fallback = buildFallbackReply(question, roadmap)
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitQuestion(input)
  }

  const hasResume = !!resumeText

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-[360px] sm:w-[400px] rounded-[28px] border border-white/15 bg-[linear-gradient(135deg,rgba(17,24,39,0.95),rgba(67,44,122,0.92))] shadow-[0_32px_100px_rgba(17,24,39,0.55)] backdrop-blur-xl flex flex-col overflow-hidden"
          style={{ maxHeight: 'min(560px, calc(100vh - 100px))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-pAccent">Resume Coach</p>
              <p className="text-sm font-black text-white mt-0.5">
                {roadmap?.primaryRole || 'AI Assistant'}
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                  msg.role === 'user'
                    ? 'bg-white text-[#1E1B4B] font-semibold'
                    : 'bg-white/10 text-gray-100 border border-white/10'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 text-sm bg-white/10 text-gray-300 border border-white/10 flex items-center gap-2">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-pAccent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-pAccent animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-pAccent animate-bounce" style={{ animationDelay: '240ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt chips */}
          {hasResume && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {(dynamicChips.length > 0 ? dynamicChips : PROMPT_CHIPS).map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => submitQuestion(chip)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold text-gray-200 hover:bg-white/15 transition-colors disabled:opacity-40"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={hasResume ? 'Ask about your resume...' : 'Upload a resume to get started'}
              disabled={!hasResume || loading}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-pLight disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || !hasResume}
              className="px-4 py-2.5 rounded-2xl bg-white text-[#1E1B4B] font-black text-sm hover:bg-pAccent transition-colors disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 rounded-full bg-pMain hover:bg-pBrand shadow-[0_8px_32px_rgba(134,1,206,0.5)] flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
        aria-label={open ? 'Close resume coach' : 'Open resume coach'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        )}
      </button>
    </div>
  )
}
