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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Issues Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 p-6 flex flex-col shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>

        {/* Phase Issues Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: displayPhase.color }}
            />
            <h2 className="text-lg font-bold text-slate-900">
              {displayPhase.name} Issues
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            {hoveredPhase !== null ? "Preview" : "Current phase"}
          </p>
        </div>

        {/* Issues List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {displayIssues.length > 0 ? (
            displayIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${priorityColors[issue.priority]?.dot || "bg-slate-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {issue.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[issue.priority]?.bg} ${priorityColors[issue.priority]?.text}`}
                      >
                        {issue.priority}
                      </span>
                      {issue.assignee && (
                        <span className="text-xs text-slate-500 truncate">
                          {issue.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No issues in this phase</p>
            </div>
          )}
        </div>

        {/* Sprint Info */}
        {activeSprint && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-600">{activeSprint.name}</span>
              <span className="text-slate-900 font-medium">
                {Math.round(sprintProgress)}% complete
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${sprintProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Wheel Area */}
      <div className="flex-1 flex items-center justify-center relative p-8">
        {/* Project Title */}
        <div className="absolute top-6 left-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {currentProject?.name || "Project"}
          </h1>
          <p className="text-slate-500 text-sm">
            {currentProject?.description}
          </p>
        </div>

        {/* User Info */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          {/* Customize Wheel - PO & SM only */}
          {canCustomize && (
            <button
              onClick={() => setShowWheelBuilder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 hover:border-purple-400 hover:text-purple-700 transition-all text-sm shadow-sm"
            >
              <Pencil className="w-4 h-4" />
              Customize Wheel
            </button>
          )}
          {/* Project Requirements Button */}
          {isPO ? (
            <button
              onClick={() => setShowPRD(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Project Requirements
            </button>
          ) : (
            <button
              onClick={() => setShowPRD(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-all text-sm"
            >
              <Eye className="w-4 h-4" />
              View Requirements
            </button>
          )}
          <Link
            to="/settings"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>

        {/* Project Name + Mission - positioned above wheel */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center z-10 max-w-2xl px-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {currentProject?.name || "Project"}
          </h1>
          {currentProject?.prd?.mission ? (
            <p className="text-sm text-purple-700 mt-2 italic font-medium">
              &ldquo;{currentProject.prd.mission}&rdquo;
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-2 italic">
              {isPO
                ? 'Click "Project Requirements" to define the mission'
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
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold border-2 border-white shadow-lg"
                        title={`${member.name} — active in ${phase.name}`}
                      >
                        {member.name.charAt(0)}
                      </div>
                      {/* Live indicator dot */}
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border border-white animate-pulse" />
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
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl p-4 border-2 shadow-2xl max-w-sm pointer-events-none"
            style={{ borderColor: phases[hoveredPhase].color }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: phases[hoveredPhase].color }}
              />
              <h3 className="font-bold text-slate-900">
                {phases[hoveredPhase].name}
              </h3>
              {hoveredPhase > currentPhaseIndex && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  Upcoming
                </span>
              )}
              {hoveredPhase === currentPhaseIndex && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm">
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
