import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  Layers,
  BookOpen,
  MessageSquare,
  Save,
  Eye,
  Edit3,
} from "lucide-react";

const STORY_STATUSES = ["todo", "in_progress", "done"];
const STORY_PRIORITIES = ["low", "medium", "high", "critical"];

const statusColors = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const ProjectRequirementsModal = ({
  project,
  onClose,
  onSave,
  readOnly = false,
  currentUser,
}) => {
  const prd = project?.prd || {};

  const [mission, setMission] = useState(prd.mission || "");
  const [userNeeds, setUserNeeds] = useState(prd.userNeeds || []);
  const [epics, setEpics] = useState(prd.epics || []);
  const [prdComments, setPrdComments] = useState(prd.prdComments || []);
  const [newComment, setNewComment] = useState("");
  const [expandedEpics, setExpandedEpics] = useState({});
  const [newNeed, setNewNeed] = useState("");
  const [newEpicTitle, setNewEpicTitle] = useState("");
  const [newStoryInputs, setNewStoryInputs] = useState({});
  const [activeTab, setActiveTab] = useState("mission");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave({ mission, userNeeds, epics, prdComments });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── User Needs ──
  const addUserNeed = () => {
    if (!newNeed.trim()) return;
    setUserNeeds([
      ...userNeeds,
      { id: crypto.randomUUID(), text: newNeed.trim() },
    ]);
    setNewNeed("");
  };

  const removeUserNeed = (id) =>
    setUserNeeds(userNeeds.filter((n) => n.id !== id));

  // ── Epics ──
  const addEpic = () => {
    if (!newEpicTitle.trim()) return;
    const epic = {
      id: crypto.randomUUID(),
      title: newEpicTitle.trim(),
      description: "",
      stories: [],
    };
    setEpics([...epics, epic]);
    setExpandedEpics((prev) => ({ ...prev, [epic.id]: true }));
    setNewEpicTitle("");
  };

  const updateEpic = (id, field, value) =>
    setEpics(epics.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const removeEpic = (id) => setEpics(epics.filter((e) => e.id !== id));

  const toggleEpic = (id) =>
    setExpandedEpics((prev) => ({ ...prev, [id]: !prev[id] }));

  // ── Stories ──
  const addStory = (epicId) => {
    const title = newStoryInputs[epicId]?.trim();
    if (!title) return;
    const story = {
      id: crypto.randomUUID(),
      title,
      description: "",
      priority: "medium",
      status: "todo",
      storyPoints: "",
    };
    setEpics(
      epics.map((e) =>
        e.id === epicId ? { ...e, stories: [...e.stories, story] } : e,
      ),
    );
    setNewStoryInputs((prev) => ({ ...prev, [epicId]: "" }));
  };

  const updateStory = (epicId, storyId, field, value) =>
    setEpics(
      epics.map((e) =>
        e.id === epicId
          ? {
              ...e,
              stories: e.stories.map((s) =>
                s.id === storyId ? { ...s, [field]: value } : s,
              ),
            }
          : e,
      ),
    );

  const removeStory = (epicId, storyId) =>
    setEpics(
      epics.map((e) =>
        e.id === epicId
          ? { ...e, stories: e.stories.filter((s) => s.id !== storyId) }
          : e,
      ),
    );

  // ── Comments ──
  const addComment = () => {
    if (!newComment.trim()) return;
    setPrdComments([
      ...prdComments,
      {
        id: crypto.randomUUID(),
        text: newComment.trim(),
        author: currentUser?.name || "Unknown",
        authorId: currentUser?.id,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewComment("");
  };

  const tabs = [
    { id: "mission", label: "Mission", icon: Target },
    { id: "needs", label: "User Needs", icon: Users },
    { id: "epics", label: "Epics & Stories", icon: Layers },
    { id: "comments", label: "Team Comments", icon: MessageSquare },
  ];

  const totalStories = epics.reduce((acc, e) => acc + e.stories.length, 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-purple-200" />
              <span className="text-purple-200 text-sm font-medium">
                Inception Phase
              </span>
              {readOnly && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Read-only
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              Project Requirements Document
            </h2>
            <p className="text-purple-200 text-sm mt-0.5">
              {project?.name} · {epics.length} Epics · {totalStories} Stories
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!readOnly && (
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-white text-purple-700 hover:bg-purple-50"
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save"}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === "comments" && prdComments.length > 0 && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5 rounded-full">
                    {prdComments.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mission Tab */}
          {activeTab === "mission" && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Project Mission Statement
                  </h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Define the core purpose of this project. This will be
                  displayed at the top of every phase in the Agile Wheel so the
                  entire team stays aligned.
                </p>
                {readOnly ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <p className="text-slate-700 italic text-lg leading-relaxed">
                      {mission || "No mission statement defined yet."}
                    </p>
                  </div>
                ) : (
                  <textarea
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    placeholder="e.g. To empower small businesses by building an affordable, feature-rich platform that helps them compete globally..."
                    className="w-full h-36 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-slate-700"
                  />
                )}
              </div>

              {/* Quick summary card */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                  <p className="text-3xl font-bold text-purple-600">
                    {userNeeds.length}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">User Needs</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                  <p className="text-3xl font-bold text-blue-600">
                    {epics.length}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">Epics</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <p className="text-3xl font-bold text-green-600">
                    {totalStories}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">User Stories</p>
                </div>
              </div>
            </div>
          )}

          {/* User Needs Tab */}
          {activeTab === "needs" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Identify User Needs / Pain Points
                </h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                What problems are users facing? What do they need? These pain
                points drive your Epics.
              </p>

              {!readOnly && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNeed}
                    onChange={(e) => setNewNeed(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addUserNeed()}
                    placeholder="e.g. Users need a way to track their orders in real-time..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={addUserNeed}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              )}

              <div className="space-y-2 mt-4">
                {userNeeds.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No user needs defined yet.</p>
                  </div>
                )}
                {userNeeds.map((need, idx) => (
                  <div
                    key={need.id}
                    className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 group"
                  >
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-slate-700 text-sm">{need.text}</p>
                    {!readOnly && (
                      <button
                        onClick={() => removeUserNeed(need.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Epics & Stories Tab */}
          {activeTab === "epics" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Epics & User Stories
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Epics are large bodies of work. Each Epic can contain User
                Stories that team members will break down and work on. Epics and
                Stories defined here are visible to all team members.
              </p>

              {!readOnly && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newEpicTitle}
                    onChange={(e) => setNewEpicTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addEpic()}
                    placeholder="e.g. User Authentication, Payment System, Dashboard..."
                    className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={addEpic}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Add Epic
                  </button>
                </div>
              )}

              {epics.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No epics yet</p>
                  <p className="text-sm mt-1">
                    Create your first epic to organize user stories
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {epics.map((epic) => (
                  <div
                    key={epic.id}
                    className="border border-slate-200 rounded-xl overflow-hidden"
                  >
                    {/* Epic Header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => toggleEpic(epic.id)}
                    >
                      {expandedEpics[epic.id] ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                      <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                      {readOnly ? (
                        <span className="flex-1 font-semibold text-slate-900">
                          {epic.title}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={epic.title}
                          onChange={(e) =>
                            updateEpic(epic.id, "title", e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 font-semibold text-slate-900 bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-purple-400 rounded px-1"
                        />
                      )}
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {epic.stories.length} stories
                      </span>
                      {epic.stories.reduce(
                        (sum, s) => sum + (parseInt(s.storyPoints) || 0),
                        0,
                      ) > 0 && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                          {epic.stories.reduce(
                            (sum, s) => sum + (parseInt(s.storyPoints) || 0),
                            0,
                          )}{" "}
                          pts total
                        </span>
                      )}
                      {!readOnly && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEpic(epic.id);
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Epic Body */}
                    {expandedEpics[epic.id] && (
                      <div className="p-4 space-y-3">
                        {/* Epic description */}
                        {!readOnly ? (
                          <textarea
                            value={epic.description}
                            onChange={(e) =>
                              updateEpic(epic.id, "description", e.target.value)
                            }
                            placeholder="Describe this epic..."
                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-600"
                            rows={2}
                          />
                        ) : (
                          epic.description && (
                            <p className="text-sm text-slate-500 italic px-1">
                              {epic.description}
                            </p>
                          )
                        )}

                        {/* Stories */}
                        <div className="space-y-2">
                          {epic.stories.map((story) => (
                            <div
                              key={story.id}
                              className="bg-white border border-slate-200 rounded-lg p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  {readOnly ? (
                                    <p className="text-sm font-medium text-slate-900">
                                      {story.title}
                                    </p>
                                  ) : (
                                    <input
                                      type="text"
                                      value={story.title}
                                      onChange={(e) =>
                                        updateStory(
                                          epic.id,
                                          story.id,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full text-sm font-medium text-slate-900 border-none outline-none focus:ring-1 focus:ring-purple-400 rounded px-1"
                                    />
                                  )}
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <select
                                      value={story.priority}
                                      onChange={(e) =>
                                        updateStory(
                                          epic.id,
                                          story.id,
                                          "priority",
                                          e.target.value,
                                        )
                                      }
                                      disabled={readOnly}
                                      className={`text-xs px-2 py-0.5 rounded-full border-none font-medium ${priorityColors[story.priority]} ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                                    >
                                      {STORY_PRIORITIES.map((p) => (
                                        <option key={p} value={p}>
                                          {p}
                                        </option>
                                      ))}
                                    </select>
                                    <select
                                      value={story.status}
                                      onChange={(e) =>
                                        updateStory(
                                          epic.id,
                                          story.id,
                                          "status",
                                          e.target.value,
                                        )
                                      }
                                      disabled={readOnly}
                                      className={`text-xs px-2 py-0.5 rounded-full border-none font-medium ${statusColors[story.status]} ${readOnly ? "cursor-default" : "cursor-pointer"}`}
                                    >
                                      {STORY_STATUSES.map((s) => (
                                        <option key={s} value={s}>
                                          {s.replace("_", " ")}
                                        </option>
                                      ))}
                                    </select>
                                    {!readOnly && (
                                      <label className="flex items-center gap-1 text-xs text-slate-500">
                                        <span>pts:</span>
                                        <input
                                          type="number"
                                          value={story.storyPoints}
                                          onChange={(e) =>
                                            updateStory(
                                              epic.id,
                                              story.id,
                                              "storyPoints",
                                              e.target.value,
                                            )
                                          }
                                          placeholder="0"
                                          className="w-14 text-xs px-1.5 py-0.5 border border-purple-200 rounded text-center font-semibold text-purple-700 focus:ring-1 focus:ring-purple-400 focus:border-transparent"
                                          min="0"
                                        />
                                      </label>
                                    )}
                                    {story.storyPoints && readOnly && (
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                                        {story.storyPoints} pts
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {!readOnly && (
                                  <button
                                    onClick={() =>
                                      removeStory(epic.id, story.id)
                                    }
                                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Add story input */}
                        {!readOnly && (
                          <div className="flex gap-2 mt-2">
                            <input
                              type="text"
                              value={newStoryInputs[epic.id] || ""}
                              onChange={(e) =>
                                setNewStoryInputs((prev) => ({
                                  ...prev,
                                  [epic.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && addStory(epic.id)
                              }
                              placeholder="As a user, I want to..."
                              className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button
                              onClick={() => addStory(epic.id)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              <Plus className="w-3.5 h-3.5" /> Story
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  Team Comments
                </h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Add notes and comments for the team. These are visible to all
                team members across all workspaces.
              </p>

              {/* Add comment */}
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Leave a comment for the team..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Post Comment
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-3 mt-4">
                {prdComments.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No comments yet. Be the first to add one!</p>
                  </div>
                )}
                {[...prdComments].reverse().map((comment) => (
                  <div
                    key={comment.id}
                    className="flex gap-3 bg-slate-50 rounded-xl p-4 border border-slate-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {comment.author?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-900">
                          {comment.author}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50 rounded-b-2xl">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Changes are saved to the project and visible to all team members
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium"
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg"
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save PRD"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectRequirementsModal;
