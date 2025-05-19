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
  fromEnemy?: boolean;
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

interface EnemyTank {
  id: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  color: string;
  health: number;
  maxHealth: number;
  moveTimer: number;
  fireTimer: number;
}

interface TankGameState {
  // Player tank state
  tankPosition: TankPosition;
  tankRotation: TankRotation;
  tankHealth: number;
  tankMaxHealth: number;
  
  // Enemy tanks
  enemyTanks: Record<string, EnemyTank>;
  
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
  fireEnemyProjectile: (enemyId: string) => void;
  updateProjectile: (id: string, projectile: Projectile) => void;
  removeProjectile: (id: string) => void;
  damageBuilding: (id: string, damage: number) => void;
  damageTank: (damage: number) => void;
  damageEnemyTank: (id: string, damage: number) => void;
  updateEnemyTank: (id: string, tank: EnemyTank) => void;
  addExplosion: (explosion: Explosion) => void;
  removeExplosion: (id: string) => void;
  generateEnemyTanks: (count: number) => void;
  resetGame: () => void;
}

// Create the store
export const useTankGame = create<TankGameState>((set, get) => ({
  // Initial tank state
  tankPosition: { x: 0, y: 0.5, z: 0 },
  tankRotation: { x: 0, y: 0, z: 0 },
  tankHealth: 100,
  tankMaxHealth: 100,
  
  // Enemy tanks
  enemyTanks: {},
  
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
  
  // Fire a projectile from the player tank
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
      speed: 20,
      fromEnemy: false
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
  
  // Fire a projectile from an enemy tank
  fireEnemyProjectile: (enemyId: string) => {
    const { enemyTanks, projectiles } = get();
    const enemyTank = enemyTanks[enemyId];
    
    if (!enemyTank) return;
    
    // Calculate projectile direction based on enemy tank rotation
    const directionVector = new THREE.Vector3(
      Math.sin(enemyTank.rotation),
      0,
      Math.cos(enemyTank.rotation)
    );
    
    // Get barrel end position
    const barrelEnd = {
      x: enemyTank.position.x + directionVector.x * 2,
      y: enemyTank.position.y + 0.7, // Slightly above tank center
      z: enemyTank.position.z + directionVector.z * 2
    };
    
    // Create a new projectile from enemy
    const projectileId = `enemy-projectile-${Date.now()}-${enemyId}`;
    const newProjectile: Projectile = {
      id: projectileId,
      position: barrelEnd,
      direction: {
        x: directionVector.x,
        z: directionVector.z
      },
      speed: 15, // Slightly slower than player projectiles
      fromEnemy: true
    };
    
    // Add to projectiles
    set({
      projectiles: {
        ...projectiles,
        [projectileId]: newProjectile
      }
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
  
  // Damage the player tank
  damageTank: (damage) => {
    const { tankHealth } = get();
    
    // Calculate new health
    const newHealth = Math.max(0, tankHealth - damage);
    
    // Update tank health
    set({ tankHealth: newHealth });
    
    // Add explosion if hit
    get().addExplosion({
      id: `player-hit-${Date.now()}`,
      position: {
        x: get().tankPosition.x,
        y: get().tankPosition.y + 1,
        z: get().tankPosition.z
      },
      size: 1,
      processed: false
    });
  },
  
  // Damage an enemy tank
  damageEnemyTank: (id, damage) => {
    const { enemyTanks, score } = get();
    const enemyTank = enemyTanks[id];
    
    if (!enemyTank) return;
    
    // Calculate new health
    const newHealth = Math.max(0, enemyTank.health - damage);
    
    // Update enemy tank
    set({
      enemyTanks: {
        ...enemyTanks,
        [id]: {
          ...enemyTank,
          health: newHealth
        }
      }
    });
    
    // Add explosion effect
    get().addExplosion({
      id: `enemy-hit-${id}-${Date.now()}`,
      position: {
        x: enemyTank.position.x,
        y: enemyTank.position.y + 1,
        z: enemyTank.position.z
      },
      size: 1,
      processed: false
    });
    
    // Update score if enemy was destroyed
    if (enemyTank.health > 0 && newHealth <= 0) {
      set({ score: score + 100 });
      
      // Create bigger explosion for destruction
      get().addExplosion({
        id: `enemy-destroyed-${id}-${Date.now()}`,
        position: {
          x: enemyTank.position.x,
          y: enemyTank.position.y + 1,
          z: enemyTank.position.z
        },
        size: 2.5,
        processed: false
      });
    }
  },
  
  // Update an enemy tank
  updateEnemyTank: (id, tank) => {
    const { enemyTanks } = get();
    
    set({
      enemyTanks: {
        ...enemyTanks,
        [id]: tank
      }
    });
  },
  
  // Generate enemy tanks
  generateEnemyTanks: (count) => {
    const enemyTanks: Record<string, EnemyTank> = {};
    const tankColors = ['#c53030', '#805ad5', '#2b6cb0', '#2f855a', '#d69e2e'];
    
    for (let i = 0; i < count; i++) {
      // Random position within map boundaries
      const x = -40 + Math.random() * 80;
      const z = -40 + Math.random() * 80;
      // Keep a minimum distance from player
      const distanceFromPlayer = Math.sqrt(x * x + z * z);
      const minDistanceFromPlayer = 20;
      
      // Skip if too close to player
      if (distanceFromPlayer < minDistanceFromPlayer) {
        i--; // Try again
        continue;
      }
      
      const id = `enemy-tank-${i}`;
      const color = tankColors[i % tankColors.length];
      
      enemyTanks[id] = {
        id,
        position: { x, y: 0.5, z },
        rotation: Math.random() * Math.PI * 2,
        color,
        health: 100,
        maxHealth: 100,
        moveTimer: 2 + Math.random() * 4, // Initial random move timer
        fireTimer: 2 + Math.random() * 5   // Initial random fire timer
      };
    }
    
    set({ enemyTanks });
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
      tankHealth: 100,
      projectiles: {},
      projectileCount: 0,
      explosions: {},
      enemyTanks: {},
      score: 0
      // Note: We don't reset buildings, as they're regenerated when the Ground component mounts
    });
  }
}));
