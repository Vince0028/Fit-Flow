
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import { askCoach } from '../services/geminiService';

const AICoach = () => {
    const [messages, setMessages] = useState([
        { id: '1', role: 'coach', text: "Hey! I'm your AI fitness coach. Ask me anything about workouts, form tips, nutrition advice, or help planning your training. What's on your mind today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const response = await askCoach(input);
        const coachMsg = { id: (Date.now() + 1).toString(), role: 'coach', text: response || '' };
        setMessages(prev => [...prev, coachMsg]);
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-8 h-[calc(100vh-80px)] flex flex-col animate-in fade-in duration-500">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">AI Coach</h1>
                <p className="text-[#a3a395]">Your personal fitness advisor</p>
            </div>

            <div className="flex-1 bg-[#242421] organic-shape organic-border subtle-depth overflow-hidden flex flex-col mb-4">
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((m) => (
                        <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-10 h-10 shrink-0 organic-shape flex items-center justify-center border subtle-depth ${m.role === 'coach' ? 'bg-[#8b947a]/10 border-[#8b947a]/30 text-[#8b947a]' : 'bg-[#a3a395]/10 border-[#a3a395]/30 text-[#a3a395]'
                                }`}>
                                {m.role === 'coach' ? <Bot size={20} /> : <User size={20} />}
                            </div>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'coach'
                                    ? 'bg-[#1a1a17] text-[#e2e2d5] rounded-tl-none organic-shape'
                                    : 'bg-[#8b947a] text-[#1a1a17] rounded-tr-none organic-shape rotate-[0.5deg]'
                                }`}>
                                <p className="text-sm leading-relaxed">{m.text}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 organic-shape flex items-center justify-center bg-[#8b947a]/10 border border-[#8b947a]/30 text-[#8b947a]">
                                <Bot size={20} />
                            </div>
                            <div className="bg-[#1a1a17] p-4 organic-shape rounded-tl-none border border-[#3a3a34]">
                                <Loader2 size={16} className="animate-spin text-[#8b947a]" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-[#1a1a17]/50 border-t border-[#3a3a34]">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything about fitness..."
                            className="flex-1 bg-[#242421] border border-[#3a3a34] organic-shape px-6 py-3 text-sm focus:outline-none focus:border-[#8b947a] transition-organic"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading}
                            className="w-12 h-12 bg-[#8b947a] organic-shape flex items-center justify-center text-[#1a1a17] hover:brightness-110 active:scale-95 transition-organic disabled:opacity-50"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {['Form tips', 'Nutrition advice', 'Rest & recovery', 'Stay motivated'].map((tip) => (
                            <button
                                key={tip}
                                onClick={() => setInput(tip)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242421] border border-[#3a3a34] organic-shape text-[11px] font-bold text-[#a3a395] uppercase tracking-wider hover:border-[#8b947a] hover:text-[#8b947a] transition-organic"
                            >
                                <Sparkles size={12} /> {tip}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AICoach;
