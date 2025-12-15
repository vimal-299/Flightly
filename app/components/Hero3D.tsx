'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Stars, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface Hero3DProps {
    phase: 'intro' | 'idle' | 'exit-signin' | 'exit-signup' | 'search';
    onIntroComplete?: () => void;
}

function Plane({ phase, onIntroComplete }: { phase: string, onIntroComplete?: () => void }) {
    const { scene } = useGLTF('/plane.glb');
    const ref = useRef<THREE.Group>(null);
    const time = useRef(0);
    var scale = useRef(0.25);

    useFrame((state, delta) => {
        time.current += delta;
        if (!ref.current) return;

        const t = time.current;

        if (phase === 'intro') {
            // Initial fly-by
            const progress = Math.min(t / 4, 1);
            const radius = THREE.MathUtils.lerp(15, 4.5, Math.pow(progress, 0.5));
            const yPos = THREE.MathUtils.lerp(5, 0, Math.pow(progress, 0.5));
            const speed = 1 - (progress * 0.5);

            ref.current.position.x = Math.sin(t * speed) * radius;
            ref.current.position.z = Math.cos(t * speed) * radius;
            ref.current.position.y = Math.sin(t * 0.5) * 1 + yPos;

            ref.current.rotation.y = -(t * speed) + Math.PI;
            ref.current.rotation.z = Math.sin(t * 2) * 0.3;

            if (progress >= 1 && onIntroComplete) {
                onIntroComplete();
            }
        } else if (phase === 'idle') {
            // Static hover at bottom left
            // Target position: Bottom Left relative to camera
            // Camera is at [0, 0, 10].
            // Roughly x=-5, y=-3 seems right.
            scale.current = 0.25;
            const targetX = -5;
            const targetY = -1.5;
            const targetZ = 3;

            // Interpolate to this position smoothly from wherever it was
            ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX + Math.sin(t) * 0.1, 0.05);
            ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY + Math.cos(t * 0.8) * 0.1, 0.05);
            ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, targetZ, 0.05);

            // Turn to face slightly towards center
            const targetRotY = Math.PI / 4;
            const targetRotZ = 0;
            const targetRotX = 0;

            ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRotY, 0.05);
            ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetRotZ + Math.sin(t) * 0.05, 0.05); // Subtle bank
            ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetRotX, 0.05);

            // Ensure scale is normal
            scale.current = THREE.MathUtils.lerp(scale.current, 0.25, 0.1);

        } else if (phase.startsWith('exit')) {
            // ... existing exit logic ...
            const speed = 8;
            ref.current.position.x += delta * 30;
            ref.current.position.y += delta * 5;
            ref.current.position.z -= delta * 30;
            ref.current.rotation.z = -Math.PI / 4;
        }
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={scale.current}
        />
    );
}

export default function Hero3D({ phase = 'intro', onIntroComplete }: Hero3DProps) {
    return (
        <div className="fixed inset-0 w-full h-full z-0">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={1.5} />
                <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={2} />
                <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={3} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <group rotation={[0, 0, 0.2]}> {/* Tilt the whole system slightly */}
                    <Plane phase={phase} onIntroComplete={onIntroComplete} />
                </group>
            </Canvas>
            <div className="absolute inset-0 bg-linear-to-b from-[#0a0a0a]/10 via-transparent to-[#0a0a0a]/80"></div>
        </div>
    );
}
