import React from 'react';
import { InvestigationCase, CaseStatus } from './types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
    Folder, Clock, CheckCircle2, ShieldAlert, FilePlus, 
    TrendingUp, Award, Calendar, AlertTriangle, ArrowUpRight, Scale, ChevronLeft, FileSpreadsheet
} from 'lucide-react';

interface DashboardTabProps {
    cases: InvestigationCase[];
    stats: {
        total: number;
        new: number;
        ongoing: number;
        closed: number;
        onHold: number;
    };
    onSelectCase: (id: string) => void;
    onAddCaseTrigger: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
    cases,
    stats,
    onSelectCase,
    onAddCaseTrigger
}) => {
    // 1. Calculate violation distribution
    const categoryCounts: Record<string, number> = {};
    cases.forEach(c => {
        const cat = c.category || 'مخالفات لائحية عامة';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // 2. Identify cases with imminent statutory limit under Article 35
    // Kuwaiti Law specifies that no penalty can be imposed on incidents discovered more than 15 days ago without initiating investigation.
    // Let's identify cases that have been open for more than 10 days and are still active (NOT closed) as "عاجل قبل السقوط القانوني".
    const activeRiskCases = cases.filter(c => {
        if (c.status === CaseStatus.CLOSED || c.status === CaseStatus.ARCHIVED) return false;
        const oDate = new Date(c.startDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - oDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 10; // 10 days or older
    });

    // 3. Compute overall compliance rate across all cases based on safeguards checklists
    let totalScore = 0;
    let scoredCasesCount = 0;
    cases.forEach(c => {
        if (c.safeguards) {
            const checklist = c.safeguards;
            const checkedCount = Object.values(checklist).filter(Boolean).length;
            totalScore += (checkedCount / 5) * 100;
            scoredCasesCount++;
        }
    });
    const avgComplianceRate = scoredCasesCount > 0 ? Math.round(totalScore / scoredCasesCount) : 85;

    return (
        <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
            {/* 1. Bento Grid of Core Stats Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { title: "إجمالي الواقعات والملفات", count: stats.total, color: "text-slate-900 border-r-4 border-r-amber-500", icon: <Folder className="w-5 h-5 text-amber-600" /> },
                    { title: "البلاغات الجديدة الواردة", count: stats.new, color: "text-blue-600 border-r-4 border-r-blue-500", icon: <FilePlus className="w-5 h-5 text-blue-500 animate-pulse" /> },
                    { title: "قيد التحقيق والاستجواب", count: stats.ongoing, color: "text-indigo-600 border-r-4 border-r-indigo-500", icon: <Clock className="w-5 h-5 text-indigo-500" /> },
                    { title: "ملف عالي الخطورة / معلّق", count: stats.onHold, color: "text-red-600 border-r-4 border-r-red-500", icon: <ShieldAlert className="w-5 h-5 text-red-500" /> },
                    { title: "قضايا منتهية ومصدقة", count: stats.closed, color: "text-emerald-600 border-r-4 border-r-emerald-500", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white border text-right rounded-2xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-black text-slate-500">{stat.title}</p>
                            <p className={`text-2xl font-black ${stat.color} pr-2`}>{stat.count}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border">{stat.icon}</div>
                    </div>
                ))}
            </div>

            {/* 2. Main Analytics Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Right Panel: Imminent Legal Deadline Alerts (Article 35 monitoring) */}
                <div className="lg:col-span-2 space-y-4">
                    
                    <Card className="p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b pb-3.5">
                            <div className="space-y-1">
                                <span className="bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-lg text-[9px] font-extrabold inline-block">
                                    المراقبة اللائحية • أمن الامتثال
                                </span>
                                <h3 className="text-sm font-black text-slate-900 block flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                                    مراقب المهل القانونية وسقوط الحق التأديبي (مادة 35)
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-extrabold">الحد الأقصى: 15 يوماً</span>
                        </div>

                        {activeRiskCases.length === 0 ? (
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                                <p className="text-xs font-black text-emerald-800">✓ جميع قضايا التحقيق الحالية مستوفاة لشرط المدد في قانون العمل الكويتي.</p>
                                <p className="text-[10px] text-emerald-600 font-medium font-sans">لم يتجاوز أي ملف نشط حاجز الـ 10 أيام منذ قيده لضمانة تدرج العقوبة وسلامتها القضائية.</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {activeRiskCases.map(c => {
                                    const oDate = new Date(c.startDate);
                                    const diffDays = Math.ceil(Math.abs(new Date().getTime() - oDate.getTime()) / (1000 * 60 * 60 * 24));
                                    const remainingDays = 15 - diffDays;
                                    const isCritical = remainingDays <= 3;
                                    return (
                                        <div 
                                            key={c.id} 
                                            className={`p-4 border rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-500/5 border-amber-200'}`}
                                        >
                                            <div className="space-y-1 text-right">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md text-white ${isCritical ? 'bg-red-650 animate-bounce' : 'bg-amber-600'}`}>
                                                        {isCritical ? 'حرِج جداً' : 'انتباه'}
                                                    </span>
                                                    <span className="text-xs font-black text-slate-900 font-mono">{c.caseNumber}</span>
                                                    <span className="text-slate-350">•</span>
                                                    <span className="text-xs font-bold text-slate-500">{c.employeeName}</span>
                                                </div>
                                                <h4 className="text-xs font-black text-slate-800 line-clamp-1">{c.subject}</h4>
                                                <p className="text-[10px] font-medium text-slate-400 font-sans">تاريخ فتح قيد الملف: {c.startDate} ({diffDays} يوم مرت)</p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                                <div className="text-left font-sans">
                                                    <p className={`text-xs font-extrabold ${isCritical ? 'text-red-700' : 'text-amber-800'}`}>المتبقي: {remainingDays} أيام عمل</p>
                                                    <p className="text-[9px] text-slate-400 font-bold">تسقط العقوبة لائحياً بعد {remainingDays} أيام</p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="primary" 
                                                    className={`text-[10px] font-black rounded-lg ${isCritical ? 'bg-red-700 hover:bg-red-800 border-none' : 'bg-slate-900 hover:bg-slate-800 border-none'}`}
                                                    onClick={() => onSelectCase(c.id)}
                                                >
                                                    مباشرة فورية
                                                    <ChevronLeft className="w-3.5 h-3.5 mr-1 inline-block" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Dynamic Pure CSS Analytics Charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. Violation categories horizontal bar list */}
                        <Card className="p-5 bg-white border rounded-3xl shadow-sm space-y-4">
                            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b pb-2.5">
                                <TrendingUp className="w-4 h-4 text-slate-700" />
                                كشف توزيع الملفات حسب تصنيف المخالفة
                            </h3>
                            
                            <div className="space-y-3">
                                {Object.keys(categoryCounts).map((cat, idx) => {
                                    const count = categoryCounts[cat];
                                    const total = stats.total || 1;
                                    const percentage = Math.round((count / total) * 100);
                                    
                                    // Custom visual bars gradient
                                    const colorTheme = idx % 3 === 0 ? 'bg-amber-500' : idx % 3 === 1 ? 'bg-indigo-600' : 'bg-slate-800';
                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px] font-black text-slate-700">
                                                <span>{cat}</span>
                                                <span className="font-mono">{count} ملفات ({percentage}%)</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                                <div className={`h-full ${colorTheme}`} style={{ width: `${percentage}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* 2. State-of-the-art compliance score index */}
                        <Card className="p-5 bg-white border rounded-3xl shadow-sm text-center flex flex-col justify-between">
                            <div className="space-y-1">
                                <h3 className="text-xs font-black text-slate-900 flex items-center justify-center gap-1.5 border-b pb-2.5">
                                    <Scale className="w-4 h-4 text-emerald-600" />
                                    مؤشر الامتثال والعدالة الإجرائية العام
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold leading-normal pt-1">مستوى التزام الأجهزة والباحثين القانونيين بشروط قانون العمل الكويتي ومراعاة ضمانات الدفاع العمالي الموثق.</p>
                            </div>

                            <div className="my-4 relative inline-flex items-center justify-center mx-auto">
                                {/* Simulated Circular Progress ring */}
                                <div className="w-24 h-24 rounded-full border-8 border-slate-100 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-indigo-50/10 to-indigo-100/10">
                                    <div className="space-y-0.5">
                                        <span className="text-2xl font-black text-indigo-900 font-sans">{avgComplianceRate}%</span>
                                        <span className="text-[8px] font-black text-emerald-600 block">امتثال لائحى</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-indigo-800 font-extrabold leading-normal">
                                ✓ التحقق المسبق يغنيك عن منازعات الهيئة العامة للقوى العاملة.
                            </p>
                        </Card>
                    </div>
                </div>

                {/* Left Panel: Compliance checklist summary & fast actions */}
                <div className="lg:col-span-1 space-y-4">
                    
                    <Card className="p-5 bg-slate-900 text-white rounded-3xl shadow-md space-y-4 flex flex-col justify-between min-h-[360px]">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                                <span className="text-xs font-black flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-amber-400" />
                                    قواعد المسلك والجزاءات (المادة 102)
                                </span>
                            </div>

                            <div className="space-y-3 leading-relaxed text-[11px] text-slate-350">
                                <p className="font-bold">يتيح تدرج العقوبة حماية أمن المنشأة الكروي والممارسات المهنية:</p>
                                <ul className="space-y-2 text-[10px] list-none pr-0 font-bold border-r border-dashed border-slate-700 mr-1.5">
                                    <li className="flex items-start gap-1 p-1 bg-slate-850/55 rounded border border-slate-800">
                                        <span className="text-amber-400 ml-1 font-mono">1.</span>
                                        <span>تنبيه خطي بسيط / إنذار كتابي أول.</span>
                                    </li>
                                    <li className="flex items-start gap-1 p-1 bg-slate-850/55 rounded border border-slate-800">
                                        <span className="text-amber-400 ml-1 font-mono">2.</span>
                                        <span>خصم من راتب اليوم الواحد بما لا يجاوز 5 أيام عمل لائحياً.</span>
                                    </li>
                                    <li className="flex items-start gap-1 p-1 bg-slate-850/55 rounded border border-slate-800">
                                        <span className="text-amber-400 ml-1 font-mono">3.</span>
                                        <span>إيقاف مؤقت عن ممارسة العمل مع حرمان نصف الأجر (مادة 58).</span>
                                    </li>
                                    <li className="flex items-start gap-1 p-1 bg-slate-850/55 rounded border border-slate-800 text-rose-300 border-rose-950 bg-rose-950/20">
                                        <span className="text-rose-400 ml-1 font-mono">4.</span>
                                        <span>فصل مع حيازة المكافأة أو الحرمان طبقاً للمادة 41 لدواعٍ أمنية وجسيمة.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <Button 
                            variant="primary" 
                            className="w-full h-11 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow bg-amber-500 text-slate-950 hover:bg-amber-650 border-none mt-4 transition-colors"
                            onClick={onAddCaseTrigger}
                        >
                            <FilePlus className="w-4 h-4" />
                            فتح قضية تحقيق وجرد جديدة
                        </Button>
                    </Card>

                    {/* Quick Law lookup guidelines shortcut */}
                    <Card className="p-4 bg-white border rounded-2xl shadow-sm text-right">
                        <h4 className="text-[11px] font-black text-slate-500 block mb-1">الضمانات المنهجية المتبعة بـ عدالة:</h4>
                        <p className="text-[10px] leading-relaxed text-slate-600 font-bold">
                            تتم حماية أي إجراء من خلال تدقيقه رقابياً ضد التجاوز والتسويف. يرجى توثيق إفادات Witness / Employee بالسرعة الأكيدة والمصادقة الفورية من الشريك الإداري لإنماء الأثر المالي للتنفيذ.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};
