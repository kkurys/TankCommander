import { useEffect } from "react";
import { useAudio } from "../../lib/stores/useAudio";
import { useGame } from "../../lib/stores/useGame";

const SoundManager = () => {
  const { backgroundMusic, isMuted, toggleMute } = useAudio();
  const { phase } = useGame();
  
  // Manage background music based on game phase
  useEffect(() => {
    if (!backgroundMusic) return;
    
    // Play background music when game starts
    if (phase === 'playing' && !isMuted) {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    } else {
      backgroundMusic.pause();
    }
    
    // Cleanup when component unmounts
    return () => {
      backgroundMusic.pause();
    };
  }, [phase, backgroundMusic, isMuted]);
  
  // Toggle mute/unmute on all audio
  useEffect(() => {
    if (!backgroundMusic) return;
    
    if (isMuted) {
      backgroundMusic.pause();
    } else if (phase === 'playing') {
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
  }, [isMuted, backgroundMusic, phase]);
  
  // Handle keyboard shortcut for muting (M key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        toggleMute();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleMute]);
  
  return null;
};

export default SoundManager;
