import React, { useState } from 'react';
import {
    User,
    Briefcase,
    DollarSign,
    Calendar,
    ShieldAlert,
    FileText,
    Download,
    Eye,
    X,
    CheckCircle2,
    Phone,
    Award,
    CreditCard,
    FileCheck,
    Upload,
    Edit
} from 'lucide-react';
import { ExtendedEmployee } from '../../pages/EmployeeProfileData';

interface EmployeeDetailPanelProps {
    employee: ExtendedEmployee;
    onClose?: () => void;
    onEdit: (emp: ExtendedEmployee) => void;
    onOpenDocsModal: (emp: ExtendedEmployee) => void;
    onOpenUploadModal: (emp: ExtendedEmployee) => void;
    onViewDoc: (doc: any) => void;
}

export const EmployeeDetailPanel: React.FC<EmployeeDetailPanelProps> = ({
    employee,
    onClose,
    onEdit,
    onOpenDocsModal,
    onOpenUploadModal,
    onViewDoc,
}) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'career' | 'financial' | 'leaves' | 'investigations' | 'documents'>('personal');

    const totalAllowances = employee.allowances?.reduce((sum, a) => sum + a.value, 0) || 0;
    const grossSalary = (employee.basicSalary || 0) + totalAllowances;
    const remainingLeaves = (employee.annualLeaveEntitlement || 30) + (employee.carriedOverBalance || 0) - (employee.absenceDays || 0);

    const tabs = [
        { id: 'personal', label: 'البيانات الشخصية', icon: User },
        { id: 'career', label: 'المسار الوظيفي', icon: Briefcase },
        { id: 'financial', label: 'الرواتب والمالية', icon: DollarSign },
        { id: 'leaves', label: 'الإجازات والحضور', icon: Calendar },
        { id: 'investigations', label: 'التحقيقات والجزاءات', icon: ShieldAlert, badge: (employee.investigations?.length || 0) + (employee.disciplinaryActions?.length || 0) },
        { id: 'documents', label: 'المستندات والأوراق', icon: FileText, badge: employee.attachments?.length || 0 },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-colors text-right">
            
            {/* Header Banner & Profile Overview */}
            <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-5 md:p-6 relative">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 left-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border-none"
                        title="إغلاق التفاصيل"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-300 border-2 border-teal-400/40 font-black text-xl flex items-center justify-center shrink-0 shadow-inner">
                            {employee.fullNameAr.split(' ').slice(0, 2).map(n => n[0]).join('')}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg md:text-xl font-black text-white m-0">
                                    {employee.fullNameAr}
                                </h2>
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                        employee.status === 'Active'
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                            : employee.status === 'On Leave'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    }`}
                                >
                                    {employee.status === 'Active' ? 'على رأس العمل' : employee.status === 'On Leave' ? 'في إجازة' : 'موقوف'}
                                </span>
                            </div>
                            <p className="text-xs text-teal-200/80 font-bold mt-1 mb-0 flex items-center gap-2">
                                <span>{employee.jobTitle}</span>
                                <span>•</span>
                                <span className="font-mono text-teal-300">{employee.employeeId}</span>
                            </p>
                        </div>
                    </div>

                    {/* Top Right Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                        <button
                            type="button"
                            onClick={() => onEdit(employee)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-white/10"
                        >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل الملف</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onOpenDocsModal(employee)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer border-none shadow-sm"
                        >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>عقود ونماذج</span>
                        </button>
                    </div>
                </div>

                {/* Quick Header Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/10">
                    <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-300 font-bold block">الراتب الأساسي</span>
                        <span className="text-xs font-mono font-black text-teal-300 mt-0.5 block">
                            {(employee.basicSalary || 0).toLocaleString()} د.ك
                        </span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-300 font-bold block">الراتب الإجمالي</span>
                        <span className="text-xs font-mono font-black text-emerald-300 mt-0.5 block">
                            {grossSalary.toLocaleString()} د.ك
                        </span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-300 font-bold block">رصيد الإجازات المتبقي</span>
                        <span className="text-xs font-mono font-black text-amber-300 mt-0.5 block">
                            {remainingLeaves} يوماً
                        </span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/5">
                        <span className="text-[10px] text-slate-300 font-bold block">تاريخ المباشرة</span>
                        <span className="text-xs font-mono font-black text-slate-200 mt-0.5 block">
                            {employee.joiningDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-none shrink-0 ${
                                isActive
                                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-2xs border border-slate-200 dark:border-slate-800 font-black'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`} />
                            <span>{tab.label}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                                    isActive ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content Body */}
            <div className="p-5">
                {/* 1. PERSONAL DATA */}
                {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 m-0 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <User className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                                <span>البيانات الشَخصية والهوية</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">الاسم الكامل (عربي)</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{employee.fullNameAr}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">الاسم الكامل (English)</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{employee.fullNameEn}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">الرقم المدني الكويتي</span>
                                    <span className="font-mono font-bold text-teal-800 dark:text-teal-300">{employee.civilId}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">الجنسية</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">{employee.nationality}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">تاريخ الميلاد</span>
                                    <span className="font-mono text-slate-800 dark:text-slate-200">{employee.dateOfBirth}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">الجنس / الحالة الاجتماعية</span>
                                    <span className="text-slate-800 dark:text-slate-200 font-bold">{employee.gender === 'Male' ? 'ذكر' : 'أنثى'} • {employee.socialStatus || 'أعزب'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 m-0 border-b border-slate-200 dark:border-slate-800 pb-2">
                                <Phone className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                                <span>معلومات الاتصال والطوارئ</span>
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">رقم الهاتف النقاط</span>
                                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{employee.phone}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block text-[10px]">البريد الإلكتروني</span>
                                    <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">{employee.email}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-slate-400 font-bold block text-[10px]">جهة الاتصال عند الطوارئ</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {employee.emergencyContact?.name} ({employee.emergencyContact?.relationship}) - <span className="font-mono text-teal-700 dark:text-teal-400">{employee.emergencyContact?.phone}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. CAREER PATH */}
                {activeTab === 'career' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold block">المسمى الوظيفي الحالي</span>
                                <span className="text-xs font-black text-teal-800 dark:text-teal-300 mt-1 block">{employee.jobTitle}</span>
                            </div>
                            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold block">الفرع والإدارة</span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 block">{employee.department} • {employee.branch}</span>
                            </div>
                            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold block">المحامي الشريك المشرف</span>
                                <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-1 block">{employee.managerName || 'أ. صبري شطا'}</span>
                            </div>
                        </div>

                        {/* Performance & Appraisals list */}
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white mb-3">سجل التقييمات السنوية والمستهدفات</h4>
                            <div className="space-y-2">
                                {employee.evaluations?.map((perf, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                                        <div className="flex items-center gap-3">
                                            <Award className="w-4 h-4 text-amber-500 shrink-0" />
                                            <div>
                                                <span className="font-black text-slate-800 dark:text-slate-200">تقييم الفترة: {perf.period}</span>
                                                <span className="text-[10px] text-slate-400 block">{perf.feedback}</span>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono font-black rounded-lg border border-amber-200/50">
                                            {perf.score} / 100
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. FINANCIAL */}
                {activeTab === 'financial' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold block">الراتب الأساسي</span>
                                <span className="text-sm font-mono font-black text-slate-900 dark:text-white mt-1 block">{(employee.basicSalary || 0).toLocaleString()} د.ك</span>
                            </div>
                            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold block">إجمالي البدلات والمكافآت</span>
                                <span className="text-sm font-mono font-black text-emerald-700 dark:text-emerald-400 mt-1 block">+{totalAllowances.toLocaleString()} د.ك</span>
                            </div>
                        </div>

                        {/* Allowances Table & Bank Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white mb-2">تفاصيل البدلات المعتمدة</h4>
                                <div className="space-y-1.5 text-xs">
                                    {employee.allowances?.map((allow, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{allow.name}</span>
                                            <span className="font-mono font-black text-teal-800 dark:text-teal-300">{allow.value} د.ك</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 m-0">
                                    <CreditCard className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                                    <span>الحساب البنكي لتحويل الرواتب (IBAN)</span>
                                </h4>
                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">اسم البنك</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{employee.bankName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400 font-bold">رقم الأيبان (IBAN)</span>
                                        <span className="font-mono font-black text-teal-800 dark:text-teal-300">{employee.bankIban}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. LEAVES */}
                {activeTab === 'leaves' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-teal-50/60 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-100 dark:border-teal-900/40">
                                <span className="text-[10px] text-teal-800 dark:text-teal-300 font-bold block">رصيد الإجازة السنوي المعتمد</span>
                                <span className="text-sm font-mono font-black text-teal-900 dark:text-teal-200 mt-1 block">{employee.annualLeaveEntitlement || 30} يوماً</span>
                            </div>
                            <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-100 dark:border-amber-900/40">
                                <span className="text-[10px] text-amber-800 dark:text-amber-300 font-bold block">رصيد الإجازات المتبقي حالياً</span>
                                <span className="text-sm font-mono font-black text-amber-900 dark:text-amber-200 mt-1 block">{remainingLeaves} يوماً</span>
                            </div>
                            <div className="bg-slate-50/80 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 font-bold block">أيام الغياب / الاستئذان</span>
                                <span className="text-sm font-mono font-black text-slate-800 dark:text-slate-200 mt-1 block">{employee.absenceDays || 0} أيام</span>
                            </div>
                        </div>

                        {/* Recent Leave Requests */}
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white mb-2">سجل طلبات الإجازات المقدمة</h4>
                            <div className="space-y-2">
                                {employee.leaveRequests?.map((req, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                                        <div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{req.type}</span>
                                            <span className="text-[10px] text-slate-400 block font-mono">من {req.startDate} إلى {req.endDate} ({req.days} أيام)</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black ${
                                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {req.status === 'Approved' ? 'مقبول' : 'قيد المراجعة'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 5. INVESTIGATIONS & DISCIPLINARY */}
                {activeTab === 'investigations' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white m-0">سجل التحقيقات والقرارات التأديبية</h4>
                            <span className="text-[11px] font-bold text-slate-500">
                                إجمالي الحالات: {(employee.investigations?.length || 0) + (employee.disciplinaryActions?.length || 0)}
                            </span>
                        </div>

                        {employee.disciplinaryActions && employee.disciplinaryActions.length > 0 ? (
                            <div className="space-y-2">
                                {employee.disciplinaryActions.map((rec) => (
                                    <div key={rec.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="font-black text-slate-900 dark:text-white">{rec.sanctionType}</span>
                                            <span className="font-mono text-[10px] text-slate-400">{rec.date}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 m-0">{rec.details}</p>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                                            <span>المرجع: {rec.recordNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 m-0">لا توجد أية جزاءات أو تحقيقات مسجلة لهذا الموظف</p>
                                <span className="text-[10px] text-slate-400 block mt-0.5">السجل نظيف وممتثل تماماً مع لوائح العمل</span>
                            </div>
                        )}
                    </div>
                )}

                {/* 6. DOCUMENTS & FILES */}
                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white m-0">محفظة المستندات والوثائق المعتمدة</h4>
                            <button
                                type="button"
                                onClick={() => onOpenUploadModal(employee)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl border-none cursor-pointer shadow-3xs"
                            >
                                <Upload className="w-3.5 h-3.5" />
                                <span>رفع مستند جديد</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {employee.attachments?.map((doc) => (
                                <div key={doc.id} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <FileText className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />
                                        <div className="min-w-0">
                                            <span className="font-black text-slate-800 dark:text-slate-200 block truncate">{doc.title}</span>
                                            <span className="text-[10px] font-mono text-slate-400 block truncate">ينتهي: {doc.expiryDate || 'غير محدد'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => onViewDoc(doc)}
                                            className="p-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer"
                                            title="معاينة الوثيقة"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
