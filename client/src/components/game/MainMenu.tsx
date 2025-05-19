import { useEffect } from "react";
import { useGame } from "../../lib/stores/useGame";
import { useTankGame } from "../../lib/stores/useTankGame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAudio } from "../../lib/stores/useAudio";

const MainMenu = () => {
  const { start } = useGame();
  const { resetGame } = useTankGame();
  const { toggleMute, isMuted } = useAudio();
  
  // Reset game state when menu loads
  useEffect(() => {
    resetGame();
  }, [resetGame]);
  
  const handleStart = () => {
    start();
  };
  
  return (
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-800 flex items-center justify-center">
      <Card className="w-[400px] shadow-lg bg-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Tank Commander</CardTitle>
          <CardDescription className="text-center text-slate-300 text-lg">
            Isometric Tank Destruction Game
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <p className="text-center">
              Take command of a powerful tank and destroy all buildings on the procedurally generated map!
            </p>
            
            <Separator className="my-4 bg-slate-600" />
            
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Controls:</h3>
              <ul className="space-y-2">
                <li>W/Up Arrow: Move Forward</li>
                <li>S/Down Arrow: Move Backward</li>
                <li>A/Left Arrow: Rotate Left</li>
                <li>D/Right Arrow: Rotate Right</li>
                <li>Spacebar: Fire</li>
              </ul>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            onClick={handleStart} 
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
          >
            Start Game
          </Button>
          
          <Button 
            onClick={toggleMute} 
            variant="outline" 
            className="mt-2"
          >
            {isMuted ? "Unmute Sound" : "Mute Sound"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MainMenu;
