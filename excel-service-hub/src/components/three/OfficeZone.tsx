import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface MonitorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  hueOffset?: number;
}

const Monitor = ({
  position,
  rotation = [0, 0, 0],
  hueOffset = 0,
}: MonitorProps) => {
  const screenRef = useRef<
    THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>
  >(null);
  const colorRef = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock }) => {
    if (!screenRef.current) return;
    const t = clock.elapsedTime * 0.65 + hueOffset;
    const hue = (Math.sin(t) + 1) / 2;
    const saturation = 0.7 + 0.25 * Math.sin(t * 1.7);
    const lightness = 0.55 + 0.2 * Math.cos(t * 1.2);
    colorRef.setHSL(hue * 0.33, saturation, lightness);
    screenRef.current.material.color.copy(colorRef);
    screenRef.current.material.emissive.copy(colorRef);
    screenRef.current.material.emissiveIntensity = 1.25 + 0.4 * Math.sin(t * 2);
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.4]} />
        <meshStandardMaterial color="#1a1f2b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 0.35, -0.1]}>
        <boxGeometry args={[0.15, 0.7, 0.2]} />
        <meshStandardMaterial color="#161922" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh
        ref={screenRef}
        position={[0, 0.95, 0.22]}
        rotation={[-Math.PI * 0.02, 0, 0]}
      >
        <planeGeometry args={[1.4, 0.8, 16, 16]} />
        <meshStandardMaterial
          toneMapped={false}
          emissive="#00ff88"
          color="#00ff88"
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
};

const DeskCluster = () => {
  const people = useMemo(
    () => [
      { position: [-1.5, 0, 0.8], color: "#5eead4" },
      { position: [0, 0, 0.9], color: "#38bdf8" },
      { position: [1.6, 0, 0.7], color: "#fcd34d" },
    ],
    [],
  );

  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 0.2, 2.2]} />
        <meshStandardMaterial color="#1f2933" metalness={0.1} roughness={0.8} />
      </mesh>
      <group position={[-1.9, 0, 0]}>
        <Monitor position={[0, 0, 0]} hueOffset={0.2} />
        <Monitor position={[1.9, 0, 0.15]} hueOffset={1.3} />
      </group>
      <group position={[1.9, 0, 0]}>
        <Monitor position={[0, 0, -0.05]} hueOffset={2.1} />
        <Monitor position={[-1.9, 0, 0.2]} hueOffset={0.7} />
      </group>
      {people.map((person) => (
        <group
          key={`${person.position[0]}-${person.position[2]}`}
          position={[person.position[0], 0.1, person.position[2]]}
        >
          <mesh castShadow position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.32, 32, 32]} />
            <meshStandardMaterial
              color={person.color}
              emissive={person.color}
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh castShadow position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.26, 0.28, 0.9, 24]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 0.08, 24]} />
            <meshStandardMaterial color="#111827" roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

interface OfficeZoneProps {
  emphasized?: boolean;
}

const OfficeZone = ({ emphasized = false }: OfficeZoneProps) => {
  const glowRef = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    if (!glowRef.current) return;
    const mat = glowRef.current.material as THREE.MeshStandardMaterial;
    const pulse = emphasized ? 0.6 + Math.sin(clock.elapsedTime * 1.4) * 0.2 : 0.25;
    mat.emissiveIntensity = pulse;
  });

  return (
    <group position={[0, -0.1, 0]}>
      <mesh
        ref={glowRef}
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.12, 0]}
      >
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#00f7ab"
          emissiveIntensity={0.25}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
      <mesh
        receiveShadow
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
      >
        <circleGeometry args={[7.6, 64]} />
        <meshStandardMaterial color="#101828" roughness={0.9} metalness={0.1} />
      </mesh>
      <DeskCluster />
    </group>
  );
};

export default OfficeZone;
