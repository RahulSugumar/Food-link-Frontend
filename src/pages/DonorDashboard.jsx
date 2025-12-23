import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Clock, MapPin, CheckCircle, RefreshCcw, ArrowLeft, Trash2, MessageCircle, Heart, Gift, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import LocationPicker from '../components/LocationPicker';
import ChatModal from '../components/ChatModal';
import { API_URL } from '../config';

const DonorDashboard = () => {
    const [showDonateForm, setShowDonateForm] = useState(false);
    const [myDonations, setMyDonations] = useState([]);
    const [recentDonations, setRecentDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null); // Map state

    const [user, setUser] = useState(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
    }, []);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedDonationForChat, setSelectedDonationForChat] = useState(null);

    const fetchDonations = async () => {
        if (!user) return; // Wait for user state

        try {
            // Fetch Community Recent
            const recentRes = await axios.get(`${API_URL}/api/donations/recent`);
            setRecentDonations(recentRes.data);

            // Fetch My Donations (if logged in)
            if (user && user.id) {
                const myRes = await axios.get(`${API_URL}/api/donations/donor/${user.id}`);
                const sorted = myRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setMyDonations(sorted);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) fetchDonations(); // Fetch when user is set
    }, [user]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this donation?")) {
            try {
                await axios.delete(`${API_URL}/api/donations/${id}`);
                setMyDonations(prev => prev.filter(d => d.id !== id));
                // Also refresh recent list as it might be there
                fetchDonations();
                alert("Donation removed.");
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete donation.");
            }
        }
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        // const userStr = localStorage.getItem('user'); // Removed, now using state
        // const user = userStr ? JSON.parse(userStr) : null; // Removed, now using state
        const addressInput = formData.get('location');

        if (!user) {
            alert("You must be logged in to donate.");
            return;
        }

        // Use map location if selected, otherwise fallback to user profile location, else default
        let finalLocation = selectedLocation || user.location || {
            lat: 12.9716,
            lng: 77.5946,
            address: "Bangalore (Default)"
        };

        const data = {
            donor_id: user.id,
            food_type: formData.get('food_item'),
            quantity: parseInt(formData.get('quantity')),
            location: finalLocation,
            description: formData.get('description') || '',
            status: 'available',
            expiry_time: new Date(Date.now() + parseInt(formData.get('expiry_hours')) * 3600000).toISOString()
        };

        try {
            await axios.post(`${API_URL}/api/donations`, data);
            setShowDonateForm(false);
            fetchDonations();
            alert('Donation posted successfully!');
        } catch (err) {
            alert('Failed to post donation');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelfDeliver = async (id) => {
        if (!window.confirm("Are you sure you want to deliver this yourself?")) return;
        // const userStr = localStorage.getItem('user'); // Removed, now using state
        // const user = userStr ? JSON.parse(userStr) : null; // Removed, now using state

        try {
            await axios.put(`${API_URL}/api/donations/${id}/accept`, {
                volunteer_id: user.id
            });
            alert("Great! You are now delivering this donation.");
            fetchDonations();
        } catch (err) {
            console.error(err);
            alert("Failed to assign delivery.");
        }
    };

    const handleCompleteDelivery = async (id) => {
        if (!window.confirm("Has the food been delivered successfully?")) return;
        try {
            // Re-use the existing endpoint
            await axios.put(`${API_URL}/api/donations/${id}/deliver`);
            alert("Delivery confirmed! Points awarded.");
            fetchDonations();
        } catch (err) {
            console.error(err);
            alert("Failed to complete delivery.");
        }
    };

    const handleOpenChat = (donation) => {
        setSelectedDonationForChat(donation);
        setIsChatOpen(true);
    };

    const navigate = useNavigate();

    // Stats calculation
    const totalDonations = myDonations.length;
    const deliveredCount = myDonations.filter(d => d.status === 'delivered').length;
    const totalMeals = myDonations.reduce((sum, d) => sum + (d.quantity || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-gray-50"
        >
            {/* Modern Navbar */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/')} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-2 rounded-xl">
                                    <Gift className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-xl font-black text-gray-900">Donor Dashboard</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-brand-orange2 px-4 py-2 rounded-full text-sm font-bold">
                                <TrendingUp className="h-4 w-4" />
                                {totalMeals} Meals Shared
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all text-white font-bold"
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 p-2 rounded-xl">
                                <Gift className="h-5 w-5 text-brand-orange2" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{totalDonations}</p>
                                <p className="text-xs text-gray-500">Total Donations</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-xl">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{deliveredCount}</p>
                                <p className="text-xs text-gray-500">Delivered</p>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-xl">
                                <Heart className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{totalMeals}</p>
                                <p className="text-xs text-gray-500">Meals Shared</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {/* Hero Action */}
                {!showDonateForm ? (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center border-2 border-dashed border-gray-300 hover:border-brand-orange transition-colors">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Have food to share?</h2>
                        <p className="text-gray-600 mb-6">Your surplus can be someone's meal today.</p>
                        <button
                            onClick={() => setShowDonateForm(true)}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-orange hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange"
                        >
                            <PlusCircle className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
                            Donate Food Now
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Donate Food</h2>
                            <button onClick={() => setShowDonateForm(false)} className="text-gray-400 hover:text-gray-500">Cancel</button>
                        </div>
                        <form className="space-y-6" onSubmit={handleDonate}>
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label className="block text-sm font-medium text-gray-700">What are you donating?</label>
                                    <input name="food_item" type="text" required placeholder="e.g., 5kg Rice and Curry" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm" />
                                </div>
                                <div className="sm:col-span-4">
                                    <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                    <input name="description" type="text" placeholder="e.g., Veg, Non-Veg, Contains Nuts" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Quantity (Servings)</label>
                                    <input name="quantity" type="number" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm" />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Location</label>
                                    <LocationPicker onLocationSelect={setSelectedLocation} />
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Expires In</label>
                                    <select name="expiry_hours" className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm">
                                        <option value="2">2 Hours</option>
                                        <option value="4">4 Hours</option>
                                        <option value="12">12 Hours</option>
                                        <option value="24">24 Hours</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" disabled={loading} className="bg-brand-orange text-white px-4 py-2 rounded-md font-medium hover:bg-orange-600">
                                    {loading ? 'Posting...' : 'Broadcast Donation'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Section 1: My Donations */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 flex justify-between items-center">
                            My Donations
                            <button onClick={fetchDonations} className="text-gray-400 hover:text-brand-orange"><RefreshCcw size={18} /></button>
                        </h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {myDonations.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">You haven't made any donations yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    {myDonations.map((item) => {
                                        // const userStr = localStorage.getItem('user'); // Removed, now using state
                                        // const user = userStr ? JSON.parse(userStr) : null; // Removed, now using state
                                        const IsDonorSelfDelivering = (d) => d.volunteer_id === user?.id;

                                        return (
                                            <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex justify-between items-center bg-white shadow-sm">
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.food_type}</p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                                                        ${item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                                item.status === 'claimed' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                            {item.status}
                                                        </span>
                                                        {item.status === 'claimed' && item.delivery_needed && (
                                                            <span className="text-xs text-red-500 font-bold flex items-center">
                                                                <MapPin className="h-3 w-3 mr-1" /> Delivery Needed
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Qty: {item.quantity} • {new Date(item.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col space-y-2 items-end">
                                                    {item.status === 'available' && (
                                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    {/* Donor Self-Delivery Button */}
                                                    {item.status === 'claimed' && item.delivery_needed && (
                                                        <button
                                                            onClick={() => handleSelfDeliver(item.id)}
                                                            className="px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-full hover:bg-orange-700 transition-colors shadow-sm"
                                                        >
                                                            I will Deliver
                                                        </button>
                                                    )}

                                                    {/* Donor Mark as Delivered */}
                                                    {item.status === 'in_transit' && (
                                                        <button
                                                            onClick={() => handleCompleteDelivery(item.id)}
                                                            className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full hover:bg-green-700 transition-colors shadow-sm flex items-center"
                                                        >
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Mark Delivered
                                                        </button>
                                                    )}

                                                    {item.status === 'delivered' && (
                                                        <span className="text-xs text-green-600 font-bold border border-green-200 px-2 py-1 rounded bg-green-50 flex items-center">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Delivered
                                                        </span>
                                                    )}

                                                    {/* Chat Button (Only if Donor is delivering OR Receiver is picking up) */}
                                                    {(item.status === 'claimed' || item.status === 'in_transit') &&
                                                        (!item.delivery_needed || IsDonorSelfDelivering(item)) && (
                                                            <button
                                                                onClick={() => handleOpenChat(item)}
                                                                className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full hover:bg-indigo-200 transition-colors shadow-sm flex items-center"
                                                            >
                                                                <MessageCircle className="w-3 h-3 mr-1" /> Chat
                                                            </button>
                                                        )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Chat Modal */}
                    {selectedDonationForChat && (
                        <ChatModal
                            isOpen={isChatOpen}
                            onClose={() => setIsChatOpen(false)}
                            donationId={selectedDonationForChat.id}
                            currentUserId={user?.id}
                            receiverId={(() => {
                                // Strict Participant Logic
                                if (selectedDonationForChat.volunteer_id) {
                                    // If Volunteer exists...
                                    if (selectedDonationForChat.volunteer_id === user?.id) {
                                        // I AM the volunteer (Self-Delivery) -> Talk to Receiver
                                        return selectedDonationForChat.receiver_id;
                                    } else {
                                        // I am Donor, Volunteer is someone else -> Talk to Volunteer (NOT Receiver)
                                        // Wait, simple logic: Donor Chat Button only shows if Donor IS Volunteer.
                                        // Logic in JSX handles visibility.
                                        // But if I am just a Donor watching, and I click chat (which logic hides?), this shouldn't happen.
                                        // If I am Self-Deliverer: Receiver is my partner.
                                        return selectedDonationForChat.receiver_id;
                                    }
                                } else {
                                    // No volunteer yet. Chat with Receiver?
                                    // Donor -> Receiver (Direct pickup)
                                    return selectedDonationForChat.receiver_id;
                                }
                            })()}
                            title={`Chat with ${selectedDonationForChat.receiver?.name || 'Receiver'}`}
                        />
                    )}

                    {/* Section 2: Community Activity */}
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Community Activity
                        </h3>
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            {recentDonations.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No recent activity.Be the first!</div>
                            ) : (
                                <ul role="list" className="divide-y divide-gray-200">
                                    {recentDonations.map((donation) => (
                                        <li key={donation.id}>
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-bold">
                                                            {donation.profiles?.name ? donation.profiles.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {donation.profiles?.name || 'Anonymous'} posted a donation
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {donation.food_type} ({donation.quantity} servings)
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            <Clock className="inline h-3 w-3 mr-1" />
                                                            {new Date(donation.created_at).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                </div>
            </main >
        </motion.div>
    );
};

export default DonorDashboard;
