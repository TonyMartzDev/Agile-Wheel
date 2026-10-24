import { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  Flag,
  Image,
  Play,
} from "lucide-react";

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const QAChallengeModal = ({ task, onClose, onSubmit }) => {
  const [scenario, setScenario] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("high");

  const handleSubmit = () => {
    if (!scenario.trim()) return;
    onSubmit(task.id, { scenario, description, priority, sentBy: "QA" });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Send QA Challenge</h3>
            <p className="text-xs text-slate-500">
              {task.title} — force dev to handle this failing scenario
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Failing Scenario (becomes test name)
            </label>
            <input
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder='e.g. "User enters null password should not crash"'
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the edge case, reproduction steps, or expected behavior..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!scenario.trim()}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition-colors"
          >
            ⚡ Send to IDE
          </button>
        </div>
      </div>
    </div>
  );
};

const BugPromoteModal = ({ task, failedRun, onClose, onSubmit }) => {
  const [title, setTitle] = useState(`Bug: ${task.title}`);
  const [description, setDescription] = useState(failedRun?.failedTest || "");
  const [priority, setPriority] = useState("critical");

  const handleSubmit = () => {
    onSubmit(task.id, {
      title,
      description,
      priority,
      stackTrace: failedRun?.stackTrace,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Convert to Bug Story</h3>
            <p className="text-xs text-slate-500">
              Adds to backlog with parent link
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Bug Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="critical">
                Critical — blocks Testing → Review gate
              </option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
          {failedRun?.stackTrace && (
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 mb-1">
                Attached Stack Trace
              </p>
              <pre className="text-xs font-mono text-red-700 overflow-x-auto whitespace-pre-wrap max-h-24">
                {failedRun.stackTrace}
              </pre>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors"
          >
            Create Bug Story
          </button>
        </div>
      </div>
    </div>
  );
};

const DeferModal = ({ task, onClose, onSubmit }) => {
  const [note, setNote] = useState("");
  const [poSignOff, setPoSignOff] = useState(false);
  const isCritical =
    task.priority === "critical" || task.priority === "blocker";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Defer to Next Sprint</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Split & Spin — story marked Partially Done, bug moved to Backlog
          </p>
        </div>
        <div className="p-6 space-y-4">
          {isCritical && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">
                  Cannot defer Critical/Blocker bugs
                </p>
                <p className="text-xs text-red-600">
                  The gate remains locked until this is resolved or downgraded.
                </p>
              </div>
            </div>
          )}
          {!isCritical && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Deferral Reason
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Why are we deferring? What's the plan for next sprint?"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors">
                <input
                  type="checkbox"
                  checked={poSignOff}
                  onChange={(e) => setPoSignOff(e.target.checked)}
                  className="w-4 h-4 accent-violet-600"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Product Owner Sign-off
                  </p>
                  <p className="text-xs text-slate-500">
                    Business approves launching with this known issue
                  </p>
                </div>
              </label>
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-900"
          >
            Cancel
          </button>
          {!isCritical && (
            <button
              onClick={() => {
                onSubmit(task.id, note, poSignOff);
                onClose();
              }}
              disabled={!note.trim() || !poSignOff}
              className="px-5 py-2 text-sm font-semibold text-white rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 transition-colors"
            >
              Defer Story
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StoryQACard = ({
  task,
  isPO,
  onSendChallenge,
  onPromoteBug,
  onVisualApprove,
  onDefer,
  onUpdateStatus,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showDefer, setShowDefer] = useState(false);

  const latestRun = (task.testRuns || []).slice(-1)[0];
  const coverage = task.testCoverage || 0;
  const testStatus = task.testStatus || "pending";

  const statusDot =
    testStatus === "pass"
      ? "bg-emerald-500"
      : testStatus === "fail"
        ? "bg-red-500"
        : testStatus === "deferred"
          ? "bg-amber-400"
          : "bg-slate-300";

  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${testStatus === "fail" ? "border-red-200" : testStatus === "pass" ? "border-emerald-200" : testStatus === "deferred" ? "border-amber-200" : "border-slate-200"}`}
    >
      <div
        className="px-5 py-4 flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot}`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
            {task.assignee && (
              <span className="text-xs text-slate-400">by {task.assignee}</span>
            )}
            {task.qaVisualApproved && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                👁 Visual OK
              </span>
            )}
            {task.deferred && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                ⏭ Deferred
              </span>
            )}
            {testStatus === "pass" && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                ✓ Passed
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400">{coverage}% coverage</span>
            {latestRun && (
              <span className="text-xs text-slate-400">
                {latestRun.passed}/{latestRun.total} tests
              </span>
            )}
            {(task.qaChallenges || []).length > 0 && (
              <span className="text-xs text-orange-600 font-medium">
                {(task.qaChallenges || []).length} challenge
                {(task.qaChallenges || []).length > 1 ? "s" : ""} sent
              </span>
            )}
          </div>
        </div>
        {/* Coverage bar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${coverage}%`,
                background:
                  coverage >= 80
                    ? "#22c55e"
                    : coverage >= 50
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            />
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {/* Evidence Gallery (screenshot/video placeholder) */}
          {latestRun?.stackTrace && (
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" /> Evidence Gallery
              </p>
              <div className="flex gap-2 flex-wrap">
                <div className="w-24 h-16 bg-slate-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors border border-slate-300 text-xs text-slate-500">
                  📸 Screenshot
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-xs font-semibold text-red-600 mb-1">
                    Stack Trace
                  </p>
                  <pre className="text-xs font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-20">
                    {latestRun.stackTrace}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Existing QA Challenges */}
          {(task.qaChallenges || []).length > 0 && (
            <div className="p-4 border-b border-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Sent Challenges
              </p>
              <div className="space-y-2">
                {task.qaChallenges.map((c) => (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border ${PRIORITY_COLORS[c.priority] || PRIORITY_COLORS.medium}`}
                  >
                    <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                    <p className="text-xs font-medium flex-1">{c.scenario}</p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${c.status === "open" ? "bg-white/60" : "bg-white/80 line-through"}`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowChallenge(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" /> QA Challenge
            </button>
            <button
              onClick={() => onVisualApprove(task.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${task.qaVisualApproved ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
            >
              <Eye className="w-3.5 h-3.5" />{" "}
              {task.qaVisualApproved ? "Visual Approved ✓" : "Visual Approval"}
            </button>
            {testStatus === "fail" && (
              <button
                onClick={() => setShowBugModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Bug-to-Story
              </button>
            )}
            {testStatus !== "pass" && (
              <button
                onClick={() => setShowDefer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" /> Defer to Next Sprint
              </button>
            )}
            {["pass", "fail"].map((s) => (
              <button
                key={s}
                onClick={() => onUpdateStatus(task.id, { testStatus: s })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${testStatus === s ? (s === "pass" ? "bg-emerald-600 text-white border-emerald-600" : "bg-red-600 text-white border-red-600") : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
              >
                {s === "pass" ? "✓ Mark Pass" : "✗ Mark Fail"}
              </button>
            ))}
          </div>
        </div>
      )}

      {showChallenge && (
        <QAChallengeModal
          task={task}
          onClose={() => setShowChallenge(false)}
          onSubmit={onSendChallenge}
        />
      )}
      {showBugModal && (
        <BugPromoteModal
          task={task}
          failedRun={latestRun}
          onClose={() => setShowBugModal(false)}
          onSubmit={onPromoteBug}
        />
      )}
      {showDefer && (
        <DeferModal
          task={task}
          isPO={isPO}
          onClose={() => setShowDefer(false)}
          onSubmit={onDefer}
        />
      )}
    </div>
  );
};

const QATestWorkspace = ({
  project,
  currentUser,
  onSendChallenge,
  onPromoteBug,
  onVisualApprove,
  onDefer,
  onUpdateTask,
}) => {
  const activeSprint = project?.sprints?.find((s) => s.status === "active");
  const sprintTasks = (project?.tasks || []).filter(
    (t) => t.sprint === activeSprint?.id && t.type !== "bug",
  );
  const isPO = currentUser?.role === "product_owner";

  const [filter, setFilter] = useState("all");

  const filtered =
    filter === "all"
      ? sprintTasks
      : filter === "fail"
        ? sprintTasks.filter((t) => t.testStatus === "fail")
        : filter === "pass"
          ? sprintTasks.filter((t) => t.testStatus === "pass")
          : filter === "pending"
            ? sprintTasks.filter(
                (t) => !t.testStatus || t.testStatus === "pending",
              )
            : filter === "deferred"
              ? sprintTasks.filter((t) => t.testStatus === "deferred")
              : sprintTasks;

  const totalCoverage =
    sprintTasks.length > 0
      ? Math.round(
          sprintTasks.reduce((s, t) => s + (t.testCoverage || 0), 0) /
            sprintTasks.length,
        )
      : 0;
  const criticalBugs = (project?.tasks || []).filter(
    (t) => t.type === "bug" && t.priority === "critical" && t.status !== "done",
  ).length;
  const allTriaged = sprintTasks.every(
    (t) => t.testStatus && t.testStatus !== "pending",
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🔬</span> Test Suite Architect
          <span className="text-sm font-normal text-slate-500 ml-1">
            — QA Engineer Workspace
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Edge cases, integration, UAT. Send challenges. Approve visuals. Manage
          deferrals.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Avg Coverage",
            value: `${totalCoverage}%`,
            color: totalCoverage >= 80 ? "text-emerald-600" : "text-amber-600",
            note: "target 80%",
          },
          {
            label: "Passed",
            value: sprintTasks.filter((t) => t.testStatus === "pass").length,
            color: "text-emerald-600",
            note: "stories",
          },
          {
            label: "Critical Bugs",
            value: criticalBugs,
            color: criticalBugs > 0 ? "text-red-600" : "text-emerald-600",
            note: criticalBugs > 0 ? "gate locked" : "all clear",
          },
          {
            label: "All Triaged",
            value: allTriaged ? "Yes" : "No",
            color: allTriaged ? "text-emerald-600" : "text-amber-600",
            note: "pass/fail/defer",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-xl p-4 text-center"
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">
              {s.label}
            </p>
            <p className="text-xs text-slate-400">{s.note}</p>
          </div>
        ))}
      </div>

      {/* Critical bug banner */}
      {criticalBugs > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-900">
              Gate Locked — {criticalBugs} Critical Bug
              {criticalBugs > 1 ? "s" : ""} Open
            </p>
            <p className="text-xs text-red-700">
              All Critical bugs must be resolved before advancing to the Review
              phase.
            </p>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {[
          { key: "all", label: "All" },
          { key: "pending", label: "Pending" },
          { key: "fail", label: "Failing" },
          { key: "pass", label: "Passing" },
          { key: "deferred", label: "Deferred" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${filter === f.key ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} stories
        </span>
      </div>

      {/* Story cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No stories match this filter.</p>
          </div>
        ) : (
          filtered.map((task) => (
            <StoryQACard
              key={task.id}
              task={task}
              currentUser={currentUser}
              isPO={isPO}
              onSendChallenge={onSendChallenge}
              onPromoteBug={onPromoteBug}
              onVisualApprove={(taskId) =>
                onVisualApprove(taskId, currentUser?.name)
              }
              onDefer={onDefer}
              onUpdateStatus={(taskId, fields) => onUpdateTask(taskId, fields)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QATestWorkspace;
