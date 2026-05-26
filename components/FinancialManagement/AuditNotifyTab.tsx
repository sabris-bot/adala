import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ShieldAlert, 
    Bell, 
    Lock, 
    UserCheck, 
    Terminal, 
    CheckCircle, 
    AlertTriangle, 
    RefreshCcw, 
    Activity,
    Fingerprint,
    Search
} from 'lucide-react';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

interface AuditLogEntry {
    timestamp: string;
    actor: string;
    role: string;
    action: string;
    ipAddress: string;
    shaHash: string;
    status: 'success' | 'alert' | 'blocked';
}

interface FinancialAlert {
    id: string;
    type: 'overdue' | 'escrow' | 'payout' | 'anomaly';
    title: string;
    message: string;
    date: string;
    read: boolean;
}

interface AuditNotifyTabProps {
    userRole: 'admin' | 'finance_manager' | 'lawyer' | 'consultant';
    setUserRole: (role: 'admin' | 'finance_manager' | 'lawyer' | 'consultant') => void;
}

export const AuditNotifyTab: React.FC<AuditNotifyTabProps> = ({ userRole, setUserRole }) => {
    const { addToast } = useToast();
    
    // Core logs data
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
        {
            timestamp: '2024-05-25 16:12:05',
            actor: 'المستشار صبري شطا',
            role: 'مدير الشؤون المالية',
            action: 'تعديل النسبة الاقتطاعية العامة وإعادة ضبط مقاصة عمولة الحوكمة لـ 25%',
            ipAddress: '192.168.1.144',
            shaHash: '8f7a94ee2e...fc551aef',
            status: 'success'
        },
        {
            timestamp: '2024-05-25 15:45:10',
            actor: 'المحامي فهد الرشيدي',
            role: 'محامٍ ترافعي',
            action: 'محاولة فك حيازة حوالة الضمان ESC-2024-901 دون إدخال رمز التحقق الترافعي التلقائي',
            ipAddress: '192.168.1.32',
            shaHash: '9a9da33e99...8fc9872e',
            status: 'blocked'
        },
        {
            timestamp: '2024-05-24 11:30:22',
            actor: 'آلة التدقيق الملقمة (AI Bot)',
            role: 'خوارزمية رصد الانحرافات والأنشطة',
            action: 'فحص مالي دوري لمطابقة قيود النفقات التشغيلية لبيت التمويل الكويتي - النتيجة مطابقة بنسبة 100%',
            ipAddress: '127.0.0.1',
            shaHash: 'f4b39eeae3...fa5619bb',
            status: 'success'
        },
        {
            timestamp: '2024-05-23 09:15:00',
            actor: 'المستشار صبري شطا',
            role: 'مدير الشؤون المالية',
            action: 'الإفراج المالي التام لضمان ورثة العبدالله ESC-2024-902 باستخدام PIN التوقيع',
            ipAddress: '192.168.1.144',
            shaHash: '1aa2ee49ef...ac988b44',
            status: 'success'
        },
        {
            timestamp: '2024-05-22 17:01:45',
            actor: 'المحامي أحمد الصالح',
            role: 'محامٍ خارجي شريك',
            action: 'إصدار سند مطالبة مالية جديد بالرعاية INV-2024-003 بقيمة 8,900 KWD',
            ipAddress: '192.168.3.111',
            shaHash: 'eeb998fa7d...9cde9923',
            status: 'success'
        }
    ]);

    // Active live alerts list
    const [alerts, setAlerts] = useState<FinancialAlert[]>([
        {
            id: 'ALT-1',
            type: 'anomaly',
            title: 'تجاوز حد النفقة (صرف الرواتب)',
            message: 'رواتب موظفي السلك العام ومكافئات معاوني المكتب الكبار تخطت الميزانية التقديرية بـ 2,200 دينار.',
            date: '2024-05-25',
            read: false
        },
        {
            id: 'ALT-2',
            type: 'escrow',
            title: 'حوالة ضمان معلقة بانتظار المقاصة',
            message: 'مجموعة المرزوق الاستثمارية قامت بإيداع أمانة ESC-2024-903 بمبلغ 25,000 دينار بانتظار تصديق الخبراء.',
            date: '2024-05-20',
            read: false
        },
        {
            id: 'ALT-3',
            type: 'overdue',
            title: 'فواتير متأخرة السداد (INV-2024-003)',
            message: 'انقضت فترة السداد لدعوى إخلاء المحل التجاري لأحمد العبدالله دون تحصيل أتعاب التمثيل.',
            date: '2024-05-10',
            read: true
        }
    ]);

    const handleMarkAllRead = () => {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
        addToast({
            type: 'success',
            title: 'تم تصفية الإشعارات',
            message: 'تم تعليم جميع التنبيهات والإنذارات كـ مقروءة.'
        });
    };

    const handleTriggerAuditScan = () => {
        addToast({
            type: 'info',
            title: 'بدء التدقيق التلقائي التشفيري 🔎',
            message: 'جاري فحص سلامة التوقيع وسجلات SHA-256 لمنع محاولات التلاعب المزدوج بالبيود.'
        });

        setTimeout(() => {
            addToast({
                type: 'success',
                title: 'التدقيق سليم وآمن 🛡️',
                message: 'لم يتم العثور على أي تناقضات أو ثغرات في حركة الأمانات وسندات الصرف.'
            });
        }, 1200);
    };

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* Simulation Header with Role Swapper */}
            <div className="bg-white dark:bg-dm-card p-6 rounded-[2rem] shadow-sm border border-slate-150 dark:border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                            <Fingerprint className="w-5 h-5 text-primary" /> إدارة الصلاحيات ومطابقة قيود الأمان والدفاع (Role & Audit Gate)
                        </h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">بوابة حية لتجربة الصلاحيات وتتبع تحركات المحاسب المالي ومواثيق الشفافية والأدلة الرقمية</p>
                    </div>

                    {/* Role-based selection buttons for live simulation demo */}
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-1.5 rounded-2xl flex-wrap">
                        <span className="text-[9px] text-slate-400 font-extrabold px-2">الصفة الحالية للورقة:</span>
                        {(['admin', 'finance_manager', 'lawyer', 'consultant'] as const).map(role => (
                            <button
                                key={role}
                                onClick={() => {
                                    setUserRole(role);
                                    addToast({
                                        type: 'info',
                                        title: 'تم محاكاة التوقيع والصلاحية',
                                        message: `أنت تتصفح الواجهة المالية الآن بصلاحية: [${role === 'admin' ? 'المدير العام' : role === 'finance_manager' ? 'المدير المالي' : role === 'lawyer' ? 'المحامي الشريك' : 'المستشار القانوني'}]`
                                    });
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[9.5px] font-black transition-all ${userRole === role ? 'bg-primary text-white shadow-md' : 'text-slate-450 hover:text-slate-650'}`}
                            >
                                {role === 'admin' ? 'مدير أدمن' : role === 'finance_manager' ? 'مدير مالي' : role === 'lawyer' ? 'محامٍ' : 'مستشار'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 text-[10px] leading-relaxed font-bold text-slate-450 dark:text-slate-400">
                    🔐 <strong>ضوابط الحماية بالتبديل:</strong> 
                    {userRole === 'admin' && ' تمتلك كامل الصلاحيات لتحديث النسب، صرف النفقات، وتحرير أمانات الضمان.'}
                    {userRole === 'finance_manager' && ' تملك صلاحية تحرير الأمانات وصرف النفقات ومراجعة التقارير ومقاصة الشركاء.'}
                    {userRole === 'lawyer' && ' يمكنك معاينة فواتير قضاياك وتوجيه الإشعارات وسحب كشف الحركة، لكنك محظور من الإفراج المالي أو تعديل عمولة المنصة.'}
                    {userRole === 'consultant' && ' تقتصر رخصتك على رصد وصياغة العقود وتتبع حصص أتعابك ومطالبة الصرف المالية التمهيدية.'}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Visual live notifications feed */}
                <div className="xl:col-span-4 bg-white dark:bg-dm-card p-6 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-primary" /> مركز الإنذارات والتوثيق المباشر
                        </h4>
                        <button 
                            onClick={handleMarkAllRead}
                            className="text-[9px] font-black text-primary hover:underline"
                        >
                            تعليم الكل كمقروء
                        </button>
                    </div>

                    <div className="space-y-3">
                        {alerts.map(alt => (
                            <div 
                                key={alt.id}
                                className={`p-4 rounded-2xl border transition-all relative ${alt.read ? 'bg-slate-50/20 border-slate-100 dark:bg-slate-900/10 dark:border-slate-850' : 'bg-rose-500/5 border-rose-100/60 dark:bg-rose-950/10'}`}
                            >
                                {!alt.read && (
                                    <div className="absolute top-2.5 right-2 w-2 h-2 rounded-full bg-rose-500" />
                                )}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[9.5px] font-black ${alt.type === 'anomaly' ? 'text-rose-650 text-rose-600' : alt.type === 'escrow' ? 'text-amber-600' : 'text-primary'}`}>{alt.title}</span>
                                        <span className="text-[8px] font-mono text-slate-400 font-bold">{alt.date}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 leading-relaxed font-normal">{alt.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cryptographic Security Audit Trails */}
                <div className="xl:col-span-8 bg-white dark:bg-dm-card p-6 rounded-[2.5rem] border border-slate-150 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h4 className="text-xs font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                                <Terminal className="w-5 h-5 text-primary" /> سجلات المراقبة الجنائية للحركات المالية (Blockchain-ready Audit trail)
                            </h4>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">سجل زمني تسلسلي مشفر ببصمات SHA256 لمنع الاحتيال والازدواج القيدي</p>
                        </div>

                        <Button
                            onClick={handleTriggerAuditScan}
                            className="bg-primary hover:bg-primary-dark text-white text-[9.5px] font-black h-8 px-4 rounded-xl flex items-center gap-1.5 self-center"
                        >
                            <UserCheck className="w-3.5 h-3.5" /> تدقيق أمني عاجل
                        </Button>
                    </div>

                    {/* Table of logs */}
                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/10 dark:bg-slate-900/10">
                        <table className="w-full text-right text-xs text-slate-700" dir="rtl">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-850 text-[10px]">
                                    <th className="px-4 py-3">الصفة والفاعل</th>
                                    <th className="px-4 py-3">البيان والعمليّة البصريّة</th>
                                    <th className="px-4 py-3 font-mono">طابع الـ IP</th>
                                    <th className="px-4 py-3 text-center">التوقيع التشجيبي Hash</th>
                                    <th className="px-4 py-3 text-center">النتيجة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-[10px]">
                                {auditLogs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                                        <td className="px-4 py-3.5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{log.actor}</span>
                                                <span className="text-[8.5px] text-slate-400 mt-0.5">{log.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 max-w-[280px]">
                                            <div className="flex flex-col">
                                                <span className="font-medium leading-relaxed">{log.action}</span>
                                                <span className="text-[8px] text-slate-400 mt-1 font-mono">{log.timestamp}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-slate-400 font-bold">
                                            {log.ipAddress}
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-mono text-[9px] text-primary dark:text-primary-light font-black">
                                            {log.shaHash}
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            {log.status === 'success' && <span className="bg-emerald-50 dark:bg-emerald-950/25 text-emerald-600 text-[8.5px] font-black px-1.5 py-0.5 rounded">مُثبت وموثّق</span>}
                                            {log.status === 'blocked' && <span className="bg-rose-50 dark:bg-rose-950/25 text-rose-600 text-[8.5px] font-black px-1.5 py-0.5 rounded">محظور وتنبيه</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

        </div>
    );
};
