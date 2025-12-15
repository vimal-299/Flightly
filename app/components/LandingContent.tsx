'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero3D from './Hero3D';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';

interface LandingContentProps {
    isLoggedIn: boolean;
}

export default function LandingContent({ isLoggedIn }: LandingContentProps) {
    if (isLoggedIn) {
        redirect("/home")
    }
    const router = useRouter();
    const [phase, setPhase] = useState<'intro' | 'idle' | 'exit-signin' | 'exit-signup'>('intro');
    const [showContent, setShowContent] = useState(false);

    const handleIntroComplete = () => {
        setShowContent(true);
    };

    const handleNavigation = (path: string, type: 'signin' | 'signup') => {
        const nextPhase = `exit-${type}`;
        setPhase(nextPhase as any);

        // Wait for plane exit animation
        setTimeout(() => {
            router.push(path);
        }, 1500);
    };

    return (
        <div className="min-h-screen text-white overflow-x-hidden selection:bg-blue-500/30 relative">
            <Hero3D phase={phase} onIntroComplete={handleIntroComplete} />

            <AnimatePresence>
                {showContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="relative z-10"
                    >
                        {/* Navbar Placeholder / Logo */}
                        <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
                            <div className="flex items-center gap-2">
                                <span className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-500">
                                    Flightly
                                </span>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => handleNavigation('/signin', 'signin')} className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                    Log in
                                </button>
                                <button onClick={() => handleNavigation('/signup', 'signup')} className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-200 transition-colors">
                                    Sign up
                                </button>
                            </div>

                        </nav>

                        {/* Hero Section */}
                        <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="max-w-4xl mx-auto"
                            >

                                <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-tight">
                                    Travel Beyond <br />
                                    <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-500 via-indigo-500 to-purple-600">
                                        Boundaries.
                                    </span>
                                </h1>

                                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                                    Experience the next generation of flight booking.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <motion.button
                                        onClick={() => handleNavigation('/signup', 'signup')}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all"
                                    >
                                        Get Started
                                    </motion.button>

                                    <motion.button
                                        onClick={() => handleNavigation('/signin', 'signin')}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-lg rounded-full hover:bg-white/10 backdrop-blur-sm transition-all"
                                    >
                                        Sign In
                                    </motion.button>
                                </div>
                            </motion.div>
                        </main>

                        <footer className="absolute bottom-6 w-full text-center text-gray-500 text-sm">
                            © 2025 Flightly Inc. Built for the future.
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
