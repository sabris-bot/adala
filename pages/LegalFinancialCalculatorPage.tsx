
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import TextArea from '../components/ui/TextArea';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  CalculatorIcon, 
  BanknotesIcon, 
  ScaleIcon, 
  GavelIcon, 
  BriefcaseIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  InformationCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ClipboardListCheckIcon,
  UsersIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  HistoryIcon
} from '../constants';
import { useJurisdiction } from '../components/JurisdictionContext';
import { initialCases } from '../data/caseData';
import { legalFinancialService } from '../services/legalFinancialService';

// Types and Interfaces
type CalcCategory = 'court_fees' | 'legal_interest' | 'labor_rights' | 'compensations' | 'fines';
type CalcStatus = 'paid' | 'unpaid' | 'partial' | 'review' | 'late' | 'completed' | 'pending' | 'contested';

interface LegalText {
  article: string;
  lawName: string;
  explanation: string;
  application: string;
  source: string;
  rate?: number;
  effectiveDate: string;
}

interface FinancialOperation {
  id: string;
  title: string;
  category: CalcCategory;
  subType: string;
  caseId?: string;
  courtName?: string;
  clientName: string;
  claimAmount: number;
  principalAmount: number;
  interestRate?: number;
  interestType?: string;
  startDate?: string;
  endDate?: string;
  daysCount?: number;
  totalFees: number;
  totalInterest: number;
  expenses: number;
  attorneyFees: number;
  expertFees: number;
  finalTotal: number;
  netDue: number;
  status: CalcStatus;
  legalTexts: LegalText[];
  notes: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  payments: PaymentRecord[];
}

interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
}

// Mock initial data based on user stories
const initialOperations: FinancialOperation[] = [
  {
    id: '1',
    title: 'فوائد تأخير عقد توريد تجاري',
    category: 'legal_interest',
    subType: 'فائدة تجارية',
    caseId: 'CASE-2024-5541',
    courtName: 'المحكمة الكلية - دائرة تجاري/7',
    clientName: 'شركة الخليج للتوريدات',
    claimAmount: 50000,
    principalAmount: 45000,
    interestRate: 7,
    interestType: 'تجاري قانوني',
    startDate: '2023-01-01',
    endDate: '2024-05-10',
    daysCount: 495,
    totalFees: 1250,
    totalInterest: 4273.97,
    expenses: 120,
    attorneyFees: 500,
    expertFees: 300,
    finalTotal: 51443.97,
    netDue: 51443.97,
    status: 'pending',
    priority: 'high',
    notes: 'احتساب بناءً على عقد التوريد المؤرخ في 2022',
    legalTexts: [
      {
        article: '110',
        lawName: 'قانون التجارة الكويتي',
        explanation: 'إذا كان محل الالتزام مبلغاً من النقود وكان معلوم المقدار وقت نشوء الالتزام وتأخر المدين في الوفاء به، كان ملزماً بأن يدفع للدائن، كتعويض عن التأخير، فوائد بسعر 7% سنوياً بالنسبة للالتزامات التجارية.',
        application: 'تم تطبيق نسبة 7% على المبلغ المستحق البالغ 45,000 د.ك',
        source: 'القانون رقم 68 لسنة 1980',
        rate: 7,
        effectiveDate: '1980-01-01'
      }
    ],
    createdAt: '2024-05-01',
    updatedAt: '2024-05-01',
    payments: []
  },
  {
    id: '2',
    title: 'مكافأة نهاية خدمة لموظف (تخصص هندسة)',
    category: 'labor_rights',
    subType: 'مكافأة نهاية الخدمة',
    clientName: 'المهندس أحمد خالد',
    claimAmount: 0,
    principalAmount: 1800, // Salary
    startDate: '2015-05-01',
    endDate: '2024-05-01',
    daysCount: 3288,
    totalFees: 10,
    totalInterest: 0,
    expenses: 0,
    attorneyFees: 100,
    expertFees: 0,
    finalTotal: 13500,
    netDue: 13500,
    status: 'completed',
    priority: 'medium',
    notes: 'استقالة بعد خدمة أكثر من 9 سنوات',
    legalTexts: [
      {
        article: '51',
        lawName: 'قانون العمل الكويتي رقـم 6 لسنة 2010',
        explanation: 'يستحق العامل مكافأة نهاية سنة بواقع 15 يوماً عن كل سنة من السنوات الخمس الأولى و30 يوماً عن كل سنة تالية.',
        application: 'تم احتساب 15 يوماً عن أول 5 سنوات و30 يوماً عن الباقي (4 سنوات) مع تطبيق معامل الاستقالة (2/3).',
        source: 'قانون العمل بالقطاع الأهلي',
        effectiveDate: '2010-02-21'
      }
    ],
    createdAt: '2024-05-05',
    updatedAt: '2024-05-08',
    payments: [
      { id: 'p1', amount: 13500, date: '2024-05-08', method: 'تحويل بنكي', reference: 'TRX-9982' }
    ]
  }
];

const LegalFinancialCalculatorPage: React.FC = () => {
  const { selectedJurisdiction } = useJurisdiction();
  const [operations, setOperations] = useState<FinancialOperation[]>(initialOperations);
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'late' | 'reports'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOp, setSelectedOp] = useState<FinancialOperation | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState('basic');

  // Form State
  const [formData, setFormData] = useState<Partial<FinancialOperation>>({
    category: 'court_fees',
    subType: '',
    clientName: '',
    principalAmount: 0,
    interestRate: 0,
    startDate: '',
    endDate: new Date().toISOString().split('T')[0],
    status: 'unpaid',
    priority: 'medium',
    legalTexts: []
  });

  // Summary Stats
  const stats = useMemo(() => {
    return {
      totalFees: operations.reduce((sum, op) => sum + op.totalFees, 0),
      totalInterest: operations.reduce((sum, op) => sum + op.totalInterest, 0),
      unpaidCount: operations.filter(op => op.status === 'unpaid' || op.status === 'late').length,
      totalAmount: operations.reduce((sum, op) => sum + op.finalTotal, 0)
    };
  }, [operations]);

  const filteredOperations = operations.filter(op => {
    const matchesSearch = op.title.includes(searchTerm) || op.clientName.includes(searchTerm) || (op.caseId && op.caseId.includes(searchTerm));
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unpaid') return matchesSearch && (op.status === 'unpaid' || op.status === 'pending');
    if (activeTab === 'late') return matchesSearch && op.status === 'late';
    return matchesSearch;
  });

  const handleCalculate = () => {
    const { category, subType, principalAmount, startDate, endDate, interestRate } = formData;
    if (!principalAmount || !startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let calcInterest = 0;
    let calcFees = 0;
    let calcIndemnity = 0;
    let finalTotal = principalAmount;
    let ref = '';

    if (category === 'legal_interest') {
      const type = formData.subType?.includes('تجاري') ? 'COMMERCIAL' : 'CIVIL';
      const result = legalFinancialService.calculateLegalInterest(principalAmount, start, end, type);
      calcInterest = result.interest;
      finalTotal = result.total;
    } else if (category === 'court_fees') {
      const result = legalFinancialService.calculateKuwaitCourtFee(principalAmount, 'FIRST_INSTANCE');
      calcFees = result.total;
      finalTotal = principalAmount + calcFees;
      ref = result.ref;
    } else if (category === 'labor_rights') {
      // Keep labor rights logic or move it to a centralized labor service later
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const years = diffDays / 365.25;
      const dailyRate = principalAmount / 26;
      if (years <= 5) {
        calcIndemnity = (dailyRate * 15) * years;
      } else {
        calcIndemnity = (dailyRate * 15) * 5 + (dailyRate * 26) * (years - 5);
      }
      if (formData.notes?.toLowerCase().includes('استقالة') || formData.title?.includes('استقالة')) {
        if (years < 3) calcIndemnity = 0;
        else if (years < 5) calcIndemnity *= 0.5;
        else if (years < 10) calcIndemnity *= 0.666;
      }
      finalTotal = calcIndemnity;
      calcFees = 0;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const newOp: FinancialOperation = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title || `عملية ${subType}`,
      category: formData.category as CalcCategory,
      subType: formData.subType || '',
      clientName: formData.clientName || 'بدون اسم',
      claimAmount: principalAmount,
      principalAmount: principalAmount,
      interestRate: interestRate,
      startDate: startDate,
      endDate: endDate,
      daysCount: diffDays,
      totalFees: calcFees,
      totalInterest: calcInterest,
      expenses: 0,
      attorneyFees: 0,
      expertFees: 0,
      finalTotal: finalTotal,
      netDue: finalTotal,
      status: 'unpaid',
      priority: formData.priority || 'medium',
      notes: formData.notes || '',
      legalTexts: formData.legalTexts || [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      payments: []
    };

    setOperations([newOp, ...operations]);
    setIsAddModalOpen(false);
  };

  const renderStatusBadge = (status: CalcStatus) => {
    const variants: Record<CalcStatus, BadgeVariant> = {
      paid: 'success',
      unpaid: 'danger',
      partial: 'warning',
      review: 'info',
      late: 'danger',
      completed: 'success',
      pending: 'secondary',
      contested: 'danger'
    };
    
    const labels: Record<CalcStatus, string> = {
      paid: 'مدفوع',
      unpaid: 'غير مدفوع',
      partial: 'جزئي',
      review: 'قيد المراجعة',
      late: 'متأخر',
      completed: 'مكتمل',
      pending: 'بانتظار السداد',
      contested: 'تحت الاعتراض'
    };

    return <Badge variant={variants[status]} text={labels[status]} />;
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 rtl">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-dm-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center me-4 shadow-inner">
            <CalculatorIcon className="w-9 h-9 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-DM-Text-Primary">حاسبة الرسوم والفوائد القانونية</h1>
            <p className="text-gray-500 text-sm mt-1">نظام مالي وقانوني متكامل لاحتساب المستحقات والمصروفات القضائية بدقة</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            leftIcon={<PlusCircleIcon className="w-5" />}
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-md shadow-primary/20"
          >
            إضافة عملية حساب
          </Button>
          <Button 
            variant="ghost" 
            leftIcon={<PrinterIcon className="w-5" />}
            onClick={() => window.print()}
          >
            طباعة التقارير
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-200 dark:border-gray-700"
            leftIcon={<ArrowDownTrayIcon className="w-5" />}
          >
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الرسوم المستحقة', value: stats.totalFees, icon: GavelIcon, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'إجمالي الفوائد المتراكمة', value: stats.totalInterest, icon: BanknotesIcon, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'مطالبات غير مسددة', value: stats.unpaidCount, icon: ExclamationTriangleIcon, color: 'text-red-500', bg: 'bg-red-50' },
          { label: 'إجمالي القيمة المالية', value: stats.totalAmount, icon: ScaleIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' }
        ].map((stat, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-all duration-300 border-none bg-white dark:bg-dm-card">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} dark:bg-opacity-10 me-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-gray-900 dark:text-DM-Text-Primary mt-1">
                  {stat.value.toLocaleString(undefined, { minimumFractionDigits: 3 })} <span className="text-xs font-normal opacity-60">د.ك</span>
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-gray-50/50 dark:bg-dm-background p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex bg-white dark:bg-dm-card p-1 rounded-xl shadow-sm">
          {[
            { id: 'all', label: 'الكل', icon: ChartBarIcon },
            { id: 'unpaid', label: 'غير مسدد', icon: ClockIcon },
            { id: 'late', label: 'متأخرات', icon: ExclamationTriangleIcon },
            { id: 'reports', label: 'تقارير بيانية', icon: ChartBarIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-dm-background'
              }`}
            >
              <tab.icon className="w-4 h-4 me-2" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-96">
          <Input 
            placeholder="بحث عن عملية، موكل، أو رقم قضية..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-10 h-11"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute start-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Main Operations Table or Reports */}
      {activeTab === 'reports' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-black mb-6 flex items-center">
              <ChartBarIcon className="w-5 h-5 me-2 text-primary" />
              توزيع العمليات حسب النوع
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'رسوم قضائية', value: operations.filter(o => o.category === 'court_fees').length },
                      { name: 'فوائد قانونية', value: operations.filter(o => o.category === 'legal_interest').length },
                      { name: 'حقوق عمالية', value: operations.filter(o => o.category === 'labor_rights').length },
                      { name: 'تعويضات', value: operations.filter(o => o.category === 'compensations').length }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-black mb-6 flex items-center">
              <BanknotesIcon className="w-5 h-5 me-2 text-primary" />
              تحليل المبالغ (د.ك)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'أصل المبالغ', value: operations.reduce((s, o) => s + o.principalAmount, 0) },
                    { name: 'إجمالي الرسوم', value: operations.reduce((s, o) => s + o.totalFees, 0) },
                    { name: 'إجمالي الفوائد', value: operations.reduce((s, o) => s + o.totalInterest, 0) }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-0 overflow-hidden border-none shadow-sm dark:bg-dm-card">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 dark:bg-dm-background text-gray-500 text-xs font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4">نوع العملية</th>
                <th className="px-6 py-4">الموكل / القضية</th>
                <th className="px-6 py-4">أصل المبلغ</th>
                <th className="px-6 py-4">الرسوم / الفوائد</th>
                <th className="px-6 py-4">الإجمالي</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {filteredOperations.map((op) => (
                <tr key={op.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center me-3 ${
                        op.category === 'court_fees' ? 'bg-blue-100 text-blue-600' :
                        op.category === 'legal_interest' ? 'bg-amber-100 text-amber-600' :
                        'bg-emerald-100 text-emerald-600'
                      } dark:bg-opacity-10`}>
                        {op.category === 'court_fees' ? <GavelIcon className="w-4 h-4" /> : <BanknotesIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-DM-Text-Primary">{op.subType}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{op.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-800 dark:text-DM-Text-Primary">{op.clientName}</p>
                    <p className="text-[10px] text-primary flex items-center mt-1">
                      <BriefcaseIcon className="w-3 h-3 me-1" />
                      {op.caseId || 'غير مرتبط بقضية'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-DM-Text-Secondary">
                    {op.principalAmount.toLocaleString()} د.ك
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-blue-600">رسوم: {op.totalFees.toLocaleString()} د.ك</p>
                      <p className="text-xs font-bold text-amber-600">فوائد: {op.totalInterest.toLocaleString()} د.ك</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-md font-black text-primary">{op.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}</p>
                  </td>
                  <td className="px-6 py-4">{renderStatusBadge(op.status)}</td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-500">{op.createdAt}</p>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => { setSelectedOp(op); setIsDetailModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-danger hover:bg-red-50 rounded-lg transition-colors">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOperations.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 dark:bg-dm-background rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
                <CalculatorIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 dark:text-DM-Text-Primary">لا توجد عمليات مسجلة</h3>
              <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">ابدأ بإضافة أول عملية حسابية قانونية لعرضها في هذا الجدول وإدارتها مالياً.</p>
            </div>
          )}
        </div>
      </Card>
    )}

      {/* Add Operation Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة عملية حساب مالي وقانوني جديدة"
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="مسمى العملية" 
                  placeholder="مثلاً: رسوم استئناف قضايا العمال" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <Select 
                  label="نوع الحاسبة"
                  options={[
                    { value: 'court_fees', label: 'رسوم المحاكم والدعاوى' },
                    { value: 'legal_interest', label: 'الفوائد القانونية/التجارية' },
                    { value: 'labor_rights', label: 'مستحقات العمال ونهاية الخدمة' },
                    { value: 'compensations', label: 'التعويضات والأضرار' },
                    { value: 'fines', label: 'الغرامات والتأخير' }
                  ]}
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as CalcCategory})}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                label="المبلغ الأساسي (Principal)" 
                type="number" 
                value={formData.principalAmount?.toString()}
                onChange={e => setFormData({...formData, principalAmount: parseFloat(e.target.value) || 0})}
              />
              <Input 
                label="نسبة الفائدة (إن وجد)" 
                type="number" 
                value={formData.interestRate?.toString()}
                onChange={e => setFormData({...formData, interestRate: parseFloat(e.target.value) || 0})}
              />
              <Select 
                label="المحكمة المختصة"
                options={[
                  { value: 'total', label: 'المحكمة الكلية' },
                  { value: 'appeal', label: 'محكمة الاستئناف' },
                  { value: 'cassation', label: 'محكمة التمييز' }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="تاريخ بداية الاستحقاق" 
                type="date" 
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
              <Input 
                label="تاريخ نهاية الحساب" 
                type="date" 
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input 
                  label="اسم الموكل / المستفيد" 
                  placeholder="أدخل الاسم بالكامل"
                  value={formData.clientName}
                  onChange={e => setFormData({...formData, clientName: e.target.value})}
               />
               <Select 
                  label="ربط بالقضية (اختياري)"
                  options={initialCases.map(c => ({ value: c.id, label: `${c.caseNumber} - ${c.title}` }))}
               />
            </div>

            <TextArea 
              label="ملاحظات وتفاصيل إضافية" 
              placeholder="أي تفاصيل قانونية تتعلق بطريقة الحساب أو ظروف الحالة..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="lg:border-s lg:ps-8 space-y-6">
             <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20">
                <h4 className="flex items-center text-primary font-black mb-3">
                  <ScaleIcon className="w-5 h-5 me-2" />
                  النصوص القانونية المرجعية
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  سيتم عرض المواد القانونية المرتبطة بنوع العملية المختار بناءً على التشريع الكويتي الحديث.
                </p>
                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-dm-background rounded-xl border border-primary/10 shadow-sm">
                    <p className="text-[10px] font-black text-primary mb-1">المادة 110 تجاري</p>
                    <p className="text-[10px] text-gray-500 leading-tight">تأخر المدين في الوفاء والتزامه بدفع 7% فوائد تأخير...</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-[11px]" leftIcon={<PlusCircleIcon className="w-3" />}>إضافة مادة يدوياً</Button>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-900 dark:text-DM-Text-Primary">إعدادات إضافية</h4>
                <div className="space-y-2">
                   <label className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dm-background cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 text-primary rounded me-3" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">إدراج أتعاب المحاماة</span>
                   </label>
                   <label className="flex items-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dm-background cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 text-primary rounded me-3" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">إدراج رسوم الخبراء</span>
                   </label>
                </div>
             </div>

             <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button className="w-full h-12 text-lg font-black" onClick={handleCalculate}>
                  احسب واحفظ العملية
                </Button>
                <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                  بمجرد الحفظ، سيتم تحديث السجل المالي وسجل القضايا المرتبط بشكل تلقائي.
                </p>
             </div>
          </div>
        </div>
      </Modal>

      {/* Operation Detail Modal with Tabs */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedOp?.title || 'تفاصيل العملية'}
        size="xl"
      >
        {selectedOp && (
          <div className="flex flex-col h-[70vh]">
            {/* Modal Tabs Integration */}
            <div className="flex border-b border-gray-100 dark:border-gray-800 mb-6 overflow-x-auto no-scrollbar">
              {[
                { id: 'basic', label: 'البيانات الأساسية', icon: ClipboardListCheckIcon },
                { id: 'fees', label: 'الرسوم والمصروفات', icon: GavelIcon },
                { id: 'interest', label: 'الفوائد القانونية', icon: BanknotesIcon },
                { id: 'legal', label: 'النصوص القانونية', icon: ScaleIcon },
                { id: 'payments', label: 'سجل المدفوعات', icon: ClockIcon },
                { id: 'logs', label: 'سجل العمليات', icon: HistoryIcon }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all gap-2 ${
                    detailActiveTab === tab.id 
                    ? 'border-primary text-primary bg-primary/5' 
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              {detailActiveTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-gray-900 border-s-4 border-primary ps-2">معلومات الموكل والحالة</h4>
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-dm-background rounded-2xl">
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">اسم الموكل:</span>
                         <span className="text-xs font-bold">{selectedOp.clientName}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">المحكمة:</span>
                         <span className="text-xs font-bold">{selectedOp.courtName || 'غير محددة'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">رقم القضية:</span>
                         <span className="text-xs font-bold">{selectedOp.caseId || '---'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">حالة المطالبة:</span>
                         <span>{renderStatusBadge(selectedOp.status)}</span>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-gray-900 border-s-4 border-amber-500 ps-2">ملخص الأرقام</h4>
                    <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                       <div className="flex justify-between">
                         <span className="text-xs text-amber-600">أصل المبلغ:</span>
                         <span className="text-xs font-black text-amber-900">{selectedOp.principalAmount.toLocaleString()} د.ك</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-amber-600">إجمالي الرسوم:</span>
                         <span className="text-xs font-black text-amber-900">{selectedOp.totalFees.toLocaleString()} د.ك</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-amber-600">إجمالي الفوائد:</span>
                         <span className="text-xs font-black text-amber-900">{selectedOp.totalInterest.toLocaleString()} د.ك</span>
                       </div>
                       <div className="pt-2 border-t border-amber-200 mt-2 flex justify-between items-center">
                         <span className="text-sm font-black text-amber-900">المبلغ النهائي:</span>
                         <span className="text-lg font-black text-primary">{selectedOp.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {detailActiveTab === 'legal' && (
                <div className="space-y-4 pb-4">
                   <h4 className="text-sm font-black text-gray-900 dark:text-DM-Text-Primary mb-4">النصوص والمواد القانونية المعتمد عليها في الحساب</h4>
                   {selectedOp.legalTexts.map((text, idx) => (
                     <div key={idx} className="p-5 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-md me-2 uppercase">المادة {text.article}</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-DM-Text-Primary">{text.lawName}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">ساري من: {text.effectiveDate}</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4 italic">
                          "{text.explanation}"
                        </p>
                        <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                           <p className="text-[11px] font-bold text-primary mb-1 flex items-center">
                             <InformationCircleIcon className="w-3 h-3 me-1" />
                             كيف تم تطبيق هذه المادة:
                           </p>
                           <p className="text-[11px] text-gray-700 dark:text-gray-300">{text.application}</p>
                        </div>
                     </div>
                   ))}
                   <Button variant="outline" className="w-full border-dashed" leftIcon={<PlusCircleIcon className="w-4" />}>إضافة سند قانوني جديد لهذه العملية</Button>
                </div>
              )}

              {detailActiveTab === 'payments' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-dm-background p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">إجمالي المبلغ المحصل</p>
                      <p className="text-xl font-black text-gray-900 dark:text-DM-Text-Primary">
                        {selectedOp.payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} 
                        <span className="text-xs font-normal text-gray-400 ms-1">دينار كويتي</span>
                      </p>
                    </div>
                    <Button variant="primary" size="sm" leftIcon={<PlusCircleIcon className="w-4" />}>إثبات دفعة جديدة</Button>
                  </div>

                  <div className="space-y-2">
                    {selectedOp.payments.length > 0 ? selectedOp.payments.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white dark:bg-dm-card rounded-xl border border-gray-50 dark:border-gray-800 group hover:border-emerald-200 transition-colors">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center me-4">
                            <BanknotesIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-DM-Text-Primary">{p.amount.toLocaleString()} د.ك</p>
                            <p className="text-[10px] text-gray-500">{p.date} • {p.method}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">{p.reference}</span>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-gray-400">
                        <p className="text-sm">لا توجد دفعات مسجلة حتى الآن.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t flex flex-wrap gap-3 justify-center">
               <Button variant="outline" leftIcon={<PrinterIcon className="w-4" />} onClick={() => window.print()}>طباعة تقرير تفصيلي</Button>
               <Button variant="outline" leftIcon={<ArrowDownTrayIcon className="w-4" />}>تصدير البيانات (CSV)</Button>
               <Button variant="ghost" className="text-danger hover:bg-red-50" leftIcon={<TrashIcon className="w-4" />}>حذف السجل</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LegalFinancialCalculatorPage;
