import { useState, useRef } from 'react'
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

export default function ResumeInput({ onSubmit }) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState(null)
  const [fileObj, setFileObj] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [trapField, setTrapField] = useState('')
  const fileInputRef = useRef(null)

  const normalizedText = text.trim()
  const spamWarning = trapField.trim() ? 'Submission blocked.' : detectResumeSpam(normalizedText)

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
    <div className="max-w-2xl mx-auto glass-panel p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-2">Analyze Your Resume</h2>
      <p className="text-gray-300 text-sm mb-6">
        Upload a PDF/DOCX or paste your resume text. Our AI will extract skills and match you to jobs.
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !fileName && fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-6
          ${dragging ? 'border-pLight bg-white/5' : 'border-gray-500/50 bg-black/20 hover:border-pLight hover:bg-white/5'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={onFileInputChange}
        />

        {parsing ? (
          <div className="flex flex-col items-center gap-2 py-2 text-white">
            <div className="w-7 h-7 border-4 border-pMain border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Reading file...</span>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-between px-4 py-2 bg-black/30 rounded-lg">
            <div className="flex items-center gap-3 text-sm text-white font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pAccent"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span>{fileName}</span>
              <span className="text-pAccent text-xs font-semibold px-2 py-0.5 bg-pAccent/10 rounded-full">Extracted</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="text-xs text-red-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p className="text-sm font-medium text-white">
              {dragging ? 'Drop it here!' : 'Drag & drop your resume here'}
            </p>
            <p className="text-xs text-gray-400">or <span className="text-pAccent underline cursor-pointer">click to browse</span></p>
            <p className="text-xs text-gray-500 mt-2">PDF, DOCX, TXT supported</p>
          </div>
        )}
      </div>

      {parseError && (
        <p className="text-red-500 text-xs mb-3">{parseError}</p>
      )}

      {/* File Preview */}
      {fileObj && (
        <div className="mb-6">
          {fileObj.type === 'application/pdf' ? (
            <iframe
              src={URL.createObjectURL(fileObj)}
              className="w-full h-96 rounded-xl border border-gray-500/30"
              title="PDF Preview"
            />
          ) : (
             <div className="w-full h-48 bg-black/20 border border-gray-500/30 rounded-xl flex items-center justify-center text-gray-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                <div className="ml-4">
                  <p className="text-white font-bold">{fileObj.name}</p>
                  <p className="text-sm">File ready for analysis</p>
                </div>
             </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-500/30" />
        <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">or paste manually</span>
        <div className="flex-1 h-px bg-gray-500/30" />
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
            className="w-full h-48 p-4 bg-black/20 border border-gray-500/30 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-pLight transition-shadow whitespace-pre-wrap leading-relaxed"
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
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">({text.length} characters)</span>
            <span className="text-[11px] text-gray-500">Anti-spam guard blocks excessive links and duplicated promotional text.</span>
          </div>
          <button
            type="submit"
            disabled={normalizedText.length < 20 || !!spamWarning}
            className="px-6 py-2.5 bg-pBrand text-white rounded-lg font-bold text-sm tracking-tight
              hover:bg-pMain hover:shadow-[0_0_15px_rgba(153,97,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Analyze Skills
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </form>
    </div>
  )
}
