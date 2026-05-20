import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scale, Phone, Mail, HelpCircle } from 'lucide-react';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    // Safe state initialization with fallback and try...catch blocks
    const [officeName, setOfficeName] = useState('مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية');
    const [hasError, setHasError] = useState(false);

    const loadOfficeName = () => {
        try {
            const savedOffice = localStorage.getItem('profile_office_info');
            if (savedOffice) {
                const parsed = JSON.parse(savedOffice);
                setOfficeName(parsed.name || 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية');
            }
        } catch (e) {
            console.error('Failed to load office name in footer', e);
            setHasError(true);
        }
    };

    useEffect(() => {
        loadOfficeName();
        const handleSync = () => loadOfficeName();
        window.addEventListener('office_info_updated', handleSync);
        return () => {
            window.removeEventListener('office_info_updated', handleSync);
        };
    }, []);

    if (hasError) {
        // Safe console logger, doesn't interrupt page execution
        console.warn('Silent safe fallback activated inside legal platform footer.');
    }

    return (
        <motion.footer 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-white/95 dark:bg-dm-card/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800/60 py-2 px-4 sm:px-6 md:px-8 print:hidden transition-all duration-300 relative z-10"
            dir="rtl"
        >
            <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-center md:text-right">
                
                {/* Brand Logo and Corporate Entity */}
                <div className="flex items-center gap-2 flex-wrap justify-center text-[10px] sm:text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1 bg-primary/5 dark:bg-dm-background/50 px-2 py-0.5 rounded-lg border border-primary/10 dark:border-gray-800 shadow-sm shrink-0">
                        <Scale className="w-3 h-3 text-accent" />
                        <span className="font-tajawal font-black text-primary dark:text-accent tracking-tighter text-[10px]">عدالة</span>
                    </div>
                    <span className="font-black text-gray-750 dark:text-dm-text truncate max-w-[220px] sm:max-w-xs">{officeName}</span>
                    <span className="text-gray-200 dark:text-gray-850 select-none hidden sm:inline">|</span>
                    <span className="text-[9px] sm:text-[10px] font-medium text-gray-400 dark:text-gray-500 hidden sm:inline">
                         {currentYear} © كافة الحقوق محفوظة
                    </span>
                </div>

                {/* Compact Links */}
                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold">
                    <Link to="/dashboard" className="hover:text-primary dark:hover:text-accent transition-colors">الرئيسية</Link>
                    <span className="text-gray-200 dark:text-gray-800 select-none">•</span>
                    <Link to="/profile" className="hover:text-primary dark:hover:text-accent transition-colors">الملف الشخصي</Link>
                    <span className="text-gray-200 dark:text-gray-800 select-none">•</span>
                    <button onClick={() => navigate('/settings')} className="hover:text-primary dark:hover:text-accent transition-colors">اتفاقية السرية</button>
                    <span className="text-gray-200 dark:text-gray-800 select-none">•</span>
                    <a 
                        href="mailto:support@adalah.kw" 
                        className="inline-flex items-center gap-1 text-primary dark:text-accent hover:underline decoration-primary/20 dark:decoration-accent/20 transition-all font-black"
                    >
                        <HelpCircle className="w-3 h-3 text-primary/70 dark:text-accent/70" />
                        الدعم الفني
                    </a>
                </div>

                {/* Status, Version & Quick Support (Compact Row) */}
                <div className="flex items-center justify-center gap-2.5 text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 font-bold">
                    <div className="hidden sm:flex items-center gap-2.5">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-300" /> +965 2244 8877</span>
                        <a href="mailto:support@adalah.kw" className="hover:text-primary transition-colors text-[9px] uppercase"><Mail className="w-3 h-3 text-gray-300" /></a>
                    </div>
                    
                    <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 dark:bg-dm-background rounded-md border border-gray-100 dark:border-gray-800 shadow-inner shrink-0 text-[8px] sm:text-[9px] font-sans font-black">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-gray-400 uppercase tracking-tighter">v3.5.0-LIVE</span>
                    </div>
                </div>

            </div>
        </motion.footer>
    );
};

export default Footer;
