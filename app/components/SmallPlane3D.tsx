'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

function PlaneModel() {
    const { scene } = useGLTF('/plane.glb');
    const ref = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (!ref.current) return;

        // Gentle hovering animation
        const t = state.clock.getElapsedTime();
        ref.current.position.y = Math.sin(t * 1.5) * 0.1;
        ref.current.rotation.z = Math.sin(t * 1) * 0.05; // Slight banking
        ref.current.rotation.x = Math.sin(t * 0.5) * 0.05; // Slight Pitch
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={0.16} // Small size
            rotation={[0, 2, 0]} // Rotate to face somewhat right/forward
        />
    );
}

export default function SmallPlane3D() {
    return (
        <div className="fixed bottom-0 left-0 w-64 h-64 pointer-events-none z-0 md:w-80 md:h-80">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0.35, 0.5, 4]} />
                <ambientLight intensity={1.5} />
                <directionalLight position={[5, 10, 5]} intensity={2} />
                <pointLight position={[-10, 0, 5]} color="#3b82f6" intensity={1} />

                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
                    <PlaneModel />
                </Float>
            </Canvas>
        </div>
    );
}
