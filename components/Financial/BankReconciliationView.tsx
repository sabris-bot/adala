import React, { useState } from 'react';
import { 
  Landmark, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Link2, 
  Search, 
  ArrowRight, 
  RefreshCw, 
  FileSpreadsheet, 
  Building2, 
  Plus, 
  Calendar,
  Check
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { notificationService } from '../../services/notificationService';

export interface BankStatementTransaction {
  id: string;
  bankName: string;
  wireRef: string;
  date: string;
  senderName: string;
  amount: number;
  matchedContractId?: string;
  matchedTenantName?: string;
  matchedUnit?: string;
  matchStatus: 'matched' | 'unmatched';
  notes?: string;
}

interface RegisteredLeaseContract {
  id: string;
  contractNumber: string;
  tenantName: string;
  civilId: string;
  propertyName: string;
  unitNumber: string;
  monthlyRent: number;
}

export const BankReconciliationView: React.FC = () => {
  const { addToast } = useToast();
  const [selectedBankFeed, setSelectedBankFeed] = useState('KFH');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedWire, setSelectedWire] = useState<BankStatementTransaction | null>(null);

  // Mock list of registered lease contracts for manual matching
  const registeredContracts: RegisteredLeaseContract[] = [
    { id: 'cnt-101', contractNumber: 'CNT-2026-88', tenantName: 'عبدالرحمن مشاري المطيري', civilId: '298010101988', propertyName: 'برج الجوهرة الاستثماري', unitNumber: '12-B', monthlyRent: 450 },
    { id: 'cnt-102', contractNumber: 'CNT-2026-92', tenantName: 'محمد جاسم العتيبي', civilId: '295050504433', propertyName: 'مجمع الصالحية التميز', unitNumber: '4', monthlyRent: 600 },
    { id: 'cnt-103', contractNumber: 'CNT-2026-105', tenantName: 'د. خالد أحمد الشمري', civilId: '289030302211', propertyName: 'عمارة السالمية رولان', unitNumber: '8-A', monthlyRent: 380 },
    { id: 'cnt-104', contractNumber: 'CNT-2026-112', tenantName: 'شركة الخليج للاستشارات والهندسة', civilId: '77665544', propertyName: 'برج الحمراء الاستثماري', unitNumber: 'الدور 14', monthlyRent: 1250 },
  ];

  // Bank Statement Items (Persistent in localStorage)
  const [statementTransactions, setStatementTransactions] = useState<BankStatementTransaction[]>(() => {
    const saved = localStorage.getItem('adala_bank_reconciliation_statement');
    return saved ? JSON.parse(saved) : [
      {
        id: 'trx-1001',
        bankName: 'بيت التمويل الكويتي (KFH)',
        wireRef: 'FT26081599821',
        date: '2026-08-15',
        senderName: 'عبدالرحمن مشاري المطيري',
        amount: 450,
        matchedContractId: 'cnt-101',
        matchedTenantName: 'عبدالرحمن مشاري المطيري',
        matchedUnit: 'برج الجوهرة - وحدة 12-B',
        matchStatus: 'matched',
        notes: 'مطابقة آلية عبر الرقم المدني والرصيد المعتمد'
      },
      {
        id: 'trx-1002',
        bankName: 'بنك الكويت الوطني (NBK)',
        wireRef: 'KNET-8829103',
        date: '2026-08-14',
        senderName: 'تحويل بنكي مجهول - Ref 9912',
        amount: 380,
        matchStatus: 'unmatched',
        notes: 'تحويل بنكي وارد لم يتم العثور على اسم المطابق آلياً'
      },
      {
        id: 'trx-1003',
        bankName: 'بنك بوبيان (Boubyan)',
        wireRef: 'FT2608147712',
        date: '2026-08-14',
        senderName: 'محمد جاسم العتيبي',
        amount: 600,
        matchedContractId: 'cnt-102',
        matchedTenantName: 'محمد جاسم العتيبي',
        matchedUnit: 'مجمع الصالحية - وحدة 4',
        matchStatus: 'matched',
        notes: 'مطابق بنسبة 100%'
      },
      {
        id: 'trx-1004',
        bankName: 'بيت التمويل الكويتي (KFH)',
        wireRef: 'TRX-554201-KNET',
        date: '2026-08-12',
        senderName: 'سداد KNet غير معزو - 7712',
        amount: 1250,
        matchStatus: 'unmatched',
        notes: 'مطابقة مفقودة! يتطلب الربط اليدوي بعقد إيجار'
      }
    ];
  });

  const saveStatementData = (data: BankStatementTransaction[]) => {
    setStatementTransactions(data);
    localStorage.setItem('adala_bank_reconciliation_statement', JSON.stringify(data));
  };

  const unmatchedCount = statementTransactions.filter(t => t.matchStatus === 'unmatched').length;

  // Import Statement Handler simulation
  const handleImportStatement = () => {
    const newTrx: BankStatementTransaction = {
      id: `trx-${Date.now()}`,
      bankName: selectedBankFeed === 'KFH' ? 'بيت التمويل الكويتي (KFH)' : selectedBankFeed === 'NBK' ? 'بنك الكويت الوطني (NBK)' : 'بنك بوبيان (Boubyan)',
      wireRef: `TRX-${Math.floor(100000 + Math.random() * 900000)}-KNET`,
      date: new Date().toISOString().split('T')[0],
      senderName: 'تحويل بنكي وارد جديد',
      amount: 400,
      matchStatus: 'unmatched',
      notes: 'كشف حساب مستورد جديد - بانتظار التطابق'
    };

    saveStatementData([newTrx, ...statementTransactions]);

    // Send notification
    notificationService.addNotification({
      title: 'تنبيه مطابقة مفقودة جديدة',
      message: `تم استيراد تحويل بنكي بمبلغ 400.000 د.ك بحاجة لربط بعقد إيجار.`,
      category: 'REMINDER',
      priority: 'HIGH'
    });

    addToast({
      type: 'warning',
      title: 'تم استيراد كشف الحساب البنكي',
      message: 'تم إضافة تحويل بنكي جديد وحالته (مطابقة مفقودة) تتطلب ربطه بالعقد.'
    });
  };

  // Manual Match Execution
  const handleExecuteLink = (contract: RegisteredLeaseContract) => {
    if (!selectedWire) return;

    const updated = statementTransactions.map(t => {
      if (t.id === selectedWire.id) {
        return {
          ...t,
          matchedContractId: contract.id,
          matchedTenantName: contract.tenantName,
          matchedUnit: `${contract.propertyName} - وحدة ${contract.unitNumber}`,
          matchStatus: 'matched' as const,
          notes: `تم الربط اليدوي المباشر مع عقد ${contract.contractNumber}`
        };
      }
      return t;
    });

    saveStatementData(updated);
    setShowLinkModal(false);
    setSelectedWire(null);

    addToast({
      type: 'success',
      title: 'تمت مطابقة السداد بنجاح! 🔗',
      message: `تم ربط التحويل البنكي (${contract.contractNumber}) بالعميل ${contract.tenantName}.`
    });
  };

  const formatKWD = (val: number) => {
    return new Intl.NumberFormat('ar-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(val);
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl border border-blue-800/50 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-3 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
              نظام مطابقة كشوف الحسابات البنكية
            </span>
            <span className="text-xs text-blue-200 font-mono">Bank Statement Reconciliation</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            واجهة الربط واستيراد وتطابق مدفوعات الإيجارات تلقائياً
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed font-medium">
            مزامنة كشوف الحسابات المصرفية وبوابات KNet، المطابقة الآلية مع عقود الإيجار المسجلة، والتنبيه الفوري عند وجود تحويلات بدون ربط.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedBankFeed}
            onChange={e => setSelectedBankFeed(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono outline-none"
          >
            <option value="KFH">بيت التمويل الكويتي (KFH Feed)</option>
            <option value="NBK">بنك الكويت الوطني (NBK Direct)</option>
            <option value="Boubyan">بنك بوبيان (Boubyan API)</option>
            <option value="KNET">بوابة KNet للتسديد الإلكتروني</option>
          </select>

          <button
            onClick={handleImportStatement}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-950/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>استيراد كشف جديد 📥</span>
          </button>
        </div>
      </div>

      {/* Unmatched Alert Banner (Reconciliation Alert) */}
      {unmatchedCount > 0 && (
        <div className="p-5 bg-rose-500/10 border-2 border-rose-500/30 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-rose-900 dark:text-rose-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black">
                🚨 تنبيه بالمطابقة المفقودة: يوجد عدد ({unmatchedCount}) تحويلات بنكية لم يتم ربطها بعقد إيجار!
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium mt-0.5">
                تأكد من مراجعة التحويلات المعلقة لربطها بعقود المستأجرين وتحديث حالة التحصيل المالي.
              </p>
            </div>
          </div>

          <span className="px-3 py-1.5 bg-rose-600 text-white font-mono font-black rounded-xl text-xs shrink-0">
            {unmatchedCount} تحويل غير معزو
          </span>
        </div>
      )}

      {/* Main Transactions Reconciliation Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              سجل التحويلات البنكية وحالة المطابقة مع العقود
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              متابعة التحويلات الواردة وحالة ربطها بالمستأجرين والعقارات.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="بحث باسم المحول، المرجع، المبلغ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-700">
                <th className="p-3">تاريخ التحويل</th>
                <th className="p-3">البنك / البوابة</th>
                <th className="p-3">مرجع العملية</th>
                <th className="p-3">المحول / بيان الكشف</th>
                <th className="p-3">المبلغ الوارد (د.ك)</th>
                <th className="p-3">حالة المطابقة</th>
                <th className="p-3">العقد والوحدة المربوطة</th>
                <th className="p-3 text-center">إجراءات الربط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
              {statementTransactions
                .filter(t => 
                  t.senderName.includes(searchQuery) || 
                  t.wireRef.includes(searchQuery) ||
                  (t.matchedTenantName && t.matchedTenantName.includes(searchQuery))
                )
                .map(t => {
                  const isMatched = t.matchStatus === 'matched';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-all">
                      <td className="p-3 font-mono text-slate-500">{t.date}</td>
                      <td className="p-3 text-slate-900 dark:text-white font-extrabold">{t.bankName}</td>
                      <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">{t.wireRef}</td>
                      <td className="p-3">{t.senderName}</td>
                      <td className="p-3 font-mono font-black text-emerald-600 dark:text-emerald-400">{formatKWD(t.amount)}</td>
                      <td className="p-3">
                        {isMatched ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            مطابق آلياً 🟢
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg text-[10px] font-black border border-rose-200 dark:border-rose-800 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            مطابقة مفقودة 🔴
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px]">
                        {isMatched ? (
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block">{t.matchedTenantName}</span>
                            <span className="text-[10px] text-slate-400">{t.matchedUnit}</span>
                          </div>
                        ) : (
                          <span className="text-rose-500 font-bold text-[10px]">غير مربوط بعقد</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {!isMatched ? (
                          <button
                            onClick={() => {
                              setSelectedWire(t);
                              setShowLinkModal(true);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] rounded-xl flex items-center gap-1 mx-auto shadow-sm transition-all"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>ربط بعقد إيجار 🔗</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-black">مكتمل المطابقة</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL LINK MODAL */}
      {showLinkModal && selectedWire && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-xl w-full text-right font-sans space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-600" />
                ربط التحويل البنكي بعقد إيجار مسجل
              </h3>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-mono font-black rounded-lg">
                {selectedWire.wireRef}
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">المحول والكشف:</span>
                <span className="text-slate-900 dark:text-white">{selectedWire.senderName}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">المبلغ الوارد:</span>
                <span className="text-emerald-600 font-mono font-black">{formatKWD(selectedWire.amount)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                اختر العقد/المستأجر المطابق من قاعدة البيانات:
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {registeredContracts.map(contract => (
                  <div
                    key={contract.id}
                    onClick={() => handleExecuteLink(contract)}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer transition-all flex justify-between items-center group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600">
                          {contract.tenantName}
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                          {contract.contractNumber}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {contract.propertyName} - وحدة ({contract.unitNumber}) | الإيجار: {formatKWD(contract.monthlyRent)}
                      </p>
                    </div>

                    <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>اختيار ومطابقة</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedWire(null);
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-xs font-extrabold rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
