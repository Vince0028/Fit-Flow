import React, { useState, useEffect } from 'react';
import { Trophy, ScanLine, Dumbbell, BrainCircuit, X, ChevronRight, CheckCircle2 } from 'lucide-react';

const TOUR_STEPS = [
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

    const currentStep = TOUR_STEPS[step];
    const isLastStep = step === TOUR_STEPS.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            handleClose();
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onComplete, 500); // Allow exit animation
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative w-full max-w-md bg-[var(--bg-secondary)] organic-shape organic-border subtle-depth p-8 overflow-hidden transition-all duration-500`}>

                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${currentStep.color} blur-[80px] rounded-full pointer-events-none transition-all duration-500 transform translate-x-1/3 -translate-y-1/3`} />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
                >
                    <X size={24} />
                </button>

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
                        className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-[var(--bg-primary)] font-black text-lg rounded-2xl shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        {isLastStep ? (
                            <>Let's Go! <CheckCircle2 size={20} className="stroke-2" /></>
                        ) : (
                            <>Next <ChevronRight size={20} className="stroke-2 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
