import { useState, useEffect } from 'react';
import { useTankGame } from '../../lib/stores/useTankGame';

const MiniMap = () => {
  const { tankPosition, enemyTanks } = useTankGame();
  const [minimapSize, setMinimapSize] = useState({ width: 150, height: 150 });
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Keep the minimap proportional but cap at a reasonable size
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.15;
      setMinimapSize({ 
        width: size,
        height: size
      });
    };
    
    // Set initial size
    handleResize();
    
    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Map scale (game units to pixels)
  const mapScale = minimapSize.width / 100;
  
  // Convert game coordinates to minimap coordinates
  const toMinimapCoords = (x: number, z: number) => {
    return {
      x: (x + 50) * mapScale,
      y: (z + 50) * mapScale,
    };
  };
  
  // Player position on minimap
  const playerPos = toMinimapCoords(tankPosition.x, tankPosition.z);
  
  return (
    <div 
      className="absolute bottom-4 left-4 rounded-full overflow-hidden border-2 border-white/80 shadow-lg"
      style={{ 
        width: `${minimapSize.width}px`, 
        height: `${minimapSize.height}px`,
        backgroundColor: 'rgba(50, 100, 50, 0.4)',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* Map grid lines */}
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 border-b border-white/20"></div>
        <div className="flex-1">
          <div className="h-full flex">
            <div className="flex-1 border-r border-white/20"></div>
            <div className="flex-1"></div>
          </div>
        </div>
      </div>
      
      {/* Compass directions */}
      <div className="absolute inset-0 flex items-center justify-center text-white/80 text-xs font-bold pointer-events-none">
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">N</div>
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">S</div>
        <div className="absolute left-1 top-1/2 transform -translate-y-1/2">W</div>
        <div className="absolute right-1 top-1/2 transform -translate-y-1/2">E</div>
      </div>
      
      {/* Player icon */}
      <div 
        className="absolute w-3 h-3 rounded-full bg-blue-500 border border-white"
        style={{ 
          left: `${playerPos.x - 1.5}px`, 
          top: `${playerPos.y - 1.5}px`,
          zIndex: 20
        }}
      ></div>
      
      {/* Enemy icons */}
      {Object.values(enemyTanks).map((enemy) => {
        if (enemy.health <= 0) return null;
        
        const enemyPos = toMinimapCoords(enemy.position.x, enemy.position.z);
        
        return (
          <div 
            key={enemy.id}
            className="absolute w-2 h-2 rounded-full bg-red-500 border border-white"
            style={{ 
              left: `${enemyPos.x - 1}px`, 
              top: `${enemyPos.y - 1}px`,
              zIndex: 10
            }}
          ></div>
        );
      })}
      
      {/* Building icons */}
      {Object.values(useTankGame.getState().buildings).map((building) => {
        if (building.health <= 0) return null;
        
        const buildingPos = toMinimapCoords(building.position.x, building.position.z);
        
        return (
          <div 
            key={building.id}
            className="absolute w-1.5 h-1.5 bg-gray-800"
            style={{ 
              left: `${buildingPos.x - 0.75}px`, 
              top: `${buildingPos.y - 0.75}px`
            }}
          ></div>
        );
      })}
    </div>
  );
};

export default MiniMap;