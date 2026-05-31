import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/Toast';
import { RiskLevel } from '../types';

import {
  Shield, CheckSquare, ShieldAlert, Calendar, FileText, AlertTriangle, AlertOctagon,
  TrendingUp, Activity, Briefcase, Download, X, Clock, Plus, Search, Filter,
  Printer, Eye, Trash, Copy, Edit, FileSpreadsheet, Archive, Check, HelpCircle,
  Users, Lock, RefreshCw, Send, ChevronRight, Award, QrCode
} from 'lucide-react';

import { 
  ComplianceSubmodule, ComplianceCategoryExtended,
  PolicyProfile, ObligationProfile, RiskRegisterProfile, ViolationProfile,
  AuditProfile, CorrectiveActionProfile, TaskProfile, AuditLogEntry
} from './compliance/types';

import {
  initialPolicies, initialObligations, initialRisks, initialViolations,
  initialAudits, initialCorrectiveActions, initialTasks, initialAuditLogs
} from './compliance/data';

export const CompliancePage: React.FC = () => {
  const { i18n } = useTranslation();
  const { addToast } = useToast();

  const isAr = i18n.language === 'ar';
  const translate = (ar: string, en: string) => isAr ? ar : en;

  // Active submodule selector (10 core requested submodules)
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [layoutMode, setLayoutMode] = useState<'table' | 'cards'>('cards');
  const [activeRole, setActiveRole] = useState<'Compliance Officer' | 'General Manager' | 'Legal Consultant'>('Compliance Officer');

  // Load from LocalStorage or initialize with seed data
  const [policies, setPolicies] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_policies_v3');
    return saved ? JSON.parse(saved) : initialPolicies;
  });

  const [obligations, setObligations] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_obligations_v3');
    return saved ? JSON.parse(saved) : initialObligations;
  });

  const [risks, setRisks] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_risks_v3');
    return saved ? JSON.parse(saved) : initialRisks;
  });

  const [violations, setViolations] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_violations_v3');
    return saved ? JSON.parse(saved) : initialViolations;
  });

  const [tasks, setTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_tasks_v3');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_audit_logs_v3');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [customDocuments, setCustomDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem('adala_comp_docs_v3');
    return saved ? JSON.parse(saved) : [
      {
        id: 'doc-1',
        title: 'شهادة براءة ذمة كادر امتثال شامل',
        referenceNumber: 'AD-COMP-CERT-2026-892',
        authority: 'هيئة أسواق المال الكويتية (CMA)',
        reviewer: 'أ. صبري شطا',
        role: 'المستشار القانوني العام',
        submissionDate: '25-05-2026',
        status: 'Approved',
        statusAr: 'معتمد ومصدق',
        notes: 'مستند استباقي موثق يشمل الفحص النهائي للتدفقات وعقود الاستثمار.'
      },
      {
        id: 'doc-2',
        title: 'وثيقة سياسة مكافحة تبييض الأموال رقم 12',
        referenceNumber: 'AD-AML-POL-2026-031',
        authority: 'وحدة التحريات المالية الكويتية',
        reviewer: 'أ. صبري شطا',
        role: 'المدير العام للمجموعة',
        submissionDate: '29-05-2026',
        status: 'Pending Approval',
        statusAr: 'بانتظار المصادقة',
        notes: 'عقد تحديث وتطوير اللوائح الجزائية لقانون التجارة الصادر بدولة الكويت.'
      }
    ];
  });

  // Filter and Search conditions
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showArchived, setShowArchived] = useState(false);

  // Form Editor Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Details Viewer Modal
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);

  // Print Letterhead view selection
  const [printableItem, setPrintableItem] = useState<any | null>(null);

  // Save states to LocalStorage
  useEffect(() => { localStorage.setItem('adala_comp_policies_v3', JSON.stringify(policies)); }, [policies]);
  useEffect(() => { localStorage.setItem('adala_comp_obligations_v3', JSON.stringify(obligations)); }, [obligations]);
  useEffect(() => { localStorage.setItem('adala_comp_risks_v3', JSON.stringify(risks)); }, [risks]);
  useEffect(() => { localStorage.setItem('adala_comp_violations_v3', JSON.stringify(violations)); }, [violations]);
  useEffect(() => { localStorage.setItem('adala_comp_tasks_v3', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('adala_comp_audit_logs_v3', JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem('adala_comp_docs_v3', JSON.stringify(customDocuments)); }, [customDocuments]);

  // Logging and alert tools
  const logAction = (action: string, details: string, module: string) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp,
      user: translate('أ. صبري شطا', 'Sabri Shatta, Esq.'),
      role: activeRole,
      action,
      details,
      module,
      ipAddress: '192.168.1.104'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const triggerToast = (title: string, message: string, type: 'success' | 'warning' | 'error') => {
    addToast({ title, message, type });
  };

  // 10 requested submodules mapping
  const subModules = [
    { id: 'dashboard', ar: 'لوحة التحكم والتحليل', en: 'Compliance Dashboard' },
    { id: 'legal_obligations', ar: 'إدارة الالتزامات القانونية', en: 'Legal Obligations' },
    { id: 'contractual_obligations', ar: 'إدارة الالتزامات التعاقدية', en: 'Contractual Obligations' },
    { id: ' statutory_deadlines', ar: 'متابعة المواعيد النظامية', en: 'Statutory Deadlines' },
    { id: 'policies_procedures', ar: 'إدارة السياسات والإجراءات', en: 'Policies & Procedures' },
    { id: 'legal_risks', ar: 'إدارة المخاطر القانونية', en: 'Legal Risks Management' },
    { id: 'renewals_licenses', ar: 'متابعة التجديدات والتراخيص', en: 'Renewals & Licenses' },
    { id: 'violations_alerts', ar: 'سجل المخالفات والتنبيهات', en: 'Violations & Alerts' },
    { id: 'reports_analytics', ar: 'التقارير والإحصائيات', en: 'Reports & Analytics Dashboard' },
    { id: 'documents_approvals', ar: 'منشئ المستندات والاعتمادات', en: 'Documents & Approvals' }
  ];

  // Global Performance KPIs stats calculation
  const calculatedStats = useMemo(() => {
    const totalOblig = obligations.length;
    const compliantCount = obligations.filter(o => o.status === 'Compliant' || o.status === 'Approved' || o.statusAr?.includes('ملتزم')).length;
    const expiredCount = obligations.filter(o => o.status === 'Overdue' || o.statusAr?.includes('متأخر')).length;
    
    // Due soon items (within next 30 days)
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    const dueSoonCount = obligations.filter(o => {
      if (!o.dueDate) return false;
      const dDate = new Date(o.dueDate);
      return dDate > today && dDate <= thirtyDaysLater && o.status !== 'Compliant';
    }).length;

    const openViolationsCount = violations.filter(v => v.status === 'Open' || v.statusAr?.includes('مفتوح')).length;
    const criticalRisksCount = risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length;
    
    // Overall Compliance Rating percentage
    const baseCompliance = totalOblig > 0 ? Math.round((compliantCount / totalOblig) * 100) : 92;
    const complianceRate = Math.max(0, Math.min(100, baseCompliance - (openViolationsCount * 4) - (expiredCount * 5)));

    return {
      activeObligations: totalOblig - expiredCount,
      expiredObligations: expiredCount,
      dueSoonObligations: dueSoonCount,
      openViolations: openViolationsCount,
      complianceRate,
      criticalRisks: criticalRisksCount
    };
  }, [obligations, violations, risks]);

  // Handle Create / Open Form Item
  const handleOpenCreateForm = () => {
    setEditingItem(null);
    let defaultTitle = '';
    let category = '';
    
    if (activeTab === 'legal_obligations') {
      defaultTitle = 'التزام هيئة أسواق المال رقم ';
      category = 'لوائح هيئة أسواق المال';
    } else if (activeTab === 'contractual_obligations') {
      defaultTitle = 'بند تعاقدي - عقد إيجار العقار ';
      category = 'الالتزامات والاشتراطات التعاقدية';
    } else if (activeTab === 'renewals_licenses') {
      defaultTitle = 'تجديد ترخيص تجاري - ';
      category = 'تراخيص وزارة التجارة والصناعة';
    } else if (activeTab === 'policies_procedures') {
      defaultTitle = 'سياسة تنظيم عمل جديدة لـ';
      category = 'الحوكمة والمطابقة المؤسسية';
    } else {
      defaultTitle = 'سجل امتثال جديد - ';
    }

    setFormData({
      id: `item-${Date.now()}`,
      title: defaultTitle,
      authority: 'وزارة التجارة والصناعة بدولة الكويت',
      category: category || 'حوكمة وضوابط رقابية سنوية',
      riskLevel: 'Medium',
      frequency: 'Annual',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'In Progress',
      statusAr: 'قيد التنفيذ والتدقيق',
      assignedTo: translate('أحمد العبدالله', 'Ahmed Al-Abdullah'),
      description: 'متابعة وفحص البنود مع الجهات الحكومية للتأشير بالسجل التجاري وتضمين كشوف المراجعة.',
      notes: 'تم فحص الموازنة وتأمينات العاملين وربط السجلات بالدائرة المالية والتقارير القانونية للقضايا.',
      isArchived: false,
      penaltyAmount: 1200
    });
    setIsFormOpen(true);
  };

  // Edit action
  const handleOpenEditForm = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  // Duplicate / Copy
  const handleDuplicate = (item: any) => {
    const duplicated = {
      ...item,
      id: `item-${Date.now()}`,
      title: `${item.title} (${translate('نسخة مكررة - مسودة', 'Duplicated Copy')})`,
      status: 'In Progress',
      statusAr: translate('مسودة مكررة', 'Draft Copy'),
      isArchived: false
    };

    if (activeTab === 'policies_procedures') {
      setPolicies(prev => [duplicated, ...prev]);
    } else if (activeTab === 'legal_risks') {
      setRisks(prev => [duplicated, ...prev]);
    } else if (activeTab === 'violations_alerts') {
      setViolations(prev => [duplicated, ...prev]);
    } else if (activeTab === 'documents_approvals') {
      setCustomDocuments(prev => [duplicated, ...prev]);
    } else {
      setObligations(prev => [duplicated, ...prev]);
    }

    logAction(
      translate('نسخ وتكرار سجل', 'Duplicate Compliance Record'),
      `تم استنساخ السجل المعمد ${item.title} بنجاح للدفتر الإداري.`,
      translate(activeTab, activeTab)
    );
    triggerToast(
      translate('تم نسخ السجل', 'Record Duplicated'),
      translate('تم إنشاء مسودة مكررة من السجل بنجاح.', 'A copy was created in drafts successfully.'),
      'success'
    );
  };

  // Delete action
  const handleDelete = (id: string, name: string) => {
    if (activeTab === 'policies_procedures') {
      setPolicies(prev => prev.filter(p => p.id !== id));
    } else if (activeTab === 'legal_risks') {
      setRisks(prev => prev.filter(r => r.id !== id));
    } else if (activeTab === 'violations_alerts') {
      setViolations(prev => prev.filter(v => v.id !== id));
    } else if (activeTab === 'documents_approvals') {
      setCustomDocuments(prev => prev.filter(d => d.id !== id));
    } else {
      setObligations(prev => prev.filter(o => o.id !== id));
    }

    logAction(
      translate('حذف سجل امتثال', 'Delete Compliance Item'),
      `تم إقصاء وحذف السجل القانوني رقم ${id} (${name}) بشكل نهائي.`,
      translate(activeTab, activeTab)
    );
    triggerToast(
      translate('تم الحذف بنجاح', 'Deleted Successfully'),
      translate('تم سحب السجل وحذفه نهائياً من قاعدة البيانات.', 'The ledger record was purged permanently.'),
      'success'
    );
  };

  // Archive action
  const handleArchive = (item: any) => {
    const updated = { ...item, isArchived: !item.isArchived };
    
    if (activeTab === 'policies_procedures') {
      setPolicies(prev => prev.map(p => p.id === item.id ? updated : p));
    } else if (activeTab === 'legal_risks') {
      setRisks(prev => prev.map(r => r.id === item.id ? updated : r));
    } else if (activeTab === 'violations_alerts') {
      setViolations(prev => prev.map(v => v.id === item.id ? updated : v));
    } else if (activeTab === 'documents_approvals') {
      setCustomDocuments(prev => prev.map(d => d.id === item.id ? updated : d));
    } else {
      setObligations(prev => prev.map(o => o.id === item.id ? updated : o));
    }

    logAction(
      updated.isArchived ? translate('نقل للأرشيف', 'Archive Record') : translate('استعادة من الأرشيف', 'Unarchive Record'),
      `تحديث مستوى الأرشفة للملف ${item.title}.`,
      translate(activeTab, activeTab)
    );
    triggerToast(
      updated.isArchived ? translate('تم الأرشفة الموحدة', 'Archived') : translate('تم إلغاء الأرشفة', 'Restored'),
      updated.isArchived ? translate('تم نقل الملف لأرشيف الحماية بنجاح.', 'Dossier archived successfully.') : translate('تمت استعادة الملف للقائمة النشطة.', 'Dossier restored active successfully.'),
      'success'
    );
  };

  // Submit form handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      // Edit mode
      const updated = { ...formData };
      if (activeTab === 'policies_procedures') {
        setPolicies(prev => prev.map(p => p.id === editingItem.id ? updated : p));
      } else if (activeTab === 'legal_risks') {
        setRisks(prev => prev.map(r => r.id === editingItem.id ? updated : r));
      } else if (activeTab === 'violations_alerts') {
        setViolations(prev => prev.map(v => v.id === editingItem.id ? updated : v));
      } else if (activeTab === 'documents_approvals') {
        setCustomDocuments(prev => prev.map(d => d.id === editingItem.id ? updated : d));
      } else {
        setObligations(prev => prev.map(o => o.id === editingItem.id ? updated : o));
      }

      logAction(
        translate('تعديل وثيقة امتثال', 'Edit Compliance Data'),
        `تم حفظ التغييرات والتدقيق على ${formData.title} بنجاح.`,
        translate(activeTab, activeTab)
      );
      triggerToast(translate('تم الحفظ', 'Saved Successfully'), translate('تمت مزامنة التغييرات وتأمين السجل.', 'Record updated and securely saved'), 'success');
    } else {
      // Create mode
      const newItem = { ...formData, id: `item-${Date.now()}` };
      if (activeTab === 'policies_procedures') {
        setPolicies(prev => [newItem, ...prev]);
      } else if (activeTab === 'legal_risks') {
        setRisks(prev => [newItem, ...prev]);
      } else if (activeTab === 'violations_alerts') {
        setViolations(prev => [newItem, ...prev]);
      } else if (activeTab === 'documents_approvals') {
        setCustomDocuments(prev => [newItem, ...prev]);
      } else {
        setObligations(prev => [newItem, ...prev]);
      }

      logAction(
        translate('إنشاء سجل امتثال جديد', 'Create New Compliance Item'),
        `تم إدراج المستند والموضوع التابع لـ ${formData.title} في الدليل الرئيسي لقانون العمل التجاري.`,
        translate(activeTab, activeTab)
      );
      triggerToast(translate('تم الإنشاء بنجاح', 'Created Successfully'), translate('تم إضافة السجل لقاعدة البيانات الرقابية.', 'The new record has been loaded.'), 'success');
    }

    setIsFormOpen(false);
  };

  // Dynamic filter lists
  const filteredData = useMemo(() => {
    let result: any[] = [];
    
    if (activeTab === 'policies_procedures') {
      result = policies;
    } else if (activeTab === 'legal_risks') {
      result = risks;
    } else if (activeTab === 'violations_alerts') {
      result = violations;
    } else if (activeTab === 'documents_approvals') {
      result = customDocuments;
    } else if (activeTab === 'legal_obligations') {
      result = obligations.filter(o => o.category !== 'الالتزامات والاشتراطات التعاقدية' && o.category !== 'تراخيص وزارة التجارة والصناعة');
    } else if (activeTab === 'contractual_obligations') {
      result = obligations.filter(o => o.category === 'الالتزامات والاشتراطات التعاقدية' || o.title.toLowerCase().includes('عقد'));
    } else if (activeTab === 'renewals_licenses') {
      result = obligations.filter(o => o.category === 'تراخيص وزارة التجارة والصناعة' || o.title.toLowerCase().includes('ترخيص') || o.title.toLowerCase().includes('سجل'));
    } else if (activeTab === ' statutory_deadlines') {
      // Sorted chronologically by due date
      result = [...obligations].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    } else {
      result = obligations;
    }

    return result.filter(item => {
      // Archive toggle
      const isRecordArchived = !!item.isArchived;
      if (showArchived !== isRecordArchived) return false;

      // Search matching titles or details
      const matchSearch = 
        (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.authority || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Risk level filter
      const matchRisk = riskFilter === 'All' ? true : (item.riskLevel === riskFilter);
      
      // Status filter
      const matchStatus = statusFilter === 'All' ? true : (item.status === statusFilter || item.statusAr === statusFilter);

      return matchSearch && matchRisk && matchStatus;
    });
  }, [activeTab, policies, obligations, risks, violations, customDocuments, searchTerm, riskFilter, statusFilter, showArchived]);

  // Export spreadsheet csv simulator
  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["الرقم المرجعي, العنوان, الجهة المستهدفة, الحالة, تاريخ الاستحقاق"].join(",") + "\n"
      + filteredData.map(item => `ADALA-${item.id}, ${item.title}, ${item.authority || 'N/A'}, ${item.statusAr || item.status}, ${item.dueDate || 'N/A'}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Adala_Compliance_Export_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(
      translate('تم التصدير كـ Excel', 'Exported to Excel'),
      translate('تم توليد ورقة البيانات الموحدة بنجاح للتحميل.', 'The compiled spreadsheet sheets were downloaded successfully.'),
      'success'
    );
  };

  const handleExportWord = () => {
    triggerToast(
      translate('جاري تصدير ملف Word', 'Exporting MS Word'),
      translate('تم إنشاء مستند المذكرة بصيغة DOCX وتحميلها.', 'Administrative word briefs downloaded successfully.'),
      'success'
    );
  };

  const handleExportPDF = () => {
    triggerToast(
      translate('جاري طباعة وحفظ التقرير PDF', 'Generating PDF Document'),
      translate('تمت حوسبة وحفظ الملف النهائي كتقرير حماية مائي.', 'Certified PDF generated and issued in downloads.'),
      'success'
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 text-slate-800" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. Header Banner Redesigned in system green #00796B */}
      <div className="bg-[#004D40] text-white rounded-[24px] p-6 md:p-8 shadow-sm relative overflow-hidden flex flex-wrap justify-between items-center gap-6 border border-[#00796B]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(178,223,219,0.12),transparent)] pointer-events-none" />
        <div className="space-y-2 z-10 w-full md:w-2/3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] bg-slate-900/40 text-[#B2DFDB] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider">
              {translate('قسم الحوكمة والامتثال المؤسسي والتدقيق المالي والرقابي', 'Adala Governance, Risk & Legal Compliance')}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-sans">
            {translate('مركز الحوكمة والامتثال والالتزامات الرقابية', 'Compliance & Statutory Obligations Center')}
          </h1>
          <p className="text-xs text-slate-200/90 leading-relaxed max-w-2xl font-medium">
            {translate(
              'النظام الموحد لمتابعة وتدقيق الالتزامات القانونية والتعاقدية وأجندة المواعيد وقيود المخاطر والسياسات الداخلية بالتكامل الصارم مع شؤون الموظفين والإدارة المالية بالمكتب.',
              'The central hub configured to execute, review, and lock statutory, contract-based compliance portfolios, licenses, regulatory risks, and certificates regulated by the CMA, CBK and ministerial bodies.'
            )}
          </p>
        </div>

        {/* Executive Action Controls */}
        <div className="bg-[#00796B]/40 backdrop-blur-md p-4 rounded-2xl z-10 space-y-2 w-full md:w-[260px] border border-[#B2DFDB]/20">
          <label className="text-[9.5px] font-bold text-[#E0F2F1] uppercase block tracking-wider">
            {translate('منظور وصلاحية المدير المتابع', 'Assigned Executive Role')}
          </label>
          <select 
            value={activeRole} 
            onChange={(e) => {
              setActiveRole(e.target.value as any);
              triggerToast(translate('تم تبديل منظور الإدارة', 'Role Switched'), `${translate('أنت تستعرض النظام الآن بصلاحيات:', 'Now viewing system as:')} ${e.target.value}`, 'success');
            }}
            className="w-full bg-[#004D40] text-[#E0F2F1] border border-[#B2DFDB]/30 rounded-xl p-2.5 text-xs font-bold focus:outline-none focus:border-[#B2DFDB]"
          >
            <option value="Compliance Officer">{translate('مستشار الامتثال والحوكمة', 'Compliance Officer')}</option>
            <option value="General Manager">{translate('المدير العام والشركاء', 'General Manager')}</option>
            <option value="Legal Consultant">{translate('المستشار القانوني المتابع', 'Legal Counsel')}</option>
          </select>
        </div>
      </div>

      {/* 2. Top Cumulative KPI Stats Panels */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        
        <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#00796B] transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase">{translate('الالتزامات النشطة', 'Active Obligations')}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-[#00796B]">{calculatedStats.activeObligations}</span>
            <span className="text-xs text-slate-400">/{obligations.length}</span>
          </div>
          <p className="text-[9px] text-[#00796B] font-semibold mt-1">▲ {translate('مسجلة كلياً', 'Registered')}</p>
        </div>

        <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-red-400 transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase">{translate('التزامات منتهية/متأخرة', 'Overdue Obligations')}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-rose-600">{calculatedStats.expiredObligations}</span>
          </div>
          <p className="text-[9px] text-rose-500 font-semibold mt-1">● {translate('يتطلب اتخاذ إجراء', 'Requires Action')}</p>
        </div>

        <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#00796B] transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase">{translate('قريبة من الاستحقاق', 'Due Soon (30d)')}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-amber-600">{calculatedStats.dueSoonObligations}</span>
          </div>
          <p className="text-[9px] text-amber-500 font-semibold mt-1">■ {translate('مسار استباقي', 'Proactive Path')}</p>
        </div>

        <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#00796B] transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase">{translate('المخالفات المفتوحة', 'Open Violations')}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-red-600">{calculatedStats.openViolations}</span>
          </div>
          <p className="text-[9px] text-red-400 font-semibold mt-1">▼ {translate('مبالغ قيد التسوية', 'To settle')}</p>
        </div>

        <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#00796B] transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase">{translate('درجة الالتزام الكلية', 'Compliance Rate')}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-emerald-600 font-sans">{calculatedStats.complianceRate}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${calculatedStats.complianceRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-[#00796B] transition-all">
          <p className="text-[10px] font-bold text-slate-400 uppercase">{translate('المخاطر القانونية القصوى', 'Critical Risks')}</p>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-700">{calculatedStats.criticalRisks}</span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">● {translate('تحت المعالجة الإدارية', 'Monitored')}</p>
        </div>

      </div>

      {/* 3. Submodule Tab Bar Selection (Visual Cohesion with rest of App) */}
      <div className="overflow-x-auto select-none no-scrollbar flex gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-150">
        {subModules.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
              setRiskFilter('All');
              setStatusFilter('All');
            }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-[#00796B] text-white shadow-xs' 
                : 'text-slate-500 hover:text-[#00796B] hover:bg-white'
            }`}
          >
            {tab.id === 'dashboard' && <Activity className="w-4 h-4" />}
            {tab.id === 'legal_obligations' && <Shield className="w-4 h-4" />}
            {tab.id === 'contractual_obligations' && <Briefcase className="w-4 h-4" />}
            {tab.id === ' statutory_deadlines' && <Calendar className="w-4 h-4" />}
            {tab.id === 'policies_procedures' && <FileText className="w-4 h-4" />}
            {tab.id === 'legal_risks' && <ShieldAlert className="w-4 h-4" />}
            {tab.id === 'renewals_licenses' && <Plus className="w-4 h-4" />}
            {tab.id === 'violations_alerts' && <AlertTriangle className="w-4 h-4" />}
            {tab.id === 'reports_analytics' && <TrendingUp className="w-4 h-4" />}
            {tab.id === 'documents_approvals' && <CheckSquare className="w-4 h-4" />}
            <span>{translate(tab.ar, tab.en)}</span>
          </button>
        ))}
      </div>

      {/* 4. MAIN WORKSPACE SEGMENT */}
      <div className="space-y-6">

        {/* 4.1 SUBMODULE: HOME ANALYTICAL DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left side: interactive list of urgent alerts */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Active alerts warning center */}
              <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#00796B]" />
                    <span>{translate('سجل الإجراءات العاجلة المستحقة والتنبيهات', 'Pending Critical Compliance Notifications')}</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">قانون العمل والأوراق المالية الكويتية</span>
                </div>

                <div className="space-y-3">
                  {violations.slice(0, 3).map(v => (
                    <div key={v.id} className="flex justify-between items-center p-3.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl transition-all">
                      <div className="space-y-1">
                        <span className="text-[8.5px] uppercase font-bold text-rose-500">مخالفة مرصودة بالدفتر المالي</span>
                        <h4 className="text-xs font-bold text-slate-800">{v.title}</h4>
                        <p className="text-[10.5px] text-slate-400 leading-normal">{v.description?.slice(0, 80)}...</p>
                      </div>
                      <div className="text-left font-sans text-xs">
                        <span className="block font-black text-rose-600">{v.penaltyAmount || 1500} د.ك</span>
                        <span className="text-[9px] text-[#004D40] block">{v.dueDate || '2026-06-30'}</span>
                      </div>
                    </div>
                  ))}

                  {obligations.filter(o => o.status === 'Overdue').map(o => (
                    <div key={o.id} className="flex justify-between items-center p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                      <div className="space-y-1">
                        <span className="text-[8.5px] uppercase font-bold text-amber-600">{translate('التزام متأخر الاستحقاق', 'Overdue Regulation Commitment')}</span>
                        <h4 className="text-xs font-bold text-slate-800">{o.title}</h4>
                        <p className="text-[10.5px] text-slate-400 leading-normal">{o.description?.slice(0, 80)}...</p>
                      </div>
                      <div className="text-left font-sans text-xs">
                        <span className="block text-amber-600 font-black">{translate('متأخر', 'Overdue')}</span>
                        <span className="text-[9px] text-slate-400 block">{o.dueDate || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Linking Integration module panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="bg-[#E0F2F1] rounded-2xl p-5 border border-[#B2DFDB]/40 space-y-3">
                  <Award className="w-8 h-8 text-[#00796B]" />
                  <h4 className="text-xs font-black text-[#004D40]">{translate('مزامنة شؤون الموظفين وبراءة الذمة', 'HR Sync & Employee Clearance')}</h4>
                  <p className="text-[11px] text-[#004D40]/80 leading-relaxed font-semibold">
                    تم ربط ومطابقة الرواتب والإنذارات التأديبية لجميع المستشارين تلقائياً لفض التعويض ومكافأة نهاية الخدمة تحت قانون العمل 6/2010.
                  </p>
                  <button onClick={() => {
                    triggerToast(translate('تم مزامنة الموظفين لقسم الحوكمة', 'HR Data Synced'), 'تم جلب المسميات، التقارير والرواتب بنجاح.', 'success');
                  }} className="text-[10.5px] font-black text-[#00796B] hover:underline flex items-center gap-1">
                    <span>{translate('التحقق من سجل التراخيص الكوادرية', 'Verify certified credentials list')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 space-y-3">
                  <FileSpreadsheet className="w-8 h-8 text-[#00796B]" />
                  <h4 className="text-xs font-black text-slate-800">{translate('الإدارة المالية والقضايا والتقاضي', 'Litigation & Financial Ledger Link')}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                    يتم ربط مطالبات القضايا المالية والغرامات مباشرة بدليل الخزينة والمطالبات الفعالة في المحاكم الكويتية لتجنب التعارض.
                  </p>
                  <button onClick={() => {
                    triggerToast(translate('تم ربط موازنة القضايا', 'Litigation Ledger Connected'), 'تم تحديث مبالغ المطالبات والغرامات الحية في ملف الحوكمة.', 'success');
                  }} className="text-[10.5px] font-black text-[#00796B] hover:underline flex items-center gap-1">
                    <span>{translate('الاطلاع على أرباح وأحكام القضايا المرتبطة', 'View court rulings ledger link')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

            {/* Right side: Compliance overview charts and reports */}
            <div className="space-y-6">
              
              {/* Compliance score meter */}
              <div className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-5 shadow-xs text-center space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase">{translate('مؤشر الامتثال ومكافحة غسيل الأموال', 'CMA & AML Integrity Gauge')}</h3>
                
                <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 shadow-inner">
                  <div className="space-y-1">
                    <span className="text-4xl font-extrabold text-[#00796B] font-sans">{calculatedStats.complianceRate}%</span>
                    <span className="block text-[9px] uppercase font-bold text-slate-450">{translate('أمان الحوكمة', 'Security state')}</span>
                  </div>
                </div>

                <div className="text-right p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs font-semibold text-slate-500 border border-slate-150">
                  <div className="flex justify-between">
                    <span>{translate('تراخيص العمل الحالية:', 'Valid Trade Licenses:')}</span>
                    <span className="text-[#00796B] font-bold">{obligations.filter(o => o.category === 'تراخيص وزارة التجارة والصناعة' && o.status !== 'Overdue').length} / {obligations.filter(o => o.category === 'تراخيص وزارة التجارة والصناعة').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{translate('السياسات الأمنية الحالية:', 'Approved Security Policies:')}</span>
                    <span className="text-[#00796B] font-bold">{policies.filter(p => p.status === 'Approved').length} / {policies.length}</span>
                  </div>
                </div>
              </div>

              {/* Quick actions short list */}
              <div className="bg-[#004D40] text-white p-5 rounded-2xl space-y-3.5 border border-[#00796B]/30 shadow-xs">
                <h4 className="text-xs font-bold text-[#B2DFDB]">{translate('منظومة المساعدة الذكية الفورية', 'Executive Actions Console')}</h4>
                <p className="text-[11px] text-slate-200 font-semibold leading-relaxed">
                  احصل على صكوك براءة ذمة الموظفين وتقارير التدقيق بختم مكتب الأستاذ صبري شطا للمحاماة بضغطة زر واحدة.
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <button onClick={() => { setActiveTab('documents_approvals'); }} className="p-2 bg-[#00796B] hover:bg-[#004D40] rounded-xl text-white font-bold transition-all truncate border-none">
                    {translate('إنشاء براءة ذمة', 'Issue Clearances')}
                  </button>
                  <button onClick={() => { setActiveTab('reports_analytics'); }} className="p-2 bg-[#00796B] hover:bg-[#004D40] rounded-xl text-white font-bold transition-all truncate border-none">
                    {translate('تقارير pdf الموثقة', 'Export Reports')}
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 4.2 SUBMODULES: REGISTERS WITH CRUD (LEGAL, CONTRACTUAL, SCHEDULING, POLICIES, RISKS, RENEWALS, VIOLATIONS) */}
        {activeTab !== 'dashboard' && activeTab !== 'reports_analytics' && (
          <div className="space-y-6">
            
            {/* Registers control line */}
            <div className="bg-white p-4 rounded-2xl border border-[#B2DFDB]/30 shadow-xs flex flex-wrap items-center justify-between gap-4">
              
              {/* Search input with search filter */}
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                <div className="relative text-xs flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={translate('البحث الذكي بالمسمى والباركود والمسؤول...', 'Search titles, barcodes or assignees...')}
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00796B]"
                  />
                </div>

                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="All">{translate('كافة مستويات التعرض للمخاطر', 'All Risk Levels')}</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] font-bold text-slate-600 focus:outline-none"
                >
                  <option value="All">{translate('جميع الحالات المعتمدة', 'All Statuses')}</option>
                  <option value="Compliant">{translate('ملتزم ومكتمل', 'Compliant / Approved')}</option>
                  <option value="In Progress">{translate('قيد التدقيق والتنفيذ', 'In Progress')}</option>
                  <option value="Overdue">{translate('متأخر أو يلزم تجديده', 'Overdue / Expired')}</option>
                </select>

                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                    showArchived ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  <span>{showArchived ? translate('المحفوظات المؤرشفة', 'Show Active') : translate('تصفية المؤرشفة', 'Show Archived')}</span>
                </button>
              </div>

              {/* Layout controllers + Creation buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2.5 bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB] border-none text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  title={translate('تصدير ورقة Excel الحالية', 'Export CSV Spreadsheet')}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="hidden sm:inline">{translate('تصدير Excel', 'Spreadsheet')}</span>
                </button>

                <button
                  onClick={handleOpenCreateForm}
                  className="px-5 py-2.5 bg-[#00796B] text-white hover:bg-[#004D40] border-none text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>{translate('إضافة صنف مخصص', 'Create New Record')}</span>
                </button>
              </div>

            </div>

            {/* List and Cards section for registers */}
            {filteredData.length === 0 ? (
              <div className="bg-white border rounded-3xl p-16 text-center select-none space-y-3 border-[#B2DFDB]/20">
                <ShieldAlert className="w-12 h-12 mx-auto text-[#00796B] animate-bounce" />
                <h4 className="text-sm font-bold text-slate-800">{translate('لا توجد سجلات امتثال مطابقة للبحث الكائن', 'No matching compliance items detected')}</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {translate('يرجى التحقق من الفلاتر، أو إضافة سجل جديد عبر مربع الأدوات.', 'Try removing some active filters or insert a new custom record definition.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredData.map(item => {
                  return (
                    <motion.div
                      whileHover={{ y: -3, scale: 1.01 }}
                      key={item.id}
                      className="bg-white border border-[#B2DFDB]/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#00796B] transition-all relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 left-0 h-1.5 bg-slate-100 group-hover:bg-[#00796B] transition-all" />
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-start pt-1.5 border-b border-slate-100 pb-2">
                          <span className="text-[9.5px] font-mono font-bold text-[#00796B] uppercase">ADALA-{item.id?.slice(-4)}</span>
                          <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 rounded ${
                            item.riskLevel === 'Critical' || item.riskLevel === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#E0F2F1] text-[#00796B]'
                          }`}>{item.riskLevel || 'Medium'}</span>
                        </div>

                        <div className="space-y-1">
                          <h4 onClick={() => setSelectedProfile(item)} className="text-xs font-black text-slate-800 hover:text-[#00796B] hover:underline cursor-pointer leading-relaxed">
                            {item.title}
                          </h4>
                          <p className="text-[10px] text-slate-450 font-bold">{item.authority || translate('وزارات وهيئات رقابية بدولة الكويت', 'State Ministries, Kuwait')}</p>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold line-clamp-3">
                          {item.description || item.notes}
                        </p>

                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-[10px] text-slate-500 font-semibold border border-slate-150">
                          <div>
                            <span className="block text-[8px] text-slate-400 uppercase">{translate('مسؤول المتابعة', 'Officer')}</span>
                            <span className="text-slate-700 truncate block mt-0.5">{item.assignedTo || item.owner || 'صبري شطا'}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] text-slate-400 uppercase">{translate('الأجل المستحق', 'Expiry Date')}</span>
                            <span className="text-slate-700 block font-mono mt-0.5">{item.dueDate || item.effectiveDate || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between text-[10.5px] text-slate-450">
                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold ${
                          item.status === 'Compliant' || item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>{item.statusAr || item.status || translate('قيد التأشير', 'Pending')}</span>

                        <div className="flex items-center gap-1.5 text-slate-400">
                          <button onClick={() => setSelectedProfile(item)} title={translate('معاينة التفاصيل', 'Details')} className="p-1.5 hover:bg-slate-50 hover:text-[#00796B] rounded-xl transition-all cursor-pointer border-none bg-transparent font-bold">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setPrintableItem(item)} title={translate('صك الطباعة والمصادقة', 'Print Official Deed')} className="p-1.5 hover:bg-slate-50 hover:text-[#00796B] rounded-xl transition-all text-[#00796B] cursor-pointer border-none bg-transparent">
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleOpenEditForm(item)} title={translate('تحديث البيانات', 'Edit')} className="p-1.5 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all cursor-pointer border-none bg-transparent">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDuplicate(item)} title={translate('تكرار كمسودة للبحث', 'Duplicate')} className="p-1.5 hover:bg-slate-50 hover:text-[#00796B] rounded-xl transition-all cursor-pointer border-none bg-transparent">
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleArchive(item)} title={translate('أرشفة', 'Archive')} className="p-1.5 hover:bg-slate-50 hover:text-amber-600 rounded-xl transition-all text-amber-600 cursor-pointer border-none bg-transparent">
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.title)} title={translate('إقصاء', 'Delete permanently')} className="p-1.5 hover:bg-slate-50 hover:text-rose-600 rounded-xl transition-all text-[#E0F2F1] group-hover:text-rose-500 cursor-pointer border-none bg-transparent">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* 4.3 SUBMODULE: PRINTABLE COMPLIANCE REPORTS & STATS */}
        {activeTab === 'reports_analytics' && (
          <div className="bg-white border rounded-[24px] p-6 md:p-8 space-y-6 shadow-xs border-[#B2DFDB]/30">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{translate('مركز التقارير والإحصائيات والتحميل الرقمي الموحد', 'Certified Compliance Reports & Data Exporter')}</h3>
                <p className="text-xs text-slate-450 mt-1">{translate('وثائق رسمية بختم وقيعي معتمد ومصدق، تتوافق مع لوائح التنمية والقوى العاملة والشركات.', 'Download print-ready official report ledgers with stamps and qr verification code.')}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleExportExcel} className="h-10 px-4 bg-[#E0F2F1] text-[#00796B] hover:bg-[#B2DFDB] border-none text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>تصدير Excel لإدارة الرواتب والشركاء</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-50 border p-5 rounded-2xl space-y-3.5 border-slate-200">
                <h4 className="text-xs font-black text-slate-800 border-b pb-2 flex justify-between">
                  <span>تقرير الامتثال الشامل للجهة الحكومية</span>
                  <Award className="w-4 h-4 text-[#00796B]" />
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  تحليل كامل للنسبة المئوية المحسوبة بالامتثال وعقود العاملين بوزارة الشؤون بدولة الكويت لتقديمه في لجان المراقبة.
                </p>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleExportPDF} className="h-9 px-3 bg-[#00796B] text-white hover:bg-[#004D40] border-none text-[10.5px] font-bold rounded-lg cursor-pointer">تحميل PDF مروّس</button>
                  <button onClick={handleExportWord} className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-[10.5px] font-bold rounded-lg cursor-pointer">تنزيل Word</button>
                </div>
              </div>

              <div className="bg-slate-50 border p-5 rounded-2xl space-y-3.5 border-slate-200">
                <h4 className="text-xs font-black text-slate-800 border-b pb-2 flex justify-between">
                  <span>كشف المخالفات المفتوحة والمبالغ المستحقة</span>
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  قائمة مالية مفصلة بالغرامات المترتبة الصادرة عن وحدة التحريات المالية وبورصة الكوت والبنك المركزي لعام 2026.
                </p>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleExportPDF} className="h-9 px-3 bg-[#00796B] text-white hover:bg-[#004D40] border-none text-[10.5px] font-bold rounded-lg cursor-pointer">تحميل PDF مروّس</button>
                  <button onClick={handleExportExcel} className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-[10.5px] font-bold rounded-lg cursor-pointer">تصدير Excel</button>
                </div>
              </div>

              <div className="bg-slate-50 border p-5 rounded-2xl space-y-3.5 border-slate-200">
                <h4 className="text-xs font-black text-slate-800 border-b pb-2 flex justify-between">
                  <span>دليل السياسات واللوائح والقرارات الداخلية</span>
                  <FileText className="w-4 h-4 text-[#00796B]" />
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  إصدار دليلي شامل يشمل لائحة السلوك المتبعة وإفصاح الكفاءات لعام 2026 ممهوراً بالتوقيعات الرقمية للشركاء.
                </p>
                <div className="flex gap-2 justify-end">
                  <button onClick={handleExportPDF} className="h-9 px-3 bg-[#00796B] text-white hover:bg-[#004D40] border-none text-[10.5px] font-bold rounded-lg cursor-pointer">تحميل PDF مروّس</button>
                  <button onClick={handleExportWord} className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border-none text-[10.5px] font-bold rounded-lg cursor-pointer">تنزيل Word</button>
                </div>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border rounded-2xl text-xs font-bold leading-relaxed text-slate-600 flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                جميع التقارير المستخرجة متوفرة للنسخ والطباعة وتعتمد على خوارزمية البصمة والتحقق بالبث الثنائي الموحد لمكتب صبري شطا للمحاماة والاستشارات القانونية.
              </span>
            </div>
          </div>
        )}

      </div>

      {/* 5. MODAL FORM BUILDER: ADD / EDIT ITEMS */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[24px] w-full max-w-2xl p-6 md:p-8 shadow-2xl border border-slate-200 space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-[#00796B] bg-[#E0F2F1] px-3 py-1 rounded-md">منظومة عدالة للحوكمة الرقابية</span>
                  <h3 className="text-sm md:text-base font-black text-[#004D40] mt-1.5">
                    {editingItem ? translate('تحديث وتعديل سجل امتثال قائم بمللف الحوكمة', 'Edit Compliance & Obligations Entry') : translate('إدراج وإلحاق مستند رقابي جديد', 'Add New Compliance Record')}
                  </h3>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 border-none cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-semibold">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('مسمى الالتزام أو موضوع السجل القانوني', 'Record Title')}</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('التنظيم الرقابي المستهدف / الجهة الصادرة', 'Issuing Authority')}</label>
                    <input
                      type="text"
                      required
                      value={formData.authority || ''}
                      onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('التصنيف والدائرة الفرعية التابعة', 'Record Category')}</label>
                    <input
                      type="text"
                      required
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('مستوى الخطورة والتعرض', 'Severity level')}</label>
                    <select
                      value={formData.riskLevel || 'Medium'}
                      onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 text-xs font-bold text-slate-755"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('تاريخ الاستحقاق والنهو', 'Due Date')}</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate || ''}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block font-bold">{translate('حالة الامتثال والتسوية', 'Status')}</label>
                    <select
                      value={formData.statusAr || 'قيد التنفيذ'}
                      onChange={(e) => {
                        const arVal = e.target.value;
                        let statusVal = 'In Progress';
                        if (arVal === 'ملتزم ومكتمل') statusVal = 'Compliant';
                        if (arVal === 'متأخر ومخالف') statusVal = 'Overdue';
                        setFormData({ ...formData, statusAr: arVal, status: statusVal });
                      }}
                      className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-2 text-xs font-bold text-slate-700"
                    >
                      <option value="قيد التنفيذ">{translate('قيد التدقيق والتنفيذ', 'In Progress')}</option>
                      <option value="ملتزم ومكتمل">{translate('ملتزم ومغلق', 'Compliant')}</option>
                      <option value="متأخر ومخالف">{translate('متأخر ومخالف', 'Overdue')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('مسؤول المتابعة المعتمد بمكتب صبري شطا', 'Assigned Officer')}</label>
                    <input
                      type="text"
                      value={formData.assignedTo || ''}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('العقوبات المالية المترتبة (د.ك)', 'Penalty amount')}</label>
                    <input
                      type="number"
                      value={formData.penaltyAmount || ''}
                      onChange={(e) => setFormData({ ...formData, penaltyAmount: Number(e.target.value) })}
                      className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 block font-bold uppercase">{translate('الشروح وخلاصة القرارات والتوصيات', 'Description')}</label>
                  <textarea
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value, notes: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                  />
                </div>

                {/* Approvals simulator status block */}
                <div className="bg-slate-50 p-4 border rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5 text-right font-bold text-xs text-[#004D40]">
                    <h4>ربط ذكي مع الدائرة المالية وشؤون الموظفين</h4>
                    <p className="text-[9.5px] text-slate-400 font-semibold leading-normal">
                      بمجرد الحفظ سيقوم النظام بتأشير السجلات كلياً.
                    </p>
                  </div>
                  <CheckSquare className="w-6 h-6 text-[#00796B]" />
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 font-bold text-xs">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="h-11 px-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer">إلغاء الأمر</button>
                  <button type="submit" className="h-11 px-10 bg-[#00796B] border-none text-white rounded-xl hover:bg-[#004D40] cursor-pointer">حفظ وتأمين السجل</button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. DETAIL SIDEBAR / PROFILE VIEWER DRAWER */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[9990] bg-slate-900/60 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              className="bg-white w-full max-w-lg p-8 shadow-2xl overflow-y-auto space-y-6 h-full flex flex-col justify-between border-l border-slate-100"
            >
              <div className="space-y-6">
                
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-[#00796B] uppercase tracking-wider">سجل المطابقة الرسمي الموثق</span>
                    <h3 className="text-sm sm:text-base font-black text-[#004D40] leading-snug">{selectedProfile.title}</h3>
                    <p className="text-[10.5px] text-slate-400 font-bold">{selectedProfile.category}</p>
                  </div>
                  <button onClick={() => setSelectedProfile(null)} className="p-1 border-none bg-transparent hover:bg-slate-50 rounded-full cursor-pointer">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="bg-[#E0F2F1]/30 p-3 rounded-2xl border border-[#B2DFDB]/20 text-right">
                    <span className="text-[9.5px] text-slate-400 uppercase">تعرض ومستوى المخاطر</span>
                    <p className="text-[#00796B] font-black text-xs mt-0.5">{selectedProfile.riskLevel || 'Medium'}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-right">
                    <span className="text-[9.5px] text-slate-400 uppercase">الوضع الراهن</span>
                    <p className="text-[#004D40] font-black text-xs mt-0.5">{selectedProfile.statusAr || selectedProfile.status}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">{translate('الشروح ومطالب التدقيق', 'Narrative details')}</span>
                  <div className="bg-slate-50 font-semibold p-4 rounded-2xl text-xs text-slate-600 leading-relaxed whitespace-pre-line border border-slate-150">
                    {selectedProfile.description || selectedProfile.notes || translate('لم تدون شروح إجرائية كبرى لهذا الصنف.', 'No descriptive files compiled details for this conform.')}
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border text-xs">
                  <h4 className="font-bold text-[#004D40] border-b pb-1.5">{translate('بيانات التحقق والاعتماد الهيكلية', 'Structural Integrity Data')}</h4>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الرقم المرجعي للمستند:</span>
                    <span className="font-mono text-slate-700">ADALA-COMP-{selectedProfile.id?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الجهة الصادرة والمستقبلة:</span>
                    <span className="text-slate-700">{selectedProfile.authority || 'N/A'}</span>
                  </div>
                  {selectedProfile.penaltyAmount && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">العقوبة والغرامة المفروضة:</span>
                      <span className="text-rose-600 font-bold font-sans">{selectedProfile.penaltyAmount.toLocaleString()} KWD</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Print triggers */}
              <div className="pt-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => {
                    setPrintableItem(selectedProfile);
                    setSelectedProfile(null);
                  }}
                  className="w-full h-12 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border-none shadow-xs"
                >
                  <Printer className="w-4 h-4 animate-pulse" />
                  <span>{translate('تصدير شهادة رسمية والطباعة', 'Generate Certificate & Print')}</span>
                </button>
                <button onClick={() => setSelectedProfile(null)} className="w-[120px] h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer border-none">{translate('إغلاق', 'Close')}</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL PRINT PREVIEW CERTIFICATE HUB: OFFICIAL LETTERHEAD */}
      <AnimatePresence>
        {printableItem && (
          <div className="fixed inset-0 z-[9995] bg-[#004D40]/30 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[24px] shadow-2xl max-w-3xl w-full p-8 space-y-8 my-8 border border-slate-250 print:p-0 print:border-none print:shadow-none font-sans text-right" dir="rtl">
              
              {/* Header Letterhead for Sabri Shatta */}
              <div className="border-b-2 border-[#00796B] pb-6 flex justify-between items-start">
                {/* Left logo details */}
                <div className="space-y-1 text-left">
                  <h2 className="text-lg font-black text-[#00796B] flex items-center gap-1.5 leading-none">
                    <Shield className="w-5 h-5 text-[#00796B]" />
                    <span>عدالـة ADALAH</span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unified Corporate Integrity Ledger</p>
                  <p className="text-[9.5px] text-slate-500 font-medium font-sans">REF: REF-ADALA-COMP-2026-{(printableItem.id || '9821').slice(-4)}</p>
                  <p className="text-[9.5px] text-slate-500 font-medium font-sans">Date: {new Date().toISOString().split('T')[0]}</p>
                </div>

                {/* Middle header */}
                <div className="text-center space-y-2 mt-2">
                  <h3 className="text-xs font-black text-slate-550 leading-relaxed tracking-wide">دولة الكويت - بيئة الحوكمة والامتثال القانوني</h3>
                  <h1 className="text-base font-black px-4 py-1.5 border border-[#00796B]/20 bg-[#E0F2F1]/40 rounded-xl text-[#004D40] tracking-tight">
                    {translate('صك التدقيق وشهادة المطابقة الرسمية', 'Offical Legal Compliance & Integrity Deed')}
                  </h1>
                </div>

                {/* Right office address details */}
                <div className="space-y-1 text-right text-xs">
                  <h2 className="text-xs sm:text-[13px] font-black text-[#004D40]">مكتب المحامي صبري شطا للمحاماة</h2>
                  <p className="text-[10.5px] text-slate-550 font-bold">للاستشارات القانونية والتجارية والتحكيم</p>
                  <p className="text-[9.5px] text-slate-400 font-semibold">تأسس بموجب قوانين نقابة المحامين الكويتية</p>
                  <p className="text-[9.5px] text-slate-450 font-semibold font-mono">TEL: +965 2244 5566</p>
                </div>
              </div>

              {/* Main official letterhead template details */}
              <div className="space-y-6 text-xs text-slate-700 leading-relaxed font-semibold">
                
                <div className="p-4 bg-slate-50 rounded-xl border flex justify-between">
                  <span className="text-slate-400 font-bold">مسؤول إعداد وصياغة التقرير:</span>
                  <span className="text-[#004D40] font-black">{translate('أ. صبري شطا (المستشار العام للمكتب)', 'Sabri Shatta, Esq.')}</span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-slate-800 font-extrabold text-xs border-r-4 border-[#00796B] pr-2">وصف وشهادة المطابقة لملف الحوكمة</h3>
                  <p className="leading-relaxed">
                    يشهد مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية بدولة الكويت، بالتعامل المباشر مع اللجان الفنية المعتمدة وهيئات التقييم الإداري، بأن المستند المعنون بـ
                    <strong className="text-slate-900 mx-1">({printableItem.title})</strong>
                    الخاضع لسلطة ورقابة <strong className="text-[#00796B]">{printableItem.authority}</strong>، قد تم تدقيقه بالبصمة والفحص الشامل وموازنة الأرصدة والعهد العينية بنسبة نجاح تامة ١٠0% وبدون شوائب.
                  </p>
                </div>

                {/* Details Table in printable view */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-[11px] font-semibold border-collapse">
                    <thead>
                      <tr className="bg-[#E0F2F1] text-[#004D40] font-extrabold uppercase text-[10px]">
                        <th className="p-3">العنصر</th>
                        <th className="p-3">الجهة المستهدفة بالدولة</th>
                        <th className="p-3">المستوى</th>
                        <th className="p-3">حالة الرصد</th>
                        <th className="p-3">تاريخ الفحص</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 font-bold text-slate-900">{printableItem.title}</td>
                        <td className="p-3 text-slate-500">{printableItem.authority || 'N/A'}</td>
                        <td className="p-3 font-mono text-slate-500">{printableItem.riskLevel || 'Medium'}</td>
                        <td className="p-3 text-emerald-600 font-black">{printableItem.statusAr || printableItem.status}</td>
                        <td className="p-3 font-mono text-slate-500">{printableItem.dueDate || 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2">
                  <h3 className="text-slate-800 font-extrabold text-xs border-r-4 border-[#00796B] pr-2">أثر الحوكمة والتوصيات الملزمة</h3>
                  <p className="bg-slate-50 p-4 rounded-xl leading-relaxed whitespace-pre-line border border-slate-200">
                    {printableItem.description || translate('تم استيفاء كافة الأوراق الثبوتية ودراسة مذكرات الدفاع وكتب وزارة العدل، والسجل نظيف وخالي من المخالفات.', 'Fully vetted under State of Kuwait labor and corporate bylaws, completely satisfying all risk mitigation procedures.')}
                  </p>
                </div>

                {/* Stamped signing blocks */}
                <div className="pt-8 flex justify-between items-center text-center">
                  <div className="space-y-4">
                    <p className="text-slate-400 font-bold">الختم المائي الرسمي للمكتب</p>
                    <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#00796B]/40 text-[#00796B] text-[10px] font-black flex items-center justify-center rotate-12 mx-auto bg-[#E0F2F1]/20">
                      <span>مصدق ومغلق عدالة</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-slate-400 font-bold">توقيع المستشار المسؤول</p>
                    <p className="font-serif italic font-black text-slate-800 text-sm">صبري شطا</p>
                    <p className="text-[9.5px] text-slate-400">مكتب صبري شطا للمحاماة</p>
                  </div>
                </div>

              </div>

              {/* Secure Footer for printable document */}
              <div className="border-t-2 border-[#00796B] pt-6 flex justify-between items-center text-[10px] text-slate-450">
                <div className="space-y-0.5">
                  <p>البريد الإلكتروني: <span className="font-mono text-[#00796B] hover:underline">sabri.s@alwagayan.com</span></p>
                  <p>العنوان المعتمد: الكويت، الشرق، شارع جابر المبارك، برج الوجيان، الدور الرابع</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <QrCode className="w-10 h-10 text-slate-700" />
                  </div>
                  <div className="text-left leading-normal">
                    <p className="font-bold text-[#004D40]">وثيقة إلكترونية موثقة</p>
                    <p className="text-[8.5px] text-slate-400">الصفحة 1 من 1</p>
                  </div>
                </div>
              </div>

              {/* Action navigations inside Preview Modal */}
              <div className="pt-6 border-t border-slate-150 flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-6 h-11 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border-none"
                >
                  <Printer className="w-4 h-4 animate-bounce" />
                  <span>{translate('بدء الطباعة الفورية الصك', 'Initiate Direct Print')}</span>
                </button>
                <button
                  onClick={() => {
                    handleExportExcel();
                  }}
                  className="px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border-none cursor-pointer"
                >
                  {translate('تصدير كـ Excel', 'Export Excel')}
                </button>
                <button
                  onClick={() => setPrintableItem(null)}
                  className="px-5 h-11 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold border border-slate-150 cursor-pointer"
                >
                  {translate('إغلاق معاينة الصك', 'Close Preview')}
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CompliancePage;
