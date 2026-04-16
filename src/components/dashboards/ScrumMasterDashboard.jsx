import { useState } from "react";
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  Zap,
  BarChart3,
  Activity,
  Star,
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

  // Story point metrics across all projects
  const allTasks = projects.flatMap((p) => p.tasks || []);
  const sprintTasks = allTasks.filter((t) => t.sprint);
  const doneTasks = allTasks.filter((t) => t.status === "done");

  const totalSprintPoints = sprintTasks.reduce(
    (s, t) => s + (t.storyPoints || 0),
    0,
  );
  const completedPoints = doneTasks.reduce(
    (s, t) => s + (t.storyPoints || 0),
    0,
  );
  const unestimatedCount = sprintTasks.filter((t) => !t.storyPoints).length;

  // Velocity = completed points across active sprints
  const velocityPerSprint =
    activeSprints.length > 0
      ? Math.round(completedPoints / Math.max(activeSprints.length, 1))
      : completedPoints;

  // Per-project capacity utilization
  const projectMetrics = projects.map((p) => {
    const activeSprint = (p.sprints || []).find((s) => s.status === "active");
    const sprintStories = (p.tasks || []).filter(
      (t) => t.sprint === activeSprint?.id,
    );
    const committed = sprintStories.reduce(
      (s, t) => s + (t.storyPoints || 0),
      0,
    );
    const done = sprintStories
      .filter((t) => t.status === "done")
      .reduce((s, t) => s + (t.storyPoints || 0), 0);
    const capacity = 40; // default
    const utilization =
      capacity > 0
        ? Math.min(Math.round((committed / capacity) * 100), 100)
        : 0;
    const burndownPct =
      committed > 0 ? Math.round((done / committed) * 100) : 0;
    return {
      ...p,
      committed,
      done,
      capacity,
      utilization,
      burndownPct,
      hasSprint: !!activeSprint,
    };
  });

  // Team health: % stories with AC + story points
  const storiesWithAC = allTasks.filter((t) =>
    t.acceptanceCriteria?.some((ac) => ac.text),
  ).length;
  const storiesWithPoints = allTasks.filter((t) => t.storyPoints).length;
  const healthScore =
    allTasks.length > 0
      ? Math.round(
          ((storiesWithAC + storiesWithPoints) / (allTasks.length * 2)) * 100,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Active Sprints
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {activeSprints.length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {projects.length} total project
                {projects.length !== 1 ? "s" : ""}
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
              <p className="text-sm text-slate-500 font-medium">
                Team Velocity
              </p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {velocityPerSprint}{" "}
                <span className="text-sm font-normal text-slate-500">pts</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {completedPoints} pts delivered total
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Potential Blockers
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${potentialBlockers.length > 0 ? "text-orange-600" : "text-green-600"}`}
              >
                {potentialBlockers.length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {unestimatedCount} unestimated in sprint
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
              <p className="text-xs text-slate-400 mt-1">
                {totalTeamMembers} team members
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Velocity & Story Points Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-blue-700">
              Sprint Committed
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {totalSprintPoints}{" "}
            <span className="text-sm font-normal text-slate-500">pts</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {sprintTasks.length} stories in sprints
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-green-700">Delivered</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {completedPoints}{" "}
            <span className="text-sm font-normal text-slate-500">pts</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {doneTasks.length} stories done
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-semibold text-purple-700">
              Team Health Score
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {healthScore}
            <span className="text-sm font-normal text-slate-500">%</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            AC coverage + estimation
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-semibold text-amber-700">
              Stories with Points
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {storiesWithPoints}
            <span className="text-sm font-normal text-slate-500">
              /{allTasks.length}
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {storiesWithAC} have acceptance criteria
          </p>
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

          {/* Capacity Utilization per Project */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Capacity Utilization
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {projectMetrics.filter((p) => p.hasSprint).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No active sprints to measure
                </p>
              ) : (
                projectMetrics
                  .filter((p) => p.hasSprint)
                  .map((p) => {
                    const color =
                      p.utilization > 100
                        ? "bg-red-500"
                        : p.utilization > 80
                          ? "bg-amber-500"
                          : "bg-green-500";
                    return (
                      <div key={p.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 truncate max-w-[120px]">
                            {p.name}
                          </span>
                          <span
                            className={`font-bold ${p.utilization > 80 ? "text-red-600" : "text-green-600"}`}
                          >
                            {p.utilization}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} rounded-full transition-all`}
                            style={{
                              width: `${Math.min(p.utilization, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                          <span>{p.committed} pts committed</span>
                          <span className="text-green-600">
                            {p.burndownPct}% burned
                          </span>
                        </div>
                      </div>
                    );
                  })
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
