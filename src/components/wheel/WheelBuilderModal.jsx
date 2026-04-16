import { useState } from "react";
import {
  X,
  Plus,
  Trash2,
  GripVertical,
  Check,
  Shuffle,
} from "lucide-react";

const PALETTE = [
  "#7c3aed", "#6d28d9", "#4f46e5", "#2563eb", "#0284c7",
  "#0891b2", "#0d9488", "#059669", "#16a34a", "#65a30d",
  "#ca8a04", "#d97706", "#ea580c", "#dc2626", "#e11d48",
  "#db2777", "#9333ea", "#374151", "#0f172a", "#1e40af",
];

const WheelBuilderModal = ({ project, onClose, onSave }) => {
  const [phases, setPhases] = useState(
    (project.wheelPhases || []).map((p) => ({ ...p })),
  );
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [colorPickerFor, setColorPickerFor] = useState(null);
  const [errors, setErrors] = useState({});

  const MIN_PHASES = 2;
  const MAX_PHASES = 12;

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    phases.forEach((p, i) => {
      if (!p.name?.trim()) errs[p.id] = "Phase name is required";
      const dup = phases.findIndex(
        (other, j) =>
          j !== i && other.name?.trim().toLowerCase() === p.name?.trim().toLowerCase(),
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
    if (phases.length <= MIN_PHASES) return;
    setPhases(phases.filter((p) => p.id !== id));
    setErrors((e) => { const n = { ...e }; delete n[id]; return n; });
  };

  const updatePhase = (id, field, value) => {
    setPhases(phases.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    if (field === "name") setErrors((e) => { const n = { ...e }; delete n[id]; return n; });
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
            <h2 className="text-xl font-bold text-white">Customize Your Wheel</h2>
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
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">
              <strong>{phases.length}</strong> phases · drag rows to reorder
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>min {MIN_PHASES}</span>
            <span>·</span>
            <span>max {MAX_PHASES}</span>
          </div>
        </div>

        {/* Phase list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 ${
                dragOverIndex === index && dragIndex !== index
                  ? "border-purple-400 bg-purple-50 scale-[1.01]"
                  : errors[phase.id]
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              } ${dragIndex === index ? "opacity-40" : "opacity-100"}`}
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 flex-shrink-0">
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Step number */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                style={{ backgroundColor: phase.color }}
              >
                {index + 1}
              </div>

              {/* Name input */}
              <div className="flex-1 min-w-0">
                {editingId === `${phase.id}-desc` ? (
                  <input
                    type="text"
                    value={phase.description}
                    onChange={(e) => updatePhase(phase.id, "description", e.target.value)}
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
                      onChange={(e) => updatePhase(phase.id, "name", e.target.value)}
                      placeholder="Phase name…"
                      className={`w-full font-semibold text-slate-900 bg-transparent outline-none border-b border-transparent focus:border-purple-400 pb-0.5 placeholder:font-normal placeholder:text-slate-400 ${
                        errors[phase.id] ? "border-red-400" : ""
                      }`}
                    />
                    <button
                      className="text-xs text-slate-400 hover:text-slate-600 mt-0.5 truncate max-w-full text-left"
                      onClick={() => setEditingId(`${phase.id}-desc`)}
                    >
                      {phase.description || "Add description…"}
                    </button>
                  </div>
                )}
                {errors[phase.id] && (
                  <p className="text-xs text-red-600 mt-0.5">{errors[phase.id]}</p>
                )}
              </div>

              {/* Color swatch / picker */}
              <div className="relative flex-shrink-0">
                <button
                  className="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-transform"
                  style={{ backgroundColor: phase.color }}
                  onClick={() =>
                    setColorPickerFor(colorPickerFor === phase.id ? null : phase.id)
                  }
                  title="Pick color"
                />
                {colorPickerFor === phase.id && (
                  <div className="absolute right-0 top-10 z-20 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 w-52">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Pick a color</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {PALETTE.map((c) => (
                        <button
                          key={c}
                          className="w-7 h-7 rounded-md hover:scale-110 transition-transform border-2"
                          style={{
                            backgroundColor: c,
                            borderColor: phase.color === c ? "white" : "transparent",
                            boxShadow: phase.color === c ? `0 0 0 2px ${c}` : "none",
                          }}
                          onClick={() => {
                            updatePhase(phase.id, "color", c);
                            setColorPickerFor(null);
                          }}
                        >
                          {phase.color === c && (
                            <Check className="w-3 h-3 text-white mx-auto" />
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
                disabled={phases.length <= MIN_PHASES}
                className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                title={phases.length <= MIN_PHASES ? `Minimum ${MIN_PHASES} phases` : "Remove phase"}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

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
        <div className="p-6 border-t border-slate-200 flex items-center justify-between bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-500">
            Changes apply immediately and carry over to future sprints.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:shadow-lg transition-all"
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
