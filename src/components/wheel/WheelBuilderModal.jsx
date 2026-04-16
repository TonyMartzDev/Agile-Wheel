import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Layers,
  Lock,
} from "lucide-react";

const PALETTE = [
  "#7c3aed",
  "#6d28d9",
  "#4f46e5",
  "#2563eb",
  "#0284c7",
  "#0891b2",
  "#0d9488",
  "#059669",
  "#16a34a",
  "#65a30d",
  "#ca8a04",
  "#d97706",
  "#ea580c",
  "#dc2626",
  "#e11d48",
  "#db2777",
  "#9333ea",
  "#64748b",
  "#1e40af",
  "#be185d",
];

const DEFAULT_PHASES = [
  {
    id: "plan",
    name: "Plan",
    color: "#7c3aed",
    description: "Define goals, user stories, and sprints",
  },
  {
    id: "design",
    name: "Design",
    color: "#dc2626",
    description: "Wireframes, mockups, architecture",
  },
  {
    id: "develop",
    name: "Develop",
    color: "#ea580c",
    description: "Code, implement, review",
  },
  {
    id: "test",
    name: "Test",
    color: "#0d9488",
    description: "QA, automation, bug fixes",
  },
  {
    id: "release",
    name: "Release",
    color: "#0369a1",
    description: "Deploy, monitor, iterate",
  },
  {
    id: "feedback",
    name: "Feedback",
    color: "#15803d",
    description: "User feedback, metrics, plan",
  },
];

const WheelBuilderModal = ({
  project,
  onClose,
  onSave,
  currentPhaseIndex = 0,
}) => {
  const sourcePhases = project.wheelPhases?.length
    ? project.wheelPhases
    : DEFAULT_PHASES;
  const [phases, setPhases] = useState(sourcePhases.map((p) => ({ ...p })));
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [colorPickerFor, setColorPickerFor] = useState(null);
  const [errors, setErrors] = useState({});

  const MAX_PHASES = 12;
  // A phase is "completed" when its original index is strictly less than the current active phase
  const isCompleted = (phaseId) => {
    const origIdx = sourcePhases.findIndex((p) => p.id === phaseId);
    return origIdx !== -1 && origIdx < currentPhaseIndex;
  };

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    phases.forEach((p, i) => {
      if (!p.name?.trim()) errs[p.id] = "Phase name is required";
      const dup = phases.findIndex(
        (other, j) =>
          j !== i &&
          other.name?.trim().toLowerCase() === p.name?.trim().toLowerCase(),
      );
      if (dup !== -1) errs[p.id] = "Duplicate phase name";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Phase mutations ────────────────────────────────────────────────────────
  const addPhase = () => {
    if (phases.length >= MAX_PHASES) return;
    const colors = PALETTE.filter((c) => !phases.some((p) => p.color === c));
    const color = colors[0] || PALETTE[phases.length % PALETTE.length];
    setPhases([
      ...phases,
      {
        id: crypto.randomUUID(),
        name: "",
        color,
        description: "",
      },
    ]);
  };

  const removePhase = (id) => {
    if (isCompleted(id)) return;
    if (phases.length <= 1) return;
    setPhases(phases.filter((p) => p.id !== id));
    setErrors((e) => {
      const n = { ...e };
      delete n[id];
      return n;
    });
  };

  const updatePhase = (id, field, value) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    if (field === "name")
      setErrors((e) => {
        const n = { ...e };
        delete n[id];
        return n;
      });
  };

  // ─── Drag-and-drop reorder ─────────────────────────────────────────────────
  const handleDragStart = (e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...phases];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    setPhases(reordered);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(phases);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white">
              Customize Your Wheel
            </h2>
            <p className="text-purple-100 text-sm mt-0.5">
              {project.name} — add, rename, reorder or remove phases
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase count indicator */}
        <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-purple-50/40 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-slate-600">
              <strong className="text-purple-700">{phases.length}</strong>{" "}
              phases
              <span className="text-slate-400 mx-1.5">·</span>
              <span className="text-slate-400">drag to reorder</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {currentPhaseIndex > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                <Lock className="w-3 h-3" />
                {currentPhaseIndex} completed · cannot delete
              </span>
            )}
            <span className="text-xs text-slate-400">max {MAX_PHASES}</span>
          </div>
        </div>

        {/* Phase list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {phases.map((phase, index) => {
            const completed = isCompleted(phase.id);
            const canDrag = !completed;
            return (
              <div
                key={phase.id}
                draggable={canDrag}
                onDragStart={
                  canDrag ? (e) => handleDragStart(e, index) : undefined
                }
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 ${
                  completed
                    ? "border-slate-200 bg-slate-50/80 opacity-70"
                    : dragOverIndex === index && dragIndex !== index
                      ? "border-purple-400 bg-purple-50 scale-[1.01] shadow-md"
                      : errors[phase.id]
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-white hover:border-purple-200 hover:shadow-md hover:bg-purple-50/20"
                } ${dragIndex === index ? "opacity-40" : ""}`}
              >
                {/* Drag handle or lock */}
                <div
                  className={`flex-shrink-0 ${
                    completed
                      ? "text-slate-300 cursor-default"
                      : "text-slate-300 group-hover:text-purple-400 cursor-grab active:cursor-grabbing"
                  }`}
                >
                  {completed ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <GripVertical className="w-5 h-5" />
                  )}
                </div>

                {/* Step badge */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md ring-2 ring-white"
                  style={{
                    backgroundColor: completed ? "#94a3b8" : phase.color,
                  }}
                >
                  {completed ? "✓" : index + 1}
                </div>

                {/* Name + description */}
                <div className="flex-1 min-w-0">
                  {editingId === `${phase.id}-desc` ? (
                    <input
                      type="text"
                      value={phase.description}
                      onChange={(e) =>
                        updatePhase(phase.id, "description", e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      autoFocus
                      placeholder="Short description (optional)"
                      className="w-full text-xs text-slate-500 bg-transparent outline-none border-b border-slate-200 focus:border-purple-400 pb-0.5"
                    />
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={phase.name}
                        onChange={(e) =>
                          updatePhase(phase.id, "name", e.target.value)
                        }
                        placeholder="Phase name…"
                        disabled={completed}
                        className={`w-full font-semibold bg-transparent outline-none border-b border-transparent focus:border-purple-400 pb-0.5 placeholder:font-normal placeholder:text-slate-400 transition-colors ${
                          completed
                            ? "text-slate-400 cursor-default"
                            : "text-slate-900"
                        } ${errors[phase.id] ? "border-red-400" : ""}`}
                      />
                      <button
                        className={`text-xs mt-0.5 truncate max-w-full text-left transition-colors ${
                          completed
                            ? "text-slate-300 cursor-default"
                            : "text-slate-400 hover:text-purple-600"
                        }`}
                        onClick={() =>
                          !completed && setEditingId(`${phase.id}-desc`)
                        }
                      >
                        {phase.description ||
                          (completed ? "" : "Add description…")}
                      </button>
                    </div>
                  )}
                  {errors[phase.id] && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {errors[phase.id]}
                    </p>
                  )}
                </div>

                {/* Color swatch / picker */}
                <div className="relative flex-shrink-0">
                  <button
                    disabled={completed}
                    className={`w-8 h-8 rounded-lg border-2 border-white shadow-md transition-transform ${
                      completed
                        ? "opacity-40 cursor-default"
                        : "hover:scale-110 cursor-pointer"
                    }`}
                    style={{
                      backgroundColor: completed ? "#94a3b8" : phase.color,
                    }}
                    onClick={() =>
                      !completed &&
                      setColorPickerFor(
                        colorPickerFor === phase.id ? null : phase.id,
                      )
                    }
                    title={
                      completed
                        ? "Completed phases cannot be edited"
                        : "Pick color"
                    }
                  />
                  {colorPickerFor === phase.id && (
                    <div className="absolute right-0 top-10 z-20 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-56">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                        Color
                      </p>
                      <div className="grid grid-cols-5 gap-2">
                        {PALETTE.map((c) => (
                          <button
                            key={c}
                            className="w-8 h-8 rounded-lg hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: c,
                              boxShadow:
                                phase.color === c
                                  ? `0 0 0 3px white, 0 0 0 5px ${c}`
                                  : "none",
                            }}
                            onClick={() => {
                              updatePhase(phase.id, "color", c);
                              setColorPickerFor(null);
                            }}
                          >
                            {phase.color === c && (
                              <Check className="w-3.5 h-3.5 text-white mx-auto drop-shadow" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => removePhase(phase.id)}
                  disabled={
                    completed ||
                    phases.filter((p) => !isCompleted(p.id)).length <= 1
                  }
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    completed
                      ? "text-slate-200 cursor-not-allowed"
                      : phases.filter((p) => !isCompleted(p.id)).length <= 1
                        ? "text-slate-200 cursor-not-allowed"
                        : "text-slate-300 hover:text-red-500 hover:bg-red-50"
                  }`}
                  title={
                    completed
                      ? "Cannot delete a completed phase"
                      : phases.filter((p) => !isCompleted(p.id)).length <= 1
                        ? "Must keep at least 1 active phase"
                        : "Remove phase"
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {/* Add phase button */}
          {phases.length < MAX_PHASES && (
            <button
              onClick={addPhase}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Phase</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-purple-50/40 rounded-b-2xl">
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Changes carry forward to all future sprints.
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl hover:from-purple-700 hover:to-blue-600 hover:shadow-lg hover:shadow-purple-200 transition-all"
            >
              Save Wheel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WheelBuilderModal;
