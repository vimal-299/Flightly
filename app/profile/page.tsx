'use client';

import { useEffect, useState } from 'react';
import { getUserData, getUserStats, topUpWallet } from '@/app/actions/user';
import Navbar from '@/app/components/Navbar';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isTopUpLoading, setIsTopUpLoading] = useState(false);
    const [message, setMessage] = useState<string>("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userData, userStats] = await Promise.all([
                    getUserData(),
                    getUserStats(),
                ]);
                setUser(userData);
                setStats(userStats);
            } catch (err) {
                console.error('Failed to fetch profile data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleTopUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("")
        if (!topUpAmount || isNaN(Number(topUpAmount)) || Number(topUpAmount) <= 0) return;

        setIsTopUpLoading(true);
        try {
            const updatedUser = await topUpWallet(Number(topUpAmount));
            setUser(updatedUser);
            setTopUpAmount('');
            setMessage('Wallet topped up successfully!');
            setTimeout(() => {
                setMessage('');
            }, 2000);
        } catch (error) {
            console.error('Top up failed', error);
            alert('Failed to top up wallet! Please try again.');
        } finally {
            setIsTopUpLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            redirect("/")
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-8 mt-10">
                <div className="bg-[#111] rounded-3xl border border-white/10 overflow-hidden mb-8">
                    <div className="h-32 bg-linear-to-r from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-16 mb-8">
                            <div className="flex items-end gap-6">
                                <div className="w-32 h-32 rounded-3xl border-4 border-[#111] bg-[#1a1a1a] overflow-hidden shadow-2xl relative z-10">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#222] text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/*user details*/}
                                <div className="mb-2">
                                    <h1 className="text-3xl font-bold text-white mb-1">{user.name}</h1>
                                    <p className="text-gray-400 flex items-center gap-2">
                                        {user.email}
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    </p>
                                </div>
                            </div>
                            <div className="hidden sm:block mb-4">
                                <span className="px-4 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Verified Account
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/*wallet balance*/}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-sm text-gray-400 uppercase font-semibold mb-2">Wallet Balance</p>
                                <p className="text-4xl font-bold text-green-400">
                                    ${user.balance?.toFixed(2)}
                                </p>
                            </div>

                            {/*total flights*/}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-sm text-gray-400 uppercase font-semibold mb-2">Total Flights</p>
                                <p className="text-4xl font-bold text-blue-400">
                                    {stats?.totalFlights || 0}
                                </p>
                            </div>

                            {/*favorite destination*/}
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-sm text-gray-400 uppercase font-semibold mb-2">Favorite Destination</p>
                                <p className="text-4xl font-bold text-indigo-400 truncate" title={stats?.favoriteDestination}>
                                    {stats?.favoriteDestination || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">

                    {/*redirects to booking history*/}
                    <Link href="/history" className="group block p-6 bg-[#111] rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Booking History</h3>
                        <p className="text-gray-400">View all your past and upcoming flights</p>
                    </Link>

                    {/*wallet top-up*/}
                    <div className="p-6 bg-[#111] rounded-3xl border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Add Funds</h3>
                        <p className="text-gray-400 text-sm mb-4">Top up your wallet balance</p>

                        <form onSubmit={handleTopUp} className="flex gap-3 -px-5">
                            <input
                                type="number"
                                placeholder="Amount"
                                value={topUpAmount}
                                onChange={(e) => setTopUpAmount(e.target.value)}
                                className="flex-1 px-2 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 text-white placeholder:text-gray-600"
                                min="1"
                            />
                            <button
                                type="submit"
                                disabled={isTopUpLoading || !topUpAmount}
                                className="px-3 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 font-bold whitespace-nowrap"
                            >
                                {isTopUpLoading ? 'Adding...' : 'Add Funds'}
                            </button>
                        </form>
                        {message && <p className="text-sm text-green-400 mt-2">{message}</p>}
                    </div>

                    <div className="p-6 bg-[#111] rounded-3xl border border-white/10 opacity-50 cursor-not-allowed">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase border border-white/10 px-2 py-1 rounded">Coming Soon</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Settings</h3>
                        <p className="text-gray-400 text-sm">Manage your preferences and security</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
