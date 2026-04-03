import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Target, 
  Plus, 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  LogOut,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import CreateProjectModal from '../components/CreateProjectModal';

const phaseColors = {
  Plan: '#7c3aed',
  Design: '#dc2626',
  Develop: '#ea580c',
  Test: '#0d9488',
  Release: '#0369a1',
  Feedback: '#15803d',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { projects } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.progress < 100).length;
  const totalTasks = projects.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = projects.reduce((acc, p) => acc + p.tasks.filter(t => t.status === 'done').length, 0);

  // Get current user's tasks across all projects
  const myTasks = projects.flatMap(p => 
    p.tasks.filter(t => t.status !== 'done').map(t => ({ ...t, projectName: p.name, projectId: p.id }))
  ).slice(0, 5);

  // Get projects that are falling behind (less than expected progress)
  const projectsAtRisk = projects.filter(p => {
    const daysSinceCreation = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
    const expectedProgress = Math.min(daysSinceCreation * 2, 100);
    return p.progress < expectedProgress - 20;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">AgileWheel</span>
            </Link>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.role || 'Developer'}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-slate-600 mt-1">Here's what's happening with your projects today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total Projects</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalProjects}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Active Projects</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Tasks Completed</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{completedTasks}/{totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Team Members</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {new Set(projects.flatMap(p => p.team.map(t => t.email))).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Projects Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Projects Overview</h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <div key={project.id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer">
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
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${project.progress}%`,
                            backgroundColor: phaseColors[project.phase]
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {project.team.length} members
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.sprints.filter(s => s.status === 'active').length} active sprint
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
                    <p className="text-slate-500 text-sm mb-4">Create your first project to get started</p>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* My Tasks */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900">My Tasks</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {myTasks.length > 0 ? myTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        task.priority === 'high' ? 'bg-red-500' : 
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{task.projectName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        task.status === 'in_progress' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status === 'in_progress' ? 'In Progress' : 'To Do'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No pending tasks
                  </div>
                )}
              </div>
            </div>

            {/* Projects at Risk */}
            {projectsAtRisk.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200">
                <div className="p-6 border-b border-red-100 bg-red-50 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <h2 className="text-lg font-bold text-red-900">Attention Needed</h2>
                  </div>
                </div>
                <div className="divide-y divide-red-100">
                  {projectsAtRisk.map((project) => (
                    <div key={project.id} className="p-4">
                      <p className="font-medium text-slate-900">{project.name}</p>
                      <p className="text-sm text-red-600 mt-1">
                        Progress is behind schedule ({project.progress}%)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Create Project</p>
                    <p className="text-xs text-slate-500">Start a new agile project</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Invite Team</p>
                    <p className="text-xs text-slate-500">Add members to your projects</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors text-left">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Start Sprint</p>
                    <p className="text-xs text-slate-500">Begin a new sprint cycle</p>
                  </div>
                </button>
              </div>
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

export default Dashboard;
