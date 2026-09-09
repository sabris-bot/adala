import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Info, AlertCircle, RotateCcw, Calendar, Check, X } from 'lucide-react';
import { RedesignedTakenLeave } from './types';

interface LeavesSectionProps {
  takenLeaves: RedesignedTakenLeave[];
  onChangeLeaves: (leaves: RedesignedTakenLeave[]) => void;
  deductFridaysFromLeaves: boolean;
  onToggleDeductFridays: (val: boolean) => void;
  onAddAuditLog: (action: string, details: string) => void;
}

export const LeavesSection: React.FC<LeavesSectionProps> = ({
  takenLeaves,
  onChangeLeaves,
  deductFridaysFromLeaves,
  onToggleDeductFridays,
  onAddAuditLog,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [leaveType, setLeaveType] = useState('إجازة دورية اعتيادية');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Undo Stack
  const [historyStack, setHistoryStack] = useState<RedesignedTakenLeave[][]>([]);

  const pushHistory = (currentList: RedesignedTakenLeave[]) => {
    setHistoryStack((prev) => [...prev, [...currentList]]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    onChangeLeaves(previous);
    setHistoryStack((prev) => prev.slice(0, -1));
    onAddAuditLog('تراجع عن آخر إجراء', 'تم التراجع عن آخر تعديل في جدول الإجازات');
  };

  const calculateFridaysAndDays = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { totalDays: 0, fridays: 0, netDays: 0 };
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { totalDays: 0, fridays: 0, netDays: 0 };
    }

    let totalDays = 0;
    let fridays = 0;
    const current = new Date(start);
    while (current <= end) {
      totalDays++;
      if (current.getDay() === 5) { // 5 is Friday
        fridays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return {
      totalDays,
      fridays,
      netDays: totalDays - fridays
    };
  };

  const handleSaveLeave = () => {
    if (!fromDate || !toDate) {
      alert('الرجاء إدخال تاريخ البداية والنهاية أولاً');
      return;
    }

    const { totalDays, fridays, netDays } = calculateFridaysAndDays(fromDate, toDate);
    if (totalDays <= 0) {
      alert('تاريخ نهاية الإجازة يجب أن يكون مساوياً أو بعد تاريخ البداية');
      return;
    }

    pushHistory(takenLeaves);

    if (editingId) {
      const updated = takenLeaves.map((l) => {
        if (l.id === editingId) {
          return {
            ...l,
            fromDate,
            toDate,
            days: totalDays,
            fridaysCount: fridays,
            netDays,
            leaveType,
            note
          };
        }
        return l;
      });
      onChangeLeaves(updated);
      onAddAuditLog('تعديل إجازة', `تم تعديل الإجازة من ${fromDate} إلى ${toDate} (${totalDays} يوم)`);
      setEditingId(null);
    } else {
      const newLeave: RedesignedTakenLeave = {
        id: `L-${Date.now()}`,
        fromDate,
        toDate,
        days: totalDays,
        fridaysCount: fridays,
        netDays,
        leaveType,
        note
      };
      onChangeLeaves([...takenLeaves, newLeave]);
      onAddAuditLog('إضافة إجازة', `تم إضافة إجازة جديدة من ${fromDate} إلى ${toDate} (${totalDays} يوم)`);
    }

    // Reset inputs
    setFromDate('');
    setToDate('');
    setNote('');
  };

  const handleEditClick = (leave: RedesignedTakenLeave) => {
    setEditingId(leave.id);
    setFromDate(leave.fromDate);
    setToDate(leave.toDate);
    setLeaveType(leave.leaveType);
    setNote(leave.note);
  };

  const handleDeleteLeave = (id: string) => {
    const target = takenLeaves.find(l => l.id === id);
    if (!target) return;

    if (window.confirm(`هل أنت متأكد من حذف الإجازة (${target.fromDate} إلى ${target.toDate})؟`)) {
      pushHistory(takenLeaves);
      onChangeLeaves(takenLeaves.filter((l) => l.id !== id));
      onAddAuditLog('حذف إجازة', `تم حذف الإجازة الممتدة من ${target.fromDate} إلى ${target.toDate}`);
    }
  };

  // Preview live counts while typing
  const liveStats = fromDate && toDate ? calculateFridaysAndDays(fromDate, toDate) : null;

  return (
    <div id="leaves-settlement-section" className="bg-white dark:bg-[#1a202c] rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">جدول الإجازات التفصيلي للموظف</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تتبع كافة الإجازات المأخوذة لتصفية الرصيد الفعلي بدقة وتناغم عالي.</p>
        </div>

        {/* Undo Button */}
        {historyStack.length > 0 && (
          <button
            type="button"
            onClick={handleUndo}
            className="text-xs flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-all font-bold cursor-pointer"
            title="التراجع عن الإجراء الأخير"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تراجع عن التعديل</span>
          </button>
        )}
      </div>

      {/* Friday Settings Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-4">
        <div>
          <span className="text-xs font-bold text-emerald-950 dark:text-emerald-300 block mb-1">التحكم في معامل أيام الجمعة الإجازات</span>
          <p className="text-[11px] text-emerald-800 dark:text-emerald-400">تحتسب بعض العقود أيام الجمعة الواقعة داخل فترة الإجازة ضمن رصيد الاستهلاك، بينما تستبعدها عقود أخرى.</p>
        </div>
        
        <div className="flex items-center justify-end gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-300">
            <input
              type="radio"
              name="fridaySetting"
              checked={!deductFridaysFromLeaves}
              onChange={() => {
                onToggleDeductFridays(false);
                onAddAuditLog('تغيير معامل الجمعة', 'تم اختيار احتساب أيام الجمعة داخل فترة الإجازة كأيام مستهلكة');
              }}
              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
            />
            <span>☑ احتساب الجمعة (مستهلكة)</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-300">
            <input
              type="radio"
              name="fridaySetting"
              checked={deductFridaysFromLeaves}
              onChange={() => {
                onToggleDeductFridays(true);
                onAddAuditLog('تغيير معامل الجمعة', 'تم اختيار استبعاد أيام الجمعة من الاستهلاك');
              }}
              className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
            />
            <span>☑ استبعاد الجمعة (مسترجعة للرصيد)</span>
          </label>
        </div>
      </div>

      {/* Leave Entry Form Block */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-3 border-r-2 border-emerald-500 pr-2">
          {editingId ? 'تعديل الإجازة المحددة' : 'إضافة أو تسجيل إجازة جديدة'}
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">تاريخ بداية الإجازة</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full text-xs font-semibold h-9 px-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a202c] rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">تاريخ نهاية الإجازة</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full text-xs font-semibold h-9 px-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a202c] rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">نوع الإجازة</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full text-xs font-semibold h-9 px-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a202c] rounded-lg text-slate-900 dark:text-white"
            >
              <option value="إجازة دورية اعتيادية">إجازة دورية اعتيادية</option>
              <option value="إجازة اضطرارية">إجازة اضطرارية</option>
              <option value="إجازة مرضية براتب">إجازة مرضية براتب</option>
              <option value="إجازة دراسية">إجازة دراسية</option>
              <option value="إجازة مرافقة مريض">إجازة مرافقة مريض</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">ملاحظات توضيحية</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: إجازة الصيف السنوية"
              className="w-full text-xs font-semibold h-9 px-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a202c] rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        {liveStats && (
          <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg p-3 text-[11px] flex justify-between items-center">
            <span className="font-bold">حساب الإجازة المباشر للفترة المحددة:</span>
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-end font-mono">
              <span>الأيام الميلادية الكاملة: <strong>{liveStats.totalDays} يوماً</strong></span>
              <span>أيام الجمعة: <strong>{liveStats.fridays} أيام</strong></span>
              <span>بعد الخصم: <strong className="text-amber-700 dark:text-amber-400">{liveStats.netDays} يوماً</strong></span>
            </div>
          </div>
        )}

        <div className="mt-3 flex justify-end gap-2">
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setFromDate('');
                setToDate('');
                setNote('');
              }}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              إلغاء التعديل
            </button>
          )}
          <button
            type="button"
            onClick={handleSaveLeave}
            className="flex items-center gap-1.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-black px-5 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{editingId ? 'حفظ التغييرات المحددة' : 'تسجيل وإدراج الإجازة'}</span>
          </button>
        </div>
      </div>

      {/* Leaves Data Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-right border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
              <th className="p-3">نوع الإجازة</th>
              <th className="p-3">تاريخ البداية</th>
              <th className="p-3">تاريخ النهاية</th>
              <th className="p-3 text-center">أيام الإجازة</th>
              <th className="p-3 text-center">أيام الجمعة</th>
              <th className="p-3 text-center">بعد خصم الجمعة</th>
              <th className="p-3 text-center">بدون خصم الجمعة</th>
              <th className="p-3">ملاحظات</th>
              <th className="p-3 text-center w-24">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 dark:text-slate-300">
            {takenLeaves.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <span>لا يوجد أي إجازات مسجلة للموظف حالياً.</span>
                </td>
              </tr>
            ) : (
              takenLeaves.map((leave) => {
                const isDeductedActive = deductFridaysFromLeaves;
                return (
                  <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 font-bold text-slate-800 dark:text-white">{leave.leaveType}</td>
                    <td className="p-3 font-mono">{leave.fromDate}</td>
                    <td className="p-3 font-mono">{leave.toDate}</td>
                    <td className="p-3 text-center font-mono font-bold">{leave.days}</td>
                    <td className="p-3 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">{leave.fridaysCount}</td>
                    <td className={`p-3 text-center font-mono font-black ${isDeductedActive ? 'text-[#134D41] dark:text-emerald-400 bg-emerald-500/5' : ''}`}>
                      {leave.netDays}
                    </td>
                    <td className={`p-3 text-center font-mono font-black ${!isDeductedActive ? 'text-[#134D41] dark:text-emerald-400 bg-emerald-500/5' : ''}`}>
                      {leave.days}
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={leave.note}>
                      {leave.note || '-'}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditClick(leave)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 rounded-md border border-amber-200/40 dark:border-amber-900/40 transition-all cursor-pointer"
                          title="تعديل الإجازة"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLeave(leave.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-md border border-rose-200/40 dark:border-rose-900/40 transition-all cursor-pointer"
                          title="حذف الإجازة"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Info Footnote on Fridays calculation */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/20 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 leading-relaxed">
        <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 dark:text-slate-300 block mb-0.5">تفصيل قواعد الحساب:</strong>
          <span>إذا تم تفعيل <strong>استبعاد الجمعة</strong>، يُعتبر يوم الجمعة غير مستهلك من الرصيد السنوي للموظف، وبالتالي فإن الإجازة ذات الـ 10 أيام التي تشمل جمعة واحدة ستخصم 9 أيام فقط من رصيده المتاح، مما يعود بالوفر المالي والزمني المباشر للموظف.</span>
        </div>
      </div>

    </div>
  );
};
