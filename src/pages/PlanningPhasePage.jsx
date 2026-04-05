import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Target,
  AlertCircle,
  ChevronRight,
  User,
} from 'lucide-react';

const PlanningPhasePage = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [selectedBacklog, setSelectedBacklog] = useState('sprint');

  const currentProject = projects[0];
  const activeSprint = currentProject?.sprints?.find(s => s.status === 'active');

  const sprintBacklog = currentProject?.tasks?.filter(
    t => t.sprint === activeSprint?.id && t.status === 'todo'
  ) || [];
  
  const productBacklog = currentProject?.tasks?.filter(
    t => !t.sprint && (t.status === 'todo' || t.status === 'draft')
  ) || [];

  const inProgress = currentProject?.tasks?.filter(
    t => t.status === 'in_progress'
  ) || [];

  const teamSize = currentProject?.team?.length || 0;
  const totalStories = sprintBacklog.length;
  const estimatedStories = sprintBacklog.filter(s => s.storyPoints).length;

  const gatekeeperMet = teamSize >= 1 && totalStories >= 2 && estimatedStories >= 2;
  const canOverride = user?.role === 'scrum_master' || user?.role === 'product_owner';

  const [readyVotes, setReadyVotes] = useState([]);
  const developerCount = currentProject?.team?.filter(m => m.role === 'developer').length || 0;
  const readyPercentage = developerCount > 0 ? (readyVotes.length / developerCount) * 100 : 0;

  const priorityColors = {
    high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/wheel"
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Wheel</span>
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">Planning Phase</h1>
                <p className="text-xs text-slate-500">{currentProject?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`mb-6 rounded-xl p-4 border-2 ${gatekeeperMet ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {gatekeeperMet ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5" />
              )}
              <div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {gatekeeperMet ? 'Ready to Advance!' : 'Requirements to Unlock Development Phase'}
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${teamSize >= 1 ? 'bg-green-500' : 'bg-slate-300'}`}>
                      {teamSize >= 1 && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-slate-700">Team Size ≥ 1 ({teamSize} members)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${totalStories >= 2 ? 'bg-green-500' : 'bg-slate-300'}`}>
                      {totalStories >= 2 && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-slate-700">Sprint Backlog ≥ 2 stories ({totalStories} stories)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${estimatedStories >= 2 ? 'bg-green-500' : 'bg-slate-300'}`}>
                      {estimatedStories >= 2 && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-slate-700">Estimated Stories ≥ 2 ({estimatedStories} estimated)</span>
                  </div>
                </div>
              </div>
            </div>
            {(gatekeeperMet || canOverride) && (
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                <span>Advance to Development</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {canOverride && !gatekeeperMet && (
            <p className="text-xs text-amber-700 mt-2 ml-9">
              As {user?.role === 'scrum_master' ? 'Scrum Master' : 'Product Owner'}, you can override and advance anyway.
            </p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200">
                <div className="flex items-center justify-between p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBacklog('sprint')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        selectedBacklog === 'sprint'
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Sprint Backlog ({sprintBacklog.length})
                    </button>
                    <button
                      onClick={() => setSelectedBacklog('product')}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        selectedBacklog === 'product'
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Product Backlog ({productBacklog.length})
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCreateStoryModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    New Story
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                {(selectedBacklog === 'sprint' ? sprintBacklog : productBacklog).length > 0 ? (
                  (selectedBacklog === 'sprint' ? sprintBacklog : productBacklog).map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      priorityColors={priorityColors}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-1">No stories yet</h3>
                    <p className="text-slate-500 text-sm mb-4">Create your first user story to get started</p>
                    <button
                      onClick={() => setShowCreateStoryModal(true)}
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Story
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  In Progress ({inProgress.length})
                </h2>
              </div>
              <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {inProgress.length > 0 ? (
                  inProgress.map((task) => (
                    <div
                      key={task.id}
                      className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                    >
                      <p className="font-medium text-slate-900 text-sm mb-2">{task.title}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                          {task.assignee?.charAt(0) || '?'}
                        </div>
                        <span className="text-xs text-slate-600">{task.assignee}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">No tasks in progress</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Team ({teamSize})
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {currentProject?.team?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{member.role?.replace('_', ' ')}</p>
                    </div>
                    {readyVotes.includes(member.id) && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {developerCount > 1 && !canOverride && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-bold text-slate-900 mb-3">Phase Transition</h3>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600">Developer Readiness</span>
                    <span className="font-semibold text-slate-900">{Math.round(readyPercentage)}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${readyPercentage}%` }}
                    />
                  </div>
                </div>
                <button
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                    readyVotes.includes(user?.id)
                      ? 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  onClick={() => {
                    if (readyVotes.includes(user?.id)) {
                      setReadyVotes(readyVotes.filter(id => id !== user?.id));
                    } else {
                      setReadyVotes([...readyVotes, user?.id]);
                    }
                  }}
                >
                  {readyVotes.includes(user?.id) ? 'Ready ✓' : 'Mark as Ready'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateStoryModal && (
        <CreateStoryModal
          onClose={() => setShowCreateStoryModal(false)}
          activeSprint={activeSprint}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

const StoryCard = ({ story, priorityColors }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isDraft = story.status === 'draft';

  const handleClaimTask = () => {
    console.log('Claiming task:', story.id);
  };

  return (
    <div className={`bg-white rounded-lg p-4 border-2 transition-all hover:shadow-md ${isDraft ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{story.title}</h3>
            {isDraft && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-200 text-amber-800">Draft</span>
            )}
          </div>
          <p className="text-sm text-slate-600 line-clamp-2">{story.description}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityColors[story.priority]?.bg} ${priorityColors[story.priority]?.text}`}>
          {story.priority}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          {story.storyPoints && (
            <div className="flex items-center gap-1 text-sm">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-slate-900">{story.storyPoints} pts</span>
            </div>
          )}
          {story.assignee ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">
                {story.assignee.charAt(0)}
              </div>
              <span className="text-xs text-slate-600">{story.assignee}</span>
            </div>
          ) : (
            <button
              onClick={handleClaimTask}
              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-semibold"
            >
              <User className="w-4 h-4" />
              Claim Task
            </button>
          )}
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-slate-500 hover:text-slate-700 font-medium"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-1">Acceptance Criteria:</p>
            <ul className="space-y-1">
              {story.acceptanceCriteria?.map((criteria) => (
                <li key={criteria.id} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className={`w-3 h-3 mt-0.5 ${criteria.completed ? 'text-green-600' : 'text-slate-400'}`} />
                  <span>{criteria.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateStoryModal = ({ onClose, activeSprint, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acceptanceCriteria: [''],
    priority: 'medium',
    storyPoints: '',
    addToSprint: true,
  });

  const isPO = userRole === 'product_owner';
  const needsApproval = !isPO;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating story:', formData);
    onClose();
  };

  const addCriteria = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [...formData.acceptanceCriteria, ''],
    });
  };

  const updateCriteria = (index, value) => {
    const newCriteria = [...formData.acceptanceCriteria];
    newCriteria[index] = value;
    setFormData({ ...formData, acceptanceCriteria: newCriteria });
  };

  const removeCriteria = (index) => {
    setFormData({
      ...formData,
      acceptanceCriteria: formData.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Create User Story</h2>
          {needsApproval && (
            <p className="text-sm text-amber-600 mt-1">
              This story will be marked as "Draft" until approved by the Product Owner
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., User can delete their account"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description (As a... I want... So that...) *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="As a [user type], I want [goal], so that [benefit]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Acceptance Criteria *</label>
            <div className="space-y-2">
              {formData.acceptanceCriteria.map((criteria, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={criteria}
                    onChange={(e) => updateCriteria(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={`Criteria ${index + 1}`}
                  />
                  {formData.acceptanceCriteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriteria(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCriteria}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                + Add Criteria
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Priority *</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Story Points</label>
              <select
                value={formData.storyPoints}
                onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Not estimated</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="8">8</option>
                <option value="13">13</option>
              </select>
            </div>
          </div>

          {activeSprint && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addToSprint"
                checked={formData.addToSprint}
                onChange={(e) => setFormData({ ...formData, addToSprint: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="addToSprint" className="text-sm text-slate-700">
                Add to {activeSprint.name}
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {needsApproval ? 'Create as Draft' : 'Create Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanningPhasePage;
