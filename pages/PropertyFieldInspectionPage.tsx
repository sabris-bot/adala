import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import {
  BuildingOffice2Icon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon,
  CameraIcon, WrenchScrewdriverIcon, PresentationChartLineIcon, HomeIcon,
  CheckCircleIcon, ExclamationTriangleIcon, PrinterIcon, FolderIcon,
  MagnifyingGlassIcon, ArrowPathIcon, SparklesIcon, CalendarDaysIcon,
  PaperClipIcon, TagIcon, ArrowRightIcon, XMarkIcon, ShieldCheckIcon
} from '../constants';
import {
  FieldPropertyInspection, StructuralConditionRating,
  StructuralElementEvaluation, InspectionCapturedPhoto, Property
} from '../types';
import {
  getStoredInspections, saveInspectionRecord, deleteInspectionRecord,
  DEFAULT_STRUCTURAL_ELEMENTS
} from '../data/fieldInspectionData';
import { mockProperties } from '../data/propertyData';

// Format currency helper
const formatKWD = (amount?: number) => {
  if (amount === undefined || amount === null) return '0.000 د.ك';
  return `${amount.toFixed(3)} د.ك`;
};

const formatDateAr = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('ar-KW', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

export const PropertyFieldInspectionPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();

  // Inspections State
  const [inspections, setInspections] = useState<FieldPropertyInspection[]>([]);
  useEffect(() => {
    setInspections(getStoredInspections());
  }, []);

  // Filter & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState('ALL');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<FieldPropertyInspection | null>(null);

  // Detail / Official Report Preview Modal State
  const [selectedInspectionForReport, setSelectedInspectionForReport] = useState<FieldPropertyInspection | null>(null);

  // Available Properties List (including mock fallback if empty)
  const availableProperties = useMemo(() => {
    if (mockProperties && mockProperties.length > 0) return mockProperties;
    return [
      { id: 'PROP-01', name: 'برج ناصر السكني - الشرق', address: 'الشرق، قطعة 3', units: [{ id: 'U-101', unitNumber: '101' }, { id: 'U-301', unitNumber: '301' }] },
      { id: 'PROP-02', name: 'مجمع الفروانية التجاري', address: 'الفروانية، قطعة 1', units: [{ id: 'U-M12', unitNumber: 'محل 12' }, { id: 'U-ELEV-B', unitNumber: 'المصعد الرئيسي B' }] },
      { id: 'PROP-03', name: 'عمارة السالمية الاستثمارية', address: 'السالمية، قطعة 6', units: [{ id: 'U-S10', unitNumber: 'شقة 10' }] }
    ] as Property[];
  }, []);

  // Filtered Inspections
  const filteredInspections = useMemo(() => {
    return inspections.filter(item => {
      const matchesSearch =
        item.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.unitNumber && item.unitNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProperty = selectedPropertyFilter === 'ALL' || item.propertyId === selectedPropertyFilter;
      const matchesRating = selectedRatingFilter === 'ALL' || item.overallCondition === selectedRatingFilter;
      const matchesSeverity = selectedSeverityFilter === 'ALL' || item.severityLevel === selectedSeverityFilter;

      return matchesSearch && matchesProperty && matchesRating && matchesSeverity;
    });
  }, [inspections, searchTerm, selectedPropertyFilter, selectedRatingFilter, selectedSeverityFilter]);

  // Key Metrics Calculations
  const metrics = useMemo(() => {
    const total = inspections.length;
    const critical = inspections.filter(i => i.overallCondition === StructuralConditionRating.CRITICAL_RISK || i.severityLevel === 'CRITICAL_URGENT').length;
    const totalCost = inspections.reduce((sum, i) => sum + (i.estimatedRepairCost || 0), 0);
    const linkedCount = inspections.filter(i => i.autoLinkToCostEfficiency).length;
    return { total, critical, totalCost, linkedCount };
  }, [inspections]);

  // Open Form Modal for Creating New Inspection
  const handleOpenNewModal = () => {
    setEditingInspection(null);
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Editing Inspection
  const handleOpenEditModal = (item: FieldPropertyInspection) => {
    setEditingInspection(item);
    setIsFormModalOpen(true);
  };

  // Handle Delete Record
  const handleDeleteRecord = (id: string, refNum: string) => {
    if (window.confirm(`هل أنت أصل من حذف تقرير المعاينة الميدانية رقم "${refNum}"؟`)) {
      const updated = deleteInspectionRecord(id);
      setInspections(updated);
      addToast({
        type: 'success',
        title: 'تم الحذف بنجاح',
        message: `تم حذف تقرير المعاينة الميدانية ${refNum}`
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dm-card p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-primary/10 text-primary rounded-xl dark:bg-primary/20 dark:text-accent">
              <CameraIcon className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              تفتيش العقار الميداني والتقييم الإنشائي
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            وحدة الفحص الهندسي الميداني لمعاينة حالة الوحدات والمباني، التقاط الصور عبر الكاميرا مباشرة، وتوليد تقارير حالة ترتبط تلقائياً بكفاءة التكاليف التشغيلية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            leftIcon={<PlusCircleIcon className="w-4 h-4" />}
            onClick={handleOpenNewModal}
            className="shadow-sm"
          >
            إضافة تقرير معاينة ميدانية جديد
          </Button>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-r-4 border-r-primary">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي معاينات العقارات</p>
          <p className="text-2xl font-bold font-mono mt-1 text-slate-900 dark:text-white">{metrics.total} تقريراً</p>
          <p className="text-[11px] text-slate-400 mt-0.5">سجلات الفحص الإنشائي المرصودة</p>
        </Card>

        <Card className="p-4 border-r-4 border-r-rose-500">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">العيوب والمخاطر الحرجة</p>
          <p className="text-2xl font-bold font-mono mt-1 text-rose-600 dark:text-rose-400">{metrics.critical} حالات</p>
          <p className="text-[11px] text-slate-400 mt-0.5">تتطلب تدخلاً هندسياً عاجلاً</p>
        </Card>

        <Card className="p-4 border-r-4 border-r-amber-500">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">تكلفة الصيانة الإنشائية التقديرية</p>
          <p className="text-xl font-bold font-mono mt-1 text-amber-600 dark:text-amber-400">{formatKWD(metrics.totalCost)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">ميزانية الإصلاحات الميدانية المطلوبة</p>
        </Card>

        <Card className="p-4 border-r-4 border-r-emerald-500">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">الربط بكفاءة التكاليف التشغيلية</p>
          <p className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">{metrics.linkedCount} موثقة</p>
          <p className="text-[11px] text-slate-400 mt-0.5">تزامن تلقائي مع تقرير كفاءة التكاليف</p>
        </Card>
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute start-3 top-3 text-slate-400" />
            <Input
              type="text"
              placeholder="البحث باسم العقار، رقم الوحدة، المفتش..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-9 text-xs"
            />
          </div>

          {/* Property Filter */}
          <Select
            value={selectedPropertyFilter}
            onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">جميع العقارات</option>
            {availableProperties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>

          {/* Condition Filter */}
          <Select
            value={selectedRatingFilter}
            onChange={(e) => setSelectedRatingFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">جميع التقييمات الإنشائية</option>
            <option value={StructuralConditionRating.EXCELLENT}>ممتاز</option>
            <option value={StructuralConditionRating.GOOD}>جيد</option>
            <option value={StructuralConditionRating.MODERATE_MAINTENANCE}>يحتاج صيانة متوسطة</option>
            <option value={StructuralConditionRating.CRITICAL_RISK}>حرج / خلل إنشائي</option>
          </Select>

          {/* Severity Filter */}
          <Select
            value={selectedSeverityFilter}
            onChange={(e) => setSelectedSeverityFilter(e.target.value)}
            className="text-xs"
          >
            <option value="ALL">جميع درجات الأهمية</option>
            <option value="CRITICAL_URGENT">حرج / طارئ</option>
            <option value="HIGH">عالي الخطورة</option>
            <option value="MEDIUM">متوسط</option>
            <option value="LOW">منخفض</option>
          </Select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>نتائج الفحص: <strong className="text-slate-900 dark:text-white font-mono">{filteredInspections.length}</strong> تقرير معاينة</span>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs font-medium ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              شبكي (Cards)
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md transition-all text-xs font-medium ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              جدول (Table)
            </button>
          </div>
        </div>
      </Card>

      {/* INSPECTIONS DISPLAY VIEW */}
      {filteredInspections.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <CameraIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد تقارير معاينة ميدانية تطابق المعايير المحددة</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            قم بإضافة أول تقرير معاينة إنشائية ميدانية للعقار وتوثيق الصور للربط التلقائي بتقرير كفاءة التكاليف التشغيلية
          </p>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<PlusCircleIcon className="w-4 h-4" />}
            onClick={handleOpenNewModal}
            className="mt-2"
          >
            إضافة معاينة الآن
          </Button>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredInspections.map(item => {
            const isCritical = item.overallCondition === StructuralConditionRating.CRITICAL_RISK || item.severityLevel === 'CRITICAL_URGENT';
            const isModerate = item.overallCondition === StructuralConditionRating.MODERATE_MAINTENANCE || item.severityLevel === 'HIGH';

            return (
              <Card
                key={item.id}
                className={`p-5 space-y-4 border-r-4 transition-all hover:shadow-md ${
                  isCritical ? 'border-r-rose-600 bg-rose-50/20 dark:bg-rose-950/10' :
                  isModerate ? 'border-r-amber-500 bg-amber-50/20 dark:bg-amber-950/10' :
                  'border-r-emerald-500 bg-emerald-50/10 dark:bg-emerald-950/10'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary dark:text-accent bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded">
                        {item.referenceNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDateAr(item.inspectionDate)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {item.propertyName} {item.unitNumber ? `- ${item.unitNumber}` : ''}
                    </h3>
                  </div>

                  {/* Rating Badge */}
                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 ${
                    isCritical ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-300' :
                    isModerate ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-300' :
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}>
                    {item.overallCondition}
                  </span>
                </div>

                {/* Body details */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="line-clamp-2 leading-relaxed">
                    <strong>ملاحظات المفتش:</strong> {item.notes}
                  </p>

                  {item.recommendations && (
                    <p className="line-clamp-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <strong>التوصيات:</strong> {item.recommendations}
                    </p>
                  )}

                  {/* Structural Element Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {item.structuralElements.map((elem, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 ${
                          elem.hasDefect
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {elem.hasDefect ? '🔴' : '✅'} {elem.elementName}
                      </span>
                    ))}
                  </div>

                  {/* Inspector and Cost Info */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">المفتش المسؤول:</span>
                      <span className="font-medium text-slate-900 dark:text-white truncate block">{item.inspectorName}</span>
                    </div>

                    <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">التكلفة التقديرية للإصلاح:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400 block">{formatKWD(item.estimatedRepairCost)}</span>
                    </div>
                  </div>

                  {/* Camera Photos Preview Thumbnails */}
                  {item.capturedPhotos && item.capturedPhotos.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <CameraIcon className="w-3.5 h-3.5 text-primary" />
                        الصور الميدانية الموثقة ({item.capturedPhotos.length} صورة)
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {item.capturedPhotos.map(photo => (
                          <div key={photo.id} className="relative group shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Linked to Operational Cost Efficiency Badge */}
                  {item.autoLinkToCostEfficiency && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 mt-2">
                      <span className="flex items-center gap-1.5 font-medium">
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                        مربوط تلقائياً بتقرير كفاءة التكاليف التشغيلية
                      </span>
                      <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded font-bold">
                        {item.linkedCostEfficiencyId || 'MNT-LINKED'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<PrinterIcon className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedInspectionForReport(item)}
                    className="text-xs"
                  >
                    توليد تقرير الحالة الإنشائية
                  </Button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs flex items-center gap-1"
                      title="تعديل"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(item.id, item.referenceNumber)}
                      className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg text-xs flex items-center gap-1"
                      title="حذف"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3 text-start">رقم المعاينة</th>
                  <th className="p-3 text-start">العقار والوحدة</th>
                  <th className="p-3 text-start">تاريخ المعاينة</th>
                  <th className="p-3 text-start">التقييم الإنشائي العام</th>
                  <th className="p-3 text-start">المفتش المسؤول</th>
                  <th className="p-3 text-start">تكلفة الإصلاح التقديرية</th>
                  <th className="p-3 text-start">الربط بالتكاليف</th>
                  <th className="p-3 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredInspections.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-primary">{item.referenceNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900 dark:text-white">{item.propertyName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{item.unitNumber || 'المبنى العام'}</p>
                    </td>
                    <td className="p-3 font-mono">{formatDateAr(item.inspectionDate)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.overallCondition === StructuralConditionRating.CRITICAL_RISK ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' :
                        item.overallCondition === StructuralConditionRating.MODERATE_MAINTENANCE ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {item.overallCondition}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{item.inspectorName}</td>
                    <td className="p-3 font-mono font-bold text-amber-600">{formatKWD(item.estimatedRepairCost)}</td>
                    <td className="p-3">
                      {item.autoLinkToCostEfficiency ? (
                        <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircleIcon className="w-3.5 h-3.5" /> موثق في الكفاءة
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">مستقل</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedInspectionForReport(item)}
                          className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-accent rounded-lg text-xs flex items-center gap-1"
                          title="عرض التقرير الرسمي"
                        >
                          <EyeIcon className="w-3.5 h-3.5" />
                          <span>التقرير</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs"
                          title="تعديل"
                        >
                          <PencilIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(item.id, item.referenceNumber)}
                          className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-300 rounded-lg text-xs"
                          title="حذف"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* FORM MODAL FOR CREATING / EDITING FIELD INSPECTION */}
      <InspectionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingInspection}
        properties={availableProperties}
        onSave={(savedRecord) => {
          const updated = saveInspectionRecord(savedRecord);
          setInspections(updated);
          setIsFormModalOpen(false);
          addToast({
            type: 'success',
            title: editingInspection ? 'تم تعديل تقرير المعاينة' : 'تم حفظ تقرير المعاينة الميدانية',
            message: `تم ربطه وحفظه بنجاح برقم المرجع ${savedRecord.referenceNumber}`
          });
        }}
      />

      {/* OFFICIAL STRUCTURAL CONDITION REPORT PREVIEW & PRINT MODAL */}
      {selectedInspectionForReport && (
        <Modal
          isOpen={!!selectedInspectionForReport}
          onClose={() => setSelectedInspectionForReport(null)}
          title={`تقرير المعاينة الميدانية والحالة الإنشائية - ${selectedInspectionForReport.referenceNumber}`}
          size="xl"
        >
          <OfficialInspectionReportView
            inspection={selectedInspectionForReport}
            onClose={() => setSelectedInspectionForReport(null)}
          />
        </Modal>
      )}
    </div>
  );
};

// FORM MODAL COMPONENT (WITH CAMERA CAPTURE & AUTO-LINK TOGGLE)
interface InspectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: FieldPropertyInspection | null;
  properties: Property[];
  onSave: (inspection: FieldPropertyInspection) => void;
}

const InspectionFormModal: React.FC<InspectionFormModalProps> = ({
  isOpen, onClose, initialData, properties, onSave
}) => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState<Partial<FieldPropertyInspection>>({
    propertyId: properties.length > 0 ? properties[0].id : '',
    propertyName: properties.length > 0 ? properties[0].name : '',
    unitNumber: '',
    inspectorName: 'م. أحمد العنيزي (مهندس السلامة والإنشاءات)',
    inspectionDate: new Date().toISOString().split('T')[0],
    overallCondition: StructuralConditionRating.GOOD,
    severityLevel: 'MEDIUM',
    notes: '',
    recommendations: '',
    estimatedRepairCost: 0,
    structuralElements: DEFAULT_STRUCTURAL_ELEMENTS,
    capturedPhotos: [],
    autoLinkToCostEfficiency: true
  });

  const [availableUnits, setAvailableUnits] = useState<{ id: string; unitNumber: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        const defaultProp = properties.length > 0 ? properties[0] : null;
        setFormData({
          id: `INSP-${Date.now()}`,
          referenceNumber: `INSP-2026/${Math.floor(10 + Math.random() * 90)}-${Math.floor(100 + Math.random() * 900)}`,
          propertyId: defaultProp?.id || '',
          propertyName: defaultProp?.name || '',
          unitNumber: defaultProp?.units && defaultProp.units.length > 0 ? defaultProp.units[0].unitNumber : 'المبنى العام',
          inspectorName: 'م. أحمد العنيزي (مهندس السلامة والإنشاءات)',
          inspectionDate: new Date().toISOString().split('T')[0],
          overallCondition: StructuralConditionRating.GOOD,
          severityLevel: 'MEDIUM',
          notes: '',
          recommendations: '',
          estimatedRepairCost: 150,
          structuralElements: JSON.parse(JSON.stringify(DEFAULT_STRUCTURAL_ELEMENTS)),
          capturedPhotos: [],
          autoLinkToCostEfficiency: true,
          createdAt: new Date().toISOString()
        });
      }
    }
  }, [isOpen, initialData, properties]);

  // Update units when property changes
  useEffect(() => {
    if (formData.propertyId) {
      const selectedProp = properties.find(p => p.id === formData.propertyId);
      if (selectedProp && selectedProp.units) {
        setAvailableUnits(selectedProp.units);
      } else {
        setAvailableUnits([]);
      }
    }
  }, [formData.propertyId, properties]);

  // Handle Image File Upload or Camera Capture
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        const newPhoto: InspectionCapturedPhoto = {
          id: `PHOTO-${Date.now()}-${index}`,
          url: base64Url,
          caption: `صورة معاينة كاميرا - ${file.name || 'التقاط ميداني'}`,
          timestamp: new Date().toLocaleString('ar-KW', { hour12: false })
        };
        setFormData(prev => ({
          ...prev,
          capturedPhotos: [...(prev.capturedPhotos || []), newPhoto]
        }));
      };
      reader.readAsDataURL(file);
    });

    addToast({
      type: 'info',
      title: 'تم التقاط وإضافة الصور',
      message: 'تم إدراج الصور الميدانية المتقطة في التقرير'
    });
  };

  // Toggle defect on structural element
  const handleToggleElementDefect = (index: number) => {
    setFormData(prev => {
      const updatedElements = [...(prev.structuralElements || [])];
      const cur = updatedElements[index];
      const newDefect = !cur.hasDefect;
      updatedElements[index] = {
        ...cur,
        hasDefect: newDefect,
        rating: newDefect ? StructuralConditionRating.MODERATE_MAINTENANCE : StructuralConditionRating.GOOD
      };
      return { ...prev, structuralElements: updatedElements };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId || !formData.propertyName) {
      addToast({ type: 'error', title: 'خطأ', message: 'يرجى اختيار العقار أولاً' });
      return;
    }

    const linkedCostId = formData.autoLinkToCostEfficiency ? `MNT-${Math.floor(800 + Math.random() * 199)}` : undefined;

    const recordToSave: FieldPropertyInspection = {
      id: formData.id || `INSP-${Date.now()}`,
      referenceNumber: formData.referenceNumber || `INSP-2026/08-${Math.floor(100 + Math.random() * 900)}`,
      propertyId: formData.propertyId || '',
      propertyName: formData.propertyName || '',
      unitId: formData.unitId,
      unitNumber: formData.unitNumber || 'المبنى العام',
      inspectorName: formData.inspectorName || 'مفتش عام',
      inspectionDate: formData.inspectionDate || new Date().toISOString().split('T')[0],
      overallCondition: formData.overallCondition || StructuralConditionRating.GOOD,
      severityLevel: formData.severityLevel || 'MEDIUM',
      structuralElements: formData.structuralElements || DEFAULT_STRUCTURAL_ELEMENTS,
      notes: formData.notes || 'معاينة ميدانية اعتيادية للعقار',
      recommendations: formData.recommendations || 'متابعة الدورية الشاملة',
      estimatedRepairCost: Number(formData.estimatedRepairCost) || 0,
      capturedPhotos: formData.capturedPhotos || [],
      autoLinkToCostEfficiency: !!formData.autoLinkToCostEfficiency,
      linkedCostEfficiencyId: linkedCostId,
      createdAt: formData.createdAt || new Date().toISOString()
    };

    onSave(recordToSave);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'تعديل تقرير معاينة ميدانية' : 'إضافة تقرير معاينة ميدانية وتفتيش إنشائي جديد'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Property Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العقار المعاين *</label>
            <Select
              value={formData.propertyId}
              onChange={(e) => {
                const prop = properties.find(p => p.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  propertyId: e.target.value,
                  propertyName: prop?.name || '',
                  unitNumber: prop?.units && prop.units.length > 0 ? prop.units[0].unitNumber : 'المبنى العام'
                }));
              }}
              required
              className="text-xs"
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوحدة / الجزء المفحوص *</label>
            <Input
              type="text"
              placeholder="مثال: شقة 301، المصعد B، السطح والأساسات"
              value={formData.unitNumber}
              onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تاريخ المعاينة *</label>
            <Input
              type="date"
              value={formData.inspectionDate}
              onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
              required
              className="text-xs"
            />
          </div>
        </div>

        {/* Inspector & Overall Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم المهندس/المفتش المسؤول *</label>
            <Input
              type="text"
              value={formData.inspectorName}
              onChange={(e) => setFormData({ ...formData, inspectorName: e.target.value })}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التقييم الإنشائي العام *</label>
            <Select
              value={formData.overallCondition}
              onChange={(e) => setFormData({ ...formData, overallCondition: e.target.value as StructuralConditionRating })}
              className="text-xs"
            >
              <option value={StructuralConditionRating.EXCELLENT}>ممتاز (حالة جديدة/ممتازة)</option>
              <option value={StructuralConditionRating.GOOD}>جيد (سليم مع استهلاك طبيعي)</option>
              <option value={StructuralConditionRating.MODERATE_MAINTENANCE}>يحتاج صيانة متوسطة</option>
              <option value={StructuralConditionRating.CRITICAL_RISK}>حرج / خلل إنشائي خطير</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تكلفة الإصلاح التقديرية (د.ك)</label>
            <Input
              type="number"
              step="0.001"
              placeholder="0.000"
              value={formData.estimatedRepairCost}
              onChange={(e) => setFormData({ ...formData, estimatedRepairCost: parseFloat(e.target.value) || 0 })}
              className="text-xs font-mono font-bold"
            />
          </div>
        </div>

        {/* Structural Elements Evaluation Checklist */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            فحص العناصر الإنشائية والخدمية للعقار (Structural Element Checklist)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            {(formData.structuralElements || []).map((elem, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleElementDefect(idx)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  elem.hasDefect
                    ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${elem.hasDefect ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-white'}`}>
                    {elem.hasDefect ? '!' : '✓'}
                  </span>
                  <span className="font-medium">{elem.elementName}</span>
                </div>
                <span className="text-[10px] font-bold">
                  {elem.hasDefect ? 'به خلل/يتطلب صيانة' : 'سليم'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات الفحص والتقييم الميداني *</label>
            <TextArea
              rows={3}
              placeholder="اكتب الملاحظات الفنية التي تم رصدها أثناء التفتيش..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">التوصيات والإجراءات الهندسية المطلوبة</label>
            <TextArea
              rows={3}
              placeholder="توصيات الصيانة أو الاستبدال أو توجيه الإنذار للشركة المتعهد..."
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
              className="text-xs"
            />
          </div>
        </div>

        {/* Direct Camera Capture & Photo Upload Support */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CameraIcon className="w-4 h-4 text-primary" />
              التقاط صور المعاينة الميدانية مباشرة من الكاميرا
            </label>
            <span className="text-[11px] text-slate-400">يدعم التقاط الهاتف أو الرفع مباشرة</span>
          </div>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-primary transition-all bg-slate-50/50 dark:bg-slate-800/30">
            <CameraIcon className="w-8 h-8 text-slate-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">التقاط صورة جديدة أو اختيار ملفات</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-2">يمكنك تشغيل الكاميرا مباشرة من الجهاز</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
              id="field-camera-file-input"
            />
            <label htmlFor="field-camera-file-input">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-primary/90 transition-all">
                <CameraIcon className="w-4 h-4" />
                تشغيل الكاميرا والتقاط صور
              </span>
            </label>
          </div>

          {/* Captured Photos Gallery preview */}
          {formData.capturedPhotos && formData.capturedPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {formData.capturedPhotos.map((photo, idx) => (
                <div key={photo.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                  <img src={photo.url} alt={photo.caption} className="w-full h-20 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        capturedPhotos: prev.capturedPhotos?.filter(p => p.id !== photo.id)
                      }));
                    }}
                    className="absolute top-1 end-1 p-1 bg-rose-600 text-white rounded-full text-[10px]"
                    title="حذف الصورة"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                  <div className="p-1 text-[9px] bg-slate-900/80 text-white truncate">
                    {photo.caption}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto Link to Operational Cost Efficiency Report Toggle */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-emerald-600" />
              ربط تلقائي بتقرير 'كفاءة التكاليف التشغيلية'
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              يقوم بإدراج الملاحظات والتكلفة التقديرية مباشرة كـ Benchmark في تقرير الكفاءة مع تنبيه بالإمكانية الإنشائية
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.autoLinkToCostEfficiency}
            onChange={(e) => setFormData({ ...formData, autoLinkToCostEfficiency: e.target.checked })}
            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary shrink-0"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            إلغاء
          </Button>
          <Button type="submit" variant="primary" size="sm" leftIcon={<CheckCircleIcon className="w-4 h-4" />}>
            حفظ تقرير المعاينة الميدانية
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// OFFICIAL FORMATED REPORT VIEW & PRINT COMPONENT
const OfficialInspectionReportView: React.FC<{
  inspection: FieldPropertyInspection;
  onClose: () => void;
}> = ({ inspection, onClose }) => {
  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Official Printed Document Box */}
      <div className="p-8 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 font-sans">
        {/* Header Branding */}
        <div className="flex justify-between items-start border-b-2 border-primary/20 pb-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-primary dark:text-accent">
              مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية
            </h2>
            <p className="text-xs text-slate-500">قسم إدارة العقارات والفحص الهندسي الميداني</p>
            <p className="text-[10px] text-slate-400 font-mono">الكويت - برج الحمراء - الدور 35 | هاتف: 22440099</p>
          </div>

          <div className="text-end space-y-1">
            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 font-mono font-bold text-xs rounded-lg text-primary">
              {inspection.referenceNumber}
            </span>
            <p className="text-[11px] text-slate-500 font-mono block">التاريخ: {formatDateAr(inspection.inspectionDate)}</p>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">
            تقرير التفتيش الميداني والمعاينة الإنشائية للعقار
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Field Property Inspection & Structural Condition Official Report</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl text-xs border border-slate-200/80 dark:border-slate-700/80">
          <div>
            <span className="text-slate-400 text-[10px] block">اسم العقار:</span>
            <span className="font-bold text-slate-900 dark:text-white">{inspection.propertyName}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">رقم الوحدة / الجزء:</span>
            <span className="font-mono font-bold text-primary">{inspection.unitNumber || 'المبنى العام'}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">المفتش الهندسي:</span>
            <span className="font-medium text-slate-900 dark:text-white">{inspection.inspectorName}</span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block">التقييم الإنشائي العام:</span>
            <span className="font-bold text-amber-600">{inspection.overallCondition}</span>
          </div>
        </div>

        {/* Structural Elements Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <WrenchScrewdriverIcon className="w-4 h-4 text-primary" />
            جدول نتائج معاينة العناصر الإنشائية والخدمية
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-2.5 text-start">العنصر الإنشائي / الخدمي</th>
                  <th className="p-2.5 text-start">حالة الفحص</th>
                  <th className="p-2.5 text-start">الملاحظات الفنية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inspection.structuralElements.map((elem, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium">{elem.elementName}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        elem.hasDefect ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {elem.hasDefect ? '🔴 يحتاج صيانة/خلل' : '✅ سليم'}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">{elem.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Notes */}
        <div className="space-y-1.5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white">ملاحظات التفتيش الهندسي الميداني:</h4>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{inspection.notes}</p>
        </div>

        {/* Recommendations & Cost Estimate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-amber-900 dark:text-amber-300">التوصيات الهندسية:</h4>
            <p className="text-slate-700 dark:text-slate-300">{inspection.recommendations || 'متابعة الصيانة الاحترازية المشتركة.'}</p>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl text-xs space-y-1">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-300">التكلفة الإنشائية التقديرية:</h4>
            <p className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatKWD(inspection.estimatedRepairCost)}</p>
            <p className="text-[10px] text-slate-500">مرتبطة تلقائياً بتقرير كفاءة التكاليف التشغيلية ({inspection.linkedCostEfficiencyId || 'MNT-LINKED'})</p>
          </div>
        </div>

        {/* Attached Photos */}
        {inspection.capturedPhotos && inspection.capturedPhotos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <CameraIcon className="w-4 h-4 text-primary" />
              الصور الفوتوغرافية الموثقة للكاميرا الميدانية
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {inspection.capturedPhotos.map(photo => (
                <div key={photo.id} className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1 bg-slate-50 dark:bg-slate-800">
                  <img src={photo.url} alt={photo.caption} className="w-full h-28 object-cover rounded-lg" />
                  <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate">{photo.caption}</p>
                  <p className="text-[9px] font-mono text-slate-400">{photo.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signatures Footer */}
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 dark:border-slate-700 text-xs">
          <div className="text-center space-y-8">
            <p className="font-bold text-slate-700 dark:text-slate-300">توقيع المفتش الهندسي المسؤول</p>
            <div className="border-b border-dashed border-slate-300 w-36 mx-auto"></div>
            <p className="text-[10px] text-slate-400">{inspection.inspectorName}</p>
          </div>

          <div className="text-center space-y-8">
            <p className="font-bold text-slate-700 dark:text-slate-300">اعتماد إدارة العقارات والاستشارات</p>
            <div className="border-b border-dashed border-slate-300 w-36 mx-auto"></div>
            <p className="text-[10px] text-slate-400">ختم المكتب القانوني</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={onClose}>
          إغلاق
        </Button>
        <Button variant="primary" size="sm" leftIcon={<PrinterIcon className="w-4 h-4" />} onClick={() => window.print()}>
          طباعة التقرير الرسمي
        </Button>
      </div>
    </div>
  );
};
