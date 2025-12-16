'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import { Download, Calendar, MapPin, Plane, Clock } from 'lucide-react';
import { generateTicketPDF } from '@/utils/generatePDF';
import { getBookings } from '@/app/actions/flights';
import { motion, AnimatePresence } from 'framer-motion';
import SmallPlane3D from '@/app/components/SmallPlane3D';

interface Booking {
    bookingDate: string;
    flight: {
        departureTime: string;
        id: number;
        airline: string;
        departureCity: string;
        arrivalCity: string;
        basePrice: number;
    };
    id: number;
    flightId: number;
    passengerName: string;
    passengerEmail: string;
    pricePaid: number;
    pnr: string;
}

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data: Booking[] = await getBookings();
                setBookings(data);
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    const handleDownloadTicket = (booking: Booking) => {
        if (!booking.flight) return;
        generateTicketPDF({
            passengerName: booking.passengerName,
            passengerEmail: booking.passengerEmail,
            airline: booking.flight.airline,
            flightId: booking.flight.id,
            from: booking.flight.departureCity,
            to: booking.flight.arrivalCity,
            price: booking.pricePaid,
            date: booking.flight.departureTime,
            pnr: booking.pnr,
        });
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <Navbar />
            <SmallPlane3D /> {/* 3D model of plane at bottom left */}
            <div className="fixed inset-0 z-0 select-none">
                <img
                    src="/worldmap.svg"
                    alt="World Map"
                    className="w-screen h-screen object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/50" />
            </div>

            <main className="container mx-auto px-4 py-8 pt-28 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-3xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent h-15 bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400">
                        My Journey Log
                    </h1>
                    <p className="text-gray-400 mb-10 text-lg">Your travel history and upcoming adventures.</p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : bookings.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid gap-6"
                    >
                        {/*list all bookings */}
                        {bookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <span className="bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-500/20">
                                                {booking.flight.airline}
                                            </span>
                                            <span className="text-gray-500 text-sm font-mono tracking-wider">PNR: {booking.pnr}</span>
                                        </div>

                                        <div className="flex items-center gap-8 md:gap-12 mb-4">
                                            <div>
                                                <p className="text-lg md:text-2xl font-bold text-white">{booking.flight.departureCity}</p>
                                                <p className="text-sm text-gray-500">Departure</p>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center max-w-[120px]">
                                                <div className="w-full h-[2px] bg-white/10 relative my-2">
                                                    <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 rotate-90" />
                                                </div>
                                                <p className="text-xs text-gray-500">Direct</p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg md:text-2xl font-bold text-white">{booking.flight.arrivalCity}</p>
                                                <p className="text-sm text-gray-500">Arrival</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-gray-400 ">
                                            <div className="flex items-center gap-2 ">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                {new Date(booking.flight.departureTime).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-400" />
                                                {new Date(booking.flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 md:gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 min-w-[180px]">
                                        <div className="text-right">
                                            <p className="text-xs text-center text-gray-500 mb-1">Total Paid</p>
                                            <p className="text-3xl font-bold text-white tracking-tight">₹{booking.pricePaid.toFixed(0)}</p>
                                        </div>

                                        <button
                                            onClick={() => handleDownloadTicket(booking)}
                                            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-white/5"
                                        >
                                            <Download className="w-4 h-4" />
                                            Ticket
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 border-dashed"
                    >
                        <Plane className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-30 rotate-12" />
                        <p className="text-gray-400 text-xl font-medium">No bookings found</p>
                        <p className="text-gray-600 mt-2">Time to plan your next adventure!</p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
