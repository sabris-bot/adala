import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/Toast';
import { RiskLevel } from '../types';

// Imported Types & Data
import { 
  ComplianceSubmodule, ComplianceCategoryExtended,
  PolicyProfile, ObligationProfile, RiskRegisterProfile, ViolationProfile,
  AuditProfile, InvestigationProfile, CorrectiveActionProfile, FollowupProfile,
  TaskProfile, AuditLogEntry, HistoryLog
} from './compliance/types';

import {
  initialPolicies, initialObligations, initialRisks, initialViolations,
  initialAudits, initialInvestigations, initialCorrectiveActions,
  initialFollowups, initialReports, initialTasks, initialAuditLogs
} from './compliance/data';

// Helper custom components
import { DashboardTab } from './compliance/components/DashboardTab';
import { OfficialCertificateModal } from './compliance/components/OfficialCertificateModal';
import { DocumentGeneratorTab } from './compliance/components/DocumentGeneratorTab';
import { AuditLogTab } from './compliance/components/AuditLogTab';

// Constants and Icon Utilities
import { 
  ShieldCheckIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
  FolderIcon, InformationCircleIcon, MagnifyingGlassIcon, FunnelIcon,
  PrinterIcon, CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon, 
  CheckBadgeIcon, AdjustmentsHorizontalIcon, DocumentTextIcon, 
  Squares2X2Icon, GavelIcon, ArchiveBoxIcon, DocumentDuplicateIcon, 
  CheckCircleIcon, ListBulletIcon, UsersIcon, LockClosedIcon,
  WrenchScrewdriverIcon, XMarkIcon, ClipboardListCheckIcon, OFFICE_NAME
} from '../constants';

// Internal Select UI component wrapper
const CustomSelect = ({ label, value, onChange, options, style }: any) => (
  <div className="flex flex-col gap-1 w-full" style={style}>
    {label && <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-wide">{label}</label>}
    <select 
      value={value} 
      onChange={onChange} 
      className="w-full bg-white dark:bg-dm-card border border-gray-150 dark:border-gray-800 rounded-xl p-3 text-xs font-bold text-gray-800 dark:text-white focus:outline-hidden focus:border-blue-600 transition-colors"
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Internal Input UI wrapper
const CustomInput = ({ label, value, onChange, type = 'text', required = false, min, max }: any) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-wide">{label}</label>}
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      required={required}
      min={min}
      max={max}
      className="w-full bg-white dark:bg-dm-card border border-gray-150 dark:border-gray-800 rounded-xl p-3 text-xs font-bold text-gray-800 dark:text-white focus:outline-hidden focus:border-blue-600 transition-colors"
    />
  </div>
);

const CompliancePage: React.FC = () => {
  const { i18n } = useTranslation();
  const { addToast } = useToast();

  const isRtl = i18n.language === 'ar';
  const translate = (ar: string, en: string) => isRtl ? ar : en;

  // Role switching configuration for advanced perspective management
  const [activeRole, setActiveRole] = useState<'Compliance Officer' | 'General Manager' | 'Financial Director' | 'Legal Consultant'>('Compliance Officer');

  // Load / Store States with LocalStorage support
  const [policies, setPolicies] = useState<PolicyProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_policies');
    return saved ? JSON.parse(saved) : initialPolicies;
  });

  const [obligations, setObligations] = useState<ObligationProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_obligations');
    return saved ? JSON.parse(saved) : initialObligations;
  });

  const [risks, setRisks] = useState<RiskRegisterProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_risks');
    return saved ? JSON.parse(saved) : initialRisks;
  });

  const [violations, setViolations] = useState<ViolationProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_violations');
    return saved ? JSON.parse(saved) : initialViolations;
  });

  const [audits, setAudits] = useState<AuditProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_audits');
    return saved ? JSON.parse(saved) : initialAudits;
  });

  const [investigations, setInvestigations] = useState<InvestigationProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_investigations');
    return saved ? JSON.parse(saved) : initialInvestigations;
  });

  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveActionProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_corrective');
    return saved ? JSON.parse(saved) : initialCorrectiveActions;
  });

  const [followups, setFollowups] = useState<FollowupProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_followups');
    return saved ? JSON.parse(saved) : initialFollowups;
  });

  const [reports, setReports] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_reports');
    return saved ? JSON.parse(saved) : initialReports;
  });

  const [tasks, setTasks] = useState<TaskProfile[]>(() => {
    const saved = localStorage.getItem('adala_comp_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('adala_comp_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Navigation tab submodule selections
  const [activeSubmodule, setActiveSubmodule] = useState<ComplianceSubmodule>(ComplianceSubmodule.DASHBOARD);
  const [layoutMode, setLayoutMode] = useState<'table' | 'cards'>('cards');

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Form Editor Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Detail Modal Pane (Profile summary drawer)
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  // Printable Document Modal Trigger details
  const [printableItem, setPrintableItem] = useState<{ item: any; submodule: string } | null>(null);

  // Write changes back to localStorage
  useEffect(() => { localStorage.setItem('adala_comp_policies', JSON.stringify(policies)); }, [policies]);
  useEffect(() => { localStorage.setItem('adala_comp_obligations', JSON.stringify(obligations)); }, [obligations]);
  useEffect(() => { localStorage.setItem('adala_comp_risks', JSON.stringify(risks)); }, [risks]);
  useEffect(() => { localStorage.setItem('adala_comp_violations', JSON.stringify(violations)); }, [violations]);
  useEffect(() => { localStorage.setItem('adala_comp_audits', JSON.stringify(audits)); }, [audits]);
  useEffect(() => { localStorage.setItem('adala_comp_investigations', JSON.stringify(investigations)); }, [investigations]);
  useEffect(() => { localStorage.setItem('adala_comp_corrective', JSON.stringify(correctiveActions)); }, [correctiveActions]);
  useEffect(() => { localStorage.setItem('adala_comp_followups', JSON.stringify(followups)); }, [followups]);
  useEffect(() => { localStorage.setItem('adala_comp_reports', JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem('adala_comp_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('adala_comp_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setRiskFilter('');
    setStatusFilter('');
  };

  const triggerToast = (title: string, desc: string, type: 'success' | 'warning' | 'error') => {
    addToast({
      title,
      message: desc || '',
      type: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success'
    });
  };

  // Add a history item/audit log entry securely
  const registerLog = (actionName: string, detailsText: string, targetModule: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: translate('أ. صبري شطا', 'Sabri Shatta'),
      role: activeRole,
      action: actionName,
      details: detailsText,
      module: targetModule,
      ipAddress: '192.168.1.104' // Simulated secured workstation IP
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // List of active registers according to subtab filters
  const activeRecordsList = useMemo(() => {
    let list: any[] = [];
    if (activeSubmodule === ComplianceSubmodule.POLICIES) list = policies;
    else if (activeSubmodule === ComplianceSubmodule.OBLIGATIONS) list = obligations;
    else if (activeSubmodule === ComplianceSubmodule.RISKS) list = risks;
    else if (activeSubmodule === ComplianceSubmodule.VIOLATIONS) list = violations;
    else if (activeSubmodule === ComplianceSubmodule.AUDITS) list = audits;
    else if (activeSubmodule === ComplianceSubmodule.INVESTIGATIONS) list = investigations;
    else if (activeSubmodule === ComplianceSubmodule.CORRECTIVE_ACTIONS) list = correctiveActions;
    else if (activeSubmodule === ComplianceSubmodule.PERIODIC) list = followups;
    else if (activeSubmodule === ComplianceSubmodule.REPORTS) list = reports;
    else if (activeSubmodule === ComplianceSubmodule.TASKS) list = tasks;

    return list.filter(item => {
      // Archive toggles checks
      const isArchived = !!item.isArchived;
      if (showArchived !== isArchived) return false;

      // Filter attributes
      const matchSearch = (item.title || item.subject || item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter ? (item.category === categoryFilter) : true;
      const matchRisk = riskFilter ? (item.riskLevel === riskFilter) : true;
      const matchStatus = statusFilter ? (item.status === statusFilter || item.statusAr === statusFilter) : true;

      return matchSearch && matchCategory && matchRisk && matchStatus;
    });
  }, [
    activeSubmodule, policies, obligations, risks, violations, audits, 
    investigations, correctiveActions, followups, reports, tasks,
    searchTerm, categoryFilter, riskFilter, statusFilter, showArchived
  ]);

  // Submodule Tab Navigation Items
  const submodulesTabs = useMemo(() => [
    { key: ComplianceSubmodule.DASHBOARD, ar: 'لوحة التحكم والتحليل', en: 'Dashboard Insights', icon: <Squares2X2Icon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.POLICIES, ar: 'السياسات واللوائح', en: 'Policies & Codes', icon: <DocumentTextIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.OBLIGATIONS, ar: 'الالتزامات المؤسسية', en: 'Obligations Register', icon: <CheckBadgeIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.RISKS, ar: 'سجل وتقييم المخاطر', en: 'Risk & Scoring Matrix', icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.VIOLATIONS, ar: 'الغرامات والمخالفات', en: 'Violations & Claims', icon: <GavelIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.AUDITS, ar: 'التدقيق والتقييم الداخلي', en: 'Internal Audits', icon: <ClipboardListCheckIcon className="w-4 h-4 text-emerald-500" /> },
    { key: ComplianceSubmodule.INVESTIGATIONS, ar: 'التحقيقات الإدارية', en: 'Officer Investigations', icon: <UsersIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.CORRECTIVE_ACTIONS, ar: 'الإجراءات التصحيحية', en: 'Corrective (CAPA)', icon: <WrenchScrewdriverIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.TASKS, ar: 'المهام ومتابعة الامتثال', en: 'Compliance Tasks', icon: <ClockIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.DOCUMENTS, ar: 'منشئ الصكوك والعقود', en: 'Documents Builder', icon: <PlusCircleIcon className="w-4 h-4" /> },
    { key: ComplianceSubmodule.AUDIT_LOGS, ar: 'سجل رصد الأمان والعمليات', en: 'Access Security Logs', icon: <LockClosedIcon className="w-4 h-4 text-rose-500" /> }
  ], []);

  // CRUD Operations handlers
  const handleOpenCreateModal = () => {
    setEditingItemId(null);
    setFormData({
      id: `item-${Date.now()}`,
      title: '',
      category: '',
      riskLevel: 'Medium',
      dueDate: new Date().toISOString().substring(0, 10),
      status: 'Pending',
      statusAr: translate('قيد الانتظار', 'Pending'),
      description: '',
      history: []
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItemId(item.id);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleDuplicateItem = (item: any) => {
    const duplicated = {
      ...item,
      id: `item-${Date.now()}`,
      title: `${item.title || item.subject} (${translate('نسخة مكررة', 'Copy')})`,
      dueDate: new Date().toISOString().substring(0, 10),
      isArchived: false
    };

    updateRecordState(duplicated, 'create');
    registerLog(
      translate('تكرار مستند', 'Duplicate record'),
      translate(`تكرار السجل ${item.title || item.id} بنجاح كحالة جديدة.`, `Duplicated compliance record ${item.id} successfully.`),
      translate(activeSubmodule, activeSubmodule)
    );
    triggerToast(translate('تم تكرار السجل', 'Record Duplicated'), '', 'success');
  };

  const handleDeleteItem = (itemId: string) => {
    // Role protection rule
    if (activeRole !== 'General Manager' && activeRole !== 'Compliance Officer') {
      triggerToast(
        translate('صلاحيات غير كافية', 'Insufficient Privileges'),
        translate('يقتصر حذف السجلات المطابقة والمطالبات للـ المدير العام أو مسؤولي الامتثال فقط.', 'Only General Managers or Compliance Officers can delete ledger items.'),
        'error'
      );
      return;
    }

    updateRecordState({ id: itemId }, 'delete');
    registerLog(
      translate('حذف مستند مطابقة', 'Delete record'),
      translate(`حذف دائم للسجل رقم ${itemId} من قاعدة بيانات الحوكمة.`, `Hard deleted compliance item ${itemId} from governance index.`),
      translate(activeSubmodule, activeSubmodule)
    );
    triggerToast(translate('تم حذف السجل بنجاح', 'Deleted Successfully'), '', 'success');
  };

  const handleArchiveToggle = (item: any) => {
    const updated = { ...item, isArchived: !item.isArchived };
    updateRecordState(updated, 'edit');
    registerLog(
      updated.isArchived ? translate('أرشفة مستند', 'Archive record') : translate('استعادة مستند', 'Restore record'),
      translate(`تحديث مركز الأرشفة للمستند ${item.title || item.id}`, `Updated archiving state for ${item.id}`),
      translate(activeSubmodule, activeSubmodule)
    );
    triggerToast(
      updated.isArchived ? translate('تم نقل السجل للمحفوظات', 'Archived Successfully') : translate('تم استعادة السجل للقائمة', 'Restored Successfully'),
      '',
      'success'
    );
  };

  const updateRecordState = (record: any, mode: 'create' | 'edit' | 'delete') => {
    const update = (prev: any[]) => {
      if (mode === 'create') return [record, ...prev];
      if (mode === 'delete') return prev.filter(x => x.id !== record.id);
      return prev.map(x => x.id === record.id ? record : x);
    };

    if (activeSubmodule === ComplianceSubmodule.POLICIES) setPolicies(update);
    else if (activeSubmodule === ComplianceSubmodule.OBLIGATIONS) setObligations(update);
    else if (activeSubmodule === ComplianceSubmodule.RISKS) setRisks(update);
    else if (activeSubmodule === ComplianceSubmodule.VIOLATIONS) setViolations(update);
    else if (activeSubmodule === ComplianceSubmodule.AUDITS) setAudits(update);
    else if (activeSubmodule === ComplianceSubmodule.INVESTIGATIONS) setInvestigations(update);
    else if (activeSubmodule === ComplianceSubmodule.CORRECTIVE_ACTIONS) setCorrectiveActions(update);
    else if (activeSubmodule === ComplianceSubmodule.PERIODIC) setFollowups(update);
    else if (activeSubmodule === ComplianceSubmodule.REPORTS) setReports(update);
    else if (activeSubmodule === ComplianceSubmodule.TASKS) setTasks(update);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Setup standard status AR conversions
    let processedFormData = { ...formData };
    if (processedFormData.status === 'Completed' || processedFormData.status === 'Approved') {
      processedFormData.statusAr = translate('مكتمل ومغلق', 'Completed');
    } else if (processedFormData.status === 'In Progress') {
      processedFormData.statusAr = translate('قيد المعالجة قانونياً', 'In Progress');
    } else {
      processedFormData.statusAr = translate('معلق وبانتظار المراجعة', 'Pending');
    }

    if (editingItemId) {
      updateRecordState(processedFormData, 'edit');
      registerLog(
        translate('تعديل وخدمة مستند', 'Commit edits'),
        translate(`تم تعديل السجل المعتمد رقم ${editingItemId} بواسطة مسؤول العمل.`, `Committed edits to record ${editingItemId} successfully.`),
        translate(activeSubmodule, activeSubmodule)
      );
      triggerToast(translate('تم تحديث السجل', 'Record Updated'), '', 'success');
    } else {
      updateRecordState(processedFormData, 'create');
      registerLog(
        translate('إنشاء سجل مطابقة جديد', 'Create record'),
        translate(`إدراج مستند جديد بنجاح تحت مادة ${processedFormData.title || processedFormData.subject}`, `Created new compliance entry titled ${processedFormData.title || processedFormData.subject}`),
        translate(activeSubmodule, activeSubmodule)
      );
      triggerToast(translate('تم إنشاء السجل بنجاح', 'Created Successfully'), '', 'success');
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8" id="compliance-module-system-root">
      
      {/* 1. Header Banner of Redesigned Compliance Management */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-[32px] p-6 md:p-8 shadow-md relative overflow-hidden flex flex-wrap justify-between items-center gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
        <div className="space-y-2 z-10 w-full md:w-2/3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] bg-blue-950/60 text-blue-200 uppercase font-black px-2.5 py-1 rounded-md tracking-wider">{translate('نظام عدالة المتكامل للحوكمة والمطابقة', 'ADALA COMPLIANCE & GOVERNANCE LEDGER')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-50">{translate('إدارة الالتزامات والمطابقة الرقابية', 'Compliance & Obligations Management')}</h1>
          <p className="text-xs text-blue-200/80 leading-relaxed max-w-xl font-medium">
            {translate(
              'رصد وتنظيم المطابقة في دولة الكويت لجميع سياسات وقوانين هيئات أسواق المال والبنك المركزي والتأمينات والمستندات الرسمية الموقعة بقوة المحركات الذكية.',
              'Monitor, score and fulfill corporate compliance, internal policies, tax, government audit registers, and CMA regulations with unified administrative audit paths.'
            )}
          </p>
        </div>

        {/* Role switching controller at upper side */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl z-10 space-y-2.5 w-full md:w-[280px]">
          <label className="text-[10px] font-black tracking-wider text-blue-200 block uppercase">{translate('تبديل الصلاحية ومنظور الإدارة', 'Simulated Access Role Switch')}</label>
          <CustomSelect
            value={activeRole}
            onChange={(e: any) => {
              const prev = activeRole;
              setActiveRole(e.target.value);
              registerLog(
                translate('تغيير نظام الأدوار المطبق', 'Switch Workspace Perspective'),
                translate(`تغيير المنظور الإداري من [${prev}] إلى [${e.target.value}] لاستعراض الصلاحيات.`, `Switched visual role perspective to [${e.target.value}].`),
                'نظام الحوسبة والمستشعرات'
              );
              triggerToast(translate('تم تحويل الدور الإداري', 'Perspective Transformed'), translate(`أنت الآن تستعرض النظام بصلاحيات: ${e.target.value}`, `Active permissions updated for role ${e.target.value}`), 'success');
            }}
            options={[
              { value: 'Compliance Officer', label: translate('ضابط المطابقة والامتثال الرئيسي', 'Compliance Officer') },
              { value: 'General Manager', label: translate('المدير العام للمجموعة', 'General Manager') },
              { value: 'Financial Director', label: translate('المدير المالي والضرائب', 'Financial Director') },
              { value: 'Legal Consultant', label: translate('المستشار القانوني العام', 'General Counsel') }
            ]}
          />
        </div>
      </div>

      {/* 2. Scrollable Navigation Bar Tabs for modules */}
      <div className="overflow-x-auto select-none scroller-style flex gap-2 bg-gray-50 dark:bg-dm-card p-2 rounded-[24px] border border-gray-150/45 dark:border-gray-805">
        {submodulesTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSubmodule(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeSubmodule === tab.key 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-border'
            }`}
          >
            {tab.icon}
            <span>{translate(tab.ar, tab.en)}</span>
          </button>
        ))}
      </div>

      {/* 3. Conditional submodule render section */}
      <div className="space-y-6">
        
        {/* Render Dashboard Tab */}
        {activeSubmodule === ComplianceSubmodule.DASHBOARD && (
          <DashboardTab
            policies={policies}
            obligations={obligations}
            risks={risks}
            violations={violations}
            tasks={tasks}
            activeRole={activeRole}
            translate={translate}
            onNavigate={(moduleKey) => setActiveSubmodule(moduleKey as any)}
          />
        )}

        {/* Render Form Generator Tab */}
        {activeSubmodule === ComplianceSubmodule.DOCUMENTS && (
          <DocumentGeneratorTab
            translate={translate}
            onTriggerPrint={(printable) => setPrintableItem(printable)}
            triggerToast={triggerToast}
          />
        )}

        {/* Render Audit Secure Log ledger Tab */}
        {activeSubmodule === ComplianceSubmodule.AUDIT_LOGS && (
          <AuditLogTab
            auditLogs={auditLogs}
            translate={translate}
          />
        )}

        {/* Render CRUD Register Lists (Policies, Obligations, Audits, CAPA etc) */}
        {activeSubmodule !== ComplianceSubmodule.DASHBOARD && 
         activeSubmodule !== ComplianceSubmodule.DOCUMENTS && 
         activeSubmodule !== ComplianceSubmodule.AUDIT_LOGS && (
          
          <div className="space-y-6">
            
            {/* Header, Search bar and Create triggers and sliders */}
            <div className="bg-white dark:bg-dm-card p-5 rounded-[24px] border border-gray-150/45 dark:border-gray-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={translate('بحث مخصص بالسجلات والأوصاف...', 'Search records, codes or descriptions...')}
                    className="w-full bg-gray-50 dark:bg-dm-background border border-gray-100 dark:border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-800 dark:text-white focus:outline-hidden"
                  />
                </div>

                {/* Filters selection dropdowns */}
                <CustomSelect
                  value={riskFilter}
                  onChange={(e: any) => setRiskFilter(e.target.value)}
                  options={[
                    { value: '', label: translate('كافة مستويات التعرض', 'All Risk levels') },
                    { value: 'High', label: 'High' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'Low', label: 'Low' }
                  ]}
                  style={{ width: '150px' }}
                />

                <button 
                  onClick={() => setShowArchived(!showArchived)} 
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                    showArchived 
                      ? 'bg-amber-600 border-amber-600 text-white' 
                      : 'border-gray-150 dark:border-gray-800 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <ArchiveBoxIcon className="w-4 h-4" />
                  <span>{showArchived ? translate('المحفوظات المؤرشفة', 'Archived Index') : translate('تصفية المؤرشف', 'Show Archived')}</span>
                </button>

                {(searchTerm || riskFilter || categoryFilter) && (
                  <button onClick={handleClearFilters} className="text-xs font-black text-rose-600 hover:underline">{translate('إلغاء التصفية', 'Clear')}</button>
                )}
              </div>

              {/* Layout triggers and Form Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <div className="flex bg-gray-50 dark:bg-dm-background p-1 rounded-xl border border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => setLayoutMode('table')} 
                    className={`p-2 rounded-lg transition-all ${layoutMode === 'table' ? 'bg-white dark:bg-dm-card shadow-xs text-blue-600' : 'text-gray-400'}`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setLayoutMode('cards')} 
                    className={`p-2 rounded-lg transition-all ${layoutMode === 'cards' ? 'bg-white dark:bg-dm-card shadow-xs text-blue-600' : 'text-gray-400'}`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-black text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <PlusCircleIcon className="w-4.5 h-4.5" />
                  {translate('إضافة عنصر جديد بقاعدة البيانات', 'Create New Compliance Entry')}
                </button>
              </div>

            </div>

            {/* List and Cards Section rendering */}
            {activeRecordsList.length === 0 ? (
              <div className="bg-white dark:bg-dm-card rounded-3xl p-16 text-center border border-gray-150/45 dark:border-gray-800 space-y-3">
                <FolderIcon className="w-16 h-16 mx-auto text-gray-300 animate-pulse" />
                <h4 className="text-sm font-black text-gray-800 dark:text-gray-200">{translate('لا توجد سجلات مطابقة للشروط الكائنة', 'No Matching Compliance Records Found')}</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">{translate('مكتب عدالة للمطابقة حذر من تصفية المخرجات. يرجى تعديل معايير البحث أو إضافة سجل.', 'Try clearing filters, creating a new ledger record, or modifying active filter tags.')}</p>
              </div>
            ) : layoutMode === 'table' ? (
              
              /* Table Layout */
              <div className="bg-white dark:bg-dm-card rounded-[32px] border border-gray-150/45 dark:border-gray-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-dm-background border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-black tracking-wider text-[10px]">
                        <th className="p-4">{translate('السجل والمظروف المالي والقانوني', 'Ref Code & Subject')}</th>
                        <th className="p-4">{translate('التصنيف والجهة', 'Category & Board')}</th>
                        <th className="p-4">{translate('التعرض والخطورة', 'Exposure Risk')}</th>
                        <th className="p-4">{translate('المسؤول المندوب', 'Assigned Rep')}</th>
                        <th className="p-4">{translate('الاستحقاق والمهلة', 'Maturity / Due Date')}</th>
                        <th className="p-4 text-center">{translate('حالة التسوية', 'Compliance Status')}</th>
                        <th className="p-4 text-left">{translate('خيارات التحكم والسند', 'Administrative Options')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-850 font-semibold text-gray-700 dark:text-gray-300">
                      {activeRecordsList.map((record: any) => (
                        <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-border transition-all">
                          <td className="p-4">
                            <div className="space-y-1">
                              <p className="font-extrabold text-blue-700 dark:text-blue-400 font-mono text-[10px] uppercase">ADALA-{record.id.toUpperCase()}</p>
                              <p className="text-gray-900 dark:text-white font-black hover:underline cursor-pointer" onClick={() => setSelectedProfile({ data: record, submodule: activeSubmodule })}>
                                {record.title || record.subject}
                              </p>
                              {record.code && <span className="text-[9px] bg-gray-50 dark:bg-dm-background font-mono px-2 py-0.5 rounded-md border border-gray-100">{record.code}</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5">
                              <p className="text-[10px] text-gray-400">{record.category || translate('مطابقة شاملة', 'General Class')}</p>
                              <p className="font-black text-slate-800 dark:text-dark-card-title">{record.authority || translate('هيئة أسواق المال', 'CMA')}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              record.riskLevel === 'High' || record.riskLevel === 'Critical' ? 'bg-rose-100/70 text-rose-700 text-[9px]' :
                              record.riskLevel === 'Medium' ? 'bg-amber-100/70 text-amber-700 text-[9px]' :
                              'bg-emerald-100/70 text-emerald-700 text-[9px]'
                            }`}>
                              {record.riskLevel || 'Medium'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 font-bold">{record.assignedTo || record.owner || translate('صبري شطا', 'Sabri Shatta')}</td>
                          <td className="p-4 font-mono font-bold text-gray-400">{record.dueDate || record.effectiveDate || 'N/A'}</td>
                          <td className="p-4 text-center">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                              record.status === 'Completed' || record.status === 'Approved' ? 'bg-emerald-100/50 text-emerald-700' :
                              record.status === 'In Progress' ? 'bg-amber-100/50 text-amber-700' :
                              'bg-gray-100 text-gray-400'
                            }`}>
                              {translate(record.statusAr, record.status)}
                            </span>
                          </td>
                          <td className="p-4 h-full align-middle text-left">
                            <div className="flex items-center justify-end gap-2 text-gray-400">
                              <button onClick={() => setSelectedProfile({ data: record, submodule: activeSubmodule })} className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all" title={translate('تفصيل البيانات', 'Detail View')}><EyeIcon className="w-4 h-4" /></button>
                              <button onClick={() => setPrintableItem({ item: record, submodule: activeSubmodule })} className="p-1.5 hover:bg-gray-100 hover:text-emerald-600 rounded-lg transition-all text-emerald-600" title={translate('طباعة شهادة الاعتماد', 'Certified Print')}><PrinterIcon className="w-4 h-4" /></button>
                              <button onClick={() => handleOpenEditModal(record)} className="p-1.5 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-all" title={translate('تعديل السجل', 'Edit')}><PencilIcon className="w-4 h-4" /></button>
                              <button onClick={() => handleDuplicateItem(record)} className="p-1.5 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition-all" title={translate('تكرار الحساب', 'Duplicate')}><DocumentDuplicateIcon className="w-4 h-4" /></button>
                              <button onClick={() => handleArchiveToggle(record)} className="p-1.5 hover:bg-gray-100 hover:text-amber-600 rounded-lg transition-all text-amber-600" title={translate('نقل للمحفوطات', 'Archive')}><ArchiveBoxIcon className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteItem(record.id)} className="p-1.5 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-all text-red-500" title={translate('حذف دائم', 'Delete')}><TrashIcon className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            ) : (
              
              /* Grid Bento Layout */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {activeRecordsList.map((record: any) => (
                  <motion.div 
                    whileHover={{ scale: 1.015, y: -2 }}
                    key={record.id}
                    className="bg-white dark:bg-dm-card p-5 rounded-[28px] border border-gray-150/45 dark:border-gray-805 shadow-xs flex flex-col justify-between hover:border-gray-300 dark:hover:border-dark-border transition-all"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3 border-b border-gray-150/15 pb-2.5">
                        <span className="text-[10px] font-mono font-black text-blue-700 tracking-wider">ADALA-{record.id.toUpperCase()}</span>
                        <div className="flex gap-1.5">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                            record.riskLevel === 'High' || record.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>{record.riskLevel || 'Medium'}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${
                            record.status === 'Completed' || record.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>{translate(record.statusAr, record.status)}</span>
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-gray-900 dark:text-dm-text hover:underline cursor-pointer mb-2 leading-relaxed" onClick={() => setSelectedProfile({ data: record, submodule: activeSubmodule })}>
                        {record.title || record.subject}
                      </h4>
                      {record.category && <p className="text-[9px] text-gray-400 font-bold mb-3">{record.category}</p>}

                      <p className="text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 font-semibold line-clamp-3 mb-4">
                        {record.description || record.findings || record.notes || translate('سجل امتثال مبرم وخالي من المخالفات الرقابية الحالية.', 'Healthy compliance profile; no active violations reported.')}
                      </p>
                    </div>

                    <div className="border-t border-gray-150/15 pt-3 mt-2 flex justify-between items-center text-[10px] text-gray-400 font-medium">
                      <span>{translate('الاستحقاق:', 'Due:')} <strong className="font-mono text-gray-900 dark:text-white">{record.dueDate || record.effectiveDate || 'N/A'}</strong></span>
                      
                      {/* Grid Bottom Action Menu */}
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <button onClick={() => setSelectedProfile({ data: record, submodule: activeSubmodule })} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-blue-600 rounded-md transition-all"><EyeIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setPrintableItem({ item: record, submodule: activeSubmodule })} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-emerald-600 rounded-md transition-all text-emerald-600"><PrinterIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleOpenEditModal(record)} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-blue-600 rounded-md transition-all"><PencilIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDuplicateItem(record)} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-indigo-600 rounded-md transition-all"><DocumentDuplicateIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleArchiveToggle(record)} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-amber-600 rounded-md transition-all text-amber-600"><ArchiveBoxIcon className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteItem(record.id)} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-border hover:text-red-600 rounded-md transition-all text-red-500"><TrashIcon className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

            )}

          </div>

         )}

      </div>

      {/* 4. MODAL DRAWER PANELS: INTERACTIVE RECORD DETAIL EXPLORER */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex justify-end">
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="bg-white dark:bg-dm-card w-full max-w-xl p-8 shadow-2xl overflow-y-auto space-y-6 h-full flex flex-col justify-between border-l border-gray-150 dark:border-gray-805"
            >
              <div className="space-y-6">
                
                {/* Drawer Heading */}
                <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div>
                    <span className="text-[9px] font-mono font-black text-blue-700 uppercase tracking-widest">{translate('رمز الملف المعتمد بمركز الامتثال', 'ADALA VERIFIED LEDGER ID')}: {selectedProfile.data.id}</span>
                    <h3 className="text-lg font-black text-gray-900 dark:text-dm-text mt-1.5">{selectedProfile.data.title || selectedProfile.data.subject}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{selectedProfile.data.category || translate('مطابقة شاملة', 'General Category')}</p>
                  </div>
                  <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-all">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Info Pills Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-dm-background p-3.5 rounded-2xl border border-gray-100/30">
                    <p className="text-[9px] text-gray-400 font-black uppercase">{translate('درجة الأهمية والتعرض للشركة', 'exposure severity level')}</p>
                    <p className="font-extrabold text-xs text-red-700 mt-1">{selectedProfile.data.riskLevel || 'Medium'}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-dm-background p-3.5 rounded-2xl border border-gray-100/30">
                    <p className="text-[9px] text-gray-400 font-black uppercase">{translate('حالة السجل والتسوية', 'settlement status')}</p>
                    <p className="font-extrabold text-xs text-gray-700 dark:text-slate-200 mt-1">{translate(selectedProfile.data.statusAr, selectedProfile.data.status)}</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-dm-background p-3.5 rounded-2xl border border-gray-100/30 col-span-2">
                    <p className="text-[9px] text-gray-400 font-black uppercase">{translate('التنظيم الحكومي المتطلع / الجهة الصادرة', 'governing public council')}</p>
                    <p className="font-extrabold text-xs text-gray-800 dark:text-slate-100 mt-1">{selectedProfile.data.authority || translate('هيئة أسواق المال ومكافحة الجرائم المالية', 'Capital Markets Authority')}</p>
                  </div>
                </div>

                {/* Scope annotations */}
                <div className="space-y-2">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">{translate('شروحات ومضامين وقرارات معالجة الملف', 'Scoping Notes & Decisions details')}</span>
                  <div className="bg-gray-50/70 dark:bg-dm-background p-4 rounded-2xl border border-gray-100 dark:border-gray-850 text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-semibold whitespace-pre-line">
                    {selectedProfile.data.description || selectedProfile.data.findings || selectedProfile.data.notes || translate('لم تدون ملاحظات إضافية لهذا السجل.', 'No descriptive files compiled details for this conform.')}
                  </div>
                </div>

              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-6 border-t border-gray-150/45 dark:border-gray-800 flex gap-3">
                <button 
                  onClick={() => {
                    setPrintableItem({ item: selectedProfile.data, submodule: selectedProfile.submodule });
                    setSelectedProfile(null);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <PrinterIcon className="w-4 h-4" />
                  {translate('تصدير شهادة رسمية والطباعة', 'Generate Certificate & Print')}
                </button>
                <button onClick={() => setSelectedProfile(null)} className="w-1/3 bg-gray-50 border hover:bg-gray-100 dark:bg-dark-border py-3 rounded-2xl text-xs font-bold text-gray-500 dark:text-gray-300 transition-all">
                  {translate('إغلاق المظروف', 'Close')}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MODAL FORM BUILDER: ADD / EDIT ITEMS */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-dm-card rounded-[32px] w-full max-w-2xl p-8 shadow-2xl border border-gray-150 dark:border-gray-805 space-y-6"
            >
              
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                  <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-md">{translate('مكتب عدالة للمطابقة والحوكمة', 'Adala Integrity System')}</span>
                  <h3 className="text-lg font-black text-gray-900 dark:text-dm-text mt-1.5">{editingItemId ? translate('تحديث ومزامنة السجل الحالي', 'Update Existing Record') : translate('إدراج سجل حوكمي جديد بقاعدة البيانات', 'Insert New Governance Record')}</h3>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-all">
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                <CustomInput
                  label={translate('موضوع السجل وعنوان الملف المطالب بـه', 'Subject / Main Title')}
                  value={formData.title || formData.subject || ''}
                  onChange={(e: any) => setFormData({ ...formData, title: e.target.value, subject: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInput
                    label={translate('الجهة الرسمية المستحقة (وزارة التجارة، المركزي إلخ)', 'Official Issuing Authority')}
                    value={formData.authority || ''}
                    onChange={(e: any) => setFormData({ ...formData, authority: e.target.value })}
                    required
                  />

                  <CustomInput
                    label={translate('رمز المستند السري (Code)', 'Secure Regulatory Code')}
                    value={formData.code || ''}
                    onChange={(e: any) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomSelect
                    label={translate('درجة الأهمية والخطورة الافتراضية', 'Direct Risk / Severity level')}
                    value={formData.riskLevel || 'Medium'}
                    onChange={(e: any) => setFormData({ ...formData, riskLevel: e.target.value })}
                    options={[
                      { value: 'Critical', label: 'Critical' },
                      { value: 'High', label: 'High' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Low', label: 'Low' }
                    ]}
                  />

                  <CustomSelect
                    label={translate('حالة التسوية والامتثال الحاصلة', 'Default Compliance Status')}
                    value={formData.status || 'Pending'}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { value: 'Pending', label: translate('معلق وبانتظار المراجعة', 'Pending Review') },
                      { value: 'In Progress', label: translate('قيد المعالجة قانونياً', 'In Progress') },
                      { value: 'Completed', label: translate('مكتمل ومطابق كلياً', 'Completed / Approved') }
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomInput
                    type="date"
                    label={translate('تاريخ بدء العمل / المهلة المقررة للتقديم', 'Due / Effective Date')}
                    value={formData.dueDate || formData.effectiveDate || ''}
                    onChange={(e: any) => setFormData({ ...formData, dueDate: e.target.value, effectiveDate: e.target.value })}
                    required
                  />

                  <CustomInput
                    label={translate('مسؤول المتابعة بمجموع عدالة', 'Assigned Counsel Officer')}
                    value={formData.assignedTo || formData.owner || ''}
                    onChange={(e: any) => setFormData({ ...formData, assignedTo: e.target.value, owner: e.target.value })}
                  />
                </div>

                {activeSubmodule === ComplianceSubmodule.VIOLATIONS && (
                  <CustomInput
                    type="number"
                    label={translate('مبلغ العقوبات المترتبة والمحسوب بالكامل (د.ك)', 'Penalty Amount (KWD)')}
                    value={formData.penaltyAmount || ''}
                    onChange={(e: any) => setFormData({ ...formData, penaltyAmount: Number(e.target.value) })}
                  />
                )}

                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-wide">{translate('الشروح وخلاصة التوصيات القانونية', 'Scope details description narrative')}</label>
                  <textarea
                    rows={4}
                    value={formData.description || formData.findings || formData.notes || ''}
                    onChange={(e: any) => setFormData({ ...formData, description: e.target.value, findings: e.target.value, notes: e.target.value })}
                    className="w-full bg-white dark:bg-dm-card border border-gray-150 dark:border-gray-800 rounded-xl p-3 text-xs font-bold text-gray-800 dark:text-white focus:outline-hidden focus:border-blue-600 transition-colors"
                  />
                </div>

                {/* Submit buttons */}
                <div className="pt-6 border-t border-gray-150/45 dark:border-gray-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 bg-gray-50 border hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500">
                    {translate('إلغاء الأمر', 'Cancel')}
                  </button>
                  <button type="submit" className="px-8 py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-black text-xs rounded-xl shadow-xs">
                    {translate('حفظ والتثبيت بالدفتر', 'Save Record Changes')}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL PRINT PREVIEW CERTIFICATE HUB */}
      <OfficialCertificateModal
        isOpen={!!printableItem}
        onClose={() => setPrintableItem(null)}
        printableItem={printableItem}
        translate={translate}
        triggerToast={triggerToast}
      />

    </div>
  );
};

export default CompliancePage;
