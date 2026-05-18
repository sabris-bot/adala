import React from 'react';
import { motion } from 'motion/react';
import Card from '../ui/Card';
import { 
    ClipboardDocumentCheckIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon, 
    ClockIcon,
    ArrowUpRightIcon,
    ArrowDownRightIcon,
    TrendingUpIcon
} from '../../constants';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: string;
        isUp: boolean;
    };
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => (
    <Card className="border-none shadow-lg rounded-3xl overflow-hidden hover:shadow-xl transition-all">
        <div className="p-6 flex items-start justify-between">
            <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">{value}</h3>
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-[10px] font-black ${trend.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend.isUp ? <TrendingUpIcon className="w-3 h-3" /> : <ArrowDownRightIcon className="w-3 h-3" />}
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                <div className={color.replace('bg-', 'text-')}>{icon}</div>
            </div>
        </div>
        <div className={`h-1.5 w-full ${color}`}></div>
    </Card>
);

const AnalysisDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="إجمالي العقود المحللة" 
                    value="128" 
                    icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />} 
                    trend={{ value: "+12% منذ الشهر الماضي", isUp: true }}
                    color="bg-indigo-600"
                />
                <StatCard 
                    title="عقود قيد المراجعة" 
                    value="14" 
                    icon={<ClockIcon className="w-6 h-6" />} 
                    color="bg-amber-500"
                />
                <StatCard 
                    title="مخاطر عالية المكتشفة" 
                    value="23" 
                    icon={<ExclamationTriangleIcon className="w-6 h-6" />} 
                    trend={{ value: "-5% تحسن", isUp: false }}
                    color="bg-rose-600"
                />
                <StatCard 
                    title="نسبة الأمان المتوسطة" 
                    value="88%" 
                    icon={<CheckCircleIcon className="w-6 h-6" />} 
                    trend={{ value: "+2% دقة", isUp: true }}
                    color="bg-emerald-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4 border-none shadow-xl rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">توزيع العقود حسب التصنيف</h3>
                            <p className="text-xs text-slate-500 font-bold">نظرة عامة على محفظة العقود الرقمية</p>
                        </div>
                    </div>
                    {/* Placeholder for chart */}
                    <div className="h-64 bg-slate-50 dark:bg-slate-800/20 rounded-3xl flex items-center justify-center border border-dashed border-slate-200">
                      <p className="text-slate-400 font-black text-sm text-center">رسم بياني تفاعلي <br/> (توزيع تصنيفات العقود)</p>
                    </div>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-xl rounded-[2.5rem] p-8 bg-indigo-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <h3 className="text-lg font-black mb-6 relative z-10">تنبيهات قانونية ذكية</h3>
                    <div className="space-y-4 relative z-10">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex gap-4">
                            <div className="p-2 bg-rose-500 rounded-xl h-fit shadow-lg shadow-rose-900/40">
                                <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">انتهاء صلاحية "عقد إيجار الحمراء"</h4>
                                <p className="text-[10px] text-white/60 font-medium">ينتهي بعد 15 يوماً - لم يتم البدء في إجراءات التجديد.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex gap-4">
                            <div className="p-2 bg-amber-500 rounded-xl h-fit">
                                <ClockIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">بند "عدم المنافسة" يحتاج تحديث</h4>
                                <p className="text-[10px] text-white/60 font-medium">صدر قانون جديد يؤثر على تنفيذ هذا البند في عقود العمل.</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/10 flex gap-4">
                            <div className="p-2 bg-emerald-500 rounded-xl h-fit">
                                <CheckCircleIcon className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white">اكتمال تحليل "اتفاقية توريد"</h4>
                                <p className="text-[10px] text-white/60 font-medium">الذكاء الاصطناعي وجد 12 ثغرة محتملة في بنود التسليم.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
