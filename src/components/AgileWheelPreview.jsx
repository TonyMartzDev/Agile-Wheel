import { useState, useEffect } from "react";

const AgileWheelPreview = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const phases = [
    {
      name: "Plan",
      description:
        "Define project goals, create user stories, and plan sprints",
      color: "#7c3aed", // Dark purple
    },
    {
      name: "Design",
      description: "Create wireframes, mockups, and technical architecture",
      color: "#dc2626", // Dark red
    },
    {
      name: "Develop",
      description: "Write code, implement features, and conduct code reviews",
      color: "#ea580c", // Dark orange
    },
    {
      name: "Test",
      description: "Run automated tests, QA testing, and bug fixes",
      color: "#0d9488", // Dark teal
    },
    {
      name: "Release",
      description: "Release to production, monitor performance, and iterate",
      color: "#0369a1", // Dark blue
    },
    {
      name: "Feedback",
      description:
        "Gather user feedback, analyze metrics, and plan improvements",
      color: "#15803d", // Dark green
    },
  ];

  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setActivePhase((prev) => (prev + 1) % phases.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAnimating, phases.length]);

  const handlePhaseHover = (index) => {
    setIsAnimating(false);
    setActivePhase(index);
  };

  const handleMouseLeave = () => {
    setIsAnimating(true);
  };

  const total = phases.length;

  const createArrowSegment = (index) => {
    const segmentAngle = 360 / total;
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
    const innerRadius = 36;
    const outerRadius = 90;
    const midRadius = (innerRadius + outerRadius) / 2;
    const arrowDepth = Math.min(
      12,
      (outerRadius - innerRadius) * 0.18 * (6 / total),
    );
    const cx = 100,
      cy = 100;
    const largeArc = segmentAngle > 180 ? 1 : 0;
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
    return `M ${outerStartX} ${outerStartY} L ${startNotchX} ${startNotchY} L ${innerStartX} ${innerStartY} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${innerEndX} ${innerEndY} L ${endTipX} ${endTipY} L ${outerEndX} ${outerEndY} A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${outerStartX} ${outerStartY} Z`;
  };

  const getTextPosition = (index) => {
    const segmentAngle = 360 / total;
    const midAngle =
      (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
    const textRadius = 64;
    const x = 100 + textRadius * Math.cos(midAngle);
    const y = 100 + textRadius * Math.sin(midAngle);
    const rotation = index * segmentAngle + segmentAngle / 2;
    return { x, y, rotation };
  };

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-8">
      {/* Wheel Container */}
      <div className="relative w-96 h-96 mb-8" onMouseLeave={handleMouseLeave}>
        {/* Wheel SVG */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {/* Arrow Segments */}
          {phases.map((phase, index) => {
            const isActive = activePhase === index;

            return (
              <g key={index}>
                <path
                  d={createArrowSegment(index)}
                  fill={phase.color}
                  opacity={isActive ? 1 : 0.85}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => handlePhaseHover(index)}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
                      : "none",
                  }}
                />
                {/* Text inside segment */}
                <text
                  x={getTextPosition(index).x}
                  y={getTextPosition(index).y}
                  fill="white"
                  fontSize={isActive ? "9" : "8"}
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none transition-all duration-300"
                  style={{
                    textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                  }}
                  transform={`rotate(${getTextPosition(index).rotation}, ${getTextPosition(index).x}, ${getTextPosition(index).y})`}
                >
                  {phase.name}
                </text>
              </g>
            );
          })}

          {/* Center hub */}
          <defs>
            <radialGradient id="previewCenterRadial" cx="50%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </radialGradient>
            <linearGradient
              id="previewCenterGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="34" fill="#0f172a" opacity="0.06" />
          <circle
            cx="100"
            cy="100"
            r="32"
            fill="url(#previewCenterRadial)"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <circle
            cx="100"
            cy="100"
            r="28"
            fill="none"
            stroke="url(#previewCenterGrad)"
            strokeWidth="1"
            opacity="0.5"
          />
          <text
            x="100"
            y="97"
            fill="#64748b"
            fontSize="5.5"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            className="select-none"
          >
            AGILE
          </text>
          <text
            x="100"
            y="107"
            fill="url(#previewCenterGrad)"
            fontSize="7"
            fontWeight="800"
            textAnchor="middle"
            dominantBaseline="middle"
            className="select-none"
          >
            WHEEL
          </text>
        </svg>
      </div>

      {/* Phase Description Card */}
      <div className="w-full max-w-lg">
        <div
          className="bg-white rounded-lg shadow-xl p-6 border-2 transition-all duration-300"
          style={{ borderColor: phases[activePhase].color }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: phases[activePhase].color }}
            />
            <h3
              className="font-bold text-xl"
              style={{ color: phases[activePhase].color }}
            >
              {phases[activePhase].name}
            </h3>
          </div>
          <p className="text-slate-600">{phases[activePhase].description}</p>
        </div>
      </div>
    </div>
  );
};

export default AgileWheelPreview;
