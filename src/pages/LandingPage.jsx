import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Gift, ArrowRight, Sparkles, TrendingUp, Shield, Users, ArrowUpRight, Award, Leaf } from 'lucide-react';
import FridgeLocator from '../components/FridgeLocator';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// --- 1. Magnetic Button Component ---
const MagneticButton = ({ children, className = "", onClick, variant = "primary" }) => {
    const btnRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const btn = btnRef.current;
        const text = textRef.current;
        if (!btn || !text) return;

        const handleMouseMove = (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Move button slightly
            gsap.to(btn, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: "power2.out" });
            // Move text slightly more for "parallax" inside button
            gsap.to(text, { x: x * 0.1, y: y * 0.1, duration: 0.3, ease: "power2.out" });
        };

        const handleMouseLeave = () => {
            gsap.to([btn, text], { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
        };

        btn.addEventListener("mousemove", handleMouseMove);
        btn.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            btn.removeEventListener("mousemove", handleMouseMove);
            btn.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    const baseStyles = "relative inline-flex items-center justify-center px-8 py-4 rounded-2xl font-display font-bold text-lg transition-transform overflow-hidden";
    const variants = {
        primary: "bg-slate-900 text-white shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20",
        outline: "bg-white border-2 border-slate-100 text-slate-600 hover:border-slate-900 hover:text-slate-900",
        ghost: "text-slate-600 hover:text-brand-orange"
    };

    return (
        <button ref={btnRef} onClick={onClick} className={`${baseStyles} ${variants[variant]} ${className}`}>
            <span ref={textRef} className="relative z-10 flex items-center gap-3 pointer-events-none">
                {children}
            </span>
        </button>
    );
};

// --- 2. Spotlight Card Component ---
const SpotlightCard = ({ children, className = "" }) => {
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        cardRef.current.style.setProperty("--mouse-x", `${x}px`);
        cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={`bento-card relative group overflow-hidden ${className}`}
            style={{ "--mouse-x": "0px", "--mouse-y": "0px" }}
        >
            {/* Spotlight Gradient Overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(234, 88, 12, 0.06), transparent 40%)`
                }}
            />
            {/* Border Reveal */}
            <div
                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(234, 88, 12, 0.3), transparent 40%)`,
                    mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
                    maskComposite: `exclude`,
                    padding: '1px',
                    borderRadius: 'inherit'
                }}
            />
            {children}
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const heroRef = useRef(null);
    const bentoRef = useRef(null);

    // --- Lenis Smooth Scroll ---
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Preloader
        tl.to(".preloader-logo", { scale: 1.4, opacity: 1, duration: 1, ease: "power2.out" })
            .to(".preloader-logo", { y: -50, opacity: 0, duration: 0.5, ease: "back.in(1.7)" })
            .to(".preloader-curtain", { yPercent: -100, duration: 1.2, ease: "power4.inOut", stagger: 0.1 })
            .set(".preloader", { display: "none" });

        // 2. Hero Text Reveal
        tl.from(".hero-line-inner", { yPercent: 100, duration: 1.2, ease: "power4.out", stagger: 0.15 }, "-=0.8");

        // 3. Hero Fade In
        tl.from(".hero-fade-in", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }, "-=0.8");

        // 4. 3D Card Entrance
        tl.from(".hero-card-container", { x: 100, opacity: 0, rotateY: -15, duration: 1.5, ease: "power3.out" }, "-=1");

        // Hero 3D Tilt Logic
        const card = document.querySelector(".hero-3d-card");
        if (card) {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = ((e.clientY - rect.top) - rect.height / 2) / (rect.height / 2) * -8;
                const y = ((e.clientX - rect.left) - rect.width / 2) / (rect.width / 2) * 8;
                gsap.to(card, { rotationX: x, rotationY: y, duration: 0.4, ease: "power1.out", overwrite: "auto" });
            });
            card.addEventListener("mouseleave", () => gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.5, ease: "power2.out" }));
        }

        // Bento Grid ScrollTrigger
        const cards = gsap.utils.toArray(".bento-card");
        cards.forEach((card) => {
            gsap.from(card, {
                scrollTrigger: { trigger: card, start: "top bottom-=100", toggleActions: "play none none reverse" },
                y: 100, opacity: 0, duration: 0.8, ease: "power3.out"
            });
        });

        // Footer Parallax
        gsap.to(".footer-parallax", {
            scrollTrigger: { trigger: ".footer-container", start: "top bottom", end: "bottom bottom", scrub: 1 },
            y: -50, ease: "none"
        });

        // Floating Orbs Animation
        gsap.to(".hero-orb", {
            y: "random(-20, 20)",
            x: "random(-20, 20)",
            scale: "random(0.9, 1.1)",
            duration: "random(3, 5)",
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            stagger: 1
        });

        // Elastic Icon Pop
        gsap.utils.toArray(".bento-icon").forEach((icon) => {
            gsap.from(icon, {
                scrollTrigger: { trigger: icon, start: "top bottom-=50", toggleActions: "play none none reverse" },
                scale: 0, rotation: -45, duration: 1, ease: "elastic.out(1, 0.4)", delay: 0.2
            });
        });

        // --- Continuous Moving Animations ---
        // 1. Floating Badges
        gsap.to(".feature-badge", {
            y: -10,
            duration: 1.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.2
        });

        // 2. Map Pulse Ripples
        gsap.to(".map-pulse", {
            scale: 1.5,
            opacity: 0,
            duration: 2,
            repeat: -1,
            ease: "power1.out"
        });

        // 3. Counter Animation
        ScrollTrigger.create({
            trigger: ".stat-counter",
            start: "top bottom-=100",
            once: true,
            onEnter: () => {
                gsap.fromTo(".stat-counter",
                    { textContent: 0 },
                    { textContent: 15000, duration: 2, ease: "power2.out", snap: { textContent: 1 }, onUpdate: function () { this.targets()[0].innerHTML = Math.ceil(this.targets()[0].textContent / 1000) + "k"; } }
                );
            }
        });

    }, { scope: containerRef });

    const MaskedText = ({ children, className }) => (
        <div className={`overflow-hidden ${className}`}>
            <div className="hero-line-inner inline-block">{children}</div>
        </div>
    );

    return (
        <div ref={containerRef} className="min-h-screen bg-neutral-300 font-sans text-slate-900 overflow-x-hidden relative">

            {/* --- GRAIN TEXTURE OVERLAY --- */}
            <div className="fixed inset-0 pointer-events-none z-[50] opacity-50 mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
            </div>



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
            <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-white/50 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-tr from-brand-orange to-orange-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
                                <Heart className="h-5 w-5" fill="currentColor" />
                            </div>
                            <span className="font-display font-black text-xl tracking-tight text-slate-900">FoodBridge</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <MagneticButton onClick={() => navigate('/auth')} variant="ghost" className="text-sm font-bold">Sign in</MagneticButton>
                            <MagneticButton onClick={() => navigate('/auth')} variant="primary" className="!px-6 !py-2.5 text-sm">Get Started</MagneticButton>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden z-10">
                <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="hero-orb absolute top-0 right-0 w-[800px] h-[800px] bg-brand-orange/10 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
                    <div className="hero-orb absolute bottom-0 left-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] mix-blend-multiply opacity-60" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative z-20">
                            <div className="mb-8">
                                <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 text-xs font-bold uppercase tracking-wider mb-8 hover:border-orange-200 transition-colors animate-[pulse-slow_4s_ease-in-out_infinite]">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
                                    </span>
                                    Reimagining Food Rescue
                                </div>

                                <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 leading-[1.1]">
                                    <MaskedText className="block">Share Food,</MaskedText>
                                    <MaskedText className="block pb-4">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-orange-400 to-brand-orange bg-[length:200%_auto] animate-gradient-x">Share Hope.</span>
                                    </MaskedText>
                                </h1>
                            </div>

                            <p className="hero-fade-in font-sans text-xl text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
                                The hyper-local network connecting surplus food with community needs. Join the movement today.
                            </p>

                            <div className="hero-fade-in flex flex-col sm:flex-row gap-4">
                                <MagneticButton onClick={() => navigate('/auth?role=donor')} variant="primary">
                                    Start Donating <ArrowRight className="w-5 h-5" />
                                </MagneticButton>
                                <MagneticButton onClick={() => navigate('/auth?role=receiver')} variant="outline">
                                    <MapPin className="w-5 h-5" /> Find Food
                                </MagneticButton>
                            </div>
                        </div>

                        {/* 3D Glass Card */}
                        <div className="hero-card-container relative lg:h-[550px] perspective-1000 hidden lg:block">
                            <div className="hero-3d-card relative h-full w-full transform preserve-3d cursor-default">
                                <div className="absolute top-8 -right-8 w-full h-full bg-slate-400 rounded-[3rem] -z-10" />
                                <div className="relative h-full bg-white/60 backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-white/60 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] p-10 flex flex-col">
                                    {/* Card Content ... */}
                                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                                        <div className="flex items-center gap-10">
                                            <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-xl text-slate-900">Live Activity</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Real-time</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-600 text-xs font-bold">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active
                                        </div>
                                    </div>
                                    <div className="space-y-6 flex-1 overflow-hidden relative mask-linear-fade">
                                        <div className="animate-[translate-y-50_20s_linear_infinite] hover:[animation-play-state:paused] space-y-6">
                                            {[
                                                { t: "Fresh Vegetables", s: "5kg • Just now", icon: "🥦" },
                                                { t: "Bakery Bundle", s: "0.5km away", icon: "🥐" },
                                                { t: "Canned Goods", s: "1.2km away", icon: "🥫" },
                                                { t: "Dairy Products", s: "2.0km away", icon: "🥛" },
                                                { t: "Fresh Vegetables", s: "5kg • Just now", icon: "🥦" },
                                                { t: "Bakery Bundle", s: "0.5km away", icon: "🥐" }
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
                </div>
            </section>

            {/* Bento Grid Section - No Marquee Above */}
            <section ref={bentoRef} className="py-32 bg-neutral-400 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-20 text-center max-w-2xl mx-auto">
                        <span className="text-brand-orange font-bold tracking-wider uppercase text-xs bg-orange-50 px-3 py-1 rounded-full border border-orange-100 mb-4 inline-block">App Features</span>
                        <h2 className="font-display text-4xl md:text-5xl font-black text-slate-900 mb-6">Designed for <span className="text-brand-orange">Impact</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
                        {/* 1. Real-time Locator (Large) */}
                        <SpotlightCard className="md:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-200">
                            <div className="relative z-10 w-full h-full flex flex-col justify-between">
                                <div>
                                    <div className="bento-icon h-16 w-16 bg-white rounded-2xl  flex items-center justify-center mb-8 shadow-sm text-brand-orange border border-slate-300 ">
                                        <MapPin className="w-8 h-8 animate-bounce" />
                                    </div>
                                    <h3 className="font-display text-3xl font-bold text-slate-900 mb-4">Live Discovery</h3>
                                    <p className="text-lg text-slate-600 max-w-md">Real-time alerts for donations near you.</p>
                                </div>
                                <div className="mt-8 relative h-48 w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group-hover:border-orange-200 transition-colors">
                                    {/* Map Grid Pattern */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

                                    {/* Radar Scan */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent z-0 animate-[scan_3s_linear_infinite]" style={{ height: '50%', top: '-30%' }} />

                                    {/* Active Locations */}
                                    <div className="absolute top-1/2 left-1/4 z-10">
                                        <div className="relative">
                                            <div className="w-4 h-4 bg-brand-orange rounded-full shadow-lg border-2 border-white z-20 relative" />
                                            <div className="map-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-brand-orange/30 rounded-full" />
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                                5kg Rice
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-1/3 right-1/3 z-10">
                                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                    </div>
                                    <div className="absolute bottom-1/3 right-1/4 z-10">
                                        <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                                    </div>

                                    {/* Floating Status Card */}
                                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 z-20">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs font-bold text-slate-600">3 Donors Active</span>
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* 2. Gamification (New) */}
                        <SpotlightCard className="md:col-span-1 bg-white rounded-[2.5rem] p-10 border border-slate-100">
                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div>
                                    <div className="bento-icon h-16 w-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6 text-yellow-500 border border-slate-300">
                                        <Award className="w-8 h-8 animate-sway" />
                                    </div>
                                    <h3 className="font-display text-2xl font-bold text-slate-900 mb-2">Impact Levels</h3>
                                    <p className="text-slate-500 text-sm mb-4">Unlock rewards as you help.</p>
                                </div>

                                {/* Next Reward Indicator */}
                                <div className="flex items-center gap-2 mb-3 bg-yellow-50/80 p-2 rounded-lg border border-yellow-100/50 shadow-sm animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                                    <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wide">Next: Community Hero</span>
                                </div>

                                <div className="space-y-6">
                                    {/* Progress */}
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                                            <span>Level 5 Donor</span>
                                            <span>750 / 1000 pts</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                                            <div className="h-full bg-yellow-400 w-[75%] rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)] relative overflow-hidden">
                                                <div className="absolute inset-0 bg-white/30 skew-x-12 animate-shimmer" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges Row */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-50">
                                        {['🥦', '⭐', '🏆', '🎁'].map((emoji, i) => (
                                            <div key={i} className={`feature-badge h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-sm border transition-all ${i === 3 ? 'bg-slate-50 border-slate-200 opacity-40 grayscale' : 'bg-white border-yellow-100'}`}>
                                                {emoji}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </SpotlightCard>

                        {/* 3. Impact Stats (New) */}
                        <SpotlightCard className="md:col-span-1 bg-green-50 rounded-[2.5rem] p-10 border border-green-100 overflow-hidden relative group">
                            {/* Floating Particles Background */}
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-[20%] left-[10%] text-green-200 animate-float text-xl">🍃</div>
                                <div className="absolute top-[60%] right-[10%] text-green-200 animate-float-delayed text-lg">🥕</div>
                                <div className="absolute bottom-[20%] left-[30%] text-green-200 animate-float text-2xl">🍎</div>
                            </div>

                            <div className="relative z-10">
                                <div className="bento-icon h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-green-600 shadow-sm animate-[pulse-slow_3s_ease-in-out_infinite]">
                                    <Leaf className="w-8 h-8 animate-sway" />
                                </div>
                                <h3 className="font-display text-4xl font-black text-slate-900 mb-1">
                                    <span className="stat-counter">15k</span>
                                    <span className="text-green-500 text-2xl animate-pulse">+</span>
                                </h3>
                                <p className="text-slate-600 font-medium">Meals rescued this month alone.</p>
                            </div>
                        </SpotlightCard>

                        {/* 4. Verified (Tall -> Wide in this layout) */}
                        <SpotlightCard className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">
                            {/* Scanning Light Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

                            <div className="flex-1 relative z-10">
                                <div className="bento-icon h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                                    <Shield className="w-8 h-8 text-green-400" />
                                </div>
                                <h3 className="font-display text-3xl font-bold mb-4 flex items-center gap-3">
                                    Verified & Safe
                                    <span className="flex h-3 w-3 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                </h3>
                                <p className="text-slate-400 max-w-sm">Every donor is verified. Every meal is quality checked. Safety is our #1 priority.</p>
                            </div>

                            {/* Animated Shield Visual */}
                            <div className="h-32 w-32 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 relative">
                                <div className="absolute inset-0 border-2 border-green-500/30 rounded-full animate-[spin_10s_linear_infinite]" style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent' }} />
                                <div className="absolute inset-4 border border-green-500/30 rounded-full animate-[spin_8s_linear_infinite_reverse]" style={{ borderTopColor: 'transparent' }} />
                                <Shield className="w-16 h-16 text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                            </div>
                        </SpotlightCard>
                    </div>
                </div>
            </section>

            {/* Simple Map Section */}
            <section id="locations" className="py-24 bg-[#0F172A] relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

                {/* Floating Map Pins Background */}
                <div className="absolute top-20 left-10 text-slate-800 animate-float">
                    <MapPin className="w-12 h-12 opacity-50" />
                </div>
                <div className="absolute bottom-20 right-10 text-slate-800 animate-float-delayed">
                    <MapPin className="w-16 h-16 opacity-50" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-12 flex items-center justify-center gap-6">
                        Find a Community Fridge
                        <span className="bento-icon h-16 w-16 flex items-center justify-center shadow-sm text-brand-orange  transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md cursor-default">
                            <MapPin className="w-8 h-8 animate-bounce" />
                        </span>
                    </h2>

                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange to-orange-600 rounded-[2.6rem] opacity-20 blur transition duration-1000 group-hover:opacity-40 animate-pulse" />

                        <div className="h-[500px] bg-slate-800 rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl relative">
                            <FridgeLocator />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-container bg-white pt-32 pb-12 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center mb-20 relative">
                        <h2 className="footer-parallax font-display font-black text-6xl md:text-9xl text-slate-900 mb-8 tracking-tighter">
                            Ready to <span className="text-brand-orange">Help?</span>
                        </h2>
                        <MagneticButton onClick={() => navigate('/auth')} variant="primary" className="!px-12 !py-6 !text-2xl !rounded-full">
                            Start Contributing <ArrowUpRight className="w-8 h-8" />
                        </MagneticButton>
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
