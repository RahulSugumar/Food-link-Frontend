
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Clock, AlertCircle, Bell, Filter, ArrowLeft, RefreshCcw, User, CheckCircle, Phone, MessageCircle, Heart, TrendingUp, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatModal from '../components/ChatModal';

const ReceiverDashboard = () => {
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(false);

    // State to show donor details after full claim
    const [claimedItem, setClaimedItem] = useState(null);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [user, setUser] = useState(null);
    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
    }, []);

    const fetchNotifications = async () => {
        if (!user) return;
        console.log('Fetching notifications for User ID:', user.id);

        try {
            const res = await axios.get(`http://localhost:5000/api/notifications/${user.id}`);
            console.log('API Response:', res.status, res.data);
            if (Array.isArray(res.data)) {
                console.log('Notification Count:', res.data.length);
                setNotifications(res.data);
            } else {
                console.error('Expected array but got:', typeof res.data);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedDonationForChat, setSelectedDonationForChat] = useState(null);

    const [myClaims, setMyClaims] = useState([]);

    const fetchFeed = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/donations');
            setFeed(res.data.filter(d => d.status === 'available'));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyClaims = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`http://localhost:5000/api/donations/receiver/${user.id}`);
            // Show only active claims (not completed ones if desired, or all)
            setMyClaims(res.data.filter(d => d.status !== 'delivered' && d.status !== 'cancelled'));
        } catch (err) {
            console.error("Failed to fetch claims", err);
        }
    };

    useEffect(() => {
        fetchFeed();
        if (user) fetchMyClaims();
    }, [user]);

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        // Simple logic to post request
        try {
            await axios.post('http://localhost:5000/api/requests', {
                food_item: formData.get('item'),
                quantity: 1, // Defaulting for simple demo
                location: { address: formData.get('location') },
                status: 'pending'
            });
            setShowRequestForm(false);
            alert('Request posted! Donors nearby have been notified.');
        } catch (err) {
            console.error(err);
            alert('Failed to post request');
        } finally {
            setLoading(false);
        }
    };

    const [confirmingDonation, setConfirmingDonation] = useState(null); // Item being claimed

    const handleClaimClick = (item) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            alert("Please login to claim.");
            return;
        }
        setConfirmingDonation(item);
    };

    const confirmClaim = async (needsDelivery) => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user || !confirmingDonation) return;

        try {
            await axios.put(`http://localhost:5000/api/donations/${confirmingDonation.id}/claim`, {
                receiver_id: user.id,
                delivery_needed: needsDelivery
            });

            fetchFeed();
            fetchMyClaims();
            setClaimedItem(confirmingDonation); // Show success details
            setConfirmingDonation(null); // Close modal
            alert(needsDelivery ? "Claimed! A volunteer will be notified." : "Claimed! Please collect it from the donor.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to claim food.');
        }
    };

    const handleOpenChat = (item) => {
        setSelectedDonationForChat(item);
        setIsChatOpen(true);
    };

    const navigate = useNavigate();

    // Stats calculation
    const availableCount = feed.length;
    const claimedCount = myClaims.length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-green-50 via-white to-gray-50"
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
                                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
                                    <Heart className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="text-xl font-black text-gray-900">Find Food</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Notification Bell */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-gray-500 hover:text-brand-green hover:bg-green-50 rounded-full transition-all relative"
                                >
                                    <Bell className="h-5 w-5" />
                                    {notifications.filter(n => !n.is_read).length > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                            {notifications.filter(n => !n.is_read).length}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-2 z-20 border border-gray-100">
                                        <div className="px-4 py-2 border-b border-gray-100 font-bold text-gray-800">Notifications</div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {notifications.filter(n => !n.is_read).length === 0 ? (
                                                <div className="px-4 py-4 text-sm text-gray-500 text-center">No new alerts</div>
                                            ) : (
                                                notifications.filter(n => !n.is_read).map(notif => (
                                                    <div
                                                        key={notif.id}
                                                        onClick={async () => {
                                                            try {
                                                                setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                                                await axios.put(`http://localhost:5000/api/notifications/${notif.id}/read`);
                                                            } catch (err) {
                                                                console.error('Failed to mark as read', err);
                                                            }
                                                        }}
                                                        className="px-4 py-3 hover:bg-green-50 border-b border-gray-50 last:border-0 cursor-pointer transition-colors"
                                                    >
                                                        <p className="text-sm text-gray-800">{notif.message}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all text-white font-bold"
                            >
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-xl">
                                <Package className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{availableCount}</p>
                                <p className="text-xs text-gray-500">Available</p>
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
                            <div className="bg-orange-100 p-2 rounded-xl">
                                <Clock className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{claimedCount}</p>
                                <p className="text-xs text-gray-500">My Claims</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex flex-col md:flex-row gap-6">

                {/* Main Feed */}
                <div className="flex-1">
                    {/* Search Bar */}
                    <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="text" className="focus:ring-brand-green focus:border-brand-green block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 shadow-sm border" placeholder="Search for food nearby..." />
                    </div>

                    {/* My Active Claims Section */}
                    {myClaims.length > 0 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">My Active Orders</h2>
                            <div className="space-y-4">
                                {myClaims.map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg shadow-sm border border-brand-green p-4 flex flex-col sm:flex-row gap-4 relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold uppercase rounded-bl-lg
                                            ${item.status === 'in_transit' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {item.status === 'claimed' ? 'Waiting Pickup' : item.status === 'in_transit' ? 'On the Way' : item.status}
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{item.food_type}</h3>
                                            <p className="text-sm text-gray-500">{item.quantity} Servings</p>

                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Donor Info */}
                                                <div className="text-sm">
                                                    <p className="text-xs text-gray-400 uppercase font-semibold">Pickup From</p>
                                                    <p className="font-medium text-gray-800">{item.profiles?.name}</p>
                                                    <p className="text-gray-500 flex items-center"><Phone className="h-3 w-3 mr-1" /> {item.profiles?.phone}</p>
                                                    <p className="text-gray-400 text-xs mt-1">{item.location?.address}</p>
                                                </div>

                                                {/* Volunteer Info (if assigned) */}
                                                {item.volunteer && (
                                                    <div className="text-sm bg-blue-50 p-2 rounded">
                                                        <p className="text-xs text-blue-800 uppercase font-semibold">Delivery By</p>
                                                        <p className="font-medium text-gray-800">{item.volunteer.name}</p>
                                                        <p className="text-blue-600 flex items-center"><Phone className="h-3 w-3 mr-1" /> {item.volunteer.phone}</p>
                                                        <p className="text-blue-600 flex items-center"><Phone className="h-3 w-3 mr-1" /> {item.volunteer.phone}</p>
                                                    </div>
                                                )}

                                                {/* Chat Button for Receiver */}
                                                {(item.volunteer_id) && (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => handleOpenChat(item)}
                                                            className="w-full flex items-center justify-center px-3 py-2 bg-indigo-100 text-indigo-700 text-sm font-bold rounded hover:bg-indigo-200 transition-colors shadow-sm"
                                                        >
                                                            <MessageCircle className="w-4 h-4 mr-2" /> Chat with {item.volunteer?.name || 'Deliverer'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h2 className="text-lg font-medium text-gray-900 mb-4 flex justify-between">
                        Available Near You
                        <button onClick={fetchFeed}><RefreshCcw size={18} className="text-gray-400 hover:text-brand-green" /></button>
                    </h2>

                    <div className="space-y-4">
                        {feed.length === 0 ? (
                            <p className="text-center text-gray-500 py-10">No food available right now. Check back later!</p>
                        ) : (
                            feed.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4">
                                    <div className="h-24 w-24 bg-gray-200 rounded-md flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                                        No Image
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{item.food_type}</h3>
                                                <p className="text-sm text-gray-500">{item.quantity} Servings</p>
                                            </div>
                                        </div>
                                        <div className="mt-2 flex items-center text-sm text-gray-500">
                                            <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {item.location?.address || 'Unknown Location'}
                                        </div>
                                        {item.profiles && (
                                            <div className="mt-1 flex items-center text-sm text-gray-400">
                                                <User className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                                Donor: {item.profiles.name || 'Anonymous'}
                                            </div>
                                        )}
                                        <div className="mt-4 flex space-x-3">
                                            <button
                                                onClick={() => handleClaimClick(item)}
                                                className="w-full mt-3 bg-brand-green text-white py-2 rounded font-medium hover:bg-green-700 transition-colors"
                                            >
                                                Claim Food
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar / Request Section */}
                <div className="w-full md:w-80">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                        <div className="text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-brand-blue" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Can't find what you need?</h3>
                            <p className="mt-1 text-sm text-gray-500">Post a request to let local donors know what you are looking for.</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowRequestForm(true)}
                                    type="button"
                                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                                >
                                    Post Food Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Claim Success Modal (With Donor Details) */}
            {claimedItem && (
                <div className="fixed z-50 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setClaimedItem(null)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 animate-fade-in-up">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                    <Phone className="h-6 w-6 text-green-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Claim Successful!</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            You have reserved <strong>{claimedItem.food_type}</strong>.
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Please contact the donor to arrange pickup:
                                        </p>
                                        <div className="mt-4 bg-gray-50 p-4 rounded-md">
                                            <p className="text-lg font-bold text-gray-800">{claimedItem.profiles?.name || 'Donor'}</p>
                                            <p className="text-brand-green font-medium flex items-center justify-center mt-1">
                                                <Phone className="h-4 w-4 mr-2" />
                                                {claimedItem.profiles?.phone || 'No phone provided'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">Location: {claimedItem.location?.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="button"
                                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-green text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm"
                                    onClick={() => setClaimedItem(null)}
                                >
                                    Got it, I'll call them
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Form Modal */}
            {showRequestForm && (
                <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowRequestForm(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleRequest}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">Request Food</h3>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">What do you need?</label>
                                                    <input name="item" type="text" required placeholder="e.g., 20 Packaged Meals" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Urgency</label>
                                                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm">
                                                        <option>Immediate (Today)</option>
                                                        <option>This Week</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                                    <input name="location" type="text" required placeholder="Your delivery address" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-blue text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                        {loading ? 'Posting...' : 'Post Request'}
                                    </button>
                                    <button type="button" onClick={() => setShowRequestForm(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* Claim Confirmation Modal */}
            {confirmingDonation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">How will you collect this?</h3>
                        <p className="text-gray-600 mb-6">If you cannot travel, we can alert volunteers nearby.</p>

                        <div className="space-y-3">
                            <button
                                onClick={() => confirmClaim(false)}
                                className="w-full flex justify-between items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 font-medium"
                            >
                                <span>I will pick it up myself</span>
                                <CheckCircle className="h-5 w-5" />
                            </button>

                            <button
                                onClick={() => confirmClaim(true)}
                                className="w-full flex justify-between items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 font-medium"
                            >
                                <span>I need volunteer delivery</span>
                                <Clock className="h-5 w-5" />
                            </button>
                        </div>

                        <button
                            onClick={() => setConfirmingDonation(null)}
                            className="mt-4 w-full text-center text-gray-400 hover:text-gray-600 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Modal */}
            {selectedDonationForChat && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    donationId={selectedDonationForChat.id}
                    currentUserId={user?.id}
                    receiverId={selectedDonationForChat.volunteer_id} // Receiver talks to Volunteer (who might be Donor)
                    title={`Chat with ${selectedDonationForChat.volunteer?.name || 'Deliverer'}`}
                />
            )}
        </motion.div>
    );
};

export default ReceiverDashboard;
