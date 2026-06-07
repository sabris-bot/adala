import React, { useState, useMemo, useEffect } from 'react';
import { 
    X, Scale, Landmark, Calendar, ShieldAlert, Laptop, CheckSquare, Check, Sparkles, 
    ArrowRight, ArrowLeft, Key, UserCheck, Award, Briefcase, FileText, Printer, 
    ShieldCheck, Plus, Trash2, Download, Edit, Save, FileSignature, Sliders, AlertTriangle
} from 'lucide-react';
import { TerminationReasonKuwait, ContractTypeKuwait, EOS_Settlement, EOS_SettlementStatus } from '../../types';
import { initialExtendedEmployees, ExtendedEmployee } from '../../data/employeeExtendedData';
import { useLanguage } from '../i18n/LanguageProvider';
import { getDocTemplates, LegalDocTemplate } from './EndOfServiceTemplates';
import { EndOfServiceSalaryPanel } from './EndOfServiceSalaryPanel';
import { EndOfServiceOvertimePanel, OvertimeItem } from './EndOfServiceOvertimePanel';
import { EndOfServiceResignationSettings, ResignationThresholds } from './EndOfServiceResignationSettings';

interface EndOfServiceWizardProps {
    onClose: () => void;
    onSave: (record: EOS_Settlement) => void;
    editCase: EOS_Settlement | null;
}

// In-memory defaults or statutory termination catalog
const STATUTORY_SCENARIOS = [
    { value: TerminationReasonKuwait.DISMISSAL_WITH_NOTICE, labelAr: 'إنهاء العقد من قبل الإدارة (مع مهلة إخطار) - كامل الاستحقاق', labelEn: 'Employer Termination with Notice - Full Gratuity', article: 'مادة 44 / مادة 51', multiplier: 1 },
    { value: TerminationReasonKuwait.RESIGNATION, labelAr: 'استقالة بقرار من العامل (تخضع لخصم سنوات الخدمة مادة 53)', labelEn: 'Standard Resignation (Accruing Career Multipliers)', article: 'مادة 53', multiplier: 1 },
    { value: TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41, labelAr: 'فصل تأديبي بسبب خطأ جسيم أو انقطاع العمل (المادة 41) - حرمان تام', labelEn: 'Disciplinary Forfeiture Dismissal (Article 41) - No Gratuity', article: 'مادة 41', multiplier: 0 },
    { value: TerminationReasonKuwait.CONTRACT_EXPIRY, labelAr: 'انتهاء فترة العقد المحدد بالكامل دون رغبة بالتجديد - استحقاق كامل', labelEn: 'Fixed Contract Expiry - Full Gratuity', article: 'مادة 51', multiplier: 1 },
    { value: TerminationReasonKuwait.CLOSURE_OR_BANKRUPTCY, labelAr: 'إغلاق المنشأة الجبري أو الحكم بالإفلاس التجاري - استحقاق كامل', labelEn: 'Bankruptcy or Force Majeure Closure - Full Gratuity', article: 'مادة 51', multiplier: 1 },
    { value: TerminationReasonKuwait.RETIREMENT, labelAr: 'تقاعد اختياري أو بلوغ السن القانونية للمهنة', labelEn: 'Statutory Retirement - Full Gratuity', article: 'مادة 51', multiplier: 1 },
    { value: TerminationReasonKuwait.DEATH, labelAr: 'وفاة العامل في المرفق (تؤول الديات والمفات لورثته الشرعيين)', labelEn: 'Employee Decease - Benefits Transfer to Legal Heirs', article: 'مادة 51', multiplier: 1 },
    { value: TerminationReasonKuwait.TOTAL_DISABILITY, labelAr: 'عجز كلي أو مرض عضال يمنع بشكل مانع عن العمل والقدرة الكسبية', labelEn: 'Total Occupational Disability - Full Gratuity', article: 'مادة 51', multiplier: 1 },
    { value: TerminationReasonKuwait.CONSENSUAL_TERMINATION, labelAr: 'إنهاء العقد الودي بالتراضي المتبادل واتفاق الصلح الفردي', labelEn: 'Mutual Separation Consent - Negotiated Gratuity', article: 'مادة 51', multiplier: 1 },
    { value: TerminationReasonKuwait.MARRIAGE_RESIGNATION_WOMEN, labelAr: 'استقالة العاملة بسبب الزواج خلال سنة من عقده (مادة 54) - كامل الاستحقاق', labelEn: 'Resignation of Female Worker Due to Marriage (Art 54) - Full Gratuity', article: 'مادة 54', multiplier: 1 },
    { value: TerminationReasonKuwait.RESIGNATION_ART_48_EMPLOYER_FAULT, labelAr: 'ترك العمل بسبب خطأ جسيم أو اعتداء مادي من صاحب العمل (مادة 48)', labelEn: 'Separation for Severe Employer Fault or Assault (Art 48)', article: 'مادة 48', multiplier: 1 }
];

export const EndOfServiceWizard: React.FC<EndOfServiceWizardProps> = ({ onClose, onSave, editCase }) => {
    const { language } = useLanguage();
    const isAr = language === 'ar';

    // Load dynamic office name to keep it synchronized with the rest of the system
    const officeNameAr = useMemo(() => {
        try {
            const savedOffice = localStorage.getItem('profile_office_info');
            if (savedOffice) {
                const parsed = JSON.parse(savedOffice);
                if (parsed.name) return parsed.name;
            }
        } catch (e) {
            console.error('Failed to load office name inside EndOfServiceWizard', e);
        }
        return "مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية";
    }, []);

    // 1. STATE CONFIGURATION
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [linkedEmployee, setLinkedEmployee] = useState<ExtendedEmployee | null>(null);

    // Active role switcher to preview signatures/approvals in real-time
    const [activeUserRole, setActiveUserRole] = useState<'hr' | 'legal' | 'finance' | 'gm'>('hr');

    // Resignation custom thresholds state
    const [resThresholds, setResThresholds] = useState<ResignationThresholds>({
        under3Years: 0,
        threeToFiveYears: 50,
        fiveToTenYears: 66.67,
        overTenYears: 100
    });

    // Custom Scenarios List (Persisted)
    const [customScenarios, setCustomScenarios] = useState<any[]>(() => {
        const cached = localStorage.getItem('adalah_eos_custom_scenarios');
        return cached ? JSON.parse(cached) : [];
    });

    // Custom Scenario Adder Modal/fields
    const [customScenarioNameAr, setCustomScenarioNameAr] = useState('');
    const [customScenarioNameEn, setCustomScenarioNameEn] = useState('');
    const [customScenarioArticle, setCustomScenarioArticle] = useState('مادة مخصصة');
    const [customScenarioMultiplier, setCustomScenarioMultiplier] = useState(100);
    const [showCustomScenarioForm, setShowCustomScenarioForm] = useState(false);

    // Main Form Fields State
    const [formFields, setFormFields] = useState({
        employeeName: '',
        employeeCivilId: '',
        jobTitle: 'موظف بقطاع المباشرة',
        department: 'قطاع العقود والاستشارات',
        nationality: 'كويتي',
        joiningDate: '2022-01-01',
        lastWorkingDay: '2026-05-25',
        contractType: ContractTypeKuwait.UNLIMITED,
        terminationReason: TerminationReasonKuwait.RESIGNATION,
        
        // Salaries
        basicSalary: 650,
        housingAllowance: 100,
        transportAllowance: 50,
        phoneAllowance: 20,
        positionAllowance: 0,
        otherAllowances: 0,

        // Adjustments & items
        otherBonuses: 0,
        loansDeduction: 0,
        absenceDays: 0,
        disciplinaryDeductions: 0,
        unpaidLeaveDays: 0,
        socialInsuranceDeduction: 0,
        leaveBalanceDays: 30,

        // Assets
        companyLaptopReturned: true,
        companyPhoneReturned: true,
        companyKeysReturned: true,
        accessBadgesReturned: true,

        // Notes and custom info
        notes: ''
    });

    // Overtime state items
    const [overtimeAmount, setOvertimeAmount] = useState<number>(0);
    const [overtimeItems, setOvertimeItems] = useState<OvertimeItem[]>([]);

    // Signoffs
    const [approvals, setApprovals] = useState({
        hr: '',
        legal: '',
        finance: '',
        gm: ''
    });

    const [comment, setComment] = useState<string>('');

    // Pre-print Template Editor State
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('final_settlement');
    const [editedTemplateContents, setEditedTemplateContents] = useState<string>('');
    const [allTemplatesList, setAllTemplatesList] = useState<LegalDocTemplate[]>([]);

    // 2. LIFECYCLE SYNC
    useEffect(() => {
        if (editCase) {
            setFormFields({
                employeeName: editCase.employeeName,
                employeeCivilId: editCase.employeeId,
                jobTitle: editCase.jobTitle || 'موظف بقطاع المباشرة',
                department: editCase.department || 'قطاع العقود والاستشارات',
                nationality: editCase.nationality || 'كويتي',
                joiningDate: editCase.joiningDate || '2022-01-01',
                lastWorkingDay: editCase.lastWorkingDay || '2026-05-25',
                contractType: (editCase.contractType as ContractTypeKuwait) || ContractTypeKuwait.UNLIMITED,
                terminationReason: editCase.terminationReason,
                
                basicSalary: editCase.basicSalary,
                housingAllowance: 0,
                transportAllowance: 0,
                phoneAllowance: 0,
                positionAllowance: 0,
                otherAllowances: editCase.allowances || 0,

                otherBonuses: editCase.otherBonuses || 0,
                loansDeduction: editCase.loansDeduction || 0,
                absenceDays: editCase.absenceDays || 0,
                disciplinaryDeductions: editCase.disciplinaryDeductions || 0,
                unpaidLeaveDays: editCase.unpaidLeaveDays || 0,
                socialInsuranceDeduction: editCase.socialInsuranceDeduction || 0,
                leaveBalanceDays: editCase.leaveBalanceDays || 30,

                companyLaptopReturned: true,
                companyPhoneReturned: true,
                companyKeysReturned: true,
                accessBadgesReturned: true,
                notes: editCase.notes || ''
            });

            if (editCase.approvals) {
                setApprovals(editCase.approvals);
            }

            const matchedEmp = initialExtendedEmployees.find(e => e.civilId === editCase.employeeId);
            if (matchedEmp) {
                setLinkedEmployee(matchedEmp);
                setSelectedEmployeeId(matchedEmp.id);
            }
        }
    }, [editCase]);

    // Handle Employee DB sync
    const handleEmployeeSelection = (id: string) => {
        setSelectedEmployeeId(id);
        if (!id) {
            setLinkedEmployee(null);
            return;
        }

        const emp = initialExtendedEmployees.find(e => e.id === id);
        if (!emp) return;

        setLinkedEmployee(emp);

        // Summarize values
        const allowancesSum = emp.allowances?.reduce((sum, item) => sum + item.value, 0) || 0;
        const leaveDaysSum = emp.leaveRequests?.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.days, 0) || 0;
        const activeLoansSum = emp.loans?.filter(l => l.status === 'Active').reduce((sum, l) => sum + l.balanceAmount, 0) || 0;
        const disciplinaryPenaltySum = emp.disciplinaryActions?.filter(d => d.status === 'Approved' && d.penaltyAmount).reduce((sum, d) => sum + (d.penaltyAmount || 0), 0) || 0;

        setFormFields(prev => ({
            ...prev,
            employeeName: isAr ? emp.fullNameAr : (emp.fullNameEn || emp.fullNameAr),
            employeeCivilId: emp.civilId,
            jobTitle: emp.jobTitle,
            department: emp.department || 'إداري',
            nationality: emp.nationality || 'كويتي',
            basicSalary: emp.basicSalary,
            housingAllowance: 0,
            transportAllowance: 0,
            phoneAllowance: 0,
            positionAllowance: 0,
            otherAllowances: allowancesSum,
            leaveBalanceDays: Math.max(0, 30 - leaveDaysSum),
            loansDeduction: activeLoansSum,
            disciplinaryDeductions: disciplinaryPenaltySum,
            joiningDate: emp.joiningDate || '2022-01-01',
            notes: isAr 
                ? `تم ربط التصفية الشاملة تلقائياً بسجل الموظف رقم الكادر (${emp.employeeId}).`
                : `Dossier bound automatically to employee staff record ID (${emp.employeeId}).`
        }));
    };

    // Custom scenario adder
    const handleAddCustomScenario = () => {
        if (!customScenarioNameAr || !customScenarioNameEn) {
            alert(isAr ? 'يرجى تقديم اسم المبرر بالعربية والإنجليزية' : 'Please provide scenario name in Arabic & English');
            return;
        }
        const valSeed = `CUSTOM_${Date.now()}`;
        const newScenario = {
            value: valSeed,
            labelAr: customScenarioNameAr,
            labelEn: customScenarioNameEn,
            article: customScenarioArticle,
            multiplier: customScenarioMultiplier / 100,
            isCustom: true
        };

        const updated = [...customScenarios, newScenario];
        setCustomScenarios(updated);
        localStorage.setItem('adalah_eos_custom_scenarios', JSON.stringify(updated));

        setFormFields(p => ({ ...p, terminationReason: valSeed as any }));

        setCustomScenarioNameAr('');
        setCustomScenarioNameEn('');
        setCustomScenarioArticle('مادة مخصصة');
        setCustomScenarioMultiplier(100);
        setShowCustomScenarioForm(false);
    };

    const handleRemoveCustomScenario = (val: string) => {
        const updated = customScenarios.filter(x => x.value !== val);
        setCustomScenarios(updated);
        localStorage.setItem('adalah_eos_custom_scenarios', JSON.stringify(updated));
        setFormFields(p => ({ ...p, terminationReason: TerminationReasonKuwait.RESIGNATION }));
    };

    // Comprehensive scenario catalog
    const mergedScenarios = useMemo(() => {
        return [...STATUTORY_SCENARIOS, ...customScenarios];
    }, [customScenarios]);

    // Active scenario metadata helper
    const activeScenarioMeta = useMemo(() => {
        return mergedScenarios.find(x => x.value === formFields.terminationReason) || {
            value: formFields.terminationReason,
            labelAr: 'مبرر إنهاء مخصص مضاف',
            labelEn: 'Custom Termination Scenario',
            article: 'عرف إداري',
            multiplier: 1
        };
    }, [formFields.terminationReason, mergedScenarios]);

    // 3. KUWAIT LABOR LAW CALCULATION ENGINE
    const derivedCalculation = useMemo(() => {
        // Date computations
        const start = new Date(formFields.joiningDate);
        const end = new Date(formFields.lastWorkingDay);
        let diffMs = end.getTime() - start.getTime();
        
        if (diffMs < 0) diffMs = 0;
        
        const totalWorkedDaysAll = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const years = Math.floor(totalWorkedDaysAll / 365);
        const remainingDaysAfterYears = totalWorkedDaysAll % 365;
        const months = Math.floor(remainingDaysAfterYears / 30);
        const days = remainingDaysAfterYears % 30;

        // Salary Basis
        const grossSalary = formFields.basicSalary + formFields.housingAllowance + formFields.transportAllowance + 
                            formFields.phoneAllowance + formFields.positionAllowance + formFields.otherAllowances;
        const dailyRate = grossSalary / 26;

        // Gratuity computation under Article 51 / 53
        let rawIndemnity = 0;
        const careerSpanYears = totalWorkedDaysAll / 365;

        // Kuwait Private Sector formula:
        // - First 5 years: 15 days of salary per year = 15/26 of salary per year.
        // - Subsequent years: 30 days of salary (1 month) per year = 30/26 of salary per year.
        if (careerSpanYears > 0) {
            if (careerSpanYears <= 5) {
                rawIndemnity = (15 / 26) * grossSalary * careerSpanYears;
            } else {
                const first5YearsGrad = (15 / 26) * grossSalary * 5;
                const subsequentGrad = grossSalary * (careerSpanYears - 5);
                rawIndemnity = first5YearsGrad + subsequentGrad;
            }
        }

        // Apply Cap (1.5 years salary ceiling = 18 months salary)
        const maxIndemnityCap = grossSalary * 18;
        const beforeCap = rawIndemnity;
        const indemnityAfterCap = rawIndemnity > maxIndemnityCap ? maxIndemnityCap : rawIndemnity;

        // Apply resignation multiplier dynamically based on user settings (Article 53)
        let appliedResignationFactor = 1.0;
        const isResignAction = String(formFields.terminationReason).includes('RESIGNATION') || formFields.terminationReason === TerminationReasonKuwait.RESIGNATION;

        if (isResignAction) {
            if (careerSpanYears < 3) {
                appliedResignationFactor = resThresholds.under3Years / 100;
            } else if (careerSpanYears >= 3 && careerSpanYears < 5) {
                appliedResignationFactor = resThresholds.threeToFiveYears / 100;
            } else if (careerSpanYears >= 5 && careerSpanYears < 10) {
                appliedResignationFactor = resThresholds.fiveToTenYears / 100;
            } else {
                appliedResignationFactor = resThresholds.overTenYears / 100;
            }
        } else {
            // Apply the scenario multiplier directly
            appliedResignationFactor = (activeScenarioMeta as any).multiplier !== undefined ? (activeScenarioMeta as any).multiplier : 1.0;
        }

        const finalIndemnity = indemnityAfterCap * appliedResignationFactor;

        // Leave Pay computation
        const accruedLeavePay = formFields.leaveBalanceDays * dailyRate;

        // Overtime addition integration
        const otAdditions = overtimeAmount;

        // Total additions pre deductions
        const grossEarnings = finalIndemnity + accruedLeavePay + formFields.otherBonuses + otAdditions;

        // Deductions Ledger
        const missingAssetCharges = (
            (!formFields.companyLaptopReturned ? 450 : 0) +
            (!formFields.companyPhoneReturned ? 120 : 0) +
            (!formFields.companyKeysReturned ? 25 : 0) +
            (!formFields.accessBadgesReturned ? 15 : 0)
        );

        const absenceDeduction = formFields.absenceDays * dailyRate;
        const grossDeductions = formFields.loansDeduction + absenceDeduction + formFields.disciplinaryDeductions + missingAssetCharges + formFields.socialInsuranceDeduction;

        // Absolute Final Settlement net payable
        const netPayable = Math.max(0, grossEarnings - grossDeductions);

        return {
            years,
            months,
            days,
            decimalYears: careerSpanYears,
            grossSalary,
            dailyRate,
            beforeCap,
            maxIndemnityCap,
            gratuityAfterCap: indemnityAfterCap,
            resignationMultiplier: appliedResignationFactor,
            finalIndemnity,
            accruedLeavePay,
            otAdditions,
            grossEarnings,
            missingAssetCharges,
            absenceDeduction,
            grossDeductions,
            netPayable
        };
    }, [formFields, resThresholds, activeScenarioMeta, overtimeAmount]);

    // Build template array list
    const legalTemplatesCatalog = useMemo(() => {
        const grossSalary = formFields.basicSalary + formFields.housingAllowance + formFields.transportAllowance + 
                            formFields.phoneAllowance + formFields.positionAllowance + formFields.otherAllowances;

        return getDocTemplates({
            employeeName: formFields.employeeName,
            employeeCivilId: formFields.employeeCivilId,
            jobTitle: formFields.jobTitle,
            department: formFields.department,
            joiningDate: formFields.joiningDate,
            lastWorkingDay: formFields.lastWorkingDay,
            netPayable: derivedCalculation.netPayable,
            basicSalary: formFields.basicSalary,
            allowances: grossSalary - formFields.basicSalary,
            grossSalary: grossSalary,
            indemnityAmount: derivedCalculation.finalIndemnity,
            leaveBalanceAmount: derivedCalculation.accruedLeavePay,
            loansDeduction: formFields.loansDeduction,
            absenceDeduction: derivedCalculation.absenceDeduction,
            otherBonuses: formFields.otherBonuses + overtimeAmount,
            settlementNumber: editCase?.settlementNumber || `EOS-${Date.now().toString().slice(-4)}`
        });
    }, [formFields, derivedCalculation, overtimeAmount, editCase]);

    // Synchronize template selection change inside text area
    useEffect(() => {
        const matched = legalTemplatesCatalog.find(x => x.id === selectedTemplateId);
        if (matched) {
            setEditedTemplateContents(isAr ? matched.textAr : matched.textEn);
        }
    }, [selectedTemplateId, legalTemplatesCatalog, isAr]);

    // Add sign-off role auditor check
    const handleDigitalSignature = () => {
        const actorName = activeUserRole === 'hr' ? 'أمل المزيدي (رئيس الشؤون)' 
                        : activeUserRole === 'legal' ? 'مستشار صبري شطا'
                        : activeUserRole === 'finance' ? 'خالد القاسمي (المالية)'
                        : 'عبدالعزيز الصبيح (المدير الإداري)';

        setApprovals(p => ({
            ...p,
            [activeUserRole]: `${actorName} - ${new Date().toLocaleDateString('ar-KW')} ${comment ? `(${comment})` : ''}`
        }));
        setComment('');
    };

    const handleClearApprovals = () => {
        setApprovals({ hr: '', legal: '', finance: '', gm: '' });
    };

    // Save compiled record to parent page State
    const handleTriggerSave = () => {
        if (!formFields.employeeName || !formFields.employeeCivilId) {
            alert(isAr ? 'يجب ملء اسم الموظف ورقم بطاقته المدنية للمتابعة.' : 'Please enter Employee Name and Civil ID first.');
            return;
        }

        const compiled: EOS_Settlement = {
            id: editCase ? editCase.id : `EOS-${Date.now().toString().slice(-4)}`,
            settlementNumber: editCase?.settlementNumber || `EOS-2026-${Date.now().toString().slice(-4)}`,
            employeeId: formFields.employeeCivilId,
            employeeName: formFields.employeeName,
            jobTitle: formFields.jobTitle,
            department: formFields.department,
            settlementDate: editCase?.settlementDate || new Date().toISOString().split('T')[0],
            joiningDate: formFields.joiningDate,
            lastWorkingDay: formFields.lastWorkingDay,
            terminationReason: formFields.terminationReason,
            status: editCase?.status || 'PendingReview',
            basicSalary: formFields.basicSalary,
            allowances: formFields.housingAllowance + formFields.transportAllowance + formFields.phoneAllowance + formFields.positionAllowance + formFields.otherAllowances,
            grossSalary: derivedCalculation.grossSalary,
            serviceYears: derivedCalculation.years,
            serviceMonths: derivedCalculation.months,
            serviceDays: derivedCalculation.days,
            indemnityAmount: derivedCalculation.finalIndemnity,
            leaveBalanceAmount: derivedCalculation.accruedLeavePay,
            accruedSalaryAmount: 0,
            noticePeriodAmount: 0,
            otherBonuses: formFields.otherBonuses + overtimeAmount,
            loansDeduction: formFields.loansDeduction,
            absenceDeduction: derivedCalculation.absenceDeduction,
            otherDeductions: formFields.disciplinaryDeductions + derivedCalculation.missingAssetCharges,
            netPayable: derivedCalculation.netPayable,
            legalArticles: ['مادة 51', 'مادة 53', 'مادة 41'],
            preparedBy: approvals.hr || 'أمل المزيدي',
            approvedBy: approvals.gm || 'المدير العام',
            notes: formFields.notes + (approvals.legal ? `\n[موافقة المستشار]: ${approvals.legal}` : ''),
            approvals: approvals,
            contractType: formFields.contractType,
            nationality: formFields.nationality,
            leaveBalanceDays: formFields.leaveBalanceDays,
            unpaidLeaveDays: formFields.unpaidLeaveDays,
            socialInsuranceDeduction: formFields.socialInsuranceDeduction,
            disciplinaryDeductions: formFields.disciplinaryDeductions,
            absenceDays: formFields.absenceDays
        };

        onSave(compiled);
    };

    // CSV file download simulation helper
    const handleDownloadCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + `الحقل,القيمة بالدينار الكويتي\n`
            + `اسم الموظف,${formFields.employeeName}\n`
            + `الرقم المدني,${formFields.employeeCivilId}\n`
            + `تاريخ الالتحاق,${formFields.joiningDate}\n`
            + `آخر يوم عمل,${formFields.lastWorkingDay}\n`
            + `سنوات الخدمة,${derivedCalculation.years} سنة ${derivedCalculation.months} أشهر\n`
            + `الراتب الكلي,${derivedCalculation.grossSalary}\n`
            + `مكافأة نهاية الخدمة,${derivedCalculation.finalIndemnity}\n`
            + `تسييل الإجازات,${derivedCalculation.accruedLeavePay}\n`
            + `إضافي العمل والبدلات الأخرى,${formFields.otherBonuses + overtimeAmount}\n`
            + `إجمالي الاستقطاعات والمديونيات,${derivedCalculation.grossDeductions}\n`
            + `صافي الصرف الفعلي,${derivedCalculation.netPayable}`;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `تصفية_${formFields.employeeCivilId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrintDirect = () => {
        window.print();
    };

    const STEPS_NAV = [
        { id: 1, titleAr: 'بيانات الموظف وعقد العمل', titleEn: 'Employee & Contract' },
        { id: 2, titleAr: 'مكونات الراتب والبدلات', titleEn: 'Salary Breakdown' },
        { id: 3, titleAr: 'موجب الإنهاء والسيناريوهات', titleEn: 'Reason & Scenarios' },
        { id: 4, titleAr: 'العمل الإضافي والراحات', titleEn: 'Overtime Ledger' },
        { id: 5, titleAr: 'التثبت والتسويات والخصوم', titleEn: 'Deductions & Offsets' },
        { id: 6, titleAr: 'مسار المراجعة والاعتمادات', titleEn: 'Auditing & Approval' },
        { id: 7, titleAr: 'صياغة وطباعة السند المروّس', titleEn: 'Document & Print' }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 overflow-y-auto font-sans" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col my-4 max-h-[92vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                
                {/* 1. STEEL BAR BREADCRUMB COMPLIANT HEADER */}
                <div className="bg-gradient-to-r from-slate-900 via-[#0a4d44] to-slate-900 p-5 text-white flex justify-between items-center border-b border-emerald-950">
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-200 opacity-80 font-bold mb-1">
                            <span>عدالة - منظومة الإدارة القانونية المتكاملة v3</span>
                            <ChevronLeftIcon />
                            <span>{officeNameAr}</span>
                        </div>
                        <h3 className="text-lg font-black font-serif flex items-center gap-2">
                            <Scale className="w-5 h-5 text-emerald-400" />
                            <span>{editCase ? 'تعديل سند تسوية وتصفية عمالية كويتية' : 'تأسيس سند حوسبة ومخالصة عمالية نهاية الخدمة'}</span>
                        </h3>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-full bg-white/10 text-white hover:bg-rose-500 hover:text-white transition-all cursor-pointer border border-white/5"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. PROGRESS TABS STRIP CARD */}
                <div className="bg-slate-50 border-b border-slate-205 py-3.5 px-6 hidden md:flex items-center justify-between gap-1 overflow-x-auto select-none">
                    {STEPS_NAV.map((step) => {
                        const isActive = currentStep === step.id;
                        const isDone = currentStep > step.id;
                        return (
                            <button
                                key={step.id}
                                onClick={() => setCurrentStep(step.id)}
                                className={`flex items-center gap-2 text-[10px] font-black tracking-tight shrink-0 transition-all cursor-pointer p-1.5 px-3.5 rounded-xl border ${
                                    isActive ? 'bg-[#00796B] text-white border-[#005f54] shadow-sm font-bold' 
                                    : isDone ? 'bg-emerald-50 text-[#00796B] border-emerald-100 hover:bg-emerald-100' 
                                    : 'text-slate-400 bg-white border-slate-100 hover:bg-slate-50'
                                }`}
                            >
                                <span className={`w-4 h-4 rounded-full text-[9px] font-mono flex items-center justify-center font-bold ${
                                    isActive ? 'bg-white text-[#00796B]' : isDone ? 'bg-[#00796B] text-white' : 'bg-slate-150 text-slate-500'
                                }`}>
                                    {isDone ? <Check className="w-2.5 h-2.5" /> : step.id}
                                </span>
                                <span>{isAr ? step.titleAr : step.titleEn}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. WIZARD SCATTER PANELS BODY */}
                <div className="flex-1 p-5 md:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[62vh] bg-slate-50/50">
                    
                    {/* LEFT OR RIGHT SIDE INTERACTIVE INFO PREVIEW (cols-4) */}
                    <div className="lg:col-span-4 space-y-5">
                        
                        {/* LIVE GENERAL ACCOUNT LEDGER BRIEF */}
                        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
                            <span className="text-[9px] uppercase font-black bg-slate-100 text-[#00796B] px-2 py-0.5 rounded tracking-wider block w-max select-none">
                                {isAr ? 'فاتورة الاستحقاق المالي المترصد' : 'Earnings Voucher summary'}
                            </span>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-450 font-bold">{isAr ? 'مكافأة الخدمة (مادة 51/53):' : 'Indemnity Dues:'}</span>
                                    <span className="font-mono text-slate-800 font-black">{derivedCalculation.finalIndemnity.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-450 font-bold">{isAr ? 'تسييل رصيد الإجازات:' : 'Leave Encashment:'}</span>
                                    <span className="font-mono text-slate-800 font-black">{derivedCalculation.accruedLeavePay.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-[#00796B] font-bold">
                                    <span className="text-emerald-700 font-bold">{isAr ? 'علاوات وعمل إضافي (+):' : 'OT & Additions:'}</span>
                                    <span className="font-mono font-black">+{ (formFields.otherBonuses + overtimeAmount).toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-rose-600 font-bold border-b border-slate-100 pb-2.5">
                                    <span className="text-rose-700 font-bold">{isAr ? 'اقتطاعات ومديونيات (-):' : 'Deductions:'}</span>
                                    <span className="font-mono font-black">-{derivedCalculation.grossDeductions.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                                </div>
                                <div className="pt-2">
                                    <span className="block text-[10px] text-slate-400 font-bold">{isAr ? 'صافي المبلغ النهائي المستحق لصرف عمالي:' : 'Net Final Account Payable:'}</span>
                                    <span className="text-2xl font-black font-mono text-[#00796B]">
                                        {derivedCalculation.netPayable.toLocaleString(undefined, { minimumFractionDigits: 3 })} <small className="text-xs font-sans text-slate-500 font-bold">د.ك</small>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* LIVE LEGAL REGULATION STATEMENT COMPLIANT METRIC */}
                        <div className="bg-emerald-50/50 border border-emerald-100/70 p-4 rounded-2xl text-start space-y-2.5">
                            <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-black select-none">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>{isAr ? 'حصانة الامتثال وحماية المادة القانونية' : 'Statutory Compliance Shield'}</span>
                            </div>
                            <p className="text-[10px] text-emerald-700 leading-relaxed font-bold">
                                {isAr 
                                    ? `الحسبة تخضع للائحة المنشأة ومطابقة تامة لأحكام المواد 41 و44 و51 و53 وقرارات الهيئة العامة للقوى العاملة بدولة الكويت للعام 2026. مدة خدمة العامل الكلية المحتسبة هي (${derivedCalculation.years} سنة و ${derivedCalculation.months} شهراً و ${derivedCalculation.days} يوماً).`
                                    : `The indemnity metrics are aligned with Ministry Resolution No. 6/2010. Calculated career tenure is ${derivedCalculation.years} ys, ${derivedCalculation.months} ms and ${derivedCalculation.days} ds.`}
                            </p>
                            <div className="p-2 py-1.5 bg-white border border-emerald-100 rounded-lg text-center font-mono text-[9px] font-black text-[#00796B]">
                                {isAr ? `المستوى القانوني للمدقق: ساري ومعتمد` : `Lawful Integrity check: Certified`}
                            </div>
                        </div>

                        {/* TESTER ROLE SWITCHER PANEL JUST FOR SIMULATED LIVE VIEW TESTING OUTLINE */}
                        <div className="p-4 bg-slate-100/50 border border-slate-201 rounded-2xl space-y-2 text-start">
                            <span className="text-[9px] text-slate-400 font-black block">{isAr ? 'تجربة مستوى الموظف والاعتماد (Role Switcher):' : 'Auditing Active Role Emulator:'}</span>
                            <div className="grid grid-cols-4 gap-1">
                                {['hr', 'legal', 'finance', 'gm'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setActiveUserRole(r as any)}
                                        className={`p-1 text-[9px] rounded font-mono font-black text-center border uppercase transition-all cursor-pointer ${
                                            activeUserRole === r ? 'bg-slate-900 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* MAIN STAGE CONTENT RENDER PANEL (cols-8) */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs min-h-[440px] flex flex-col justify-between">
                        
                        {/* THE 7 SCATTERED WIZARDS PANELS SWITCHCASE */}
                        <div className="space-y-5">
                            
                            {/* STEP 1: EMPLOYEE SELECTION & SYNC */}
                            {currentStep === 1 && (
                                <div className="space-y-4 text-start">
                                    <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-3">
                                        <label className="text-xs font-black text-slate-850 block">{isAr ? 'ربط السند بملف موظف نشط من سجلات شؤون الموظفين الكويتية:' : 'Synchronize Dossier with Personnel Records Link:'}</label>
                                        <select
                                            value={selectedEmployeeId}
                                            onChange={(e) => handleEmployeeSelection(e.target.value)}
                                            className="w-full h-10 px-3 bg-white border border-slate-250 rounded-xl text-xs font-bold"
                                        >
                                            <option value="">{isAr ? '--- إمكانية إدخال بيانات يدوية أو الاختيار للتلقائي ---' : '--- Manual Data Entry or Select Employee ---'}</option>
                                            {initialExtendedEmployees.map(e => (
                                                <option key={e.id} value={e.id}>
                                                    {isAr ? `${e.fullNameAr} - الرقم المدني (${e.civilId})` : `${e.fullNameEn || e.fullNameAr} - ${e.civilId}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2">{isAr ? 'الهوية الشخصية والبيانات التعاقدية للموظف' : 'Personal Identity & Employment Contract Details'}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'اسم العامل بالكامل (عربي):' : 'Full Employee Name (Arabic):'}</label>
                                            <input
                                                type="text"
                                                value={formFields.employeeName}
                                                onChange={(e) => setFormFields(p => ({ ...p, employeeName: e.target.value }))}
                                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                                placeholder="أحمد علي الهاجري"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'البطاقة المدنية (Kuwait Civil ID - 12 digit):' : 'Civil ID Card ID:'}</label>
                                            <input
                                                type="text"
                                                value={formFields.employeeCivilId}
                                                onChange={(e) => setFormFields(p => ({ ...p, employeeCivilId: e.target.value }))}
                                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                                                placeholder="292021500412"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'تاريخ المباشرة بالعمل (Hired Date):' : 'Hiring Date:'}</label>
                                            <input
                                                type="date"
                                                value={formFields.joiningDate}
                                                onChange={(e) => setFormFields(p => ({ ...p, joiningDate: e.target.value }))}
                                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'تاريخ انتهاء الخدمة / آخر عمل فعلي:' : 'Last Working Day:'}</label>
                                            <input
                                                type="date"
                                                value={formFields.lastWorkingDay}
                                                onChange={(e) => setFormFields(p => ({ ...p, lastWorkingDay: e.target.value }))}
                                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'طبيعة العقد:' : 'Kuwait Contract Type:'}</label>
                                            <select
                                                value={formFields.contractType}
                                                onChange={(e) => setFormFields(p => ({ ...p, contractType: e.target.value as any }))}
                                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                            >
                                                <option value={ContractTypeKuwait.UNLIMITED}>{isAr ? 'غير محدد المدة (مستمر)' : 'Unlimited (Open-Ended)'}</option>
                                                <option value={ContractTypeKuwait.LIMITED}>{isAr ? 'محدد المدة (مؤقت)' : 'Limited (Fixed-Term)'}</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'الجنسية والقطاع عمالياً:' : 'Nationality:'}</label>
                                            <input
                                                type="text"
                                                value={formFields.nationality}
                                                onChange={(e) => setFormFields(p => ({ ...p, nationality: e.target.value }))}
                                                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                                                placeholder="كويتي / وافد"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: SALARY ALLOWANCES DETAIL */}
                            {currentStep === 2 && (
                                <EndOfServiceSalaryPanel
                                    basicSalary={formFields.basicSalary}
                                    housingAllowance={formFields.housingAllowance}
                                    transportAllowance={formFields.transportAllowance}
                                    phoneAllowance={formFields.phoneAllowance}
                                    positionAllowance={formFields.positionAllowance}
                                    otherAllowances={formFields.otherAllowances}
                                    lang={language as any}
                                    onChange={(updatedFields) => setFormFields(prev => ({ ...prev, ...updatedFields }))}
                                />
                            )}

                            {/* STEP 3: TERMINATION REASON SCENARIOS & CUSTOM SCENARIO ADDER */}
                            {currentStep === 3 && (
                                <div className="space-y-5 text-start">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                        <h4 className="text-xs font-black text-slate-800">{isAr ? 'سبب إنهاء العلاقة التعاقدية وحالة الاستحقاق القانونية' : 'Separation Trigger Cause & Statutory Scenarios'}</h4>
                                        <button
                                            type="button"
                                            onClick={() => setShowCustomScenarioForm(!showCustomScenarioForm)}
                                            className="h-7 px-3 bg-[#00796B]/5 hover:bg-[#00796B]/15 border border-[#00796B]/20 text-[#00796B] rounded-lg text-[9.5px] font-black flex items-center gap-1 cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>{isAr ? '+ مبرر مخصص' : '+ App Custom Scenario'}</span>
                                        </button>
                                    </div>

                                    {/* ADD CUSTOM SCENARIO FORM COLLAPSIBLE */}
                                    {showCustomScenarioForm && (
                                        <div className="p-4 bg-[#E0F2F1]/30 border border-[#B2DFDB]/60 rounded-2xl space-y-3">
                                            <span className="text-[9.5px] font-black text-[#004D40] block">{isAr ? 'إدراج سيناريو ومبرر إنهاء مخصص جديد للبرنامج:' : 'Provision New Custom Corporate Reason:'}</span>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    type="text"
                                                    value={customScenarioNameAr}
                                                    onChange={e => setCustomScenarioNameAr(e.target.value)}
                                                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                    placeholder="اسم المبرر بالعربية..."
                                                />
                                                <input
                                                    type="text"
                                                    value={customScenarioNameEn}
                                                    onChange={e => setCustomScenarioNameEn(e.target.value)}
                                                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                    placeholder="Scenario name in English..."
                                                />
                                                <input
                                                    type="text"
                                                    value={customScenarioArticle}
                                                    onChange={e => setCustomScenarioArticle(e.target.value)}
                                                    className="h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                                    placeholder="المادة القانوني (مثال: مادة 48 مخصصة)"
                                                />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-450 shrink-0">{isAr ? 'نسبة الاستحقاق (%):' : 'Indemnity Rate %:'}</span>
                                                    <input
                                                        type="number"
                                                        value={customScenarioMultiplier}
                                                        onChange={e => setCustomScenarioMultiplier(Number(e.target.value))}
                                                        className="h-8 w-20 text-center bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                                        min="0"
                                                        max="200"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCustomScenarioForm(false)}
                                                    className="h-7 px-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9.5px] font-bold cursor-pointer"
                                                >
                                                    {isAr ? 'إلغاء' : 'Cancel'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomScenario}
                                                    className="h-7 px-4 bg-[#00796B] hover:bg-[#004D40] text-white rounded-lg text-[9.5px] font-black cursor-pointer"
                                                >
                                                    {isAr ? 'تأكيد التسجيل' : 'Add Scenario'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Main Reason selector */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-extrabold text-[#00796B] block">{isAr ? 'المبرر القانوني الساري لإنهاء علاقة العمل المقر عمالياً:' : 'Statutory Dismissal / Resignation Cause:'}</label>
                                        <select
                                            value={formFields.terminationReason}
                                            onChange={(e) => setFormFields(p => ({ ...p, terminationReason: e.target.value as any }))}
                                            className="w-full h-11 px-3 bg-slate-50 border border-slate-250 rounded-xl text-xs font-bold text-[#00796B]"
                                        >
                                            <option value="">{isAr ? '--- اختر من لائحة الأسباب والقوانين الكويتية مادة 6/2010 ---' : '--- Choose reason ---'}</option>
                                            {mergedScenarios.map(sc => (
                                                <option key={sc.value} value={sc.value}>
                                                    {isAr ? sc.labelAr : sc.labelEn} ({(sc as any).article})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Custom scenarios list delete options */}
                                    {customScenarios.length > 0 && (
                                        <div className="p-3 bg-slate-100/40 border border-slate-201 rounded-xl">
                                            <span className="text-[9.5px] text-slate-400 font-bold block mb-2">{isAr ? 'الأسباب المخصصة المسجلة والتحكيمية:' : 'Registered Custom Scenarios:'}</span>
                                            <div className="space-y-1">
                                                {customScenarios.map(sc => (
                                                    <div key={sc.value} className="flex justify-between items-center text-xs p-1 pb-1.5 border-b border-dashed border-slate-202 text-slate-650">
                                                        <span>{isAr ? sc.labelAr : sc.labelEn} - (مادة: {sc.article}) - نسبة: {sc.multiplier * 100}%</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveCustomScenario(sc.value)}
                                                            className="p-1 hover:bg-rose-50 rounded text-rose-600 cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Alert advice depending on reason */}
                                    <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-2.5 text-start text-[10px] text-amber-900 leading-normal">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-extrabold block">{isAr ? 'عناية قانونية وتدقيق المادة المنظمة:' : 'Active Labor Compliance Rule:'}</span>
                                            <span>
                                                {isAr
                                                    ? `مبرر الإنهاء المختار يرتبط بالمادة (${activeScenarioMeta.article || 'مظلة المادة 51'}). ويحمل نسبة استحقاق تصفية مالي بوعاء قدره (${(activeScenarioMeta as any).multiplier !== undefined ? ((activeScenarioMeta as any).multiplier * 100) : 100}%). يرجى التأكد من تسليم الإخطار الخطي لتلافي النزاع.`
                                                    : `Selected cause points to Article ${activeScenarioMeta.article}. Settling factor is ${((activeScenarioMeta as any).multiplier * 100)}%.`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: OVERTIME ledger MODULE */}
                            {currentStep === 4 && (
                                <EndOfServiceOvertimePanel
                                    grossSalary={derivedCalculation.grossSalary}
                                    onChange={(totalOt, items) => {
                                        setOvertimeAmount(totalOt);
                                        setOvertimeItems(items);
                                    }}
                                    initialItems={overtimeItems}
                                    lang={language as any}
                                />
                            )}

                            {/* STEP 5: RESIGNATION THRESHOLDS & GENERAL ASSET CLEARENCE */}
                            {currentStep === 5 && (
                                <div className="space-y-5 text-start">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        
                                        {/* RESIGNATION CONTROL PANEL */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                                                <Sliders className="w-4 h-4 text-[#00796B]" />
                                                <span>{isAr ? 'ضوابط الاستقالة مادة 53 وقيم الاقتطاعات' : 'Deductive controls & General dues'}</span>
                                            </h4>
                                            
                                            <EndOfServiceResignationSettings
                                                lang={language as any}
                                                onUpdate={(thresholds) => setResThresholds(thresholds)}
                                            />
                                        </div>

                                        {/* FINANCIAL DEDUCTIONS & ASSETS CHECKS */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2">{isAr ? 'الاقتطاعات والمشتريات والديون القائمة' : 'Corporate Assets & Direct Deductions'}</h4>
                                            
                                            <div className="space-y-3.5">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'سلف وقروض متبقية (Loans):' : 'Outstanding Loan Balance:'}</label>
                                                        <input
                                                            type="number"
                                                            value={formFields.loansDeduction || ''}
                                                            onChange={e => setFormFields(p => ({ ...p, loansDeduction: Math.max(0, Number(e.target.value)) }))}
                                                            className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'أيام الغياب غير مبررة (Days):' : 'Absence Days:'}</label>
                                                        <input
                                                            type="number"
                                                            value={formFields.absenceDays || ''}
                                                            onChange={e => setFormFields(p => ({ ...p, absenceDays: Math.max(0, Number(e.target.value)) }))}
                                                            className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 block">{isAr ? 'غرامات وجزاء تأديبي:' : 'Disciplinary Penalty Fin:'}</label>
                                                        <input
                                                            type="number"
                                                            value={formFields.disciplinaryDeductions || ''}
                                                            onChange={e => setFormFields(p => ({ ...p, disciplinaryDeductions: Math.max(0, Number(e.target.value)) }))}
                                                            className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-[#00796B] block">{isAr ? 'زيادات ومكافأة استثنائية:' : 'Other Discretionary Bonuses:'}</label>
                                                        <input
                                                            type="number"
                                                            value={formFields.otherBonuses || ''}
                                                            onChange={e => setFormFields(p => ({ ...p, otherBonuses: Math.max(0, Number(e.target.value)) }))}
                                                            className="w-full h-9 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Asset checklist switch */}
                                                <div className="p-3 bg-slate-100/50 border border-slate-200 rounded-xl space-y-2">
                                                    <span className="text-[9px] text-slate-400 font-black block">{isAr ? 'التثبت العيني وتسليم العهد (Laptop / Car / Keys):' : 'Material Custody clearance:'}</span>
                                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold select-none text-slate-650">
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formFields.companyLaptopReturned}
                                                                onChange={e => setFormFields(p => ({ ...p, companyLaptopReturned: e.target.checked }))}
                                                                className="accent-[#00796B]"
                                                            />
                                                            <span>{isAr ? 'لابتوب العمل مسترجع' : 'Laptop Returned'}</span>
                                                        </label>
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formFields.companyPhoneReturned}
                                                                onChange={e => setFormFields(p => ({ ...p, companyPhoneReturned: e.target.checked }))}
                                                                className="accent-[#00796B]"
                                                            />
                                                            <span>{isAr ? 'الهاتف وشريحة مسترجعة' : 'Phone Returned'}</span>
                                                        </label>
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formFields.companyKeysReturned}
                                                                onChange={e => setFormFields(p => ({ ...p, companyKeysReturned: e.target.checked }))}
                                                                className="accent-[#00796B]"
                                                            />
                                                            <span>{isAr ? 'مفاتيح المنشأة مسترجعة' : 'Keys Returned'}</span>
                                                        </label>
                                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formFields.accessBadgesReturned}
                                                                onChange={e => setFormFields(p => ({ ...p, accessBadgesReturned: e.target.checked }))}
                                                                className="accent-[#00796B]"
                                                            />
                                                            <span>{isAr ? 'بطاقات البصمة والولوج متبادلة' : 'Access Badges Returned'}</span>
                                                        </label>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* STEP 6: APPROVALS & MULTI SIGN-OFF */}
                            {currentStep === 6 && (
                                <div className="space-y-5 text-start">
                                    <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2">{isAr ? 'مسار الفحص والاعتمادات والتوقيعات الرقمية الرقمية' : 'Audit Trails & Multi-Level Core Approvals'}</h4>
                                    
                                    <p className="text-[10px] text-slate-450 leading-normal font-medium">
                                        {isAr 
                                            ? 'يتطلب السند براءة ذمة مرئية وتسلسل اعتمادات لتوثيق التسوية بالكامل قبل الإرسال للبنوك والربط بوزارة الشؤون الكويتية.'
                                            : 'Requires verified sequences matching corporate compliance policies before forwarding payments to banks.'}
                                    </p>

                                    {/* Real-time sign-off board */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        
                                        {/* SIGN-OFF ACTIONS WORKSPACE */}
                                        <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-800 block">{isAr ? 'توقيع المستشار الفعال وملاحظاته:' : 'Current Role Sign-off Action:'}</span>
                                                <span className="text-[9px] bg-slate-900 text-[#00796B] px-2 py-0.5 rounded font-mono font-bold uppercase">{activeUserRole}</span>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <textarea
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                    rows={3}
                                                    className="w-full p-2.5 bg-white border border-slate-250 rounded-xl text-xs"
                                                    placeholder={isAr ? 'اكتب ملحوظة التدقيق أو التفنيد للمخالصة هنا...' : 'Enter your audit audit comments here...'}
                                                />
                                                <div className="flex justify-between items-center">
                                                    <button
                                                        type="button"
                                                        onClick={handleClearApprovals}
                                                        className="h-8 px-3 text-[10px] text-rose-600 border border-rose-100 rounded-lg hover:bg-rose-50 cursor-pointer font-bold"
                                                    >
                                                        {isAr ? 'تصفير الاعتمادات' : 'Reset Signed'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleDigitalSignature}
                                                        className="h-8 px-4 bg-[#00796B] hover:bg-[#004D40] text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                                                    >
                                                        <FileSignature className="w-3.5 h-3.5" />
                                                        <span>{isAr ? 'إدراج توقيعي والختم الرقمي' : 'Affix Digital Seal'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* THE TRACKER PANEL */}
                                        <div className="space-y-2.5">
                                            <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'مستويات براءة السند وحالة توقيع الهيكل المالي:' : 'Sequenced Approval LedgerStatus:'}</span>
                                            
                                            {/* HR Specialist */}
                                            <div className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between">
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? '1. مدقق شؤون الموظفين (HR):' : '1. HR Auditor:'}</span>
                                                    <span className="text-xs font-bold text-slate-800">{approvals.hr ? approvals.hr : (isAr ? 'بانتظار الإمضاء واللائحة...' : 'Awaiting sign...')}</span>
                                                </div>
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${approvals.hr ? 'bg-emerald-500 shadow-emerald-400' : 'bg-slate-300'}`} />
                                            </div>

                                            {/* Legal Counselor */}
                                            <div className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between">
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? '2. المستشار القانوني (Legal):' : '2. Legal Counsel:'}</span>
                                                    <span className="text-xs font-bold text-slate-800">{approvals.legal ? approvals.legal : (isAr ? 'بانتظار التفنيد القانوني...' : 'Awaiting sign...')}</span>
                                                </div>
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${approvals.legal ? 'bg-[#00796B] shadow-emerald-400' : 'bg-slate-300'}`} />
                                            </div>

                                            {/* Finance Auditor */}
                                            <div className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between">
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? '3. المراقب المالي وبراء بيرول (Finance):' : '3. Finance Auditor:'}</span>
                                                    <span className="text-xs font-bold text-slate-800">{approvals.finance ? approvals.finance : (isAr ? 'بانتظار تأكيد ميزان التسييل...' : 'Awaiting sign...')}</span>
                                                </div>
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${approvals.finance ? 'bg-amber-500 shadow-amber-400' : 'bg-slate-300'}`} />
                                            </div>

                                            {/* General Manager */}
                                            <div className="p-2.5 bg-white border border-slate-150 rounded-xl flex items-center justify-between">
                                                <div className="text-right">
                                                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? '4. المدير العام والمفوض الإداري (GM):' : '4. General Manager:'}</span>
                                                    <span className="text-xs font-bold text-slate-800">{approvals.gm ? approvals.gm : (isAr ? 'بانتظار الختم النهائي السيادي...' : 'Awaiting sign...')}</span>
                                                </div>
                                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${approvals.gm ? 'bg-[#0a4d44] shadow-[#0a4d44]' : 'bg-slate-300'}`} />
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            )}

                            {/* STEP 7: DOCUMENTS STUDIO PREVIEW & PRINT */}
                            {currentStep === 7 && (
                                <div className="space-y-4 text-start">
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                        
                                        {/* DOCUMENT SELECT CATALOG LIST (cols-4) */}
                                        <div className="lg:col-span-4 space-y-2.5 max-h-[460px] overflow-y-auto">
                                            <span className="text-[9.5px] font-black text-slate-400 block">{isAr ? 'صناعة المستندات (١٢ نموذج مروّس قانونياً):' : 'Pre-Print Catalog (12 options):'}</span>
                                            
                                            {legalTemplatesCatalog.map(tpl => (
                                                <button
                                                    key={tpl.id}
                                                    type="button"
                                                    onClick={() => setSelectedTemplateId(tpl.id)}
                                                    className={`w-full p-2 text-right rounded-xl text-[10px] transition-all cursor-pointer border flex justify-between items-center ${
                                                        selectedTemplateId === tpl.id ? 'bg-[#E0F2F1] text-[#004D40] border-[#00796B]/30 font-bold' : 'bg-white text-slate-650 border-slate-150 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span className="truncate">{isAr ? tpl.titleAr : tpl.titleEn}</span>
                                                    {selectedTemplateId === tpl.id && <Check className="w-3.5 h-3.5 text-[#00796B] shrink-0" />}
                                                </button>
                                            ))}
                                        </div>

                                        {/* COMPACT INTERACTIVE LIVE TEXT AREA EDITOR (cols-8) */}
                                        <div className="lg:col-span-8 space-y-3">
                                            <div className="flex justify-between items-center select-none">
                                                <span className="text-[10px] font-extrabold text-[#00796B] flex items-center gap-1">
                                                    <Edit className="w-3.5 h-3.5" />
                                                    <span>{isAr ? 'نافذة تحرير وتحضير نص المحرر القانوني المباشر:' : 'Live Editor Workspace (Edit pre printing):'}</span>
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold">{isAr ? 'يمكنك تحويل النص وتغييره بالكامل قبل الطباعة' : 'Feel free to modify text below'}</span>
                                            </div>

                                            <textarea
                                                value={editedTemplateContents}
                                                onChange={e => setEditedTemplateContents(e.target.value)}
                                                rows={10}
                                                className="w-full p-4 bg-slate-50 border border-slate-203 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed font-bold shadow-inner"
                                            />

                                            <div className="flex justify-between items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleDownloadCSV}
                                                    className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-750 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xxs"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>{isAr ? 'تصدير شيت إكسل Ledger' : 'CSV Payroll ledger'}</span>
                                                </button>
                                                
                                                <button
                                                    type="button"
                                                    onClick={handlePrintDirect}
                                                    className="h-9 px-5 bg-gradient-to-r from-slate-900 to-[#0e423b] hover:opacity-90 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                                                >
                                                    <Printer className="w-4 h-4 text-emerald-300" />
                                                    <span>{isAr ? 'أمر طباعة مروّس ومختوم' : 'Direct Print to Desk'}</span>
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                    {/* PRINCIPLE PRINT GRAPHICAL PREVIEW ACCORD */}
                                    <div className="bg-slate-100/50 p-5 rounded-3xl border border-slate-201 text-start space-y-4 max-h-[220px] overflow-y-auto select-none mt-4">
                                        <span className="text-[9.5px] font-black text-slate-400 block">{isAr ? 'معاينة ترويسة وهوامش المستند والتحقق منها:' : 'Official Law-Firm Sealed Layout Preview:'}</span>
                                        
                                        <div className="bg-white p-6 rounded-2xl border border-shadow border-slate-200/65 font-serif text-[10px] space-y-4">
                                            {/* HEADER */}
                                            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 font-serif">
                                                <div className="text-right">
                                                    <span className="font-black text-xs block text-slate-900">{officeNameAr}</span>
                                                    <span className="text-[8.5px] block text-slate-500">عدالة - منظومة الإدارة القانونية المتكاملة v3 | شؤون التحكيم والجزاءات العمالية</span>
                                                </div>
                                                <span className="text-emerald-800 font-bold tracking-tight bg-slate-100 p-1 px-3 text-[9px] border border-slate-250 rounded font-sans uppercase">ADALAH CLOUD SEAL</span>
                                                <div className="text-left font-sans">
                                                    <span className="text-[8.5px] block text-slate-400">Ref: ADLAH-KW-2026-EOS{(Date.now() % 1000)}</span>
                                                    <span className="text-[8.5px] block text-slate-400">Date: {new Date().toLocaleDateString('ar-KW')}</span>
                                                </div>
                                            </div>

                                            {/* TEXT */}
                                            <p className="whitespace-pre-wrap text-[9.5px] text-slate-700 leading-relaxed font-sans font-medium text-right">
                                                {editedTemplateContents || (isAr ? 'لا يوجد نص حالياً محرر...' : 'No content filled...')}
                                            </p>

                                            {/* SIGNATURE TABLES */}
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-center text-[9px] font-sans">
                                                <div className="space-y-3.5">
                                                    <span className="font-bold text-slate-400 block">{isAr ? 'المقر بالاستلام والتنازل (الموظف):' : 'Declarant Employee Signature:'}</span>
                                                    <span className="block italic text-slate-800 underline">_____________________</span>
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Key className="w-3 h-3 text-slate-400" />
                                                        <span className="text-[8.5px] text-slate-450">E-Signature: ID Verified</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3.5">
                                                    <span className="font-bold text-slate-400 block">{isAr ? 'معتمد ومصدق بختم مكتب المحاماة:' : 'Authorized Law-Firm Official stamp:'}</span>
                                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-emerald-600/50 mx-auto flex items-center justify-center text-[#00796B] font-black text-[9px] uppercase tracking-wider rotate-12">
                                                        <span>SHATTA APPROVED</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            )}

                        </div>

                        {/* 4. FOOTER CONTROLS ROW PANEL */}
                        <div className="border-t border-slate-100 pt-5 flex justify-between items-center mt-6 select-none">
                            <button
                                type="button"
                                onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
                                disabled={currentStep === 1}
                                className={`h-10 px-5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1 ${
                                    currentStep === 1 ? 'opacity-30 border-slate-200 text-slate-350 bg-slate-50' : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <ArrowRight className="w-4 h-4 shrink-0" />
                                <span>{isAr ? 'الخطوة السابقة' : 'Prev Step'}</span>
                            </button>

                            {currentStep < 7 ? (
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(p => Math.min(7, p + 1))}
                                    className="h-10 px-6 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                                >
                                    <span>{isAr ? 'الخطوة التالية الموالية' : 'Next Step'}</span>
                                    <ArrowLeft className="w-4 h-4 shrink-0" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleTriggerSave}
                                    className="h-10 px-6 bg-gradient-to-r from-emerald-600 to-[#004D40] hover:opacity-95 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md select-none"
                                >
                                    <Save className="w-4 h-4 text-emerald-350" />
                                    <span>{isAr ? 'حفظ واعتماد التصفية نهائياً' : 'Approve & Save Settlement'}</span>
                                </button>
                            )}
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

// COMPACT CHEVRON ICON COMPONENT
const ChevronLeftIcon = () => (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
    </svg>
);
