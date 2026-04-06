import { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Settings,
  BarChart3,
  Zap
} from 'lucide-react';

const SMPlanningWorkspace = ({ 
  sprintBacklog, 
  teamMembers,
  teamVelocity,
  sprintCapacity,
  onSetCapacity,
  onOverridePhase,
  gatekeeperStatus
}) => {
  const [capacityInput, setCapacityInput] = useState(sprintCapacity || 40);
  const [showCapacityEdit, setShowCapacityEdit] = useState(false);

  // Calculate current sprint load
  const currentLoad = sprintBacklog.reduce((sum, story) => sum + (story.storyPoints || 0), 0);
  const capacityUtilization = sprintCapacity > 0 ? (currentLoad / sprintCapacity) * 100 : 0;
  
  // Stress meter logic
  const isOverCapacity = currentLoad > sprintCapacity;
  const isNearCapacity = capacityUtilization > 80 && capacityUtilization <= 100;
  const stressLevel = isOverCapacity ? 'critical' : isNearCapacity ? 'warning' : 'healthy';

  const handleSaveCapacity = () => {
    onSetCapacity(capacityInput);
    setShowCapacityEdit(false);
  };

  const stressColors = {
    healthy: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', bar: 'bg-green-500' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300', bar: 'bg-amber-500' },
    critical: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', bar: 'bg-red-500' },
  };

  const currentStressColor = stressColors[stressLevel];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Capacity & Velocity */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stress Meter */}
        <div className={`rounded-xl shadow-sm border-2 ${currentStressColor.border} ${currentStressColor.bg}`}>
          <div className="p-4 border-b border-opacity-30" style={{ borderColor: 'currentColor' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentStressColor.bar}`}>
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Sprint Stress Meter</h2>
                  <p className={`text-sm ${currentStressColor.text}`}>
                    {stressLevel === 'critical' && 'Team is over capacity!'}
                    {stressLevel === 'warning' && 'Approaching capacity limit'}
                    {stressLevel === 'healthy' && 'Healthy sprint load'}
                  </p>
                </div>
              </div>
              {isOverCapacity && (
                <AlertTriangle className={`w-6 h-6 ${currentStressColor.text} animate-pulse`} />
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">Current Load vs Capacity</span>
              <span className={`font-bold ${currentStressColor.text}`}>
                {currentLoad} / {sprintCapacity} points ({Math.round(capacityUtilization)}%)
              </span>
            </div>
            <div className="h-6 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${currentStressColor.bar} transition-all duration-500 relative`}
                style={{ width: `${Math.min(capacityUtilization, 100)}%` }}
              >
                {capacityUtilization > 100 && (
                  <div className="absolute inset-0 animate-pulse opacity-50 bg-white" />
                )}
              </div>
            </div>
            {isOverCapacity && (
              <p className="text-xs text-red-700 mt-2 font-semibold">
                ⚠️ Exceeding capacity by {currentLoad - sprintCapacity} points - consider removing stories or increasing capacity
              </p>
            )}
          </div>
        </div>

        {/* Team Velocity & Capacity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Capacity Planning</h2>
                  <p className="text-xs text-slate-500">Set sprint capacity and track velocity</p>
                </div>
              </div>
              <button
                onClick={() => setShowCapacityEdit(!showCapacityEdit)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                {showCapacityEdit ? 'Cancel' : 'Edit Capacity'}
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {showCapacityEdit && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Available Story Points for Sprint
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={capacityInput}
                    onChange={(e) => setCapacityInput(parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 40"
                  />
                  <button
                    onClick={handleSaveCapacity}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Based on team size and historical velocity
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-600">Team Velocity</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{teamVelocity || 35}</p>
                <p className="text-xs text-slate-500 mt-1">pts/sprint avg</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-600">Team Size</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{teamMembers.length}</p>
                <p className="text-xs text-slate-500 mt-1">active members</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-slate-600">Sprint Capacity</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{sprintCapacity}</p>
                <p className="text-xs text-slate-500 mt-1">total points</p>
              </div>
            </div>

            {/* Historical Velocity Chart (Placeholder) */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Last 3 Sprints</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {[32, 38, 35].map((velocity, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-blue-200 rounded-t relative" style={{ height: `${(velocity / 40) * 100}%` }}>
                      <div className="absolute -top-6 left-0 right-0 text-center">
                        <span className="text-xs font-semibold text-slate-700">{velocity}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">Sprint {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sprint Backlog Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <h2 className="text-lg font-bold text-slate-900">Sprint Backlog ({sprintBacklog.length} stories)</h2>
          </div>
          <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
            {sprintBacklog.map((story) => (
              <div key={story.id} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm">{story.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{story.assignee || 'Unassigned'}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      story.priority === 'high' ? 'bg-red-100 text-red-700' :
                      story.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {story.priority}
                    </span>
                    {story.storyPoints && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                        {story.storyPoints} pts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Gatekeeper & Controls */}
      <div className="space-y-6">
        {/* Gatekeeper Checklist */}
        <div className={`rounded-xl shadow-sm border-2 ${
          gatekeeperStatus.met ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-300'
        }`}>
          <div className="p-4 border-b border-opacity-30" style={{ borderColor: 'currentColor' }}>
            <div className="flex items-center gap-2">
              {gatekeeperStatus.met ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              )}
              <h2 className="text-lg font-bold text-slate-900">Gatekeeper Status</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Overall Progress</span>
              <span className={`text-sm font-bold ${
                gatekeeperStatus.met ? 'text-green-700' : 'text-amber-700'
              }`}>
                {gatekeeperStatus.progress}%
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  gatekeeperStatus.met ? 'bg-green-500' : 'bg-amber-500'
                }`}
                style={{ width: `${gatekeeperStatus.progress}%` }}
              />
            </div>

            <div className="space-y-2 mt-4">
              {gatekeeperStatus.requirements.map((req, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    req.met ? 'bg-green-500' : 'bg-slate-300'
                  }`}>
                    {req.met && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{req.label}</p>
                    <p className="text-xs text-slate-500">{req.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Active Team ({teamMembers.length})
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-semibold">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{member.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{member.role?.replace('_', ' ')}</p>
                </div>
                {member.ready && (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Phase Override */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Scrum Master Controls
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            As Scrum Master, you can override gatekeeper requirements and advance the team when ready.
          </p>
          <button
            onClick={onOverridePhase}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <span>Advance to Development</span>
            <ChevronRight className="w-4 h-4" />
          </button>
          {!gatekeeperStatus.met && (
            <p className="text-xs text-blue-700 mt-2 text-center">
              Override active - requirements not fully met
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SMPlanningWorkspace;
