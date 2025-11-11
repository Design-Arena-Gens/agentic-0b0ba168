import { useFrame } from "@react-three/fiber";
import { MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface BrandPortalProps {
  timelineRef: MutableRefObject<number>;
}

const BrandPortal = ({ timelineRef }: BrandPortalProps) => {
  const ribbonRef = useRef<THREE.Mesh | null>(null);
  const haloRef = useRef<THREE.Mesh | null>(null);
  const prismRef = useRef<THREE.Mesh | null>(null);
  const sparkGroup = useRef<THREE.Group | null>(null);

  const sparkData = useMemo(
    () =>
      new Array(45).fill(0).map((_, index) => ({
        angle: (index / 45) * Math.PI * 2,
        radius: 1.4 + ((Math.sin(index * 2.7) + 1) / 2) * 0.8,
        height: -0.4 + Math.cos(index * 1.9) * 0.6,
        speed: 0.6 + ((Math.sin(index * 3.3) + 1) / 2) * 0.8,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const emphasis = Math.max((timelineRef.current - 28) / 12, 0);

    if (ribbonRef.current) {
      ribbonRef.current.rotation.y = elapsed * 0.55;
      ribbonRef.current.position.y = Math.sin(elapsed * 1.1) * 0.15;
    }

    if (haloRef.current) {
      haloRef.current.rotation.y = -elapsed * 0.35;
      haloRef.current.scale.setScalar(1 + emphasis * 0.4);
    }

    if (prismRef.current) {
      prismRef.current.rotation.x = elapsed * 0.45;
      prismRef.current.rotation.y = elapsed * 0.32;
      prismRef.current.rotation.z = elapsed * 0.28;
      const mat = prismRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + emphasis * 1.4;
    }

    if (sparkGroup.current) {
      sparkGroup.current.children.forEach((spark, index) => {
        const data = sparkData[index];
        const phase = elapsed * (0.8 + data.speed * 0.2);
        const yMotion = Math.sin(phase + data.angle) * 0.4;
        spark.position.set(
          Math.cos(phase + data.angle) * data.radius,
          data.height + yMotion * 0.4,
          Math.sin(phase + data.angle) * data.radius,
        );
        spark.scale.setScalar(
          0.4 + emphasis * 0.6 + Math.sin(phase) * 0.2,
        );
      });
    }
  });

  return (
    <group position={[0, 0.6, 3]} rotation={[0, Math.PI / 5, 0]}>
      <group position={[0, 0.6, 0]}>
        <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 2.2, 64]} />
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#22d3ee"
            emissiveIntensity={0.7}
            transparent
            opacity={0.7}
            metalness={0.6}
            roughness={0.25}
          />
        </mesh>
        <mesh ref={ribbonRef}>
          <torusKnotGeometry args={[1.1, 0.09, 180, 12, 2, 3]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#6ee7b7"
            emissiveIntensity={0.6}
            roughness={0.35}
            metalness={0.8}
          />
        </mesh>
        <mesh ref={prismRef} position={[0, 0.2, 0]}>
          <octahedronGeometry args={[0.9, 1]} />
          <meshStandardMaterial
            color="#bef264"
            emissive="#d9f99d"
            emissiveIntensity={0.4}
            roughness={0.35}
            metalness={0.7}
          />
        </mesh>
        <group ref={sparkGroup}>
          {sparkData.map((_, index) => (
            <mesh key={`spark-${index}`}>
              <icosahedronGeometry args={[0.12, 0]} />
              <meshStandardMaterial
                color="#f87171"
                emissive="#facc15"
                emissiveIntensity={1.2}
                roughness={0.2}
                metalness={0.6}
              />
            </mesh>
          ))}
        </group>
      </group>

      <mesh
        position={[0, -0.8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <circleGeometry args={[2.6, 64]} />
        <meshStandardMaterial
          color="#020817"
          emissive="#0ea5e9"
          emissiveIntensity={0.18}
          roughness={0.95}
          metalness={0.08}
        />
      </mesh>

      <Text position={[-1.8, -0.6, 0.4]} fontSize={0.5} letterSpacing={0.04} color="#f8fafc">
        Excel Service Hub
      </Text>
      <Text position={[-1.6, -0.95, 0.6]} fontSize={0.24} letterSpacing={0.08} color="#a5f3fc">
        Your Data • Our Responsibility
      </Text>
    </group>
  );
};

export default BrandPortal;
