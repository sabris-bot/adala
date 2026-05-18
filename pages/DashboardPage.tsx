import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
    BriefcaseIcon, ClipboardListCheckIcon, UsersIcon, BuildingOffice2Icon, 
    ShieldCheckIcon, BanknotesIcon, DocumentTextIcon, SparklesIcon, 
    BookOpenIcon, DocumentDuplicateIcon, BrainIcon, BuildingLibraryIcon, 
    UserGroupIcon, BellAlertIcon, ListBulletIcon, 
    MagnifyingGlassIcon, GavelIcon, ClockIcon, 
    CalendarDaysIcon, ArrowUpRightIcon,
    PlusCircleIcon,
    TrendingUpIcon, ArrowLeftIcon, ArrowRightIcon,
    ChevronLeftIcon,
    ScaleIcon
} from '../constants';
import Logo from '../components/ui/Logo';
import Card from '../components/ui/Card';
import { useCaseTask } from '../components/CaseTaskContext';
import { AdminTaskStatus } from '../types';

// --- Components ---

const StatCard: React.FC<{
  title: string;
  value: string | number;
  trend?: { value: string; positive: boolean };
  icon: React.ReactNode;
  color: string;
  delay?: number;
}> = ({ title, value, trend, icon, color, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-dm-card p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
  >
    <div className="flex justify-between items-center mb-3">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
        {React.cloneElement(icon as any, { className: "w-4 h-4" })}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[9px] font-bold ${trend.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
          <TrendingUpIcon className={`w-3 h-3 ${!trend.positive && 'rotate-180'}`} />
          {trend.value}%
        </div>
      )}
    </div>
    <div>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{title}</p>
      <h3 className="text-xl font-bold text-gray-800 dark:text-white tabular-nums tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

const ModuleCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  stats?: { value: string | number; label: string };
  link: string;
  delay?: number;
}> = ({ title, description, icon, stats, link, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="h-full"
  >
    <Link to={link} className="group flex flex-col bg-white dark:bg-dm-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {React.cloneElement(icon as any, { className: "w-5 h-5" })}
        </div>
        {stats && (
          <div className="text-left">
            <p className="text-base font-bold text-primary tracking-tight">{stats.value}</p>
            <p className="text-[8px] font-medium text-gray-400 uppercase tracking-widest">{stats.label}</p>
          </div>
        )}
      </div>
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1.5 group-hover:text-primary transition-colors tracking-tight">{title}</h3>
      <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-2 mb-4">{description}</p>
      <div className="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
        <span className="text-[9px] font-bold text-gray-300 group-hover:text-primary uppercase tracking-widest transition-colors">دخول</span>
        <ChevronLeftIcon className="w-3.5 h-3.5 text-gray-200 group-hover:text-primary group-hover:-translate-x-0.5 transition-all" />
      </div>
    </Link>
  </motion.div>
);

const TimelineItem: React.FC<{
    time: string;
    title: string;
    location: string;
    status: 'urgent' | 'pending' | 'done';
    isLast?: boolean;
}> = ({ time, title, location, status, isLast }) => (
    <div className="flex gap-3 group">
        <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dm-card z-10 transition-transform group-hover:scale-125 ${
                status === 'urgent' ? 'bg-rose-500' : status === 'pending' ? 'bg-amber-400' : 'bg-emerald-500'
            }`} />
            {!isLast && <div className="w-px flex-1 bg-gray-100 dark:bg-gray-800 my-1 transition-colors" />}
        </div>
        <div className="pb-5">
            <span className="text-[9px] font-bold text-gray-400 tabular-nums">{time}</span>
            <h4 className="text-[13px] font-bold text-gray-800 dark:text-white mt-0.5 tracking-tight">{title}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">{location}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { tasks, hearings, cases } = useCaseTask();
    const [searchTerm, setSearchTerm] = useState('');
    
    const metrics = useMemo(() => [
        { title: 'قضايا متداولة', value: cases.length, trend: { value: '15', positive: true }, icon: <BriefcaseIcon />, color: 'text-blue-500' },
        { title: 'جلسات قادمة', value: hearings.filter(h => h.status === 'Scheduled').length, trend: { value: '25', positive: true }, icon: <GavelIcon />, color: 'text-rose-500' },
        { title: 'مهام عالقة', value: tasks.filter(t => t.status !== AdminTaskStatus.COMPLETED).length, trend: { value: '5', positive: false }, icon: <ClipboardListCheckIcon />, color: 'text-amber-500' },
        { title: 'موكلين نشطين', value: [...new Set(cases.map(c => c.clientName))].length, icon: <UserGroupIcon />, color: 'text-indigo-500' },
    ], [cases, hearings, tasks]);

    const taskCountToday = useMemo(() => tasks.filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return t.dueDate === today && t.status !== AdminTaskStatus.COMPLETED;
    }).length, [tasks]);

    const hearingCountToday = useMemo(() => hearings.filter(h => {
        const today = new Date().toISOString().split('T')[0];
        return h.date === today;
    }).length, [hearings]);

    const modules = [
        {
            category: 'العمليات والتقاضي',
            items: [
                { title: 'إدارة التقاضي', desc: 'أضف القضايا، تابع الجلسات، واطلع على رول المحاكم.', icon: <BriefcaseIcon />, stats: { value: cases.length, label: 'قضية' }, link: '/cases' },
                { title: 'الرول الآلي', desc: 'تحديثات مباشرة من بوابة العدل لجدول الجلسات.', icon: <ListBulletIcon />, stats: { value: hearingCountToday, label: 'جلسة اليوم' }, link: '/automated-docket' },
                { title: 'توزيع المهام', desc: 'توزيع المهام التشغيلية ومتابعة الإنجاز اليومي.', icon: <ClipboardListCheckIcon />, stats: { value: taskCountToday, label: 'مهمة مستحقة' }, link: '/admin-tools/tasks' },
                { title: 'البحث الموحد', desc: 'البحث الشامل برقم آلي أو ملف قضية.', icon: <MagnifyingGlassIcon />, stats: { value: 'Live', label: 'بوابة العدل' }, link: '/moj-search' },
            ]
        },
        {
            category: 'الإدارة والمالية',
            items: [
                { title: 'المركز المالي', desc: 'الحسابات، الفواتير، ومتابعة الأتعاب.', icon: <BanknotesIcon />, stats: { value: '5.2K', label: 'د.ك' }, link: '/finance' },
                { title: 'بوابة الموظفين', desc: 'ملفات المحامين، الحضور، وتوزيع التكاليف.', icon: <UsersIcon />, stats: { value: 6, label: 'مستشار' }, link: '/employee-affairs' },
                { title: 'إدارة الأصول', desc: 'إحصائيات العقارات، العقود، والتنبيهات.', icon: <BuildingOffice2Icon />, stats: { value: 4, label: 'عقد' }, link: '/property-management' },
                { title: 'الرقابة والامتثال', desc: 'متابعة الالتزام المهني والضريبي.', icon: <ShieldCheckIcon />, stats: { value: '98%', label: 'نسبة' }, link: '/compliance' },
            ]
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 md:px-0">
            {/* Luxurious Integrated Header */}
            <header className="relative overflow-hidden bg-slate-900 text-white p-12 rounded-b-[2.5rem] shadow-2xl -mx-4 md:-mx-8 mb-12">
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl">
                            <Logo variant="light" iconClassName="w-10 h-10 text-white" textClassName="flex flex-col" showOfficeName={true} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-lg text-[10px] font-black tracking-widest uppercase border border-primary/30">V3.5 Professional</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-gray-400">النظام نشط</span>
                            </div>
                            <p className="text-gray-400 text-sm font-medium">المنظومة الذكية لإدارة العدالة والعمليات القانونية المتكاملة.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/5 border border-white/10 px-8 py-5 rounded-[2rem] backdrop-blur-md self-end lg:self-center">
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 font-mono">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <p className="text-xl font-black text-primary leading-tight font-mono">{new Date().toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="flex flex-col items-start">
                            <span className="text-[10px] font-black text-gray-500 uppercase">مستوى الأداء</span>
                            <span className="text-lg font-black text-emerald-400 tracking-tighter">99.8%</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Search and Quick Metrics Row */}
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                        <div className="relative group w-full md:max-w-md">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                                <MagnifyingGlassIcon className="w-5 h-5" />
                            </div>
                            <input 
                                type="text"
                                placeholder="ابحث عن قضية، إجراء، أو كشف حساب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-12 pl-6 py-4 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 outline-none font-bold text-sm text-gray-800 dark:text-white focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                             <Link to="/ai-assistant">
                                <button className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-slate-800 transition-all">
                                    <SparklesIcon className="w-5 h-5" />
                                </button>
                             </Link>
                             <button className="px-6 py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-3">
                                <PlusCircleIcon className="w-5 h-5" />
                                إضافة سريعة
                             </button>
                        </div>
                    </div>

                    {/* KPI Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {metrics.map((m, i) => (
                            <StatCard key={i} {...m} delay={i * 0.05} />
                        ))}
                    </div>

                    {/* Module Categories */}
                    <div className="space-y-12">
                        {modules.map((section, sIdx) => {
                            const filtered = section.items.filter(m => 
                                m.title.includes(searchTerm) || m.desc.includes(searchTerm)
                            );
                            if (filtered.length === 0) return null;

                            return (
                                <div key={section.category} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-3 mb-5 px-1">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-sm shadow-primary/40"></div>
                                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{section.category}</h2>
                                        <div className="h-px flex-1 bg-gradient-to-l from-gray-100 dark:from-gray-800 to-transparent"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filtered.map((m, mIdx) => (
                                            <ModuleCard 
                                                key={m.title}
                                                link={m.link}
                                                icon={m.icon}
                                                title={m.title}
                                                description={m.desc}
                                                stats={m.stats}
                                                delay={(sIdx * 0.1) + (mIdx * 0.02)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar area */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Agenda Sidebar */}
                    <Card className="bg-white dark:bg-dm-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xs font-black text-gray-800 dark:text-white uppercase flex items-center gap-2">
                                <span className="p-1.5 bg-primary/10 rounded-lg">
                                    <CalendarDaysIcon className="w-3.5 h-3.5 text-primary" />
                                </span>
                                جدول جلسات اليوم
                            </h3>
                            <Link to="/automated-docket" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">المفكرة</Link>
                        </div>
                        <div className="h-px w-full bg-gradient-to-r from-gray-100 to-transparent my-6"></div>
                        <Link to="/automated-docket">
                            <button className="w-full py-3.5 rounded-2xl bg-gray-50 border border-gray-100 font-black text-[10px] text-gray-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all flex items-center justify-center gap-3">
                                <ListBulletIcon className="w-4 h-4" />
                                استعراض الرول الشامل
                            </button>
                        </Link>
                    </Card>

                    {/* AI Wisdom Card - Compact */}
                    <div className="bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3 text-amber-400 font-black text-[9px] uppercase tracking-widest">
                                <SparklesIcon className="w-3.5 h-3.5" />
                                رؤى ذكية
                            </div>
                            <p className="text-[11px] font-medium leading-relaxed opacity-90 mb-5 italic border-r-2 border-primary/30 pr-3 mr-1">
                                "تم رصد 3 قضايا مشابهة تم صياغة دفاعها بنجاح الأسبوع الماضي - هل تود استعراض المذكرات الرابحة؟"
                            </p>
                            <Link to="/ai-assistant" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-black text-[9px] hover:translate-x-1 transition-all">
                                استعراض الآن
                                <ArrowUpRightIcon className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Security Badge - Minimized */}
                    <div className="px-6 py-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center gap-4 bg-gray-50/30">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex flex-col items-end">
                            <p className="text-[10px] font-black text-gray-800 dark:text-white uppercase tracking-wider mb-1">حماية البيانات فعالة</p>
                            <p className="text-[10px] font-bold text-emerald-500 italic">256-bit Encryption Active</p>
                        </div>
                    </div>

                    {/* Quick Access List */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">الوصول السريع</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/moj-search" className="p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 group transition-all text-center">
                                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 group-hover:text-primary mx-auto mb-2" />
                                <span className="text-[10px] font-black text-gray-600 block">بحث البوابة</span>
                            </Link>
                            <Link to="/ai-assistant" className="p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 group transition-all text-center">
                                <BrainIcon className="w-6 h-6 text-gray-400 group-hover:text-primary mx-auto mb-2" />
                                <span className="text-[10px] font-black text-gray-600 block">الذكاء القانوني</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Systematic Footer Section - Minimized & Organized */}
            <footer className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center p-2 shadow-xl border border-white/10">
                        <Logo variant="light" hideText iconClassName="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-[11px] font-black text-gray-900 dark:text-dm-text tracking-tight leading-none mb-1 uppercase">مكتب صبري شطا للمحاماة</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] opacity-60">Sabri Shatta Law Firm</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">معالج النظام</p>
                        <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 rounded-md border border-emerald-100">
                             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                             <p className="text-[9px] font-black text-emerald-700 uppercase">Engine Stable</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end border-r border-gray-100 pr-6">
                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">الإصدار الرقمي</p>
                        <p className="text-[10px] font-black text-gray-800 dark:text-dm-text">v3.5.0-PRO</p>
                    </div>
                </div>
            </footer>

            {/* Float Action - Professionalized */}
            <div className="fixed bottom-6 left-6 z-50 no-print flex flex-col gap-3">
                <button className="w-12 h-12 bg-slate-900 text-white rounded-xl shadow-2xl flex items-center justify-center hover:-translate-y-1 active:scale-95 transition-all group overflow-hidden">
                    <PlusCircleIcon className="w-6 h-6 relative z-10 group-hover:rotate-90 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
            </div>
        </div>
    );
};

export default DashboardPage;
