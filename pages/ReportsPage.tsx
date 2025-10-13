import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import {
    PresentationChartLineIcon,
    InformationCircleIcon,
    CalendarDaysIcon,
    BriefcaseIcon,
    ClipboardDocumentListIcon,
    ShieldCheckIcon,
    UsersIcon,
    BuildingOffice2Icon,
    PrinterIcon,
    BanknotesIcon,
    ShareIcon, 
    CHART_COLORS,
    CASE_STATUS_CHART_COLORS,
    RISK_COLORS,
    JUDGMENT_OUTCOME_CHART_COLORS,
    TASK_PRIORITY_COLORS,
    COMPLIANCE_STATUS_CHART_COLORS,
    RepresentationRequestStatusChartColors
} from '../constants';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Case, CaseStatus, ComplianceRequirement, ComplianceStatus as ComplianceStatusEnum, RiskLevel, AdminTask, AdminTaskStatus, AdminTaskPriority, FinancialTransaction, FinancialTransactionType, LegalRepresentationRequest, RepresentationRequestStatus, CourtLevel } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PriorityBadge, CaseStatusBadge, RiskLevelBadge, ComplianceStatusBadge, RepresentationRequestStatusBadge, AdminTaskStatusBadge } from '../components/ui/Badge';

// Import mock data from other relevant pages
import { initialCases as mockCasesDataFromList } from './CaseListPage'; 
import initialMockTasks from './TaskManagementPage';
import { initialComplianceData } from './CompliancePage';
import { mockFinancialTransactions } from './FinancialManagementPage';
import { mockLegalRepresentationRequests } from './LegalRepresentationPage'; 

const formatCurrency = (amount?: number): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toFixed(3)} د.ك`;
};

const formatDateForReport = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString; 
      return dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateString; } 
};

const STATUS_COLORS_REPORTS: Record<string, string> = {
    ...CASE_STATUS_CHART_COLORS,
    ...RISK_COLORS,
    ...JUDGMENT_OUTCOME_CHART_COLORS,
    ...TASK_PRIORITY_COLORS,
    ...COMPLIANCE_STATUS_CHART_COLORS,
    ...RepresentationRequestStatusChartColors,
    [AdminTaskStatus.TODO]: CHART_COLORS[6],
    [AdminTaskStatus.IN_PROGRESS]: CHART_COLORS[10],
    [AdminTaskStatus.COMPLETED]: CHART_COLORS[0],
    [AdminTaskStatus.BLOCKED]: CHART_COLORS[13],
    [AdminTaskStatus.CANCELLED]: CHART_COLORS[12]
};

const COURT_LEVEL_COLORS: Record<CourtLevel, string> = {
    [CourtLevel.FIRST_INSTANCE]: CHART_COLORS[0],
    [CourtLevel.APPEALS_COURT]: CHART_COLORS[1],
    [CourtLevel.CASSATION_COURT]: CHART_COLORS[10],
    [CourtLevel.CONSTITUTIONAL_COURT]: CHART_COLORS[7],
    [CourtLevel.SPECIALIZED_COURT]: CHART_COLORS[6],
    [CourtLevel.ADMINISTRATIVE_COURT]: CHART_COLORS[5],
};


interface ReportOption { value: string; label: string; }
interface ReportCategoryDefinition {
  value: string;
  label: string;
  icon: React.ReactNode;
  subReports: ReportOption[];
}

const reportCategories: ReportCategoryDefinition[] = [
  {
    value: 'cases', label: 'تقارير القضايا', icon: <BriefcaseIcon className="w-5 h-5 me-2 text-primary" />,
    subReports: [
      { value: 'caseStatusDistribution', label: 'توزيع القضايا حسب الحالة' },
      { value: 'casesByLawyer', label: 'القضايا الموزعة على المحامين' },
      { value: 'casesByRisk', label: 'القضايا حسب مستوى الخطورة' },
      { value: 'upcomingHearingsWeekly', label: 'كشف الجلسات الأسبوعي' },
      { value: 'activeCases', label: 'القضايا المتداولة (النشطة)' },
      { value: 'casesByJudgmentOutcome', label: 'توزيع القضايا حسب نتيجة الحكم' },
      { value: 'casesByCourtLevel', label: 'توزيع القضايا حسب درجة التقاضي' },
    ],
  },
  {
    value: 'tasks', label: 'تقارير المهام', icon: <ClipboardDocumentListIcon className="w-5 h-5 me-2 text-primary" />,
    subReports: [
      { value: 'taskStatusDistribution', label: 'توزيع المهام حسب الحالة' },
      { value: 'tasksByPriority', label: 'المهام حسب الأولوية' },
      { value: 'overdueTasks', label: 'المهام المتأخرة (عام)' },
      { value: 'overdueHighPriorityTasks', label: 'المهام المتأخرة ذات الأولوية' },
    ],
  },
  {
    value: 'compliance', label: 'تقارير الامتثال', icon: <ShieldCheckIcon className="w-5 h-5 me-2 text-primary" />,
    subReports: [
      { value: 'complianceStatusOverview', label: 'نظرة عامة على حالة الامتثال' },
      { value: 'upcomingOrOverdueCompliance', label: 'مواعيد الامتثال الهامة' },
    ],
  },
   {
    value: 'financial', label: 'تقارير المالية', icon: <BanknotesIcon className="w-5 h-5 me-2 text-primary" />,
    subReports: [
        { value: 'expenseByCategory', label: 'المصروفات حسب الفئة' },
        { value: 'revenueVsExpense', label: 'مقارنة الإيرادات بالمصروفات' },
        { value: 'clientFinancialSummary', label: 'تقرير مالي للموكلين' },
    ],
  },
  {
    value: 'legalRepresentation',
    label: 'تقارير الإنابة القانونية',
    icon: <ShareIcon className="w-5 h-5 me-2 text-primary" />,
    subReports: [
        { value: 'representationStatusDistribution', label: 'توزيع طلبات الإنابة حسب الحالة' },
        { value: 'requestsBySubstituteLawyer', label: 'طلبات الإنابة المسندة للمحامين المنابين' },
    ],
  },
];

const timePeriodOptions: ReportOption[] = [
  { value: 'all', label: 'كل الأوقات' },
  { value: 'last7days', label: 'آخر 7 أيام' },
  { value: 'last30days', label: 'آخر 30 يومًا' },
  { value: 'currentMonth', label: 'الشهر الحالي' },
  { value: 'lastMonth', label: 'الشهر الماضي' },
  { value: 'currentYear', label: 'السنة الحالية' },
  { value: 'lastYear', label: 'السنة الماضية' },
  { value: 'customRange', label: 'نطاق مخصص' },
];

const ReportsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(reportCategories[0].value);
  const [selectedReport, setSelectedReport] = useState<string>(reportCategories[0].subReports[0].value);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chartType, setChartType] = useState<'pie' | 'bar' | 'list'>('bar'); 
  const [reportTitle, setReportTitle] = useState<string>('');

  const currentSubReportOptions = useMemo(() => {
    return reportCategories.find(cat => cat.value === selectedCategory)?.subReports || [];
  }, [selectedCategory]);
  
  useEffect(() => {
      const currentCategoryDef = reportCategories.find(cat => cat.value === selectedCategory);
      if (currentCategoryDef && currentCategoryDef.subReports.length > 0) {
          const firstSubReport = currentCategoryDef.subReports[0].value;
          const isCurrentReportValid = currentCategoryDef.subReports.some(sr => sr.value === selectedReport);
          if (!isCurrentReportValid) {
              setSelectedReport(firstSubReport);
          }
      }
  }, [selectedCategory, selectedReport]);

  const generateReport = useCallback(async () => {
    if (!selectedReport) return;
    setIsLoading(true);
    setReportData(null);
    
    await new Promise(resolve => setTimeout(resolve, 500)); 

    let data: any = {};
    let title = currentSubReportOptions.find(sr => sr.value === selectedReport)?.label || 'تقرير مخصص';
    let newChartType: 'pie' | 'bar' | 'list' = 'bar'; 

    const filterByTime = (itemDateStr: string | undefined): boolean => {
      if (selectedTimePeriod === 'all' || !itemDateStr) return true;
      const itemDate = new Date(itemDateStr);
      if(isNaN(itemDate.getTime())) return false;
      const now = new Date();
      if (selectedTimePeriod === 'customRange') {
        if (!customStartDate || !customEndDate) return false;
        const endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
        return itemDate >= new Date(customStartDate) && itemDate <= endDate;
      }
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1);
      const firstDayLastMonth = new Date(currentYear, currentMonth - 1, 1);
      const lastDayLastMonth = new Date(currentYear, currentMonth, 0);

      switch(selectedTimePeriod) {
        case 'last7days': return itemDate >= new Date(new Date().setDate(now.getDate() - 7));
        case 'last30days': return itemDate >= new Date(new Date().setDate(now.getDate() - 30));
        case 'currentMonth': return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
        case 'lastMonth': return itemDate >= firstDayLastMonth && itemDate <= lastDayLastMonth;
        case 'currentYear': return itemDate.getFullYear() === currentYear;
        case 'lastYear': return itemDate.getFullYear() === currentYear - 1;
        default: return true;
      }
    };
    
    const relevantCases = mockCasesDataFromList.filter(c => filterByTime(c.filingDate || c.createdDate));
    const relevantTasks = initialMockTasks.filter(t => filterByTime(t.createdAt || t.dueDate));
    const relevantCompliance = initialComplianceData.filter(c => filterByTime(c.createdAt || c.dueDate));
    const relevantFinancials = mockFinancialTransactions.filter(f => filterByTime(f.transactionDate));
    const relevantRepresentationRequests = mockLegalRepresentationRequests.filter(r => filterByTime(r.requestDate || r.createdAt));
    
    const processData = (items: any[], groupBy: string) => {
        const counts = items.reduce((acc, curr) => {
            const key = curr[groupBy];
            if(key) acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };
    
    // Switch-case for generating report data
    switch (selectedReport) {
        case 'caseStatusDistribution':
            data = { chartData: processData(relevantCases, 'status'), listData: relevantCases };
            newChartType = 'pie';
            break;
        case 'casesByLawyer':
            data = { chartData: processData(relevantCases, 'assignedLawyer'), listData: relevantCases };
            break;
        case 'casesByRisk':
            data = { chartData: processData(relevantCases, 'riskLevel'), listData: relevantCases };
            newChartType = 'pie';
            break;
        case 'upcomingHearingsWeekly': {
            const sevenDaysFromNow = new Date(); sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            const today = new Date(); today.setHours(0,0,0,0);
            data = { listData: mockCasesDataFromList.filter(c => c.nextHearingDate && new Date(c.nextHearingDate) <= sevenDaysFromNow && new Date(c.nextHearingDate) >= today).sort((a,b) => new Date(a.nextHearingDate!).getTime() - new Date(b.nextHearingDate!).getTime())};
            newChartType = 'list';
            break;
        }
        case 'activeCases':
             data = { listData: mockCasesDataFromList.filter(c => [CaseStatus.OPEN, CaseStatus.IN_PROGRESS, CaseStatus.APPEALED].includes(c.status))};
             newChartType = 'list';
             break;
        case 'casesByJudgmentOutcome':
            data = { chartData: processData(relevantCases.filter(c => c.judgmentOutcome), 'judgmentOutcome'), listData: relevantCases.filter(c => c.judgmentOutcome) };
            newChartType = 'pie';
            break;
        case 'casesByCourtLevel':
            data = { chartData: processData(relevantCases, 'courtLevel'), listData: relevantCases };
            break;
        case 'taskStatusDistribution':
            data = { chartData: processData(relevantTasks, 'status'), listData: relevantTasks };
            newChartType = 'pie';
            break;
        case 'tasksByPriority':
            data = { chartData: processData(relevantTasks, 'priority'), listData: relevantTasks };
            break;
        case 'overdueTasks': {
            const today = new Date(); today.setHours(0,0,0,0);
            data = { listData: initialMockTasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== AdminTaskStatus.COMPLETED && t.status !== AdminTaskStatus.CANCELLED) };
            newChartType = 'list';
            break;
        }
        case 'overdueHighPriorityTasks': {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const overdueTasks = initialMockTasks
                .filter(t =>
                    t.dueDate &&
                    new Date(t.dueDate) < today &&
                    t.status !== AdminTaskStatus.COMPLETED &&
                    t.status !== AdminTaskStatus.CANCELLED &&
                    (t.priority === AdminTaskPriority.HIGH || t.priority === AdminTaskPriority.MEDIUM)
                )
                .map(task => {
                    const dueDate = new Date(task.dueDate);
                    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
                    return {
                        'عنوان_المهمة': task.title,
                        'الأولوية': task.priority,
                        'تاريخ_الاستحقاق': formatDateForReport(task.dueDate),
                        'أيام_التأخير': daysOverdue,
                        'المسؤول': task.assignedTo,
                        'الحالة': task.status,
                        'مرتبطة_بـ': task.relatedCaseId || task.projectOrModule || '-',
                    };
                });
            data = { listData: overdueTasks };
            newChartType = 'list';
            break;
        }
        case 'complianceStatusOverview':
            data = { chartData: processData(relevantCompliance, 'status'), listData: relevantCompliance };
            newChartType = 'pie';
            break;
        case 'upcomingOrOverdueCompliance': {
            const thirtyDaysFromNow = new Date(); thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            data = { listData: initialComplianceData.filter(c => c.dueDate && new Date(c.dueDate) <= thirtyDaysFromNow && c.status !== ComplianceStatusEnum.COMPLIANT && c.status !== ComplianceStatusEnum.CANCELLED) };
            newChartType = 'list';
            break;
        }
        case 'expenseByCategory': {
            const expenses = relevantFinancials.filter(t => t.type === 'مصروف');
            const processed = expenses.reduce((acc, curr) => {
                const key = curr.category || 'غير مصنف';
                if(key) acc[key] = (acc[key] || 0) + Math.abs(curr.amount);
                return acc;
            }, {} as Record<string, number>);
            data = { chartData: Object.entries(processed).map(([name, value]) => ({ name, value: parseFloat(value.toFixed(3)) })), listData: expenses };
            break;
        }
        case 'revenueVsExpense': {
            const income = relevantFinancials.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
            const expenses = relevantFinancials.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            data = { chartData: [{ name: 'الإيرادات', value: income }, { name: 'المصروفات', value: expenses }], listData: relevantFinancials };
            break;
        }
        case 'clientFinancialSummary': {
            const clients = [...new Set(relevantCases.map(c => c.clientName))];
            const listData = clients.map(clientName => {
                const clientCases = relevantCases.filter(c => c.clientName === clientName);
                const clientCaseIds = clientCases.map(c => c.id);

                const clientTransactions = relevantFinancials.filter(tx => 
                    (tx.type === FinancialTransactionType.REVENUE || tx.type === FinancialTransactionType.OTHER_INCOME) &&
                    tx.relatedToEntity === 'case' &&
                    clientCaseIds.includes(tx.relatedEntityId || '')
                );

                const totalCollected = clientTransactions.reduce((sum, tx) => sum + tx.amount, 0);

                return {
                    'الموكل': clientName,
                    'عدد_القضايا': clientCases.length,
                    'إجمالي_المبالغ_المحصلة': formatCurrency(totalCollected),
                    'القضايا_المرتبطة': clientCases.map(c => c.caseNumber || c.title).join(' | '),
                };
            }).filter(client => client['عدد_القضايا'] > 0); // Only show clients with cases in the period
            
            data = { listData };
            newChartType = 'list';
            break;
        }
        case 'representationStatusDistribution':
            data = { chartData: processData(relevantRepresentationRequests, 'status'), listData: relevantRepresentationRequests };
            newChartType = 'pie';
            break;
        case 'requestsBySubstituteLawyer':
             data = { chartData: processData(relevantRepresentationRequests.filter(r => r.substituteLawyerName), 'substituteLawyerName'), listData: relevantRepresentationRequests.filter(r => r.substituteLawyerName) };
            break;
        default:
            data = { chartData: [], listData: [] };
            title = "التقرير غير متاح حاليًا";
            break;
    }

    setReportData(data);
    setReportTitle(title);
    setChartType(newChartType);
    setIsLoading(false);
  }, [selectedCategory, selectedReport, selectedTimePeriod, customStartDate, customEndDate, currentSubReportOptions]);

  const renderDetailedList = (listData: any[]) => {
    if (!listData || listData.length === 0) return <p className="text-center text-gray-500 py-4">لا توجد بيانات تفصيلية لعرضها.</p>;
    
    // Generic list rendering
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-xs">
                <thead className="bg-gray-50 dark:bg-dm-card/80">
                    <tr>
                        {Object.keys(listData[0]).map(key => <th key={key} className="px-2 py-2 text-right font-medium text-gray-600 dark:text-gray-300">{key.replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-dm-background divide-y divide-gray-200 dark:divide-gray-600">
                    {listData.map((row: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dm-card/60">
                            {Object.entries(row).map(([key, value]: [string, any]) => (
                                <td key={key} className="px-2 py-1.5 whitespace-nowrap max-w-[200px] truncate" title={String(value)}>
                                    {String(value)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

  const renderReportContent = () => {
    if (isLoading) return <div className="flex justify-center items-center p-10"><LoadingSpinner size="lg" /> <p className="ms-3">جاري تجهيز التقرير...</p></div>;
    if (!reportData) return <div className="text-center text-gray-500 py-10">يرجى اختيار تقرير والضغط على "عرض التقرير".</div>;
    
    const chartData = reportData.chartData;
    const listData = reportData.listData;

    return (
        <div className="space-y-6">
            {(chartType === 'pie' || chartType === 'bar') && chartData && chartData.length > 0 && (
                <Card title="الرسم البياني">
                    <ResponsiveContainer width="100%" height={300}>
                         {chartType === 'pie' ? (
                             <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {chartData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={STATUS_COLORS_REPORTS[entry.name] || COURT_LEVEL_COLORS[entry.name as CourtLevel] || CHART_COLORS[index % CHART_COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                         ) : (
                             <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" width={120} interval={0} fontSize={10} />
                                <Tooltip />
                                <Bar dataKey="value" name="العدد" barSize={20}>
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS_REPORTS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                    <LabelList dataKey="value" position="right" style={{ fill: 'black', fontSize: 10 }}/>
                                </Bar>
                            </BarChart>
                         )}
                    </ResponsiveContainer>
                </Card>
            )}
            {listData && listData.length > 0 && (
                <Card title="البيانات التفصيلية">
                    {renderDetailedList(listData)}
                </Card>
            )}
            {(!chartData || chartData.length === 0) && (!listData || listData.length === 0) && (
                 <div className="text-center text-gray-500 py-10">لا توجد بيانات لعرضها لهذا التقرير والفترة المحددة.</div>
            )}
        </div>
    );
};


  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <PresentationChartLineIcon className="w-8 h-8 text-primary dark:text-primary-light me-3" />
        <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">التقارير والإحصائيات الشاملة</h1>
      </div>
      
      <Card className="bg-primary-light/5 dark:bg-dm-card/30 border-primary-light/30 dark:border-dm-card report-selection-card print-hide">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-primary dark:text-primary-light me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-primary-dark dark:text-primary-light mb-1">استكشاف بيانات النظام</h3>
                <p className="text-sm text-neutral-text dark:text-dm-text-light leading-relaxed">
                    توفر هذه الوحدة مجموعة من التقارير المرئية والتفاعلية لمساعدتك على فهم أداء المكتب/القسم القانوني، وتحليل الاتجاهات، واتخاذ قرارات مستنيرة. 
                    اختر فئة التقرير، ثم التقرير الفرعي، وحدد الفترة الزمنية المطلوبة لعرض البيانات.
                </p>
            </div>
        </div>
      </Card>
      
      <Card className="report-selection-card print-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-dm-card/50 rounded-lg shadow">
              <Select label="فئة التقرير" value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); }}
                  options={reportCategories.map(cat => ({ value: cat.value, label: cat.label }))} />
              <Select label="التقرير الفرعي" value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}
                  options={currentSubReportOptions} disabled={currentSubReportOptions.length === 0}/>
              <Select label="الفترة الزمنية" value={selectedTimePeriod} onChange={(e) => setSelectedTimePeriod(e.target.value)} options={timePeriodOptions} />
          </div>
          {selectedTimePeriod === 'customRange' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-dm-card/50 rounded-lg shadow mt-2">
                  <Input label="من تاريخ" type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
                  <Input label="إلى تاريخ" type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
              </div>
          )}
          <div className="mt-4 flex justify-center">
              <Button onClick={generateReport} isLoading={isLoading} disabled={isLoading || !selectedReport}>
                  عرض التقرير
              </Button>
          </div>
      </Card>

      {reportData && (
        <div className="printable-report-wrapper">
            <div className="report-print-header">
                <h1>{reportTitle}</h1>
                <p>الفترة: {timePeriodOptions.find(o=>o.value === selectedTimePeriod)?.label} 
                    {selectedTimePeriod === 'customRange' && ` (${customStartDate} - ${customEndDate})`}
                </p>
                <p>تاريخ الإنشاء: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</p>
            </div>
           {renderReportContent()}
           <div className="mt-6 flex justify-end print-report-button">
                <Button onClick={() => window.print()} variant="outline" leftIcon={<PrinterIcon className="w-4"/>}>طباعة التقرير</Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;