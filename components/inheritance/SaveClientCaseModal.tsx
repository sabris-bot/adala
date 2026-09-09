import React, { useState } from 'react';
import { FolderPlus, User, Phone, Tag, FileText, CheckCircle2, Shield } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { InheritanceCalculation } from '../../services/inheritanceEngine';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    calculation: InheritanceCalculation | null;
    onSaveCase: (enrichedCalc: InheritanceCalculation) => void;
}

export const SaveClientCaseModal: React.FC<Props> = ({
    isOpen,
    onClose,
    calculation,
    onSaveCase
}) => {
    const [clientName, setClientName] = useState(calculation?.clientName || '');
    const [clientPhone, setClientPhone] = useState(calculation?.clientPhone || '');
    const [caseNumber, setCaseNumber] = useState(
        calculation?.caseNumber || `EST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
    );
    const [status, setStatus] = useState<'active' | 'amicable' | 'disputed' | 'archived'>(
        calculation?.status || 'active'
    );
    const [notes, setNotes] = useState(calculation?.notes || '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!calculation) return;

        const enriched: InheritanceCalculation = {
            ...calculation,
            id: calculation.id || `case-${Date.now()}`,
            clientName: clientName.trim() || 'موكل المكتب',
            clientPhone: clientPhone.trim(),
            caseNumber: caseNumber.trim(),
            status: status,
            notes: notes.trim(),
            createdAt: calculation.createdAt || new Date().toISOString()
        };

        onSaveCase(enriched);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="حفظ ملف تركة في سجل الموكلين (الأرشيف الرقمي)"
            size="md"
        >
            <form onSubmit={handleSave} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#0F2744] text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center font-black">
                        <FolderPlus className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white">
                            أرشفة تركة: {calculation?.deceasedName || 'المورث'}
                        </h4>
                        <p className="text-[11px] text-slate-300">
                            صافي التركة: {calculation?.netEstate.toLocaleString()} د.ك | عدد الورثة: {calculation?.shares.length || 0}
                        </p>
                    </div>
                </div>

                <div className="space-y-3 text-xs">
                    {/* Client Name */}
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>اسم الموكل صاحب الملف:</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="مثال: عبدالله فهد الصباح"
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Case Number */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                                <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>رقم ملف القضية بالمكتب:</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={caseNumber}
                                onChange={(e) => setCaseNumber(e.target.value)}
                                placeholder="EST-2026-084"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                                <span>رقم هاتف الموكل:</span>
                            </label>
                            <input
                                type="text"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                placeholder="99887766"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                            حالة الملف القانونية:
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                        >
                            <option value="active">قيد التصفية والحساب الأولي</option>
                            <option value="amicable">قسمة رضائية وتخارج موثق</option>
                            <option value="disputed">نزاع قضائي ودعوى فرز وتجنيب</option>
                            <option value="archived">ملف منتهي ومؤرشف</option>
                        </select>
                    </div>

                    {/* Special Notes */}
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>ملاحظات المحامي الاستشارية:</span>
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="أي تفاصيل خاصة بتسوية الديون، موافقة القصر، أو العقارات..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="text-xs"
                    >
                        إلغاء
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="text-xs flex items-center gap-1.5 bg-[#0F2744] hover:bg-[#0A1C30] dark:bg-[#D4AF37] dark:text-slate-950"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>حفظ في سجل الموكلين</span>
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
