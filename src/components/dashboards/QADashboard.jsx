import { useState } from "react";
import {
  Bug,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Plus,
  Link as LinkIcon,
  CheckSquare,
  Square,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import { useAuth } from "../../context/AuthContext";

const severityColors = {
  critical: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
  high: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
  },
  low: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
};

const QADashboard = () => {
  const { user } = useAuth();
  const {
    projects,
    updateTaskStatus,
    toggleAcceptanceCriteria,
    addBug,
    addPhaseVote,
  } = useProjects();
  const [expandedTask, setExpandedTask] = useState(null);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Get all tasks ready for testing across projects
  const readyForTestTasks = projects.flatMap((p) =>
    (p.tasks || [])
      .filter((t) => t.status === "ready_for_test")
      .map((t) => ({ ...t, projectId: p.id, projectName: p.name })),
  );

  // Get all open bugs across projects
  const openBugs = projects.flatMap((p) =>
    (p.bugs || [])
      .filter((b) => b.status === "open" || b.status === "in_progress")
      .map((b) => ({ ...b, projectId: p.id, projectName: p.name })),
  );

  // Get projects in Test phase that might need voting
  const projectsInTestPhase = projects.filter((p) => p.phase === "Test");

  // Stats
  const totalReadyForTest = readyForTestTasks.length;
  const totalOpenBugs = openBugs.filter((b) => b.status === "open").length;
  const criticalBugs = openBugs.filter((b) => b.severity === "critical").length;

  const handleMarkAsTested = (projectId, taskId) => {
    updateTaskStatus(projectId, taskId, "done");
  };

  const handleRejectTask = (projectId, taskId) => {
    updateTaskStatus(projectId, taskId, "in_progress");
  };

  const handleToggleCriteria = (projectId, taskId, criteriaId) => {
    toggleAcceptanceCriteria(projectId, taskId, criteriaId);
  };

  const openBugReport = (task, projectId) => {
    setSelectedTask(task);
    setSelectedProject(projectId);
    setShowBugModal(true);
  };

  const openVoteModal = (project) => {
    setSelectedProject(project);
    setShowVoteModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Ready for Test
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalReadyForTest}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Open Bugs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalOpenBugs}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Critical Bugs
              </p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {criticalBugs}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Projects in Test
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {projectsInTestPhase.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ready for Test Stories */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Ready for Test
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Stories completed by developers awaiting QA
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {readyForTestTasks.length > 0 ? (
              readyForTestTasks.map((task) => (
                <div key={`${task.projectId}-${task.id}`} className="p-4">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedTask(expandedTask === task.id ? null : task.id)
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <h3 className="font-semibold text-slate-900">
                          {task.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {task.projectName}
                      </p>
                    </div>
                    {expandedTask === task.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Expanded View with Acceptance Criteria */}
                  {expandedTask === task.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" />
                        Acceptance Criteria
                      </h4>

                      {task.acceptanceCriteria &&
                      task.acceptanceCriteria.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {task.acceptanceCriteria.map((ac) => (
                            <label
                              key={ac.id}
                              className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleCriteria(
                                    task.projectId,
                                    task.id,
                                    ac.id,
                                  );
                                }}
                                className="mt-0.5"
                              >
                                {ac.completed ? (
                                  <CheckSquare className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Square className="w-5 h-5 text-slate-400" />
                                )}
                              </button>
                              <span
                                className={`text-sm ${ac.completed ? "text-slate-500 line-through" : "text-slate-700"}`}
                              >
                                {ac.text}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic mb-4">
                          No acceptance criteria defined
                        </p>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleMarkAsTested(task.projectId, task.id)
                          }
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Pass
                        </button>
                        <button
                          onClick={() =>
                            handleRejectTask(task.projectId, task.id)
                          }
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          Fail
                        </button>
                        <button
                          onClick={() => openBugReport(task, task.projectId)}
                          className="flex items-center justify-center gap-2 border-2 border-orange-300 text-orange-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
                        >
                          <Bug className="w-4 h-4" />
                          Report Bug
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-slate-500">No stories waiting for test</p>
              </div>
            )}
          </div>
        </div>

        {/* Open Bugs */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bug className="w-5 h-5 text-orange-600" />
              Open Bugs
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Active bugs requiring attention
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {openBugs.length > 0 ? (
              openBugs.map((bug) => (
                <div key={`${bug.projectId}-${bug.id}`} className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`px-2 py-1 rounded text-xs font-bold ${severityColors[bug.severity]?.bg} ${severityColors[bug.severity]?.text}`}
                    >
                      {bug.severity.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {bug.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {bug.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{bug.projectName}</span>
                        {bug.linkedTaskId && (
                          <span className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" />
                            Linked to story
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded ${
                            bug.status === "open"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {bug.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bug className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No open bugs</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phase Voting Section */}
      {projectsInTestPhase.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ThumbsDown className="w-5 h-5 text-purple-600" />
              Phase Gate Voting
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Vote on whether projects are ready to move to the next phase
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {projectsInTestPhase.map((project) => {
              const projectOpenBugs = (project.bugs || []).filter(
                (b) => b.status === "open",
              );
              const criticalOpenBugs = projectOpenBugs.filter(
                (b) => b.severity === "critical",
              );
              const hasVoted = (project.phaseVotes || []).some(
                (v) => v.userId === user?.id,
              );

              return (
                <div
                  key={project.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm">
                      <span className="text-slate-500">
                        {projectOpenBugs.length} open bugs
                      </span>
                      {criticalOpenBugs.length > 0 && (
                        <span className="text-red-600 font-medium">
                          {criticalOpenBugs.length} critical
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasVoted ? (
                      <span className="text-sm text-slate-500 italic">
                        Vote submitted
                      </span>
                    ) : (
                      <button
                        onClick={() => openVoteModal(project)}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Vote on Release
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {showBugModal && (
        <BugReportModal
          task={selectedTask}
          projectId={selectedProject}
          onClose={() => setShowBugModal(false)}
          onSubmit={(bugData) => {
            addBug(selectedProject, bugData);
            setShowBugModal(false);
          }}
          userName={user?.name}
        />
      )}

      {/* Vote Modal */}
      {showVoteModal && (
        <PhaseVoteModal
          project={selectedProject}
          onClose={() => setShowVoteModal(false)}
          onSubmit={(voteData) => {
            addPhaseVote(selectedProject.id, { ...voteData, userId: user?.id });
            setShowVoteModal(false);
          }}
        />
      )}
    </div>
  );
};

const BugReportModal = ({ task, onClose, onSubmit, userName }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    linkedTaskId: task?.id || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      reportedBy: userName,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Report Bug</h2>
          {task && (
            <p className="text-sm text-slate-500 mt-1">
              Linked to: {task.title}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Bug Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none"
              placeholder="Brief description of the bug"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none resize-none"
              rows={3}
              placeholder="Steps to reproduce, expected vs actual behavior..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Severity
            </label>
            <select
              value={formData.severity}
              onChange={(e) =>
                setFormData({ ...formData, severity: e.target.value })
              }
              className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
            >
              Report Bug
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PhaseVoteModal = ({ project, onClose, onSubmit }) => {
  const [vote, setVote] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      phase: "Release",
      vote,
      reason,
    });
  };

  const openBugs = (project.bugs || []).filter((b) => b.status === "open");
  const criticalBugs = openBugs.filter((b) => b.severity === "critical");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">
            Vote: Ready for Release?
          </h2>
          <p className="text-sm text-slate-500 mt-1">{project.name}</p>
        </div>

        <div className="p-6">
          {criticalBugs.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ {criticalBugs.length} critical bug(s) still open
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Your Vote
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVote("complete")}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    vote === "complete"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <CheckCircle2
                    className={`w-8 h-8 mx-auto mb-2 ${vote === "complete" ? "text-green-600" : "text-slate-400"}`}
                  />
                  <span className="font-semibold">Ready</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVote("incomplete")}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    vote === "incomplete"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <ThumbsDown
                    className={`w-8 h-8 mx-auto mb-2 ${vote === "incomplete" ? "text-red-600" : "text-slate-400"}`}
                  />
                  <span className="font-semibold">Not Ready</span>
                </button>
              </div>
            </div>

            {vote === "incomplete" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reason *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-primary-600 focus:outline-none resize-none"
                  rows={3}
                  placeholder="Why is this project not ready for release?"
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!vote}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Vote
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QADashboard;
