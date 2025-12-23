import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Heart, User, ArrowLeft, Mail, Lock, Eye, EyeOff, Phone, Gift, Users, MapPin, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const AuthPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const containerRef = useRef(null);
    const formRef = useRef(null);
    const visualRef = useRef(null);

    // State
    const [role, setRole] = useState(searchParams.get('role') || 'donor');
    const [isLogin, setIsLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // GSAP Animations
    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Initial Fade In
        tl.from(containerRef.current, { opacity: 0, duration: 0.8, ease: "power2.out" })

            // 2. Split Screen Animation
            .from(visualRef.current, { x: -50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.4")
            .from(formRef.current, { x: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.8");

        // 3. Floating Elements (Continuous)
        gsap.to(".floating-icon", {
            y: "random(-15, 15)",
            rotation: "random(-10, 10)",
            duration: "random(2, 4)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.2
        });

    }, { scope: containerRef });

    // Handle Auth Submit
    const handleAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);

        const payload = isLogin
            ? {
                email: formData.get('email'),
                password: formData.get('password'),
                role
            }
            : {
                email: formData.get('email'),
                password: formData.get('password'),
                role,
                name: formData.get('name'),
                phone: formData.get('phone'),
                location
            };

        const endpoint = isLogin ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';

        try {
            const response = await axios.post(endpoint, payload);
            if (response.data.user || response.data.session) {
                const user = response.data.user || (response.data.session ? response.data.session.user : null);
                if (user) localStorage.setItem('user', JSON.stringify(user));
            }

            // Success Animation before navigate
            gsap.to(formRef.current, {
                scale: 0.95, opacity: 0, duration: 0.3, ease: "back.in(1.7)",
                onComplete: () => {
                    if (role === 'donor') navigate('/donor-dashboard');
                    else if (role === 'receiver') navigate('/receiver-dashboard');
                    else if (role === 'volunteer') navigate('/volunteer-dashboard');
                    else navigate('/');
                }
            });

        } catch (error) {
            console.error('Auth error:', error);
            // Shake Animation on Error
            gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
            alert(error.response?.data?.error || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Role Config Theme
    const roleConfig = {
        donor: { color: 'orange', bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
        receiver: { color: 'green', bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50' },
        volunteer: { color: 'blue', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' }
    };
    const theme = roleConfig[role];

    return (
        <div ref={containerRef} className="min-h-screen bg-orange-50 font-sans text-slate-900 relative overflow-y-auto overflow-x-hidden flex items-center justify-center p-4 lg:p-0">

            {/* Grain Texture */}
            <div className="fixed inset-0 pointer-events-none z-[50] opacity-40 mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>

            {/* Background Gradient Blurs */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-orange-200/40 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-green-200/40 rounded-full blur-[120px] mix-blend-multiply" />
            </div>

            <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 min-h-screen items-center relative z-10 py-10">

                {/* LEFT SIDE: Visual Showcase */}
                <div ref={visualRef} className="hidden lg:flex flex-col justify-center p-12 relative">
                    <button
                        onClick={() => navigate('/')}
                        className="absolute top-0 left-12 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Back to Home
                    </button>

                    <div className="relative">
                        <h1 className="font-display font-black text-6xl xl:text-7xl leading-tight mb-8 text-slate-900">
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-600">
                                Food Revolution.
                            </span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-md mb-12 font-medium">
                            Create a world with zero hunger and zero waste. One meal at a time.
                        </p>

                        {/* Floating 3D Elements Showcase */}
                        <div className="relative h-64 w-full max-w-md">
                            <div className={`floating-icon absolute top-0 left-10 w-20 h-20 ${theme.light} rounded-2xl flex items-center justify-center shadow-lg border border-white/50 backdrop-blur-md`}>
                                <Heart className={`w-10 h-10 ${theme.text}`} fill="currentColor" />
                            </div>
                            <div className="floating-icon absolute top-20 right-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100 z-10">
                                <span className="text-4xl">🥦</span>
                            </div>
                            <div className="floating-icon absolute bottom-0 left-20 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100">
                                <Shield className="w-8 h-8 text-slate-400" />
                            </div>

                            {/* Glass Card in BG */}
                            <div className="absolute inset-4 bg-white/30 backdrop-blur-md rounded-[2rem] border border-white/40 -z-10" />
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Auth Form */}
                <div ref={formRef} className="w-full max-w-md mx-auto relative">
                    {/* Mobile Back Button */}
                    <div className="lg:hidden mb-8">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 font-bold">
                            <ArrowLeft className="w-5 h-5" /> Back
                        </button>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-orange-500/10 border border-white">

                        {/* Form Header */}
                        <div className="text-center mb-8">
                            <div className={`w-14 h-14 ${theme.bg} rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 text-white transform rotate-3`}>
                                <User className="w-7 h-7" />
                            </div>
                            <h2 className="font-display font-bold text-3xl text-slate-900 mb-2">
                                {isLogin ? 'Welcome Back' : 'Get Started'}
                            </h2>
                            <p className="text-slate-500">
                                {isLogin ? 'Enter your details to access your account' : 'Join the community today'}
                            </p>
                        </div>

                        {/* Role Selector */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-8">
                            {['donor', 'receiver', 'volunteer'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`py-2 px-1 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${role === r ? 'bg-white shadow-sm text-slate-900 scale-100' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        {/* Form Fields */}
                        <form onSubmit={handleAuth} className="space-y-5">
                            {!isLogin && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                                            <input name="name" required placeholder="John Doe" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-slate-500 ml-1">Phone</label>
                                            <input name="phone" required placeholder="+1 234..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 ml-1">Location</label>
                                        <LocationPicker onLocationSelect={setLocation} />
                                    </div>
                                </>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-1">Email</label>
                                <input name="email" type="email" required placeholder="hello@example.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 ml-1">Password</label>
                                <div className="relative">
                                    <input name="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-medium text-slate-900 placeholder:text-slate-400" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-display font-bold text-lg text-white shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${role === 'donor' ? 'bg-gradient-to-r from-brand-orange to-orange-600' :
                                    role === 'receiver' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                        'bg-gradient-to-r from-indigo-500 to-indigo-600'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <button onClick={() => setIsLogin(!isLogin)} className="text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span className={`font-bold ${theme.text} underline decoration-2 underline-offset-2 decoration-transparent hover:decoration-current transition-all`}>
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
