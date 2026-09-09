import React from 'react';
import Logo from './Logo';
import { OFFICE_NAME } from '../../constants';

interface PrintHeaderProps {
    title: string;
    subtitle?: string;
    jurisdiction?: any;
    hideOfficeBranding?: boolean;
}

const PrintHeader: React.FC<PrintHeaderProps> = ({ title, subtitle, jurisdiction, hideOfficeBranding }) => {
    const today = new Date().toLocaleDateString('ar-KW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Load dynamic office information to keep printed outputs perfectly synchronized
    let officeNameAr = hideOfficeBranding ? "إدارة الموارد البشرية والشؤون الإدارية" : OFFICE_NAME;
    let officeNameEn = hideOfficeBranding ? "Human Resources & Administrative Affairs" : "Sabry Shatta Law Firm & Legal Consultations";
    let unifiedId = "7766554433";

    if (!hideOfficeBranding) {
        try {
            const savedOffice = localStorage.getItem('profile_office_info');
            if (savedOffice) {
                const parsed = JSON.parse(savedOffice);
                if (parsed.name) officeNameAr = parsed.name;
                if (parsed.unifiedId) unifiedId = parsed.unifiedId;
                // Derive English office name based on Arabic Name change
                if (parsed.name && parsed.name !== OFFICE_NAME) {
                    officeNameEn = parsed.name.replace(/مكتب المحامي/g, "Lawyer").replace(/للمحاماة والاستشارات القانونية/g, "Law Firm & Legal Consultations");
                }
            }
        } catch (e) {
            console.error('Error parsing office info in printable header', e);
        }
    }

    // Generate a unique reference ID for print accountability
    const refId = Math.random().toString(36).substring(3, 9).toUpperCase();

    return (
        <div className="legal-print-header flex flex-col w-full mb-8 rtl print-only font-sans text-right" dir="rtl">
            {/* Upper Decorative Bar */}
            <div className="w-full h-1 bg-primary mb-1" />
            <div className="w-full h-[2px] bg-primary/40 mb-6" />

            <div className="flex items-start justify-between gap-6 pb-2">
                {/* Right Side: Arabic Office Name & Credentials */}
                <div className="flex flex-col items-start max-w-[35%] text-right">
                    <h2 className="text-lg md:text-xl font-black text-primary leading-tight mb-1 border-none !p-0 !m-0">
                        {officeNameAr}
                    </h2>
                    <p className="text-[10px] md:text-xs font-black text-gray-600">
                        {hideOfficeBranding ? "قسم شؤون الموظفين والأجور وتسوية المستحقات" : "للمحاماة والاستشارات القانونية والتحكيم"}
                    </p>
                    <p className="text-[9px] md:text-xs font-bold text-gray-500 mt-0.5 italic">
                        {hideOfficeBranding ? "مستند إداري رسمي داخلي معتمد" : "المقر الرئيسي: مرخص لدى كافة درجات المحاكم"}
                    </p>
                    {!hideOfficeBranding && <p className="text-[8px] md:text-xs font-mono text-gray-400 mt-1">الرقم الموحد: {unifiedId}</p>}
                </div>
                
                {/* Center: Logo and Branding */}
                <div className="flex flex-col items-center justify-center flex-grow">
                    <div className="bg-white p-2 border-2 border-primary/20 rounded-full shadow-sm mb-1 scale-110 md:scale-120">
                        <Logo variant="dark" showText={false} className="w-10 h-10" />
                    </div>
                    <div className="flex flex-col items-center leading-none text-center">
                        <span className="text-[9px] font-black text-primary tracking-[0.2em] uppercase">ADALAH</span>
                        <span className="text-lg font-marhey font-bold text-primary">عدالة</span>
                        <span className="text-[7.5px] font-tajawal font-black text-gray-400 mt-1.5 block">منظومة الإدارة القانونية المتكاملة v3</span>
                    </div>
                </div>

                {/* Left Side: English Office Name & Document Metas + QR Code Support */}
                <div className="flex flex-row items-start justify-end gap-3 max-w-[35%] text-left" dir="ltr">
                    {/* Simulated SVG Security QR Code for electronic audit verification */}
                    <div className="border border-gray-100 rounded-lg p-1 bg-white flex flex-col items-center justify-center shrink-0">
                        <svg className="w-12 h-12 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                            <rect width="100" height="100" fill="white" />
                            {/* Outer square path border */}
                            <path d="M5,5 h30 v30 h-30 z M15,15 h10 v10 h-10 z" />
                            <path d="M65,5 h30 v30 h-30 z M75,15 h10 v10 h-10 z" />
                            <path d="M5,65 h30 v30 h-30 z M15,75 h10 v10 h-10 z" />
                            {/* Fill middle patterns simulated barcodes */}
                            <rect x="45" y="5" width="10" height="10" />
                            <rect x="45" y="25" width="10" height="15" />
                            <rect x="5" y="45" width="15" height="10" />
                            <rect x="25" y="45" width="10" height="10" />
                            <rect x="45" y="45" width="20" height="20" />
                            <rect x="75" y="45" width="10" height="15" />
                            <rect x="75" y="70" width="20" height="20" />
                            <rect x="45" y="75" width="15" height="10" />
                        </svg>
                        <span className="text-[7px] font-mono font-bold text-gray-400 mt-0.5">سند آمن</span>
                    </div>

                    <div className="flex flex-col items-end text-left min-w-0">
                        <h2 className="text-sm md:text-base font-bold text-primary leading-tight mb-1 border-none !p-0 !m-0 font-serif line-clamp-2">
                            {officeNameEn}
                        </h2>
                        <span className="text-[9px] text-gray-500 font-semibold tracking-wide uppercase">
                            {hideOfficeBranding ? "Personnel & Payroll Operations Section" : "Law Firm & Legal consultations"}
                        </span>
                        <div className="mt-2 bg-gray-50 px-2 py-1 border border-gray-200 rounded-lg text-[9px] font-mono text-gray-600 space-y-0.5">
                            <div>Date: {today}</div>
                            <div>Ref: {refId}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Title Section */}
            <div className="mt-6 relative flex flex-col items-center w-full">
                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10" />
                <div className="bg-gray-50 border-2 border-primary/20 px-8 py-2.5 rounded-2xl shadow-sm text-center">
                    <h1 className="text-xl md:text-2xl font-black text-primary !mb-0 !border-none tracking-tight">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs md:text-sm text-gray-700 font-bold mt-1.5 opacity-90 underline decoration-primary/30 underline-offset-4">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Lower Decorative Bar - Double Line Style */}
            <div className="mt-4 w-full h-[2px] bg-primary/40 mb-1" />
            <div className="w-full h-[0.5px] bg-primary/20" />
        </div>
    );
};

export default PrintHeader;
