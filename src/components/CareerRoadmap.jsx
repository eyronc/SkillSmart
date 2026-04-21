export default function CareerRoadmap({ roadmap, onExport = null, compact = false }) {
  if (!roadmap) {
    return null
  }

  return (
    <section className="rounded-[28px] border border-white/15 bg-[linear-gradient(135deg,rgba(67,44,122,0.68),rgba(17,24,39,0.68))] p-6 sm:p-7 shadow-[0_28px_90px_rgba(17,24,39,0.35)] backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-pAccent mb-2">
            Career Roadmap
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {roadmap.primaryRole} plan
          </h3>
          <p className="mt-3 text-sm text-gray-200 max-w-3xl leading-7">
            {roadmap.summary}
          </p>
        </div>

        <div className="w-full sm:w-auto flex flex-wrap gap-3">
          <div className="min-w-[160px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-300 font-bold">Current Match</p>
            <p className="mt-2 text-3xl font-black text-white">{roadmap.primaryScore}%</p>
          </div>
          <div className="min-w-[160px] rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-300 font-bold">Formula</p>
            <p className="mt-2 text-sm font-semibold text-white leading-6">{roadmap.scoreFormula}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-6">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-pAccent mb-3">Strengths To Keep</h4>
          <ul className="space-y-2">
            {roadmap.strengths.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-100 leading-6">
                <span className="text-pAccent">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300 mb-3">Priority Gaps</h4>
          <ul className="space-y-2">
            {roadmap.priorityGaps.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-100 leading-6">
                <span className="text-amber-300">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`grid ${compact ? 'xl:grid-cols-3' : 'xl:grid-cols-3'} gap-4 mb-6`}>
        {roadmap.phases.map((phase) => (
          <div key={phase.label} className="rounded-3xl border border-pAccent/15 bg-white/10 p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] font-black text-pAccent mb-2">
              {phase.label}
            </p>
            <h4 className="text-lg font-bold text-white leading-snug mb-4">{phase.objective}</h4>
            <ul className="space-y-2.5">
              {phase.tasks.map((task) => (
                <li key={task} className="flex gap-3 text-sm text-gray-100 leading-6">
                  <span className="text-pAccent">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-5">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gray-300 mb-3">Proof Project</h4>
          <p className="text-lg font-bold text-white mb-2">{roadmap.projectSuggestion.title}</p>
          <p className="text-sm text-gray-200 leading-7">{roadmap.projectSuggestion.outcome}</p>

          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gray-300 mt-5 mb-3">Resume Updates</h4>
          <ul className="space-y-2.5">
            {roadmap.resumeActions.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-100 leading-6">
                <span className="text-pAccent">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gray-300 mb-3">Interview Focus</h4>
          <ul className="space-y-2.5 mb-5">
            {roadmap.interviewFocus.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-gray-100 leading-6">
                <span className="text-pAccent">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gray-300 mb-3">Resources</h4>
          <div className="space-y-3 mb-5">
            {roadmap.resources.map((entry) => (
              <a
                key={entry.skill}
                href={entry.resource.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <p className="text-sm font-bold text-white">{entry.skill}</p>
                <p className="text-xs text-pAccent mt-1">{entry.resource.label}</p>
              </a>
            ))}
          </div>

          {roadmap.adjacentRoles.length > 0 && (
            <>
              <h4 className="text-xs font-bold uppercase tracking-[0.24em] text-gray-300 mb-3">Adjacent Roles</h4>
              <div className="flex flex-wrap gap-2">
                {roadmap.adjacentRoles.map((role) => (
                  <span
                    key={role.title}
                    className="px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-bold text-gray-100"
                  >
                    {role.title} {role.score}%
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {onExport && (
        <div className="mt-6 flex justify-end hidden-print">
          <button
            type="button"
            onClick={onExport}
            className="px-5 py-3 rounded-2xl bg-white text-[#1E1B4B] font-black text-sm tracking-[0.16em] uppercase hover:bg-pAccent hover:text-[#1E1B4B] transition-colors"
          >
            Export Roadmap PDF
          </button>
        </div>
      )}
    </section>
  )
}