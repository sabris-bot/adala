
import React from 'react';
import { ScaleIcon } from '../../constants';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-dm-card border-t border-gray-100 dark:border-gray-800 py-1.5 px-6 print:hidden transition-all duration-300">
            <div className="max-w-[1700px] mx-auto flex flex-row items-center justify-between gap-4">
                {/* Right Group (Start-aligned in RTL) */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <ScaleIcon className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-black text-gray-900 dark:text-dm-text tracking-tight uppercase">
                            {t('sabri_shatta_firm', { defaultValue: 'مكتب صبري شطا للمحاماة' })}
                        </span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            © {currentYear} {t('all_rights_reserved', { defaultValue: 'جميع الحقوق محفوظة' })}
                        </span>
                        
                        <div className="flex items-center gap-4 ps-2 border-s border-gray-100 dark:border-gray-800">
                            <a href="mailto:support@adalah.kw" className="text-[9px] font-black text-gray-400 hover:text-primary transition-colors tracking-widest uppercase">SUPPORT@ADALAH.KW</a>
                        </div>
                    </div>
                </div>

                {/* Left Group (End-aligned in RTL) */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-gray-50 dark:bg-dm-background rounded-lg border border-gray-100 dark:border-gray-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-black text-gray-400 tracking-widest leading-none">v3.5.0</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
