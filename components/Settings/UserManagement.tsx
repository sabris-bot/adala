import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { UserRoleBadge, UserStatusBadge } from '../ui/Badge';
import { User } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '../../constants';

interface UserManagementProps {
  users: User[];
  accent: any;
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  accent,
  onAdd,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className="rounded-[32px] p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-dm-card shadow-sm">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-dm-text">مقاعد وإدارة فريق العمل</h3>
          <p className="text-xs font-medium text-slate-400 mt-1">لديك {users.length} مستخدمين نشطين من أصل 10 مقاعد متاحة بالترخيص.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<PlusCircleIcon className="w-4 h-4" />}
          className={`px-6 rounded-xl font-bold ${accent.bg} ${accent.hoverBg}`}
          onClick={onAdd}
        >
          إضافة عضو جديد بالفريق
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-dm-background font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <th className="p-4">العضو بالمنظومة</th>
              <th className="p-4 text-center">الدور / التخصص</th>
              <th className="p-4 text-center">الحالة الحالية</th>
              <th className="p-4 text-center">إجراءات الموارد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user: User) => (
              <tr key={user.id} className="hover:bg-indigo-50/10 dark:hover:bg-dm-background/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${accent.bgLight} ${accent.text} flex items-center justify-center font-bold text-xs`}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-dm-text text-sm">{user.name}</p>
                      <p className="text-xs font-mono text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center align-middle">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="p-4 text-center align-middle">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="p-4 align-middle">
                  <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      className="p-2 hover:bg-slate-100 dark:hover:bg-dm-background rounded-lg text-amber-600 transition-all font-bold"
                      onClick={() => onEdit(user)}
                      title="تعديل المستخدم"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg text-rose-500 transition-all font-bold"
                      onClick={() => onDelete(user.id)}
                      title="حذف المستخدم"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
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
