import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection, 
  Edge, 
  Node, 
  Handle, 
  Position,
  Panel,
  ReactFlowProvider,
  useReactFlow,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, Plus, Trash2, Lightbulb, Printer, Download, Sparkles, 
  Layout, X, Zap, MousePointer2, Maximize, Minimize2, ZoomIn, ZoomOut,
  FolderOpen, Save, Search, Undo2, Redo2, Share2, Type, Palette,
  MoreVertical, ChevronRight, ChevronLeft, Layers, MoreHorizontal,
  FileImage, FileDown, FileJson, FileType, FileCode, Check, Eye,
  Sliders, Link2, DownloadCloud, Paperclip, Globe, Users, Lock, ChevronDown,
  Copy, Clipboard, RotateCcw, AlertCircle, FileText, Briefcase, Scale, Calendar, User, CheckCircle
} from 'lucide-react';

import { 
  MindMapData, 
  MindMapLayoutType, 
  MindMapShape 
} from '../types';
import { geminiService } from '../services/geminiService';
import Button from '../components/ui/Button';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/Toast';

// --- Bilingual Dictionary ---
const TRANS_DICT: Record<string, Record<string, string>> = {
  ar: {
    galleryTitle: "الخرائط الذهنية الاستراتيجية المشتركة",
    gallerySub: "صمم، فرع ونظم استراتيجيات القضايا، العقود والعمليات الإدارية بدعم الذكاء الاصطناعي وبمحاذاة القانون الكويتي.",
    createNew: "إنشاء مخطط ذهني جديد",
    emptyGallery: "لا توجد مخططات في هذا القسم حالياً.",
    all: "جميع المخططات",
    cases: "قضايا",
    clients: "عملاء",
    contracts: "عقود",
    projects: "مشاريع",
    employees: "موظفون",
    meetings: "اجتماعات",
    departments: "إدارات قانونية",
    quickTemplates: "قوالب العمل الإداري والقضائي الجاهزة",
    strategicAssets: "شجرة الأصول الاستقرائية",
    nodesCount: "عنصر",
    createdOn: "أنشئت في",
    lastUpdated: "آخر تعديل",
    searchPlaceholder: "ابحث في محتويات الخريطة الذهنية...",
    aiCopilot: "مساعد الذكاء الاصطناعي المولد",
    aiPlaceholder: "اختر نقطة واكتب توجيهاً (مثال: اقترح دفوعاً قانونية)...",
    generateIdeas: "توليد فروع ذكية",
    analyzing: "جاري التحليل...",
    nodeProperties: "خصائص وبيانات العقدة",
    strategicControl: "مركز التحكم بالبيانات والسمات",
    nodeTitle: "عنوان العنصر (اضغط مرتين لتعديله بالخريطة)",
    nodeContent: "الشرح والتفاصيل المستفيضة",
    nodeColor: "السمة اللونية الموضعية",
    nodeShape: "تصميم وشكل العقدة الاستراتيجي",
    nodeIcon: "أيقونة الدلالة القانونية",
    crossLink: "ربط العقدة بوحدات النظام المتكاملة",
    linkSelect: "اختر الكيان المرتبط...",
    attachments: "مستندات ومرفقات العقدة",
    dragDropUpload: "اسحب وأسقط الملفات هنا أو اضغط لرفع مستند (PDF/Word/Excel)",
    downloadFile: "تحميل الملف المرفق",
    deleteFile: "حذف المرفق",
    addBranch: "إضافة تفرع مرتبط",
    deleteNode: "حذف عنصر العقدة نهائياً",
    duplicateNode: "تكرار العقدة",
    copyNode: "نسخ",
    pasteNode: "لصق",
    undo: "تراجع",
    redo: "إعادة",
    printOutline: "تقرير المخطط بملف القضية",
    collaborators: "الفريق والعمل المشترك (نشط)",
    permissions: "مستوى الأمان والتحكم",
    versionHistory: "سجل النسخ الاحتياطية المستعادة",
    restore: "استعادة هذا الإصدار",
    exit: "خروج وتخزين",
    saveStatus: "تم الحفظ تلقائياً",
    export: "تصدير المخطط",
    print: "طباعة المخطط",
    successExport: "تم تصدير ملفك بنجاح",
    importJson: "استيراد خريطة JSON"
  },
  en: {
    galleryTitle: "Strategic Collaborative Mind Maps",
    gallerySub: "Design, branch, and structure legal arguments, contracts, and business plans optimized with AI and aligned with Kuwaiti law.",
    createNew: "Create New Mind Map",
    emptyGallery: "No mind maps found in this category.",
    all: "All Maps",
    cases: "Cases",
    clients: "Clients",
    contracts: "Contracts",
    projects: "Projects",
    employees: "Employees",
    meetings: "Meetings",
    departments: "Legal Departments",
    quickTemplates: "Administrative & Legal Workflow Templates",
    strategicAssets: "Inductive Assets",
    nodesCount: "Nodes",
    createdOn: "Created on",
    lastUpdated: "Last updated",
    searchPlaceholder: "Search inside mind map contents...",
    aiCopilot: "AI Strategic Co-Pilot",
    aiPlaceholder: "Select a node and type a prompt (e.g., suggest defense arguments)...",
    generateIdeas: "Generate Branches",
    analyzing: "Analyzing...",
    nodeProperties: "Node Data Properties",
    strategicControl: "Content & Semantics Control Center",
    nodeTitle: "Element Title (Double Click directly in canvas to edit)",
    nodeContent: "Elaborated Content & Notes",
    nodeColor: "Visual Node Accent Color",
    nodeShape: "Strategic Geometric Shape",
    nodeIcon: "Legal Semantics Icon",
    crossLink: "Cross-Link with System Modules",
    linkSelect: "Select connected asset...",
    attachments: "Node Attachments & Files",
    dragDropUpload: "Drag & drop files here or click to select (PDF/Word/Excel)",
    downloadFile: "Download attachment",
    deleteFile: "Delete file",
    addBranch: "Attach Connected Branch",
    deleteNode: "Erase This Node",
    duplicateNode: "Duplicate",
    copyNode: "Copy",
    pasteNode: "Paste",
    undo: "Undo",
    redo: "Redo",
    printOutline: "Draft Dossier Report",
    collaborators: "Active Team Collaboration",
    permissions: "Access Control level",
    versionHistory: "Automated Version Snapshots",
    restore: "Restore Version",
    exit: "Exit & Return",
    saveStatus: "Autosaved safely",
    export: "Export Map",
    print: "Print / Outline Report",
    successExport: "Exported successfully",
    importJson: "Import JSON Map"
  }
};

// --- Shape helper mapper ---
const getShapeClass = (shape: MindMapShape) => {
  switch (shape) {
    case MindMapShape.RECTANGLE: 
      return 'rounded-none border-2';
    case MindMapShape.PILL: 
      return 'rounded-full px-8 py-3 border-2';
    case MindMapShape.OVAL: 
      return 'rounded-[50%] aspect-[1.4/1] flex flex-col justify-center items-center border-[2.5px] px-8';
    case MindMapShape.DIAMOND: 
      return 'rotate-45 border-[2.5px] aspect-square flex items-center justify-center';
    case MindMapShape.PARALLELOGRAM: 
      return '-skew-x-12 border-2 px-8 py-4';
    case MindMapShape.ROUNDED:
    default: 
      return 'rounded-[2rem] border-2';
  }
};

const getInnerShapeClass = (shape: MindMapShape) => {
  switch (shape) {
    case MindMapShape.DIAMOND: 
      return '-rotate-45 w-[140%] h-[140%] flex flex-col justify-center items-center text-center';
    case MindMapShape.PARALLELOGRAM: 
      return 'skew-x-12';
    default: 
      return '';
  }
};

// --- Node Colors Configuration ---
const NODE_COLORS = [
  { name: 'Teal/Green', class: 'bg-emerald-50 border-emerald-500/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300', theme: 'emerald', hex: '#10b981' },
  { name: 'Indigo/Blue', class: 'bg-indigo-50 border-indigo-500/60 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300', theme: 'indigo', hex: '#6366f1' },
  { name: 'Rose/Red', class: 'bg-rose-50 border-rose-500/60 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300', theme: 'rose', hex: '#f43f5e' },
  { name: 'Amber/Gold', class: 'bg-amber-50 border-amber-500/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300', theme: 'amber', hex: '#f59e0b' },
  { name: 'Violet/Purple', class: 'bg-violet-50 border-violet-500/60 dark:bg-violet-950/20 text-violet-800 dark:text-violet-300', theme: 'violet', hex: '#8b5cf6' },
  { name: 'Slate/Gray', class: 'bg-slate-50 border-slate-500/60 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300', theme: 'slate', hex: '#64748b' },
  { name: 'Sky/Cyan', class: 'bg-sky-50 border-sky-500/60 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300', theme: 'sky', hex: '#0ea5e9' }
];

// --- Custom Lucide Icons Registry ---
const ICONS_REGISTRY: Record<string, any> = {
  scale: Scale,
  briefcase: Briefcase,
  filetext: FileText,
  user: User,
  calendar: Calendar,
  alert: AlertCircle,
  sparkles: Sparkles,
  check: CheckCircle,
  lightbulb: Lightbulb,
  cpu: Cpu,
  files: FolderOpen
};

// --- Strategic Node component inside XYFlow ---
const StrategicNodeComponent = ({ id, data, selected }: { id: string, data: any, selected: boolean }) => {
  const { setNodes, setEdges, getNode } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label || '');
  const [tempContent, setTempContent] = useState(data.content || '');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setTempLabel(data.label || '');
    setTempContent(data.content || '');
  }, [data.label, data.content]);

  const handleSave = () => {
    setIsEditing(false);
    setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, label: tempLabel, content: tempContent } } : n));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempLabel(data.label || '');
    setTempContent(data.content || '');
  };

  const handleQuickAdd = () => {
    const childId = `node-${Date.now()}`;
    const parentNode = getNode(id);
    const parentX = parentNode?.position?.x || 0;
    const parentY = parentNode?.position?.y || 0;

    const newNode: Node = {
      id: childId,
      type: 'strategic',
      position: { x: parentX + (Math.random() > 0.5 ? 260 : -260), y: parentY + 180 },
      data: { 
        label: tempLabel === 'المحور الأساسي' ? 'تفصيل فرعي' : `تفرع من: ${tempLabel}`, 
        content: 'سجل الملاحظات الإرشادية هنا بشكل منظم وبنود تفصيلية.', 
        colorClass: data.colorClass || 'bg-slate-50 border-slate-500/60 dark:bg-slate-900/40 text-slate-800 dark:text-slate-300',
        shape: data.shape || MindMapShape.ROUNDED,
        iconName: 'filetext',
        attachments: [],
        linkedTo: null
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => addEdge({
      id: `edge-${id}-${childId}`,
      source: id,
      target: childId,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00796B' },
      style: { strokeWidth: 2, stroke: '#00796B' }
    }, eds));
  };

  // Node Drag and Drop upload simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newAttach = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/octet-stream'
      };
      setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, attachments: [...((n.data.attachments as any[]) || []), newAttach] } } : n));
    }
  };

  const colorConfig = NODE_COLORS.find(c => c.class === data.colorClass) || NODE_COLORS[5];
  const IconComponent = ICONS_REGISTRY[data.iconName || 'scale'] || FileText;
  const isHighlighted = data.searchHighlighted;

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative transition-all duration-300 min-w-[280px] group
        ${getShapeClass(data.shape || MindMapShape.ROUNDED)}
        ${data.colorClass || 'bg-slate-50 border-slate-400 dark:bg-slate-900 text-slate-800'}
        ${selected 
          ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-slate-950 shadow-2xl scale-[1.03] z-20' 
          : 'hover:border-primary-light/80 shadow-md hover:shadow-xl hover:scale-[1.01]'}
        ${isDragOver ? 'border-dashed border-primary bg-primary/5 scale-[1.04]' : ''}
        ${isHighlighted ? 'animate-pulse shadow-[0_0_25px_rgba(235,160,20,0.8)] border-amber-500 border-4' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-primary border border-white dark:border-slate-900 hover:scale-125 transition-transform" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-primary border border-white dark:border-slate-900 hover:scale-125 transition-transform" />
      
      <div className={`${getInnerShapeClass(data.shape || MindMapShape.ROUNDED)} p-5`}>
        {isEditing ? (
          <div className="space-y-3 w-full" onClick={(e) => e.stopPropagation()}>
            <input 
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              className="w-full text-xs font-bold p-1 border border-primary/40 rounded focus:ring-1 focus:ring-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="العنوان"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <textarea 
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              className="w-full text-[10px] p-1 border border-primary/40 rounded focus:ring-1 focus:ring-primary bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none h-14"
              placeholder="التفاصيل"
            />
            <div className="flex gap-1.5 justify-end">
              <button onClick={handleCancel} className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[9px] px-2 py-0.5 rounded font-black">إلغاء</button>
              <button onClick={handleSave} className="bg-primary text-white text-[9px] px-2 py-0.5 rounded font-black">حفظ</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3.5 mb-2.5">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-all duration-300 object-center" 
                style={{ backgroundColor: colorConfig.hex }}
              >
                <IconComponent className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0" onDoubleClick={() => setIsEditing(true)}>
                <h3 className="text-sm font-black tracking-tight leading-tight truncate text-slate-800 dark:text-slate-100 hover:text-primary cursor-pointer" title="انقر مرتين للتعديل السريع">
                  {data.label}
                </h3>
                {data.linkName && (
                  <div className="inline-flex items-center gap-1 text-[8px] bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-500 px-1 py-0.5 rounded mt-0.5 max-w-full truncate font-mono">
                    <Link2 className="w-2.5 h-2.5 shrink-0" />
                    <span>{data.linkName}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-3 line-clamp-3 select-none">
              {data.content}
            </p>

            {/* Bottom meta area */}
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-900/[0.04] dark:border-white/[0.04] text-[8px]">
              <div className="flex -space-x-1.5" title="المتابعون حالياً">
                <span className="w-5 h-5 rounded-full bg-indigo-500 text-white font-black flex items-center justify-center border border-white dark:border-slate-950 scale-90">S</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-black flex items-center justify-center border border-white dark:border-slate-950 scale-90">A</span>
              </div>
              <div className="flex items-center gap-2">
                {data.attachments && data.attachments.length > 0 && (
                  <span className="flex items-center gap-0.5 text-slate-400 font-bold" title={`${data.attachments.length} ملفات مرفقة`}>
                    <Paperclip className="w-3 h-3" />
                    {data.attachments.length}
                  </span>
                )}
                {data.category && (
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary-dark dark:text-primary font-black uppercase">
                    {data.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hover Fast Actions */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-2 py-1 shadow-xl flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto">
          <button onClick={handleQuickAdd} className="p-1 text-slate-400 hover:text-primary rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="تفريع عقدة جديدة">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-primary rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="تعديل سريع">
            <Type className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-primary border border-white dark:border-slate-900 hover:scale-125 transition-transform" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-primary border border-white dark:border-slate-900 hover:scale-125 transition-transform" />
      
      {selected && (
        <div className="absolute inset-0 -z-10 bg-primary/5 blur-2xl rounded-[2rem] animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

const nodeTypes = {
  strategic: StrategicNodeComponent,
};

// --- Main Inner MindMap Editor Workspace ---
const MindMapEditorComponent: React.FC<{ 
  onClose: () => void;
  initialData?: MindMapData;
  onSave: (data: any) => void;
  lang: string;
}> = ({ onClose, initialData, onSave, lang }) => {
  const isAr = lang === 'ar';
  const { addToast } = useToast();
  const tLocal = (key: string) => TRANS_DICT[lang]?.[key] || TRANS_DICT['ar'][key] || key;

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  
  // Advanced Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Node[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);

  // Undo / Redo Stack (snapshots for critical triggers)
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Version historical backup lists
  const [versionList, setVersionList] = useState<{ id: string; time: string; nodes: Node[]; edges: Edge[] }[]>(() => {
    const saved = localStorage.getItem(`qanooni_versions_${initialData?.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const { zoomIn, zoomOut, setViewport, fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [clipboardNode, setClipboardNode] = useState<Node | null>(null);

  // Load initial dataset once on mount/map ID switch
  useEffect(() => {
    if (initialData?.data?.rfNodes) {
      // Strip any residual or legacy nested allNodes to reclaim storage and prevent cycles
      const loadedNodes = initialData.data.rfNodes.map((n: Node) => {
        if (n.data && 'allNodes' in n.data) {
          const { allNodes, ...restData } = n.data;
          return { ...n, data: restData };
        }
        return n;
      });
      setNodes(loadedNodes);
      setEdges(initialData.data.rfEdges || []);
    } else {
      setNodes([
        {
          id: 'root',
          type: 'strategic',
          position: { x: 250, y: 150 },
          data: { 
            label: isAr ? 'المحور الأساسي للمخطط' : 'Primary Strategic Axis', 
            content: isAr ? 'سجل الرؤية أو القضية القانونية الأساسية لتفريع دفوع ومسارات منظمة.' : 'Record core visual elements here.', 
            colorClass: 'bg-emerald-50 border-emerald-500/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300',
            shape: MindMapShape.ROUNDED,
            iconName: 'scale',
            attachments: [],
            linkedTo: null
          },
        }
      ]);
      setEdges([]);
    }
    // eslint-disable-next-line react-hooks-exhaustive-deps
  }, [initialData?.id, isAr, setNodes, setEdges]);

  // Autosave and Sync backups
  useEffect(() => {
    const timer = setTimeout(() => {
      // Ensure allNodes is stripped from items saved to localStorage
      const cleanNodes = nodes.map((n: any) => {
        if (n.data && 'allNodes' in n.data) {
          const { allNodes, ...restData } = n.data;
          return { ...n, data: restData };
        }
        return n;
      });
      onSave({ rfNodes: cleanNodes, rfEdges: edges });
    }, 1500);
    return () => clearTimeout(timer);
  }, [nodes, edges, onSave]);

  const saveBackupSnapshot = useCallback(() => {
    const timestamp = new Date().toLocaleTimeString(isAr ? 'ar-KW' : 'en-US');
    const newVer = {
      id: `ver-${Date.now()}`,
      time: `${isAr ? 'نسخة احتياطية' : 'Backup'} - ${timestamp}`,
      nodes,
      edges
    };
    setVersionList(prev => {
      const top = [newVer, ...prev].slice(0, 8); // Keep last 8
      try {
        localStorage.setItem(`qanooni_versions_${initialData?.id}`, JSON.stringify(top));
      } catch (e) {
        console.warn('Could not save automated version snapshot due to storage limit', e);
      }
      return top;
    });
  }, [nodes, edges, initialData, isAr]);

  const restoreSnapshotVersion = (ver: any) => {
    setNodes(ver.nodes);
    setEdges(ver.edges);
    fitView({ duration: 800 });
  };

  const pushToHistory = useCallback(() => {
    const snapshot = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), snapshot].slice(-25));
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, historyIndex]);

  const handleNodesChangeWrapped = useCallback((changes: any) => {
    // Only snapshot if critical movement stops or layouts delete
    const isCritical = changes.some((c: any) => c.type === 'remove' || c.type === 'add');
    if (isCritical) pushToHistory();
    onNodesChange(changes);
  }, [onNodesChange, pushToHistory]);

  const handleEdgesChangeWrapped = useCallback((changes: any) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const onConnect = useCallback((params: Connection) => {
      pushToHistory();
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'smoothstep', 
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#00796B' },
        style: { strokeWidth: 2, stroke: '#00796B' }
      }, eds));
    },
    [setEdges, pushToHistory]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(() => {
    pushToHistory();
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'strategic',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: { 
        label: isAr ? 'عنصر جديد' : 'New Node', 
        content: isAr ? 'اكتب تفرعاتك وهياكلك الاستشارية بالتفصيل.' : 'Add your descriptions.', 
        colorClass: NODE_COLORS[1].class,
        shape: MindMapShape.ROUNDED,
        iconName: 'filetext',
        attachments: [],
        linkedTo: null
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
  }, [setNodes, isAr, pushToHistory]);

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    // Synch selectedNode representation
    setSelectedNode(prev => prev && prev.id === id ? { ...prev, data: { ...prev.data, ...newData } } : prev);
  };

  const deleteNode = (id: string) => {
    pushToHistory();
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  };

  const duplicateNode = (node: Node) => {
    pushToHistory();
    const id = `node-${Date.now()}`;
    const dup: Node = {
      ...node,
      id,
      position: { x: node.position.x + 40, y: node.position.y + 120 },
      data: { ...node.data }
    };
    setNodes(nds => nds.concat(dup));
    setSelectedNode(dup);
  };

  const copyNode = (node: Node) => {
    setClipboardNode(JSON.parse(JSON.stringify(node)));
  };

  const pasteNode = () => {
    if (!clipboardNode) return;
    pushToHistory();
    const id = `node-${Date.now()}`;
    const pasted: Node = {
      ...clipboardNode,
      id,
      position: { x: clipboardNode.position.x + 80, y: clipboardNode.position.y + 80 },
    };
    setNodes(nds => nds.concat(pasted));
    setSelectedNode(pasted);
  };

  // Keyboard Shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) {
        deleteNode(selectedNode.id);
      }
      if (e.key === 'c' && (e.ctrlKey || e.metaKey) && selectedNode) {
        e.preventDefault();
        copyNode(selectedNode);
      }
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        pasteNode();
      }
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedNode) {
        e.preventDefault();
        duplicateNode(selectedNode);
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, clipboardNode, historyIndex]);

  // Node Properties Sync items with strict type casting
  const selectedNodeData = (selectedNode?.data as any) || {};
  const dataLabel = selectedNodeData.label || '';
  const dataContent = selectedNodeData.content || '';
  const dataColorClass = selectedNodeData.colorClass || NODE_COLORS[5].class;
  const dataShapeClass = selectedNodeData.shape || MindMapShape.ROUNDED;
  const dataIconName = selectedNodeData.iconName || 'scale';
  const dataAttachmentsList = selectedNodeData.attachments || [];
  const dataLinkedToObj = selectedNodeData.linkedTo || null;

  // AI Co-pilot Expand Node
  const handleAiExpand = async () => {
    if (!selectedNode || !aiInput) return;
    setAiLoading(true);
    try {
      const prompt = `بصفتك مستشاراً قانونياً وإدارياً خبيراً مطلعاً على المحاكم والتشريعات الكويتية، قم بتحليل البند التالي من المخطط واقترح 3 تفرعات منطقية تكميلية باللغة العربية.
      العنصر المختار: ${selectedNode.data.label}
      التفاصيل الحالية: ${selectedNode.data.content}
      التوجيهات المرافقة: ${aiInput}
      يرجى صياغة النتيجة بتنسيق JSON دقيق كالتالي:
      { "suggestions": [ { "label": "عنوان المقترح الفرعي", "content": "شرح قانوني موجز ومحكم" }, ... ] }`;

      const response = await geminiService.generateContent(prompt, "أنت العقل الاستراتيجي لمنظومة عدالة القانونية.");
      let parsed = { suggestions: [] };
      try {
        const cleaned = response.trim().replace(/^```json/i, '').replace(/```$/, '').trim();
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        // Fallback pattern matching
        const match = response.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        pushToHistory();
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        
        parsed.suggestions.forEach((s: any, i: number) => {
          const id = `ai-node-${Date.now()}-${i}`;
          newNodes.push({
            id,
            type: 'strategic',
            position: { x: selectedNode.position.x + (i - 1) * 320, y: selectedNode.position.y + 200 },
            data: { 
              label: s.label, 
              content: s.content, 
              colorClass: NODE_COLORS[4].class, // Violet
              shape: dataShapeClass,
              iconName: 'sparkles',
              attachments: [],
              linkedTo: null
            },
          });
          newEdges.push({
            id: `edge-${selectedNode.id}-${id}`,
            source: selectedNode.id,
            target: id,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
            style: { strokeWidth: 2, stroke: '#8b5cf6' }
          });
        });

        setNodes((nds) => nds.concat(newNodes));
        setEdges((eds) => eds.concat(newEdges));
        saveBackupSnapshot();
      }
      setAiInput('');
    } catch (e) {
      console.error("AI Expansion Failure:", e);
    } finally {
      setAiLoading(false);
    }
  };

  // Search Logic
  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, searchHighlighted: false } })));
      return;
    }
    const filtered = nodes.filter(n => 
      (n.data?.label || '').toLowerCase().includes(val.toLowerCase()) ||
      (n.data?.content || '').toLowerCase().includes(val.toLowerCase())
    );
    setSearchResults(filtered);

    // Highlight matches in canvas
    setNodes(nds => nds.map(n => {
      const match = filtered.some(f => f.id === n.id);
      return { ...n, data: { ...n.data, searchHighlighted: match } };
    }));

    if (filtered.length > 0) {
      setCurrentSearchIndex(0);
      focusOnNode(filtered[0]);
    } else {
      setCurrentSearchIndex(-1);
    }
  };

  const focusOnNode = (node: Node) => {
    fitView({ nodes: [node], duration: 800, maxZoom: 1.5 });
  };

  const nextSearchResult = () => {
    if (searchResults.length === 0) return;
    const nextIdx = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(nextIdx);
    focusOnNode(searchResults[nextIdx]);
  };

  // Exporter Functions
  const handleExport = async (format: 'png' | 'pdf' | 'svg' | 'json') => {
    if (format === 'json') {
      const exportString = JSON.stringify({ nodes, edges, generatedAt: new Date().toISOString() }, null, 2);
      const blob = new Blob([exportString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `mindmap-${initialData?.id || 'dossier'}.json`;
      link.href = url;
      link.click();
      return;
    }

    if (!reactFlowWrapper.current) return;
    const element = reactFlowWrapper.current.querySelector('.react-flow__renderer') as HTMLElement;
    if (!element) return;

    try {
      if (format === 'png') {
        const dataUrl = await toPng(element, { backgroundColor: '#ffffff', quality: 1, style: { transform: 'scale(1)', transformOrigin: 'top left' } });
        const link = document.createElement('a');
        link.download = `mindmap-${initialData?.id || Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const dataUrl = await toJpeg(element, { backgroundColor: '#ffffff', quality: 0.95 });
        const pdf = new jsPDF('l', 'px', [element.offsetWidth, element.offsetHeight]);
        pdf.addImage(dataUrl, 'JPEG', 0, 0, element.offsetWidth, element.offsetHeight);
        pdf.save(`mindmap-${initialData?.id || Date.now()}.pdf`);
      } else if (format === 'svg') {
        const dataUrl = await toSvg(element);
        const link = document.createElement('a');
        link.download = `mindmap-${initialData?.id || Date.now()}.svg`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  // Import JSON Map
  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.nodes && Array.isArray(parsed.nodes)) {
          pushToHistory();
          setNodes(parsed.nodes);
          setEdges(parsed.edges || []);
          fitView({ duration: 500 });
        }
      } catch (err) {
        alert('ملف JSON غير صالح');
      }
    };
    reader.readAsText(file);
  };

  // File Uploader Local Simulation
  const triggerFileInput = useRef<HTMLInputElement>(null);
  const handleLocalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNode) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newAttach = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'application/octet-stream'
      };
      updateNodeData(selectedNode.id, { attachments: [...dataAttachmentsList, newAttach] });
      saveBackupSnapshot();
    }
  };

  // Print Structured Legal Dossier Option
  const [printDoc, setPrintDoc] = useState(false);
  const handlePrintOutline = () => {
    setPrintDoc(true);
    setTimeout(() => {
      window.print();
      setPrintDoc(false);
    }, 400);
  };

  return (
    <div id="mindmap-workspace" className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Professional Header Bar */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow shadow-primary/20">
            <Cpu className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 dark:text-white leading-none whitespace-nowrap">
              {initialData?.title || tLocal('galleryTitle')}
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-mono tracking-wider mt-1.5 uppercase shrink-0">
              {tLocal('strategicAssets')} | Qanooni Canvas Engine
            </p>
          </div>
        </div>

        {/* Global Toolbar Panel */}
        <div className="flex items-center gap-2">
          {/* Back button */}
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl font-bold gap-1 text-[11px] h-9 shrink-0"
            onClick={onClose}
          >
            <ChevronRight className="w-3.5 h-3.5" />
            {tLocal('exit')}
          </Button>

          {/* Quick Undo/Redo */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 gap-0.5 shrink-0">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg transition-all"
              title={tLocal('undo')}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 disabled:opacity-20 rounded-lg transition-all"
              title={tLocal('redo')}
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Copy/Paste/Duplicate Floating trigger */}
          {selectedNode && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 gap-0.5 items-center shrink-0">
              <button 
                onClick={() => copyNode(selectedNode)}
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-lg"
                title={tLocal('copyNode')}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button 
                onClick={() => duplicateNode(selectedNode)}
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 rounded-lg"
                title={tLocal('duplicateNode')}
              >
                <Clipboard className="w-4 h-4" />
              </button>
              <button 
                onClick={() => deleteNode(selectedNode.id)}
                className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-100 rounded-lg"
                title={tLocal('deleteNode')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          {clipboardNode && (
            <button 
              onClick={pasteNode}
              className="h-9 px-3 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 flex items-center gap-1.5 shrink-0"
            >
              <Clipboard className="w-4 h-4" />
              {tLocal('pasteNode')}
            </button>
          )}

          {/* Connectors & Blank Creator */}
          <Button 
            size="sm"
            onClick={addNode}
            className="rounded-xl gap-1 font-bold text-[11px] h-9 shrink-0 shadow-sm bg-primary hover:bg-primary-dark"
          >
            <Plus className="w-4 h-4" />
            {tLocal('addBranch')}
          </Button>

          {/* JSON importer / Export trigger menu */}
          <div className="relative group shrink-0">
            <button className="h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-[11px] flex items-center gap-1.5">
              <DownloadCloud className="w-4 h-4" />
              <span>{tLocal('export')}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute top-full right-0 mt-1 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl scale-0 group-hover:scale-100 origin-top-right transition-transform z-50 p-1.5 flex flex-col gap-0.5">
              <button onClick={() => handleExport('png')} className="flex items-center gap-2 px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileImage className="w-4 h-4 text-emerald-500" /> Image PNG
              </button>
              <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileType className="w-4 h-4 text-rose-500" /> PDF Portfolio
              </button>
              <button onClick={() => handleExport('svg')} className="flex items-center gap-2 px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileCode className="w-4 h-4 text-sky-500" /> Vector SVG
              </button>
              <button onClick={() => handleExport('json')} className="flex items-center gap-2 px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                <FileJson className="w-4 h-4 text-amber-500" /> JSON Backup
              </button>
              <hr className="border-slate-100 dark:border-slate-850 my-1" />
              <label className="flex items-center gap-2 px-3 py-2 text-right hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <DownloadCloud className="w-4 h-4 text-indigo-500" /> Load JSON
                <input type="file" accept=".json" onChange={handleJsonImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* Outline structured print option */}
          <button 
            onClick={handlePrintOutline}
            className="h-9 px-3 bg-slate-900 border border-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-950 font-bold text-[11px] text-white rounded-xl flex items-center gap-1.5 shrink-0"
          >
            <Printer className="w-4 h-4" />
            {tLocal('printOutline')}
          </button>
        </div>
      </header>

      {/* Main Designer Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* React Flow Canvas Pane */}
        <main className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChangeWrapped}
            onEdgesChange={handleEdgesChangeWrapped}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.15}
            maxZoom={3.5}
            className="bg-slate-50/50 dark:bg-slate-950/60"
          >
            <Background color="#94a3b8" gap={24} size={1} style={{ opacity: 0.3 }} />
            <Controls position="bottom-left" className="!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !shadow-lg !rounded-xl !p-1" />
            <MiniMap 
              position="bottom-right" 
              className="!bg-white/90 dark:!bg-slate-900/90 !backdrop-blur-md !border-slate-200 dark:!border-slate-800 !rounded-2xl !p-1.5 !shadow-2xl" 
              nodeColor={(n: any) => {
                const conf = NODE_COLORS.find(c => c.class === n.data?.colorClass);
                return conf?.hex || '#94a3b8';
              }}
              maskColor="rgba(248, 250, 252, 0.4)"
            />
            
            {/* Extended search toolbar on canvas */}
            <Panel position="top-left" className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xl w-72">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={tLocal('searchPlaceholder')}
                  className="bg-transparent border-none focus:ring-0 text-xs text-slate-700 dark:text-slate-100 flex-1 outline-none font-medium h-6"
                />
                {searchResults.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">
                    <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                    <button onClick={nextSearchResult} className="hover:text-primary">
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </Panel>

            <Panel position="top-right" className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-1.5 bg-white/90 dark:bg-slate-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
                 <button onClick={() => fitView({ duration: 800 })} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary rounded-lg" title="حتواء المشهد">
                   <Maximize className="w-4 h-4" />
                 </button>
                 <button onClick={() => zoomIn()} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary rounded-lg" title="تكبير">
                   <ZoomIn className="w-4 h-4" />
                 </button>
                 <button onClick={() => zoomOut()} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary rounded-lg" title="تصغير">
                   <ZoomOut className="w-4 h-4" />
                 </button>
              </div>
            </Panel>

            {/* Smart Ai co-pilot on-screen Panel */}
            <Panel position="bottom-center" className="w-full max-w-xl px-4 pointer-events-none">
              <div className="pointer-events-auto bg-slate-900 dark:bg-slate-950 border border-white/10 rounded-full p-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.45)] flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-violet-600 flex items-center justify-center text-white scale-95 relative overflow-hidden shrink-0">
                  <Sparkles className={`w-4.5 h-4.5 z-10 ${aiLoading ? 'animate-spin' : ''}`} />
                  <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[spin_5s_linear_infinite]" />
                </div>
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={selectedNode ? `${tLocal('aiPlaceholder').substring(0, 30)}: "${selectedNode.data.label}"` : tLocal('aiPlaceholder')}
                  className="flex-1 bg-transparent border-none text-white text-[11px] font-bold placeholder:text-slate-500 focus:ring-0 focus:outline-none px-2 leading-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiExpand()}
                />
                <button 
                  onClick={handleAiExpand}
                  disabled={aiLoading || !aiInput || !selectedNode}
                  className="px-5 h-9 bg-primary text-white rounded-full text-[10px] font-black hover:bg-primary-dark transition-all disabled:opacity-30 flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {aiLoading ? tLocal('analyzing') : tLocal('generateIdeas')}
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </main>

        {/* Right properties side control panel */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: isAr ? 380 : -380 }} 
              animate={{ x: 0 }} 
              exit={{ x: isAr ? 380 : -380 }} 
              className="w-[360px] bg-white dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 z-40 shadow-xl flex flex-col shrink-0"
            >
              <div className="p-5 pb-3.5 border-b border-rose-100/50 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-primary" />
                    {tLocal('nodeProperties')}
                  </h4>
                  <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-wider">{tLocal('strategicControl')}</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >
                  <X className="w-4.5 h-4.5 text-slate-400" />
                </button>
              </div>

              {selectedNode ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-right">
                  {/* Title editor */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLocal('nodeTitle')}</label>
                    <input 
                      type="text" 
                      value={dataLabel}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                      className="w-full h-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl px-3 font-semibold text-xs text-slate-800 dark:text-white focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Body description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLocal('nodeContent')}</label>
                    <textarea 
                      value={dataContent}
                      onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
                      className="w-full h-24 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-xs font-medium leading-relaxed resize-none focus:border-primary focus:outline-none text-right"
                    />
                  </div>

                  {/* Node Colors */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLocal('nodeColor')}</label>
                    <div className="grid grid-cols-7 gap-1 px-1">
                      {NODE_COLORS.map((col) => (
                        <button 
                          key={col.class}
                          onClick={() => updateNodeData(selectedNode.id, { colorClass: col.class })}
                          className={`
                            h-7 rounded-lg border flex items-center justify-center transition-all relative overflow-hidden
                            ${col.class}
                            ${dataColorClass === col.class ? 'ring-2 ring-primary ring-offset-1 dark:ring-offset-slate-900 scale-105' : 'opacity-70 hover:opacity-100'}
                          `}
                          style={{ borderColor: col.hex }}
                          title={col.name}
                        >
                          {dataColorClass === col.class && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Geometric custom shapes */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLocal('nodeShape')}</label>
                    <div className="grid grid-cols-3 gap-1">
                      {Object.values(MindMapShape).map((sh) => (
                        <button
                          key={sh}
                          onClick={() => updateNodeData(selectedNode.id, { shape: sh })}
                          className={`
                            py-1 px-2 text-[9px] font-black border rounded-lg transition-all capitalize
                            ${dataShapeClass === sh 
                              ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20' 
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100'}
                          `}
                        >
                          {sh}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* MindMap Icons choice */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLocal('nodeIcon')}</label>
                    <div className="grid grid-cols-5 gap-1">
                      {Object.entries(ICONS_REGISTRY).map(([name, IconComp]) => (
                        <button
                          key={name}
                          onClick={() => updateNodeData(selectedNode.id, { iconName: name })}
                          className={`
                            p-1.5 border rounded-lg flex items-center justify-center transition-all
                            ${dataIconName === name 
                              ? 'bg-primary/20 text-primary border-primary' 
                              : 'bg-slate-50 dark:bg-slate-805 hover:bg-slate-100 text-slate-500'}
                          `}
                          title={name}
                        >
                          <IconComp className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* System Cross-link list */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <Link2 className="w-3.5 h-3.5" />
                      {tLocal('crossLink')}
                    </label>
                    <select 
                      value={dataLinkedToObj?.id || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          updateNodeData(selectedNode.id, { linkedTo: null, linkName: null });
                          return;
                        }
                        const labelMap: Record<string, string> = {
                          'case-1': isAr ? 'قضية تعويض مدني م-245/2026' : 'Civil Code Case #245',
                          'client-1': isAr ? 'العميل: شركة الخليج التجارية' : 'Gulf Trading Inc.',
                          'contract-1': isAr ? 'عقد توريد مجمع الأفنيوز' : 'Avenues Lease Agreement',
                          'emp-1': isAr ? 'أ. صبري السعدون (مستشار شريك)' : 'S. Al-Saadoun Counsel'
                        };
                        updateNodeData(selectedNode.id, { linkedTo: { id: val }, linkName: labelMap[val] });
                        saveBackupSnapshot();
                      }}
                      className="w-full text-xs font-semibold h-10 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl px-2 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-100"
                    >
                      <option value="">{tLocal('linkSelect')}</option>
                      <optgroup label={isAr ? 'القضايا والمحاكم' : 'Court litigations'}>
                        <option value="case-1">{isAr ? 'قضية تعويض مدني م-245/2026' : 'Civil Code Case #245'}</option>
                      </optgroup>
                      <optgroup label={isAr ? 'الشركات والعملاء' : 'Clients registry'}>
                        <option value="client-1">{isAr ? 'العميل: شركة الخليج التجارية' : 'Gulf Trading Inc.'}</option>
                      </optgroup>
                      <optgroup label={isAr ? 'العقود والاتفاقيات' : 'Corporate Contracts'}>
                        <option value="contract-1">{isAr ? 'عقد توريد مجمع الأفنيوز' : 'Avenues Lease Agreement'}</option>
                      </optgroup>
                      <optgroup label={isAr ? 'الموظفون والمستشارون' : 'Core Staff'}>
                        <option value="emp-1">{isAr ? 'أ. صبري السعدون (مستشار شريك)' : 'S. Al-Saadoun Counsel'}</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Attachments Section drag and drop */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{tLocal('attachments')}</label>
                    
                    <div 
                      onClick={() => triggerFileInput.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary rounded-xl p-3 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                    >
                      <Download className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                      <p className="text-[9px] font-bold text-slate-500 leading-normal">{tLocal('dragDropUpload')}</p>
                      <input 
                        ref={triggerFileInput}
                        type="file" 
                        onChange={handleLocalUpload} 
                        className="hidden" 
                      />
                    </div>

                    {dataAttachmentsList.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {dataAttachmentsList.map((file: any) => (
                          <div key={file.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-750">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span className="text-[10px] font-bold truncate text-slate-650 dark:text-slate-300" title={file.name}>
                                {file.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button 
                                onClick={() => alert(`${tLocal('downloadFile')}: ${file.name}`)}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-primary transition-all"
                                title={tLocal('downloadFile')}
                              >
                                <Download className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => {
                                  updateNodeData(selectedNode.id, { attachments: dataAttachmentsList.filter((f: any) => f.id !== file.id) });
                                  saveBackupSnapshot();
                                }}
                                className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded text-slate-400 hover:text-rose-500 transition-all"
                                title={tLocal('deleteFile')}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Undo snapshots history log inside side view */}
                  {versionList.length > 0 && (
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" />{tLocal('versionHistory')}</label>
                      <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                        {versionList.map((v) => (
                          <div key={v.id} className="flex justify-between items-center p-1.5 bg-slate-50/50 dark:bg-slate-850 rounded border border-slate-100/50 dark:border-slate-800 text-[9px]">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{v.time}</span>
                            <button 
                              onClick={() => restoreSnapshotVersion(v)}
                              className="text-primary hover:underline font-black"
                            >
                              {tLocal('restore')}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action duplication or full deletion */}
                  <div className="pt-3 flex gap-2">
                    <button 
                      onClick={() => duplicateNode(selectedNode)}
                      className="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-black hover:bg-slate-50 text-slate-600 dark:text-slate-200 flex items-center justify-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {tLocal('duplicateNode')}
                    </button>
                    <button 
                      onClick={() => deleteNode(selectedNode.id)}
                      className="flex-1 h-9 rounded-xl bg-rose-50 dark:bg-rose-900/10 text-rose-605 text-[10px] font-black hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/20 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {tLocal('deleteNode')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 opacity-40">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-inner">
                    <MousePointer2 className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-[11px] font-serif tracking-widest leading-relaxed">
                    {isAr ? 'اختر عقدة للتعديل على\nبياناتها وبنيتها الاستراتيجية' : 'Select a node in canvas to customize values.'}
                  </p>
                </div>
              )}

              {/* Collaborative Status and Share Settings */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-right">
                <div className="flex justify-between items-center text-[10px] mb-2 font-black text-slate-400 uppercase">
                  <span>{tLocal('collaborators')}</span>
                  <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[8px] animate-pulse">● Live</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex -space-x-2 shrink-0">
                    <span className="w-7 h-7 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-900 text-xs font-black text-white flex items-center justify-center">MK</span>
                    <span className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 text-xs font-black text-white flex items-center justify-center">AA</span>
                    <span className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 text-xs font-black text-white flex items-center justify-center">SS</span>
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400 max-w-[150px] truncate">أ. صبري معرفي وباحثون...</span>
                </div>
                
                {/* Permissions selector */}
                <div className="flex justify-between items-center text-[9px] bg-slate-100/50 dark:bg-slate-800 p-2 rounded-xl">
                  <span className="text-slate-500 text-[10px] font-semibold">{tLocal('permissions')}</span>
                  <select className="bg-transparent border-none text-[10px] font-black focus:ring-0 cursor-pointer text-slate-700 dark:text-slate-100">
                    <option value="private">🔒 Private (خاص)</option>
                    <option value="shared">👥 Shared Edit (مشترك - تعديل)</option>
                    <option value="public">🌐 Read Only (عام للقراءة)</option>
                  </select>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Styled Outline Print dossier preview modal when printing */}
      {printDoc && (
        <div className="absolute inset-0 z-[999] bg-white text-slate-900 p-12 overflow-y-auto text-right md:dir-rtl block" style={{ visibility: 'visible' }}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="pb-4 border-b-2 border-slate-950 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-black">{initialData?.title || 'خريطة أفكار قانونية'}</h1>
                <p className="text-xs text-slate-500 mt-1 font-mono">QANOONI EXPORTED OUTLINE REPORT - {new Date().toLocaleDateString('ar-KW')}</p>
              </div>
              <div className="text-left">
                <span className="text-md font-black block">عدالة القانوني</span>
                <span className="text-[10px] text-slate-400 block">منظومة الإدارة القانونية المتكاملة v3</span>
              </div>
            </div>

            <div className="space-y-4">
              {nodes.map((node, i) => (
                <div key={node.id} className="p-4 border-b border-slate-100 space-y-2">
                  <div className="flex gap-2 items-center">
                    <span className="font-bold text-sm bg-slate-100 p-1 rounded min-w-8 text-center">{i+1}</span>
                    <h3 className="font-black text-slate-900 text-md">{node.data.label}</h3>
                    {node.data.category && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-black">{node.data.category}</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-600 pr-10">{node.data.content}</p>
                  
                  {node.data.linkName && (
                    <div className="text-[9px] text-primary pr-10 font-bold">
                      🔗 الارتباط بالنظام: {node.data.linkName}
                    </div>
                  )}

                  {node.data.attachments && node.data.attachments.length > 0 && (
                    <div className="text-[9px] text-slate-400 pr-10 flex gap-2">
                      <span>📎 المرفقات المفحوصة:</span>
                      {node.data.attachments.map((f: any) => (
                        <span key={f.id} className="underline">{f.name} ({f.size})</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Gallery Launch Examples and Core Redesign Wrapper ---
const SmartMindMapPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { addToast } = useToast();
  const [lang, setLang] = useState('ar');

  useEffect(() => {
    if (i18n.language) {
      setLang(i18n.language.startsWith('ar') ? 'ar' : 'en');
    }
  }, [i18n.language]);

  const toggleLanguage = () => {
    const next = lang === 'ar' ? 'en' : 'ar';
    setLang(next);
    i18n.changeLanguage(next);
  };

  const tGallery = (key: string) => TRANS_DICT[lang]?.[key] || TRANS_DICT['ar'][key] || key;

  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load ready-mades
  const defaultMaps = useMemo<MindMapData[]>(() => [
    {
      id: 'template-legal-case',
      title: lang === 'ar' ? 'استراتيجية الدفاع في قاضية تعويض مدني' : 'Civil Case Compensation Defence',
      layoutType: MindMapLayoutType.MINDMAP,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'cases',
      data: {
        rfNodes: [
          { id: 'root', type: 'strategic', position: { x: 300, y: 150 }, data: { label: 'قضية تعويض مدني - م-245/2026', content: 'تحليل الأركان وصياغة دفوع الإعفاء من المسؤولية والسببية في القانون الكويتي.', colorClass: NODE_COLORS[0].class, shape: MindMapShape.ROUNDED, iconName: 'scale', attachments: [] } },
          { id: 'sub-1', type: 'strategic', position: { x: -80, y: 350 }, data: { label: 'انتفاء ركن الخطأ التقصيري', content: 'الدفع بامتثال المقاول التام لدفتر الشروط والمواصفات الفنية المعتمدة من بلدية الكويت.', colorClass: NODE_COLORS[1].class, shape: MindMapShape.RECTANGLE, iconName: 'check', attachments: [] } },
          { id: 'sub-2', type: 'strategic', position: { x: 680, y: 350 }, data: { label: 'انقطاع علاقة السببية', content: lang === 'ar' ? 'القوة القاهرة أو خطأ المضرور نفسه المستغرق لخطأ المسؤول بموجب المادة 263 م.' : 'Act of god and contributory negligence.', colorClass: NODE_COLORS[2].class, shape: MindMapShape.DIAMOND, iconName: 'alert', attachments: [] } },
          { id: 'sub-3', type: 'strategic', position: { x: 300, y: 550 }, data: { label: 'مستندات البينة والخبراء', content: 'تقرير هندسي استشاري كويتي، وثيقة استلام نهائي، محضر إثبات حالة بمخفر الشرطة.', colorClass: NODE_COLORS[3].class, shape: MindMapShape.PILL, iconName: 'filetext', attachments: [] } }
        ],
        rfEdges: [
          { id: 'e-r-s1', source: 'root', target: 'sub-1', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
          { id: 'e-r-s2', source: 'root', target: 'sub-2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
          { id: 'e-r-s3', source: 'root', target: 'sub-3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } }
        ]
      }
    },
    {
      id: 'template-procedure',
      title: lang === 'ar' ? 'خطوات رفع دعوى تجارية - قصر العدل' : 'Kuwait Commercial Suit Filing Steps',
      layoutType: MindMapLayoutType.FLOWCHART_VERTICAL,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'departments',
      data: {
        rfNodes: [
          { id: 'r', type: 'strategic', position: { x: 300, y: 50 }, data: { label: 'رفع دعوى تجارية', content: 'مسار إيداع صحف الدعاوى والمثول أمام الدائرة التجارية.', colorClass: NODE_COLORS[1].class, shape: MindMapShape.ROUNDED, iconName: 'scale' } },
          { id: 'p1', type: 'strategic', position: { x: 300, y: 250 }, data: { label: 'صياغة وإيداع الصحيفة', content: 'تجهيز صحيفة الدعوى وإرفاق عقد التأسيس والوكالات والرسوم القضائية بقصر العدل.', colorClass: NODE_COLORS[4].class, shape: MindMapShape.PARALLELOGRAM, iconName: 'filetext' } },
          { id: 'p2', type: 'strategic', position: { x: 300, y: 450 }, data: { label: 'جدولة الجلسات وإدارة الإعلان', content: 'الإعلان عن طريق مأمور الإعلان الرسمي أو البريد المسجل للخصم قانوناً.', colorClass: NODE_COLORS[3].class, shape: MindMapShape.OVAL, iconName: 'calendar' } },
          { id: 'p3', type: 'strategic', position: { x: 300, y: 650 }, data: { label: 'المدافعة والمرافعة الشفهية', content: 'تقديم مذكرات دفاع، وحضور الخبراء، والوصول لصيغة حكم التمييز النهائي.', colorClass: NODE_COLORS[0].class, shape: MindMapShape.PILL, iconName: 'check' } }
        ],
        rfEdges: [
          { id: 'ep1', source: 'r', target: 'p1', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } },
          { id: 'ep2', source: 'p1', target: 'p2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } },
          { id: 'ep3', source: 'p2', target: 'p3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } }
        ]
      }
    },
    {
      id: 'template-contract',
      title: lang === 'ar' ? 'تحليل عقد توريد برمجيات وحلول رقمية' : 'Software Supply Contract redlining',
      layoutType: MindMapLayoutType.TREE_HORIZONTAL,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'contracts',
      data: {
        rfNodes: [
          { id: 'h', type: 'strategic', position: { x: 100, y: 200 }, data: { label: 'تحليل عقد التوريد والتشغيل الرقمي', content: 'مراجعة ثنائية وشروط تسوية المنازعات في المحاكم الكويتية.', colorClass: NODE_COLORS[2].class, shape: MindMapShape.ROUNDED, iconName: 'filetext' } },
          { id: 'c1', type: 'strategic', position: { x: 450, y: 50 }, data: { label: 'حقوق الملكية الفكرية والبيانات', content: 'النص على ملكية الأكواد للعميل، وسرية البيانات المشغلة بالمستودعات السحابية.', colorClass: NODE_COLORS[0].class, shape: MindMapShape.RECTANGLE, iconName: 'check' } },
          { id: 'c2', type: 'strategic', position: { x: 450, y: 350 }, data: { label: 'غرامات التأخير وجزاء السداد', content: 'التسوية بالشرط التحكيمي بغرفة تجارة وصناعة الكويت بدلاً من المحاكم.', colorClass: NODE_COLORS[3].class, shape: MindMapShape.DIAMOND, iconName: 'alert' } }
        ],
        rfEdges: [
          { id: 'ec1', source: 'h', target: 'c1', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
          { id: 'ec2', source: 'h', target: 'c2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } }
        ]
      }
    },
    {
      id: 'template-appeal',
      title: lang === 'ar' ? 'مسار طعون الاستئناف والتمييز الممنهج' : 'Standard Litigation Appeals Workflow',
      layoutType: MindMapLayoutType.FLOWCHART_VERTICAL,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'cases',
      data: {
        rfNodes: [
          { id: 'ap1', type: 'strategic', position: { x: 300, y: 0 }, data: { label: 'حكم محكمة أول درجة (الابتدائية)', content: 'مراجعة تسبيب الحكم وحساب مواعيد فترات الاستئناف الرسمية.', colorClass: NODE_COLORS[5].class, shape: MindMapShape.ROUNDED, iconName: 'scale' } },
          { id: 'ap2', type: 'strategic', position: { x: 300, y: 200 }, data: { label: 'استئناف الحكم (خلال 30 يوماً)', content: 'صياغة أسباب استئناف موضوعية؛ الخطأ في تطبيق القانون أو القصور في التسبيب.', colorClass: NODE_COLORS[4].class, shape: MindMapShape.ROUNDED, iconName: 'filetext' } },
          { id: 'ap3', type: 'strategic', position: { x: 300, y: 400 }, data: { label: 'طعن بالتمييز (خلال 60 يوماً)', content: 'تقديم أسباب التمييز المحددة أمام الدائرة المدنية بالقصر الأعلى بالمحكمة العليا.', colorClass: NODE_COLORS[2].class, shape: MindMapShape.ROUNDED, iconName: 'alert' } }
        ],
        rfEdges: [
          { id: 'eap1', source: 'ap1', target: 'ap2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' } },
          { id: 'eap2', source: 'ap2', target: 'ap3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' } }
        ]
      }
    },
    {
      id: 'template-orgstructure',
      title: lang === 'ar' ? 'الهيكل الإداري للإدارة القانونية' : 'Legal Department Organizational Structure',
      layoutType: MindMapLayoutType.ORGANIZATION_CHART,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'employees',
      data: {
        rfNodes: [
          { id: 'o1', type: 'strategic', position: { x: 300, y: 0 }, data: { label: 'شريك قطاع التجارة والتقاضي', content: 'الإشراف النهائي على مذكرات الدفاع وخطط العمل بالتحكيم.', colorClass: NODE_COLORS[0].class, shape: MindMapShape.ROUNDED, iconName: 'user' } },
          { id: 'o2', type: 'strategic', position: { x: 0, y: 180 }, data: { label: 'رئيس قسم صياغة العقود', content: 'مراجعة وتدقيق العقود والامتثال المتبادل للشركاء والمستهلكين.', colorClass: NODE_COLORS[1].class, shape: MindMapShape.ROUNDED, iconName: 'filetext' } },
          { id: 'o3', type: 'strategic', position: { x: 600, y: 180 }, data: { label: 'رئيس قسم المرافعة القضائية', content: 'المثول لتمثيل القضايا وقصر العدل والمحكمة الدستورية.', colorClass: NODE_COLORS[4].class, shape: MindMapShape.ROUNDED, iconName: 'scale' } }
        ],
        rfEdges: [
          { id: 'eo1', source: 'o1', target: 'o2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
          { id: 'eo2', source: 'o1', target: 'o3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } }
        ]
      }
    },
    {
      id: 'template-agm',
      title: lang === 'ar' ? 'تخطيط الجمعية العمومية والمصادقة' : 'Annual General Assembly AGM Map',
      layoutType: MindMapLayoutType.MINDMAP,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'meetings',
      data: {
        rfNodes: [
          { id: 'm1', type: 'strategic', position: { x: 350, y: 100 }, data: { label: 'الجمعية العمومية للشركة', content: 'إدارة النصاب القانوني الكويتي للمصادقة على أرباح السنة المالية.', colorClass: NODE_COLORS[3].class, shape: MindMapShape.ROUNDED, iconName: 'user' } },
          { id: 'm2', type: 'strategic', position: { x: -20, y: 300 }, data: { label: 'وزارة التجارة الكويتية', content: 'توجيه الإخطارات وتأمين حضور ممثلي الوزارة لإدارة القرارات.', colorClass: NODE_COLORS[1].class, shape: MindMapShape.PILL, iconName: 'calendar' } },
          { id: 'm3', type: 'strategic', position: { x: 720, y: 300 }, data: { label: 'مصادقة مراقب الحسابات', content: 'تقرير المدقق الخارجي المعتمد بجمعية المحاسبين والمدققين الكويتية.', colorClass: NODE_COLORS[0].class, shape: MindMapShape.RECTANGLE, iconName: 'check' } }
        ],
        rfEdges: [
          { id: 'em1', source: 'm1', target: 'm2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } },
          { id: 'em2', source: 'm1', target: 'm3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' } }
        ]
      }
    },
    {
      id: 'template-expansion',
      title: lang === 'ar' ? 'خطة توسيع وترقية مكاتب المحاماة' : 'Law Firm Corporate Expansion Plan',
      layoutType: MindMapLayoutType.MINDMAP,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'projects',
      data: {
        rfNodes: [
          { id: 'ex1', type: 'strategic', position: { x: 300, y: 150 }, data: { label: 'خطة التوسع الجغرافي والرقمي', content: 'دراسة افتتاح فروع إقليمية للخدمات المالية في مركز دبي التجاري.', colorClass: NODE_COLORS[0].class, shape: MindMapShape.ROUNDED, iconName: 'lightbulb' } },
          { id: 'ex2', type: 'strategic', position: { x: -20, y: 350 }, data: { label: 'أتمتة ورقمنة مستودع العقود', content: 'تنصيب أنظمة الفحص النافي للجهالة المتطورة لتسريع الإنجاز المتبادل.', colorClass: NODE_COLORS[4].class, shape: MindMapShape.ROUNDED, iconName: 'cpu' } },
          { id: 'ex3', type: 'strategic', position: { x: 620, y: 350 }, data: { label: 'حملات التوعية وبناء الهوية', content: 'بث محتوى مرئي لشرح المادة القانونية في المنصات الاجتماعية لجذب المستثمرين.', colorClass: NODE_COLORS[3].class, shape: MindMapShape.ROUNDED, iconName: 'sparkles' } }
        ],
        rfEdges: [
          { id: 'eex1', source: 'ex1', target: 'ex2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } },
          { id: 'eex2', source: 'ex1', target: 'ex3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' } }
        ]
      }
    },
    {
      id: 'template-dd',
      title: lang === 'ar' ? 'فحص الجهالة النافي للجهالة بالقضايا' : 'Litigation Due Diligence Standard Grid',
      layoutType: MindMapLayoutType.MINDMAP,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'clients',
      data: {
        rfNodes: [
          { id: 'dd1', type: 'strategic', position: { x: 350, y: 100 }, data: { label: 'تقرير الفحص النافي للجهالة للنزاعات', content: 'تقدير حجم ومقدار المخاطر القضائية المرفوعة على الشركة المستهدفة.', colorClass: NODE_COLORS[2].class, shape: MindMapShape.ROUNDED, iconName: 'alert' } },
          { id: 'dd2', type: 'strategic', position: { x: -40, y: 300 }, data: { label: 'المخالفات العمالية وقضايا الأجور', content: 'مراجعة كشوف المستحقات وتعويضات إصابات العمل للتحقق من عدم وجود قضايا نشطة.', colorClass: NODE_COLORS[1].class, shape: MindMapShape.RECTANGLE, iconName: 'user' } },
          { id: 'dd3', type: 'strategic', position: { x: 740, y: 300 }, data: { label: 'الضمانات البنكية ومستندات الدين', content: 'الحجوزات التحفظية الصادرة والامتثال لشروط الودائع وإقراض بنك الكويت المركزي.', colorClass: NODE_COLORS[3].class, shape: MindMapShape.OVAL, iconName: 'briefcase' } }
        ],
        rfEdges: [
          { id: 'edd1', source: 'dd1', target: 'dd2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } },
          { id: 'edd2', source: 'dd1', target: 'dd3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#f43f5e' } }
        ]
      }
    },
    {
      id: 'template-draftcycle',
      title: lang === 'ar' ? 'مسيرة صياغة واعتماد العقود المتبادلة' : 'Interactive Contracting Drafting Workflow',
      layoutType: MindMapLayoutType.FLOWCHART_HORIZONTAL,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'contracts',
      data: {
        rfNodes: [
          { id: 'dr1', type: 'strategic', position: { x: 0, y: 250 }, data: { label: 'تلقي بنود وأهداف الصياغة', content: 'استقصاء الرغبات ومحاور المخاوف الاستراتيجية المطلوبة بالاتفاق.', colorClass: NODE_COLORS[5].class, shape: MindMapShape.ROUNDED, iconName: 'lightbulb' } },
          { id: 'dr2', type: 'strategic', position: { x: 340, y: 120 }, data: { label: 'صياغة النسخة الأولى (Draft v1)', content: 'بناء المسودة القانونية ومراجعته تحت منظومة القواعد والتشريع.', colorClass: NODE_COLORS[4].class, shape: MindMapShape.RECTANGLE, iconName: 'filetext' } },
          { id: 'dr3', type: 'strategic', position: { x: 340, y: 380 }, data: { label: 'تفاوض الخصوم واعتماد المراجعة', content: 'تعديل الصياغة لتوافق إمضاء الشريك وتعميق بنود التعويض والمنازعة.', colorClass: NODE_COLORS[0].class, shape: MindMapShape.PILL, iconName: 'check' } }
        ],
        rfEdges: [
          { id: 'edr1', source: 'dr1', target: 'dr2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' } },
          { id: 'edr2', source: 'dr1', target: 'dr3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' } }
        ]
      }
    }
  ], [lang]);

  const [mindMaps, setMindMaps] = useState<MindMapData[]>(() => {
    const saved = localStorage.getItem('qanooni_mindmaps');
    if (saved) return JSON.parse(saved);
    return defaultMaps;
  });

  // Track template modifications on language switch
  useEffect(() => {
    const saved = localStorage.getItem('qanooni_mindmaps');
    if (!saved) {
      setMindMaps(defaultMaps);
    }
  }, [lang, defaultMaps]);

  useEffect(() => {
    try {
      localStorage.setItem('qanooni_mindmaps', JSON.stringify(mindMaps));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        console.warn("Storage quota exceeded, attempting automatic clean up of local version backups...");
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('qanooni_versions_')) {
              keysToRemove.push(k);
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
          localStorage.setItem('qanooni_mindmaps', JSON.stringify(mindMaps));
          
          addToast({
            type: 'warning',
            title: lang === 'ar' ? 'تنظيف التخزين تلقائياً' : 'Automated Storage Clean up',
            message: lang === 'ar' 
              ? 'تم تنظيف مساحة التخزين المؤقتة تلقائياً لحفظ هذا المخطط الاستراتيجي بنجاح.' 
              : 'Automatically cleaned temporary version backups to save this strategic layout.'
          });
        } catch (retryError) {
          addToast({
            type: 'error',
            title: lang === 'ar' ? 'خطأ بذاكرة التخزين المحلية' : 'Browser Storage Quota Exceeded',
            message: lang === 'ar' 
              ? 'مساحة تخزين المتصفح ممتلئة تماماً! يرجى حذف بعض المخططات الذهنية القديمة في المعرض لتتمكن من حفظ هذا العمل.' 
              : 'Browser local storage is entirely full! Please delete some old/unneeded mind maps in the gallery first.'
          });
        }
      } else {
        console.error("Failed to write to localStorage:", e);
      }
    }
  }, [mindMaps, lang, addToast]);

  const activeMap = useMemo(() => mindMaps.find(m => m.id === activeMapId), [mindMaps, activeMapId]);

  const handleCreateNew = () => {
    const id = `map-${Date.now()}`;
    const newMap: MindMapData = {
      id,
      title: lang === 'ar' ? 'مخطط ذهني قانوني جديد' : 'New Strategic Law Map',
      layoutType: MindMapLayoutType.MINDMAP,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'cases',
      data: {
        rfNodes: [
          {
            id: 'root',
            type: 'strategic',
            position: { x: 250, y: 150 },
            data: { 
              label: lang === 'ar' ? 'المحور الأساسي للمخطط' : 'Primary Strategic Axis', 
              content: lang === 'ar' ? 'اضغط تفريع أو أضف عقداً لربطها بذكاء اصطناعي تفصيلي.' : 'Build legal elements systematically.', 
              colorClass: NODE_COLORS[0].class,
              shape: MindMapShape.ROUNDED,
              iconName: 'scale',
              attachments: [],
              linkedTo: null
            },
          }
        ],
        rfEdges: []
      }
    };
    setMindMaps([newMap, ...mindMaps]);
    setActiveMapId(id);
  };

  const handleUpdateMap = (id: string, updates: Partial<MindMapData>) => {
    setMindMaps(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMap = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الخريطة مع جميع عقدها نهائياً؟' : 'Are you sure you want to completely erase this Mind Map?')) {
      setMindMaps(prev => prev.filter(m => m.id !== id));
    }
  };

  // Launch pre-configured templates
  const launchTemplate = (templateId: string) => {
    const found = defaultMaps.find(m => m.id === templateId);
    if (!found) return;
    const clonedId = `map-cloned-${Date.now()}`;
    const cloned: MindMapData = {
      ...found,
      id: clonedId,
      title: lang === 'ar' ? `${found.title} (نسخة معدلة)` : `${found.title} (Editable)`,
      createdAt: new Date().toISOString()
    };
    setMindMaps([cloned, ...mindMaps]);
    setActiveMapId(clonedId);
  };

  const filteredMaps = useMemo(() => {
    if (categoryFilter === 'all') return mindMaps;
    return mindMaps.filter(m => m.category === categoryFilter);
  }, [mindMaps, categoryFilter]);

  if (activeMapId && activeMap) {
    return (
      <ReactFlowProvider>
        <MindMapEditorComponent 
          onClose={() => setActiveMapId(null)} 
          initialData={activeMap}
          onSave={(data) => handleUpdateMap(activeMapId, { data, updatedAt: new Date().toISOString() })}
          lang={lang}
        />
      </ReactFlowProvider>
    );
  }

  const tabFilters = [
    { key: 'all', label: tGallery('all') },
    { key: 'cases', label: tGallery('cases') },
    { key: 'clients', label: tGallery('clients') },
    { key: 'contracts', label: tGallery('contracts') },
    { key: 'projects', label: tGallery('projects') },
    { key: 'employees', label: tGallery('employees') },
    { key: 'meetings', label: tGallery('meetings') },
    { key: 'departments', label: tGallery('departments') }
  ];

  return (
    <div className="h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col overflow-y-auto transition-colors duration-300 pt-8 px-6 pb-16" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#1e293b_1.5px,transparent_1.5px)] [background-size:28px_28px] opacity-40 pointer-events-none" />

      {/* Language Switch floating */}
      <div className="absolute top-6 left-6 z-10 flex gap-2">
        <button 
          onClick={toggleLanguage}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-black text-slate-705 dark:text-slate-300 shadow hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span>{lang === 'ar' ? 'English (EN)' : 'العربية (AR)'}</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col mt-4">
         {/* Title area */}
         <div className={`mb-10 relative z-10 ${lang === 'ar' ? 'text-right' : 'text-left'} max-w-4xl`}>
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4"
           >
             <Cpu className="w-7 h-7" />
           </motion.div>
           <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
             {tGallery('galleryTitle')}
           </h1>
           <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
             {tGallery('gallerySub')}
           </p>
         </div>

         {/* Category Navigator Toolbar */}
         <div className="mb-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center pb-2.5 z-10">
           <div className="flex flex-wrap gap-1.5">
             {tabFilters.map((tab) => (
               <button
                 key={tab.key}
                 onClick={() => setCategoryFilter(tab.key)}
                 className={`
                   px-4 h-9 rounded-xl text-xs font-black transition-all cursor-pointer
                   ${categoryFilter === tab.key 
                     ? 'bg-primary text-white shadow shadow-primary/25' 
                     : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200'}
                 `}
               >
                 {tab.label}
               </button>
             ))}
           </div>
           
           <Button 
             onClick={handleCreateNew}
             className="rounded-xl h-10 px-5 gap-1.5 font-bold text-xs"
           >
             <Plus className="w-4.5 h-4.5" />
             {tGallery('createNew')}
           </Button>
         </div>

         {/* Maps Display Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full relative z-10 flex-1">
            {/* Gallery Blank map launcher card */}
            <motion.div 
              whileHover={{ scale: 1.015 }}
              onClick={handleCreateNew}
              className="border-3 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white dark:hover:bg-slate-900 hover:border-primary-light transition-all shadow-sm group"
            >
               <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-90 shadow-inner">
                 <Plus className="w-7 h-7" />
               </div>
               <span className="text-md font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-805 dark:group-hover:text-white">
                 {tGallery('createNew')}
               </span>
            </motion.div>

            {filteredMaps.map((map) => (
              <motion.div 
                key={map.id}
                whileHover={{ y: -6 }}
                onClick={() => setActiveMapId(map.id)}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-150 dark:border-slate-850 shadow-sm hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between min-h-[220px] relative overflow-hidden text-right"
              >
                <div>
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-slate-850 text-white flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                      <FolderOpen className="w-5.5 h-5.5 text-primary" />
                    </div>
                    {/* Delete trigger */}
                    <button 
                      onClick={(e) => deleteMap(map.id, e)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-350 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">
                    {map.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 text-[9px] font-bold text-slate-400">
                    <span>{tGallery('createdOn')}: {new Date(map.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-US')}</span>
                    {map.updatedAt && <span>• {tGallery('lastUpdated')}: {new Date(map.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-US')}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5 mt-5">
                   <div className="flex items-center gap-1.5">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-black text-slate-400 uppercase">
                       {map.category || 'cases'}
                     </span>
                   </div>
                   <div className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-650 dark:text-slate-300">
                     {map.data?.rfNodes?.length || 0} {tGallery('nodesCount')}
                   </div>
                </div>
              </motion.div>
            ))}
         </div>

         {/* Templates Workspace catalog list section */}
         <div className="mt-16 text-right md:dir-rtl">
            <h2 className="text-xl font-black text-slate-800 dark:text-white mb-2 border-b border-slate-100 dark:border-slate-800 pb-3">{tGallery('quickTemplates')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {defaultMaps.map(temp => (
                <div 
                  key={temp.id}
                  onClick={() => launchTemplate(temp.id)}
                  className="bg-white/40 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary cursor-pointer transition-all flex flex-col justify-between hover:bg-white dark:hover:bg-slate-900 hover:shadow"
                >
                  <div>
                    <span className="text-[9px] bg-primary/15 text-primary-dark dark:text-primary font-black px-2 py-0.5 rounded uppercase font-mono">
                      {temp.category || 'Workflow'}
                    </span>
                    <h4 className="text-sm font-black text-slate-800 dark:text-white mt-2 leading-tight">
                      {temp.title}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                    <span className="text-[9px] text-slate-400 font-bold">{temp.data?.rfNodes?.length || 0} {tGallery('nodesCount')}</span>
                    <span className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      {lang === 'ar' ? 'تشغيل' : 'Launch'}
                      <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SmartMindMapPage;
