import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import mammoth from 'mammoth'

// Use Vite's ?url import to serve the worker locally — no CDN dependency
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

/**
 * Reads a PDF File object and returns all text content as a single string.
 */
export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    let pageText = ''
    let lastY = null
    let lineText = ''
    for (const item of content.items) {
      if (lastY !== null && lastY !== item.transform[5]) {
        pageText += lineText + '\n'
        lineText = ''
      }
      lineText += item.str + ' '
      lastY = item.transform[5]
    }
    pageText += lineText
    pages.push(pageText)
  }

  return pages.join('\n')
}

/**
 * Reads a DOCX File object and returns raw text securely without PK zip garbage.
 */
export async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value || ''
}
