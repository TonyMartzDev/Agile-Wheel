import { useState } from 'react';
import { 
  Code, 
  Plus, 
  MessageSquare, 
  Target,
  CheckCircle2,
  FileText,
  Send,
  User,
  ThumbsUp
} from 'lucide-react';

const DeveloperPlanningWorkspace = ({ 
  sprintBacklog, 
  productBacklog, 
  onCreateStory,
  onEstimateStory,
  onAddTechnicalNotes,
  onAddComment,
  onMarkReady,
  isReady,
  readyPercentage
}) => {
  const [selectedBacklog, setSelectedBacklog] = useState('sprint');
  const [selectedStory, setSelectedStory] = useState(null);
  const [technicalNotes, setTechnicalNotes] = useState('');
  const [commentText, setCommentText] = useState('');
  const [showEstimation, setShowEstimation] = useState(false);

  const fibonacciPoints = [1, 2, 3, 5, 8, 13];

  const handleSaveTechnicalNotes = () => {
    if (selectedStory && technicalNotes.trim()) {
      onAddTechnicalNotes(selectedStory.id, technicalNotes);
      setTechnicalNotes('');
    }
  };

  const handleAddComment = () => {
    if (selectedStory && commentText.trim()) {
      onAddComment(selectedStory.id, commentText);
      setCommentText('');
    }
  };

  const handleEstimate = (points) => {
    if (selectedStory) {
      onEstimateStory(selectedStory.id, points);
      setShowEstimation(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column - Story List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Developer Workspace</h2>
                  <p className="text-xs text-slate-500">Estimate complexity and add technical details</p>
                </div>
              </div>
              <button
                onClick={onCreateStory}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                New Technical Story
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedBacklog('sprint')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedBacklog === 'sprint'
                    ? 'bg-green-100 text-green-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Sprint Backlog ({sprintBacklog.length})
              </button>
              <button
                onClick={() => setSelectedBacklog('product')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedBacklog === 'product'
                    ? 'bg-green-100 text-green-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Product Backlog ({productBacklog.length})
              </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {(selectedBacklog === 'sprint' ? sprintBacklog : productBacklog).map((story) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`bg-white rounded-lg p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
                    selectedStory?.id === story.id
                      ? 'border-green-500 shadow-md'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{story.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2">{story.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        story.priority === 'high' ? 'bg-red-100 text-red-700' :
                        story.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {story.priority}
                      </span>
                      {story.storyPoints ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                          {story.storyPoints} pts
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-700">
                          Not estimated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {story.hasTechnicalNotes && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                        <FileText className="w-3 h-3 inline mr-1" />
                        Tech Notes
                      </span>
                    )}
                    {story.comments && story.comments.length > 0 && (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {story.comments.length}
                      </span>
                    )}
                    {story.assignee ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700">
                        <User className="w-3 h-3 inline mr-1" />
                        {story.assignee}
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs text-slate-500">
                        Unassigned
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Technical Breakdown Editor */}
      <div className="space-y-6">
        {selectedStory ? (
          <>
            {/* Story Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900">Story Details</h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{selectedStory.title}</h3>
                  <p className="text-sm text-slate-600">{selectedStory.description}</p>
                </div>

                {/* Estimation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-900">
                      Story Points
                    </label>
                    <button
                      onClick={() => setShowEstimation(!showEstimation)}
                      className="text-xs text-green-600 hover:text-green-700 font-semibold"
                    >
                      {showEstimation ? 'Cancel' : 'Estimate'}
                    </button>
                  </div>
                  {showEstimation ? (
                    <div className="grid grid-cols-3 gap-2">
                      {fibonacciPoints.map((points) => (
                        <button
                          key={points}
                          onClick={() => handleEstimate(points)}
                          className={`p-3 rounded-lg border-2 font-bold transition-all ${
                            selectedStory.storyPoints === points
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-slate-200 hover:border-green-300 text-slate-700'
                          }`}
                        >
                          {points}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-slate-50 rounded-lg">
                      <span className="text-2xl font-bold text-slate-900">
                        {selectedStory.storyPoints || '?'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedStory.storyPoints ? 'Story Points' : 'Not estimated'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Acceptance Criteria */}
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

            {/* Technical Notes */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Technical Notes
                </h2>
                <p className="text-xs text-slate-500 mt-1">Markdown supported</p>
              </div>
              <div className="p-4 space-y-3">
                {selectedStory.technicalNotes && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-3">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                      {selectedStory.technicalNotes}
                    </pre>
                  </div>
                )}
                <textarea
                  value={technicalNotes}
                  onChange={(e) => setTechnicalNotes(e.target.value)}
                  placeholder="Add technical details...&#10;&#10;Example:&#10;- API Endpoints: POST /api/users&#10;- Database: Add users table&#10;- Dependencies: bcrypt for hashing"
                  rows={6}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm font-mono"
                />
                <button
                  onClick={handleSaveTechnicalNotes}
                  disabled={!technicalNotes.trim()}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Technical Notes
                </button>
              </div>
            </div>

            {/* Comments / Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Comments & Questions
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {selectedStory.comments && selectedStory.comments.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
                    {selectedStory.comments.map((comment, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {comment.author?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-900">{comment.author}</p>
                            <p className="text-sm text-slate-700 mt-1">{comment.text}</p>
                            <p className="text-xs text-slate-500 mt-1">{comment.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Ask a question to the PO..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-8 text-center">
            <Code className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">
              Select a story to add technical details and estimates
            </p>
          </div>
        )}

        {/* Ready to Proceed */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-4">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            Democratic Voting
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            Mark yourself ready when you're confident the sprint is well-planned.
          </p>
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-600">Team Readiness</span>
              <span className="font-semibold text-slate-900">{Math.round(readyPercentage)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${readyPercentage}%` }}
              />
            </div>
          </div>
          <button
            onClick={onMarkReady}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isReady
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg'
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-4 h-4 inline mr-2" />
                Ready to Proceed ✓
              </>
            ) : (
              'Mark as Ready'
            )}
          </button>
          {readyPercentage >= 50 && (
            <p className="text-xs text-green-700 mt-2 text-center font-semibold">
              ✓ Team has reached 50% consensus - ready to advance!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperPlanningWorkspace;
