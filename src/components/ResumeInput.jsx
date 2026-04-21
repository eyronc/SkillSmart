import { useState, useRef } from 'react'
import { extractTextFromPDF } from '../utils/pdfParser'

export default function ResumeInput({ onSubmit }) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState(null)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  async function handleFile(file) {
    if (!file) return
    const allowed = ['application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt|doc|docx)$/i)) {
      setParseError('Only PDF, TXT, DOC, or DOCX files are supported.')
      return
    }
    setParseError(null)
    setParsing(true)
    setFileName(file.name)
    try {
      let extracted = ''
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        extracted = await extractTextFromPDF(file)
      } else {
        // Plain text / doc fallback — read as text
        extracted = await file.text()
      }
      setText(extracted)
    } catch (err) {
      setParseError('Could not read this file. Try a different PDF or paste text manually.')
      setFileName(null)
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
    if (text.trim().length < 20) return
    onSubmit(text.trim())
  }

  function clearFile() {
    setText('')
    setFileName(null)
    setParseError(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-navy mb-1">Analyze Your Resume</h2>
      <p className="text-gray-500 text-sm mb-5">
        Upload a PDF/DOCX or paste your resume text. Our AI will extract skills and match you to jobs.
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !fileName && fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4
          ${dragging ? 'border-electric bg-blue-50' : 'border-gray-300 bg-white hover:border-electric hover:bg-blue-50'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={onFileInputChange}
        />

        {parsing ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-7 h-7 border-4 border-electric border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Reading file...</span>
          </div>
        ) : fileName ? (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-sm text-navy font-medium">
              <span className="text-2xl">📄</span>
              <span>{fileName}</span>
              <span className="text-green-600 text-xs font-semibold">✓ Extracted</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clearFile() }}
              className="text-xs text-red-400 hover:text-red-600 transition-colors"
            >
              ✕ Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-2">
            <span className="text-4xl">📂</span>
            <p className="text-sm font-medium text-navy">
              {dragging ? 'Drop it here!' : 'Drag & drop your resume here'}
            </p>
            <p className="text-xs text-gray-400">or <span className="text-electric underline">click to browse</span></p>
            <p className="text-xs text-gray-300 mt-1">PDF, DOCX, TXT supported</p>
          </div>
        )}
      </div>

      {parseError && (
        <p className="text-red-500 text-xs mb-3">{parseError}</p>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">or paste manually</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Text area */}
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-electric"
          placeholder="Paste your resume text here..."
          value={text}
          onChange={(e) => { setText(e.target.value); setFileName(null) }}
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">{text.length} characters</span>
          <button
            type="submit"
            disabled={text.trim().length < 20}
            className="px-6 py-2 bg-electric text-white rounded-lg font-medium text-sm
              hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Skills →
          </button>
        </div>
      </form>
    </div>
  )
}
