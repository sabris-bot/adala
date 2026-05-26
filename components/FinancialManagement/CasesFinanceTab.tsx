import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Briefcase, 
    TrendingUp, 
    Clock, 
    Activity, 
    ArrowUpRight, 
    CheckCircle, 
    ChevronDown, 
    ChevronUp, 
    DollarSign,
    Scale,
    BookmarkCheck
} from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import { initialCases } from '../../data/caseData';

// Generate mock financial flows for cases
interface CaseFinancialAuditModel {
    caseId: string;
    grossInflow: number;
    expExpenses: number;
    platformCommission: number;
    payoutToLawyer: number;
    workflowStages: {
        stageName: string;
        paymentStatus: 'paid' | 'pending' | 'not_reached';
        cost: number;
    }[];
    transactions: {
        id: string;
        title: string;
        date: string;
        amount: number;
        type: 'credit' | 'debit';
    }[];
}

interface CasesFinanceTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
}

export const CasesFinanceTab: React.FC<CasesFinanceTabProps> = ({ formatCurrency }) => {
    // Generate static case finance audit data
    const [caseAudits] = useState<Record<string, CaseFinancialAuditModel>>({
        '1': {
            caseId: '1',
            grossInflow: 12500,
            expExpenses: 800,
            platformCommission: 3125,
            payoutToLawyer: 8575,
            workflowStages: [
                { stageName: 'رسوم إيداع وتحضير القضية', paymentStatus: 'paid', cost: 300 },
                { stageName: 'أتعاب جلسات المرافعة الشفوية بالدرجة الأولى', paymentStatus: 'paid', cost: 4500 },
                { stageName: 'أتعاب الطعن والاستئناف العالي', paymentStatus: 'paid', cost: 4200 },
                { stageName: 'أتعاب الطعن وإيداع مذكرات التمييز الكلي', paymentStatus: 'pending', cost: 3500 }
            ],
            transactions: [
                { id: 'TFL-201', title: 'تحصيل أتعاب تمثيل أولي بوبيان', date: '2024-04-12', amount: 8000, type: 'credit' },
                { id: 'TFL-202', title: 'رسوم انتقال قضائي وإعلان', date: '2024-04-15', amount: 300, type: 'debit' },
                { id: 'TFL-203', title: 'سند تحصيل كفالة ومطالبة الكترونية', date: '2024-05-18', amount: 4500, type: 'credit' },
                { id: 'TFL-204', title: 'رسوم إيداع تقرير خبراء الاستئناف', date: '2024-05-20', amount: 500, type: 'debit' }
            ]
        },
        '2': {
            caseId: '2',
            grossInflow: 5700,
            expExpenses: 250,
            platformCommission: 1425,
            payoutToLawyer: 4025,
            workflowStages: [
                { stageName: 'صياغة المذكرات العمالية التمهيدية', paymentStatus: 'paid', cost: 2000 },
                { stageName: 'تدقيق ومقاصة روائح لوائح الغانم', paymentStatus: 'paid', cost: 3700 }
            ],
            transactions: [
                { id: 'TFL-301', title: 'أتعاب استشارة عمالية الغانم كود 2010', date: '2024-04-05', amount: 2000, type: 'credit' },
                { id: 'TFL-302', title: 'تحصيل دفعة صياغة العقائد والمخالصات', date: '2024-05-10', amount: 3700, type: 'credit' },
                { id: 'TFL-303', title: 'رسوم تصديق عقائدي لوزارة الداخلية', date: '2024-05-11', amount: 250, type: 'debit' }
            ]
        },
        '3': {
            caseId: '3',
            grossInflow: 8900,
            expExpenses: 1200,
            platformCommission: 2225,
            payoutToLawyer: 5475,
            workflowStages: [
                { stageName: 'صياغة دعوى إخلاء العقار المأجور', paymentStatus: 'paid', cost: 4500 },
                { stageName: 'رسوم إثبات الحالة والانتقال للمعالجة الكلية', paymentStatus: 'paid', cost: 1200 },
                { stageName: 'أتعاب التنفيذ الفعلي والشرطة القضائية', paymentStatus: 'pending', cost: 3200 }
            ],
            transactions: [
                { id: 'TFL-401', title: 'تحصيل دفعة أولى دعوى الإيجار العبدالله', date: '2024-03-12', amount: 4500, type: 'credit' },
                { id: 'TFL-402', title: 'دفع رسوم معاينة عقار استثماري مأجور', date: '2024-03-18', amount: 1200, type: 'debit' },
                { id: 'TFL-403', title: 'تحصيل سند الدفعة الاستئنافية والنزاع', date: '2024-04-15', amount: 4400, type: 'credit' }
            ]
        }
    });

    // Toggle active accordion row
    const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

    const toggleExpand = (caseId: string) => {
        setExpandedCaseId(expandedCaseId === caseId ? null : caseId);
    };

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* Header portion */}
            <div className="bg-white dark:bg-dm-card p-5 rounded-[2rem] shadow-sm border border-slate-150 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                    <Scale className="w-5 h-5 text-indigo-650" /> التدقيق المالي المتكامل لملفات القضايا والموكلين
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">متابعة شفافّة لتدفقات الحوالات والرسوم الموجهة حسب مراحل سير العمل التعاقدي والنمو</p>
            </div>

            {/* Expandable Case Finances Accordion */}
            <div className="space-y-4">
                {initialCases.map((cs) => {
                    const isExpanded = expandedCaseId === cs.id;
                    const audit = caseAudits[cs.id] || {
                        caseId: cs.id,
                        grossInflow: 5000,
                        expExpenses: 0,
                        platformCommission: 1250,
                        payoutToLawyer: 3750,
                        workflowStages: [{ stageName: 'أتعاب الإيداع الأولي', paymentStatus: 'paid', cost: 5000 }],
                        transactions: [{ id: 'TX-DEF', title: 'أتعاب تسجيل القضية بالمنظومة', date: '2024-05-10', amount: 5000, type: 'credit' }]
                    };

                    return (
                        <div 
                            key={cs.id}
                            className="bg-white dark:bg-dm-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-md overflow-hidden transition-all"
                        >
                            {/* Accordion Trigger Header */}
                            <div 
                                onClick={() => toggleExpand(cs.id)}
                                className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors"
                            >
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs font-black text-slate-850 dark:text-white">{cs.title}</h4>
                                        <Badge variant="info" text={cs.caseNumber} className="font-mono bg-slate-50 dark:bg-slate-900" />
                                        <span className="text-[8px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 font-bold px-2 py-0.5 rounded-lg border border-indigo-100/10">المحاماة الكلية</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">الموكل المعني: {cs.clientName || 'بنك بوبيان'} | حالة الدعوى العامة: <span className="text-indigo-600">{cs.status}</span></p>
                                </div>

                                <div className="flex items-center gap-6 self-stretch md:self-auto justify-between md:justify-end">
                                    <div className="text-left font-mono">
                                        <span className="text-[9px] text-slate-400 block font-bold">القيمة الحالية للدعوى (Gross)</span>
                                        <span className="text-base font-black text-indigo-650 dark:text-indigo-400 block">{formatCurrency(audit.grossInflow)}</span>
                                    </div>

                                    <div className="p-2 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-400">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </div>
                            </div>

                            {/* Accordion Expandable Content Panel */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-900/5 overflow-hidden"
                                    >
                                        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                            
                                            {/* Column 1: Stages status per legal workflow */}
                                            <div className="lg:col-span-4 space-y-4">
                                                <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <BookmarkCheck className="w-4 h-4 text-indigo-600" /> دفع العمولات حسب مراحل الدعوى
                                                </h5>
                                                
                                                <div className="space-y-3.5 relative border-r border-slate-200 dark:border-slate-800 pr-4 mt-2">
                                                    {audit.workflowStages.map((stg, i) => (
                                                        <div key={i} className="relative space-y-1">
                                                            {/* Bullet point node */}
                                                            <div className={`absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white ${stg.paymentStatus === 'paid' ? 'border-emerald-500' : 'border-slate-300'}`} />
                                                            
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 block">{stg.stageName}</span>
                                                                {stg.paymentStatus === 'paid' ? (
                                                                    <span className="text-[8px] text-emerald-600 font-bold px-1 rounded bg-emerald-50/50">مسددة</span>
                                                                ) : (
                                                                    <span className="text-[8px] text-amber-600 font-bold px-1 rounded bg-amber-50/50">مستحقة</span>
                                                                )}
                                                            </div>
                                                            <span className="text-[9px] text-slate-400 block font-mono">الرسوم المستهدفة: {formatCurrency(stg.cost)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Column 2: Audit Breakdowns list */}
                                            <div className="lg:col-span-8 space-y-4">
                                                <h5 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Activity className="w-4 h-4 text-indigo-600" /> كشف وتحليل الحوالات البينية الواردة والصرف
                                                </h5>

                                                <div className="bg-white dark:bg-dm-card rounded-2xl border border-slate-100 dark:border-slate-850 p-4 space-y-4">
                                                    
                                                    {/* Total breakdown preview */}
                                                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-850">
                                                        <div>
                                                            <span className="text-slate-400 font-bold block">إجمالي النفقات:</span>
                                                            <span className="text-rose-500 font-mono font-black block mt-0.5">-{formatCurrency(audit.expExpenses)}</span>
                                                        </div>
                                                        <div className="border-x border-slate-150 dark:border-slate-800">
                                                            <span className="text-slate-400 font-bold block">عمولة المنظمة:</span>
                                                            <span className="text-indigo-600 font-mono font-black block mt-0.5">-{formatCurrency(audit.platformCommission)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 font-bold block">صافي المحامي المكلف:</span>
                                                            <span className="text-emerald-600 font-mono font-black block mt-0.5">{formatCurrency(audit.payoutToLawyer)}</span>
                                                        </div>
                                                    </div>

                                                    {/* Mini log table of real ledger history */}
                                                    <div className="space-y-2">
                                                        <span className="text-[9px] text-slate-400 font-bold block">تأريخ المعاملات لملف التقاضى:</span>
                                                        {audit.transactions.map((tx) => (
                                                            <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50/30 dark:bg-slate-900/20 border border-slate-100/50 dark:border-slate-850">
                                                                <div className="space-y-0.5">
                                                                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block">{tx.title}</span>
                                                                    <span className="text-[8px] text-slate-400 block font-mono">رقم القيد: {tx.id} | {tx.date}</span>
                                                                </div>
                                                                <span className={`text-[11px] font-black font-mono ${tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                </div>
                                            </div>

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
