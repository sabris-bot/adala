
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
    BriefcaseIcon,
    ClipboardListCheckIcon,
    UsersIcon,
    BuildingOffice2Icon,
    ShieldCheckIcon,
    BanknotesIcon,
    DocumentTextIcon,
    SparklesIcon,
    BookOpenIcon,
    DocumentDuplicateIcon,
    BrainIcon,
    BuildingLibraryIcon,
    ShareIcon,
    UserGroupIcon,
    BellAlertIcon,
    ListBulletIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    ReportMoneyIcon,
    GavelIcon,
    ClockIcon,
    CalculatorIcon,
    CalendarDaysIcon 
} from '../constants';
import Logo from '../components/ui/Logo';

const DashboardStatCard: React.FC<{
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactElement<any>;
  colorClass: 'blue' | 'red' | 'green' | 'orange' | 'purple' | 'teal'; 
  linkTo?: string;
}> = ({ title, value, subValue, icon, colorClass, linkTo }) => {
  const colorVariants = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    teal: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  };

  const selectedColor = colorVariants[colorClass] || colorVariants.blue;

  const content = (
    <div className="bg-white dark:bg-dm-card rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200 h-full group">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">{value}</h3>
        {subValue && <p className="text-xs text-gray-400 mt-2 font-light">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-lg ${selectedColor} transition-transform group-hover:scale-110`}>
        {React.cloneElement(icon, { className: "w-6 h-6" })}
      </div>
    </div>
  );

  return linkTo ? <Link to={linkTo} className="block h-full">{content}</Link> : content;
};

// NEW Compact Module Card - Replaces ModuleSummaryCard
const CompactModuleCard: React.FC<{
  title: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  mainStat: { value: string | number; label: string };
  linkTo: string;
  borderColor: string;
}> = ({ title, icon, mainStat, linkTo, borderColor }) => (
  <Link to={linkTo} className={`block bg-neutral-card dark:bg-dm-card rounded-lg shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border-s-4 ${borderColor} print:border border print:shadow-none`}>
    <div className="p-4 flex items-center">
      <div className="flex-shrink-0 p-2 bg-slate-100 dark:bg-dm-background rounded-full print:hidden">
        {React.cloneElement(icon, { className: "w-7 h-7 text-secondary dark:text-secondary-light" })}
      </div>
      <div className="ms-4 flex-grow overflow-hidden">
        <h3 className="font-bold text-neutral-text dark:text-dm-text truncate" title={title}>{title}</h3>
        <p className="text-sm text-secondary dark:text-secondary-light mt-1">
          <span className="text-2xl font-bold text-primary-dark dark:text-primary-light">{mainStat.value}</span>
          <span className="ms-1">{mainStat.label}</span>
        </p>
      </div>
    </div>
  </Link>
);

const DashboardSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-neutral-text dark:text-dm-text mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2">
            {children}
        </div>
    </div>
);


const DashboardPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    // Enhanced Stats Data
    const quickStats = [
        { 
            title: t('active_cases', { defaultValue: 'القضايا المتداولة' }), 
            value: '6', 
            subValue: i18n.language === 'ar' ? '2 جلسات قادمة هذا الأسبوع' : '2 upcoming hearings this week', 
            icon: <BriefcaseIcon />, 
            colorClass: 'blue' as const,
            linkTo: '/cases'
        },
        { 
            title: t('today_hearings', { defaultValue: 'جلسات اليوم' }), 
            value: '4', 
            subValue: t('waiting_update', { defaultValue: 'بانتظار التحديث' }), 
            icon: <GavelIcon />, 
            colorClass: 'red' as const,
            linkTo: '/automated-docket'
        },
        { 
            title: t('urgent_tasks', { defaultValue: 'المهام العاجلة' }), 
            value: '3', 
            subValue: i18n.language === 'ar' ? '1 متأخرة' : '1 overdue', 
            icon: <BellAlertIcon />, 
            colorClass: 'orange' as const,
            linkTo: '/admin-tools/tasks'
        },
        { 
            title: t('financial_balance', { defaultValue: 'الرصيد المالي' }), 
            value: '-5.3K', 
            subValue: i18n.language === 'ar' ? 'د.ك (صافي)' : 'KWD (Net)', 
            icon: <BanknotesIcon />, 
            colorClass: 'green' as const,
            linkTo: '/finance'
        },
        { 
            title: t('clients', { defaultValue: 'الموكلون' }), 
            value: '7', 
            subValue: i18n.language === 'ar' ? '1 جديد هذا الشهر' : '1 new this month', 
            icon: <UserGroupIcon />, 
            colorClass: 'purple' as const,
            linkTo: '/admin-tools/contacts'
        },
        { 
            title: t('compliance', { defaultValue: 'الامتثال' }), 
            value: '95%', 
            subValue: t('compliance_rate', { defaultValue: 'نسبة الالتزام' }), 
            icon: <ShieldCheckIcon />, 
            colorClass: 'teal' as const,
            linkTo: '/compliance'
        },
    ];
    
    // Categorized Module Data
    const mainOperations = [
        { 
            title: t('cases', { defaultValue: 'إدارة القضايا' }), 
            icon: <BriefcaseIcon />, 
            mainStat: { value: 6, label: t('active_cases_label', { defaultValue: 'قضايا نشطة' }) },
            linkTo: '/cases', 
            borderColor: 'border-blue-500'
        },
        { 
            title: t('task_management', { defaultValue: 'إدارة المهام' }), 
            icon: <ClipboardListCheckIcon />, 
            mainStat: { value: 8, label: t('important_tasks', { defaultValue: 'مهام هامة' }) },
            linkTo: '/admin-tools/tasks', 
            borderColor: 'border-purple-500'
        },
    ];

    const courtsAndLitigation = [
        { 
            title: t('automated_docket', { defaultValue: 'الرول اليومي الآلي' }), 
            icon: <ListBulletIcon />, 
            mainStat: { value: 4, label: t('today_sessions', { defaultValue: 'جلسات اليوم' }) },
            linkTo: '/automated-docket', 
            borderColor: 'border-red-500'
        },
        { 
            title: t('moj_search', { defaultValue: 'بحث بوابة العدل' }), 
            icon: <MagnifyingGlassIcon />, 
            mainStat: { value: t('available', { defaultValue: 'متاح' }), label: t('live_search', { defaultValue: 'بحث مباشر' }) },
            linkTo: '/moj-search', 
            borderColor: 'border-indigo-500'
        },
        { 
            title: t('legal_representation', { defaultValue: 'الإنابة القانونية' }), 
            icon: <ShareIcon />, 
            mainStat: { value: 2, label: t('pending_requests', { defaultValue: 'طلبات معلقة' }) },
            linkTo: '/legal-representation', 
            borderColor: 'border-cyan-500'
        },
        { 
            title: t('party_tracking', { defaultValue: 'تتبع الأطراف والمهام' }), 
            icon: <MapPinIcon />, 
            mainStat: { value: 2, label: t('active_tasks', { defaultValue: 'مهام نشطة' }) },
            linkTo: '/party-tracking', 
            borderColor: 'border-orange-500'
        },
    ];

    const financeAndAssets = [
        { 
            title: t('finance', { defaultValue: 'الإدارة المالية' }), 
            icon: <BanknotesIcon />, 
            mainStat: { value: '-5.3K', label: t('net_balance', { defaultValue: 'صافي الرصيد' }) },
            linkTo: '/finance', 
            borderColor: 'border-green-500'
        },
        { 
            title: t('property_management', { defaultValue: 'إدارة العقارات' }), 
            icon: <BuildingOffice2Icon />, 
            mainStat: { value: 4, label: t('important_requests', { defaultValue: 'طلبات هامة' }) },
            linkTo: '/property-management', 
            borderColor: 'border-teal-500'
        },
        { 
            title: t('company_affairs', { defaultValue: 'شؤون الشركات' }), 
            icon: <BuildingLibraryIcon />, 
            mainStat: { value: 1, label: t('active_action', { defaultValue: 'إجراء نشط' }) },
            linkTo: '/company-affairs', 
            borderColor: 'border-gray-500'
        },
    ];

    const hrSection = [
        { 
            title: t('employee_affairs', { defaultValue: 'شؤون الموظفين' }), 
            icon: <UsersIcon />, 
            mainStat: { value: 6, label: t('pending_requests', { defaultValue: 'طلبات معلقة' }) },
            linkTo: '/employee-affairs', 
            borderColor: 'border-pink-500'
        },
    ];

    const smartTools = [
        { 
            title: t('ai_assistant', { defaultValue: 'المساعد القانوني (AI)' }), 
            icon: <SparklesIcon />, 
            mainStat: { value: 'AI', label: t('smart_assistant', { defaultValue: 'مساعد ذكي' }) },
            linkTo: '/ai-assistant', 
            borderColor: 'border-amber-500'
        },
        { 
            title: t('mind_maps', { defaultValue: 'الخرائط الذهنية' }), 
            icon: <BrainIcon />, 
            mainStat: { value: 5, label: t('maps', { defaultValue: 'خرائط' }) },
            linkTo: '/smart-mind-maps', 
            borderColor: 'border-rose-500'
        },
        { 
            title: t('legal_library', { defaultValue: 'المكتبة القانونية' }), 
            icon: <BookOpenIcon />, 
            mainStat: { value: 12, label: t('source', { defaultValue: 'مصدر' }) },
            linkTo: '/resources', 
            borderColor: 'border-yellow-600'
        },
        { 
            title: t('legal_forms', { defaultValue: 'النماذج القانونية' }), 
            icon: <DocumentDuplicateIcon />, 
            mainStat: { value: 25, label: t('form', { defaultValue: 'نموذج' }) },
            linkTo: '/legal-forms', 
            borderColor: 'border-indigo-600'
        },
        { 
            title: t('deadlines_calc', { defaultValue: 'حاسبة المواعيد' }), 
            icon: <ClockIcon />, 
            mainStat: { value: t('tool', { defaultValue: 'أداة' }), label: t('help', { defaultValue: 'مساعدة' }) },
            linkTo: '/tools/legal-deadlines', 
            borderColor: 'border-teal-600'
        },
        { 
            title: t('fees_calc', { defaultValue: 'حاسبة الرسوم' }), 
            icon: <CalculatorIcon />, 
            mainStat: { value: t('tool', { defaultValue: 'أداة' }), label: t('help', { defaultValue: 'مساعدة' }) },
            linkTo: '/tools/court-fees', 
            borderColor: 'border-green-600'
        },
    ];

    const systemAndReports = [
        { 
            title: t('reports', { defaultValue: 'التقارير الشاملة' }), 
            icon: <ReportMoneyIcon />, 
            mainStat: { value: 15, label: t('report', { defaultValue: 'تقرير' }) },
            linkTo: '/reports', 
            borderColor: 'border-purple-600'
        },
        { 
            title: t('compliance', { defaultValue: 'الامتثال والالتزامات' }), 
            icon: <ShieldCheckIcon />, 
            mainStat: { value: 2, label: t('requirements', { defaultValue: 'متطلبات' }) },
            linkTo: '/compliance', 
            borderColor: 'border-emerald-500'
        },
        { 
            title: t('notifications', { defaultValue: 'إدارة التنبيهات' }), 
            icon: <BellAlertIcon />, 
            mainStat: { value: 25, label: t('template', { defaultValue: 'قالب' }) },
            linkTo: '/notifications', 
            borderColor: 'border-orange-600'
        },
        { 
            title: t('contacts', { defaultValue: 'جهات الاتصال' }), 
            icon: <UserGroupIcon />, 
            mainStat: { value: 7, label: t('contacts_entity', { defaultValue: 'جهة' }) },
            linkTo: '/admin-tools/contacts', 
            borderColor: 'border-lime-600'
        },
        { 
            title: t('kba', { defaultValue: 'جمعية المحامين' }), 
            icon: <GavelIcon />, 
            mainStat: { value: 2, label: t('membership', { defaultValue: 'عضوية' }) },
            linkTo: '/kba', 
            borderColor: 'border-blue-700'
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-dm-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <Logo 
                        variant="dark" 
                        textClassName="flex flex-col"
                        iconClassName="w-12 h-12 text-accent-dark"
                    />
                    <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('welcome_adala', { defaultValue: 'أهلاً بك في نظام عدالة' })}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('system_desc', { defaultValue: 'منظومة الإدارة القانونية المتكاملة والذكية' })}</p>
                    </div>
                </div>
                <div className="text-center md:text-end">
                    <p className="text-xs font-mono text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('status_online', { defaultValue: 'System Status: Online' })}</p>
                    <p className="text-sm font-medium text-primary dark:text-primary-light mt-1">{new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <div className="report-print-header">
                <h1>{t('dashboard_summary', { defaultValue: 'ملخص لوحة التحكم' })}</h1>
                <p>{t('report_date', { defaultValue: 'تاريخ التقرير' })}: {new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</p>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-neutral-text dark:text-dm-text mb-4">{t('quick_overview', { defaultValue: 'نظرة عامة سريعة' })}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {quickStats.map((stat, index) => (
                        <DashboardStatCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <DashboardSection title={t('main_operations', { defaultValue: 'العمليات الرئيسية' })}>
                    {mainOperations.map((module, index) => <CompactModuleCard key={index} {...module} />)}
                </DashboardSection>

                <DashboardSection title={t('courts_sessions', { defaultValue: 'المحاكم والجلسات' })}>
                    {courtsAndLitigation.map((module, index) => <CompactModuleCard key={index} {...module} />)}
                </DashboardSection>

                <DashboardSection title={t('finance_assets', { defaultValue: 'الإدارة المالية والأصول' })}>
                    {financeAndAssets.map((module, index) => <CompactModuleCard key={index} {...module} />)}
                </DashboardSection>

                <DashboardSection title={t('hr', { defaultValue: 'الموارد البشرية' })}>
                    {hrSection.map((module, index) => <CompactModuleCard key={index} {...module} />)}
                </DashboardSection>

                <DashboardSection title={t('smart_legal_tools', { defaultValue: 'الأدوات القانونية الذكية' })}>
                    {smartTools.map((module, index) => <CompactModuleCard key={index} {...module} />)}
                </DashboardSection>

                <DashboardSection title={t('system_reports', { defaultValue: 'النظام والتقارير' })}>
                    {systemAndReports.map((module, index) => <CompactModuleCard key={index} {...module} />)}
                </DashboardSection>
            </div>
        </div>
    );
};

export default DashboardPage;
