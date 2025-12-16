'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Stars, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface AuthSceneProps {
    isFlyingAway: boolean;
}

function AuthPlane({ isFlyingAway }: { isFlyingAway: boolean }) {
    const { scene } = useGLTF('/plane.glb');
    const ref = useRef<THREE.Group>(null);
    const targetPos = useRef(new THREE.Vector3(-3.5, -2, 0)); // Bottom left default
    const targetRot = useRef(new THREE.Euler(0, 1, 0)); // Facing somewhat right

    useFrame((state, delta) => {
        if (!ref.current) return;

        if (isFlyingAway) {
            // Fly up and right, away from screen
            targetPos.current.set(5, 5, -5);
            targetRot.current.set(-0.5, 0, 0); // Bank right
        } else {
            // Return to bottom left
            targetPos.current.set(-5.5, -1.75, 2);
            targetRot.current.set(0, 3, 0);
        }

        // Smooth interpolation
        ref.current.position.lerp(targetPos.current, delta * 2);

        // Manual rotation lerp
        ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, targetRot.current.x, delta * 2);
        ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, targetRot.current.y, delta * 2);
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, targetRot.current.z, delta * 2);

        // Add subtle hover when idle
        if (!isFlyingAway) {
            const t = state.clock.getElapsedTime();
            ref.current.position.y += Math.sin(t * 2) * 0.005;
        }
    });

    return (
        <primitive
            ref={ref}
            object={scene}
            scale={0.25}
        />
    );
}

export default function AuthScene({ isFlyingAway }: AuthSceneProps) {
    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-[#0a0a0a]">
            {/* Stars background*/}
            <div className="absolute inset-0">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                    <ambientLight intensity={1.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                    <pointLight position={[-10, -10, -10]} color="#3b82f6" intensity={2} />

                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

                    <AuthPlane isFlyingAway={isFlyingAway} />
                </Canvas>
            </div>
            {/*Gradient for legibility*/}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#0a0a0a]/80"></div>
        </div>
    );
}
