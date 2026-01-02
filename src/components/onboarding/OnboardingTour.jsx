import React, { useState, useEffect } from 'react';
import { Trophy, ScanLine, Dumbbell, BrainCircuit, X, ChevronRight, CheckCircle2, User, Ruler, Scale, Activity } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const TOUR_STEPS = [
    {
        id: 'setup',
        title: "Let's Get Started",
        desc: "Tell us a bit about yourself so the AI can personalize your plan.",
        icon: <User size={64} className="text-[var(--accent)]" />,
        color: "from-[var(--accent)]/20 to-[var(--accent)]/10"
    },
    {
        id: 'welcome',
        title: "Welcome to TrackMyGains",
        desc: "Your ultimate tool for tracking workouts, nutrition, and getting massive results.",
        icon: <Trophy size={64} className="text-[var(--accent)]" />,
        color: "from-emerald-500/20 to-emerald-900/10"
    },
    {
        id: 'scanner',
        title: "AI Food Scanner",
        desc: "Snap a photo of your meal. Our AI analyzes texture, volume, and nutrients instantly.",
        icon: <ScanLine size={64} className="text-blue-400" />,
        color: "from-blue-500/20 to-blue-900/10"
    },
    {
        id: 'coach',
        title: "Gym Bro Coach",
        desc: "Chat with an AI that knows your stats, history, and goals. Get personalized advice.",
        icon: <BrainCircuit size={64} className="text-purple-400" />,
        color: "from-purple-500/20 to-purple-900/10"
    },
    {
        id: 'schedule',
        title: "Smart Scheduling",
        desc: "Build your weekly split. We'll track your progressive overload automatically.",
        icon: <Dumbbell size={64} className="text-orange-400" />,
        color: "from-orange-500/20 to-orange-900/10"
    }
];

const OnboardingTour = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(false);

    // Profile Form State
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        height: '',
        weight: '',
        blood_pressure: ''
    });

    const currentStep = TOUR_STEPS[step];
    const isLastStep = step === TOUR_STEPS.length - 1;
    const isSetupStep = currentStep.id === 'setup';

    const handleNext = async () => {
        if (isSetupStep) {
            // Validate and Save Profile
            if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
                alert("Please fill in Age, Gender, Height, and Weight to continue.");
                return;
            }

            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { error } = await supabase.from('profiles').upsert({
                        id: user.id,
                        email: user.email,
                        full_name: user.email.split('@')[0], // Default name
                        age: parseInt(formData.age),
                        gender: formData.gender,
                        height: parseFloat(formData.height),
                        weight: parseFloat(formData.weight),
                        blood_pressure: formData.blood_pressure,
                        updated_at: new Date()
                    });

                    if (error) throw error;
                    // Proceed
                    setStep(prev => prev + 1);
                }
            } catch (error) {
                console.error("Profile save error:", error);
                alert("Failed to save profile. Check connection.");
            } finally {
                setLoading(false);
            }
        } else {
            if (isLastStep) {
                handleClose();
            } else {
                setStep(prev => prev + 1);
            }
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Allow exit animation
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative w-full max-w-md bg-[var(--bg-secondary)] organic-shape organic-border subtle-depth p-8 overflow-hidden transition-all duration-500 ${isSetupStep ? 'max-w-lg' : ''}`}>

                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentStep.color} blur-[80px] rounded-full pointer-events-none transition-all duration-500 transform translate-x-1/3 -translate-y-1/3`} />

                {/* Close Button (Hidden on Setup to force completion, optional) */}
                {!isSetupStep && (
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
                    >
                        <X size={24} />
                    </button>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-6 mt-4">
                    <div className="animate-in zoom-in slide-in-from-bottom-4 duration-500 key-[step]"> {/* Key change triggers animation */}
                        <div className="w-24 h-24 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center shadow-xl mb-4 mx-auto">
                            {currentStep.icon}
                        </div>
                    </div>

                    <div className="space-y-2 animate-in slide-in-from-bottom-4 delay-100 duration-500">
                        <h2 className="text-2xl font-black bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                            {currentStep.title}
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            {currentStep.desc}
                        </p>
                    </div>

                    {/* SETUP FORM */}
                    {isSetupStep && (
                        <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left bg-[var(--bg-primary)]/50 p-4 rounded-xl border border-[var(--border)]">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Age</label>
                                    <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none" placeholder="25" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Gender</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-2 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none">
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Height (cm)</label>
                                    <div className="relative">
                                        <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-2 pl-8 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none" placeholder="175" />
                                        <Ruler size={14} className="absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Weight (kg)</label>
                                    <div className="relative">
                                        <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-2 pl-8 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none" placeholder="70" />
                                        <Scale size={14} className="absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Blood Pressure <span className="opacity-50 lowercase">(optional)</span></label>
                                <div className="relative">
                                    <input type="text" value={formData.blood_pressure} onChange={e => setFormData({ ...formData, blood_pressure: e.target.value })} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-2 pl-8 text-sm focus:ring-1 focus:ring-[var(--accent)] outline-none" placeholder="120/80" />
                                    <Activity size={14} className="absolute left-2.5 top-2.5 text-[var(--text-secondary)]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Indicators */}
                    <div className="flex gap-2 justify-center py-4">
                        {TOUR_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === step ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-[var(--border)]'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--bg-primary)] font-black text-lg rounded-2xl shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving Profile..." : (
                            isLastStep ? (
                                <>Let's Go! <CheckCircle2 size={20} className="stroke-2" /></>
                            ) : (
                                <>{isSetupStep ? "Save & Continue" : "Next"} <ChevronRight size={20} className="stroke-2 group-hover:translate-x-1 transition-transform" /></>
                            )
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
