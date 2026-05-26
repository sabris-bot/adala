import React from 'react';
import { motion } from 'motion/react';
import { 
    User, Award, Landmark, Hammer, Archive, CheckCircle2, 
    ArrowRight, Sparkles, AlertCircle, FileText
} from 'lucide-react';
import Card from '../ui/Card';
import { useToast } from '../ui/Toast';
import { useNavigate } from 'react-router-dom';

interface SystemIntegrationsPanelProps {
    contractId: string;
    contractTitle: string;
    secondPartyName: string;
    salary: number;
    effectiveDate: string;
    overallRisk: string;
}

export const SystemIntegrationsPanel: React.FC<SystemIntegrationsPanelProps> = ({
    contractId,
    contractTitle,
    secondPartyName,
    salary,
    effectiveDate,
    overallRisk
}) => {
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleSyncHR = () => {
        addToast({
            type: 'success',
            title: 'تم التزامن مع ملف الموظف',
            message: `تم توريد وتحديث الراتب (${salary} د.ك) والمسمى والتبعية للموظف "فيصل عبدالرحمن" بنجاح.`
        });
    };

    const handleNavigateToEOS = () => {
        addToast({
            type: 'info',
            title: 'ترحيل البيانات لمكافأة المستحقات',
            message: 'جاري الانتقال لوحدة احتساب مستحقات نهاية الخدمة والمسودة المحملة...'
        });
        // Transition deep link simulating parameters
        setTimeout(() => {
            navigate(`/end-of-service?employee=${secondPartyName}&salary=${salary}&startDate=${effectiveDate}`);
        }, 800);
    };

    const handleSyncAccounting = () => {
        addToast({
            type: 'success',
            title: 'توليد القيود المالية التلقائية',
            message: `تم بنجاح تشييد وتوليد قيود استحقاق الرواتب والأملاك المالية تماشياً مع الدليل المحاسبي وحساب البنك.`
        });
    };

    const handleEscalateLitigation = () => {
        addToast({
            type: 'warning',
            title: 'تم ترحيل تصعيد النزاع العمالي',
            message: 'تم توليد شكوى علاقات عمل عمالية وإحالتها لقسم Litigation وصياغة عريضة الدعوى تلافياً للتقادم.'
        });
        setTimeout(() => {
            navigate(`/litigation-tools`);
        }, 800);
    };

    const handleArchiveToLibrary = () => {
        addToast({
            type: 'success',
            title: 'تم الأرشفة المركزية الدائمة',
            message: `تم ختم المستند برقم وتوثيق أمان مشفر وتخزينه في الأرشيف المركزي المعتمد للبلاد بنجاح.`
        });
    };

    return (
        <div id="system-integrations-container" className="space-y-6">
            <div className="bg-white dark:bg-dm-card p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800/80">
                <div className="border-b border-slate-50 dark:border-slate-800 pb-5 mb-6">
                    <h3 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" /> التكامل السحابي والروابط البينية للنظام
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold mt-1">
                        يربط هذا القسم العقد بالملفات الإدارية الأخرى كالرواتب والمنازعات والمدفوعات والمكافآت بنقرة واحدة لامتياز التدبير المترابط.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Integration Card 1: HR System */}
                    <Card className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                        <div className="p-5 space-y-3">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 w-fit rounded-2xl">
                                <User className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">سحب ومطابقة ملف الموظف (HR)</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                مطابقة العقد وسنوات التوظيف في السجل المدني للشركة وتصحيح تفاصيل الرسوم وتعيينات العلاوات ومجلس الإدارة.
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-5">
                            <span className="text-[9px] font-black text-indigo-600">نشط ومتوفر</span>
                            <button 
                                onClick={handleSyncHR}
                                className="text-[9px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                            >
                                مزامنة الآن <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </Card>

                    {/* Integration Card 2: End of service / Settlement system */}
                    <Card className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                        <div className="p-5 space-y-3">
                            <div className="p-3 bg-emerald-55/35 dark:bg-emerald-950/20 text-emerald-605 w-fit rounded-2xl">
                                <Award className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">تسوية مستحقات نهاية الخدمة (EOS)</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                احتساب وحفظ مبالغ ونقاط نهاية الخدمة طبقاً للمادة 51 بترحيل الرواتب وتاريخ توقيع المباشرة إلى وحدة المعالجة والتسوية.
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-5">
                            <span className="text-[9px] font-black text-emerald-650">مترابط لدنيا</span>
                            <button 
                                onClick={handleNavigateToEOS}
                                className="text-[9px] font-black text-slate-700 dark:text-slate-305 flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                            >
                                ترحيل واحتساب المستحقات <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </Card>

                    {/* Integration Card 3: Payroll Accounting & Financial Ledger */}
                    <Card className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                        <div className="p-5 space-y-3">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 w-fit rounded-2xl">
                                <Landmark className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">سداد الرواتب والميزانيات العمومية</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                ربط وتوثيق شروط السداد والبدلات النقدية للخدمات بجدول كشوف المرتبات والأرباح لتوليد قيود دفع شهرية تلقائية.
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-5">
                            <span className="text-[9px] font-black text-amber-600">جاهز للتفعيل</span>
                            <button 
                                onClick={handleSyncAccounting}
                                className="text-[9px] font-black text-slate-700 dark:text-slate-305 flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                            >
                                تحديث الدليل المالي <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </Card>

                    {/* Integration Card 4: Legal disputes & litigation action */}
                    <Card className={`border rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between ${overallRisk === 'High' ? 'border-rose-200 bg-rose-50/10' : 'border-slate-100 dark:border-slate-800'}`}>
                        <div className="p-5 space-y-3">
                            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 w-fit rounded-2xl">
                                <Hammer className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">إدارة النزاعات والمحاكم العمالية</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                في حال الشروط الجائرة أو النزاع العالي، صعد العقد مع كافة ملحوظات والمراجع كصحيفة اتهام لقضاة الرقعي.
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-5">
                            <span className="text-[9px] font-black text-rose-600">
                                {overallRisk === 'Medium' || overallRisk === 'High' ? '⚠️ يتطلب مراجعة قضائية' : 'آمن ومستقر'}
                            </span>
                            <button 
                                onClick={handleEscalateLitigation}
                                className="text-[9px] font-black text-slate-700 dark:text-slate-305 flex items-center gap-1.5 hover:text-rose-600 transition-colors"
                            >
                                تصعيد كنزاع عمالي رئيسي <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </Card>

                    {/* Integration Card 5: Central Document Archive */}
                    <Card className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                        <div className="p-5 space-y-3">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 w-fit rounded-2xl">
                                <Archive className="w-5 h-5" />
                            </div>
                            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">حفظ وأرشفة الوثائق المركزية بالبلاد</h4>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                ترحيل النسخة الختمية المصدقة بروابطها الممسوحة ضوئياً إلى الخادم السحابي المشفر للشركة لضمان الأمان والتدقيق اللاحق.
                            </p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-5">
                            <span className="text-[9px] font-black text-indigo-600">مؤرشف ومشفر</span>
                            <button 
                                onClick={handleArchiveToLibrary}
                                className="text-[9px] font-black text-slate-700 dark:text-slate-305 flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
                            >
                                التخزين المركزي <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
