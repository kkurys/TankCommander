import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useGame } from "./lib/stores/useGame";
import "@fontsource/inter";

// Game components
import Ground from "./components/game/Ground";
import Tank from "./components/game/Tank";
import Camera from "./components/game/Camera";
import Controls from "./components/game/Controls";
import GameUI from "./components/game/GameUI";
import MainMenu from "./components/game/MainMenu";
import SoundManager from "./components/game/SoundManager";
import Explosions from "./components/game/Explosions";
import EnemyTanks from "./components/game/EnemyTanks";
import EnemyMovement from "./components/game/EnemyMovement";
import MiniMap from "./components/game/MiniMap";

// Define control keys for the game
const controls = [
  { name: "forward", keys: ["KeyW", "ArrowUp"] },
  { name: "backward", keys: ["KeyS", "ArrowDown"] },
  { name: "leftward", keys: ["KeyA", "ArrowLeft"] },
  { name: "rightward", keys: ["KeyD", "ArrowRight"] },
  { name: "shoot", keys: ["Space"] },
];

// Main App component
function App() {
  const { phase } = useGame();
  const [showCanvas, setShowCanvas] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio assets
  useEffect(() => {
    // Only load sounds once
    const backgroundMusic = new Audio("/sounds/background.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    setBackgroundMusic(backgroundMusic);

    const hitSound = new Audio("/sounds/hit.mp3");
    setHitSound(hitSound);

    const successSound = new Audio("/sounds/success.mp3");
    setSuccessSound(successSound);

    // Show the canvas once everything is loaded
    setShowCanvas(true);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {showCanvas && (
        <KeyboardControls map={controls}>
          {phase === 'ready' && <MainMenu />}

          {(phase === 'playing' || phase === 'ended') && (
            <>
              <Canvas
                shadows
                camera={{
                  position: [20, 20, 20],
                  fov: 45,
                  near: 0.1,
                  far: 1000
                }}
              >
                <color attach="background" args={["#538c3d"]} />
                
                {/* Scene lighting */}
                <ambientLight intensity={0.5} />
                <directionalLight 
                  position={[10, 10, 5]} 
                  intensity={1} 
                  castShadow 
                  shadow-mapSize={[2048, 2048]}
                  shadow-camera-left={-30}
                  shadow-camera-right={30}
                  shadow-camera-top={30}
                  shadow-camera-bottom={-30}
                />

                <Suspense fallback={null}>
                  <Ground />
                  <Tank />
                  <EnemyTanks />
                  <Explosions />
                </Suspense>

                <Camera />
                <Controls />
                <EnemyMovement />
              </Canvas>
              <GameUI />
              <MiniMap />
            </>
          )}

          <SoundManager />
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
