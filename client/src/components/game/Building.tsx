import { useRef, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useTankGame } from "../../lib/stores/useTankGame";

interface BuildingProps {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  health: number;
  maxHealth: number;
}

const Building = ({ id, position, size, color, health, maxHealth }: BuildingProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const woodTexture = useTexture("/textures/wood.jpg");
  const { addExplosion } = useTankGame();
  
  // Configure texture
  useEffect(() => {
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
  }, [woodTexture]);
  
  // Detect health changes to apply damage effects
  useEffect(() => {
    if (!meshRef.current) return;
    
    const healthPercent = health / maxHealth;
    
    // Scale the building down as it gets damaged
    if (healthPercent < 1) {
      const targetScaleY = Math.max(0.2, healthPercent);
      meshRef.current.scale.y = targetScaleY;
      
      // Create an explosion effect when building takes damage
      if (health > 0 && health < maxHealth) {
        addExplosion({
          id: `explosion-${id}-${Date.now()}`,
          position: { 
            x: position[0], 
            y: position[1] + size[1]/2, 
            z: position[2] 
          },
          size: 1 + (1 - healthPercent) * 2,
          processed: false
        });
      }
    }
    
    // Move the building down when scaled to keep bottom at ground level
    const scaledHeight = size[1] * meshRef.current.scale.y;
    meshRef.current.position.y = scaledHeight / 2;
    
    // If health reaches zero, create a bigger explosion and hide
    if (health <= 0 && meshRef.current.visible) {
      addExplosion({
        id: `destruction-${id}-${Date.now()}`,
        position: { 
          x: position[0], 
          y: position[1] + size[1]/2, 
          z: position[2] 
        },
        size: 3,
        processed: false
      });
      
      // Hide the building
      meshRef.current.visible = false;
    }
    
  }, [health, maxHealth, position, size, id, addExplosion]);
  
  // Skip rendering if already destroyed
  if (health <= 0) {
    return null;
  }
  
  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1] + size[1]/2, position[2]]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={size} />
      <meshStandardMaterial 
        map={woodTexture}
        color={color} 
        roughness={0.7}
        metalness={0.2}
      />
    </mesh>
  );
};

export default Building;
