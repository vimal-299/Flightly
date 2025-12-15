'use client';

import { useState, useEffect, useMemo } from 'react';
import { getFlights, createBooking, checkSurge } from '@/app/actions/flights';
import Navbar from "@/app/components/Navbar";
import { getUserData } from '@/app/actions/user';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { generateTicketPDF } from '@/utils/generatePDF';
import { TrendingUp, Plane, Calendar, MapPin, Clock, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface flights {
  id: number;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: Date;
  arrivalTime: Date;
  basePrice: number;
}

export default function Home() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [flights, setFlights] = useState<flights[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('')

  // Booking Modal State
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [multiplier, setMultiplier] = useState<boolean>(false)
  const [sortBy, setSortBy] = useState<string>('price-asc');

  const calculateDuration = (start: Date, end: Date) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const sortedFlights = useMemo(() => {
    if (!flights.length) return [];

    return [...flights].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.basePrice - b.basePrice;
        case 'price-desc':
          return b.basePrice - a.basePrice;
        case 'time-asc':
          return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
        case 'time-desc':
          return new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime();
        default:
          return 0;
      }
    });
  }, [flights, sortBy]);

  useEffect(() => { // fetches user data
    const fetchUser = async () => {
      const userData = await getUserData();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setHasSearched(true);

    try {
      const results = await getFlights({ from, to, date });
      setFlights(results);
    } catch (error) {
      console.error('Error fetching flights:', error);
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = async (flight: any) => {
    setSelectedFlight(flight);
    setIsModalOpen(true);

    try {
      const { priceMultiplier } = await checkSurge(flight.id);
      if (priceMultiplier > 1) {
        setMultiplier(true)
      }
      else {
        setMultiplier(false)
      }

      const newPrice = flight.basePrice * priceMultiplier;

      setSelectedFlight((prev: any) => ({
        ...prev,
        basePrice: newPrice
      }));

    } catch (err) {
      console.error("Error checking surge", err)
    }
  };

  const handleBookingModalClose = () => {
    setIsModalOpen(false)
    setSelectedFlight(null)
    setMultiplier(false)
  }

  const handleBooking = async () => {
    setError('')
    if (!selectedFlight) {
      setError('Please select a flight to book')
      return
    }

    if (!user) {
      setError('Please login before booking a flight')
      return
    }

    setBookingLoading(true);
    try {
      const pnr = uuidv4().slice(0, 6).toUpperCase();
      const result = await createBooking({
        flightId: selectedFlight.id,
        passengerName: user.name,
        passengerEmail: user.email,
        pricePaid: selectedFlight.basePrice,
        pnr: pnr,
      });

      if (result.success) {
        setIsModalOpen(false);
        const updatedUser = await getUserData();
        setUser(updatedUser);

        generateTicketPDF({
          passengerName: user.name,
          passengerEmail: user.email,
          airline: selectedFlight.airline,
          flightId: selectedFlight.id,
          from: selectedFlight.departureCity,
          to: selectedFlight.arrivalCity,
          price: selectedFlight.basePrice,
          date: selectedFlight.departureTime,
          pnr: pnr,
        });

        // Show success message and redirect
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/history');
        }, 3000);
      } else {
        setError(`Booking failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      setError('An unexpected error occurred! Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-white selection:bg-blue-500/30">
      <Navbar />

      <main className="relative z-10 container mx-auto px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`w-full max-w-4xl mx-auto transition-all duration-700 ease-in-out ${hasSearched ? 'mt-10' : 'mt-5'}`}
        >
          {!hasSearched && <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={`text-5xl md:text-7xl font-bold text-center mb-6 bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-purple-500 to-indigo-500 leading-tight ${hasSearched ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'}`}
          >
            Experience the Future <br /> of Flight Booking
          </motion.h1>}


          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSearch}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="flex-1 w-full space-y-2">
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Departure City"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Arrival City"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="relative group">
                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all text-white [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>Searching...</>
              ) : (
                <>
                  <Plane className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </motion.form>
        </motion.div>

        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl mx-auto mt-12 pb-20"
            >
              <div className="flex justify-end mb-6">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArrowUpDown className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white/5 border border-white/10 text-white pl-10 pr-8 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <option value="price-asc" className="bg-[#111] text-white">Price: Low to High</option>
                    <option value="price-desc" className="bg-[#111] text-white">Price: High to Low</option>
                    <option value="time-asc" className="bg-[#111] text-white">Departure: Earliest</option>
                    <option value="time-desc" className="bg-[#111] text-white">Departure: Latest</option>
                  </select>
                </div>
              </div>

              {sortedFlights.length > 0 ? (
                <div className="grid gap-6">
                  {sortedFlights.map((flight, index) => (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="font-bold text-xl text-white">{flight.airline}</span>
                            <span className="text-xs px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full font-medium border border-blue-500/20">
                              Direct Flight
                            </span>
                          </div>

                          <div className="flex items-center gap-12">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-white mb-1">
                                {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-gray-400 font-medium">{flight.departureCity}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(flight.departureTime).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                              </p>
                            </div>

                            <div className="flex flex-col items-center flex-1">
                              <span className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {calculateDuration(flight.departureTime, flight.arrivalTime)}
                              </span>
                              <div className="w-full h-[2px] bg-linear-to-r from-transparent via-gray-600 to-transparent relative">
                                <Plane className="w-4 h-4 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                              </div>
                            </div>

                            <div className="text-center">
                              <p className="text-3xl font-bold text-white mb-1">
                                {new Date(flight.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <p className="text-gray-400 font-medium">{flight.arrivalCity}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(flight.arrivalTime).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right pl-6 md:border-l border-white/10">
                          <p className="text-sm text-gray-400 mb-1">Price starting from</p>
                          <p className="text-4xl font-bold text-white mb-4 tracking-tight">
                            ₹{flight.basePrice.toFixed(0)}
                          </p>
                          <button
                            onClick={() => openBookingModal(flight)}
                            className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 border-dashed">
                  <Plane className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-400 text-xl">No flights found matching your criteria.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {isModalOpen && selectedFlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Confirm Booking
                </h2>
                <button
                  onClick={() => handleBookingModalClose()}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {multiplier && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-500">High Demand!</p>
                      <p className="text-xs text-gray-400">Fares have increased due to high demand.</p>
                    </div>
                  </div>
                )}

                <div className="mb-6 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <p className="text-sm text-gray-400">Flight</p>
                    <p className="text-white font-semibold text-lg">{selectedFlight.airline}</p>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{selectedFlight.departureCity}</p>
                      <p className="text-xs text-gray-400">Departure</p>
                    </div>
                    <div className="w-full border-t border-dashed border-gray-600 mx-4 relative">
                      <Plane className="w-4 h-4 text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{selectedFlight.arrivalCity}</p>
                      <p className="text-xs text-gray-400">Arrival</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Route Price</span>
                    <span className="text-white font-mono">₹{selectedFlight.basePrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="text-gray-400">Wallet Balance</span>
                    <span className={`font-bold ${user?.balance >= selectedFlight.basePrice ? 'text-green-500' : 'text-red-500'}`}>
                      ₹{user?.balance?.toFixed(0) || '0'}
                    </span>
                  </div>
                  {user?.balance < selectedFlight.basePrice && (
                    <p className="text-red-500 text-xs mt-2 text-right">Insufficient Balance</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleBookingModalClose()}
                    className="flex-1 px-4 py-3 border border-white/10 text-gray-300 font-medium rounded-xl hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading || user?.balance < selectedFlight.basePrice}
                    className="flex-1 px-4 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm & Pay'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#111] rounded-2xl border border-white/10 p-8 max-w-sm w-full text-center"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Booking Confirmed!</h2>
              <p className="text-gray-400 mb-6">Your flight has been booked successfully.</p>
              <p className="text-sm text-gray-500 animate-pulse">Redirecting to history...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}