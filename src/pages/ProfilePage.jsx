import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Phone, MapPin, ArrowLeft, History, Save, Edit2 } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        location: null
    });

    // History State
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/auth');
            return;
        }
        const localUser = JSON.parse(userStr);

        try {
            // Fetch latest profile data
            const res = await axios.get(`http://localhost:5000/api/auth/profile/${localUser.id}`);
            const profile = res.data;
            setUser(profile);
            setFormData({
                name: profile.name,
                phone: profile.phone,
                location: profile.location
            });

            // Fetch History (Only for Donors for now)
            if (profile.role === 'donor') {
                const historyRes = await axios.get(`http://localhost:5000/api/donations/donor/${localUser.id}`);
                setHistory(historyRes.data);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch profile", error);
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`http://localhost:5000/api/auth/profile/${user.id}`, formData);
            setUser(res.data.user);
            setIsEditing(false);

            // Update local storage to reflect name change if needed (optional but good practice)
            const localUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...localUser, name: formData.name }));

            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update profile.");
        }
    };

    const handleLocationSelect = (loc) => {
        setFormData({ ...formData, location: loc });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center">
                    <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
                    {/* Profile Header Background */}
                    <div className="h-32 bg-gradient-to-r from-brand-green to-teal-600"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar */}
                        <div className="relative -mt-12 mb-6">
                            <div className="h-24 w-24 bg-white rounded-full p-1 shadow-md inline-block">
                                <div className="h-full w-full bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                                    <User className="h-10 w-10" />
                                </div>
                            </div>
                        </div>

                        {/* View Mode */}
                        {!isEditing ? (
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                        <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 capitalize">
                                            {user.role}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center text-brand-green hover:text-green-700 font-medium"
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                                    </button>
                                </div>

                                <div className="mt-6 flex flex-col space-y-4 text-gray-600">
                                    <div className="flex items-center">
                                        <Phone className="h-5 w-5 mr-3 text-gray-400" />
                                        {user.phone || "No phone added"}
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                                        <div>
                                            <p>{user.location?.address || "No location set"}</p>
                                            {/* Static Map Preview could go here if easy, but text is fine */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Edit Mode */
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-green focus:border-brand-green sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-brand-green focus:border-brand-green sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Home / Pickup Location</label>
                                    <div className="h-64 border rounded-md overflow-hidden">
                                        <LocationPicker onLocationSelect={handleLocationSelect} />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Selected: {formData.location?.address || "No location selected"}
                                    </p>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-green hover:bg-green-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" /> Save Changes
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* History Section */}
                {user.role === 'donor' && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <History className="h-5 w-5 mr-2 text-gray-500" /> Donation History
                        </h3>

                        <div className="bg-white shadow-sm rounded-lg border border-gray-200 divide-y divide-gray-200">
                            {history.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No donations made yet.</div>
                            ) : (
                                history.map(item => (
                                    <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.food_type}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} Servings • {new Date(item.created_at).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-400 mt-1">{item.location?.address}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                ${item.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
