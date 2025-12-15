'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AuthScene from '@/app/components/AuthScene';
import { signUp } from '@/app/actions/auth';

interface SignUpClientProps {
    googleButton: React.ReactNode;
}

export default function SignUpClient({ googleButton }: SignUpClientProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="h-screen relative flex items-center justify-center overflow-hidden text-white">
            <AuthScene isFlyingAway={!showPassword} /> {/*Flight animation for show and hide password*/}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative z-10"
            >
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">Join Flightly</h1>
                    <p className="text-gray-400 mt-2">Create an account to start your journey</p>
                </div>

                {/*SignUp form*/}
                <form action={signUp} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Captain Smith"
                            required
                            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="pilot@flightly.com"
                            required
                            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-gray-600 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                required
                                className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder:text-gray-600 transition-all pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95"
                    >
                        Sign Up
                    </button>
                </form>

                {/*Option for signin with google*/}
                <div className="mt-6 flex flex-col gap-4">
                    <div className="relative flex py-2 items-center">
                        <div className="grow border-t border-white/10"></div>
                        <span className="shrink-0 mx-4 text-gray-500 text-xs uppercase">Or join with</span>
                        <div className="grow border-t border-white/10"></div>
                    </div>

                    {googleButton}
                </div>

                {/*If user already has an account*/}
                <p className="mt-8 text-center text-sm text-gray-400">
                    Already have an account? <Link href="/signin" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
}
