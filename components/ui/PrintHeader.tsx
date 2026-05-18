
import React from 'react';
import Logo from './Logo';
import { OFFICE_NAME } from '../../constants';

interface PrintHeaderProps {
    title: string;
    subtitle?: string;
    jurisdiction?: any;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ title, subtitle, jurisdiction }) => {
    const today = new Date().toLocaleDateString('ar-KW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const officeNameEn = "Sabry Shatta Law Firm & Legal Consultations";

    return (
        <div className="legal-print-header flex flex-col w-full mb-8 rtl print-only">
            {/* Upper Decorative Bar */}
            <div className="w-full h-1 bg-primary mb-1" />
            <div className="w-full h-[2px] bg-primary/40 mb-6" />

            <div className="flex items-start justify-between">
                {/* Right Side: Arabic Office Name */}
                <div className="flex flex-col items-start max-w-[40%]">
                    <h2 className="text-xl md:text-2xl font-black text-primary leading-tight mb-1 border-none !p-0 !m-0">
                        {OFFICE_NAME}
                    </h2>
                    <p className="text-[10px] md:text-sm font-black text-gray-600">للمحاماة والاستشارات القانونية والتحكيم</p>
                    <p className="text-[10px] md:text-sm font-bold text-gray-500 mt-1 italic">مرخص لدى جميع درجات المحاكم</p>
                </div>
                
                {/* Center: Logo and Branding */}
                <div className="flex flex-col items-center justify-center flex-grow">
                    <div className="bg-white p-2 border-2 border-primary/20 rounded-full shadow-sm mb-2 scale-110 md:scale-125">
                        <Logo variant="dark" showText={false} className="w-12 h-12" />
                    </div>
                    <div className="flex flex-col items-center leading-none">
                        <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">ADALA</span>
                        <span className="text-xl font-marhey font-bold text-primary">عدالة</span>
                    </div>
                </div>

                {/* Left Side: English Office Name */}
                <div className="flex flex-col items-end text-left max-w-[40%]">
                    <h2 className="text-lg md:text-xl font-bold text-primary leading-tight mb-1 border-none !p-0 !m-0 font-serif">
                        {officeNameEn}
                    </h2>
                    <p className="text-[10px] md:text-sm font-bold text-gray-600 uppercase tracking-wider">Law Firm & Legal consultations</p>
                    <div className="mt-4 bg-gray-50 px-3 py-1 border border-gray-200 rounded-lg text-[9px] md:text-[11px] font-mono text-gray-600">
                        <div>Date: {today}</div>
                        <div>Ref: {Math.random().toString(36).substring(7).toUpperCase()}</div>
                    </div>
                </div>
            </div>

            {/* Document Title Section */}
            <div className="mt-8 relative flex flex-col items-center w-full">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10" />
                <div className="bg-gray-50 border-2 border-primary/20 px-8 py-3 rounded-2xl shadow-sm text-center">
                    <h1 className="text-2xl md:text-4xl font-black text-primary !mb-0 !border-none tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-sm md:text-lg text-gray-700 font-bold mt-2 opacity-90 underline decoration-primary/30 underline-offset-4">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Lower Decorative Bar - Double Line Style */}
            <div className="mt-6 w-full h-[2px] bg-primary/40 mb-1" />
            <div className="w-full h-[0.5px] bg-primary/20" />
        </div>
    );
};

export default PrintHeader;
