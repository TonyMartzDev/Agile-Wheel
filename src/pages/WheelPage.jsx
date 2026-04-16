import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  X,
  CheckCircle2,
  Settings,
  BookOpen,
  Eye,
  Pencil,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../context/ProjectContext";
import ProjectRequirementsModal from "../components/inception/ProjectRequirementsModal";
import WheelBuilderModal from "../components/wheel/WheelBuilderModal";
import { getPresence } from "../utils/presence";

const DEFAULT_PHASES = [
  {
    id: "plan",
    name: "Plan",
    color: "#7c3aed",
    description: "Define project goals, create user stories, and plan sprints",
  },
  {
    id: "design",
    name: "Design",
    color: "#dc2626",
    description: "Create wireframes, mockups, and technical architecture",
  },
  {
    id: "develop",
    name: "Develop",
    color: "#ea580c",
    description: "Write code, implement features, and conduct code reviews",
  },
  {
    id: "test",
    name: "Test",
    color: "#0d9488",
    description: "Run automated tests, QA testing, and bug fixes",
  },
  {
    id: "release",
    name: "Release",
    color: "#0369a1",
    description: "Release to production, monitor performance, and iterate",
  },
  {
    id: "feedback",
    name: "Feedback",
    color: "#15803d",
    description: "Gather user feedback, analyze metrics, and plan improvements",
  },
];

const priorityColors = {
  critical: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    dot: "bg-red-500",
  },
  high: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    dot: "bg-orange-500",
  },
  medium: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    dot: "bg-yellow-500",
  },
  low: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-500",
  },
};

const WheelPage = () => {
  const { user } = useAuth();
  const { projects, savePRD, updateWheelPhases } = useProjects();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hoveredPhase, setHoveredPhase] = useState(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [pulseAnimation] = useState(true);
  const [showPRD, setShowPRD] = useState(false);
  const [showWheelBuilder, setShowWheelBuilder] = useState(false);
  const [livePresence, setLivePresence] = useState(getPresence);

  const isPO = user?.role === "product_owner";
  const isSM = user?.role === "scrum_master";
  const canCustomize = isPO || isSM;

  useEffect(() => {
    const refresh = () => setLivePresence(getPresence());
    const interval = setInterval(refresh, 3000);
    window.addEventListener("agilewheel_presence_changed", refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener("agilewheel_presence_changed", refresh);
    };
  }, []);

  // Get project from URL params or default to first project
  const projectId = searchParams.get("project");
  const currentProject = projectId
    ? projects.find((p) => p.id === projectId) || projects[0]
    : projects[0];

  // Use project's custom wheel phases, falling back to defaults
  const phases = currentProject?.wheelPhases?.length
    ? currentProject.wheelPhases
    : DEFAULT_PHASES;

  // Find the current active phase index by matching phase name (case-insensitive)
  const currentPhaseIndex = Math.max(
    0,
    phases.findIndex(
      (p) => p.name?.toLowerCase() === currentProject?.phase?.toLowerCase(),
    ),
  );

  // Sprint progress calculation
  const activeSprint = currentProject?.sprints?.find(
    (s) => s.status === "active",
  );
  const sprintProgress = activeSprint
    ? calculateSprintProgress(activeSprint)
    : 0;

  // Use project progress for the outer ring, sprint progress for sprint info
  const projectProgress = currentProject?.progress || 0;

  // Calculate smooth gradient color using HSL for better shade transitions
  const getProgressColor = (progress) => {
    // Green hue: 142 (matches Tailwind green-400 to green-800 range)
    // Saturation: 76% (vibrant green)
    // Lightness: Start at 80% (light green) and decrease to 35% (dark green)
    const hue = 142;
    const saturation = 76;
    const startLightness = 80;
    const endLightness = 35;

    const currentLightness =
      startLightness - (progress / 100) * (startLightness - endLightness);

    return `hsl(${hue}, ${saturation}%, ${currentLightness}%)`;
  };

  const progressColor = getProgressColor(projectProgress);

  // Get issues/tasks for a phase based on its position in the wheel
  const getPhaseIssues = (phaseId) => {
    if (!currentProject) return [];
    const idx = phases.findIndex((p) => p.id === phaseId);
    const total = phases.length;
    // Heuristic: first ~20% = todo, middle = in_progress, last ~20% = done
    const earlyThreshold = Math.floor(total * 0.2);
    const lateThreshold = Math.ceil(total * 0.8);
    let statuses;
    if (idx <= earlyThreshold) statuses = ["todo"];
    else if (idx >= lateThreshold) statuses = ["done"];
    else statuses = ["in_progress", "ready_for_test"];
    return (currentProject.tasks || [])
      .filter((t) => statuses.includes(t.status))
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (
          (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
        );
      });
  };

  // Get team members actively working in a phase via live presence
  const getPhaseTeamMembers = (phaseId) => {
    if (!currentProject) return [];
    const inPhase = livePresence.filter(
      (p) => p.projectId === currentProject.id && p.phase === phaseId,
    );
    // Match presence entries to project team members by userId
    return inPhase
      .map(
        (p) =>
          currentProject.team.find((m) => m.id === p.userId) || {
            id: p.userId,
            name: p.userName,
            role: p.userRole,
          },
      )
      .filter(Boolean);
  };

  // Display phase - either hovered or current active
  const displayPhaseIndex =
    hoveredPhase !== null ? hoveredPhase : currentPhaseIndex;
  const displayPhase = phases[displayPhaseIndex] || phases[0];
  const displayIssues = displayPhase ? getPhaseIssues(displayPhase.id) : [];

  return (
    <div
      className="min-h-screen flex"
      style={{
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 100%)",
      }}
    >
      {/* Issues Sidebar */}
      <div
        className="w-72 flex flex-col flex-shrink-0"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Sidebar header */}
        <div
          className="px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white/50 hover:text-white/90 transition-colors group mb-5"
          >
            <div className="p-1.5 rounded-lg group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          {/* Phase badge */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full shadow-lg flex-shrink-0"
              style={{
                backgroundColor: displayPhase.color,
                boxShadow: `0 0 8px ${displayPhase.color}`,
              }}
            />
            <h2 className="text-base font-bold text-white/90 truncate">
              {displayPhase.name}
            </h2>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background:
                  hoveredPhase !== null
                    ? "rgba(148,163,184,0.15)"
                    : "rgba(139,92,246,0.2)",
                color:
                  hoveredPhase !== null ? "rgba(203,213,225,0.8)" : "#c4b5fd",
                border: `1px solid ${hoveredPhase !== null ? "rgba(148,163,184,0.2)" : "rgba(139,92,246,0.3)"}`,
              }}
            >
              {hoveredPhase !== null ? "preview" : "active"}
            </span>
          </div>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayIssues.length > 0 ? (
            displayIssues.map((issue) => (
              <div
                key={issue.id}
                className="rounded-xl p-3.5 transition-all cursor-default group"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[issue.priority]?.dot || "bg-slate-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white/80 text-sm truncate leading-snug">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[issue.priority]?.bg} ${priorityColors[issue.priority]?.text}`}
                      >
                        {issue.priority}
                      </span>
                      {issue.assignee && (
                        <span className="text-xs text-white/40 truncate">
                          {issue.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <CheckCircle2 className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/30 text-sm">No issues here</p>
            </div>
          )}
        </div>

        {/* Sprint Info */}
        {activeSprint && (
          <div
            className="p-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="text-white/50 font-medium">
                {activeSprint.name}
              </span>
              <span className="text-purple-300 font-bold">
                {Math.round(sprintProgress)}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${sprintProgress}%`,
                  background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Wheel Area */}
      <div className="flex-1 flex items-center justify-center relative p-8">
        {/* Project Title */}
        <div className="absolute top-6 left-6">
          <h1 className="text-xl font-bold text-white/90">
            {currentProject?.name || "Project"}
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            {currentProject?.description}
          </p>
        </div>

        {/* User Info */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {/* Customize Wheel - PO & SM only */}
          {canCustomize && (
            <button
              onClick={() => setShowWheelBuilder(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(139,92,246,0.3)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
            >
              <Pencil className="w-4 h-4" />
              Customize Wheel
            </button>
          )}
          {/* Project Requirements Button */}
          {isPO ? (
            <button
              onClick={() => setShowPRD(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg hover:shadow-purple-900/40"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #2563eb)",
              }}
            >
              <BookOpen className="w-4 h-4" />
              Project Requirements
            </button>
          ) : (
            <button
              onClick={() => setShowPRD(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.75)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.14)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
              }
            >
              <Eye className="w-4 h-4" />
              View Requirements
            </button>
          )}
          <Link
            to="/settings"
            className="p-2 rounded-xl transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.9)";
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.45)";
              e.currentTarget.style.background = "transparent";
            }}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <div className="text-right">
            <p className="text-sm font-semibold text-white/85">{user?.name}</p>
            <p className="text-xs text-white/40 capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/20">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>

        {/* Project Name + Mission - positioned above wheel */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10 max-w-2xl px-4 pointer-events-none">
          <h1 className="text-3xl font-bold text-white/90 tracking-tight drop-shadow-lg">
            {currentProject?.name || "Project"}
          </h1>
          {currentProject?.prd?.mission ? (
            <p
              className="text-sm mt-2 italic font-medium"
              style={{ color: "rgba(196,181,253,0.85)" }}
            >
              &ldquo;{currentProject.prd.mission}&rdquo;
            </p>
          ) : (
            <p
              className="text-sm mt-2 italic"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {isPO
                ? 'Open "Project Requirements" to define the mission'
                : "No mission defined yet"}
            </p>
          )}
        </div>

        {/* The Wheel */}
        <div className="relative flex flex-col items-center mt-16">
          {/* Sprint Countdown Ring */}
          <svg
            className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)]"
            viewBox="0 0 240 240"
          >
            <defs>
              <linearGradient
                id="ringGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            {/* Outer decorative ring */}
            <circle
              cx="120"
              cy="120"
              r="116"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="12"
            />
            {/* Progress ring */}
            <circle
              cx="120"
              cy="120"
              r="116"
              fill="none"
              stroke={progressColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 116}`}
              strokeDashoffset={`${2 * Math.PI * 116 * (1 - projectProgress / 100)}`}
              transform="rotate(-90 120 120)"
              style={{
                transition:
                  "stroke 1s ease-in-out, stroke-dashoffset 1s ease-in-out",
              }}
            />
            {/* Progress percentage label */}
            <text
              x="120"
              y="14"
              fill="#64748b"
              fontSize="9"
              fontWeight="600"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {Math.round(projectProgress)}%
            </text>
          </svg>

          {/* Wheel Container */}
          <div
            className="relative w-[80vw] max-w-[860px] min-w-[560px] aspect-square"
            onMouseLeave={() => setHoveredPhase(null)}
          >
            <svg
              className="w-full h-full drop-shadow-2xl"
              viewBox="0 0 200 200"
            >
              <defs>
                <filter
                  id="segGlow"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter
                  id="activeGlow"
                  x="-40%"
                  y="-40%"
                  width="180%"
                  height="180%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient
                  id="centerGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <radialGradient id="centerRadial" cx="50%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </radialGradient>
              </defs>

              {/* Segments */}
              {phases.map((phase, index) => {
                const isCurrentPhase = index === currentPhaseIndex;
                const isHovered = hoveredPhase === index;
                const isLocked = index > currentPhaseIndex;
                const pos = getTextPosition(index, phases.length);

                return (
                  <g key={phase.id || index}>
                    {/* Shadow/depth layer */}
                    <path
                      d={createArrowSegment(index, phases.length)}
                      fill="#000"
                      opacity="0.08"
                      transform="translate(1,2)"
                    />
                    <path
                      d={createArrowSegment(index, phases.length)}
                      fill={isLocked ? "#94a3b8" : phase.color}
                      opacity={
                        isLocked
                          ? 0.35
                          : isHovered
                            ? 1
                            : isCurrentPhase
                              ? 0.95
                              : 0.82
                      }
                      className={`transition-all duration-200 ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                      onMouseEnter={() => !isLocked && setHoveredPhase(index)}
                      onClick={() => {
                        if (isLocked) return;
                        const phaseNameLower = phase.name.toLowerCase();
                        if (phaseNameLower === "plan") {
                          navigate(`/planning?project=${currentProject?.id}`);
                        } else if (phaseNameLower === "design") {
                          navigate(`/design?project=${currentProject?.id}`);
                        }
                      }}
                      filter={
                        isCurrentPhase && pulseAnimation
                          ? "url(#activeGlow)"
                          : isHovered
                            ? "url(#segGlow)"
                            : "none"
                      }
                      style={{
                        animation:
                          isCurrentPhase && pulseAnimation
                            ? "pulse 2.5s ease-in-out infinite"
                            : "none",
                        strokeWidth: isHovered ? "0.5" : "0",
                        stroke: isHovered ? "white" : "none",
                      }}
                    />
                    {/* Phase name */}
                    <text
                      x={pos.x}
                      y={pos.y}
                      fill={isLocked ? "#94a3b8" : "white"}
                      fontSize={
                        phases.length <= 6
                          ? "7.5"
                          : phases.length <= 8
                            ? "6.5"
                            : "5.5"
                      }
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      style={{
                        textShadow: isLocked
                          ? "none"
                          : "0 1px 3px rgba(0,0,0,0.4)",
                        letterSpacing: "0.02em",
                      }}
                      transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
                    >
                      {phase.name}
                    </text>
                    {isLocked && (
                      <text
                        x={pos.x}
                        y={pos.y + 8}
                        fill="#94a3b8"
                        fontSize="5"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none select-none"
                        transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y + 8})`}
                      >
                        🔒
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Center hub — modern layered design */}
              <circle cx="100" cy="100" r="34" fill="#0f172a" opacity="0.06" />
              <circle
                cx="100"
                cy="100"
                r="32"
                fill="url(#centerRadial)"
                stroke="#e2e8f0"
                strokeWidth="1.5"
              />
              <circle
                cx="100"
                cy="100"
                r="28"
                fill="none"
                stroke="url(#centerGradient)"
                strokeWidth="1"
                opacity="0.4"
              />
              {currentProject && (
                <>
                  <text
                    x="100"
                    y="95"
                    fill="#64748b"
                    fontSize="5"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none"
                  >
                    {currentProject.phase?.toUpperCase()}
                  </text>
                  <text
                    x="100"
                    y="106"
                    fill="url(#centerGradient)"
                    fontSize="10"
                    fontWeight="800"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="select-none"
                  >
                    {Math.round(projectProgress)}%
                  </text>
                </>
              )}
            </svg>

            {/* Team Presence Avatars - live from localStorage presence */}
            {phases.map((phase, index) => {
              const teamMembers = getPhaseTeamMembers(phase.id);
              if (teamMembers.length === 0) return null;

              const position = getAvatarPosition(index, phases.length);

              return (
                <div
                  key={`avatars-${index}`}
                  className="absolute flex -space-x-2 cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={() =>
                    setSelectedTeamMember({ phase, members: teamMembers })
                  }
                >
                  {teamMembers.slice(0, 3).map((member) => (
                    <div key={member.id} className="relative">
                      <div
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-lg"
                        style={{
                          border: "2px solid rgba(255,255,255,0.2)",
                          boxShadow: "0 0 12px rgba(139,92,246,0.5)",
                        }}
                        title={`${member.name} — active in ${phase.name}`}
                      >
                        {member.name.charAt(0)}
                      </div>
                      {/* Live indicator dot */}
                      <span
                        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"
                        style={{ border: "2px solid rgba(15,12,41,0.8)" }}
                      />
                    </div>
                  ))}
                  {teamMembers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-lg">
                      +{teamMembers.length - 3}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Description Tooltip */}
        {hoveredPhase !== null && phases[hoveredPhase] && (
          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-2xl p-4 max-w-sm pointer-events-none"
            style={{
              background: "rgba(15,12,41,0.85)",
              backdropFilter: "blur(20px)",
              border: `1px solid ${phases[hoveredPhase].color}55`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${phases[hoveredPhase].color}33`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: phases[hoveredPhase].color,
                  boxShadow: `0 0 8px ${phases[hoveredPhase].color}`,
                }}
              />
              <h3 className="font-bold text-white/90 text-sm">
                {phases[hoveredPhase].name}
              </h3>
              {hoveredPhase > currentPhaseIndex && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Upcoming
                </span>
              )}
              {hoveredPhase === currentPhaseIndex && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: "rgba(74,222,128,0.15)",
                    color: "#4ade80",
                  }}
                >
                  Active
                </span>
              )}
              {hoveredPhase < currentPhaseIndex && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    color: "#c4b5fd",
                  }}
                >
                  Completed
                </span>
              )}
            </div>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              {phases[hoveredPhase].description}
            </p>
          </div>
        )}
      </div>

      {/* Team Member Modal */}
      {selectedTeamMember && (
        <TeamMemberModal
          phase={selectedTeamMember.phase}
          members={selectedTeamMember.members}
          tasks={currentProject?.tasks || []}
          onClose={() => setSelectedTeamMember(null)}
        />
      )}

      {/* Project Requirements Modal */}
      {showPRD && (
        <ProjectRequirementsModal
          project={currentProject}
          currentUser={user}
          readOnly={!isPO}
          onClose={() => setShowPRD(false)}
          onSave={(prdData) => {
            savePRD(currentProject.id, prdData);
          }}
        />
      )}

      {/* Wheel Builder Modal */}
      {showWheelBuilder && currentProject && (
        <WheelBuilderModal
          project={currentProject}
          currentPhaseIndex={currentPhaseIndex}
          onClose={() => setShowWheelBuilder(false)}
          onSave={(newPhases) => {
            updateWheelPhases(currentProject.id, newPhases);
          }}
        />
      )}

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.88; }
          50% { opacity: 1; transform: scale(1.005); }
        }
      `}</style>
    </div>
  );
};

// Helper functions
function calculateSprintProgress(sprint) {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const now = new Date();
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}

// N-phase aware segment geometry
function createArrowSegment(index, total) {
  const segmentAngle = 360 / total;
  const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
  const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

  const innerRadius = 36;
  const outerRadius = 90;
  const midRadius = (innerRadius + outerRadius) / 2;
  // Scale arrow depth with segment size — smaller for many phases
  const arrowDepth = Math.min(
    12,
    (outerRadius - innerRadius) * 0.18 * (6 / total),
  );
  const cx = 100,
    cy = 100;

  const outerStartX = cx + outerRadius * Math.cos(startAngle);
  const outerStartY = cy + outerRadius * Math.sin(startAngle);
  const startNotchX = cx + (midRadius + arrowDepth) * Math.cos(startAngle);
  const startNotchY = cy + (midRadius + arrowDepth) * Math.sin(startAngle);
  const innerStartX = cx + innerRadius * Math.cos(startAngle);
  const innerStartY = cy + innerRadius * Math.sin(startAngle);
  const outerEndX = cx + outerRadius * Math.cos(endAngle);
  const outerEndY = cy + outerRadius * Math.sin(endAngle);
  const endTipX = cx + (midRadius - arrowDepth) * Math.cos(endAngle);
  const endTipY = cy + (midRadius - arrowDepth) * Math.sin(endAngle);
  const innerEndX = cx + innerRadius * Math.cos(endAngle);
  const innerEndY = cy + innerRadius * Math.sin(endAngle);

  // Large arc flag needed when segment > 180°
  const largeArc = segmentAngle > 180 ? 1 : 0;

  return `
    M ${outerStartX} ${outerStartY}
    L ${startNotchX} ${startNotchY}
    L ${innerStartX} ${innerStartY}
    A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEndX} ${innerEndY}
    L ${endTipX} ${endTipY}
    L ${outerEndX} ${outerEndY}
    A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerStartX} ${outerStartY}
    Z
  `;
}

function getTextPosition(index, total) {
  const segmentAngle = 360 / total;
  const midAngle =
    (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
  const textRadius = 64;
  const x = 100 + textRadius * Math.cos(midAngle);
  const y = 100 + textRadius * Math.sin(midAngle);
  const rotation = index * segmentAngle + segmentAngle / 2;
  return { x, y, rotation };
}

function getAvatarPosition(index, total) {
  const segmentAngle = 360 / total;
  const midAngle =
    (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
  const avatarRadius = 52;
  const x = 50 + avatarRadius * Math.cos(midAngle) * 0.5;
  const y = 50 + avatarRadius * Math.sin(midAngle) * 0.5;
  return { x, y };
}

// Team Member Modal Component
const TeamMemberModal = ({ phase, members, tasks, onClose }) => {
  // Get tasks assigned to each member
  const getMemberTasks = (memberName) => {
    return tasks
      .filter((t) => t.assignee === memberName && t.status !== "done")
      .slice(0, 2);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2"
        style={{ borderColor: phase.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: phase.color }}
            />
            <h2 className="text-lg font-bold text-slate-900">
              Team in {phase.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
          {members.map((member) => {
            const memberTasks = getMemberTasks(member.name);

            return (
              <div
                key={member.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {member.role?.replace("_", " ")}
                    </p>
                  </div>
                </div>

                {memberTasks.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 uppercase tracking-wide">
                      Working on:
                    </p>
                    {memberTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority]?.dot || "bg-slate-400"}`}
                        />
                        <span className="text-slate-700 truncate">
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No active tasks
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WheelPage;
