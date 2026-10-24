import { useState } from "react";
import {
  Radio,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Flag,
  Zap,
  ChevronRight,
  Activity,
} from "lucide-react";

const SMDevWorkspace = ({ project, onOverridePhase }) => {
  const activeSprint = project?.sprints?.find((s) => s.status === "active");
  const sprintTasks = (project?.tasks || []).filter(
    (t) => t.sprint === activeSprint?.id,
  );
  const team = project?.team || [];

  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  // Gatekeeper calculations
  const allAssigned = sprintTasks.every((t) => t.assignee);
  const hasCodePresence = sprintTasks.every(
    (t) => (t.snippets || []).length > 0,
  );
  const peerApprovedCount = sprintTasks.filter((t) => t.peerApproved).length;
  const peerApprovalPct =
    sprintTasks.length > 0
      ? Math.round((peerApprovedCount / sprintTasks.length) * 100)
      : 0;
  const peerMet = peerApprovalPct >= 50;
  const gatekeeperMet = allAssigned && hasCodePresence && peerMet;

  const gatekeeperChecks = [
    {
      label: "All Stories Assigned",
      met: allAssigned,
      detail: `${sprintTasks.filter((t) => t.assignee).length} / ${sprintTasks.length}`,
    },
    {
      label: "Code Presence (≥1 snippet each)",
      met: hasCodePresence,
      detail: `${sprintTasks.filter((t) => (t.snippets || []).length > 0).length} / ${sprintTasks.length}`,
    },
    { label: "50% Peer Approved", met: peerMet, detail: `${peerApprovalPct}%` },
  ];

  const gatekeeperProgress = Math.round(
    (gatekeeperChecks.filter((g) => g.met).length / gatekeeperChecks.length) *
      100,
  );

  // Impediment radar: blocked or no snippet after sprint started
  const blockedTasks = sprintTasks.filter((t) => t.blocked);
  const staleTasksNoSnippet = sprintTasks.filter(
    (t) => (t.snippets || []).length === 0 && !t.blocked,
  );

  // Team pulse: group tasks by assignee
  const teamPulse = team.map((member) => {
    const memberTasks = sprintTasks.filter((t) => t.assignee === member.name);
    const snippetCount = memberTasks.reduce(
      (s, t) => s + (t.snippets || []).length,
      0,
    );
    const blocked = memberTasks.some((t) => t.blocked);
    const allGreen =
      memberTasks.length > 0 &&
      memberTasks.every((t) => t.tddStatus === "green");
    return { ...member, tasks: memberTasks, snippetCount, blocked, allGreen };
  });

  // TDD breakdown
  const tddCounts = {
    green: sprintTasks.filter((t) => t.tddStatus === "green").length,
    yellow: sprintTasks.filter((t) => t.tddStatus === "yellow").length,
    red: sprintTasks.filter((t) => !t.tddStatus || t.tddStatus === "red")
      .length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🗼</span> The Control Tower
            <span className="text-sm font-normal text-slate-500 ml-1">
              — Scrum Master Workspace
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor flow, clear blockers, track the team's velocity.
          </p>
        </div>
        {!gatekeeperMet && (
          <button
            onClick={() => setShowOverrideConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-700 text-sm font-bold rounded-xl hover:bg-amber-100 transition-colors"
          >
            <Zap className="w-4 h-4" /> Phase Override
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Impediment Radar + Blockers */}
        <div className="col-span-2 space-y-4">
          {/* Impediment Radar */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Impediment Radar
              </h3>
              {blockedTasks.length > 0 && (
                <span className="ml-auto flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  <AlertTriangle className="w-3 h-3" /> {blockedTasks.length}{" "}
                  Blocked
                </span>
              )}
            </div>
            <div className="p-4 space-y-2">
              {blockedTasks.length === 0 && staleTasksNoSnippet.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                  <p className="text-sm font-medium text-green-700">
                    All clear — no impediments detected
                  </p>
                </div>
              ) : (
                <>
                  {blockedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-red-800 truncate">
                          {t.title}
                        </p>
                        <p className="text-xs text-red-600">
                          {t.assignee || "Unassigned"} · Flagged as blocked
                        </p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                        Clear Path
                      </span>
                    </div>
                  ))}
                  {staleTasksNoSnippet.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl"
                    >
                      <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-900 truncate">
                          {t.title}
                        </p>
                        <p className="text-xs text-amber-600">
                          {t.assignee || "Unassigned"} · No code pushed yet
                        </p>
                      </div>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                        Nudge Dev
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Team Pulse */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-slate-900 text-sm">Team Pulse</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {teamPulse.length === 0 ? (
                <p className="p-4 text-sm text-slate-400 text-center">
                  No team members found.
                </p>
              ) : (
                teamPulse.map((member) => (
                  <div
                    key={member.id}
                    className={`px-5 py-3.5 flex items-center gap-3 ${member.blocked ? "bg-red-50" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {member.name}
                        </p>
                        <span className="text-xs text-slate-400 capitalize">
                          {member.role?.replace("_", " ")}
                        </span>
                        {member.blocked && (
                          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">
                            🔴 Blocked
                          </span>
                        )}
                        {member.allGreen && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                            ✓ All Green
                          </span>
                        )}
                      </div>
                      {member.tasks.length > 0 ? (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {member.tasks.length} task
                          {member.tasks.length > 1 ? "s" : ""} ·{" "}
                          {member.snippetCount} snippet
                          {member.snippetCount !== 1 ? "s" : ""} pushed
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          No tasks in sprint
                        </p>
                      )}
                    </div>
                    {/* Mini TDD bar */}
                    <div className="flex gap-1">
                      {member.tasks.map((t) => (
                        <div
                          key={t.id}
                          className="w-3 h-6 rounded-sm"
                          title={`${t.title} — ${t.tddStatus || "red"}`}
                          style={{
                            background:
                              t.tddStatus === "green"
                                ? "#22c55e"
                                : t.tddStatus === "yellow"
                                  ? "#f59e0b"
                                  : "#ef4444",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TDD Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-violet-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                TDD Health Overview
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Failing",
                  count: tddCounts.red,
                  color: "#ef4444",
                  bg: "bg-red-50 border-red-200",
                },
                {
                  label: "In Progress",
                  count: tddCounts.yellow,
                  color: "#f59e0b",
                  bg: "bg-amber-50 border-amber-200",
                },
                {
                  label: "All Passing",
                  count: tddCounts.green,
                  color: "#22c55e",
                  bg: "bg-green-50 border-green-200",
                },
              ].map(({ label, count, color, bg }) => (
                <div
                  key={label}
                  className={`rounded-xl border p-4 text-center ${bg}`}
                >
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ background: color }}
                  />
                  <p className="text-2xl font-black" style={{ color }}>
                    {count}
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {/* Stacked bar */}
            <div className="mt-4 h-3 rounded-full overflow-hidden flex">
              {sprintTasks.length > 0 && (
                <>
                  <div
                    className="h-full bg-red-400 transition-all"
                    style={{
                      width: `${(tddCounts.red / sprintTasks.length) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all"
                    style={{
                      width: `${(tddCounts.yellow / sprintTasks.length) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-green-400 transition-all"
                    style={{
                      width: `${(tddCounts.green / sprintTasks.length) * 100}%`,
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Gatekeeper */}
        <div className="space-y-4">
          {/* CI Badge */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              CI Build Status
            </p>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-green-800">
                  Build: Passing
                </p>
                <p className="text-xs text-green-600">main · 3 min ago</p>
              </div>
            </div>
          </div>

          {/* Gatekeeper */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Dev → Testing Gate
              </p>
              <span
                className={`text-xs font-bold ${gatekeeperMet ? "text-green-600" : "text-slate-400"}`}
              >
                {gatekeeperProgress}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${gatekeeperProgress}%`,
                  background: gatekeeperMet
                    ? "#22c55e"
                    : "linear-gradient(90deg,#7c3aed,#2563eb)",
                }}
              />
            </div>
            <div className="space-y-3">
              {gatekeeperChecks.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${g.met ? "bg-green-100" : "bg-slate-100"}`}
                  >
                    {g.met ? (
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      {g.label}
                    </p>
                    <p className="text-xs text-slate-400">{g.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`mt-4 p-3 rounded-xl text-center text-sm font-bold border ${gatekeeperMet ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}
            >
              {gatekeeperMet ? "✓ Advance to Testing" : "Gate locked"}
            </div>
          </div>

          {/* Sprint stats */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Sprint Stats
            </p>
            {[
              { label: "Total Stories", value: sprintTasks.length },
              {
                label: "Completed",
                value: sprintTasks.filter((t) => t.status === "done").length,
              },
              { label: "Blocked", value: blockedTasks.length },
              {
                label: "Total Snippets",
                value: sprintTasks.reduce(
                  (s, t) => s + (t.snippets || []).length,
                  0,
                ),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{label}</span>
                <span className="text-sm font-bold text-slate-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Override confirm modal */}
      {showOverrideConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
              Phase Override
            </h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              This will force-advance the team to the Testing phase even though
              the gatekeeper is not fully met. Use only in exceptional
              circumstances.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowOverrideConfirm(false)}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onOverridePhase();
                  setShowOverrideConfirm(false);
                }}
                className="flex-1 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600"
              >
                Override Gate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SMDevWorkspace;
