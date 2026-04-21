function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderList(items, bulletColor = '#6d28d9') {
  return `
    <ul>
      ${(items || [])
        .map(
          (item) => `
            <li>
              <span class="bullet" style="color:${bulletColor}">&#8226;</span>
              <span>${escapeHtml(item)}</span>
            </li>
          `
        )
        .join('')}
    </ul>
  `
}

export function exportRoadmapToPdf(roadmap) {
  if (typeof window === 'undefined' || !roadmap) {
    return false
  }

  const generatedOn = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const phaseMarkup = roadmap.phases
    .map(
      (phase) => `
        <section class="phase-card">
          <p class="phase-label">${escapeHtml(phase.label)}</p>
          <h3>${escapeHtml(phase.objective)}</h3>
          ${renderList(phase.tasks)}
        </section>
      `
    )
    .join('')

  const resourceMarkup = (roadmap.resources || [])
    .map(
      (entry) => `
        <li>
          <span class="resource-skill">${escapeHtml(entry.skill)}</span>
          <span class="resource-label">${escapeHtml(entry.resource.label)}</span>
        </li>
      `
    )
    .join('')

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>SkillSmart Roadmap</title>
        <style>
          :root {
            color-scheme: light;
            --ink: #20153b;
            --muted: #5b5872;
            --border: #ddd6f3;
            --brand: #432c7a;
            --accent: #8601ce;
            --soft: #f6f1ff;
          }

          * { box-sizing: border-box; }

          body {
            margin: 0;
            font-family: "Plus Jakarta Sans", "Segoe UI", sans-serif;
            color: var(--ink);
            background: linear-gradient(180deg, #f8f5ff 0%, #ffffff 100%);
          }

          main {
            max-width: 960px;
            margin: 0 auto;
            padding: 40px 36px 48px;
          }

          .hero {
            border: 1px solid var(--border);
            border-radius: 28px;
            padding: 28px;
            background: linear-gradient(135deg, rgba(67, 44, 122, 0.06), rgba(134, 1, 206, 0.08));
            margin-bottom: 24px;
          }

          .eyebrow {
            margin: 0 0 10px;
            color: var(--accent);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.28em;
            text-transform: uppercase;
          }

          h1 {
            margin: 0;
            font-size: 34px;
            line-height: 1.08;
          }

          .meta,
          .summary {
            color: var(--muted);
            font-size: 14px;
            line-height: 1.7;
          }

          .meta {
            margin-top: 10px;
          }

          .summary {
            margin-top: 16px;
          }

          .stats {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-top: 20px;
          }

          .stat {
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 14px 16px;
            background: rgba(255,255,255,0.72);
          }

          .stat-label {
            margin: 0 0 6px;
            color: var(--muted);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
          }

          .stat-value {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
          }

          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 24px;
          }

          .card {
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 22px;
            background: #ffffff;
          }

          .card h2 {
            margin: 0 0 12px;
            font-size: 18px;
          }

          .phase-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          }

          .phase-card {
            border: 1px solid var(--border);
            border-radius: 22px;
            padding: 20px;
            background: var(--soft);
          }

          .phase-label {
            margin: 0 0 8px;
            color: var(--accent);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }

          .phase-card h3 {
            margin: 0 0 12px;
            font-size: 17px;
            line-height: 1.35;
          }

          ul {
            margin: 0;
            padding: 0;
            list-style: none;
          }

          li {
            display: flex;
            gap: 10px;
            font-size: 14px;
            line-height: 1.65;
            color: var(--ink);
          }

          li + li {
            margin-top: 8px;
          }

          .bullet {
            font-weight: 800;
          }

          .project {
            margin-bottom: 24px;
          }

          .project h2,
          .resources h2 {
            margin-top: 0;
          }

          .resource-skill {
            font-weight: 700;
          }

          .resource-label {
            color: var(--muted);
          }

          .footer-note {
            margin-top: 28px;
            color: var(--muted);
            font-size: 12px;
            line-height: 1.7;
          }

          @media print {
            body { background: #ffffff; }
            main { padding: 20px 18px 28px; }
          }
        </style>
      </head>
      <body>
        <main>
          <section class="hero">
            <p class="eyebrow">SkillSmart Roadmap</p>
            <h1>${escapeHtml(roadmap.primaryRole)} Action Plan</h1>
            <p class="meta">Generated ${escapeHtml(generatedOn)}. Match formula: ${escapeHtml(roadmap.scoreFormula)}</p>
            <p class="summary">${escapeHtml(roadmap.summary)}</p>
            <div class="stats">
              <div class="stat">
                <p class="stat-label">Current Match</p>
                <p class="stat-value">${escapeHtml(roadmap.primaryScore)}%</p>
              </div>
              <div class="stat">
                <p class="stat-label">Skills Already Matching</p>
                <p class="stat-value">${escapeHtml(roadmap.matchedCount)}</p>
              </div>
              <div class="stat">
                <p class="stat-label">Priority Gaps</p>
                <p class="stat-value">${escapeHtml(roadmap.priorityGaps.length)}</p>
              </div>
            </div>
          </section>

          <section class="grid">
            <div class="card">
              <h2>Strengths To Keep Visible</h2>
              ${renderList(roadmap.strengths)}
            </div>
            <div class="card">
              <h2>Priority Gaps To Close</h2>
              ${renderList(roadmap.priorityGaps, '#d97706')}
            </div>
          </section>

          <section class="phase-grid">
            ${phaseMarkup}
          </section>

          <section class="grid">
            <div class="card project">
              <h2>${escapeHtml(roadmap.projectSuggestion.title)}</h2>
              <p class="summary">${escapeHtml(roadmap.projectSuggestion.outcome)}</p>
              <h2 style="margin-top:18px;">Resume Updates</h2>
              ${renderList(roadmap.resumeActions)}
            </div>
            <div class="card resources">
              <h2>Interview Focus</h2>
              ${renderList(roadmap.interviewFocus)}
              <h2 style="margin-top:18px;">Recommended Learning Resources</h2>
              <ul>${resourceMarkup}</ul>
            </div>
          </section>

          <section class="card">
            <h2>Adjacent Roles To Keep In Play</h2>
            ${renderList(
              (roadmap.adjacentRoles || []).map(
                (role) => `${role.title} (${role.score}% match)`
              )
            )}
          </section>

          <p class="footer-note">
            This roadmap is designed from your current SkillSmart match profile. Save as PDF from the browser print dialog to share or revisit later.
          </p>
        </main>
      </body>
    </html>
  `

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const blobUrl = URL.createObjectURL(blob)

  const printWindow = window.open(blobUrl, '_blank', 'noopener,noreferrer')

  if (!printWindow) {
    URL.revokeObjectURL(blobUrl)
    return false
  }

  function triggerPrint() {
    printWindow.focus()
    printWindow.print()
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
  }

  printWindow.onload = triggerPrint

  // Fallback for browsers that fire onload before we attach it
  setTimeout(() => {
    if (!printWindow.closed) {
      triggerPrint()
    }
  }, 1800)

  return true
}