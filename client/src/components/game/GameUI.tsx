import { useGame } from "../../lib/stores/useGame";
import { useTankGame } from "../../lib/stores/useTankGame";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const GameUI = () => {
  const { phase, restart, end } = useGame();
  const { 
    score, 
    projectileCount, 
    buildings, 
    resetGame, 
    tankHealth, 
    tankMaxHealth,
    enemyTanks 
  } = useTankGame();
  const [showGameOver, setShowGameOver] = useState(false);
  const [remainingBuildings, setRemainingBuildings] = useState(0);
  const [enemiesRemaining, setEnemiesRemaining] = useState(0);
  const [gameOverMessage, setGameOverMessage] = useState("Mission Complete!");
  
  // Count remaining buildings and enemies
  useEffect(() => {
    const intactBuildings = Object.values(buildings).filter(
      building => building.health > 0
    ).length;
    
    const aliveEnemies = Object.values(enemyTanks).filter(
      tank => tank.health > 0
    ).length;
    
    setRemainingBuildings(intactBuildings);
    setEnemiesRemaining(aliveEnemies);
    
    // Check victory conditions
    if (phase === 'playing') {
      // If player is destroyed
      if (tankHealth <= 0) {
        setGameOverMessage("Game Over - Your Tank Was Destroyed!");
        end();
        setShowGameOver(true);
      }
      // If all enemy tanks are destroyed (buildings are optional targets)
      else if (aliveEnemies === 0 && Object.keys(enemyTanks).length > 0) {
        setGameOverMessage("Mission Complete! All Enemy Tanks Destroyed!");
        end();
        setShowGameOver(true);
      }
    }
  }, [buildings, enemyTanks, tankHealth, phase, end]);
  
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
              <h3 className="font-bold text-lg">Tank Health</h3>
              <Progress 
                value={(tankHealth / tankMaxHealth) * 100} 
                className={`h-2 mt-1 ${tankHealth > 50 ? "bg-green-500" : tankHealth > 25 ? "bg-yellow-500" : "bg-red-500"}`} 
              />
            </div>
            <div>
              <h3 className="font-bold text-lg">Targets Remaining</h3>
              <div className="flex gap-4 mt-1 items-center">
                <div className="flex-1">
                  <p className="text-xs mb-1">Buildings: {remainingBuildings}</p>
                  <Progress 
                    value={(remainingBuildings / Math.max(Object.keys(buildings).length, 1)) * 100} 
                    className="h-2" 
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs mb-1">Enemies: {enemiesRemaining}</p>
                  <Progress 
                    value={(enemiesRemaining / Math.max(Object.keys(enemyTanks).length, 1)) * 100} 
                    className="h-2 [&>div]:bg-red-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Game Over Screen */}
      {phase === 'ended' && showGameOver && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card className="bg-slate-800 text-white p-8 max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-center">{gameOverMessage}</h2>
            <p className="text-xl mb-6 text-center">
              {tankHealth <= 0 ? "Your tank was destroyed by enemy fire!" : "All targets eliminated!"}
            </p>
            <p className="text-lg mb-4">Final Score: {score}</p>
            <p className="text-lg mb-2">Projectiles Used: {projectileCount}</p>
            <p className="text-lg mb-6">Enemy Tanks Destroyed: {5 - enemiesRemaining}/5</p>
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
            <p className="mt-2"><strong>Objectives:</strong></p>
            <p>- Destroy enemy tanks</p>
            <p>- Destroy buildings</p>
            <p>- Avoid getting hit</p>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default GameUI;
