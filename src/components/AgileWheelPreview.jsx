import { useState, useEffect } from "react";
import { Target } from "lucide-react";

const AgileWheelPreview = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const phases = [
    {
      name: "Planning",
      description:
        "Define project goals, create user stories, and plan sprints",
      color: "#0ea5e9",
      angle: 0,
    },
    {
      name: "Design",
      description: "Create wireframes, mockups, and technical architecture",
      color: "#3b82f6",
      angle: 60,
    },
    {
      name: "Development",
      description: "Write code, implement features, and conduct code reviews",
      color: "#6366f1",
      angle: 120,
    },
    {
      name: "Testing",
      description: "Run automated tests, QA testing, and bug fixes",
      color: "#8b5cf6",
      angle: 180,
    },
    {
      name: "Review",
      description: "Sprint review, stakeholder feedback, and retrospectives",
      color: "#a855f7",
      angle: 240,
    },
    {
      name: "Deploy",
      description: "Release to production, monitor performance, and iterate",
      color: "#0284c7",
      angle: 300,
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

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-8">
      {/* Wheel Container */}
      <div className="relative w-96 h-96 mb-8" onMouseLeave={handleMouseLeave}>
        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-primary-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl z-10 transition-transform duration-300 hover:scale-110">
          <Target
            className="w-12 h-12 text-white animate-spin"
            style={{ animationDuration: "8s" }}
          />
        </div>

        {/* Wheel Segments */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
        >
          {phases.map((phase, index) => {
            const isActive = activePhase === index;
            const startAngle = index * 60 * (Math.PI / 180);
            const endAngle = (index + 1) * 60 * (Math.PI / 180);
            const innerRadius = 50;
            const outerRadius = isActive ? 105 : 100;

            const x1 = 100 + innerRadius * Math.cos(startAngle);
            const y1 = 100 + innerRadius * Math.sin(startAngle);
            const x2 = 100 + outerRadius * Math.cos(startAngle);
            const y2 = 100 + outerRadius * Math.sin(startAngle);
            const x3 = 100 + outerRadius * Math.cos(endAngle);
            const y3 = 100 + outerRadius * Math.sin(endAngle);
            const x4 = 100 + innerRadius * Math.cos(endAngle);
            const y4 = 100 + innerRadius * Math.sin(endAngle);

            const largeArcFlag = 0;

            const pathData = `
              M ${x1} ${y1}
              L ${x2} ${y2}
              A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
              L ${x4} ${y4}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
              Z
            `;

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={phase.color}
                  opacity={isActive ? 1 : 0.7}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => handlePhaseHover(index)}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 4px 12px rgba(0,0,0,0.3))"
                      : "none",
                    transform: isActive ? "scale(1.02)" : "scale(1)",
                    transformOrigin: "100px 100px",
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Phase Labels */}
        {phases.map((phase, index) => {
          const angle = (index * 60 + 30) * (Math.PI / 180);
          const radius = 165;
          const x = 192 + radius * Math.cos(angle - Math.PI / 2);
          const y = 192 + radius * Math.sin(angle - Math.PI / 2);
          const isActive = activePhase === index;

          return (
            <div
              key={`label-${index}`}
              className="absolute text-base font-semibold transition-all duration-300 whitespace-nowrap"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: "translate(-50%, -50%)",
                color: isActive ? phase.color : "#64748b",
                fontSize: isActive ? "1.1rem" : "1rem",
                fontWeight: isActive ? "700" : "600",
              }}
            >
              {phase.name}
            </div>
          );
        })}
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
