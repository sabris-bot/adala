import React from 'react';
import { AlertTriangle, Signature } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmployeeRequest } from './request-types';

interface ApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedRequest: EmployeeRequest | null;
    onToggleStageApproval: (requestId: string, roleId: string, status: 'approved' | 'rejected') => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
    isOpen,
    onClose,
    selectedRequest,
    onToggleStageApproval
}) => {
    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose}
            title={`مسار الموافقات والامتثال لطلب: (${selectedRequest?.referenceNumber})`}
            size="lg"
        >
            {selectedRequest && (
                <div className="space-y-6 text-right" style={{ direction: 'rtl' }}>
                    
                    {/* Header details of requested items */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center justify-between">
                        <div className="space-y-1 text-right">
                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">الموظف صاحب الطلب</span>
                            <h4 className="text-sm font-black text-stone-900">{selectedRequest.employeeName}</h4>
                            <p className="text-[10px] text-stone-500 font-semibold">{selectedRequest.employeeJobTitle} • قسم {selectedRequest.employeeDepartment}</p>
                        </div>

                        <div className="text-left font-sans text-[10px] space-y-0.5 text-stone-650">
                            <p>نوع المعاملة: <span className="font-bold underline text-stone-850">{selectedRequest.requestType}</span></p>
                            <p>تاريخ الإرسال: <span>{selectedRequest.requestDate}</span></p>
                            <p>الرقم المرجعي: <span className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-850 font-bold border border-stone-200">{selectedRequest.referenceNumber}</span></p>
                        </div>
                    </div>

                    {/* Interactive Warning check in approvals */}
                    {selectedRequest.hasActiveInvestigation && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[10px] flex items-start gap-2 font-bold animate-pulse">
                            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span className="text-right leading-relaxed">
                                تنبيه الكفاءة عسكرياً وعمالياً: هذا الموظف خاضع حالياً لتحقيق إداري مفتوح في الشؤون القانونية بالمنشأة. يرجى توخي الحذر الشديد وعدم اعتماد أي ترقيات مالية أو قروض إلا بموافقة صريحة ومكتوبة من الشركاء!
                            </span>
                        </div>
                    )}

                    {/* Description Text */}
                    <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
                        <h5 className="text-[11px] text-stone-400 font-black block">نص أو غاية ومبرر الطلب:</h5>
                        <p className="text-xs font-semibold text-stone-800 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100 text-justify">"{selectedRequest.reasonNote}"</p>
                    </div>

                    {/* Dynamic Horizontal/Vertical Approval Chain */}
                    <div className="space-y-4 pt-2">
                        <h5 className="text-xs font-black text-[#00796B] flex items-center gap-1.5">
                            <Signature className="w-4 h-4 text-[#00796B]" />
                            دورة الموافقات الاحترافية المتعاقبة (الستة مستويات):
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedRequest.approvals.map((stage) => {
                                let statusColor = 'bg-slate-50 text-slate-400 border-slate-200';
                                let statusTextAr = 'قيد الانتظار لموافقتك';

                                if (stage.status === 'approved') {
                                    statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                    statusTextAr = `تم الاعتماد بواسطة: ${stage.approverName || 'مدير القسم'}`;
                                } else if (stage.status === 'rejected') {
                                    statusColor = 'bg-red-50 text-red-700 border-red-200';
                                    statusTextAr = 'تم الرفض عمالياً';
                                } else if (stage.status === 'not_required') {
                                    statusColor = 'bg-gray-100 text-slate-400 border-gray-200';
                                    statusTextAr = 'غير مطلوب ومستثنى';
                                }

                                return (
                                    <div key={stage.roleId} className={`p-4 border rounded-2xl space-y-2.5 flex flex-col justify-between ${statusColor}`}>
                                        <div className="flex items-center justify-between border-b pb-2">
                                            <span className="font-black text-xs text-slate-900 block">{stage.roleAr}</span>
                                            <Badge text={stage.roleEn} className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg border bg-white shadow-sm" />
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className="text-[10px] leading-relaxed font-bold block">{statusTextAr}</p>
                                            {stage.actionDate && (
                                                <span className="text-[8px] text-slate-400 block font-mono">تاريخ الإجراء: {stage.actionDate}</span>
                                            )}
                                            {stage.notes && (
                                                <p className="text-[9px] text-slate-500 italic font-medium leading-normal bg-white/40 p-1 rounded">"{stage.notes}"</p>
                                            )}
                                        </div>

                                        {/* Action Simulator buttons for HR Admin */}
                                        {stage.status === 'pending' && (
                                            <div className="flex items-center gap-1.5 pt-2">
                                                <button 
                                                    onClick={() => onToggleStageApproval(selectedRequest.id, stage.roleId, 'approved')}
                                                    className="px-2 py-1 text-[9px] font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors block w-full text-center"
                                                >
                                                    اعتماد المرحلة ✔️
                                                </button>
                                                <button 
                                                    onClick={() => onToggleStageApproval(selectedRequest.id, stage.roleId, 'rejected')}
                                                    className="px-2 py-1 text-[9px] font-black bg-red-600 hover:bg-red-700 text-white rounded transition-colors block w-full text-center"
                                                >
                                                    رفض المرحلة ❌
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t gap-2">
                        <Button variant="outline" onClick={onClose}>إغلاق النافذة</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
