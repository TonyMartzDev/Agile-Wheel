import { useState } from "react";
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Target,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import CreateProjectModal from "../CreateProjectModal";

const phaseColors = {
  Plan: "#7c3aed",
  Design: "#dc2626",
  Develop: "#ea580c",
  Test: "#0d9488",
  Release: "#0369a1",
  Feedback: "#15803d",
};

const ScrumMasterDashboard = () => {
  const { projects } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Active sprints across all projects
  const activeSprints = projects.flatMap((p) =>
    (p.sprints || [])
      .filter((s) => s.status === "active")
      .map((s) => ({ ...s, projectId: p.id, projectName: p.name })),
  );

  // Blockers (tasks stuck in progress for too long or high priority todos)
  const potentialBlockers = projects.flatMap((p) =>
    (p.tasks || [])
      .filter((t) => t.status === "in_progress" && t.priority === "high")
      .map((t) => ({ ...t, projectId: p.id, projectName: p.name })),
  );

  // Team velocity (completed tasks this sprint)
  const completedTasks = projects.reduce(
    (acc, p) => acc + (p.tasks || []).filter((t) => t.status === "done").length,
    0,
  );
  const totalTasks = projects.reduce(
    (acc, p) => acc + (p.tasks || []).length,
    0,
  );

  // Total team members
  const totalTeamMembers = new Set(
    projects.flatMap((p) => p.team.map((t) => t.email)),
  ).size;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Active Sprints
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {activeSprints.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Team Members</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalTeamMembers}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Potential Blockers
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {potentialBlockers.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Tasks Completed
              </p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {completedTasks}/{totalTasks}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Sprints */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Active Sprints
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Monitor ongoing sprints across projects
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {activeSprints.length > 0 ? (
              activeSprints.map((sprint) => {
                const project = projects.find((p) => p.id === sprint.projectId);
                const sprintTasks = project?.tasks || [];
                const doneTasks = sprintTasks.filter(
                  (t) => t.status === "done",
                ).length;
                const inProgressTasks = sprintTasks.filter(
                  (t) => t.status === "in_progress",
                ).length;
                const todoTasks = sprintTasks.filter(
                  (t) => t.status === "todo",
                ).length;

                const startDate = new Date(sprint.startDate);
                const endDate = new Date(sprint.endDate);
                const today = new Date();
                const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24);
                const daysElapsed = Math.max(
                  0,
                  (today - startDate) / (1000 * 60 * 60 * 24),
                );
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)),
                );
                const sprintProgress = Math.min(
                  100,
                  Math.round((daysElapsed / totalDays) * 100),
                );

                return (
                  <div key={`${sprint.projectId}-${sprint.id}`} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {sprint.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {sprint.projectName}
                        </p>
                      </div>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{
                          backgroundColor:
                            phaseColors[project?.phase] || "#6b7280",
                        }}
                      >
                        {project?.phase}
                      </span>
                    </div>

                    {/* Sprint Timeline */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-600">Sprint Progress</span>
                        <span className="font-medium text-slate-900">
                          {daysRemaining} days left
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${sprintProgress}%` }}
                        />
                      </div>
                    </div>

                    {/* Task Distribution */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-slate-600">
                          Done: {doneTasks}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-slate-600">
                          In Progress: {inProgressTasks}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-300" />
                        <span className="text-slate-600">
                          To Do: {todoTasks}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-1">
                  No active sprints
                </h3>
                <p className="text-slate-500 text-sm">
                  Start a new sprint to begin tracking
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Potential Blockers */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-200">
            <div className="p-5 border-b border-orange-100 bg-orange-50 rounded-t-xl">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-orange-900">
                  Potential Blockers
                </h2>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                High priority tasks in progress
              </p>
            </div>
            <div className="divide-y divide-orange-100">
              {potentialBlockers.length > 0 ? (
                potentialBlockers.map((task) => (
                  <div key={`${task.projectId}-${task.id}`} className="p-4">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {task.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {task.projectName}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Assigned to: {task.assignee}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No blockers detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Team Overview
            </h2>
            <div className="space-y-3">
              {projects.slice(0, 3).map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: phaseColors[project.phase] }}
                    />
                    <span className="text-sm text-slate-700 truncate max-w-[150px]">
                      {project.name}
                    </span>
                  </div>
                  <div className="flex -space-x-2">
                    {project.team.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                        title={member.name}
                      >
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    {project.team.length > 3 && (
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold border-2 border-white">
                        +{project.team.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
              >
                <Plus className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-slate-900">
                  Create Project
                </span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-slate-900">
                  Invite Team Member
                </span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors text-left">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-slate-900">
                  Start New Sprint
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

export default ScrumMasterDashboard;
