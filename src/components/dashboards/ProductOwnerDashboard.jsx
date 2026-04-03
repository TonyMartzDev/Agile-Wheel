import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Users,
  ChevronRight,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

const phaseColors = {
  Plan: '#7c3aed',
  Design: '#dc2626',
  Develop: '#ea580c',
  Test: '#0d9488',
  Release: '#0369a1',
  Feedback: '#15803d',
};

const ProductOwnerDashboard = () => {
  const { projects } = useProjects();

  // Calculate stats
  const totalProjects = projects.length;
  const avgProgress = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
    : 0;

  // Projects at risk (behind schedule)
  const projectsAtRisk = projects.filter(p => {
    const daysSinceCreation = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
    const expectedProgress = Math.min(daysSinceCreation * 2, 100);
    return p.progress < expectedProgress - 20;
  });

  // Projects by phase
  const projectsByPhase = projects.reduce((acc, p) => {
    acc[p.phase] = (acc[p.phase] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Projects</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalProjects}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Avg Progress</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{avgProgress}%</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">At Risk</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{projectsAtRisk.length}</p>
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
                {new Set(projects.flatMap(p => p.team.map(t => t.email))).size}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
          </div>
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
            <p className="text-sm text-slate-500 mt-1">Track progress across all your projects</p>
          </div>

          <div className="divide-y divide-slate-100">
            {projects.map((project) => (
              <div key={project.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{project.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{project.description}</p>
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
                    <span className="font-semibold text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${project.progress}%`,
                        backgroundColor: phaseColors[project.phase]
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
                      {project.tasks.filter(t => t.status === 'done').length}/{project.tasks.length} tasks
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}

            {projects.length === 0 && (
              <div className="p-12 text-center">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-1">No projects yet</h3>
                <p className="text-slate-500 text-sm">Create your first project to get started</p>
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
                  <h2 className="text-lg font-bold text-red-900">Projects at Risk</h2>
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
            <h2 className="text-lg font-bold text-slate-900 mb-4">Phase Distribution</h2>
            <div className="space-y-3">
              {Object.entries(phaseColors).map(([phase, color]) => {
                const count = projectsByPhase[phase] || 0;
                const percentage = totalProjects > 0 ? (count / totalProjects) * 100 : 0;
                return (
                  <div key={phase}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{phase}</span>
                      <span className="font-semibold text-slate-900">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOwnerDashboard;
