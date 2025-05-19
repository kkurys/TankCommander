import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ProjectileProps {
  position: { x: number; y: number; z: number };
  direction: { x: number; z: number };
}

const Projectile = ({ position, direction }: ProjectileProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create light effect for the projectile
  const lightRef = useRef<THREE.PointLight>(null);
  
  // Initialize the projectile
  useEffect(() => {
    if (!meshRef.current || !lightRef.current) return;
    
    // Position the light at the projectile position
    lightRef.current.position.set(position.x, position.y, position.z);
  }, [position]);
  
  return (
    <group>
      <mesh 
        ref={meshRef} 
        position={[position.x, position.y, position.z]}
        castShadow
      >
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial 
          color="#ff4500"
          emissive="#ff4500"
          emissiveIntensity={2}
        />
      </mesh>
      
      <pointLight 
        ref={lightRef}
        distance={5}
        intensity={2}
        color="#ff4500"
      />
    </group>
  );
};

export default Projectile;
