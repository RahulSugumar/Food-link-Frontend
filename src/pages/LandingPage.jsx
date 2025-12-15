import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Users, ArrowRight } from 'lucide-react';
import FridgeLocator from '../components/FridgeLocator';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Heart className="h-8 w-8 text-brand-orange animate-pulse" />
                            <span className="ml-2 text-2xl font-bold text-gray-800">FoodBridge</span>
                        </div>
                        <div className="hidden md:flex space-x-8">
                            <a href="#about" className="text-gray-600 hover:text-brand-orange">About Us</a>
                            <a href="#locations" className="text-gray-600 hover:text-brand-orange">Fridge Locations</a>
                            <button onClick={() => navigate('/leaderboard')} className="text-gray-600 hover:text-brand-orange font-medium flex items-center">
                                Leaderboard 🏆
                            </button>
                        </div>
                        <button
                            onClick={() => navigate('/auth')}
                            className="bg-brand-orange text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-md"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
                        {/* Left Content */}
                        <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
                            <div className="sm:text-center lg:text-left">
                                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                    <span className="block xl:inline">Share Food,</span>{' '}
                                    <span className="block text-brand-green xl:inline">Share Love</span>
                                </h1>
                                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                    Connect surplus food with those in need. Join our community of donors and volunteers making a difference one meal at a time.
                                </p>
                                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                                    <div className="rounded-md shadow">
                                        <button
                                            onClick={() => navigate('/auth')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-orange hover:bg-orange-600 md:py-4 md:text-lg"
                                        >
                                            Start Donating
                                        </button>
                                    </div>
                                    <div className="mt-3 sm:mt-0 sm:ml-3">
                                        <button
                                            onClick={() => navigate('/auth')}
                                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-brand-green bg-green-100 hover:bg-green-200 md:py-4 md:text-lg"
                                        >
                                            Find Food
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Image/Placeholder */}
                        <div className="bg-gray-100 flex items-center justify-center h-full min-h-[400px] lg:min-h-full">
                            <div className="text-gray-400 flex flex-col items-center">
                                <Users size={64} className="mb-4 text-brand-blue opacity-50" />
                                <span className="text-lg">Community Connection</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <div id="about" className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-brand-green font-semibold tracking-wide uppercase">Our Mission</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Zero Hunger, Zero Waste
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            We bridge the gap between abundance and need by facilitating hyper-local food sharing through our network of community fridges and volunteer runners.
                        </p>
                    </div>
                </div>
            </div>

            {/* Locations Section */}
            <div id="locations" className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900">Community Fridges Near You</h2>
                        <p className="mt-4 text-lg text-gray-500">Real-time map and listing of available resources.</p>
                    </div>

                    {/* Interactive Fridge Map */}
                    <div className="mt-8">
                        <FridgeLocator />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-brand-dark text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; 2024 FoodBridge. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
