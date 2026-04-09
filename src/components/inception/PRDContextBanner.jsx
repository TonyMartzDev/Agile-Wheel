import { useState } from "react";
import {
  Target,
  Layers,
  ChevronDown,
  ChevronRight,
  BookOpen,
  MessageSquare,
} from "lucide-react";

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const statusColors = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const PRDContextBanner = ({ project }) => {
  const prd = project?.prd;
  const [expanded, setExpanded] = useState(false);
  const [expandedEpics, setExpandedEpics] = useState({});

  if (!prd || (!prd.mission && !prd.epics?.length && !prd.userNeeds?.length)) {
    return null;
  }

  const toggleEpic = (id) =>
    setExpandedEpics((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalPoints = (epic) =>
    epic.stories?.reduce(
      (sum, s) => sum + (parseInt(s.storyPoints) || 0),
      0
    ) || 0;

  return (
    <div className="bg-white border border-purple-200 rounded-xl shadow-sm mb-6 overflow-hidden">
      {/* Header bar - always visible */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors text-left"
      >
        <BookOpen className="w-4 h-4 text-purple-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-purple-800">
            Project Requirements
          </span>
          {prd.mission && (
            <span className="ml-3 text-sm text-purple-600 italic truncate">
              &ldquo;{prd.mission}&rdquo;
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {prd.epics?.length > 0 && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              {prd.epics.length} Epics
            </span>
          )}
          {prd.prdComments?.length > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {prd.prdComments.length}
            </span>
          )}
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-purple-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-purple-500" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-5 border-t border-purple-100 space-y-5">
          {/* Mission */}
          {prd.mission && (
            <div className="flex items-start gap-3">
              <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Mission
                </p>
                <p className="text-sm text-slate-700 italic">
                  &ldquo;{prd.mission}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Epics & Stories */}
          {prd.epics?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-purple-500" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Epics & User Stories
                </p>
              </div>
              <div className="space-y-2">
                {prd.epics.map((epic) => {
                  const points = totalPoints(epic);
                  return (
                    <div
                      key={epic.id}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      {/* Epic row */}
                      <button
                        onClick={() => toggleEpic(epic.id)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      >
                        {expandedEpics[epic.id] ? (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                        <span className="flex-1 text-sm font-semibold text-slate-800">
                          {epic.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {points > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                              {points} pts
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {epic.stories?.length || 0} stories
                          </span>
                        </div>
                      </button>

                      {/* Stories */}
                      {expandedEpics[epic.id] && epic.stories?.length > 0 && (
                        <div className="divide-y divide-slate-100">
                          {epic.stories.map((story) => (
                            <div
                              key={story.id}
                              className="flex items-center gap-3 px-5 py-2 bg-white"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                              <span className="flex-1 text-sm text-slate-700">
                                {story.title}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${priorityColors[story.priority] || "bg-slate-100 text-slate-600"}`}
                                >
                                  {story.priority}
                                </span>
                                <span
                                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColors[story.status] || "bg-slate-100 text-slate-600"}`}
                                >
                                  {story.status?.replace("_", " ")}
                                </span>
                                {story.storyPoints && (
                                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">
                                    {story.storyPoints} pts
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {expandedEpics[epic.id] &&
                        (!epic.stories || epic.stories.length === 0) && (
                          <div className="px-5 py-3 text-xs text-slate-400 italic bg-white">
                            No stories yet
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Comments preview */}
          {prd.prdComments?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-purple-500" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Team Comments from PRD
                </p>
              </div>
              <div className="space-y-2">
                {prd.prdComments.slice(-3).map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 bg-slate-50 rounded-lg px-4 py-2.5 border border-slate-200"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {comment.author?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700">
                        {comment.author}
                      </span>
                      <span className="text-xs text-slate-400 ml-2">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))}
                {prd.prdComments.length > 3 && (
                  <p className="text-xs text-slate-400 text-center">
                    +{prd.prdComments.length - 3} more comments — view in
                    Project Requirements
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PRDContextBanner;
