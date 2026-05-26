import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ShieldCheck, 
    Lock, 
    Unlock, 
    RefreshCcw, 
    AlertTriangle, 
    Plus, 
    CheckCircle, 
    ArrowUpRight, 
    DollarSign,
    Percent,
    Eye
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useToast } from '../ui/Toast';

interface EscrowRecord {
    id: string;
    clientName: string;
    caseName: string;
    amount: number;
    status: 'held' | 'released' | 'refunded' | 'pending';
    heldAt: string;
    releasedAt?: string;
    lawyerName: string;
    consultantName: string;
    description: string;
}

interface EscrowTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
}

export const EscrowTab: React.FC<EscrowTabProps> = ({ formatCurrency }) => {
    const { addToast } = useToast();
    
    // Escrow Accounts data
    const [escrowList, setEscrowList] = useState<EscrowRecord[]>([
        {
            id: 'ESC-2024-901',
            clientName: 'بنك بوبيان الكويتي ش.م.ك',
            caseName: 'بنك بوبيان ضد شركة المقاولات الكويتية',
            amount: 15000.000,
            status: 'held',
            heldAt: '2024-05-12',
            lawyerName: 'المحامي فهد الرشيدي',
            consultantName: 'المستشار صبري شطا',
            description: 'رسوم حيازة الدفعة التشغيلية الأولى وعمولة الوساطة التعاقدية قبل مباشرة المرافعة أمام محكمة الاستئناف.'
        },
        {
            id: 'ESC-2024-902',
            clientName: 'السيد أحمد محمود العبدالله',
            caseName: 'تصفية تركة ورثة العبدالله التجارية',
            amount: 8500.000,
            status: 'released',
            heldAt: '2024-04-10',
            releasedAt: '2024-05-15',
            lawyerName: 'المحامية فاطمة علي',
            consultantName: 'المستشار صبري شطا',
            description: 'أتعاب تقسيم الأنصبة الشرعية وتدقيق أوراق الإشهار التجاري للمجموعة.'
        },
        {
            id: 'ESC-2024-903',
            clientName: 'مجموعة المرزوق الاستثمارية',
            caseName: 'نزاع شراكة مجموعة المرزوق التجارية',
            amount: 25000.000,
            status: 'held',
            heldAt: '2024-05-20',
            lawyerName: 'المحامي فهد الرشيدي',
            consultantName: 'المستشار أحمد الصالح',
            description: 'مبالغ تسوية صالحة للاقتسام بعد صدور تقرير الخبراء المعتمد من وزارة العدل.'
        },
        {
            id: 'ESC-2024-904',
            clientName: 'شركة الخليج للخدمات اللوجستية',
            caseName: 'مطالبة تعويض عن النقل العمالي الموازي',
            amount: 5200.000,
            status: 'refunded',
            heldAt: '2024-03-01',
            releasedAt: '2024-04-05',
            lawyerName: 'المحامي أحمد الصالح',
            consultantName: 'غير محدد',
            description: 'حيازة أمانة مستردة عقب إسقاط الخصومة وتسوية الطرفين النزاع ودياً.'
        }
    ]);

    // Split configuration
    const [selectedEscrow, setSelectedEscrow] = useState<EscrowRecord | null>(null);
    const [splitModalOpen, setSplitModalOpen] = useState(false);
    
    // Secure PIN dialog
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [pinValue, setPinValue] = useState('');
    const [escrowToRelease, setEscrowToRelease] = useState<EscrowRecord | null>(null);
    
    // Create new Escrow record form state
    const [createFormOpen, setCreateFormOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newCaseName, setNewCaseName] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newLawyer, setNewLawyer] = useState('المحامي فهد الرشيدي');
    const [newConsultant, setNewConsultant] = useState('المستشار صبري شطا');
    const [newDesc, setNewDesc] = useState('');

    const handleCreateEscrow = () => {
        if (!newClientName || !newCaseName || !newAmount) {
            addToast({
                type: 'error',
                title: 'خطأ في عملية الإيداع',
                message: 'يرجى تزويد اسم العميل والقضية ومبلغ الأمانة.'
            });
            return;
        }

        const amt = parseFloat(newAmount);
        if (isNaN(amt) || amt <= 0) {
            addToast({
                type: 'error',
                title: 'قيمة المبلع غير صالحة',
                message: 'يرجى كتابة رقم مالي صحيح.'
            });
            return;
        }

        const newRecord: EscrowRecord = {
            id: `ESC-2024-${Math.floor(Math.random() * 900) + 100}`,
            clientName: newClientName,
            caseName: newCaseName,
            amount: amt,
            status: 'held',
            heldAt: new Date().toISOString().split('T')[0],
            lawyerName: newLawyer,
            consultantName: newConsultant,
            description: newDesc || 'إيداع تأميني للعمليات الاستشارية المعتمدة.'
        };

        setEscrowList([newRecord, ...escrowList]);
        setCreateFormOpen(false);
        setNewClientName('');
        setNewCaseName('');
        setNewAmount('');
        setNewDesc('');
        
        addToast({
            type: 'success',
            title: 'تم الإيداع والحيازة بنجاح 🛡️',
            message: 'تم حجز المبلغ في الخزنة الإلكترونية المشتركة بنجاح.'
        });
    };

    const triggerReleaseProcess = (escrow: EscrowRecord) => {
        setEscrowToRelease(escrow);
        setPinValue('');
        setPinModalOpen(true);
    };

    const handleVerifyPinAndRelease = () => {
        if (pinValue !== '1234') {
            addToast({
                type: 'error',
                title: 'رمز الأمان PIN خاطئ',
                message: 'الرجاء إدخال رمز التحقق المالي الصحيح (رمز الاختبار الافتراضي: 1234).'
            });
            return;
        }

        if (!escrowToRelease) return;

        // update list
        setEscrowList(prev => prev.map(item => {
            if (item.id === escrowToRelease.id) {
                return {
                    ...item,
                    status: 'released',
                    releasedAt: new Date().toISOString().split('T')[0]
                };
            }
            return item;
        }));

        setPinModalOpen(false);
        setEscrowToRelease(null);
        addToast({
            type: 'success',
            title: 'تم تحرير الأموال بنجاح 🔓',
            message: 'تم تسييل قيمة السند وتم قيد العائدات لصالح الشركاء والملخص الضريبي.'
        });
    };

    const handleRefundEscrow = (escrow: EscrowRecord) => {
        if (confirm(`هل أنت متأكد من رغبتك في استرداد كامل أمانة (${escrow.clientName}) وإلغاء القفل القانوني؟`)) {
            setEscrowList(prev => prev.map(item => {
                if (item.id === escrow.id) {
                    return {
                        ...item,
                        status: 'refunded',
                        releasedAt: new Date().toISOString().split('T')[0]
                    };
                }
                return item;
            }));

            addToast({
                type: 'info',
                title: 'تم رد الأمانة بالكامل ↩️',
                message: 'أعيدت الحوالة المالية لحساب الموكل البنكي وتم تسجيل قيد الصرف.'
            });
        }
    };

    const triggerSplitView = (escrow: EscrowRecord) => {
        setSelectedEscrow(escrow);
        setSplitModalOpen(true);
    };

    // Calculate Split shares
    const lawyerSharePercent = 30; // 30%
    const consultantSharePercent = 45; // 45%
    const platformSharePercent = 25; // 25%

    return (
        <div className="space-y-6 text-right" dir="rtl">
            
            {/* Header Control Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dm-card p-5 rounded-[2rem] shadow-sm border border-slate-150 dark:border-slate-800">
                <div>
                    <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" /> البوابة الأمنية لإدارة ومقاصة الضمان المحجوز (Escrow Accounts)
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">حيازة مؤمنة لأتعاب المتقاضين وفق الشروط الجزائية للمادة 17 من قانون الترافع الكويتي</p>
                </div>

                <Button
                    onClick={() => setCreateFormOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 px-5 flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
                >
                    <Plus className="w-4 h-4" /> فتح حيازة أمانة جديدة
                </Button>
            </div>

            {/* Main Escrow Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* List portion */}
                <div className="xl:col-span-8 space-y-4">
                    {escrowList.map((escrow) => (
                        <div 
                            key={escrow.id}
                            className="bg-white dark:bg-dm-card p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-indigo-500/20 transition-all"
                        >
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-slate-850 dark:text-white block">{escrow.clientName}</span>
                                    <span className="text-[9px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-2 py-0.5 rounded-md">{escrow.id}</span>
                                    
                                    {escrow.status === 'held' && <span className="text-[8px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg flex items-center gap-1"><Lock className="w-2.5 h-2.5" /> محجوزة بالضمان</span>}
                                    {escrow.status === 'released' && <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg flex items-center gap-1"><Unlock className="w-2.5 h-2.5" /> تم فك حظرها وسدادها</span>}
                                    {escrow.status === 'refunded' && <span className="text-[8px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-lg flex items-center gap-1">↩️ تم رد الأمانة بمخالصة</span>}
                                </div>

                                <p className="text-[11px] font-black text-slate-400 dark:text-slate-500">{escrow.caseName}</p>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-normal max-w-xl">{escrow.description}</p>
                                
                                <div className="flex gap-4 text-[9px] font-bold text-slate-400 flex-wrap pt-1">
                                    <span>المسؤول المالي: <strong className="text-slate-500">{escrow.lawyerName}</strong></span>
                                    <span>تاريخ الإيداع: <strong className="text-slate-500">{escrow.heldAt}</strong></span>
                                    {escrow.releasedAt && <span>تاريخ المقاصة: <strong className="text-slate-500">{escrow.releasedAt}</strong></span>}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3 self-stretch justify-between min-w-[150px] shrink-0">
                                <div className="text-left w-full">
                                    <span className="text-[9px] text-slate-400 block font-bold">المبلغ المودع بالخزنة:</span>
                                    <span className="text-xl font-black font-mono text-indigo-650 dark:text-indigo-400 block">{formatCurrency(escrow.amount)}</span>
                                </div>

                                <div className="flex gap-1.5 w-full justify-end">
                                    <button
                                        onClick={() => triggerSplitView(escrow)}
                                        className="p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-850 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-850 flex items-center gap-1 text-[9px] font-black"
                                        title="عرض توزيع الحصص"
                                    >
                                        <Percent className="w-3.5 h-3.5" />
                                        مقاصة Splitting
                                    </button>

                                    {/* Conditional controls based on held / active state */}
                                    {escrow.status === 'held' && (
                                        <>
                                            <button
                                                onClick={() => triggerReleaseProcess(escrow)}
                                                className="px-3 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[9px] font-black flex items-center gap-1"
                                            >
                                                <Unlock className="w-3 h-3" />
                                                إفراج المالي
                                            </button>
                                            <button
                                                onClick={() => handleRefundEscrow(escrow)}
                                                className="p-1.5 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600"
                                                title="رد المبلغ للموكل"
                                            >
                                                <RefreshCcw className="w-3.5 h-3.5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar guide with security overview */}
                <div className="xl:col-span-4 space-y-6">
                    <Card className="border-none shadow-md rounded-[2rem] p-6 bg-slate-900 text-white space-y-4">
                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider">المنظومة الأمنية للمقاصة الرقمية</h4>
                        <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
                            لتأمين الحفظ الضماني، تعتمد الإدارة المالية بوابة حيازة مشددة. المبالغ المودعة تعزل تلقائياً في حساب الخزنة البنكية المنفصل لبيت التمويل الكويتي، ولا يسمح بالصرف أو الاسترداد إلا بتسجيل PIN الشخصي للمدير التنفيذي المالي وتوثيق التوقيع الرقمي.
                        </p>1
                        <div className="border-t border-slate-800 pt-3 space-y-2 text-[9px] font-bold text-slate-400">
                            <div className="flex justify-between">
                                <span>حركات الضمان هذا الربع:</span>
                                <span className="text-white font-mono">14 حوالة</span>
                            </div>
                            <div className="flex justify-between">
                                <span>معدل السيولة المفرج عنها:</span>
                                <span className="text-emerald-400 font-mono">354,800 KWD</span>
                            </div>
                            <div className="flex justify-between">
                                <span>فترة التصفية المتوسطة:</span>
                                <span className="text-white font-mono">22 يوماً</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-none shadow-md rounded-[2rem] p-6 bg-white dark:bg-dm-card space-y-3 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black text-indigo-650 tracking-wider block">الاختبار السريع للنظام:</span>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-relaxed font-bold">
                            للتحقق من إجراءات فك حيازة وسداد الأموال وإخلاء عهدة العميل، يمكنك الضغط على "إفراج المالي" ثم إدخال رمز التحقق التجريبي الافتراضي: <strong>1234</strong> لمشاهدة دورة المقاصة كاملة بالمنظومة.
                        </p>
                    </Card>
                </div>

            </div>

            {/* Modal 1: Split Fees & Commission breakdowns view */}
            <AnimatePresence>
                {splitModalOpen && selectedEscrow && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-dm-card rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl space-y-6 text-right"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
                                    <Percent className="w-5 h-5 text-indigo-650" /> مقاصة وتوزيع عوائد حوالة أمانة: {selectedEscrow.id}
                                </h4>
                                <button onClick={() => setSplitModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-black">&times;</button>
                            </div>

                            <p className="text-xs text-slate-500 font-bold">
                                يتم احتساب حصص المقاصة الموزعة والمستقطعة من قيمة أتعاب العقد على النحو التالي:
                            </p>

                            <div className="space-y-3.5">
                                {/* Row 1: Entire Total */}
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">القيمة الإجمالية للعقد (Gross Amount)</span>
                                    <span className="font-mono text-sm font-black text-slate-850 dark:text-white">{formatCurrency(selectedEscrow.amount)}</span>
                                </div>

                                {/* Share 1: Lawyer */}
                                <div className="p-4 bg-white dark:bg-dm-card border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-450 block">المسؤول والمحامي الترافعي (Lawyer Share)</span>
                                        <span className="text-[9px] text-indigo-600 font-semibold">{selectedEscrow.lawyerName} ({lawyerSharePercent}%)</span>
                                    </div>
                                    <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">{formatCurrency(selectedEscrow.amount * lawyerSharePercent / 100)}</span>
                                </div>

                                {/* Share 2: Consultant */}
                                <div className="p-4 bg-white dark:bg-dm-card border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <span className="text-[10px] font-black text-slate-450 block">المستشار القانوني الصائغ للبنود (Consultant Share)</span>
                                        <span className="text-[9px] text-indigo-600 font-semibold">{selectedEscrow.consultantName} ({consultantSharePercent}%)</span>
                                    </div>
                                    <span className="font-mono text-xs font-black text-slate-800 dark:text-slate-200">{formatCurrency(selectedEscrow.amount * consultantSharePercent / 100)}</span>
                                </div>

                                {/* Share 3: Platform Fees */}
                                <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/25 border border-indigo-100/50 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <span className="text-[10px] font-black text-indigo-650 dark:text-indigo-400 block">عمولة ورسوم إدارة المنظومة التشغيلية (Platform Yield)</span>
                                        <span className="text-[9px] text-indigo-500 font-semibold">استقطاع حوكمة تلقائي ({platformSharePercent}%)</span>
                                    </div>
                                    <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(selectedEscrow.amount * platformSharePercent / 100)}</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={() => setSplitModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 h-10 px-6 rounded-xl text-xs font-black">غلق النافذة</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 2: PIN Verification Dialog */}
            <AnimatePresence>
                {pinModalOpen && escrowToRelease && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15 }}
                            className="bg-white dark:bg-dm-card rounded-[2.5rem] p-8 max-w-sm w-full shadow-2.5xl space-y-6 text-center"
                        >
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-rose-50 rounded-full text-rose-600 mb-3 animate-pulse">
                                    <Lock className="w-8 h-8" />
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">إدخال رمز تفويض التفريغ المالي (PIN)</h4>
                                <p className="text-[10px] text-slate-400 mt-1">المحاسبة القانونية والتدقيق المالي</p>
                            </div>

                            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                                أنت على وشك الإفراج المالي التام عن قيمة حوالة الضمان للعميل: <strong>{escrowToRelease.clientName}</strong> بقيمة <strong className="text-indigo-600">{formatCurrency(escrowToRelease.amount)}</strong>.
                            </p>

                            <div className="space-y-4">
                                <Input 
                                    type="password"
                                    placeholder="••••"
                                    maxLength={4}
                                    value={pinValue}
                                    onChange={(e) => setPinValue(e.target.value)}
                                    className="text-center font-mono text-2xl tracking-widest bg-slate-50 border-2 border-slate-150 h-14"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleVerifyPinAndRelease();
                                    }}
                                />
                                <span className="text-[8px] text-slate-400 block font-bold leading-none mt-1">أدخل رمز الأمان المعتمد للمحاسب '1234' للمطابقة</span>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => setPinModalOpen(false)} 
                                    variant="secondary"
                                    className="flex-1 font-black text-xs rounded-xl h-10"
                                >
                                    إلغاء الأمر
                                </Button>
                                <Button 
                                    onClick={handleVerifyPinAndRelease} 
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl h-10 shadow-md shadow-emerald-500/10"
                                >
                                    تحرير الأرصدة
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal 3: Open/Add Escrow record */}
            <AnimatePresence>
                {createFormOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-white dark:bg-dm-card rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl space-y-5 text-right"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5 animate-pulse">
                                    <ShieldCheck className="w-5 h-5 text-indigo-650" /> إيداع أمانة وضمان مالي للمتقاضين (Escrow Hold)
                                </h4>
                                <button onClick={() => setCreateFormOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-black">&times;</button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="اسم الموكل / العميل"
                                    placeholder="مثلاً: شركة الاتصالات الوطنية..."
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    required
                                />
                                <Input 
                                    label="مبلغ الأمانة المحجوزة KWD"
                                    placeholder="0.000"
                                    type="number"
                                    value={newAmount}
                                    onChange={(e) => setNewAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <Input 
                                label="اسم الدعوى / الخصومة القضائية"
                                placeholder="مثلاً: ورثة فلان ضد مؤسسة فلان..."
                                value={newCaseName}
                                onChange={(e) => setNewCaseName(e.target.value)}
                                required
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-400">اسم المحامي المكلف</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                                        value={newLawyer}
                                        onChange={(e) => setNewLawyer(e.target.value)}
                                    >
                                        <option value="المحامي فهد الرشيدي">المحامي فهد الرشيدي</option>
                                        <option value="المحامية فاطمة علي">المحامية فاطمة علي</option>
                                        <option value="المحامي أحمد الصالح">المحامي أحمد الصالح</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-450 dark:text-slate-400">المستشار الفاحص</label>
                                    <select 
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold"
                                        value={newConsultant}
                                        onChange={(e) => setNewConsultant(e.target.value)}
                                    >
                                        <option value="المستشار صبري شطا">المستشار صبري شطا</option>
                                        <option value="المستشار أحمد الصالح">المستشار أحمد الصالح</option>
                                        <option value="دائرة التحكيم والخبراء">دائرة التحكيم والخبراء</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-450 dark:text-slate-400">الشرح وتوجيه الحجز</label>
                                <textarea 
                                    rows={3}
                                    placeholder="اكتب الغرض من حجز هذه الأمانة وتاريخ المقاصة المقرر وشروط الإفراح..."
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-medium"
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                />
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 flex gap-1.5">
                                <span className="text-amber-500 text-xs shrink-0 block">⚠️</span>
                                <p className="text-[9px] text-slate-400 leading-normal font-bold">
                                    بموجب المادة 12، سيتم عزل هذه الأموال فور تأكيد الإيداع في السجل العام وسيقتطع النظام عمولة الحوكمة والترقية البالغة 25% تلقائياً عند الإفراج الفعلي.
                                </p>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <Button 
                                    onClick={() => setCreateFormOpen(false)} 
                                    variant="secondary"
                                    className="text-xs font-black rounded-xl h-10 px-5"
                                >
                                    إلغاء الأمر
                                </Button>
                                <Button 
                                    onClick={handleCreateEscrow} 
                                    className="bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-black rounded-xl h-10 px-6 shadow-md shadow-indigo-600/15"
                                >
                                    تأكيد الإيداع بالأمانة
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
};
