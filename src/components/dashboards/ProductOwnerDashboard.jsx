import { useState } from "react";
import {
  Target,
  TrendingUp,
  AlertCircle,
  Users,
  ChevronRight,
  BarChart3,
  Calendar,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
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

const ProductOwnerDashboard = () => {
  const { projects } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calculate stats
  const totalProjects = projects.length;
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((acc, p) => acc + p.progress, 0) / projects.length,
        )
      : 0;

  // Projects at risk (behind schedule)
  const projectsAtRisk = projects.filter((p) => {
    const daysSinceCreation = Math.floor(
      (new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24),
    );
    const expectedProgress = Math.min(daysSinceCreation * 2, 100);
    return p.progress < expectedProgress - 20;
  });

  // Projects by phase
  const projectsByPhase = projects.reduce((acc, p) => {
    acc[p.phase] = (acc[p.phase] || 0) + 1;
    return acc;
  }, {});

  // Velocity & story point metrics
  const allTasks = projects.flatMap((p) => p.tasks || []);
  const completedTasks = allTasks.filter((t) => t.status === "done");
  const inProgressTasks = allTasks.filter((t) => t.status === "in_progress");
  const backlogTasks = allTasks.filter((t) => t.status === "todo" && !t.sprint);

  const completedStoryPoints = completedTasks.reduce(
    (s, t) => s + (t.storyPoints || 0),
    0,
  );
  const inSprintPoints = allTasks
    .filter((t) => t.sprint)
    .reduce((s, t) => s + (t.storyPoints || 0), 0);
  const backlogPoints = backlogTasks.reduce(
    (s, t) => s + (t.storyPoints || 0),
    0,
  );

  // Velocity = avg completed story points per active sprint
  const activeSprints = projects.flatMap((p) =>
    (p.sprints || []).filter((s) => s.status === "active"),
  );
  const teamVelocity =
    activeSprints.length > 0
      ? Math.round(completedStoryPoints / Math.max(activeSprints.length, 1))
      : completedStoryPoints;

  // Unestimated stories in sprint
  const unestimatedInSprint = allTasks.filter(
    (t) => t.sprint && !t.storyPoints,
  ).length;

  // Stories by priority
  const criticalStories = allTasks.filter(
    (t) => t.priority === "critical" && t.status !== "done",
  ).length;
  const highStories = allTasks.filter(
    (t) => t.priority === "high" && t.status !== "done",
  ).length;

  return (
    <div className="space-y-6">
      {/* Create Project Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Projects</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage and track your product portfolio
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">
                Total Projects
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {totalProjects}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {avgProgress}% avg progress
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
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
                {teamVelocity}{" "}
                <span className="text-sm font-normal text-slate-500">pts</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {completedStoryPoints} pts delivered total
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
              <p className="text-sm text-slate-500 font-medium">At Risk</p>
              <p
                className={`text-2xl font-bold mt-1 ${projectsAtRisk.length > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {projectsAtRisk.length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {criticalStories} critical stories open
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Team Members</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {
                  new Set(projects.flatMap((p) => p.team.map((t) => t.email)))
                    .size
                }
              </p>
              <p className="text-xs text-slate-400 mt-1">
                across {totalProjects} project{totalProjects !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Velocity & Story Points Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-semibold text-purple-700">
              Backlog Stories
            </p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {backlogTasks.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {backlogPoints} pts not yet in sprint
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-blue-700">In Sprint</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {inSprintPoints}{" "}
            <span className="text-sm font-normal text-slate-500">pts</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {unestimatedInSprint > 0
              ? `${unestimatedInSprint} unestimated`
              : "All estimated ✓"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-green-700">Delivered</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {completedStoryPoints}{" "}
            <span className="text-sm font-normal text-slate-500">pts</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {completedTasks.length} stories done
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-semibold text-orange-700">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {inProgressTasks.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {highStories} high priority open
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Project Progress Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Project Progress Overview
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Track progress across all your projects
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/wheel?project=${project.id}`}
                className="block p-5 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {project.description}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: phaseColors[project.phase] }}
                  >
                    {project.phase}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.progress}%`,
                        backgroundColor: phaseColors[project.phase],
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.team.length} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.tasks.filter((t) => t.status === "done").length}/
                      {project.tasks.length} tasks
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </Link>
            ))}

            {projects.length === 0 && (
              <div className="p-12 text-center">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-1">
                  No projects yet
                </h3>
                <p className="text-slate-500 text-sm">
                  Create your first project to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Projects at Risk */}
          {projectsAtRisk.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200">
              <div className="p-5 border-b border-red-100 bg-red-50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold text-red-900">
                    Projects at Risk
                  </h2>
                </div>
              </div>
              <div className="divide-y divide-red-100">
                {projectsAtRisk.map((project) => (
                  <div key={project.id} className="p-4">
                    <p className="font-medium text-slate-900">{project.name}</p>
                    <p className="text-sm text-red-600 mt-1">
                      Progress behind schedule ({project.progress}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Phase Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(phaseColors).map(([phase, color]) => {
                const count = projectsByPhase[phase] || 0;
                const percentage =
                  totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                return (
                  <div key={phase}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{phase}</span>
                      <span className="font-semibold text-slate-900">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
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

export default ProductOwnerDashboard;
