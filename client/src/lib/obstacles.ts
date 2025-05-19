import * as THREE from 'three';

// Define obstacle types and their properties
export interface Obstacle {
  position: THREE.Vector3;
  radius: number;
  type: 'rock' | 'mountain';
}

// Array to store obstacles in the game
let obstacles: Obstacle[] = [];

// Register an obstacle in the game
export const registerObstacle = (
  position: THREE.Vector3,
  radius: number,
  type: 'rock' | 'mountain'
) => {
  const obstacle: Obstacle = {
    position,
    radius,
    type
  };
  
  obstacles.push(obstacle);
  return obstacle;
};

// Clear all obstacles (used when resetting the game)
export const clearObstacles = () => {
  obstacles = [];
};

// Check if a position would collide with any obstacle
export const checkObstacleCollision = (
  position: THREE.Vector3,
  radius: number = 1.5
): boolean => {
  for (const obstacle of obstacles) {
    // Simple circle-circle collision check
    const distance = position.distanceTo(obstacle.position);
    const minDistance = radius + obstacle.radius;
    
    if (distance < minDistance) {
      return true; // Collision detected
    }
  }
  
  return false; // No collision
};

// Find a safe position to move to (handles collision resolution)
export const findSafePosition = (
  currentPosition: THREE.Vector3,
  targetPosition: THREE.Vector3,
  radius: number = 1.5
): THREE.Vector3 => {
  // If target position is safe, just return it
  if (!checkObstacleCollision(targetPosition, radius)) {
    return targetPosition;
  }
  
  // Otherwise, try to find a safe position by sliding along obstacles
  // This is a simplified collision resolution
  
  // Create a vector that goes from current to target
  const moveDirection = new THREE.Vector3()
    .subVectors(targetPosition, currentPosition)
    .normalize();
  
  // Try different distances
  for (let i = 0; i < 10; i++) {
    const testDistance = i / 10;
    const testPosition = new THREE.Vector3()
      .copy(currentPosition)
      .addScaledVector(moveDirection, testDistance);
    
    if (!checkObstacleCollision(testPosition, radius)) {
      return testPosition;
    }
  }
  
  // If we couldn't find a safe position, just return the current position
  return currentPosition;
};

export default obstacles;