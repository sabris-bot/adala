import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  X, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Calendar, 
  Eye, 
  Building2, 
  FolderLock, 
  Scale, 
  Info, 
  BookMarked,
  UserCheck,
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Trash2,
  ListCollapse,
  Layers,
  Sparkles
} from 'lucide-react';
import { GlobalSearchEngine, SearchItem, SearchFilters } from '../services/globalSearchService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export const GlobalSearchPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL query parsing indexer
  const initialQuery = searchParams.get('q') || '';

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedRecordType, setSelectedRecordType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedProperty, setSelectedProperty] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState<'relevance' | 'date_desc' | 'date_asc' | 'name_ar'>('relevance');

  // Preview Modal
  const [previewItem, setPreviewItem] = useState<SearchItem | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // UI responsive states
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  // Synchronization with url parameters
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchTerm(q);
  }, [searchParams]);

  // Handle URL updates
  const triggerSearchUrlUpdate = (query: string) => {
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Perform search matching
  const searchResultsData = useMemo(() => {
    const filterConfig: SearchFilters = {
      searchTerm: searchTerm,
      section: selectedSection,
      recordType: selectedRecordType,
      status: selectedStatus,
      court: selectedCourt || undefined,
      operator: selectedOperator || undefined,
      client: selectedClient || undefined,
      employee: selectedEmployee || undefined,
      property: selectedProperty || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    };

    const { items } = GlobalSearchEngine.search(filterConfig);

    // Apply Sorting logic
    const sorted = [...items];
    if (sortBy === 'date_desc') {
      sorted.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else if (sortBy === 'date_asc') {
      sorted.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    } else if (sortBy === 'name_ar') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    // 'relevance' sorting is default handled inside the service's scoring matching model

    return sorted;
  }, [
    searchTerm, 
    selectedSection, 
    selectedRecordType, 
    selectedStatus, 
    selectedCourt, 
    selectedOperator, 
    selectedClient, 
    selectedEmployee, 
    selectedProperty,
    dateFrom, 
    dateTo, 
    sortBy
  ]);

  // Extract unique facets from database for quick selections
  const facetOptions = useMemo(() => {
    const all = GlobalSearchEngine.buildIndex();
    const sections = Array.from(new Set(all.map(i => i.section)));
    const recordTypes = Array.from(new Set(all.map(i => i.type)));
    const statuses = Array.from(new Set(all.map(i => i.status)));
    const courts = Array.from(new Set(all.map(i => i.court).filter(Boolean)));
    const operators = Array.from(new Set(all.map(i => i.operator).filter(Boolean)));
    const properties = Array.from(new Set(all.map(i => i.property).filter(Boolean)));

    return {
      sections,
      recordTypes,
      statuses,
      courts,
      operators,
      properties
    };
  }, []);

  const clearAllFilters = () => {
    setSelectedSection('All');
    setSelectedRecordType('All');
    setSelectedStatus('All');
    setSelectedCourt('');
    setSelectedOperator('');
    setSelectedClient('');
    setSelectedEmployee('');
    setSelectedProperty('');
    setDateFrom('');
    setDateTo('');
    setSortBy('relevance');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dm-background p-4 sm:p-6 lg:p-8 font-tajawal text-right" dir="rtl">
      {/* 1. Header Banner & Dynamic stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 px-2.5 bg-accent/10 text-accent font-black text-[10px] rounded-lg border border-accent/20 tracking-wider">
                نظام البحث العام الذكي والمدقق والمنسق
              </span>
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              بوابة البحث السريع والذكي الشامل
            </h1>
            <p className="text-gray-400 text-xs font-bold mt-1.5 leading-relaxed">
              قم بالبحث الفوري الشامل في القضايا، شؤون الموظفين، عقود الإيجار والاستئسار، إدارة العقارات والودائع، وسجلات الامتثال في لحظة واحدة.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`p-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-2 border transition-all ${
                isFilterPanelOpen 
                  ? 'bg-primary text-white border-primary shadow-lg' 
                  : 'bg-white dark:bg-dm-card text-gray-700 dark:text-dm-text border-gray-100 dark:border-gray-800'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {isFilterPanelOpen ? 'إخفاء الفلاتر المتقدمة' : 'إظهار الفلاتر المتقدمة'}
            </button>
            
            <div className="flex items-center bg-white dark:bg-dm-card p-1 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-gray-100 dark:bg-dm-background text-primary' : 'text-gray-400'}`}
                title="عرض القائمة"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-dm-background text-primary' : 'text-gray-400'}`}
                title="عرض شبكي"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating live entry search bar */}
        <div className="mt-6 max-w-3xl">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                triggerSearchUrlUpdate(e.target.value);
              }}
              placeholder="اكتب كلمة، جملة، رقم قضية، اسم موكل، رقم مدني، اسم عقار أو تفتيش..."
              className="w-full ps-14 pe-6 py-4 bg-white dark:bg-dm-card border-2 border-transparent focus:border-primary/20 dark:focus:border-primary/10 rounded-2xl text-sm font-bold text-gray-800 dark:text-dm-text placeholder-gray-400 shadow-lg shadow-primary/5 focus:ring-4 focus:ring-primary/5 transition-all text-right h-14"
            />
            <div className="absolute inset-y-0 start-5 flex items-center select-none pointer-events-none">
              <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary layout container */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar Filters */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.aside
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: '320px' }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full lg:w-80 flex-shrink-0 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-xl space-y-5"
            >
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-black text-gray-800 dark:text-white flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-primary" />
                  خيارات التصفية والفرز المتقدمة
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 p-1 px-2.5 rounded-lg hover:bg-rose-100 transition-all"
                >
                  مسح الفلاتر
                </button>
              </div>

              {/* Sort By Facet */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">الترتيب والفرز العلمي</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full text-xs font-black text-gray-700 bg-gray-50 border-none rounded-xl h-10 px-3 cursor-pointer"
                >
                  <option value="relevance">حسب قوة الصلة بالمطابقة (Relevance)</option>
                  <option value="date_desc">التاريخ (الأحدث أولاً)</option>
                  <option value="date_asc">التاريخ (الأقدم أولاً)</option>
                  <option value="name_ar">الاسم الأبجدي (أ - ي)</option>
                </select>
              </div>

              {/* Section Facet */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 block">قسم النظام</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50 border-none rounded-xl h-10 px-3 cursor-pointer"
                >
                  <option value="All">جميع الأقسام والدوائر</option>
                  {facetOptions.sections.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              {/* Record Type Facet */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 block">نوع السجل المستهدف</label>
                <select
                  value={selectedRecordType}
                  onChange={(e) => setSelectedRecordType(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50 border-none rounded-xl h-10 px-3 cursor-pointer"
                >
                  <option value="All">جميع المستندات والملفات</option>
                  {facetOptions.recordTypes.map(rt => (
                    <option key={rt} value={rt}>{rt}</option>
                  ))}
                </select>
              </div>

              {/* Status Facet */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 block">حالة التشغيل</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50 border-none rounded-xl h-10 px-3 cursor-pointer"
                >
                  <option value="All">جميع الحالات والقرارات</option>
                  {facetOptions.statuses.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Court filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 block">المحكمة المعنية (القضايا)</label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50 border-none rounded-xl h-10 px-3 cursor-pointer"
                >
                  <option value="">جميع المحاكم والدوائر</option>
                  {facetOptions.courts.map(crt => (
                    <option key={crt} value={crt}>{crt}</option>
                  ))}
                </select>
              </div>

              {/* Assigned controller filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 block">المسؤول/المحامي المدقق</label>
                <select
                  value={selectedOperator}
                  onChange={(e) => setSelectedOperator(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50 border-none rounded-xl h-10 px-3 cursor-pointer"
                >
                  <option value="">جميع الكادر القانوني</option>
                  {facetOptions.operators.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              {/* Property filter */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 block">العقار أو المحيط المرتبط</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full text-xs font-bold text-gray-700 bg-gray-50 border-none rounded-xl h-10 px-3 cursor-pointer"
                >
                  <option value="">جميع الأصول والعقارات</option>
                  {facetOptions.properties.map(prop => (
                    <option key={prop} value={prop}>{prop}</option>
                  ))}
                </select>
              </div>

              {/* Date ranges */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <label className="text-[10px] font-black text-gray-400 block">الإطار الزمني لرفع الملف</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-black text-gray-450 block mb-1">من تاريخ</span>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full text-[10px] text-gray-700 bg-gray-50 border-none rounded-lg h-8 px-2"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-gray-450 block mb-1">إلى تاريخ</span>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full text-[10px] text-gray-700 bg-gray-50 border-none rounded-lg h-8 px-2"
                    />
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Search Results Display List Grid */}
        <main className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="text-gray-400 text-xs font-bold">
              لقد وجدنا <span className="text-primary dark:text-accent font-black">{searchResultsData.length}</span> نتيجة تفصيلية مطابقة للخيارات المحددة.
            </div>
            
            {/* Quick chips representing active filters */}
            <div className="flex flex-wrap gap-1.5 justify-end">
              {selectedSection !== 'All' && (
                <span className="p-1 px-2.5 bg-gray-100 text-gray-600 text-[9px] font-black rounded-lg">القسم: {selectedSection}</span>
              )}
              {selectedRecordType !== 'All' && (
                <span className="p-1 px-2.5 bg-gray-100 text-gray-600 text-[9px] font-black rounded-lg">النوع: {selectedRecordType}</span>
              )}
              {selectedStatus !== 'All' && (
                <span className="p-1 px-2.5 bg-gray-100 text-gray-600 text-[9px] font-black rounded-lg">الحالة: {selectedStatus}</span>
              )}
            </div>
          </div>

          {searchResultsData.length === 0 ? (
            <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-3xl p-12 text-center shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-dm-background flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white leading-tight">عذراً، لم نجد أي ملف يطابق شروط بحثك</h3>
              <p className="text-gray-400 text-xs font-bold mt-2 max-w-md mx-auto leading-relaxed">
                تأكد من كتابة الكلمات بالصيغة الصحيحة، أو تراجع عن بعض الفلاتر المركبة في القائمة الجانبية لإثراء كم نتائج الفهرس.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 py-2.5 px-6 text-xs text-primary bg-primary/5 hover:bg-primary hover:text-white font-black rounded-xl transition-all"
              >
                تحديث ومسح جميع فلاتر التصفية
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
              {searchResultsData.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-4 sm:p-5 hover:shadow-xl transition-all cursor-pointer relative group flex flex-col justify-between"
                  style={{ contentVisibility: 'auto' }}
                >
                  <div>
                    {/* Category Badging and record ID marker */}
                    <div className="flex justify-between items-center gap-1 mb-2.5">
                      <span className="text-[9px] font-mono tracking-wider font-extrabold text-gray-400 bg-gray-50 dark:bg-dm-background p-1 px-2.5 rounded-lg border border-transparent group-hover:border-gray-150">
                        {item.number}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-primary/5 dark:bg-accent/10 text-primary dark:text-accent rounded-md">
                          {item.section}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 bg-gray-50 text-gray-500 rounded-md">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    {/* Case / Record Primary Header */}
                    <h3 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors dark:text-white leading-snug">
                      {item.name}
                    </h3>
                    
                    {/* Item Text Snippet Description Description */}
                    <p className="text-gray-400 text-xs mt-2 font-bold leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Operational Footer Details with links or preview controls */}
                  <div className="mt-4 pt-3.5 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-450">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date || 'كود مفتوح'}</span>
                      {item.status && (
                        <span className={`ms-2 text-[9px] font-black px-2 py-0.5 rounded-full ${
                          item.statusType === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                          item.statusType === 'danger' ? 'bg-rose-500/10 text-rose-600' :
                          item.statusType === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-sky-500/10 text-sky-600'
                        }`}>
                          {item.status}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg transition-all"
                      >
                        معاينة سريعة
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(item.link)}
                        className="p-1.5 px-3 bg-primary/5 hover:bg-primary hover:text-white text-primary text-[10px] font-black rounded-lg transition-all flex items-center gap-1"
                      >
                        الانتقال
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* 3. Detail Preview Modal (Interactive) */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPreviewItem(null)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative z-10 text-right p-6 font-tajawal"
            >
              {/* Modal header details */}
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black px-2 py-0.5 bg-primary/5 text-primary rounded-md">
                      {previewItem.section}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
                      {previewItem.type}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-gray-400">
                      {previewItem.number}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                    {previewItem.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer border border-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dynamic preview tabs depending on record category */}
              <div className="py-6 space-y-4 max-h-[380px] overflow-y-auto pr-1">
                <div className="bg-gray-50 dark:bg-dm-background/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] font-black text-gray-400 block mb-1">وصف وملخص السجل الفهرسي</span>
                  <p className="text-gray-700 dark:text-dm-text text-xs font-bold leading-relaxed">
                    {previewItem.description}
                  </p>
                </div>

                {/* Sub-record parsing if case */}
                {previewItem.typeEn === 'Case' && previewItem.raw && (
                  <div className="space-y-3 font-tajawal">
                    <h4 className="text-xs font-black text-primary">تفاصيل ومواعيد القضية الكلية</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">المحكمة المعينة</span>
                        <span className="font-black mt-1 block">{previewItem.raw.courtName || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">المستشار المسؤول</span>
                        <span className="font-black mt-1 block">{previewItem.raw.assignedLawyer || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">الدائرة</span>
                        <span className="font-black mt-1 block">{previewItem.raw.circuit || 'N/A'}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">تاريخ رفع الدعوى الرسمية</span>
                        <span className="font-black mt-1 block">{previewItem.raw.filingDate || 'N/A'}</span>
                      </div>
                    </div>

                    {previewItem.raw.hearings && previewItem.raw.hearings.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-[10px] font-black text-gray-400 tracking-wider mb-2 uppercase">مخطط رول الجلسات</h5>
                        <div className="space-y-2">
                          {previewItem.raw.hearings.map((h: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-2.5 px-4 rounded-xl border border-gray-100">
                              <span className="text-xs font-black">{h.date} - جلسة {h.type}</span>
                              <span className="text-[10px] font-bold text-gray-400">{h.notes}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-record parsing if Employee */}
                {previewItem.typeEn === 'Employee' && previewItem.raw && (
                  <div className="space-y-3 font-tajawal">
                    <h4 className="text-xs font-black text-primary">الصفحة العقدية وملف الحساب للموظف</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">المسمى والصفة</span>
                        <span className="font-black mt-1 block">{previewItem.raw.jobTitle} | {previewItem.raw.department}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">البريد والهاتف</span>
                        <span className="font-black mt-1 block leading-relaxed">{previewItem.raw.email} <br/> {previewItem.raw.phone}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">الحساب البنكي IBAN</span>
                        <span className="font-black mt-1 block font-mono">{previewItem.raw.bankIban}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">تاريخ الانتساب والمباشرة</span>
                        <span className="font-black mt-1 block">{previewItem.raw.joiningDate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-record parsing if Property */}
                {previewItem.typeEn === 'Property' && previewItem.raw && (
                  <div className="space-y-3 font-tajawal">
                    <h4 className="text-xs font-black text-primary">المعطيات المالية للعقار</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">المالك المدون</span>
                        <span className="font-black mt-1 block">{previewItem.raw.landlord}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <span className="text-[9px] font-bold text-gray-400 block">الموقع الميداني</span>
                        <span className="font-black mt-1 block">{previewItem.raw.address}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer navigation details */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400">
                  تاريخ الأرشفة: {previewItem.date || 'كود تشغيل معتمد'}
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(null)}
                    className="py-2 px-5 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-xl transition-all"
                  >
                    إغلاق المعاينة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(previewItem.link);
                      setPreviewItem(null);
                    }}
                    className="py-2.5 px-6 bg-primary hover:bg-primary/90 text-white font-black text-xs rounded-xl flex items-center gap-2 transition-all shadow-md"
                  >
                    الانتقال للملف الرئيسي
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default GlobalSearchPage;
