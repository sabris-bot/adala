import React, { useState, useMemo, useEffect } from 'react';
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
    ArrowDownTrayIcon, ShieldCheckIcon, EyeIcon,
    InformationCircleIcon, ActivityIcon, SparklesIcon,
    CheckBadgeIcon, GlobeAltIcon, MapPinIcon, PhoneIcon,
    EnvelopeIcon, OFFICE_NAME
} from '../constants';

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

const SettingsPage: React.FC<SettingsPageProps> = ({ toggleDarkMode, isDarkMode }) => {
    const { t, i18n } = useTranslation();
    const { selectedJurisdiction, setJurisdiction, availableJurisdictions } = useJurisdiction();
    const [activeTab, setActiveTab] = useState('office');
    
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

    const handleLanguageChange = (e: any) => {
        const newLang = e.target.value;
        setPrefs({ ...prefs, lang: newLang });
        i18n.changeLanguage(newLang);
    };

    const [securityPrefs, setSecurityPrefs] = useState({
        minLength: '8',
        requireSpecialChars: true,
        twoFactorEnabled: false
    });

    const tabs = [
        { id: 'office', label: t('office_profile', { defaultValue: 'ملف المكتب' }), icon: <BuildingOffice2Icon className="w-5 h-5"/> },
        { id: 'users', label: t('users', { defaultValue: 'المستخدمين' }), icon: <UsersIcon className="w-5 h-5"/> },
        { id: 'roles', label: t('roles', { defaultValue: 'الصلاحيات' }), icon: <ShieldCheckIcon className="w-5 h-5"/> },
        { id: 'prefs', label: t('preferences', { defaultValue: 'التفضيلات' }), icon: <AdjustmentsHorizontalIcon className="w-5 h-5"/> },
        { id: 'security', label: t('security', { defaultValue: 'الأمان' }), icon: <LockClosedIcon className="w-5 h-5"/> },
        { id: 'integrations', label: t('integrations', { defaultValue: 'الارتباطات' }), icon: <PuzzlePieceIcon className="w-5 h-5"/> },
        { id: 'billing', label: t('billing', { defaultValue: 'الاشتراك' }), icon: <BanknotesIcon className="w-5 h-5"/> },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'office': return <OfficeSettings info={officeInfo} setInfo={setOfficeInfo} />;
            case 'users': return <UserManagement users={users} onAdd={() => { setEditingUser(null); setIsUserModalOpen(true); }} onEdit={(u) => { setEditingUser(u); setIsUserModalOpen(true); }} onDelete={(id) => setUsers(prev => prev.filter(u => u.id !== id))} />;
            case 'roles': return <RolePermissionsSettings permissions={rolePermissions} setPermissions={setRolePermissions} />;
            case 'prefs': return <SystemPreferences prefs={prefs} setPrefs={setPrefs} handleLanguageChange={handleLanguageChange} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} selectedJurisdiction={selectedJurisdiction} setJurisdiction={setJurisdiction} availableJurisdictions={availableJurisdictions} />;
            case 'security': return <SecuritySettings prefs={securityPrefs} setPrefs={setSecurityPrefs} />;
            case 'integrations': return <IntegrationsSettings />;
            case 'billing': return <BillingSettings />;
            default: return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter dark:text-dm-text">{t('settings', { defaultValue: 'الإعدادات والتهيئة' })}</h1>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2">
                        <CogIcon className="w-3 h-3"/> {t('settings_instructions', { defaultValue: 'إدارة النظام، المستخدمين، وتخصيص بيئة العمل القانونية' })}
                    </p>
                </div>
                <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-xs font-black text-emerald-700">النظام يعمل بكفاءة 100%</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-72 shrink-0 space-y-4">
                    <div className="bg-white dark:bg-dm-card rounded-[32px] p-2 shadow-xl shadow-gray-100/50 border border-gray-50 flex flex-col">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-102 z-10' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="active-indicator" className="ms-auto w-1.5 h-1.5 bg-white rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    <Card className="rounded-[32px] p-6 border-none bg-gradient-to-br from-gray-900 to-indigo-950 text-white overflow-hidden relative">
                        <SparklesIcon className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5" />
                        <div className="relative z-10">
                            <h4 className="font-black text-sm mb-2 text-indigo-200">{t('backup', { defaultValue: 'النسخ الاحتياطي' })}</h4>
                            <p className="text-[10px] text-indigo-100/70 leading-relaxed mb-4">{t('backup_desc', { defaultValue: 'يتم حفظ نسخة احتياطية من كافة البيانات بانتظام في خوادم مشفرة.' })}</p>
                            <Button variant="outline" size="sm" className="w-full border-white/20 hover:bg-white/10 text-white rounded-xl h-10 text-[10px]">{t('start_manual_backup', { defaultValue: 'بدأ نسخ يدوي الآن' })}</Button>
                        </div>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Audit Log Overlay (optional) or section */}
            <div className="mt-12">
                <Card className="rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
                    <div className="p-8 border-b bg-gray-50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <ActivityIcon className="w-6 h-6 text-gray-400" />
                            <h3 className="text-xl font-black text-gray-900">{t('admin_activity_log', { defaultValue: 'سجل النشاطات الإدارية' })}</h3>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary">{t('view_full_log', { defaultValue: 'عرض السجل الكامل' })}</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <tbody className="divide-y divide-gray-50">
                                {mockAuditLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl bg-gray-100 ${
                                                    log.type === 'security' ? 'text-rose-600 bg-rose-50' :
                                                    log.type === 'user' ? 'text-indigo-600 bg-indigo-50' :
                                                    'text-amber-600 bg-amber-50'
                                                }`}>
                                                    <CogIcon className="w-4 h-4"/>
                                                </div>
                                                <p className="font-bold text-gray-800">{log.action}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-xs font-bold text-gray-400">{log.user}</td>
                                        <td className="p-4 text-xs font-mono font-bold text-gray-400">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
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

const OfficeSettings = ({ info, setInfo }: any) => {
    const { t } = useTranslation();
    return (
    <div className="space-y-6">
        <Card className="rounded-[40px] p-8 border-none shadow-2xl space-y-8">
            <div className="flex items-center gap-6 pb-8 border-b">
                <div className="w-24 h-24 rounded-3xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all cursor-pointer group relative overflow-hidden">
                    <CloudArrowUpIcon className="w-8 h-8"/>
                    <span className="text-[10px] font-black mt-1">{t('change_logo', { defaultValue: 'تغيير الشعار' })}</span>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">{info.name}</h3>
                    <p className="text-gray-400 text-xs font-bold mt-1">{t('license_number', { defaultValue: 'رقم الترخيص' })}: {info.license}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <Input label={t('legal_entity_name', { defaultValue: 'اسم المنشأة القانونية' })} value={info.name} onChange={e => setInfo({...info, name: e.target.value})} className="rounded-2xl bg-gray-50 border-none h-12" />
                <Input label={t('unified_id', { defaultValue: 'الرقم الموحد للجهة' })} value={info.unifiedId} onChange={e => setInfo({...info, unifiedId: e.target.value})} className="rounded-2xl bg-gray-50 border-none h-12" />
                <Input label={t('professional_license_no', { defaultValue: 'رقم الترخيص المهني' })} value={info.license} onChange={e => setInfo({...info, license: e.target.value})} className="rounded-2xl bg-gray-50 border-none h-12" />
                <Input label={t('official_email', { defaultValue: 'البريد الإلكتروني الرسمي' })} value={info.email} onChange={e => setInfo({...info, email: e.target.value})} className="rounded-2xl bg-gray-50 border-none h-12" />
                <Input label={t('office_phone', { defaultValue: 'رقم هاتف المكتب' })} value={info.phone} onChange={e => setInfo({...info, phone: e.target.value})} className="rounded-2xl bg-gray-50 border-none h-12" />
                <Input label={t('website', { defaultValue: 'الموقع الإلكتروني' })} value={info.website} onChange={e => setInfo({...info, website: e.target.value})} className="rounded-2xl bg-gray-50 border-none h-12" />
                <div className="md:col-span-2">
                    <Input label={t('main_office_address', { defaultValue: 'عنوان المقر الرئيسي' })} value={info.address} onChange={e => setInfo({...info, address: e.target.value})} className="rounded-2xl bg-gray-50 border-none h-12" />
                </div>
                <div className="md:col-span-2">
                    <TextArea label={t('office_description', { defaultValue: 'وصف تعريفي للمكتب' })} value={info.description} onChange={e => setInfo({...info, description: e.target.value})} className="rounded-2xl bg-gray-50 border-none" rows={3} />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Button variant="primary" className="px-12 rounded-2xl h-12 shadow-xl shadow-primary/20">{t('save_changes', { defaultValue: 'حفظ التغييرات' })}</Button>
            </div>
        </Card>
    </div>
    );
};

const UserManagement = ({ users, onAdd, onEdit, onDelete }: any) => {
    const { t } = useTranslation();
    return (
    <Card className="rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-8 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h3 className="text-xl font-black text-gray-900">{t('team_management', { defaultValue: 'إدارة فريق العمل' })}</h3>
                <p className="text-xs font-bold text-gray-400 mt-1">{t('active_users_count', { defaultValue: 'لديك {{count}} مستخدم نشط من أصل 10 مقاعد', count: users.length })}</p>
            </div>
            <Button variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>} className="px-8 rounded-2xl h-12" onClick={onAdd}>{t('add_new_member', { defaultValue: 'إضافة عضو جديد' })}</Button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
                <thead>
                    <tr className="bg-gray-50 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                        <th className="p-6">{t('member', { defaultValue: 'العضو' })}</th>
                        <th className="p-6">{t('role', { defaultValue: 'الدور' })}</th>
                        <th className="p-6">{t('status', { defaultValue: 'الحالة' })}</th>
                        <th className="p-6">{t('actions', { defaultValue: 'إجراءات' })}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {users.map((user: User) => (
                        <tr key={user.id} className="hover:bg-gray-50 inner-shadow transition-colors group">
                            <td className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-xs uppercase">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 group-hover:text-primary transition-colors">{user.name}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6"><UserRoleBadge role={user.role} /></td>
                            <td className="p-6"><UserStatusBadge status={user.status} /></td>
                            <td className="p-6">
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="p-2 rounded-xl text-amber-600 hover:bg-amber-50" onClick={() => onEdit(user)}><PencilIcon className="w-4 h-4"/></Button>
                                    <Button variant="ghost" size="sm" className="p-2 rounded-xl text-rose-600 hover:bg-rose-50" onClick={() => onDelete(user.id)}><TrashIcon className="w-4 h-4"/></Button>
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
        <Card className="rounded-[40px] p-0 overflow-hidden border-none shadow-2xl">
            <div className="p-8 border-b bg-white">
                <h3 className="text-xl font-black text-gray-900 mb-2">{t('permissions_matrix_rbac', { defaultValue: 'مصفوفة الصلاحيات (RBAC)' })}</h3>
                <p className="text-xs text-gray-400 font-bold max-w-xl leading-relaxed">{t('rbac_description', { defaultValue: 'تحكم بدقة في ميزات النظام التي يمكن لكل مجموعة من المستخدمين الوصول إليها. الأدوار المشرفة لديها صلاحيات كاملة افتراضياً.' })}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-6 font-black text-gray-400 uppercase tracking-widest text-[10px] min-w-[250px]">{t('system_features', { defaultValue: 'ميزات النظام' })}</th>
                            {userRoleOptions.map(role => (
                                <th key={role.value} className="p-6 font-black text-gray-900 border-x border-gray-100 whitespace-nowrap">{role.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {permissionGroups.map(group => (
                            <React.Fragment key={group.title}>
                                <tr className="bg-gray-100/30">
                                    <td colSpan={userRoleOptions.length + 1} className="p-4 font-black uppercase text-[10px] tracking-widest text-primary border-b border-gray-100">{group.title}</td>
                                </tr>
                                {group.permissions.map(perm => (
                                    <tr key={perm.value} className="hover:bg-gray-50 border-b border-gray-50">
                                        <td className="p-6">
                                            <p className="font-black text-gray-800 text-sm">{perm.label}</p>
                                            <p className="text-[10px] text-gray-400 font-bold mt-0.5">{perm.description}</p>
                                        </td>
                                        {userRoleOptions.map(roleOption => {
                                            const role = roleOption.value as UserRole;
                                            const isChecked = permissions[role]?.includes(perm.value);
                                            const isAdmin = role === UserRole.ADMIN;
                                            return (
                                                <td key={`${role}-${perm.value}`} className="p-6 text-center border-x border-gray-50 align-middle">
                                                    <input 
                                                        type="checkbox" 
                                                        className={`w-6 h-6 rounded-lg text-primary border-gray-300 focus:ring-primary/20 ${isAdmin ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
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
            <div className="p-8 bg-gray-50 flex justify-end">
                <Button variant="primary" className="px-12 rounded-2xl h-12 shadow-xl shadow-primary/20">{t('save_all_permissions', { defaultValue: 'حفظ كافة الصلاحيات' })}</Button>
            </div>
        </Card>
    );
};

const SystemPreferences = ({ prefs, setPrefs, handleLanguageChange, toggleDarkMode, isDarkMode, selectedJurisdiction, setJurisdiction, availableJurisdictions }: any) => {
    const { t } = useTranslation();
    return (
    <Card className="rounded-[40px] p-8 border-none shadow-2xl space-y-8">
        <h3 className="text-xl font-black text-gray-900 border-r-4 border-primary pr-4 dark:text-dm-text">{t('ui_preferences', { defaultValue: 'تفضيلات واجهة المستخدم' })}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Select 
                label={t('jurisdiction_country', { defaultValue: "الدولة والنطاق القانوني" })} 
                options={availableJurisdictions.map((j: any) => ({value: j.code, label: `${j.flag} ${j.name}`}))} 
                value={selectedJurisdiction.code} 
                onChange={(e: any) => setJurisdiction(e.target.value as CountryCode)}
                containerClassName="mb-0"
            />
            <Select 
                label={t('system_language', { defaultValue: "لغة واجهة النظام" })} 
                options={[
                    {value: 'ar', label: t('arabic', { defaultValue: 'العربية (موصى بها)' })}, 
                    {value: 'en', label: t('english', { defaultValue: 'English' })}
                ]} 
                value={prefs.lang} 
                onChange={handleLanguageChange}
                containerClassName="mb-0"
            />
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{t('app_appearance', { defaultValue: 'مظهر التطبيق' })}</label>
                <div className="flex bg-gray-100 p-1 rounded-2xl h-12 dark:bg-dm-background">
                    <button onClick={() => isDarkMode && toggleDarkMode()} className={`flex-1 rounded-xl text-xs font-black transition-all ${!isDarkMode ? 'bg-white shadow text-primary' : 'text-gray-400'}`}>{t('light_mode', { defaultValue: 'فاتح (Light)' })}</button>
                    <button onClick={() => !isDarkMode && toggleDarkMode()} className={`flex-1 rounded-xl text-xs font-black transition-all ${isDarkMode ? 'bg-gray-800 shadow text-white' : 'text-gray-400'}`}>{t('dark_mode', { defaultValue: 'داكن (Dark)' })}</button>
                </div>
            </div>
            <Select 
                label={t('default_currency', { defaultValue: "العملة الافتراضية" })} 
                options={availableJurisdictions.map((j: any) => ({value: j.currencyCode, label: `${j.currencyNameAr} (${j.currencyCode})`}))} 
                value={prefs.currency} 
                onChange={e => setPrefs({...prefs, currency: e.target.value})}
                containerClassName="mb-0"
            />
            <Select 
                label={t('date_format', { defaultValue: "تنسيق التاريخ" })} 
                options={[{value: 'DD/MM/YYYY', label: 'DD/MM/YYYY'}, {value: 'YYYY-MM-DD', label: 'YYYY-MM-DD'}]} 
                value={prefs.dateFormat} 
                onChange={e => setPrefs({...prefs, dateFormat: e.target.value})}
                containerClassName="mb-0"
            />
        </div>

        <div className="pt-8 border-t space-y-6 dark:border-gray-700">
            <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest dark:text-dm-text">{t('smart_features', { defaultValue: 'ميزات ذكية وتلقائية' })}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { id: 'autoSave', label: t('auto_save', { defaultValue: 'الحفظ التلقائي للبيانات' }), desc: t('auto_save_desc', { defaultValue: 'حفظ المسودات والعقود تلقائياً أثناء الكتابة' }) },
                    { id: 'smartSuggestions', label: t('smart_suggestions', { defaultValue: 'اقتراحات الذكاء الاصطناعي' }), desc: t('smart_suggestions_desc', { defaultValue: 'تفعيل المساعد الذكي لتقديم نصائح عند إدخال البيانات' }) },
                ].map(item => (
                    <div key={item.id} className="flex items-start gap-4 p-4 rounded-3xl bg-gray-50 dark:bg-dm-background">
                        <input 
                            type="checkbox" 
                            className="mt-1 w-6 h-6 rounded-lg text-primary border-gray-300 focus:ring-primary/20" 
                            checked={(prefs as any)[item.id]} 
                            onChange={e => setPrefs({...prefs, [item.id]: e.target.checked})}
                        />
                        <div>
                            <p className="font-black text-sm text-gray-800 dark:text-dm-text">{item.label}</p>
                            <p className="text-[10px] font-bold text-gray-400">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Card>
);
};

const SecuritySettings = ({ prefs, setPrefs }: any) => {
    const { t } = useTranslation();
    return (
    <div className="space-y-6">
        <Card className="rounded-[40px] p-8 border-none shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <ShieldCheckIcon className="w-6 h-6"/>
                </div>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">{t('login_account_protection', { defaultValue: 'حماية الدخول والحسابات' })}</h3>
            </div>

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-[32px] bg-indigo-50 border border-indigo-100">
                    <div className="flex gap-4">
                        <div className="p-3 bg-white rounded-2xl text-indigo-600 shrink-0 h-fit">
                            <LockClosedIcon className="w-6 h-6"/>
                        </div>
                        <div>
                            <p className="font-black text-indigo-900">{t('two_factor_auth_full', { defaultValue: 'المصادقة الثنائية (2FA)' })}</p>
                            <p className="text-[10px] font-bold text-indigo-500 leading-relaxed max-w-sm mt-1">{t('two_factor_auth_desc_detailed', { defaultValue: 'أضف طبقة حماية إضافية لحسابك من خلال ربطه بتطبيق Google Authenticator أو إرسال رمز التحقق لهاتفك.' })}</p>
                        </div>
                    </div>
                    <Button 
                        variant="primary" 
                        className={`rounded-2xl px-8 h-12 h-fit whitespace-nowrap ${prefs.twoFactorEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        onClick={() => setPrefs({...prefs, twoFactorEnabled: !prefs.twoFactorEnabled})}
                    >
                        {prefs.twoFactorEnabled ? t('disable_protection', { defaultValue: 'تعطيل الحماية' }) : t('enable_protection', { defaultValue: 'تفعيل الحماية' })}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-gray-50 border-none rounded-[32px]">
                        <h4 className="font-black text-sm text-gray-800 mb-4">{t('password_policy', { defaultValue: 'سياسة كلمات المرور' })}</h4>
                        <div className="space-y-4">
                            <Select 
                                label={t('min_length', { defaultValue: "الحد الأدنى للطول" })} 
                                options={[{value:'8', label: t('8_chars', { defaultValue: '8 أحرف' })}, {value:'12', label: t('12_chars', { defaultValue: '12 حرف' })}]} 
                                value={prefs.minLength} 
                                onChange={(e: any) => setPrefs({...prefs, minLength: e.target.value})}
                                containerClassName="mb-0" 
                            />
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    className="w-6 h-6 rounded-lg text-primary border-gray-300 focus:ring-primary/20 cursor-pointer" 
                                    checked={prefs.requireSpecialChars}
                                    onChange={(e: any) => setPrefs({...prefs, requireSpecialChars: e.target.checked})}
                                />
                                <span className="text-[10px] font-black text-gray-600 uppercase">{t('require_symbols_numbers_caps', { defaultValue: 'طلب رموز وأرقام وحروف كبيرة' })}</span>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-6 bg-gray-50 border-none rounded-[32px]">
                        <h4 className="font-black text-sm text-gray-800 mb-4">{t('active_sessions', { defaultValue: 'الجلسات المفتوحة' })}</h4>
                        <p className="text-[10px] font-bold text-gray-400 mb-4">{t('active_devices_count', { defaultValue: 'هناك 3 أجهزة مسجلة دخول حالياً لنفس المكتب.' })}</p>
                        <Button variant="outline" size="sm" className="w-full rounded-xl border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100">{t('logout_all_devices', { defaultValue: 'تسجيل الخروج من كافة الأجهزة' })}</Button>
                    </Card>
                </div>
            </div>
        </Card>
    </div>
);
};

const IntegrationsSettings = () => {
    const { t } = useTranslation();
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
            { id: 'google', name: 'Google Calendar & Mail', icon: <GlobeAltIcon className="w-8 h-8 text-blue-500"/>, status: t('connected', { defaultValue: 'متصل' }), desc: t('google_integration_desc', { defaultValue: 'مزامنة المواعيد القانونية والبريد الرسمي.' }) },
            { id: 'outlook', name: 'Microsoft Outlook', icon: <EnvelopeIcon className="w-8 h-8 text-indigo-500"/>, status: t('not_connected', { defaultValue: 'غير متصل' }), desc: t('outlook_integration_desc', { defaultValue: 'ربط النظام ببيئة Office 365 الخاصة بالمؤسسة.' }) },
            { id: 'whatsapp', name: 'WhatsApp Business API', icon: <PhoneIcon className="w-8 h-8 text-emerald-500"/>, status: t('not_connected', { defaultValue: 'غير متصل' }), desc: t('whatsapp_integration_desc', { defaultValue: 'إرسال إشعارات وتحديثات القضايا للموكلين آلياً.' }) },
            { id: 'moj', name: t('justice_portal_kuwait', { defaultValue: 'بوابة العدل (الكويت)' }), icon: <BuildingOffice2Icon className="w-8 h-8 text-amber-600"/>, status: t('connected_view_only', { defaultValue: 'متصل (عرض فقط)' }), desc: t('moj_integration_desc', { defaultValue: 'جلب بيانات القضايا والرول الآلي من البوابة الرسمية.' }) },
        ].map(item => (
            <Card key={item.id} className="rounded-[40px] p-8 border-none shadow-2xl hover:shadow-primary/5 transition-all group">
                <div className="flex justify-between items-start mb-6">
                    <div className="p-4 bg-gray-50 rounded-[32px] group-hover:bg-white transition-colors duration-500">
                        {item.icon}
                    </div>
                    <Badge text={item.status} variant={item.status.includes(t('connected', { defaultValue: 'متصل' })) ? 'success' : 'secondary'} size="sm" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">{item.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 leading-relaxed mb-6">{item.desc}</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl border-gray-100 text-gray-600 group-hover:border-primary group-hover:text-primary">{item.status.includes(t('connected', { defaultValue: 'متصل' })) ? t('settings', { defaultValue: 'إعدادات' }) : t('link', { defaultValue: 'ربط' })}</Button>
                    {item.status.includes(t('connected', { defaultValue: 'متصل' })) && (
                        <Button variant="ghost" size="sm" className="p-2 rounded-xl text-rose-500 hover:bg-rose-50"><TrashIcon className="w-5 h-5"/></Button>
                    )}
                </div>
            </Card>
        ))}
    </div>
    );
};

const BillingSettings = () => {
    const { t } = useTranslation();
    return (
    <div className="space-y-8">
        <Card className="rounded-[40px] p-10 border-none shadow-2xl bg-gradient-to-r from-primary to-primary-dark text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
                <div className="space-y-4 text-center lg:text-right">
                    <Badge text={t('current_plan', { defaultValue: 'الخطة الحالية' })} variant="warning" size="sm" className="bg-white/20 text-white border-white/30" />
                    <h3 className="text-4xl font-black tracking-tighter">{t('enterprise_plan_name', { defaultValue: 'باقة التميز القانوني (Enterprise)' })}</h3>
                    <p className="text-primary-light/80 text-sm font-bold tracking-widest uppercase">{t('next_renewal_date', { defaultValue: 'تاريخ التجديد القادم: 12 ديسمبر 2024' })}</p>
                </div>
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                    <Button className="bg-white text-primary hover:bg-white/90 rounded-[28px] h-14 px-12 font-black shadow-2xl shadow-black/20">{t('upgrade_subscription', { defaultValue: 'ترقية الاشتراك' })}</Button>
                    <p className="text-[10px] text-center font-black text-white/50 uppercase tracking-widest">{t('change_anytime', { defaultValue: 'إمكانية التغيير في أي وقت' })}</p>
                </div>
            </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 border-none bg-white rounded-[40px] shadow-xl text-center space-y-4">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[32px] w-fit mx-auto"><UsersIcon className="w-8 h-8"/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('used_seats', { defaultValue: 'المقاعد المستخدمة' })}</p>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-2xl font-black inline-block text-indigo-600">3/10</span></div>
                        <div className="text-right font-black text-xs text-gray-400">30%</div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-indigo-100">
                        <div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"></div>
                    </div>
                </div>
            </Card>
            <Card className="p-8 border-none bg-white rounded-[40px] shadow-xl text-center space-y-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[32px] w-fit mx-auto"><CloudArrowUpIcon className="w-8 h-8"/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('storage_space', { defaultValue: 'مساحة التخزين' })}</p>
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div><span className="text-2xl font-black inline-block text-emerald-600">12.5GB/50GB</span></div>
                        <div className="text-right font-black text-xs text-gray-400">25%</div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-emerald-100">
                        <div style={{ width: "25%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-600"></div>
                    </div>
                </div>
            </Card>
            <Card className="p-8 border-none bg-white rounded-[40px] shadow-xl space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><ActivityIcon className="w-6 h-6"/></div>
                    <h4 className="font-black text-gray-800 text-sm">{t('ai_consumption', { defaultValue: 'استهلاك الذكاء الاصطناعي' })}</h4>
                </div>
                <div className="space-y-4 font-bold text-xs">
                    <div className="flex justify-between"><span>{t('contract_analysis', { defaultValue: 'تحليل عقود' })}</span> <span className="text-gray-400">45/200</span></div>
                    <div className="flex justify-between"><span>{t('legal_translation', { defaultValue: 'ترجمة قانونية' })}</span> <span className="text-gray-400">12/Unlimited</span></div>
                    <div className="flex justify-between"><span>{t('automated_search', { defaultValue: 'بحث آلي' })}</span> <span className="text-gray-400">890/5000</span></div>
                </div>
            </Card>
        </div>

        <Card className="rounded-[40px] p-0 border-none shadow-2xl overflow-hidden">
            <div className="p-8 bg-gray-50 flex justify-between items-center">
                <h4 className="text-xl font-black text-gray-900">{t('billing_history', { defaultValue: 'سجل الفواتير والدفعات' })}</h4>
                <Button variant="outline" size="sm" className="rounded-xl border-gray-200">{t('download_statement', { defaultValue: 'تحميل كشف الحساب' })}</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                    <thead>
                        <tr className="bg-gray-100/50 font-black text-[10px] text-gray-400 tracking-widest uppercase border-b">
                            <th className="p-6">{t('invoice_no', { defaultValue: 'رقم الفاتورة' })}</th>
                            <th className="p-6">{t('date', { defaultValue: 'التاريخ' })}</th>
                            <th className="p-6">{t('amount', { defaultValue: 'قيمة الدفعة' })}</th>
                            <th className="p-6">{t('status', { defaultValue: 'الحالة' })}</th>
                            <th className="p-6">{t('document', { defaultValue: 'المستند' })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {[
                            { id: '#INV-8871', date: '2024/05/01', amount: '250.000 KWD', status: t('paid', { defaultValue: 'مدفوع' }) },
                            { id: '#INV-8742', date: '2024/04/10', amount: '250.000 KWD', status: t('paid', { defaultValue: 'مدفوع' }) },
                            { id: '#INV-8601', date: '2024/03/12', amount: '250.000 KWD', status: t('paid', { defaultValue: 'مدفوع' }) },
                        ].map(inv => (
                            <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="p-6 font-mono font-bold text-gray-600">{inv.id}</td>
                                <td className="p-6 font-bold text-gray-500">{inv.date}</td>
                                <td className="p-6 font-black text-gray-900">{inv.amount}</td>
                                <td className="p-6"><Badge text={inv.status} variant="success" size="xs" /></td>
                                <td className="p-6"><Button variant="ghost" size="sm" className="p-2 text-primary hover:bg-primary/5 rounded-xl"><ArrowDownTrayIcon className="w-4 h-4"/></Button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
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
