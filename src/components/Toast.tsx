"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    loading: (message: string) => string;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        if (type !== 'loading') {
            setTimeout(() => dismiss(id), duration);
        }
        return id;
    }, [dismiss]);

    const success = (msg: string) => toast(msg, 'success');
    const error = (msg: string) => toast(msg, 'error');
    const info = (msg: string) => toast(msg, 'info');
    const loading = (msg: string) => toast(msg, 'loading');

    return (
        <ToastContext.Provider value={{ toast, success, error, info, loading, dismiss }}>
            {children}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-2xl animate-in slide-in-from-right-full fade-in duration-300 backdrop-blur-md",
                            t.type === 'success' && "bg-emerald-50/80 border-emerald-500/20 text-emerald-800",
                            t.type === 'error' && "bg-red-50/80 border-red-500/20 text-red-800",
                            t.type === 'info' && "bg-blue-50/80 border-blue-500/20 text-blue-800",
                            t.type === 'loading' && "bg-white/80 border-navy/10 text-navy"
                        )}
                    >
                        <div className="flex-shrink-0">
                            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                            {t.type === 'loading' && <Loader2 className="w-5 h-5 text-navy animate-spin" />}
                        </div>
                        <p className="text-sm font-bold flex-1 leading-tight">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
