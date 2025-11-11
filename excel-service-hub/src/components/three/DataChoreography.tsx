import { useFrame } from "@react-three/fiber";
import { MutableRefObject, useMemo, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

interface DataChoreographyProps {
  timelineRef: MutableRefObject<number>;
}

const beamMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#38f8b2"),
  emissive: new THREE.Color("#38f8b2"),
  emissiveIntensity: 0.9,
  metalness: 0.4,
  roughness: 0.2,
  transparent: true,
  opacity: 0.85,
});

const DataChoreography = ({ timelineRef }: DataChoreographyProps) => {
  const ringRef = useRef<THREE.Mesh | null>(null);
  const spiralRef = useRef<THREE.Mesh | null>(null);
  const shardRef = useRef<THREE.Points | null>(null);
  const energyRef = useRef<THREE.Mesh | null>(null);

  const shardGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const points = new Float32Array(450 * 3);
    for (let i = 0; i < 450; i += 1) {
      const angle = (i / 450) * Math.PI * 6;
      const radius = 1.5 + ((Math.sin(i * 2.13) + 1) / 2) * 1.8;
      const y = (Math.cos(i * 3.01) - 0.5) * 1.6;
      points[i * 3] = Math.cos(angle) * radius;
      points[i * 3 + 1] = y;
      points[i * 3 + 2] = Math.sin(angle) * radius;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
    return geometry;
  }, []);

  const shardMaterial = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: "#6fffe0",
        size: 0.05,
        transparent: true,
        opacity: 0.75,
        sizeAttenuation: true,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    const stageTime = timelineRef.current;
    const emphasis = Math.min(Math.max((stageTime - 12) / 12, 0), 1);

    if (ringRef.current) {
      ringRef.current.rotation.y = elapsed * 0.4;
      const mat = ringRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + emphasis * 1.2;
    }

    if (spiralRef.current) {
      spiralRef.current.rotation.y = -elapsed * 0.3;
      spiralRef.current.rotation.x = Math.sin(elapsed * 0.2) * 0.08;
    }

    if (shardRef.current) {
      shardRef.current.rotation.y = elapsed * 0.55;
      (shardRef.current.material as THREE.PointsMaterial).opacity =
        0.3 + emphasis * 0.6;
    }

    if (energyRef.current) {
      const mat = energyRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity =
        0.3 + 0.8 * Math.sin(elapsed * 2.4 + emphasis);
      energyRef.current.scale.y =
        0.8 + Math.sin(elapsed * 3.1 + emphasis) * 0.2 + emphasis * 0.4;
    }
  });

  return (
    <group position={[0, 0, -3]} rotation={[0, -Math.PI / 3, 0]}>
      <group position={[4.5, 0.4, 0]}>
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.4, 0.09, 16, 120]} />
          <meshStandardMaterial
            color="#2563eb"
            metalness={0.7}
            roughness={0.25}
            emissive="#38bdf8"
            emissiveIntensity={0.6}
          />
        </mesh>
        <mesh ref={spiralRef}>
          <tubeGeometry
            args={[
              new THREE.CatmullRomCurve3(
                new Array(240).fill(0).map((_, index) => {
                  const t = index / 240;
                  const angle = t * Math.PI * 4.6;
                  const radius = 0.6 + t * 1.8;
                  return new THREE.Vector3(
                    Math.cos(angle) * radius,
                    (t - 0.5) * 2.5,
                    Math.sin(angle) * radius,
                  );
                }),
              ),
              220,
              0.06,
              16,
              false,
            ]}
          />
          <meshStandardMaterial
            color="#10b981"
            emissive="#22d3ee"
            emissiveIntensity={0.5}
            roughness={0.35}
            metalness={0.6}
          />
        </mesh>
        <mesh
          ref={energyRef}
          position={[0, 0.2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          material={beamMaterial}
        >
          <cylinderGeometry args={[0.28, 0.28, 2.4, 24]} />
        </mesh>
        <points ref={shardRef} geometry={shardGeometry} material={shardMaterial} />
        <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 2.9, 64]} />
          <meshStandardMaterial
            color="#0f172a"
            emissive="#38f8b2"
            emissiveIntensity={0.2}
            roughness={0.85}
            metalness={0.3}
          />
        </mesh>
        <Text
          position={[0, 1.8, 0]}
          fontSize={0.38}
          color="#c4fafe"
          letterSpacing={0.12}
          fontWeight={600}
        >
          DATA FLOW SYNC
        </Text>
      </group>

      <group position={[1.4, 0.2, 0]}>
        {[...Array(4)].map((_, index) => (
          <mesh
            key={index}
            castShadow
            position={[
              index * 1.4,
              Math.sin(index * 0.8) * 0.2,
              Math.cos(index * 0.4) * 0.4,
            ]}
            material={beamMaterial.clone()}
          >
            <boxGeometry args={[1.2, 0.25, 0.6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default DataChoreography;
