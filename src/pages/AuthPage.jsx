import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Heart, User, ArrowLeft, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';

const AuthPage = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('donor'); // 'donor', 'receiver', 'volunteer'
    const [isLogin, setIsLogin] = useState(false); // Default to Register as per request
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');
        const phone = formData.get('phone');

        const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';

        // SIMULATION: Injecting dummy coordinates for demo
        // Center point: 12.9716, 77.5946 (Bangalore)
        // Range: ~0.005 degrees is approx 500m. This ensures users are ALWAYS "nearby" (within 10km)
        const dummyLoc = {
            lat: 12.9716 + (Math.random() * 0.005),
            lng: 77.5946 + (Math.random() * 0.005),
            address: 'Simulator Location, Bangalore'
        };

        const payload = isLogin
            ? { email, password, role }
            : { email, password, role, name, phone, location: dummyLoc };

        try {
            const response = await axios.post(endpoint, payload);
            console.log('Auth success:', response.data);

            // Store user session
            if (response.data.user || response.data.session) {
                const user = response.data.user || (response.data.session ? response.data.session.user : null);
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }

            if (role === 'donor') {
                navigate('/donor/dashboard');
            } else if (role === 'receiver') {
                navigate('/receiver/dashboard');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert(error.response?.data?.error || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center cursor-pointer" onClick={() => navigate('/')}>
                    <Heart className="h-12 w-12 text-brand-orange" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isLogin ? 'Welcome back' : 'Join our Community'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {isLogin ? 'New here? ' : 'Already have an account? '}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="font-medium text-brand-orange hover:text-orange-500"
                    >
                        {isLogin ? 'Create an account' : 'Sign in'}
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* Role Selection - Always show so user can select which portal to login/register to */}
                <div>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole('donor')}
                            className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${role === 'donor'
                                ? 'border-brand-orange ring-1 ring-brand-orange text-brand-orange bg-orange-50'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                        >
                            Donate Food
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('receiver')}
                            className={`flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${role === 'receiver'
                                ? 'border-brand-green ring-1 ring-brand-green text-brand-green bg-green-50'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                        >
                            Find Food
                        </button>
                    </div>
                </div>



                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                    <form className="space-y-6" onSubmit={handleAuth}>
                        {/* Common Fields */}
                        {!isLogin && (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input id="name" name="name" type="text" required className="focus:ring-brand-orange focus:border-brand-orange block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="John Doe" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input id="phone" name="phone" type="tel" required className="focus:ring-brand-orange focus:border-brand-orange block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input id="email" name="email" type="email" required className="focus:ring-brand-orange focus:border-brand-orange block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border" placeholder="you@example.com" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="focus:ring-brand-orange focus:border-brand-orange block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${role === 'receiver' ? 'bg-brand-green hover:bg-green-700' : 'bg-brand-orange hover:bg-orange-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange transition-colors`}
                            >
                                {isLogin ? 'Sign In' : `Register as ${role === 'donor' ? 'Donor' : 'Receiver'}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
