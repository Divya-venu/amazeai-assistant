import React from 'react';
import { Settings as SettingsIcon, User, Bell, Lock, Globe, Database, CreditCard } from 'lucide-react';

const Settings = () => {
    const sections = [
        { title: 'General', items: [
            { icon: User, label: 'Profile Information', desc: 'Manage your name, email, and avatar' },
            { icon: Globe, label: 'Language & Region', desc: 'Select your preferred language and time zone' },
        ]},
        { title: 'Platform', items: [
            { icon: Bell, label: 'Notifications', desc: 'Configure how you receive alerts and updates' },
            { icon: Lock, label: 'Security & Privacy', desc: 'Update passwords and security preferences' },
            { icon: Database, label: 'Data Management', desc: 'Export or delete your platform data' },
        ]},
        { title: 'Billing', items: [
            { icon: CreditCard, label: 'Subscription Plan', desc: 'Overview of your current pro plan features' },
        ]},
    ];

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white">Account Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Manage your platform preferences and account security</p>
            </div>

            <div className="space-y-6">
                {sections.map((section, si) => (
                    <div key={si} className="space-y-3">
                        <h3 className="text-[11px] font-bold text-gray-600 uppercase tracking-widest px-1">
                            {section.title}
                        </h3>
                        <div className="bg-[var(--bg-card)] border border-[#1a2540] rounded-2xl divide-y divide-[#1a2540]">
                            {section.items.map((item, ii) => (
                                <button key={ii} className="w-full flex items-center gap-4 p-4 hover:bg-white/2 transition-all group text-left">
                                    <div className="w-10 h-10 rounded-xl bg-[#0d1526] border border-[#1a2540] flex items-center justify-center text-gray-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors uppercase tracking-tight">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                                    </div>
                                    <div className="text-gray-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                                        <Globe size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                        <Lock size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-red-400">Danger Zone</p>
                        <p className="text-xs text-red-500/60 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <button className="px-4 py-2 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
