import * as THREE from "three";

// Basic AABB (Axis-Aligned Bounding Box) collision detection
export const checkAABBCollision = (
  box1: {
    position: THREE.Vector3 | { x: number; y: number; z: number };
    size: THREE.Vector3 | { x: number; y: number; z: number };
  },
  box2: {
    position: THREE.Vector3 | { x: number; y: number; z: number };
    size: THREE.Vector3 | { x: number; y: number; z: number };
  }
): boolean => {
  // Convert to standard format if needed
  const pos1 = box1.position instanceof THREE.Vector3 
    ? box1.position 
    : new THREE.Vector3(box1.position.x, box1.position.y, box1.position.z);
    
  const size1 = box1.size instanceof THREE.Vector3 
    ? box1.size 
    : new THREE.Vector3(box1.size.x, box1.size.y, box1.size.z);
    
  const pos2 = box2.position instanceof THREE.Vector3 
    ? box2.position 
    : new THREE.Vector3(box2.position.x, box2.position.y, box2.position.z);
    
  const size2 = box2.size instanceof THREE.Vector3 
    ? box2.size 
    : new THREE.Vector3(box2.size.x, box2.size.y, box2.size.z);
  
  // Calculate half sizes for each box
  const halfSize1 = new THREE.Vector3(size1.x / 2, size1.y / 2, size1.z / 2);
  const halfSize2 = new THREE.Vector3(size2.x / 2, size2.y / 2, size2.z / 2);
  
  // Check if boxes overlap in all three axes
  return (
    Math.abs(pos1.x - pos2.x) < (halfSize1.x + halfSize2.x) &&
    Math.abs(pos1.y - pos2.y) < (halfSize1.y + halfSize2.y) &&
    Math.abs(pos1.z - pos2.z) < (halfSize1.z + halfSize2.z)
  );
};

// Ray-box intersection test
export const checkRayBoxIntersection = (
  rayOrigin: THREE.Vector3 | { x: number; y: number; z: number },
  rayDirection: THREE.Vector3 | { x: number; y: number; z: number },
  boxPosition: THREE.Vector3 | { x: number; y: number; z: number },
  boxSize: THREE.Vector3 | { x: number; y: number; z: number }
): { hit: boolean; point?: THREE.Vector3; distance?: number } => {
  // Convert to THREE.Vector3 if needed
  const origin = rayOrigin instanceof THREE.Vector3 
    ? rayOrigin 
    : new THREE.Vector3(rayOrigin.x, rayOrigin.y, rayOrigin.z);
    
  const direction = rayDirection instanceof THREE.Vector3 
    ? rayDirection.clone().normalize() 
    : new THREE.Vector3(rayDirection.x, rayDirection.y, rayDirection.z).normalize();
    
  const position = boxPosition instanceof THREE.Vector3 
    ? boxPosition 
    : new THREE.Vector3(boxPosition.x, boxPosition.y, boxPosition.z);
    
  const size = boxSize instanceof THREE.Vector3 
    ? boxSize 
    : new THREE.Vector3(boxSize.x, boxSize.y, boxSize.z);
  
  // Calculate box bounds
  const halfSize = size.clone().multiplyScalar(0.5);
  const boxMin = position.clone().sub(halfSize);
  const boxMax = position.clone().add(halfSize);
  
  // Calculate intersection with box planes
  const invDir = new THREE.Vector3(
    direction.x !== 0 ? 1 / direction.x : Infinity,
    direction.y !== 0 ? 1 / direction.y : Infinity,
    direction.z !== 0 ? 1 / direction.z : Infinity
  );
  
  const tMin = new THREE.Vector3(
    (boxMin.x - origin.x) * invDir.x,
    (boxMin.y - origin.y) * invDir.y,
    (boxMin.z - origin.z) * invDir.z
  );
  
  const tMax = new THREE.Vector3(
    (boxMax.x - origin.x) * invDir.x,
    (boxMax.y - origin.y) * invDir.y,
    (boxMax.z - origin.z) * invDir.z
  );
  
  // Find the min/max t values for each axis
  const t1 = new THREE.Vector3(
    Math.min(tMin.x, tMax.x),
    Math.min(tMin.y, tMax.y),
    Math.min(tMin.z, tMax.z)
  );
  
  const t2 = new THREE.Vector3(
    Math.max(tMin.x, tMax.x),
    Math.max(tMin.y, tMax.y),
    Math.max(tMin.z, tMax.z)
  );
  
  const tNear = Math.max(Math.max(t1.x, t1.y), t1.z);
  const tFar = Math.min(Math.min(t2.x, t2.y), t2.z);
  
  // Check if there is an intersection
  if (tNear > tFar || tFar < 0) {
    return { hit: false };
  }
  
  // Calculate intersection point
  const hitPoint = origin.clone().add(direction.clone().multiplyScalar(tNear));
  
  return {
    hit: true,
    point: hitPoint,
    distance: tNear
  };
};
