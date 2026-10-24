import { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, AlertTriangle, Zap,
  TrendingUp, Shield, BarChart2, Activity, Flag
} from "lucide-react";

const PRIORITY_HEAT = {
  critical: { bg: "bg-red-500", text: "text-white", label: "Critical", glow: "shadow-red-200 shadow-lg" },
  high: { bg: "bg-orange-400", text: "text-white", label: "High", glow: "shadow-orange-100 shadow-md" },
  medium: { bg: "bg-amber-300", text: "text-slate-800", label: "Medium", glow: "" },
  low: { bg: "bg-slate-200", text: "text-slate-600", label: "Low", glow: "" },
};

const SMPOTestWorkspace = ({ project, currentUser, onOverridePhase }) => {
  const activeSprint = project?.sprints?.find(s => s.status === "active");
  const sprintTasks = (project?.tasks || []).filter(t => t.sprint === activeSprint?.id && t.type !== "bug");
  const allBugs = (project?.tasks || []).filter(t => t.type === "bug" && t.status !== "done");
  const team = project?.team || [];

  const isSM = currentUser?.role === "scrum_master";
  const isPO = currentUser?.role === "product_owner";

  const [showOverride, setShowOverride] = useState(false);

  // Gatekeeper calculations
  const totalCoverage = sprintTasks.length > 0
    ? Math.round(sprintTasks.reduce((s, t) => s + (t.testCoverage || 0), 0) / sprintTasks.length)
    : 0;
  const criticalBugs = allBugs.filter(b => b.priority === "critical");
  const allTriaged = sprintTasks.every(t => t.testStatus && t.testStatus !== "pending");
  const visualApprovalNeeded = sprintTasks.filter(t => !t.qaVisualApproved).length;
  const deferredStories = sprintTasks.filter(t => t.testStatus === "deferred");

  const gatekeeperChecks = [
    { label: "Coverage ≥ 80%", met: totalCoverage >= 80, detail: `${totalCoverage}%` },
    { label: "Zero Critical Bugs", met: criticalBugs.length === 0, detail: criticalBugs.length > 0 ? `${criticalBugs.length} open` : "All clear" },
    { label: "All Tasks Triaged", met: allTriaged, detail: `${sprintTasks.filter(t => t.testStatus && t.testStatus !== "pending").length}/${sprintTasks.length}` },
    { label: "Visual QA Sign-offs", met: visualApprovalNeeded === 0, detail: `${sprintTasks.filter(t => t.qaVisualApproved).length}/${sprintTasks.length}` },
  ];
  const gatekeeperMet = gatekeeperChecks.every(g => g.met);
  const gatekeeperPct = Math.round(gatekeeperChecks.filter(g => g.met).length / gatekeeperChecks.length * 100);

  // Quality heatmap: per-assignee quality score
  const heatmapData = team.map(member => {
    const memberTasks = sprintTasks.filter(t => t.assignee === member.name);
    const avgCoverage = memberTasks.length > 0
      ? Math.round(memberTasks.reduce((s, t) => s + (t.testCoverage || 0), 0) / memberTasks.length)
      : 0;
    const failing = memberTasks.filter(t => t.testStatus === "fail").length;
    const passing = memberTasks.filter(t => t.testStatus === "pass").length;
    const memberBugs = allBugs.filter(b => b.assignee === member.name || memberTasks.some(t => t.id === b.parentStoryId));
    const heat = avgCoverage >= 80 && failing === 0 ? "low"
      : avgCoverage >= 60 && failing <= 1 ? "medium"
      : avgCoverage >= 40 ? "high"
      : "critical";
    return { ...member, tasks: memberTasks, avgCoverage, failing, passing, bugs: memberBugs.length, heat };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">{isSM ? "🗺" : "📡"}</span>
            {isSM ? "Quality Control Tower" : "Risk & Readiness Monitor"}
            <span className="text-sm font-normal text-slate-500 ml-1">— {isSM ? "Scrum Master" : "Product Owner"} Workspace</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isSM ? "Monitor quality health, manage blockers, track triage completion." : "Track feature readiness, deferred items, and delivery risk."}
          </p>
        </div>
        {isSM && !gatekeeperMet && (
          <button onClick={() => setShowOverride(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition-colors">
            <Zap className="w-4 h-4" /> Phase Override
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT col: Heatmap + Bug list */}
        <div className="col-span-2 space-y-4">

          {/* Quality Heatmap */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-sm">Quality Heatmap</h3>
              <span className="text-xs text-slate-400 ml-2">Red = fragile code area</span>
            </div>
            {/* Grid heatmap per member */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {heatmapData.map(member => {
                const h = PRIORITY_HEAT[member.heat] || PRIORITY_HEAT.low;
                return (
                  <div key={member.id} className={`rounded-xl p-4 ${h.bg} ${h.glow} transition-all`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${h.text}`}>{member.name}</p>
                        <p className={`text-xs ${h.text} opacity-75 capitalize`}>{member.role?.replace("_", " ")}</p>
                      </div>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 ${h.text}`}>{h.label}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {[
                        { label: "Coverage", value: `${member.avgCoverage}%` },
                        { label: "Failing", value: member.failing },
                        { label: "Bugs", value: member.bugs },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/15 rounded-lg p-2 text-center">
                          <p className={`text-base font-black ${h.text}`}>{value}</p>
                          <p className={`text-xs ${h.text} opacity-75`}>{label}</p>
                        </div>
                      ))}
                    </div>
                    {member.tasks.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {member.tasks.map(t => (
                          <div key={t.id}
                            title={`${t.title} — ${t.testStatus || "pending"}`}
                            className="flex-1 h-2 rounded-sm opacity-80"
                            style={{ background: t.testStatus === "pass" ? "#22c55e" : t.testStatus === "fail" ? "#ef4444" : t.testStatus === "deferred" ? "#f59e0b" : "#94a3b8" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {heatmapData.length === 0 && (
                <div className="col-span-2 text-center py-8 text-slate-400 text-sm">No team members found.</div>
              )}
            </div>
          </div>

          {/* Bug Registry */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-slate-900 text-sm">Open Bug Registry</h3>
              {criticalBugs.length > 0 && (
                <span className="ml-auto text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {criticalBugs.length} Critical
                </span>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {allBugs.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-700">No open bugs — clean build!</p>
                </div>
              ) : (
                allBugs.map(bug => {
                  const pr = PRIORITY_HEAT[bug.priority] || PRIORITY_HEAT.low;
                  return (
                    <div key={bug.id} className={`px-5 py-3.5 flex items-start gap-3 ${bug.priority === "critical" ? "bg-red-50" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${pr.bg}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{bug.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold border ${pr.bg === "bg-red-500" ? "bg-red-100 text-red-700 border-red-200" : pr.bg === "bg-orange-400" ? "bg-orange-100 text-orange-700 border-orange-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                            {bug.priority}
                          </span>
                          {bug.parentStoryId && <span className="text-xs text-slate-400">linked to story</span>}
                          {bug.deferred && <span className="text-xs text-amber-600 font-medium">⏭ deferred</span>}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${bug.status === "done" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{bug.status}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Deferred stories */}
          {deferredStories.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-amber-100 flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-amber-900 text-sm">Deferred Stories (Split & Spin)</h3>
              </div>
              <div className="divide-y divide-amber-100">
                {deferredStories.map(t => (
                  <div key={t.id} className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 flex-1">{t.title}</p>
                      <span className="text-xs text-amber-700 font-medium">Partially Done</span>
                    </div>
                    {t.deferNote && <p className="text-xs text-amber-700 mt-0.5 italic">"{t.deferNote}"</p>}
                    {t.poSignOff && <p className="text-xs text-emerald-700 mt-0.5">✓ PO Sign-off received</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Gatekeeper + Stats */}
        <div className="space-y-4">
          {/* Gatekeeper */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Testing → Review Gate</p>
              <span className={`text-xs font-bold ${gatekeeperMet ? "text-emerald-600" : "text-slate-400"}`}>{gatekeeperPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${gatekeeperPct}%`, background: gatekeeperMet ? "#22c55e" : "linear-gradient(90deg,#7c3aed,#2563eb)" }} />
            </div>
            <div className="space-y-3">
              {gatekeeperChecks.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${g.met ? "bg-emerald-100" : "bg-red-50"}`}>
                    {g.met ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{g.label}</p>
                    <p className={`text-xs ${g.met ? "text-slate-400" : "text-red-500 font-medium"}`}>{g.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold border ${gatekeeperMet ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
              {gatekeeperMet ? "✓ Advance to Review" : "Gate locked"}
            </div>
          </div>

          {/* Sprint quality stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quality Summary</p>
            {[
              { label: "Avg Coverage", value: `${totalCoverage}%`, ok: totalCoverage >= 80 },
              { label: "Passed Stories", value: `${sprintTasks.filter(t => t.testStatus === "pass").length}/${sprintTasks.length}`, ok: sprintTasks.every(t => t.testStatus === "pass") },
              { label: "Failed Stories", value: sprintTasks.filter(t => t.testStatus === "fail").length, ok: sprintTasks.filter(t => t.testStatus === "fail").length === 0 },
              { label: "Critical Bugs", value: criticalBugs.length, ok: criticalBugs.length === 0 },
              { label: "Deferred Stories", value: deferredStories.length, ok: deferredStories.length === 0 },
              { label: "Visual Sign-offs", value: `${sprintTasks.filter(t => t.qaVisualApproved).length}/${sprintTasks.length}`, ok: visualApprovalNeeded === 0 },
            ].map(({ label, value, ok }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
                <span className={`text-xs font-bold ${ok ? "text-slate-800" : "text-red-600"}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* PO: Delivery risk meter */}
          {isPO && (
            <div className={`rounded-xl p-4 border text-center ${gatekeeperMet ? "bg-emerald-50 border-emerald-200" : criticalBugs.length > 0 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
              <p className={`text-3xl font-black mb-1 ${gatekeeperMet ? "text-emerald-700" : criticalBugs.length > 0 ? "text-red-600" : "text-amber-700"}`}>
                {gatekeeperMet ? "✅" : criticalBugs.length > 0 ? "🚫" : "⚠️"}
              </p>
              <p className="text-sm font-bold text-slate-700">
                {gatekeeperMet ? "Ready for Review" : criticalBugs.length > 0 ? "Delivery at Risk" : "Needs Attention"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {gatekeeperMet ? "All quality gates met" : criticalBugs.length > 0 ? `${criticalBugs.length} critical bug${criticalBugs.length > 1 ? "s" : ""} blocking` : "Some gates not yet met"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Override modal */}
      {showOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">Phase Override</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Force-advance to the Review phase despite unmet quality gates. Document your reasoning carefully.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowOverride(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { onOverridePhase(); setShowOverride(false); }} className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600">Override Gate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMPOTestWorkspace;
