import React, { useState, useEffect, useMemo } from 'react';
import { 
    User, AlertTriangle, FilePen, ClipboardCheck, ShieldAlert, Award, Info, HelpCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { RequestType } from './request-types';

interface RequestFormProps {
    employees: any[];
    currentSelectedEmployee: any;
    selectedEmployeeId: string;
    onSelectEmployee: (id: string) => void;
    systemAlerts: string[];
    onSubmit: (payload: {
        requestType: RequestType;
        reasonNote: string;
        leaveType?: 'annual' | 'sick' | 'emergency' | 'maternity' | 'pilgrimage' | 'special';
        startDate?: string;
        endDate?: string;
        leaveDaysCount?: number;
        permissionDate?: string;
        permissionTimeRange?: string;
        permissionHours?: number;
        recipientName?: string;
        includeSalaryDetails?: boolean;
        language?: 'ar' | 'en';
        fieldToUpdate?: string;
        oldValue?: string;
        newValue?: string;
        loanAmount?: number;
        installmentsCount?: number;
        guarantorName?: string;
        trainingCourseTitle?: string;
        trainingProvider?: string;
        trainingCost?: number;
        deputationLocation?: string;
        deputationDurationDays?: number;
        deputationPerDiem?: number;
        requestedDept?: string;
        requestedTitle?: string;
        proposedSalary?: number;
        resumptionDate?: string;
        resumptionReferenceCode?: string;
        
        // End of Service
        eosReason?: 'resignation' | 'termination' | 'retirement' | 'other';
        serviceDurationYears?: number;
        serviceDurationMonths?: number;
        entitledToFullBonus?: boolean;
        calculatedIndemnityAmount?: number;
        
        customTitle?: string;
        customContent?: string;
    }) => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({
    employees,
    currentSelectedEmployee,
    selectedEmployeeId,
    onSelectEmployee,
    systemAlerts,
    onSubmit
}) => {
    // Form Local States
    const [formRequestType, setFormRequestType] = useState<RequestType>(RequestType.LEAVE);
    const [formReason, setFormReason] = useState('');
    
    // Sub-form States
    const [formLeaveType, setFormLeaveType] = useState<'annual' | 'sick' | 'emergency' | 'maternity' | 'pilgrimage' | 'special'>('annual');
    const [formStartDate, setFormStartDate] = useState('');
    const [formEndDate, setFormEndDate] = useState('');
    const [formLeaveDays, setFormLeaveDays] = useState(30);

    const [formPermDate, setFormPermDate] = useState('');
    const [formPermTime, setFormPermTime] = useState('');
    const [formPermHours, setFormPermHours] = useState(2);

    const [formRecipient, setFormRecipient] = useState('');
    const [formIncludeSalary, setFormIncludeSalary] = useState(true);
    const [formLanguage, setFormLanguage] = useState<'ar' | 'en'>('ar');

    const [formFieldToUpdate, setFormFieldToUpdate] = useState('');
    const [formOldValue, setFormOldValue] = useState('');
    const [formNewValue, setFormNewValue] = useState('');

    const [formLoanAmount, setFormLoanAmount] = useState(500);
    const [formInstallments, setFormInstallments] = useState(10);
    const [formGuarantor, setFormGuarantor] = useState('');

    const [formCourseTitle, setFormCourseTitle] = useState('');
    const [formCourseProvider, setFormCourseProvider] = useState('');
    const [formCourseCost, setFormCourseCost] = useState(0);

    const [formDeputLocation, setFormDeputLocation] = useState('');
    const [formDeputDays, setFormDeputDays] = useState(5);
    const [formDeputPerDiem, setFormDeputPerDiem] = useState(25);

    const [formReqDept, setFormReqDept] = useState('');
    const [formReqTitle, setFormReqTitle] = useState('');
    const [formReqSalary, setFormReqSalary] = useState(0);

    const [formResumDate, setFormResumDate] = useState('');
    const [formResumRef, setFormResumRef] = useState('');

    // End of Service state variables
    const [formEosReason, setFormEosReason] = useState<'resignation' | 'termination' | 'retirement' | 'other'>('resignation');
    const [formEosYears, setFormEosYears] = useState<number>(5);
    const [formEosMonths, setFormEosMonths] = useState<number>(0);

    const [formCustomTitle, setFormCustomTitle] = useState('');
    const [formCustomContent, setFormCustomContent] = useState('');

    // Pre-fill fields on employee change
    useEffect(() => {
        if (currentSelectedEmployee) {
            setFormReqSalary(currentSelectedEmployee.basicSalary + currentSelectedEmployee.allowancesAmount);
            
            // Auto-calculate approximate service years since joiningDate
            if (currentSelectedEmployee.joiningDate) {
                const join = new Date(currentSelectedEmployee.joiningDate);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - join.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const totalY = Math.floor(diffDays / 365);
                const totalM = Math.floor((diffDays % 365) / 30);
                
                setFormEosYears(totalY);
                setFormEosMonths(totalM);
            }
        }
    }, [currentSelectedEmployee]);

    // Live loan compliance check
    const isLoanCompliant = useMemo(() => {
        if (formRequestType !== RequestType.LOAN && formRequestType !== RequestType.ADVANCE) return true;
        if (!currentSelectedEmployee) return true;

        const maxLegalThreshold = currentSelectedEmployee.basicSalary * 2.5; 
        return formLoanAmount <= maxLegalThreshold;
    }, [formRequestType, formLoanAmount, currentSelectedEmployee]);

    // Live End of Service (EOS) Indemnity calculation according to Kuwait Labor Law
    const calculatedEosDetails = useMemo(() => {
        if (formRequestType !== RequestType.END_OF_SERVICE) {
            return {
                rawIndemnity: 0,
                finalIndemnity: 0,
                entitledPercent: 100,
                entitledToFullBonus: true,
                warningMessage: ""
            };
        }
        if (!currentSelectedEmployee) {
            return {
                rawIndemnity: 0,
                finalIndemnity: 0,
                entitledPercent: 100,
                entitledToFullBonus: true,
                warningMessage: "الرجاء اختيار الموظف أولاً لتفعيل حساب المستحقات."
            };
        }

        const basic = currentSelectedEmployee.basicSalary || 0;
        const allowances = currentSelectedEmployee.allowancesAmount || 0;
        const monthlySalary = basic + allowances;
        const dailyWage = monthlySalary / 26; // Under Kuwaiti Labor Law practice, daily wage is Monthly Wage / 26
        const totalYears = formEosYears + (formEosMonths / 12);

        // Calculate raw indemnity (Article 51 of Kuwait Labor Law)
        // 15 days of salary for each of the first 5 years
        // 30 days of salary for each subsequent year
        // Cap is 2 years' wage
        let rawIndemnity = 0;
        if (totalYears <= 5) {
            rawIndemnity = totalYears * 15 * dailyWage;
        } else {
            rawIndemnity = (5 * 15 * dailyWage) + ((totalYears - 5) * 30 * dailyWage);
        }

        // Apply maximum cap: 2 years' salary
        const maxCap = monthlySalary * 24;
        if (rawIndemnity > maxCap) {
            rawIndemnity = maxCap;
        }

        // Apply resignation reduction according to Article 53 (if resignation)
        let entitledPercent = 100;
        let warningMessage = "";
        let entitledToFullBonus = true;

        if (formEosReason === 'resignation') {
            if (totalYears < 3) {
                entitledPercent = 0;
                entitledToFullBonus = false;
                warningMessage = "حسب المادة 53 من القانون الكويتي: لا يستحق الموظف المستقيل أي مكافأة لخدمة أقل من 3 سنوات.";
            } else if (totalYears >= 3 && totalYears < 5) {
                entitledPercent = 50;
                entitledToFullBonus = false;
                warningMessage = "حسب المادة 53 من القانون الكويتي: يستحق الموظف المستقيل نصف المكافأة فقط (50%) لفترة الخدمة بين 3 و 5 سنوات.";
            } else if (totalYears >= 5 && totalYears < 10) {
                entitledPercent = 66.67;
                entitledToFullBonus = false;
                warningMessage = "حسب المادة 53 من القانون الكويتي: يستحق الموظف المستقيل ثلثي المكافأة فقط (66.6%) لفترة الخدمة بين 5 و 10 سنوات.";
            } else {
                entitledPercent = 100;
                entitledToFullBonus = true;
            }
        } else {
            // In case of termination / retirement / other
            if (totalYears < 1) {
                entitledPercent = 0;
                entitledToFullBonus = false;
                warningMessage = "حسب أحكام المادة 51: إنهاء خدمات الموظف دون إتمام عام كامل من الخدمة المتصلة لا يمنحه الحق في مكافأة نهاية الخدمة.";
            }
        }

        const finalIndemnity = Math.round(rawIndemnity * (entitledPercent / 100));

        return {
            rawIndemnity: Math.round(rawIndemnity),
            finalIndemnity,
            entitledPercent,
            entitledToFullBonus,
            warningMessage
        };
    }, [formRequestType, currentSelectedEmployee, formEosReason, formEosYears, formEosMonths]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        onSubmit({
            requestType: formRequestType,
            reasonNote: formReason,
            leaveType: formLeaveType,
            startDate: formStartDate,
            endDate: formEndDate,
            leaveDaysCount: formLeaveDays,
            permissionDate: formPermDate,
            permissionTimeRange: formPermTime,
            permissionHours: formPermHours,
            recipientName: formRecipient,
            includeSalaryDetails: formIncludeSalary,
            language: formLanguage,
            fieldToUpdate: formFieldToUpdate,
            oldValue: formOldValue,
            newValue: formNewValue,
            loanAmount: formLoanAmount,
            installmentsCount: formInstallments,
            guarantorName: formGuarantor,
            trainingCourseTitle: formCourseTitle,
            trainingProvider: formCourseProvider,
            trainingCost: formCourseCost,
            deputationLocation: formDeputLocation,
            deputationDurationDays: formDeputDays,
            deputationPerDiem: formDeputPerDiem,
            requestedDept: formReqDept,
            requestedTitle: formReqTitle,
            proposedSalary: formReqSalary,
            resumptionDate: formResumDate,
            resumptionReferenceCode: formResumRef,
            
            // End of Service data mapping
            eosReason: formEosReason,
            serviceDurationYears: formEosYears,
            serviceDurationMonths: formEosMonths,
            entitledToFullBonus: calculatedEosDetails.entitledToFullBonus,
            calculatedIndemnityAmount: calculatedEosDetails.finalIndemnity,

            customTitle: formCustomTitle,
            customContent: formCustomContent
        });

        // Reset some local states
        setFormReason('');
        setFormCustomTitle('');
        setFormCustomContent('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Selected Employee Checklist & Integration warnings */}
            <div className="space-y-6">
                <div className="bg-white dark:bg-[#1E3C50] p-6 border border-slate-200 dark:border-slate-800 shadow-sm rounded-[2rem] space-y-4 transition-all duration-300">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[#00796B] dark:text-accent" />
                        تكامل هوية الموظف والتدقيق العمالي المباشر
                    </h3>
                    
                    {currentSelectedEmployee ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00796B] to-teal-700 text-white flex items-center justify-center font-black text-center text-xs">
                                    {currentSelectedEmployee.fullNameAr[0]}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{currentSelectedEmployee.fullNameAr}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">{currentSelectedEmployee.jobTitle} • {currentSelectedEmployee.department}</p>
                                </div>
                            </div>

                            {/* Profile data integrations */}
                            <div className="space-y-2 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-450">الجنسية:</span>
                                    <span className="text-slate-900 dark:text-white">{currentSelectedEmployee.nationality}</span>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-450">رقم البطاقة المدنية:</span>
                                    <span className="text-slate-900 dark:text-white font-sans">{currentSelectedEmployee.civilId}</span>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-450">الرواتب الحالي المستحق:</span>
                                    <span className="text-[#00796B] dark:text-accent font-sans font-black">{(currentSelectedEmployee.basicSalary + currentSelectedEmployee.allowancesAmount).toLocaleString()} د.ك</span>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-450">رصيد الإجازات السنوية الحالي:</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{currentSelectedEmployee.remainingLeaveDays} يوماً</span>
                                </div>
                                <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-450">الحساب البنكي والآيبان:</span>
                                    <span className="text-slate-900 dark:text-white font-sans truncate max-w-[150px] ltr" title={currentSelectedEmployee.bankIban}>{currentSelectedEmployee.bankIban}</span>
                                </div>
                            </div>

                            {/* System Warnings Panel */}
                            {systemAlerts.length > 0 && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/30 rounded-2xl space-y-2">
                                    <span className="text-[10px] font-black text-amber-800 dark:text-accent flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-accent" />
                                        ملاحظات شؤون الامتثال والتحقيقات:
                                    </span>
                                    <ul className="list-disc ps-4 space-y-1 text-[9.5px] text-slate-700 dark:text-slate-350 font-semibold">
                                        {systemAlerts.map((alert, idx) => (
                                            <li key={idx} className="text-rose-600 dark:text-rose-400 font-bold">{alert}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">الرجاء اختيار الموظف لتأكيد بياناته المتكاملة والتدقيق الفوري.</p>
                    )}
                </div>

                {/* Kuwait regulatory compliance banner */}
                <div className="p-6 bg-gradient-to-br from-slate-900 to-[#005a4f] text-white rounded-[2rem] shadow-sm space-y-3 border-0">
                    <span className="inline-block px-2.5 py-0.5 bg-[#00796B]/35 border border-[#00796B]/40 text-emerald-300 rounded text-[9px] font-bold">فحص الامتثال الآلي النشط</span>
                    <h4 className="text-xs font-black text-white">مطابقة موازين قانون العمل الكويتي</h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed font-bold">
                        يقارن محرك "عدالة" حقول الإدخال حياً في الـ 14 نوع من الطلبات، مثل المباشرة، القروض، ونهاية الخدمة مع لوائح الخصم والحد الأقصى القانوني للاستقطاعات حماية للشركة من النزاعات.
                    </p>
                </div>
            </div>

            {/* Complete Comprehensive Form - 14 Request Types */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1E3C50] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 transition-all duration-300">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <FilePen className="w-5 h-5 text-[#00796B] dark:text-accent" />
                    صياغة وتوليد معاملة إدارية ذكية جديدة
                </h3>

                <form onSubmit={handleFormSubmit} className="space-y-6 text-xs text-right font-semibold">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Select employee */}
                        <div className="space-y-1 text-right">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">1. اختر الموظف المعني بالطلب:</label>
                            <select
                                value={selectedEmployeeId}
                                onChange={(e) => onSelectEmployee(e.target.value)}
                                className="w-full font-bold py-3 pr-8 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#00796B] dark:focus:border-accent focus:ring-0 bg-slate-50 dark:bg-[#102A3A]/40 text-slate-800 dark:text-slate-200 outline-none"
                                required
                            >
                                <option value="">اختر موظفاً...</option>
                                {employees.map(emp => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.fullNameAr} ({emp.jobTitle})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Request Type Selector (All 14 types) */}
                        <div className="space-y-1 text-right">
                            <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">2. حدد نوع المعاملة الإدارية (14 خيار):</label>
                            <select
                                value={formRequestType}
                                onChange={(e) => setFormRequestType(e.target.value as RequestType)}
                                className="w-full font-bold py-3 pr-8 border border-[#00796B]/30 dark:border-accent/30 rounded-xl focus:border-[#00796B] dark:focus:border-accent focus:ring-0 bg-[#00796B]/5 dark:bg-[#00796B]/15 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                                required
                            >
                                {Object.values(RequestType).map(type => (
                                    <option key={type} value={type}>
                                        {type === RequestType.LEAVE ? 'طلب إجازة دورية' :
                                         type === RequestType.PERMISSION ? 'طلب استئذان غياب' :
                                         type === RequestType.SALARY_CERTIFICATE ? 'شهادة تعريف راتب كويتي' :
                                         type === RequestType.CERTIFICATE ? 'طلب شهادة لمن يهمه الأمر' :
                                         type === RequestType.DATA_UPDATE ? 'تعديل البيانات القانونية' :
                                         type === RequestType.LOAN ? 'طلب قرض مالي للموظف' :
                                         type === RequestType.ADVANCE ? 'طلب سلفة راتب مقدمة' :
                                         type === RequestType.TRAINING ? 'طلب دورة تدريبية مهنية' :
                                         type === RequestType.DEPUTATION ? 'طلب انتداب ومهمة خارجية' :
                                         type === RequestType.TRANSFER ? 'طلب نقل بين الأقسام' :
                                         type === RequestType.PROMOTION ? 'طلب ترقية وتعديل مسمى' :
                                         type === RequestType.DUTY_RESUMPTION ? 'إقرار مباشرة عمل بالبصمة' :
                                         type === RequestType.END_OF_SERVICE ? 'تسوية مكافأة نهاية الخدمة (مادة 51/53)' : 'طلب مخصص آخر'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
                        <h4 className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mb-2">3. أدخل البيانات التكميلية النوعية للطلب:</h4>
                        
                        {/* Sub-form UI based on active RequestType */}
                        
                        {/* Type: Leave */}
                        {formRequestType === RequestType.LEAVE && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">نوع الإجازة:</label>
                                    <select 
                                        value={formLeaveType} 
                                        onChange={(e: any) => setFormLeaveType(e.target.value)}
                                        className="w-full font-bold py-2 px-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 focus:border-[#00796B] dark:focus:border-accent outline-none"
                                    >
                                        <option value="annual">سنوية دورية مسجلة</option>
                                        <option value="sick">مرضية معتمدة</option>
                                        <option value="emergency">طارئة وعائلية</option>
                                        <option value="maternity">أمومة ورعاية طفل</option>
                                        <option value="pilgrimage">حج وعمرة (مرة واحدة)</option>
                                        <option value="special">خاصة بدون راتب</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">تاريخ البدء:</label>
                                    <input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">تاريخ الانتهاء:</label>
                                    <input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">إجمالي الأيام المخصومة:</label>
                                    <input type="number" min="1" value={formLeaveDays} onChange={e => setFormLeaveDays(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}

                        {/* Type: Permission (استئذان) */}
                        {formRequestType === RequestType.PERMISSION && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">تاريخ الاستئذان المطلوب:</label>
                                    <input type="date" value={formPermDate} onChange={e => setFormPermDate(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الفترة والتوقيت (مثال: 08:00 - 10:00):</label>
                                    <input type="text" value={formPermTime} onChange={e => setFormPermTime(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">عدد الساعات الكلي:</label>
                                    <input type="number" min="1" max="4" value={formPermHours} onChange={e => setFormPermHours(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}

                        {/* Type: Salary Certificate (تعريف راتب) */}
                        {formRequestType === RequestType.SALARY_CERTIFICATE && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الجهة الموجه إليها الشهادة:</label>
                                    <input type="text" placeholder="مثال: بيت التمويل الكويتي / من يهمه الأمر" value={formRecipient} onChange={e => setFormRecipient(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1 flex items-center gap-2 pt-6">
                                    <input type="checkbox" checked={formIncludeSalary} onChange={e => setFormIncludeSalary(e.target.checked)} className="w-4 h-4 text-[#00796B] dark:text-accent border-slate-300 rounded focus:ring-0 cursor-pointer" />
                                    <label className="text-[10px] text-slate-650 dark:text-slate-300 block font-bold cursor-pointer">تضمين تفاصيل وبدلات البدء الحالية مالياً</label>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">لغة الشهادة الصادرة للطباعة:</label>
                                    <select value={formLanguage} onChange={(e: any) => setFormLanguage(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 focus:border-[#00796B] dark:focus:border-accent outline-none">
                                        <option value="ar">اللغة العربية (معتمدة حكومياً)</option>
                                        <option value="en">English (Official Translation)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Type: Certificate Request (شهادة) */}
                        {formRequestType === RequestType.CERTIFICATE && (
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">نوع ومسمى الشهادة المطلوبة:</label>
                                    <input type="text" placeholder="مثال: شهادة خبرة متسلسلة / شهادة لمن يهمه الأمر عمالية" value={formRecipient} onChange={e => setFormRecipient(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">لغة المستند:</label>
                                    <select value={formLanguage} onChange={(e: any) => setFormLanguage(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 focus:border-[#00796B] dark:focus:border-accent outline-none">
                                        <option value="ar">العربية</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Type: Data Update (تعديل بيانات) */}
                        {formRequestType === RequestType.DATA_UPDATE && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الحقل المرغوب في تعديله بملف الموظف:</label>
                                    <input type="text" placeholder="مثال: الآيبان البنكي / عنوان المنزل الحضور" value={formFieldToUpdate} onChange={e => setFormFieldToUpdate(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">القيمة في السجلات السابقة (الحالية):</label>
                                    <input type="text" value={formOldValue} onChange={e => setFormOldValue(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 font-sans text-center focus:border-[#00796B] dark:focus:border-accent outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">القيمة المقترحة المعدلة الجديدة:</label>
                                    <input type="text" value={formNewValue} onChange={e => setFormNewValue(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 font-sans text-center focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}

                        {/* Type: Loan & Advance (قرض وسلفة) */}
                        {(formRequestType === RequestType.LOAN || formRequestType === RequestType.ADVANCE) && (
                            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block">مبلغ التمويل المطلوب (د.ك):</label>
                                        <input type="number" min="100" value={formLoanAmount} onChange={e => setFormLoanAmount(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block">عدد أشهر السداد (أقساط):</label>
                                        <input type="number" min="1" max="24" value={formInstallments} onChange={e => setFormInstallments(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الضمان والمؤسسة الكفيلة للتعهد:</label>
                                        <input type="text" placeholder="مثال: التعهد بالخصم من مكافأة نهاية الخدمة" value={formGuarantor} onChange={e => setFormGuarantor(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                    </div>
                                </div>
                                
                                {/* Live labor check */}
                                {!isLoanCompliant && (
                                    <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-xl text-rose-850 dark:text-rose-400 text-[10px] flex items-center gap-1.5 font-bold animate-pulse">
                                        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                        <span>تنبيه امتثال كويتي: القيمة المطلوبة تتجاوز الحد الأقصى عمالياً براتب الموظف الحالي دون تصريح استثناء الشركاء!</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Type: Training Request (تدريب) */}
                        {formRequestType === RequestType.TRAINING && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">اسم البرنامج / الدورة المهنية القانونية:</label>
                                    <input type="text" placeholder="مثال: التحكيم الكويتي وعرائض الطعون" value={formCourseTitle} onChange={e => setFormCourseTitle(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الجهة والمركز التعليمي الموفر للدورة:</label>
                                    <input type="text" placeholder="مثال: معهد الدراسات القضائية" value={formCourseProvider} onChange={e => setFormCourseProvider(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">التكلفة والرسوم المغطاة (د.ك):</label>
                                    <input type="number" min="0" value={formCourseCost} onChange={e => setFormCourseCost(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}

                        {/* Type: Deputation Request (انتداب) */}
                        {formRequestType === RequestType.DEPUTATION && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الجهة والموقع الخارجي التكليف بها:</label>
                                    <input type="text" placeholder="مثال: هيئة الاستثمار / قصر العدل بالمرقاب" value={formDeputLocation} onChange={e => setFormDeputLocation(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">فترة الانتداب الإجمالية (أيام عمالية):</label>
                                    <input type="number" min="1" value={formDeputDays} onChange={e => setFormDeputDays(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">مخصص البدل واليومية المقررة (د.ك):</label>
                                    <input type="number" min="0" value={formDeputPerDiem} onChange={e => setFormDeputPerDiem(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}

                        {/* Type: Transfer (نقل قسم وظيفي) */}
                        {formRequestType === RequestType.TRANSFER && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">القسم المستهدف الجديد للموظف:</label>
                                    <input type="text" placeholder="مثال: إدارة المدافعة الكلية والتدقيق" value={formReqDept} onChange={e => setFormReqDept(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">المسمى الوظيفي المرغوب فيه تسكينه:</label>
                                    <input type="text" placeholder="مثال: مدقق أول إداري" value={formReqTitle} onChange={e => setFormReqTitle(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الراتب الجديد المطلوب للقسم الجديد (د.ك):</label>
                                    <input type="number" min="0" value={formReqSalary} onChange={e => setFormReqSalary(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" />
                                </div>
                            </div>
                        )}

                        {/* Type: Promotion (ترقية) */}
                        {formRequestType === RequestType.PROMOTION && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">المسمى والدرجة الجديدة المستهدفة للتسكين:</label>
                                    <input type="text" placeholder="مثال: مستشار قانوني شريك / باحث أول كفاءة" value={formReqTitle} onChange={e => setFormReqTitle(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">الراتب المقترح الشامل الكلي الجديد (د.ك):</label>
                                    <input type="number" min="100" value={formReqSalary} onChange={e => setFormReqSalary(parseInt(e.target.value))} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">تاريخ أثر الزيادة القانونية (تاريخ المعاملة):</label>
                                    <input type="date" value={formResumDate} onChange={e => setFormResumDate(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}

                        {/* Type: Duty Resumption (مباشرة عمل) */}
                        {formRequestType === RequestType.DUTY_RESUMPTION && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">تاريخ المباشرة الفعلي في الحضور بالبصمة:</label>
                                    <input type="date" value={formResumDate} onChange={e => setFormResumDate(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-500 dark:text-slate-400 block">رقم ورقم كود معاملة الإجازة الصادر المنقضية:</label>
                                    <input type="text" placeholder="مثال: QA-REQ-2026-003" value={formResumRef} onChange={e => setFormResumRef(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-250 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}

                        {/* Type: End of Service Settlement (تسوية نهاية الخدمة - مادة 51 / 53) */}
                        {formRequestType === RequestType.END_OF_SERVICE && (
                            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-[#102A3A]/40 border border-slate-200 dark:border-slate-800 relative group transition-all duration-300">
                                <h4 className="text-[11px] font-black text-amber-600 dark:text-accent flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    حسابات مستحقات نهاية الخدمة والتدقيق العمالي المباشر:
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block">مسوغ التصفية / سبب نهاية الخدمة:</label>
                                        <select
                                            value={formEosReason}
                                            onChange={(e: any) => setFormEosReason(e.target.value)}
                                            className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-220 focus:border-[#00796B] dark:focus:border-accent outline-none"
                                        >
                                            <option value="resignation">استقالة اختيارية من الموظف</option>
                                            <option value="termination">إنهاء خدمات من قبل الشركة</option>
                                            <option value="retirement">تقاعد اختياري وتصفية عمالية</option>
                                            <option value="other">أسباب أخرى قانونية</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block">سنوات الخدمة الفعلية:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="50"
                                            value={formEosYears}
                                            onChange={e => setFormEosYears(parseInt(e.target.value) || 0)}
                                            className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-220 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 dark:text-slate-400 block">أشهر إضافية للخدمة:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="11"
                                            value={formEosMonths}
                                            onChange={e => setFormEosMonths(parseInt(e.target.value) || 0)}
                                            className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-220 text-center font-sans focus:border-[#00796B] dark:focus:border-accent outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Live Settlement Results View */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800 pt-3 mt-1 text-[11px] font-bold">
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E3C50] border border-slate-150 dark:border-slate-800">
                                        <span className="text-slate-400 dark:text-slate-500 block text-[9px]">المكافأة التقديرية الخام:</span>
                                        <span className="text-slate-700 dark:text-slate-300 font-sans">{calculatedEosDetails.rawIndemnity.toLocaleString()} د.ك</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E3C50] border border-slate-150 dark:border-slate-800">
                                        <span className="text-slate-400 dark:text-slate-500 block text-[9px]">نسبة الاستحقاق (مادة 53):</span>
                                        <span className="text-[#00796B] dark:text-accent font-sans">{calculatedEosDetails.entitledPercent}%</span>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-[#00796B]/5 dark:bg-emerald-950/20 border border-[#00796B]/25 dark:border-emerald-800/40 col-span-2 md:col-span-1 flex flex-col justify-center">
                                        <span className="text-[#00796B] dark:text-emerald-400 block text-[9px] font-black">المستخلص النهائي للصرف:</span>
                                        <span className="text-emerald-700 dark:text-emerald-400 font-sans font-black text-xs">{calculatedEosDetails.finalIndemnity.toLocaleString()} د.ك</span>
                                    </div>
                                </div>

                                {/* Validation Warning Tooltip Panel (Help HR Audit) */}
                                {!calculatedEosDetails.entitledToFullBonus && (
                                    <div className="p-3.5 bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-start gap-2.5 animate-pulse relative group">
                                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-accent shrink-0 mt-0.5" />
                                        <div className="space-y-1 text-[10px] text-amber-905 dark:text-slate-300 leading-relaxed font-bold">
                                            <p className="font-black text-amber-800 dark:text-accent">تحذير تدقيق (HR Audit Tooltip):</p>
                                            <p>{calculatedEosDetails.warningMessage}</p>
                                            <p className="text-[9px] text-slate-450 dark:text-slate-400 mt-1">يُنصح بالتنسيق مع المستشار القانوني بالمجموعة للتحقق مما إذا كان قد تم التوقيع على مخالصة عمالية تامة براءة ذمة.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Type: Custom customizable request (طلب مخصص آخر) */}
                        {formRequestType === RequestType.CUSTOM && (
                            <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-right">
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-400 block">عنوان أو مسمى المستند المطلوب:</label>
                                    <input type="text" placeholder="مثال: تصريح استخدام حاسب آلي وعهد قانونية خاصة" value={formCustomTitle} onChange={e => setFormCustomTitle(e.target.value)} className="w-full font-bold py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-200 px-3 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] text-slate-400 block">نص أو شروط التخصيص والمطلوب:</label>
                                    <textarea placeholder="اكتب شروط الاستخدام أو تفاصيل وتخصيص البنود كاملة للطباعة..." value={formCustomContent} onChange={e => setFormCustomContent(e.target.value)} className="w-full h-24 p-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#1E3C50] text-slate-800 dark:text-slate-220 focus:border-[#00796B] dark:focus:border-accent outline-none" required />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text Reason Note */}
                    <div className="space-y-1 text-right">
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">4. المسوغ القانوني والملاحظات العامة (اختياري للتدقيق):</label>
                        <textarea 
                            rows={3} 
                            placeholder="اكتب أسباب وحقائق تقديم الطلب لتسجيلها في دورة المستند عمالياً..."
                            value={formReason}
                            onChange={e => setFormReason(e.target.value)}
                            className="w-full p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#00796B] dark:focus:border-accent focus:ring-0 bg-slate-50 dark:bg-[#102A3A]/40 font-bold outline-none text-slate-800 dark:text-slate-200"
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            size="lg"
                            className="px-8 py-3.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all font-black bg-[#00796B] hover:bg-[#00796B]/90 text-white"
                            disabled={!currentSelectedEmployee}
                        >
                            <ClipboardCheck className="w-4 h-4 text-emerald-100" />
                            توليد طلب إلكتروني وإدراج دورة الموافقات
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
