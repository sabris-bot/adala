import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import { useToast } from '../ui/Toast';
import { localizationEngine, QAReport } from '../../services/i18n';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Upload, 
  Languages, 
  Layers, 
  Check, 
  FileText,
  Info
} from 'lucide-react';

export const LocalizationSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'qa' | 'io'>('editor');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'custom' | 'base' | 'missing'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en'>('ar');
  const [qaReport, setQaReport] = useState<QAReport | null>(null);

  // States for Edit / Add Key Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<{ key: string; ar: string; en: string } | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKey, setNewKey] = useState({ key: '', ar: '', en: '' });

  // System statistics
  const [stats, setStats] = useState({
    totalKeys: 0,
    arOverrideCount: 0,
    enOverrideCount: 0,
    defaultLang: 'ar'
  });

  // Load and refresh translations
  const loadData = () => {
    const arOverrides = localizationEngine.getCustomOverrides('ar');
    const enOverrides = localizationEngine.getCustomOverrides('en');
    const arBase = localizationEngine.getBaseTranslations('ar');
    const enBase = localizationEngine.getBaseTranslations('en');
    
    const allKeys = Array.from(new Set([
      ...Object.keys(arBase),
      ...Object.keys(enBase),
      ...Object.keys(arOverrides),
      ...Object.keys(enOverrides)
    ]));

    setStats({
      totalKeys: allKeys.length,
      arOverrideCount: Object.keys(arOverrides).length,
      enOverrideCount: Object.keys(enOverrides).length,
      defaultLang: i18n.language
    });

    // Run live QA Scan
    const qa = localizationEngine.runLocalizationQA();
    setQaReport(qa);
  };

  useEffect(() => {
    loadData();

    // Listen to overrides changed events to keep components synchronized
    window.addEventListener('translations_updated', loadData);
    return () => {
      window.removeEventListener('translations_updated', loadData);
    };
  }, [i18n.language]);

  // Combine translations for editing and rendering
  const translationsTable = useMemo(() => {
    const arOverrides = localizationEngine.getCustomOverrides('ar');
    const enOverrides = localizationEngine.getCustomOverrides('en');
    const arBase = localizationEngine.getBaseTranslations('ar');
    const enBase = localizationEngine.getBaseTranslations('en');

    const keys = Array.from(new Set([
      ...Object.keys(arBase),
      ...Object.keys(enBase),
      ...Object.keys(arOverrides),
      ...Object.keys(enOverrides)
    ])).sort();

    return keys.map((key) => {
      const isArCustom = key in arOverrides;
      const isEnCustom = key in enOverrides;
      const arVal = arOverrides[key] !== undefined ? arOverrides[key] : arBase[key] || '';
      const enVal = enOverrides[key] !== undefined ? enOverrides[key] : enBase[key] || '';
      
      return {
        key,
        ar: arVal,
        en: enVal,
        isCustom: isArCustom || isEnCustom,
        isMissing: !arVal || !enVal,
        isArCustom,
        isEnCustom
      };
    });
  }, [stats]);

  // Filter translation keys
  const filteredTranslations = useMemo(() => {
    return translationsTable.filter((item) => {
      const matchSearch = item.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.ar.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.en.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;

      if (filterType === 'custom') return item.isCustom;
      if (filterType === 'base') return !item.isCustom;
      if (filterType === 'missing') return item.isMissing;
      
      return true;
    });
  }, [translationsTable, searchQuery, filterType]);

  // Handle default language save
  const handleSaveDefaultLang = (lang: string) => {
    i18n.changeLanguage(lang);
    
    // Save locally
    const savedPrefs = localStorage.getItem('profile_preferences');
    const parsed = savedPrefs ? JSON.parse(savedPrefs) : {};
    parsed.lang = lang;
    localStorage.setItem('profile_preferences', JSON.stringify(parsed));
    
    addToast({
      type: 'success',
      title: 'تغيير اللغة الافتراضية',
      message: `تم تغيير لغة النظام الافتراضية إلى ${lang === 'ar' ? 'العربية' : 'الإنجليزية'} وتطبيق الاتجاه تلقائياً.`
    });
    
    loadData();
  };

  // Open Edit Dialog
  const handleOpenEdit = (item: typeof translationsTable[0]) => {
    setEditingKey({ key: item.key, ar: item.ar, en: item.en });
    setIsEditModalOpen(true);
  };

  // Save Edit Overrides
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKey) return;

    try {
      localizationEngine.saveCustomOverride('ar', editingKey.key, editingKey.ar);
      localizationEngine.saveCustomOverride('en', editingKey.key, editingKey.en);
      setIsEditModalOpen(false);
      
      addToast({
        type: 'success',
        title: 'تم حفظ الترجمة',
        message: `تم تحديث المصلح "${editingKey.key}" وتطبيق التعديل على المنظومة والتقارير فورياً.`
      });
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'فشل التعديل',
        message: 'حدث خطأ غير متوقع أثناء حفظ الترجمة المخصصة.'
      });
    }
  };

  // Delete Overrides for custom keys
  const handleDeleteOverride = (key: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في استعادة الإعدادات الأصلية الافتراضية للمفتاح "${key}"؟`)) {
      try {
        localizationEngine.deleteCustomOverride('ar', key);
        localizationEngine.deleteCustomOverride('en', key);
        
        addToast({
          type: 'info',
          title: 'تم استعادة الترجمة الافتراضية',
          message: 'تمت إزالة التعديل المخصص والرجوع لملف اللغة الأساسي بنجاح.'
        });
        loadData();
      } catch (err) {
        addToast({
          type: 'error',
          title: 'فشل تراجع الترجمة',
          message: 'حدث خطأ عند محاولة إزالة التعديل.'
        });
      }
    }
  };

  // Add a totally new translation key for extensible modules
  const handleAddKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.key.trim()) {
      alert('الرجاء إدخال اسم المفتاح البرمجي للتوطين!');
      return;
    }

    const keyLower = newKey.key.toLowerCase().trim().replace(/\s+/g, '_');

    // Check if key already exists
    const exists = translationsTable.some(t => t.key.toLowerCase() === keyLower);
    if (exists) {
      alert('هذا المفتاح البرمجي متواجد بالفعل بقواميس المنظومة!');
      return;
    }

    try {
      localizationEngine.saveCustomOverride('ar', keyLower, newKey.ar);
      localizationEngine.saveCustomOverride('en', keyLower, newKey.en);
      
      setNewKey({ key: '', ar: '', en: '' });
      setIsAddModalOpen(false);

      addToast({
        type: 'success',
        title: 'إضافة مصطلح جديد',
        message: `تم إضافة المفتاح البرمجي "${keyLower}" بنجاح وتوفيره للتضمين في واجهات الأنظمة الممتدة.`
      });
      loadData();
    } catch (err) {
      addToast({
        type: 'error',
        title: 'فشل الإضافة',
        message: 'حدث خطأ أثناء رصف المفتاح البرمجي المخصص.'
      });
    }
  };

  // Bulk Export JSON file
  const handleExportJSON = (lng: 'ar' | 'en') => {
    try {
      const data = localizationEngine.getCombinedTranslations(lng);
      const jsonStr = JSON.stringify({ translation: data }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `adala_localization_${lng}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'تصدير ناجح للقاموس',
        message: `تم تصدير حزمة اللغة ${lng === 'ar' ? 'العربية' : 'إنجليزية'} بصيغة JSON القياسية للتطبيقات الفرعية.`
      });
    } catch (e) {
      addToast({
        type: 'error',
        title: 'فشل التصدير',
        message: 'تعذر توليد ملف التصدير للغة المحددة.'
      });
    }
  };

  // Bulk Import JSON file
  const handleImportJSON = (lng: 'ar' | 'en', file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const dataPayload = parsed.translation || parsed;
        
        if (typeof dataPayload !== 'object' || dataPayload === null) {
          throw new Error('بنية الملف غير مطابقة لمعايير i18n القياسية (يجب أن تحتوي على كائن مفتاح-قيمة)');
        }

        localizationEngine.importTranslations(lng, dataPayload);
        addToast({
          type: 'success',
          title: 'دخول الحزمة المترجمة',
          message: `تم استيراد ودمج ${Object.keys(dataPayload).length} مصطلح مترجم وتفعيلها مباشرة بالواجهات.`
        });
        loadData();
      } catch (e: any) {
        addToast({
          type: 'error',
          title: 'خطأ في معالجة الحزمة',
          message: `الملف المرفوع معيب أو ليس بصيغة JSON مطابقة: ${e.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Central Configuration Header Card */}
      <Card className="p-8 rounded-[40px] bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-full uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5 animate-spin-slow" /> محرك التعريب الذكي والترجمة المتكاملة
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-dm-text tracking-tighter">
              منظومة التعريب وإدارة اللغات الحية
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
              تتيح هذه اللوحة تحكماً مطلقاً في ملفات التعريب والترجمة، التعديل المباشر على مصطلحات الواجهات القضائية والمالية، فحص مستويات الجودة والمواءمة اللغوية (QA Inspection) وتوليد التقارير المترابطة.
            </p>
          </div>

          {/* Core Language Selection Panel */}
          <div className="bg-slate-50 dark:bg-dm-background p-4 rounded-[28px] border border-gray-100 dark:border-gray-800 flex items-center gap-3.5 min-w-[280px]">
            <Languages className="w-10 h-10 text-indigo-600 flex-shrink-0" />
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">اللغة الحالية بالمتصفح</label>
              <div className="flex items-center gap-2">
                <Button 
                  size="xs" 
                  variant={i18n.language === 'ar' ? 'indigo' : 'white'}
                  className="rounded-xl px-4 py-1.5 font-black text-xs"
                  onClick={() => handleSaveDefaultLang('ar')}
                >
                  العربية (RTL)
                </Button>
                <Button 
                  size="xs" 
                  variant={i18n.language === 'en' ? 'indigo' : 'white'}
                  className="rounded-xl px-4 py-1.5 font-black text-xs"
                  onClick={() => handleSaveDefaultLang('en')}
                >
                  English (LTR)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-gray-800 relative z-10">
          <div className="bg-slate-50/50 dark:bg-dm-background/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المصطلحات المسجلة</p>
            <p className="text-2xl font-black text-slate-900 dark:text-dm-text font-mono">{stats.totalKeys}</p>
          </div>
          <div className="bg-slate-50/50 dark:bg-dm-background/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تعديلات مخصصة (عربي)</p>
            <p className="text-2xl font-black text-indigo-600 font-mono">{stats.arOverrideCount}</p>
          </div>
          <div className="bg-slate-50/50 dark:bg-dm-background/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تعديلات مخصصة (إنجليزي)</p>
            <p className="text-2xl font-black text-emerald-600 font-mono">{stats.enOverrideCount}</p>
          </div>
          <div className="bg-slate-50/50 dark:bg-dm-background/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">مؤشر موثوقية التوطين QA</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-black font-mono ${qaReport && qaReport.integrityPercentage > 90 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {qaReport ? `${qaReport.integrityPercentage}%` : '---'}
              </p>
              {qaReport && qaReport.integrityPercentage === 100 && (
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Sub tabs navigation */}
      <div className="flex gap-2.5 border-b border-gray-100 dark:border-gray-800 pb-px">
        {[
          { id: 'editor', label: 'محرر ومترجم القواميس', icon: <Edit3 className="w-4 h-4" /> },
          { id: 'qa', label: 'التفتيش الذكي ومراقبة الجودة QA', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'io', label: 'استيراد وتصدير الحزم اللغوية', icon: <Layers className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-black text-sm transition-all focus:outline-none ${
              activeSubTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Inner Sub Tab contents */}
      <div className="min-h-[400px]">
        {activeSubTab === 'editor' && (
          <div className="space-y-6">
            {/* Search and Filters Strip */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="w-full md:max-w-md relative">
                <Input
                  placeholder="ابحث بالحقل أو المصطلح البرمجي أو الترجمة..."
                  className="rounded-2xl ps-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="rounded-2xl text-xs font-bold"
                  options={[
                    { value: 'all', label: 'كل المصطلحات' },
                    { value: 'custom', label: 'المعدلة مخصصة فقط' },
                    { value: 'base', label: 'الافتراضية المرفقة' },
                    { value: 'missing', label: 'مفقود بها تعريب أو ترجمة' }
                  ]}
                />

                <Button 
                  variant="indigo"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/15"
                  onClick={() => {
                    setNewKey({ key: '', ar: '', en: '' });
                    setIsAddModalOpen(true);
                  }}
                >
                  إضافة مصطلح يدوي جديد
                </Button>

                <Button
                  variant="white"
                  className="rounded-2xl text-xs"
                  onClick={loadData}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  تحديث
                </Button>
              </div>
            </div>

            {/* Main Translation Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredTranslations.slice(0, 50).map((item) => (
                <Card 
                  key={item.key} 
                  className={`p-6 rounded-3xl border ${
                    item.isMissing 
                      ? 'border-rose-100 bg-rose-50/10 dark:border-rose-950/20' 
                      : item.isCustom 
                      ? 'border-indigo-100 bg-indigo-50/5 dark:border-indigo-950/20' 
                      : 'border-slate-100 dark:border-gray-800'
                  } transition-all hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="min-w-0">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-dm-background text-indigo-600 dark:text-indigo-400 font-mono text-[9px] font-black rounded-lg uppercase tracking-wide truncate max-w-[280px]">
                        {item.key}
                      </span>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        {item.isCustom && (
                          <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">مخصص/معدل</span>
                        )}
                        {item.isMissing && (
                          <span className="text-[9px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">مفقود جزئياً</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="xs"
                        variant="white"
                        className="rounded-lg p-1.5"
                        onClick={() => handleOpenEdit(item)}
                        title="تعديل الترجمة"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      </Button>
                      {item.isCustom && (
                        <Button
                          size="xs"
                          variant="white"
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                          onClick={() => handleDeleteOverride(item.key)}
                          title="استعادة الترجمة الافتراضية"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Languages Display Panel */}
                  <div className="space-y-3.5 bg-slate-50 dark:bg-dm-background p-4 rounded-2xl border border-slate-100 dark:border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Arabic Translation Block */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wide">النسخة العربية (RTL)</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-dm-text text-right" dir="rtl">
                          {item.ar || <span className="text-rose-500 italic font-medium">غير متوفرة</span>}
                        </p>
                      </div>

                      {/* English Translation Block */}
                      <div className="space-y-1 md:border-s md:border-slate-200 dark:md:border-gray-850 md:ps-4">
                        <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wide">النسخة الإنجليزية (LTR)</span>
                        <p className="text-sm font-bold text-slate-800 dark:text-dm-text text-left" dir="ltr">
                          {item.en || <span className="text-rose-500 italic font-medium">Undefined</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Dense Listing Alert */}
            {filteredTranslations.length > 50 && (
              <div className="text-center py-4 text-xs font-semibold text-slate-400">
                يتم عرض أول 50 مصطلح ومفتاح تعريب فقط. استخدم البحث لتصفية المفاتيح بدقة أعلى.
              </div>
            )}

            {filteredTranslations.length === 0 && (
              <div className="text-center py-16 bg-slate-50 dark:bg-dm-background rounded-[32px] border border-dashed border-slate-200 dark:border-gray-800">
                <Globe className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-base font-black text-slate-700 dark:text-dm-text">لم نعثر على تطابقات للمفتاح المطلوب</h3>
                <p className="text-xs text-slate-400 mt-1">الرجاء إدخال مصطلح بحث آخر أو إضافة المصطلح كحقل جديد مخصص.</p>
              </div>
            )}
          </div>
        )}

        {/* Translation Quality Assurance & Validation Panel */}
        {activeSubTab === 'qa' && qaReport && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Status overview and action advice */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-4">
                <div className={`p-5 rounded-full ${
                  qaReport.integrityPercentage > 95 
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' 
                    : qaReport.integrityPercentage > 85 
                    ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/40' 
                    : 'bg-rose-50 text-rose-500 dark:bg-rose-950/40'
                }`}>
                  <CheckCircle className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-dm-text">مؤشر جودة الترجمة</h3>
                  <p className="text-xs text-slate-400 mt-1">النسبة اللغوية للتوافق والتوطين السليم</p>
                </div>
                <p className="text-4xl font-black font-mono text-indigo-600">
                  {qaReport.integrityPercentage}%
                </p>
              </Card>

              {/* Quick advice rules */}
              <Card className="p-6 md:p-8 rounded-[32px] border border-slate-100 dark:border-gray-800 lg:col-span-2 space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-dm-text flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-600 animate-pulse" /> معايير تدقيق ومراجعة المنظومة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="p-3 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-100 dark:border-gray-850 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                    <p>مكافحة ثنائية النص (ألا تتطابق جملة عربية تماماً مع جملتها المترجمة بما تسببه من التباس).</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-100 dark:border-gray-850 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                    <p>المخرجات اللغوية المتزامنة (أن يتساوى عدد الأقراص المضافة لترجمة محتوى ديناميكي كالمواريث أو المحامي).</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-100 dark:border-gray-850 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                    <p>سلامة اتجاه القراءة اللغوي (RTL للعربية و LTR للإنجليزية) لتجنب قفزات المظهر.</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-dm-background rounded-xl border border-slate-100 dark:border-gray-850 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">✓</span>
                    <p>المصطلحات الكيفية والمختزلة (البحث والتحقق من عدم تسرب عبارات عربية إلى ملفات إنجليزي JSON).</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Detailed Verification Failures Lists */}
            
            {/* 1. Missing / Empty Translations */}
            <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-850 pb-4">
                <h4 className="text-base font-black text-slate-800 dark:text-dm-text flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  مصطلحات وقواميس مفقودة أو خالية ({qaReport.missingKeys.length})
                </h4>
                <p className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full uppercase">توطين حرج</p>
              </div>

              {qaReport.missingKeys.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-gray-850">
                  {qaReport.missingKeys.map((item) => (
                    <div key={item.key + item.language} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500 block">{item.key}</span>
                        <span className="text-[10px] font-bold text-rose-500">
                          {item.type === 'missing' ? 'المفتاح مفقود كلياً من حزمة اللغة:' : 'القيمة فارغة بحزمة اللغة:'} {item.language === 'ar' ? 'العربية' : 'الإنجليزية (English)'}
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="indigo"
                        onClick={() => {
                          const originalItem = translationsTable.find(t => t.key === item.key) || { key: item.key, ar: '', en: '' };
                          handleOpenEdit(originalItem);
                        }}
                      >
                        سد الثغرة البرمجية
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-bold text-emerald-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> لا يوجد مصطلحات فارغة ومفقودة! قواميس المنظومة متكاملة 100%.
                </div>
              )}
            </Card>

            {/* 2. Potential Untranslated Items */}
            <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-850 pb-4">
                <h4 className="text-base font-black text-slate-800 dark:text-dm-text flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  مصطلحات متطابقة أو تحتوي على لغة مدمجة ({qaReport.potentialUntranslated.length})
                </h4>
                <p className="text-[10px] font-black text-amber-600 bg-amber-50 rounded-full px-3 py-1 font-bold">مراجعة مرغوبة</p>
              </div>

              {qaReport.potentialUntranslated.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-gray-850">
                  {qaReport.potentialUntranslated.map((item) => (
                    <div key={item.key} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500 block">{item.key}</span>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                          عربي: {item.arValue} | إنجليزي: {item.enValue}
                        </p>
                        <span className="text-[10px] font-bold text-amber-600 italic mt-0.5 block">
                          سبب التنبيه: {item.reason}
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="indigo"
                        onClick={() => {
                          const originalItem = translationsTable.find(t => t.key === item.key) || { key: item.key, ar: item.arValue, en: item.enValue };
                          handleOpenEdit(originalItem);
                        }}
                      >
                        تصحيح الترجمة
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-bold text-emerald-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> رائع! لم يتم رصد أي كلمات متطابقة مكررة أو تداخل أحرف في الترجمة.
                </div>
              )}
            </Card>

            {/* 3. Structural Warnings */}
            <Card className="p-6 rounded-[32px] border border-slate-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-850 pb-4">
                <h4 className="text-base font-black text-slate-800 dark:text-dm-text flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  تحذيرات تكافؤ الهيكل والمحتوى ({qaReport.structuralWarnings.length})
                </h4>
                <p className="text-[10px] font-black text-blue-500 bg-blue-50 rounded-full px-3 py-1 font-bold">بنية الأكواد</p>
              </div>

              {qaReport.structuralWarnings.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-gray-850">
                  {qaReport.structuralWarnings.map((item) => (
                    <div key={item.key} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-500 block">{item.key}</span>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                          عربي: {item.arValue} | إنجليزي: {item.enValue}
                        </p>
                        <span className="text-[10px] font-semibold text-rose-500 block mt-0.5">
                          {item.warning}
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="indigo"
                        onClick={() => {
                          const originalItem = translationsTable.find(t => t.key === item.key) || { key: item.key, ar: item.arValue, en: item.enValue };
                          handleOpenEdit(originalItem);
                        }}
                      >
                        موازنة الأقواس
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs font-bold text-emerald-600 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" /> ممتاز! لا يوجد أي انحراف في أقواس المحتوى أو الرموز البرمجية للغات.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Translation Import / Export Tab */}
        {activeSubTab === 'io' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
            {/* Export Panel */}
            <Card className="p-8 rounded-[40px] border border-slate-100 dark:border-gray-800 space-y-6">
              <div className="space-y-2">
                <span className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-2xl inline-block">
                  <Download className="w-6 h-6 animate-bounce" />
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-dm-text">تصدير قواميس اللغة</h3>
                <p className="text-xs text-slate-400 font-medium font-tajawal">
                  قم بتحميل ملف التعريب والترجمة بصيغ JSON قياسية للرصف الخارجي، أو للتفعيل على استضافة Hostinger ومستودعات GitHub لضمان التنسيق المتزامن.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-gray-850">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dm-background rounded-2xl">
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-dm-text block">ملف تعريب الواجهات (العربية)</span>
                    <span className="text-[10px] font-bold text-slate-400">JSON Format, RTL Settings</span>
                  </div>
                  <Button
                    size="sm"
                    variant="indigo"
                    onClick={() => handleExportJSON('ar')}
                  >
                    تصدير الحزمة
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dm-background rounded-2xl">
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-dm-text block">ملف ترجمة واجهات المنظومة (English)</span>
                    <span className="text-[10px] font-bold text-slate-400">JSON Format, LTR Settings</span>
                  </div>
                  <Button
                    size="sm"
                    variant="indigo"
                    onClick={() => handleExportJSON('en')}
                  >
                    Export Package
                  </Button>
                </div>
              </div>
            </Card>

            {/* Import Panel */}
            <Card className="p-8 rounded-[40px] border border-slate-100 dark:border-gray-800 space-y-6">
              <div className="space-y-2">
                <span className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-2xl inline-block">
                  <Upload className="w-6 h-6" />
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-dm-text">استيراد ودمج التعديلات</h3>
                <p className="text-xs text-slate-400 font-medium">
                  قم برفع وحقن ملفات الترجمة والقاموس لاستبدال ودمج المخرجات والتخصيصات فورياً في المنظومة. سيقوم النظام بدمج التعديلات الذكية في المتصفح دون تدمير الإعدادات الأصلية.
                </p>
              </div>

              <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-gray-850">
                <div>
                  <label className="block text-xs font-black text-slate-600 dark:text-slate-400 mb-2">اسم الحزمة المستهدفة بالمدخلات</label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="xs"
                      variant={selectedLanguage === 'ar' ? 'indigo' : 'white'}
                      className="rounded-xl px-4 py-1.5 text-xs font-bold"
                      onClick={() => setSelectedLanguage('ar')}
                    >
                      دمج بالقاموس العربي (ar.json)
                    </Button>
                    <Button
                      size="xs"
                      variant={selectedLanguage === 'en' ? 'indigo' : 'white'}
                      className="rounded-xl px-4 py-1.5 text-xs font-bold"
                      onClick={() => setSelectedLanguage('en')}
                    >
                      Merge English Dict (en.json)
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-200 dark:border-gray-800 p-6 rounded-2xl text-center hover:border-indigo-600 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".json"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportJSON(selectedLanguage, file);
                    }}
                  />
                  <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">اسحب ملف JSON للترجمات هنا أو اضغط للاختيار</p>
                  <p className="text-[10px] text-slate-400 mt-1">امتداد ملفات .json فقط</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 5. OVERLAY MODALS FOR ADDING AND EDITING ITEMS */}

      {/* EDIT OVERRIDE MODAL */}
      <AnimatePresence>
        {isEditModalOpen && editingKey && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dm-card rounded-[32px] border border-slate-100 dark:border-gray-800 shadow-2xl p-8 max-w-xl w-full space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-gray-850 pb-4">
                <span className="text-[10px] font-black font-mono text-indigo-600 block mb-1 uppercase tracking-wider">{editingKey.key}</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-dm-text">تعديل وصياغة الترجمة والتعريب</h3>
                <p className="text-xs text-slate-400 font-medium">قم بتخصيص المصطلح وتكييفه لغوياً ليناسب السياق القانوني لمكتبك.</p>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">الصياغة باللغة العربية (RTL)</label>
                  <Input
                    value={editingKey.ar}
                    onChange={(e) => setEditingKey({ ...editingKey, ar: e.target.value })}
                    className="rounded-xl text-right font-bold text-sm"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">Translation in English (LTR)</label>
                  <Input
                    value={editingKey.en}
                    onChange={(e) => setEditingKey({ ...editingKey, en: e.target.value })}
                    className="rounded-xl text-left font-bold text-sm"
                    dir="ltr"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-gray-850">
                  <Button
                    type="button"
                    variant="white"
                    className="rounded-xl px-5 text-xs"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    إلغاء التعديل
                  </Button>
                  <Button
                    type="submit"
                    variant="indigo"
                    className="rounded-xl px-6 text-xs font-black"
                  >
                    حفظ الترجمة الحالية
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD NEW LOCALIZATION KEY MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dm-card rounded-[32px] border border-slate-100 dark:border-gray-800 shadow-2xl p-8 max-w-xl w-full space-y-6"
            >
              <div className="border-b border-slate-100 dark:border-gray-850 pb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-dm-text">إدراج مصطلح ومفتاح تعريب جديد</h3>
                <p className="text-xs text-slate-400 font-medium">يقوم المحرك برصف مفتاح جديد، مما يمكّن من إضافة عناصر وتحليلات قادمة في النظام.</p>
              </div>

              <form onSubmit={handleAddKeySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">المفتاح البرمجي للمصطلح (Localization Key)</label>
                  <Input
                    placeholder="مثال: main_case_archive_btn"
                    value={newKey.key}
                    onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                    className="rounded-xl text-left font-mono font-bold text-xs"
                    dir="ltr"
                    required
                  />
                  <span className="text-[9px] text-slate-500 font-medium block mt-1">يجب أن يتكون فقط من أحرف صغيرة (_) أو أرقام دون مسافات.</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">الترجمة العربية الافتراضية</label>
                  <Input
                    placeholder="الأرشيف القانوني الشامل للقضايا"
                    value={newKey.ar}
                    onChange={(e) => setNewKey({ ...newKey, ar: e.target.value })}
                    className="rounded-xl text-right font-bold text-sm"
                    dir="rtl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">English Translation</label>
                  <Input
                    placeholder="Comprehensive Legal cases Archive"
                    value={newKey.en}
                    onChange={(e) => setNewKey({ ...newKey, en: e.target.value })}
                    className="rounded-xl text-left font-bold text-sm"
                    dir="ltr"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-gray-850">
                  <Button
                    type="button"
                    variant="white"
                    className="rounded-xl px-5 text-xs"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    variant="indigo"
                    className="rounded-xl px-6 text-xs font-black"
                  >
                    رصف وإضافة المصطلح
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
