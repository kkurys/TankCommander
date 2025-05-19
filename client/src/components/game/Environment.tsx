import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { registerObstacle, clearObstacles } from '../../lib/obstacles';

// Define the types of environment elements
interface EnvironmentProps {
  seed?: number;
}

interface TreeData {
  id: string;
  position: [number, number, number];
  scale: number;
  rotation: number;
}

interface RockData {
  id: string;
  position: [number, number, number];
  scale: number;
  rotation: number;
  type: 'small' | 'medium' | 'large';
}

interface MountainData {
  id: string;
  position: [number, number, number];
  scale: number;
  rotation: number;
}

// Simple tree component
const Tree: React.FC<{ data: TreeData }> = ({ data }) => {
  const { position, scale, rotation } = data;
  
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={[scale, scale, scale]}>
      {/* Tree trunk */}
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      
      {/* Tree leaves */}
      <mesh position={[0, 4, 0]} castShadow>
        <coneGeometry args={[1.5, 4, 8]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Simple rock component
const Rock: React.FC<{ data: RockData }> = ({ data }) => {
  const { position, scale, rotation, type } = data;
  
  // Different rock shapes based on type
  const geometry = useMemo(() => {
    switch (type) {
      case 'small':
        return <sphereGeometry args={[1, 6, 6]} />;
      case 'medium':
        return <dodecahedronGeometry args={[1, 0]} />;
      case 'large':
        return <octahedronGeometry args={[1, 0]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [type]);
  
  return (
    <mesh 
      position={position} 
      rotation={[0, rotation, 0]} 
      scale={[scale, scale * 0.7, scale]} 
      castShadow 
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial color="#777777" roughness={0.9} />
    </mesh>
  );
};

// Simple mountain component
const Mountain: React.FC<{ data: MountainData }> = ({ data }) => {
  const { position, scale, rotation } = data;
  
  return (
    <mesh 
      position={position} 
      rotation={[0, rotation, 0]} 
      scale={[scale, scale, scale]} 
      castShadow 
      receiveShadow
    >
      <coneGeometry args={[4, 6, 5]} />
      <meshStandardMaterial color="#696969" roughness={0.9} />
    </mesh>
  );
};

// Main environment component
const Environment: React.FC<EnvironmentProps> = ({ seed = 12345 }) => {
  // Generate pseudo-random elements based on seed
  const { trees, rocks, mountains } = useMemo(() => {
    // Simple random function with seed
    const random = (min: number, max: number, seedOffset = 0) => {
      const x = Math.sin(seed + seedOffset) * 10000;
      const r = x - Math.floor(x);
      return min + r * (max - min);
    };
    
    // Generate trees (these don't block movement)
    const treeCount = 40;
    const trees: TreeData[] = [];
    
    for (let i = 0; i < treeCount; i++) {
      // Keep trees away from the center (player spawn)
      let x, z;
      do {
        x = random(-45, 45, i * 3);
        z = random(-45, 45, i * 3 + 1);
      } while (Math.sqrt(x * x + z * z) < 10); // Minimum distance from center
      
      trees.push({
        id: `tree-${i}`,
        position: [x, 0, z],
        scale: random(0.8, 1.5, i * 3 + 2),
        rotation: random(0, Math.PI * 2, i * 3 + 3)
      });
    }
    
    // Generate rocks (these block movement)
    const rockCount = 15;
    const rocks: RockData[] = [];
    
    for (let i = 0; i < rockCount; i++) {
      // Keep rocks away from the center (player spawn)
      let x, z;
      do {
        x = random(-40, 40, i * 5 + 100);
        z = random(-40, 40, i * 5 + 101);
      } while (Math.sqrt(x * x + z * z) < 15); // Further from center
      
      const scale = random(1, 3, i * 5 + 102);
      const type = scale < 1.5 ? 'small' : scale < 2.5 ? 'medium' : 'large';
      
      rocks.push({
        id: `rock-${i}`,
        position: [x, scale/2, z], // Adjusted y to sit on ground
        scale,
        rotation: random(0, Math.PI * 2, i * 5 + 103),
        type
      });
    }
    
    // Generate mountains (large obstacles)
    const mountainCount = 5;
    const mountains: MountainData[] = [];
    
    for (let i = 0; i < mountainCount; i++) {
      // Place mountains near the edges
      const angle = (i / mountainCount) * Math.PI * 2;
      const distance = random(35, 45, i * 7 + 200);
      
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      mountains.push({
        id: `mountain-${i}`,
        position: [x, 0, z],
        scale: random(2, 4, i * 7 + 202),
        rotation: random(0, Math.PI * 2, i * 7 + 203)
      });
    }
    
    return { trees, rocks, mountains };
  }, [seed]);
  
  // Register obstacles after they're created
  useEffect(() => {
    // Clear any existing obstacles first
    clearObstacles();
    
    // Register rocks as obstacles
    rocks.forEach(rock => {
      registerObstacle(
        new THREE.Vector3(rock.position[0], rock.position[1], rock.position[2]),
        rock.scale * 1.0, // Slightly larger collision radius than visual
        'rock'
      );
    });
    
    // Register mountains as obstacles
    mountains.forEach(mountain => {
      registerObstacle(
        new THREE.Vector3(mountain.position[0], mountain.position[1], mountain.position[2]),
        mountain.scale * 3.5, // Mountains have larger collision radius
        'mountain'
      );
    });
    
    return () => {
      // Clean up obstacles when unmounting
      clearObstacles();
    };
  }, [rocks, mountains]);

  return (
    <group>
      {/* Render all trees */}
      {trees.map(tree => (
        <Tree key={tree.id} data={tree} />
      ))}
      
      {/* Render all rocks */}
      {rocks.map(rock => (
        <Rock key={rock.id} data={rock} />
      ))}
      
      {/* Render all mountains */}
      {mountains.map(mountain => (
        <Mountain key={mountain.id} data={mountain} />
      ))}
    </group>
  );
};

export default Environment;