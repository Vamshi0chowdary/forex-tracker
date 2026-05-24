import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Orb({ position, scale, color, speed, tilt }) {
  const meshRef = useRef(null);

  useFrame((_, delta) => {
    if (!meshRef.current) {
      return;
    }

    meshRef.current.rotation.x += delta * speed * 0.18;
    meshRef.current.rotation.y += delta * speed * 0.24;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale} rotation={tilt}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.18}
        roughness={0.28}
        metalness={0.72}
      />
    </mesh>
  );
}

function ParticleField() {
  const pointsRef = useRef(null);
  const positions = useMemo(() => {
    const values = [];
    for (let index = 0; index < 80; index += 1) {
      values.push(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 10,
      );
    }
    return new Float32Array(values);
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#9db7ff" transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

function PremiumBackground() {
  return (
    <div className="premium-background" aria-hidden="true">
      <div className="premium-background__gradient premium-background__gradient--one" />
      <div className="premium-background__gradient premium-background__gradient--two" />
      <div className="premium-background__noise" />

      <Canvas
        className="premium-background__canvas"
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8], fov: 42 }}
      >
        <color attach="background" args={['#050816']} />
        <fog attach="fog" args={['#050816', 8, 16]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[3, 4, 4]} intensity={1.1} color="#cfe2ff" />

        <Orb position={[-2.4, 0.9, -0.5]} scale={1.15} color="#7c9cff" speed={0.9} tilt={[0.2, 0.15, 0]} />
        <Orb position={[2.2, -0.8, -0.9]} scale={0.85} color="#8a5cff" speed={1.1} tilt={[-0.18, 0.3, 0]} />

        <mesh position={[0, 0, -2]} rotation={[0.4, 0.65, 0]}>
          <torusKnotGeometry args={[1.1, 0.24, 120, 16]} />
          <meshStandardMaterial
            color="#dbe7ff"
            emissive="#2c4bff"
            emissiveIntensity={0.12}
            roughness={0.32}
            metalness={0.75}
          />
        </mesh>

        <ParticleField />
      </Canvas>
    </div>
  );
}

export default PremiumBackground;