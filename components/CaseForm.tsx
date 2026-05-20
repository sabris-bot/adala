
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    Case, CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel, 
    LitigationStage, NotificationStatus 
} from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import TextArea from './ui/TextArea';
import LegalRoleSelector from './LegalRoleSelector';
import { 
    caseStatusOptions, courtLevelOptions, litigationStageOptions, 
    caseMainTypeOptions, riskLevelOptions, casePriorityOptions,
    notificationStatusOptions, KUWAIT_COURTS_LIST 
} from '../constants';
import { useToast } from './ui/Toast';

interface CaseFormProps {
    initialData?: Partial<Case>;
    existingCases: Case[];
    onSubmit: (caseData: Case) => void;
    onCancel: () => void;
}

const CaseForm: React.FC<CaseFormProps> = ({ initialData, existingCases, onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<Case>>(
        initialData || {
            title: '',
            caseNumber: '',
            internalCaseNumber: '',
            fileNumber: '',
            clientName: '',
            clientRole: 'مدعي',
            opposingPartyName: '',
            opponentRole: 'مدعى عليه',
            caseMainType: CaseMainType.COMMERCIAL,
            status: CaseStatus.OPEN,
            priority: CasePriority.NORMAL,
            riskLevel: RiskLevel.LOW,
            courtLevel: CourtLevel.FIRST_INSTANCE,
            litigationStage: LitigationStage.FIRST_INSTANCE,
            filingDate: new Date().toISOString().split('T')[0],
            notificationStatus: NotificationStatus.NOT_SUBMITTED,
        }
    );

    const [isDuplicate, setIsDuplicate] = useState(false);

    // Smart Duplicate Detection
    useEffect(() => {
        if (!formData.caseNumber || initialData?.id) {
            setIsDuplicate(false);
            return;
        }
        const duplicate = existingCases.find(c => c.caseNumber === formData.caseNumber);
        if (duplicate) {
            setIsDuplicate(true);
            addToast({
                type: 'warning',
                title: 'تنبيه تكرار',
                message: `الرقم الآلي ${formData.caseNumber} موجود مسبقاً للقضية: ${duplicate.title}`
            });
        } else {
            setIsDuplicate(false);
        }
    }, [formData.caseNumber, existingCases, initialData, addToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.caseNumber || !formData.clientName) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: 'يرجى تعبئة الحقول الإلزامية: عنوان القضية، رقم القضية، واسم الموكل.'
            });
            return;
        }
        onSubmit(formData as Case);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 p-1">
            {/* Classification & Numbers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm bg-white">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">التعريف والترقيم القضائي</h3>
                    <div className="space-y-4">
                        <Input 
                            name="title" 
                            label="عنوان القضية (*)" 
                            value={formData.title} 
                            onChange={handleChange} 
                            required 
                            placeholder="مثلاً: شركة الخليج ضد السيد خالد"
                            className="h-12 rounded-xl"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                name="caseNumber" 
                                label="الرقم الآلي للمحكمة (*)" 
                                value={formData.caseNumber} 
                                onChange={handleChange} 
                                required 
                                className={`h-12 rounded-xl ${isDuplicate ? 'border-amber-400 ring-2 ring-amber-50' : ''}`}
                            />
                            <Input 
                                name="fileNumber" 
                                label="رقم ملف المكتب" 
                                value={formData.fileNumber} 
                                onChange={handleChange} 
                                className="h-12 rounded-xl"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm bg-white">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">أطراف النزاع</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <Input name="clientName" label="اسم الموكل (*)" value={formData.clientName} onChange={handleChange} required className="h-12 rounded-xl" />
                            </div>
                            <div className="md:col-span-1">
                                <LegalRoleSelector 
                                    label="الصفة" 
                                    value={formData.clientRole || 'مدعي'} 
                                    isMulti={true}
                                    onChange={(val) => setFormData(prev => ({ ...prev, clientRole: val }))} 
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                                <Input name="opposingPartyName" label="اسم الخصم" value={formData.opposingPartyName} onChange={handleChange} className="h-12 rounded-xl" />
                            </div>
                            <div className="md:col-span-1">
                                <LegalRoleSelector 
                                    label="الصفة" 
                                    value={formData.opponentRole || 'مدعى عليه'} 
                                    isMulti={true}
                                    onChange={(val) => setFormData(prev => ({ ...prev, opponentRole: val }))} 
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Jurisdiction & Assignment */}
            <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm bg-white">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">جهة التقاضي والدوائر</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Select name="courtName" label="المحكمة المختصة" value={formData.courtName || ''} options={[{value:'', label: 'اختر المحكمة'}, ...KUWAIT_COURTS_LIST]} onChange={handleChange} className="h-12 rounded-xl" />
                    <Select name="courtLevel" label="درجة التقاضي" value={formData.courtLevel} options={courtLevelOptions} onChange={handleChange} className="h-12 rounded-xl" />
                    <Input name="circuit" label="الدائرة" value={formData.circuit || ''} onChange={handleChange} placeholder="مثلاً: مدني كلي 15" className="h-12 rounded-xl" />
                    <Input name="assignedLawyer" label="المحامي المسؤول" value={formData.assignedLawyer} onChange={handleChange} className="h-12 rounded-xl" />
                </div>
            </Card>

            {/* Dates & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm bg-white">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">المواعيد والقيد</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="filingDate" label="تاريخ رفع الدعوى" type="date" value={formData.filingDate} onChange={handleChange} className="h-12 rounded-xl" />
                        <Input name="statuteOfLimitationsDate" label="تاريخ التقادم" type="date" value={formData.statuteOfLimitationsDate} onChange={handleChange} className="h-12 rounded-xl" />
                        <Select name="status" label="حالة الملف" value={formData.status} options={caseStatusOptions} onChange={handleChange} className="h-12 rounded-xl" />
                        <Select name="priority" label="درجة الأهمية" value={formData.priority} options={casePriorityOptions} onChange={handleChange} className="h-12 rounded-xl" />
                    </div>
                </Card>

                <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm bg-primary/5">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6">الموضوع والطلبات</h3>
                    <div className="space-y-4">
                        <TextArea name="description" label="ملخص موضوع الدعوى" value={formData.description} onChange={handleChange} rows={2} className="rounded-xl" />
                        <TextArea name="legalDemands" label="الطلبات القانونية الختامية" value={formData.legalDemands} onChange={handleChange} rows={2} className="rounded-xl" />
                    </div>
                </Card>
            </div>

            {/* Financial Summary */}
            <Card className="p-8 rounded-[2rem] border-slate-100 shadow-sm bg-slate-900 text-white">
                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-8">البيانات المالية والأتعاب</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">إجمالي الأتعاب المتفق عليها</label>
                        <Input 
                            type="number" 
                            value={formData.financials?.totalFees || 0} 
                            onChange={(e) => setFormData(p => ({...p, financials: {...(p.financials || {paid:0, remaining:0, currency:'د.ك'}), totalFees: Number(e.target.value)}}))}
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl font-black italic"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المبلغ المسدد</label>
                        <Input 
                            type="number" 
                            value={formData.financials?.paid || 0} 
                            onChange={(e) => setFormData(p => ({...p, financials: {...(p.financials || {totalFees:0, remaining:0, currency:'د.ك'}), paid: Number(e.target.value)}}))}
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl font-black italic"
                        />
                    </div>
                    <div className="space-y-2 text-center flex flex-col justify-center">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">الرصيد المتبقي</label>
                        <span className="text-2xl font-black text-primary italic">
                            {(formData.financials?.totalFees || 0) - (formData.financials?.paid || 0)} 
                            <span className="text-[10px] mr-1">د.ك</span>
                        </span>
                    </div>
                </div>
            </Card>

            <div className="flex justify-end gap-3 sticky bottom-0 bg-white/90 dark:bg-dm-card/90 backdrop-blur-md pt-6 pb-2 border-t border-slate-100 dark:border-slate-800 z-10">
                <Button type="button" variant="outline" className="px-8 rounded-2xl h-12 font-black" onClick={onCancel}>إلغاء</Button>
                <Button type="submit" className="px-12 rounded-2xl h-12 font-black shadow-xl shadow-primary/20">
                    {initialData?.id ? 'تحديث ملف القضية' : 'فتح ملف تقاضي جديد'}
                </Button>
            </div>
        </form>
    );
};

export default CaseForm;
