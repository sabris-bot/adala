import React from 'react';
import { 
    Sparkles, Award, ShieldAlert, BellRing, ChevronRight, ClipboardCheck, Check, AlertTriangle 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import { EmployeeRequest } from './request-types';

interface RequestDashboardProps {
    requests: EmployeeRequest[];
    disciplinaryLogs: any[];
    onViewRequest: (req: EmployeeRequest) => void;
}

export const RequestDashboard: React.FC<RequestDashboardProps> = ({ 
    requests, 
    disciplinaryLogs, 
    onViewRequest 
}) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Highlights alerts and integrations */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="p-6 bg-white dark:bg-[#1E3C50] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
                        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                        موجز تدقيق الامتثال والأنظمة العمالية الكويتية
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex gap-3 text-right">
                            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300">ترقيات وتعديلات الكفاءة السنوية</h4>
                                <p className="text-[10.5px] text-emerald-950 dark:text-slate-300 font-bold leading-relaxed">
                                    يقوم نظام عدالة بمطابقة تقرير الأداء الربع سنوي والسنوي تلقائياً قبل ترقية أي موظف. يمنع النظام ترقية من لديه جزاءات تأديبية سارية ما لم يتم بت التظلم القانوني إيجابياً.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex gap-3 text-right">
                            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h4 className="text-xs font-black text-amber-900 dark:text-amber-300">لوائح الاستقطاعات المالية وتحديد القروض</h4>
                                <p className="text-[10.5px] text-amber-950 dark:text-slate-300 font-bold leading-relaxed">
                                    وفق أحكام قانون العمل الكويتي (الباب الرابع - مادة 59)، المجموع الكلي للخصومات أو الأقساط الشهرية يجب ألا يتعدى نسبة النصف من أساس مرتب الموظف، مع وجود سقف 10% بحد أقصى للقروض الحسنة بدون مرابحة.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Mini quick queue panel */}
                <Card className="p-6 bg-white dark:bg-[#1E3C50] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors duration-300">
                    <h3 className="text-sm font-black text-slate-950 dark:text-white flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
                        <span className="flex items-center gap-2">
                            <BellRing className="w-4 h-4 text-[#00796B]" />
                            طابور الطلبات العاجلة بانتظار توقيعك
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold bg-slate-100 dark:bg-[#102A3A] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">تزامن حيّ</span>
                    </h3>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {requests.slice(0, 3).map((req, index) => (
                           <div 
                                key={req.id} 
                                onClick={() => onViewRequest(req)}
                                className="py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#102A3A]/40 px-3 rounded-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#00796B]/10 dark:bg-[#00796B]/20 flex items-center justify-center font-bold text-xs text-[#00796B] dark:text-accent font-sans">
                                        {index + 1}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-[#00796B] dark:group-hover:text-accent transition-colors">{req.employeeName}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{req.requestType} • {req.referenceNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 dark:text-slate-500 font-sans font-bold">{req.requestDate}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:translate-x-[-4px] transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Integration Quick View Sidebar */}
            <div className="space-y-6">
                <Card className="p-6 bg-white dark:bg-[#1E3C50] rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors duration-300">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white mb-4 flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-850">
                        <ClipboardCheck className="w-4 h-4 text-[#00796B] dark:text-accent" />
                        مؤشرات الحضور والمستندات الرقابية
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-[#F8FAFC] dark:bg-[#102A3A]/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">حالة مستندات الموارد البشرية ككل:</p>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-1 bg-white dark:bg-[#1E3C50] p-2 rounded-lg border border-slate-200 dark:border-slate-800"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> البطاقة المدنية</div>
                                <div className="flex items-center gap-1 bg-white dark:bg-[#1E3C50] p-2 rounded-lg border border-slate-200 dark:border-slate-800"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> جواز السفر</div>
                                <div className="flex items-center gap-1 bg-white dark:bg-[#1E3C50] p-2 rounded-lg border border-slate-200 dark:border-slate-800"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> إقامات الكويت</div>
                                <div className="flex items-center gap-1 bg-white dark:bg-[#1E3C50] p-2 rounded-lg border border-slate-200 dark:border-slate-800"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> عقود مصدقة</div>
                            </div>
                        </div>

                        {/* Warnings list on dashboard */}
                        <div className="space-y-3">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black block">أحدث تنبيهات العقوبات التأديبية النشطة:</p>
                            <div className="space-y-2 text-[10px] font-bold">
                                {disciplinaryLogs.slice(0, 3).map(disc => (
                                    <div key={disc.id} className="p-3 bg-rose-50/55 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-xl flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
                                        <div className="space-y-0.5 text-right flex-1">
                                            <span className="font-black text-slate-950 dark:text-slate-100 block">{disc.employeeName}</span>
                                            <span className="text-slate-500 dark:text-slate-400 block text-[9.5px] leading-relaxed">{disc.type} • {disc.reason}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
