import React, { useState, useMemo } from 'react';
import { Employee, Investigation } from '../../types';
import { OFFICE_NAME } from '../../constants';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { PrinterIcon, CheckCircle2, Clock, Send, AlertCircle, FileText, Calendar, MapPin, User, ShieldCheck } from 'lucide-react';

interface InvestigationSummonsModalProps {
    isOpen: boolean;
    onClose: () => void;
    investigation?: Investigation | any | null;
    employee?: Employee | any | null;
    witnessName?: string;
    allCases?: any[];
    allEmployees?: any[];
}

export const InvestigationSummonsModal: React.FC<InvestigationSummonsModalProps> = ({ 
    isOpen, 
    onClose, 
    investigation: initialInvestigation, 
    employee: initialEmployee,
    witnessName,
    allCases = [],
    allEmployees = []
}) => {
    if (!isOpen) return null;

    // Selected state
    const [selectedCaseId, setSelectedCaseId] = useState<string>(initialInvestigation?.id || initialInvestigation?.caseNumber || (allCases[0]?.id || ''));
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(initialEmployee?.id || (allEmployees[0]?.id || ''));
    
    // Custom Summons Form Parameters
    const [summonsType, setSummonsType] = useState<'summons' | 'formal_notice'>('summons');
    const [summonsDate, setSummonsDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [summonsTime, setSummonsTime] = useState<string>('10:00 صباحاً');
    const [summonsLocation, setSummonsLocation] = useState<string>('مقر الإدارة القانونية - المكتب الرئيسي');
    const [deliveryStatus, setDeliveryStatus] = useState<'DELIVERED_HAND' | 'SENT_REGISTERED' | 'PENDING' | 'ELECTRONIC'>('DELIVERED_HAND');
    const [deliveryNotes, setDeliveryNotes] = useState<string>('');

    // Load dynamic office name
    const officeNameAr = useMemo(() => {
        try {
            const savedOffice = localStorage.getItem('profile_office_info');
            if (savedOffice) {
                const parsed = JSON.parse(savedOffice);
                if (parsed.name) return parsed.name;
            }
        } catch (e) {}
        return OFFICE_NAME;
    }, []);

    // Derived current investigation case & employee
    const activeCase = useMemo(() => {
        if (initialInvestigation && (!selectedCaseId || selectedCaseId === initialInvestigation.id)) return initialInvestigation;
        return allCases.find(c => c.id === selectedCaseId || c.caseNumber === selectedCaseId) || initialInvestigation || allCases[0] || null;
    }, [selectedCaseId, initialInvestigation, allCases]);

    const activeEmployee = useMemo(() => {
        if (initialEmployee && (!selectedEmployeeId || selectedEmployeeId === initialEmployee.id)) return initialEmployee;
        return allEmployees.find(e => e.id === selectedEmployeeId) || initialEmployee || allEmployees[0] || null;
    }, [selectedEmployeeId, initialEmployee, allEmployees]);

    const targetName = witnessName || activeCase?.employeeName || activeEmployee?.fullNameAr || activeEmployee?.fullName || "المحتكم إليه / المعلن";
    const targetJob = witnessName ? "شاهد ومقرر أقوال" : (activeCase?.employeeJobTitle || activeEmployee?.jobTitle || "موظف بالمنشأة");
    const targetId = witnessName ? "شاهد عيان" : (activeCase?.employeeId || activeEmployee?.employeeId || activeEmployee?.civilId || "غير محدد");
    const caseRefNo = activeCase?.caseNumber || activeCase?.investigationNumber || `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const caseSubject = activeCase?.subject || "واقعة التحقيق والاستدلال القائمة بنظام عدالة";

    const printSummons = () => {
        const printContent = document.getElementById("printable-summons-content");
        if (printContent) {
            const printWindow = window.open('', '', 'height=750,width=900');
            if (printWindow) {
                printWindow.document.write('<html><head><title>إعلان ومحضر استدعاء رسمي للتحقيق</title>');
                printWindow.document.write('<style>');
                printWindow.document.write(`
                    body { font-family: "Georgia", serif; direction: rtl; padding: 40px; color: #0f172a; background-color: #fff; line-height: 1.6; }
                    .summons-border { border: 3px double #0f172a; padding: 35px; border-radius: 8px; position: relative; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
                    .title { text-align: center; margin-bottom: 30px; }
                    .title h1 { font-size: 22px; font-weight: 900; text-decoration: underline; text-underline-offset: 6px; }
                    .content { line-height: 1.8; margin-bottom: 30px; font-size: 14px; }
                    .info-box { background: #f8fafc; padding: 20px; border-right: 5px solid #0f172a; margin: 20px 0; border-radius: 6px; border: 1px solid #e2e8f0; }
                    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; text-align: center; }
                    .date-card { border: 1px solid #cbd5e1; padding: 15px; background: #f1f5f9; border-radius: 6px; }
                    .warning-box { border: 1px solid #fecaca; background: #fff5f5; padding: 15px; border-radius: 6px; font-weight: bold; font-size: 12px; color: #991b1b; }
                    .status-badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 12px; font-size: 11px; font-weight: bold; }
                    .sign-grid { display: flex; justify-content: space-between; margin-top: 50px; }
                    .sign-box { text-align: center; width: 220px; }
                    .stamp-circle { width: 90px; height: 90px; border: 2px dashed #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; margin: 0 auto; }
                `);
                printWindow.document.write('</style></head><body><div class="summons-border">');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</div></body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="مركز إصدار الاستدعاءات والإشعارات الرسمية" size="xl">
            <div className="p-2 space-y-6 text-right font-sans" dir="rtl">
                
                {/* Top Control Settings Panel */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4 text-xs font-bold text-slate-700">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                        <span className="flex items-center gap-2 font-black text-slate-900 text-xs">
                            <FileText className="w-4 h-4 text-amber-600" />
                            بيانات وإعدادات كتاب الإعلان والاستدعاء
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-mono">
                            نظام عدالة v3 • قانون العمل الكويتي
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Select Case if available */}
                        {allCases.length > 0 && (
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 block">ربط بملف تحقيق قائم:</label>
                                <select 
                                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-slate-400"
                                    value={selectedCaseId}
                                    onChange={(e) => setSelectedCaseId(e.target.value)}
                                >
                                    {allCases.map(c => (
                                        <option key={c.id} value={c.id}>
                                            #{c.caseNumber} - {c.employeeName} ({c.subject})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Summons Type */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 block">نوع المخطاط / الإعلان:</label>
                            <select 
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-slate-400"
                                value={summonsType}
                                onChange={(e) => setSummonsType(e.target.value as any)}
                            >
                                <option value="summons">إخطار واستدعاء للحضور الشخصي للتحقيق</option>
                                <option value="formal_notice">كتاب إعلان رسمي بموضوع المخالفة والتكليف</option>
                            </select>
                        </div>

                        {/* Delivery Status */}
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 block">حالة التسليم والإعلان الحالي:</label>
                            <select 
                                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-slate-400"
                                value={deliveryStatus}
                                onChange={(e) => setDeliveryStatus(e.target.value as any)}
                            >
                                <option value="DELIVERED_HAND">تم التسليم شخصياً وتوقيع المستلم ✓</option>
                                <option value="SENT_REGISTERED">أُرسل بالبريد المسجل مع علم الوصول ✉️</option>
                                <option value="ELECTRONIC">أُرسل إلكترونياً (البريد/تطبيق هويتي) 📱</option>
                                <option value="PENDING">قيد التسليم والإعلان الجاري ⏳</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 block">تاريخ جلسة الحضور:</label>
                            <input 
                                type="date"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-slate-400"
                                value={summonsDate}
                                onChange={(e) => setSummonsDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 block">التوقيت المحدد للجلسة:</label>
                            <input 
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-slate-400"
                                value={summonsTime}
                                onChange={(e) => setSummonsTime(e.target.value)}
                                placeholder="مثال: 10:00 صباحاً"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 block">موقع ومكان المباشرة:</label>
                            <input 
                                type="text"
                                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold focus:outline-none focus:border-slate-400"
                                value={summonsLocation}
                                onChange={(e) => setSummonsLocation(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Printable Certificate Box */}
                <div id="printable-summons-content" className="p-8 bg-white text-slate-900 border-2 border-slate-900 rounded-2xl shadow-inner font-serif text-right space-y-6">
                    
                    {/* Header */}
                    <div className="header flex justify-between items-center border-b-2 border-slate-900 pb-4">
                        <div className="space-y-0.5">
                            <h1 className="text-xl font-black text-slate-950">أ. صبري شطا</h1>
                            <h2 className="text-sm font-bold text-slate-800">مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</h2>
                            <p className="text-xs font-bold text-emerald-800">منظومة الإدارة القانونية والامتثال «عدالة»</p>
                            <p className="text-[10px] text-slate-500">قطاع شؤون الامتثال والتحقيقات العمالية</p>
                        </div>
                        <div className="text-left font-mono text-xs space-y-0.5">
                            <p><strong>قيد الملف:</strong> #{caseRefNo}</p>
                            <p><strong>تاريخ التحرير:</strong> {new Date().toLocaleDateString('ar-KW')}</p>
                            <p className="text-[10px] text-slate-500">
                                <strong>حالة الإعلان:</strong> {
                                    deliveryStatus === 'DELIVERED_HAND' ? 'مُسلّم شخصياً' :
                                    deliveryStatus === 'SENT_REGISTERED' ? 'مسجل بريدياً' :
                                    deliveryStatus === 'ELECTRONIC' ? 'مرسل إلكترونياً' : 'قيد التسليم'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="title text-center space-y-2">
                        <h1 className="text-xl font-black underline underline-offset-8 text-slate-950">
                            {summonsType === 'summons' ? 'إعلان رسمـي بالمثول والتكليف بالحضور للتحقيق' : 'إخطـار وإعلان رسمـي بموضوع المخالفة والإفادة'}
                        </h1>
                        <p className="text-[11px] font-black text-slate-600">
                            (إخطار إداري وقانوني ملزم بموجب أحكام المادة 102 من قانون العمل الكويتي رقم 6 لسنة 2010)
                        </p>
                    </div>

                    {/* Target Employee Info Card */}
                    <div className="bg-slate-50 p-4 border rounded-xl space-y-2 text-sm leading-relaxed">
                        <div className="grid grid-cols-2 gap-4">
                            <p>المعلن إليه / السيد: <strong className="text-slate-950 text-base">{targetName}</strong></p>
                            <p>المسمى الوظيفي: <strong className="text-slate-900">{targetJob}</strong></p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                            <p>الرقم التعريفي / الوظيفي: <strong className="text-slate-900 font-mono">{targetId}</strong></p>
                            <p>الجهة / القسم المستهدف: <strong className="text-slate-900">{activeCase?.employeeDepartment || "الإدارة العامة"}</strong></p>
                        </div>
                    </div>

                    {/* Content text */}
                    <div className="content space-y-4 text-sm leading-relaxed text-slate-800">
                        <div className="info-box p-4 bg-slate-50/80 border-r-4 border-slate-900 rounded-lg space-y-2">
                            <p className="font-black text-slate-900">تحية طيبة وبعد ،،،</p>
                            <p>
                                بناءً على الصلاحيات القانونية المنظمة للعمل الداخلي بدولة الكويت، وحيث تقرر فتح وتباشر الإدارة القانونية إجراءات الاستدلال والتحقيق في الوقائع المنسوبة بملف التحقيق رقم (<strong className="text-slate-950 font-mono">{caseRefNo}</strong>) وموضوعها:
                            </p>
                            <p className="p-3 bg-white border border-slate-200 rounded-lg font-black text-slate-900 text-sm">
                                "{caseSubject}"
                            </p>
                            <p className="mt-2 font-medium">
                                بناءً عليه، يُعلَن سيادتكم بضرورة الحضور الشخصي أمام الباحث والمحقق القانوني بالإدارة، وذلك للاستماع لأقوالكم ومواجهتكم بالأوراق والمستندات المرفقة بالملف، وذلك في الموعد المحدد تالياً:
                            </p>
                        </div>

                        {/* Date and Location Grid */}
                        <div className="dates-grid grid grid-cols-2 gap-4 text-center">
                            <div className="date-card p-4 border rounded-xl bg-slate-50 space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase">تاريخ وساعة الجلسة</p>
                                <p className="font-black text-slate-950 text-sm">
                                    {new Date(summonsDate).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-xs font-extrabold text-amber-700">الساعة: {summonsTime}</p>
                            </div>

                            <div className="date-card p-4 border rounded-xl bg-slate-50 space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase">مقر المثول واللجنة</p>
                                <p className="font-black text-slate-950 text-sm">{summonsLocation}</p>
                                <p className="text-xs font-bold text-slate-600">رئيس اللجنة: {activeCase?.investigator || "المحقق القانوني المعتمد"}</p>
                            </div>
                        </div>

                        {/* Legal Safeguards Warning Box */}
                        <div className="warning-box p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-2">
                            <p className="text-[11px] font-black flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-rose-700" />
                                الضمانات والتنبيهات القانونية الرسمية (وفقاً للمادتين 35 و 102 من قانون العمل):
                            </p>
                            <ul className="list-disc list-inside text-xs space-y-1 font-bold pr-2">
                                <li>حضور التحقيق والإدلاء بالشهادة أو الأقوال واكب قانوني ملزم يحفظ حقوق طرفي العلاقة العمالية.</li>
                                <li>يحق للمعلن إليه تقديم المذكرات أو الأدلة والمستندات الكتابية وطلب ضمها للملف.</li>
                                <li>التخلف عن الحضور دون عذر قهري أو مبرر مقبول يترتب عليه استكمال الإجراءات والبت في التوصيات غيابياً.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Signatures & Stamps */}
                    <div className="sign-grid flex justify-between items-end pt-8 border-t border-slate-200 text-sm font-bold">
                        <div className="sign-box text-center space-y-8">
                            <p className="font-black text-slate-900">توقيع وصفة المستلم للإعلان</p>
                            <div className="space-y-1 text-slate-400 text-[10px]">
                                <p className="border-b border-dashed border-slate-400 w-44 mx-auto pb-1">الاسم: .......................................</p>
                                <p className="border-b border-dashed border-slate-400 w-44 mx-auto pb-1">التوقيع: ....................................</p>
                            </div>
                        </div>

                        <div className="sign-box text-center space-y-3">
                            <p className="font-black text-slate-900">المصادقة والختم الرسمي</p>
                            <div className="stamp-circle border-2 border-dashed border-slate-300 rounded-full w-24 h-24 mx-auto flex items-center justify-center text-[9px] text-slate-400 font-bold p-2">
                                ختم الإدارة القانونية - عدالة
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-200">
                    <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">
                        إغلاق
                    </Button>
                    <Button variant="primary" onClick={printSummons} leftIcon={<PrinterIcon className="w-4 h-4" />} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black">
                        طباعة كراسة الاستدعاء والإعلان
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

