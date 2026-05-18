import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { Badge, UserRoleBadge, UserStatusBadge } from '../components/ui/Badge';
import { useJurisdiction } from '../components/JurisdictionContext';
import { 
    User, UserRole, UserStatus, Permission, RolePermissions, CountryCode 
} from '../types';
import { 
    userRoleOptions, userStatusOptions, permissionGroups, 
    PencilIcon, TrashIcon, PlusCircleIcon, CogIcon, 
    UsersIcon, LockClosedIcon, BuildingOffice2Icon, 
    AdjustmentsHorizontalIcon, BellAlertIcon, BanknotesIcon,
    PuzzlePieceIcon, CreditCardIcon, CloudArrowUpIcon,
    ArrowDownTrayIcon, ShieldCheckIcon, EyeIcon, ClockIcon,
    InformationCircleIcon, ActivityIcon, SparklesIcon,
    CheckBadgeIcon, GlobeAltIcon, MapPinIcon, PhoneIcon,
    EnvelopeIcon, ArrowUpRightIcon, ArrowDownRightIcon, OFFICE_NAME,
    MagnifyingGlassIcon, ArrowPathIcon, ChevronDownIcon,
    DevicePhoneMobileIcon, PrinterIcon, ShareIcon,
    CheckCircleIcon, XMarkIcon, GlobeAsiaAustraliaIcon,
    LanguageIcon, SwatchIcon, Square3Stack3DIcon,
    KeyIcon, BeakerIcon, CommandLineIcon, DatabaseIcon,
    SaveIcon, BriefcaseIcon, BuildingLibraryIcon
} from '../constants';
import PrintHeader from '../components/ui/PrintHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';

// --- MOCK DATA ---
const mockUsers: User[] = [
  { id: 'usr1', name: 'أحمد محمود', email: 'ahmed.m@adala.com', role: UserRole.ADMIN, status: UserStatus.ACTIVE },
  { id: 'usr2', name: 'فاطمة علي', email: 'fatima.a@adala.com', role: UserRole.LAWYER, status: UserStatus.ACTIVE },
  { id: 'usr3', name: 'علي جاسم', email: 'ali.j@adala.com', role: UserRole.ASSISTANT, status: UserStatus.ACTIVE },
];

const initialRolePermissions: RolePermissions = {
  [UserRole.ADMIN]: Object.values(Permission),
  [UserRole.LAWYER]: [Permission.VIEW_FINANCIALS, Permission.ACCESS_AI_FEATURES, Permission.EXPORT_REPORTS],
  [UserRole.ASSISTANT]: [Permission.ACCESS_AI_FEATURES],
  [UserRole.ACCOUNTANT]: [Permission.VIEW_FINANCIALS, Permission.EDIT_FINANCIALS],
  [UserRole.GUEST]: [],
};

const mockAuditLogs = [
    { id: 1, action: 'تغيير صلاحيات دور "محامي"', user: 'أحمد محمود', time: 'منذ ساعتين', type: 'security' },
    { id: 2, action: 'إضافة مستخدم جديد: فاطمة علي', user: 'أحمد محمود', time: 'منذ 5 ساعات', type: 'user' },
    { id: 3, action: 'تحديث شعار المكتب', user: 'علي جاسم', time: 'أمس الساعة 10:30 صباحاً', type: 'system' },
    { id: 4, action: 'تصدير تقرير القضايا السنوي', user: 'فاطمة علي', time: 'أمس الساعة 4:15 مساءً', type: 'data' },
];

// --- MAIN COMPONENT ---
interface SettingsPageProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const SettingsHub = ({ tabs, activeTab, setActiveTab }: { tabs: any[], activeTab: string, setActiveTab: (id: string) => void }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {tabs.map((tab) => (
                <Card 
                    key={tab.id} 
                    className="p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group cursor-pointer flex flex-col items-center text-center space-y-4"
                    onClick={() => setActiveTab(tab.id)}
                >
                    <div className="p-6 bg-gray-50 dark:bg-dm-background rounded-[28px] text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3">
                        {React.cloneElement(tab.icon as React.ReactElement<any>, { className: 'w-10 h-10' })}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-dm-text tracking-tight group-hover:text-indigo-600 transition-colors">{tab.label}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70 group-hover:opacity-100 italic">{tab.desc || 'إدارة وتخصيص إعدادات الوحدة'}</p>
                    </div>
                    <div className="pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 border-b-2 border-indigo-600/0 group-hover:border-indigo-600 transition-all">
                            دخول للوحدة <ArrowUpRightIcon className="w-3 h-3"/>
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ toggleDarkMode, isDarkMode }) => {
    const { t, i18n } = useTranslation();
    const { selectedJurisdiction, setJurisdiction, availableJurisdictions } = useJurisdiction();
    const [activeTab, setActiveTab] = useState('hub');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        alert(t('settings_saved_successfully', { defaultValue: 'تم حفظ كافة الإعدادات بنجاح' }));
    };
    
    // User Management State
    const [users, setUsers] = useState<User[]>(mockUsers);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
    const [rolePermissions, setRolePermissions] = useState<RolePermissions>(initialRolePermissions);

    // Office State
    const [officeInfo, setOfficeInfo] = useState({
        name: 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية',
        license: 'ADV-2024-9981',
        unifiedId: '7766554433',
        address: 'مدينة الكويت، شرق، برج الراية، الدور 45',
        phone: '+965 2244 8877',
        email: 'info@shatta-law.com',
        website: 'www.shatta-law.com',
        description: 'مؤسسة قانونية رائدة متخصصة في القضايا التجارية والمدنية والتحكيم الدولي.'
    });

    // Preferences State
    const [prefs, setPrefs] = useState({
        lang: i18n.language,
        currency: selectedJurisdiction.currencyCode,
        dateFormat: 'DD/MM/YYYY',
        autoSave: true,
        smartSuggestions: true
    });

    useEffect(() => {
        setPrefs(prev => ({ ...prev, lang: i18n.language, currency: selectedJurisdiction.currencyCode }));
    }, [i18n.language, selectedJurisdiction]);

    const [securityPrefs, setSecurityPrefs] = useState({
        minLength: '8',
        requireSpecialChars: true,
        twoFactorEnabled: false
    });

    const [notifPrefs, setNotifPrefs] = useState({
        emailOverdueTasks: true,
        emailUrgentHearings: true,
        whatsappDailySummary: false,
        smsCriticalAlerts: true
    });

    const tabs = [
        { id: 'office', label: 'ملف المكتب', desc: 'البيانات الرسمية والعناوين والشعار', icon: <BuildingOffice2Icon /> },
        { id: 'dictionary', label: 'القواميس والجداول', desc: 'إدارة تصنيفات القضايا والمصاريف والفروع', icon: <Square3Stack3DIcon /> },
        { id: 'users', label: 'المستخدمين', desc: 'إدارة فريق العمل وحسابات الموظفين', icon: <UsersIcon /> },
        { id: 'roles', label: 'الصلاحيات', desc: 'تحديد مستويات الوصول والأدوار', icon: <ShieldCheckIcon /> },
        { id: 'appearance', label: 'المظهر والسمات', desc: 'تخصيص الألوان والوضع الليلي', icon: <SwatchIcon /> },
        { id: 'security', label: 'الأمان والخصوصية', desc: 'حماية الدخول والتحقق الثنائي', icon: <LockClosedIcon /> },
        { id: 'integrations', label: 'الربط الخارجي', desc: 'التكامل مع Google, Outlook والمزيد', icon: <PuzzlePieceIcon /> },
        { id: 'communications', label: 'القوالب والإشعارات', desc: 'قوالب البريد والواتساب والتقارير', icon: <BellAlertIcon /> },
        { id: 'billing', label: 'الاشتراك والدفع', desc: 'إدارة الباقات وفواتير الخدمة', icon: <BanknotesIcon /> },
        { id: 'system', label: 'إعدادات النظام', desc: 'الضبط الفني المتقدم وقاعدة البيانات', icon: <CommandLineIcon /> },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'hub': return <SettingsHub tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />;
            case 'office': return <OfficeSettings info={officeInfo} setInfo={setOfficeInfo} />;
            case 'dictionary': return <DictionarySettings />;
            case 'users': return <UserManagement users={users} onAdd={() => { setEditingUser(null); setIsUserModalOpen(true); }} onEdit={(u: any) => { setEditingUser(u); setIsUserModalOpen(true); }} onDelete={(id: string) => setUsers(prev => prev.filter(u => u.id !== id))} />;
            case 'roles': return <RolePermissionsSettings permissions={rolePermissions} setPermissions={setRolePermissions} />;
            case 'appearance': return <AppearanceSettings prefs={prefs} setPrefs={setPrefs} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />;
            case 'security': return <SecuritySettings prefs={securityPrefs} setPrefs={setSecurityPrefs} />;
            case 'integrations': return <IntegrationsSettings />;
            case 'communications': return <CommunicationSettings notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} />;
            case 'billing': return <BillingSettings />;
            case 'system': return <AdvancedSystemSettings prefs={prefs} setPrefs={setPrefs} selectedJurisdiction={selectedJurisdiction} setJurisdiction={setJurisdiction} availableJurisdictions={availableJurisdictions} />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24 px-4" dir="rtl">
            <PrintHeader title="إعدادات المنظومة" subtitle="التحكم المتقدم في الموارد والصلاحيات" />
            
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-dm-card p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="flex items-center mb-4 md:mb-0 relative z-10">
                    <div className="p-4 bg-indigo-600 rounded-3xl me-5 shadow-xl shadow-indigo-200/50">
                        <CogIcon className="w-10 h-10 text-white animate-spin-slow" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {activeTab !== 'hub' && (
                                <button 
                                    onClick={() => setActiveTab('hub')}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-dm-background rounded-lg text-indigo-600 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter"
                                >
                                    <ArrowPathIcon className="w-3 h-3 rotate-180" /> الرجوع للمركز
                                </button>
                            )}
                            <h1 className="text-3xl font-black text-gray-900 dark:text-dm-text tracking-tighter">
                                {activeTab === 'hub' ? 'مركز التهيئة والإعدادات' : tabs.find(t => t.id === activeTab)?.label}
                            </h1>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {activeTab === 'hub' 
                                ? 'تحكم كامل في كافة مفاصل بيئة عمل مكتب صبري شطا' 
                                : tabs.find(t => t.id === activeTab)?.desc}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 relative z-10">
                    <Button 
                        variant="primary" 
                        className="rounded-2xl font-black shadow-2xl shadow-indigo-500/20 px-8 h-14" 
                        leftIcon={<SaveIcon className="w-5 h-5"/>}
                        onClick={handleSave}
                        isLoading={isSaving}
                    >
                        حفظ الإعدادات
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            {activeTab === 'hub' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    {[
                        { label: 'فريق العمل', value: `${users.length} أعضاء`, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'حالة الربط', value: 'نشط', icon: GlobeAltIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'مستوى الأمان', value: 'محصن', icon: ShieldCheckIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'النسخ الاحتياطي', value: 'مؤمن', icon: DatabaseIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((stat, i) => (
                        <motion.div 
                            key={stat.label}
                            whileHover={{ y: -6, scale: 1.02 }}
                            className={`${stat.bg} p-6 rounded-[32px] border border-white dark:border-gray-800 shadow-sm flex items-center justify-between`}
                        >
                            <div>
                                <p className={`text-[10px] font-black ${stat.color} mb-1 uppercase tracking-widest opacity-60`}>{stat.label}</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tighter">{stat.value}</p>
                            </div>
                            <stat.icon className={`w-10 h-10 ${stat.color} opacity-20`} />
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Main Content Area */}
            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUser?.id ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}>
                <UserForm 
                    initialData={editingUser || {}} 
                    onSave={(data) => {
                        if (editingUser?.id) {
                            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data } as User : u));
                        } else {
                            setUsers(prev => [...prev, { ...data, id: `usr${Date.now()}` } as User]);
                        }
                        setIsUserModalOpen(false);
                    }}
                    onCancel={() => setIsUserModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

// --- SUB-SECTIONS ---

const AppearanceSettings = ({ prefs, setPrefs, toggleDarkMode, isDarkMode }: any) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="p-10 border-none bg-white dark:bg-dm-card rounded-[40px] shadow-xl shadow-gray-100/50 dark:shadow-none space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 dark:bg-dm-background rounded-2xl">
                           <SwatchIcon className="w-8 h-8 text-indigo-600"/>
                        </div>
                        <div>
                             <h4 className="text-xl font-black text-gray-900 dark:text-dm-text tracking-tighter">{t('theme_selection', { defaultValue: 'اختيار السمة والوضع' })}</h4>
                             <p className="text-xs text-gray-400 font-medium tracking-tight">اختر المظهر المريح لعينيك أثناء العمل.</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <button onClick={() => isDarkMode && toggleDarkMode()} className={`group p-6 rounded-[32px] border-4 transition-all flex flex-col items-center gap-4 ${!isDarkMode ? 'bg-white border-indigo-600 shadow-2xl shadow-indigo-500/20' : 'bg-gray-50 dark:bg-dm-background border-transparent text-gray-500 opacity-60 hover:opacity-100'}`}>
                            <div className="w-16 h-16 rounded-[20px] bg-slate-100 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-inner"><SparklesIcon className="w-8 h-8"/></div>
                            <span className="font-black text-sm tracking-tighter">الوضع النهاري</span>
                        </button>
                        <button onClick={() => !isDarkMode && toggleDarkMode()} className={`group p-6 rounded-[32px] border-4 transition-all flex flex-col items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-indigo-600 shadow-2xl shadow-indigo-500/20 text-white' : 'bg-gray-50 dark:bg-dm-background border-transparent text-gray-500 opacity-60 hover:opacity-100'}`}>
                            <div className="w-16 h-16 rounded-[20px] bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-inner"><LockClosedIcon className="w-8 h-8"/></div>
                            <span className="font-black text-sm tracking-tighter">الوضع الليلي</span>
                        </button>
                    </div>
                </Card>

                <Card className="p-10 border-none bg-white dark:bg-dm-card rounded-[40px] shadow-xl shadow-gray-100/50 dark:shadow-none space-y-8">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-50 dark:bg-dm-background rounded-2xl">
                           <LanguageIcon className="w-8 h-8 text-purple-600"/>
                        </div>
                        <div>
                             <h4 className="text-xl font-black text-gray-900 dark:text-dm-text tracking-tighter">{t('typography_language', { defaultValue: 'تخصيص اللغة والترميز' })}</h4>
                             <p className="text-xs text-gray-400 font-medium tracking-tight">إعدادات اللغة المفضلة للواجهة والمستندات.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <Select 
                            label="لغة الواجهة الرئيسية" 
                            options={[{value: 'ar', label: 'العربية (اللغة الافتراضية)'}, {value: 'en', label: 'English (Beta)'}]} 
                            value={prefs.lang} 
                            onChange={(e: any) => setPrefs({...prefs, lang: e.target.value})}
                        />
                        <Select 
                            label="تنسيق الأرقام والعملات" 
                            options={[{value: 'ar-KW', label: 'الكويت (د.ك)'}, {value: 'ar-SA', label: 'السعودية (ر.س)'}]} 
                            defaultValue="ar-KW" 
                        />
                    </div>
                </Card>
            </div>

            <Card className="p-10 bg-indigo-900 text-white rounded-[48px] relative overflow-hidden shadow-2xl shadow-indigo-900/40 group">
                <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-right">
                        <h3 className="text-3xl font-black mb-3 tracking-tighter">تخصيص الهوية البصرية المتكاملة</h3>
                        <p className="text-indigo-100/70 text-lg font-medium leading-relaxed max-w-2xl">
                            ارفع هوية مكتبك لمستوى جديد عبر تخصيص الشعار، الألوان الرئيسية، والخطوط على مستوى كافة التقارير والقوالب.
                        </p>
                    </div>
                    <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-black rounded-2xl px-10 h-16 shadow-xl shadow-black/20 text-lg shrink-0">ترقية الباقة الآن</Button>
                </div>
            </Card>
        </div>
    );
};

const CommunicationSettings = ({ notifPrefs, setNotifPrefs }: any) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'categories' | 'editor'>('categories');
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

    const categories = [
        { id: 'email', title: 'قوالب البريد الإلكتروني', icon: <EnvelopeIcon className="w-8 h-8"/>, count: '12 قالب', templates: [
            { id: 1, name: 'ترحيب بعميل جديد', content: 'عزيزي العميل، نرحب بكم في مكتبنا...' },
            { id: 2, name: 'تذكير بموعد الدفع', content: 'نحيطكم علماً بأن موعد الدفع قد حان...' }
        ] },
        { id: 'whatsapp', title: 'قوالب رسائل الواتساب', icon: <PhoneIcon className="w-8 h-8"/>, count: '5 قوالب', templates: [
            { id: 3, name: 'تأكيد موعد جلسة', content: 'تم تأكيد موعد جلستكم القادمة في...' }
        ] },
        { id: 'reports', title: 'قوالب تقارير العملاء', icon: <PrinterIcon className="w-8 h-8"/>, count: '8 قوالب', templates: [] },
        { id: 'alerts', title: 'إعدادات الإشعارات والتنبيهات', icon: <BellAlertIcon className="w-8 h-8"/>, count: 'تفعيل/تعطيل التلقائي', templates: [] },
    ];

    const toggleNotif = (key: string) => {
        setNotifPrefs({ ...notifPrefs, [key]: !notifPrefs[key] });
    };

    if (view === 'editor') {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setView('categories')} className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:translate-x-1 transition-transform group">
                        <ArrowPathIcon className="w-5 h-5 rotate-180 group-hover:rotate-0 transition-transform" />
                        العودة لقائمة التصنيفات
                    </button>
                    <div className="px-6 py-2 bg-indigo-50 dark:bg-dm-background text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30">
                        تحرير: {selectedCategory?.title}
                    </div>
                </div>
                <Card className="p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-indigo-500/5 bg-white dark:bg-dm-card space-y-8">
                    <div className="space-y-6">
                        <Input label="اسم القالب التعريفي" value={selectedTemplate?.name || ''} onChange={(e) => setSelectedTemplate({...selectedTemplate, name: e.target.value})} containerClassName="mb-0" className="h-14 rounded-2xl bg-gray-50 border-none font-bold" />
                        <TextArea label="محتوى القالب الذكي" rows={10} value={selectedTemplate?.content || ''} onChange={(e) => setSelectedTemplate({...selectedTemplate, content: e.target.value})} className="rounded-3xl bg-gray-50 border-none p-6 font-medium leading-relaxed" />
                        
                        <div className="p-6 bg-gray-50 dark:bg-dm-background rounded-[32px] border border-dashed border-gray-200 dark:border-gray-800">
                            <p className="text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest text-center">المتغيرات الديناميكية المدعومة (انقر للنسخ)</p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {['[اسم_العميل]', '[رقم_القضية]', '[التاريخ]', '[اسم_المحامي]', '[المبلغ]', '[موعد_الجلسة]'].map(tag => (
                                    <button key={tag} className="px-4 py-2 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-600 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-lg transition-all">{tag}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-50 dark:border-gray-800">
                        <Button variant="outline" className="rounded-2xl px-10" onClick={() => setView('categories')}>إلغاء</Button>
                        <Button variant="primary" className="rounded-2xl px-16 shadow-xl shadow-indigo-500/20" onClick={() => {
                            alert('تم حفظ القالب بنجاح');
                            setView('categories');
                        }}>حفظ القالب</Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Notifications Toggle Unit */}
            <Card className="p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card shadow-xl shadow-gray-100/50">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-rose-50 rounded-2xl"><BellAlertIcon className="w-8 h-8 text-rose-600"/></div>
                    <div>
                        <h4 className="text-xl font-black text-gray-900 tracking-tighter">تفعيل الإشعارات الآلية للمتابعة</h4>
                        <p className="text-xs text-gray-400 font-medium">تحكم في التنبيهات التي تصلك وتصل للعملاء بشكل تلقائي.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { key: 'emailOverdueTasks', label: 'إشعارات المهام المتأخرة (Overdue)', desc: 'تصل عبر البريد للمحامي المسؤول عن المهمة.', icon: <ClockIcon className="w-5 h-5 text-rose-500"/> },
                        { key: 'emailUrgentHearings', label: 'تنبيهات الجلسات العاجلة (Urgent)', desc: 'تنبيه قبل 24 ساعة و ساعة واحدة من موعد الجلسة.', icon: <LockClosedIcon className="w-5 h-5 text-amber-500"/> },
                        { key: 'whatsappDailySummary', label: 'ملخص يومي عبر الواتساب', desc: 'قائمة بكافة أعمال المكتب تصل للمدير صباحاً.', icon: <DevicePhoneMobileIcon className="w-5 h-5 text-emerald-500"/> },
                        { key: 'smsCriticalAlerts', label: 'رسائل نصية للحالات الحرجة', desc: 'عند صدور حكم نهائي أو إلغاء موعد مفاجئ.', icon: <ShareIcon className="w-5 h-5 text-blue-500"/> },
                    ].map(notif => (
                        <div key={notif.key} className="flex items-start gap-4 p-6 rounded-[32px] bg-gray-50 dark:bg-dm-background border border-gray-50 hover:border-indigo-100 transition-all cursor-pointer group" onClick={() => toggleNotif(notif.key)}>
                             <div className="p-3 bg-white dark:bg-dm-card rounded-2xl shadow-sm text-gray-400 group-hover:text-indigo-600 transition-colors">
                                {notif.icon}
                             </div>
                             <div className="flex-grow">
                                <h5 className="font-black text-sm text-gray-800 dark:text-dm-text mb-1">{notif.label}</h5>
                                <p className="text-[10px] font-bold text-gray-400 leading-tight uppercase tracking-widest">{notif.desc}</p>
                             </div>
                             <div className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${notifPrefs[notif.key] ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-all ${notifPrefs[notif.key] ? 'translate-x-0' : 'translate-x-6'}`} />
                             </div>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="flex items-center gap-4 py-8 px-2">
                <div className="h-px bg-gray-100 flex-grow" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">أو تخصيص قوالب المراسلة</span>
                <div className="h-px bg-gray-100 flex-grow" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.filter(c => c.id !== 'alerts').map((item) => (
                    <Card key={item.id} className="p-8 rounded-[40px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card hover:shadow-2xl hover:shadow-indigo-500/10 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-5">
                            <div className="p-5 bg-gray-50 dark:bg-dm-background rounded-[24px] text-indigo-600 shadow-inner group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900 dark:text-dm-text tracking-tighter">{item.title}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 opacity-70">{item.count}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-indigo-600 font-black text-xs px-6 rounded-2xl border border-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm" onClick={() => {
                             setSelectedCategory(item);
                             setSelectedTemplate(item.templates[0] || { name: '', content: '' });
                             setView('editor');
                        }}>فتح المحرر</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};


const AdvancedSystemSettings = ({ prefs, setPrefs, selectedJurisdiction, setJurisdiction, availableJurisdictions }: any) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-6">
                    <h4 className="text-sm font-black flex items-center gap-2 text-gray-900 dark:text-dm-text uppercase tracking-widest"><DatabaseIcon className="w-5 h-5 text-indigo-600"/> {t('data_management', { defaultValue: 'إدارة البيانات والنسخ الاحتياطي' })}</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dm-background rounded-2xl border border-gray-50 dark:border-gray-800">
                            <div>
                                <p className="font-black text-xs text-gray-800 dark:text-dm-text">نسخ احتياطي يومي</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">آخر نسخة: اليوم 04:00 ص</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px]">تحميل</Button>
                        </div>
                        <Button variant="outline" className="w-full h-11 rounded-xl border-gray-100 dark:border-gray-800 text-gray-500 hover:text-indigo-600 font-black text-xs" leftIcon={<ArrowDownTrayIcon className="w-4 h-4"/>}>تصدير كافة بيانات المكتب (JSON/CSV)</Button>
                    </div>
                </Card>

                <Card className="p-6 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-6">
                    <h4 className="text-sm font-black flex items-center gap-2 text-gray-900 dark:text-dm-text uppercase tracking-widest"><CommandLineIcon className="w-5 h-5 text-indigo-600"/> {t('technical_params', { defaultValue: 'المعلمات الفنية والقانونية' })}</h4>
                    <Select 
                        label="النطاق القانوني الافتراضي" 
                        options={availableJurisdictions.map((j: any) => ({value: j.code, label: `${j.flag} ${j.name}`}))} 
                        value={selectedJurisdiction.code} 
                        onChange={(e: any) => setJurisdiction(e.target.value)}
                        containerClassName="mb-0"
                    />
                    <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-dm-background rounded-2xl border border-amber-100 dark:border-gray-800">
                        <InformationCircleIcon className="w-4 h-4 text-amber-600 shrink-0"/>
                        <p className="text-[9px] font-bold text-amber-800 dark:text-amber-500 leading-relaxed">تغيير النطاق القانوني قد يؤثر على نماذج العقود والبيانات المالية الحالية.</p>
                    </div>
                </Card>
            </div>

            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-dm-background rounded-[32px] space-y-6">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('smart_features', { defaultValue: 'ميزاتها ذكية وتلقائية' })}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { id: 'autoSave', label: t('auto_save', { defaultValue: 'الحفظ التلقائي للبيانات' }), desc: t('auto_save_desc', { defaultValue: 'حفظ المسودات والعقود تلقائياً أثناء الكتابة' }) },
                        { id: 'smartSuggestions', label: t('smart_suggestions', { defaultValue: 'اقتراحات الذكاء الاصطناعي' }), desc: t('smart_suggestions_desc', { defaultValue: 'تفعيل المساعد الذكي لتقديم نصائح عند إدخال البيانات' }) },
                    ].map(item => (
                        <div key={item.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-dm-card border border-gray-50 dark:border-gray-800 shadow-sm transition-all hover:border-indigo-100">
                            <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 rounded-md text-indigo-600 border-gray-300 focus:ring-indigo-500/20 cursor-pointer" 
                                checked={(prefs as any)[item.id]} 
                                onChange={e => setPrefs({...prefs, [item.id]: e.target.checked})}
                            />
                            <div>
                                <p className="font-black text-xs text-gray-800 dark:text-dm-text">{item.label}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            <Card className="p-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-[32px] flex flex-col md:flex-row items-center justify-between bg-white dark:bg-dm-card gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 dark:bg-dm-background rounded-xl text-indigo-400"><KeyIcon className="w-5 h-5"/></div>
                    <div>
                        <h4 className="font-black text-sm text-gray-900 dark:text-dm-text tracking-tight">مفاتيح الـ API للمطورين</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">إدارة مفاتيح الوصول لربط أنظمة خارجية بمكتبك.</p>
                    </div>
                </div>
                <Button variant="outline" className="rounded-xl border-indigo-100 text-indigo-600 font-black text-xs px-8">إعداد المفاتيح</Button>
            </Card>
        </div>
    );
};

const OfficeSettings = ({ info, setInfo }: any) => {
    const { t } = useTranslation();
    return (
    <div className="space-y-6">
        <Card className="rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-50 dark:border-gray-800">
                <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-dm-background border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-all cursor-pointer group relative overflow-hidden">
                    <CloudArrowUpIcon className="w-6 h-6"/>
                    <span className="text-[10px] font-black mt-1">{t('change_logo', { defaultValue: 'تغيير الشعار' })}</span>
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-dm-text leading-tight">{info.name}</h3>
                    <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase tracking-widest">{t('license_number', { defaultValue: 'رقم الترخيص' })}: {info.license}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input label={t('legal_entity_name', { defaultValue: 'اسم المنشأة القانونية' })} value={info.name} onChange={e => setInfo({...info, name: e.target.value})} containerClassName="mb-0" />
                <Input label={t('unified_id', { defaultValue: 'الرقم الموحد للجهة' })} value={info.unifiedId} onChange={e => setInfo({...info, unifiedId: e.target.value})} containerClassName="mb-0" />
                <Input label={t('professional_license_no', { defaultValue: 'رقم الترخيص المهني' })} value={info.license} onChange={e => setInfo({...info, license: e.target.value})} containerClassName="mb-0" />
                <Input label={t('official_email', { defaultValue: 'البريد الإلكتروني الرسمي' })} value={info.email} onChange={e => setInfo({...info, email: e.target.value})} containerClassName="mb-0" />
                <Input label={t('office_phone', { defaultValue: 'رقم هاتف المكتب' })} value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} containerClassName="mb-0" />
                <Input label={t('website', { defaultValue: 'الموقع الإلكتروني' })} value={info.website} onChange={e => setInfo({...info, website: e.target.value})} containerClassName="mb-0" />
                <div className="md:col-span-2">
                    <Input label={t('main_office_address', { defaultValue: 'عنوان المقر الرئيسي' })} value={info.address} onChange={e => setInfo({...info, address: e.target.value})} containerClassName="mb-0" />
                </div>
                <div className="md:col-span-2">
                    <TextArea label={t('office_description', { defaultValue: 'وصف تعريفي للمكتب' })} value={info.description} onChange={e => setInfo({...info, description: e.target.value})} rows={3} />
                </div>
            </div>
        </Card>
    </div>
    );
};

const UserManagement = ({ users, onAdd, onEdit, onDelete }: any) => {
    const { t } = useTranslation();
    return (
    <Card className="rounded-[32px] p-0 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-dm-text">{t('team_management', { defaultValue: 'إدارة فريق العمل' })}</h3>
                <p className="text-[10px] font-bold text-gray-400 mt-1">{t('active_users_count', { defaultValue: 'لديك {{count}} مستخدم نشط من أصل 10 مقاعد', count: users.length })}</p>
            </div>
            <Button variant="primary" leftIcon={<PlusCircleIcon className="w-4 h-4"/>} className="px-6 rounded-xl font-black shadow-sm" onClick={onAdd}>{t('add_new_member', { defaultValue: 'إضافة عضو جديد' })}</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
                <thead>
                    <tr className="bg-gray-50 dark:bg-dm-background font-black text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                        <th className="p-4">{t('member', { defaultValue: 'العضو' })}</th>
                        <th className="p-4 text-center">{t('role', { defaultValue: 'الدور' })}</th>
                        <th className="p-4 text-center">{t('status', { defaultValue: 'الحالة' })}</th>
                        <th className="p-4 text-center">{t('actions', { defaultValue: 'إجراءات' })}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {users.map((user: User) => (
                        <tr key={user.id} className="hover:bg-indigo-50/20 transition-colors group">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-dm-background text-indigo-600 flex items-center justify-center font-black text-xs">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 dark:text-dm-text text-sm">{user.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-center"><UserRoleBadge role={user.role} /></td>
                            <td className="p-4 text-center"><UserStatusBadge status={user.status} /></td>
                            <td className="p-4">
                                <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white dark:hover:bg-dm-background rounded-lg text-amber-600 transition-all font-black transition-all" onClick={() => onEdit(user)}><PencilIcon className="w-4 h-4"/></button>
                                    <button className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-all font-black" onClick={() => onDelete(user.id)}><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);
};

const RolePermissionsSettings = ({ permissions, setPermissions }: any) => {
    const { t } = useTranslation();
    const handlePermissionChange = (role: UserRole, perm: Permission, checked: boolean) => {
        const current = permissions[role] || [];
        const updated = checked ? [...new Set([...current, perm])] : current.filter((p: any) => p !== perm);
        setPermissions({ ...permissions, [role]: updated });
    };

    return (
        <Card className="rounded-[32px] p-0 overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card">
                <h3 className="text-lg font-black text-gray-900 dark:text-dm-text mb-1">{t('permissions_matrix_rbac', { defaultValue: 'مصفوفة الصلاحيات (RBAC)' })}</h3>
                <p className="text-[10px] text-gray-400 font-bold max-w-xl leading-relaxed uppercase tracking-widest">{t('rbac_description', { defaultValue: 'تخصيص مستويات الوصول لكل دور وظيفي في المنظومة.' })}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-dm-background border-b border-gray-100 dark:border-gray-800">
                            <th className="p-4 font-black text-gray-400 uppercase tracking-widest text-[9px] min-w-[200px]">{t('system_features', { defaultValue: 'ميزات النظام' })}</th>
                            {userRoleOptions.map(role => (
                                <th key={role.value} className="p-4 font-black text-gray-900 dark:text-dm-text border-r border-gray-50 dark:border-gray-800 whitespace-nowrap text-center text-[10px]">{role.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {permissionGroups.map(group => (
                            <React.Fragment key={group.title}>
                                <tr className="bg-indigo-50/30 dark:bg-dm-background">
                                    <td colSpan={userRoleOptions.length + 1} className="p-3 font-black uppercase text-[9px] tracking-widest text-indigo-600">{group.title}</td>
                                </tr>
                                {group.permissions.map(perm => (
                                    <tr key={perm.value} className="hover:bg-gray-50/50 dark:hover:bg-dm-background transition-colors">
                                        <td className="p-4">
                                            <p className="font-black text-gray-800 dark:text-dm-text text-xs">{perm.label}</p>
                                            <p className="text-[9px] text-gray-400 font-bold mt-0.5">{perm.description}</p>
                                        </td>
                                        {userRoleOptions.map(roleOption => {
                                            const role = roleOption.value as UserRole;
                                            const isChecked = permissions[role]?.includes(perm.value);
                                            const isAdmin = role === UserRole.ADMIN;
                                            return (
                                                <td key={`${role}-${perm.value}`} className="p-4 text-center border-r border-gray-50 dark:border-gray-800 align-middle">
                                                    <input 
                                                        type="checkbox" 
                                                        className={`w-5 h-5 rounded-md text-indigo-600 border-gray-300 focus:ring-indigo-500/20 ${isAdmin ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        checked={isAdmin || isChecked}
                                                        disabled={isAdmin}
                                                        onChange={(e) => handlePermissionChange(role, perm.value as Permission, e.target.checked)}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const SecuritySettings = ({ prefs, setPrefs }: any) => {
    const { t } = useTranslation();
    return (
    <div className="space-y-6">
        <Card className="rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 dark:bg-dm-background rounded-2xl text-amber-600">
                    <ShieldCheckIcon className="w-6 h-6"/>
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-dm-text tracking-tight">{t('login_account_protection', { defaultValue: 'حماية الدخول والحسابات' })}</h3>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-5 rounded-[24px] bg-indigo-50/50 dark:bg-dm-background border border-indigo-100 dark:border-gray-800">
                    <div className="flex gap-4">
                        <div className="p-2.5 bg-white dark:bg-dm-card rounded-xl text-indigo-600 shadow-sm h-fit">
                            <LockClosedIcon className="w-5 h-5"/>
                        </div>
                        <div>
                            <p className="font-black text-indigo-900 dark:text-indigo-400 text-sm">{t('two_factor_auth_full', { defaultValue: 'المصادقة الثنائية (2FA)' })}</p>
                            <p className="text-[10px] font-bold text-gray-500 leading-relaxed max-w-sm mt-1">{t('two_factor_auth_desc_detailed', { defaultValue: 'أضف طبقة حماية إضافية لحسابك من خلال ربطه بتطبيق Google Authenticator.' })}</p>
                        </div>
                    </div>
                    <Button 
                        variant={prefs.twoFactorEnabled ? 'secondary' : 'primary'} 
                        className="rounded-xl px-6 font-black text-xs"
                        onClick={() => setPrefs({...prefs, twoFactorEnabled: !prefs.twoFactorEnabled})}
                    >
                        {prefs.twoFactorEnabled ? t('disable_protection', { defaultValue: 'تعطيل' }) : t('enable_protection', { defaultValue: 'تفعيل الآن' })}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-6 bg-gray-50 dark:bg-dm-background rounded-[24px] border border-gray-100 dark:border-gray-800">
                        <h4 className="font-black text-xs text-gray-800 dark:text-dm-text mb-3 uppercase tracking-widest">{t('password_policy', { defaultValue: 'سياسة كلمات المرور' })}</h4>
                        <Select 
                            label={t('min_length', { defaultValue: "الحد الأدنى للطول" })} 
                            options={[{value:'8', label: '8 أحرف'}, {value:'12', label: '12 حرف'}]} 
                            value={prefs.minLength} 
                            onChange={(e: any) => setPrefs({...prefs, minLength: e.target.value})}
                            containerClassName="mb-4"
                        />
                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-md text-indigo-600 border-gray-300 focus:ring-indigo-500/20 cursor-pointer" 
                                checked={prefs.requireSpecialChars}
                                onChange={(e: any) => setPrefs({...prefs, requireSpecialChars: e.target.checked})}
                            />
                            <span className="text-[10px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-tight">{t('require_symbols', { defaultValue: 'طلب رموز وأرقام وحروف كبيرة' })}</span>
                        </div>
                    </div>
                    <div className="space-y-4 p-6 bg-gray-50 dark:bg-dm-background rounded-[24px] border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
                        <div>
                            <h4 className="font-black text-xs text-gray-800 dark:text-dm-text mb-3 uppercase tracking-widest">{t('active_sessions', { defaultValue: 'الجلسات المفتوحة' })}</h4>
                            <p className="text-[10px] font-bold text-gray-500 mb-4 leading-relaxed">{t('active_devices_count', { defaultValue: 'هناك 3 أجهزة مسجلة دخول حالياً لنفس المكتب.' })}</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full rounded-xl border-gray-200 text-rose-600 hover:bg-rose-50 font-black">{t('logout_all_devices', { defaultValue: 'إنهاء كافة الجلسات' })}</Button>
                    </div>
                </div>
            </div>
        </Card>
    </div>
);
};

const IntegrationsSettings = () => {
    const { t } = useTranslation();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    const integrations = [
        { id: 'google', name: 'Google Calendar & Mail', icon: <GlobeAltIcon className="w-8 h-8 text-blue-500"/>, status: t('connected', { defaultValue: 'متصل' }), desc: t('google_integration_desc', { defaultValue: 'مزامنة المواعيد القانونية والبريد الرسمي.' }) },
        { id: 'outlook', name: 'Microsoft Outlook', icon: <EnvelopeIcon className="w-8 h-8 text-indigo-500"/>, status: t('not_connected', { defaultValue: 'غير متصل' }), desc: t('outlook_integration_desc', { defaultValue: 'ربط النظام ببيئة Office 365 الخاصة بالمؤسسة.' }) },
        { id: 'whatsapp', name: 'WhatsApp Business API', icon: <PhoneIcon className="w-8 h-8 text-emerald-500"/>, status: t('not_connected', { defaultValue: 'غير متصل' }), desc: t('whatsapp_integration_desc', { defaultValue: 'إرسال إشعارات وتحديثات القضايا للموكلين آلياً.' }) },
        { id: 'moj', name: t('justice_portal_kuwait', { defaultValue: 'بوابة العدل (الكويت)' }), icon: <BuildingOffice2Icon className="w-8 h-8 text-amber-600"/>, status: t('connected_view_only', { defaultValue: 'متصل (عرض فقط)' }), desc: t('moj_integration_desc', { defaultValue: 'جلب بيانات القضايا والرول الآلي من البوابة الرسمية.' }) },
    ];

    return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-50/50 dark:bg-dm-background p-6 rounded-[24px] border border-gray-100 dark:border-gray-800">
            <div>
                <h4 className="font-black text-gray-900 dark:text-dm-text">مركز الربط الخارجي</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">تكامل النظام مع المنصات والخدمات السحابية الأخرى</p>
            </div>
            <Button variant="primary" className="rounded-xl px-6 font-black text-xs" leftIcon={<PlusCircleIcon className="w-4 h-4"/>} onClick={() => setIsAddModalOpen(true)}>إضافة ربط جديد</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map(item => (
                <Card key={item.id} className="rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group bg-white dark:bg-dm-card">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-[24px] group-hover:bg-white dark:group-hover:bg-dm-card transition-colors duration-500">
                            {item.icon}
                        </div>
                        <Badge text={item.status} variant={item.status.includes(t('connected', { defaultValue: 'متصل' })) ? 'success' : 'secondary'} size="sm" />
                    </div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-dm-text mb-2 tracking-tight">{item.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 leading-relaxed mb-6 uppercase tracking-widest">{item.desc}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl border-gray-100 dark:border-gray-800 text-gray-600 hover:text-indigo-600 hover:border-indigo-100 font-black">{item.status.includes(t('connected', { defaultValue: 'متصل' })) ? t('settings', { defaultValue: 'إعدادات' }) : t('link', { defaultValue: 'ربط' })}</Button>
                        {item.status.includes(t('connected', { defaultValue: 'متصل' })) && (
                            <button className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all" onClick={() => alert('تم إلغاء الربط بنجاح')}><TrashIcon className="w-5 h-5"/></button>
                        )}
                    </div>
                </Card>
            ))}
        </div>

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="إضافة خدمة ربط جديدة">
            <div className="space-y-6 p-4">
                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center">
                    <PuzzlePieceIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                    <h5 className="font-black text-indigo-900 mb-2">استكشف سوق الإضافات</h5>
                    <p className="text-xs text-indigo-700 font-medium leading-relaxed">يتوفر حالياً أكثر من 50 تطبيقاً جاهزاً للربط مع نظام عدالة.</p>
                </div>
                <Input label="ابحث عن خدمة (Google, Meta, Slack...)" placeholder="مثال: Dropbox" />
                <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-100 rounded-2xl flex items-center gap-3 hover:border-indigo-600 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><CloudArrowUpIcon className="w-5 h-5"/></div>
                        <span className="font-black text-xs text-gray-700">Dropbox</span>
                    </button>
                    <button className="p-4 border border-gray-100 rounded-2xl flex items-center gap-3 hover:border-indigo-600 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><EyeIcon className="w-5 h-5"/></div>
                        <span className="font-black text-xs text-gray-700">Skype</span>
                    </button>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>إغاء</Button>
                    <Button variant="primary" onClick={() => setIsAddModalOpen(false)}>إضافة وتفعيل</Button>
                </div>
            </div>
        </Modal>
    </div>
    );
};

const BillingSettings = () => {
    const { t } = useTranslation();
    return (
    <div className="space-y-8">
        <Card className="rounded-[32px] p-10 border-none shadow-lg bg-indigo-600 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                <div className="space-y-4 text-center lg:text-right">
                    <Badge text={t('current_plan', { defaultValue: 'الخطة الحالية' })} variant="warning" size="sm" className="bg-white/20 text-white border-white/30 font-black" />
                    <h3 className="text-4xl font-black tracking-tight">{t('enterprise_plan_name', { defaultValue: 'باقة التميز القانوني (Enterprise)' })}</h3>
                    <p className="text-indigo-100/70 text-sm font-bold uppercase tracking-widest leading-relaxed">{t('next_renewal_date', { defaultValue: 'تاريخ التجديد القادم: 12 ديسمبر 2024' })}</p>
                </div>
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl h-14 px-12 font-black shadow-xl shadow-black/10 transition-all">{t('upgrade_subscription', { defaultValue: 'ترقية الاشتراك' })}</Button>
                    <p className="text-[10px] text-center font-black text-white/50 uppercase tracking-widest">{t('change_anytime', { defaultValue: 'إمكانية التغيير في أي وقت' })}</p>
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm text-center space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-dm-background text-indigo-600 rounded-[24px] w-fit mx-auto"><UsersIcon className="w-8 h-8"/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('used_seats', { defaultValue: 'المقاعد المستخدمة' })}</p>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-2xl font-black inline-block text-indigo-600">3/10</span></div>
                        <div className="text-right font-black text-[10px] text-gray-400 uppercase">30%</div>
                    </div>
                    <div className="overflow-hidden h-2.5 mb-4 flex rounded-full bg-indigo-100 dark:bg-gray-800">
                        <div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 rounded-full"></div>
                    </div>
                </div>
            </Card>
            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm text-center space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-dm-background text-emerald-600 rounded-[24px] w-fit mx-auto"><CloudArrowUpIcon className="w-8 h-8"/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('storage_space', { defaultValue: 'مساحة التخزين' })}</p>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-2xl font-black inline-block text-emerald-600">12.5GB/50GB</span></div>
                        <div className="text-right font-black text-[10px] text-gray-400 uppercase">25%</div>
                    </div>
                    <div className="overflow-hidden h-2.5 mb-4 flex rounded-full bg-emerald-100 dark:bg-gray-800">
                        <div style={{ width: "25%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600 rounded-full"></div>
                    </div>
                </div>
            </Card>
            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-dm-background text-amber-600 rounded-xl"><ActivityIcon className="w-5 h-5"/></div>
                    <h4 className="font-black text-gray-800 dark:text-dm-text text-sm tracking-tight">{t('ai_consumption', { defaultValue: 'استهلاك الذكاء الاصطناعي' })}</h4>
                </div>
                <div className="space-y-4 font-bold text-[10px] uppercase tracking-widest text-gray-500">
                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-dm-background rounded-lg"><span>{t('contract_analysis', { defaultValue: 'تحليل عقود' })}</span> <span className="text-gray-900 dark:text-dm-text">45/200</span></div>
                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-dm-background rounded-lg"><span>{t('legal_translation', { defaultValue: 'ترجمة قانونية' })}</span> <span className="text-gray-900 dark:text-dm-text">12/∞</span></div>
                    <div className="flex justify-between p-2 bg-gray-50 dark:bg-dm-background rounded-lg"><span>{t('automated_search', { defaultValue: 'بحث آلي' })}</span> <span className="text-gray-900 dark:text-dm-text">890/5000</span></div>
                </div>
            </Card>
        </div>

        <Card className="rounded-[32px] p-0 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-dm-card">
            <div className="p-6 bg-gray-50 dark:bg-dm-background flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                <h4 className="text-lg font-black text-gray-900 dark:text-dm-text">{t('billing_history', { defaultValue: 'سجل الفواتير والدفعات' })}</h4>
                <button className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">{t('download_statement', { defaultValue: 'تحميل كشف الحساب' })}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                    <thead>
                        <tr className="bg-white dark:bg-dm-card font-black text-[10px] text-gray-400 tracking-widest uppercase border-b border-gray-50 dark:border-gray-800">
                            <th className="p-5">{t('invoice_no', { defaultValue: 'رقم الفاتورة' })}</th>
                            <th className="p-5">{t('date', { defaultValue: 'التاريخ' })}</th>
                            <th className="p-5">{t('amount', { defaultValue: 'قيمة الدفعة' })}</th>
                            <th className="p-5">{t('status', { defaultValue: 'الحالة' })}</th>
                            <th className="p-5 text-center">{t('document', { defaultValue: 'المستند' })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {[
                            { id: '#INV-8871', date: '2024/05/01', amount: '250.000 KWD', status: t('paid', { defaultValue: 'مدفوع' }) },
                            { id: '#INV-8742', date: '2024/04/10', amount: '250.000 KWD', status: t('paid', { defaultValue: 'مدفوع' }) },
                            { id: '#INV-8601', date: '2024/03/12', amount: '250.000 KWD', status: t('paid', { defaultValue: 'مدفوع' }) },
                        ].map(inv => (
                            <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-dm-background transition-colors">
                                <td className="p-5 font-mono font-bold text-gray-600 dark:text-gray-400">{inv.id}</td>
                                <td className="p-5 font-bold text-gray-400">{inv.date}</td>
                                <td className="p-5 font-black text-gray-900 dark:text-dm-text">{inv.amount}</td>
                                <td className="p-5"><Badge text={inv.status} variant="success" size="xs" /></td>
                                <td className="p-5 text-center"><button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><ArrowDownTrayIcon className="w-4 h-4"/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);
};

const DictionarySettings = () => {
    const categories = [
        { id: 'case_types', title: 'أنواع القضايا', icon: <BriefcaseIcon />, items: ['تجاري', 'جنائي', 'مدني', 'عمالي', 'إداري', 'أسرة'] },
        { id: 'court_levels', title: 'درجات المحاكم', icon: <BuildingLibraryIcon />, items: ['ابتدائي', 'استئناف', 'تمييز', 'كلية', 'جزئية'] },
        { id: 'payment_methods', title: 'طرق الدفع', icon: <CreditCardIcon />, items: ['نقدي', 'كي-نت', 'تحويل بنكي', 'شيك', 'رابط دفع'] },
        { id: 'expense_cats', title: 'تصنيفات المصاريف', icon: <BanknotesIcon />, items: ['رواتب', 'إيجار', 'أدوات مكتبية', 'رسوم قضائية', 'تسويق'] },
    ];

    const [activeCat, setActiveCat] = useState(categories[0]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-1 space-y-3">
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCat(cat)}
                        className={`w-full p-5 rounded-[28px] border transition-all flex items-center gap-4 text-right group ${activeCat.id === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white border-gray-100 hover:border-indigo-100 dark:bg-dm-card dark:border-gray-800'}`}
                    >
                        <div className={`p-3 rounded-2xl ${activeCat.id === cat.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-dm-background text-indigo-600'}`}>
                            {React.cloneElement(cat.icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
                        </div>
                        <div>
                            <p className={`text-sm font-black tracking-tight ${activeCat.id === cat.id ? 'text-white' : 'text-gray-900 dark:text-dm-text'}`}>{cat.title}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-widest ${activeCat.id === cat.id ? 'text-white/60' : 'text-gray-400'}`}>{cat.items.length} عنصر</p>
                        </div>
                    </button>
                ))}
            </div>
            
            <div className="lg:col-span-3">
                <Card className="p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card shadow-xl shadow-gray-100/50">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-dm-text tracking-tighter">{activeCat.title}</h3>
                            <p className="text-xs text-gray-400 font-medium">إدارة القائمة المنسدلة والخيارات المتاحة في النظام لـ {activeCat.title}.</p>
                        </div>
                        <Button variant="primary" size="sm" className="rounded-xl px-6 font-black" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>إضافة عنصر</Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCat.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-dm-background rounded-[24px] border border-gray-50 hover:border-indigo-100 transition-all group">
                                <span className="font-bold text-gray-900 dark:text-dm-text">{item}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all"><PencilIcon className="w-4 h-4"/></button>
                                    <button className="p-2 text-rose-500 hover:bg-white rounded-lg transition-all"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const UserForm = ({ initialData, onSave, onCancel }: any) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || UserRole.LAWYER,
        status: initialData.status || UserStatus.ACTIVE
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
            <Input label={t('employee_full_name', { defaultValue: 'اسم الموظف بالكامل' })} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="rounded-2xl bg-gray-50 border-none h-12" />
            <Input label={t('assigned_email', { defaultValue: 'البريد الإلكتروني المخصص' })} type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="rounded-2xl bg-gray-50 border-none h-12" />
            
            <div className="grid grid-cols-2 gap-4">
                <Select label={t('job_role', { defaultValue: 'الدور الوظيفي' })} options={userRoleOptions} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} containerClassName="mb-0" />
                <Select label={t('account_status', { defaultValue: 'حالة الحساب' })} options={userStatusOptions} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as UserStatus})} containerClassName="mb-0" />
            </div>

            <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100 flex gap-4">
                <InformationCircleIcon className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-[10px] font-bold text-amber-700 leading-relaxed">{t('invitation_sent_desc', { defaultValue: 'سيتم إرسال دعوة تلقائية وتعيين كلمة مرور مؤقتة عبر البريد الإلكتروني المدخل أعلاه.' })}</p>
            </div>

            <div className="pt-6 border-t flex justify-end gap-3">
                <Button variant="outline" onClick={onCancel} className="rounded-xl px-8 underline-offset-4">{t('cancel', { defaultValue: 'إلغاء' })}</Button>
                <Button type="submit" variant="primary" className="rounded-xl px-12 shadow-lg shadow-primary/20">{t('save_member', { defaultValue: 'حفظ العضو' })}</Button>
            </div>
        </form>
    );
};

export default SettingsPage;
