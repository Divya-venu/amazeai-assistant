
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard,
    TrendingUp,
    Sparkles,
    MessageSquare,
    LineChart,
    ShoppingCart,
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
   const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',   path: '/dashboard' },
    { icon: LineChart,       label: 'Analytics',   path: '/analytics' },
    { icon: ShoppingCart,    label: 'Sales',       path: '/sales' },
    { icon: Sparkles,        label: 'AI Insights', path: '/insights' },
    { icon: MessageSquare,   label: 'AI Chat',     path: '/chat' },
    { icon: TrendingUp,      label: 'Predictions', path: '/predictions' },
    { icon: Settings,        label: 'Settings',    path: '/settings' },
];

    return (
        <aside className="w-64 h-full glass-nav border-r border-white/5 flex flex-col pt-8">
            <div className="px-6 mb-10 text-center">
                <p className="text-xl font-black text-white tracking-tighter uppercase whitespace-nowrap"><span className="text-indigo-500">AI BIZ</span> Enterprise</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.path}
                        className={({ isActive }) => `
                            w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
                            ${isActive 
                                ? 'bg-indigo-600/10 text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-indigo-500/20' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} className={isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'} />
                                <span className="text-sm font-bold tracking-tight">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5">
                <button
    onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    }}
    className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all group"
>
    <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
    <span className="text-sm font-bold tracking-tight">Logout</span>
</button>
            </div>
        </aside>
    );
};

export default Sidebar;


