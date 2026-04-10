import { useState } from "react";
import {
  Code,
  Plus,
  MessageSquare,
  Target,
  CheckCircle2,
  FileText,
  Send,
  User,
  ThumbsUp,
} from "lucide-react";

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const DeveloperPlanningWorkspace = ({
  sprintBacklog,
  productBacklog,
  onCreateStory,
  onEstimateStory,
  onAddTechnicalNotes,
  onAddComment,
  onMarkReady,
  isReady,
  readyPercentage,
  onMoveToSprint,
  hasActiveSprint,
}) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [dragOverBucket, setDragOverBucket] = useState(false);
  const [technicalNotes, setTechnicalNotes] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showEstimation, setShowEstimation] = useState(false);

  const fibonacciPoints = [1, 2, 3, 5, 8, 13];

  const handleSaveTechnicalNotes = () => {
    if (selectedStory && technicalNotes.trim()) {
      onAddTechnicalNotes(selectedStory.id, technicalNotes);
      setTechnicalNotes("");
    }
  };

  const handleAddComment = () => {
    if (selectedStory && commentText.trim()) {
      onAddComment(selectedStory.id, commentText);
      setCommentText("");
    }
  };

  const handleEstimate = (points) => {
    if (selectedStory) {
      onEstimateStory(selectedStory.id, points);
      setShowEstimation(false);
    }
  };

  const approvedStories = productBacklog.filter((s) => s.status === "todo");

  const handleDragStartStory = (e, story) => {
    e.dataTransfer.setData("storyId", story.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverBucket = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverBucket(true);
  };

  const handleDragLeaveBucket = () => setDragOverBucket(false);

  const handleDropOnBucket = (e) => {
    e.preventDefault();
    setDragOverBucket(false);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN — Sprint Backlog */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Sprint Backlog
              </h2>
              <p className="text-xs text-slate-500">
                {sprintBacklog.length} stories committed
              </p>
            </div>
          </div>
          <div className="p-3 space-y-2 max-h-[500px] overflow-y-auto">
            {sprintBacklog.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No stories in sprint yet</p>
              </div>
            ) : (
              sprintBacklog.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`rounded-lg p-3 border-2 cursor-pointer transition-all hover:shadow-sm ${
                    selectedStory?.id === story.id
                      ? "border-green-400 bg-green-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {story.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[story.priority] || "bg-slate-100 text-slate-600"}`}
                    >
                      {story.priority}
                    </span>
                    {story.storyPoints ? (
                      <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-700">
                        {story.storyPoints} pts
                      </span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                        unestimated
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Democratic Voting */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-4">
          <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ThumbsUp className="w-4 h-4 text-green-600" />
            Democratic Voting
          </h3>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">Team Readiness</span>
              <span className="font-semibold text-slate-900">
                {Math.round(readyPercentage)}%
              </span>
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
            className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all ${
              isReady
                ? "bg-green-100 text-green-700 border-2 border-green-300"
                : "bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg"
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-4 h-4 inline mr-1" />
                Ready ✓
              </>
            ) : (
              "Mark as Ready"
            )}
          </button>
        </div>
      </div>

      {/* CENTER COLUMN — Product Backlog Bucket */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Product Backlog
              </h2>
              <p className="text-xs text-slate-500">
                Drag stories here from the right
              </p>
            </div>
          </div>
          <button
            onClick={onCreateStory}
            className="flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Story
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOverBucket}
          onDragLeave={handleDragLeaveBucket}
          onDrop={handleDropOnBucket}
          className={`min-h-[400px] rounded-xl border-2 border-dashed transition-all ${
            dragOverBucket
              ? "border-green-400 bg-green-50"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          {approvedStories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
              <FileText
                className={`w-12 h-12 mb-3 transition-colors ${dragOverBucket ? "text-green-400" : "text-slate-300"}`}
              />
              <p
                className={`text-sm font-medium transition-colors ${dragOverBucket ? "text-green-600" : "text-slate-400"}`}
              >
                {dragOverBucket
                  ? "Drop story here!"
                  : "No Stories in the Backlog"}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Drag from the right panel or click New Story
              </p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {approvedStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                        {story.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[story.priority] || "bg-slate-100 text-slate-600"}`}
                        >
                          {story.priority}
                        </span>
                        {story.storyPoints ? (
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-green-100 text-green-700">
                            {story.storyPoints} pts
                          </span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-600">
                            unestimated
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onMoveToSprint(story.id)}
                      disabled={!hasActiveSprint}
                      title={
                        hasActiveSprint ? "Add to sprint" : "No active sprint"
                      }
                      className="flex-shrink-0 flex items-center gap-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs px-2 py-1.5 rounded-lg font-semibold transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Sprint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN — All Stories + Technical Details */}
      <div className="space-y-4">
        {/* All Stories drag source */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-green-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  All Stories
                </h2>
                <p className="text-xs text-slate-500">
                  Drag into Product Backlog ←
                </p>
              </div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              {approvedStories.length + sprintBacklog.length}
            </span>
          </div>
          <div className="p-3 space-y-2 max-h-[260px] overflow-y-auto">
            {approvedStories.length === 0 && sprintBacklog.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No stories yet</p>
                <button
                  onClick={onCreateStory}
                  className="mt-2 text-xs text-green-600 hover:text-green-800 font-semibold"
                >
                  + Create first story
                </button>
              </div>
            ) : (
              [...approvedStories, ...sprintBacklog].map((story) => {
                const inSprint = sprintBacklog.some((s) => s.id === story.id);
                return (
                  <div
                    key={story.id}
                    draggable={!inSprint}
                    onDragStart={(e) =>
                      !inSprint && handleDragStartStory(e, story)
                    }
                    onClick={() => setSelectedStory(story)}
                    className={`rounded-lg p-2.5 border-2 transition-all ${
                      inSprint
                        ? "border-blue-200 bg-blue-50 opacity-60 cursor-default"
                        : selectedStory?.id === story.id
                          ? "border-green-400 bg-green-50 cursor-grab"
                          : "border-slate-200 bg-white cursor-grab hover:border-green-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {!inSprint && (
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <p className="flex-1 text-xs font-semibold text-slate-800 line-clamp-1">
                        {story.title}
                      </p>
                      {story.storyPoints && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-green-100 text-green-700 flex-shrink-0">
                          {story.storyPoints}p
                        </span>
                      )}
                      {inSprint && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded flex-shrink-0">
                          Sprint
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {selectedStory ? (
          <>
            {/* Story Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="border-b border-slate-200 p-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Story Details
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {selectedStory.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedStory.description}
                  </p>
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
                      {showEstimation ? "Cancel" : "Estimate"}
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
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-slate-200 hover:border-green-300 text-slate-700"
                          }`}
                        >
                          {points}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-slate-50 rounded-lg">
                      <span className="text-2xl font-bold text-slate-900">
                        {selectedStory.storyPoints || "?"}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedStory.storyPoints
                          ? "Story Points"
                          : "Not estimated"}
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
                      <li
                        key={criteria.id}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
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
                <p className="text-xs text-slate-500 mt-1">
                  Markdown supported
                </p>
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
                {selectedStory.comments &&
                  selectedStory.comments.length > 0 && (
                    <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
                      {selectedStory.comments.map((comment, index) => (
                        <div
                          key={index}
                          className="bg-blue-50 rounded-lg p-3 border border-blue-200"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {comment.author?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-slate-900">
                                {comment.author}
                              </p>
                              <p className="text-sm text-slate-700 mt-1">
                                {comment.text}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {comment.timestamp}
                              </p>
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
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
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
      </div>
    </div>
  );
};

export default DeveloperPlanningWorkspace;
