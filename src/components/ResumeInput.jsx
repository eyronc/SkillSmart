import { useEffect, useRef, useState } from 'react'
import { extractTextFromDOCX, extractTextFromPDF } from '../utils/pdfParser'

function detectResumeSpam(value) {
  const normalizedValue = value.trim()

  if (!normalizedValue) {
    return null
  }

  const urlMatches = normalizedValue.match(/(?:https?:\/\/|www\.)\S+/gi) || []

  if (urlMatches.length >= 6 || (urlMatches.length >= 3 && normalizedValue.length < 600)) {
    return 'Please remove excessive links or promotional content before submitting your resume.'
  }

  if (/(.)\1{14,}/.test(normalizedValue)) {
    return 'Please remove repeated characters before submitting your resume.'
  }

  const repeatedLineCounts = new Map()

  for (const line of normalizedValue.split(/\n+/).map((entry) => entry.trim()).filter(Boolean)) {
    if (line.length < 20) {
      continue
    }

    const nextCount = (repeatedLineCounts.get(line) || 0) + 1
    repeatedLineCounts.set(line, nextCount)

    if (nextCount >= 3) {
      return 'Please remove duplicated text blocks before submitting your resume.'
    }
  }

  return null
}

export default function ResumeInput({ onSubmit, initialText = '' }) {
  const [text, setText] = useState(initialText)
  const [fileName, setFileName] = useState(null)
  const [fileObj, setFileObj] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [trapField, setTrapField] = useState('')
  const fileInputRef = useRef(null)

  const normalizedText = text.trim()
  const spamWarning = trapField.trim() ? 'Submission blocked.' : detectResumeSpam(normalizedText)

  useEffect(() => {
    if (!fileObj || fileObj.type !== 'application/pdf') {
      setFilePreviewUrl(null)
      return undefined
    }

    const objectUrl = URL.createObjectURL(fileObj)
    setFilePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [fileObj])

  async function handleFile(file) {
    if (!file) return

    const lowerName = file.name.toLowerCase()
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type) && !lowerName.match(/\.(pdf|txt|doc|docx)$/i)) {
      setParseError('Only PDF, TXT, DOC, or DOCX files are supported.')
      return
    }
    setParseError(null)
    setSubmitError(null)
    setParsing(true)
    setFileName(file.name)
    try {
      let extracted = ''
      if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) {
        extracted = await extractTextFromPDF(file)
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || lowerName.endsWith('.docx')) {
        extracted = await extractTextFromDOCX(file)
      } else {
        // Plain text / doc fallback — read as text
        extracted = await file.text()
      }
      setText(extracted)
      setFileObj(file)
    } catch (err) {
      console.error('Error parsing resume file:', err)
      setParseError('Could not read this file. Try a different file or paste text manually.')
      setFileName(null)
      setFileObj(null)
    } finally {
      setParsing(false)
    }
  }

  // Drag events
  function onDragOver(e) { e.preventDefault(); setDragging(true) }
  function onDragLeave(e) { e.preventDefault(); setDragging(false) }
  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  function onFileInputChange(e) {
    handleFile(e.target.files[0])
    e.target.value = ''
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)

    if (trapField.trim()) {
      setSubmitError('Submission blocked.')
      return
    }

    if (normalizedText.length < 20) {
      return
    }

    const spamMessage = detectResumeSpam(normalizedText)

    if (spamMessage) {
      setSubmitError(spamMessage)
      return
    }

    onSubmit(normalizedText)
  }

  function clearFile() {
    setText('')
    setFileName(null)
    setFileObj(null)
    setParseError(null)
    setSubmitError(null)
  }

  return (
    <div className="max-w-5xl w-full mx-auto glass-panel p-5 sm:p-8 rounded-[30px] shadow-[0_28px_90px_rgba(17,24,39,0.28)] overflow-hidden">
      <div className="grid xl:grid-cols-[1.15fr,0.85fr] gap-6 xl:gap-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-pAccent mb-3">Resume Intake</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">Analyze your resume with context, not guesswork.</h2>
          <p className="text-gray-200 text-sm sm:text-base leading-7 mb-6 max-w-2xl">
            Upload a PDF, DOCX, DOC, or TXT file, or paste the text directly. SkillSmart extracts skills, matches roles, launches a resume coach, and builds a roadmap you can export.
          </p>

          {/* Drop Zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !fileName && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-[28px] p-6 text-center cursor-pointer transition-colors mb-6 ${
              dragging
                ? 'border-pLight bg-white/10'
                : 'border-white/15 bg-black/20 hover:border-pLight hover:bg-white/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={onFileInputChange}
            />

            {parsing ? (
              <div className="flex flex-col items-center gap-2 py-4 text-white">
                <div className="w-8 h-8 border-4 border-pMain border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Reading file...</span>
              </div>
            ) : fileName ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-4 bg-black/30 rounded-2xl w-full overflow-hidden">
                <div className="flex items-center gap-2 sm:gap-3 text-sm text-white font-medium w-full sm:w-auto overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pAccent shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  <span className="truncate">{fileName}</span>
                  <span className="text-pAccent text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-pAccent/10 rounded-full shrink-0">Extracted</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFile()
                  }}
                  className="text-xs text-red-400 hover:text-white transition-colors flex items-center gap-1 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="text-sm sm:text-base font-semibold text-white">
                  {dragging ? 'Drop it here!' : 'Drag and drop your resume here'}
                </p>
                <p className="text-xs text-gray-300">or <span className="text-pAccent underline cursor-pointer">click to browse</span></p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOCX, DOC, TXT supported</p>
              </div>
            )}
          </div>

          {parseError && <p className="text-red-300 text-xs mb-3">{parseError}</p>}

          {/* File Preview */}
          {fileObj && (
            <div className="mb-6">
              {fileObj.type === 'application/pdf' && filePreviewUrl ? (
                <iframe
                  src={filePreviewUrl}
                  className="w-full h-96 rounded-[24px] border border-white/10"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-48 bg-black/20 border border-white/10 rounded-[24px] flex items-center justify-center text-gray-300 px-6 text-center">
                  <div>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <p className="text-white font-bold">{fileObj.name}</p>
                    <p className="text-sm mt-1">File ready for analysis</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-300 uppercase tracking-widest font-medium">or paste manually</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Text area */}
          <form onSubmit={handleSubmit}>
            <div className="absolute left-[-9999px] opacity-0 pointer-events-none" aria-hidden="true">
              <label htmlFor="company-website">Leave this field empty</label>
              <input
                id="company-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={trapField}
                onChange={(event) => setTrapField(event.target.value)}
              />
            </div>

            {!fileObj && (
              <textarea
                className="w-full h-52 p-4 bg-black/20 border border-white/10 rounded-[24px] text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-pLight transition-shadow whitespace-pre-wrap leading-relaxed"
                placeholder="Paste your resume text here..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  setFileName(null)
                  setFileObj(null)
                  setSubmitError(null)
                }}
              />
            )}

            {(submitError || spamWarning) && (
              <p className="mt-3 text-xs text-amber-300">{submitError || spamWarning}</p>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-4 sm:gap-0">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-300 font-medium">({text.length} characters)</span>
                <span className="text-[11px] text-gray-400">Anti-spam guard blocks excessive links and duplicated promotional text.</span>
              </div>
              <button
                type="submit"
                disabled={normalizedText.length < 20 || !!spamWarning}
                className="px-6 py-3 bg-white text-[#1E1B4B] rounded-2xl font-black text-sm tracking-[0.16em] uppercase hover:bg-pAccent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Analyze Skills
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-pAccent mb-3">What Happens Next</p>
            <div className="space-y-4">
              {[
                {
                  step: '01',
                  title: 'Extract resume signals',
                  copy: 'We pull visible skills from the uploaded resume and keep the text ready for coaching.',
                },
                {
                  step: '02',
                  title: 'Match real job profiles',
                  copy: 'Each job score follows the same formula: matched skills divided by required skills, then converted to a percentage.',
                },
                {
                  step: '03',
                  title: 'Build a roadmap',
                  copy: 'You get a next-step plan, a coach chat, and a cleaner PDF export that is useful after the demo too.',
                },
              ].map((item) => (
                <div key={item.step} className="rounded-3xl border border-white/10 bg-black/20 px-4 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-pAccent mb-2">{item.step}</p>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-200 leading-7">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 sm:p-6">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-pAccent mb-3">Recommendations Applied</p>
            <ul className="space-y-3 text-sm text-gray-100 leading-7">
              <li className="flex gap-3"><span className="text-pAccent">•</span><span>Persistent resume context for roadmap and coach answers.</span></li>
              <li className="flex gap-3"><span className="text-pAccent">•</span><span>Cleaner PDF export flow focused on action, not just raw screen capture.</span></li>
              <li className="flex gap-3"><span className="text-pAccent">•</span><span>Safer PDF preview handling so repeated uploads do not leak object URLs.</span></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
