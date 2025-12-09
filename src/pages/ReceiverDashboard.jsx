import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Clock, AlertCircle, RefreshCcw, User, Phone, X } from 'lucide-react';

const ReceiverDashboard = () => {
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(false);

    // State to show donor details after full claim
    const [claimedItem, setClaimedItem] = useState(null);

    const fetchFeed = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/donations');
            // Filter for available items only if backend doesn't
            setFeed(res.data.filter(d => d.status === 'available'));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

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

    const handleClaim = async (item) => {
        try {
            // Delete the item from DB but get its details back
            const res = await axios.delete(`http://localhost:5000/api/donations/${item.id}`);
            fetchFeed(); // Refresh feed to remove the item
            // Show details of the item just claimed (using data returned from delete)
            setClaimedItem(res.data.data);
        } catch (err) {
            console.error(err);
            alert('Failed to claim food (it might already be taken).');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-brand-green">FoodBridge Receiver</h1>
                    <div className="flex items-center space-x-4">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-500 hover:text-brand-green focus:outline-none relative">
                                <Bell className="h-6 w-6" />
                                {notifications.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                        {notifications.length}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                                    <div className="px-4 py-2 border-b border-gray-100 font-semibold text-gray-700">Notifications</div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-500 text-center">No new alerts</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                                    <p className="text-sm text-gray-800">{notif.message}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleTimeString()}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6">

                {/* Main Feed */}
                <div className="flex-1">
                    {/* Search Bar */}
                    <div className="mb-6 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="text" className="focus:ring-brand-green focus:border-brand-green block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 shadow-sm border" placeholder="Search for food nearby..." />
                    </div>

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
                                                onClick={() => handleClaim(item)}
                                                className="flex-1 bg-brand-green text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 shadow-sm transition-colors"
                                            >
                                                Claim Now
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
        </div>
    );
};

export default ReceiverDashboard;
