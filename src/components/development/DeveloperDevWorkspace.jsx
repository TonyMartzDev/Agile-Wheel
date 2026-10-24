import { useState } from "react";
import {
  Code2, Upload, CheckCircle2, XCircle, Clock, AlertTriangle,
  ChevronDown, ChevronUp, MessageSquare, Send, GitBranch,
  Play, Flag, ThumbsUp, FileCode, Zap
} from "lucide-react";

const TDD_STATUSES = {
  red: { label: "Tests Written — Code Failing", color: "#ef4444", bg: "bg-red-50", border: "border-red-200", icon: XCircle },
  yellow: { label: "Code Written — Tests Pending", color: "#f59e0b", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  green: { label: "All Tests Passing", color: "#22c55e", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle2 },
};

const SnippetUploadModal = ({ task, onClose, onSubmit }) => {
  const [code, setCode] = useState("");
  const [fileName, setFileName] = useState("");
  const [lineFrom, setLineFrom] = useState("");
  const [lineTo, setLineTo] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!code.trim() || !fileName.trim()) return;
    onSubmit({
      code,
      fileName,
      lineRange: lineFrom && lineTo ? `L${lineFrom}–L${lineTo}` : "",
      notes,
      author: "You",
      context: task.title,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Push Code Snippet</h3>
            <p className="text-xs text-slate-500">{task.title}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">File Name</label>
              <input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="e.g. auth/login.ts" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Line From</label>
                <input value={lineFrom} onChange={e => setLineFrom(e.target.value)} placeholder="42" type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Line To</label>
                <input value={lineTo} onChange={e => setLineTo(e.target.value)} placeholder="68" type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Code Snippet</label>
            <textarea value={code} onChange={e => setCode(e.target.value)} rows={8} placeholder="Paste your code here..." className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none bg-slate-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Context Note (optional)</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="What does this solve?" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={!code.trim() || !fileName.trim()} className="px-5 py-2 text-sm font-semibold text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-opacity" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
            Push to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

const SnippetCard = ({ snippet, onAddComment, currentUser }) => {
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment] = useState("");

  const handleComment = () => {
    if (!comment.trim()) return;
    onAddComment(snippet.id, { text: comment, author: currentUser?.name || "You" });
    setComment("");
  };

  const statusColors = { draft: "bg-slate-100 text-slate-600", reviewed: "bg-blue-100 text-blue-700", validated: "bg-green-100 text-green-700" };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
      <div className="px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <FileCode className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-slate-900 truncate">{snippet.fileName}</span>
            {snippet.lineRange && <span className="text-xs text-slate-400 font-mono">{snippet.lineRange}</span>}
          </div>
          {snippet.notes && <p className="text-xs text-slate-500 truncate mt-0.5">{snippet.notes}</p>}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[snippet.status] || statusColors.draft}`}>{snippet.status}</span>
        <span className="flex items-center gap-1 text-xs text-slate-400"><MessageSquare className="w-3.5 h-3.5" />{snippet.comments?.length || 0}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>
      {expanded && (
        <div className="border-t border-slate-100">
          <pre className="p-4 bg-slate-950 text-green-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64">{snippet.code}</pre>
          <div className="p-4 space-y-3">
            {(snippet.comments || []).map(c => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.author?.charAt(0)}</div>
                <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-slate-700">{c.author}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === "Enter" && handleComment()} placeholder="Leave a code review comment..." className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <button onClick={handleComment} className="p-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"><Send className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DeveloperDevWorkspace = ({ project, currentUser, onUpdateTask, onAddSnippet, onAddSnippetComment, onFlagBlocked }) => {
  const activeSprint = project?.sprints?.find(s => s.status === "active");
  const sprintTasks = (project?.tasks || []).filter(t => t.sprint === activeSprint?.id);
  const myTasks = sprintTasks.filter(t => t.assignee === currentUser?.name || !t.assignee);

  const [activeTaskId, setActiveTaskId] = useState(myTasks[0]?.id || null);
  const [showUpload, setShowUpload] = useState(false);
  const [showDailyStandup, setShowDailyStandup] = useState(false);
  const [standupAnswers, setStandupAnswers] = useState({ yesterday: "", today: "", blockers: "" });
  const [peerApprovalNote, setPeerApprovalNote] = useState("");

  const activeTask = sprintTasks.find(t => t.id === activeTaskId) || myTasks[0];
  const tddStatus = activeTask?.tddStatus || "red";
  const tddInfo = TDD_STATUSES[tddStatus] || TDD_STATUSES.red;
  const TDDIcon = tddInfo.icon;
  const isBlocked = activeTask?.blocked || false;

  const peerApprovedTasks = sprintTasks.filter(t => t.peerApproved).length;
  const peerApprovalPct = sprintTasks.length > 0 ? Math.round((peerApprovedTasks / sprintTasks.length) * 100) : 0;
  const gatekeeperChecks = [
    { label: "All stories assigned", met: sprintTasks.every(t => t.assignee), detail: `${sprintTasks.filter(t => t.assignee).length}/${sprintTasks.length}` },
    { label: "Code presence (≥1 snippet per story)", met: sprintTasks.every(t => (t.snippets || []).length > 0), detail: `${sprintTasks.filter(t => (t.snippets || []).length > 0).length}/${sprintTasks.length}` },
    { label: "50% peer-approved", met: peerApprovalPct >= 50, detail: `${peerApprovalPct}%` },
  ];
  const gatekeeperMet = gatekeeperChecks.every(g => g.met);

  const tddCycle = ["red", "yellow", "green"];
  const advanceTDD = () => {
    const next = tddCycle[(tddCycle.indexOf(tddStatus) + 1) % tddCycle.length];
    onUpdateTask(activeTask.id, { tddStatus: next });
  };

  const toggleBlocked = () => {
    onUpdateTask(activeTask.id, { blocked: !isBlocked });
    if (!isBlocked) onFlagBlocked(activeTask.id);
  };

  const handlePeerApprove = () => {
    onUpdateTask(activeTask.id, { peerApproved: !activeTask?.peerApproved, peerApprovalNote });
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-2xl">⚒️</span> The Forge
            <span className="text-sm font-normal text-slate-500 ml-1">— Developer Workspace</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Daily Standup → Write Tests → Write Code → Peer Review → CI</p>
        </div>
        <button onClick={() => setShowDailyStandup(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors">
          <Zap className="w-4 h-4 text-yellow-400" /> Daily Standup
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT: Active Task + TDD */}
        <div className="col-span-2 space-y-4">
          {/* Task Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">My Sprint Tasks</p>
            <div className="flex flex-wrap gap-2">
              {myTasks.map(t => (
                <button key={t.id} onClick={() => setActiveTaskId(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${activeTaskId === t.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"}`}>
                  {t.blocked && <span className="mr-1">🔴</span>}
                  {t.title}
                  {t.tddStatus === "green" && <span className="ml-1">✅</span>}
                </button>
              ))}
              {myTasks.length === 0 && <p className="text-sm text-slate-400 italic">No tasks assigned to you in the active sprint.</p>}
            </div>
          </div>

          {activeTask && (
            <>
              {/* Active Task Card */}
              <div className={`rounded-xl border-2 p-5 transition-all ${isBlocked ? "border-red-300 bg-red-50" : "border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">Active Task</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{activeTask.title}</h3>
                    {activeTask.storyPoints && <span className="text-xs text-slate-500">{activeTask.storyPoints} story points</span>}
                  </div>
                  <button onClick={toggleBlocked}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold transition-all ${isBlocked ? "bg-red-600 text-white hover:bg-red-700" : "bg-white border border-red-200 text-red-600 hover:bg-red-50"}`}>
                    <Flag className="w-4 h-4" />
                    {isBlocked ? "BLOCKED — Click to unblock" : "Flag as Blocked"}
                  </button>
                </div>

                {/* Acceptance Criteria */}
                {(activeTask.acceptanceCriteria || []).length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Acceptance Criteria</p>
                    <div className="space-y-1.5">
                      {activeTask.acceptanceCriteria.map(ac => (
                        <div key={ac.id} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${ac.completed ? "text-green-500" : "text-slate-300"}`} />
                          <span className={ac.completed ? "text-slate-400 line-through" : "text-slate-700"}>{ac.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TDD Traffic Light */}
                <div className={`rounded-xl border p-4 ${tddInfo.bg} ${tddInfo.border}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2">
                        {["red","yellow","green"].map(s => (
                          <div key={s} className={`w-4 h-4 rounded-full transition-all ${tddStatus === s ? "scale-125 shadow-lg" : "opacity-30"}`}
                            style={{ background: s === "red" ? "#ef4444" : s === "yellow" ? "#f59e0b" : "#22c55e" }} />
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">TDD Status</p>
                        <p className="text-sm font-bold" style={{ color: tddInfo.color }}>{tddInfo.label}</p>
                      </div>
                    </div>
                    <button onClick={advanceTDD} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                      <Play className="w-3 h-3" /> Advance
                    </button>
                  </div>
                </div>

                {/* Peer Approval */}
                <div className="mt-3 pt-3 border-t border-violet-100 flex items-center gap-3">
                  <ThumbsUp className={`w-4 h-4 ${activeTask?.peerApproved ? "text-green-500" : "text-slate-400"}`} />
                  <div className="flex-1">
                    <input value={peerApprovalNote} onChange={e => setPeerApprovalNote(e.target.value)} placeholder="Peer approval note (optional)..." className="text-xs w-full bg-transparent border-none focus:outline-none text-slate-600 placeholder-slate-400" />
                  </div>
                  <button onClick={handlePeerApprove} className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${activeTask?.peerApproved ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700"}`}>
                    {activeTask?.peerApproved ? "✓ Peer Approved" : "Mark Peer Approved"}
                  </button>
                </div>
              </div>

              {/* Snippet Gallery */}
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-violet-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Code Snippet Gallery</h3>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{(activeTask?.snippets || []).length}</span>
                  </div>
                  <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition-all" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)" }}>
                    <Upload className="w-3.5 h-3.5" /> Push Snippet
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {(activeTask?.snippets || []).length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No snippets yet. Push one from VS Code or use the button above.</p>
                    </div>
                  ) : (
                    (activeTask.snippets).map(s => (
                      <SnippetCard key={s.id} snippet={s} onAddComment={(snippetId, comment) => onAddSnippetComment(activeTask.id, snippetId, comment)} currentUser={currentUser} />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Gatekeeper + CI + Burn-up */}
        <div className="space-y-4">
          {/* CI Badge */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">CI Health</p>
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="text-sm font-bold text-green-800">Build: Passing</p>
                <p className="text-xs text-green-600">main branch · 2 min ago</p>
              </div>
            </div>
          </div>

          {/* Burn-up chart (simple) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Sprint Burn-up</p>
            {(() => {
              const done = sprintTasks.filter(t => t.status === "done").length;
              const total = sprintTasks.length || 1;
              const pct = Math.round((done / total) * 100);
              return (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{done} of {total} stories</span>
                    <span className="font-bold text-violet-600">{pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#7c3aed,#2563eb)" }} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {sprintTasks.map(t => (
                      <div key={t.id} className={`flex-1 h-6 rounded-sm ${t.status === "done" ? "bg-green-400" : t.tddStatus === "green" ? "bg-blue-400" : t.tddStatus === "yellow" ? "bg-amber-400" : "bg-red-300"}`} title={t.title} />
                    ))}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-400 inline-block" />Done</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />Tests ✓</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />In Progress</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Gatekeeper */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Dev → Testing Gatekeeper</p>
            <div className="space-y-2.5">
              {gatekeeperChecks.map((g, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${g.met ? "bg-green-100" : "bg-slate-100"}`}>
                    {g.met ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-700">{g.label}</p>
                    <p className="text-xs text-slate-400">{g.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold ${gatekeeperMet ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-50 text-slate-500 border border-slate-200"}`}>
              {gatekeeperMet ? "✓ Ready to move to Testing" : "Requirements not met yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Standup Modal */}
      {showDailyStandup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">⚡ Daily Standup</h3>
              <p className="text-sm text-slate-500">15-minute sync — keep it brief</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "yesterday", label: "What did I do yesterday?" },
                { key: "today", label: "What will I do today?" },
                { key: "blockers", label: "Are there any blockers?" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
                  <textarea rows={2} value={standupAnswers[key]} onChange={e => setStandupAnswers(p => ({ ...p, [key]: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowDailyStandup(false)} className="px-4 py-2 text-sm text-slate-600 font-medium hover:text-slate-900">Cancel</button>
              <button onClick={() => setShowDailyStandup(false)} className="px-5 py-2 text-sm font-semibold text-white rounded-xl" style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>Submit Standup</button>
            </div>
          </div>
        </div>
      )}

      {showUpload && activeTask && (
        <SnippetUploadModal task={activeTask} onClose={() => setShowUpload(false)} onSubmit={snippet => onAddSnippet(activeTask.id, snippet)} />
      )}
    </div>
  );
};

export default DeveloperDevWorkspace;
