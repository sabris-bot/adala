import React from 'react';
import Card from '../ui/Card';
import { UserRole, Permission } from '../../types';
import { userRoleOptions, permissionGroups } from '../../constants';

interface RolePermissionsSettingsProps {
  permissions: any;
  setPermissions: (permissions: any) => void;
  accent: any;
}

export const RolePermissionsSettings: React.FC<RolePermissionsSettingsProps> = ({
  permissions,
  setPermissions,
  accent,
}) => {
  const handlePermissionChange = (role: UserRole, perm: Permission, checked: boolean) => {
    const current = permissions[role] || [];
    const updated = checked ? [...new Set([...current, perm])] : current.filter((p: any) => p !== perm);
    setPermissions({ ...permissions, [role]: updated });
  };

  return (
    <Card className="rounded-[32px] p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-dm-text">مصفوفة الصلاحيات وتوزيع المسؤوليات (RBAC)</h3>
        <p className="text-xs text-slate-400 font-medium max-w-xl leading-relaxed mt-1">
          تخصيص مستويات الوصول للمصادر والملفات وتلقائيات الذكاء بموجب تخصص العضو.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-dm-background border-b border-slate-100 dark:border-slate-800">
              <th className="p-4 font-bold text-slate-400 uppercase tracking-wider text-[10px] min-w-[200px]">الميزات وحصانة النظام</th>
              {userRoleOptions.map(role => (
                <th key={role.value} className="p-4 font-bold text-slate-900 dark:text-dm-text border-r border-slate-100 dark:border-slate-800 whitespace-nowrap text-center text-xs">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {permissionGroups.map(group => (
              <React.Fragment key={group.title}>
                <tr className="bg-indigo-50/20 dark:bg-dm-background font-bold text-xs">
                  <td colSpan={userRoleOptions.length + 1} className={`p-3 font-bold uppercase text-xs tracking-wider ${accent.text}`}>
                    {group.title}
                  </td>
                </tr>
                {group.permissions.map(perm => (
                  <tr key={perm.value} className="hover:bg-slate-50/50 dark:hover:bg-dm-background/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-dm-text text-xs">{perm.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{perm.description}</p>
                    </td>
                    {userRoleOptions.map(roleOption => {
                      const role = roleOption.value as UserRole;
                      const isChecked = permissions[role]?.includes(perm.value);
                      const isAdmin = role === UserRole.ADMIN;
                      return (
                        <td key={`${role}-${perm.value}`} className="p-4 text-center border-r border-slate-100 dark:border-slate-800 align-middle">
                          <input
                            type="checkbox"
                            className={`w-5 h-5 rounded-md text-indigo-600 border-slate-300 focus:ring-indigo-500/20 ${isAdmin ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
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
