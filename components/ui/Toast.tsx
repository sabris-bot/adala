
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    CheckCircle2, 
    AlertCircle, 
    AlertTriangle, 
    Info, 
    X,
    Bell
} from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
    persist?: boolean;
}

interface ToastContextType {
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast = { ...toast, id };
        
        // Developer Log
        console.log(`[Toast ${toast.type.toUpperCase()}]: ${toast.title} - ${toast.message}`, { id, persist: toast.persist });

        setToasts((prev) => {
            // Check for duplicates (same title and message within last 2 seconds)
            const isDuplicate = prev.some(t => t.title === toast.title && t.message === toast.message);
            if (isDuplicate) return prev;
            return [...prev, newToast];
        });

        if (!toast.persist) {
            setTimeout(() => {
                removeToast(id);
            }, toast.duration || 5000);
        }

        return id;
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
    // Limit visible toasts to 3 for better UX (classic queue feel)
    const visibleToasts = toasts.slice(0, 3);

    return (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none rtl:left-auto rtl:right-6 sm:bottom-8 sm:right-8">
            <AnimatePresence mode="popLayout">
                {visibleToasts.map((toast, index) => (
                    <ToastItem 
                        key={toast.id} 
                        toast={toast} 
                        onClose={() => removeToast(toast.id)} 
                        index={index}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem = React.forwardRef<HTMLDivElement, { toast: Toast; onClose: () => void; index: number }>(({ toast, onClose, index }, ref) => {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <AlertCircle className="w-5 h-5 text-rose-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        info: <Bell className="w-5 h-5 text-sky-500" />
    };

    const bgColors = {
        success: 'border-emerald-100 bg-white/90 dark:bg-slate-900/90 dark:border-emerald-900/30',
        error: 'border-rose-100 bg-white/90 dark:bg-slate-900/90 dark:border-rose-900/30',
        warning: 'border-amber-100 bg-white/90 dark:bg-slate-900/90 dark:border-amber-900/30',
        info: 'border-sky-100 bg-white/90 dark:bg-slate-900/90 dark:border-sky-900/30'
    };

    return (
        <motion.div
            ref={ref}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
            animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1 - (index * 0.05), // Stack effect
                x: 0,
                zIndex: 100 - index
            }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
                "pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl transition-all",
                bgColors[toast.type]
            )}
        >
            <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                toast.type === 'success' && "bg-emerald-50 dark:bg-emerald-950/30",
                toast.type === 'error' && "bg-rose-50 dark:bg-rose-950/30",
                toast.type === 'warning' && "bg-amber-50 dark:bg-amber-950/30",
                toast.type === 'info' && "bg-sky-50 dark:bg-sky-950/30",
            )}>
                {icons[toast.type]}
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
                <h4 className="text-[13px] font-black text-slate-900 dark:text-slate-100 mb-0.5 leading-tight">
                    {toast.title}
                </h4>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug">
                    {toast.message}
                </p>
            </div>

            <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-xl text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="إغلاق"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
});
ToastItem.displayName = 'ToastItem';
