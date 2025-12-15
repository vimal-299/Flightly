'use client';

import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import { getUserData } from "@/app/actions/user";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserData();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/60 backdrop-blur-md border-b border-white/5 text-white/90 transition-all">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Left Side: Site Name */}
          <div className="flex items-center gap-2">
            <Link href="/home" className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-indigo-500 hover:opacity-80 transition-opacity">
              Flightly
            </Link>
          </div>

          {/* Right Side: Profile Icon & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="User menu"
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-[#121212]/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="px-5 py-3 border-b border-white/5 bg-white/2">
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1.5">
                    Wallet Balance
                  </p>
                  <p className="text-xl font-bold text-green-400 flex items-center gap-1">
                    <span className="text-sm text-green-500/50">₹</span>
                    {user?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Profile
                  </Link>
                  <Link
                    href="/history"
                    className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    Booking History
                  </Link>
                </div>

                <div className="border-t border-white/5 pt-2 mt-1">
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 w-full text-left px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
