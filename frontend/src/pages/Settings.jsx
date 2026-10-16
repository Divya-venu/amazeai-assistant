import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Settings as SettingsIcon, User, Bell, Lock, Globe, Database, CreditCard } from 'lucide-react';

const Settings = () => {
    const [showProfile, setShowProfile] = useState(false);
    const [showRegion, setShowRegion] = useState(false);

    const [language, setLanguage] = useState('English');
const [timeZone, setTimeZone] = useState('Asia/Kolkata');
const [showNotifications, setShowNotifications] = useState(false);

const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    salesAlerts: true,
    weeklyReport: false
});

const [notificationSaving, setNotificationSaving] = useState(false);
const [profile, setProfile] = useState({
    name: '',
    email: ''
});
const [profileLoading, setProfileLoading] = useState(false);
const [profileSaving, setProfileSaving] = useState(false);

const loadProfile = async () => {
    try {
        setProfileLoading(true);

        const token = localStorage.getItem('token');

        const response = await axios.get(
            'http://localhost:5000/api/profile',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setProfile(response.data.user);
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
    } finally {
        setProfileLoading(false);
    }
};

const loadPreferences = async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
            'http://localhost:5000/api/preferences',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setLanguage(response.data.preferences.language);
            setTimeZone(response.data.preferences.timeZone);
        }

    } catch (error) {
        console.error('Failed to load preferences:', error);
    }
};

const loadNotifications = async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.get(
            'http://localhost:5000/api/notifications',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setNotifications(response.data.notifications);
        }

    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
};

const saveNotifications = async () => {
    try {
        setNotificationSaving(true);

        const token = localStorage.getItem('token');

        const response = await axios.put(
            'http://localhost:5000/api/notifications',
            {
                email: notifications.email,
                browser: notifications.browser,
                salesAlerts: notifications.salesAlerts,
                weeklyReport: notifications.weeklyReport
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setNotifications(response.data.notifications);
            setShowNotifications(false);

            alert('Notification settings updated successfully');
        }

    } catch (error) {
        console.error('Failed to save notifications:', error);

        alert(
            error.response?.data?.error ||
            'Failed to update notification settings'
        );
    } finally {
        setNotificationSaving(false);
    }
};


const savePreferences = async () => {
    try {
        const token = localStorage.getItem('token');

        const response = await axios.put(
            'http://localhost:5000/api/preferences',
            {
                language: language,
                timeZone: timeZone
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setLanguage(response.data.preferences.language);
            setTimeZone(response.data.preferences.timeZone);

            setShowRegion(false);

            alert('Language & Region updated successfully');
        }

    } catch (error) {
        console.error('Failed to save preferences:', error);

        alert(
            error.response?.data?.error ||
            'Failed to update Language & Region'
        );
    }
};


const saveProfile = async () => {
    try {
        setProfileSaving(true);

        const token = localStorage.getItem('token');

        const response = await axios.put(
            'http://localhost:5000/api/profile',
            {
                name: profile.name,
                email: profile.email
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.data.success) {
            setProfile(response.data.user);
            setShowProfile(false);
            alert('Profile updated successfully');
        }

    } catch (error) {
        console.error('Failed to save profile:', error);

        alert(
            error.response?.data?.error ||
            'Failed to update profile'
        );
    } finally {
        setProfileSaving(false);
    }
};

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
    <button
        key={ii}
        onClick={() => {
    if (item.label === 'Profile Information') {
    setShowProfile(true);
    loadProfile();
}

if (item.label === 'Language & Region') {
    setShowRegion(true);
     loadPreferences();
}

 if (item.label === 'Notifications') {
        setShowNotifications(true);
        loadNotifications();
    }

}}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/2 transition-all group text-left"
    >
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
            {showProfile && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[var(--bg-card)] border border-[#1a2540] rounded-2xl w-full max-w-md p-6">

            <h3 className="text-xl font-bold text-white">
                Profile Information
            </h3>

            <p className="text-sm text-gray-400 mt-1">
                Manage your profile information
            </p>

            <div className="mt-6 space-y-4">

                <div>
                    <label className="text-xs text-gray-400">
                        Name
                    </label>

                    <input
    type="text"
    value={profile.name}
    onChange={(e) =>
        setProfile({
            ...profile,
            name: e.target.value
        })
    }
    placeholder="Enter your name"
    className="w-full mt-2 px-4 py-3 bg-[#0d1526] border border-[#1a2540] rounded-xl text-white outline-none focus:border-indigo-500"
/>
                </div>

                <div>
                    <label className="text-xs text-gray-400">
                        Email
                    </label>

                    <input
    type="email"
    value={profile.email}
    onChange={(e) =>
        setProfile({
            ...profile,
            email: e.target.value
        })
    }
    placeholder="Enter your email"
    className="w-full mt-2 px-4 py-3 bg-[#0d1526] border border-[#1a2540] rounded-xl text-white outline-none focus:border-indigo-500"
/>
                </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

                <button
                    onClick={() => setShowProfile(false)}
                    className="px-4 py-2 rounded-xl border border-[#1a2540] text-gray-400 hover:text-white"
                >
                    Cancel
                </button>

                <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
            >
                {profileSaving ? 'Saving...' : 'Save'}
            </button>

            </div>

               </div>
    </div>
)}

{/* Language & Region Modal */}
{showRegion && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[var(--bg-card)] border border-[#1a2540] rounded-2xl w-full max-w-md p-6">

            <h3 className="text-xl font-bold text-white">
                Language & Region
            </h3>

            <p className="text-sm text-gray-400 mt-1">
                Select your preferred language and time zone
            </p>

            <div className="mt-6 space-y-5">

                {/* Language */}
                <div>
                    <label className="text-xs text-gray-400">
                        Language
                    </label>

                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full mt-2 px-4 py-3 bg-[#0d1526] border border-[#1a2540] rounded-xl text-white outline-none focus:border-indigo-500"
                    >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Kannada">Kannada</option>
                    </select>
                </div>

                {/* Time Zone */}
                <div>
                    <label className="text-xs text-gray-400">
                        Time Zone
                    </label>

                    <select
                        value={timeZone}
                        onChange={(e) => setTimeZone(e.target.value)}
                        className="w-full mt-2 px-4 py-3 bg-[#0d1526] border border-[#1a2540] rounded-xl text-white outline-none focus:border-indigo-500"
                    >
                        <option value="Asia/Kolkata">
                            India — Asia/Kolkata
                        </option>

                        <option value="UTC">
                            UTC
                        </option>

                        <option value="America/New_York">
                            US — Eastern Time
                        </option>

                        <option value="Europe/London">
                            UK — London
                        </option>
                    </select>
                </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

                <button
                    onClick={() => setShowRegion(false)}
                    className="px-4 py-2 rounded-xl border border-[#1a2540] text-gray-400 hover:text-white"
                >
                    Cancel
                </button>

                <button
    onClick={savePreferences}
    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500"
>
    Save
</button>

            </div>

        </div>
    </div>
)}

{/* Notifications Modal */}
{showNotifications && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-[var(--bg-card)] border border-[#1a2540] rounded-2xl w-full max-w-md p-6">

            <h3 className="text-xl font-bold text-white">
                Notifications
            </h3>

            <p className="text-sm text-gray-400 mt-1">
                Configure how you receive alerts and updates
            </p>

            <div className="mt-6 space-y-4">

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-[#0d1526] border border-[#1a2540] rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Email Notifications
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Receive important updates by email
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) =>
                            setNotifications({
                                ...notifications,
                                email: e.target.checked
                            })
                        }
                        className="w-5 h-5 accent-indigo-600"
                    />
                </div>

                {/* Browser Notifications */}
                <div className="flex items-center justify-between p-4 bg-[#0d1526] border border-[#1a2540] rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Browser Notifications
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Show notifications in your browser
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={notifications.browser}
                        onChange={(e) =>
                            setNotifications({
                                ...notifications,
                                browser: e.target.checked
                            })
                        }
                        className="w-5 h-5 accent-indigo-600"
                    />
                </div>

                {/* Sales Alerts */}
                <div className="flex items-center justify-between p-4 bg-[#0d1526] border border-[#1a2540] rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Sales Alerts
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Get alerts about important sales activity
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={notifications.salesAlerts}
                        onChange={(e) =>
                            setNotifications({
                                ...notifications,
                                salesAlerts: e.target.checked
                            })
                        }
                        className="w-5 h-5 accent-indigo-600"
                    />
                </div>

                {/* Weekly Report */}
                <div className="flex items-center justify-between p-4 bg-[#0d1526] border border-[#1a2540] rounded-xl">
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Weekly Report
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Receive a weekly business performance report
                        </p>
                    </div>

                    <input
                        type="checkbox"
                        checked={notifications.weeklyReport}
                        onChange={(e) =>
                            setNotifications({
                                ...notifications,
                                weeklyReport: e.target.checked
                            })
                        }
                        className="w-5 h-5 accent-indigo-600"
                    />
                </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">

                <button
                    onClick={() => setShowNotifications(false)}
                    className="px-4 py-2 rounded-xl border border-[#1a2540] text-gray-400 hover:text-white"
                >
                    Cancel
                </button>

                <button
    onClick={saveNotifications}
    disabled={notificationSaving}
    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
>
    {notificationSaving ? 'Saving...' : 'Save'}
</button>

            </div>

        </div>
    </div>
)}

</div>
    );
};

export default Settings;
