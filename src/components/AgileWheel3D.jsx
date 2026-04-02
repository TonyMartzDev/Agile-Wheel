import { useRef, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Html,
  ContactShadows,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { useSpring, animated } from "@react-spring/three";
import * as THREE from "three";

const phases = [
  {
    name: "Plan",
    color: "#FF4500",
    description: "Define project goals, create user stories, and plan sprints",
  },
  {
    name: "Design",
    color: "#FF8C00",
    description: "Create wireframes, mockups, and technical architecture",
  },
  {
    name: "Develop",
    color: "#FFD700",
    description: "Write code, implement features, and conduct code reviews",
  },
  {
    name: "Test",
    color: "#00BFFF",
    description: "Run automated tests, QA testing, and bug fixes",
  },
  {
    name: "Release",
    color: "#4169E1",
    description: "Release to production, monitor performance, and iterate",
  },
  {
    name: "Feedback",
    color: "#20B2AA",
    description: "Gather user feedback, analyze metrics, and plan improvements",
  },
];

function createInterlockingArrowShape(
  index,
  innerRadius,
  outerRadius,
  arrowDepth,
) {
  const segmentAngle = (Math.PI * 2) / 6;
  const startAngle = index * segmentAngle;
  const endAngle = (index + 1) * segmentAngle;
  const midRadius = (innerRadius + outerRadius) / 2;

  const shape = new THREE.Shape();

  // Start at outer edge, beginning of segment
  const outerStartX = Math.cos(startAngle) * outerRadius;
  const outerStartY = Math.sin(startAngle) * outerRadius;

  // Arrow notch point (concave - receives previous arrow)
  const notchX = Math.cos(startAngle) * (midRadius + arrowDepth);
  const notchY = Math.sin(startAngle) * (midRadius + arrowDepth);

  // Inner start
  const innerStartX = Math.cos(startAngle) * innerRadius;
  const innerStartY = Math.sin(startAngle) * innerRadius;

  // Inner end
  const innerEndX = Math.cos(endAngle) * innerRadius;
  const innerEndY = Math.sin(endAngle) * innerRadius;

  // Arrow tip point (convex - points into next segment)
  const tipX = Math.cos(endAngle) * (midRadius - arrowDepth);
  const tipY = Math.sin(endAngle) * (midRadius - arrowDepth);

  // Outer end
  const outerEndX = Math.cos(endAngle) * outerRadius;
  const outerEndY = Math.sin(endAngle) * outerRadius;

  // Draw the shape
  shape.moveTo(outerStartX, outerStartY);

  // Concave notch on leading edge (start)
  shape.lineTo(notchX, notchY);
  shape.lineTo(innerStartX, innerStartY);

  // Inner arc
  const innerCurve = new THREE.EllipseCurve(
    0,
    0,
    innerRadius,
    innerRadius,
    startAngle,
    endAngle,
    false,
    0,
  );
  const innerPoints = innerCurve.getPoints(20);
  innerPoints.forEach((p, i) => {
    if (i > 0) shape.lineTo(p.x, p.y);
  });

  // Convex arrow tip on trailing edge (end)
  shape.lineTo(tipX, tipY);
  shape.lineTo(outerEndX, outerEndY);

  // Outer arc (reverse direction)
  const outerCurve = new THREE.EllipseCurve(
    0,
    0,
    outerRadius,
    outerRadius,
    endAngle,
    startAngle,
    true,
    0,
  );
  const outerPoints = outerCurve.getPoints(20);
  outerPoints.forEach((p, i) => {
    if (i > 0) shape.lineTo(p.x, p.y);
  });

  shape.closePath();

  return shape;
}

function ArrowSegment({
  index,
  phase,
  onHover,
  onUnhover,
  isHovered,
  setActivePhase,
}) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const shape = createInterlockingArrowShape(index, 1.2, 2.5, 0.25);
    const extrudeSettings = {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [index]);

  const { scale, emissiveIntensity } = useSpring({
    scale: isHovered ? 1.1 : 1,
    emissiveIntensity: isHovered ? 0.5 : 0.1,
    config: { mass: 1, tension: 280, friction: 60 },
  });

  // Calculate label position
  const segmentAngle = (Math.PI * 2) / 6;
  const midAngle = (index + 0.5) * segmentAngle;
  const labelRadius = 1.85;
  const labelX = Math.cos(midAngle) * labelRadius;
  const labelY = Math.sin(midAngle) * labelRadius;

  return (
    <animated.group scale={scale}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[0, 0, -0.25]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(index);
          setActivePhase(index);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onUnhover();
        }}
      >
        <animated.meshPhysicalMaterial
          color={phase.color}
          transmission={0.5}
          thickness={1}
          roughness={0.2}
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          emissive={phase.color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Floating Label */}
      <Html
        position={[labelX, labelY, 0.4]}
        center
        distanceFactor={8}
        style={{
          transition: "all 0.3s ease",
          opacity: isHovered ? 1 : 0.8,
          transform: isHovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <div
          className={`px-3 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap transition-all duration-300 ${
            isHovered
              ? "bg-white text-slate-900 shadow-xl"
              : "bg-white/80 text-slate-700 shadow-md"
          }`}
          style={{
            backdropFilter: "blur(8px)",
            border: isHovered
              ? `2px solid ${phase.color}`
              : "1px solid rgba(255,255,255,0.5)",
          }}
        >
          {phase.name}
        </div>
      </Html>
    </animated.group>
  );
}

function CenterCore() {
  return (
    <group position={[0, 0, 0.1]}>
      {/* Main cylinder */}
      <mesh>
        <cylinderGeometry args={[1, 1, 0.6, 64]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* AGILE text */}
      <Html
        position={[0, 0, 0.35]}
        center
        transform
        rotation={[-Math.PI / 2, 0, 0]}
        style={{ pointerEvents: "none" }}
      >
        <div className="text-2xl font-black text-slate-800 tracking-wider select-none">
          AGILE
        </div>
      </Html>
    </group>
  );
}

function WheelScene({ activePhase, setActivePhase }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Main wheel group - rotated to face camera */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        {/* Arrow segments */}
        {phases.map((phase, index) => (
          <ArrowSegment
            key={index}
            index={index}
            phase={phase}
            isHovered={hoveredIndex === index}
            onHover={setHoveredIndex}
            onUnhover={() => setHoveredIndex(null)}
            activePhase={activePhase}
            setActivePhase={setActivePhase}
          />
        ))}

        {/* Center core */}
        <CenterCore />
      </group>

      {/* Contact shadows for grounding */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function AgileWheel3D() {
  const [activePhase, setActivePhase] = useState(0);

  return (
    <div className="relative w-full h-full">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 8], fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <WheelScene activePhase={activePhase} setActivePhase={setActivePhase} />
      </Canvas>

      {/* Description Card Overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
        <div
          className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-6 border-2 transition-all duration-300"
          style={{ borderColor: phases[activePhase].color }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-4 h-4 rounded-full animate-pulse"
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
}
