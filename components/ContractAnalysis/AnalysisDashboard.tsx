import React from 'react';
import { motion } from 'motion/react';
import Card from '../ui/Card';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { 
    ClipboardDocumentCheckIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon, 
    ClockIcon,
    ArrowDownRightIcon,
    TrendingUpIcon,
    SparklesIcon,
    ListBulletIcon,
    ScaleIcon,
    DocumentTextIcon
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
    bgLight: string;
    textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color, bgLight, textColor }) => (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all group duration-300 transform hover:-translate-y-1">
        <div className="p-6 flex items-start justify-between">
            <div className="space-y-2">
                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{value}</h3>
                {trend && (
                    <div className={`flex items-center gap-1.5 mt-2 text-[10px] font-bold ${trend.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend.isUp ? <TrendingUpIcon className="w-3.5 h-3.5" /> : <ArrowDownRightIcon className="w-3.5 h-3.5" />}
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>
            <div className={`p-4 rounded-2xl ${bgLight} transition-all duration-300 group-hover:scale-110`}>
                <div className={textColor}>{icon}</div>
            </div>
        </div>
        <div className={`h-1.5 w-full ${color}`}></div>
    </Card>
);

const categoryData = [
    { name: 'عقود العمل', value: 45, color: '#6366f1' },
    { name: 'عقود الإيجار', value: 30, color: '#10b981' },
    { name: 'اتفاقيات سرية', value: 25, color: '#f59e0b' },
    { name: 'عقود الشراكة', value: 18, color: '#ef4444' },
    { name: 'عقود الخدمات', value: 10, color: '#a855f7' },
];

const riskTimelineData = [
    { month: 'يناير', 'أمان مرتفع': 80, 'مخاطر محتملة': 15, 'مخاطر عالية': 5 },
    { month: 'فبراير', 'أمان مرتفع': 85, 'مخاطر محتملة': 12, 'مخاطر عالية': 3 },
    { month: 'مارس', 'أمان مرتفع': 84, 'مخاطر محتملة': 11, 'مخاطر عالية': 5 },
    { month: 'أبريل', 'أمان مرتفع': 88, 'مخاطر محتملة': 8, 'مخاطر عالية': 4 },
    { month: 'مايو', 'أمان مرتفع': 92, 'مخاطر محتملة': 6, 'مخاطر عالية': 2 },
];

const AnalysisDashboard: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="إجمالي العقود المحللة" 
                    value="128" 
                    icon={<ClipboardDocumentCheckIcon className="w-6 h-6" />} 
                    trend={{ value: "+12% النمو الشهري", isUp: true }}
                    color="bg-indigo-600"
                    bgLight="bg-indigo-50 dark:bg-indigo-950/20"
                    textColor="text-indigo-600 dark:text-indigo-400"
                />
                <StatCard 
                    title="عقود قيد المراجعة والاعتماد" 
                    value="14" 
                    icon={<ClockIcon className="w-6 h-6" />} 
                    trend={{ value: "4 بانتظار المدير العام", isUp: true }}
                    color="bg-amber-500"
                    bgLight="bg-amber-50 dark:bg-amber-950/20"
                    textColor="text-amber-600 dark:text-amber-400"
                />
                <StatCard 
                    title="مخاطر عالية تم رصدها" 
                    value="23" 
                    icon={<ExclamationTriangleIcon className="w-6 h-6" />} 
                    trend={{ value: "تمت معالجة وعلاج 18 بنداً", isUp: false }}
                    color="bg-rose-600"
                    bgLight="bg-rose-50 dark:bg-rose-950/20"
                    textColor="text-rose-600 dark:text-rose-400"
                />
                <StatCard 
                    title="متوسط مؤشر أمان العقود" 
                    value="88.7%" 
                    icon={<CheckCircleIcon className="w-6 h-6" />} 
                    trend={{ value: "+3.2% تحسن في الصياغات", isUp: true }}
                    color="bg-emerald-600"
                    bgLight="bg-emerald-50 dark:bg-emerald-950/20"
                    textColor="text-emerald-600 dark:text-emerald-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Category Distribution Chart */}
                <Card className="lg:col-span-4 border-none shadow-xl rounded-[2.5rem] p-6 lg:p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">توزيع العقود حسب التصنيف</h3>
                        <p className="text-xs text-slate-500 font-bold">نسبة كل فئة عقود في النظام الرقمي</p>
                    </div>
                    <div className="h-64 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value) => [`${value} عقد`, 'العدد']} 
                                    contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        {categoryData.map((cat, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{cat.name} ({cat.value})</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Risk and Security Timeline Trend Chart */}
                <Card className="lg:col-span-5 border-none shadow-xl rounded-[2.5rem] p-6 lg:p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">مؤشر الأمان والامتثال التاريخي</h3>
                        <p className="text-xs text-slate-500 font-bold">تطور نسبة الأمان وانخفاض المخاطر عبر الأشهر</p>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={riskTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorHighRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94A3B8" />
                                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94A3B8" />
                                <Tooltip contentStyle={{ direction: 'rtl', textAlign: 'right', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="أمان مرتفع" stroke="#10b981" fillOpacity={1} fill="url(#colorSecurity)" strokeWidth={3} />
                                <Area type="monotone" dataKey="مخاطر عالية" stroke="#ef4444" fillOpacity={1} fill="url(#colorHighRisk)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* SMART CRITICAL COMPLIANCE ALERTS */}
                <Card className="lg:col-span-3 border-none shadow-xl rounded-[2.5rem] p-6 lg:p-8 bg-slate-900 text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/15 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div>
                        <h3 className="text-base font-black mb-4 flex items-center gap-2 relative z-10">
                            <SparklesIcon className="w-5 h-5 text-indigo-400 animate-pulse" />
                            رادار التنبيهات الذكية والامتثال
                        </h3>
                        <div className="space-y-3 relative z-10 max-h-[210px] overflow-y-auto">
                            <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors flex gap-3 items-start">
                                <div className="p-1.5 bg-rose-500 rounded-xl h-fit">
                                    <ExclamationTriangleIcon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-rose-300">"عقد إيجار الحمراء" ينتهي قريباً</h4>
                                    <p className="text-[10px] text-white/50 leading-relaxed font-medium">ينتهي في 2026-06-09. يتوجب بدء التفاوض لتجنب غرامة الإخلاء.</p>
                                </div>
                            </div>
                            <div className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors flex gap-3 items-start">
                                <div className="p-1.5 bg-amber-500 rounded-xl h-fit">
                                    <ClockIcon className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-black text-amber-300">مراجعة ثغرة عدم المنافسة</h4>
                                    <p className="text-[10px] text-white/50 leading-relaxed font-medium">تعديل بند المنافسة في عقود الإدارة ليتوافق مع المادة 42 من قانون العمل الكويتي.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-white/10 mt-4 text-center">
                        <p className="text-[10px] text-indigo-300 font-bold flex items-center justify-center gap-1">
                            <span>جميع الأنظمة متوافقة مع قانون العمل 6/2010</span>
                            <CheckCircleIcon className="w-3 h-3" />
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AnalysisDashboard;
