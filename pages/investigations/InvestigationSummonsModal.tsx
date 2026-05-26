import React from 'react';
import { Employee, Investigation } from '../../types';
import { OFFICE_NAME } from '../../constants';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { PrinterIcon } from 'lucide-react';

interface InvestigationSummonsModalProps {
    isOpen: boolean;
    onClose: () => void;
    investigation: Investigation | null;
    employee: Employee | null;
    witnessName?: string;
}

export const InvestigationSummonsModal: React.FC<InvestigationSummonsModalProps> = ({ 
    isOpen, 
    onClose, 
    investigation, 
    employee,
    witnessName
}) => {
    if (!investigation) return null;
    
    const targetName = witnessName || employee?.fullNameAr || "المعلن إليه";
    const targetJob = witnessName ? "شاهد ومقرر أقوال" : (employee?.jobTitle || "موظف بالمنشأة");
    const targetId = witnessName ? "شاهد عيان" : (employee?.employeeId || "غير معروف");

    const printSummons = () => {
        const printContent = document.getElementById("printable-summons-content");
        const originalContent = document.body.innerHTML;
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>إعلان مثول للتحقيق</title>');
                printWindow.document.write('<style>');
                printWindow.document.write(`
                    body { font-family: "Georgia", serif; direction: rtl; padding: 40px; color: #1e293b; background-color: #fff; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
                    .title { text-align: center; margin-bottom: 40px; }
                    .title h1 { font-size: 24px; font-weight: 900; text-decoration: underline; }
                    .content { line-height: 1.8; margin-bottom: 40px; font-size: 15px; }
                    .info-box { background: #f8fafc; padding: 20px; border-right: 5px solid #0f172a; margin: 20px 0; border-radius: 4px; }
                    .dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; text-align: center; }
                    .date-card { border: 1px solid #cbd5e1; padding: 15px; background: #f1f5f9; border-radius: 6px; }
                    .warning-box { border: 1px solid #fecaca; background: #fff5f5; padding: 15px; border-radius: 6px; font-weight: bold; font-size: 12px; color: #991b1b; }
                    .sign-grid { display: flex; justify-content: space-between; margin-top: 60px; }
                    .sign-box { text-align: center; width: 200px; }
                `);
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        } else {
            window.print();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إعلان رسمي للمثول أمام التحقيق" size="lg">
            <div className="p-1" dir="rtl">
                <div id="printable-summons-content" className="p-8 bg-white text-slate-900 border rounded-xl shadow-inner font-serif text-right">
                    <div className="header flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
                        <div>
                            <h2 className="text-lg font-black">{OFFICE_NAME}</h2>
                            <p className="text-xs font-bold text-slate-500">الإدارة القانونية - وحدة التحقيقات الإدارية والعمالية</p>
                        </div>
                        <div className="text-left font-mono text-xs">
                            <p>REF: SUM-{investigation.investigationNumber || 'REG'}</p>
                            <p>DATE: {new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <div className="title text-center mb-8">
                        <h1 className="text-xl font-black underline underline-offset-8">إعلان بحضور تحقيق إداري رسمي</h1>
                        <p className="text-[10px] font-bold text-slate-500 mt-2">(إخطار رسمي ملزم بموجب أحكام المادة 102 من قانون العمل الكويتي)</p>
                    </div>

                    <div className="content space-y-4 text-sm leading-relaxed text-slate-800">
                        <p>السيد/ المحترم: <strong className="text-slate-950 font-sans text-base">{targetName}</strong></p>
                        <p>المسمى الوظيفي: <strong className="text-slate-900">{targetJob}</strong> | المرجع التعريفي: <strong className="text-slate-900">{targetId}</strong></p>
                        
                        <div className="info-box p-4 bg-slate-50 border-r-4 border-slate-900 rounded">
                            <p className="mb-2 font-bold">تحية طيبة وبعد ،،،</p>
                            <p>بموجب الصلاحيات والأنظمة الإدارية والقوانين المعمول بها بدولة الكويت، وحيث تقرر إجراء تحقيق رسمي في الوقائع الخاصة بالمخالفة المقيدة برقم ملف التحقيق: <strong className="text-indigo-600 font-sans">{investigation.investigationNumber}</strong> وموضوعها:</p>
                            <p className="mt-2 font-black text-slate-900">({investigation.subject})</p>
                            <p className="mt-3">لذا، يقتضي إعلانكم رسمياً بوجوب الحضور الشخصي أمام رئيس لجنة التحقيق بالإدارة القانونية، وذلك لاستيفاء وسماع أقوالكم القانونية ومواجهتكم بالأوراق والمسوغات، وذلك في الميعاد المحدد أدناه:</p>
                        </div>

                        <div className="dates-grid grid grid-cols-2 gap-4 text-center">
                            <div className="date-card p-4 border rounded-xl bg-slate-50">
                                <p className="text-[10px] font-black text-slate-600 mb-1 uppercase tracking-widest">تاريخ جلسة الحضور</p>
                                <p className="font-black text-slate-900 text-base">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <div className="date-card p-4 border rounded-xl bg-slate-50">
                                <p className="text-[10px] font-black text-slate-600 mb-1 uppercase tracking-widest">التوقيت وموقع المثول</p>
                                <p className="font-black text-slate-900 text-base">العاشرة صباحاً (الإدارة القانونية - مقر الرئيسي للشركة)</p>
                            </div>
                        </div>

                        <div className="warning-box p-4 bg-rose-50 border border-rose-200 rounded-xl">
                            <p className="text-[11px] font-black text-rose-800 mb-1">■ تنبيهات قانونية هامة وجزاء تخلّف المثول:</p>
                            <ul className="list-decimal list-inside text-xs text-rose-900 space-y-1 pr-1 font-bold">
                                <li>يعتبر الحضور والتعاون مع التحقيق واجباً من واجبات السلوك الوظيفي المنصوص عليها قانوناً.</li>
                                <li>عدم الحضور أو محاولة العرقلة دون مبرر مرضي أو قوة قاهرة يترتب عليه السير باللجراءات غيابياً واتخاذ الجزاء القانوني بحقكم.</li>
                                <li>يحق لك الاستعانة بممثل أو تقديم مذكرات خطية دفاعية لضمها لملف الاستدلالات والواقعة.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="sign-grid flex justify-between items-end pt-12 text-sm">
                        <div className="sign-box text-center">
                            <p className="font-black mb-12">توقيع المستلم للتبليغ</p>
                            <p className="text-[10px] text-slate-400 border-t pt-1 w-36">................................</p>
                        </div>
                        <div className="sign-box text-center">
                            <p className="font-black mb-12">اعتماد المحقق الإداري قانوناً</p>
                            <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-full mx-auto flex items-center justify-center text-[10px] text-slate-400 italic">
                                الختم الرسمي
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-4 border-t border-slate-100 flex justify-between text-[10px] font-mono text-slate-400 uppercase italic">
                        <span>Adala - Public Prosecution Summons Standard V3</span>
                        <span>صفحة 1 من 1</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>إغلاق</Button>
                    <Button variant="primary" onClick={printSummons} leftIcon={<PrinterIcon className="w-4 h-4" />}>طباعة استدعاء الحضور</Button>
                </div>
            </div>
        </Modal>
    );
};
