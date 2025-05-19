import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { useTankGame } from "../../lib/stores/useTankGame";

// Isometric camera that follows the tank
const Camera = () => {
  const { camera } = useThree();
  const cameraTargetRef = useRef(new Vector3());
  const tankPosition = useTankGame(state => state.tankPosition);
  
  // Set initial camera position on mount
  useEffect(() => {
    // Set isometric view by positioning camera at an angle
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Update camera position to follow tank
  useFrame(() => {
    if (!tankPosition) return;
    
    // Calculate target position (offset from tank for better view)
    cameraTargetRef.current.set(
      tankPosition.x,
      tankPosition.y,
      tankPosition.z
    );
    
    // Smoothly move camera to maintain isometric view while following tank
    camera.position.x = cameraTargetRef.current.x + 20;
    camera.position.y = cameraTargetRef.current.y + 20;
    camera.position.z = cameraTargetRef.current.z + 20;
    
    // Always look at the current position of the tank
    camera.lookAt(cameraTargetRef.current);
  });

  return null;
};

export default Camera;
