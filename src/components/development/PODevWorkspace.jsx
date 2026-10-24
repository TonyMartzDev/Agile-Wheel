import {
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart2,
  Layers,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const PODevWorkspace = ({ project }) => {
  const activeSprint = project?.sprints?.find((s) => s.status === "active");
  const sprintTasks = (project?.tasks || []).filter(
    (t) => t.sprint === activeSprint?.id,
  );
  const epics = project?.prd?.epics || [];

  // Feature readiness: % of sprint stories with all AC met and at least one validated snippet
  const readyStories = sprintTasks.filter(
    (t) =>
      (t.acceptanceCriteria || []).length > 0 &&
      (t.acceptanceCriteria || []).every((ac) => ac.completed) &&
      (t.snippets || []).some((s) => s.status === "validated"),
  );
  const readinessPct =
    sprintTasks.length > 0
      ? Math.round((readyStories.length / sprintTasks.length) * 100)
      : 0;

  const doneStories = sprintTasks.filter((t) => t.status === "done");
  const inProgressStories = sprintTasks.filter(
    (t) => t.tddStatus === "green" && t.status !== "done",
  );
  const pendingStories = sprintTasks.filter(
    (t) => !t.tddStatus || t.tddStatus === "red",
  );

  // PRD section readiness: map epic titles to story completion
  const epicProgress = epics.map((epic) => {
    const epicTasks = sprintTasks.filter(
      (t) => t.epicId === epic.id || t.epic === epic.title,
    );
    const done = epicTasks.filter((t) => t.status === "done").length;
    return { ...epic, total: epicTasks.length, done };
  });

  // Burn-up data: story points done per sprint
  const allSprints = project?.sprints || [];
  const allTasks = project?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">📊</span> The Value Tracker
          <span className="text-sm font-normal text-slate-500 ml-1">
            — Product Owner Workspace
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Track delivery progress and validate that what's being built matches
          the vision.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Feature Readiness + Epic Progress */}
        <div className="col-span-2 space-y-4">
          {/* Feature Readiness Meter */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Feature Readiness Meter
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stories with all AC met + at least one validated snippet
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-4xl font-black"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#2563eb)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {readinessPct}%
                </p>
                <p className="text-xs text-slate-400">
                  {readyStories.length} of {sprintTasks.length} ready
                </p>
              </div>
            </div>
            {/* Meter bar */}
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${readinessPct}%`,
                  background:
                    readinessPct >= 80
                      ? "#22c55e"
                      : readinessPct >= 50
                        ? "linear-gradient(90deg,#7c3aed,#2563eb)"
                        : "#f59e0b",
                }}
              />
            </div>
            {/* Story breakdown grid */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                {
                  label: "Done",
                  items: doneStories,
                  color: "bg-green-400",
                  textColor: "text-green-700",
                  bg: "bg-green-50 border-green-200",
                },
                {
                  label: "Validated",
                  items: inProgressStories,
                  color: "bg-blue-400",
                  textColor: "text-blue-700",
                  bg: "bg-blue-50 border-blue-200",
                },
                {
                  label: "In Progress",
                  items: pendingStories,
                  color: "bg-amber-400",
                  textColor: "text-amber-700",
                  bg: "bg-amber-50 border-amber-200",
                },
              ].map(({ label, items, color, textColor, bg }) => (
                <div key={label} className={`rounded-xl border p-3 ${bg}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${color} mb-2`} />
                  <p className={`text-2xl font-black ${textColor}`}>
                    {items.length}
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Story status table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Sprint Story Status
              </h3>
              <span className="text-xs text-slate-400 ml-auto">
                Technical details hidden for PO view
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {sprintTasks.length === 0 ? (
                <p className="p-5 text-sm text-slate-400 text-center">
                  No stories in the active sprint.
                </p>
              ) : (
                sprintTasks.map((task) => {
                  const snippetCount = (task.snippets || []).length;
                  const validatedCount = (task.snippets || []).filter(
                    (s) => s.status === "validated",
                  ).length;
                  const acTotal = (task.acceptanceCriteria || []).length;
                  const acDone = (task.acceptanceCriteria || []).filter(
                    (a) => a.completed,
                  ).length;
                  const completeness =
                    acTotal > 0 ? Math.round((acDone / acTotal) * 100) : 0;

                  return (
                    <div
                      key={task.id}
                      className="px-5 py-3 flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {task.assignee || "Unassigned"}
                        </p>
                      </div>
                      {/* AC completeness */}
                      <div className="text-center w-20">
                        <p className="text-xs text-slate-400">AC</p>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-violet-400 rounded-full"
                            style={{ width: `${completeness}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {acDone}/{acTotal}
                        </p>
                      </div>
                      {/* Snippet summary */}
                      <div className="text-center w-20">
                        <p className="text-xs text-slate-400">Snippets</p>
                        <p className="text-sm font-bold text-slate-700 mt-1">
                          {validatedCount}
                          <span className="text-slate-400 font-normal">
                            /{snippetCount}
                          </span>
                        </p>
                        <p className="text-xs text-slate-400">validated</p>
                      </div>
                      {/* Status pill */}
                      <div className="w-24 text-right">
                        {task.status === "done" ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                            Delivered
                          </span>
                        ) : task.tddStatus === "green" ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                            Tests ✓
                          </span>
                        ) : task.blocked ? (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                            At Risk
                          </span>
                        ) : (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-semibold">
                            Building
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Epic Progress - PRD linking */}
          {epicProgress.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  PRD Epic Progress
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {epicProgress.map((epic, i) => {
                  const pct =
                    epic.total > 0
                      ? Math.round((epic.done / epic.total) * 100)
                      : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {epic.title}
                        </p>
                        <span
                          className={`text-xs font-bold ${pct === 100 ? "text-green-600" : "text-violet-600"}`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background:
                              pct === 100
                                ? "#22c55e"
                                : "linear-gradient(90deg,#7c3aed,#2563eb)",
                          }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {epic.done} of {epic.total} stories complete
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Burn-up + Health summary */}
        <div className="space-y-4">
          {/* Sprint Burn-up */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Sprint Burn-up
            </p>
            <div className="space-y-2">
              {allSprints.map((sprint) => {
                const sTotal = allTasks.filter(
                  (t) => t.sprint === sprint.id,
                ).length;
                const sDone = allTasks.filter(
                  (t) => t.sprint === sprint.id && t.status === "done",
                ).length;
                const pct = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;
                return (
                  <div key={sprint.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500">
                        {sprint.name}
                      </span>
                      <span
                        className={`text-xs font-bold ${sprint.status === "completed" ? "text-green-600" : sprint.status === "active" ? "text-violet-600" : "text-slate-400"}`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background:
                            sprint.status === "completed"
                              ? "#22c55e"
                              : "linear-gradient(90deg,#7c3aed,#2563eb)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Health summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Technical Health
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Stories on track",
                  value: `${sprintTasks.filter((t) => !t.blocked).length}/${sprintTasks.length}`,
                  ok: true,
                },
                {
                  label: "Blocked stories",
                  value: sprintTasks.filter((t) => t.blocked).length,
                  ok: sprintTasks.filter((t) => t.blocked).length === 0,
                },
                {
                  label: "Peer reviewed",
                  value: `${sprintTasks.filter((t) => t.peerApproved).length}/${sprintTasks.length}`,
                  ok:
                    sprintTasks.filter((t) => t.peerApproved).length >=
                    sprintTasks.length * 0.5,
                },
                { label: "CI status", value: "Passing", ok: true },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`}
                    />
                    <span className="text-xs text-slate-600">{label}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${ok ? "text-slate-800" : "text-red-600"}`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Readiness badge */}
          <div
            className={`rounded-xl p-4 border text-center ${readinessPct >= 80 ? "bg-green-50 border-green-200" : readinessPct >= 50 ? "bg-violet-50 border-violet-200" : "bg-amber-50 border-amber-200"}`}
          >
            <p
              className={`text-2xl font-black mb-1 ${readinessPct >= 80 ? "text-green-700" : readinessPct >= 50 ? "text-violet-700" : "text-amber-700"}`}
            >
              {readinessPct}%
            </p>
            <p className="text-xs font-semibold text-slate-600">
              Feature Readiness
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {readinessPct >= 80
                ? "Delivery on track 🚀"
                : readinessPct >= 50
                  ? "Good progress"
                  : "Needs attention"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PODevWorkspace;
