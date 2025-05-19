import { useEffect, useRef } from "react";
import { useTankGame } from "../../lib/stores/useTankGame";
import { useGame } from "../../lib/stores/useGame";
import * as THREE from "three";

// Component to manage and render all enemy tanks
const EnemyTanks = () => {
  const { enemyTanks, tankPosition } = useTankGame();
  const { phase } = useGame();
  const tanksGenerated = useRef(false);
  
  // Generate enemy tanks when the game starts
  useEffect(() => {
    // Only generate tanks once when game starts
    if (phase === 'playing' && !tanksGenerated.current) {
      // We'll do the generation in the effect cleanup to avoid React issues
      tanksGenerated.current = true;
      
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        useTankGame.getState().generateEnemyTanks(5);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [phase]);
  
  // Handle enemy tank firing logic
  useEffect(() => {
    if (phase !== 'playing') return;
    
    const interval = setInterval(() => {
      const currentEnemyTanks = useTankGame.getState().enemyTanks;
      const currentTankPosition = useTankGame.getState().tankPosition;
      
      Object.entries(currentEnemyTanks).forEach(([id, tank]) => {
        if (tank.health <= 0) return;
        
        // Calculate distance to player
        const distance = Math.sqrt(
          Math.pow(tank.position.x - currentTankPosition.x, 2) +
          Math.pow(tank.position.z - currentTankPosition.z, 2)
        );
        
        // Only fire if within range and random chance
        if (distance < 30 && Math.random() < 0.2) {
          useTankGame.getState().fireEnemyProjectile(id);
        }
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [phase]);
  
  // Render enemy tanks
  return (
    <group>
      {Object.entries(enemyTanks).map(([id, tank]) => (
        tank.health > 0 && (
          <group 
            key={id} 
            position={[tank.position.x, tank.position.y, tank.position.z]}
            rotation={[0, tank.rotation, 0]}
          >
            {/* Tank body */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[2, 0.8, 3]} />
              <meshStandardMaterial color={tank.color} metalness={0.6} roughness={0.4} />
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
            <mesh position={[0, 1.2, 0]} castShadow>
              <cylinderGeometry args={[0.8, 1, 0.6, 16]} />
              <meshStandardMaterial color={tank.color} metalness={0.5} roughness={0.5} />
            </mesh>
            
            {/* Tank barrel */}
            <mesh position={[0, 1.2, 1.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 2, 16]} />
              <meshStandardMaterial color="#2d3748" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        )
      ))}
    </group>
  );
};

export default EnemyTanks;