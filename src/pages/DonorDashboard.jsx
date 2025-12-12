import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusCircle, Clock, MapPin, CheckCircle, RefreshCcw, ArrowLeft } from 'lucide-react';
import LocationPicker from '../components/LocationPicker'; // Import component

const DonorDashboard = () => {
    const [showDonateForm, setShowDonateForm] = useState(false);
    const [myDonations, setMyDonations] = useState([]);
    const [recentDonations, setRecentDonations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null); // Map state

    const fetchDonations = async () => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        try {
            // Fetch Community Recent
            const recentRes = await axios.get('http://localhost:5000/api/donations/recent');
            setRecentDonations(recentRes.data);

            // Fetch My Donations (if logged in)
            if (user && user.id) {
                const myRes = await axios.get(`http://localhost:5000/api/donations/donor/${user.id}`);
                setMyDonations(myRes.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDonations();
    }, []);

    const handleDonate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
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
            quantity: formData.get('quantity'),
            location: finalLocation,
            status: 'available',
            expiry_time: new Date(Date.now() + parseInt(formData.get('expiry_hours')) * 3600000).toISOString()
        };

        try {
            await axios.post('http://localhost:5000/api/donations', data);
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

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar Placeholder */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold text-brand-orange">FoodBridge Donor</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="bg-orange-100 text-brand-orange px-3 py-1 rounded-full text-sm font-medium">Impact: 45 Meals</div>
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                                <ul role="list" className="divide-y divide-gray-200">
                                    {myDonations.map((donation) => (
                                        <li key={donation.id}>
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-brand-orange truncate">{donation.food_type}</p>
                                                    <div className="ml-2 flex-shrink-0 flex">
                                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${donation.status === 'reserved' ? 'bg-green-100 text-green-800' :
                                                            donation.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {donation.status}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    Quantity: {donation.quantity} • Posted: {new Date(donation.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

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
            </main>
        </div>
    );
};

export default DonorDashboard;
