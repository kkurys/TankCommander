import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTankGame } from "../../lib/stores/useTankGame";

interface ExplosionParticle {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

const Explosions = () => {
  const particlesRef = useRef<ExplosionParticle[]>([]);
  const explosions = useTankGame(state => state.explosions);
  
  // Process explosions and create particles
  useMemo(() => {
    Object.values(explosions).forEach(explosion => {
      if (explosion.processed) return;
      
      // Create particles for this explosion
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2;
        const speed = 0.5 + Math.random() * 3;
        
        particlesRef.current.push({
          id: `${explosion.id}-${i}`,
          position: new THREE.Vector3(
            explosion.position.x,
            explosion.position.y + Math.random() * 2,
            explosion.position.z
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * radius * speed,
            1 + Math.random() * 2,
            Math.sin(angle) * radius * speed
          ),
          color: new THREE.Color(0xff4500),
          size: 0.2 + Math.random() * 0.5,
          life: 1.0,
          maxLife: 1.0 + Math.random() * 0.5
        });
      }
      
      // Mark this explosion as processed
      useTankGame.setState(state => ({
        explosions: {
          ...state.explosions,
          [explosion.id]: {
            ...explosion,
            processed: true
          }
        }
      }));
    });
  }, [explosions]);
  
  // Update particles in the animation frame
  useFrame((_, delta) => {
    // Apply gravity and update positions
    particlesRef.current.forEach(particle => {
      particle.velocity.y -= 3 * delta; // Gravity
      particle.position.x += particle.velocity.x * delta;
      particle.position.y += particle.velocity.y * delta;
      particle.position.z += particle.velocity.z * delta;
      particle.life -= delta;
    });
    
    // Remove dead particles
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  });
  
  return (
    <group>
      {particlesRef.current.map(particle => (
        <mesh
          key={particle.id}
          position={[particle.position.x, particle.position.y, particle.position.z]}
        >
          <sphereGeometry args={[particle.size * (particle.life / particle.maxLife), 8, 8]} />
          <meshStandardMaterial 
            color={particle.color} 
            emissive={particle.color} 
            emissiveIntensity={particle.life / particle.maxLife * 2}
          />
        </mesh>
      ))}
    </group>
  );
};

export default Explosions;
