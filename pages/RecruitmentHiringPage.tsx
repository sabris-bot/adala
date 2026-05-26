import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import PrintHeader from '../components/ui/PrintHeader';
import { Badge } from '../components/ui/Badge';
import { 
    UsersIcon, BriefcaseIcon, AcademicCapIcon, PlusCircleIcon, PencilIcon, TrashIcon, 
    EyeIcon, PrinterIcon, ArrowDownTrayIcon, ChevronRightIcon, MagnifyingGlassIcon,
    ArrowPathIcon, PhoneIcon, EnvelopeIcon, DocumentTextIcon, BuildingOffice2Icon, CheckCircleIcon
} from '../constants';

// --- Interfaces ---
interface Vacancy {
    id: string;
    referenceNo: string;
    titleAr: string;
    titleEn: string;
    departmentAr: string;
    departmentEn: string;
    status: 'Open' | 'Closed' | 'Draft';
    salaryRange: string;
    experienceRequired: string;
    nationalityPreference: string;
    detailsAr: string;
    detailsEn: string;
    datePosted: string;
}

interface Candidate {
    id: string;
    referenceNo: string;
    fullNameAr: string;
    fullNameEn: string;
    nationalityAr: string;
    nationalityEn: string;
    email: string;
    phone: string;
    jobTitleAppliedAr: string;
    jobTitleAppliedEn: string;
    status: 'Applied' | 'Review' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
    experienceYears: number;
    educationAr: string;
    educationEn: string;
    currentVisaStatusAr: string;
    currentVisaStatusEn: string;
    interviewRating: number; // 1-5
    interviewNotesAr: string;
    interviewNotesEn: string;
    onboardingChecklist: {
        civilIdCopy: boolean;
        passportCopy: boolean;
        certificatesAttested: boolean;
        workPermitMoSA: boolean; 
        pifssRegistered: boolean; // For Kuwaitis
        bankIbanSubmitted: boolean;
    };
}

// --- Mock Data ---
const initialVacancies: Vacancy[] = [
    {
        id: 'vac-1',
        referenceNo: 'VAC-2026-001',
        titleAr: 'مستشار قانوني أول - قسم الشركات',
        titleEn: 'Senior Corporate Legal Consultant',
        departmentAr: 'قسم الشركات والتجاري',
        departmentEn: 'Corporate & Commercial Dept',
        status: 'Open',
        salaryRange: '1,800 - 2,200 د.ك',
        experienceRequired: '10 سنوات فأكثر',
        nationalityPreference: 'مفتوحة (يفضل مقيم في الكويت)',
        detailsAr: 'صياغة عقود تأسيس الشركات الكبرى، تقديم الاستشارات حول قوانين هيئة أسواق المال وتأسيس الصناديق الاستثمارية.',
        detailsEn: 'Drafting articles of association for enterprise clients, advising on CMA rules and investment funds setup.',
        datePosted: '2026-05-10'
    },
    {
        id: 'vac-2',
        referenceNo: 'VAC-2026-002',
        titleAr: 'محام استئناف وتمييز - عمالي وإداري',
        titleEn: 'Appeals & Cassation Lawyer - Labor',
        departmentAr: 'قسم القضايا العمالية',
        departmentEn: 'Labor & Employment Dept',
        status: 'Open',
        salaryRange: '1,200 - 1,500 د.ك',
        experienceRequired: '7 سنوات فأكثر',
        nationalityPreference: 'كويتي حصرياً (مطابق لاشتراطات جمعية المحامين)',
        detailsAr: 'تمثيل الموكلين أمام محكمة الاستئناف والتمييز في المنازعات العمالية الكبرى وصياغة صحف العرائض والمذكرات القانونية.',
        detailsEn: 'Representing clients in complex Labor disputes before Appeals and Cassation courts, drafting legal briefs.',
        datePosted: '2026-05-18'
    },
    {
        id: 'vac-3',
        referenceNo: 'VAC-2026-003',
        titleAr: 'سكرتير قانوني ومترجم فوري',
        titleEn: 'Legal Secretary & Translator',
        departmentAr: 'الشؤون الإدارية والسكرتارية',
        departmentEn: 'Admin & Secretariat',
        status: 'Closed',
        salaryRange: '600 - 800 د.ك',
        experienceRequired: '3-5 سنوات في مكتب محاماة كويتي',
        nationalityPreference: 'لا يشترط جنسية معينة مع إقامة مادة 18 قابلة للتحويل',
        detailsAr: 'تنسيق الملفات القانونية، ترجمة الأحكام والعرائض والردود القضائية من العربية للإنجليزية وبالعكس.',
        detailsEn: 'Organizing legal files, translating judgments, briefs, and responses between Arabic and English.',
        datePosted: '2026-04-12'
    }
];

const initialCandidates: Candidate[] = [
    {
        id: 'cand-1',
        referenceNo: 'CAND-2026-101',
        fullNameAr: 'عبدالله خالد المطيري',
        fullNameEn: 'Abdullah Khaled Al-Mutairi',
        nationalityAr: 'كويتي',
        nationalityEn: 'Kuwaiti',
        email: 'a.almutairi@outlook.com',
        phone: '99887766',
        jobTitleAppliedAr: 'محام استئناف وتمييز - عمالي وإداري',
        jobTitleAppliedEn: 'Appeals & Cassation Lawyer - Labor',
        status: 'Interview',
        experienceYears: 8,
        educationAr: 'ليسانس حقوق - جامعة الكويت - امتياز مع مرتبة الشرف',
        educationEn: 'LLB - Kuwait University - Excellent with Honors',
        currentVisaStatusAr: 'مواطن كويتي',
        currentVisaStatusEn: 'Kuwaiti Citizen',
        interviewRating: 5,
        interviewNotesAr: 'ملم جداً بقانون العمل الأهلي ولديه مهارة صياغة عالية وإلقاء رصين بالمحاكم. يوصى بالتعاقد الفوري معه.',
        interviewNotesEn: 'Extremely knowledgeable in Kuwait Labor Law. Strong writing & oral arguments. Highly recommended for immediate hiring.',
        onboardingChecklist: {
            civilIdCopy: true,
            passportCopy: true,
            certificatesAttested: true,
            workPermitMoSA: true,
            pifssRegistered: false,
            bankIbanSubmitted: true
        }
    },
    {
        id: 'cand-2',
        referenceNo: 'CAND-2026-102',
        fullNameAr: 'أشرف محمود رضوان',
        fullNameEn: 'Ashraf Mahmoud Radwan',
        nationalityAr: 'مصري',
        nationalityEn: 'Egyptian',
        email: 'ashraf.lawyer@yahoo.com',
        phone: '55667788',
        jobTitleAppliedAr: 'مستشار قانوني أول - قسم الشركات',
        jobTitleAppliedEn: 'Senior Corporate Legal Consultant',
        status: 'Offered',
        experienceYears: 12,
        educationAr: 'ماجستير في القانون التجاري الدولي - جامعة القاهرة',
        educationEn: 'LLM in International Commercial Law - Cairo University',
        currentVisaStatusAr: 'إقامة مادة 18 قابلة للتحويل (مكتب محاماة كويتي)',
        currentVisaStatusEn: 'Transferable Article 18 Visa (Kuwaiti law firm)',
        interviewRating: 4,
        interviewNotesAr: 'خبرة ممتازة في هيكلة الصفقات واستشارات الاندماج والاستحواذ. يستحق عرض عمل بمزايا كاملة.',
        interviewNotesEn: 'Excellent experience in M&A deals and corporate structuring. Deserves an official offer with full benefits.',
        onboardingChecklist: {
            civilIdCopy: true,
            passportCopy: true,
            certificatesAttested: true,
            workPermitMoSA: false,
            pifssRegistered: false,
            bankIbanSubmitted: false
        }
    },
    {
        id: 'cand-3',
        referenceNo: 'CAND-2026-103',
        fullNameAr: 'جوانا فرانسيس',
        fullNameEn: 'Joanna Frances',
        nationalityAr: 'هندية',
        nationalityEn: 'Indian',
        email: 'joanna.f@lawassociates.in',
        phone: '60102030',
        jobTitleAppliedAr: 'سكرتير قانوني ومترجم فوري',
        jobTitleAppliedEn: 'Legal Secretary & Translator',
        status: 'Hired',
        experienceYears: 4,
        educationAr: 'بكالوريوس آداب لغة عربية وترجمة - جامعة دلهي',
        educationEn: 'BA in Arabic Literature and Technical Translation - Delhi University',
        currentVisaStatusAr: 'إقامة مادة 22 (التحاق بعائل) قابلة للتحويل لمادة 18 عمل',
        currentVisaStatusEn: 'Article 22 (Family Visa) transferable to Article 18 Work',
        interviewRating: 4,
        interviewNotesAr: 'لغتها العربية ممتازة وتتقن الترجمة القانونية وصياغة محاضر الاجتماعات. تم إصدار براءة الذمة وإشعار التحويل من الهيئة العامة للقوى العاملة.',
        interviewNotesEn: 'Fluent in both Arabic & English. Specialized in technical translation. Transfer through Public Authority for Manpower of Kuwait in progress.',
        onboardingChecklist: {
            civilIdCopy: true,
            passportCopy: true,
            certificatesAttested: true,
            workPermitMoSA: true,
            pifssRegistered: false,
            bankIbanSubmitted: true
        }
    }
];

const RecruitmentHiringPage: React.FC = () => {
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [activeTab, setActiveTab] = useState<'vacancies' | 'candidates'>('candidates');
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- Data States ---
    const [vacancies, setVacancies] = useState<Vacancy[]>(() => {
        const stored = localStorage.getItem('alwagayan_vacancies');
        return stored ? JSON.parse(stored) : initialVacancies;
    });

    const [candidates, setCandidates] = useState<Candidate[]>(() => {
        const stored = localStorage.getItem('alwagayan_candidates');
        return stored ? JSON.parse(stored) : initialCandidates;
    });

    // Save states to localstorage
    useEffect(() => {
        localStorage.setItem('alwagayan_vacancies', JSON.stringify(vacancies));
    }, [vacancies]);

    useEffect(() => {
        localStorage.setItem('alwagayan_candidates', JSON.stringify(candidates));
    }, [candidates]);

    // --- Modals State ---
    const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState<Partial<Vacancy> | null>(null);

    const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Partial<Candidate> | null>(null);

    const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
    const [printDoc, setPrintDoc] = useState<{
        type: 'offer' | 'onboarding';
        title: string;
        candidate: Candidate;
        isOpen: boolean;
    } | null>(null);

    // Filtered / Searched states
    const filteredVacancies = useMemo(() => {
        return vacancies.filter(v => {
            const term = searchTerm.toLowerCase();
            return (
                v.titleAr.toLowerCase().includes(term) ||
                v.titleEn.toLowerCase().includes(term) ||
                v.departmentAr.toLowerCase().includes(term) ||
                v.referenceNo.toLowerCase().includes(term)
            );
        });
    }, [vacancies, searchTerm]);

    const filteredCandidates = useMemo(() => {
        return candidates.filter(c => {
            const term = searchTerm.toLowerCase();
            return (
                c.fullNameAr.toLowerCase().includes(term) ||
                c.fullNameEn.toLowerCase().includes(term) ||
                c.jobTitleAppliedAr.toLowerCase().includes(term) ||
                c.referenceNo.toLowerCase().includes(term) ||
                c.nationalityAr.toLowerCase().includes(term)
            );
        });
    }, [candidates, searchTerm]);

    const handleSaveVacancy = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingVacancy) return;

        if (editingVacancy.id) {
            // Edit
            setVacancies(prev => prev.map(v => v.id === editingVacancy.id ? (editingVacancy as Vacancy) : v));
        } else {
            // New
            const newVac: Vacancy = {
                ...(editingVacancy as Vacancy),
                id: 'vac-' + Date.now(),
                referenceNo: 'VAC-2026-' + Math.floor(100 + Math.random() * 900),
                datePosted: new Date().toISOString().split('T')[0],
                status: 'Open'
            };
            setVacancies(prev => [newVac, ...prev]);
        }
        setIsVacancyModalOpen(false);
        setEditingVacancy(null);
    };

    const handleSaveCandidate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCandidate) return;

        if (editingCandidate.id) {
            // Edit
            setCandidates(prev => prev.map(c => c.id === editingCandidate.id ? (editingCandidate as Candidate) : c));
        } else {
            // New
            const newCand: Candidate = {
                ...(editingCandidate as Candidate),
                id: 'cand-' + Date.now(),
                referenceNo: 'CAND-2026-' + Math.floor(100 + Math.random() * 900),
                interviewRating: editingCandidate.interviewRating || 5,
                status: 'Applied',
                onboardingChecklist: {
                    civilIdCopy: false,
                    passportCopy: false,
                    certificatesAttested: false,
                    workPermitMoSA: false,
                    pifssRegistered: false,
                    bankIbanSubmitted: false
                }
            };
            setCandidates(prev => [newCand, ...prev]);
        }
        setIsCandidateModalOpen(false);
        setEditingCandidate(null);
    };

    const handleDeleteVacancy = (id: string) => {
        if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذه الفرصة الوظيفية؟' : 'Are you sure you want to delete this job vacancy?')) {
            setVacancies(prev => prev.filter(v => v.id !== id));
        }
    };

    const handleDeleteCandidate = (id: string) => {
        if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف ملف هذا المترشح؟' : 'Are you sure you want to delete this candidate?')) {
            setCandidates(prev => prev.filter(c => c.id !== id));
        }
    };

    const translate = (ar: string, en: string) => {
        return language === 'ar' ? ar : en;
    };

    const handlePrintOffer = (cand: Candidate) => {
        setPrintDoc({
            type: 'offer',
            title: language === 'ar' ? 'صياغة عرض العمل الرسمي والتعاقد الوزاري المسبق' : 'Official Written Job Offer Statement',
            candidate: cand,
            isOpen: true
        });
    };

    const handlePrintOnboarding = (cand: Candidate) => {
        setPrintDoc({
            type: 'onboarding',
            title: language === 'ar' ? 'إخطار وبطاقة متابعة فحص القوى العاملة ومطابقة الأوراق' : 'Kuwait Ministry of Labor Onboarding Checklist Follow-up',
            candidate: cand,
            isOpen: true
        });
    };

    return (
        <div className="space-y-8 pb-20 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            
            {/* 1. Print View Overlay */}
            {printDoc && printDoc.isOpen && (
                <div className="hidden print-only-container print:block bg-white p-12 text-black text-xs leading-relaxed" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                    
                    {/* Kuwait Govt compliance structure */}
                    <div className="border-b-4 border-slate-900 pb-5 mb-8 flex justify-between items-start">
                        <div className="space-y-1 text-right">
                            <h1 className="text-sm font-black text-slate-950 font-sans">مكتب الوجيان والروضان للمحاماة والاستشارات القانونية</h1>
                            <p className="text-[10px] text-slate-500 font-bold">منظومة شؤون الموظفين والتوظيف المعتمدة</p>
                            <p className="text-[8px] text-slate-400">شارع فهد السالم، برج السحاب، العاصمة، الكويت</p>
                        </div>
                        <div className="text-left space-y-1">
                            <p className="text-[10px] font-bold font-mono">الرقم المرجعي: HR-OFF-{printDoc.candidate.referenceNo}</p>
                            <p className="text-[10px] font-bold font-mono">التاريخ: {new Date().toISOString().split('T')[0]}</p>
                            <p className="text-[8px] text-slate-500 font-bold">حالة المراجعة: معتمد إلكترونياً</p>
                        </div>
                    </div>

                    <div className="text-center my-8 space-y-2">
                        <h2 className="text-lg font-black text-slate-900 border-b-2 border-slate-350 pb-2 inline-block">
                            {printDoc.type === 'offer' ? 'عرض عمل رسمي وربط وظيفي بالشركاء' : 'بطاقة قيد ومطابقة القوى العاملة للموظف الجديد'}
                        </h2>
                    </div>

                    {printDoc.type === 'offer' ? (
                        <div className="space-y-6 text-justify text-[11px] leading-relaxed">
                            <p>عناية السيد/ة الموقر: <strong>{printDoc.candidate.fullNameAr}</strong> ({printDoc.candidate.nationalityAr}) المحترم/ة.</p>
                            
                            <p>يسر إدارة الموارد البشرية والتوظيف الاستراتيجي بمكتب الوجيان والروضان للمحاماة، أن تتقدم لكم بعرض العمل الرسمي والالتحاق بطاقمنا الرائد وفق البنود والتكليفات القانونية والمالية التالية:</p>

                            <table className="w-full border-collapse border border-slate-300 text-right text-[10px] my-4">
                                <tbody>
                                    <tr className="border-b border-slate-300 bg-slate-50">
                                        <td className="p-3 font-black border-r border-slate-305 w-1/3">المسمى الوظيفي المعتمد:</td>
                                        <td className="p-3 font-bold">{printDoc.candidate.jobTitleAppliedAr} ({printDoc.candidate.jobTitleAppliedEn})</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-3 font-black border-r border-slate-305">الراتب الأساسي المرصود:</td>
                                        <td className="p-3 font-mono font-bold">1,400 د.ك (ألف وأربعمائة دينار كويتي شهرياً)</td>
                                    </tr>
                                    <tr className="border-b border-slate-300 bg-slate-50">
                                        <td className="p-3 font-black border-r border-slate-305">بدل السكن والانتقال والاتصالات:</td>
                                        <td className="p-3 font-bold">بدل سكن 250 د.ك + بدل انتقال 100 د.ك بمجموع 350 د.ك</td>
                                    </tr>
                                    <tr className="border-b border-slate-300">
                                        <td className="p-3 font-black border-r border-slate-305">نظام الدوام وساعات العمل:</td>
                                        <td className="p-3 font-bold">8 ساعات عمل قانونية يومياً / 5 أيام عمل أسبوعياً بالتوافق مع قانون العمل الأهلي رقم 6 لسنة 2010.</td>
                                    </tr>
                                    <tr className="border-b border-slate-300 bg-slate-50">
                                        <td className="p-3 font-black border-r border-slate-305">مكافأة نهاية الخدمة وتذاكر السفر:</td>
                                        <td className="p-3 font-bold font-sans">تذكرة سفر سنوية للبلد الأم، وتأمين صحي كويتي، واحتساب مكافأة نهاية الخدمة بالكامل وفق المادة 51 من القانون الإداري.</td>
                                    </tr>
                                </tbody>
                            </table>

                            <p>يعتبر هذا العرض صالحاً للاعتماد والتوقيع لمدة أسبوع (7 أيام) من تاريخ إصداره المبين أعلاه. وعند الموافقة، يرجى التوقيع وموافقة الأوراق لتسجيل معاملة إقامة العمل وتحويل الملف رسمياً بالتنسيق مع الهيئة العامة للقوى العاملة بدولة الكويت وبوابة التأمينات.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 text-[11px] leading-relaxed">
                            <p>الموضوع: <strong>استكمال إجراءات مطابقة الأوراق وفحص العمالة الوطنية والوافدة</strong></p>
                            <p>الموظف المترشح: <strong>{printDoc.candidate.fullNameAr}</strong> • المسمى الوظيفي: <strong>{printDoc.candidate.jobTitleAppliedAr}</strong></p>

                            <p>توضح هذه الاستمارة الرسمية مراحل تجميع المطابقات والفحوص الطبية بموجب لوائح وزارة الشؤون الاجتماعية بدولة الكويت:</p>

                            <div className="border border-slate-300 rounded-lg p-5 bg-slate-50 space-y-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold">1. البطاقة المدنية الكويتية الصالحة (أو جواز سفر الوافد):</span>
                                    <span className="font-black text-emerald-600">✓ مطابقة بالكامل ومتوفرة بملف الموظف</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold">2. فحص اللياقة الطبية (مستشفى الصباح / وزارة الصحة):</span>
                                    <span className="font-black text-emerald-600">✓ اجتياز الفحص الطبي بنجاح وخلوه من الأمراض</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold">3. تصديق الشهادات الجامعية والمعادلة الفنية:</span>
                                    <span className="font-black text-emerald-600">✓ معتمدة ومصدقة من وزارة الخارجية والتعليم العالي</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold">4. تصريح العمل والموافقة الأمنية (وزارة الشؤون):</span>
                                    <span className="font-black text-indigo-650">قيد الإصدار والتحويل (Article 18 Setup)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Authorized Signs & Digital Stamps */}
                    <div className="mt-16 grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-[10px]">
                        <div className="space-y-2">
                            <p className="font-bold text-slate-500">توقيع الموظف المترشح بالقبول والتعهد</p>
                            <div className="h-10"></div>
                            <p className="font-bold text-slate-800">الاسم:...............................................................</p>
                        </div>
                        <div className="space-y-2 relative">
                            <p className="font-bold text-slate-500">معد التقرير والمصادق القانوني بالمكتب</p>
                            <div className="h-10 flex items-center justify-center relative">
                                <div className="absolute border-2 border-dashed border-red-500/20 rounded-full w-20 h-20 flex items-center justify-center rotate-12 -top-5 mx-auto left-0 right-0">
                                    <span className="text-[7px] text-red-500/50 leading-tight">الوجيان والروضان<br/>محامون ومستشارون<br/>الكويت</span>
                                </div>
                            </div>
                            <p className="font-bold text-slate-800">الأستاذ المستشار صبري شطا</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Modal PDF/Print inside UI */}
            {printDoc && printDoc.isOpen && (
                <Modal isOpen={printDoc.isOpen} onClose={() => setPrintDoc(null)} title={printDoc.title} size="lg">
                    <div className="p-4 space-y-6 text-start no-print">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 font-mono text-xs text-slate-700 leading-relaxed max-h-[400px] overflow-y-auto">
                            <div className="border-b-2 border-slate-250 pb-4 mb-4 font-black">
                                مكتب الوجيان والروضان للمحاماة - الكويت | كشوف الموارد الكلية
                            </div>
                            <p className="mb-2"><strong>الموظف/ة:</strong> {printDoc.candidate.fullNameAr}</p>
                            <p className="mb-2"><strong>المسمى المستهدف:</strong> {printDoc.candidate.jobTitleAppliedAr}</p>
                            <p className="mb-2"><strong>نوع الإجراء والفيزا:</strong> {printDoc.candidate.currentVisaStatusAr}</p>
                            <p className="mb-4"><strong>مستوى اللياقة والقبول:</strong> {printDoc.candidate.educationAr}</p>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 font-semibold mb-4">
                                {language === 'ar' ? 'معاينة المستند القانوني جاهز للطباعة على الأوراق الرسمية للمكتب بختمه وعلاماته.' : 'Official certified formal document ready for printing.'}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button size="sm" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4" />}>
                                {translate('اطبع المستند المعتمد', 'Print Certified Form')}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setPrintDoc(null)}>
                                {translate('إغلاق المعاينة', 'Close Preview')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* --- Main Page Header (Hidden on Print) --- */}
            <PrintHeader title="تقرير وإحصائيات الاستقطاب وقيد الموظفين الجدد" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 no-print">
                
                {/* Visual Banner */}
                <div className="bg-white rounded-[2.5rem] p-6 md:p-10 border border-slate-100 shadow-xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5 print:hidden">
                                <Link to="/employee-affairs" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1">
                                    <span>شؤون الموظفين</span>
                                </Link>
                                <span className="text-xs text-slate-300">/</span>
                                <span className="text-xs text-slate-400 font-bold">الاستقطاب والتعيين</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                                    <BriefcaseIcon className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">Recruitment and Selection Channel</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-1">
                                إدارة <span className="text-indigo-650">الاستقطاب والتوظيف</span>
                            </h1>
                            <p className="text-xs text-slate-500 font-bold">
                                نظام إدارة قيد الموظفين الجدد، وفحص الكفاءات والمطابقات الفنية والقانونية وفقاً لقوانين وزارة الشؤون القوى العاملة بدولة الكويت.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                            <button 
                                onClick={() => setActiveTab('candidates')}
                                className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-xs font-black transition-all ${activeTab === 'candidates' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                            >
                                {translate('المترشحين والفرز', 'Candidates & Selection')}
                            </button>
                            <button 
                                onClick={() => setActiveTab('vacancies')}
                                className={`flex-1 md:flex-none py-2 px-5 rounded-lg text-xs font-black transition-all ${activeTab === 'vacancies' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                            >
                                {translate('الوظائف الشاغرة', 'Vacancies')}
                            </button>
                            <button 
                                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                                className="p-2 bg-white text-indigo-650 rounded-lg hover:bg-slate-50 transition-colors shrink-0 font-bold text-[10px]"
                                title="تغيير اللغة"
                            >
                                {language === 'ar' ? 'EN' : 'AR'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Searching & Control Panel --- */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="relative w-full md:max-w-md">
                        <Input
                            placeholder={activeTab === 'vacancies' 
                                ? translate('ابحث في المسمى الشاغر، الرقم المرجعي أو القسم...', 'Search vacancies by title, ref, or dept...')
                                : translate('ابحث عن المترشح، الجنسية، المسمى المستهدف...', 'Search candidates by name, nationality, or job...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-50 border-slate-150 pl-10 pr-4 rounded-xl text-xs"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <MagnifyingGlassIcon className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        {activeTab === 'vacancies' ? (
                            <Button 
                                size="sm" 
                                leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                                onClick={() => {
                                    setEditingVacancy({
                                        id: '',
                                        referenceNo: '',
                                        titleAr: '',
                                        titleEn: '',
                                        departmentAr: 'قسم الشركات والتجاري',
                                        departmentEn: 'Corporate Dept',
                                        status: 'Open',
                                        salaryRange: '',
                                        experienceRequired: '',
                                        nationalityPreference: '',
                                        detailsAr: '',
                                        detailsEn: ''
                                    });
                                    setIsVacancyModalOpen(true);
                                }}
                            >
                                {translate('نشر وظيفة جديدة', 'Post New Vacancy')}
                            </Button>
                        ) : (
                            <Button 
                                size="sm" 
                                leftIcon={<PlusCircleIcon className="w-4 h-4" />}
                                onClick={() => {
                                    setEditingCandidate({
                                        id: '',
                                        referenceNo: '',
                                        fullNameAr: '',
                                        fullNameEn: '',
                                        nationalityAr: 'كويتي',
                                        nationalityEn: 'Kuwaiti',
                                        email: '',
                                        phone: '',
                                        jobTitleAppliedAr: 'محام استئناف وتمييز - عمالي وإداري',
                                        jobTitleAppliedEn: 'Appeals & Cassation Lawyer',
                                        status: 'Applied',
                                        experienceYears: 5,
                                        educationAr: '',
                                        educationEn: '',
                                        currentVisaStatusAr: 'مواطن كويتي',
                                        currentVisaStatusEn: 'Kuwaiti Citizen',
                                        interviewNotesAr: '',
                                        interviewNotesEn: ''
                                    });
                                    setIsCandidateModalOpen(true);
                                }}
                            >
                                {translate('إضافة ملف مترشح', 'Register Candidate')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- Submodule Main Tab Panels --- */}
                <AnimatePresence mode="wait">
                    {activeTab === 'vacancies' ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="vac-tab"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredVacancies.map(vac => (
                                <Card key={vac.id} className="p-6 rounded-[2rem] bg-white border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <span className="font-mono text-[9px] font-black select-all text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{vac.referenceNo}</span>
                                            <h3 className="font-black text-slate-800 text-sm">{translate(vac.titleAr, vac.titleEn)}</h3>
                                            <p className="text-[11px] text-indigo-650 font-bold">{translate(vac.departmentAr, vac.departmentEn)}</p>
                                        </div>
                                        <Badge text={vac.status} variant={vac.status === 'Open' ? 'success' : vac.status === 'Closed' ? 'danger' : 'secondary'} />
                                    </div>

                                    <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-650 font-semibold mb-5">
                                        <div className="flex justify-between">
                                            <span>{translate('المرتب المرصود:', 'Salary Range:')}</span>
                                            <span className="font-sans text-indigo-750 font-black">{vac.salaryRange}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{translate('الخبرة الفنية:', 'Exp required:')}</span>
                                            <span className="text-slate-800 font-bold">{vac.experienceRequired}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{translate('الجنسية المفضلة:', 'Pref nationality:')}</span>
                                            <span className="text-slate-800 font-bold text-ellipsis overflow-hidden">{vac.nationalityPreference}</span>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-slate-500 leading-relaxed mb-6 line-clamp-2 h-10">
                                        {translate(vac.detailsAr, vac.detailsEn)}
                                    </p>

                                    <div className="flex justify-end gap-1.5 border-t border-slate-50 pt-3">
                                        <button 
                                            onClick={() => {
                                                setEditingVacancy(vac);
                                                setIsVacancyModalOpen(true);
                                            }}
                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteVacancy(vac.id)}
                                            className="p-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                            {filteredVacancies.length === 0 && (
                                <div className="col-span-full py-20 text-center text-slate-400 text-xs">
                                    {translate('لم يتم العثور على شواغر وظيفية مطابقة للبحث.', 'No job vacancies matching your search.')}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            key="cand-tab"
                            className="space-y-5"
                        >
                            <div className="overflow-hidden rounded-3xl border border-slate-150 bg-white">
                                <table className="w-full text-right">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <th className="p-4">{translate('اسم المترشح', 'Candidate Name')}</th>
                                            <th className="p-4">{translate('الوظيفة المستهدفة والقسم', 'Position Applied')}</th>
                                            <th className="p-4">{translate('الخبرة والجنسية', 'Nationality & Exp')}</th>
                                            <th className="p-4">{translate('التقييم', 'Interview Rating')}</th>
                                            <th className="p-4">{translate('الفيزا والوضع القانوني', 'Residency / Visa')}</th>
                                            <th className="p-4">{translate('الحالة الإدارية', 'Status')}</th>
                                            <th className="p-4 text-center">{translate('القرارات والإجراء الكويتي', 'Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs text-slate-750">
                                        {filteredCandidates.map(cand => (
                                            <tr key={cand.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                                                <td className="p-4">
                                                    <div>
                                                        <h4 className="font-black text-slate-900 leading-tight">{translate(cand.fullNameAr, cand.fullNameEn)}</h4>
                                                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 font-sans">
                                                            <span>{cand.phone}</span>
                                                            <span>•</span>
                                                            <span>{cand.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <span className="font-bold text-slate-800 block">{translate(cand.jobTitleAppliedAr, cand.jobTitleAppliedEn)}</span>
                                                        <span className="text-[10px] text-slate-400">{cand.referenceNo}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <span className="bg-slate-100 text-slate-650 px-2 py-0.5 rounded-full text-[10px] select-none font-bold block w-fit mb-1">{translate(cand.nationalityAr, cand.nationalityEn)}</span>
                                                        <span className="text-[10px] text-indigo-650 font-black">{cand.experienceYears} {translate('سنوات خبرة', 'years exp')}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-amber-500 font-bold tracking-tight">
                                                    {'★'.repeat(cand.interviewRating)}{'☆'.repeat(5 - cand.interviewRating)}
                                                </td>
                                                <td className="p-4 max-w-[200px] truncate">
                                                    <div>
                                                        <span className="font-semibold">{translate(cand.currentVisaStatusAr, cand.currentVisaStatusEn)}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                                        cand.status === 'Hired' ? 'bg-emerald-100 text-emerald-800' :
                                                        cand.status === 'Offered' ? 'bg-indigo-100 text-indigo-800' :
                                                        cand.status === 'Interview' ? 'bg-amber-100 text-amber-800' :
                                                        cand.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                                                    }`}>
                                                        {cand.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 flex justify-center gap-1">
                                                    <button 
                                                        onClick={() => setViewingCandidate(cand)}
                                                        className="px-2 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-650 text-slate-500 rounded-lg transition-colors font-bold text-[10px]"
                                                        title="عرض التفاصيل والمطابقة"
                                                    >
                                                        {translate('ملف الاستقطاب', 'Profile')}
                                                    </button>
                                                    
                                                    {cand.status === 'Offered' || cand.status === 'Interview' ? (
                                                        <button 
                                                            onClick={() => handlePrintOffer(cand)}
                                                            className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-black text-[10px] flex items-center gap-1"
                                                            title="عرض تفصيلي للراتب"
                                                        >
                                                            <PrinterIcon className="w-3.5 h-3.5" />
                                                            <span>{translate('عرض وتعيين', 'Offer')}</span>
                                                        </button>
                                                    ) : cand.status === 'Hired' ? (
                                                        <button 
                                                            onClick={() => handlePrintOnboarding(cand)}
                                                            className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-black text-[10px] flex items-center gap-1"
                                                            title="بطاقة المطابقة"
                                                        >
                                                            <PrinterIcon className="w-3.5 h-3.5" />
                                                            <span>{translate('مطابقة قانونية', 'Work Permit')}</span>
                                                        </button>
                                                    ) : null}

                                                    <button 
                                                        onClick={() => {
                                                            setEditingCandidate(cand);
                                                            setIsCandidateModalOpen(true);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteCandidate(cand.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-650 rounded-lg transition-colors"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- Modals and Editors --- */}

            {/* A. Candidate Profile / Assessment Drawer */}
            {viewingCandidate && (
                <Modal isOpen={!!viewingCandidate} onClose={() => setViewingCandidate(null)} title={translate('بطاقة تقييم ومسيرة المترشح الوظيفية', 'Candidate Assessment Sheet')} size="xl">
                    <div className="p-4 space-y-6 text-start no-print">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-900 border-b pb-2">{translate('البيانات الشخصية والاتصال', 'Personal Information')}</h3>
                                <div className="space-y-1.5 text-xs text-slate-650">
                                    <p><strong>{translate('الاسم الكامل بالعربية:', 'FullName (AR):')}</strong> {viewingCandidate.fullNameAr}</p>
                                    <p><strong>{translate('الاسم الكامل بالإنجليزية:', 'FullName (EN):')}</strong> {viewingCandidate.fullNameEn}</p>
                                    <p><strong>{translate('الجنسية الحالية:', 'Nationality:')}</strong> {viewingCandidate.nationalityAr}</p>
                                    <p><strong>{translate('البريد الإلكتروني المعتمد:', 'Email:')}</strong> {viewingCandidate.email}</p>
                                    <p><strong>{translate('رقم الهاتف النقال:', 'Phone:')}</strong> {viewingCandidate.phone}</p>
                                    <p><strong>{translate('نوع الإقامة ودولة الاستقدام:', 'Current Visa info:')}</strong> {viewingCandidate.currentVisaStatusAr}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-900 border-b pb-2">{translate('الخبرات الفنية والتعليم', 'Technical Background')}</h3>
                                <div className="space-y-1.5 text-xs text-slate-650">
                                    <p><strong>{translate('المسمى المستهدف للتوظيف:', 'Target Position:')}</strong> {viewingCandidate.jobTitleAppliedAr}</p>
                                    <p><strong>{translate('سنوات الخبرة العملية:', 'Experience Years:')}</strong> {viewingCandidate.experienceYears} {translate('سنوات', 'years')}</p>
                                    <p><strong>{translate('الدرجة العلمية الجامعية الدراسية:', 'Education Degree:')}</strong> {viewingCandidate.educationAr}</p>
                                    <p><strong>{translate('تقييم المقابلة الفنية:', 'Interview Rating:')}</strong> <span className="text-amber-500 font-mono">{'★'.repeat(viewingCandidate.interviewRating)}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Onboarding Checklist Status */}
                        <div className="space-y-3 pt-4 border-t">
                            <h3 className="text-sm font-black text-slate-900">{translate('استمارة فحص وتدقيق المستندات الرسمية ومطابقتها (وزارة الشؤون والقوى العاملة الكويتية)', 'ministry of labor official document checklists')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                    <input 
                                        type="checkbox" 
                                        checked={viewingCandidate.onboardingChecklist.civilIdCopy}
                                        onChange={(e) => {
                                            const up = candidates.map(c => c.id === viewingCandidate.id ? {
                                                ...c, onboardingChecklist: { ...c.onboardingChecklist, civilIdCopy: e.target.checked }
                                            } : c);
                                            setCandidates(up);
                                            setViewingCandidate({ ...viewingCandidate, onboardingChecklist: { ...viewingCandidate.onboardingChecklist, civilIdCopy: e.target.checked } });
                                        }}
                                        className="rounded text-indigo-600 w-4 h-4" 
                                    />
                                    <span>{translate('صورة البطاقة المدنية صالحة', 'Civil ID Copy')}</span>
                                </label>
                                <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                    <input 
                                        type="checkbox" 
                                        checked={viewingCandidate.onboardingChecklist.passportCopy}
                                        onChange={(e) => {
                                            const up = candidates.map(c => c.id === viewingCandidate.id ? {
                                                ...c, onboardingChecklist: { ...c.onboardingChecklist, passportCopy: e.target.checked }
                                            } : c);
                                            setCandidates(up);
                                            setViewingCandidate({ ...viewingCandidate, onboardingChecklist: { ...viewingCandidate.onboardingChecklist, passportCopy: e.target.checked } });
                                        }}
                                        className="rounded text-indigo-600 w-4 h-4" 
                                    />
                                    <span>{translate('صورة جواز السفر المعتمد', 'Passport copy')}</span>
                                </label>
                                <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                    <input 
                                        type="checkbox" 
                                        checked={viewingCandidate.onboardingChecklist.certificatesAttested}
                                        onChange={(e) => {
                                            const up = candidates.map(c => c.id === viewingCandidate.id ? {
                                                ...c, onboardingChecklist: { ...c.onboardingChecklist, certificatesAttested: e.target.checked }
                                            } : c);
                                            setCandidates(up);
                                            setViewingCandidate({ ...viewingCandidate, onboardingChecklist: { ...viewingCandidate.onboardingChecklist, certificatesAttested: e.target.checked } });
                                        }}
                                        className="rounded text-indigo-600 w-4 h-4" 
                                    />
                                    <span>{translate('الشهادة المصدقة والخارجية', 'Certificates Attested')}</span>
                                </label>
                                <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                    <input 
                                        type="checkbox" 
                                        checked={viewingCandidate.onboardingChecklist.workPermitMoSA}
                                        onChange={(e) => {
                                            const up = candidates.map(c => c.id === viewingCandidate.id ? {
                                                ...c, onboardingChecklist: { ...c.onboardingChecklist, workPermitMoSA: e.target.checked }
                                            } : c);
                                            setCandidates(up);
                                            setViewingCandidate({ ...viewingCandidate, onboardingChecklist: { ...viewingCandidate.onboardingChecklist, workPermitMoSA: e.target.checked } });
                                        }}
                                        className="rounded text-indigo-600 w-4 h-4" 
                                    />
                                    <span>{translate('تصريح وإذن العمل الرسمي', 'Work Permit (MoSA)')}</span>
                                </label>
                                <label className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-150 flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                    <input 
                                        type="checkbox" 
                                        checked={viewingCandidate.onboardingChecklist.bankIbanSubmitted}
                                        onChange={(e) => {
                                            const up = candidates.map(c => c.id === viewingCandidate.id ? {
                                                ...c, onboardingChecklist: { ...c.onboardingChecklist, bankIbanSubmitted: e.target.checked }
                                            } : c);
                                            setCandidates(up);
                                            setViewingCandidate({ ...viewingCandidate, onboardingChecklist: { ...viewingCandidate.onboardingChecklist, bankIbanSubmitted: e.target.checked } });
                                        }}
                                        className="rounded text-indigo-600 w-4 h-4" 
                                    />
                                    <span>{translate('شهادة الآيبان IBAN البنكية', 'Bank IBAN slip')}</span>
                                </label>
                            </div>
                        </div>

                        {/* Interview Notes */}
                        <div className="bg-slate-50 p-4 rounded-2xl border leading-relaxed space-y-2">
                            <h4 className="font-black text-xs text-slate-800">{translate('ملاحظات اللجنة وتقييم شؤون التوظيف:', 'Selection Committee & HR Notes:')}</h4>
                            <p className="text-xs text-slate-650">{translate(viewingCandidate.interviewNotesAr, viewingCandidate.interviewNotesEn)}</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                            <span className="text-[10px] text-slate-400 font-bold self-center mr-auto">Kuwait Labor Compliant Audit system</span>
                            <Button size="sm" variant="outline" onClick={() => setViewingCandidate(null)}>
                                {translate('إغلاق', 'Close')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* B. Create / Edit Vacancy Modal */}
            {isVacancyModalOpen && editingVacancy && (
                <Modal isOpen={isVacancyModalOpen} onClose={() => setIsVacancyModalOpen(false)} title={translate('تحرير بيانات الوظيفة والشارع الشاغر', 'Maintain Job Vacancy info')} size="lg">
                    <form onSubmit={handleSaveVacancy} className="p-4 space-y-4 text-start no-print">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('المسمى الوظيفي (العربية):', 'Job Title (AR):')}
                                value={editingVacancy.titleAr || ''}
                                onChange={(e) => setEditingVacancy({ ...editingVacancy, titleAr: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('المسمى الوظيفي (الإنجليزية):', 'Job Title (EN):')}
                                value={editingVacancy.titleEn || ''}
                                onChange={(e) => setEditingVacancy({ ...editingVacancy, titleEn: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select 
                                label={translate('القسم التنظيمي:', 'Select Department:')}
                                value={editingVacancy.departmentAr || ''}
                                onChange={(e) => setEditingVacancy({ ...editingVacancy, departmentAr: e.target.value })}
                                options={[
                                    { value: 'قسم الشركات والتجاري', label: 'قسم الشركات والتجاري' },
                                    { value: 'قسم القضايا العمالية', label: 'قسم القضايا العمالية' },
                                    { value: 'قسم التقاضي والمحاكم', label: 'قسم التقاضي والمحاكم' },
                                    { value: 'الشؤون الإدارية والسكرتارية', label: 'الشؤون الإدارية والسكرتارية' }
                                ]}
                            />
                            <Input 
                                label={translate('تقدير الأجر المرصود (د.ك):', 'Compensation salary range:')}
                                value={editingVacancy.salaryRange || ''}
                                placeholder="مثال: 1,500 - 1,800 د.ك"
                                onChange={(e) => setEditingVacancy({ ...editingVacancy, salaryRange: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('الخبرة الفنية المستهدفة:', 'Target Exp years:')}
                                value={editingVacancy.experienceRequired || ''}
                                placeholder="مثال: 5 سنوات"
                                onChange={(e) => setEditingVacancy({ ...editingVacancy, experienceRequired: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('الجنسية أو الوضع القانوني المقترح:', 'Nationality specs:')}
                                value={editingVacancy.nationalityPreference || ''}
                                placeholder="مثال: يفضل مواطنين كويتيين / نقل إقامة"
                                onChange={(e) => setEditingVacancy({ ...editingVacancy, nationalityPreference: e.target.value })}
                                required
                            />
                        </div>
                        <TextArea 
                            label={translate('تفاصيل البند والمسؤوليات (العربية):', 'Description & duties (AR):')}
                            value={editingVacancy.detailsAr || ''}
                            rows={3}
                            onChange={(e) => setEditingVacancy({ ...editingVacancy, detailsAr: e.target.value })}
                            required
                        />
                        <TextArea 
                            label={translate('تفاصيل البند والمسؤوليات (الإنجليزية):', 'Description & duties (EN):')}
                            value={editingVacancy.detailsEn || ''}
                            rows={3}
                            onChange={(e) => setEditingVacancy({ ...editingVacancy, detailsEn: e.target.value })}
                            required
                        />

                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsVacancyModalOpen(false)}>
                                {translate('إلغاء', 'Cancel')}
                            </Button>
                            <Button type="submit" size="sm">
                                {translate('حفظ ومصادقة', 'Save Job')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* C. Create / Edit Candidate Modal */}
            {isCandidateModalOpen && editingCandidate && (
                <Modal isOpen={isCandidateModalOpen} onClose={() => setIsCandidateModalOpen(false)} title={translate('تسجيل وتحديث بيانات مترشح لوظيفة', 'Register Candidate assessment profile')} size="lg">
                    <form onSubmit={handleSaveCandidate} className="p-4 space-y-4 text-start no-print">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate(' الاسم الكامل بالعربية:', 'FullName (AR):')}
                                value={editingCandidate.fullNameAr || ''}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, fullNameAr: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('الاسم الكامل بالإنجليزية:', 'FullName (EN):')}
                                value={editingCandidate.fullNameEn || ''}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, fullNameEn: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('الجنسية بالعربية:', 'Nationality (AR):')}
                                value={editingCandidate.nationalityAr || ''}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, nationalityAr: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('الجنسية بالإنجليزية:', 'Nationality (EN):')}
                                value={editingCandidate.nationalityEn || ''}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, nationalityEn: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('البريد الإلكتروني:', 'Email:')}
                                type="email"
                                value={editingCandidate.email || ''}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, email: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('الهاتف النقال (الكويت):', 'Phone Number:')}
                                value={editingCandidate.phone || ''}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, phone: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('المسمى الوظيفي المستهدف بالعربية:', 'Applied Job Title (AR):')}
                                value={editingCandidate.jobTitleAppliedAr || ''}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, jobTitleAppliedAr: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('سنوات الخبرة العملية الكلية:', 'Experience Years:')}
                                type="number"
                                value={editingCandidate.experienceYears || 5}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, experienceYears: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input 
                                label={translate('التحصيل العلمي والجامعة:', 'University Degree (AR):')}
                                value={editingCandidate.educationAr || ''}
                                placeholder="مثال: ليسانس حقوق جامعة الكويت"
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, educationAr: e.target.value })}
                                required
                            />
                            <Input 
                                label={translate('حالة الفيزا والإقامة الحالية بالكويت:', 'Residency Status (AR):')}
                                value={editingCandidate.currentVisaStatusAr || ''}
                                placeholder="مثال: إقامة مادة 18 عمل قابلة للتحويل"
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, currentVisaStatusAr: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select 
                                label={translate('تقييم المقابلة الفنية الشامل:', 'Technical interview rating:')}
                                value={(editingCandidate.interviewRating || 5).toString()}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, interviewRating: parseInt(e.target.value) })}
                                options={[
                                    { value: '5', label: 'ممتاز ★★★★★' },
                                    { value: '4', label: 'جيد جداً ★★★★☆' },
                                    { value: '3', label: 'جيد متوسط ★★★☆☆' },
                                    { value: '2', label: 'مقبول ★★☆☆☆' },
                                    { value: '1', label: 'غير مؤهل ★☆☆☆☆' }
                                ]}
                            />
                            <Select 
                                label={translate('حالة الطلب الإدارية الحالية:', 'Hiring Status:')}
                                value={editingCandidate.status || 'Applied'}
                                onChange={(e) => setEditingCandidate({ ...editingCandidate, status: e.target.value as any })}
                                options={[
                                    { value: 'Applied', label: 'مترشح جديد (Applied)' },
                                    { value: 'Review', label: 'تدقيق الأوراق (Review)' },
                                    { value: 'Interview', label: 'مقابلات فنية (Interview)' },
                                    { value: 'Offered', label: 'تم تقديم عرض (Offered)' },
                                    { value: 'Hired', label: 'تم التوظيف وقبول الأوراق (Hired)' },
                                    { value: 'Rejected', label: 'مرفوض إدارياً (Rejected)' }
                                ]}
                            />
                        </div>

                        <TextArea 
                            label={translate('ملخص تقييم اللجنة وملاحظات المقابلة (العربية):', 'Interview / Assessment summary notes (AR):')}
                            value={editingCandidate.interviewNotesAr || ''}
                            rows={2}
                            onChange={(e) => setEditingCandidate({ ...editingCandidate, interviewNotesAr: e.target.value })}
                            required
                        />

                        <div className="flex justify-end gap-2 pt-2 border-t font-sans">
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsCandidateModalOpen(false)}>
                                {translate('إلغاء', 'Cancel')}
                            </Button>
                            <Button type="submit" size="sm">
                                {translate('حفظ ومصادقة المستند', 'Save Candidate')}
                            </Button>
                        </div>
                    </form>
                </Modal>
            )}

        </div>
    );
};

export default RecruitmentHiringPage;
