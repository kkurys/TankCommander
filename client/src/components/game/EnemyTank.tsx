import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTankGame } from "../../lib/stores/useTankGame";

interface EnemyTankProps {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  color: string;
}

const EnemyTank = ({ id, position, rotation, color }: EnemyTankProps) => {
  const tankRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const turretRef = useRef<THREE.Mesh>(null);
  const barrelRef = useRef<THREE.Mesh>(null);
  const { damageEnemyTank, enemyTanks, updateEnemyTank } = useTankGame();
  
  // Update enemy tank position and rotation
  useFrame((_, delta) => {
    if (!tankRef.current) return;
    
    // Update tank position
    tankRef.current.position.set(position.x, position.y, position.z);
    
    // Update tank rotation
    tankRef.current.rotation.y = rotation;
    
    // Every few seconds, we'll update the tank's behavior
    const tank = enemyTanks[id];
    if (!tank) return;
    
    // Update the tank's movement state and target
    const moveTimer = tank.moveTimer - delta;
    const fireTimer = tank.fireTimer - delta;
    
    // Check if it's time to change direction
    if (moveTimer <= 0) {
      // Random new direction and duration
      const newRotation = Math.random() * Math.PI * 2;
      const newMoveTimer = 2 + Math.random() * 4; // 2-6 seconds
      
      updateEnemyTank(id, {
        ...tank,
        rotation: newRotation,
        moveTimer: newMoveTimer,
      });
    } else {
      // Move in current direction
      const speed = 3 * delta;
      const dirX = Math.sin(tank.rotation) * speed;
      const dirZ = Math.cos(tank.rotation) * speed;
      
      // Check for boundaries
      const newX = Math.max(-45, Math.min(45, position.x + dirX));
      const newZ = Math.max(-45, Math.min(45, position.z + dirZ));
      
      updateEnemyTank(id, {
        ...tank,
        position: { ...position, x: newX, z: newZ },
        moveTimer,
        fireTimer,
      });
    }
    
    // Check if tank should fire
    if (fireTimer <= 0) {
      // Reset fire timer
      updateEnemyTank(id, {
        ...tank,
        fireTimer: 3 + Math.random() * 5, // 3-8 seconds between firing
      });
      
      // Fire a projectile (you could implement this similar to player tank)
      // fireTankProjectile(tank.position, tank.rotation, true);
    }
  });
  
  // Skip rendering if tank is destroyed
  if (enemyTanks[id]?.health <= 0) {
    return null;
  }
  
  return (
    <group ref={tankRef} position={[position.x, position.y, position.z]} rotation={[0, rotation, 0]}>
      {/* Enemy Tank model - similar to player tank but with different color */}
      {/* Tank body */}
      <mesh 
        ref={bodyRef}
        position={[0, 0.5, 0]} 
        castShadow
      >
        <boxGeometry args={[2, 0.8, 3]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
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
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Tank barrel */}
      <mesh 
        ref={barrelRef}
        position={[0, 1.2, 1.8]} 
        rotation={[Math.PI / 2, 0, 0]} 
        castShadow
      >
        <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
        <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
};

export default EnemyTank;