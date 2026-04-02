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

  const createArrowSegment = (index, isActive) => {
    const segmentAngle = 60;
    const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

    const innerRadius = 38;
    const outerRadius = isActive ? 95 : 90;
    const arrowTipRadius = isActive ? 105 : 100;

    const cx = 100;
    const cy = 100;

    // Inner arc start
    const innerStartX = cx + innerRadius * Math.cos(startAngle);
    const innerStartY = cy + innerRadius * Math.sin(startAngle);

    // Outer arc start
    const outerStartX = cx + outerRadius * Math.cos(startAngle);
    const outerStartY = cy + outerRadius * Math.sin(startAngle);

    // Arrow tip (at the end/middle of segment)
    const arrowTipX = cx + arrowTipRadius * Math.cos(endAngle);
    const arrowTipY = cy + arrowTipRadius * Math.sin(endAngle);

    // Outer arc end (before arrow tip)
    const outerEndX = cx + outerRadius * Math.cos(endAngle - 0.15);
    const outerEndY = cy + outerRadius * Math.sin(endAngle - 0.15);

    // Inner arc end
    const innerEndX = cx + innerRadius * Math.cos(endAngle);
    const innerEndY = cy + innerRadius * Math.sin(endAngle);

    // Arrow notch (inner part of arrow)
    const notchRadius = outerRadius - 15;
    const notchX = cx + notchRadius * Math.cos(endAngle);
    const notchY = cy + notchRadius * Math.sin(endAngle);

    const pathData = `
      M ${innerStartX} ${innerStartY}
      L ${outerStartX} ${outerStartY}
      A ${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY}
      L ${arrowTipX} ${arrowTipY}
      L ${notchX} ${notchY}
      L ${innerEndX} ${innerEndY}
      A ${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY}
      Z
    `;

    return pathData;
  };

  const getTextPosition = (index) => {
    const segmentAngle = 60;
    const midAngle =
      (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
    const textRadius = 65;

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
                  d={createArrowSegment(index, isActive)}
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

          {/* Center Circle */}
          <circle
            cx="100"
            cy="100"
            r="32"
            fill="white"
            className="drop-shadow-lg"
          />
          <text
            x="100"
            y="100"
            fill="#1e293b"
            fontSize="14"
            fontWeight="bold"
            textAnchor="middle"
            dominantBaseline="middle"
            className="select-none"
          >
            AGILE
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
