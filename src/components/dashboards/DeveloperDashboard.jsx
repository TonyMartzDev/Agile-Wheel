import {
  Code,
  CheckCircle2,
  Clock,
  GitBranch,
  Target,
  TrendingUp,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";

const priorityColors = {
  high: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    dot: "bg-yellow-500",
  },
  low: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
};

const DeveloperDashboard = () => {
  const { projects, updateTaskStatus } = useProjects();

  // Get all tasks assigned to current user or all tasks for demo
  const myTasks = projects.flatMap((p) =>
    (p.tasks || []).map((t) => ({
      ...t,
      projectId: p.id,
      projectName: p.name,
    })),
  );

  const todoTasks = myTasks.filter((t) => t.status === "todo");
  const inProgressTasks = myTasks.filter((t) => t.status === "in_progress");
  const completedTasks = myTasks.filter((t) => t.status === "done");
  const readyForTestTasks = myTasks.filter(
    (t) => t.status === "ready_for_test",
  );

  // Stats
  const completedCount = completedTasks.length;

  const handleStartTask = (projectId, taskId) => {
    updateTaskStatus(projectId, taskId, "in_progress");
  };

  const handleCompleteTask = (projectId, taskId) => {
    updateTaskStatus(projectId, taskId, "ready_for_test");
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">To Do</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {todoTasks.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {inProgressTasks.length}
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
              <p className="text-sm text-slate-500 font-medium">
                Ready for Test
              </p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {readyForTestTasks.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {completedCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Current Work */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              In Progress
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tasks you're currently working on
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {inProgressTasks.length > 0 ? (
              inProgressTasks.map((task) => (
                <div key={`${task.projectId}-${task.id}`} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]?.bg} ${priorityColors[task.priority]?.text}`}
                        >
                          {task.priority}
                        </span>
                        <h3 className="font-semibold text-slate-900">
                          {task.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500">
                        {task.projectName}
                      </p>

                      {/* Acceptance Criteria Preview */}
                      {task.acceptanceCriteria &&
                        task.acceptanceCriteria.length > 0 && (
                          <div className="mt-2 text-xs text-slate-500">
                            {
                              task.acceptanceCriteria.filter(
                                (ac) => ac.completed,
                              ).length
                            }
                            /{task.acceptanceCriteria.length} criteria met
                          </div>
                        )}
                    </div>
                    <button
                      onClick={() =>
                        handleCompleteTask(task.projectId, task.id)
                      }
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Done
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No tasks in progress</p>
                <p className="text-sm text-slate-400 mt-1">
                  Pick a task from your backlog to start
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Backlog */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-600" />
              Backlog
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Tasks waiting to be started
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {todoTasks.length > 0 ? (
              todoTasks.map((task) => (
                <div key={`${task.projectId}-${task.id}`} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-2 h-2 rounded-full ${priorityColors[task.priority]?.dot}`}
                        />
                        <h3 className="font-medium text-slate-900">
                          {task.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500">
                        {task.projectName}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartTask(task.projectId, task.id)}
                      className="flex items-center gap-1 border-2 border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-slate-500">Backlog is empty!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-5 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Project Summary
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Overview of your work across projects
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {projects.map((project) => {
            const projectTasks = project.tasks || [];
            const done = projectTasks.filter((t) => t.status === "done").length;
            const inProgress = projectTasks.filter(
              (t) => t.status === "in_progress",
            ).length;
            const todo = projectTasks.filter((t) => t.status === "todo").length;
            const total = projectTasks.length;

            return (
              <div key={project.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {project.description}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-slate-600">
                    {done}/{total} tasks
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  {done > 0 && (
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(done / total) * 100}%` }}
                    />
                  )}
                  {inProgress > 0 && (
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(inProgress / total) * 100}%` }}
                    />
                  )}
                  {todo > 0 && (
                    <div
                      className="h-full bg-slate-300"
                      style={{ width: `${(todo / total) * 100}%` }}
                    />
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Done: {done}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    In Progress: {inProgress}
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-300" />
                    To Do: {todo}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
