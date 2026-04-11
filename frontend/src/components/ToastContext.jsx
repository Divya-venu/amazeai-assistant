import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
    return ctx;
};

let _id = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = ++_id;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error:   (msg) => addToast(msg, 'error'),
        info:    (msg) => addToast(msg, 'info'),
    };

    const icons = {
        success: <CheckCircle size={16} className="text-emerald-400 shrink-0" />,
        error:   <XCircle    size={16} className="text-red-400 shrink-0" />,
        info:    <Info       size={16} className="text-indigo-400 shrink-0" />,
    };

    const colours = {
        success: 'bg-[#0d1f14] border-emerald-500/30 text-emerald-300',
        error:   'bg-[#1f0d0d] border-red-500/30 text-red-300',
        info:    'bg-[#0d1526] border-indigo-500/30 text-indigo-300',
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast portal — bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border
                            shadow-xl backdrop-blur-md text-sm font-medium max-w-sm
                            animate-slide-in-right ${colours[t.type]}`}
                    >
                        {icons[t.type]}
                        <span className="flex-1 leading-snug">{t.message}</span>
                        <button
                            onClick={() => remove(t.id)}
                            className="opacity-50 hover:opacity-100 transition-opacity ml-1"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
