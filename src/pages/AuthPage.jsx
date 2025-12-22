import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, User, ArrowLeft, Mail, Lock, Eye, EyeOff, Phone, Sparkles, Users, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LocationPicker from '../components/LocationPicker';

const AuthPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('donor');
    const [isLogin, setIsLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [location, setLocation] = useState(null);

    const handleLocationSelect = (loc) => {
        setLocation(loc);
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');
        const phone = formData.get('phone');

        const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';

        const payload = isLogin
            ? { email, password, role }
            : { email, password, role, name, phone, location };

        try {
            const response = await axios.post(endpoint, payload);
            console.log('Auth success:', response.data);

            if (response.data.user || response.data.session) {
                const user = response.data.user || (response.data.session ? response.data.session.user : null);
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }

            if (role === 'donor') {
                navigate('/donor-dashboard');
            } else if (role === 'receiver') {
                navigate('/receiver-dashboard');
            } else if (role === 'volunteer') {
                navigate('/volunteer-dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert(error.response?.data?.error || 'Authentication failed');
        }
    };

    const roleConfig = {
        donor: {
            color: 'orange',
            icon: Gift,
            label: 'Donate Food',
            gradient: 'from-orange-500 to-red-500',
            bg: 'bg-orange-50',
            border: 'border-brand-orange2',
            text: 'text-brand-orange2',
            ring: 'ring-brand-orange2'
        },
        receiver: {
            color: 'green',
            icon: Heart,
            label: 'Find Food',
            gradient: 'from-green-500 to-emerald-600',
            bg: 'bg-green-50',
            border: 'border-brand-green',
            text: 'text-brand-green',
            ring: 'ring-brand-green'
        },
        volunteer: {
            color: 'blue',
            icon: Users,
            label: 'Volunteer',
            gradient: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50',
            border: 'border-brand-blue',
            text: 'text-brand-blue',
            ring: 'ring-brand-blue'
        }
    };

    const currentRole = roleConfig[role];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex relative overflow-x-hidden overflow-y-auto"
        >
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        x: [0, -20, 0],
                        y: [0, 40, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-green-100/30 rounded-full blur-[120px]"
                />
            </div>

            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-all group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100"
            >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-medium">Back to Home</span>
            </motion.button>

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-8 xl:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-lg w-full"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-white p-3 rounded-2xl shadow-lg">
                            <Heart className="h-10 w-10 text-brand-orange2 fill-orange-100" />
                        </div>
                        <span className="text-3xl font-black text-gray-900">FoodBridge</span>
                    </div>

                    {/* Tagline */}
                    <h1 className="text-4xl xl:text-5xl font-black text-gray-900 leading-tight mb-4">
                        Join the Movement.<br />
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentRole.gradient}`}>
                            {role === 'donor' ? 'Share Abundance.' : role === 'receiver' ? 'Find Nourishment.' : 'Make Impact.'}
                        </span>
                    </h1>
                    <p className="text-lg xl:text-xl text-gray-500 leading-relaxed mb-6">
                        Connect with your community through our hyper-local food sharing network. Zero waste, zero hunger.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6 xl:gap-8 mb-6">
                        <div>
                            <p className="text-2xl xl:text-3xl font-black text-gray-900">15K+</p>
                            <p className="text-xs xl:text-sm text-gray-500">Meals Shared</p>
                        </div>
                        <div>
                            <p className="text-2xl xl:text-3xl font-black text-gray-900">850+</p>
                            <p className="text-xs xl:text-sm text-gray-500">Volunteers</p>
                        </div>
                        <div>
                            <p className="text-2xl xl:text-3xl font-black text-gray-900">12</p>
                            <p className="text-xs xl:text-sm text-gray-500">Cities</p>
                        </div>
                    </div>

                    {/* Decorative Card - Now inline */}
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-flex bg-white p-3 rounded-2xl shadow-lg border border-gray-100 items-center gap-3"
                    >
                        <div className={`${currentRole.bg} p-2 rounded-xl`}>
                            <Sparkles className={`h-4 w-4 ${currentRole.text}`} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">Welcome!</p>
                            <p className="text-sm font-bold text-gray-900">Start your journey</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className={`w-full lg:w-1/2 flex ${isLogin ? 'items-center' : 'items-start'} justify-center px-4 sm:px-6 lg:px-8 py-6 mt-14 lg:mt-0`}>
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md py-4"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-3">
                        <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            <Heart className="h-7 w-7 text-brand-orange2" />
                            <span className="text-xl font-black text-gray-900">FoodBridge</span>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 ${isLogin ? 'p-8' : 'p-6'}`}>
                        {/* Header */}
                        <div className={`text-center ${isLogin ? 'mb-8' : 'mb-4'}`}>
                            <h2 className="text-2xl font-black text-gray-900">
                                {isLogin ? 'Welcome Back!' : 'Create Account'}
                            </h2>
                            <p className="mt-2 text-gray-500">
                                {isLogin ? "Don't have an account? " : 'Already registered? '}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className={`font-semibold ${currentRole.text} hover:underline`}
                                >
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>

                        {/* Role Selection */}
                        <div className={`${isLogin ? 'mb-6' : 'mb-4'}`}>
                            <p className="text-sm font-medium text-gray-700 mb-2">I want to...</p>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(roleConfig).map(([key, config]) => {
                                    const Icon = config.icon;
                                    const isActive = role === key;
                                    return (
                                        <motion.button
                                            key={key}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={() => setRole(key)}
                                            className={`flex flex-col items-center justify-center ${isLogin ? 'py-3' : 'py-2'} px-2 rounded-xl border-2 transition-all ${isActive
                                                ? `${config.border} ${config.bg} ${config.text} ring-2 ${config.ring} ring-offset-1`
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className={`h-4 w-4 ${isLogin ? 'mb-1' : ''} ${isActive ? '' : 'opacity-60'}`} />
                                            <span className="text-xs font-semibold">{config.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-3" onSubmit={handleAuth}>
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                    >
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    name="name"
                                                    type="text"
                                                    required
                                                    placeholder="John Doe"
                                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange2/20 focus:border-brand-orange2 transition-all bg-gray-50/50 focus:bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    name="phone"
                                                    type="tel"
                                                    required
                                                    placeholder="+91 98765 43210"
                                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange2/20 focus:border-brand-orange2 transition-all bg-gray-50/50 focus:bg-white"
                                                />
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
                                            <LocationPicker onLocationSelect={handleLocationSelect} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange2/20 focus:border-brand-orange2 transition-all bg-gray-50/50 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-12 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange2/20 focus:border-brand-orange2 transition-all bg-gray-50/50 focus:bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-lg bg-gradient-to-r ${currentRole.gradient} shadow-lg hover:shadow-xl transition-all mt-6`}
                            >
                                {isLogin ? 'Sign In' : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
                            </motion.button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-xs text-gray-400 mt-6">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AuthPage;

