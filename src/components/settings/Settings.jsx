
import React, { useState } from 'react';
import { User, Scale, Shield, FileText, LogOut, ChevronRight, Moon, Sun, Trash2, X } from 'lucide-react';

const Settings = ({ isDarkMode, toggleTheme, confirmAction, onSignOut, onResetData, userEmail, units, toggleUnits }) => {
    const [infoModal, setInfoModal] = useState(null);

    const sections = [
        {
            title: 'Profile',
            items: [
                {
                    id: 'profile',
                    label: 'Identity',
                    sub: userEmail || 'Athlete account details',
                    icon: <User size={20} />,
                    action: () => { }
                },
            ]
        },
        {
            title: 'Experience',
            items: [
                {
                    id: 'dark',
                    label: isDarkMode ? 'Dark Mode' : 'Light Mode',
                    sub: 'Theme selection',
                    icon: isDarkMode ? <Moon size={20} /> : <Sun size={20} />,
                    action: toggleTheme,
                    active: isDarkMode
                },
                {
                    id: 'units',
                    label: 'Measurement',
                    sub: `Using ${units === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}`,
                    icon: <Scale size={20} />,
                    action: toggleUnits,
                    active: units === 'lbs'
                },
            ]
        },
        {
            title: 'System',
            items: [
                {
                    id: 'privacy',
                    label: 'Privacy',
                    sub: 'Local storage & encryption',
                    icon: <Shield size={20} />,
                    action: () => setInfoModal({
                        title: 'Privacy Policy',
                        content: (
                            <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">1. Data Collection</h4>
                                    <p>We collect workout logs, custom schedules, and basic profile info to provide analytics. All data is scoped to your user ID.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">2. Data Storage</h4>
                                    <p>Your data is securely stored in a Supabase PostgreSQL database. Local browser storage is used for preferences (theme, units) and temporary session caching.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">3. Security</h4>
                                    <p>Communication with our servers is encrypted via SSL. Authentication is handled via secure tokens.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">4. Third Parties</h4>
                                    <p>We do not share, sell, or trade your personal fitness data with any third-party advertisers.</p>
                                </section>
                            </div>
                        )
                    })
                },
                {
                    id: 'terms',
                    label: 'Policy',
                    sub: 'Usage guidelines',
                    icon: <FileText size={20} />,
                    action: () => setInfoModal({
                        title: 'Terms of Use',
                        content: (
                            <div className="space-y-4 text-sm text-[var(--text-secondary)]">
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">1. Personal Use</h4>
                                    <p>TrackMyGains is granted for personal, non-commercial fitness tracking purposes only.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">2. Health Disclaimer</h4>
                                    <p className="text-rose-400">You should consult your physician or other health care professional before starting this or any other fitness program to determine if it is right for your needs.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">3. Liability</h4>
                                    <p>The creators of TrackMyGains are not responsible for any injuries or health issues that may result from using this application.</p>
                                </section>
                                <section>
                                    <h4 className="font-bold text-[var(--text-primary)] mb-1">4. Account Security</h4>
                                    <p>You are responsible for maintaining the confidentiality of your login credentials.</p>
                                </section>
                            </div>
                        )
                    })
                },
            ]
        },
        {
            title: 'Debug',
            items: [
                { id: 'reload', label: 'Reload App', sub: 'Force refresh', icon: <Shield size={20} />, action: () => window.location.reload() }
            ]
        }
    ];

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-[var(--text-secondary)]">Manage your local trackmygains experience</p>
            </div>

            <div className="space-y-8 pb-12">
                {sections.map((section) => (
                    <div key={section.title} className="space-y-4">
                        <h2 className="text-sm font-bold text-[var(--accent)] uppercase tracking-widest ml-1">{section.title}</h2>
                        <div className="bg-[var(--bg-secondary)] organic-shape organic-border subtle-depth overflow-hidden">
                            {section.items.map((item, i) => (
                                <div
                                    key={item.id}
                                    onClick={item.action}
                                    className={`flex items-center justify-between p-6 hover:bg-[var(--bg-primary)]/50 transition-organic cursor-pointer ${i !== section.items.length - 1 ? 'border-b border-[var(--border)]' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[var(--bg-primary)] organic-shape border border-[var(--border)] text-[var(--text-secondary)]">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div className="font-bold">{item.label}</div>
                                            <div className="text-xs text-[var(--text-secondary)] mt-0.5">{item.sub}</div>
                                        </div>
                                    </div>

                                    {item.id === 'dark' || item.id === 'units' ? (
                                        <div className={`w-12 h-6 rounded-full p-1 relative shadow-inner transition-colors ${item.active ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${item.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                        </div>
                                    ) : (
                                        <ChevronRight size={20} className="text-[var(--text-secondary)] opacity-30" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="pt-8 space-y-4">
                    <button
                        onClick={onSignOut}
                        className="w-full flex items-center justify-center gap-2 p-6 bg-[var(--bg-secondary)] border border-[var(--border)] organic-shape text-[var(--text-primary)] font-bold hover:bg-[var(--bg-primary)] transition-organic shadow-sm"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>

                    <button
                        onClick={onResetData}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-rose-500/10 border border-rose-500/30 organic-shape text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-organic text-sm"
                    >
                        <Trash2 size={16} />
                        Reset Account Data
                    </button>

                    <div className="text-center space-y-2 mt-8">
                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed px-4">
                            TrackMyGains now syncs with the secure backend.
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Modal */}
            {infoModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-secondary)] organic-shape organic-border subtle-depth p-8 max-w-sm w-full space-y-6 shadow-2xl relative">
                        <button
                            onClick={() => setInfoModal(null)}
                            className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">{infoModal.title}</h3>
                            <div className="leading-relaxed">
                                {infoModal.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
