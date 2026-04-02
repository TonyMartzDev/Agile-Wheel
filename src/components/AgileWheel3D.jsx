import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const phases = [
  {
    name: "Plan",
    description: "Define project goals, create user stories, and plan sprints",
    color: "#dc2626",
  },
  {
    name: "Design",
    description: "Create wireframes, mockups, and technical architecture",
    color: "#ea580c",
  },
  {
    name: "Develop",
    description: "Write code, implement features, and conduct code reviews",
    color: "#f59e0b",
  },
  {
    name: "Test",
    description: "Run automated tests, QA testing, and bug fixes",
    color: "#0ea5e9",
  },
  {
    name: "Release",
    description: "Release to production, monitor performance, and iterate",
    color: "#2563eb",
  },
  {
    name: "Feedback",
    description: "Gather user feedback, analyze metrics, and plan improvements",
    color: "#0d9488",
  },
];

function WheelSegment({ index, color, isActive, onHover, onLeave }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const segmentAngle = (Math.PI * 2) / 6;
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const innerRadius = 1.2;
    const outerRadius = 2.2;
    const midRadius = (innerRadius + outerRadius) / 2;
    const arrowDepth = 0.2;

    const shape = new THREE.Shape();
    const arcSegments = 20;

    // Start at outer edge
    shape.moveTo(
      Math.cos(startAngle) * outerRadius,
      Math.sin(startAngle) * outerRadius,
    );

    // Arrow notch (concave indent on start side)
    shape.lineTo(
      Math.cos(startAngle) * (midRadius + arrowDepth),
      Math.sin(startAngle) * (midRadius + arrowDepth),
    );
    shape.lineTo(
      Math.cos(startAngle) * innerRadius,
      Math.sin(startAngle) * innerRadius,
    );

    // Inner arc
    for (let i = 1; i <= arcSegments; i++) {
      const angle = startAngle + (endAngle - startAngle) * (i / arcSegments);
      shape.lineTo(
        Math.cos(angle) * innerRadius,
        Math.sin(angle) * innerRadius,
      );
    }

    // Arrow tip (convex point on end side)
    shape.lineTo(
      Math.cos(endAngle) * (midRadius - arrowDepth),
      Math.sin(endAngle) * (midRadius - arrowDepth),
    );
    shape.lineTo(
      Math.cos(endAngle) * outerRadius,
      Math.sin(endAngle) * outerRadius,
    );

    // Outer arc (reverse)
    for (let i = arcSegments - 1; i >= 0; i--) {
      const angle = startAngle + (endAngle - startAngle) * (i / arcSegments);
      shape.lineTo(
        Math.cos(angle) * outerRadius,
        Math.sin(angle) * outerRadius,
      );
    }

    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.25,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.computeVertexNormals();
    return geo;
  }, [index]);

  useFrame(() => {
    if (meshRef.current) {
      const targetZ = isActive ? 0.3 : 0;
      meshRef.current.position.z +=
        (targetZ - meshRef.current.position.z) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={[0, 0, 0]}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isActive ? 0.5 : 0.2}
        metalness={0.4}
        roughness={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function CenterHub() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[1.1, 1.1, 0.35, 64]} />
      <meshStandardMaterial color="#f1f5f9" metalness={0.2} roughness={0.3} />
    </mesh>
  );
}

function Wheel({ activeIndex, setActiveIndex }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current && activeIndex === null) {
      groupRef.current.rotation.z += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0, 0]}>
      {phases.map((phase, index) => (
        <WheelSegment
          key={index}
          index={index}
          color={phase.color}
          isActive={activeIndex === index}
          onHover={() => setActiveIndex(index)}
          onLeave={() => setActiveIndex(null)}
        />
      ))}
      <CenterHub />
    </group>
  );
}

export default function AgileWheel3D() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, -3, 3]} intensity={0.5} />
        <Wheel activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </Canvas>

      {/* Center Label */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ marginTop: "-20px" }}
      >
        <span className="text-slate-900 font-black text-2xl tracking-widest drop-shadow-lg">
          AGILE
        </span>
      </div>

      {/* Phase Description Card */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-4">
        <div
          className="bg-slate-900/80 backdrop-blur-md rounded-xl p-6 border transition-all duration-300"
          style={{
            borderColor:
              activeIndex !== null ? phases[activeIndex].color : "#334155",
            boxShadow:
              activeIndex !== null
                ? `0 0 30px ${phases[activeIndex].color}40`
                : "none",
          }}
        >
          {activeIndex !== null ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: phases[activeIndex].color }}
                />
                <h3
                  className="font-bold text-xl"
                  style={{ color: phases[activeIndex].color }}
                >
                  {phases[activeIndex].name}
                </h3>
              </div>
              <p className="text-slate-300">
                {phases[activeIndex].description}
              </p>
            </>
          ) : (
            <p className="text-slate-400 text-center">
              Hover over a segment to learn more about each phase
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
