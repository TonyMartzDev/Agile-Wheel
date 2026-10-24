import { useState } from "react";
import {
  ShieldCheck,
  Eye,
  Flag,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode,
  ChevronDown,
  ChevronUp,
  Send,
  MessageSquare,
  Clock,
} from "lucide-react";

const FLAG_OPTIONS = [
  "Insufficient AC",
  "Not Testable",
  "Logic Flaw",
  "Missing Null Check",
  "Flag for Revision",
];

const SnippetReviewer = ({
  task,
  onFlagSnippet,
  onAddComment,
  currentUser,
  onUpdateSnippetStatus,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedFlag, setSelectedFlag] = useState("");
  const [preTestNotes, setPreTestNotes] = useState(task.preTestNotes || "");

  const snippets = task.snippets || [];

  const handleComment = (snippetId) => {
    if (!comment.trim()) return;
    onAddComment(task.id, snippetId, {
      text: comment,
      author: currentUser?.name || "QA",
    });
    setComment("");
  };

  return (
    <div
      className={`bg-white border-2 rounded-xl overflow-hidden transition-all ${task.qaFlag ? "border-amber-300" : "border-slate-200"}`}
    >
      <div
        className="px-5 py-4 flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className={`w-2 h-full min-h-8 rounded-full flex-shrink-0 ${task.tddStatus === "green" ? "bg-green-400" : task.tddStatus === "yellow" ? "bg-amber-400" : "bg-red-400"}`}
          style={{ width: "4px", borderRadius: "4px" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
            {task.assignee && (
              <span className="text-xs text-slate-400">by {task.assignee}</span>
            )}
            {task.tddStatus === "green" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                Tests ✓
              </span>
            )}
            {task.blocked && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                🔴 Blocked
              </span>
            )}
            {task.qaFlag && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                ⚠ {task.qaFlag}
              </span>
            )}
            {task.peerApproved && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                👍 Peer OK
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <FileCode className="w-3 h-3" />
              {snippets.length} snippet{snippets.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {
                (task.acceptanceCriteria || []).filter((a) => a.completed)
                  .length
              }
              /{(task.acceptanceCriteria || []).length} AC
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {/* Split view: AC left, Snippets right */}
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {/* Left: Acceptance Criteria */}
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Acceptance Criteria
              </p>
              {(task.acceptanceCriteria || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No AC defined in Planning.
                </p>
              ) : (
                <div className="space-y-2">
                  {(task.acceptanceCriteria || []).map((ac) => (
                    <div key={ac.id} className="flex items-start gap-2 text-xs">
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ac.completed ? "text-green-500" : "text-slate-300"}`}
                      />
                      <span
                        className={
                          ac.completed
                            ? "line-through text-slate-400"
                            : "text-slate-700"
                        }
                      >
                        {ac.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pre-Test Notes */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Pre-Test Notes
                </p>
                <textarea
                  rows={3}
                  value={preTestNotes}
                  onChange={(e) => setPreTestNotes(e.target.value)}
                  placeholder="Jot down testing observations before code is merged..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {/* Flag for Revision */}
              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Flag This Story
                </p>
                <div className="flex gap-2">
                  <select
                    value={selectedFlag}
                    onChange={(e) => setSelectedFlag(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
                  >
                    <option value="">Select flag type...</option>
                    {FLAG_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (selectedFlag) onFlagSnippet(task.id, selectedFlag);
                      setSelectedFlag("");
                    }}
                    disabled={!selectedFlag}
                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-40 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Code Snippets */}
            <div className="p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Code Snippets
              </p>
              {snippets.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  <FileCode className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No snippets pushed yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {snippets.map((s) => (
                    <div
                      key={s.id}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <div className="px-3 py-2 bg-slate-50 flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {s.fileName}
                          {s.lineRange && ` · ${s.lineRange}`}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.status === "validated" ? "bg-green-100 text-green-700" : s.status === "reviewed" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
                          >
                            {s.status}
                          </span>
                          <select
                            value={s.status}
                            onChange={(e) =>
                              onUpdateSnippetStatus(
                                task.id,
                                s.id,
                                e.target.value,
                              )
                            }
                            className="text-xs border-none bg-transparent text-slate-500 focus:outline-none cursor-pointer"
                          >
                            <option value="draft">draft</option>
                            <option value="reviewed">reviewed</option>
                            <option value="validated">validated</option>
                          </select>
                        </div>
                      </div>
                      <pre className="p-3 bg-slate-950 text-green-300 text-xs font-mono overflow-x-auto max-h-32 whitespace-pre-wrap">
                        {s.code}
                      </pre>
                      {s.notes && (
                        <p className="px-3 py-2 text-xs text-slate-500 italic border-t border-slate-100">
                          {s.notes}
                        </p>
                      )}
                      {/* Comment */}
                      <div className="px-3 py-2 border-t border-slate-100">
                        {(s.comments || []).map((c) => (
                          <div key={c.id} className="flex gap-2 mb-1.5">
                            <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {c.author?.charAt(0)}
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 flex-1">
                              <p className="text-xs font-semibold text-amber-800">
                                {c.author}
                              </p>
                              <p className="text-xs text-amber-700">{c.text}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <input
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleComment(s.id)
                            }
                            placeholder="Pre-testing note on this snippet..."
                            className="flex-1 border border-amber-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 bg-amber-50"
                          />
                          <button
                            onClick={() => handleComment(s.id)}
                            className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QADevWorkspace = ({
  project,
  currentUser,
  onFlagTask,
  onAddSnippetComment,
  onUpdateSnippetStatus,
}) => {
  const activeSprint = project?.sprints?.find((s) => s.status === "active");
  const sprintTasks = (project?.tasks || []).filter(
    (t) => t.sprint === activeSprint?.id,
  );
  const [filterFlag, setFilterFlag] = useState("all");

  const filtered =
    filterFlag === "all"
      ? sprintTasks
      : filterFlag === "flagged"
        ? sprintTasks.filter((t) => t.qaFlag)
        : filterFlag === "snippets"
          ? sprintTasks.filter((t) => (t.snippets || []).length > 0)
          : filterFlag === "green"
            ? sprintTasks.filter((t) => t.tddStatus === "green")
            : sprintTasks;

  const totalSnippets = sprintTasks.reduce(
    (sum, t) => sum + (t.snippets || []).length,
    0,
  );
  const validated = sprintTasks.reduce(
    (sum, t) =>
      sum + (t.snippets || []).filter((s) => s.status === "validated").length,
    0,
  );
  const flagged = sprintTasks.filter((t) => t.qaFlag).length;
  const greenTasks = sprintTasks.filter((t) => t.tddStatus === "green").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="text-2xl">🔍</span> The Audit
          <span className="text-sm font-normal text-slate-500 ml-1">
            — QA Engineer Workspace
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review code snippets early. Catch logic flaws before they're merged.
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Snippets",
            value: totalSnippets,
            color: "text-slate-900",
            sub: "pushed by devs",
          },
          {
            label: "Validated",
            value: validated,
            color: "text-green-600",
            sub: "snippets approved",
          },
          {
            label: "Flagged Stories",
            value: flagged,
            color: "text-amber-600",
            sub: "need revision",
          },
          {
            label: "Tests Passing",
            value: greenTasks,
            color: "text-blue-600",
            sub: `of ${sprintTasks.length} stories`,
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
            <p className="text-xs text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {[
          { key: "all", label: "All Stories" },
          { key: "snippets", label: "Has Snippets" },
          { key: "green", label: "Tests Passing" },
          { key: "flagged", label: "Flagged" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterFlag(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${filterFlag === f.key ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"}`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} stories
        </span>
      </div>

      {/* Story list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No stories match this filter.</p>
          </div>
        ) : (
          filtered.map((task) => (
            <SnippetReviewer
              key={task.id}
              task={task}
              currentUser={currentUser}
              onFlagSnippet={(taskId, flag) => onFlagTask(taskId, flag)}
              onAddComment={(taskId, snippetId, comment) =>
                onAddSnippetComment(taskId, snippetId, comment)
              }
              onUpdateSnippetStatus={(taskId, snippetId, status) =>
                onUpdateSnippetStatus(taskId, snippetId, status)
              }
            />
          ))
        )}
      </div>
    </div>
  );
};

export default QADevWorkspace;
