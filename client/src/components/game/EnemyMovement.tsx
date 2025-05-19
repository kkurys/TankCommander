import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTankGame } from "../../lib/stores/useTankGame";
import { useGame } from "../../lib/stores/useGame";
import * as THREE from "three";

// Component to handle enemy tank movement logic
const EnemyMovement = () => {
  const { phase } = useGame();
  
  // Update enemy tanks movement in the animation frame
  useFrame((_, delta) => {
    if (phase !== 'playing') return;
    
    const { enemyTanks, updateEnemyTank, fireEnemyProjectile, tankPosition } = useTankGame.getState();
    
    // Loop through all enemy tanks
    Object.entries(enemyTanks).forEach(([id, tank]) => {
      if (tank.health <= 0) return;
      
      // Update timers
      let newMoveTimer = tank.moveTimer - delta;
      let newFireTimer = tank.fireTimer - delta;
      let newRotation = tank.rotation;
      
      // Check if it's time to change direction
      if (newMoveTimer <= 0) {
        // Random new direction and duration
        newRotation = Math.random() * Math.PI * 2;
        newMoveTimer = 2 + Math.random() * 4; // 2-6 seconds
      }
      
      // Move in current direction
      const speed = 3 * delta;
      const dirX = Math.sin(tank.rotation) * speed;
      const dirZ = Math.cos(tank.rotation) * speed;
      
      // Check for boundaries
      const newX = Math.max(-45, Math.min(45, tank.position.x + dirX));
      const newZ = Math.max(-45, Math.min(45, tank.position.z + dirZ));
      
      // Check if tank should fire
      if (newFireTimer <= 0) {
        // Reset fire timer
        newFireTimer = 3 + Math.random() * 5; // 3-8 seconds between firing
        
        // Calculate distance to player
        const distanceToPlayer = Math.sqrt(
          Math.pow(tank.position.x - tankPosition.x, 2) + 
          Math.pow(tank.position.z - tankPosition.z, 2)
        );
        
        // Only fire if player is within range (30 units)
        if (distanceToPlayer < 30) {
          fireEnemyProjectile(id);
        }
      }
      
      // Update the enemy tank
      updateEnemyTank(id, {
        ...tank,
        position: {
          x: newX,
          y: tank.position.y,
          z: newZ
        },
        rotation: newRotation,
        moveTimer: newMoveTimer,
        fireTimer: newFireTimer
      });
    });
  });
  
  return null;
};

export default EnemyMovement;