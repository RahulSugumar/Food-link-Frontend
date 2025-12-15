import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Navigation, Package, Phone, CheckCircle, RefreshCcw, User, ArrowLeft, MessageCircle } from 'lucide-react';
import ChatModal from '../components/ChatModal';

const VolunteerDashboard = () => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('available'); // 'available', 'my_tasks', 'history'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const [user, setUser] = useState(null);

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
    }, []);

    const fetchTasks = async () => {
        if (!user) return;

        try {
            const res = await axios.get(`http://localhost:5000/api/donations/volunteer/tasks/${user.id}`);
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    const handleAccept = async (id) => {
        if (!user) return;

        try {
            await axios.put(`http://localhost:5000/api/donations/${id}/accept`, { volunteer_id: user.id });
            alert("Task accepted successfully!");
            fetchTasks(); // Refresh tasks to update UI
        } catch (err) {
            console.error(err);
            alert("Failed to accept task.");
        }
    };

    const handleDeliver = async (id) => {
        if (!window.confirm("Confirm delivery completion?")) return;
        try {
            await axios.put(`http://localhost:5000/api/donations/${id}/deliver`);
            alert("Great job! Delivery recorded.");
            fetchTasks(); // Refresh to move it to history
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [selectedDonationForChat, setSelectedDonationForChat] = useState(null);

    const handleOpenChat = (task) => {
        setSelectedDonationForChat(task);
        setIsChatOpen(true);
    };

    const availableTasks = tasks.filter(t => t.status === 'claimed');
    const myTasks = tasks.filter(t => t.status === 'in_transit');
    const pastTasks = tasks.filter(t => t.status === 'delivered');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold text-brand-blue">Volunteer Portal</h1>
                    </div>
                    <button onClick={() => navigate('/profile')} className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center hover:ring-2 hover:ring-brand-blue transition-all" title="My Profile">
                        <span className="text-xs font-bold text-gray-600">ME</span>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-1">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`pb-2 px-4 font-medium text-sm ${activeTab === 'available' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Available Pickups ({availableTasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('my_tasks')}
                        className={`pb-2 px-4 font-medium text-sm ${activeTab === 'my_tasks' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        My Active Deliveries ({myTasks.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-2 px-4 font-medium text-sm ${activeTab === 'history' ? 'border-b-2 border-brand-blue text-brand-blue' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        History ({pastTasks.length})
                    </button>
                    <button onClick={fetchTasks} className="ml-auto text-gray-400 hover:text-brand-blue"><RefreshCcw size={18} /></button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {(activeTab === 'available' ? availableTasks : activeTab === 'my_tasks' ? myTasks : pastTasks).map(item => (
                        <div key={item.id} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">{item.food_type} <span className="text-xs font-normal text-gray-500">({item.quantity})</span></h3>

                                    {/* Pickup Info */}
                                    <div className="mt-2 text-sm">
                                        <p className="font-semibold text-gray-700 flex items-center"><MapPin className="h-3 w-3 mr-1 text-red-500" /> Pickup From:</p>
                                        <p className="text-gray-600 ml-4">{item.location?.address}</p>
                                        {activeTab === 'my_tasks' && (
                                            <p className="text-blue-600 ml-4 flex items-center mt-1"><Phone className="h-3 w-3 mr-1" /> {item.profiles?.name} ({item.profiles?.phone})</p>
                                        )}
                                        {activeTab === 'history' && (
                                            <p className="text-gray-400 ml-4 text-xs mt-1">Completed on: {new Date(item.created_at).toLocaleDateString()}</p>
                                        )}
                                    </div>

                                    {/* Dropoff Info (Only visible if Accepted) */}
                                    {activeTab === 'my_tasks' && (
                                        <div className="mt-3 text-sm border-t pt-2 border-dashed">
                                            <p className="font-semibold text-gray-700 flex items-center"><MapPin className="h-3 w-3 mr-1 text-green-500" /> Deliver To:</p>
                                            <p className="text-gray-600 ml-4 text-xs italic">Receiver location would be here (Adding receiver location to donation record is a future improvement). For now, call donor for details.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col space-y-2">
                                    {activeTab === 'available' ? (
                                        <button
                                            onClick={() => handleAccept(item.id)}
                                            className="px-4 py-2 bg-brand-blue text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm"
                                        >
                                            Accept Task
                                        </button>
                                    ) : activeTab === 'my_tasks' ? (
                                        <div className="flex flex-col space-y-2 w-full">
                                            <button
                                                onClick={() => handleDeliver(item.id)}
                                                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 shadow-sm flex items-center justify-center w-full"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-1" /> Mark Delivered
                                            </button>
                                            <button
                                                onClick={() => handleOpenChat(item)}
                                                className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded hover:bg-indigo-200 shadow-sm flex items-center justify-center w-full"
                                            >
                                                <MessageCircle className="h-4 w-4 mr-1" /> Chat
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center">
                                            <CheckCircle className="h-3 w-3 mr-1" /> DELIVERED
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {(activeTab === 'available' ? availableTasks : activeTab === 'my_tasks' ? myTasks : pastTasks).length === 0 && (
                        <p className="text-center text-gray-400 py-10">No tasks found in this section.</p>
                    )}
                </div>
            </main >

            {/* Chat Modal */}
            {
                selectedDonationForChat && (
                    <ChatModal
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        donationId={selectedDonationForChat.id}
                        currentUserId={user?.id}
                        receiverId={selectedDonationForChat.receiver_id} // Volunteer talks to Receiver
                        title={`Chat with Receiver`}
                    />
                )
            }
        </div >
    );
};

export default VolunteerDashboard;
