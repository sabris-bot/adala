
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    ArrowPathIcon, CalculatorIcon, LinkIcon, PrinterIcon,
    MapPinIcon, UsersIcon, ShieldCheckIcon, CalendarDaysIcon,
    ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon,
    SparklesIcon, ChartBarIcon, TrendingUpIcon,
    ArrowUpRightIcon, Square3Stack3DIcon
} from '../constants';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Property, Tenant, LeaseAgreement, RentPaymentStatus,
    PropertyUnitStatus, LeaseAgreementStatus, 
    EvictionNoticeRecord, PropertyType, PropertyCategoryKuwait, PropertyUnit,
    RentPaymentFrequency, LeaseTermType, PropertyUnitTypeKuwait,
    RentPayment, PaymentMethod, Case
} from '../types';
import { 
    LeaseAgreementStatusBadge, Badge, PropertyUnitStatusBadge, RentPaymentStatusBadge
} from '../components/ui/Badge';
import { 
    propertyTypeOptions, propertyCategoryKuwaitOptions, propertyUnitTypeKuwaitOptions,
    leaseAgreementStatusOptions, rentPaymentFrequencyOptions, leaseTermTypeOptions, 
    propertyUnitStatusOptions 
} from '../constants';

// Import shared mock data as initial state
import { mockTenants, mockProperties, mockLeaseAgreements, mockRentPayments, mockEvictionNotices } from '../data/propertyData';

// Helper for dates
const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';
const formatCurrency = (amount?: number) => amount !== undefined ? `${amount.toFixed(3)} د.ك` : '-';

// --- UI COMPONENTS FOR DASHBOARD ---

const StatCard: React.FC<{ 
    title: string; 
    value: string | number; 
    trend?: { value: number; isUp: boolean }; 
    icon: React.ReactNode; 
    colorClass: string; 
    bgClass: string 
}> = ({ title, value, trend, icon, colorClass, bgClass }) => (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white dark:bg-slate-900 border-slate-100/50">
        <div className={`absolute top-0 right-0 w-32 h-32 ${bgClass} rounded-full -mr-16 -mt-16 opacity-10 group-hover:scale-150 transition-transform duration-700`}></div>
        <div className="relative p-2">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform duration-500`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {trend.isUp ? <ArrowUpRightIcon className="w-3 h-3"/> : <TrendingUpIcon className="w-3 h-3 rotate-180"/>}
                        {trend.value}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</p>
                <div className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{value}</div>
            </div>
        </div>
    </Card>
);

// 1. Property Form
interface PropertyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Property) => void;
    initialData?: Partial<Property> | null;
}
const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<Property>>({
        type: PropertyType.BUILDING,
        propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL,
        units: [],
        createdAt: new Date().toISOString()
    });

    useEffect(() => {
        if(isOpen) {
            setFormData(initialData || {
                type: PropertyType.BUILDING,
                propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL,
                units: [],
                createdAt: new Date().toISOString()
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleAddUnit = () => {
        const newUnit: PropertyUnit = {
            id: `unit-${Date.now()}`,
            propertyId: formData.id || 'temp',
            unitNumber: '',
            status: PropertyUnitStatus.VACANT,
            unitType: PropertyUnitTypeKuwait.APARTMENT
        };
        setFormData(prev => ({...prev, units: [...(prev.units || []), newUnit]}));
    };

    const handleUnitChange = (index: number, field: keyof PropertyUnit, value: any) => {
        const updatedUnits = [...(formData.units || [])];
        updatedUnits[index] = { ...updatedUnits[index], [field]: value };
        setFormData(prev => ({...prev, units: updatedUnits}));
    };

    const handleRemoveUnit = (index: number) => {
        const updatedUnits = [...(formData.units || [])];
        updatedUnits.splice(index, 1);
        setFormData(prev => ({...prev, units: updatedUnits}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.name || !formData.address) { alert('اسم العقار والعنوان مطلوبان'); return; }
        onSubmit(formData as Property);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل عقار" : "إضافة عقار جديد"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="اسم العقار" name="name" value={formData.name || ''} onChange={handleChange} required />
                    <Select label="نوع العقار" name="type" value={formData.type} options={propertyTypeOptions} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="التصنيف" name="propertyCategory" value={formData.propertyCategory} options={propertyCategoryKuwaitOptions} onChange={handleChange} />
                    <Input label="العنوان" name="address" value={formData.address || ''} onChange={handleChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="اسم المالك" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} />
                    <Input label="الرقم الآلي (PACI)" name="paciNumber" value={formData.paciNumber || ''} onChange={handleChange} />
                </div>

                {/* Units Section - Only if building or complex */}
                {(formData.type === PropertyType.BUILDING || formData.type === PropertyType.SHOP || formData.type === PropertyType.OFFICE) && (
                    <Card title={`الوحدات (${formData.units?.length || 0})`} className="bg-gray-50" actions={<Button type="button" size="sm" variant="outline" onClick={handleAddUnit} leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة وحدة</Button>}>
                        <div className="space-y-2">
                            {formData.units?.map((unit, index) => (
                                <div key={unit.id} className="flex gap-2 items-center bg-white p-2 rounded border">
                                    <Input containerClassName="mb-0 flex-grow" placeholder="رقم الوحدة" value={unit.unitNumber} onChange={e => handleUnitChange(index, 'unitNumber', e.target.value)} />
                                    <Select containerClassName="mb-0 w-32" value={unit.unitType} options={propertyUnitTypeKuwaitOptions} onChange={e => handleUnitChange(index, 'unitType', e.target.value)} />
                                    <Select containerClassName="mb-0 w-32" value={unit.status} options={propertyUnitStatusOptions} onChange={e => handleUnitChange(index, 'status', e.target.value)} />
                                    <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveUnit(index)} className="!p-2"><TrashIcon className="w-4"/></Button>
                                </div>
                            ))}
                            {(!formData.units || formData.units.length === 0) && <p className="text-center text-gray-400 text-sm">لا توجد وحدات مضافة.</p>}
                        </div>
                    </Card>
                )}

                <TextArea label="وصف / ملاحظات" name="description" value={formData.description || ''} onChange={handleChange} rows={2} />
                
                <div className="flex justify-end pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة العقار"}</Button>
                </div>
            </form>
        </Modal>
    );
};

// 2. Tenant Form
interface TenantFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Tenant) => void;
    initialData?: Partial<Tenant> | null;
}
const TenantFormModal: React.FC<TenantFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState<Partial<Tenant>>({});

    useEffect(() => {
        if(isOpen) setFormData(initialData || { createdAt: new Date().toISOString() });
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.fullNameAr || !formData.phone) { alert('الاسم ورقم الهاتف مطلوبان'); return; }
        onSubmit(formData as Tenant);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل بيانات المستأجر" : "إضافة مستأجر جديد"} size="md">
            <form onSubmit={handleSubmit} className="space-y-3">
                <Input label="الاسم الكامل (عربي)" name="fullNameAr" value={formData.fullNameAr || ''} onChange={handleChange} required />
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الرقم المدني / الجواز" name="civilIdOrPassport" value={formData.civilIdOrPassport || ''} onChange={handleChange} />
                    <Input label="الجنسية" name="nationality" value={formData.nationality || ''} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Input label="رقم الهاتف" name="phone" value={formData.phone || ''} onChange={handleChange} required />
                    <Input label="البريد الإلكتروني" name="email" value={formData.email || ''} onChange={handleChange} />
                </div>
                <Input label="الوظيفة / جهة العمل" name="occupation" value={formData.occupation || ''} onChange={handleChange} />
                
                <h4 className="font-semibold text-sm mt-2 text-gray-700">جهة الاتصال في الطوارئ</h4>
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded">
                    <Input label="الاسم" value={formData.emergencyContact?.name || ''} onChange={e => setFormData(prev => ({...prev, emergencyContact: {...prev.emergencyContact, name: e.target.value} as any}))} containerClassName="mb-0"/>
                    <Input label="الهاتف" value={formData.emergencyContact?.phone || ''} onChange={e => setFormData(prev => ({...prev, emergencyContact: {...prev.emergencyContact, phone: e.target.value} as any}))} containerClassName="mb-0"/>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة المستأجر"}</Button>
                </div>
            </form>
        </Modal>
    );
};

// 3. Lease Agreement Form
interface LeaseFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LeaseAgreement) => void;
    initialData?: Partial<LeaseAgreement> | null;
    properties: Property[];
    tenants: Tenant[];
}
const LeaseFormModal: React.FC<LeaseFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, properties, tenants }) => {
    const [formData, setFormData] = useState<Partial<LeaseAgreement>>({ status: LeaseAgreementStatus.ACTIVE, rentFrequency: RentPaymentFrequency.MONTHLY });
    const [availableUnits, setAvailableUnits] = useState<PropertyUnit[]>([]);

    useEffect(() => {
        if(isOpen) {
            setFormData(initialData || { 
                status: LeaseAgreementStatus.ACTIVE, 
                rentFrequency: RentPaymentFrequency.MONTHLY,
                contractNumber: `LSE-${new Date().getFullYear()}-${Math.floor(Math.random()*1000)}`,
                startDate: new Date().toISOString().split('T')[0]
            });
            if(initialData?.propertyId) {
                const prop = properties.find(p => p.id === initialData.propertyId);
                setAvailableUnits(prop?.units || []);
            }
        }
    }, [isOpen, initialData, properties]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        
        if (name === 'propertyId') {
             const prop = properties.find(p => p.id === value);
             setAvailableUnits(prop?.units || []);
             setFormData(prev => ({...prev, unitId: ''})); // Reset unit
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.tenantId || !formData.propertyId || !formData.rentAmount) { alert('يرجى تعبئة الحقول الأساسية'); return; }
        onSubmit(formData as LeaseAgreement);
    };

    const handleAddClause = () => {
        setFormData(prev => ({ ...prev, additionalClauses: [...(prev.additionalClauses || []), ''] }));
    };

    const handleClauseChange = (index: number, value: string) => {
        const updated = [...(formData.additionalClauses || [])];
        updated[index] = value;
        setFormData(prev => ({ ...prev, additionalClauses: updated }));
    };

    const handleRemoveClause = (index: number) => {
        const updated = [...(formData.additionalClauses || [])];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, additionalClauses: updated }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل عقد إيجار" : "إنشاء عقد إيجار جديد"} size="lg">
            <form onSubmit={handleSubmit} className="space-y-3 max-h-[80vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-3">
                    <Input label="رقم العقد" name="contractNumber" value={formData.contractNumber || ''} onChange={handleChange} required />
                    <Select label="حالة العقد" name="status" value={formData.status} options={leaseAgreementStatusOptions} onChange={handleChange} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <Select label="المستأجر" name="tenantId" value={formData.tenantId || ''} options={[{value:'', label:'اختر المستأجر'}, ...tenants.map(t => ({value: t.id, label: t.fullNameAr}))]} onChange={handleChange} required />
                    <Select label="نوع المدة" name="leaseTermType" value={formData.leaseTermType || ''} options={leaseTermTypeOptions} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <Select label="العقار" name="propertyId" value={formData.propertyId || ''} options={[{value:'', label:'اختر العقار'}, ...properties.map(p => ({value: p.id, label: p.name}))]} onChange={handleChange} required />
                     {availableUnits.length > 0 && (
                        <Select label="الوحدة" name="unitId" value={formData.unitId || ''} options={[{value:'', label:'اختر الوحدة'}, ...availableUnits.map(u => ({value: u.id, label: `${u.unitNumber} (${u.status})`}))]} onChange={handleChange} />
                     )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Input label="القيمة الإيجارية" type="number" name="rentAmount" value={formData.rentAmount?.toString() || ''} onChange={e => setFormData(prev => ({...prev, rentAmount: Number(e.target.value)}))} required />
                    <Select label="دورية السداد" name="rentFrequency" value={formData.rentFrequency} options={rentPaymentFrequencyOptions} onChange={handleChange} />
                    <Input label="يوم الاستحقاق (شهرياً)" type="number" name="paymentDueDateDay" value={formData.paymentDueDateDay?.toString() || '1'} onChange={e => setFormData(prev => ({...prev, paymentDueDateDay: Number(e.target.value)}))} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ البدء" type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} required />
                    <Input label="تاريخ الانتهاء" type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} required />
                </div>

                <div className="space-y-2 border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-700">بنود إضافية (خاصة بهذا العقد)</label>
                        <Button type="button" size="sm" variant="outline" onClick={handleAddClause} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>إضافة بند</Button>
                    </div>
                    {formData.additionalClauses?.map((clause, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                            <TextArea 
                                placeholder="اكتب نص البند الإضافي هنا..." 
                                value={clause} 
                                onChange={e => handleClauseChange(idx, e.target.value)} 
                                containerClassName="flex-grow mb-0"
                                rows={1}
                            />
                            <Button type="button" variant="ghost" className="text-red-500 !p-2" onClick={() => handleRemoveClause(idx)}><TrashIcon className="w-4 h-4"/></Button>
                        </div>
                    ))}
                    {(!formData.additionalClauses || formData.additionalClauses.length === 0) && (
                        <p className="text-xs text-gray-400 text-center py-2">لم يتم إضافة بنود إضافية مخصصة.</p>
                    )}
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إنشاء العقد"}</Button>
                </div>
            </form>
        </Modal>
    );
};

// 4. Eviction / Legal Notice Form
interface NoticeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EvictionNoticeRecord) => void;
    initialData?: Partial<EvictionNoticeRecord> | null;
    leases: LeaseAgreement[];
    tenants: Tenant[];
    properties: Property[];
}
const NoticeFormModal: React.FC<NoticeFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, leases, tenants, properties }) => {
    const [formData, setFormData] = useState<Partial<EvictionNoticeRecord>>({ status: 'Draft' });

    useEffect(() => {
        if(isOpen) {
            setFormData(initialData || { 
                status: 'Draft', 
                noticeDate: new Date().toISOString().split('T')[0] 
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = {...prev, [name]: value};
            // Auto-fill tenant and property if lease selected
            if (name === 'leaseAgreementId') {
                const lease = leases.find(l => l.id === value);
                if (lease) {
                    updated.tenantId = lease.tenantId;
                    updated.propertyId = lease.propertyId;
                    updated.unitId = lease.unitId;
                }
            }
            return updated;
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل إنذار قانوني" : "إصدار إنذار جديد"} size="md">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as EvictionNoticeRecord); }} className="space-y-3">
                <Select label="ربط بعقد الإيجار" name="leaseAgreementId" value={formData.leaseAgreementId || ''} options={[{value:'', label:'اختر العقد'}, ...leases.map(l => ({value: l.id, label: `${l.contractNumber} - ${tenants.find(t=>t.id===l.tenantId)?.fullNameAr}`}))]} onChange={handleChange} required />
                
                <div className="grid grid-cols-2 gap-3">
                    <Input label="تاريخ الإنذار" type="date" name="noticeDate" value={formData.noticeDate || ''} onChange={handleChange} required />
                    <Select label="الحالة" name="status" value={formData.status || ''} options={[{value:'Draft', label:'مسودة'}, {value:'Sent', label:'تم الإرسال'}, {value:'Delivered', label:'تم التسليم'}, {value:'LegalActionInProgress', label:'تم تحويله للقضاء'}]} onChange={handleChange} />
                </div>

                <TextArea label="سبب الإنذار / المخالفة" name="reason" value={formData.reason || ''} onChange={handleChange} required rows={3} placeholder="مثال: تأخر في سداد الأجرة الإيجارية لأكثر من 15 يوماً..." />
                <TextArea label="ملاحظات المتابعة" name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} />

                <div className="flex justify-end pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إصدار الإنذار"}</Button>
                </div>
            </form>
        </Modal>
    );
};

// 5. Payment / Receipt Form
interface PaymentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RentPayment) => void;
    initialData?: Partial<RentPayment> | null;
    leases: LeaseAgreement[];
    tenants: Tenant[];
}
const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, leases, tenants }) => {
    const [formData, setFormData] = useState<Partial<RentPayment>>({ status: RentPaymentStatus.PENDING, paymentMethod: PaymentMethod.CASH });

    useEffect(() => {
        if(isOpen) {
            setFormData(initialData || { 
                status: RentPaymentStatus.PAID,
                paymentMethod: PaymentMethod.KNET,
                paymentDate: new Date().toISOString().split('T')[0],
                recordedAt: new Date().toISOString()
            });
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل بيانات الدفعة" : "تسجيل إيصال مستلم"} size="md">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData as RentPayment); }} className="space-y-3">
                <Select label="عقد الإيجار" name="leaseAgreementId" value={formData.leaseAgreementId || ''} options={[{value:'', label:'اختر العقد'}, ...leases.map(l => ({value: l.id, label: `${l.contractNumber} - ${tenants.find(t=>t.id===l.tenantId)?.fullNameAr}`}))]} onChange={handleChange} required />
                
                <div className="grid grid-cols-2 gap-3">
                    <Input label="الفترة الإيجارية" name="paymentForPeriod" value={formData.paymentForPeriod || ''} onChange={handleChange} placeholder="مثال: يونيو 2024" required />
                    <Input label="تاريخ السداد" type="date" name="paymentDate" value={formData.paymentDate || ''} onChange={handleChange} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input label="المبلغ المستحق" type="number" name="amountDue" value={formData.amountDue?.toString() || ''} onChange={e => setFormData(prev => ({...prev, amountDue: Number(e.target.value)}))} required />
                    <Input label="المبلغ المدفوع" type="number" name="amountPaid" value={formData.amountPaid?.toString() || ''} onChange={e => setFormData(prev => ({...prev, amountPaid: Number(e.target.value)}))} required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Select label="طريقة السداد" name="paymentMethod" value={formData.paymentMethod || ''} options={[{value: PaymentMethod.CASH, label: 'نقداً'}, {value: PaymentMethod.KNET, label: 'كي-نت'}, {value: PaymentMethod.BANK_TRANSFER, label: 'تحويل بنكي'}, {value: PaymentMethod.CHEQUE, label: 'شيك'}]} onChange={handleChange} />
                    <Select label="الحالة" name="status" value={formData.status || ''} options={[{value: RentPaymentStatus.PAID, label: 'مدفوع'}, {value: RentPaymentStatus.PARTIALLY_PAID, label: 'مدفوع جزئياً'}, {value: RentPaymentStatus.OVERDUE, label: 'متأخر'}, {value: RentPaymentStatus.PENDING, label: 'انتظار'}]} onChange={handleChange} />
                </div>

                <div className="flex justify-end pt-4 gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">{initialData?.id ? "حفظ البيانات" : "تسجيل الدفعة"}</Button>
                </div>
            </form>
        </Modal>
    );
};

// 6. Case Link Form (Simplified)
interface CaseLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLink: (caseId: string) => void;
}
const CaseLinkModal: React.FC<CaseLinkModalProps> = ({ isOpen, onClose, onLink }) => {
    // In a real app, this would fetch all cases. Here we'll mock some.
    const mockCases = [
        { id: 'case-1', title: 'دعوى إخلاء - شقة 101', number: '2024/115' },
        { id: 'case-2', title: 'مطالبة مالية - سالم العازمي', number: '2024/200' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ربط بقضية قانونية" size="sm">
            <div className="space-y-4">
                <p className="text-sm text-gray-500">اختر القضية المرتبطة بهذا العقد أو المستأجر:</p>
                <div className="space-y-2">
                    {mockCases.map(c => (
                        <div key={c.id} className="p-3 border rounded hover:bg-blue-50 cursor-pointer flex justify-between items-center" onClick={() => onLink(c.id)}>
                            <div>
                                <p className="font-bold text-sm">{c.title}</p>
                                <p className="text-xs text-gray-400">رقم: {c.number}</p>
                            </div>
                            <LinkIcon className="w-4 h-4 text-blue-500" />
                        </div>
                    ))}
                </div>
                <div className="flex justify-end pt-2">
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                </div>
            </div>
        </Modal>
    );
};

// 5. Printable Lease Contract Modal
const LeaseContractPrintModal: React.FC<{ lease: LeaseAgreement | null; tenant: Tenant | null; property: Property | null; onClose: () => void }> = ({ lease, tenant, property, onClose }) => {
    if (!lease || !tenant || !property) return null;
    
    return (
        <Modal isOpen={!!lease} onClose={onClose} title="تحرير عقد إيجار (معاينة)" size="lg">
            <div id="printable-lease-contract" className="p-10 bg-white text-slate-900 leading-relaxed text-sm print:p-0" dir="rtl">
                <style>{`
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        #printable-lease-contract { p: 0 !important; font-size: 11pt !important; line-height: 1.8; }
                        .no-print { display: none !important; }
                    }
                    .contract-header { border-bottom: 2px solid #000; padding-bottom: 1rem; margin-bottom: 2rem; text-align: center; }
                    .clause-title { font-weight: 800; margin-top: 1.5rem; text-decoration: underline; }
                `}</style>

                <div className="contract-header">
                    <h1 className="text-2xl font-bold">عقد إيجار (نموذج قانوني موحد)</h1>
                    <p className="text-sm">وفقاً لقانون الإيجارات رقم 35 لسنة 1978 وتعديلاته في دولة الكويت</p>
                </div>

                <p className="mb-4">إنه في يوم {new Date().toLocaleDateString('ar-EG', {weekday: 'long'})} الموافق {formatDate(new Date().toISOString())}</p>
                
                <p className="mb-2"><strong>أولاً (المؤجر):</strong> {property.ownerName || '................................'} المحترم.</p>
                <p className="mb-6"><strong>ثانياً (المستأجر):</strong> السيد/ {tenant.fullNameAr} ، يحمل بطاقة مدنية رقم ({tenant.civilIdOrPassport || '................'}).</p>

                <p className="mb-4 text-justify">
                    تم الاتفاق بين الطرفين بعد أن أقر كل منهما بأهليته القانونية للتعاقد والتصرف على ما يلي:
                </p>

                <p className="clause-title">البند الأول: موضوع التعاقد</p>
                <p>أجر المؤجر للمستأجر القابل لذلك ما هو ({property.type}) الكائن في ({property.address}) رقم الوحدة ({lease.unitId || '................'}) وذلك بقصد استغلالها كـ (سكن عائلي / تجاري).</p>

                <p className="clause-title">البند الثاني: مدة الإيجار</p>
                <p>تبدأ مدة الإيجار من {formatDate(lease.startDate)} وتنتهي في {formatDate(lease.endDate)} {lease.leaseTermType === LeaseTermType.RENEWABLE ? 'وتجدد تلقائياً لمدد مماثلة ما لم يخطر أحد الطرفين الآخر برغبته في الإنهاء.' : 'وينتهي العقد بانتهاء مدته دون الحاجة لتنبيه أو إنذار.'}</p>

                <p className="clause-title">البند الثالث: القيمة الإيجارية</p>
                <p>اتفق الطرفان على أن تكون الأجرة الشهرية مبلغ {formatCurrency(lease.rentAmount)} تدفع في أول كل {lease.rentFrequency === RentPaymentFrequency.MONTHLY ? 'شهر' : 'فترة'} بانتظام بموجب إيصال رسمي أو تحويل بنكي.</p>

                <p className="clause-title">البند الرابع: التزامات المستأجر</p>
                <p>يتعهد المستأجر بالمحافظة على العين المؤجرة وعدم إجراء أي تغييرات جوهرية أو هدم أو بناء إلا بموافقة خطية من المؤجر، كما يلتزم بسداد قيمة استهلاك الكهرباء والماء.</p>

                <p className="clause-title">البند الخامس: الإخلاء والمنازعات</p>
                <p>في حالة تأخر المستأجر عن سداد الأجرة في موعدها، يحق للمؤجر بعد إنذاره رسمياً المطالبة بالإخلاء وسداد كافة المتأخرات، وتختص المحاكم الكويتية بنظر أي نزاع ينشأ عن تنفيذ هذا العقد.</p>

                {lease.additionalClauses && lease.additionalClauses.length > 0 && (
                    <>
                        <p className="clause-title">البند السادس: شروط إضافية خاصة</p>
                        <ul className="list-decimal list-inside space-y-1">
                            {lease.additionalClauses.map((clause, index) => (
                                <li key={index}>{clause}</li>
                            ))}
                        </ul>
                    </>
                )}

                <div className="grid grid-cols-2 gap-20 mt-20 text-center font-bold">
                    <div>
                        <p className="mb-10">توقيع المؤجر</p>
                        <p>............................</p>
                    </div>
                    <div>
                        <p className="mb-10">توقيع المستأجر</p>
                        <p>............................</p>
                    </div>
                </div>

                <div className="mt-24 pt-4 border-t text-[9px] text-gray-400 text-center">
                    تم تحرير هذا العقد آلياً عبر منظومة عدالة لإدارة الأصول والمطالبات القانونية
                </div>
            </div>

            <div className="flex justify-end p-4 border-t gap-3 no-print bg-gray-50">
                <Button variant="ghost" onClick={onClose}>إغلاق</Button>
                <Button variant="primary" onClick={() => setTimeout(() => window.print(), 350)} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة العقد</Button>
            </div>
        </Modal>
    );
};

// 6. Payments and Debts Tab
const PaymentsTab: React.FC<{ 
    payments: RentPayment[]; 
    leases: LeaseAgreement[]; 
    tenants: Tenant[];
    onAdd: () => void;
    onEdit: (p: RentPayment) => void;
    onDelete: (id: string) => void;
}> = ({ payments, leases, tenants, onAdd, onEdit, onDelete }) => {
    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-green-50 border-green-200">
                    <p className="text-xs text-green-600 font-bold mb-1">إجمالي المحصل</p>
                    <p className="text-2xl font-bold text-green-800">{formatCurrency(payments.filter(p => p.status === RentPaymentStatus.PAID).reduce((acc, curr) => acc + curr.amountPaid, 0))}</p>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <p className="text-xs text-red-600 font-bold mb-1">إجمالي المتأخرات</p>
                    <p className="text-2xl font-bold text-red-800">{formatCurrency(payments.filter(p => p.status === RentPaymentStatus.OVERDUE).reduce((acc, curr) => acc + (curr.amountDue - curr.amountPaid), 0))}</p>
                </Card>
                <Card className="bg-blue-50 border-blue-200">
                    <p className="text-xs text-blue-600 font-bold mb-1">منتظر تحصيله</p>
                    <p className="text-2xl font-bold text-blue-800">{formatCurrency(payments.filter(p => p.status === RentPaymentStatus.PENDING).reduce((acc, curr) => acc + curr.amountDue, 0))}</p>
                </Card>
            </div>

            <Card title="سجل الدفعات والمديونيات" actions={<Button size="sm" onClick={onAdd} leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>تسجيل دفعة</Button>}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 uppercase text-[11px] text-gray-500">
                            <tr>
                                <th className="px-4 py-3 text-right">المستأجر / العقد</th>
                                <th className="px-4 py-3 text-right">الفترة الإيجارية</th>
                                <th className="px-4 py-3 text-right">تاريخ الاستحقاق</th>
                                <th className="px-4 py-3 text-right">المبلغ المستحق</th>
                                <th className="px-4 py-3 text-right">المبلغ المدفوع</th>
                                <th className="px-4 py-3 text-right">طريقة الدفع</th>
                                <th className="px-4 py-3 text-right">الحالة</th>
                                <th className="px-4 py-3 text-right">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map(pay => {
                                const lease = leases.find(l => l.id === pay.leaseAgreementId);
                                const tenant = tenants.find(t => t.id === lease?.tenantId);
                                return (
                                    <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-xs">
                                            <div className="font-bold text-slate-900">{tenant?.fullNameAr || 'غير معروف'}</div>
                                            <div className="text-[10px] text-slate-500 font-mono uppercase">{lease?.contractNumber}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{pay.paymentForPeriod}</td>
                                        <td className="px-4 py-3 text-slate-50">{pay.dueDate ? formatDate(pay.dueDate) : '-'}</td>
                                        <td className="px-4 py-3 font-bold">{formatCurrency(pay.amountDue)}</td>
                                        <td className="px-4 py-3 text-green-600">{formatCurrency(pay.amountPaid)}</td>
                                        <td className="px-4 py-3 text-gray-500">{pay.paymentMethod || '-'}</td>
                                        <td className="px-4 py-3"><RentPaymentStatusBadge status={pay.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                 <Button variant="ghost" size="sm" title="تعديل" onClick={() => onEdit(pay)}><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                                 <Button variant="ghost" size="sm" title="حذف" onClick={() => onDelete(pay.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
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
    );
};

// 7. Lease Reports Tab
const LeaseReportsTab: React.FC<{ leases: LeaseAgreement[]; properties: Property[]; tenants: Tenant[] }> = ({ leases, properties, tenants }) => {
    const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportType, setReportType] = useState<'all' | 'expiring' | 'income'>('all');
    
    // Initializing with current month range
    useEffect(() => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setStartDate(firstDay);
        setEndDate(lastDay);
    }, []);

    const filteredLeases = useMemo(() => {
        let filtered = leases;

        // Filter by property
        if (selectedPropertyIds.length > 0) {
            filtered = filtered.filter(l => selectedPropertyIds.includes(l.propertyId));
        }

        // Filter by date range (if provided)
        if (startDate) {
            filtered = filtered.filter(l => new Date(l.startDate) >= new Date(startDate) || new Date(l.endDate) >= new Date(startDate));
        }
        if (endDate) {
            filtered = filtered.filter(l => new Date(l.startDate) <= new Date(endDate));
        }

        // Filter by report type
        if (reportType === 'expiring') {
            const thirtyDays = new Date();
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            filtered = filtered.filter(l => {
                const end = new Date(l.endDate);
                return end <= thirtyDays && end >= new Date() && l.status === LeaseAgreementStatus.ACTIVE;
            });
        }

        return filtered;
    }, [leases, selectedPropertyIds, startDate, endDate, reportType]);

    const togglePropertySelection = (id: string) => {
        setSelectedPropertyIds(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const totalRent = useMemo(() => {
        return filteredLeases.reduce((acc, curr) => acc + curr.rentAmount, 0);
    }, [filteredLeases]);

    return (
        <div className="space-y-6">
            <Card title="إعدادات التقرير المخصصة" className="no-print">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">الفترة الزمنية</label>
                        <div className="flex gap-2">
                            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} containerClassName="mb-0 text-xs" />
                            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} containerClassName="mb-0 text-xs" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">نوع التقرير</label>
                        <Select 
                            value={reportType} 
                            options={[
                                {value: 'all', label: 'كافة العقود في الفترة'},
                                {value: 'expiring', label: 'العقود التي ستنتهي قريباً'},
                                {value: 'income', label: 'تحليل الإيرادات'}
                            ]} 
                            onChange={e => setReportType(e.target.value as any)}
                            containerClassName="mb-0"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500">العقارات (المتعددة)</label>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 border rounded bg-gray-50">
                            {properties.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => togglePropertySelection(p.id)}
                                    className={`px-2 py-1 text-[10px] rounded-full transition-colors ${selectedPropertyIds.includes(p.id) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-end gap-2">
                        <Button variant="outline" size="sm" fullWidth onClick={() => { setSelectedPropertyIds([]); setStartDate(''); setEndDate(''); }}>إعادة تعيين</Button>
                        <Button variant="primary" size="sm" fullWidth leftIcon={<PrinterIcon className="w-4 h-4"/>} onClick={() => setTimeout(() => window.print(), 350)}>طباعة</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Card title={`نتائج التقرير (${filteredLeases.length} عقد)`}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-[11px] text-gray-600">
                                    <tr>
                                        <th className="px-4 py-3 text-right">المستأجر</th>
                                        <th className="px-4 py-3 text-right">العقار / الوحدة</th>
                                        <th className="px-4 py-3 text-right">البداية - النهاية</th>
                                        <th className="px-4 py-3 text-right">الإيجار</th>
                                        <th className="px-4 py-3 text-right">الحالة</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredLeases.map(l => {
                                        const tenant = tenants.find(t => t.id === l.tenantId);
                                        const prop = properties.find(p => p.id === l.propertyId);
                                        const unit = prop?.units?.find(u => u.id === l.unitId);
                                        return (
                                            <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-gray-800">{tenant?.fullNameAr}</span>
                                                    <p className="text-[10px] text-gray-400">{tenant?.phone}</p>
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <div className="font-medium">{prop?.name}</div>
                                                    <div className="text-gray-500">{unit ? `وحدة رقم ${unit.unitNumber}` : 'العقار بالكامل'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-[11px] text-slate-600">
                                                    <div>{formatDate(l.startDate)}</div>
                                                    <div className="text-gray-400">{formatDate(l.endDate)}</div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-primary font-bold">{formatCurrency(l.rentAmount)}</td>
                                                <td className="px-4 py-3"><LeaseAgreementStatusBadge status={l.status} /></td>
                                            </tr>
                                        );
                                    })}
                                    {filteredLeases.length === 0 && (
                                        <tr><td colSpan={5} className="text-center py-20 text-gray-400 italic">لا توجد سجلات مطابقة للفلتر المختار.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card title="ملخص التقرير المالي" className="bg-primary/5 border-primary/10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2 transition-all">
                                <span className="text-sm text-gray-600">إجمالي الإيجارات الشهرية:</span>
                                <span className="text-xl font-extrabold text-primary-dark">{formatCurrency(totalRent)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm text-gray-600">الإيراد السنوي المتوقع:</span>
                                <span className="text-xl font-extrabold text-green-700">{formatCurrency(totalRent * 12)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">عدد الوحدات المشمولة:</span>
                                <span className="text-lg font-bold">{filteredLeases.length}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="توقعات الإخلاء (3 أشهر)" className="bg-amber-50/30">
                        <div className="space-y-2">
                            {leases.filter(l => {
                                const end = new Date(l.endDate);
                                const threeMonths = new Date();
                                threeMonths.setMonth(threeMonths.getMonth() + 3);
                                return end <= threeMonths && end >= new Date() && l.status === LeaseAgreementStatus.ACTIVE;
                            }).slice(0, 3).map(l => (
                                <div key={l.id} className="p-2 border-r-2 border-amber-400 bg-white shadow-sm rounded-l flex justify-between items-center">
                                    <div className="text-xs">
                                        <p className="font-bold">{tenants.find(t=>t.id===l.tenantId)?.fullNameAr}</p>
                                        <p className="text-gray-500">{formatDate(l.endDate)}</p>
                                    </div>
                                    <BellAlertIcon className="w-4 h-4 text-amber-500" />
                                </div>
                            ))}
                            <Button variant="ghost" size="sm" fullWidth className="text-[10px]">عرض كافة الاستحقاقات القادمة</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const ReceiptModal: React.FC<{ payment: RentPayment | null; lease: LeaseAgreement | null; tenant: Tenant | null; property: Property | null; onClose: () => void }> = ({ payment, lease, tenant, property, onClose }) => {
    if (!payment || !lease || !tenant || !property) return null;

    return (
        <Modal isOpen={!!payment} onClose={onClose} title="إيصال استلام أجرة إيجارية" size="md">
            <div id="printable-receipt" className="p-8 bg-white text-slate-800 font-sans border-8 border-double border-slate-100 m-2 relative overflow-hidden" dir="rtl">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16"></div>
                
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-8 relative">
                    <div className="text-right">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter">مكتب صبري شطا للمحاماة</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sabri Shatta Law Office</p>
                    </div>
                    <div className="text-left font-mono">
                        <div className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-black mb-1">OFFICIAL RECEIPT</div>
                        <div className="text-sm font-bold text-slate-700">NO: {payment.id?.toUpperCase()}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 block uppercase">وصلني من السيد / Received From</span>
                            <span className="text-lg font-black text-slate-900 border-b border-slate-200 block pb-1">{tenant.fullNameAr}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 block uppercase">مبلغ وقدره / The Sum Of</span>
                            <span className="text-lg font-black text-primary border-b border-slate-200 block pb-1">{formatCurrency(payment.amountPaid)}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 block uppercase">عن القيمة الإيجارية لـ / For Rent Of</span>
                            <span className="text-sm font-bold text-slate-700">{payment.paymentForPeriod}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 block uppercase">العقار والوحدة / Property & Unit</span>
                            <span className="text-sm font-bold text-slate-700">{property.name} - وحدة {property.units?.find(u=>u.id===payment.leaseAgreementId)?.unitNumber || 'مبنى'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center mb-8">
                    <div className="flex gap-4">
                        <div>
                            <span className="text-[9px] font-black text-slate-400 block uppercase">طريقة الدفع / Payment Method</span>
                            <span className="text-xs font-bold text-slate-900">{payment.paymentMethod === PaymentMethod.KNET ? 'كي-نت' : payment.paymentMethod || 'نقداً'}</span>
                        </div>
                        <div className="border-r border-slate-200 pr-4">
                            <span className="text-[9px] font-black text-slate-400 block uppercase">تاريخ السداد / Date Of Payment</span>
                            <span className="text-xs font-bold text-slate-900 font-mono tracking-tighter">{formatDate(payment.paymentDate)}</span>
                        </div>
                    </div>
                    <div className="bg-white p-1 rounded border shadow-sm">
                        <div className="w-16 h-16 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=64x64&data= عدالة-نظام-العقارات')] bg-cover opacity-80"></div>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-12 pt-8">
                    <div className="text-center font-serif italic text-2xl text-slate-900 opacity-80 select-none">
                        S. Shatta
                    </div>
                    <div className="text-center">
                        <div className="w-32 border-b-2 border-slate-900 mx-auto mb-2"></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">توقيع المستلم / Receiver Signature</p>
                    </div>
                </div>

                <div className="mt-8 text-[8px] text-slate-400 text-center uppercase tracking-[0.2em]">
                    Powered by Adala - Intelligent Property Management Solutions
                </div>
            </div>

            <div className="flex justify-end p-4 border-t gap-3 no-print bg-slate-50">
                <Button variant="ghost" onClick={onClose}>إغلاق</Button>
                <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة الإيصال</Button>
            </div>
        </Modal>
    );
};

const PropertyCard: React.FC<{ property: Property; onEdit: (p: Property) => void; onDelete: (id: string) => void }> = ({ property, onEdit, onDelete }) => {
    const rentedUnits = property.units?.filter(u => u.status === PropertyUnitStatus.RENTED).length || 0;
    const totalUnits = property.units?.length || 0;
    const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;

    return (
        <Card className="p-0 overflow-hidden group hover:shadow-2xl transition-all duration-500 border-slate-100 bg-white dark:bg-slate-900">
            <div className="relative h-48 overflow-hidden">
                <img 
                    src={property.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800'} 
                    alt={property.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[10px] font-black text-primary bg-white/90 px-2 py-0.5 rounded-full uppercase tracking-widest mb-2 inline-block">
                                {property.propertyCategory}
                            </span>
                            <h3 className="text-xl font-black text-white leading-tight">{property.name}</h3>
                        </div>
                        {totalUnits > 0 && (
                            <div className="text-right">
                                <div className="text-[10px] font-bold text-white/60 mb-1">نسبة الإشغال</div>
                                <div className={`text-sm font-black ${occupancyRate >= 90 ? 'text-emerald-400' : occupancyRate >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                                    {occupancyRate}%
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => onEdit(property)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-primary transition-all shadow-lg">
                        <PencilIcon className="w-4 h-4"/>
                    </button>
                    <button onClick={() => onDelete(property.id)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-rose-500 hover:text-white transition-all shadow-lg">
                        <TrashIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>
            
            <div className="p-5">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                    <MapPinIcon className="w-3.5 h-3.5" />
                    <span className="font-bold line-clamp-1">{property.address}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-center flex flex-col items-center">
                        <Square3Stack3DIcon className="w-4 h-4 text-slate-400 mb-1"/>
                        <div className="text-sm font-black text-slate-800 dark:text-slate-200">{totalUnits}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">وحدات</div>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-center flex flex-col items-center">
                        <UsersIcon className="w-4 h-4 text-emerald-500 mb-1"/>
                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-400">{rentedUnits}</div>
                        <div className="text-[9px] font-bold text-emerald-500 uppercase">مؤجرة</div>
                    </div>
                    <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-center flex flex-col items-center">
                        <SparklesIcon className="w-4 h-4 text-rose-500 mb-1"/>
                        <div className="text-sm font-black text-rose-700 dark:text-rose-400">{property.units?.filter(u=>u.status === PropertyUnitStatus.VACANT).length}</div>
                        <div className="text-[9px] font-bold text-rose-500 uppercase">شاغرة</div>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <Link to="/property-management/reports" className="flex-grow">
                        <Button variant="ghost" size="sm" fullWidth className="text-primary hover:bg-primary/5 font-black gap-2">
                            <ChartBarIcon className="w-4 h-4"/>
                            إحصائيات متقدمة
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};

const QuickActionCard: React.FC<{ title: string; icon: React.ReactNode; link: string; color: string; description?: string }> = ({ title, icon, link, color, description }) => (
    <Link to={link} className={`flex items-center p-4 bg-white dark:bg-dm-card border rounded-lg shadow-sm hover:shadow-md transition-all group ${color} dark:border-gray-700`}>
        <div className={`p-3 rounded-full mr-4 group-hover:scale-110 transition-transform ${color.replace('border-', 'bg-').replace('-200', '-100')} ${color.replace('border-', 'text-').replace('-200', '-600')}`}>
            {icon}
        </div>
        <div className="ms-3">
            <h3 className="font-bold text-gray-800 dark:text-dm-text group-hover:text-primary-dark dark:group-hover:text-primary-light">{title}</h3>
            {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
    </Link>
);

const NoticesTab: React.FC<{ 
    notices: EvictionNoticeRecord[]; 
    leases: LeaseAgreement[]; 
    tenants: Tenant[]; 
    properties: Property[];
    onAdd: () => void; 
    onEdit: (n: EvictionNoticeRecord) => void;
    onDelete: (id: string) => void;
}> = ({ notices, leases, tenants, properties, onAdd, onEdit, onDelete }) => {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-4 p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30 items-center">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600">
                        <ExclamationTriangleIcon className="w-8 h-8"/>
                    </div>
                    <div className="flex-grow">
                        <h3 className="font-extrabold text-red-800 dark:text-red-300 text-lg">تحصين الحقوق العقارية</h3>
                        <p className="text-xs text-red-600 dark:text-red-400/80 leading-relaxed max-w-sm">إدارة الإنذارات العدلية ومتابعة ملفات الإخلاء القانوني لضمان تحصيل المديونيات واسترداد العقارات.</p>
                    </div>
                    <Button variant="danger" onClick={onAdd} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>إصدار إنذار</Button>
                </div>

                <div className="flex gap-4 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                        <ScaleIcon className="w-8 h-8"/>
                    </div>
                    <div>
                        <h3 className="font-extrabold text-blue-800 dark:text-blue-300 text-lg">النزاعات القضائية</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400/80 leading-relaxed">ربط العقارات بالدائرة المختصة بالمحكمة الكلية وتتبع أحكام أول درجة والاستئناف.</p>
                    </div>
                </div>
            </div>

            <Card title="سجل الإنذارات المرسلة والمتابعة القانونية">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                            <tr>
                                <th className="px-3 py-3 text-right">المستأجر</th>
                                <th className="px-3 py-3 text-right">العقار/الوحدة</th>
                                <th className="px-3 py-3 text-right">سبب الإنذار والتفاصيل</th>
                                <th className="px-3 py-3 text-right">تاريخ الإرسال</th>
                                <th className="px-3 py-3 text-right">الحالة</th>
                                <th className="px-3 py-3 text-right">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dm-card divide-y divide-gray-200 dark:divide-gray-700">
                            {notices.map(notice => {
                                const tenant = tenants.find(t => t.id === notice.tenantId);
                                const property = properties.find(p => p.id === notice.propertyId);
                                const unit = property?.units?.find(u => u.id === notice.unitId);
                                return (
                                    <tr key={notice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 group">
                                        <td className="px-3 py-2">
                                            <div className="font-bold text-slate-800 dark:text-gray-200">{tenant?.fullNameAr || 'غير معروف'}</div>
                                            <div className="text-[10px] text-gray-400 font-mono">Ref: {notice.id}</div>
                                        </td>
                                        <td className="px-3 py-2 text-xs">
                                            <div className="text-gray-700 dark:text-gray-300">{property?.name}</div>
                                            <div className="text-gray-500">وحدة: {unit?.unitNumber || '-'}</div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <p className="text-red-600 font-medium line-clamp-1 text-xs">{notice.reason}</p>
                                            {notice.notes && <p className="text-[10px] text-gray-400 mt-1">{notice.notes}</p>}
                                        </td>
                                        <td className="px-3 py-2 text-xs">{formatDate(notice.noticeDate)}</td>
                                        <td className="px-3 py-2">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                                notice.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                                                notice.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                                notice.status === 'LegalActionInProgress' ? 'bg-purple-100 text-purple-800' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {notice.status === 'Sent' ? 'تم الإرسال' : 
                                                 notice.status === 'Delivered' ? 'تم التسليم' : 
                                                 notice.status === 'LegalActionInProgress' ? 'إجراء قضائي' : 
                                                 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" title="معاينة وطباعة" className="text-blue-600"><PrinterIcon className="w-4 h-4"/></Button>
                                                <Button variant="ghost" size="sm" title="تعديل" onClick={() => onEdit(notice)}><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                                <Button variant="ghost" size="sm" title="حذف" onClick={() => onDelete(notice.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {notices.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-gray-400 italic">لا توجد إنذارات مسجلة للمتابعة.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- Main Component ---
export const PropertyManagementPage: React.FC = () => {
    const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<RentPayment | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'tenants' | 'leases' | 'payments' | 'notices' | 'reports' | 'maintenance' | 'documents'>('overview');
    const [searchTerm, setSearchTerm] = useState('');

    // State Management for Main Entities
    const [properties, setProperties] = useState<Property[]>(mockProperties);
    const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
    const [leases, setLeases] = useState<LeaseAgreement[]>(mockLeaseAgreements);
    const [payments, setPayments] = useState<RentPayment[]>(mockRentPayments);
    const [notices, setNotices] = useState<EvictionNoticeRecord[]>(mockEvictionNotices);

    // Modal States
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const [isLeaseModalOpen, setIsLeaseModalOpen] = useState(false);
    const [editingLease, setEditingLease] = useState<LeaseAgreement | null>(null);

    const [isPrintLeaseModalOpen, setIsPrintLeaseModalOpen] = useState(false);
    const [printingLease, setPrintingLease] = useState<LeaseAgreement | null>(null);

    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<EvictionNoticeRecord | null>(null);

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<RentPayment | null>(null);

    const [isCaseLinkModalOpen, setIsCaseLinkModalOpen] = useState(false);
    const [linkingTargetId, setLinkingTargetId] = useState<string | null>(null);

    // --- TAB RENDERING ---
    const renderOverviewTab = () => {
        const totalProperties = properties.length;
        const totalUnits = properties.reduce((acc, p) => acc + (p.units?.length || 0), 0);
        const rentedUnits = properties.reduce((acc, p) => acc + (p.units?.filter(u => u.status === PropertyUnitStatus.RENTED).length || 0), 0);
        const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;
        const totalMonthlyRevenue = payments
            .filter(p => {
                const payDate = new Date(p.paymentDate);
                const now = new Date();
                return payDate.getMonth() === now.getMonth() && payDate.getFullYear() === now.getFullYear();
            })
            .reduce((acc, p) => acc + p.amountPaid, 0);

        // Chart Data
        const occupancyData = [
            { name: 'مؤجرة', value: rentedUnits, color: '#0ea5e9' },
            { name: 'شاغرة', value: totalUnits - rentedUnits, color: '#f43f5e' }
        ];

        const revenueData = [
            { name: 'يناير', value: 4500 },
            { name: 'فبراير', value: 5200 },
            { name: 'مارس', value: 4800 },
            { name: 'أبريل', value: 6100 },
            { name: 'مايو', value: 5900 },
            { name: 'يونيو', value: totalMonthlyRevenue || 6500 },
        ];

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* 1. Top Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="إجمالي العقارات" 
                        value={totalProperties} 
                        trend={{ value: 12, isUp: true }}
                        icon={<BuildingOffice2Icon className="w-6 h-6" />}
                        bgClass="bg-primary/20"
                        colorClass="text-primary"
                    />
                    <StatCard 
                        title="نسبة الإشغال" 
                        value={`${occupancyRate}%`} 
                        trend={{ value: 5, isUp: true }}
                        icon={<ChartBarIcon className="w-6 h-6" />}
                        bgClass="bg-emerald-500/20"
                        colorClass="text-emerald-600"
                    />
                    <StatCard 
                        title="الإيراد الشهري" 
                        value={formatCurrency(totalMonthlyRevenue)} 
                        trend={{ value: 8, isUp: true }}
                        icon={<BanknotesIcon className="w-6 h-6" />}
                        bgClass="bg-amber-500/20"
                        colorClass="text-amber-600"
                    />
                    <StatCard 
                        title="تنبيهات نشطة" 
                        value={notices.filter(n => n.status === 'Sent').length} 
                        trend={{ value: 2, isUp: false }}
                        icon={<BellAlertIcon className="w-6 h-6" />}
                        bgClass="bg-rose-500/20"
                        colorClass="text-rose-600"
                    />
                </div>

                {/* 2. Charts & Insights Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 p-8 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                    <TrendingUpIcon className="w-6 h-6 text-primary"/>
                                    تحليل الإيرادات السنوية
                                </h3>
                                <p className="text-sm font-bold text-slate-400 mt-1">عرض تطور التحصيل النقدي الشهري</p>
                            </div>
                            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-black text-slate-600 outline-none">
                                <option>سنة 2024</option>
                                <option>سنة 2023</option>
                            </select>
                        </div>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} dy={10} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff' }}
                                        labelStyle={{ fontWeight: 'black', color: '#1e293b' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[400px]">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-10 flex items-center gap-2">
                            <ChartBarIcon className="w-6 h-6 text-emerald-500"/>
                            توزيع الوحدات
                        </h3>
                        <div className="h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={occupancyData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={10}
                                        dataKey="value"
                                    >
                                        {occupancyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <div className="text-3xl font-black text-slate-800 dark:text-white">{occupancyRate}%</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">إشغال</div>
                            </div>
                        </div>
                        <div className="mt-8 space-y-3">
                            {occupancyData.map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-800 dark:text-white">{item.value} وحدة</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* 3. Notifications & Recent Activity Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <Card className="p-8 border-none bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full -mr-32 -mt-32 opacity-20 blur-3xl"></div>
                        <div className="relative">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black flex items-center gap-2">
                                    <SparklesIcon className="w-6 h-6 text-primary-light"/>
                                    التنبيهات الذكية
                                </h3>
                                <span className="bg-primary/20 text-primary-light px-3 py-1 rounded-full text-xs font-black">4 تنبيهات جديدة</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="p-3 rounded-xl bg-orange-500/20 text-orange-400">
                                        <CalendarDaysIcon className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm">عقد إيجار قيد الانتهاء</h4>
                                        <p className="text-xs text-slate-400 mt-1">برج ناصر - وحدة 101 (تنتهي غداً)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
                                        <ExclamationTriangleIcon className="w-5 h-5"/>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm">تأخر في السداد</h4>
                                        <p className="text-xs text-slate-400 mt-1">3 مستأجرين تجاوزوا موعد الدفع بـ 5 أيام</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <ArrowPathIcon className="w-6 h-6 text-primary"/>
                                آخر النشاطات
                            </h3>
                            <Button variant="ghost" size="sm" className="text-xs font-black">عرض السجل الكامل</Button>
                        </div>
                        <div className="space-y-6">
                            {[
                                { user: 'أحمد محمود', Action: 'تحصيل إيجار', target: 'وحدة 302', time: 'منذ ساعتين', icon: <BanknotesIcon className="w-4 h-4 text-emerald-500"/> },
                                { user: 'خالد العتيبي', Action: 'تجديد عقد', target: 'فيلا السرة', time: 'منذ 5 ساعات', icon: <DocumentDuplicateIcon className="w-4 h-4 text-primary"/> },
                                { user: 'النظام', Action: 'أمر صيانة', target: 'برج ناصر', time: 'منذ يوم', icon: <WrenchScrewdriverIcon className="w-4 h-4 text-amber-500"/> },
                            ].map((act, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                            {act.icon}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-slate-800 dark:text-white">{act.user} <span className="text-slate-400 font-bold px-2">●</span> {act.Action}</div>
                                            <div className="text-xs text-slate-400 font-bold mt-1">{act.target}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-black text-slate-500">{act.time}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    // CRUD Handlers - Property
    const handleAddProperty = () => { setEditingProperty(null); setIsPropertyModalOpen(true); };
    const handleEditProperty = (prop: Property) => { setEditingProperty(prop); setIsPropertyModalOpen(true); };
    const handleDeleteProperty = (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا العقار؟')) setProperties(prev => prev.filter(p => p.id !== id));
    };
    const handleSaveProperty = (data: Property) => {
        if(editingProperty?.id) {
            setProperties(prev => prev.map(p => p.id === editingProperty.id ? data : p));
        } else {
            setProperties(prev => [{...data, id: `prop-${Date.now()}`}, ...prev]);
        }
        setIsPropertyModalOpen(false);
    };

    // CRUD Handlers - Tenant
    const handleAddTenant = () => { setEditingTenant(null); setIsTenantModalOpen(true); };
    const handleEditTenant = (t: Tenant) => { setEditingTenant(t); setIsTenantModalOpen(true); };
    const handleDeleteTenant = (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا المستأجر؟')) setTenants(prev => prev.filter(t => t.id !== id));
    };
    const handleSaveTenant = (data: Tenant) => {
        if(editingTenant?.id) {
            setTenants(prev => prev.map(t => t.id === editingTenant.id ? data : t));
        } else {
            setTenants(prev => [{...data, id: `t-${Date.now()}`}, ...prev]);
        }
        setIsTenantModalOpen(false);
    };

    // CRUD Handlers - Lease
    const handleAddLease = () => { setEditingLease(null); setIsLeaseModalOpen(true); };
    const handleEditLease = (l: LeaseAgreement) => { setEditingLease(l); setIsLeaseModalOpen(true); };
    const handlePrintLease = (l: LeaseAgreement) => { setPrintingLease(l); setIsPrintLeaseModalOpen(true); };
    
    // CRUD Notice
    const handleAddNotice = () => { setEditingNotice(null); setIsNoticeModalOpen(true); };
    const handleEditNotice = (n: EvictionNoticeRecord) => { setEditingNotice(n); setIsNoticeModalOpen(true); };
    const handleDeleteNotice = (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا الإنذار؟')) setNotices(prev => prev.filter(n => n.id !== id));
    };
    const handleSaveNotice = (data: EvictionNoticeRecord) => {
        if(editingNotice?.id) {
            setNotices(prev => prev.map(n => n.id === editingNotice.id ? data : n));
        } else {
            setNotices(prev => [{...data, id: `not-${Date.now()}`}, ...prev]);
        }
        setIsNoticeModalOpen(false);
    };

    // CRUD Payment
    const handleAddPayment = () => { setEditingPayment(null); setIsPaymentModalOpen(true); };
    const handleEditPayment = (p: RentPayment) => { setEditingPayment(p); setIsPaymentModalOpen(true); };
    const handleDeletePayment = (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذه الدفعة؟')) setPayments(prev => prev.filter(p => p.id !== id));
    };
    const handleSavePayment = (data: RentPayment) => {
        if(editingPayment?.id) {
            setPayments(prev => prev.map(p => p.id === editingPayment.id ? data : p));
        } else {
            setPayments(prev => [{...data, id: `pay-${Date.now()}`}, ...prev]);
        }
        setIsPaymentModalOpen(false);
    };

    const handleDeleteLease = (id: string) => {
        if(window.confirm('هل أنت متأكد من حذف هذا العقد؟')) setLeases(prev => prev.filter(l => l.id !== id));
    };
    const handleSaveLease = (data: LeaseAgreement) => {
        if(editingLease?.id) {
            setLeases(prev => prev.map(l => l.id === editingLease.id ? data : l));
        } else {
            setLeases(prev => [{...data, id: `lse-${Date.now()}`}, ...prev]);
        }
        setIsLeaseModalOpen(false);
    };

    const filteredTenants = useMemo(() => {
        return tenants.filter(t => t.fullNameAr.toLowerCase().includes(searchTerm.toLowerCase()) || t.phone.includes(searchTerm));
    }, [tenants, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                    <BuildingOffice2Icon className="w-8 h-8 text-primary me-3" />
                    <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">إدارة العقارات والأصول</h1>
                </div>
                  <div className="flex gap-4">
                    <Button onClick={handleAddProperty} leftIcon={<PlusCircleIcon className="w-5 h-5"/>} className="shadow-lg shadow-primary/20">عقار جديد</Button>
                    <Button onClick={handleAddTenant} variant="ghost" leftIcon={<UsersIcon className="w-5 h-5"/>} className="text-slate-600">مستأجر جديد</Button>
                </div>
            </div>

            {/* Quick Navigation Toolbar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <QuickActionCard title="تسوية المديونيات" description="جدولة ديون المستأجرين" icon={<ReceiptPercentIcon className="w-6 h-6"/>} link="/property-management/debt-settlement" color="border-yellow-200"/>
                <QuickActionCard title="طلبات الصيانة" description="متابعة الإصلاحات" icon={<WrenchScrewdriverIcon className="w-6 h-6"/>} link="/property-management/maintenance" color="border-blue-200"/>
                <QuickActionCard title="المستندات والأرشيف" description="وثائق الملكية والعقود" icon={<FolderIcon className="w-6 h-6"/>} link="/property-management/property-documents" color="border-purple-200"/>
                <button 
                  onClick={() => setActiveTab('reports')}
                  className="flex items-center p-4 bg-white dark:bg-dm-card border rounded-lg shadow-sm hover:shadow-md transition-all group border-green-200 dark:border-gray-700 text-right w-full"
                >
                  <div className="p-3 rounded-full mr-4 group-hover:scale-110 transition-transform bg-green-100 text-green-600">
                      <PresentationChartLineIcon className="w-6 h-6"/>
                  </div>
                  <div className="ms-3">
                      <h3 className="font-bold text-gray-800 dark:text-dm-text group-hover:text-primary-dark dark:group-hover:text-primary-light">تقارير الإدارة</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">المستأجرين وتواريخ الانتهاء</p>
                  </div>
                </button>
            </div>
            
            {/* Tabs Header - Finesse Design */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between mb-8">
                <div className="flex gap-2 p-1 overflow-x-auto scrollbar-none no-scrollbar">
                    {[
                        {id: 'overview', label: 'الرئيسية', icon: <PresentationChartLineIcon className="w-4 h-4"/>},
                        {id: 'properties', label: 'العقارات', icon: <BuildingOffice2Icon className="w-4 h-4"/>},
                        {id: 'maintenance', label: 'الصيانة', icon: <WrenchScrewdriverIcon className="w-4 h-4"/>},
                        {id: 'tenants', label: 'المستأجرين', icon: <UsersIcon className="w-4 h-4"/>},
                        {id: 'payments', label: 'المالية', icon: <BanknotesIcon className="w-4 h-4"/>},
                        {id: 'notices', label: 'الإنذارات', icon: <BellAlertIcon className="w-4 h-4"/>},
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
                <div className="hidden lg:flex items-center gap-2 px-6 border-r border-slate-100 ml-2">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && renderOverviewTab()}

                {activeTab === 'properties' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-right">
                        {properties.map(prop => <PropertyCard key={prop.id} property={prop} onEdit={handleEditProperty} onDelete={handleDeleteProperty} />)}
                    </div>
                )}

                {activeTab === 'maintenance' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">إدارة طلبات الصيانة</h2>
                                <p className="text-xs font-bold text-slate-400 mt-1">تتبع الإصلاحات، التكاليف، والفنيين</p>
                            </div>
                            <Link to="/property-management/maintenance">
                                <Button variant="primary" size="sm" className="shadow-lg shadow-primary/20">وحدة الصيانة المتكاملة</Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <Card className="p-10 border-none bg-gradient-to-br from-blue-600 to-blue-700 text-white relative overflow-hidden group">
                                <WrenchScrewdriverIcon className="absolute -bottom-10 -right-10 w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
                                <div className="relative">
                                    <h3 className="text-2xl font-black mb-4">الصيانة الوقائية</h3>
                                    <p className="text-blue-100 text-sm font-bold mb-8 leading-relaxed">جدولة الفحوصات الدورية للمصاعد، أنظمة التكييف، ومعدات الحريق لضمان سلامة الأصول.</p>
                                    <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">فتح الجدول</Button>
                                </div>
                             </Card>
                             <Card className="p-10 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 flex flex-col justify-center items-center text-center">
                                <div className="p-5 rounded-3xl bg-orange-50 text-orange-500 mb-6">
                                    <ArrowPathIcon className="w-10 h-10 animate-spin-slow" />
                                </div>
                                <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">مزامنة البيانات الحية</h4>
                                <p className="text-xs font-bold text-slate-400 max-w-xs">يتم الآن تحديث حالة الطلبات من المكتب الفني...</p>
                             </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm">
                            <div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white">المستودع الرقمي للأصول</h2>
                                <p className="text-xs font-bold text-slate-400 mt-1">عقود الملكية، المخططات الهندسية، وتراخيص البلدية</p>
                            </div>
                            <Link to="/property-management/property-documents">
                                <Button variant="primary" size="sm" className="shadow-lg shadow-primary/20">فتح الأرشيف</Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'وثائق التملك', count: 12, icon: <ShieldCheckIcon className="w-8 h-8"/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                                { title: 'عقود الإيجار', count: 45, icon: <DocumentDuplicateIcon className="w-8 h-8"/>, color: 'text-primary', bg: 'bg-primary/10' },
                                { title: 'تراخيص بلدية', count: 8, icon: <ScaleIcon className="w-8 h-8"/>, color: 'text-purple-500', bg: 'bg-purple-50' },
                            ].map((cat, i) => (
                                <Card key={i} className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                                    <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color} w-fit mb-6`}>
                                        {cat.icon}
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 dark:text-white mb-1">{cat.title}</h4>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{cat.count} مستند مؤرشف</div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'tenants' && (
                    <Card>
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <Input placeholder="بحث عن مستأجر..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="max-w-md mb-0" />
                            <Button size="sm" onClick={handleAddTenant} leftIcon={<PlusCircleIcon className="w-4"/>}>مستأجر جديد</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        {['الاسم', 'الجنسية', 'الهاتف', 'الحالة المالية', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dm-card divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredTenants.map(t => {
                                        const tenantLeases = leases.filter(l => l.tenantId === t.id);
                                        const overdue = payments.filter(p => tenantLeases.some(l => l.id === p.leaseAgreementId) && p.status === RentPaymentStatus.OVERDUE).length;
                                        return (
                                            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-3 py-2 font-medium">{t.fullNameAr}</td>
                                                <td className="px-3 py-2">{t.nationality}</td>
                                                <td className="px-3 py-2">{t.phone}</td>
                                                <td className="px-3 py-2">
                                                    {overdue > 0 ? 
                                                        <span className="text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit"><ExclamationTriangleIcon className="w-3 h-3 me-1"/> متعثر ({overdue})</span> 
                                                        : <span className="text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircleIcon className="w-3 h-3 me-1"/> منتظم</span>
                                                    }
                                                </td>
                                                <td className="px-3 py-2 flex gap-2">
                                                    <Button size="sm" variant="ghost" title="تعديل" onClick={() => handleEditTenant(t)}><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                                    <Button size="sm" variant="ghost" title="حذف" onClick={() => handleDeleteTenant(t.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'leases' && (
                    <Card>
                        <div className="p-4 border-b dark:border-gray-700 flex justify-end">
                             <Button size="sm" onClick={handleAddLease} leftIcon={<PlusCircleIcon className="w-4"/>}>عقد جديد</Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                        {['رقم العقد', 'العقار/الوحدة', 'المستأجر', 'القيمة الإيجارية', 'تاريخ البدء', 'تاريخ الانتهاء', 'الحالة', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-dm-card divide-y divide-gray-200 dark:divide-gray-700">
                                    {leases.map(lease => {
                                        const tenant = tenants.find(t => t.id === lease.tenantId);
                                        const prop = properties.find(p => p.id === lease.propertyId);
                                        const unit = prop?.units?.find(u => u.id === lease.unitId);
                                        const hasCase = lease.id === 'lse3';
                                        return (
                                            <tr key={lease.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="px-3 py-2">
                                                    <div className="font-mono text-xs">{lease.contractNumber}</div>
                                                    {hasCase && <div className="text-[9px] text-red-500 font-bold flex items-center gap-1 mt-1"><ScaleIcon className="w-2.5 h-2.5"/> مرتبط بملف قضائي</div>}
                                                </td>
                                                <td className="px-3 py-2">{prop?.name} {unit ? `- ${unit.unitNumber}` : ''}</td>
                                                <td className="px-3 py-2">{tenant?.fullNameAr}</td>
                                                <td className="px-3 py-2 font-bold text-primary-dark dark:text-primary-light">{lease.rentAmount} د.ك</td>
                                                <td className="px-3 py-2">{formatDate(lease.startDate)}</td>
                                                <td className="px-3 py-2">{formatDate(lease.endDate)}</td>
                                                <td className="px-3 py-2"><LeaseAgreementStatusBadge status={lease.status}/></td>
                                                <td className="px-3 py-2">
                                                     <div className="flex gap-1">
                                                        <Button size="sm" variant="ghost" title="تحرير العقد" onClick={() => handlePrintLease(lease)}><DocumentDuplicateIcon className="w-4 h-4 text-blue-600"/></Button>
                                                        <Button size="sm" variant="ghost" title="تعديل" onClick={() => handleEditLease(lease)}><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                                        <Button size="sm" variant="ghost" title="حذف" onClick={() => handleDeleteLease(lease.id)} className="text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                                                        <Button size="sm" variant="ghost" title="ربط بقضية" onClick={() => { setLinkingTargetId(lease.id); setIsCaseLinkModalOpen(true); }}><ScaleIcon className="w-4 h-4 text-purple-600"/></Button>
                                                     </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard title="إجمالي المحصل" value={formatCurrency(payments.filter(p=>p.status === RentPaymentStatus.PAID).reduce((a,b)=>a+b.amountPaid, 0))} icon={<BanknotesIcon className="w-6 h-6"/>} bgClass="bg-emerald-500/10" colorClass="text-emerald-600" />
                            <StatCard title="متأخرات في الذمة" value={formatCurrency(payments.filter(p=>p.status === RentPaymentStatus.OVERDUE).reduce((a,b)=>a+b.amountPaid, 0))} icon={<BellAlertIcon className="w-6 h-6"/>} bgClass="bg-rose-500/10" colorClass="text-rose-600" />
                            <StatCard title="عمليات هذا الشهر" value={payments.filter(p=>new Date(p.paymentDate).getMonth() === new Date().getMonth()).length} icon={<ArrowPathIcon className="w-6 h-6"/>} bgClass="bg-primary/10" colorClass="text-primary" />
                        </div>
                        
                        <Card className="p-0 overflow-hidden border-none shadow-xl">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-lg font-black text-slate-800 dark:text-white">سجل العمليات المالية</h3>
                                <Button size="sm" onClick={() => setIsPaymentModalOpen(true)} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>تحصيل جديد</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-100/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="px-6 py-4 text-right">التاريخ</th>
                                            <th className="px-6 py-4 text-right">المستأجر</th>
                                            <th className="px-6 py-4 text-right">العقار</th>
                                            <th className="px-6 py-4 text-right">المبلغ</th>
                                            <th className="px-6 py-4 text-right">الحالة</th>
                                            <th className="px-6 py-4 text-right">الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {payments.map(p => {
                                            const lease = leases.find(l => l.id === p.leaseAgreementId);
                                            const tenant = tenants.find(t => t.id === lease?.tenantId);
                                            const property = properties.find(prop => prop.id === lease?.propertyId);
                                            return (
                                                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs">{formatDate(p.paymentDate)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-black text-slate-800 dark:text-white">{tenant?.fullNameAr}</div>
                                                        <div className="text-[10px] text-slate-400 font-bold">هاتف: {tenant?.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{property?.name}</td>
                                                    <td className="px-6 py-4 font-black text-primary">{formatCurrency(p.amountPaid)}</td>
                                                    <td className="px-6 py-4">
                                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center ${
                                                            p.status === RentPaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 
                                                            p.status === RentPaymentStatus.PENDING ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                        }`}>
                                                            {p.status === RentPaymentStatus.PAID ? 'تم التحصيل' : p.status === RentPaymentStatus.PENDING ? 'قيد الانتظار' : 'متأخر'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex gap-2 justify-end">
                                                            <Button size="sm" variant="ghost" onClick={() => setSelectedPaymentForReceipt(p)} leftIcon={<PrinterIcon className="w-3 h-3"/>}>إيصال</Button>
                                                            <Button size="sm" variant="ghost" className="text-rose-500"><TrashIcon className="w-3 h-3"/></Button>
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

                {activeTab === 'notices' && <NoticesTab notices={notices} leases={leases} tenants={tenants} properties={properties} onAdd={handleAddNotice} onEdit={handleEditNotice} onDelete={handleDeleteNotice} />}
                {activeTab === 'reports' && <LeaseReportsTab leases={leases} properties={properties} tenants={tenants} />}
            </div>

            {/* --- Modals --- */}
            <ReceiptModal 
                payment={selectedPaymentForReceipt} 
                onClose={() => setSelectedPaymentForReceipt(null)}
                lease={leases.find(l => l.id === selectedPaymentForReceipt?.leaseAgreementId) || null}
                tenant={tenants.find(t => t.id === leases.find(l => l.id === selectedPaymentForReceipt?.leaseAgreementId)?.tenantId) || null}
                property={properties.find(p => p.id === leases.find(l => l.id === selectedPaymentForReceipt?.leaseAgreementId)?.propertyId) || null}
            />
            <PropertyFormModal 
                isOpen={isPropertyModalOpen} 
                onClose={() => setIsPropertyModalOpen(false)} 
                onSubmit={handleSaveProperty} 
                initialData={editingProperty} 
            />
            <TenantFormModal 
                isOpen={isTenantModalOpen} 
                onClose={() => setIsTenantModalOpen(false)} 
                onSubmit={handleSaveTenant} 
                initialData={editingTenant} 
            />
             <LeaseFormModal 
                isOpen={isLeaseModalOpen} 
                onClose={() => setIsLeaseModalOpen(false)} 
                onSubmit={handleSaveLease} 
                initialData={editingLease} 
                properties={properties}
                tenants={tenants}
            />
            <LeaseContractPrintModal 
                lease={printingLease} 
                tenant={tenants.find(t => t.id === printingLease?.tenantId) || null} 
                property={properties.find(p => p.id === printingLease?.propertyId) || null}
                onClose={() => setIsPrintLeaseModalOpen(false)}
            />
            <NoticeFormModal 
                isOpen={isNoticeModalOpen}
                onClose={() => setIsNoticeModalOpen(false)}
                onSubmit={handleSaveNotice}
                initialData={editingNotice}
                leases={leases}
                tenants={tenants}
                properties={properties}
            />
            <PaymentFormModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSubmit={handleSavePayment}
                initialData={editingPayment}
                leases={leases}
                tenants={tenants}
            />
            <CaseLinkModal 
                isOpen={isCaseLinkModalOpen} 
                onClose={() => setIsCaseLinkModalOpen(false)}
                onLink={(caseId) => {
                    alert(`تم ربط العقد بالملف القضائي رقم ${caseId}`);
                    setIsCaseLinkModalOpen(false);
                }}
            />
        </div>
    );
};

export default PropertyManagementPage;
