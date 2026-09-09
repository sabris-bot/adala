import React from 'react';
import { GanttChartCalendar } from '../components/ui/GanttChartCalendar';
import Card from '../components/ui/Card';
import { Calendar, Clock, AlertTriangle, ShieldAlert, CheckCircle2, Scale, Users, Briefcase } from 'lucide-react';

export default function LegalGanttChartPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors duration-300 rtl text-right" dir="rtl">
            
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-200 dark:shadow-amber-950/40 font-black">
                        <Calendar className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                            تقويم Gantt التفاعلي للمواعيد القضائية والمهام الإدارية
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">
                            ربط مواعيد القضايا والطعون (Litigation Deadlines) والمهام المكتبية مع كشف التضارب الفوري والجدولة بالسحب والإفلات
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick KPI Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="p-3 bg-rose-100 dark:bg-rose-950/50 text-rose-600 rounded-xl">
                        <Scale className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">المواعيد القضائية</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">12 موعد حرج</span>
                    </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">المهام الإدارية بالمكتب</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">18 مهمة نشطة</span>
                    </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-950/50 text-amber-600 rounded-xl">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">المحامون والموظفون المكلفون</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">6 أعضاء فريق</span>
                    </div>
                </Card>

                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 border-rose-200 dark:border-rose-900/50 bg-rose-50/20">
                    <div className="p-3 bg-rose-600 text-white rounded-xl shadow-xs">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">تضاربات المواعيد المكتشفة</span>
                        <span className="text-xl font-black text-rose-900 dark:text-rose-300">1 تضارب محتمل ⚠️</span>
                    </div>
                </Card>
            </div>

            {/* Interactive Gantt Chart Calendar Component */}
            <GanttChartCalendar />

        </div>
    );
}
