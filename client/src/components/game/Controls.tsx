import { useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "../../lib/hooks/useKeyboardControls";
import { useTankGame } from "../../lib/stores/useTankGame";
import { useGame } from "../../lib/stores/useGame";
import { useAudio } from "../../lib/stores/useAudio";
import * as THREE from "three";

// Controls handler for the game
const Controls = () => {
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { phase } = useGame();
  const { playHit } = useAudio();
  
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

  // Subscribe to control changes
  useEffect(() => {
    const unsubscribeShoot = subscribeKeys(
      state => state.shoot,
      pressed => {
        if (pressed && phase === 'playing') {
          fireTankProjectile();
          playHit();
          console.log("Tank fired a projectile");
        }
      }
    );

    return () => {
      unsubscribeShoot();
    };
  }, [subscribeKeys, phase, fireTankProjectile, playHit]);

  // Game loop - handle movement and projectiles
  useFrame((_, delta) => {
    if (phase !== 'playing') return;

    const keys = getKeys();

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
      console.log("Moving forward");
    }
    if (keys.backward) {
      newPosition.x -= forwardVector.x * moveSpeed;
      newPosition.z -= forwardVector.z * moveSpeed;
      console.log("Moving backward");
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

      // Check for collisions with buildings
      let hasCollided = false;
      
      // Check if projectile is out of bounds (simple map boundary check)
      if (
        Math.abs(newProjectilePosition.x) > 50 ||
        Math.abs(newProjectilePosition.z) > 50
      ) {
        removeProjectile(id);
        return;
      }

      // Check collisions with buildings
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
