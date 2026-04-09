import { useState } from "react";
import { X, BookOpen, Layers, Zap, AlertCircle } from "lucide-react";

const FIBONACCI = [1, 2, 3, 5, 8, 13, 21];

const PRIORITIES = [
  {
    value: "low",
    label: "Low",
    color: "bg-green-100 text-green-700 border-green-300",
  },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  {
    value: "high",
    label: "High",
    color: "bg-orange-100 text-orange-700 border-orange-300",
  },
  {
    value: "critical",
    label: "Critical",
    color: "bg-red-100 text-red-700 border-red-300",
  },
];

const CreateStoryModal = ({ onClose, onSave, epics = [] }) => {
  const [asA, setAsA] = useState("");
  const [iWantTo, setIWantTo] = useState("");
  const [soThat, setSoThat] = useState("");
  const [storyPoints, setStoryPoints] = useState(null);
  const [priority, setPriority] = useState("medium");
  const [linkedEpicId, setLinkedEpicId] = useState("");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState([
    { id: crypto.randomUUID(), text: "", completed: false },
  ]);
  const [error, setError] = useState("");

  const addAC = () =>
    setAcceptanceCriteria([
      ...acceptanceCriteria,
      { id: crypto.randomUUID(), text: "", completed: false },
    ]);

  const updateAC = (id, text) =>
    setAcceptanceCriteria(
      acceptanceCriteria.map((ac) => (ac.id === id ? { ...ac, text } : ac)),
    );

  const removeAC = (id) =>
    setAcceptanceCriteria(acceptanceCriteria.filter((ac) => ac.id !== id));

  const handleSave = () => {
    if (!asA.trim() || !iWantTo.trim()) {
      setError("Please fill in at least the 'As a' and 'I want to' fields.");
      return;
    }

    const title = `As a ${asA.trim()}, I want to ${iWantTo.trim()}${soThat.trim() ? `, so that ${soThat.trim()}` : ""}`;
    const linkedEpic = epics.find((e) => e.id === linkedEpicId);

    onSave({
      title,
      description: title,
      priority,
      storyPoints: storyPoints || null,
      epicId: linkedEpicId || null,
      epicName: linkedEpic?.title || null,
      acceptanceCriteria: acceptanceCriteria.filter((ac) => ac.text.trim()),
      status: "todo",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-purple-200" />
            <div>
              <h2 className="text-lg font-bold text-white">
                Create User Story
              </h2>
              <p className="text-purple-200 text-xs">
                Use the standard template to define the story
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Story template */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
              User Story Template
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="mt-2.5 text-sm font-bold text-purple-700 w-20 flex-shrink-0">
                  As a
                </span>
                <input
                  type="text"
                  value={asA}
                  onChange={(e) => {
                    setAsA(e.target.value);
                    setError("");
                  }}
                  placeholder="user / admin / customer..."
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
                  autoFocus
                />
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-2.5 text-sm font-bold text-purple-700 w-20 flex-shrink-0">
                  I want to
                </span>
                <input
                  type="text"
                  value={iWantTo}
                  onChange={(e) => {
                    setIWantTo(e.target.value);
                    setError("");
                  }}
                  placeholder="log in with my email and password..."
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
                />
              </div>

              <div className="flex items-start gap-3">
                <span className="mt-2.5 text-sm font-bold text-purple-700 w-20 flex-shrink-0">
                  So that
                </span>
                <input
                  type="text"
                  value={soThat}
                  onChange={(e) => setSoThat(e.target.value)}
                  placeholder="I can access my account securely... (optional)"
                  className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
                />
              </div>
            </div>

            {/* Preview */}
            {(asA || iWantTo) && (
              <div className="mt-2 bg-white rounded-lg border border-purple-200 px-4 py-3">
                <p className="text-xs text-slate-400 mb-1 font-medium">
                  Preview
                </p>
                <p className="text-sm text-slate-700 italic">
                  As a <strong>{asA || "..."}</strong>, I want to{" "}
                  <strong>{iWantTo || "..."}</strong>
                  {soThat && (
                    <>
                      , so that <strong>{soThat}</strong>
                    </>
                  )}
                  .
                </p>
              </div>
            )}
          </div>

          {/* Story Points */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Zap className="w-4 h-4 text-purple-500" />
              Story Points (Fibonacci)
            </label>
            <div className="flex gap-2 flex-wrap">
              {FIBONACCI.map((pts) => (
                <button
                  key={pts}
                  onClick={() =>
                    setStoryPoints(storyPoints === pts ? null : pts)
                  }
                  className={`w-11 h-11 rounded-lg font-bold text-sm border-2 transition-all ${
                    storyPoints === pts
                      ? "bg-purple-600 text-white border-purple-600 shadow-md scale-110"
                      : "bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700"
                  }`}
                >
                  {pts}
                </button>
              ))}
              <button
                onClick={() => setStoryPoints(null)}
                className={`px-3 h-11 rounded-lg text-xs font-medium border-2 transition-all ${
                  storyPoints === null
                    ? "bg-slate-200 text-slate-700 border-slate-300"
                    : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                }`}
              >
                Clear
              </button>
            </div>
            {storyPoints && (
              <p className="mt-2 text-xs text-purple-600 font-medium">
                {storyPoints === 1 && "Trivial — less than a day"}
                {storyPoints === 2 && "Simple — about a day"}
                {storyPoints === 3 && "Small — a couple of days"}
                {storyPoints === 5 && "Medium — about half a sprint"}
                {storyPoints === 8 && "Large — most of a sprint"}
                {storyPoints === 13 && "Very large — consider breaking down"}
                {storyPoints === 21 && "Epic-level — must be broken down"}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Priority
            </label>
            <div className="flex gap-2 flex-wrap">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                    priority === p.value
                      ? p.color + " scale-105 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link to Epic */}
          {epics.length > 0 && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                <Layers className="w-4 h-4 text-purple-500" />
                Link to Epic (optional)
              </label>
              <select
                value={linkedEpicId}
                onChange={(e) => setLinkedEpicId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-slate-700"
              >
                <option value="">— No epic —</option>
                {epics.map((epic) => (
                  <option key={epic.id} value={epic.id}>
                    {epic.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Acceptance Criteria */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-700">
                Acceptance Criteria
              </label>
              <button
                onClick={addAC}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                + Add criterion
              </button>
            </div>
            <div className="space-y-2">
              {acceptanceCriteria.map((ac, idx) => (
                <div key={ac.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-5 text-right flex-shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={ac.text}
                    onChange={(e) => updateAC(ac.id, e.target.value)}
                    placeholder="Given... When... Then..."
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {acceptanceCriteria.length > 1 && (
                    <button
                      onClick={() => removeAC(ac.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {storyPoints && (
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                {storyPoints} pts
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full font-semibold ${
                PRIORITIES.find((p) => p.value === priority)?.color
              }`}
            >
              {priority}
            </span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
            >
              Add to Backlog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryModal;
