import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell, PieChart, Pie, ComposedChart, Line, AreaChart, Area 
} from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { 
    PresentationChartLineIcon, 
    PrinterIcon, 
    BuildingOffice2Icon, 
    BanknotesIcon, 
    WrenchScrewdriverIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    FunnelIcon,
    ClockIcon,
    TableCellsIcon,
    SparklesIcon,
    GavelIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    BellAlertIcon,
    ChartBarIcon,
    PlusIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    XMarkIcon,
    ScaleIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon
} from '../constants';
import { 
    Property, PropertyUnitStatus, RentPaymentStatus 
} from '../types';
import { CurrencySelectorBar } from '../components/ui/CurrencySelectorBar';

// Formatting helpers
const formatKWD = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' د.ك';
};

const formatDateAr = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';
    return new Date(dateStr).toLocaleDateString('ar-KW', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ---------------- MOCK DATA FOR PROPERTY REPORTS & ROI ----------------
const MOCK_PROPERTIES_DATA: Property[] = [
    {
        id: 'PROP-01',
        name: 'برج ناصر السكني - الشرق',
        type: 'استثماري (سكني)' as any,
        address: 'مدينة الكويت، الشرق، قطعة 3، شارع أحمد الجابر',
        paciNumber: '298101004512',
        ownerName: 'الشيخ مبارك عبد الله الجابر الصباح',
        createdAt: '2024-01-15',
        units: [
            { id: 'U-101', propertyId: 'PROP-01', unitNumber: '101', floor: '1', rentAmount: 450, status: PropertyUnitStatus.RENTED },
            { id: 'U-102', propertyId: 'PROP-01', unitNumber: '102', floor: '1', rentAmount: 450, status: PropertyUnitStatus.RENTED },
            { id: 'U-201', propertyId: 'PROP-01', unitNumber: '201', floor: '2', rentAmount: 500, status: PropertyUnitStatus.RENTED },
            { id: 'U-202', propertyId: 'PROP-01', unitNumber: '202', floor: '2', rentAmount: 500, status: PropertyUnitStatus.VACANT },
            { id: 'U-301', propertyId: 'PROP-01', unitNumber: '301', floor: '3', rentAmount: 550, status: PropertyUnitStatus.UNDER_MAINTENANCE }
        ]
    },
    {
        id: 'PROP-02',
        name: 'مجمع الفروانية التجاري',
        type: 'تجاري' as any,
        address: 'الفروانية، قطعة 1، شارع حبيب المناور',
        paciNumber: '298101008899',
        ownerName: 'شركة الوصال الاستثمارية',
        createdAt: '2023-05-10',
        units: [
            { id: 'U-M01', propertyId: 'PROP-02', unitNumber: 'محل 12', floor: 'الأرضي', rentAmount: 900, status: PropertyUnitStatus.RENTED },
            { id: 'U-M02', propertyId: 'PROP-02', unitNumber: 'محل 14', floor: 'الأرضي', rentAmount: 1100, status: PropertyUnitStatus.RENTED },
            { id: 'U-O01', propertyId: 'PROP-02', unitNumber: 'مكتب 201', floor: 'الأول', rentAmount: 650, status: PropertyUnitStatus.VACANT },
            { id: 'U-O02', propertyId: 'PROP-02', unitNumber: 'مكتب 202', floor: 'الأول', rentAmount: 650, status: PropertyUnitStatus.RENTED }
        ]
    },
    {
        id: 'PROP-03',
        name: 'عمارة السالمية الاستثمارية',
        type: 'استثماري (سكني)' as any,
        address: 'السالمية، قطعة 6، شارع الخنساء',
        paciNumber: '298101007744',
        ownerName: 'يعقوب يوسف الحميضي',
        createdAt: '2022-11-20',
        units: [
            { id: 'U-S10', propertyId: 'PROP-03', unitNumber: 'شقة 10', floor: '3', rentAmount: 380, status: PropertyUnitStatus.RENTED },
            { id: 'U-S11', propertyId: 'PROP-03', unitNumber: 'شقة 11', floor: '3', rentAmount: 380, status: PropertyUnitStatus.VACANT }
        ]
    }
];

// Property ROI Valuation Data
const MOCK_PROPERTY_ROI_DATA = [
    {
        id: 'PROP-01',
        name: 'برج ناصر السكني (الشرق)',
        district: 'الشرق',
        marketValuation: 2800000,
        grossAnnualIncome: 204000,
        operatingExpenses: 14400,
        netAnnualNOI: 189600,
        netRoiPercentage: 6.77,
        kuwaitMarketAvgRoi: 6.50,
        performanceBadge: 'ممتاز - يتجاوز السوق',
        color: '#059669'
    },
    {
        id: 'PROP-02',
        name: 'مجمع الفروانية التجاري',
        district: 'الفروانية',
        marketValuation: 4500000,
        grossAnnualIncome: 396000,
        operatingExpenses: 28000,
        netAnnualNOI: 368000,
        netRoiPercentage: 8.18,
        kuwaitMarketAvgRoi: 7.20,
        performanceBadge: 'عالي العائد الاستثماري',
        color: '#d97706'
    },
    {
        id: 'PROP-03',
        name: 'عمارة السالمية الاستثمارية',
        district: 'السالمية',
        marketValuation: 1650000,
        grossAnnualIncome: 136800,
        operatingExpenses: 9200,
        netAnnualNOI: 127600,
        netRoiPercentage: 7.73,
        kuwaitMarketAvgRoi: 6.80,
        performanceBadge: 'مستقر ومتنامي',
        color: '#10b981'
    }
];

// District Heatmap Data (Demand & Vacancy Spectrum in Kuwait)
const MOCK_DISTRICT_HEATMAP_DATA = [
    { district: 'الشرق (العاصمة)', vacancyRate: 5.5, demandScore: 94.5, activeUnits: 120, avgRentSquareMeter: 12.5, heatLevel: 'VERY_HIGH_DEMAND', heatColor: '#059669', desc: 'طلب إيجاري مرتفع جداً - شغور شبه معدوم' },
    { district: 'السالمية (حولي)', vacancyRate: 8.0, demandScore: 92.0, activeUnits: 210, avgRentSquareMeter: 9.8, heatLevel: 'HIGH_DEMAND', heatColor: '#10b981', desc: 'إقبال عالي على الشقق والوحدات التجارية' },
    { district: 'الأحمدي والفحيحيل', vacancyRate: 11.0, demandScore: 89.0, activeUnits: 150, avgRentSquareMeter: 8.2, heatLevel: 'BALANCED', heatColor: '#0284c7', desc: 'معدل إشغال متوازن واستقرار سعري' },
    { district: 'الفروانية (تجاري)', vacancyRate: 14.2, demandScore: 85.8, activeUnits: 180, avgRentSquareMeter: 14.0, heatLevel: 'MODERATE_VACANCY', heatColor: '#d97706', desc: 'شغور متوسط بالمكاتب - إشغال ممتاز للمحلات' },
    { district: 'حولي (سكني)', vacancyRate: 18.5, demandScore: 81.5, activeUnits: 260, avgRentSquareMeter: 7.5, heatLevel: 'HIGH_VACANCY', heatColor: '#e11d48', desc: 'معدل شغور مرتفع نسبياً - يتطلب تعديل الأسعار' }
];

// Unit Type Occupancy Pie Data
const MOCK_UNIT_TYPE_OCCUPANCY = [
    { name: 'شقق استثمارية', occupied: 26, vacant: 4, value: 30, color: '#0284c7' },
    { name: 'محلات تجارية', occupied: 8, vacant: 1, value: 9, color: '#059669' },
    { name: 'مكاتب إدارية', occupied: 4, vacant: 5, value: 9, color: '#d97706' }
];

// Collections Data
const MOCK_COLLECTIONS_RECORDS = [
    { id: 'PAY-101', propertyName: 'برج ناصر السكني - الشرق', unitNumber: 'شقة 101', tenantName: 'شركة المسار للتجارة العامة', civilId: '298010112345', dueAmount: 450, paidAmount: 450, arrears: 0, status: RentPaymentStatus.PAID, dueDate: '2026-08-01', paidDate: '2026-08-02', receiptNumber: 'REC-4022', paymentMethod: 'K-Net' },
    { id: 'PAY-102', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'محل 12', tenantName: 'سعود عبدالمحسن العتيبي', civilId: '292050588991', dueAmount: 900, paidAmount: 0, arrears: 900, status: RentPaymentStatus.OVERDUE, dueDate: '2026-08-01', paidDate: '-', receiptNumber: '-', paymentMethod: '-' },
    { id: 'PAY-103', propertyName: 'عمارة السالمية الاستثمارية', unitNumber: 'شقة 10', tenantName: 'د. خالد إبراهيم الفضلي', civilId: '285111233445', dueAmount: 380, paidAmount: 380, arrears: 0, status: RentPaymentStatus.PAID, dueDate: '2026-08-01', paidDate: '2026-08-03', receiptNumber: 'REC-4025', paymentMethod: 'تحويل بنكي' },
    { id: 'PAY-104', propertyName: 'برج ناصر السكني - الشرق', unitNumber: 'شقة 201', tenantName: 'م. أحمد جاسم الرومي', civilId: '291020399887', dueAmount: 500, paidAmount: 250, arrears: 250, status: RentPaymentStatus.PARTIALLY_PAID, dueDate: '2026-08-01', paidDate: '2026-08-05', receiptNumber: 'REC-4028', paymentMethod: 'شيك مصدّق' },
    { id: 'PAY-105', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'محل 14', tenantName: 'مؤسسة الشعلة للمأكولات', civilId: '297080877112', dueAmount: 1100, paidAmount: 1100, arrears: 0, status: RentPaymentStatus.PAID, dueDate: '2026-08-01', paidDate: '2026-08-01', receiptNumber: 'REC-4019', paymentMethod: 'K-Net' }
];

// Arrears Ledger
const MOCK_TENANT_ARREARS = [
    { tenantName: 'سعود عبدالمحسن العتيبي', propertyUnit: 'مجمع الفروانية (محل 12)', civilId: '292050588991', phone: '+965 9988 7766', overdueDays: 45, arrearsAmount: 1800, agingBucket: '31-60 يوماً', noticeStatus: 'يتطلب تكليف بالوفاء (المادة 20)', legalAction: 'تأخير 45 يوماً - إرسال تكليف رسمي بالوفاء' },
    { tenantName: 'شركة دار الخليج للمقاولات', propertyUnit: 'برج ناصر (شقة 302)', civilId: '295040411223', phone: '+965 6655 4433', overdueDays: 95, arrearsAmount: 2850, agingBucket: '90+ يوماً', noticeStatus: 'منقضية مهلة الـ 20 يوماً', legalAction: 'تأخير 95 يوماً - إشهار صحيفة دعوى إخلاء معجلة' },
    { tenantName: 'م. أحمد جاسم الرومي', propertyUnit: 'برج ناصر (شقة 201)', civilId: '291020399887', phone: '+965 5544 3322', overdueDays: 12, arrearsAmount: 250, agingBucket: '1-30 يوماً', noticeStatus: 'تذكير ودّي', legalAction: 'متابعة سداد الجزء المتبقي' }
];

// Proactive Alerts Data
const MOCK_PROACTIVE_ALERTS = [
    {
        id: 'ALT-01',
        type: 'CRITICAL_ARREARS',
        severity: 'URGENT',
        title: 'متأخرات قانونية تجاوزت الـ 30 يوماً (المادة 20)',
        tenant: 'شركة دار الخليج للمقاولات',
        propertyUnit: 'برج ناصر السكني (شقة 302)',
        details: 'متأخرات إيجارية بمبلغ 2,850 د.ك لمدة 95 يوماً. تم تسليم التكليف بالوفاء ومنقضية مهلة الـ 20 يوماً القانونية.',
        recommendedAction: 'رفع دعوى إخلاء لعدم السداد بالمحكمة الكلية',
        actionLabel: 'إصدار صحيفة دعوى إخلاء',
        icon: GavelIcon,
        colorClass: 'border-r-rose-600 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
    },
    {
        id: 'ALT-02',
        type: 'CRITICAL_ARREARS',
        severity: 'WARNING',
        title: 'متأخرات تتطلب تكليف رسمي بالوفاء (المادة 20)',
        tenant: 'سعود عبدالمحسن العتيبي',
        propertyUnit: 'مجمع الفروانية التجاري (محل 12)',
        details: 'تجاوزت المتأخرات 45 يوماً بمبلغ 1,800 د.ك. يتطلب إرسال التكليف بالوفاء كتابة بالبريد الموصى عليه بعلم الوصول.',
        recommendedAction: 'تجهيز وإرسال كتاب التكليف الرسمي بالوفاء',
        actionLabel: 'إرسال تكليف بالوفاء',
        icon: ExclamationTriangleIcon,
        colorClass: 'border-r-amber-500 bg-amber-50/70 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
    },
    {
        id: 'ALT-03',
        type: 'LEASE_RENEWAL',
        severity: 'URGENT',
        title: 'اقتراب تاريخ انتهاء عقد الإيجار (أقل من 30 يوماً)',
        tenant: 'سعود عبدالمحسن العتيبي',
        propertyUnit: 'مجمع الفروانية التجاري (محل 12)',
        details: 'ينتهي عقد الإيجار بتاريخ 30-08-2026 (متبقي 18 يوماً). يتطلب توجيه إخطار عدم رغبة بالتجديد أو توقيع ملحق التجديد.',
        recommendedAction: 'إرسال إخطار رسمي بعدم التجديد أو ملحق التعديل',
        actionLabel: 'توجيه إشعار عدم تجديد',
        icon: ClockIcon,
        colorClass: 'border-r-sky-500 bg-sky-50/70 dark:bg-sky-950/20 text-sky-900 dark:text-sky-200'
    }
];

// Expiring Leases Data
const MOCK_EXPIRING_LEASES = [
    { id: 'LSE-202', tenantName: 'سعود عبدالمحسن العتيبي', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'محل 12', endDate: '2026-08-30', daysLeft: 18, monthlyRent: 900, noticeSent: false, statusUrgency: 'CRITICAL' },
    { id: 'LSE-305', tenantName: 'د. خالد إبراهيم الفضلي', propertyName: 'عمارة السالمية الاستثمارية', unitNumber: 'شقة 10', endDate: '2026-09-15', daysLeft: 34, monthlyRent: 380, noticeSent: true, statusUrgency: 'WARNING' },
    { id: 'LSE-109', tenantName: 'شركة المسار للتجارة العامة', propertyName: 'برج ناصر السكني - الشرق', unitNumber: 'شقة 101', endDate: '2026-10-20', daysLeft: 69, monthlyRent: 450, noticeSent: true, statusUrgency: 'INFO' }
];

// 60-Days Proactive Legal Alerts Leases
export interface ExpiringLeaseAlert {
    id: string;
    tenantName: string;
    propertyName: string;
    unitNumber: string;
    civilId: string;
    endDate: string;
    daysLeft: number;
    monthlyRent: number;
    actionStatus: 'NONE' | 'EVICTION_CASE' | 'RENT_INCREASE';
    actionReference?: string;
}

const INITIAL_EXPIRING_LEASES_ALERTS: ExpiringLeaseAlert[] = [
    { id: 'LSE-202', tenantName: 'سعود عبدالمحسن العتيبي', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'محل 12', civilId: '292050588991', endDate: '2026-08-30', daysLeft: 18, monthlyRent: 900, actionStatus: 'NONE' },
    { id: 'LSE-305', tenantName: 'د. خالد إبراهيم الفضلي', propertyName: 'عمارة السالمية الاستثمارية', unitNumber: 'شقة 10', civilId: '285111233445', endDate: '2026-09-15', daysLeft: 34, monthlyRent: 380, actionStatus: 'NONE' },
    { id: 'LSE-109', tenantName: 'شركة المسار للتجارة العامة', propertyName: 'برج ناصر السكني - الشرق', unitNumber: 'شقة 101', civilId: '298010112345', endDate: '2026-09-28', daysLeft: 47, monthlyRent: 450, actionStatus: 'NONE' },
    { id: 'LSE-412', tenantName: 'مؤسسة النجم الساطع للخدمات', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'مكتب 202', civilId: '294020277889', endDate: '2026-10-05', daysLeft: 54, monthlyRent: 650, actionStatus: 'NONE' }
];

// Operational Maintenance Cost Efficiency Benchmarks
const MOCK_OPERATIONAL_COST_BENCHMARKS = [
    { id: 'MNT-881', propertyName: 'برج ناصر السكني - الشرق', unitNumber: 'شقة 301', category: 'تكييف وسنترال', contractor: 'شركة كوليكس للتكييف', cost: 350, avgBaselineCost: 180, variancePercent: 94, isHighCost: true, isInfrastructureAnamoly: false, alertText: '⚠️ تجاوز التكلفة الطبيعية (+94%)' },
    { id: 'MNT-882', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'المصعد الرئيسي B', category: 'مصاعد وهيدروليك', contractor: 'شركة أوتيس للمصاعد', cost: 620, avgBaselineCost: 220, variancePercent: 181, isHighCost: true, isInfrastructureAnamoly: true, alertText: '🔴 تجاوز حرج (+181%) - خلل بالبنية التحتية' },
    { id: 'MNT-883', propertyName: 'عمارة السالمية الاستثمارية', unitNumber: 'شقة 11', category: 'سباكة وتسريبات', contractor: 'ورشة الفني الكويتي', cost: 120, avgBaselineCost: 150, variancePercent: -20, isHighCost: false, isInfrastructureAnamoly: false, alertText: '✅ ضمن معدل التكلفة الطبيعي' },
    { id: 'MNT-884', propertyName: 'برج ناصر السكني - الشرق', unitNumber: 'المولد الكهربائي الرئيسية', category: 'كهرباء ومولدات', contractor: 'شركة الكهرباء الوطنية', cost: 480, avgBaselineCost: 200, variancePercent: 140, isHighCost: true, isInfrastructureAnamoly: true, alertText: '🔴 تجاوز حرج (+140%) - صيانة استبدالية مكررة' },
    { id: 'MNT-885', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'محل 14', category: 'ترميمات وديكور', contractor: 'ورشة الفوزان', cost: 150, avgBaselineCost: 180, variancePercent: -16, isHighCost: false, isInfrastructureAnamoly: false, alertText: '✅ ضمن معدل التكلفة الطبيعي' }
];

// Tenant Risk Assessment Index Data
const MOCK_TENANTS_RISK_INDEX = [
    {
        id: 'T-01',
        tenantName: 'شركة المسار للتجارة العامة',
        propertyUnit: 'برج ناصر السكني - شقة 101',
        civilId: '298010112345',
        phone: '+965 9911 2233',
        rentAmount: 450,
        riskLevel: 'LOW' as const,
        riskScore: 95,
        delinquencyFrequency: '0 مرات متأخرات',
        paymentPunctuality: 'التزام كامل بالسداد (100%)',
        lawyerRecommendation: 'مؤهل للتجديد التلقائي مع شكر وتثبيت الأجرة',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    },
    {
        id: 'T-02',
        tenantName: 'سعود عبدالمحسن العتيبي',
        propertyUnit: 'مجمع الفروانية التجاري - محل 12',
        civilId: '292050588991',
        phone: '+965 9988 7766',
        rentAmount: 900,
        riskLevel: 'HIGH' as const,
        riskScore: 32,
        delinquencyFrequency: '3 تكرارات تأخير (45+ يوماً)',
        paymentPunctuality: 'تأخير متكرر مع إنذار تكليف رسمي',
        lawyerRecommendation: '⚠️ ينصح بعدم التجديد والبدء بدعوى إخلاء فرعية',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
    },
    {
        id: 'T-03',
        tenantName: 'شركة دار الخليج للمقاولات',
        propertyUnit: 'برج ناصر السكني - شقة 302',
        civilId: '295040411223',
        phone: '+965 6655 4433',
        rentAmount: 950,
        riskLevel: 'HIGH' as const,
        riskScore: 20,
        delinquencyFrequency: 'تأخير جسيم (95 يوماً)',
        paymentPunctuality: 'تأخير دائم وإخطار منقضي المهلة',
        lawyerRecommendation: '🔴 عدم التجديد نهائياً وحظر التعامل والتنفيذ القضائي',
        badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
    },
    {
        id: 'T-04',
        tenantName: 'د. خالد إبراهيم الفضلي',
        propertyUnit: 'عمارة السالمية الاستثمارية - شقة 10',
        civilId: '285111233445',
        phone: '+965 5566 7788',
        rentAmount: 380,
        riskLevel: 'LOW' as const,
        riskScore: 90,
        delinquencyFrequency: '0 مرات متأخرات',
        paymentPunctuality: 'سداد في بداية كل شهر بانتظام',
        lawyerRecommendation: 'مؤهل للتجديد التلقائي',
        badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
    },
    {
        id: 'T-05',
        tenantName: 'م. أحمد جاسم الرومي',
        propertyUnit: 'برج ناصر السكني - شقة 201',
        civilId: '291020399887',
        phone: '+965 5544 3322',
        rentAmount: 500,
        riskLevel: 'MEDIUM' as const,
        riskScore: 68,
        delinquencyFrequency: 'تأخير بسيط مرة واحدة (12 يوماً)',
        paymentPunctuality: 'سداد جزئي وتأخير طفيف',
        lawyerRecommendation: 'تجديد مشروط بتقديم شيكات مصدقة مسبقاً',
        badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    }
];

// Maintenance Logs
const MOCK_MAINTENANCE_REPORTS = [
    { id: 'MNT-881', propertyName: 'برج ناصر السكني - الشرق', unitNumber: 'شقة 301', category: 'تكييف وسنترال', contractor: 'شركة كوليكس للتكييف', cost: 350, date: '2026-08-02', status: 'مكتمل ومعتمد', impactOnYield: '-0.3%' },
    { id: 'MNT-882', propertyName: 'مجمع الفروانية التجاري', unitNumber: 'المصعد الرئيسي B', category: 'مصاعد وخدمات', contractor: 'شركة أوتيس للمصاعد', cost: 620, date: '2026-08-05', status: 'مكتمل ومعتمد', impactOnYield: '-0.5%' },
    { id: 'MNT-883', propertyName: 'عمارة السالمية الاستثمارية', unitNumber: 'شقة 11', category: 'سباكة وتسريبات', contractor: 'ورشة الفني الكويتي', cost: 120, date: '2026-08-09', status: 'قيد التنفيذ', impactOnYield: '-0.1%' }
];

// Legal Dispute Lawsuits
const MOCK_LEGAL_LAWSUITS = [
    { caseNumber: '2026/4552 إيجارات', circuit: 'دائرة الإيجارات 4 - المحكمة الكلية', plaintiff: 'يعقوب يوسف الحميضي (المالك)', defendant: 'شركة دار الخليج للمقاولات', claimAmount: 2850, subject: 'دعوى إخلاء لعدم السداد وتسليم العين', sessionDate: '2026-08-28', status: 'مرفوعة - محدد لها جلسة' },
    { caseNumber: '2026/1892 إيجارات', circuit: 'دائرة الإيجارات 2 - محكمة حولي', plaintiff: 'شركة الوصال الاستثمارية', defendant: 'سعود عبدالمحسن العتيبي', claimAmount: 1800, subject: 'تكليف بالوفاء + دعوى إخلاء فرعية', sessionDate: '2026-09-02', status: 'انتظار انقضاء مهلة الـ 20 يوماً' }
];

// 6-Month Revenue Forecasting Data (توقعات الإيرادات المستقبلية للأشهر الستة القادمة)
const MOCK_FUTURE_REVENUE_FORECAST = [
    { 
        month: 'سبتمبر 2026', 
        expectedGross: 57500, 
        projectedNet: 54200, 
        vacancyLoss: 3300, 
        occupancyRate: 94, 
        maintenanceEst: 1100, 
        isVacancyRisk: false,
        riskNote: 'عقود مستقرة مع تجديدات جارية' 
    },
    { 
        month: 'أكتوبر 2026', 
        expectedGross: 57500, 
        projectedNet: 47800, 
        vacancyLoss: 8700, 
        occupancyRate: 84, 
        maintenanceEst: 2200, 
        isVacancyRisk: true,
        riskNote: 'انقضاء عقد محل 12 بالفروانية وشقة 202 (فترة شغور متوقعة)' 
    },
    { 
        month: 'نوفمبر 2026', 
        expectedGross: 57500, 
        projectedNet: 51000, 
        vacancyLoss: 5200, 
        occupancyRate: 89, 
        maintenanceEst: 1300, 
        isVacancyRisk: false,
        riskNote: 'تعافي جزئي بعد إبرام عقود إيجار جديدة' 
    },
    { 
        month: 'ديسمبر 2026', 
        expectedGross: 57500, 
        projectedNet: 56400, 
        vacancyLoss: 1100, 
        occupancyRate: 97, 
        maintenanceEst: 800, 
        isVacancyRisk: false,
        riskNote: 'ذروة التحصيل السنوي واكتمال العقود' 
    },
    { 
        month: 'يناير 2027', 
        expectedGross: 57500, 
        projectedNet: 55600, 
        vacancyLoss: 1900, 
        occupancyRate: 96, 
        maintenanceEst: 1500, 
        isVacancyRisk: false,
        riskNote: 'استقرار الدخل لبداية العام الجديد' 
    },
    { 
        month: 'فبراير 2027', 
        expectedGross: 57500, 
        projectedNet: 52100, 
        vacancyLoss: 5400, 
        occupancyRate: 91, 
        maintenanceEst: 2900, 
        isVacancyRisk: true,
        riskNote: 'صيانة دورية مبرمجة لمصاعد برج ناصر + شغور محتمل' 
    }
];

// Legal Notice Interface & Initial Data
export interface LegalNoticeRecord {
    id: string;
    noticeNumber: string;
    tenantName: string;
    propertyUnit: string;
    civilId: string;
    noticeType: string; 
    dispatchDate: string;
    deliveryMethod: string; 
    status: 'SENT' | 'DELIVERED' | 'GRACE_EXPIRED' | 'PENDING';
    graceDaysRemaining: number;
    trackingNumber: string;
    deliveryDate?: string;
    amountDue?: number;
    legalClause?: string;
}

const INITIAL_LEGAL_NOTICES: LegalNoticeRecord[] = [
    {
        id: 'NOT-2026-001',
        noticeNumber: 'INF-88401/2026',
        tenantName: 'شركة دار الخليج للمقاولات',
        propertyUnit: 'برج ناصر السكني - شقة 302',
        civilId: '295040411223',
        noticeType: 'تكليف بالوفاء (المادة 20)',
        dispatchDate: '2026-07-05',
        deliveryDate: '2026-07-08',
        deliveryMethod: 'بريد مسجل بعلم الوصول (KPOST)',
        status: 'GRACE_EXPIRED',
        graceDaysRemaining: 0,
        trackingNumber: 'KW-POST-9918234',
        amountDue: 2850,
        legalClause: 'استناداً للمادة 20 من قانون الإيجارات الكويتي رقم 35 لسنة 1978'
    },
    {
        id: 'NOT-2026-002',
        noticeNumber: 'INF-88402/2026',
        tenantName: 'سعود عبدالمحسن العتيبي',
        propertyUnit: 'مجمع الفروانية التجاري - محل 12',
        civilId: '292050588991',
        noticeType: 'تكليف بالوفاء (المادة 20)',
        dispatchDate: '2026-07-28',
        deliveryDate: '2026-08-01',
        deliveryMethod: 'بريد مسجل بعلم الوصول (KPOST)',
        status: 'DELIVERED',
        graceDaysRemaining: 8,
        trackingNumber: 'KW-POST-9920114',
        amountDue: 1800,
        legalClause: 'تكليف بدفع أجرة مستحقة مع انقضاء مهلة الـ 20 يوماً'
    },
    {
        id: 'NOT-2026-003',
        noticeNumber: 'INF-88403/2026',
        tenantName: 'مؤسسة الشعلة للمأكولات',
        propertyUnit: 'مجمع الفروانية التجاري - محل 14',
        civilId: '297080877112',
        noticeType: 'إخطار عدم رغبة بالتجديد',
        dispatchDate: '2026-08-08',
        deliveryMethod: 'محضر محكمة الكلية',
        status: 'SENT',
        graceDaysRemaining: 20,
        trackingNumber: 'CRT-KW-110293',
        amountDue: 0,
        legalClause: 'إشعار إخلاء العين عند نهاية مدة العقد الإيجاري'
    },
    {
        id: 'NOT-2026-004',
        noticeNumber: 'INF-88404/2026',
        tenantName: 'م. أحمد جاسم الرومي',
        propertyUnit: 'برج ناصر السكني - شقة 201',
        civilId: '291020399887',
        noticeType: 'إشعار سداد متبقي الإيجار',
        dispatchDate: '2026-08-10',
        deliveryMethod: 'إشعار إلكتروني معتمد',
        status: 'SENT',
        graceDaysRemaining: 15,
        trackingNumber: 'SMS-GOV-44210',
        amountDue: 250,
        legalClause: 'تذكير ودّي قبل اتخاذ الإجراءات القضائية'
    }
];

const MOCK_SAVED_REPORT_TEMPLATES = [
    { id: 'TPL-1', title: 'كشف المتأخرات والقضايا المرفوعة', cols: ['property', 'unit', 'tenant', 'civilId', 'rent', 'arrears', 'legalStatus'] },
    { id: 'TPL-2', title: 'تقرير التحصيل الشهري', cols: ['property', 'unit', 'tenant', 'rent', 'paid', 'receipt'] },
    { id: 'TPL-3', title: 'تقرير الشواغر والخسارة الإيجارية', cols: ['property', 'unit', 'rent', 'status'] }
];

const PropertySpecificReportsPage: React.FC = () => {
    const { addToast } = useToast();

    // State
    const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('ALL');
    const [selectedDateRange, setSelectedDateRange] = useState<string>('THIS_MONTH');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
    const [activeTab, setActiveTab] = useState<'financial' | 'roi' | 'occupancy' | 'leases' | 'maintenance' | 'legal' | 'custom'>('financial');

    // Alert Center State
    const [showAlertsCenter, setShowAlertsCenter] = useState<boolean>(true);
    const [proactiveAlerts] = useState(MOCK_PROACTIVE_ALERTS);

    // Interactive Legal Notices Register State
    const [legalNotices, setLegalNotices] = useState<LegalNoticeRecord[]>(INITIAL_LEGAL_NOTICES);
    const [isCreateNoticeModalOpen, setIsCreateNoticeModalOpen] = useState<boolean>(false);
    const [isProofCertificateModalOpen, setIsProofCertificateModalOpen] = useState<boolean>(false);
    const [selectedNoticeForProof, setSelectedNoticeForProof] = useState<LegalNoticeRecord | null>(null);

    // Form state for creating a new legal notice
    const [newNoticeForm, setNewNoticeForm] = useState({
        tenantName: '',
        propertyUnit: 'برج ناصر السكني - شقة 101',
        civilId: '',
        noticeType: 'تكليف بالوفاء (المادة 20)',
        deliveryMethod: 'بريد مسجل بعلم الوصول (KPOST)',
        amountDue: '',
        legalClause: 'المادة 20 من قانون الإيجارات الكويتي رقم 35 لسنة 1978'
    });

    // Property Side-by-Side Comparison State
    const [comparePropAId, setComparePropAId] = useState<string>('PROP-01');
    const [comparePropBId, setComparePropBId] = useState<string>('PROP-02');

    // Custom Builder State
    const [customReportCols, setCustomReportCols] = useState<Record<string, boolean>>({
        property: true,
        unit: true,
        tenant: true,
        civilId: true,
        rent: true,
        paid: true,
        arrears: true,
        status: true,
        receipt: false,
        legalStatus: true
    });
    const [customSearchTerm, setCustomSearchTerm] = useState<string>('');

    // Print Modal State
    const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
    const [selectedReportTitleForPrint, setSelectedReportTitleForPrint] = useState<string>('تقرير الإدارة العقارية والاستحقاقات المالية');

    // Proactive 60-Day Expiring Leases Legal Actions State
    const [expiringLeasesAlerts, setExpiringLeasesAlerts] = useState<ExpiringLeaseAlert[]>(INITIAL_EXPIRING_LEASES_ALERTS);

    // Yield Simulator State (محاكي عوائد العقارات)
    const [simRentAdjustment, setSimRentAdjustment] = useState<number>(10); // +10%
    const [simOccupancyRate, setSimOccupancyRate] = useState<number>(95); // 95%
    const [savedSimulations, setSavedSimulations] = useState<any[]>([
        {
            id: 'SIM-2026-01',
            name: 'سيناريو زيادة الإيجارات 10% وإشغال 95%',
            rentAdjustment: 10,
            occupancyRate: 95,
            projectedNOI: 228500,
            diffNOI: 23000,
            createdAt: '2026-08-01'
        },
        {
            id: 'SIM-2026-02',
            name: 'سيناريو التحفظ (تخفيض الإيجار 5% مع إشغال 85%)',
            rentAdjustment: -5,
            occupancyRate: 85,
            projectedNOI: 184000,
            diffNOI: -21500,
            createdAt: '2026-08-05'
        }
    ]);
    const [selectedSimForView, setSelectedSimForView] = useState<any | null>(null);
    const [selectedSimForEdit, setSelectedSimForEdit] = useState<any | null>(null);
    const [isSaveSimModalOpen, setIsSaveSimModalOpen] = useState<boolean>(false);
    const [newSimTitle, setNewSimTitle] = useState<string>('سيناريو محاكاة العوائد المخصص');

    // Tenant Risk Assessment Index Filter & CRUD State
    const [tenantRiskFilter, setTenantRiskFilter] = useState<string>('ALL');
    const [tenantsRiskList, setTenantsRiskList] = useState(MOCK_TENANTS_RISK_INDEX);
    const [selectedTenantForView, setSelectedTenantForView] = useState<any | null>(null);
    const [selectedTenantForEdit, setSelectedTenantForEdit] = useState<any | null>(null);
    const [isAddTenantRiskModalOpen, setIsAddTenantRiskModalOpen] = useState<boolean>(false);
    const [newTenantRiskForm, setNewTenantRiskForm] = useState({
        tenantName: 'شركة الخليج للتأمين والاستشارات',
        propertyUnit: 'برج ناصر - مكتب 302',
        civilId: '298102938475',
        phone: '99887766',
        rentAmount: 500,
        delinquencyFrequency: 'لا يوجد متأخرات (التزام كامل)',
        paymentPunctuality: 'التزام تام بالتحصيل شهرياً',
        riskLevel: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
        riskScore: 92,
        lawyerRecommendation: 'يوافق على التجديد لمدة سنتين إضافيتين'
    });

    // Maintenance Cost Efficiency Benchmarks & CRUD State
    const [maintenanceLogsList, setMaintenanceLogsList] = useState(MOCK_OPERATIONAL_COST_BENCHMARKS);
    const [selectedMaintForView, setSelectedMaintForView] = useState<any | null>(null);
    const [selectedMaintForEdit, setSelectedMaintForEdit] = useState<any | null>(null);
    const [isAddMaintModalOpen, setIsAddMaintModalOpen] = useState<boolean>(false);
    const [newMaintForm, setNewMaintForm] = useState({
        propertyName: 'برج ناصر السكني - الشرق',
        unitNumber: 'شقة 102',
        category: 'تكييف وسنترال',
        contractor: 'شركة كوليكس للتكييف',
        cost: 250,
        avgBaselineCost: 180,
        isInfrastructureAnamoly: false
    });

    // Modals for Expiring Leases Actions
    const [selectedLeaseForRentIncrease, setSelectedLeaseForRentIncrease] = useState<ExpiringLeaseAlert | null>(null);
    const [newRentIncreasePercent, setNewRentIncreasePercent] = useState<number>(10);
    const [selectedLeaseForView, setSelectedLeaseForView] = useState<ExpiringLeaseAlert | null>(null);

    // Field Inspection Report State (تقرير تفتيش العقار الميداني)
    const [isInspectionModalOpen, setIsInspectionModalOpen] = useState<boolean>(false);
    const [inspectionReportsList, setInspectionReportsList] = useState<any[]>([
        {
            id: 'INSP-2026-001',
            propertyName: 'عمارة السالمية التجاري',
            unitNumber: 'محل 4 - الدور الأرضي',
            inspectorLawyer: 'أحمد محمود (محامي المعاينة الميدانية)',
            inspectionDate: '2026-07-10',
            structuralCondition: 'يحتاج صيانة', // ممتاز | جيد | يحتاج صيانة | متضرر
            lawyerNotes: 'لوحظ وجود تسريب مياه بطابق السرداب وتصدعات بديكور السقف، يستلزم صيانة عاجلة لحماية القيمة الإيجارية.',
            photos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'],
            estimatedCost: 350,
            linkedToCostEfficiency: true
        },
        {
            id: 'INSP-2026-002',
            propertyName: 'برج ناصر السكني - الشرق',
            unitNumber: 'شقة 102',
            inspectorLawyer: 'صبري شطا (المحامي المسؤول)',
            inspectionDate: '2026-06-25',
            structuralCondition: 'ممتاز',
            lawyerNotes: 'المعاينة الميدانية للعين أظهرت سلامة التأسيس والتكييف والكهرباء بدون أية تلفيات.',
            photos: ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'],
            estimatedCost: 0,
            linkedToCostEfficiency: true
        }
    ]);
    const [newInspectionForm, setNewInspectionForm] = useState({
        propertyName: 'برج ناصر السكني - الشرق',
        unitNumber: 'شقة 204',
        inspectorLawyer: 'أحمد محمود (محامي المعاينة)',
        structuralCondition: 'يحتاج صيانة' as 'ممتاز' | 'جيد' | 'يحتاج صيانة' | 'متضرر',
        lawyerNotes: 'تسريب بماسورة الصرف الرئيسية بالحمام الرئيسي يلزم إصلاحه فوراً.',
        photos: ['https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400'],
        estimatedCost: 200
    });

    // Eviction Court Fee Calculator & Payment Order Request State (حساب الرسوم القضائية وطلب أمر أداء)
    const [isPaymentOrderModalOpen, setIsPaymentOrderModalOpen] = useState<boolean>(false);
    const [calcOverdueRent, setCalcOverdueRent] = useState<number>(2400);
    const [calcMonthlyRent, setCalcMonthlyRent] = useState<number>(400);
    const [paymentOrderTenant, setPaymentOrderTenant] = useState({
        tenantName: 'شركة الأفق للاستشارات الهندسية',
        civilId: '298102938475',
        propertyName: 'برج ناصر السكني',
        unitNumber: 'مكتب 402',
        paciNumber: '298101009122',
        monthsCount: 6,
        lawsuitSubject: 'طلب أمر أداء بالمبالغ الإيجارية المتأخرة ودعوى إخلاء للغصب وعدم السداد'
    });

    // Simulated Yield Calculation
    const simulatedYieldResults = useMemo(() => {
        const propertiesData = MOCK_PROPERTY_ROI_DATA.map(prop => {
            const baseGross = prop.grossAnnualIncome;
            const baseNOI = prop.netAnnualNOI;
            const baseValuation = prop.marketValuation;

            const rentFactor = 1 + simRentAdjustment / 100;
            const occupancyFactor = simOccupancyRate / 90; // baseline ~90%

            const simGross = Math.round(baseGross * rentFactor * occupancyFactor);
            const simExpenses = Math.round(prop.operatingExpenses * (1 + (simOccupancyRate > 90 ? (simOccupancyRate - 90) * 0.008 : 0)));
            const simNOI = simGross - simExpenses;
            const simRoi = ((simNOI / baseValuation) * 100).toFixed(2);
            const diffNOI = simNOI - baseNOI;

            return {
                id: prop.id,
                name: prop.name,
                district: prop.district,
                baseNOI,
                simNOI,
                diffNOI,
                baseRoi: prop.netRoiPercentage,
                simRoi: Number(simRoi)
            };
        });

        const totalBaseNOI = propertiesData.reduce((a, c) => a + c.baseNOI, 0);
        const totalSimNOI = propertiesData.reduce((a, c) => a + c.simNOI, 0);
        const totalDiffNOI = totalSimNOI - totalBaseNOI;

        return {
            propertiesData,
            totalBaseNOI,
            totalSimNOI,
            totalDiffNOI
        };
    }, [simRentAdjustment, simOccupancyRate]);

    // Filtered Tenant Risk Index
    const filteredTenantsRisk = useMemo(() => {
        return tenantsRiskList.filter(tenant => {
            if (tenantRiskFilter === 'ALL') return true;
            return tenant.riskLevel === tenantRiskFilter;
        });
    }, [tenantRiskFilter, tenantsRiskList]);

    // Filtered Collections Data
    const filteredCollections = useMemo(() => {
        return MOCK_COLLECTIONS_RECORDS.filter(item => {
            if (selectedPropertyFilter !== 'ALL' && !item.propertyName.includes(selectedPropertyFilter)) return false;
            if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) return false;
            return true;
        });
    }, [selectedPropertyFilter, selectedStatusFilter]);

    // Financial KPI Totals
    const collectionsMetrics = useMemo(() => {
        const totalExpected = filteredCollections.reduce((acc, curr) => acc + curr.dueAmount, 0);
        const totalPaid = filteredCollections.reduce((acc, curr) => acc + curr.paidAmount, 0);
        const totalArrears = filteredCollections.reduce((acc, curr) => acc + curr.arrears, 0);
        const collectionRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0;
        const totalMaintenanceExpenses = MOCK_MAINTENANCE_REPORTS.reduce((acc, curr) => acc + curr.cost, 0);
        const netNOI = totalPaid - totalMaintenanceExpenses;

        return { totalExpected, totalPaid, totalArrears, collectionRate, totalMaintenanceExpenses, netNOI };
    }, [filteredCollections]);

    // Portfolio ROI Metrics Calculation
    const portfolioRoiMetrics = useMemo(() => {
        const totalValuation = MOCK_PROPERTY_ROI_DATA.reduce((acc, curr) => acc + curr.marketValuation, 0);
        const totalGrossIncome = MOCK_PROPERTY_ROI_DATA.reduce((acc, curr) => acc + curr.grossAnnualIncome, 0);
        const totalNOI = MOCK_PROPERTY_ROI_DATA.reduce((acc, curr) => acc + curr.netAnnualNOI, 0);
        const avgRoi = (totalNOI / totalValuation) * 100;

        return {
            totalValuation,
            totalGrossIncome,
            totalNOI,
            avgRoi: avgRoi.toFixed(2)
        };
    }, []);

    // Export CSV Helper
    const handleExportCSV = () => {
        const headers = ['العقار', 'الوحدة', 'اسم المستأجر', 'الرقم المدني', 'الإيجار المستحق', 'المدفوع', 'المتأخرات', 'الحالة', 'رقم الإيصال'];
        const csvRows = [headers.join(',')];

        filteredCollections.forEach(row => {
            csvRows.push([
                `"${row.propertyName}"`,
                `"${row.unitNumber}"`,
                `"${row.tenantName}"`,
                `"${row.civilId}"`,
                row.dueAmount,
                row.paidAmount,
                row.arrears,
                `"${row.status}"`,
                `"${row.receiptNumber}"`
            ].join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Property_Report_Adalah_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addToast({
            type: 'success',
            title: 'تم تصدير ملف Excel',
            message: 'تم تحميل ملف البيانات بصيغة CSV بنجاح'
        });
    };

    return (
        <div className="space-y-6 pb-12 text-slate-800 dark:text-slate-100">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link to="/property-management" className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors">
                        <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <PresentationChartLineIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">تقارير المحافظ العقارية والإيجارات</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            مؤشرات العائد الاستثماري (ROI)، التنبيهات الاستباقية والخرائط الحرارية للشواغر
                        </p>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        leftIcon={<PrinterIcon className="w-4 h-4"/>} 
                        onClick={() => {
                            setSelectedReportTitleForPrint(
                                activeTab === 'financial' ? 'تقرير تحصيل الإيجارات والتدفقات النقدية' :
                                activeTab === 'roi' ? 'تقرير تحليل العائد الاستثماري (ROI Dashboard)' :
                                activeTab === 'occupancy' ? 'تقرير معدلات الإشغال والخرائط الحرارية' :
                                activeTab === 'leases' ? 'جدول انتهاء عقود الإيجار والتنبيهات' :
                                activeTab === 'maintenance' ? 'تقرير تكاليف وسجلات الصيانة العقارية' :
                                activeTab === 'legal' ? 'كشف قضايا الإيجارات والتكليف بالوفاء' : 'التقرير المخصص للمحفظة'
                            );
                            setIsPrintModalOpen(true);
                        }}
                    >
                        معاينة وطباعة التقرير
                    </Button>

                    <Button 
                        variant="secondary" 
                        size="sm" 
                        leftIcon={<TableCellsIcon className="w-4 h-4"/>} 
                        onClick={handleExportCSV}
                    >
                        تصدير Excel
                    </Button>

                    <Button 
                        variant="primary" 
                        size="sm" 
                        leftIcon={<PrinterIcon className="w-4 h-4"/>} 
                        onClick={() => window.print()}
                    >
                        طباعة
                    </Button>
                </div>
            </div>

            {/* MULTI-CURRENCY FINANCIAL ENGINE BAR */}
            <CurrencySelectorBar className="mb-4" />

            {/* PROACTIVE ALERTS CENTER (تنبيهات استباقية) */}
            {showAlertsCenter && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl animate-pulse">
                                <BellAlertIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>مركز التنبيهات الاستباقية للمحفظة</span>
                                    <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-mono font-bold">
                                        {proactiveAlerts.length} تنبيهات حرجة
                                    </span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    متابعة فورية لاقتراب تجديد العقود والمتأخرات التي تجاوزت الـ 30 يوماً (المادة 20)
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setShowAlertsCenter(false)}
                            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            إخفاء التنبيهات
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {proactiveAlerts.map(alert => {
                            const IconComponent = alert.icon;
                            return (
                                <div 
                                    key={alert.id}
                                    className={`p-3.5 rounded-xl border-r-4 border ${alert.colorClass} space-y-2 flex flex-col justify-between`}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700">
                                                {alert.tenant}
                                            </span>
                                            <IconComponent className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <h3 className="text-xs font-bold">{alert.title}</h3>
                                        <p className="text-[11px] opacity-90 leading-relaxed">{alert.details}</p>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                            {alert.propertyUnit}
                                        </span>
                                        <Button 
                                            size="sm" 
                                            variant="primary" 
                                            className="text-[10px] py-1 px-2.5 h-auto font-bold"
                                            onClick={() => addToast({
                                                type: 'success',
                                                title: 'تم اتخاذ الإجراء الاستباقي',
                                                message: `تم البدء في تنفيذ: ${alert.actionLabel}`
                                            })}
                                        >
                                            {alert.actionLabel}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Filter Card */}
            <Card className="p-4 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
                        <FunnelIcon className="w-4 h-4 text-primary" />
                        <span>تصفية البيانات</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">العملة: دينار كويتي (KWD)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">المحفظة / العقار:</label>
                        <select 
                            value={selectedPropertyFilter}
                            onChange={e => setSelectedPropertyFilter(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-primary"
                        >
                            <option value="ALL">جميع العقارات (3 عقارات)</option>
                            <option value="برج ناصر">برج ناصر السكني - الشرق</option>
                            <option value="الفروانية">مجمع الفروانية التجاري</option>
                            <option value="السالمية">عمارة السالمية الاستثمارية</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">الفترة الزمنية:</label>
                        <select 
                            value={selectedDateRange}
                            onChange={e => setSelectedDateRange(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-primary"
                        >
                            <option value="THIS_MONTH">الشهر الحالي (أغسطس 2026)</option>
                            <option value="LAST_MONTH">الشهر الماضي (يوليو 2026)</option>
                            <option value="Q3_2026">الربع الثالث (Q3 2026)</option>
                            <option value="FULL_YEAR">السنة المالية 2026 كاملاً</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">حالة السداد:</label>
                        <select 
                            value={selectedStatusFilter}
                            onChange={e => setSelectedStatusFilter(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-primary"
                        >
                            <option value="ALL">جميع الحالات</option>
                            <option value={RentPaymentStatus.PAID}>مدفوع بالكامل</option>
                            <option value={RentPaymentStatus.OVERDUE}>متأخرات سداد</option>
                            <option value={RentPaymentStatus.PARTIALLY_PAID}>مدفوع جزئياً</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs font-medium" 
                            onClick={() => {
                                setSelectedPropertyFilter('ALL');
                                setSelectedDateRange('THIS_MONTH');
                                setSelectedStatusFilter('ALL');
                                addToast({ type: 'info', title: 'تمت العملية', message: 'تم إعادة ضبط خيارات التصفية' });
                            }}
                            leftIcon={<ArrowPathIcon className="w-3.5 h-3.5"/>}
                        >
                            إعادة الضبط
                        </Button>
                    </div>
                </div>

                {/* Clean Tabs Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 dark:border-slate-800 no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('financial')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'financial' 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <BanknotesIcon className="w-4 h-4" />
                        <span>التحصيل والتدفق المالي</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('roi')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'roi' 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        <span>مؤشر العائد (ROI Dashboard)</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('occupancy')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'occupancy' 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <ChartBarIcon className="w-4 h-4 text-amber-400" />
                        <span>الخرائط الحرارية والشواغر</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('leases')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'leases' 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <ClockIcon className="w-4 h-4" />
                        <span>انتهاء العقود والتنبيهات</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('maintenance')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'maintenance' 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <WrenchScrewdriverIcon className="w-4 h-4" />
                        <span>مصاريف الصيانة</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('legal')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'legal' 
                                ? 'bg-primary text-white shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <GavelIcon className="w-4 h-4" />
                        <span>القضايا والإنذارات</span>
                    </button>

                    <button 
                        onClick={() => setActiveTab('custom')}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                            activeTab === 'custom' 
                                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <SparklesIcon className="w-4 h-4" />
                        <span>تقرير مخصص</span>
                    </button>
                </div>
            </Card>

            {/* TAB 1: FINANCIAL & REVENUE */}
            {activeTab === 'financial' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-r-4 border-r-emerald-500">
                            <p className="text-xs text-slate-500 font-medium">الإيراد المتوقع</p>
                            <p className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-white">
                                {formatKWD(collectionsMetrics.totalExpected)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">استحقاقات عقود الإيجار</p>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-sky-500">
                            <p className="text-xs text-slate-500 font-medium">المحصل فعلياً</p>
                            <p className="text-xl font-bold font-mono mt-1 text-sky-600 dark:text-sky-400">
                                {formatKWD(collectionsMetrics.totalPaid)}
                            </p>
                            <div className="flex items-center justify-between mt-0.5 text-[11px] text-slate-400">
                                <span>نسبة التحصيل:</span>
                                <span className="font-bold text-sky-600">{collectionsMetrics.collectionRate}%</span>
                            </div>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-rose-500">
                            <p className="text-xs text-slate-500 font-medium">المتأخرات القائمة</p>
                            <p className="text-xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">
                                {formatKWD(collectionsMetrics.totalArrears)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">3 مستأجرين متعثرين</p>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-purple-500">
                            <p className="text-xs text-slate-500 font-medium">صافي الدخل المالي</p>
                            <p className="text-xl font-bold font-mono mt-1 text-purple-600 dark:text-purple-400">
                                {formatKWD(collectionsMetrics.netNOI)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">بعد خصم مصاريف الصيانة</p>
                        </Card>
                    </div>

                    {/* Revenue Forecasting (توقعات الإيرادات المستقبلية للأشهر الستة القادمة) */}
                    <Card className="p-5 space-y-4" title="توقعات الإيرادات والتدفقات النقدية المستقبلية (6 Months Cash Flow Forecasting)">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-amber-500" />
                                    <span>التنبؤ المالي المستقبلي بناءً على عقود الإيجار الحالية وسجل التحصيل السابق</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    يتم تحليل اتجاهات التحصيل للتنبؤ بالتدفقات النقدية مع تمييز فترات الشغور المتوقعة باللون الأحمر والبرتقالي
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg text-xs font-mono font-bold shrink-0">
                                متوقع 6 أشهر: 324,500.000 د.ك
                            </span>
                        </div>

                        {/* Recharts Revenue Forecasting Chart */}
                        <div className="h-72 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={MOCK_FUTURE_REVENUE_FORECAST} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                    <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 11 }} />
                                    <Tooltip 
                                        formatter={(val: any, name: any) => [
                                            formatKWD(Number(val)), 
                                            name === 'expectedGross' ? 'الإيراد الإجمالي التعاقدي' :
                                            name === 'projectedNet' ? 'التدفق النقدي الصافي المتوقع' : 'خسارة الشغور المتوقعة'
                                        ]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                    <Bar dataKey="expectedGross" name="الإيراد التعاقدي الكامل" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="projectedNet" name="التدفق الصافي المتوقع" fill="#0284c7" radius={[6, 6, 0, 0]}>
                                        {MOCK_FUTURE_REVENUE_FORECAST.map((entry, index) => (
                                            <Cell key={`cell-net-${index}`} fill={entry.isVacancyRisk ? '#f59e0b' : '#0284c7'} />
                                        ))}
                                    </Bar>
                                    <Line type="monotone" dataKey="vacancyLoss" name="خسارة الشغور المفقودة" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4, fill: '#e11d48' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Forecasting Analytical Highlights Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">فترة شغور حرجة متوقعة</span>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">أكتوبر 2026 (تراجع التدفق النقدي إلى 84%)</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                    انقضاء عقد محل 12 بالفروانية وشقة 202. ينصح بتوجيه المكاتب العقارية للتسويق المبكر.
                                </p>
                            </div>

                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">ذروة التدفقات النقدية</span>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">ديسمبر 2026 (نسبة إشغال 97%)</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                    اكتمال تحصيل الإيجارات السنوية وتسوية المتأخرات قبل نهاية السنة المالية.
                                </p>
                            </div>

                            <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-xl space-y-1">
                                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">معدل الإشغال التقديري العام</span>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">91.8% متوسط الأشهر الستة القادمة</p>
                                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                    أداء مستقر يتجاوز المتوسط الإقليمي، مع الحاجة لإعادة تقييم بعض العقود المتبقية.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* PROPERTY YIELD / ROI SIMULATOR (محاكي عوائد العقارات) */}
                    <Card className="p-5 space-y-5" title="محاكي عوائد المحفظة والعقارات (Interactive Property ROI & Yield Simulator)">
                        <div className="bg-gradient-to-r from-primary/10 via-purple-500/5 to-slate-100 dark:to-slate-800/60 p-4 rounded-2xl border border-primary/20 space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <SparklesIcon className="w-5 h-5 text-primary" />
                                        <span>اختبار سيناريوهات افتراضية (تعديل قيمة الإيجار ونسب الإشغال)</span>
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        قم بتحريك المؤشرات لرؤية الأثر المالي الفوري على صافي الربح السنوي (NOI) ومعدل العائد (ROI %)
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs shadow-sm">
                                        <span className="text-slate-400 block text-[10px]">الأثر المالي المتوقع:</span>
                                        <strong className={`text-sm ${simulatedYieldResults.totalDiffNOI >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {simulatedYieldResults.totalDiffNOI >= 0 ? '+' : ''}{formatKWD(simulatedYieldResults.totalDiffNOI)}
                                        </strong>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        variant="primary" 
                                        leftIcon={<SparklesIcon className="w-4 h-4"/>}
                                        onClick={() => setIsSaveSimModalOpen(true)}
                                        className="bg-primary hover:bg-primary/90 text-white font-bold"
                                    >
                                        حفظ هذا السيناريو
                                    </Button>
                                </div>
                            </div>

                            {/* Controls Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                {/* Rent Slider */}
                                <div className="space-y-2 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <label className="text-slate-700 dark:text-slate-300">نسبة تغيير الإيجار الافتراضية:</label>
                                        <span className={`font-mono px-2 py-0.5 rounded text-xs ${simRentAdjustment >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                                            {simRentAdjustment >= 0 ? `+${simRentAdjustment}%` : `${simRentAdjustment}%`}
                                        </span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="-30" 
                                        max="50" 
                                        step="5" 
                                        value={simRentAdjustment}
                                        onChange={e => setSimRentAdjustment(Number(e.target.value))}
                                        className="w-full accent-primary cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                        <span>-30% (تخفيض)</span>
                                        <span>0% (الحالي)</span>
                                        <span>+50% (زيادة)</span>
                                    </div>
                                </div>

                                {/* Occupancy Slider */}
                                <div className="space-y-2 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <label className="text-slate-700 dark:text-slate-300">نسبة الإشغال المتوقعة:</label>
                                        <span className="font-mono px-2 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 rounded text-xs">
                                            {simOccupancyRate}%
                                        </span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="50" 
                                        max="100" 
                                        step="5" 
                                        value={simOccupancyRate}
                                        onChange={e => setSimOccupancyRate(Number(e.target.value))}
                                        className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                                        <span>50% (شغور عالي)</span>
                                        <span>80% (متوسط)</span>
                                        <span>100% (إشغال كامل)</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recharts Yield Simulator Comparison Chart */}
                        <div className="h-64 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={simulatedYieldResults.propertiesData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tickFormatter={(val) => `${val / 1000}k`} tick={{ fontSize: 11 }} />
                                    <Tooltip 
                                        formatter={(val: any, name: any) => [
                                            formatKWD(Number(val)), 
                                            name === 'baseNOI' ? 'صافي الربح السنوي الحالي (NOI)' : 'صافي الربح المحاكى المستهدف'
                                        ]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                    <Bar dataKey="baseNOI" name="الربح السنوي الحالي (NOI)" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="simNOI" name="الربح السنوي المحاكى (السيناريو)" fill="#059669" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* SAVED SIMULATION SCENARIOS LEDGER */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <DocumentTextIcon className="w-4 h-4 text-primary" />
                                    <span>سجل السيناريوهات الافتراضية المحفوظة (Saved Scenarios Ledger)</span>
                                </h4>
                                <span className="text-[10px] font-mono text-slate-500">إجمالي السيناريوهات: {savedSimulations.length}</span>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="p-2.5">رمز السيناريو / العنوان</th>
                                            <th className="p-2.5">تعديل الإيجار</th>
                                            <th className="p-2.5">نسبة الإشغال</th>
                                            <th className="p-2.5">الربح المستهدف (NOI)</th>
                                            <th className="p-2.5">الأثر المالي</th>
                                            <th className="p-2.5">تاريخ الحفظ</th>
                                            <th className="p-2.5 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                        {savedSimulations.map(sim => (
                                            <tr key={sim.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                                            {sim.id}
                                                        </span>
                                                        <span>{sim.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-2.5 font-mono">
                                                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${sim.rentAdjustment >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}`}>
                                                        {sim.rentAdjustment >= 0 ? `+${sim.rentAdjustment}%` : `${sim.rentAdjustment}%`}
                                                    </span>
                                                </td>
                                                <td className="p-2.5 font-mono text-sky-700 dark:text-sky-400 font-bold">
                                                    {sim.occupancyRate}%
                                                </td>
                                                <td className="p-2.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                                                    {formatKWD(sim.projectedNOI)}
                                                </td>
                                                <td className="p-2.5 font-mono font-bold">
                                                    <span className={sim.diffNOI >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                                        {sim.diffNOI >= 0 ? '+' : ''}{formatKWD(sim.diffNOI)}
                                                    </span>
                                                </td>
                                                <td className="p-2.5 font-mono text-slate-500 text-[11px]">
                                                    {formatDateAr(sim.createdAt)}
                                                </td>
                                                <td className="p-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            onClick={() => {
                                                                setSimRentAdjustment(sim.rentAdjustment);
                                                                setSimOccupancyRate(sim.occupancyRate);
                                                                setSelectedSimForView(sim);
                                                            }}
                                                            title="تطبيق واطلاع على السيناريو"
                                                            className="p-1 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => setSelectedSimForEdit(sim)}
                                                            title="تعديل السيناريو"
                                                            className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                                                        >
                                                            <PencilIcon className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                setSavedSimulations(prev => prev.filter(s => s.id !== sim.id));
                                                                addToast({ type: 'success', title: 'تم الحذف', message: `تم حذف السيناريو "${sim.name}" بنجاح` });
                                                            }}
                                                            title="حذف السيناريو"
                                                            className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>

                    {/* TENANT RISK ASSESSMENT INDEX (مؤشر تقييم مخاطر المستأجرين) */}
                    <Card className="p-5 space-y-4" title="مؤشر تقييم مخاطر المستأجرين (Tenant Risk Assessment Index)">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <GavelIcon className="w-4 h-4 text-amber-600" />
                                    <span>تحليل آلي لتاريخ انتظام السداد والتكرارات القانونية لتحديد قرار التجديد</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    يساعد المحامي والإدارة في اتخاذ القرار القانوني المناسب عند تجديد العقد أو رفع دعاوى الإخلاء
                                </p>
                            </div>

                            {/* Risk Filter Buttons and Add Button */}
                            <div className="flex items-center gap-2 shrink-0">
                                <Button 
                                    size="sm" 
                                    variant="primary" 
                                    leftIcon={<PlusIcon className="w-4 h-4"/>}
                                    onClick={() => setIsAddTenantRiskModalOpen(true)}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                                >
                                    إضافة تقييم مستأجر
                                </Button>
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={() => setTenantRiskFilter('ALL')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${tenantRiskFilter === 'ALL' ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        الكل ({tenantsRiskList.length})
                                    </button>
                                    <button 
                                        onClick={() => setTenantRiskFilter('HIGH')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${tenantRiskFilter === 'HIGH' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}`}
                                    >
                                        عالي المخاطر
                                    </button>
                                    <button 
                                        onClick={() => setTenantRiskFilter('MEDIUM')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${tenantRiskFilter === 'MEDIUM' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'}`}
                                    >
                                        متوسط
                                    </button>
                                    <button 
                                        onClick={() => setTenantRiskFilter('LOW')}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${tenantRiskFilter === 'LOW' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'}`}
                                    >
                                        منخفض
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tenant Risk Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">اسم المستأجر والعين</th>
                                        <th className="p-3 text-start">الرقم المدني</th>
                                        <th className="p-3 text-start">سجل انتظام السداد</th>
                                        <th className="p-3 text-start">درجة ومستوى المخاطر</th>
                                        <th className="p-3 text-start">توصية المحامي لقرار التجديد</th>
                                        <th className="p-3 text-center">الإجراءات (CRUD)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {filteredTenantsRisk.map(tenant => (
                                        <tr key={tenant.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 dark:text-white">{tenant.tenantName}</p>
                                                <p className="text-[11px] text-slate-400">{tenant.propertyUnit}</p>
                                            </td>
                                            <td className="p-3 font-mono text-slate-500">{tenant.civilId}</td>
                                            <td className="p-3">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{tenant.delinquencyFrequency}</p>
                                                <p className="text-[10px] text-slate-400">{tenant.paymentPunctuality}</p>
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-1">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tenant.badgeClass}`}>
                                                        {tenant.riskLevel === 'HIGH' ? '🔴 عالي المخاطر' : tenant.riskLevel === 'MEDIUM' ? '🟡 متوسط المخاطر' : '🟢 منخفض المخاطر'}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                                        <span>مؤشر السلامة:</span>
                                                        <strong className="font-bold text-slate-900 dark:text-white">{tenant.riskScore}/100</strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <p className={`font-bold text-xs p-2 rounded-lg border ${
                                                    tenant.riskLevel === 'HIGH' ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300' :
                                                    tenant.riskLevel === 'MEDIUM' ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300' :
                                                    'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300'
                                                }`}>
                                                    {tenant.lawyerRecommendation}
                                                </p>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        onClick={() => setSelectedTenantForView(tenant)}
                                                        className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300 rounded-lg text-xs flex items-center gap-1"
                                                        title="اطلاع"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                        <span>اطلاع</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setSelectedTenantForEdit(tenant)}
                                                        className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg text-xs flex items-center gap-1"
                                                        title="تعديل"
                                                    >
                                                        <PencilIcon className="w-3.5 h-3.5" />
                                                        <span>تعديل</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm(`هل أنت أصل من حذف سجل المستأجر "${tenant.tenantName}"؟`)) {
                                                                setTenantsRiskList(prev => prev.filter(t => t.id !== tenant.id));
                                                                addToast({ type: 'success', title: 'تم الحذف', message: `تم حذف سجل المستأجر ${tenant.tenantName} بنجاح` });
                                                            }
                                                        }}
                                                        className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg text-xs flex items-center gap-1"
                                                        title="حذف"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                        <span>حذف</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Table 1: Detailed Collections */}
                    <Card className="p-5 space-y-4" title="جدول تحصيل الإيجارات التفصيلي">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">العقار والوحدة</th>
                                        <th className="p-3 text-start">المستأجر</th>
                                        <th className="p-3 text-start">الرقم المدني</th>
                                        <th className="p-3 text-start">الإيجار</th>
                                        <th className="p-3 text-start">المدفوع</th>
                                        <th className="p-3 text-start">المتأخرات</th>
                                        <th className="p-3 text-start">الحالة</th>
                                        <th className="p-3 text-start">الإيصال</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {filteredCollections.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 dark:text-white">{item.propertyName}</p>
                                                <p className="text-[11px] font-mono text-primary">{item.unitNumber}</p>
                                            </td>
                                            <td className="p-3 font-medium">{item.tenantName}</td>
                                            <td className="p-3 font-mono text-slate-500">{item.civilId}</td>
                                            <td className="p-3 font-mono font-bold">{formatKWD(item.dueAmount)}</td>
                                            <td className="p-3 font-mono font-bold text-emerald-600">{formatKWD(item.paidAmount)}</td>
                                            <td className="p-3 font-mono font-bold text-rose-600">{formatKWD(item.arrears)}</td>
                                            <td className="p-3">
                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                    item.status === RentPaymentStatus.PAID ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                                                    item.status === RentPaymentStatus.OVERDUE ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' :
                                                    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-slate-500">
                                                {item.receiptNumber}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Arrears Ledger */}
                    <Card className="p-5 space-y-4" title="كشف المستأجرين المتعثرين وآجال المتأخرات">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">المستأجر والعين</th>
                                        <th className="p-3 text-start">الرقم المدني</th>
                                        <th className="p-3 text-start">مدة التأخير</th>
                                        <th className="p-3 text-start">المبلغ</th>
                                        <th className="p-3 text-start">الإنذار القانوني</th>
                                        <th className="p-3 text-start">الإجراء الموصى به</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {MOCK_TENANT_ARREARS.map((arr, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 dark:text-white">{arr.tenantName}</p>
                                                <p className="text-[11px] text-slate-400">{arr.propertyUnit}</p>
                                            </td>
                                            <td className="p-3 font-mono text-slate-500">{arr.civilId}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 rounded font-medium text-[11px]">
                                                    {arr.agingBucket} ({arr.overdueDays} يوماً)
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono font-bold text-rose-600">{formatKWD(arr.arrearsAmount)}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{arr.noticeStatus}</td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded text-[11px] font-medium">
                                                    {arr.legalAction}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 2: ROI DASHBOARD (مؤشر العائد الاستثماري لكل عقار) */}
            {activeTab === 'roi' && (
                <div className="space-y-6">
                    {/* ROI Summary Banner */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="p-4 border-r-4 border-r-emerald-600">
                            <p className="text-xs text-slate-500 font-medium">متوسط العائد السنوي (ROI)</p>
                            <p className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                                {portfolioRoiMetrics.avgRoi}%
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">مقارنة بمعدل السوق الكويتي (6.8%)</p>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-primary">
                            <p className="text-xs text-slate-500 font-medium">إجمالي القيمة السوقية للمحفظة</p>
                            <p className="text-xl font-bold font-mono mt-1 text-slate-900 dark:text-white">
                                {formatKWD(portfolioRoiMetrics.totalValuation)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">تقييم عقاري معتمد</p>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-sky-500">
                            <p className="text-xs text-slate-500 font-medium">الإيراد الإجمالي السنوي</p>
                            <p className="text-xl font-bold font-mono mt-1 text-sky-600 dark:text-sky-400">
                                {formatKWD(portfolioRoiMetrics.totalGrossIncome)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">عقود الإيجار السنوية</p>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-purple-500">
                            <p className="text-xs text-slate-500 font-medium">صافي الربح التشغيلي (NOI)</p>
                            <p className="text-xl font-bold font-mono mt-1 text-purple-600 dark:text-purple-400">
                                {formatKWD(portfolioRoiMetrics.totalNOI)}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">بعد خصم المصاريف والصيانة</p>
                        </Card>
                    </div>

                    {/* ROI Chart using Recharts */}
                    <Card className="p-5 space-y-4" title="مقارنة العائد الاستثماري (ROI %) لكل عقار مع متوسط السوق الكويتي">
                        <div className="h-72 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_PROPERTY_ROI_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 10]} tick={{ fontSize: 11 }} />
                                    <Tooltip 
                                        formatter={(value: any) => [`${value}%`, 'نسبة العائد الصافي']}
                                        labelStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                    <Bar dataKey="netRoiPercentage" name="العائد الصافي للعقار (ROI %)" radius={[6, 6, 0, 0]}>
                                        {MOCK_PROPERTY_ROI_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="kuwaitMarketAvgRoi" name="متوسط السوق الكويتي" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Side-by-Side Property Comparison Card (بطاقة تحليل المحفظة العقارية والمقارنة التفاعلية بين عقارين) */}
                    <Card className="p-5 space-y-4" title="تحليل المحفظة العقارية: مقارنة أداء عقارين مختلفين جنباً إلى جنب (Side-by-Side Comparison)">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            دمج بيانات العائد على الاستثمار (ROI) مع توزيعات المناطق الجغرافية للقيام بمقارنة تفاعلية حية بين عقارين في المحفظة
                        </p>

                        {/* Selectors Bar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                                    <BuildingOffice2Icon className="w-4 h-4 text-emerald-600" />
                                    <span>اختر العقار الأول (العقار أ):</span>
                                </label>
                                <select 
                                    value={comparePropAId} 
                                    onChange={e => setComparePropAId(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-slate-900 dark:text-white"
                                >
                                    {MOCK_PROPERTY_ROI_DATA.map(prop => (
                                        <option key={prop.id} value={prop.id}>{prop.name} ({prop.district}) - ROI {prop.netRoiPercentage}%</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                                    <BuildingOffice2Icon className="w-4 h-4 text-sky-600" />
                                    <span>اختر العقار الثاني (العقار ب):</span>
                                </label>
                                <select 
                                    value={comparePropBId} 
                                    onChange={e => setComparePropBId(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-primary text-slate-900 dark:text-white"
                                >
                                    {MOCK_PROPERTY_ROI_DATA.map(prop => (
                                        <option key={prop.id} value={prop.id}>{prop.name} ({prop.district}) - ROI {prop.netRoiPercentage}%</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Interactive Comparison Matrix */}
                        {(() => {
                            const pA = MOCK_PROPERTY_ROI_DATA.find(p => p.id === comparePropAId) || MOCK_PROPERTY_ROI_DATA[0];
                            const pB = MOCK_PROPERTY_ROI_DATA.find(p => p.id === comparePropBId) || MOCK_PROPERTY_ROI_DATA[1];
                            const heatA = MOCK_DISTRICT_HEATMAP_DATA.find(h => h.district === pA.district) || MOCK_DISTRICT_HEATMAP_DATA[0];
                            const heatB = MOCK_DISTRICT_HEATMAP_DATA.find(h => h.district === pB.district) || MOCK_DISTRICT_HEATMAP_DATA[1];

                            const isWinnerA = pA.netRoiPercentage >= pB.netRoiPercentage;

                            return (
                                <div className="space-y-4 pt-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Card Property A */}
                                        <div className={`p-4 rounded-2xl border ${isWinnerA ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} space-y-3 relative`}>
                                            {isWinnerA && (
                                                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                    <CheckCircleIcon className="w-3.5 h-3.5" /> الأفضل من حيث العائد
                                                </span>
                                            )}
                                            <div>
                                                <span className="text-[10px] font-mono font-bold text-slate-400">العقار (أ)</span>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{pA.name}</h3>
                                                <p className="text-xs text-slate-500">{pA.district} | تقييم: {pA.performanceBadge}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">القيمة السوقية:</span>
                                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatKWD(pA.marketValuation)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">الإيراد السنوي:</span>
                                                    <span className="font-mono font-bold text-emerald-600">{formatKWD(pA.grossAnnualIncome)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">المصاريف التشغيلية:</span>
                                                    <span className="font-mono font-bold text-rose-600">{formatKWD(pA.operatingExpenses)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">صافي الدخل السنوي (NOI):</span>
                                                    <span className="font-mono font-bold text-purple-600">{formatKWD(pA.netAnnualNOI)}</span>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">نسبة العائد الصافي (ROI):</span>
                                                <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">{pA.netRoiPercentage}%</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                                                <span>مؤشر الطلب بالمنطقة: <strong className="text-slate-900 dark:text-white">{heatA.demandScore}%</strong></span>
                                                <span>نسبة الشغور: <strong className="text-amber-600">{heatA.vacancyRate}%</strong></span>
                                            </div>
                                        </div>

                                        {/* Card Property B */}
                                        <div className={`p-4 rounded-2xl border ${!isWinnerA ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'} space-y-3 relative`}>
                                            {!isWinnerA && (
                                                <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                    <CheckCircleIcon className="w-3.5 h-3.5" /> الأفضل من حيث العائد
                                                </span>
                                            )}
                                            <div>
                                                <span className="text-[10px] font-mono font-bold text-slate-400">العقار (ب)</span>
                                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{pB.name}</h3>
                                                <p className="text-xs text-slate-500">{pB.district} | تقييم: {pB.performanceBadge}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">القيمة السوقية:</span>
                                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatKWD(pB.marketValuation)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">الإيراد السنوي:</span>
                                                    <span className="font-mono font-bold text-emerald-600">{formatKWD(pB.grossAnnualIncome)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">المصاريف التشغيلية:</span>
                                                    <span className="font-mono font-bold text-rose-600">{formatKWD(pB.operatingExpenses)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[11px] block">صافي الدخل السنوي (NOI):</span>
                                                    <span className="font-mono font-bold text-purple-600">{formatKWD(pB.netAnnualNOI)}</span>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">نسبة العائد الصافي (ROI):</span>
                                                <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">{pB.netRoiPercentage}%</span>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                                                <span>مؤشر الطلب بالمنطقة: <strong className="text-slate-900 dark:text-white">{heatB.demandScore}%</strong></span>
                                                <span>نسبة الشغور: <strong className="text-amber-600">{heatB.vacancyRate}%</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comparative Insights Summary */}
                                    <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center gap-3">
                                        <ScaleIcon className="w-5 h-5 text-primary shrink-0" />
                                        <p className="leading-normal">
                                            <strong>النتيجة التحليلية:</strong> يتفوق <strong>{isWinnerA ? pA.name : pB.name}</strong> بعائد صافي أعلى قدره 
                                            <strong className="text-emerald-600 font-mono mx-1">{Math.max(pA.netRoiPercentage, pB.netRoiPercentage)}%</strong>
                                            مقارنة بـ <span className="font-mono font-bold">{Math.min(pA.netRoiPercentage, pB.netRoiPercentage)}%</span>.
                                            فارق صافي الدخل السنوي يبلغ <strong className="font-mono text-primary">{formatKWD(Math.abs(pA.netAnnualNOI - pB.netAnnualNOI))}</strong> لفرص تحسين المحفظة.
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}
                    </Card>

                    {/* Detailed ROI Table */}
                    <Card className="p-5 space-y-4" title="جدول كشف العائد على الاستثمار لكل عقار (ROI Breakdown)">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">العقار والمنطقة</th>
                                        <th className="p-3 text-start">القيمة السوقية</th>
                                        <th className="p-3 text-start">الإيراد السنوي الإجمالي</th>
                                        <th className="p-3 text-start">المصاريف التشغيلية</th>
                                        <th className="p-3 text-start">صافي الربح (NOI)</th>
                                        <th className="p-3 text-start">مؤشر ROI %</th>
                                        <th className="p-3 text-start">التقييم الاستثماري</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {MOCK_PROPERTY_ROI_DATA.map(prop => (
                                        <tr key={prop.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 dark:text-white">{prop.name}</p>
                                                <p className="text-[11px] text-slate-400">{prop.district}</p>
                                            </td>
                                            <td className="p-3 font-mono font-bold">{formatKWD(prop.marketValuation)}</td>
                                            <td className="p-3 font-mono text-emerald-600 font-bold">{formatKWD(prop.grossAnnualIncome)}</td>
                                            <td className="p-3 font-mono text-rose-600 font-medium">{formatKWD(prop.operatingExpenses)}</td>
                                            <td className="p-3 font-mono text-purple-600 font-bold">{formatKWD(prop.netAnnualNOI)}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-black text-sm text-emerald-600">
                                                        {prop.netRoiPercentage}%
                                                    </span>
                                                    <div className="w-16 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-emerald-500 rounded-full" 
                                                            style={{ width: `${(prop.netRoiPercentage / 10) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-lg text-[11px] font-bold">
                                                    {prop.performanceBadge}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 3: OCCUPANCY & HEATMAPS */}
            {activeTab === 'occupancy' && (
                <div className="space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 border-r-4 border-r-emerald-500">
                            <p className="text-xs text-slate-500 font-medium">نسبة الإشغال الإجمالية</p>
                            <p className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">79.2%</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">38 وحدة مأجورة من أصل 48</p>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-slate-500">
                            <p className="text-xs text-slate-500 font-medium">الوحدات الشاغرة</p>
                            <p className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-white">10 وحدات</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">جاهزة للتأجير أو قيد الصيانة</p>
                        </Card>

                        <Card className="p-4 border-r-4 border-r-rose-500">
                            <p className="text-xs text-slate-500 font-medium">الخسارة الإيجارية للشغور</p>
                            <p className="text-2xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">3,800.000 د.ك</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">إيراد شهري مفقود</p>
                        </Card>
                    </div>

                    {/* HEATMAP visual section */}
                    <Card className="p-5 space-y-4" title="الخريطة الحرارية لمعدلات الطلب والشغور حسب المناطق الكويتية (Heatmap Analysis)">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            تتبع حراري للمناطق الأكثر طلباً باللون الأخضر والمناطق ذات معدلات الشغور المرتفعة باللون البرتقالي والأحمر
                        </p>

                        {/* Recharts Heatmap Bar */}
                        <div className="h-64 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={MOCK_DISTRICT_HEATMAP_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                    <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                                    <YAxis tickFormatter={(val) => `${val}%`} domain={[0, 100]} tick={{ fontSize: 11 }} />
                                    <Tooltip 
                                        formatter={(val: any, name: any) => [
                                            `${val}%`, 
                                            name === 'demandScore' ? 'مؤشر الطلب الإيجاري' : 'نسبة الشغور'
                                        ]}
                                    />
                                    <Bar dataKey="demandScore" name="مؤشر الطلب الإيجاري %" radius={[6, 6, 0, 0]}>
                                        {MOCK_DISTRICT_HEATMAP_DATA.map((entry, idx) => (
                                            <Cell key={`cell-heat-${idx}`} fill={entry.heatColor} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* District Heatmap Grid Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
                            {MOCK_DISTRICT_HEATMAP_DATA.map((heat, idx) => (
                                <div 
                                    key={idx}
                                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 relative overflow-hidden"
                                    style={{ borderTop: `4px solid ${heat.heatColor}` }}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{heat.district}</span>
                                        <span 
                                            className="w-2.5 h-2.5 rounded-full animate-ping"
                                            style={{ backgroundColor: heat.heatColor }}
                                        />
                                    </div>
                                    <div className="flex items-baseline justify-between text-xs">
                                        <span className="text-slate-500">نسبة الشغور:</span>
                                        <span className="font-mono font-bold" style={{ color: heat.heatColor }}>{heat.vacancyRate}%</span>
                                    </div>
                                    <div className="flex items-baseline justify-between text-xs">
                                        <span className="text-slate-500">مؤشر الطلب:</span>
                                        <span className="font-mono font-bold text-slate-900 dark:text-white">{heat.demandScore}%</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight pt-1 border-t border-slate-100 dark:border-slate-800">
                                        {heat.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Unit Type Breakdown Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <Card className="p-5 space-y-4" title="توزيع الشواغر والإشغال حسب فئة الوحدات">
                            <div className="h-60 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={MOCK_UNIT_TYPE_OCCUPANCY}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {MOCK_UNIT_TYPE_OCCUPANCY.map((entry, index) => (
                                                <Cell key={`pie-cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val: any) => [`${val} وحدة`, 'إجمالي الوحدات']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <Card className="p-5 space-y-4" title="كشف الشواغر والفرص التأجيرية المتاحة">
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                                <table className="w-full text-xs text-start">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="p-2.5 text-start">العقار</th>
                                            <th className="p-2.5 text-start">الوحدة</th>
                                            <th className="p-2.5 text-start">الإيجار</th>
                                            <th className="p-2.5 text-start">مدة الشغور</th>
                                            <th className="p-2.5 text-center">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                        <tr>
                                            <td className="p-2.5 font-bold">برج ناصر (الشرق)</td>
                                            <td className="p-2.5 text-primary font-mono">شقة 202</td>
                                            <td className="p-2.5 font-mono font-bold">500.000 د.ك</td>
                                            <td className="p-2.5 font-mono text-slate-600">22 يوماً</td>
                                            <td className="p-2.5 text-center">
                                                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => addToast({ type: 'success', title: 'تمت العملية', message: 'تم إرسال إعلان الشغور للمكاتب' })}>
                                                    إعلان تأجير
                                                </Button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-2.5 font-bold">مجمع الفروانية</td>
                                            <td className="p-2.5 text-primary font-mono">مكتب 201</td>
                                            <td className="p-2.5 font-mono font-bold">650.000 د.ك</td>
                                            <td className="p-2.5 font-mono text-slate-600">45 يوماً</td>
                                            <td className="p-2.5 text-center">
                                                <Button size="sm" variant="outline" className="text-[10px] py-1 px-2" onClick={() => addToast({ type: 'success', title: 'تمت العملية', message: 'تم تحديث تقييم السعر' })}>
                                                    إعادة التقييم
                                                </Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB 4: LEASE EXPIRATIONS & PROACTIVE LEGAL ALERTS */}
            {activeTab === 'leases' && (
                <div className="space-y-6">
                    {/* Daily Proactive Legal Alerts Report (العقود المنتهية خلال 60 يوماً والإجراءات القضائية) */}
                    <Card className="p-5 space-y-4" title="تقرير التنبيهات القانونية الاستباقية اليومي الآلي (العقود المنتهية خلال 60 يوماً)">
                        <div className="bg-amber-50/80 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-3">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <BellAlertIcon className="w-5 h-5 text-amber-600 animate-bounce" />
                                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-300">
                                        تنبيه يومي استباقي: عقود تجاربة واستثمارية مشارفة على الانتهاء لتفادي الامتداد القانوني التلقائي
                                    </h4>
                                </div>
                                <span className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 rounded-lg text-[11px] font-mono font-bold">
                                    4 عقود تتطلب إخطاراً قضائياً
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                يتيح النظام للمحامي توجيه إخطار رسمي أو تحويل الملف مباشرة إلى قضية إخلاء أو إعداد طلب زيادة إيجار طبقاً للمادة 20 من قانون الإيجارات الكويتي.
                            </p>
                        </div>

                        {/* Interactive Expiring Leases Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {expiringLeasesAlerts.map(alert => (
                                <div key={alert.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm hover:border-primary/40 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-mono font-bold text-slate-400">{alert.id}</span>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alert.tenantName}</h4>
                                            <p className="text-xs text-slate-500">{alert.propertyName} - {alert.unitNumber}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                                            alert.daysLeft <= 20 ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' :
                                            alert.daysLeft <= 40 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                                            'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
                                        }`}>
                                            متبقي {alert.daysLeft} يوماً
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg font-mono">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">تاريخ الانتهاء:</span>
                                            <strong className="text-slate-800 dark:text-slate-200">{formatDateAr(alert.endDate)}</strong>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block">الإيجار الشهري:</span>
                                            <strong className="text-emerald-600 dark:text-emerald-400">{formatKWD(alert.monthlyRent)}</strong>
                                        </div>
                                    </div>

                                    {/* Action Taken Status Banner if converted */}
                                    {alert.actionStatus !== 'NONE' ? (
                                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                                                {alert.actionStatus === 'EVICTION_CASE' ? 'تم التحويل لملف قضية إخلاء' : 'تم إعداد طلب زيادة الإيجار'}
                                            </span>
                                            <span className="font-mono text-[10px] bg-emerald-200 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                                                {alert.actionReference}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 pt-1">
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="text-xs flex-1 text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900 dark:text-rose-300"
                                                onClick={() => {
                                                    const refCode = `CASE-2026/${Math.floor(1000 + Math.random() * 9000)}`;
                                                    setExpiringLeasesAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, actionStatus: 'EVICTION_CASE', actionReference: refCode } : a));
                                                    addToast({ type: 'success', title: 'تم تحويل العقد إلى ملف قضية إخلاء', message: `تم إنشاء ملف القضية رقم ${refCode} وإدراجه في جدول القضايا` });
                                                }}
                                            >
                                                <GavelIcon className="w-3.5 h-3.5 ml-1 text-rose-600" />
                                                تحويل لملف قضية إخلاء
                                            </Button>

                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="text-xs flex-1 text-primary hover:bg-primary/10 border-primary/30"
                                                onClick={() => {
                                                    const refCode = `REQ-INC/${Math.floor(100 + Math.random() * 900)}`;
                                                    setExpiringLeasesAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, actionStatus: 'RENT_INCREASE', actionReference: refCode } : a));
                                                    addToast({ type: 'info', title: 'تم إعداد طلب زيادة الإيجار', message: `تم صياغة إخطار زيادة القيمة الإيجارية بموجب المادة 20 برقم ${refCode}` });
                                                }}
                                            >
                                                <SparklesIcon className="w-3.5 h-3.5 ml-1 text-primary" />
                                                طلب زيادة إيجار
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5 space-y-4" title="الجدول الزمني لانتهاء صلاحية العقود والتنبيهات">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">رقم العقد</th>
                                        <th className="p-3 text-start">المستأجر والعين</th>
                                        <th className="p-3 text-start">تاريخ الانتهاء</th>
                                        <th className="p-3 text-start">الأيام المتبقية</th>
                                        <th className="p-3 text-start">الإيجار الشهري</th>
                                        <th className="p-3 text-start">حالة الإشعار</th>
                                        <th className="p-3 text-center">الإجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {MOCK_EXPIRING_LEASES.map(lease => (
                                        <tr key={lease.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-mono font-bold text-primary">{lease.id}</td>
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 dark:text-white">{lease.tenantName}</p>
                                                <p className="text-[11px] text-slate-400">{lease.propertyName} - {lease.unitNumber}</p>
                                            </td>
                                            <td className="p-3 font-mono">{formatDateAr(lease.endDate)}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                                    lease.statusUrgency === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' :
                                                    lease.statusUrgency === 'WARNING' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                                                    'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
                                                }`}>
                                                    {lease.daysLeft} يوماً
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono font-bold">{formatKWD(lease.monthlyRent)}</td>
                                            <td className="p-3">
                                                {lease.noticeSent ? (
                                                    <span className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
                                                        <CheckCircleIcon className="w-3.5 h-3.5" /> تم تسليم الإشعار
                                                    </span>
                                                ) : (
                                                    <span className="text-rose-600 font-medium text-[11px] flex items-center gap-1">
                                                        <ExclamationTriangleIcon className="w-3.5 h-3.5" /> يتطلب إشعار
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button size="sm" variant="outline" className="text-[11px]" onClick={() => addToast({ type: 'success', title: 'تمت العملية', message: 'تم فتح نموذج إخطار عدم رغبة بالتجديد' })}>
                                                    إخطار عدم تجديد
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 5: MAINTENANCE & OPERATIONAL COST EFFICIENCY */}
            {activeTab === 'maintenance' && (
                <div className="space-y-6">
                    {/* Operational Cost Efficiency Analysis Report */}
                    <Card className="p-5 space-y-4" title="تقرير تحليل كفاءة التكاليف التشغيلية ومقارنة مصاريف الصيانة">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="space-y-1">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="w-4 h-4 text-primary" />
                                    <span>مقارنة تكاليف الصيانة الفعلية بالمتوسط الطبيعي لتحديد مشاكل البنية التحتية</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                    يتم تمييز الوحدات التي تتجاوز متوسط التكلفة الطبيعي باللون الأحمر والبرتقالي لتنبيه الإدارة بالخلل الإنشائي في المصاعد أو شبكات التكييف
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<PlusIcon className="w-4 h-4" />}
                                onClick={() => setIsAddMaintModalOpen(true)}
                                className="shrink-0"
                            >
                                إضافة سجل صيانة جديد
                            </Button>
                        </div>

                        {/* Recharts Operational Cost Efficiency Chart */}
                        <div className="h-64 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={maintenanceLogsList} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                                    <XAxis dataKey="unitNumber" tick={{ fontSize: 11 }} />
                                    <YAxis tickFormatter={(val) => `${val} د.ك`} tick={{ fontSize: 11 }} />
                                    <Tooltip 
                                        formatter={(val: any, name: any) => [
                                            formatKWD(Number(val)), 
                                            name === 'cost' ? 'التكلفة الفعلية المرصودة' : 'متوسط التكلفة الطبيعي المعياري'
                                        ]}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                                    <Bar dataKey="cost" name="التكلفة الفعلية المرصودة" radius={[6, 6, 0, 0]}>
                                        {maintenanceLogsList.map((entry, idx) => (
                                            <Cell key={`cell-mnt-eff-${idx}`} fill={entry.isInfrastructureAnamoly ? '#e11d48' : entry.isHighCost ? '#f59e0b' : '#10b981'} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="avgBaselineCost" name="المعدل الطبيعي المعياري" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Detailed Operational Cost Efficiency Benchmarks Table with CRUD */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">العقار والوحدة</th>
                                        <th className="p-3 text-start">فئة الصيانة</th>
                                        <th className="p-3 text-start">التكلفة الفعلية</th>
                                        <th className="p-3 text-start">المعدل المعياري الطبيعي</th>
                                        <th className="p-3 text-start">مؤشر الانحراف والتنبيه</th>
                                        <th className="p-3 text-center">الإجراءات (CRUD)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {maintenanceLogsList.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 dark:text-white">{item.propertyName}</p>
                                                <p className="text-[11px] font-mono text-primary">{item.unitNumber}</p>
                                            </td>
                                            <td className="p-3 font-medium">{item.category} ({item.contractor})</td>
                                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{formatKWD(item.cost)}</td>
                                            <td className="p-3 font-mono text-slate-500">{formatKWD(item.avgBaselineCost)}</td>
                                            <td className="p-3">
                                                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                    item.isInfrastructureAnamoly ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300' :
                                                    item.isHighCost ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300' :
                                                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                }`}>
                                                    {item.alertText}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button 
                                                        onClick={() => setSelectedMaintForView(item)}
                                                        className="p-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300 rounded-lg text-xs flex items-center gap-1"
                                                        title="اطلاع"
                                                    >
                                                        <EyeIcon className="w-3.5 h-3.5" />
                                                        <span>اطلاع</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => setSelectedMaintForEdit(item)}
                                                        className="p-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 rounded-lg text-xs flex items-center gap-1"
                                                        title="تعديل"
                                                    >
                                                        <PencilIcon className="w-3.5 h-3.5" />
                                                        <span>تعديل</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (window.confirm(`هل أنت أصل من حذف سجل الصيانة رقم ${item.id}؟`)) {
                                                                setMaintenanceLogsList(prev => prev.filter(m => m.id !== item.id));
                                                                addToast({ type: 'success', title: 'تم الحذف', message: `تم حذف سجل الصيانة رقم ${item.id} بنجاح` });
                                                            }
                                                        }}
                                                        className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg text-xs flex items-center gap-1"
                                                        title="حذف"
                                                    >
                                                        <TrashIcon className="w-3.5 h-3.5" />
                                                        <span>حذف</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Field Property Inspection Reports Section (نموذج تقرير تفتيش العقار الميداني) */}
                    <Card className="p-5 space-y-4" title="تقارير التفتيش والمعاينة الميدانية للعقارات (Field Inspection Reports)">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ClipboardDocumentCheckIcon className="w-4 h-4 text-[#00796B]" />
                                    <span>توثيق المعاينات الميدانية وتقييم الحالة الإنشائية للعين (ربط آلي مع كفاءة التكاليف)</span>
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    يتيح للمحامي تسديد الملاحظات الميدانية، التقاط الصور المباشرة للكاميرا، وتقييم الحالة الإنشائية (ممتاز، جيد، يحتاج صيانة، متضرر).
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<PlusIcon className="w-4 h-4" />}
                                onClick={() => setIsInspectionModalOpen(true)}
                                className="bg-[#00796B] hover:bg-[#004D40] text-white font-extrabold text-xs shrink-0"
                            >
                                إضافة تقرير معاينة ميدانية جديد 📷
                            </Button>
                        </div>

                        {/* List of Inspection Reports */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inspectionReportsList.map((insp) => (
                                <div key={insp.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
                                    <div className="flex justify-between items-start border-b pb-2.5 border-slate-100 dark:border-slate-800">
                                        <div>
                                            <span className="text-[10px] font-mono text-slate-400 block">{insp.id}</span>
                                            <h5 className="font-extrabold text-slate-900 dark:text-white text-xs">{insp.propertyName} - {insp.unitNumber}</h5>
                                            <p className="text-[10px] text-slate-500 font-bold mt-0.5">المعاين: {insp.inspectorLawyer}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                            insp.structuralCondition === 'ممتاز' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            insp.structuralCondition === 'جيد' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            insp.structuralCondition === 'يحتاج صيانة' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}>
                                            حالة البناء: {insp.structuralCondition}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        "{insp.lawyerNotes}"
                                    </p>

                                    {/* Inspection Photos Grid */}
                                    <div className="flex items-center gap-2 overflow-x-auto pt-1">
                                        {insp.photos.map((imgUrl: string, imgIdx: number) => (
                                            <img 
                                                key={imgIdx} 
                                                src={imgUrl} 
                                                alt="معاينة العين" 
                                                className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm shrink-0" 
                                            />
                                        ))}
                                        <div className="text-[10px] font-black text-[#00796B] bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-200/50">
                                            مربوط تلقائياً بتقرير كفاءة المصاريف التشغيلية ✅
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5 space-y-4" title="تقرير سجلات الصيانة والمصاريف التشغيلية">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">رقم الطلب</th>
                                        <th className="p-3 text-start">العقار والوحدة</th>
                                        <th className="p-3 text-start">فئة الصيانة</th>
                                        <th className="p-3 text-start">المقاول</th>
                                        <th className="p-3 text-start">التكلفة</th>
                                        <th className="p-3 text-start">التاريخ والحالة</th>
                                        <th className="p-3 text-start">تأثير الصيانة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {MOCK_MAINTENANCE_REPORTS.map(mnt => (
                                        <tr key={mnt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-mono font-bold text-primary">{mnt.id}</td>
                                            <td className="p-3 font-bold">
                                                <p className="text-slate-900 dark:text-white">{mnt.propertyName}</p>
                                                <p className="text-[11px] text-slate-400">{mnt.unitNumber}</p>
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{mnt.category}</td>
                                            <td className="p-3 font-medium">{mnt.contractor}</td>
                                            <td className="p-3 font-mono font-bold">{formatKWD(mnt.cost)}</td>
                                            <td className="p-3">
                                                <p className="font-mono text-[11px] text-slate-500">{formatDateAr(mnt.date)}</p>
                                                <span className="text-emerald-600 font-medium text-[11px]">{mnt.status}</span>
                                            </td>
                                            <td className="p-3 font-mono text-rose-600 font-bold">{mnt.impactOnYield}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 6: LEGAL & DISPUTES */}
            {activeTab === 'legal' && (
                <div className="space-y-6">
                    {/* Header Action Row for Legal */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-amber-500/10 via-primary/5 to-transparent p-4 rounded-2xl border border-amber-500/20">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <GavelIcon className="w-5 h-5 text-amber-600" />
                                <span>سجل الإخطارات القانونية والتكليف بالوفاء (المادة 20 - قانون الإيجارات الكويتي)</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                متابعة استلام الإخطارات وانقضاء مهلة الـ 20 يوماً القانونية قبل رفع دعوى الإخلاء وتسليم العين
                            </p>
                        </div>
                        <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0"
                            leftIcon={<PlusIcon className="w-4 h-4" />}
                            onClick={() => setIsCreateNoticeModalOpen(true)}
                        >
                            إصدار إخطار جديد
                        </Button>
                    </div>

                    {/* Interactive Legal Notification Tracker Card (سجل تفاعلي لمتابعة الإخطارات القانونية) */}
                    <Card className="p-5 space-y-4" title="سجل متابعة حالة الإخطارات والإشعار القانونية (Interactive Notice Tracker)">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">رقم الإشعار والنقاط</th>
                                        <th className="p-3 text-start">المستأجر والعين</th>
                                        <th className="p-3 text-start">الرقم المدني</th>
                                        <th className="p-3 text-start">تاريخ الإرسال وطريقة التسليم</th>
                                        <th className="p-3 text-start">المبلغ المستحق</th>
                                        <th className="p-3 text-center">حالة التسليم والمهلة</th>
                                        <th className="p-3 text-center">الإجراء السريع</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {legalNotices.map((notice) => (
                                        <tr key={notice.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3 font-mono font-bold">
                                                <p className="text-primary">{notice.noticeNumber}</p>
                                                <p className="text-[10px] text-slate-400">{notice.noticeType}</p>
                                            </td>
                                            <td className="p-3">
                                                <p className="font-bold text-slate-900 dark:text-white">{notice.tenantName}</p>
                                                <p className="text-[11px] text-slate-500">{notice.propertyUnit}</p>
                                            </td>
                                            <td className="p-3 font-mono text-slate-500">{notice.civilId}</td>
                                            <td className="p-3">
                                                <p className="font-mono text-slate-800 dark:text-slate-200 font-medium">{formatDateAr(notice.dispatchDate)}</p>
                                                <p className="text-[10px] text-slate-400">{notice.deliveryMethod}</p>
                                            </td>
                                            <td className="p-3 font-mono font-bold text-rose-600">
                                                {notice.amountDue && notice.amountDue > 0 ? formatKWD(notice.amountDue) : 'غير مالية'}
                                            </td>
                                            <td className="p-3 text-center">
                                                {notice.status === 'SENT' && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-block px-2.5 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 rounded-full font-bold text-[11px]">
                                                            مرسل (جاري التسليم)
                                                        </span>
                                                        <p className="text-[10px] text-slate-400 font-mono">متبقي {notice.graceDaysRemaining} يوماً</p>
                                                    </div>
                                                )}
                                                {notice.status === 'DELIVERED' && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full font-bold text-[11px]">
                                                            تم الاستلام ({formatDateAr(notice.deliveryDate || '')})
                                                        </span>
                                                        <p className="text-[10px] text-amber-600 font-mono font-bold">مهلة {notice.graceDaysRemaining} يوماً لرفع دعوى</p>
                                                    </div>
                                                )}
                                                {notice.status === 'GRACE_EXPIRED' && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-block px-2.5 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 rounded-full font-bold text-[11px]">
                                                            انقضت المهلة (20 يوماً)
                                                        </span>
                                                        <p className="text-[10px] text-rose-600 font-bold">جاهز لرفـع دعوى إخلاء</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-[11px] font-bold text-slate-700 dark:text-slate-200"
                                                    leftIcon={<ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-primary" />}
                                                    onClick={() => {
                                                        setSelectedNoticeForProof(notice);
                                                        setIsProofCertificateModalOpen(true);
                                                    }}
                                                >
                                                    استخراج شهادة بالتسليم
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Eviction Lawsuit Fee Calculator & Payment Order Tool (أداة حساب الرسوم القضائية ودعاوى الإخلاء) */}
                    <Card className="p-5 space-y-4" title="أداة حساب الرسوم القضائية ونموذج طلب أمر الأداء (Rental Disputes Fee Calculator & Payment Order)">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            {/* Inputs Column */}
                            <div className="space-y-3 md:col-span-1">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <BanknotesIcon className="w-4 h-4 text-[#00796B]" />
                                    حاسبة الرسوم القضائية لدعوى الإخلاء والمطالبة
                                </h4>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">قيمة الإيجار المتأخر المطالب به (د.ك):</label>
                                    <input 
                                        type="number" 
                                        value={calcOverdueRent} 
                                        onChange={e => setCalcOverdueRent(Math.max(0, Number(e.target.value)))}
                                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-right"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">قيمة الإيجار الشهري للعين (د.ك):</label>
                                    <input 
                                        type="number" 
                                        value={calcMonthlyRent} 
                                        onChange={e => setCalcMonthlyRent(Math.max(0, Number(e.target.value)))}
                                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-right"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    تُحسب الرسوم وفق قانون الرسوم القضائية الكويتي رقم 37/1979 وتعديلاته الخاصة بالنزاعات الإيجارية.
                                </p>
                            </div>

                            {/* Fee Breakdown Calculation Display */}
                            <div className="md:col-span-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                <h5 className="text-xs font-extrabold text-[#00796B]">تقدير الرسوم القضائية المطلوبة لرفع الدعوى أمام المحكمة الكلية:</h5>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] text-slate-400 font-bold block">الرسم النسبي (2.5%):</span>
                                        <span className="font-mono font-black text-slate-900 dark:text-white">{(calcOverdueRent * 0.025).toFixed(3)} د.ك</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] text-slate-400 font-bold block">رسم قيد ورسوم الدمغة:</span>
                                        <span className="font-mono font-black text-slate-900 dark:text-white">5.000 د.ك</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <span className="text-[10px] text-slate-400 font-bold block">أمانة الخبير والإعلان:</span>
                                        <span className="font-mono font-black text-slate-900 dark:text-white">30.000 د.ك</span>
                                    </div>
                                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                        <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold block">إجمالي الرسوم التقديرية:</span>
                                        <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                                            {((calcOverdueRent * 0.025) + 5 + 30).toFixed(3)} د.ك
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                                        💡 المهلة القانونية لإنذار الوفاء تنتهي بعد 20 يوماً من استلام الإشعار قبل القيد الرسمي.
                                    </span>
                                    <Button
                                        onClick={() => setIsPaymentOrderModalOpen(true)}
                                        className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-extrabold text-xs px-4 py-2 shrink-0"
                                        leftIcon={<PrinterIcon className="w-4 h-4"/>}
                                    >
                                        طباعة نموذج 'طلب أمر أداء' جاهز للتقديم 📝
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Court Lawsuits Table */}
                    <Card className="p-5 space-y-4" title="كشف قضايا الإيجارات المنظورة أمام المحكمة الكلية">
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="p-3 text-start">القضية والدائرة</th>
                                        <th className="p-3 text-start">المؤجر (المدعي)</th>
                                        <th className="p-3 text-start">المستأجر (المدعى عليه)</th>
                                        <th className="p-3 text-start">مبلغ المطالبة</th>
                                        <th className="p-3 text-start">موضوع الدعوى</th>
                                        <th className="p-3 text-start">الجلسة القادمة</th>
                                        <th className="p-3 text-start">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {MOCK_LEGAL_LAWSUITS.map((lawsuit, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            <td className="p-3">
                                                <p className="text-primary font-mono font-bold">{lawsuit.caseNumber}</p>
                                                <p className="text-[11px] text-slate-400">{lawsuit.circuit}</p>
                                            </td>
                                            <td className="p-3 font-medium">{lawsuit.plaintiff}</td>
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">{lawsuit.defendant}</td>
                                            <td className="p-3 font-mono font-bold text-rose-600">{formatKWD(lawsuit.claimAmount)}</td>
                                            <td className="p-3 text-slate-600 dark:text-slate-300">{lawsuit.subject}</td>
                                            <td className="p-3 font-mono text-amber-600 font-medium">{formatDateAr(lawsuit.sessionDate)}</td>
                                            <td className="p-3">
                                                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-full text-[11px] font-medium">
                                                    {lawsuit.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 7: CUSTOM REPORT BUILDER */}
            {activeTab === 'custom' && (
                <div className="space-y-6">
                    <Card className="p-5 space-y-4" title="منشئ التقارير المخصصة">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-3">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">الأعمدة المعروضة بالتقرير:</h4>
                            <div className="flex flex-wrap gap-2 text-xs">
                                {Object.keys(customReportCols).map(colKey => {
                                    const labels: Record<string, string> = {
                                        property: 'اسم العقار',
                                        unit: 'رقم العين/الوحدة',
                                        tenant: 'اسم المستأجر',
                                        civilId: 'الرقم المدني',
                                        rent: 'الإيجار المستحق',
                                        paid: 'المدفوع',
                                        arrears: 'المتأخرات',
                                        status: 'حالة السداد',
                                        receipt: 'رقم الإيصال',
                                        legalStatus: 'الموقف القانوني'
                                    };
                                    return (
                                        <label key={colKey} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer text-slate-700 dark:text-slate-200">
                                            <input 
                                                type="checkbox" 
                                                checked={customReportCols[colKey]}
                                                onChange={e => setCustomReportCols({ ...customReportCols, [colKey]: e.target.checked })}
                                                className="accent-primary rounded"
                                            />
                                            <span>{labels[colKey] || colKey}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="relative w-full sm:w-72">
                                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                                    <input 
                                        type="text" 
                                        placeholder="بحث داخل التقرير المخصص..."
                                        value={customSearchTerm}
                                        onChange={e => setCustomSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-3 py-1.5 text-xs outline-none focus:border-primary"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => addToast({ type: 'success', title: 'تم الحفظ', message: 'تم حفظ قالب التقرير المخصص بنجاح' })}>
                                        حفظ كقالب
                                    </Button>
                                    <Button size="sm" variant="primary" onClick={() => window.print()}>
                                        طباعة التقرير المخصص
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Custom Data Preview Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-xs text-start">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        {customReportCols.property && <th className="p-3 text-start">العقار</th>}
                                        {customReportCols.unit && <th className="p-3 text-start">الوحدة</th>}
                                        {customReportCols.tenant && <th className="p-3 text-start">المستأجر</th>}
                                        {customReportCols.civilId && <th className="p-3 text-start">الرقم المدني</th>}
                                        {customReportCols.rent && <th className="p-3 text-start">الإيجار</th>}
                                        {customReportCols.paid && <th className="p-3 text-start">المدفوع</th>}
                                        {customReportCols.arrears && <th className="p-3 text-start">المتأخرات</th>}
                                        {customReportCols.status && <th className="p-3 text-start">الحالة</th>}
                                        {customReportCols.receipt && <th className="p-3 text-start">رقم الإيصال</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {filteredCollections
                                        .filter(item => !customSearchTerm || item.tenantName.includes(customSearchTerm) || item.propertyName.includes(customSearchTerm))
                                        .map(item => (
                                            <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                                {customReportCols.property && <td className="p-3 font-bold text-slate-900 dark:text-white">{item.propertyName}</td>}
                                                {customReportCols.unit && <td className="p-3 font-mono text-primary">{item.unitNumber}</td>}
                                                {customReportCols.tenant && <td className="p-3 font-medium">{item.tenantName}</td>}
                                                {customReportCols.civilId && <td className="p-3 font-mono text-slate-500">{item.civilId}</td>}
                                                {customReportCols.rent && <td className="p-3 font-mono font-bold">{formatKWD(item.dueAmount)}</td>}
                                                {customReportCols.paid && <td className="p-3 font-mono font-bold text-emerald-600">{formatKWD(item.paidAmount)}</td>}
                                                {customReportCols.arrears && <td className="p-3 font-mono font-bold text-rose-600">{formatKWD(item.arrears)}</td>}
                                                {customReportCols.status && (
                                                    <td className="p-3">
                                                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                )}
                                                {customReportCols.receipt && <td className="p-3 font-mono text-slate-500">{item.receiptNumber}</td>}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* Print Preview Modal */}
            {isPrintModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white text-slate-900 w-full max-w-4xl rounded-2xl p-8 shadow-2xl border border-slate-200 my-8">
                        {/* Legal Letterhead Header */}
                        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</h2>
                                <p className="text-xs text-slate-600">منظومة عدالة للإدارة القانونية والمحافظ العقارية - دولة الكويت</p>
                            </div>
                            <div className="text-left">
                                <span className="text-xl font-black text-primary">عدالة ADALAH</span>
                                <p className="text-[10px] text-slate-500 font-mono">{new Date().toLocaleDateString('ar-KW')}</p>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center my-4">
                            <h3 className="text-base font-bold text-slate-900 underline underline-offset-4">{selectedReportTitleForPrint}</h3>
                            <p className="text-xs text-slate-500 mt-1">تاريخ الإصدار: {new Date().toLocaleDateString('ar-KW')} | العملة: دينار كويتي (KWD)</p>
                        </div>

                        {/* Printable Data Table */}
                        <div className="my-6 border border-slate-300 rounded-lg overflow-hidden text-xs">
                            <table className="w-full text-right border-collapse">
                                <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                                    <tr>
                                        <th className="p-2 border-l border-slate-300">العقار</th>
                                        <th className="p-2 border-l border-slate-300">الوحدة</th>
                                        <th className="p-2 border-l border-slate-300">المستأجر</th>
                                        <th className="p-2 border-l border-slate-300">الإيجار</th>
                                        <th className="p-2 border-l border-slate-300">المدفوع</th>
                                        <th className="p-2">المتأخرات</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredCollections.map(item => (
                                        <tr key={item.id}>
                                            <td className="p-2 border-l border-slate-200">{item.propertyName}</td>
                                            <td className="p-2 border-l border-slate-200">{item.unitNumber}</td>
                                            <td className="p-2 border-l border-slate-200">{item.tenantName}</td>
                                            <td className="p-2 border-l border-slate-200 font-mono">{formatKWD(item.dueAmount)}</td>
                                            <td className="p-2 border-l border-slate-200 font-mono">{formatKWD(item.paidAmount)}</td>
                                            <td className="p-2 font-mono font-bold text-rose-700">{formatKWD(item.arrears)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Signatures Footer */}
                        <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-xs text-slate-600">
                            <div>
                                <p>توقيع مدير المحفظة العقارية: .......................................</p>
                            </div>
                            <div>
                                <p>اعتماد المستشار القانوني: .......................................</p>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="mt-8 flex justify-end gap-3 print:hidden">
                            <Button variant="outline" size="sm" onClick={() => setIsPrintModalOpen(false)}>
                                إغلاق
                            </Button>
                            <Button variant="primary" size="sm" leftIcon={<PrinterIcon className="w-4 h-4"/>} onClick={() => window.print()}>
                                طباعة المستند الرسمية
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Legal Notice Modal (نافذة إصدار إخطار قانوني جديد) */}
            {isCreateNoticeModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <GavelIcon className="w-5 h-5 text-amber-600" />
                                <span>إصدار إخطار قانوني جديد / تكليف بالوفاء</span>
                            </h3>
                            <button 
                                onClick={() => setIsCreateNoticeModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!newNoticeForm.tenantName || !newNoticeForm.civilId) {
                                    addToast({ type: 'error', title: 'خطأ', message: 'يرجى إدخال اسم المستأجر والرقم المدني' });
                                    return;
                                }
                                const createdNotice: LegalNoticeRecord = {
                                    id: `NOT-2026-${String(legalNotices.length + 1).padStart(3, '0')}`,
                                    noticeNumber: `INF-${Math.floor(10000 + Math.random() * 90000)}/2026`,
                                    tenantName: newNoticeForm.tenantName,
                                    propertyUnit: newNoticeForm.propertyUnit,
                                    civilId: newNoticeForm.civilId,
                                    noticeType: newNoticeForm.noticeType,
                                    dispatchDate: new Date().toISOString().split('T')[0],
                                    deliveryMethod: newNoticeForm.deliveryMethod,
                                    status: 'SENT',
                                    graceDaysRemaining: 20,
                                    trackingNumber: `KW-POST-${Math.floor(1000000 + Math.random() * 9000000)}`,
                                    amountDue: newNoticeForm.amountDue ? Number(newNoticeForm.amountDue) : 0,
                                    legalClause: newNoticeForm.legalClause
                                };
                                setLegalNotices([createdNotice, ...legalNotices]);
                                setIsCreateNoticeModalOpen(false);
                                addToast({
                                    type: 'success',
                                    title: 'تم إصدار الإشعار بنجاح',
                                    message: `تم إرسال الإشعار رقم ${createdNotice.noticeNumber} وبدء احتساب مهلة الـ 20 يوماً`
                                });
                            }}
                            className="space-y-3 text-xs"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المستأجر (المدعى عليه):</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="مثال: بدر ناصر المطيري"
                                        value={newNoticeForm.tenantName}
                                        onChange={e => setNewNoticeForm({ ...newNoticeForm, tenantName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الرقم المدني للمستأجر:</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="12 رقم مدني كويتي"
                                        value={newNoticeForm.civilId}
                                        onChange={e => setNewNoticeForm({ ...newNoticeForm, civilId: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-primary font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">العقار والوحدة المعنية:</label>
                                    <select 
                                        value={newNoticeForm.propertyUnit}
                                        onChange={e => setNewNoticeForm({ ...newNoticeForm, propertyUnit: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-primary"
                                    >
                                        <option value="برج ناصر السكني - شقة 101">برج ناصر السكني - شقة 101</option>
                                        <option value="برج ناصر السكني - شقة 302">برج ناصر السكني - شقة 302</option>
                                        <option value="مجمع الفروانية التجاري - محل 12">مجمع الفروانية التجاري - محل 12</option>
                                        <option value="مجمع الفروانية التجاري - محل 14">مجمع الفروانية التجاري - محل 14</option>
                                        <option value="عمارة السالمية - شقة 11">عمارة السالمية - شقة 11</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">نوع الإخطار القانوني:</label>
                                    <select 
                                        value={newNoticeForm.noticeType}
                                        onChange={e => setNewNoticeForm({ ...newNoticeForm, noticeType: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-primary"
                                    >
                                        <option value="تكليف بالوفاء (المادة 20)">تكليف بالوفاء (المادة 20 قانون الإيجارات)</option>
                                        <option value="إخطار عدم رغبة بالتجديد">إخطار عدم رغبة بالتجديد</option>
                                        <option value="إنذار إنهاء عقد ومخالفات">إنذار إنهاء عقد بسبب مخالفة البنود</option>
                                        <option value="إشعار سداد متبقي الإيجار">إشعار تسوية ودية قبل اللجوء للقضاء</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">طريقة الإرسال والتسليم:</label>
                                    <select 
                                        value={newNoticeForm.deliveryMethod}
                                        onChange={e => setNewNoticeForm({ ...newNoticeForm, deliveryMethod: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-primary"
                                    >
                                        <option value="بريد مسجل بعلم الوصول (KPOST)">بريد الكويت المسجل بعلم الوصول (KPOST)</option>
                                        <option value="محضر محكمة الكلية">عن طريق محضر بالمحكمة الكلية (إعلان قضائي)</option>
                                        <option value="إشعار إلكتروني معتمد">إشعار إلكتروني حكومي معتمد</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المبلغ المطلوب سداده (د.ك):</label>
                                    <input 
                                        type="number" 
                                        placeholder="0.000"
                                        value={newNoticeForm.amountDue}
                                        onChange={e => setNewNoticeForm({ ...newNoticeForm, amountDue: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-primary font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">السند القانوني والملاحظات:</label>
                                <textarea 
                                    rows={2}
                                    value={newNoticeForm.legalClause}
                                    onChange={e => setNewNoticeForm({ ...newNoticeForm, legalClause: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 outline-none focus:border-primary"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateNoticeModalOpen(false)}>
                                    إلغاء
                                </Button>
                                <Button type="submit" variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700">
                                    تأكيد وإصدار الإشعار
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Proof Certificate Delivery Modal (نافذة استخراج شهادة بالتسليم) */}
            {isProofCertificateModalOpen && selectedNoticeForProof && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5">
                        {/* Legal Certificate Header */}
                        <div className="border-b-2 border-amber-600 pb-3 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ScaleIcon className="w-6 h-6 text-amber-600" />
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">شهادة إثبات تسليم إشعار قانوني / تكليف بالوفاء</h3>
                                    <p className="text-[10px] text-slate-500">منظومة عدالة للمحاماة والاستشارات العقارية - الكويت</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                {selectedNoticeForProof.noticeNumber}
                            </span>
                        </div>

                        {/* Certificate Main Text */}
                        <div className="space-y-3 text-xs leading-relaxed text-slate-800">
                            <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                                تشهد الدائرة القانونية بإدارة العقارات والمحافظ بأنه قد تم إرسال وإعلان التكليف بالوفاء الوارد بيان أدناه وفق الأحكام المقررة بالمادة (20) من قانون الإيجارات الكويتي رقم 35 لسنة 1978 وتعديلاته:
                            </p>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-2.5 bg-slate-100 rounded-lg">
                                    <span className="text-[10px] text-slate-500 block">المستأجر المعلَن إليه:</span>
                                    <strong className="text-slate-900">{selectedNoticeForProof.tenantName}</strong>
                                    <span className="block text-[10px] text-slate-500 font-mono">الرقم المدني: {selectedNoticeForProof.civilId}</span>
                                </div>

                                <div className="p-2.5 bg-slate-100 rounded-lg">
                                    <span className="text-[10px] text-slate-500 block">العين المؤجرة:</span>
                                    <strong className="text-slate-900">{selectedNoticeForProof.propertyUnit}</strong>
                                </div>

                                <div className="p-2.5 bg-slate-100 rounded-lg">
                                    <span className="text-[10px] text-slate-500 block">طريقة التسليم والإعلان:</span>
                                    <strong className="text-slate-900">{selectedNoticeForProof.deliveryMethod}</strong>
                                    <span className="block text-[10px] font-mono text-slate-600">رقم التتبع: {selectedNoticeForProof.trackingNumber}</span>
                                </div>

                                <div className="p-2.5 bg-slate-100 rounded-lg">
                                    <span className="text-[10px] text-slate-500 block">تاريخ الإرسال والتسليم:</span>
                                    <strong className="text-slate-900">{formatDateAr(selectedNoticeForProof.dispatchDate)}</strong>
                                    <span className="block text-[10px] text-emerald-700 font-bold">
                                        تاريخ التسليم: {selectedNoticeForProof.deliveryDate ? formatDateAr(selectedNoticeForProof.deliveryDate) : 'جاري المتابعة'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                                <p className="font-bold">الموقف القانوني المترتب على الإعلان:</p>
                                <p className="text-[11px] mt-0.5">
                                    {selectedNoticeForProof.status === 'GRACE_EXPIRED' 
                                        ? 'انقضت مهلة الـ 20 يوماً المقررة قانوناً دون سداد الأجرة المستحقة. يحق للمؤجر فوراً رفع دعوى إخلاء لعدم السداد وتسليم العين مع المطالبة بالمستحقات المالية أمام دائرة الإيجارات.'
                                        : `الإعلان ساري المفعول مع متبقي ${selectedNoticeForProof.graceDaysRemaining} يوماً على انقضاء المهلة القانونية قبل رفع دعوى الإخلاء.`
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Signatures & Seal */}
                        <div className="pt-4 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-600">
                            <div>
                                <p>خاتم الإشعار القانوني المعتمد:</p>
                                <div className="w-20 h-20 mt-1 border-2 border-dashed border-amber-600/40 rounded-full flex items-center justify-center text-[10px] text-amber-800 font-bold text-center p-1 bg-amber-50/50">
                                    ختم عدالة القانوني
                                </div>
                            </div>
                            <div className="text-left space-y-1">
                                <p>محرر الشهادة: المستشار صبري شطا</p>
                                <p className="font-mono text-[10px] text-slate-400">تاريخ الطباعة: {new Date().toLocaleDateString('ar-KW')}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsProofCertificateModalOpen(false)}>
                                إغلاق
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                leftIcon={<PrinterIcon className="w-4 h-4"/>} 
                                onClick={() => {
                                    window.print();
                                    addToast({ type: 'success', title: 'تمت الطباعة', message: 'تم طباعة شهادة إثبات تسليم الإشعار القانوني' });
                                }}
                            >
                                طباعة الشهادة الرسمية
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Maintenance Modal (نافذة إضافة سجل صيانة جديد) */}
            {isAddMaintModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <WrenchScrewdriverIcon className="w-5 h-5 text-primary" />
                                <span>إضافة سجل صيانة وملاحظة بنية تحتية جديد</span>
                            </h3>
                            <button onClick={() => setIsAddMaintModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const costVal = Number(newMaintForm.cost) || 0;
                            const baseVal = Number(newMaintForm.avgBaselineCost) || 180;
                            const varPct = Math.round(((costVal - baseVal) / baseVal) * 100);
                            const isHigh = varPct > 30;
                            const newItem = {
                                id: `MNT-${Math.floor(800 + Math.random() * 100)}`,
                                propertyName: newMaintForm.propertyName,
                                unitNumber: newMaintForm.unitNumber,
                                category: newMaintForm.category,
                                contractor: newMaintForm.contractor,
                                cost: costVal,
                                avgBaselineCost: baseVal,
                                variancePercent: varPct,
                                isHighCost: isHigh,
                                isInfrastructureAnamoly: newMaintForm.isInfrastructureAnamoly,
                                alertText: newMaintForm.isInfrastructureAnamoly 
                                    ? `🔴 تجاوز حرج (+${varPct}%) - خلل بالبنية التحتية`
                                    : isHigh ? `⚠️ تجاوز التكلفة الطبيعية (+${varPct}%)` : '✅ ضمن معدل التكلفة الطبيعي'
                            };
                            setMaintenanceLogsList([newItem, ...maintenanceLogsList]);
                            setIsAddMaintModalOpen(false);
                            addToast({ type: 'success', title: 'تمت الإضافة', message: `تم تسجيل صيانة ${newItem.unitNumber} بنجاح` });
                        }} className="space-y-3 text-xs">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم العقار:</label>
                                <input 
                                    type="text" required 
                                    value={newMaintForm.propertyName} 
                                    onChange={e => setNewMaintForm({ ...newMaintForm, propertyName: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رقم الوحدة/المصعد:</label>
                                    <input 
                                        type="text" required 
                                        value={newMaintForm.unitNumber} 
                                        onChange={e => setNewMaintForm({ ...newMaintForm, unitNumber: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">فئة الصيانة:</label>
                                    <input 
                                        type="text" required 
                                        value={newMaintForm.category} 
                                        onChange={e => setNewMaintForm({ ...newMaintForm, category: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المقاول/الشركة:</label>
                                    <input 
                                        type="text" required 
                                        value={newMaintForm.contractor} 
                                        onChange={e => setNewMaintForm({ ...newMaintForm, contractor: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">التكلفة الفعلية (د.ك):</label>
                                    <input 
                                        type="number" required 
                                        value={newMaintForm.cost} 
                                        onChange={e => setNewMaintForm({ ...newMaintForm, cost: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="infraCheck"
                                    checked={newMaintForm.isInfrastructureAnamoly}
                                    onChange={e => setNewMaintForm({ ...newMaintForm, isInfrastructureAnamoly: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded"
                                />
                                <label htmlFor="infraCheck" className="font-bold text-slate-800 dark:text-slate-200">
                                    تأكيد وجود خلل بالبنية التحتية (مصاعد / شبكة كهرباء / تسريبات)
                                </label>
                            </div>
                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMaintModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" variant="primary" size="sm">حفظ السجل</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Maintenance Details Modal */}
            {selectedMaintForView && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <EyeIcon className="w-5 h-5 text-sky-600" />
                                <span>تفاصيل كفاءة تكلفة الصيانة ({selectedMaintForView.id})</span>
                            </h3>
                            <button onClick={() => setSelectedMaintForView(null)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedMaintForView.propertyName}</p>
                                <p className="text-primary font-mono">{selectedMaintForView.unitNumber}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <span className="text-[10px] text-slate-400 block">فئة الصيانة والمقاول:</span>
                                    <strong className="text-slate-900 dark:text-white">{selectedMaintForView.category}</strong>
                                    <span className="block text-[10px] text-slate-500">{selectedMaintForView.contractor}</span>
                                </div>
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <span className="text-[10px] text-slate-400 block">التكلفة المرصودة:</span>
                                    <strong className="text-slate-900 dark:text-white font-mono">{formatKWD(selectedMaintForView.cost)}</strong>
                                    <span className="block text-[10px] text-slate-500 font-mono">المعدل الطبيعي: {formatKWD(selectedMaintForView.avgBaselineCost)}</span>
                                </div>
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl">
                                <p className="font-bold text-amber-900 dark:text-amber-300">تقييم الانحراف والخلل التشغيلي:</p>
                                <p className="mt-1 font-bold">{selectedMaintForView.alertText}</p>
                            </div>
                        </div>
                        <div className="pt-3 flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => setSelectedMaintForView(null)}>إغلاق</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Maintenance Modal */}
            {selectedMaintForEdit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <PencilIcon className="w-5 h-5 text-amber-600" />
                                <span>تعديل بيانات الصيانة ({selectedMaintForEdit.id})</span>
                            </h3>
                            <button onClick={() => setSelectedMaintForEdit(null)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setMaintenanceLogsList(prev => prev.map(m => m.id === selectedMaintForEdit.id ? selectedMaintForEdit : m));
                            setSelectedMaintForEdit(null);
                            addToast({ type: 'success', title: 'تم التحديث', message: `تم تحديث سجل الصيانة ${selectedMaintForEdit.id} بنجاح` });
                        }} className="space-y-3">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المقاول:</label>
                                <input 
                                    type="text" required 
                                    value={selectedMaintForEdit.contractor} 
                                    onChange={e => setSelectedMaintForEdit({ ...selectedMaintForEdit, contractor: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">التكلفة (د.ك):</label>
                                    <input 
                                        type="number" required 
                                        value={selectedMaintForEdit.cost} 
                                        onChange={e => setSelectedMaintForEdit({ ...selectedMaintForEdit, cost: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المعدل الطبيعي (د.ك):</label>
                                    <input 
                                        type="number" required 
                                        value={selectedMaintForEdit.avgBaselineCost} 
                                        onChange={e => setSelectedMaintForEdit({ ...selectedMaintForEdit, avgBaselineCost: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMaintForEdit(null)}>إلغاء</Button>
                                <Button type="submit" variant="primary" size="sm">حفظ التغييرات</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Tenant Risk Modal */}
            {selectedTenantForView && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <EyeIcon className="w-5 h-5 text-sky-600" />
                                <span>ملف تقييم مخاطر المستأجر القانوني</span>
                            </h3>
                            <button onClick={() => setSelectedTenantForView(null)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedTenantForView.tenantName}</p>
                                <p className="text-slate-500">{selectedTenantForView.propertyUnit}</p>
                                <p className="text-slate-400 font-mono text-[10px]">الرقم المدني: {selectedTenantForView.civilId} | هاتف: {selectedTenantForView.phone}</p>
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg space-y-1">
                                <p className="font-bold text-slate-800 dark:text-slate-200">سجل الانضباط بالسداد:</p>
                                <p className="text-slate-600 dark:text-slate-300">{selectedTenantForView.delinquencyFrequency}</p>
                                <p className="text-slate-500 text-[10px]">{selectedTenantForView.paymentPunctuality}</p>
                            </div>
                            <div className="p-3 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 rounded-xl">
                                <p className="font-bold text-sky-900 dark:text-sky-300">توصية المستشار القانوني:</p>
                                <p className="mt-1 font-bold">{selectedTenantForView.lawyerRecommendation}</p>
                            </div>
                        </div>
                        <div className="pt-3 flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => setSelectedTenantForView(null)}>إغلاق</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Tenant Risk Modal */}
            {selectedTenantForEdit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <PencilIcon className="w-5 h-5 text-amber-600" />
                                <span>تعديل مؤشر مخاطر المستأجر</span>
                            </h3>
                            <button onClick={() => setSelectedTenantForEdit(null)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setTenantsRiskList(prev => prev.map(t => t.id === selectedTenantForEdit.id ? selectedTenantForEdit : t));
                            setSelectedTenantForEdit(null);
                            addToast({ type: 'success', title: 'تم التحديث', message: `تم تحديث مؤشر المخاطر للمستأجر ${selectedTenantForEdit.tenantName} بنجاح` });
                        }} className="space-y-3">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المستأجر:</label>
                                <input 
                                    type="text" required 
                                    value={selectedTenantForEdit.tenantName} 
                                    onChange={e => setSelectedTenantForEdit({ ...selectedTenantForEdit, tenantName: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">مستوى المخاطر:</label>
                                    <select 
                                        value={selectedTenantForEdit.riskLevel}
                                        onChange={e => {
                                            const lvl = e.target.value as 'LOW' | 'MEDIUM' | 'HIGH';
                                            const badge = lvl === 'HIGH' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                                : lvl === 'MEDIUM' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
                                            setSelectedTenantForEdit({ ...selectedTenantForEdit, riskLevel: lvl, badgeClass: badge });
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                    >
                                        <option value="LOW">🟢 منخفض المخاطر</option>
                                        <option value="MEDIUM">🟡 متوسط المخاطر</option>
                                        <option value="HIGH">🔴 عالي المخاطر</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">درجة التقييم (من 100):</label>
                                    <input 
                                        type="number" min="0" max="100" required 
                                        value={selectedTenantForEdit.riskScore} 
                                        onChange={e => setSelectedTenantForEdit({ ...selectedTenantForEdit, riskScore: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">توصية المستشار القانوني:</label>
                                <textarea 
                                    rows={2} required
                                    value={selectedTenantForEdit.lawyerRecommendation} 
                                    onChange={e => setSelectedTenantForEdit({ ...selectedTenantForEdit, lawyerRecommendation: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTenantForEdit(null)}>إلغاء</Button>
                                <Button type="submit" variant="primary" size="sm">حفظ التعديلات</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Save Simulation Scenario Modal (نافذة حفظ سيناريو المحاكاة) */}
            {isSaveSimModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-primary" />
                                <span>حفظ سيناريو محاكاة العوائد الحالي</span>
                            </h3>
                            <button onClick={() => setIsSaveSimModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const newSim = {
                                id: `SIM-${Math.floor(100 + Math.random() * 900)}`,
                                name: newSimTitle || 'سيناريو محاكاة مخصص',
                                rentAdjustment: simRentAdjustment,
                                occupancyRate: simOccupancyRate,
                                projectedNOI: Math.round(simulatedYieldResults.totalSimNOI),
                                diffNOI: Math.round(simulatedYieldResults.totalDiffNOI),
                                createdAt: new Date().toISOString().split('T')[0]
                            };
                            setSavedSimulations([newSim, ...savedSimulations]);
                            setIsSaveSimModalOpen(false);
                            addToast({ type: 'success', title: 'تم الحفظ بنجاح', message: `تم حفظ سيناريو "${newSim.name}" برقم ${newSim.id}` });
                        }} className="space-y-3">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم/عنوان السيناريو:</label>
                                <input 
                                    type="text" required 
                                    value={newSimTitle} 
                                    onChange={e => setNewSimTitle(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-200 dark:border-slate-700 font-mono">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">تعديل قيمة الإيجار:</span>
                                    <strong className={simRentAdjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                        {simRentAdjustment >= 0 ? `+${simRentAdjustment}%` : `${simRentAdjustment}%`}
                                    </strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">نسبة الإشغال المتوقعة:</span>
                                    <strong className="text-sky-600">{simOccupancyRate}%</strong>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5">
                                    <span className="text-slate-700 dark:text-slate-300 font-sans font-bold">صافي الربح المتوقع (NOI):</span>
                                    <strong className="text-emerald-600 font-bold">{formatKWD(simulatedYieldResults.totalSimNOI)}</strong>
                                </div>
                            </div>
                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsSaveSimModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" variant="primary" size="sm">تأكيد وحفظ السيناريو</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Simulation Scenario Modal */}
            {selectedSimForView && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <EyeIcon className="w-5 h-5 text-sky-600" />
                                <span>تفاصيل السيناريو المحفوظ ({selectedSimForView.id})</span>
                            </h3>
                            <button onClick={() => setSelectedSimForView(null)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedSimForView.name}</p>
                                <p className="text-slate-400 font-mono text-[10px]">تاريخ الإنشاء: {formatDateAr(selectedSimForView.createdAt)}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 font-mono">
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <span className="text-[10px] text-slate-400 block font-sans">تغير الإيجار:</span>
                                    <strong className={selectedSimForView.rentAdjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                        {selectedSimForView.rentAdjustment >= 0 ? `+${selectedSimForView.rentAdjustment}%` : `${selectedSimForView.rentAdjustment}%`}
                                    </strong>
                                </div>
                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                    <span className="text-[10px] text-slate-400 block font-sans">نسبة الإشغال:</span>
                                    <strong className="text-sky-600">{selectedSimForView.occupancyRate}%</strong>
                                </div>
                            </div>
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl font-mono">
                                <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-sans font-bold">الأثر المالي وصافي الدخل (NOI):</span>
                                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                                    {formatKWD(selectedSimForView.projectedNOI)} ({selectedSimForView.diffNOI >= 0 ? '+' : ''}{formatKWD(selectedSimForView.diffNOI)})
                                </p>
                            </div>
                        </div>
                        <div className="pt-3 flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedSimForView(null)}>إغلاق</Button>
                            <Button variant="primary" size="sm" onClick={() => {
                                setSimRentAdjustment(selectedSimForView.rentAdjustment);
                                setSimOccupancyRate(selectedSimForView.occupancyRate);
                                setSelectedSimForView(null);
                                addToast({ type: 'success', title: 'تم تطبيق السيناريو', message: `تم تطبيق قيم سيناريو ${selectedSimForView.name} على المحاكي` });
                            }}>تطبيق على المخطط</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Simulation Scenario Modal */}
            {selectedSimForEdit && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <PencilIcon className="w-5 h-5 text-amber-600" />
                                <span>تعديل السيناريو المحفوظ ({selectedSimForEdit.id})</span>
                            </h3>
                            <button onClick={() => setSelectedSimForEdit(null)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            setSavedSimulations(prev => prev.map(s => s.id === selectedSimForEdit.id ? selectedSimForEdit : s));
                            setSelectedSimForEdit(null);
                            addToast({ type: 'success', title: 'تم التحديث', message: `تم تحديث بيانات السيناريو بنجاح` });
                        }} className="space-y-3">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم السيناريو:</label>
                                <input 
                                    type="text" required 
                                    value={selectedSimForEdit.name} 
                                    onChange={e => setSelectedSimForEdit({ ...selectedSimForEdit, name: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">نسبة تغير الإيجار (%):</label>
                                    <input 
                                        type="number" required 
                                        value={selectedSimForEdit.rentAdjustment} 
                                        onChange={e => setSelectedSimForEdit({ ...selectedSimForEdit, rentAdjustment: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">نسبة الإشغال (%):</label>
                                    <input 
                                        type="number" min="0" max="100" required 
                                        value={selectedSimForEdit.occupancyRate} 
                                        onChange={e => setSelectedSimForEdit({ ...selectedSimForEdit, occupancyRate: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedSimForEdit(null)}>إلغاء</Button>
                                <Button type="submit" variant="primary" size="sm">حفظ التغييرات</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add New Tenant Risk Modal (نافذة إضافة تقييم مخاطر مستأجر جديد) */}
            {isAddTenantRiskModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <GavelIcon className="w-5 h-5 text-amber-600" />
                                <span>إضافة تقييم مخاطر مستأجر جديد للمنظومة</span>
                            </h3>
                            <button onClick={() => setIsAddTenantRiskModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const badge = newTenantRiskForm.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                : newTenantRiskForm.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
                            const newTenantItem = {
                                id: `TNK-${Math.floor(200 + Math.random() * 800)}`,
                                ...newTenantRiskForm,
                                badgeClass: badge
                            };
                            setTenantsRiskList([newTenantItem, ...tenantsRiskList]);
                            setIsAddTenantRiskModalOpen(false);
                            addToast({ type: 'success', title: 'تمت الإضافة', message: `تمت إضافة تقييم المستأجر ${newTenantItem.tenantName} بنجاح` });
                        }} className="space-y-3">
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المستأجر:</label>
                                <input 
                                    type="text" required 
                                    value={newTenantRiskForm.tenantName} 
                                    onChange={e => setNewTenantRiskForm({ ...newTenantRiskForm, tenantName: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">العقار والوحدة:</label>
                                    <input 
                                        type="text" required 
                                        value={newTenantRiskForm.propertyUnit} 
                                        onChange={e => setNewTenantRiskForm({ ...newTenantRiskForm, propertyUnit: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الرقم المدني:</label>
                                    <input 
                                        type="text" required 
                                        value={newTenantRiskForm.civilId} 
                                        onChange={e => setNewTenantRiskForm({ ...newTenantRiskForm, civilId: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">مستوى المخاطر:</label>
                                    <select 
                                        value={newTenantRiskForm.riskLevel}
                                        onChange={e => setNewTenantRiskForm({ ...newTenantRiskForm, riskLevel: e.target.value as any })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                    >
                                        <option value="LOW">🟢 منخفض المخاطر</option>
                                        <option value="MEDIUM">🟡 متوسط المخاطر</option>
                                        <option value="HIGH">🔴 عالي المخاطر</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">درجة التقييم (من 100):</label>
                                    <input 
                                        type="number" min="0" max="100" required 
                                        value={newTenantRiskForm.riskScore} 
                                        onChange={e => setNewTenantRiskForm({ ...newTenantRiskForm, riskScore: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">سجل السداد والانضباط:</label>
                                <input 
                                    type="text" required 
                                    value={newTenantRiskForm.delinquencyFrequency} 
                                    onChange={e => setNewTenantRiskForm({ ...newTenantRiskForm, delinquencyFrequency: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">توصية المستشار القانوني:</label>
                                <textarea 
                                    rows={2} required 
                                    value={newTenantRiskForm.lawyerRecommendation} 
                                    onChange={e => setNewTenantRiskForm({ ...newTenantRiskForm, lawyerRecommendation: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2"
                                />
                            </div>
                            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTenantRiskModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-700">تأكيد وإضافة التقييم</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Field Property Inspection Report (تقرير تفتيش العقار الميداني) */}
            {isInspectionModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs text-right" dir="rtl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <ClipboardDocumentCheckIcon className="w-5 h-5 text-[#00796B]" />
                                <span>إضافة تقرير معاينة وتفتيش ميداني للعين العقارية</span>
                            </h3>
                            <button onClick={() => setIsInspectionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const newInspRecord = {
                                id: `INSP-2026-00${inspectionReportsList.length + 1}`,
                                ...newInspectionForm,
                                inspectionDate: new Date().toISOString().split('T')[0],
                                linkedToCostEfficiency: true
                            };
                            setInspectionReportsList([newInspRecord, ...inspectionReportsList]);

                            // Automatically link to operational cost benchmark if repair cost > 0
                            if (newInspectionForm.estimatedCost > 0) {
                                const newMaintBench = {
                                    id: `MNT-EFF-00${maintenanceLogsList.length + 1}`,
                                    propertyName: newInspectionForm.propertyName,
                                    unitNumber: newInspectionForm.unitNumber,
                                    category: 'معاينة ميدانية وصيانة إنشائية',
                                    contractor: 'قسم الهندسة المعمارية بالمكتب',
                                    cost: newInspectionForm.estimatedCost,
                                    avgBaselineCost: Math.round(newInspectionForm.estimatedCost * 0.75),
                                    variancePercent: 25,
                                    isHighCost: newInspectionForm.structuralCondition === 'يحتاج صيانة',
                                    isInfrastructureAnamoly: newInspectionForm.structuralCondition === 'متضرر',
                                    alertText: `تقرير معاينة: حالة البناء (${newInspectionForm.structuralCondition})`
                                };
                                setMaintenanceLogsList(prev => [newMaintBench, ...prev]);
                            }

                            setIsInspectionModalOpen(false);
                            addToast({ type: 'success', title: 'تم التوثيق والربط الآلي', message: 'تم حفظ تقرير المعاينة الميدانية وربطه بتقرير كفاءة التكاليف التشغيلية.' });
                        }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم العقار:</label>
                                    <input 
                                        type="text" required 
                                        value={newInspectionForm.propertyName} 
                                        onChange={e => setNewInspectionForm({ ...newInspectionForm, propertyName: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">رقم العين / الوحدة:</label>
                                    <input 
                                        type="text" required 
                                        value={newInspectionForm.unitNumber} 
                                        onChange={e => setNewInspectionForm({ ...newInspectionForm, unitNumber: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">تقييم الحالة الإنشائية:</label>
                                    <select 
                                        value={newInspectionForm.structuralCondition}
                                        onChange={e => setNewInspectionForm({ ...newInspectionForm, structuralCondition: e.target.value as any })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                                    >
                                        <option value="ممتاز">🟢 ممتاز (بدون ملاحظات)</option>
                                        <option value="جيد">🔵 جيد (ملاحظات بسيطة)</option>
                                        <option value="يحتاج صيانة">🟡 يحتاج صيانة (تكييف/سباكة)</option>
                                        <option value="متضرر">🔴 متضرر (خلل إنشائي جسيم)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">التكلفة التقديرية للإصلاح (د.ك):</label>
                                    <input 
                                        type="number" 
                                        value={newInspectionForm.estimatedCost} 
                                        onChange={e => setNewInspectionForm({ ...newInspectionForm, estimatedCost: Number(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">اسم المحامي المعاين:</label>
                                <input 
                                    type="text" required 
                                    value={newInspectionForm.inspectorLawyer} 
                                    onChange={e => setNewInspectionForm({ ...newInspectionForm, inspectorLawyer: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-bold"
                                />
                            </div>

                            <div>
                                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ملاحظات المحامي الميدانية:</label>
                                <textarea 
                                    rows={3} required 
                                    value={newInspectionForm.lawyerNotes} 
                                    onChange={e => setNewInspectionForm({ ...newInspectionForm, lawyerNotes: e.target.value })}
                                    placeholder="اكتب الملاحظات والتسريبات والتلفيات المرصودة..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold"
                                />
                            </div>

                            {/* Camera Integration Upload Simulation */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2 text-center">
                                <p className="font-black text-[#00796B] text-xs">📷 التقاط صور مباشرة من الكاميرا / المعرض:</p>
                                <div className="flex justify-center gap-3">
                                    <Button 
                                        type="button" 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => {
                                            const demoPhotos = [
                                                'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
                                                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400'
                                            ];
                                            setNewInspectionForm(prev => ({ ...prev, photos: demoPhotos }));
                                            addToast({ type: 'success', title: 'تم التقاط الصورة', message: 'تم إرفاق صلب المعاينة بنجاح.' });
                                        }}
                                        className="rounded-xl font-bold border-slate-300"
                                    >
                                        تشغيل الكاميرا المباشرة 📸
                                    </Button>
                                </div>
                                {newInspectionForm.photos.length > 0 && (
                                    <div className="flex justify-center gap-2 pt-2">
                                        {newInspectionForm.photos.map((pUrl, pIdx) => (
                                            <img key={pIdx} src={pUrl} alt="معاينة" className="w-12 h-10 object-cover rounded-lg border border-slate-300 shadow-sm" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                                <Button type="button" variant="outline" size="sm" onClick={() => setIsInspectionModalOpen(false)}>إلغاء</Button>
                                <Button type="submit" variant="primary" size="sm" className="bg-[#00796B] hover:bg-[#004D40] text-white font-extrabold px-5">
                                    حفظ وتوثيق بتقرير كفاءة التكاليف 💾
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Payment Order Request Official Printable Document (نموذج طلب أمر أداء) */}
            {isPaymentOrderModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white text-slate-900 w-full max-w-3xl rounded-3xl p-8 shadow-2xl border border-slate-200 my-8 text-right font-sans" dir="rtl">
                        {/* Printable Court Header */}
                        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">مكتب المحامي صبري شطا</h2>
                                <p className="text-xs font-bold text-[#00796B]">للمحاماة والاستشارات القانونية والتحكيم - دولة الكويت</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-1">المرجع القضائي: ORD-{Math.floor(100000 + Math.random() * 800000)}/2026</p>
                            </div>
                            <div className="text-left font-mono text-xs font-bold text-slate-600">
                                <div>إلى: رئيس محكمة الإيجارات الكلية</div>
                                <div>محكمة العاصمة - دولة الكويت</div>
                                <div className="text-[#00796B] font-black mt-1">صحيفة طلب أمر أداء إيجاري</div>
                            </div>
                        </div>

                        {/* Document Title */}
                        <div className="text-center my-4 space-y-1">
                            <h3 className="text-lg font-black text-slate-900 underline underline-offset-8">
                                صحيفة طلب أمر أداء وتكليف بالوفاء إيجاري (المادة 161 مرافعات والمادة 20 إيجارات)
                            </h3>
                            <p className="text-xs font-bold text-slate-600">
                                صادر بناءً على عقد الإيجار المحرر والمؤرخ، وإشعار التكليف بالوفاء المعلن رسمياً
                            </p>
                        </div>

                        {/* Parties & Dispute Details Grid */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs my-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">الطالب (المؤجر/الموكل):</span>
                                    <span className="font-extrabold text-slate-900">شركة الأنصار العقارية (بموجب وكالة رسمية)</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block">المطلوب ضد (المستأجر):</span>
                                    <span className="font-extrabold text-slate-900">{paymentOrderTenant.tenantName}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 font-mono">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block font-sans">الرقم المدني:</span>
                                    <span className="font-bold text-slate-800">{paymentOrderTenant.civilId}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block font-sans">العقار والوحدة:</span>
                                    <span className="font-bold text-slate-800">{paymentOrderTenant.propertyName} - {paymentOrderTenant.unitNumber}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold block font-sans">رقم الآلي (PACI):</span>
                                    <span className="font-bold text-slate-800">{paymentOrderTenant.paciNumber}</span>
                                </div>
                            </div>
                        </div>

                        {/* Financial Claim & Court Fees Breakdown */}
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs my-4">
                            <h4 className="font-black text-emerald-900 text-xs">بيان المبالغ والرسوم القضائية المطالب بصدور أمر أداء بها:</h4>
                            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                                <div>أصل الدين المتأخر: <strong className="text-rose-700">{calcOverdueRent.toLocaleString()} د.ك</strong></div>
                                <div>الرسم القضائي النسبي (2.5%): <strong>{(calcOverdueRent * 0.025).toFixed(3)} د.ك</strong></div>
                                <div>إجمالي المطلوب بأمر الأداء: <strong className="text-emerald-800 font-black text-xs">{(calcOverdueRent + (calcOverdueRent * 0.025) + 35).toFixed(3)} د.ك</strong></div>
                            </div>
                        </div>

                        {/* Legal Grounds Body */}
                        <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2 text-xs my-4 leading-relaxed font-medium">
                            <h4 className="font-black text-amber-900 text-xs">الوقائع والأسيد القانونية:</h4>
                            <p>
                                بوجب عقد إيجار رسمي استأجر المتبوع ضده العين المبينة أعلاه، وحيث إنه امتنع عن سداد أجرة الأشهر المستحقة رغم إنذاره رسمياً بانقضاء المهلة (20 يوماً)، وحيث إن الدين ثابت بالكتابة وحال الأداء ومعين المقدار، فإن الطالب يلتمس صدور أمر أداء بإلزام المشكو ضده بأن يؤدي للطالب المبالغ المذكورة مع المصاريف والأتعاب.
                            </p>
                        </div>

                        {/* Footer & Signatures */}
                        <div className="pt-6 border-t border-slate-300 flex justify-between items-center text-xs font-bold text-slate-700">
                            <div>
                                <p>وكيل الطالب: المحامي صبري شطا</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">التوقيع والختم الرسمي للمكتب</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsPaymentOrderModalOpen(false)} className="rounded-xl font-bold">
                                    إغلاق
                                </Button>
                                <Button 
                                    onClick={() => {
                                        window.print();
                                        addToast({ type: 'success', title: 'تمت الطباعة', message: 'تم إرسال صحيفة أمر الأداء للطباعة.' });
                                    }}
                                    className="bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-black text-xs px-5"
                                >
                                    طباعة طلب أمر الأداء 🖨️
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertySpecificReportsPage;
