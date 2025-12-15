import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Medal, ArrowLeft, Star, User } from 'lucide-react';

const Leaderboard = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/donations/leaderboard');
            setVolunteers(res.data.volunteers || []);
            setDonors(res.data.donors || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const RankBadge = ({ rank }) => {
        if (rank === 0) return <Trophy className="h-6 w-6 text-yellow-500" fill="currentColor" />;
        if (rank === 1) return <Medal className="h-6 w-6 text-gray-400" fill="currentColor" />;
        if (rank === 2) return <Medal className="h-6 w-6 text-amber-700" fill="currentColor" />;
        return <span className="font-bold text-gray-500 w-6 text-center">{rank + 1}</span>;
    };

    const UserList = ({ users, title, color }) => (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 mb-8">
            <div className={`p-4 ${color} text-white flex items-center`}>
                <Trophy className="h-5 w-5 mr-2" />
                <h2 className="text-lg font-bold">{title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
                {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No champions yet. Be the first!</div>
                ) : (
                    users.map((user, index) => (
                        <div key={index} className={`flex items-center justify-between p-4 ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-white' : ''} hover:bg-gray-50 transition-colors`}>
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0 flex items-center justify-center w-8">
                                    <RankBadge rank={index} />
                                </div>
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shadow-sm border border-white">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">{user.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-brand-green font-bold bg-green-50 px-3 py-1 rounded-full">
                                <Star className="h-4 w-4 mr-1 text-yellow-500" fill="currentColor" />
                                {user.points || 0} pts
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-white hover:shadow-sm text-gray-500 transition-all">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                Community Leaderboard <Trophy className="ml-3 h-8 w-8 text-yellow-500 animate-pulse" />
                            </h1>
                            <p className="text-gray-500 mt-1">Celebrating our hunger heroes!</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <UserList users={volunteers} title="Top Volunteers" color="bg-brand-blue" />
                    <UserList users={donors} title="Top Donors" color="bg-brand-green" />
                </div>

                <div className="mt-8 bg-indigo-900 rounded-2xl p-8 text-white text-center shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-2">Want to see your name here?</h3>
                        <p className="text-indigo-200 mb-6">Earn <span className="text-yellow-400 font-bold">50 Points</span> for every delivery and <span className="text-yellow-400 font-bold">20 Points</span> for every donation!</p>
                        <button onClick={() => navigate('/')} className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors shadow-lg">
                            Get Started Now
                        </button>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute top-0 left-0 -mt-10 -ml-10 h-32 w-32 bg-indigo-800 rounded-full opacity-50"></div>
                    <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-32 w-32 bg-indigo-700 rounded-full opacity-50"></div>
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
