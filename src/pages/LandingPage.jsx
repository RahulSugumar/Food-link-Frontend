import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Gift, ArrowRight, Sparkles, TrendingUp, Shield, Users, ArrowUpRight } from 'lucide-react';
import FridgeLocator from '../components/FridgeLocator';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const bentoRef = useRef(null);

    // --- Lenis Smooth Scroll Setup ---
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline();

        // --- 1. Preloader Sequence ---
        // Lock body scroll logic would go here in a real app
        tl.to(".preloader-logo", {
            scale: 1.2,
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        })
            .to(".preloader-logo", {
                y: -50,
                opacity: 0,
                duration: 0.5,
                ease: "back.in(1.7)"
            })
            .to(".preloader-curtain", {
                yPercent: -100,
                duration: 1.2,
                ease: "power4.inOut",
                stagger: 0.1
            })
            .set(".preloader", { display: "none" });

        // --- 2. Hero "Masked" Text Reveal ---
        // This creates that expensive "sliding up from invisible" look
        tl.from(".hero-line-inner", {
            yPercent: 100,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.15
        }, "-=0.8");

        // --- 3. Hero Elements Fade In ---
        tl.from(".hero-fade-in", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.8");

        // --- 4. 3D Card Entrance ---
        tl.from(".hero-card-container", {
            x: 100,
            opacity: 0,
            rotateY: -15,
            duration: 1.5,
            ease: "power3.out"
        }, "-=1");

        // --- Interactive 3D Card Tilt ---
        const card = document.querySelector(".hero-3d-card");
        if (card) {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                gsap.to(card, {
                    rotationX: rotateX,
                    rotationY: rotateY,
                    duration: 0.4,
                    ease: "power1.out",
                    overwrite: "auto"
                });
            });
            card.addEventListener("mouseleave", () => {
                gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.5, ease: "power2.out" });
            });
        }

        // --- Bento Grid Parallax Reveal ---
        const cards = gsap.utils.toArray(".bento-card");
        cards.forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top bottom-=100",
                    toggleActions: "play none none reverse"
                },
                y: 100,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        });

        // --- Footer Parallax Text ---
        gsap.to(".footer-parallax", {
            scrollTrigger: {
                trigger: ".footer-container",
                start: "top bottom",
                end: "bottom bottom",
                scrub: 1
            },
            y: -50,
            ease: "none"
        });

    }, { scope: containerRef });

    // Helper for "Masked" Text
    const MaskedText = ({ children, className }) => (
        <div className={`overflow-hidden ${className}`}>
            <div className="hero-line-inner inline-block">
                {children}
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-[#FFFBF7] font-sans text-slate-900 overflow-x-hidden relative">

            {/* --- CINEMATIC PRELOADER --- */}
            <div className="preloader fixed inset-0 z-[9999] flex flex-col pointer-events-none">
                <div className="preloader-curtain flex-1 bg-slate-900 w-full relative flex items-center justify-center">
                    <div className="preloader-logo opacity-0 flex items-center gap-3 text-white transform scale-90">
                        <div className="bg-brand-orange p-3 rounded-2xl">
                            <Heart className="h-8 w-8 fill-current" />
                        </div>
                        <span className="font-display font-black text-4xl tracking-tighter">FoodBridge</span>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-[#FFFBF7]/80 backdrop-blur-md border-b border-orange-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-tr from-brand-orange to-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
                                <Heart className="h-5 w-5" fill="currentColor" />
                            </div>
                            <span className="font-display font-black text-xl tracking-tight text-slate-900">
                                FoodBridge
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/auth')} className="text-sm font-bold text-slate-600 hover:text-brand-orange transition-colors">Sign in</button>
                            <button onClick={() => navigate('/auth')} className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:scale-105">Get Started</button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Ultra-Premium Hero Section */}
            <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10">
                {/* Background ambient light */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange/10 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative z-20">
                            {/* Masked Title Reveal */}
                            <div className="mb-8">
                                <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-wider mb-8">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                                    </span>
                                    Reimagining Food Rescue
                                </div>

                                <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                    <MaskedText className="block">Share Food,</MaskedText>
                                    <MaskedText className="block pb-4">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-orange-600">
                                            Share Hope.
                                        </span>
                                    </MaskedText>
                                </h1>
                            </div>

                            <p className="hero-fade-in font-sans text-xl text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
                                The hyper-local network connecting surplus food with community needs. Join the movement today.
                            </p>

                            <div className="hero-fade-in flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => navigate('/auth?role=donor')}
                                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-display font-bold text-lg hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/10"
                                >
                                    <span>Start Donating</span>
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </button>
                                <button
                                    onClick={() => navigate('/auth?role=receiver')}
                                    className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-display font-bold text-lg hover:border-slate-900 hover:text-slate-900 transition-all hover:-translate-y-1"
                                >
                                    <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Find Food</span>
                                </button>
                            </div>
                        </div>

                        {/* 3D Glass Command Center */}
                        <div className="hero-card-container relative lg:h-[700px] perspective-1000 hidden lg:block">
                            <div className="hero-3d-card relative h-full w-full transform preserve-3d cursor-default">
                                <div className="absolute top-8 -right-8 w-full h-full bg-slate-100 rounded-[3rem] -z-10" />
                                <div className="relative h-full bg-white/60 backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-white/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-10 flex flex-col">
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-xl text-slate-900">Live Activity</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Real-time</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-600 text-xs font-bold">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Active
                                        </div>
                                    </div>
                                    <div className="space-y-6 flex-1">
                                        {[
                                            { t: "Fresh Vegetables", s: "5kg • Just now", icon: "🥦" },
                                            { t: "Bakery Bundle", s: "0.5km away", icon: "🥐" },
                                            { t: "Canned Goods", s: "1.2km away", icon: "🥫" },
                                            { t: "Dairy Products", s: "2.0km away", icon: "🥛" }
                                        ].map((item, i) => (
                                            <div key={i} className="group flex items-center gap-5 hover:bg-white/50 p-2 rounded-2xl transition-colors">
                                                <div className={`h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300`}>{item.icon}</div>
                                                <div className="flex-1 min-w-0 border-b border-slate-50 pb-2 group-last:border-0">
                                                    <h4 className="font-display font-bold text-slate-900 text-lg">{item.t}</h4>
                                                    <p className="text-sm text-slate-400 font-medium">{item.s}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Marquee with GSAP ScrollTrigger (Velocity) */}
            <div className="py-12 border-y border-slate-100 bg-white/50 backdrop-blur-sm overflow-hidden">
                <div className="whitespace-nowrap flex gap-24 items-center opacity-30 select-none pointer-events-none animate-marquee">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-24">
                            <span className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-white stroke-text">FOODBRIDGE</span>
                            <span className="text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-white stroke-text">FOODBRIDGE</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bento Grid Section */}
            <section ref={bentoRef} className="py-32 bg-white relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20 text-center max-w-2xl mx-auto">
                        <span className="text-brand-orange font-bold tracking-wider uppercase text-xs bg-orange-50 px-3 py-1 rounded-full border border-orange-100 mb-4 inline-block">Features</span>
                        <h2 className="font-display text-4xl md:text-5xl font-black text-slate-900 mb-6">Built for <span className="text-brand-orange">Efficiency</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[600px]">
                        {/* Large Card */}
                        <div className="bento-card md:col-span-2 bg-[#FFFBF7] rounded-[2.5rem] p-10 border border-orange-100 relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500">
                            <div className="relative z-10">
                                <MapPin className="w-12 h-12 text-brand-orange mb-6" />
                                <h3 className="font-display text-3xl font-bold text-slate-900 mb-4">Real-time Locator</h3>
                                <p className="text-lg text-slate-600 max-w-md">Instantly find the nearest community fridge.</p>
                            </div>
                        </div>

                        {/* Tall Card */}
                        <div className="bento-card bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden text-white group hover:scale-[1.02] transition-transform duration-500">
                            <div className="relative z-10">
                                <Shield className="w-12 h-12 text-green-400 mb-6" />
                                <h3 className="font-display text-3xl font-bold mb-4">Verified & Safe</h3>
                                <p className="text-slate-400">Strict verification process ensures every meal is safe.</p>
                            </div>
                        </div>

                        {/* Wide Card */}
                        <div className="bento-card md:col-span-3 bg-green-50 rounded-[2.5rem] p-10 border border-green-100 flex flex-col md:flex-row items-center gap-12 group hover:shadow-xl transition-all duration-500">
                            <div className="flex-1">
                                <Users className="w-12 h-12 text-green-600 mb-6" />
                                <h3 className="font-display text-3xl font-bold text-slate-900 mb-4">Community Focused</h3>
                                <p className="text-lg text-slate-600">Join 5000+ members.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Map Section */}
            <section id="locations" className="py-24 bg-[#0F172A] relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-12 text-center">Find a Community Fridge</h2>
                    <div className="h-[500px] bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl relative">
                        <FridgeLocator />
                    </div>
                </div>
            </section>

            {/* Big Type Footer */}
            <footer className="footer-container bg-white pt-32 pb-12 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center mb-20 relative">
                        <h2 className="footer-parallax font-display font-black text-6xl md:text-9xl text-slate-900 mb-8 tracking-tighter">
                            Ready to <span className="text-brand-orange">Help?</span>
                        </h2>
                        <button
                            onClick={() => navigate('/auth')}
                            className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-slate-900 text-white rounded-full font-display font-bold text-2xl hover:bg-brand-orange transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-brand-orange/50 z-20"
                        >
                            Start Contributing
                            <ArrowUpRight className="w-8 h-8" />
                        </button>
                    </div>

                    <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-slate-400 font-medium">© 2024 FoodBridge Inc.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
