import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, User } from 'lucide-react';

const ChatModal = ({ isOpen, onClose, donationId, currentUserId, receiverId, title }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const pollInterval = useRef(null);

    // Fetch messages
    const fetchMessages = async () => {
        if (!donationId) {
            console.warn("ChatModal: No donationId provided");
            return;
        }
        try {
            console.log(`[Chat] Fetching for Donation: ${donationId}`);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/chat/${donationId}`);
            console.log(`[Chat] Messages Fetched:`, res.data.length, res.data);
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling for real-time updates when open
    useEffect(() => {
        if (isOpen && donationId) {
            fetchMessages(); // Initial fetch
            pollInterval.current = setInterval(fetchMessages, 2000); // Poll every 3s
        } else {
            setMessages([]);
        }

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [isOpen, donationId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/chat/send`, {
                sender_id: currentUserId,
                receiver_id: receiverId,
                donation_id: donationId,
                message: newMessage
            });
            setNewMessage('');
            fetchMessages(); // Refresh immediately
        } catch (err) {
            console.error("Failed to send message", err);
            alert("Failed to send message");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[500px] animate-fade-in">

                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-brand-orange text-white rounded-t-lg">
                    <h3 className="font-bold flex items-center">
                        <span className="mr-2">💬</span> {title || 'Chat'}
                    </h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm mt-10">No messages yet. Start the conversation!</p>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === currentUserId;
                            const senderName = msg.sender?.name || 'Unknown';

                            return (
                                <div key={msg.id} className={`flex w-full mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                        <span className={`text-[10px] text-gray-500 mb-1 px-1`}>
                                            {isMe ? 'You' : senderName}
                                        </span>
                                        <div className={`rounded-2xl px-4 py-2 shadow-sm ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.message}</p>
                                        </div>
                                        <p className={`text-[10px] mt-1 px-1 ${isMe ? 'text-gray-400' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-lg flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-brand-orange text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatModal;
