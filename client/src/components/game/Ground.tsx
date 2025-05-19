import { useRef, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTankGame } from "../../lib/stores/useTankGame";
import { generateTerrain } from "../../lib/terrain";

const Ground = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const grassTexture = useTexture("/textures/grass.png");
  const sandTexture = useTexture("/textures/sand.jpg");
  
  // Initialize terrain and buildings on component mount
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Generate terrain data
    const { terrain, heightMap, buildings } = generateTerrain(100, 100);
    
    // Apply height map to the terrain mesh
    if (meshRef.current.geometry instanceof THREE.PlaneGeometry) {
      const positions = meshRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = Math.floor((positions[i] + 50) / 100 * terrain.width);
        const z = Math.floor((positions[i+2] + 50) / 100 * terrain.height);
        
        if (x >= 0 && x < terrain.width && z >= 0 && z < terrain.height) {
          const idx = z * terrain.width + x;
          positions[i+1] = heightMap[idx] * 2; // Scale height for more dramatic effect
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.geometry.computeVertexNormals();
    }
    
    // Add buildings to the game state
    useTankGame.setState({ buildings });
    
  }, []);
  
  // Configure textures
  useEffect(() => {
    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(20, 20);
    
    sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
    sandTexture.repeat.set(20, 20);
  }, [grassTexture, sandTexture]);
  
  // Render buildings
  const buildings = useTankGame(state => state.buildings);
  
  return (
    <group>
      {/* Main terrain */}
      <mesh 
        ref={meshRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[100, 100, 100, 100]} />
        <meshStandardMaterial 
          map={grassTexture} 
          aoMapIntensity={1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Render all buildings */}
      {Object.entries(buildings).map(([id, building]) => (
        <Building 
          key={id} 
          id={id}
          position={[building.position.x, building.position.y, building.position.z]}
          size={[building.size.x, building.size.y, building.size.z]}
          color={building.color}
          health={building.health}
          maxHealth={building.maxHealth}
        />
      ))}
    </group>
  );
};

// Building component definition
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
  
  useEffect(() => {
    woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(2, 2);
  }, [woodTexture]);
  
  // Apply damage effects
  useEffect(() => {
    if (!meshRef.current) return;
    
    const healthPercent = health / maxHealth;
    
    // Scale the building down when damaged
    if (healthPercent < 1) {
      meshRef.current.scale.y = Math.max(0.2, healthPercent);
    }
    
    // Move the building down when scaled to keep bottom at ground level
    meshRef.current.position.y = position[1] * meshRef.current.scale.y;
    
  }, [health, maxHealth, position]);
  
  // Hide building when destroyed
  if (health <= 0) {
    return null;
  }
  
  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1], position[2]]}
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

export default Ground;
