import React from 'react';
import { 
  Sparkles, Plus, Printer, Download, Search, Layout, 
  ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, Save, X, 
  GitBranch, Clock, Network, Layers, GitMerge, FileSpreadsheet,
  Workflow, CheckCircle, ChevronLeft, ArrowRight, Palette, Sliders
} from 'lucide-react';
import { MindMapLayoutType } from '../../../types';
import Button from '../../../components/ui/Button';

interface MindMapToolbarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  layoutType: MindMapLayoutType;
  onLayoutChange: (layout: MindMapLayoutType) => void;
  onAutoLayout: () => void;
  onAddNode: () => void;
  onOpenAiGenerator: () => void;
  onOpenPrintExport: (mode: 'print' | 'export') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onClose: () => void;
  nodeCount: number;
  lastSavedText?: string;
  lang: string;
}

export const MindMapToolbar: React.FC<MindMapToolbarProps> = ({
  title,
  onTitleChange,
  layoutType,
  onLayoutChange,
  onAutoLayout,
  onAddNode,
  onOpenAiGenerator,
  onOpenPrintExport,
  searchQuery,
  onSearchChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onFitView,
  onZoomIn,
  onZoomOut,
  onClose,
  nodeCount,
  lastSavedText,
  lang
}) => {
  const isAr = lang === 'ar';

  const layoutOptions = [
    { type: MindMapLayoutType.DECISION_TREE, label: 'شجرة قرارات (Tree)', icon: GitBranch },
    { type: MindMapLayoutType.FLOWCHART_HORIZONTAL, label: 'تدفق عمليات (Flowchart)', icon: Workflow },
    { type: MindMapLayoutType.MINDMAP, label: 'خريطة مركزية (Radial)', icon: Network },
    { type: MindMapLayoutType.ORGANIZATION_CHART, label: 'هيكل تنظيمي (Org)', icon: Layers },
    { type: MindMapLayoutType.TIMELINE, label: 'تسلسل زمني (Timeline)', icon: Clock }
  ];

  return (
    <div className="absolute top-4 inset-x-4 z-40 flex flex-col gap-2 pointer-events-none" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Primary Top Bar */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2.5 px-4 shadow-xl flex flex-wrap items-center justify-between gap-3 pointer-events-auto transition-all">
        
        {/* Left Area: Close Button + Editable Map Title */}
        <div className="flex items-center gap-3 min-w-[240px]">
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-3xs"
            title="الخروج والعودة للمعرض"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
          </button>

          <div className="flex flex-col">
            <input 
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="text-sm font-extrabold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-amber-500 focus:outline-none px-1 py-0.5 rounded transition-all max-w-[280px]"
              placeholder="عنوان المخطط القانوني..."
            />
            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold px-1">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                {lastSavedText || 'محفوظ تلقائياً'}
              </span>
              <span>•</span>
              <span className="font-mono">{nodeCount} عقدة</span>
            </div>
          </div>
        </div>

        {/* Center Area: Diagram Style Layout Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto max-w-full">
          {layoutOptions.map((opt) => {
            const Icon = opt.icon;
            const active = layoutType === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => onLayoutChange(opt.type)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap
                  ${active 
                    ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-sm scale-102' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'}
                `}
                title={opt.label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Area: Search, AI Generator, Node Add, Print & Export */}
        <div className="flex items-center gap-2">
          {/* Live Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="بحث في المخطط..."
              className="w-36 focus:w-52 transition-all duration-300 text-xs font-bold pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* AI Generator Button */}
          <button 
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 hover:scale-102 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>توليد بالذكاء الاصطناعي</span>
          </button>

          {/* Add Node Button */}
          <Button 
            onClick={onAddNode}
            className="h-9 px-3.5 text-xs font-black rounded-xl gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عقدة</span>
          </Button>

          {/* Auto Align Layout Button */}
          <button 
            onClick={onAutoLayout}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="إعادة الترتيب التلقائي الذكي"
          >
            <Layout className="w-4 h-4" />
          </button>

          {/* Print & Export Actions */}
          <div className="flex items-center gap-1 border-r border-slate-200 dark:border-slate-800 pr-2 mr-1">
            <button 
              onClick={() => onOpenPrintExport('print')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="طباعة ذكية محسنة (A3/A4 Landscape)"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onOpenPrintExport('export')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="تصدير المخطط (PNG / SVG / PDF / تقرير نصي)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Viewport Navigation Bar */}
      <div className="flex items-center justify-between pointer-events-none mt-auto">
        {/* Undo / Redo Bar */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-1 shadow-lg flex items-center gap-1 pointer-events-auto">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 transition-colors"
            title="تراجع (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 transition-colors"
            title="إعادة (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Pan & Zoom Controls */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-1 shadow-lg flex items-center gap-1 pointer-events-auto">
          <button 
            onClick={onZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={onZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={onFitView}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="ملاءمة الشاشة بالكامل"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
