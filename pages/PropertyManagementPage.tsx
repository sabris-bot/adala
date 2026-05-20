import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import TextArea from '../components/ui/TextArea';
import { 
    BuildingOffice2Icon, PlusCircleIcon, EyeIcon, PencilIcon, 
    FolderIcon, DocumentTextIcon,
    ReceiptPercentIcon, WrenchScrewdriverIcon, 
    PresentationChartLineIcon, HomeIcon, CheckCircleIcon,
    ExclamationTriangleIcon, BellAlertIcon, TrashIcon,
    DocumentDuplicateIcon, BanknotesIcon, ScaleIcon,
    ArrowPathIcon, LinkIcon, PrinterIcon,
    MapPinIcon, UsersIcon, ShieldCheckIcon, CalendarDaysIcon,
    SparklesIcon, ChartBarIcon, TrendingUpIcon,
    ArrowUpRightIcon, Square3Stack3DIcon, XMarkIcon, ListBulletIcon
} from '../constants';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Property, Tenant, LeaseAgreement, RentPaymentStatus,
    PropertyUnitStatus, LeaseAgreementStatus, 
    EvictionNoticeRecord, PropertyType, PropertyCategoryKuwait, PropertyUnit,
    RentPaymentFrequency, LeaseTermType, PropertyUnitTypeKuwait,
    RentPayment, PaymentMethod
} from '../types';
import { 
    LeaseAgreementStatusBadge, PropertyUnitStatusBadge, RentPaymentStatusBadge
} from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { 
    propertyTypeOptions, propertyCategoryKuwaitOptions, propertyUnitTypeKuwaitOptions,
    leaseAgreementStatusOptions, rentPaymentFrequencyOptions, leaseTermTypeOptions, 
    propertyUnitStatusOptions 
} from '../constants';

// Load shared mock details initially
import { 
  mockTenants as initialTenants, 
  mockProperties as initialProperties, 
  mockLeaseAgreements as initialLeases, 
  mockRentPayments as initialPayments, 
  mockEvictionNotices as initialNotices 
} from '../data/propertyData';

// Load our bilingual translation mapping
import { propertyTranslations } from '../data/propertyTranslations';

// Helpers for currency and dates (customizable for bilingual reading)
const formatCurrency = (amount?: number, lang: 'ar' | 'en' = 'ar') => {
  if (amount === undefined) return '-';
  return lang === 'ar' ? `${amount.toFixed(3)} د.ك` : `${amount.toFixed(3)} KWD`;
};

const formatDate = (dateStr?: string, lang: 'ar' | 'en' = 'ar') => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return lang === 'ar' 
    ? date.toLocaleDateString('ar-KW', { year: 'numeric', month: 'short', day: 'numeric' })
    : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const PropertyManagementPage: React.FC = () => {
    const { i18n } = useTranslation();
    const { addToast } = useToast();
    
    // Check global language and keep state
    const [pageLang, setPageLang] = useState<'ar' | 'en'>('ar');
    useEffect(() => {
        if (i18n?.language === 'en') {
            setPageLang('en');
        } else {
            setPageLang('ar');
        }
    }, [i18n?.language]);

    // Active Tab Navigation
    const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'tenants' | 'leases' | 'payments' | 'notices'>('overview');
    
    // Layout Display Modes: 'cards' | 'table' | 'map' | 'timeline'
    const [displayMode, setDisplayMode] = useState<'cards' | 'table' | 'map' | 'timeline'>('cards');
    
    // Core Reactive States (Full CRUD operations write directly to state)
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
    const [leases, setLeases] = useState<LeaseAgreement[]>(initialLeases);
    const [payments, setPayments] = useState<RentPayment[]>(initialPayments);
    const [notices, setNotices] = useState<EvictionNoticeRecord[]>(initialNotices);

    // Filter and Search states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Advanced Profile Drawer
    const [selectedProfile, setSelectedProfile] = useState<{
        type: 'property' | 'tenant' | 'lease' | 'payment';
        data: any;
    } | null>(null);

    // Modal Trigger States
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
    const [editingLease, setEditingLease] = useState<LeaseAgreement | null>(null);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<RentPayment | null>(null);

    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<EvictionNoticeRecord | null>(null);

    const [isCaseLinkModalOpen, setIsCaseLinkModalOpen] = useState(false);
    const [linkingTargetId, setLinkingTargetId] = useState<string | null>(null);
    const [mockCourtCaseNum, setMockCourtCaseNum] = useState('');

    // Active language translations provider
    const t = useMemo(() => propertyTranslations[pageLang], [pageLang]);

    // Precomputed Metrics & Totals
    const stats = useMemo(() => {
        const totalProps = properties.length;
        const totalUnits = properties.reduce((acc, p) => acc + (p.units?.length || 0), 0);
        const rentedUnits = properties.reduce((acc, p) => acc + (p.units?.filter(u => u.status === PropertyUnitStatus.RENTED).length || 0), 0);
        const vacantUnits = totalUnits - rentedUnits;
        const occupancy = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;
        
        // Sum rents
        const actualCollected = payments
            .filter(p => p.status === RentPaymentStatus.PAID)
            .reduce((sum, p) => sum + p.amountPaid, 0);

        const expectedMonthly = leases
            .filter(l => l.status === LeaseAgreementStatus.ACTIVE)
            .reduce((sum, l) => sum + l.rentAmount, 0);

        const overdueTotal = payments
            .filter(p => p.status === RentPaymentStatus.OVERDUE)
            .reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

        return { totalProps, totalUnits, rentedUnits, vacantUnits, occupancy, actualCollected, expectedMonthly, overdueTotal };
    }, [properties, leases, payments]);

    // Filters Implementation
    const filteredProperties = useMemo(() => {
        return properties.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 p.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (p.paciNumber && p.paciNumber.includes(searchTerm));
            const matchesDistrict = selectedDistrict === 'all' || p.address.toLowerCase().includes(selectedDistrict.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || p.propertyCategory === selectedCategory;
            return matchesSearch && matchesDistrict && matchesCategory;
        });
    }, [properties, searchTerm, selectedDistrict, selectedCategory]);

    const filteredTenants = useMemo(() => {
        return tenants.filter(t => {
            return t.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   t.phone.includes(searchTerm) || 
                   t.civilIdOrPassport.includes(searchTerm);
        });
    }, [tenants, searchTerm]);

    const filteredLeases = useMemo(() => {
        return leases.filter(l => {
            const tenant = tenants.find(t => t.id === l.tenantId);
            const prop = properties.find(p => p.id === l.propertyId);
            return (tenant?.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    prop?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    l.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        });
    }, [leases, tenants, properties, searchTerm]);

    // Smart Trigger Compliance Reminders
    const alertsList = useMemo(() => {
        const list: { id: string; type: 'expiry' | 'overdue' | 'inspection' | 'paci'; text: string; sub: string; actionText?: string; data?: any }[] = [];
        const today = new Date();

        // 1. Contracts nearing expiry in 60 days
        leases.forEach(l => {
            if (l.status === LeaseAgreementStatus.ACTIVE) {
                const end = new Date(l.endDate);
                const diffTime = end.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays > 0 && diffDays <= 60) {
                    const tenant = tenants.find(t => t.id === l.tenantId);
                    const prop = properties.find(p => p.id === l.propertyId);
                    const titleAr = `عقد ${tenant?.fullNameAr || 'المستأجر'} ينتهي خلال ${diffDays} يوم`;
                    const titleEn = `Contract for ${tenant?.fullNameAr || 'Tenant'} expires in ${diffDays} days`;
                    const subAr = `عقار: ${prop?.name || 'مبنى'} - رقم العقد: ${l.contractNumber}`;
                    const subEn = `Property: ${prop?.name || 'Asset'} - Ref: ${l.contractNumber}`;
                    list.push({
                        id: `alt-exp-${l.id}`,
                        type: 'expiry',
                        text: pageLang === 'ar' ? titleAr : titleEn,
                        sub: pageLang === 'ar' ? subAr : subEn,
                        actionText: pageLang === 'ar' ? 'تجديد العقد' : 'Renew Lease',
                        data: l
                    });
                }
            }
        });

        // 2. Overdue payments > 5 days delay
        payments.forEach(p => {
            if (p.status === RentPaymentStatus.OVERDUE) {
                const lease = leases.find(l => l.id === p.leaseAgreementId);
                const tenant = tenants.find(t => t.id === lease?.tenantId);
                const titleAr = `أجرة إيجارية متأخرة المستأجر / ${tenant?.fullNameAr || 'المستأجر'}`;
                const titleEn = `Overdue rent installment for ${tenant?.fullNameAr || 'Tenant'}`;
                const subAr = `المبلغ: ${payAmount(p.amountDue - p.amountPaid)} - فترة: ${p.paymentForPeriod}`;
                const subEn = `Amount: ${payAmount(p.amountDue - p.amountPaid)} - Period: ${p.paymentForPeriod}`;
                list.push({
                    id: `alt-pay-${p.id}`,
                    type: 'overdue',
                    text: pageLang === 'ar' ? titleAr : titleEn,
                    sub: pageLang === 'ar' ? subAr : subEn,
                    actionText: pageLang === 'ar' ? 'تسجيل إيصال' : 'Register Payment',
                    data: p
                });
            }
        });

        // 3. Inspections / Scheduled maintenance
        list.push({
            id: 'alt-maint-1',
            type: 'inspection',
            text: pageLang === 'ar' ? 'صيانة المصاعد الوقائية السنوية مجدولة' : 'Annual preventative elevator maintenance scheduled',
            sub: pageLang === 'ar' ? 'برج ناصر السكني الفاخر - السبت صباحاً' : 'Nasser Luxury Residential Tower - Saturday Morning',
        });

        // 4. Missing or Expired Civil documentation (PACI)
        properties.forEach(p => {
            if (!p.paciNumber) {
                const titleAr = `الرقم الآلي (PACI) غير مسجل لعقار ${p.name}`;
                const titleEn = `PACI Civil ID number missing for ${p.name}`;
                list.push({
                    id: `alt-paci-${p.id}`,
                    type: 'paci',
                    text: pageLang === 'ar' ? titleAr : titleEn,
                    sub: pageLang === 'ar' ? 'مطلوب للمطالبات القضائية وتسجيل عقود البلدية' : 'Required for Kuwait municipality commercial contracts and litigations',
                    actionText: pageLang === 'ar' ? 'تعديل العقار' : 'Edit Asset',
                    data: p
                });
            }
        });

        return list;
    }, [leases, tenants, properties, payments, pageLang]);

    function payAmount(val: number) {
        return formatCurrency(val, pageLang);
    }

    // Interactive MAP Districts simulation coordinates and stats
    const mapDistricts = [
        { key: 'kuwaitCity', title: t.kuwaitCity, x: '45%', y: '30%', count: 1, occupancy: '100%', category: 'Commercial' },
        { key: 'salmiya', title: t.salmiya, x: '55%', y: '48%', count: 2, occupancy: '75%', category: 'Investment' },
        { key: 'hawally', title: t.hawally, x: '35%', y: '50%', count: 1, occupancy: '100%', category: 'Investment' },
        { key: 'surra', title: t.surra, x: '18%', y: '62%', count: 1, occupancy: '100%', category: 'Private Housing' },
        { key: 'shuwaikh', title: t.shuwaikh, x: '15%', y: '35%', count: 1, occupancy: '66%', category: 'Industrial' },
        { key: 'alrai', title: t.alrai, x: '10%', y: '52%', count: 0, occupancy: '0%', category: 'Industrial Logistics' }
    ];

    // Chart mock data
    const chartRevenue = [
        { month: 'Jan', collected: 5400, expected: 6000 },
        { month: 'Feb', collected: 5800, expected: 6000 },
        { month: 'Mar', collected: 6200, expected: 6500 },
        { month: 'Apr', collected: 6100, expected: 6500 },
        { month: 'May', collected: stats.actualCollected || 6700, expected: stats.expectedMonthly || 7200 }
    ];

    const chartUnitsObj = [
        { name: t.rentedUnits, value: stats.rentedUnits, color: '#0ea5e9' },
        { name: t.vacantUnits, value: stats.vacantUnits, color: '#f43f5e' }
    ];

    // CRUD Event handlers
    const handleSaveProperty = (prop: Property) => {
        if (editingProperty?.id) {
            setProperties(prev => prev.map(p => p.id === editingProperty.id ? prop : p));
            addToast({ type: 'success', title: pageLang === 'ar' ? 'تعديل ناجح' : 'Asset Adjusted', message: t.saveSuccess });
        } else {
            const added = { ...prop, id: `prop-${Date.now()}` };
            setProperties(prev => [added, ...prev]);
            addToast({ type: 'success', title: pageLang === 'ar' ? 'إضافة ناجحة' : 'Asset Provisioned', message: t.saveSuccess });
        }
        setIsPropertyModalOpen(false);
    };

    const handleDeleteProperty = (id: string) => {
        if (window.confirm(t.confirmDeleteProperty)) {
            setProperties(prev => prev.filter(p => p.id !== id));
            addToast({ type: 'success', title: pageLang === 'ar' ? 'حذف ناجح' : 'Asset Purged', message: t.deleteSuccess });
        }
    };

    const handleSaveTenant = (ten: Tenant) => {
        if (editingTenant?.id) {
            setTenants(prev => prev.map(t => t.id === editingTenant.id ? ten : t));
            addToast({ type: 'success', title: pageLang === 'ar' ? 'تحديث المستأجر' : 'Tenant Updated', message: t.saveSuccess });
        } else {
            const added = { ...ten, id: `t-${Date.now()}` };
            setTenants(prev => [added, ...prev]);
            addToast({ type: 'success', title: pageLang === 'ar' ? 'إضافة مستأجر' : 'Tenant Added', message: t.saveSuccess });
        }
        setIsTenantModalOpen(false);
    };

    const handleDeleteTenant = (id: string) => {
        if (window.confirm(t.confirmDeleteTenant)) {
            setTenants(prev => prev.filter(t => t.id !== id));
            addToast({ type: 'info', title: pageLang === 'ar' ? 'إزالة المستأجر' : 'Tenant Removed', message: t.deleteSuccess });
        }
    };

    const handleSaveLease = (lease: LeaseAgreement) => {
        if (editingLease?.id) {
            setLeases(prev => prev.map(l => l.id === editingLease.id ? lease : l));
        } else {
            const added = { ...lease, id: `lse-${Date.now()}` };
            setLeases(prev => [added, ...prev]);
            // update unit status in property
            const prop = properties.find(p => p.id === lease.propertyId);
            if (prop && lease.unitId) {
                const updatedUnits = prop.units?.map(u => u.id === lease.unitId ? { ...u, status: PropertyUnitStatus.RENTED } : u);
                setProperties(prev => prev.map(p => p.id === prop.id ? { ...p, units: updatedUnits } : p));
            }
        }
        setIsLeaseModalOpen(false);
        addToast({ type: 'success', title: 'عقد جديد', message: t.saveSuccess });
    };

    const handleDeleteLease = (id: string) => {
        if (window.confirm(t.confirmDeleteLease)) {
            setLeases(prev => prev.filter(l => l.id !== id));
            addToast({ type: 'warning', title: 'إنهاء العقد', message: t.deleteSuccess });
        }
    };

    const handleSavePayment = (pay: RentPayment) => {
        if (editingPayment?.id) {
            setPayments(prev => prev.map(p => p.id === editingPayment.id ? pay : p));
        } else {
            const added = { ...pay, id: `pay-${Date.now()}` };
            setPayments(prev => [added, ...prev]);
        }
        setIsPaymentModalOpen(false);
        addToast({ type: 'success', title: 'سند قبض', message: t.paymentSuccess });
    };

    const handleSaveNotice = (notice: EvictionNoticeRecord) => {
        if (editingNotice?.id) {
            setNotices(prev => prev.map(n => n.id === editingNotice.id ? notice : n));
        } else {
            const added = { ...notice, id: `not-${Date.now()}` };
            setNotices(prev => [added, ...prev]);
        }
        setIsNoticeModalOpen(false);
        addToast({ type: 'warning', title: 'إنذار عدلي كويتي', message: t.saveSuccess });
    };

    const handleCaseLink = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mockCourtCaseNum) return;
        
        // Save linkage in lease contract if profile is lease
        if (selectedProfile?.type === 'lease') {
            const lease = selectedProfile.data as LeaseAgreement;
            const updatedCases = [...(lease.relatedCaseIds || []), mockCourtCaseNum];
            const updatedLease = { ...lease, relatedCaseIds: updatedCases };
            setLeases(prev => prev.map(l => l.id === lease.id ? updatedLease : l));
            setSelectedProfile({ type: 'lease', data: updatedLease });
        }
        
        setIsCaseLinkModalOpen(false);
        setMockCourtCaseNum('');
        addToast({
            type: 'success',
            title: pageLang === 'ar' ? 'ربط قضائي ناجح' : 'Dispute Linked',
            message: pageLang === 'ar' 
                ? `تم ربط العقد رسمياً بملف النزاع الكلي رقم ${mockCourtCaseNum} بالوزارة الحالية`
                : `Lease contract successfully linked to Kuwait Court docket Docket Num: ${mockCourtCaseNum}`
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700" dir={pageLang === 'ar' ? 'rtl' : 'ltr'}>
            {/* Header section with Language toggle */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                    <div className="flex items-center gap-2">
                        <BuildingOffice2Icon className="w-8 h-8 text-primary shadow-sm" />
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{t.title}</h1>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wide">{t.subtitle}</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    {/* Bilingual Override Button */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1">
                        <button 
                            onClick={() => { setPageLang('ar'); i18n?.changeLanguage('ar'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${pageLang === 'ar' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            العربية
                        </button>
                        <button 
                            onClick={() => { setPageLang('en'); i18n?.changeLanguage('en'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${pageLang === 'en' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            English
                        </button>
                    </div>

                    <Button 
                        onClick={() => { setEditingProperty(null); setIsPropertyModalOpen(true); }} 
                        leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                        className="shadow-md"
                    >
                        {t.newProperty}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => { setEditingTenant(null); setIsTenantModalOpen(true); }}
                        leftIcon={<UsersIcon className="w-4 h-4" />}
                    >
                        {t.newTenant}
                    </Button>
                </div>
            </div>

            {/* Quick Action Cards Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/property-management/debt-settlement" className="hover:scale-102 transition-transform">
                    <Card className="p-4 border border-amber-200 bg-amber-50/50 hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl"><ReceiptPercentIcon className="w-6 h-6"/></div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{t.settleDebts}</h3>
                                <p className="text-[11px] text-slate-400">{t.settleDebtsDesc}</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link to="/property-management/maintenance" className="hover:scale-102 transition-transform">
                    <Card className="p-4 border border-blue-200 bg-blue-50/50 hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl"><WrenchScrewdriverIcon className="w-6 h-6"/></div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{t.maintenanceDesk}</h3>
                                <p className="text-[11px] text-slate-400">{t.maintenanceDeskDesc}</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <Link to="/property-management/property-documents" className="hover:scale-102 transition-transform">
                    <Card className="p-4 border border-purple-200 bg-purple-50/50 hover:shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl"><FolderIcon className="w-6 h-6"/></div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{t.documentsRepository}</h3>
                                <p className="text-[11px] text-slate-400">{t.documentsRepositoryDesc}</p>
                            </div>
                        </div>
                    </Card>
                </Link>
                <button onClick={() => setActiveTab('notices')} className="text-start hover:scale-102 transition-transform w-full">
                    <Card className="p-4 border border-rose-200 bg-rose-50/50 hover:shadow-md h-full">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl"><ScaleIcon className="w-6 h-6"/></div>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{t.activeAlerts}</h3>
                                <p className="text-[11px] text-slate-400">{t.alertDescription}</p>
                            </div>
                        </div>
                    </Card>
                </button>
            </div>

            {/* Finesse Primary Tabs Navigation */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl flex flex-wrap gap-2 items-center justify-between shadow-sm">
                <div className="flex flex-wrap gap-1">
                    {[
                        { id: 'overview', label: t.overview, icon: <PresentationChartLineIcon className="w-4 h-4"/> },
                        { id: 'properties', label: t.properties, icon: <BuildingOffice2Icon className="w-4 h-4"/> },
                        { id: 'tenants', label: t.tenants, icon: <UsersIcon className="w-4 h-4"/> },
                        { id: 'leases', label: t.leases, icon: <DocumentTextIcon className="w-4 h-4"/> },
                        { id: 'payments', label: t.payments, icon: <BanknotesIcon className="w-4 h-4"/> },
                        { id: 'notices', label: t.notices, icon: <ScaleIcon className="w-4 h-4"/> }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102' 
                                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
                <div className="text-[11px] text-slate-400 font-mono font-bold px-3">
                    {new Date().toLocaleDateString(pageLang === 'ar' ? 'ar-KW' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* -------------------- OVERVIEW TAB -------------------- */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                    {/* Visual Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase">{t.totalProperties}</p>
                                    <h4 className="text-2xl font-black text-slate-800 mt-1">{stats.totalProps} <span className="text-xs text-slate-400">({stats.totalUnits} {pageLang === 'ar' ? 'وحدة' : 'Units'})</span></h4>
                                </div>
                                <div className="p-3 bg-primary/10 text-primary rounded-xl"><BuildingOffice2Icon className="w-6 h-6"/></div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase">{t.occupancyRate}</p>
                                    <h4 className="text-2xl font-black text-emerald-600 mt-1">{stats.occupancy}%</h4>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><ChartBarIcon className="w-6 h-6"/></div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase">{t.monthlyRevenue}</p>
                                    <h4 className="text-lg font-black text-primary mt-1">{payAmount(stats.actualCollected)}</h4>
                                </div>
                                <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><BanknotesIcon className="w-6 h-6"/></div>
                            </div>
                        </Card>
                        <Card className="border-l-4 border-l-rose-500 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase">{t.overdueDebts}</p>
                                    <h4 className="text-lg font-black text-rose-600 mt-1">{payAmount(stats.overdueTotal)}</h4>
                                </div>
                                <div className="p-3 bg-rose-50 text-rose-500 rounded-xl"><ExclamationTriangleIcon className="w-6 h-6"/></div>
                            </div>
                        </Card>
                    </div>

                    {/* Charts and Alerts block */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2" title={t.revenueAnalytics}>
                            <p className="text-slate-400 text-[11px] mb-4">{t.annualForecast}: <span className="font-bold text-slate-800">{payAmount(stats.expectedMonthly * 12)}</span></p>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartRevenue}>
                                        <defs>
                                            <linearGradient id="colAmt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11}/>
                                        <YAxis stroke="#94a3b8" fontSize={11}/>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                                        <Area type="monotone" dataKey="collected" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colAmt)"/>
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Reminders list */}
                        <div className="flex flex-col gap-4">
                            <Card title={t.alertCenter} className="flex-grow max-h-80 overflow-y-auto">
                                <p className="text-slate-400 text-[10px] mb-3">{t.alertDescription}</p>
                                <div className="space-y-3">
                                    {alertsList.map(alt => (
                                        <div key={alt.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between gap-1.5">
                                            <div className="flex items-start gap-2">
                                                {alt.type === 'overdue' && <ExclamationTriangleIcon className="w-4 h-4 text-rose-500 mt-0.5" />}
                                                {alt.type === 'expiry' && <CalendarDaysIcon className="w-4 h-4 text-amber-500 mt-0.5" />}
                                                {alt.type === 'inspection' && <WrenchScrewdriverIcon className="w-4 h-4 text-blue-500 mt-0.5" />}
                                                {alt.type === 'paci' && <MapPinIcon className="w-4 h-4 text-purple-500 mt-0.5" />}
                                                <div>
                                                    <h5 className="text-xs font-black text-slate-800 leading-snug">{alt.text}</h5>
                                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{alt.sub}</p>
                                                </div>
                                            </div>
                                            {alt.actionText && (
                                                <button 
                                                    onClick={() => {
                                                        if (alt.type === 'expiry') {
                                                            setEditingLease(alt.data);
                                                            setIsLeaseModalOpen(true);
                                                        } else if (alt.type === 'overdue') {
                                                            setEditingPayment(alt.data);
                                                            setIsPaymentModalOpen(true);
                                                        } else if (alt.type === 'paci') {
                                                            setEditingProperty(alt.data);
                                                            setIsPropertyModalOpen(true);
                                                        }
                                                    }}
                                                    className="self-end text-[10px] font-black text-primary hover:underline hover:scale-102 transition-transform"
                                                >
                                                    {alt.actionText} →
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {alertsList.length === 0 && (
                                        <p className="text-xs text-slate-400 italic text-center py-5">{t.emptyAlerts}</p>
                                    )}
                                </div>
                            </Card>
                            
                            {/* Distribution Pie Chart */}
                            <Card className="p-4 flex flex-col items-center">
                                <h4 className="text-xs font-black text-slate-800 self-start mb-2">{t.unitsDistribution}</h4>
                                <div className="h-28 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={chartUnitsObj} 
                                                cx="50%" cy="50%" 
                                                innerRadius={28} outerRadius={42} 
                                                paddingAngle={4} dataKey="value"
                                            >
                                                {chartUnitsObj.map((entry, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-xs font-black">
                                        {stats.occupancy}%
                                        <p className="text-[8px] text-slate-400 font-bold uppercase">Occ</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-1 text-[10px] font-bold">
                                    <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-sky-500 rounded-sm"></div> {t.rentedUnits} ({stats.rentedUnits})</div>
                                    <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-rose-500 rounded-sm"></div> {t.vacantUnits} ({stats.vacantUnits})</div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* -------------------- SEARCH & FILTER TOOLBAR FOR MASTER TABS -------------------- */}
            {activeTab !== 'overview' && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2 flex-grow w-full md:w-auto">
                        <Input 
                            placeholder={t.searchPlaceholder} 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                            containerClassName="max-w-md mb-0 flex-grow"
                        />
                        {activeTab === 'properties' && (
                            <>
                                <Select 
                                    containerClassName="mb-0 w-32 md:w-44"
                                    value={selectedDistrict}
                                    onChange={e => setSelectedDistrict(e.target.value)}
                                    options={[
                                        { value: 'all', label: t.allDistricts },
                                        { value: 'Salmiya', label: 'السالمية' },
                                        { value: 'Surra', label: 'السرة' },
                                        { value: 'Shuwaikh', label: 'الشويخ' },
                                        { value: 'حولي', label: 'حولي' },
                                        { value: 'العاصمة', label: 'العاصمة' }
                                    ]}
                                />
                                <Select 
                                    containerClassName="mb-0 w-32 md:w-44"
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    options={[
                                        { value: 'all', label: pageLang === 'ar' ? 'جميع التصنيفات' : 'All Categories' },
                                        { value: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL, label: t.PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL },
                                        { value: PropertyCategoryKuwait.PRIVATE_RESIDENTIAL, label: t.PropertyCategoryKuwait.PRIVATE_RESIDENTIAL },
                                        { value: PropertyCategoryKuwait.COMMERCIAL, label: t.PropertyCategoryKuwait.COMMERCIAL },
                                        { value: PropertyCategoryKuwait.INDUSTRIAL, label: t.PropertyCategoryKuwait.INDUSTRIAL }
                                    ]}
                                />
                            </>
                        )}
                    </div>

                    {/* Layout switcher toggles */}
                    {activeTab === 'properties' && (
                        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 self-stretch md:self-auto justify-center">
                            {[
                                { id: 'cards', icon: <Square3Stack3DIcon className="w-4 h-4"/>, tooltip: t.cardView },
                                { id: 'table', icon: <ListBulletIcon className="w-4 h-4"/>, tooltip: t.tableView },
                                { id: 'map', icon: <MapPinIcon className="w-4 h-4"/>, tooltip: t.mapView },
                                { id: 'timeline', icon: <CalendarDaysIcon className="w-4 h-4"/>, tooltip: t.timelineView }
                            ].map(btn => (
                                <button 
                                    key={btn.id}
                                    title={btn.tooltip}
                                    onClick={() => setDisplayMode(btn.id as any)}
                                    className={`p-1.5 rounded-lg transition-all ${displayMode === btn.id ? 'bg-white text-primary shadow-sm scale-102' : 'text-slate-400 hover:text-slate-700'}`}
                                >
                                    {btn.icon}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* -------------------- PROPERTIES TAB CONTENT -------------------- */}
            {activeTab === 'properties' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-3 duration-500">
                    
                    {/* Mode CARDS */}
                    {displayMode === 'cards' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProperties.map(prop => {
                                const totalUnits = prop.units?.length || 0;
                                const leasedUnits = prop.units?.filter(u => u.status === PropertyUnitStatus.RENTED).length || 0;
                                const rate = totalUnits > 0 ? Math.round((leasedUnits / totalUnits) * 100) : 0;
                                return (
                                    <div key={prop.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className="relative h-44 bg-slate-100">
                                            <img src={prop.imageUrl} alt={prop.name} className="w-full h-full object-cover"/>
                                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary tracking-wide">
                                                {prop.propertyCategory ? t.PropertyCategoryKuwait[prop.propertyCategory] : prop.type}
                                            </div>
                                            <div className="absolute bottom-4 right-4 left-4 bg-slate-900/40 backdrop-blur p-3 rounded-xl">
                                                <h4 className="text-white text-md font-black truncate">{prop.name}</h4>
                                                <p className="text-white/80 text-[10px] font-medium truncate flex items-center gap-1 mt-0.5"><MapPinIcon className="w-3.5 h-3.5"/> {prop.address}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                <div className="p-2 bg-slate-50 rounded-xl">
                                                    <div className="font-extrabold text-slate-800">{totalUnits}</div>
                                                    <p className="text-[9px] text-slate-400 uppercase font-black">{pageLang === 'ar' ? 'الوحدات' : 'Units'}</p>
                                                </div>
                                                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                                                    <div className="font-extrabold">{leasedUnits}</div>
                                                    <p className="text-[9px] text-emerald-400 uppercase font-black">{pageLang === 'ar' ? 'المؤجرة' : 'Leased'}</p>
                                                </div>
                                                <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
                                                    <div className="font-extrabold">{totalUnits - leasedUnits}</div>
                                                    <p className="text-[9px] text-rose-400 uppercase font-black">{pageLang === 'ar' ? 'الشاغرة' : 'Vacant'}</p>
                                                </div>
                                            </div>

                                            {/* Occupancy meter */}
                                            {totalUnits > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-black">
                                                        <span className="text-slate-400">{pageLang === 'ar' ? 'معدل الأشغال' : 'Occupancy'}</span>
                                                        <span className={rate > 70 ? 'text-emerald-500' : 'text-amber-500'}>{rate}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary" style={{ width: `${rate}%` }}></div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2 border-t border-slate-50">
                                                <Button size="sm" onClick={() => setSelectedProfile({ type: 'property', data: prop })} className="flex-grow text-xs" leftIcon={<EyeIcon className="w-3.5 h-3.5"/>}>
                                                    {t.fullDossier}
                                                </Button>
                                                <button onClick={() => { setEditingProperty(prop); setIsPropertyModalOpen(true); }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
                                                    <PencilIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleDeleteProperty(prop.id)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors">
                                                    <TrashIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredProperties.length === 0 && (
                                <div className="col-span-full py-10 bg-white border rounded-3xl text-center text-slate-400 italic font-medium">{t.emptyList}</div>
                            )}
                        </div>
                    )}

                    {/* Mode DENSE TABLE */}
                    {displayMode === 'table' && (
                        <Card className="p-0 overflow-hidden border-none shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-start text-xs">
                                    <thead className="bg-slate-50 border-b font-black text-slate-500 uppercase tracking-widest text-[10px]">
                                        <tr>
                                            <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'العقار' : 'Property'}</th>
                                            <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'المالك' : 'Owner'}</th>
                                            <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الرقم الآلي PACI' : 'PACI Code'}</th>
                                            <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'التصنيف' : 'Category'}</th>
                                            <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الوحدات الكلية' : 'Total Units'}</th>
                                            <th className="px-5 py-4 text-end">{pageLang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredProperties.map(p => (
                                            <tr key={p.id} className="hover:bg-slate-50/50">
                                                <td className="px-5 py-4 font-black text-slate-800">
                                                    <div>{p.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">{p.address}</div>
                                                </td>
                                                <td className="px-5 py-4 font-bold text-slate-500">{p.ownerName || '-'}</td>
                                                <td className="px-5 py-4 font-mono font-bold text-primary">{p.paciNumber || '-'}</td>
                                                <td className="px-5 py-4">
                                                    <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                                        {p.propertyCategory ? t.PropertyCategoryKuwait[p.propertyCategory] : p.type}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-extrabold">{p.units?.length || 0}</td>
                                                <td className="px-5 py-4 text-end">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="ghost" onClick={() => setSelectedProfile({ type: 'property', data: p })}><EyeIcon className="w-4 h-4 text-primary"/></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => { setEditingProperty(p); setIsPropertyModalOpen(true); }}><PencilIcon className="w-4 h-4 text-yellow-500"/></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteProperty(p.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* Mode TIMELINE */}
                    {displayMode === 'timeline' && (
                        <Card title={t.timelineView} className="max-w-3xl mx-auto">
                            <div className="relative border-r border-slate-200 mr-4 pr-6 space-y-8 py-4 text-xs font-bold text-slate-600">
                                <div className="absolute right-0 top-0 h-full w-px bg-slate-200"></div>
                                
                                <div className="relative">
                                    <div className="absolute -right-[29px] top-1 px-1 py-1 bg-sky-100 text-sky-500 rounded-full border border-white"><CheckCircleIcon className="w-5 h-5"/></div>
                                    <div className="text-slate-400 text-[10px]">منذ يومين</div>
                                    <h5 className="font-black text-slate-800 mt-1">توقيع عقد إيجار جديد - مجمع ميريديان</h5>
                                    <p className="font-medium text-slate-500 mt-1">المستأجر: شركة كويت فودز للحلويات - القيمة الإيجارية: 350 د.ك</p>
                                </div>
                                
                                <div className="relative">
                                    <div className="absolute -right-[29px] top-1 px-1 py-1 bg-amber-100 text-amber-500 rounded-full border border-white"><BellAlertIcon className="w-5 h-5"/></div>
                                    <div className="text-slate-400 text-[10px]">منذ 4 أيام</div>
                                    <h5 className="font-black text-slate-800 mt-1">إرسال إنذار عدلي للمستأجر / محمد السيد علي</h5>
                                    <p className="font-medium text-slate-500 mt-1">السبب: تأخر في سداد القيمة الإيجارية لشهر مايو 2024</p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -right-[29px] top-1 px-1 py-1 bg-green-100 text-green-500 rounded-full border border-white"><BanknotesIcon className="w-5 h-5"/></div>
                                    <div className="text-slate-400 text-[10px]">منذ أسبوع</div>
                                    <h5 className="font-black text-slate-800 mt-1">تحصيل وتحرير إيصال قيمة إيحارية - فيلا السرة</h5>
                                    <p className="font-medium text-slate-500 mt-1">المستحق: 1,500 د.ك - طريقة الدفع: كي نت بوزارة العدل</p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Mode INTERACTIVE PACI MAP SIMULATION */}
                    {displayMode === 'map' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-slate-950 text-white min-h-[420px] relative overflow-hidden flex flex-col justify-between">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center z-10">
                                    <div>
                                        <h4 className="font-black text-white text-md tracking-tight flex items-center gap-1.5"><MapPinIcon className="w-5 h-5 text-primary"/> {t.mapView}</h4>
                                        <p className="text-[10px] text-slate-400">{t.alertDescription}</p>
                                    </div>
                                    <span className="bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black">{stats.occupancy}% {pageLang === 'ar' ? 'إشغال وطني' : 'Portfolio Occupied'}</span>
                                </div>

                                {/* Pinned interactive nodes simulation map layout */}
                                <div className="relative flex-grow min-h-[300px] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center">
                                    
                                    {/* Kuwait Outline Map schematic node */}
                                    <div className="w-64 h-64 border-2 border-slate-800/80 rounded-full flex items-center justify-center animate-pulse duration-[4000ms] absolute opacity-35"></div>
                                    
                                    {mapDistricts.map(dist => (
                                        <button 
                                            key={dist.key}
                                            onClick={() => {
                                                setSelectedDistrict(dist.key === 'kuwaitCity' ? 'العاصمة' : dist.key === 'salmiya' ? 'السالمية' : dist.key === 'hawally' ? 'حولي' : dist.key === 'surra' ? 'السرة' : dist.key === 'shuwaikh' ? 'الشويخ' : 'all');
                                                setActiveTab('properties');
                                                setDisplayMode('cards');
                                                addToast({ type: 'info', title: dist.title, message: `تصفية العقارات في منطقة ${dist.title}` });
                                            }}
                                            style={{ top: dist.y, left: dist.x }}
                                            className="absolute p-2.5 z-10 bg-slate-900 border border-slate-700 rounded-2xl hover:bg-slate-800 hover:scale-110 shadow-lg text-white group transition-all text-right cursor-pointer"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-2.5 h-2.5 rounded-full ${dist.count > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'}`}></div>
                                                <span className="text-[10px] font-black">{dist.title}</span>
                                            </div>
                                            {/* Tooltip detail on hover */}
                                            <div className="hidden group-hover:block absolute top-10 right-0 bg-slate-800 text-slate-100 p-3 rounded-xl shadow-xl w-48 border border-slate-700 z-50 text-[10px] space-y-1">
                                                <p className="font-black flex justify-between border-b pb-1"><span>{t.unitsCount}</span> <span>{dist.count}</span></p>
                                                <p className="font-black flex justify-between"><span>{pageLang === 'ar' ? 'الأشغال:' : 'Occ Rate:'}</span> <span className="text-emerald-400">{dist.occupancy}</span></p>
                                                <p className="font-black leading-tight mt-1 text-slate-400">{t.seeDistrictProps}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-4 bg-slate-900/60 border-t border-white/5 text-[9px] font-bold text-slate-400 flex justify-between items-center z-10">
                                    <span>{t.paciLoc}</span>
                                    <span>{pageLang === 'ar' ? 'الهيئة العامة للمعلومات المدنية كويتي' : 'PACI Authority, Kuwait Civil Database'}</span>
                                </div>
                            </Card>

                            {/* Info on district properties */}
                            <div className="space-y-4">
                                <Card title={pageLang === 'ar' ? 'نسب الإشغال حسب المناطق' : 'Regional Occupancy Metrics'}>
                                    <div className="space-y-3 font-semibold text-xs">
                                        {mapDistricts.map(dist => (
                                            <div key={dist.key} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl">
                                                <span>{dist.title}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${dist.count > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                    {dist.occupancy}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* -------------------- TENANTS TAB CONTENT -------------------- */}
            {activeTab === 'tenants' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-500">
                    <Card className="p-0 overflow-hidden border-none shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-slate-50 border-b font-black text-slate-500 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'المستأجر الكلي' : 'Tenant Entity'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الرقم المدني / السجل' : 'Civil ID / Corp Ref'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الجنسية / الدولة' : 'Nationality'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الوضع المالي' : 'Collection Quality'}</th>
                                        <th className="px-5 py-4 text-end">{pageLang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredTenants.map(t => {
                                        const overdueNum = payments.filter(p => {
                                            const lease = leases.find(l => l.id === p.leaseAgreementId);
                                            return lease?.tenantId === t.id && p.status === RentPaymentStatus.OVERDUE;
                                        }).length;
                                        return (
                                            <tr key={t.id} className="hover:bg-slate-50/50">
                                                <td className="px-5 py-4 font-black text-slate-800">
                                                    <div>{t.fullNameAr}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold">{t.occupation}</div>
                                                </td>
                                                <td className="px-5 py-4 font-mono font-bold text-slate-500">{t.civilIdOrPassport}</td>
                                                <td className="px-5 py-4 font-medium text-slate-600">{t.nationality}</td>
                                                <td className="px-5 py-4 font-mono font-bold text-indigo-600">{t.phone}</td>
                                                <td className="px-5 py-4">
                                                    {overdueNum > 0 ? (
                                                        <span className="bg-rose-50 text-rose-600 font-black px-3 py-1 rounded-full text-[10px] flex items-center w-fit gap-1 animate-pulse">
                                                            <ExclamationTriangleIcon className="w-3 h-3"/> {pageLang === 'ar' ? `متعثر (${overdueNum})` : `Delinquent (${overdueNum})`}
                                                        </span>
                                                    ) : (
                                                        <span className="bg-emerald-50 text-emerald-600 font-black px-3 py-1 rounded-full text-[10px] flex items-center w-fit gap-1">
                                                            <CheckCircleIcon className="w-3 h-3"/> {pageLang === 'ar' ? 'منتظم وممتاز' : 'Excellent Status'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-end">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="ghost" onClick={() => setSelectedProfile({ type: 'tenant', data: t })}><EyeIcon className="w-4 h-4 text-primary"/></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => { setEditingTenant(t); setIsTenantModalOpen(true); }}><PencilIcon className="w-4 h-4 text-yellow-500"/></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteTenant(t.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* -------------------- LEASE CONTRACTS TAB CONTENT -------------------- */}
            {activeTab === 'leases' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-3 duration-500">
                    <Card className="p-0 overflow-hidden border-none shadow-sm" actions={<Button size="sm" onClick={() => { setEditingLease(null); setIsLeaseModalOpen(true); }} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>{t.newLease}</Button>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-slate-50 border-b font-black text-slate-500 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'رقم العقد وكود المتابعة' : 'Contract Ref'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'العقار / العين المؤجرة' : 'Asset & Unit'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'المستأجر' : 'Tenant'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'القيمة الإيجارية د.ك' : 'Rent Amount'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'تاريخ البدء والانتهاء' : 'Dates Range'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الحالة القانونية' : 'Status'}</th>
                                        <th className="px-5 py-4 text-end">{pageLang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLeases.map(l => {
                                        const tenant = tenants.find(t => t.id === l.tenantId);
                                        const prop = properties.find(p => p.id === l.propertyId);
                                        const unit = prop?.units?.find(u => u.id === l.unitId);
                                        return (
                                            <tr key={l.id} className="hover:bg-slate-50/50">
                                                <td className="px-5 py-4 font-mono font-bold text-slate-800">
                                                    <div>{l.contractNumber}</div>
                                                    {l.relatedCaseIds && l.relatedCaseIds.length > 0 && (
                                                        <span className="text-[9px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full mt-1 inline-flex items-center gap-1 font-sans">
                                                            <ScaleIcon className="w-2.5 h-2.5"/> {pageLang === 'ar' ? `نزاع كلي (${l.relatedCaseIds.join(', ')})` : `Court Case (${l.relatedCaseIds.join(', ')})`}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 font-bold text-slate-600">
                                                    <div>{prop?.name}</div>
                                                    <div className="text-[10px] text-slate-400">{unit ? `${t.unitNo} ${unit.unitNumber}` : t.allProperty}</div>
                                                </td>
                                                <td className="px-5 py-4 font-bold text-slate-800">{tenant?.fullNameAr}</td>
                                                <td className="px-5 py-4 font-mono font-bold text-primary">{payAmount(l.rentAmount)}</td>
                                                <td className="px-5 py-4 font-bold text-slate-400">
                                                    <div>{formatDate(l.startDate, pageLang)}</div>
                                                    <div>{formatDate(l.endDate, pageLang)}</div>
                                                </td>
                                                <td className="px-5 py-4"><LeaseAgreementStatusBadge status={l.status}/></td>
                                                <td className="px-5 py-4 text-end">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="ghost" onClick={() => setSelectedProfile({ type: 'lease', data: l })}><EyeIcon className="w-4 h-4 text-primary"/></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => { setEditingLease(l); setIsLeaseModalOpen(true); }}><PencilIcon className="w-4 h-4 text-yellow-500"/></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteLease(l.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* -------------------- FINANCIAL PAYMENTS TAB CONTENT -------------------- */}
            {activeTab === 'payments' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-3 duration-500">
                    <Card className="p-0 overflow-hidden border-none shadow-sm" actions={<Button size="sm" onClick={() => { setEditingPayment(null); setIsPaymentModalOpen(true); }} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>{t.newPayment}</Button>}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-slate-50 border-b font-black text-slate-500 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'تاريخ السداد والتحصيل' : 'Received Date'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'المستأجر الكلي' : 'Tenant Name'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'العين المؤجرة' : 'Rental Property'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الفترة الإيجارية المسدد عنها' : 'Rental Period'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'المبلغ المستحق / المدفوع' : 'Due / Settled'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'طريقة الدفع' : 'Payment Type'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الحالة الإدارية' : 'Status'}</th>
                                        <th className="px-5 py-4 text-end">{pageLang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.map(p => {
                                        const lease = leases.find(l => l.id === p.leaseAgreementId);
                                        const tenant = tenants.find(t => t.id === lease?.tenantId);
                                        const prop = properties.find(pro => pro.id === lease?.propertyId);
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/50">
                                                <td className="px-5 py-4 font-mono font-bold text-slate-500">{p.paymentDate ? formatDate(p.paymentDate, pageLang) : '-'}</td>
                                                <td className="px-5 py-4 font-black text-slate-800">{tenant?.fullNameAr}</td>
                                                <td className="px-5 py-4 font-bold text-slate-400">{prop?.name}</td>
                                                <td className="px-5 py-4 font-bold text-slate-600">{p.paymentForPeriod}</td>
                                                <td className="px-5 py-4 font-mono font-bold text-emerald-600">
                                                    <div>{payAmount(p.amountPaid)}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold line-through">{payAmount(p.amountDue)}</div>
                                                </td>
                                                <td className="px-5 py-4 font-bold text-slate-500">{p.paymentMethod || '-'}</td>
                                                <td className="px-5 py-4"><RentPaymentStatusBadge status={p.status}/></td>
                                                <td className="px-5 py-4 text-end">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="ghost" onClick={() => setSelectedProfile({ type: 'payment', data: p })}><EyeIcon className="w-4 h-4 text-primary"/></Button>
                                                        <Button size="sm" variant="ghost" onClick={() => { setEditingPayment(p); setIsPaymentModalOpen(true); }}><PencilIcon className="w-4 h-4 text-yellow-500"/></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* -------------------- NOTICES & LITIGATIONS TAB CONTENT -------------------- */}
            {activeTab === 'notices' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-3 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-rose-50 border border-rose-100 p-5">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-rose-100 text-rose-700 rounded-2xl"><ScaleIcon className="w-8 h-8"/></div>
                                <div>
                                    <h4 className="font-black text-rose-800 text-md">{pageLang === 'ar' ? 'تحصين الذمم الإيجارية الكويتية' : 'Protecting Lease Portfolios'}</h4>
                                    <p className="text-xs text-rose-600/90 leading-relaxed mt-1">
                                        {pageLang === 'ar' 
                                            ? 'إدارة الإنذارات العدلية المسلمة عبر مندوب الإعلان بالمحكمة الكلية الكويتي لتنبيه المتعثرين وضمان فسخ العقد أو الإخلاء المستند للوائح الإيجار الوطنية.'
                                            : 'Managing formal legal warning notices certified by Kuwait Ministry of Justice delegates to safeguard prompt rent collections or immediate eviction terms.'
                                        }
                                    </p>
                                    <Button size="sm" variant="danger" className="mt-4" onClick={() => { setEditingNotice(null); setIsNoticeModalOpen(true); }} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>
                                        {t.issueNotice}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                        
                        <Card className="bg-slate-50 border border-slate-100 p-5 flex flex-col justify-between">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-slate-200 text-slate-700 rounded-2xl"><ShieldCheckIcon className="w-8 h-8"/></div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-md">{pageLang === 'ar' ? 'توصية قانونية لمندوبي الدفتر' : 'Procedural Warning'}</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                        {pageLang === 'ar' 
                                            ? 'طبقا لقانون الإيجارات كويت 35/1978، لا يجوز المطالبة بالإخلاء لإخفاق السداد إلا بعد توجيه إنذار رسمي بالوفاء ومضي 15 يوما دون سداد الأجرة بالكامل.'
                                            : 'Per Kuwait Rent Clause 35/1978, no evictions are processed unless an official notification is dispatched and 15 days expire without settlement.'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-bold mt-2 text-start">البند الإيجاري الكويتي الموحد</div>
                        </Card>
                    </div>

                    <Card title={pageLang === 'ar' ? 'سجل الإخطارات والإنذارات المرفوعة' : 'Formal Warning Notices Register'}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-slate-50 border-b font-black text-slate-500 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'تاريخ الإعلان' : 'Service Date'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'المستأجر المنذر' : 'Defendant Tenant'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'العين المؤجرة' : 'Target Asset'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'السبب وحجم التعثر' : 'Warning Motive'}</th>
                                        <th className="px-5 py-4 text-start">{pageLang === 'ar' ? 'الحالة الإجرائية' : 'Service Status'}</th>
                                        <th className="px-5 py-4 text-end">{pageLang === 'ar' ? 'إجراءات' : 'Actions'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {notices.map(notice => {
                                        const tenant = tenants.find(t => t.id === notice.tenantId);
                                        const prop = properties.find(p => p.id === notice.propertyId);
                                        return (
                                            <tr key={notice.id} className="hover:bg-slate-50/50">
                                                <td className="px-5 py-4 font-mono font-bold text-slate-500">{formatDate(notice.noticeDate, pageLang)}</td>
                                                <td className="px-5 py-4 font-black text-slate-800">{tenant?.fullNameAr}</td>
                                                <td className="px-5 py-4 font-bold text-slate-400">{prop?.name}</td>
                                                <td className="px-5 py-4 text-slate-700 font-bold max-w-xs truncate">
                                                    <div>{notice.reason}</div>
                                                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{notice.notes}</div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                                        notice.status === 'Sent' ? 'bg-indigo-50 text-indigo-600' : 
                                                        notice.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                                                    }`}>
                                                        {notice.status === 'Sent' ? (pageLang === 'ar' ? 'أرسل مع المندوب' : 'Sent via Officer') : 
                                                         notice.status === 'Delivered' ? (pageLang === 'ar' ? 'تم الإعلان والاستلام' : 'Delivered Hand-to-Hand') : 
                                                         (pageLang === 'ar' ? 'دعوى أمام دوائر الإيجار' : 'Under Judicial Action')}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-end">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="ghost" onClick={() => { setEditingNotice(notice); setIsNoticeModalOpen(true); }}><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* -------------------- PROFILE SLIDEOVER DRAWER -------------------- */}
            <AnimatePresence>
                {selectedProfile && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProfile(null)}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <motion.div 
                            initial={{ x: pageLang === 'ar' ? '-100%' : '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: pageLang === 'ar' ? '-100%' : '100%' }}
                            transition={{ type: 'tween', duration: 0.4 }}
                            className={`fixed inset-y-0 ${pageLang === 'ar' ? 'left-0' : 'right-0'} w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto`}
                        >
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <div className="flex items-center gap-2">
                                        <BuildingOffice2Icon className="w-6 h-6 text-primary" />
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{t.advancedProfile}</h3>
                                    </div>
                                    <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-800">
                                        <XMarkIcon className="w-5 h-5"/>
                                    </button>
                                </div>

                                {/* Main Drawer Tabs inside card */}
                                <Card className="p-4 bg-slate-50/50">
                                    <div className="space-y-4">
                                        {/* Property Profile Render */}
                                        {selectedProfile.type === 'property' && (
                                            <div className="space-y-4 text-xs font-semibold text-slate-600">
                                                <div className="h-40 rounded-2xl overflow-hidden bg-slate-100">
                                                    <img src={selectedProfile.data.imageUrl} alt={selectedProfile.data.name} className="w-full h-full object-cover"/>
                                                </div>
                                                <h4 className="text-base font-black text-slate-800">{selectedProfile.data.name}</h4>
                                                <div className="grid grid-cols-2 gap-3 leading-loose">
                                                    <p><span>{t.address}</span> <span className="font-bold text-slate-800">{selectedProfile.data.address}</span></p>
                                                    <p><span>{t.category}</span> <span className="font-bold text-slate-800">{selectedProfile.data.propertyCategory ? t.PropertyCategoryKuwait[selectedProfile.data.propertyCategory] : '-'}</span></p>
                                                    <p><span>{t.owner}</span> <span className="font-bold text-indigo-600">{selectedProfile.data.ownerName || '-'}</span></p>
                                                    <p><span>{t.paciNum}</span> <span className="font-mono font-bold text-primary">{selectedProfile.data.paciNumber || '-'}</span></p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase">{pageLang === 'ar' ? 'وصف العقار والملف:' : 'Asset Details Description:'}</span>
                                                    <p className="text-slate-500 mt-1 leading-relaxed">{selectedProfile.data.description || t.notAvailable}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tenant Profile Render */}
                                        {selectedProfile.type === 'tenant' && (
                                            <div className="space-y-4 text-xs font-semibold text-slate-600">
                                                <div className="p-4 bg-primary/5 rounded-2xl border flex items-center gap-3">
                                                    <UsersIcon className="w-10 h-10 text-primary bg-white p-2 rounded-xl shadow-sm"/>
                                                    <div>
                                                        <h4 className="text-base font-black text-slate-800">{selectedProfile.data.fullNameAr}</h4>
                                                        <p className="text-[10px] text-slate-400">{selectedProfile.data.occupation || 'مستأجر عقاري كويتي'}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 leading-loose">
                                                    <p><span>{t.civilId}</span> <span className="font-mono font-bold text-slate-800">{selectedProfile.data.civilIdOrPassport}</span></p>
                                                    <p><span>{t.nationality}</span> <span className="font-bold text-slate-800">{selectedProfile.data.nationality}</span></p>
                                                    <p><span>{t.phone}</span> <span className="font-mono font-bold text-slate-800">{selectedProfile.data.phone}</span></p>
                                                    <p><span>{t.email}</span> <span className="font-mono text-slate-500">{selectedProfile.data.email || '-'}</span></p>
                                                </div>

                                                {selectedProfile.data.emergencyContact && (
                                                    <div className="p-3 bg-slate-100 rounded-xl leading-relaxed text-[11px]">
                                                        <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.emergencyContact}</span>
                                                        <p className="font-bold text-slate-800">{selectedProfile.data.emergencyContact.name} ({selectedProfile.data.emergencyContact.relation})</p>
                                                        <p className="font-mono text-slate-500 mt-0.5">{selectedProfile.data.emergencyContact.phone}</p>
                                                    </div>
                                                )}

                                                {selectedProfile.data.previousLandlord && (
                                                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl leading-relaxed text-[11px]">
                                                        <span className="text-[10px] text-slate-400 font-bold block mb-1">{t.prevLandlord}</span>
                                                        <p className="font-bold text-slate-800">{selectedProfile.data.previousLandlord.name} - {selectedProfile.data.previousLandlord.rentalPeriod}</p>
                                                        <p className="text-slate-500 italic mt-0.5">"{selectedProfile.data.previousLandlord.notes}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Lease Contract Profile Render */}
                                        {selectedProfile.type === 'lease' && (
                                            <div className="space-y-4 text-xs font-semibold text-slate-600">
                                                <div className="p-4 bg-sky-50 text-sky-800 rounded-2xl border flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{pageLang === 'ar' ? 'رقم العقد الإطاري' : 'Contract Identifier code'}</span>
                                                        <h4 className="text-base font-black text-slate-800 font-mono tracking-tight">{selectedProfile.data.contractNumber}</h4>
                                                    </div>
                                                    <LeaseAgreementStatusBadge status={selectedProfile.data.status} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 leading-loose">
                                                    <p><span>{pageLang === 'ar' ? 'العقار الأساسي:' : 'Property Registered:'}</span> <strong className="text-slate-800">{properties.find(p => p.id === selectedProfile.data.propertyId)?.name}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'المستأجر الموقع:' : 'Signed tenant:'}</span> <strong className="text-slate-800">{tenants.find(t => t.id === selectedProfile.data.tenantId)?.fullNameAr}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'القيمة الإيجارية الشهري:' : 'Monthly Rent value:'}</span> <strong className="text-primary font-mono">{payAmount(selectedProfile.data.rentAmount)}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'دورية السداد:' : 'Rent Frequency:'}</span> <strong className="text-slate-800">{selectedProfile.data.rentFrequency}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'تاريخ بدء العقد:' : 'Start Date:'}</span> <strong className="text-slate-500 font-mono">{formatDate(selectedProfile.data.startDate, pageLang)}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'تاريخ انتهاء السكن:' : 'End Term Date:'}</span> <strong className="text-slate-500 font-mono">{formatDate(selectedProfile.data.endDate, pageLang)}</strong></p>
                                                </div>

                                                {/* Judicial linkages list */}
                                                <div>
                                                    <div className="flex justify-between items-center border-b pb-1 mb-2">
                                                        <span className="text-[10px] text-slate-400 font-black uppercase">{pageLang === 'ar' ? 'القضايا المربوطة بمكتب شطا للمحاماة' : 'Ministry of Justice Linked Disputes'}</span>
                                                        <Button size="sm" variant="ghost" className="!p-1 text-primary text-[10px] font-black" onClick={() => { setLinkingTargetId(selectedProfile.data.id); setIsCaseLinkModalOpen(true); }} leftIcon={<LinkIcon className="w-3 h-3"/>}>
                                                            {pageLang === 'ar' ? 'ربط قضائي' : 'Link Court Docket'}
                                                        </Button>
                                                    </div>
                                                    {selectedProfile.data.relatedCaseIds && selectedProfile.data.relatedCaseIds.length > 0 ? (
                                                        <div className="space-y-1.5Packed">
                                                            {selectedProfile.data.relatedCaseIds.map((cid: string) => (
                                                                <div key={cid} className="p-2 border border-rose-100 bg-rose-50/20 rounded-lg flex justify-between items-center">
                                                                    <span className="font-mono font-bold text-rose-700">Ref: {cid}</span>
                                                                    <span className="text-[9px] font-black text-rose-500">{pageLang === 'ar' ? 'ملف نزاع كلي نشط بالعدل' : 'Active Court Dispute'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] text-slate-400 italic">{pageLang === 'ar' ? 'لا يوجد نزاع قضائي مسجل حالياً.' : 'No active Court litigation linked.'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Profile Render */}
                                        {selectedProfile.type === 'payment' && (
                                            <div className="space-y-4 text-xs font-semibold text-slate-600">
                                                <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 font-bold block uppercase">{pageLang === 'ar' ? 'سند تحصيل مرقم' : 'Official Receipt ID'}</span>
                                                        <span className="font-mono font-bold font-black text-slate-800">Ref: {selectedProfile.data.id?.toUpperCase()}</span>
                                                    </div>
                                                    <RentPaymentStatusBadge status={selectedProfile.data.status} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 leading-loose">
                                                    <p><span>{t.period}</span> <strong>{selectedProfile.data.paymentForPeriod}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'المبلغ المستحق:' : 'Required Due Amount:'}</span> <strong className="font-mono">{payAmount(selectedProfile.data.amountDue)}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'المبلغ المدفوع فعلياً:' : 'Settled Amount Part:'}</span> <strong className="text-emerald-600 font-mono">{payAmount(selectedProfile.data.amountPaid)}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'طريقة السداد:' : 'Payment Channel:'}</span> <strong>{selectedProfile.data.paymentMethod || '-'}</strong></p>
                                                    <p><span>{pageLang === 'ar' ? 'تاريخ استلام الحركة:' : 'Logged Transaction Date:'}</span> <span className="font-mono text-slate-400">{selectedProfile.data.paymentDate ? formatDate(selectedProfile.data.paymentDate, pageLang) : '-'}</span></p>
                                                </div>

                                                <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[9px] text-slate-400 font-black uppercase block tracking-wide">{pageLang === 'ar' ? 'الرمز التعميدي / كي نت موحد' : 'KNET Ministry Reference ID'}</span>
                                                        <span className="text-slate-800 font-black text-xs font-mono">{selectedProfile.data.referenceNumber || 'KNET-TX-9988221'}</span>
                                                    </div>
                                                    <div className="w-12 h-12 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=64x64&data= عدالة-نظام-العقارات')] bg-cover opacity-70"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <Button size="sm" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>} className="flex-grow">
                                    {t.printDossier}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setSelectedProfile(null)}>
                                    {pageLang === 'ar' ? 'إغلاق' : 'Close'}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* -------------------- CREATIVE MODAL DIALOGS FOR CRUD -------------------- */}

            {/* 1. PROPERTY FORM MODAL */}
            <PropertyFormModal 
                isOpen={isPropertyModalOpen} 
                onClose={() => setIsPropertyModalOpen(false)} 
                onSubmit={handleSaveProperty} 
                initialData={editingProperty}
            />

            {/* 2. TENANT FORM MODAL */}
            <TenantFormModal 
                isOpen={isTenantModalOpen} 
                onClose={() => setIsTenantModalOpen(false)} 
                onSubmit={handleSaveTenant} 
                initialData={editingTenant}
            />

            {/* 3. LEASE AGREEMENT MODAL */}
            <LeaseFormModal 
                isOpen={isLeaseModalOpen} 
                onClose={() => setIsLeaseModalOpen(false)} 
                onSubmit={handleSaveLease} 
                initialData={editingLease}
                properties={properties}
                tenants={tenants}
            />

            {/* 4. RENT SLIP PAYMENT MODAL */}
            <PaymentFormModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                onSubmit={handleSavePayment} 
                initialData={editingPayment}
                leases={leases}
                tenants={tenants}
            />

            {/* 5. MOJ EVICITON NOTICE FORM MODAL */}
            <NoticeFormModal 
                isOpen={isNoticeModalOpen}
                onClose={() => setIsNoticeModalOpen(false)}
                onSubmit={handleSaveNotice}
                initialData={editingNotice}
                leases={leases}
                tenants={tenants}
                properties={properties}
            />

            {/* 6. JUSTICE COURT CASE SYNC MODAL */}
            <Modal isOpen={isCaseLinkModalOpen} onClose={() => setIsCaseLinkModalOpen(false)} title={pageLang === 'ar' ? 'ربط عقد بملف نزاع قضائي' : 'Link Lease with Legal Court Docket'}>
                <form onSubmit={handleCaseLink} className="space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed">
                        {pageLang === 'ar'
                            ? 'يرجى إدخال رقم الطعن أو النزاع المسجل رسمياً بوزارة العدل لربطه بالخط الزمني للعقد وإصدار أرشيف المطالبات تلقائياً.'
                            : 'Enter the lawsuit reference number logged in Kuwait MOJ Judicial Portal to sync the timelines and prepare automated legal requests.'
                        }
                    </p>
                    <Input 
                        label={pageLang === 'ar' ? 'رقم ملف الدعوى / القضية الموحد' : 'Court Docket / Case Reference Number'} 
                        value={mockCourtCaseNum} 
                        onChange={e => setMockCourtCaseNum(e.target.value)}
                        placeholder="مثال: 2024/115 إيجارات العاصمة"
                        required 
                    />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsCaseLinkModalOpen(false)}>{pageLang === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                        <Button type="submit" size="sm">{pageLang === 'ar' ? 'ربط بالملف القانوني' : 'Confirm Judicial Link'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

// Sub-modals internally definitions matching original page declarations code structure
interface PropertyFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Property) => void;
    initialData?: Partial<Property> | null;
}
const PropertyFormModal: React.FC<PropertyFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<Property>>({
        type: PropertyType.BUILDING,
        propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL,
        units: [],
        createdAt: new Date().toISOString()
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                type: PropertyType.BUILDING,
                propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL,
                units: [],
                createdAt: new Date().toISOString()
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddUnit = () => {
        const newUnit: PropertyUnit = {
            id: `unit-${Date.now()}`,
            propertyId: formData.id || 'temp',
            unitNumber: '',
            status: PropertyUnitStatus.VACANT,
            unitType: PropertyUnitTypeKuwait.APARTMENT
        };
        setFormData(prev => ({ ...prev, units: [...(prev.units || []), newUnit] }));
    };

    const handleUnitChange = (idx: number, field: keyof PropertyUnit, val: any) => {
        const uClone = [...(formData.units || [])];
        uClone[idx] = { ...uClone[idx], [field]: val };
        setFormData(prev => ({ ...prev, units: uClone }));
    };

    const handleRemoveUnit = (idx: number) => {
        const uClone = [...(formData.units || [])];
        uClone.splice(idx, 1);
        setFormData(prev => ({ ...prev, units: uClone }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل العقار" : "إضافة عقار جديد"} size="lg">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as Property); }} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 text-xs">
                <div className="grid grid-cols-2 gap-3 text-start">
                    <Input label="اسم العقار / البناية" name="name" value={formData.name || ''} onChange={handleChange} required />
                    <Select label="تصنيف نوع العقار" name="type" value={formData.type} options={propertyTypeOptions} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-start">
                    <Select label="التصنيف القانوني الكويتي" name="propertyCategory" value={formData.propertyCategory} options={propertyCategoryKuwaitOptions} onChange={handleChange} />
                    <Input label="العنوان الجغرافي الكامل" name="address" value={formData.address || ''} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-2 gap-3 text-start">
                    <Input label="المالك / الموكل" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} />
                    <Input label="الرقم الآلي المدني PACI" name="paciNumber" value={formData.paciNumber || ''} onChange={handleChange} />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-start">
                        <label className="font-black text-slate-700">سجل الوحدات الداخلية ({formData.units?.length || 0})</label>
                        <Button type="button" size="sm" variant="outline" onClick={handleAddUnit} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>إضافة وحدة</Button>
                    </div>
                    <div className="space-y-2">
                        {formData.units?.map((unit, idx) => (
                            <div key={unit.id} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-slate-100">
                                <Input containerClassName="mb-0 flex-grow" placeholder="رقم الوحدة" value={unit.unitNumber} onChange={e => handleUnitChange(idx, 'unitNumber', e.target.value)} required />
                                <Select containerClassName="mb-0 w-32" value={unit.unitType} options={propertyUnitTypeKuwaitOptions} onChange={e => handleUnitChange(idx, 'unitType', e.target.value)} />
                                <Select containerClassName="mb-0 w-32" value={unit.status} options={propertyUnitStatusOptions} onChange={e => handleUnitChange(idx, 'status', e.target.value)} />
                                <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveUnit(idx)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                            </div>
                        ))}
                    </div>
                </div>

                <TextArea label="تفاصيل وملاحظات إضافية" name="description" value={formData.description || ''} onChange={handleChange} rows={2} />
                
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" size="sm">حفظ العقار</Button>
                </div>
            </form>
        </Modal>
    );
};

interface TenantFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Tenant) => void;
    initialData?: Partial<Tenant> | null;
}
const TenantFormModal: React.FC<TenantFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<Tenant>>({ createdAt: new Date().toISOString() });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || { createdAt: new Date().toISOString() });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل مستأجر" : "إضافة مستأجر جديد"} size="md">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as Tenant); }} className="space-y-4 text-xs text-start">
                <Input label="اسم المستأجر بالكامل (عربي)" name="fullNameAr" value={formData.fullNameAr || ''} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الرقم المدني / جواز القوانين" name="civilIdOrPassport" value={formData.civilIdOrPassport || ''} onChange={handleChange} required />
                    <Input label="الجنسية / الهوية" name="nationality" value={formData.nationality || ''} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="رقم الهاتف" name="phone" value={formData.phone || ''} onChange={handleChange} required />
                    <Input label="البريد الإلكتروني" name="email" value={formData.email || ''} onChange={handleChange} />
                </div>
                <Input label="الوظيفة / جهة العمل الحالية" name="occupation" value={formData.occupation || ''} onChange={handleChange} />

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" size="sm">تسجيل العميل</Button>
                </div>
            </form>
        </Modal>
    );
};

interface LeaseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LeaseAgreement) => void;
    initialData?: Partial<LeaseAgreement> | null;
    properties: Property[];
    tenants: Tenant[];
}
const LeaseFormModal: React.FC<LeaseFormProps> = ({ isOpen, onClose, onSubmit, initialData, properties, tenants }) => {
    const [formData, setFormData] = useState<Partial<LeaseAgreement>>({ status: LeaseAgreementStatus.ACTIVE, rentFrequency: RentPaymentFrequency.MONTHLY });
    const [availableUnits, setAvailableUnits] = useState<PropertyUnit[]>([]);

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                status: LeaseAgreementStatus.ACTIVE,
                rentFrequency: RentPaymentFrequency.MONTHLY,
                contractNumber: `LSE-KUW-${Date.now()}`,
                startDate: new Date().toISOString().split('T')[0]
            });
            if (initialData?.propertyId) {
                const prop = properties.find(p => p.id === initialData.propertyId);
                setAvailableUnits(prop?.units || []);
            }
        }
    }, [isOpen, initialData, properties]);

    const handleSelectProp = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, propertyId: val, unitId: '' }));
        const prop = properties.find(p => p.id === val);
        setAvailableUnits(prop?.units || []);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل عقد الإيجار" : "عقد إيجار جديد"} size="md">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as LeaseAgreement); }} className="space-y-4 text-xs text-start">
                <div className="grid grid-cols-2 gap-3">
                    <Input label="كود أو رقم العقد الموحد" name="contractNumber" value={formData.contractNumber || ''} onChange={e => setFormData(prev => ({ ...prev, contractNumber: e.target.value }))} required />
                    <Select label="الجهة المتعاقدة (المستأجر)" name="tenantId" value={formData.tenantId || ''} options={[{ value: '', label: 'اختر المستأجر' }, ...tenants.map(t => ({ value: t.id, label: t.fullNameAr }))]} onChange={e => setFormData(prev => ({ ...prev, tenantId: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Select label="عقار المحفظة" value={formData.propertyId || ''} options={[{ value: '', label: 'اختر العقار' }, ...properties.map(p => ({ value: p.id, label: p.name }))]} onChange={handleSelectProp} required />
                    {availableUnits.length > 0 && (
                        <Select label="رقم العين / الوحدة" value={formData.unitId || ''} options={[{ value: '', label: 'اختر الوحدة' }, ...availableUnits.map(u => ({ value: u.id, label: `شقة / مكتب رقم ${u.unitNumber}` }))]} onChange={e => setFormData(prev => ({ ...prev, unitId: e.target.value }))} required />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="القيمة الإيجارية الشهرية د.ك" type="number" name="rentAmount" value={formData.rentAmount?.toString() || ''} onChange={e => setFormData(prev => ({ ...prev, rentAmount: Number(e.target.value) }))} required />
                    <Select label="دورية المطالبة" value={formData.rentFrequency} options={rentPaymentFrequencyOptions} onChange={e => setFormData(prev => ({ ...prev, rentFrequency: e.target.value as any }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ سريان العقد" type="date" name="startDate" value={formData.startDate || ''} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} required />
                    <Input label="تاريخ الإخلاء التعاقدي" type="date" name="endDate" value={formData.endDate || ''} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} required />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" size="sm">تحرير وتعميد العقد</Button>
                </div>
            </form>
        </Modal>
    );
};

interface PaymentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RentPayment) => void;
    initialData?: Partial<RentPayment> | null;
    leases: LeaseAgreement[];
    tenants: Tenant[];
}
const PaymentFormModal: React.FC<PaymentFormProps> = ({ isOpen, onClose, onSubmit, initialData, leases, tenants }) => {
    const [formData, setFormData] = useState<Partial<RentPayment>>({ status: RentPaymentStatus.PAID, paymentMethod: PaymentMethod.KNET });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                status: RentPaymentStatus.PAID,
                paymentMethod: PaymentMethod.KNET,
                paymentDate: new Date().toISOString().split('T')[0],
                recordedAt: new Date().toISOString()
            });
        }
    }, [isOpen, initialData]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="سند تحصيل أجرة عقارية" size="md">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as RentPayment); }} className="space-y-4 text-xs text-start">
                <Select label="عقد الإيجار المربوط" name="leaseAgreementId" value={formData.leaseAgreementId || ''} options={[{ value: '', label: 'اختر العقد المعتمد للعميل' }, ...leases.map(l => ({ value: l.id, label: `${l.contractNumber} - ${tenants.find(t => t.id === l.tenantId)?.fullNameAr}` }))]} onChange={e => setFormData(prev => ({ ...prev, leaseAgreementId: e.target.value }))} required />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الفترة المالية المحصل عنها" placeholder="مثال: يونيو 2024" value={formData.paymentForPeriod || ''} onChange={e => setFormData(prev => ({ ...prev, paymentForPeriod: e.target.value }))} required />
                    <Input label="تاريخ التحصيل الفعلي" type="date" value={formData.paymentDate || ''} onChange={e => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="قيمة الإيجار المستحق د.ك" type="number" value={formData.amountDue?.toString() || ''} onChange={e => setFormData(prev => ({ ...prev, amountDue: Number(e.target.value) }))} required />
                    <Input label="القيمة المدفوعة نقداً/شبكة" type="number" value={formData.amountPaid?.toString() || ''} onChange={e => setFormData(prev => ({ ...prev, amountPaid: Number(e.target.value) }))} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Select label="قناة الدفع والقبض" value={formData.paymentMethod} options={[{ value: PaymentMethod.KNET, label: 'كي-نت (KNET)' }, { value: PaymentMethod.CASH, label: 'نقداً في المكتب' }, { value: PaymentMethod.BANK_TRANSFER, label: 'تحويل بنكي مبارك' }]} onChange={e => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))} />
                    <Select label="الحالة المالية بالسند" value={formData.status} options={[{ value: RentPaymentStatus.PAID, label: 'تم السداد بالكامل' }, { value: RentPaymentStatus.PARTIALLY_PAID, label: 'سداد جزئي للذمة' }, { value: RentPaymentStatus.OVERDUE, label: 'متأخر ومتعثر' }]} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))} />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" size="sm">إصدار وحفظ الفاتورة</Button>
                </div>
            </form>
        </Modal>
    );
};

interface NoticeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EvictionNoticeRecord) => void;
    initialData?: Partial<EvictionNoticeRecord> | null;
    leases: LeaseAgreement[];
    tenants: Tenant[];
    properties: Property[];
}
const NoticeFormModal: React.FC<NoticeFormProps> = ({ isOpen, onClose, onSubmit, initialData, leases, tenants, properties }) => {
    const [formData, setFormData] = useState<Partial<EvictionNoticeRecord>>({ status: 'Sent' });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {
                status: 'Sent',
                noticeDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [isOpen, initialData]);

    const handleSelectLease = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const lease = leases.find(l => l.id === val);
        if (lease) {
            setFormData(prev => ({
                ...prev,
                leaseAgreementId: val,
                tenantId: lease.tenantId,
                propertyId: lease.propertyId,
                unitId: lease.unitId
            }));
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إصدار إنذار قانوني للمستأجر" size="md">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as EvictionNoticeRecord); }} className="space-y-4 text-xs text-start">
                <Select label="عقد الإيجار المخل بأحد بنوده" value={formData.leaseAgreementId || ''} options={[{ value: '', label: 'اختر العقد المخالف للوفاء' }, ...leases.map(l => ({ value: l.id, label: `${l.contractNumber} - ${tenants.find(t => t.id === l.tenantId)?.fullNameAr}` }))]} onChange={handleSelectLease} required />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ تسليم الإعلان للبلدية" type="date" value={formData.noticeDate || ''} onChange={e => setFormData(prev => ({ ...prev, noticeDate: e.target.value }))} required />
                    <Select label="الحالة الإدارية للإعلان" value={formData.status} options={[{ value: 'Sent', label: 'تم توجيهه للمندوب' }, { value: 'Delivered', label: 'تم تسليمه رسمياً باليد' }, { value: 'LegalActionInProgress', label: 'أمام داثرة إيجارات المحكمة الكلية' }]} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))} />
                </div>
                <TextArea label="سبب وتفاصيل الإنذار بطلب الوفاء" placeholder="اكتب المخالفة بالتفصيل (مثل: التخلف عن دفع أجرة شهور إبريل ومايو لبرج ناصر)" value={formData.reason || ''} onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))} required rows={3} />

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={onClose}>إلغاء</Button>
                    <Button type="submit" size="sm" variant="danger">إعلان رسمي بموجب القانون</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PropertyManagementPage;
