import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Medal, ArrowLeft, Star, User, Crown, Sparkles, TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const Leaderboard = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('volunteers');
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/donations/leaderboard`);
            setVolunteers(res.data.volunteers || []);
            setDonors(res.data.donors || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const getRankStyle = (rank) => {
        if (rank === 0) return { bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', text: 'text-white', shadow: 'shadow-lg shadow-yellow-200' };
        if (rank === 1) return { bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-white', shadow: 'shadow-lg shadow-gray-200' };
        if (rank === 2) return { bg: 'bg-gradient-to-r from-amber-600 to-amber-700', text: 'text-white', shadow: 'shadow-lg shadow-amber-200' };
        return { bg: 'bg-gray-100', text: 'text-gray-600', shadow: '' };
    };

    const RankBadge = ({ rank }) => {
        const style = getRankStyle(rank);
        if (rank === 0) return (
            <div className={`w-10 h-10 rounded-full ${style.bg} ${style.shadow} flex items-center justify-center`}>
                <Crown className="h-5 w-5 text-white" fill="currentColor" />
            </div>
        );
        if (rank === 1) return (
            <div className={`w-10 h-10 rounded-full ${style.bg} ${style.shadow} flex items-center justify-center`}>
                <Medal className="h-5 w-5 text-white" fill="currentColor" />
            </div>
        );
        if (rank === 2) return (
            <div className={`w-10 h-10 rounded-full ${style.bg} ${style.shadow} flex items-center justify-center`}>
                <Award className="h-5 w-5 text-white" fill="currentColor" />
            </div>
        );
        return (
            <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center`}>
                <span className="font-black text-gray-600">{rank + 1}</span>
            </div>
        );
    };

    const TopThree = ({ users, color }) => {
        const topUsers = users.slice(0, 3);
        const order = [1, 0, 2]; // Display order: 2nd, 1st, 3rd

        return (
            <div className="flex justify-center items-end gap-4 mb-8">
                {order.map((idx) => {
                    const user = topUsers[idx];
                    if (!user) return null;
                    const isFirst = idx === 0;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`flex flex-col items-center ${isFirst ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}
                        >
                            <div className={`relative ${isFirst ? 'mb-2' : ''}`}>
                                {isFirst && (
                                    <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 h-8 w-8 text-yellow-500" fill="currentColor" />
                                )}
                                <div className={`${isFirst ? 'w-20 h-20' : 'w-16 h-16'} rounded-full ${color} flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white`}>
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            </div>
                            <div className={`${isFirst ? 'bg-gradient-to-b from-yellow-400 to-amber-500' : idx === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-400' : 'bg-gradient-to-b from-amber-600 to-amber-700'} ${isFirst ? 'h-24 w-20' : 'h-16 w-16'} rounded-t-lg flex flex-col items-center justify-center text-white mt-2`}>
                                <span className="font-black text-2xl">{idx + 1}</span>
                            </div>
                            <p className="mt-2 font-bold text-gray-900 text-sm truncate max-w-20 text-center">{user.name}</p>
                            <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                                <Star className="h-3 w-3" fill="currentColor" />
                                {user.points || 0}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    const UserList = ({ users, color }) => (
        <div className="space-y-3">
            {users.slice(3).map((user, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center gap-4">
                        <RankBadge rank={index + 3} />
                        <div className={`h-12 w-12 rounded-full ${color} flex items-center justify-center text-white font-bold shadow-sm`}>
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 uppercase font-medium tracking-wider">{user.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-2 rounded-full border border-yellow-100">
                        <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                        <span className="font-black text-gray-900">{user.points || 0}</span>
                        <span className="text-gray-500 text-sm">pts</span>
                    </div>
                </motion.div>
            ))}
            {users.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No champions yet</p>
                    <p className="text-sm">Be the first to make an impact!</p>
                </div>
            )}
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
            />
        </div>
    );

    const currentUsers = activeTab === 'volunteers' ? volunteers : donors;
    const currentColor = activeTab === 'volunteers' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-green-500 to-emerald-600';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"
        >
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="h-6 w-6" />
                        </motion.div>
                    </div>
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"
                        >
                            <Trophy className="h-10 w-10 text-yellow-300" fill="currentColor" />
                        </motion.div>
                        <h1 className="text-3xl sm:text-4xl font-black mb-2">Leaderboard</h1>
                        <p className="text-white/80 text-lg">Celebrating our hunger heroes!</p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                {/* Tab Switcher */}
                <div className="bg-white rounded-2xl shadow-lg p-2 mb-8 flex">
                    <button
                        onClick={() => setActiveTab('volunteers')}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'volunteers'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <TrendingUp className="h-4 w-4" />
                        Top Volunteers
                    </button>
                    <button
                        onClick={() => setActiveTab('donors')}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'donors'
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Star className="h-4 w-4" />
                        Top Donors
                    </button>
                </div>

                {/* Top 3 Podium */}
                {currentUsers.length > 0 && (
                    <TopThree users={currentUsers} color={currentColor} />
                )}

                {/* Rest of the list */}
                <UserList users={currentUsers} color={currentColor} />

                {/* CTA Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-8 text-white text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles className="h-10 w-10 mx-auto mb-4 text-yellow-300" />
                        </motion.div>
                        <h3 className="text-2xl font-black mb-2">Want to see your name here?</h3>
                        <p className="text-white/80 mb-6">
                            Earn <span className="text-yellow-300 font-bold">50 Points</span> for every delivery and{' '}
                            <span className="text-yellow-300 font-bold">20 Points</span> for every donation!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:shadow-xl transition-all"
                        >
                            Get Started Now
                        </motion.button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 -mt-10 -ml-10 h-40 w-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-40 w-40 bg-white/10 rounded-full blur-2xl" />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Leaderboard;
