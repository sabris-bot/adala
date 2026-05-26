import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  ShieldCheckIcon, CheckBadgeIcon, ExclamationTriangleIcon, CalendarDaysIcon, 
  ArrowPathIcon, BellAlertIcon, UsersIcon, BanknotesIcon, CogIcon, GavelIcon, 
  FolderIcon, ArrowUpCircleIcon, ClipboardDocumentCheckIcon, DocumentTextIcon
} from '../../../constants';

interface DashboardTabProps {
  policies: any[];
  obligations: any[];
  risks: any[];
  violations: any[];
  tasks: any[];
  activeRole: string;
  translate: (ar: string, en: string) => string;
  onNavigate: (module: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  policies,
  obligations,
  risks,
  violations,
  tasks,
  activeRole,
  translate,
  onNavigate
}) => {
  // Filters for analytics slicing and dicing
  const [selectedBranch, setSelectedBranch] = useState<'All' | 'Capital' | 'Jahra' | 'Hawally'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<'All' | 'Finance' | 'HR' | 'Legal' | 'Operations'>('All');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncTimestamp, setSyncTimestamp] = useState<string>('قبل دقيقة واحدة');

  const handleSyncGroup = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setSyncTimestamp(translate(`الآن (${now.toLocaleTimeString('ar-KW')})`, `Just Now (${now.toLocaleTimeString('en-US')})`));
    }, 1200);
  };

  // Sliced computations based on group filters
  const filteredObligationsCount = useMemo(() => {
    let list = [...obligations];
    if (selectedBranch !== 'All') {
      const branchWords: Record<string, string> = { 'Capital': 'العاصمة', 'Jahra': 'الجهراء', 'Hawally': 'حولي' };
      list = list.filter(o => o.title?.includes(branchWords[selectedBranch]) || o.notes?.includes(branchWords[selectedBranch]));
    }
    return list.length;
  }, [obligations, selectedBranch]);

  // Analytical Gauges - Overlapping counts and overall corporate compliance rating
  const stats = useMemo(() => {
    const totalObligationsCount = obligations.length;
    const resolvedObligations = obligations.filter(o => o.status === 'Completed' || o.status === 'Approved').length;
    
    // Total Violations amount (KWD)
    const activePenaltiesAmount = violations
      .filter(v => v.statusAr?.includes('مفتوح') || v.statusAr?.includes('استئناف') || v.status === 'Open' || v.status === 'In Court')
      .reduce((sum, v) => sum + (v.penaltyAmount || 0), 0);

    const openViolationsCount = violations.filter(v => v.status === 'Open' || v.status === 'In Court' || v.statusAr?.includes('مفتوح')).length;
    const criticalRisksCount = risks.filter(r => r.riskLevel === 'High' || r.riskLevel === 'Critical').length;
    const overdueTasksCount = tasks.filter(t => t.status === 'Overdue').length;

    // Calculate rating %
    const baseScore = totalObligationsCount > 0 ? (resolvedObligations / totalObligationsCount) * 100 : 85;
    const penaltyDeduction = Math.min(openViolationsCount * 6, 25);
    const riskDeduction = Math.min(criticalRisksCount * 5, 20);
    const complianceScore = Math.max(Math.round(baseScore - penaltyDeduction - riskDeduction), 40);

    return {
      complianceScore,
      totalObligationsCount,
      activePenaltiesAmount,
      criticalRisksCount,
      overdueTasksCount,
      openViolationsCount
    };
  }, [policies, obligations, risks, violations, tasks]);

  // Bar and pie chart datasets (CMA, CBK, MOCI etc.)
  const categoryChartData = useMemo(() => {
    return [
      { name: translate('هيئة أسواق المال', 'CMA'), 'الالتزامات المنجزة': 8, 'المجموع الكلي': 10 },
      { name: translate('بنك الكويت المركزي', 'CBK'), 'الالتزامات المنجزة': 6, 'المجموع الكلي': 7 },
      { name: translate('وزارة التجارة م م', 'MOCI'), 'الالتزامات المنجزة': 9, 'المجموع الكلي': 12 },
      { name: translate('مكافحة غسيل الأموال', 'AML-CFT'), 'الالتزامات المنجزة': 5, 'المجموع الكلي': 5 },
      { name: translate('الهيئة العامة للبيئة', 'KEPA'), 'الالتزامات المنجزة': 3, 'المجموع الكلي': 4 }
    ];
  }, [obligations]);

  const riskPieData = [
    { name: translate('خطر حرج (Critical)', 'Critical Risk'), value: risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length, color: '#e11d48' },
    { name: translate('خطر متوسط (Medium)', 'Medium Risk'), value: risks.filter(r => r.riskLevel === 'Medium').length, color: '#f59e0b' },
    { name: translate('خطر منخفض (Low)', 'Low Risk'), value: risks.filter(r => r.riskLevel === 'Low').length, color: '#10b981' }
  ].filter(item => item.value > 0);

  // Notifications Hub messages
  const notifications = useMemo(() => [
    {
      id: 'nt1',
      type: 'license',
      level: 'warning',
      textAr: 'رخصة التشغيل الاستيرادية للفرع الجنوبي ستنتهي بعد 12 يوماً بحاجة لتجديد كفالة التجارة.',
      textEn: 'Import business operation license for South Branch expires in 12 days; renewal required.',
      due: '2026-06-05',
    },
    {
      id: 'nt2',
      type: 'violation',
      level: 'danger',
      textAr: 'غرامة مفروضة بقيمة 5,000 د.ك من قبل الهيئة لعدم إعلان التقرير النصف السنوي بميعاده.',
      textEn: 'Late filing ticket received from CMA for KWD 5,000; action due to avoid escalation.',
      due: '2026-05-30',
    },
    {
      id: 'nt3',
      type: 'contract',
      level: 'info',
      textAr: 'تنبيه انتهاء إيجارات عمال وموظفي فرع السالمية بموجب 5 عقود مستحقة للتمديد أو الإخلاء.',
      textEn: 'Corporate lease agreements for staff in Salmiya branch due for renewal next week.',
      due: '2026-06-01',
    }
  ], []);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Slicing Controller Panel */}
      <div className="bg-white dark:bg-dm-card p-5 rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">{translate('مستوى تصفية فرع الشركة', 'Slice By Corporate Branch')}</label>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-dm-background p-1 rounded-xl">
              {(['All', 'Capital', 'Jahra', 'Hawally'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBranch(b)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedBranch === b 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                  }`}
                >
                  {translate(
                    b === 'All' ? 'كافة الفروع' : b === 'Capital' ? 'العاصمة' : b === 'Jahra' ? 'الجهراء' : 'حولي',
                    b === 'All' ? 'All Branches' : b
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-gray-400 uppercase">{translate('تصفية بالإدارة الداخلية', 'Slice By Internal Department')}</label>
            <div className="flex gap-1.5 bg-gray-50 dark:bg-dm-background p-1 rounded-xl">
              {(['All', 'Finance', 'HR', 'Legal', 'Operations'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDepartment(d)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    selectedDepartment === d 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                  }`}
                >
                  {translate(
                    d === 'All' ? 'الكل' : d === 'Finance' ? 'المالية' : d === 'HR' ? 'الموارد' : d === 'Legal' ? 'القانونية' : 'العمليات',
                    d
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-sky-50/50 dark:bg-sky-950/10 px-4 py-2.5 rounded-2xl flex items-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-gray-400 font-bold">{translate('المنظور الإداري المطبق:', 'Active Role Perspective:')}</span>
          <span className="font-extrabold text-blue-600 dark:text-blue-400">{activeRole}</span>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Compliance Circular Gauge */}
        <div className="bg-gradient-to-br from-slate-900 to-stone-900 text-white p-5 rounded-[32px] md:col-span-1 shadow-sm flex flex-col justify-between relative overflow-hidden h-[240px]">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShieldCheckIcon className="w-40 h-40" />
          </div>
          <div className="z-10">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{translate('مؤشر التقييم التراكمي الشامل', 'Overall Conformity Meter')}</p>
            <h4 className="text-xs font-bold text-slate-300 mt-0.5">{translate('مكتب عدالة للمطابقة والحوكمة', 'Adala Integrity Rank')}</h4>
          </div>
          
          <div className="z-10 flex items-center justify-center py-2 h-[120px]">
            <div className="relative flex items-center justify-center">
              {/* Circular border tracking Compliance score */}
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#1f2937" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="48" cy="48" r="40" 
                  stroke={stats.complianceScore > 80 ? "#10b981" : stats.complianceScore > 60 ? "#f59e0b" : "#e11d48"} 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.complianceScore / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black font-sans">{stats.complianceScore}%</span>
                <p className="text-[8px] text-gray-400 font-bold uppercase">{translate('آمن ومطابق', 'RANK SAFE')}</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 z-10 leading-relaxed font-bold">
            {stats.complianceScore > 80 ? translate('✓ معايير حوكمة سليمة وموثقة بالدولة.', '✓ High-level corporate safety verified.') : translate('⚠ مخاطر غرامات تحتاج معالجة استباقية فورا.', '⚠ Expositions detected; prompt actions required.')}
          </p>
        </div>

        {/* Dynamic Metric Card 1: Total Obligations */}
        <div className="bg-white dark:bg-dm-card p-5 rounded-[32px] shadow-xs flex flex-col justify-between h-[240px] border border-gray-150/45 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-2xl">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {selectedBranch === 'All' ? translate('تراكمي', 'Cumulative') : translate('فرعي', 'Branch-specific')}
            </span>
          </div>
          <div>
            <p className="text-4xl font-black font-sans text-gray-900 dark:text-white leading-none">
              {selectedBranch === 'All' ? stats.totalObligationsCount : filteredObligationsCount}
            </p>
            <p className="text-xs font-extrabold text-gray-400 mt-2">{translate('البنود والالتزامات المجدولة القانونية', 'Scheduled Corporate Obligations')}</p>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-bold">
            <span onClick={() => onNavigate('obligations')} className="text-blue-600 cursor-pointer hover:underline">{translate('عرض سجل الالتزامات ←', 'Explore Registry →')}</span>
            <span>{translate('محدث بالكامل', 'Up-to-date')}</span>
          </div>
        </div>

        {/* Dynamic Metric Card 2: Violations Penalties */}
        <div className="bg-white dark:bg-dm-card p-5 rounded-[32px] shadow-xs flex flex-col justify-between h-[240px] border border-gray-150/45 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-2xl">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            {stats.openViolationsCount > 0 && (
              <span className="text-[9px] bg-red-100 dark:bg-red-950 text-red-700 px-2 py-0.5 rounded-full font-black animate-pulse">
                {stats.openViolationsCount} {translate('غير معالج', 'Active cases')}
              </span>
            )}
          </div>
          <div>
            <p className="text-3xl font-black font-sans text-amber-700 leading-none">
              {stats.activePenaltiesAmount.toLocaleString('en-US')} <span className="text-xs font-bold text-gray-400">د.ك</span>
            </p>
            <p className="text-xs font-extrabold text-gray-400 mt-2">{translate('مبالغ الغرامات والمخالفات المفتوحة', 'Unresolved Regulatory Fines')}</p>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-bold">
            <span onClick={() => onNavigate('violations')} className="text-red-600 cursor-pointer hover:underline">{translate('تفصيل ملفات الاستئناف ←', 'Track Litigation Appeals →')}</span>
            <span>{translate('مستند رسمي', 'Certified')}</span>
          </div>
        </div>

        {/* Dynamic Metric Card 3: Risks & Overdue items */}
        <div className="bg-white dark:bg-dm-card p-5 rounded-[32px] shadow-xs flex flex-col justify-between h-[240px] border border-gray-150/45 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-2xl">
              <CogIcon className="w-6 h-6" />
            </div>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 px-2 py-0.5 rounded-full font-bold">
              {stats.criticalRisksCount + stats.overdueTasksCount} {translate('عنصر عالي الخطر', 'Under Alerts')}
            </span>
          </div>
          <div>
            <div className="flex gap-4">
              <div>
                <p className="text-3xl font-black font-sans text-gray-950 dark:text-white leading-none">{stats.criticalRisksCount}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-1">{translate('مخاطر حرجة حوكمية', 'Critical Risks')}</p>
              </div>
              <div className="border-r border-gray-100 dark:border-gray-800 pr-4">
                <p className="text-3xl font-black font-sans text-rose-600 leading-none">{stats.overdueTasksCount}</p>
                <p className="text-[9px] font-bold text-gray-400 mt-1">{translate('مهام امتثال متأخرة', 'Overdue Tasks')}</p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold mt-3">{translate('تتطلب توجيه فريق العمل وإصدار إنذار قانوني.', 'Requiring Immediate mitigation plans.')}</p>
          </div>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-bold">
            <span onClick={() => onNavigate('risks')} className="text-amber-600 cursor-pointer hover:underline">{translate('تفصيل سجل المحاكاة خطة العلاج ←', 'Define Mitigation plans →')}</span>
            <span>Ref: ISO-19600</span>
          </div>
        </div>

      </div>

      {/* Analytics, Charts & Real-time Integrations synchronization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recharts Bar Diagram */}
        <div className="bg-white dark:bg-dm-card p-5 rounded-[32xl] border border-gray-150/45 dark:border-gray-800 shadow-xs md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-dm-text">{translate('كفاءة ونسب الإنجاز حسب الجهة الرسمية', 'Obligations Resolution Rate by Issuing Board')}</h4>
              <p className="text-[10px] text-gray-400 font-bold">{translate('مقارنة الالتزامات المنجزة والمسجلة بقوانين الكويت', 'Comparing completed vs recorded provisions')}</p>
            </div>
            <span className="text-[10px] font-extrabold text-blue-600 dark:bg-blue-950/20 px-2 py-1 rounded-lg">CMA / CBK / MOCI</span>
          </div>
          
          <div className="h-[210px] text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} style={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} style={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                <Bar dataKey="الالتزامات المنجزة" name={translate('الالتزامات المنجزة والمطابقة', 'Conformed')} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="المجموع الكلي" name={translate('مجموع الالتزامات الكلية', 'Total Scheduled')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time sync panel - Link to HR, Projects, Cases, and Court files */}
        <div className="bg-white dark:bg-dm-card p-5 rounded-[32xl] border border-gray-150/45 dark:border-gray-800 shadow-xs">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
            <div>
              <h4 className="text-sm font-black text-gray-900 dark:text-dm-text">{translate('توافق ومزامنة الأنظمة المتكاملة', 'Cross-Module Live Integration')}</h4>
              <p className="text-[10px] text-gray-400 font-bold">{translate('مراقبة ربط الامتثال بأقسام عدالة المكتبيّة', 'Compliance bridges to other active modules')}</p>
            </div>
            <button 
              onClick={handleSyncGroup} 
              disabled={isSyncing}
              className="p-1.5 hover:bg-gray-50 dark:hover:bg-dark-border rounded-xl transition-all disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 text-blue-600 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-3.5">
            {/* Sync Row 1: HR & Wages */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50/65 dark:bg-dm-background rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg">
                  <UsersIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-800 dark:text-white">{translate('إدارة الموارد البشرية والرواتب', 'HR, Personnel & Wages')}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{translate('مستندات نهاية الخدمة والتأمينات', 'Leaves & end-of-service status')}</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                {translate('توافق 100%', 'Synchronized')}
              </span>
            </div>

            {/* Sync Row 2: Finance & Invoices */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50/65 dark:bg-dm-background rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-lg">
                  <BanknotesIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-800 dark:text-white">{translate('شؤون المحاسبة ومثبّت الغرامات', 'Corporate Finance & Fees Ledger')}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{translate('مراقبة استحقاقات الضرائب وسند الصرف', 'Tax limits & payout receipts')}</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                {translate('متوافق', 'Active Bridges')}
              </span>
            </div>

            {/* Sync Row 3: Contracts & Real Estate */}
            <div className="flex items-center justify-between p-2.5 bg-gray-50/65 dark:bg-dm-background rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-lg">
                  <FolderIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-gray-800 dark:text-white">{translate('سجل العقود والمشتريات الكلية', 'Corporate Deeds & Agreements')}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{translate('إشعارات إنهاء واستحقاقات الكفالات', 'Rent deadlines & termination dates')}</p>
                </div>
              </div>
              <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                {translate('مستقر', 'Stable Bridge')}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="text-[8px] text-gray-400 font-bold uppercase">{translate('آخر فحص توافق شامل مع الخادم', 'LAST COMPREHENSIVE RECONCILIATION')}:</span>
            <span className="text-[10px] text-gray-500 font-bold font-mono">{syncTimestamp}</span>
          </div>
        </div>

      </div>

      {/* Alert Hub & High Risk notifications banners */}
      <div className="bg-white dark:bg-dm-card p-5 rounded-[32xl] border border-gray-150/45 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <BellAlertIcon className="w-5 h-5 text-red-600 animate-pulse" />
          <h4 className="text-sm font-black text-gray-900 dark:text-dm-text">{translate('مركز الإنذارات الرقابية العاجلة والتنبيهات', 'Adala Real-Time Regulatory Notification Hub')}</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notifications.map(notif => (
            <div 
              key={notif.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                notif.level === 'danger' 
                  ? 'bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-950/35 text-rose-900 dark:text-rose-200' 
                  : notif.level === 'warning'
                  ? 'bg-amber-50/55 dark:bg-amber-950/10 border-amber-100 dark:border-amber-950/35 text-amber-900 dark:text-amber-200'
                  : 'bg-indigo-50/55 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-950/35 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                    notif.level === 'danger' ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700' :
                    notif.level === 'warning' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700' :
                    'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700'
                  }`}>
                    {translate(
                      notif.level === 'danger' ? 'تهديد غرامة وغلق' : notif.level === 'warning' ? 'إنذار مهلة عاجلة' : 'تنبيه إجرائي',
                      notif.level === 'danger' ? 'CRITICAL FINE EXPOSURE' : notif.level === 'warning' ? 'URGENT TASK REMINDER' : 'PROCEDURAL ALERT'
                    )}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-gray-400">{notif.due}</span>
                </div>
                <p className="text-xs font-extrabold leading-relaxed mb-3">
                  {translate(notif.textAr, notif.textEn)}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-150/20">
                <button 
                  onClick={() => onNavigate(notif.type === 'violation' ? 'violations' : notif.type === 'license' ? 'obligations' : 'tasks')}
                  className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {translate('معالجة المشكلة فوراً ←', 'Mitigate Immediately →')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
