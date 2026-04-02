import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Text,
  Html,
  MeshTransmissionMaterial,
  Float,
} from "@react-three/drei";
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

function createArrowSegmentShape(index, totalSegments = 6) {
  const shape = new THREE.Shape();

  const segmentAngle = (Math.PI * 2) / totalSegments;
  const startAngle = index * segmentAngle;
  const endAngle = (index + 1) * segmentAngle;

  const innerRadius = 1.2;
  const outerRadius = 2.4;
  const midRadius = (innerRadius + outerRadius) / 2;
  const arrowDepth = 0.25;

  const segments = 20;

  // Start at outer edge, beginning of segment
  const outerStartX = Math.cos(startAngle) * outerRadius;
  const outerStartY = Math.sin(startAngle) * outerRadius;

  // Arrow notch point (concave - receives previous arrow)
  const notchX = Math.cos(startAngle) * (midRadius + arrowDepth);
  const notchY = Math.sin(startAngle) * (midRadius + arrowDepth);

  // Inner start
  const innerStartX = Math.cos(startAngle) * innerRadius;
  const innerStartY = Math.sin(startAngle) * innerRadius;

  // Arrow tip point (convex - points into next segment)
  const tipX = Math.cos(endAngle) * (midRadius - arrowDepth);
  const tipY = Math.sin(endAngle) * (midRadius - arrowDepth);

  // Outer end
  const outerEndX = Math.cos(endAngle) * outerRadius;
  const outerEndY = Math.sin(endAngle) * outerRadius;

  // Draw the shape
  shape.moveTo(outerStartX, outerStartY);

  // Notch (concave arrow tail)
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
  );
  const innerPoints = innerCurve.getPoints(segments);
  innerPoints.forEach((p, i) => {
    if (i > 0) shape.lineTo(p.x, p.y);
  });

  // Arrow tip (convex arrow head)
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
  );
  const outerPoints = outerCurve.getPoints(segments);
  outerPoints.forEach((p, i) => {
    if (i > 0) shape.lineTo(p.x, p.y);
  });

  shape.closePath();

  return shape;
}

function ArrowSegment({ index, phase, activeIndex, setActiveIndex }) {
  const meshRef = useRef();
  const isActive = activeIndex === index;

  const shape = useMemo(() => createArrowSegmentShape(index), [index]);

  const extrudeSettings = useMemo(
    () => ({
      steps: 1,
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3,
    }),
    [],
  );

  const geometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [shape, extrudeSettings]);

  // Calculate label position (center of segment)
  const segmentAngle = (Math.PI * 2) / 6;
  const midAngle = (index + 0.5) * segmentAngle;
  const labelRadius = 1.8;
  const labelX = Math.cos(midAngle) * labelRadius;
  const labelY = Math.sin(midAngle) * labelRadius;

  // Animation for hover effect
  useFrame(() => {
    if (meshRef.current) {
      const targetZ = isActive ? 0.3 : 0;
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        0.1,
      );
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerEnter={() => setActiveIndex(index)}
        onPointerLeave={() => setActiveIndex(null)}
        position={[0, 0, 0]}
      >
        <MeshTransmissionMaterial
          color={phase.color}
          thickness={0.5}
          roughness={0.2}
          transmission={0.6}
          ior={1.5}
          chromaticAberration={0.02}
          backside={true}
          emissive={phase.color}
          emissiveIntensity={isActive ? 0.5 : 0.1}
        />
      </mesh>

      {/* Segment Label */}
      <Text
        position={[labelX, labelY, 0.4]}
        fontSize={0.22}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {phase.name}
      </Text>

      {/* Info Card on Hover */}
      {isActive && (
        <Html
          position={[labelX * 1.5, labelY * 1.5, 0.5]}
          center
          distanceFactor={8}
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-lg p-4 w-48 shadow-2xl">
            <h3 className="text-white font-bold text-sm mb-1">{phase.name}</h3>
            <p className="text-slate-300 text-xs">{phase.description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function CenterHub() {
  return (
    <group>
      {/* Center circle */}
      <mesh position={[0, 0, 0.15]}>
        <cylinderGeometry args={[1.1, 1.1, 0.3, 64]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* AGILE text */}
      <Text
        position={[0, 0, 0.35]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
        letterSpacing={0.1}
      >
        AGILE
      </Text>
    </group>
  );
}

function WheelGroup({ activeIndex, setActiveIndex }) {
  const groupRef = useRef();

  // Idle rotation animation
  useFrame((state, delta) => {
    if (groupRef.current && activeIndex === null) {
      groupRef.current.rotation.z += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0]}>
      {phases.map((phase, index) => (
        <ArrowSegment
          key={index}
          index={index}
          phase={phase}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />
      ))}
      <CenterHub />
    </group>
  );
}

function Scene({ activeIndex, setActiveIndex }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, -5, 5]} intensity={0.5} color="#60a5fa" />
      <pointLight position={[5, -5, 5]} intensity={0.5} color="#f472b6" />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <WheelGroup activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </Float>

      <Environment preset="city" />
    </>
  );
}

export default function AgileWheel3D() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full h-[600px] relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene activeIndex={activeIndex} setActiveIndex={setActiveIndex} />
      </Canvas>

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
