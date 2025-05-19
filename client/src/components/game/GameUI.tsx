import { useGame } from "../../lib/stores/useGame";
import { useTankGame } from "../../lib/stores/useTankGame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const GameUI = () => {
  const { phase, restart, end } = useGame();
  const { score, projectileCount, buildings, resetGame } = useTankGame();
  const [showGameOver, setShowGameOver] = useState(false);
  const [remainingBuildings, setRemainingBuildings] = useState(0);
  
  // Count remaining buildings
  useEffect(() => {
    const intactBuildings = Object.values(buildings).filter(
      building => building.health > 0
    ).length;
    
    setRemainingBuildings(intactBuildings);
    
    // Check if all buildings are destroyed
    if (intactBuildings === 0 && phase === 'playing' && Object.keys(buildings).length > 0) {
      end();
      setShowGameOver(true);
    }
  }, [buildings, phase, end]);
  
  // Handle restart game
  const handleRestart = () => {
    resetGame();
    restart();
    setShowGameOver(false);
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        <Card className="bg-slate-800/80 text-white p-4 pointer-events-auto">
          <div className="flex justify-between gap-8">
            <div>
              <h3 className="font-bold text-lg">Score: {score}</h3>
              <p className="text-sm">Projectiles: {projectileCount}</p>
            </div>
            <div>
              <h3 className="font-bold text-lg">Buildings Remaining</h3>
              <Progress value={(remainingBuildings / Math.max(Object.keys(buildings).length, 1)) * 100} className="h-2 mt-1" />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Game Over Screen */}
      {phase === 'ended' && showGameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card className="bg-slate-800 text-white p-8 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-center">Mission Complete!</h2>
            <p className="text-xl mb-6 text-center">All buildings destroyed!</p>
            <p className="text-lg mb-4">Final Score: {score}</p>
            <p className="text-lg mb-6">Projectiles Used: {projectileCount}</p>
            <div className="flex justify-center">
              <Button onClick={handleRestart} className="bg-green-600 hover:bg-green-700">
                Play Again
              </Button>
            </div>
          </Card>
        </div>
      )}
      
      {/* Controls Help */}
      <div className="absolute bottom-4 right-4">
        <Alert className="bg-slate-800/80 text-white pointer-events-auto">
          <div className="text-sm">
            <p><strong>Controls:</strong></p>
            <p>WASD / Arrow Keys: Move Tank</p>
            <p>Space: Fire</p>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default GameUI;
