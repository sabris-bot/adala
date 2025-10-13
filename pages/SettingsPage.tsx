import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { User, UserRole, UserStatus, Permission, RolePermissions } from '../types';
import { userRoleOptions, userStatusOptions, permissionGroups, PencilIcon, TrashIcon, PlusCircleIcon } from '../constants';
import { UserRoleBadge, UserStatusBadge } from '../components/ui/Badge';

// Mock data for demonstration
const mockUsers: User[] = [
  { id: 'usr1', name: 'أحمد محمود', email: 'ahmed.m@adala-system.com', role: UserRole.ADMIN, status: UserStatus.ACTIVE },
  { id: 'usr2', name: 'فاطمة علي', email: 'fatima.a@adala-system.com', role: UserRole.LAWYER, status: UserStatus.ACTIVE },
  { id: 'usr3', name: 'علي جاسم', email: 'ali.j@adala-system.com', role: UserRole.ASSISTANT, status: UserStatus.ACTIVE },
  { id: 'usr4', name: 'خالد ناصر', email: 'khaled.n@adala-system.com', role: UserRole.ACCOUNTANT, status: UserStatus.INACTIVE },
  { id: 'usr5', name: 'ضيف مؤقت', email: 'guest@adala-system.com', role: UserRole.GUEST, status: UserStatus.PENDING_VERIFICATION },
];

const initialRolePermissions: RolePermissions = {
  [UserRole.ADMIN]: Object.values(Permission), // Admin gets all permissions
  [UserRole.LAWYER]: [
    Permission.VIEW_FINANCIALS,
    Permission.VIEW_EMPLOYEE_AFFAIRS,
    Permission.ACCESS_AI_FEATURES,
    Permission.EXPORT_REPORTS,
    Permission.USE_CAMERA,
    Permission.USE_MICROPHONE,
  ],
  [UserRole.ASSISTANT]: [
    Permission.ACCESS_AI_FEATURES,
    Permission.USE_CAMERA,
  ],
  [UserRole.ACCOUNTANT]: [
    Permission.VIEW_FINANCIALS,
    Permission.EDIT_FINANCIALS,
  ],
  [UserRole.GUEST]: [],
};

// Define props for SettingsPage
interface SettingsPageProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ toggleDarkMode, isDarkMode }) => {
  // --- STATE FOR USER MANAGEMENT ---
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [subscription] = useState({ plan: 'الخطة الاحترافية', userLimit: 10 });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(initialRolePermissions);

  // --- STATE FOR PERSONAL SETTINGS ---
  const [userSettings, setUserSettings] = React.useState({
    name: 'المستخدم الافتراضي',
    email: 'user@example.com',
    language: 'ar',
    notifications: true,
  });

  // --- HANDLERS FOR USER MANAGEMENT ---
  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };
  const handleDeleteUser = (userId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };
  const handleSaveUser = (userData: Partial<User>) => {
    if (editingUser?.id) {
      // Update existing user
      setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userData } as User : u));
    } else {
      // Add new user
      const newUser: User = {
        id: `usr${Date.now()}`,
        ...userData,
      } as User;
      setUsers(prev => [...prev, newUser]);
    }
    setIsUserModalOpen(false);
  };
  
  const handlePermissionChange = (role: UserRole, permission: Permission, checked: boolean) => {
    setRolePermissions(prev => {
        const currentPermissions = prev[role] || [];
        if (checked) {
            // Add permission if not already present
            return { ...prev, [role]: [...new Set([...currentPermissions, permission])] };
        } else {
            // Remove permission
            return { ...prev, [role]: currentPermissions.filter(p => p !== permission) };
        }
    });
  };

  // --- HANDLERS FOR PERSONAL SETTINGS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setUserSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم حفظ الإعدادات الشخصية (محاكاة).');
  };
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    if ((newTheme === 'dark' && !isDarkMode) || (newTheme === 'light' && isDarkMode)) {
      toggleDarkMode();
    }
  };

  const languageOptions = [{ value: 'ar', label: 'العربية' }, { value: 'en', label: 'English (إنجليزية)' }];
  const themeOptions = [{ value: 'light', label: 'فاتح (Light)' }, { value: 'dark', label: 'داكن (Dark)' }];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary-dark">الإعدادات</h1>
      
      <Card title="إدارة المستخدمين والصلاحيات">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 p-3 bg-gray-50 dark:bg-dm-card/50 rounded-lg border-s-4 border-primary">
            <div>
                <p className="font-semibold text-primary-dark dark:text-primary-light">الخطة الحالية: <span className="font-normal text-neutral-text dark:text-dm-text">{subscription.plan}</span></p>
                <p className="font-semibold text-primary-dark dark:text-primary-light">المستخدمون: <span className="font-bold text-lg text-neutral-text dark:text-dm-text">{users.length}</span> / {subscription.userLimit}</p>
            </div>
            <Button onClick={handleAddUser} disabled={users.length >= subscription.userLimit} leftIcon={<PlusCircleIcon className="w-5 h-5"/>} className="mt-3 sm:mt-0">
                إضافة مستخدم جديد
            </Button>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-secondary-dark/50 text-sm">
                <thead className="bg-gray-100 dark:bg-dm-card/60">
                    <tr>
                        {['الاسم', 'البريد الإلكتروني', 'الدور', 'الحالة', 'إجراءات'].map(h => <th key={h} className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-300">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-dm-card divide-y divide-gray-200 dark:divide-secondary-dark/50">
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-dm-text">{user.name}</td>
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{user.email}</td>
                            <td className="px-4 py-3"><UserRoleBadge role={user.role} /></td>
                            <td className="px-4 py-3"><UserStatusBadge status={user.status} /></td>
                            <td className="px-4 py-3 space-x-1 space-x-reverse">
                                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600"/></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)} title="حذف" className="text-danger"><TrashIcon className="w-4 h-4"/></Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      <Card title="إدارة صلاحيات الأدوار">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            تحكم في الميزات التي يمكن لكل دور وظيفي الوصول إليها في النظام.
        </p>
        <div className="overflow-x-auto">
            <table className="min-w-full w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
                <thead>
                    <tr className="bg-gray-100 dark:bg-dm-card/60">
                        <th className="p-3 font-medium text-right border border-gray-200 dark:border-gray-700">الصلاحية</th>
                        {userRoleOptions.map(roleOption => (
                            <th key={roleOption.value} className="p-3 font-medium text-center border border-gray-200 dark:border-gray-700">{roleOption.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {permissionGroups.map(group => (
                        <React.Fragment key={group.title}>
                            <tr className="bg-gray-50 dark:bg-dm-card/30">
                                <td colSpan={userRoleOptions.length + 1} className="p-2 font-semibold text-primary-dark dark:text-primary-light border border-gray-200 dark:border-gray-700">
                                    {group.title}
                                </td>
                            </tr>
                            {group.permissions.map(perm => (
                                <tr key={perm.value} className="hover:bg-gray-50 dark:hover:bg-dm-card/20">
                                    <td className="p-3 border border-gray-200 dark:border-gray-700">
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{perm.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
                                    </td>
                                    {userRoleOptions.map(roleOption => {
                                        const role = roleOption.value as UserRole;
                                        const isChecked = rolePermissions[role]?.includes(perm.value);
                                        const isDisabled = role === UserRole.ADMIN && perm.value === Permission.MANAGE_USERS;
                                        return (
                                            <td key={`${role}-${perm.value}`} className="p-3 text-center border border-gray-200 dark:border-gray-700 align-middle">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
                                                    checked={isChecked}
                                                    disabled={isDisabled}
                                                    onChange={(e) => handlePermissionChange(role, perm.value, e.target.checked)}
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
        <div className="mt-6 flex justify-end">
            <Button type="button" variant="primary" onClick={() => alert('تم حفظ تغييرات الصلاحيات (محاكاة).')}>حفظ تغييرات الصلاحيات</Button>
        </div>
      </Card>
      
      <form onSubmit={handleSubmit}>
        <Card title="إعدادات الحساب الشخصي">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="الاسم الكامل" name="name" value={userSettings.name} onChange={handleInputChange} />
            <Input label="البريد الإلكتروني" name="email" type="email" value={userSettings.email} onChange={handleInputChange} />
          </div>
        </Card>

        <Card title="تفضيلات التطبيق" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="لغة الواجهة" name="language" value={userSettings.language} options={languageOptions} onChange={handleInputChange} />
            <Select label="مظهر التطبيق (Theme)" name="theme" value={isDarkMode ? 'dark' : 'light'} options={themeOptions} onChange={handleThemeChange} />
          </div>
          <div className="mt-6">
            <label className="flex items-center">
              <input type="checkbox" name="notifications" checked={userSettings.notifications} onChange={handleInputChange} className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light border-gray-300"/>
              <span className="ms-2 text-gray-700 dark:text-dm-text-light">تفعيل الإشعارات</span>
            </label>
          </div>
        </Card>
        
        <div className="mt-8 flex justify-end">
          <Button type="submit" variant="primary">حفظ الإعدادات الشخصية</Button>
        </div>
      </form>
      
      <Card title="حول النظام" className="mt-6">
          <p className="text-gray-700 dark:text-dm-text-light"><strong>عدالة - منظومة الإدارة القانونية المتكاملة</strong></p>
          <p className="text-sm text-gray-500 dark:text-gray-400">الإصدار: 3.0.0</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} جميع الحقوق محفوظة.</p>
      </Card>

      {isUserModalOpen && (
          <UserFormModal 
              isOpen={isUserModalOpen}
              onClose={() => setIsUserModalOpen(false)}
              onSave={handleSaveUser}
              initialData={editingUser}
          />
      )}
    </div>
  );
};

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<User>) => void;
    initialData: Partial<User> | null;
}
const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<User>>(initialData || { role: UserRole.LAWYER, status: UserStatus.ACTIVE });

    React.useEffect(() => {
        setFormData(initialData || { role: UserRole.LAWYER, status: UserStatus.ACTIVE });
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل بيانات المستخدم" : "إضافة مستخدم جديد"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="الاسم الكامل" name="name" value={formData.name || ''} onChange={handleChange} required />
                <Input label="البريد الإلكتروني" name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
                {!initialData?.id && (
                     <Input label="كلمة المرور" name="password" type="password" required />
                )}
                <Select label="الدور (الصلاحية)" name="role" value={formData.role} options={userRoleOptions} onChange={handleChange} />
                <Select label="الحالة" name="status" value={formData.status} options={userStatusOptions} onChange={handleChange} />
                <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button type="submit">حفظ</Button>
                </div>
            </form>
        </Modal>
    );
};

export default SettingsPage;