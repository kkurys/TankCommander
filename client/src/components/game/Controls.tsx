import { useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useTankGame } from "../../lib/stores/useTankGame";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";
import * as THREE from "three";
import { checkObstacleCollision, findSafePosition } from "../../lib/obstacles";

// Controls handler for the game
const Controls = () => {
  const { phase } = useGame();
  const { playHit } = useAudio();
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    shoot: false
  });
  
  const {
    tankPosition, 
    tankRotation, 
    setTankPosition, 
    setTankRotation,
    fireTankProjectile,
    projectiles,
    buildings,
    updateProjectile,
    removeProjectile,
    damageBuilding
  } = useTankGame();

  // Handle keyboard events directly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Movement keys
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setKeys(prev => ({ ...prev, forward: true }));
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setKeys(prev => ({ ...prev, backward: true }));
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setKeys(prev => ({ ...prev, leftward: true }));
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setKeys(prev => ({ ...prev, rightward: true }));
      }
      
      // Shooting
      if (e.code === 'Space' && phase === 'playing' && !keys.shoot) {
        setKeys(prev => ({ ...prev, shoot: true }));
        fireTankProjectile();
        playHit();
        console.log("Tank fired a projectile");
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        setKeys(prev => ({ ...prev, forward: false }));
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setKeys(prev => ({ ...prev, backward: false }));
      }
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        setKeys(prev => ({ ...prev, leftward: false }));
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        setKeys(prev => ({ ...prev, rightward: false }));
      }
      if (e.code === 'Space') {
        setKeys(prev => ({ ...prev, shoot: false }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [phase, fireTankProjectile, playHit, keys.shoot]);

  // Game loop - handle movement and projectiles
  useFrame((_, delta) => {
    if (phase !== 'playing') return;

    // Tank movement and rotation
    const moveSpeed = 8 * delta;
    const rotateSpeed = 2 * delta;

    // Get current position and rotation
    const newPosition = new THREE.Vector3(
      tankPosition.x,
      tankPosition.y,
      tankPosition.z
    );
    let yRotation = tankRotation.y;

    // Handle rotation (left/right)
    if (keys.leftward) {
      yRotation += rotateSpeed;
    }
    if (keys.rightward) {
      yRotation -= rotateSpeed;
    }

    // Calculate forward direction based on rotation
    const forwardVector = new THREE.Vector3(
      Math.sin(yRotation),
      0,
      Math.cos(yRotation)
    );

    // Apply movement (forward/backward)
    if (keys.forward) {
      newPosition.x += forwardVector.x * moveSpeed;
      newPosition.z += forwardVector.z * moveSpeed;
    }
    if (keys.backward) {
      newPosition.x -= forwardVector.x * moveSpeed;
      newPosition.z -= forwardVector.z * moveSpeed;
    }

    // Update tank position and rotation
    setTankPosition(newPosition);
    setTankRotation({ x: 0, y: yRotation, z: 0 });

    // Update projectiles
    Object.entries(projectiles).forEach(([id, projectile]) => {
      // Move projectile
      const newProjectilePosition = {
        x: projectile.position.x + projectile.direction.x * 20 * delta,
        y: projectile.position.y,
        z: projectile.position.z + projectile.direction.z * 20 * delta
      };

      // Check for collisions with various objects
      let hasCollided = false;
      
      // Check if projectile is out of bounds (simple map boundary check)
      if (
        Math.abs(newProjectilePosition.x) > 50 ||
        Math.abs(newProjectilePosition.z) > 50
      ) {
        removeProjectile(id);
        return;
      }

      // Get references to other game state
      const { enemyTanks, damageEnemyTank, tankPosition, damageTank } = useTankGame.getState();
      
      // If projectile is from player, check collisions with enemy tanks
      if (!projectile.fromEnemy) {
        Object.entries(enemyTanks).forEach(([enemyId, enemyTank]) => {
          if (hasCollided || enemyTank.health <= 0) return;
          
          // Simple collision detection with enemy tank
          const tankSize = { width: 2, height: 2, depth: 3 };
          
          if (
            newProjectilePosition.x < enemyTank.position.x + tankSize.width/2 &&
            newProjectilePosition.x > enemyTank.position.x - tankSize.width/2 &&
            newProjectilePosition.z < enemyTank.position.z + tankSize.depth/2 &&
            newProjectilePosition.z > enemyTank.position.z - tankSize.depth/2
          ) {
            console.log(`Player projectile ${id} hit enemy tank ${enemyId}`);
            
            // Damage the enemy tank
            damageEnemyTank(enemyId, 25);
            
            // Remove the projectile
            removeProjectile(id);
            hasCollided = true;
          }
        });
      } 
      // If projectile is from enemy, check collision with player tank
      else if (projectile.fromEnemy) {
        // Simple collision detection with player tank
        const tankSize = { width: 2, height: 2, depth: 3 };
        
        if (
          newProjectilePosition.x < tankPosition.x + tankSize.width/2 &&
          newProjectilePosition.x > tankPosition.x - tankSize.width/2 &&
          newProjectilePosition.z < tankPosition.z + tankSize.depth/2 &&
          newProjectilePosition.z > tankPosition.z - tankSize.depth/2
        ) {
          console.log(`Enemy projectile ${id} hit player tank`);
          
          // Damage the player tank
          damageTank(15);
          
          // Remove the projectile
          removeProjectile(id);
          hasCollided = true;
        }
      }

      // Check collisions with buildings (if no collision already found)
      if (!hasCollided) {
        Object.entries(buildings).forEach(([buildingId, building]) => {
          if (hasCollided) return;

          // Simple AABB collision detection
          const projectileSize = { width: 0.5, height: 0.5, depth: 0.5 };
          const buildingSize = { width: building.size.x, height: building.size.y, depth: building.size.z };
          
          if (
            newProjectilePosition.x < building.position.x + buildingSize.width/2 &&
            newProjectilePosition.x > building.position.x - buildingSize.width/2 &&
            newProjectilePosition.z < building.position.z + buildingSize.depth/2 &&
            newProjectilePosition.z > building.position.z - buildingSize.depth/2
          ) {
            console.log(`Projectile ${id} hit building ${buildingId}`);
            
            // Damage the building
            damageBuilding(buildingId, 25);
            
            // Remove the projectile
            removeProjectile(id);
            hasCollided = true;
          }
        });
      }

      // If no collision, update the projectile
      if (!hasCollided) {
        updateProjectile(id, {
          ...projectile,
          position: newProjectilePosition
        });
      }
    });
  });

  return null;
};

export default Controls;
