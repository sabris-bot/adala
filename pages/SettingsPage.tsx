import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useJurisdiction } from '../components/JurisdictionContext';
import { User, UserRole, UserStatus, RolePermissions, Permission } from '../types';
import { OFFICE_NAME } from '../constants';
import { useToast } from '../components/ui/Toast';

// Imported Sub-Components from /components/Settings/
import { OfficeSettings } from '../components/Settings/OfficeSettings';
import { AppearanceSettings } from '../components/Settings/AppearanceSettings';
import { CasesPrefixConfig } from '../components/Settings/CasesPrefixConfig';
import { UserManagement } from '../components/Settings/UserManagement';
import { RolePermissionsSettings } from '../components/Settings/RolePermissionsSettings';
import { SecuritySettings } from '../components/Settings/SecuritySettings';
import { IntegrationsSettings } from '../components/Settings/IntegrationsSettings';
import { DictionarySettings } from '../components/Settings/DictionarySettings';
import { LocalizationSettings } from '../components/Settings/LocalizationSettings';
import { CommunicationSettings } from '../components/Settings/CommunicationSettings';
import { BillingSettings } from '../components/Settings/BillingSettings';
import { SystemAuditLogs } from '../components/Settings/SystemAuditLogs';
import { AdvancedAutomationSettings } from '../components/Settings/AdvancedAutomationSettings';
import { UserFormModal } from '../components/Settings/UserFormModal';

// Icons
import {
  BuildingOffice2Icon,
  UsersIcon,
  LockClosedIcon,
  AdjustmentsHorizontalIcon,
  BellAlertIcon,
  PuzzlePieceIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ActivityIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  KeyIcon,
} from '../constants';
import { Save, Search, Sparkles, RefreshCw } from 'lucide-react';

const defaultMockUsers: User[] = [
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

const initialAuditLogs = [
  { id: 'log-1', section: 'security', action: 'تغيير صلاحيات دور "محامي النطاق"', user: 'أحمد محمود', time: 'منذ ساعتين', details: 'تحديث ميزات الصرف والربط الآلي للمحكمة' },
  { id: 'log-2', section: 'users', action: 'إنشاء حساب مستخدم جديد: فاطمة علي', user: 'أحمد محمود', time: 'منذ 5 ساعات', details: 'منح رتبة محامي مفوض وتوطين نظام i18n' },
  { id: 'log-3', section: 'system', action: 'تعديل بادئة ترقيم القضايا التلقائي', user: 'أحمد محمود', time: 'أمس الساعة 10:30 صباحاً', details: 'تعديل التنسيق إلى ADALA-[YEAR]-[SERIAL]' },
  { id: 'log-4', section: 'database', action: 'نسخ احتياطي مجدول وقائي', user: 'النظام المستجيب', time: 'أمس الساعة 4:15 مساءً', details: 'ضغط قاعدة البيانات وحفظ الملف مشفر السيرفر' },
  { id: 'log-5', section: 'integrations', action: 'مزامنة رول بوابة العدل الكويتية', user: 'محاكي الربط الحكومي', time: 'أمس الساعة 9:00 مساءً', details: 'جلب 3 جلسات جديدة لـ قصر العدل' },
];

interface SettingsPageProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ toggleDarkMode, isDarkMode }) => {
  const { addToast } = useToast();
  const { selectedJurisdiction, setJurisdiction, availableJurisdictions } = useJurisdiction();

  const [activeTab, setActiveTab] = useState('office');
  const [isSaving, setIsSaving] = useState(false);
  const [tabSearchQuery, setTabSearchQuery] = useState('');

  // Persisted state
  const [officeInfo, setOfficeInfo] = useState(() => {
    const saved = localStorage.getItem('adala_office_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: OFFICE_NAME || 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية',
      license: 'ADV-2024-9981',
      unifiedId: '7766554433',
      address: 'مدينة الكويت، شرق، برج الراية، الدور 45',
      phone: '+965 2244 8877',
      email: 'info@shatta-law.com',
      website: 'www.shatta-law.com',
      description: 'مؤسسة قانونية رائدة متخصصة في القضايا التجارية والمدنية والتحكيم الدولي ومحاكم الاستئناف والتمييز.',
    };
  });

  const [brandAccent, setBrandAccent] = useState(() => {
    return localStorage.getItem('adala_brand_accent') || 'indigo';
  });

  const [casesConfig, setCasesConfig] = useState(() => {
    const saved = localStorage.getItem('adala_cases_prefix_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      prefix: 'ADALA',
      separator: '-',
      includeYear: true,
      startNumber: '1001',
      autoAssignLawyer: 'lawyer_role',
      hearingsAdvanceHours: '24',
      autoClassify: true,
    };
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('adala_users_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return defaultMockUsers;
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => {
    const saved = localStorage.getItem('adala_role_permissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialRolePermissions;
  });

  const [dictionaries, setDictionaries] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('adala_dictionaries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      case_types: ['تجاري', 'جنائي', 'مدني', 'عمالي', 'إداري', 'أسرة'],
      court_levels: ['ابتدائي', 'استئناف', 'تمييز', 'كلية', 'جزئية'],
      payment_methods: ['نقدي', 'كي-نت', 'تحويل بنكي', 'شيك', 'رابط دفع'],
      expense_cats: ['رواتب', 'إيجار', 'أدوات مكتبية', 'رسوم قضائية', 'تسويق'],
    };
  });

  const [prefSettings, setPrefSettings] = useState(() => {
    const saved = localStorage.getItem('adala_system_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      lang: 'ar',
      autoSave: true,
      smartSuggestions: true,
      aiTemperature: 0.7,
      currency: 'KWD',
      dateFormat: 'DD/MM/YYYY',
    };
  });

  const [securityPrefs, setSecurityPrefs] = useState(() => {
    const saved = localStorage.getItem('adala_security_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      minLength: '8',
      requireSpecialChars: true,
      twoFactorEnabled: false,
    };
  });

  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem('adala_notification_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      emailOverdueTasks: true,
      emailUrgentHearings: true,
      whatsappDailySummary: false,
      smsCriticalAlerts: true,
    };
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('adala_audit_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return initialAuditLogs;
  });

  // User modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const getAccentClasses = () => {
    switch (brandAccent) {
      case 'gold':
        return { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', hoverBg: 'hover:bg-amber-700', ring: 'focus:ring-amber-500/20', bgLight: 'bg-amber-50 dark:bg-amber-950/20' };
      case 'emerald':
        return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', hoverBg: 'hover:bg-emerald-700', ring: 'focus:ring-emerald-500/20', bgLight: 'bg-emerald-50 dark:bg-emerald-950/20' };
      case 'rose':
        return { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', hoverBg: 'hover:bg-rose-700', ring: 'focus:ring-rose-500/20', bgLight: 'bg-rose-50 dark:bg-rose-950/20' };
      case 'blue':
        return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-600', hoverBg: 'hover:bg-blue-700', ring: 'focus:ring-blue-500/20', bgLight: 'bg-blue-50 dark:bg-blue-950/20' };
      case 'purple':
        return { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', hoverBg: 'hover:bg-purple-700', ring: 'focus:ring-purple-500/20', bgLight: 'bg-purple-50 dark:bg-purple-950/20' };
      default:
        return { bg: 'bg-indigo-600', text: 'text-indigo-600', border: 'border-indigo-600', hoverBg: 'hover:bg-indigo-700', ring: 'focus:ring-indigo-500/20', bgLight: 'bg-indigo-50 dark:bg-indigo-950/20' };
    }
  };

  const accent = getAccentClasses();

  const handleSaveAllSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    localStorage.setItem('adala_office_settings', JSON.stringify(officeInfo));
    localStorage.setItem('adala_brand_accent', brandAccent);
    localStorage.setItem('adala_cases_prefix_config', JSON.stringify(casesConfig));
    localStorage.setItem('adala_users_list', JSON.stringify(users));
    localStorage.setItem('adala_role_permissions', JSON.stringify(rolePermissions));
    localStorage.setItem('adala_dictionaries', JSON.stringify(dictionaries));
    localStorage.setItem('adala_system_preferences', JSON.stringify(prefSettings));
    localStorage.setItem('adala_security_preferences', JSON.stringify(securityPrefs));
    localStorage.setItem('adala_notification_preferences', JSON.stringify(notifPrefs));
    localStorage.setItem('adala_audit_logs', JSON.stringify(auditLogs));

    setIsSaving(false);
    addToast({
      type: 'success',
      title: 'تم حفظ مركز الإعدادات',
      message: 'تم حفظ كافة التفضيلات والتحديثات بنجاح للمنظومة.',
    });

    const logEntry = {
      id: `log-${Date.now()}`,
      section: 'system',
      action: 'حفظ شامل وتحديث التفضيلات العامة',
      user: 'أحمد محمود',
      time: 'الآن',
      details: `تحديث الهوية للون [${brandAccent}] وحفظ ترميز القضايا والتكاملات.`,
    };
    setAuditLogs((prev) => [logEntry, ...prev]);
  };

  const tabGroups = [
    {
      title: 'الهوية والمنشأة',
      items: [
        { id: 'office', label: 'ملف المنشأة', desc: 'الشعار والترخيص الموثق', icon: <BuildingOffice2Icon className="w-5 h-5" /> },
        { id: 'appearance', label: 'السمة والألوان', desc: 'السمة البصرية والهوية', icon: <Sparkles className="w-5 h-5" /> },
      ],
    },
    {
      title: 'الفريق والصلاحيات',
      items: [
        { id: 'users', label: 'مقاعد الفريق', desc: 'المستخدمين والأدوار', icon: <UsersIcon className="w-5 h-5" /> },
        { id: 'roles', label: 'مصفوفة الصلاحيات', desc: 'توزيع أدوار RBAC', icon: <LockClosedIcon className="w-5 h-5" /> },
        { id: 'security', label: 'الأمان والمصادقة', desc: 'تأمين الجلسات و 2FA', icon: <ShieldCheckIcon className="w-5 h-5" /> },
      ],
    },
    {
      title: 'التكاملات والذكاء',
      items: [
        { id: 'automation', label: 'إعدادات الأتمتة المتقدمة', desc: 'قواعد التنبيهات ومخاطر المستأجرين والقوالب', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
        { id: 'cases', label: 'ترقيم القضايا', desc: 'تسلسلات الترقيم الآلي', icon: <AdjustmentsHorizontalIcon className="w-5 h-5" /> },
        { id: 'integrations', label: 'بوابة العدل', desc: 'الربط الحكومي و Scraper', icon: <PuzzlePieceIcon className="w-5 h-5" /> },
        { id: 'communication', label: 'المراسلات', desc: 'الإشعارات وقوالب الرسائل', icon: <BellAlertIcon className="w-5 h-5" /> },
        { id: 'dictionaries', label: 'قواميس النظام', desc: 'المصطلحات والقوائم', icon: <KeyIcon className="w-5 h-5" /> },
        { id: 'localization', label: 'توطين i18n', desc: 'محرك اللغات والترجمة', icon: <GlobeAltIcon className="w-5 h-5" /> },
      ],
    },
    {
      title: 'المالية والتدقيق',
      items: [
        { id: 'billing', label: 'الترخيص والذكاء', desc: 'الباقة واستهلاك AI', icon: <CreditCardIcon className="w-5 h-5" /> },
        { id: 'audit', label: 'سجلات التدقيق', desc: 'دفتر الحصانة والسلامة', icon: <ActivityIcon className="w-5 h-5" /> },
      ],
    },
  ];

  // User management actions
  const handleSaveUser = (userData: any) => {
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)));
      addToast({ type: 'success', title: 'تم تعديل المستخدم', message: `تم تحديث بيانات ${userData.name} بنجاح.` });
    } else {
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      };
      setUsers([...users, newUser]);
      addToast({ type: 'success', title: 'تم إدراج المستخدم', message: `تمت إضافة ${userData.name} لفريق العمل.` });
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم من المنظومة؟')) {
      setUsers(users.filter((u) => u.id !== id));
      addToast({ type: 'info', title: 'تم الحذف', message: 'تم إزالة المستخدم وإخلاء المقعد.' });
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-50 dark:bg-dm-card text-indigo-600 dark:text-indigo-400 rounded-2xl shadow-sm">
              <AdjustmentsHorizontalIcon className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-dm-text tracking-tight">إعدادات وتهيئـة المنظومة</h1>
                <Badge text="الإصدار الموحد v4.2" variant="primary" size="xs" />
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-1">
                تخصيص الهوية القانونية، الصلاحيات، التكامل مع بوابة العدل، والأمان المباشر
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs font-bold">
            <CheckCircleIcon className="w-4 h-4 shrink-0" />
            <span>المنظومة آمنة ومتصلة 100%</span>
          </div>

          <Button
            variant="primary"
            onClick={handleSaveAllSettings}
            disabled={isSaving}
            className={`rounded-2xl px-8 h-12 font-bold shadow-lg transition-all ${accent.bg} ${accent.hoverBg}`}
            leftIcon={isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>

      {/* QUICK STATUS OVERVIEW KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-dm-card border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">المنشأة القانونية</span>
            <span className="text-sm font-black text-slate-900 dark:text-dm-text truncate block mt-0.5 max-w-[160px]">{officeInfo.name}</span>
          </div>
          <div className="p-2.5 bg-indigo-50 dark:bg-dm-background text-indigo-600 rounded-xl">⚖️</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-dm-card border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">مقاعد الفريق المستهلكة</span>
            <span className="text-sm font-black text-slate-900 dark:text-dm-text block mt-0.5">{users.length} / 10 مقاعد</span>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-dm-background text-emerald-600 rounded-xl">👥</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-dm-card border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ترقيم القضية المولد</span>
            <span className="text-sm font-mono font-black text-indigo-600 block mt-0.5">{casesConfig.prefix}-{casesConfig.startNumber}</span>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-dm-background text-amber-600 rounded-xl">🏷️</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-dm-card border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">بوابة العدل الكويتية</span>
            <span className="text-sm font-black text-emerald-600 block mt-0.5">ربط سحابي نشط</span>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-dm-background text-blue-600 rounded-xl">🏛️</div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN SETTINGS NAVIGATION & CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SIDEBAR TABS (4 COLS) */}
        <div className="lg:col-span-4 bg-white dark:bg-dm-card rounded-[32px] p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 sticky top-6">
          {/* TAB SEARCH BAR */}
          <div className="relative">
            <input
              type="text"
              placeholder="تصفية وسرعة البحث بالإعدادات..."
              value={tabSearchQuery}
              onChange={(e) => setTabSearchQuery(e.target.value)}
              className="w-full h-11 pr-10 pl-4 bg-slate-50 dark:bg-dm-background rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          <div className="space-y-6 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {tabGroups.map((group) => {
              const matchingItems = group.items.filter(
                (item) => item.label.includes(tabSearchQuery) || item.desc.includes(tabSearchQuery)
              );

              if (matchingItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
                    {group.title}
                  </span>
                  <div className="space-y-1.5">
                    {matchingItems.map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full p-3.5 rounded-2xl text-right flex items-center justify-between transition-all group ${
                            isActive
                              ? `${accent.bg} text-white shadow-md shadow-indigo-500/10`
                              : 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dm-background'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-xl shrink-0 transition-colors ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-100 dark:bg-dm-background text-slate-500 group-hover:text-indigo-600'
                              }`}
                            >
                              {item.icon}
                            </div>
                            <div className="min-w-0">
                              <span className={`text-xs font-bold block truncate ${isActive ? 'text-white' : 'text-slate-900 dark:text-dm-text'}`}>
                                {item.label}
                              </span>
                              <span className={`text-[10px] block truncate font-medium ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                                {item.desc}
                              </span>
                            </div>
                          </div>
                          {isActive && <div className="w-1.5 h-6 rounded-full bg-white shadow-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE PANEL CONTENT (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'office' && <OfficeSettings info={officeInfo} setInfo={setOfficeInfo} accent={accent} />}

              {activeTab === 'appearance' && (
                <AppearanceSettings
                  brandAccent={brandAccent}
                  setBrandAccent={setBrandAccent}
                  prefSettings={prefSettings}
                  setPrefSettings={setPrefSettings}
                  toggleDarkMode={toggleDarkMode}
                  isDarkMode={isDarkMode}
                  accent={accent}
                  officeName={officeInfo.name}
                  license={officeInfo.license}
                />
              )}

              {activeTab === 'cases' && <CasesPrefixConfig config={casesConfig} setConfig={setCasesConfig} accent={accent} users={users} />}

              {activeTab === 'users' && (
                <UserManagement
                  users={users}
                  accent={accent}
                  onAdd={() => {
                    setEditingUser(null);
                    setIsUserModalOpen(true);
                  }}
                  onEdit={(usr) => {
                    setEditingUser(usr);
                    setIsUserModalOpen(true);
                  }}
                  onDelete={handleDeleteUser}
                />
              )}

              {activeTab === 'roles' && (
                <RolePermissionsSettings permissions={rolePermissions} setPermissions={setRolePermissions} accent={accent} />
              )}

              {activeTab === 'security' && <SecuritySettings prefs={securityPrefs} setPrefs={setSecurityPrefs} accent={accent} />}

              {activeTab === 'integrations' && <IntegrationsSettings accent={accent} addToast={addToast} />}

              {activeTab === 'automation' && <AdvancedAutomationSettings accent={accent} addToast={addToast} />}

              {activeTab === 'communication' && (
                <CommunicationSettings notifPrefs={notifPrefs} setNotifPrefs={setNotifPrefs} accent={accent} addToast={addToast} />
              )}

              {activeTab === 'dictionaries' && (
                <DictionarySettings dictionaries={dictionaries} onChange={setDictionaries} accent={accent} />
              )}

              {activeTab === 'localization' && <LocalizationSettings />}

              {activeTab === 'billing' && <BillingSettings accent={accent} />}

              {activeTab === 'audit' && <SystemAuditLogs logs={auditLogs} setLogs={setAuditLogs} accent={accent} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* USER CREATION / EDITING MODAL */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? `تعديل بيانات المستخدم: ${editingUser.name}` : 'إضافة عضو جديد بـ فريق العمل'}
      >
        <UserFormModal
          initialData={editingUser || {}}
          onSave={handleSaveUser}
          onCancel={() => {
            setIsUserModalOpen(false);
            setEditingUser(null);
          }}
          accent={accent}
        />
      </Modal>
    </div>
  );
};

export default SettingsPage;
