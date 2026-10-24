import { useState } from "react";
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Upload,
  Code2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  Zap,
  GitBranch,
  RefreshCw,
} from "lucide-react";

const BOILERPLATE = (ac) => `describe('${ac}', () => {
  it('${ac}', () => {
    // TODO: implement test
    expect(true).toBe(false);
  });
});`;

const TestRunModal = ({ task, onClose, onSubmit }) => {
  const [passed, setPassed] = useState("");
  const [total, setTotal] = useState("");
  const [failedTest, setFailedTest] = useState("");
  const [stackTrace, setStackTrace] = useState("");
  const [env, setEnv] = useState("local");

  const handleSubmit = () => {
    if (!total) return;
    onSubmit({
      passed: Number(passed) || 0,
      total: Number(total),
      failedTest,
      stackTrace,
      env,
      storyTitle: task.title,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Sync IDE Test Results</h3>
            <p className="text-xs text-slate-500">{task.title}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tests Passing
              </label>
              <input
                value={passed}
                onChange={(e) => setPassed(e.target.value)}
                type="number"
                min="0"
                placeholder="3"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Total Tests
              </label>
              <input
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                type="number"
                min="1"
                placeholder="5"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Environment
            </label>
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="local">Local</option>
              <option value="ci">CI Pipeline</option>
              <option value="staging">Staging</option>
            </select>
          </div>
          {passed !== total && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Failed Test Name
                </label>
                <input
                  value={failedTest}
                  onChange={(e) => setFailedTest(e.target.value)}
                  placeholder="e.g. User can reset password"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Stack Trace (optional)
                </label>
                <textarea
                  value={stackTrace}
                  onChange={(e) => setStackTrace(e.target.value)}
                  rows={4}
                  placeholder="Paste error output here..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>
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
          <button
            onClick={handleSubmit}
            disabled={!total}
            className="px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#059669,#2563eb)" }}
          >
            Push Results
          </button>
        </div>
      </div>
    </div>
  );
};

const TestTaskCard = ({ task, onSync, onPromoteBug, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const [showBoilerplate, setShowBoilerplate] = useState(false);
  const [showSync, setShowSync] = useState(false);

  const latestRun = (task.testRuns || []).slice(-1)[0];
  const coverage = task.testCoverage || 0;
  const testStatus = task.testStatus || "pending";
  const challenges = task.qaChallenges || [];
  const openChallenges = challenges.filter((c) => c.status === "open");

  const statusConfig = {
    pass: {
      label: "Pass",
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      dot: "bg-emerald-500",
    },
    fail: {
      label: "Fail",
      color: "text-red-700",
      bg: "bg-red-50 border-red-200",
      dot: "bg-red-500",
    },
    deferred: {
      label: "Deferred",
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      dot: "bg-amber-400",
    },
    pending: {
      label: "Pending",
      color: "text-slate-600",
      bg: "bg-slate-50 border-slate-200",
      dot: "bg-slate-400",
    },
  };
  const sc = statusConfig[testStatus] || statusConfig.pending;

  return (
    <div
      className={`bg-white border-2 rounded-xl overflow-hidden transition-all ${testStatus === "fail" ? "border-red-200" : testStatus === "pass" ? "border-emerald-200" : "border-slate-200"}`}
    >
      <div
        className="px-5 py-4 flex items-center gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${sc.bg} ${sc.color}`}
            >
              {sc.label}
            </span>
            {openChallenges.length > 0 && (
              <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                ⚡ {openChallenges.length} QA Challenge
                {openChallenges.length > 1 ? "s" : ""}
              </span>
            )}
            {task.qaVisualApproved && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                👁 Visual OK
              </span>
            )}
          </div>
          {latestRun && (
            <p className="text-xs text-slate-400 mt-0.5">
              Last run: {latestRun.passed}/{latestRun.total} passing ·{" "}
              {latestRun.env} · {coverage}% coverage
            </p>
          )}
        </div>
        {/* Coverage pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
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
          <span className="text-xs font-bold text-slate-600">{coverage}%</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {/* AC to Boilerplate */}
          {(task.acceptanceCriteria || []).length > 0 && (
            <div className="p-4 border-b border-slate-50">
              <button
                onClick={() => setShowBoilerplate(!showBoilerplate)}
                className="flex items-center gap-2 text-xs font-semibold text-violet-600 hover:text-violet-800 mb-2"
              >
                <Code2 className="w-3.5 h-3.5" />
                {showBoilerplate ? "Hide" : "Show"} AC → Test Boilerplate
              </button>
              {showBoilerplate && (
                <div className="space-y-2">
                  {task.acceptanceCriteria.map((ac) => (
                    <div
                      key={ac.id}
                      className="rounded-xl overflow-hidden border border-slate-200"
                    >
                      <div className="px-3 py-1.5 bg-slate-800 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-300">
                          {ac.text}
                        </span>
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${ac.completed ? "text-green-400" : "text-slate-500"}`}
                        />
                      </div>
                      <pre className="p-3 bg-slate-950 text-green-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                        {BOILERPLATE(ac.text)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* QA Challenges */}
          {openChallenges.length > 0 && (
            <div className="p-4 border-b border-orange-50 bg-orange-50">
              <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> QA Challenges — resolve these
                failing scenarios
              </p>
              {openChallenges.map((c) => (
                <div
                  key={c.id}
                  className="mb-2 p-3 bg-white border border-orange-200 rounded-xl"
                >
                  <p className="text-xs font-semibold text-orange-900">
                    {c.scenario}
                  </p>
                  {c.description && (
                    <p className="text-xs text-orange-700 mt-1">
                      {c.description}
                    </p>
                  )}
                  <pre className="mt-2 p-2 bg-slate-950 text-orange-300 text-xs font-mono rounded-lg overflow-x-auto whitespace-pre-wrap">
                    {BOILERPLATE(c.scenario)}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Test run history */}
          {(task.testRuns || []).length > 0 && (
            <div className="p-4 border-b border-slate-50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Run History
              </p>
              <div className="space-y-1.5">
                {[...(task.testRuns || [])]
                  .reverse()
                  .slice(0, 5)
                  .map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center gap-3 text-xs"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${run.passed === run.total ? "bg-emerald-500" : "bg-red-400"}`}
                      />
                      <span className="text-slate-600 font-mono">
                        {run.passed}/{run.total} passing
                      </span>
                      <span className="text-slate-400">{run.env}</span>
                      {run.failedTest && (
                        <span className="text-red-500 truncate flex-1">
                          ✗ {run.failedTest}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
              {latestRun?.stackTrace && (
                <details className="mt-2">
                  <summary className="text-xs text-red-500 cursor-pointer font-semibold">
                    View Stack Trace
                  </summary>
                  <pre className="mt-1 p-3 bg-slate-950 text-red-300 text-xs font-mono rounded-xl overflow-x-auto whitespace-pre-wrap max-h-32">
                    {latestRun.stackTrace}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSync(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
              style={{ background: "linear-gradient(135deg,#059669,#2563eb)" }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync IDE Results
            </button>
            {["pass", "fail", "deferred"].map((s) => (
              <button
                key={s}
                onClick={() => onUpdateStatus(task.id, { testStatus: s })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${testStatus === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
              >
                {s === "pass" ? "✓ Pass" : s === "fail" ? "✗ Fail" : "⏭ Defer"}
              </button>
            ))}
            {testStatus === "fail" && (
              <button
                onClick={() =>
                  onPromoteBug(task.id, {
                    title: `Bug: ${task.title}`,
                    description: latestRun?.failedTest || "Test failure",
                    priority: "critical",
                    stackTrace: latestRun?.stackTrace,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Convert to Bug Story
              </button>
            )}
          </div>
        </div>
      )}

      {showSync && (
        <TestRunModal
          task={task}
          onClose={() => setShowSync(false)}
          onSubmit={(run) => onSync(task.id, run)}
        />
      )}
    </div>
  );
};

const DeveloperTestWorkspace = ({
  project,
  currentUser,
  onAddTestRun,
  onPromoteBug,
  onUpdateTask,
}) => {
  const activeSprint = project?.sprints?.find((s) => s.status === "active");
  const sprintTasks = (project?.tasks || []).filter(
    (t) => t.sprint === activeSprint?.id && t.type !== "bug",
  );
  const myTasks = sprintTasks.filter(
    (t) => t.assignee === currentUser?.name || !t.assignee,
  );

  const totalCoverage =
    myTasks.length > 0
      ? Math.round(
          myTasks.reduce((s, t) => s + (t.testCoverage || 0), 0) /
            myTasks.length,
        )
      : 0;
  const passing = myTasks.filter((t) => t.testStatus === "pass").length;
  const failing = myTasks.filter((t) => t.testStatus === "fail").length;
  const challenges = myTasks.reduce(
    (s, t) =>
      s + (t.qaChallenges || []).filter((c) => c.status === "open").length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">🧪</span> Test Runner
            <span className="text-sm font-normal text-slate-500 ml-1">
              — Developer Workspace
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Unit Testing → Integration → Bug Fixing. Turn every Red test Green.
          </p>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Avg Coverage",
            value: `${totalCoverage}%`,
            color:
              totalCoverage >= 80
                ? "text-emerald-600"
                : totalCoverage >= 50
                  ? "text-amber-600"
                  : "text-red-600",
            note: "across my tasks",
          },
          {
            label: "Passing",
            value: passing,
            color: "text-emerald-600",
            note: "stories",
          },
          {
            label: "Failing",
            value: failing,
            color: "text-red-600",
            note: "stories",
          },
          {
            label: "QA Challenges",
            value: challenges,
            color: "text-orange-600",
            note: "open",
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

      {/* Coverage threshold warning */}
      {totalCoverage < 80 && myTasks.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              Coverage below 80% threshold
            </p>
            <p className="text-xs text-amber-700">
              Gatekeeper requires 80% coverage across all stories before
              advancing to Review.
            </p>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {myTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Code2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              No tasks assigned to you in the active sprint.
            </p>
          </div>
        ) : (
          myTasks.map((task) => (
            <TestTaskCard
              key={task.id}
              task={task}
              currentUser={currentUser}
              onSync={(taskId, run) => onAddTestRun(taskId, run)}
              onPromoteBug={(taskId, bugData) => onPromoteBug(taskId, bugData)}
              onUpdateStatus={(taskId, fields) => onUpdateTask(taskId, fields)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DeveloperTestWorkspace;
