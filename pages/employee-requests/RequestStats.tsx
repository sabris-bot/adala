import React from 'react';
import { FileText, Clock, CheckCircle2, Ban } from 'lucide-react';
import Card from '../../components/ui/Card';

interface RequestStatsProps {
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    };
}

export const RequestStats: React.FC<RequestStatsProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-xl hover:border-accent/30 transition-all duration-300 border border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-[#1E3C50] rounded-[2rem] relative overflow-hidden group flex flex-col justify-between h-32 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00796B]" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1 text-right">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">إجمالي المعاملات الإدارية</span>
                        <span className="text-3xl font-black text-slate-950 dark:text-white font-sans block leading-none">{stats.total}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#00796B]/10 dark:bg-[#00796B]/20 flex items-center justify-center text-[#00796B] dark:text-primary-light transition-transform duration-300 group-hover:scale-110">
                        <FileText className="w-5.5 h-5.5" />
                    </div>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">معاملات مسجلة ومحفوظة بالامتثال</div>
            </Card>

            <Card className="hover:shadow-xl hover:border-accent/30 transition-all duration-300 border border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-[#1E3C50] rounded-[2rem] relative overflow-hidden group flex flex-col justify-between h-32 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1 text-right">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">طلبات قيد المراجعة والاعتماد</span>
                        <span className="text-3xl font-black text-amber-600 dark:text-accent font-sans block leading-none">{stats.pending}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-accent transition-transform duration-300 group-hover:scale-110">
                        <Clock className="w-5.5 h-5.5" />
                    </div>
                </div>
                <div className="text-[10px] text-amber-600 dark:text-accent/80 font-bold">بانتظار دورة الاعتماد والمباشرة</div>
            </Card>

            <Card className="hover:shadow-xl hover:border-accent/30 transition-all duration-300 border border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-[#1E3C50] rounded-[2rem] relative overflow-hidden group flex flex-col justify-between h-32 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-600" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1 text-right">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">الطلبات المكتملة والموقّعة</span>
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans block leading-none">{stats.approved}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                        <CheckCircle2 className="w-5.5 h-5.5" />
                    </div>
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400/80 font-bold">مصادقة ورقمية للتصدير والطباعة</div>
            </Card>

            <Card className="hover:shadow-xl hover:border-accent/30 transition-all duration-300 border border-slate-100 dark:border-slate-800 p-6 bg-white dark:bg-[#1E3C50] rounded-[2rem] relative overflow-hidden group flex flex-col justify-between h-32 shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-rose-600" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1 text-right">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">المعاملات المرفوضة قانونياً</span>
                        <span className="text-3xl font-black text-rose-600 dark:text-rose-400 font-sans block leading-none">{stats.rejected}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/10 flex items-center justify-center text-rose-600 dark:text-rose-400 transition-transform duration-300 group-hover:scale-110">
                        <Ban className="w-5.5 h-5.5" />
                    </div>
                </div>
                <div className="text-[10px] text-rose-600 dark:text-rose-400/80 font-bold">مرفوضة لعدم مطابقة اللوائح</div>
            </Card>
        </div>
    );
};
