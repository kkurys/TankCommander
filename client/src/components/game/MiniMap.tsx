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
  
  // Define radar range (game units)
  const radarRange = 30;
  
  // Map scale (game units to pixels)
  const mapScale = minimapSize.width / (radarRange * 2);
  
  // Center point of the minimap
  const centerX = minimapSize.width / 2;
  const centerY = minimapSize.height / 2;
  
  // Convert relative game coordinates to minimap coordinates
  const toMinimapCoords = (x: number, z: number) => {
    // Calculate position relative to player
    const relX = x - tankPosition.x;
    const relZ = z - tankPosition.z;
    
    return {
      x: centerX + (relX * mapScale),
      y: centerY + (relZ * mapScale),
      distance: Math.sqrt(relX * relX + relZ * relZ),
      angle: Math.atan2(relZ, relX)
    };
  };
  
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
      {/* Radar circles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 border-2 border-white/10 rounded-full transform scale-75"></div>
        <div className="absolute inset-0 border border-white/10 rounded-full transform scale-50"></div>
        <div className="absolute inset-0 border border-white/10 rounded-full transform scale-25"></div>
      </div>
      
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
      
      {/* Player icon (always centered) */}
      <div 
        className="absolute w-3 h-3 rounded-full bg-blue-500 border border-white"
        style={{ 
          left: `${centerX - 1.5}px`, 
          top: `${centerY - 1.5}px`,
          zIndex: 20
        }}
      ></div>
      
      {/* Enemy icons */}
      {Object.values(enemyTanks).map((enemy) => {
        if (enemy.health <= 0) return null;
        
        // Get enemy position relative to player
        const enemyInfo = toMinimapCoords(enemy.position.x, enemy.position.z);
        
        // Check if enemy is within radar range
        const isInRange = enemyInfo.distance <= radarRange;
        
        if (isInRange) {
          // Render as dot on the map
          return (
            <div 
              key={enemy.id}
              className="absolute w-2 h-2 rounded-full bg-red-500 border border-white"
              style={{ 
                left: `${enemyInfo.x - 1}px`, 
                top: `${enemyInfo.y - 1}px`,
                zIndex: 10
              }}
            ></div>
          );
        } else {
          // Render as arrow on edge of radar indicating direction
          const radius = minimapSize.width / 2 - 5; // 5px from edge
          const angleDeg = (enemyInfo.angle * 180 / Math.PI);
          const rotationDeg = angleDeg;
          
          // Calculate position on circle edge
          const edgeX = centerX + radius * Math.cos(enemyInfo.angle);
          const edgeY = centerY + radius * Math.sin(enemyInfo.angle);
          
          return (
            <div 
              key={enemy.id}
              className="absolute flex items-center justify-center"
              style={{ 
                left: `${edgeX}px`, 
                top: `${edgeY}px`,
                width: '12px',
                height: '12px',
                transform: `translate(-50%, -50%) rotate(${rotationDeg}deg)`,
                zIndex: 15
              }}
            >
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-500"></div>
            </div>
          );
        }
      })}
      
      {/* Building icons (only if within range) */}
      {Object.values(useTankGame.getState().buildings).map((building) => {
        if (building.health <= 0) return null;
        
        // Get building position relative to player
        const buildingInfo = toMinimapCoords(building.position.x, building.position.z);
        
        // Only render if within radar range
        if (buildingInfo.distance <= radarRange) {
          return (
            <div 
              key={building.id}
              className="absolute w-1.5 h-1.5 bg-gray-800"
              style={{ 
                left: `${buildingInfo.x - 0.75}px`, 
                top: `${buildingInfo.y - 0.75}px`
              }}
            ></div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default MiniMap;