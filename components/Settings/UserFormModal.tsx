import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { UserRole, UserStatus } from '../../types';
import { userRoleOptions, userStatusOptions, InformationCircleIcon } from '../../constants';
import { useTranslation } from 'react-i18next';

interface UserFormModalProps {
  initialData: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  accent: any;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({ initialData, onSave, onCancel, accent }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    role: initialData.role || UserRole.LAWYER,
    status: initialData.status || UserStatus.ACTIVE,
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-6">
      <Input
        label="الاسم الكامل للموظف أو الوكيل"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        required
        className="rounded-xl bg-slate-50 dark:bg-dm-background h-12 text-sm border-slate-200 dark:border-slate-700"
      />
      <Input
        label="البريد الإلكتروني المهني الموثق"
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        required
        className="rounded-xl bg-slate-50 dark:bg-dm-background h-12 text-sm border-slate-200 dark:border-slate-700 font-mono"
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="الرتبة والدور الوظيفي"
          options={userRoleOptions}
          value={formData.role}
          onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
          containerClassName="mb-0"
        />
        <Select
          label="حالة تفعيل المقعد للدخول"
          options={userStatusOptions}
          value={formData.status}
          onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
          containerClassName="mb-0"
        />
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 flex gap-3">
        <InformationCircleIcon className="w-5 h-5 text-amber-600 shrink-0" />
        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
          سيقوم الخادم آلياً بإرسال كلمة مرور مؤقتة ورابط الدخول المؤمن للموظف عبر بريده الإلكتروني بمجرد تأكيد الإدراج.
        </p>
      </div>

      <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-xl">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl px-6">
          إلغاء الإجراء
        </Button>
        <Button type="submit" variant="primary" className={`rounded-xl px-10 ${accent.bg} ${accent.hoverBg}`}>
          حفظ وتفعيل الموظف
        </Button>
      </div>
    </form>
  );
};
