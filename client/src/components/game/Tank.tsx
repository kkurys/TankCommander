import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTankGame } from "../../lib/stores/useTankGame";
import Projectile from "./Projectile";

const Tank = () => {
  const tankRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const turretRef = useRef<THREE.Mesh>(null);
  const barrelRef = useRef<THREE.Mesh>(null);
  
  const {
    tankPosition, 
    tankRotation, 
    setTankPosition,
    projectiles
  } = useTankGame();
  
  // Initialize tank position
  useEffect(() => {
    if (!tankRef.current) return;
    setTankPosition({ x: 0, y: 0.5, z: 0 });
  }, [setTankPosition]);
  
  // Update tank position and rotation
  useFrame(() => {
    if (!tankRef.current) return;
    
    // Update tank position
    tankRef.current.position.set(tankPosition.x, tankPosition.y, tankPosition.z);
    
    // Update tank rotation
    tankRef.current.rotation.y = tankRotation.y;
  });
  
  return (
    <>
      {/* Tank model */}
      <group ref={tankRef}>
        {/* Tank body */}
        <mesh 
          ref={bodyRef}
          position={[0, 0.5, 0]} 
          castShadow
        >
          <boxGeometry args={[2, 0.8, 3]} />
          <meshStandardMaterial color="#4a5568" metalness={0.6} roughness={0.4} />
        </mesh>
        
        {/* Tank tracks (left) */}
        <mesh position={[-1.1, 0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 3.2]} />
          <meshStandardMaterial color="#2d3748" metalness={0.4} roughness={0.7} />
        </mesh>
        
        {/* Tank tracks (right) */}
        <mesh position={[1.1, 0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.4, 3.2]} />
          <meshStandardMaterial color="#2d3748" metalness={0.4} roughness={0.7} />
        </mesh>
        
        {/* Tank turret */}
        <mesh 
          ref={turretRef}
          position={[0, 1.2, 0]} 
          castShadow
        >
          <cylinderGeometry args={[0.8, 1, 0.6, 16]} />
          <meshStandardMaterial color="#4a5568" metalness={0.5} roughness={0.5} />
        </mesh>
        
        {/* Tank barrel */}
        <mesh 
          ref={barrelRef}
          position={[0, 1.2, -1.8]} 
          rotation={[Math.PI / 2, 0, 0]} 
          castShadow
        >
          <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
          <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
      
      {/* Render all active projectiles */}
      {Object.entries(projectiles).map(([id, projectile]) => (
        <Projectile
          key={id}
          position={projectile.position}
          direction={projectile.direction}
        />
      ))}
    </>
  );
};

export default Tank;
