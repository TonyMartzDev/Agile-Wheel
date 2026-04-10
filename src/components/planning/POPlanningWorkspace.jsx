import { useState } from "react";
import {
  Crown,
  Plus,
  GripVertical,
  Star,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
  AlertCircle,
  ArrowRight,
  Inbox,
  Zap,
} from "lucide-react";

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const POPlanningWorkspace = ({
  sprintBacklog,
  productBacklog,
  onCreateStory,
  onApproveStory,
  onRejectStory,
  onMoveToSprint,
  hasActiveSprint,
}) => {
  const [dragOverBucket, setDragOverBucket] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const draftStories = productBacklog.filter((s) => s.status === "draft");
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
              <Zap className="w-4 h-4 text-white" />
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
          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {sprintBacklog.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No stories in sprint yet</p>
              </div>
            ) : (
              sprintBacklog.map((story) => (
                <div
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`rounded-lg p-3 border-2 cursor-pointer transition-all hover:shadow-sm ${
                    selectedStory?.id === story.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2">
                    {story.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${priorityColors[story.priority] || "bg-slate-100 text-slate-600"}`}
                    >
                      {story.priority}
                    </span>
                    {story.storyPoints && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-700">
                        {story.storyPoints} pts
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Story details panel */}
        {selectedStory && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="border-b border-slate-200 p-3">
              <h3 className="text-sm font-bold text-slate-900">
                Story Details
              </h3>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-xs text-slate-700 font-medium">
                {selectedStory.title}
              </p>
              {selectedStory.epicName && (
                <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                  <LinkIcon className="w-3 h-3" />
                  {selectedStory.epicName}
                </span>
              )}
              {selectedStory.acceptanceCriteria?.filter((ac) => ac.text)
                .length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">
                    Acceptance Criteria
                  </p>
                  <ul className="space-y-1">
                    {selectedStory.acceptanceCriteria
                      .filter((ac) => ac.text)
                      .map((ac) => (
                        <li
                          key={ac.id}
                          className="flex items-start gap-1.5 text-xs text-slate-600"
                        >
                          <CheckCircle2 className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                          {ac.text}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CENTER COLUMN — Product Backlog Bucket */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
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
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-all"
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
              ? "border-purple-400 bg-purple-50"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          {approvedStories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
              <Inbox
                className={`w-12 h-12 mb-3 transition-colors ${dragOverBucket ? "text-purple-400" : "text-slate-300"}`}
              />
              <p
                className={`text-sm font-medium transition-colors ${dragOverBucket ? "text-purple-600" : "text-slate-400"}`}
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
                        {story.storyPoints && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-purple-100 text-purple-700">
                            {story.storyPoints} pts
                          </span>
                        )}
                        {story.epicName && (
                          <span className="text-xs text-indigo-600 font-medium truncate">
                            {story.epicName}
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
                      <ArrowRight className="w-3 h-3" />
                      Sprint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draft stories pending approval */}
        {draftStories.length > 0 && (
          <div className="bg-amber-50 rounded-xl border-2 border-amber-300">
            <div className="p-3 border-b border-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Pending Approval ({draftStories.length})
              </h3>
            </div>
            <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
              {draftStories.map((story) => (
                <div
                  key={story.id}
                  className="bg-white rounded-lg p-3 border border-amber-300"
                >
                  <p className="text-xs font-semibold text-slate-900 mb-2 line-clamp-2">
                    {story.title}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApproveStory(story.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-2 py-1.5 rounded text-xs font-semibold hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button
                      onClick={() => onRejectStory(story.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-600 text-white px-2 py-1.5 rounded text-xs font-semibold hover:bg-red-700"
                    >
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN — All Stories (drag source) */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  All Stories
                </h2>
                <p className="text-xs text-slate-500">
                  Drag into Product Backlog →
                </p>
              </div>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              {approvedStories.length + sprintBacklog.length}
            </span>
          </div>
          <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
            {approvedStories.length === 0 && sprintBacklog.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No stories yet</p>
                <button
                  onClick={onCreateStory}
                  className="mt-3 text-xs text-purple-600 hover:text-purple-800 font-semibold"
                >
                  + Create your first story
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
                    className={`rounded-lg p-3 border-2 transition-all ${
                      inSprint
                        ? "border-blue-200 bg-blue-50 opacity-60 cursor-default"
                        : "border-slate-200 bg-white cursor-grab hover:border-purple-300 hover:shadow-sm active:cursor-grabbing"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!inSprint && (
                        <GripVertical className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      )}
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
                          {story.storyPoints && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-purple-100 text-purple-700">
                              {story.storyPoints} pts
                            </span>
                          )}
                          {inSprint && (
                            <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-blue-100 text-blue-600">
                              In Sprint
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POPlanningWorkspace;
