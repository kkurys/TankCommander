import { create } from "zustand";
import * as THREE from "three";

// Define types
interface TankPosition {
  x: number;
  y: number;
  z: number;
}

interface TankRotation {
  x: number;
  y: number;
  z: number;
}

interface Projectile {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  direction: {
    x: number;
    z: number;
  };
  speed: number;
}

interface Building {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  size: {
    x: number;
    y: number;
    z: number;
  };
  color: string;
  health: number;
  maxHealth: number;
}

interface Explosion {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  size: number;
  processed: boolean;
}

interface TankGameState {
  // Tank state
  tankPosition: TankPosition;
  tankRotation: TankRotation;
  
  // Projectiles
  projectiles: Record<string, Projectile>;
  projectileCount: number;
  
  // Buildings
  buildings: Record<string, Building>;
  
  // Explosions
  explosions: Record<string, Explosion>;
  
  // Score
  score: number;
  
  // Actions
  setTankPosition: (position: TankPosition) => void;
  setTankRotation: (rotation: TankRotation) => void;
  fireTankProjectile: () => void;
  updateProjectile: (id: string, projectile: Projectile) => void;
  removeProjectile: (id: string) => void;
  damageBuilding: (id: string, damage: number) => void;
  addExplosion: (explosion: Explosion) => void;
  removeExplosion: (id: string) => void;
  resetGame: () => void;
}

// Create the store
export const useTankGame = create<TankGameState>((set, get) => ({
  // Initial tank state
  tankPosition: { x: 0, y: 0.5, z: 0 },
  tankRotation: { x: 0, y: 0, z: 0 },
  
  // Projectiles
  projectiles: {},
  projectileCount: 0,
  
  // Buildings
  buildings: {},
  
  // Explosions
  explosions: {},
  
  // Score
  score: 0,
  
  // Set tank position
  setTankPosition: (position) => set({ tankPosition: position }),
  
  // Set tank rotation
  setTankRotation: (rotation) => set({ tankRotation: rotation }),
  
  // Fire a projectile from the tank
  fireTankProjectile: () => {
    const { tankPosition, tankRotation, projectiles, projectileCount } = get();
    
    // Calculate projectile starting position (barrel end)
    // Adjusted to match the corrected tank orientation
    const directionVector = new THREE.Vector3(
      Math.sin(tankRotation.y),
      0,
      Math.cos(tankRotation.y)
    );
    
    const barrelEnd = {
      x: tankPosition.x + directionVector.x * 2,
      y: tankPosition.y + 0.7, // Slightly above tank center
      z: tankPosition.z + directionVector.z * 2
    };
    
    // Create a new projectile
    const projectileId = `projectile-${Date.now()}`;
    const newProjectile: Projectile = {
      id: projectileId,
      position: barrelEnd,
      direction: {
        x: directionVector.x,
        z: directionVector.z
      },
      speed: 20
    };
    
    // Add to projectiles and increment count
    set({
      projectiles: {
        ...projectiles,
        [projectileId]: newProjectile
      },
      projectileCount: projectileCount + 1
    });
  },
  
  // Update an existing projectile
  updateProjectile: (id, projectile) => {
    const { projectiles } = get();
    
    set({
      projectiles: {
        ...projectiles,
        [id]: projectile
      }
    });
  },
  
  // Remove a projectile
  removeProjectile: (id) => {
    const { projectiles } = get();
    const newProjectiles = { ...projectiles };
    delete newProjectiles[id];
    
    set({ projectiles: newProjectiles });
  },
  
  // Damage a building
  damageBuilding: (id, damage) => {
    const { buildings, score } = get();
    const building = buildings[id];
    
    if (!building) return;
    
    // Calculate new health
    const newHealth = Math.max(0, building.health - damage);
    
    // Update building
    set({
      buildings: {
        ...buildings,
        [id]: {
          ...building,
          health: newHealth
        }
      }
    });
    
    // Update score if building was destroyed
    if (building.health > 0 && newHealth <= 0) {
      set({ score: score + Math.floor(building.maxHealth) });
    }
  },
  
  // Add an explosion effect
  addExplosion: (explosion) => {
    const { explosions } = get();
    
    set({
      explosions: {
        ...explosions,
        [explosion.id]: explosion
      }
    });
    
    // Auto-remove explosion after a delay
    setTimeout(() => {
      get().removeExplosion(explosion.id);
    }, 2000);
  },
  
  // Remove an explosion
  removeExplosion: (id) => {
    const { explosions } = get();
    const newExplosions = { ...explosions };
    
    if (newExplosions[id]) {
      delete newExplosions[id];
      set({ explosions: newExplosions });
    }
  },
  
  // Reset game state
  resetGame: () => {
    set({
      tankPosition: { x: 0, y: 0.5, z: 0 },
      tankRotation: { x: 0, y: 0, z: 0 },
      projectiles: {},
      projectileCount: 0,
      explosions: {},
      score: 0
      // Note: We don't reset buildings, as they're regenerated when the Ground component mounts
    });
  }
}));
