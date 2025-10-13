import React from 'react';
import { Link } from 'react-router-dom';
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
    CalculatorIcon
} from '../constants';

// A card for high-level statistics with a colored circle, matching the image.
const StatCircleCard: React.FC<{ value: string; label: string; color: string; }> = ({ value, label, color }) => (
    <div className="bg-neutral-card dark:bg-dm-card p-4 rounded-lg shadow-card flex items-center justify-between">
        <div className="text-right">
            <p className="text-3xl font-bold text-neutral-text dark:text-dm-text">{value}</p>
            <p className="text-sm text-secondary dark:text-secondary-light">{label}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${color}`}></div>
    </div>
);

// NEW Compact Module Card - Replaces ModuleSummaryCard
const CompactModuleCard: React.FC<{
  title: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  mainStat: { value: string | number; label: string };
  linkTo: string;
  borderColor: string;
}> = ({ title, icon, mainStat, linkTo, borderColor }) => (
  <Link to={linkTo} className={`block bg-neutral-card dark:bg-dm-card rounded-lg shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border-s-4 ${borderColor}`}>
    <div className="p-4 flex items-center">
      <div className="flex-shrink-0 p-2 bg-slate-100 dark:bg-dm-background rounded-full">
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


const DashboardPage: React.FC = () => {
    // Mock data for top stats remains the same
    const statsData = [
        { value: '1/1', label: 'امتثال قادم/متأخر', color: 'bg-blue-600' },
        { value: '1', label: 'مهام إدارية متأخرة', color: 'bg-orange-600' },
        { value: '7', label: 'مهام إدارية معلقة', color: 'bg-purple-600' },
        { value: '1', label: 'قضايا عالية الخطورة', color: 'bg-red-600' },
        { value: '6', label: 'قضايا نشطة', color: 'bg-green-600' },
        { value: '8', label: 'إجمالي القضايا', color: 'bg-blue-500' },
    ];
    
    // UPDATED modulesData with the new compact structure
    const modulesData = [
        // الإدارة القانونية
        { 
            title: 'إدارة القضايا', 
            icon: <BriefcaseIcon />, 
            mainStat: { value: 6, label: 'قضايا نشطة' },
            linkTo: '/cases', 
            borderColor: 'border-blue-400'
        },
        { 
            title: 'تحليل العقود (AI)', 
            icon: <DocumentTextIcon />, 
            mainStat: { value: '0', label: 'عقود محللة' },
            linkTo: '/contracts', 
            borderColor: 'border-blue-400'
        },
        { 
            title: 'المساعد القانوني (AI)', 
            icon: <SparklesIcon />, 
            mainStat: { value: '0', label: 'استفسارات مجابة' },
            linkTo: '/ai-assistant', 
            borderColor: 'border-orange-400'
        },
        { 
            title: 'المكتبة القانونية', 
            icon: <BookOpenIcon />, 
            mainStat: { value: 12, label: 'مصدر قانوني' },
            linkTo: '/resources', 
            borderColor: 'border-yellow-500'
        },
        { 
            title: 'النماذج القانونية', 
            icon: <DocumentDuplicateIcon />, 
            mainStat: { value: 25, label: 'نموذج متاح' },
            linkTo: '/legal-forms', 
            borderColor: 'border-indigo-500'
        },
        { 
            title: 'الخرائط الذهنية الذكية', 
            icon: <BrainIcon />, 
            mainStat: { value: 5, label: 'خرائط محفوظة' },
            linkTo: '/smart-mind-maps', 
            borderColor: 'border-pink-500'
        },
        // الإدارة الشاملة
        { 
            title: 'الإدارة المالية', 
            icon: <BanknotesIcon />, 
            mainStat: { value: '-5383.75', label: 'د.ك صافي الرصيد' },
            linkTo: '/finance', 
            borderColor: 'border-green-400'
        },
        { 
            title: 'إدارة العقارات', 
            icon: <BuildingOffice2Icon />, 
            mainStat: { value: 4, label: 'طلبات هامة' },
            linkTo: '/property-management', 
            borderColor: 'border-teal-400'
        },
        { 
            title: 'شؤون الشركات', 
            icon: <BuildingLibraryIcon />, 
            mainStat: { value: 1, label: 'إجراء نشط' },
            linkTo: '/company-affairs', 
            borderColor: 'border-gray-500'
        },
        { 
            title: 'شؤون الموظفين', 
            icon: <UsersIcon />, 
            mainStat: { value: 6, label: 'طلبات معلقة' },
            linkTo: '/employee-affairs', 
            borderColor: 'border-green-400'
        },
        { 
            title: 'الامتثال والالتزامات', 
            icon: <ShieldCheckIcon />, 
            mainStat: { value: 2, label: 'متطلبات هامة' },
            linkTo: '/compliance', 
            borderColor: 'border-green-500'
        },
        // التواصل والتنظيم
        { 
            title: 'الإنابة القانونية', 
            icon: <ShareIcon />, 
            mainStat: { value: 2, label: 'طلبات معلقة' },
            linkTo: '/legal-representation', 
            borderColor: 'border-cyan-500'
        },
        { 
            title: 'جهات الاتصال', 
            icon: <UserGroupIcon />, 
            mainStat: { value: 7, label: 'جهات اتصال' },
            linkTo: '/admin-tools/contacts', 
            borderColor: 'border-lime-500'
        },
        { 
            title: 'إدارة التنبيهات', 
            icon: <BellAlertIcon />, 
            mainStat: { value: 25, label: 'قالب نشط' },
            linkTo: '/notifications', 
            borderColor: 'border-amber-500'
        },
        // الأتمتة والتكاملات
        { 
            title: 'الرول اليومي الآلي', 
            icon: <ListBulletIcon />, 
            mainStat: { value: 4, label: 'جلسات اليوم' },
            linkTo: '/automated-docket', 
            borderColor: 'border-red-500'
        },
        { 
            title: 'بحث بوابة العدل', 
            icon: <MagnifyingGlassIcon />, 
            mainStat: { value: 'متاح', label: 'بحث مباشر' },
            linkTo: '/moj-search', 
            borderColor: 'border-slate-500'
        },
        { 
            title: 'تتبع الأطراف والمهام', 
            icon: <MapPinIcon />, 
            mainStat: { value: 2, label: 'مهام نشطة' },
            linkTo: '/party-tracking', 
            borderColor: 'border-orange-500'
        },
        // الأدوات والتقارير
        { 
            title: 'إدارة المهام (العامة)', 
            icon: <ClipboardListCheckIcon />, 
            mainStat: { value: 8, label: 'مهام هامة' },
            linkTo: '/admin-tools/tasks', 
            borderColor: 'border-purple-400'
        },
        { 
            title: 'التقارير الشاملة', 
            icon: <ReportMoneyIcon />, 
            mainStat: { value: 15, label: 'تقارير متاحة' },
            linkTo: '/reports', 
            borderColor: 'border-purple-500'
        },
        { 
            title: 'شؤون جمعية المحامين', 
            icon: <GavelIcon />, 
            mainStat: { value: 2, label: 'عضويات نشطة' },
            linkTo: '/kba', 
            borderColor: 'border-blue-500'
        },
        { 
            title: 'حاسبة المواعيد القانونية', 
            icon: <ClockIcon />, 
            mainStat: { value: 'أداة', label: 'مساعدة' },
            linkTo: '/tools/legal-deadlines', 
            borderColor: 'border-teal-500'
        },
        { 
            title: 'حاسبة الرسوم القضائية', 
            icon: <CalculatorIcon />, 
            mainStat: { value: 'أداة', label: 'مساعدة' },
            linkTo: '/tools/court-fees', 
            borderColor: 'border-green-500'
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-neutral-text dark:text-dm-text mb-4">لوحة التحكم الرئيسية</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {statsData.map((stat, index) => (
                        <StatCircleCard key={index} {...stat} />
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-neutral-text dark:text-dm-text mb-4">ملخصات وحدات النظام</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {modulesData.map((module, index) => (
                        <CompactModuleCard key={index} {...module} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;