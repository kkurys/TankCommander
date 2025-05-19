import * as THREE from "three";
import { createNoise2D } from "simplex-noise";

interface TerrainOptions {
  width: number;
  height: number;
  heightScale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
  seed: number;
}

interface TerrainResult {
  terrain: {
    width: number;
    height: number;
  };
  heightMap: number[];
  buildings: Record<string, any>;
}

// Create a seeded random function
const createSeededRandom = (seed: number) => {
  const m = 2 ** 35 - 31;
  const a = 185852;
  let s = seed % m;
  
  return function() {
    return (s = (s * a) % m) / m;
  };
};

// Generate procedural terrain data
export const generateTerrain = (
  width = 100,
  height = 100,
  options: Partial<TerrainOptions> = {}
): TerrainResult => {
  // Merge default options
  const settings: TerrainOptions = {
    width,
    height,
    heightScale: 5,
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2,
    seed: Math.floor(Math.random() * 1000),
    ...options
  };
  
  // Create noise function with seed
  const noiseGen = createNoise2D(() => settings.seed / 1000);
  const random = createSeededRandom(settings.seed);
  
  // Generate height map
  const heightMap: number[] = new Array(width * height).fill(0);
  
  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      const idx = z * width + x;
      
      // Generate multiple octaves of noise
      let amplitude = 1;
      let frequency = 1;
      let noiseHeight = 0;
      
      for (let i = 0; i < settings.octaves; i++) {
        const sampleX = (x / width) * frequency;
        const sampleZ = (z / height) * frequency;
        
        const noiseValue = noiseGen(sampleX, sampleZ);
        noiseHeight += noiseValue * amplitude;
        
        // Adjust for next octave
        amplitude *= settings.persistence;
        frequency *= settings.lacunarity;
      }
      
      // Scale and store the height value
      heightMap[idx] = noiseHeight * settings.heightScale;
    }
  }
  
  // Generate buildings on the terrain
  const buildings: Record<string, any> = {};
  const buildingCount = Math.floor(random() * 10) + 15; // 15-25 buildings
  
  for (let i = 0; i < buildingCount; i++) {
    // Random position within the terrain
    const x = (random() * width) - (width / 2);
    const z = (random() * height) - (height / 2);
    
    // Get terrain height at this position
    const terrainX = Math.floor((x + width/2) / width * settings.width);
    const terrainZ = Math.floor((z + height/2) / height * settings.height);
    
    let y = 0;
    if (terrainX >= 0 && terrainX < settings.width && terrainZ >= 0 && terrainZ < settings.height) {
      const idx = terrainZ * settings.width + terrainX;
      y = heightMap[idx];
    }
    
    // Random building size
    const sizeX = 2 + random() * 4;
    const sizeY = 3 + random() * 7;
    const sizeZ = 2 + random() * 4;
    
    // Random building color (muted tones)
    const hue = random() * 360;
    const saturation = 0.2 + random() * 0.3;
    const lightness = 0.4 + random() * 0.2;
    const color = new THREE.Color().setHSL(hue/360, saturation, lightness).getStyle();
    
    // Create building
    buildings[`building-${i}`] = {
      id: `building-${i}`,
      position: { x, y: y + sizeY/2, z },
      size: { x: sizeX, y: sizeY, z: sizeZ },
      color,
      health: Math.floor(50 + random() * 100),
      maxHealth: 150
    };
  }
  
  return {
    terrain: {
      width: settings.width,
      height: settings.height
    },
    heightMap,
    buildings
  };
};
