import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Card from '../components/ui/Card';
import { 
    CogIcon, ClipboardDocumentListIcon, UserGroupIcon, BellAlertIcon, 
    PresentationChartLineIcon, ShieldCheckIcon, SparklesIcon,
    ArrowRightIcon, PlusCircleIcon, DocumentTextIcon, ChartBarIcon,
    CurrencyDollarIcon, BuildingOffice2Icon, WrenchScrewdriverIcon,
    CreditCardIcon, UsersIcon, CalendarDaysIcon, ScaleIcon,
    BanknotesIcon, ClockIcon
} from '../constants';
import Button from '../components/ui/Button';
import PrintHeader from '../components/ui/PrintHeader';

const AdminToolsPage: React.FC = () => {
  const { t } = useTranslation();

  const adminCategories = [
    {
      title: 'الإدارة والعمليات المركزية',
      description: 'إدارة المهام، جهات الاتصال، والإعدادات العامة للنظام.',
      color: 'blue',
      modules: [
        { id: 'tasks', name: 'إدارة المهام', desc: 'تنظيم وتتبع المهام القانونية والإدارية.', path: '/admin-tools/tasks', icon: <ClipboardDocumentListIcon className="w-7 h-7 text-blue-500" />, stats: '12 مهمة نشطة' },
        { id: 'contacts', name: 'جهات الاتصال', desc: 'إدارة معلومات العملاء والخصوم والخبراء.', path: '/admin-tools/contacts', icon: <UserGroupIcon className="w-7 h-7 text-emerald-500" />, stats: '240 جهة اتصال' },
        { id: 'notifications', name: 'الإشعارات', desc: 'إدارة التنبيهات والرسائل الصادرة والواردة.', path: '/notifications', icon: <BellAlertIcon className="w-7 h-7 text-amber-500" />, stats: '3 تنبيهات' },
        { id: 'settings', name: 'الإعدادات', desc: 'تخصيص النظام وإدارة الصلاحيات.', path: '/settings', icon: <CogIcon className="w-7 h-7 text-gray-500" />, stats: 'تحديث اليوم' },
      ]
    },
    {
      title: 'الموارد والشؤون المالية',
      description: 'التحكم المالي، إدارة الأصول العقارية والتحصيل المالي.',
      color: 'emerald',
      modules: [
        { id: 'finance', name: 'الإدارة المالية', desc: 'القيود المحاسبية والميزانيات والتقارير المالية.', path: '/finance', icon: <CurrencyDollarIcon className="w-7 h-7 text-emerald-600" />, stats: 'ميزانية الشهر جاهزة' },
        { id: 'properties', name: 'إدارة العقارات', desc: 'إدارة الأصول العقارية وعقود الإيجار والتحصيل.', path: '/property-management', icon: <BuildingOffice2Icon className="w-7 h-7 text-indigo-500" />, stats: '85 وحدة مؤجرة' },
        { id: 'maintenance', name: 'الصيانة والأصول', desc: 'تتبع صيانة العقارات والممتلكات الدورية.', path: '/property-management/maintenance', icon: <WrenchScrewdriverIcon className="w-7 h-7 text-rose-500" />, stats: '2 طلب صيانة' },
        { id: 'court-fees', name: 'رسوم المحاكم', desc: 'احتساب ومتابعة سداد الرسوم القضائية.', path: '/tools/court-fees', icon: <CreditCardIcon className="w-7 h-7 text-blue-600" />, stats: 'دقة حسابية عالية' },
      ]
    },
    {
      title: 'الموارد البشرية وشؤون الموظفين',
      description: 'إدارة الكادر البشري، الإجازات، والتحقيقات الإدارية.',
      color: 'amber',
      modules: [
        { id: 'hr', name: 'شؤون الموظفين', desc: 'ملفات الموظفين والعقود والتوظيف.', path: '/employee-affairs', icon: <UsersIcon className="w-7 h-7 text-blue-500" />, stats: '15 موظف نشط' },
        { id: 'leaves', name: 'الإجازات والدوام', desc: 'إدارة العطلات والغياب والاستئذان.', path: '/employee-affairs/leave-management', icon: <CalendarDaysIcon className="w-7 h-7 text-teal-500" />, stats: '1 طلب إجازة' },
        { id: 'disciplinary', name: 'الجزاءات والتحقيقات', desc: 'متابعة القرارات التأديبية والتحقيقات الإدارية.', path: '/employee-affairs/disciplinary', icon: <ScaleIcon className="w-7 h-7 text-rose-500" />, stats: 'لا توجد إجراءات' },
        { id: 'loans', name: 'القروض والسلف', desc: 'إدارة سلف الموظفين والجدولة المالية.', path: '/employee-affairs/loans', icon: <BanknotesIcon className="w-7 h-7 text-amber-500" />, stats: '5 أقساط هذا الشهر' },
      ]
    },
    {
      title: 'الامتثال والأدوات الرقمية',
      description: 'الرقابة، الرول الآلي، والمواعيد القانونية الهامة.',
      color: 'purple',
      modules: [
        { id: 'compliance', name: 'الامتثال الرقابي', desc: 'التأكد من مطابقة العمل للأنظمة واللوائح.', path: '/compliance', icon: <ShieldCheckIcon className="w-7 h-7 text-indigo-500" />, stats: 'التزام 100%' },
        { id: 'docket', name: 'الرول الآلي', desc: 'تحديثات جلسات المحاكم التلقائية.', path: '/automated-docket', icon: <CalendarDaysIcon className="w-7 h-7 text-blue-500" />, stats: 'تحديث 2:00 م' },
        { id: 'reports', name: 'التقارير المركزية', desc: 'تحليل البيانات وإصدار التقارير الإدارية.', path: '/reports', icon: <PresentationChartLineIcon className="w-7 h-7 text-purple-500" />, stats: '20 تقرير دوري' },
        { id: 'deadlines', name: 'المواعيد القانونية', desc: 'حساب مواعد الطعون والمدد القانونية.', path: '/tools/legal-deadlines', icon: <ClockIcon className="w-7 h-7 text-orange-500" />, stats: 'تنبيهات ذكية' },
      ]
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      <PrintHeader title="نظام الإدارة والعمليات" subtitle="إدارة الموارد، المهام، وشؤون الموظفين" />

      {/* Header with Luxury Design */}
      <div className="relative overflow-hidden bg-primary-dark text-white p-12 rounded-[2.5rem] shadow-2xl">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary-light/10 to-transparent pointer-events-none"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary-light/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-4 max-w-2xl text-right">
                <div className="flex items-center gap-6 justify-end lg:justify-start">
                    <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl">
                        <CogIcon className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2">مركز الإدارة المتطور</h1>
                        <p className="text-primary-light/70 text-lg font-medium leading-relaxed">المنظومة المتكاملة للتحكم في الموارد، الموظفين، والعمليات القانونية لنظام عدالة.</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                <Link to="/ai-assistant">
                    <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/15 text-white px-8 py-6 rounded-2xl">
                        مستشار الذكاء الاصطناعي
                        <SparklesIcon className="w-5 h-5 ms-3 text-accent" />
                    </Button>
                </Link>
                <Link to="/dashboard">
                    <Button variant="secondary" className="shadow-xl shadow-amber-900/40 px-8 py-6 rounded-2xl">
                        لوحة التحكم الرئيسية
                        <ArrowRightIcon className="w-5 h-5 ms-3 rotate-180" />
                    </Button>
                </Link>
            </div>
        </div>
      </div>

      {/* Categorized Sections */}
      <div className="space-y-16">
        {adminCategories.map((category, catIdx) => (
            <section key={catIdx} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-6 gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                            {category.title}
                        </h2>
                        <p className="text-gray-500 mt-2 font-medium">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full">
                        {category.modules.length} موديول متاح
                    </div>
                </div>

                <motion.div 
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {category.modules.map((module) => (
                        <motion.div key={module.id} variants={item}>
                            <Link to={module.path}>
                                <Card className="group h-full relative overflow-hidden border-gray-100 hover:border-primary/50 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl p-6">
                                    <div className="space-y-5">
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 group-hover:bg-primary/10 transition-colors">
                                            {module.icon}
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{module.name}</h3>
                                            <p className="text-xs text-gray-500 mt-2 leading-relaxed font-medium">{module.desc}</p>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                                            <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-lg uppercase tracking-tighter">
                                                {module.stats}
                                            </span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                                                <ArrowRightIcon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </section>
        ))}
      </div>

      {/* Advanced System Insights */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-slate-900 to-indigo-950 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl"></div>

        <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl flex items-center justify-center shrink-0 border border-white/20">
            <SparklesIcon className="w-12 h-12 text-accent" />
        </div>
        <div className="flex-grow space-y-4 text-center md:text-right">
            <h2 className="text-3xl font-black tracking-tighter">الذكاء الإداري التنبؤي</h2>
            <p className="text-gray-300 text-lg leading-relaxed font-medium">
                بناءً على نشاط الأسبوع: نوصي بمراجعة جدول الإجازات نظراً لوجود 3 طلبات متداخلة في قسم القضايا المدنية، كما نلاحظ تحسناً بنسبة 18% في استجابة الموردين للطلبات المالية.
            </p>
        </div>
        <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
            <Button variant="accent" className="px-10 py-4 rounded-2xl shadow-lg shadow-accent/20">تحليل الأداء الكامل</Button>
            <Button variant="outline" className="text-white border-white/10 hover:bg-white/5 py-4 rounded-2xl">تجاهل التنبيه</Button>
        </div>
      </motion.div>

      {/* Monitoring & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-xl shadow-gray-200/50 rounded-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                        <ChartBarIcon className="w-6 h-6 text-primary" />
                        مؤشرات أداء النظام
                    </h3>
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-gray-400 italic">نظام مستقر</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'سعة التخزين', value: '45%', color: 'blue', desc: '250GB متاح' },
                        { label: 'المستخدمين', value: '12/15', color: 'emerald', desc: 'نشط الآن' },
                        { label: 'صحة البيانات', value: '99.9%', color: 'indigo', desc: 'لا توجد أخطاء' },
                        { label: 'الاحتياطي', value: 'آمن', color: 'amber', desc: 'منذ ساعتين' },
                    ].map((stat, i) => (
                        <div key={i} className="space-y-2 p-5 rounded-3xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-primary/20 transition-all group">
                            <p className="text-[10px] uppercase font-black text-gray-400">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors">{stat.value}</p>
                            <p className="text-[10px] font-medium text-gray-400">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="border-none bg-primary text-white shadow-xl shadow-primary/20 rounded-3xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <DocumentTextIcon className="w-6 h-6" />
                    سجل آخر الإجراءات
                </h3>
                <div className="space-y-6">
                    {[
                        { title: 'تحديث جهات الاتصال', time: '10:45 ص', type: 'system' },
                        { title: 'اعتماد طلب إجازة', time: '09:20 ص', type: 'hr' },
                        { title: 'إغلاق تقرير مالي', time: 'أمس', type: 'finance' },
                        { title: 'تحديث صلاحيات', time: 'قبل يومين', type: 'admin' },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-4 group cursor-pointer">
                            <div className="w-2 h-10 rounded-full bg-white/20 group-hover:bg-white transition-colors"></div>
                            <div>
                                <p className="text-sm font-bold">{log.title}</p>
                                <p className="text-[10px] opacity-60 font-medium italic">{log.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                    <Button variant="secondary" fullWidth className="bg-white/10 hover:bg-white/20 border-none text-white font-black text-xs py-3">عرض السجل الكامل</Button>
                </div>
            </Card>
      </div>
    </div>
  );
};

export default AdminToolsPage;
