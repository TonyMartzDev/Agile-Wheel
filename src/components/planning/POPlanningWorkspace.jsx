import { useState } from 'react';
import { 
  Crown, 
  Plus, 
  GripVertical, 
  Star, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';

const POPlanningWorkspace = ({ 
  sprintBacklog, 
  productBacklog, 
  onCreateStory, 
  onApproveStory,
  onRejectStory,
  onReorderStories,
  onUpdateStoryValue,
  onLinkEpic
}) => {
  const [selectedBacklog, setSelectedBacklog] = useState('product');
  const [draggedStory, setDraggedStory] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  const draftStories = productBacklog.filter(s => s.status === 'draft');
  const approvedStories = productBacklog.filter(s => s.status === 'todo');

  const handleDragStart = (e, story, index) => {
    setDraggedStory({ story, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedStory && draggedStory.index !== targetIndex) {
      onReorderStories(draggedStory.index, targetIndex);
    }
    setDraggedStory(null);
  };

  const businessValueOptions = [
    { id: 'critical_path', label: 'Critical Path', color: 'bg-red-100 text-red-700 border-red-300' },
    { id: 'market_differentiator', label: 'Market Differentiator', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { id: 'standard', label: 'Standard', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Priority Ranking Tool */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Priority Ranking</h2>
                  <p className="text-xs text-slate-500">Drag to reorder by priority</p>
                </div>
              </div>
              <button
                onClick={onCreateStory}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                New Story
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedBacklog('product')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedBacklog === 'product'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Product Backlog ({approvedStories.length})
              </button>
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
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {(selectedBacklog === 'product' ? approvedStories : sprintBacklog).map((story, index) => (
                <div
                  key={story.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, story, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => setSelectedStory(story)}
                  className={`bg-white rounded-lg p-4 border-2 transition-all cursor-move hover:shadow-md ${
                    selectedStory?.id === story.id
                      ? 'border-purple-500 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-500">#{index + 1}</span>
                            <h3 className="font-semibold text-slate-900">{story.title}</h3>
                          </div>
                          <p className="text-sm text-slate-600 line-clamp-2">{story.description}</p>
                        </div>
                        <div className="flex flex-col gap-1">
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

                      <div className="flex items-center gap-2 flex-wrap">
                        {story.businessValue && (
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${
                            businessValueOptions.find(v => v.id === story.businessValue)?.color
                          }`}>
                            <Star className="w-3 h-3 inline mr-1" />
                            {businessValueOptions.find(v => v.id === story.businessValue)?.label}
                          </span>
                        )}
                        {story.epic && (
                          <span className="px-2 py-1 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-300">
                            <LinkIcon className="w-3 h-3 inline mr-1" />
                            {story.epic}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Draft Stories Review */}
        {draftStories.length > 0 && (
          <div className="bg-amber-50 rounded-xl shadow-sm border-2 border-amber-300">
            <div className="border-b border-amber-200 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Stories Pending Approval ({draftStories.length})
                </h2>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Review and approve stories created by team members
              </p>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {draftStories.map((story) => (
                <div key={story.id} className="bg-white rounded-lg p-4 border-2 border-amber-300">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{story.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{story.description}</p>
                      <p className="text-xs text-slate-500">
                        Created by: {story.createdBy || 'Team Member'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      story.priority === 'high' ? 'bg-red-100 text-red-700' :
                      story.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {story.priority}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveStory(story.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => onRejectStory(story.id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Story Details & Business Value */}
      <div className="space-y-6">
        {selectedStory ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-4">
              <h2 className="text-lg font-bold text-slate-900">Story Details</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">{selectedStory.title}</h3>
                <p className="text-sm text-slate-600">{selectedStory.description}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Business Value
                </label>
                <div className="space-y-2">
                  {businessValueOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => onUpdateStoryValue(selectedStory.id, option.id)}
                      className={`w-full flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        selectedStory.businessValue === option.id
                          ? option.color + ' shadow-sm'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${
                        selectedStory.businessValue === option.id ? '' : 'text-slate-400'
                      }`} />
                      <span className="font-semibold text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Link to Epic
                </label>
                <select
                  value={selectedStory.epic || ''}
                  onChange={(e) => onLinkEpic(selectedStory.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">No Epic</option>
                  <option value="User Authentication">User Authentication</option>
                  <option value="Payment Integration">Payment Integration</option>
                  <option value="Mobile Experience">Mobile Experience</option>
                  <option value="Admin Dashboard">Admin Dashboard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Acceptance Criteria
                </label>
                <ul className="space-y-2">
                  {selectedStory.acceptanceCriteria?.map((criteria) => (
                    <li key={criteria.id} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{criteria.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Select a story to view details and set business value
            </p>
          </div>
        )}

        {/* Strategic Alignment Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-4">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-purple-600" />
            Strategic Alignment
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Critical Path Stories:</span>
              <span className="font-semibold text-slate-900">
                {approvedStories.filter(s => s.businessValue === 'critical_path').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Market Differentiators:</span>
              <span className="font-semibold text-slate-900">
                {approvedStories.filter(s => s.businessValue === 'market_differentiator').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Linked to Epics:</span>
              <span className="font-semibold text-slate-900">
                {approvedStories.filter(s => s.epic).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default POPlanningWorkspace;
