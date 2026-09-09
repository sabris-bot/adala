import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, Plus, FolderOpen, Trash2, Copy, Sparkles, 
  Search, Layers, Scale, Users, FileText, Briefcase, 
  User, Calendar, UserCheck, ShieldCheck, Clock, 
  ChevronLeft, ArrowRight, GitBranch, Workflow, Network,
  Building, Landmark, ShieldAlert, Gavel
} from 'lucide-react';
import { MindMapData, MindMapLayoutType, MindMapShape } from '../../../types';
import Button from '../../../components/ui/Button';
import { KUWAIT_LEGAL_TEMPLATES } from '../data/defaultTemplates';
import { NODE_COLOR_PALETTES } from '../utils/themeConstants';
import { MindMapAiGeneratorModal } from './MindMapAiGeneratorModal';
import { Node, Edge } from '@xyflow/react';

interface MindMapGalleryProps {
  mindMaps: MindMapData[];
  onOpenMap: (id: string) => void;
  onCreateNew: () => void;
  onDeleteMap: (id: string) => void;
  onCloneMap: (id: string) => void;
  onLaunchTemplate: (template: MindMapData) => void;
  onApplyAiGeneratedMap: (title: string, nodes: Node[], edges: Edge[], layout: MindMapLayoutType) => void;
  lang: string;
}

export const MindMapGallery: React.FC<MindMapGalleryProps> = ({
  mindMaps,
  onOpenMap,
  onCreateNew,
  onDeleteMap,
  onCloneMap,
  onLaunchTemplate,
  onApplyAiGeneratedMap,
  lang
}) => {
  const isAr = lang === 'ar';
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const tabFilters = [
    { key: 'all', label: 'جميع المخططات', icon: Layers },
    { key: 'cases', label: 'قضايا ومرافعات', icon: Scale },
    { key: 'contracts', label: 'عقود وتدقيق', icon: FileText },
    { key: 'clients', label: 'عملاء وشركاء', icon: Users },
    { key: 'departments', label: 'إدارات وهيكل تنظيمي', icon: Building },
    { key: 'enforcement', label: 'تنفيذ وتحصيل', icon: ShieldAlert }
  ];

  // Filter maps
  const filteredMaps = useMemo(() => {
    let list = mindMaps;
    if (categoryFilter !== 'all') {
      list = list.filter(m => m.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        (m.title || '').toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [mindMaps, categoryFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let mapsCount = mindMaps.length;
    let nodesCount = 0;
    let urgentCount = 0;

    mindMaps.forEach(m => {
      const rfnodes = m.data?.rfNodes || [];
      nodesCount += rfnodes.length;
      rfnodes.forEach((n: any) => {
        if (n.data?.priority === 'high') urgentCount++;
      });
    });

    return { mapsCount, nodesCount, urgentCount };
  }, [mindMaps]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-8 px-6 pb-20 transition-colors" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Background Subtle Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col relative z-10">
        
        {/* Main Header & Hero */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                <GitBranch className="w-6 h-6" />
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-mono">
                ADALA SMART MIND MAPS v3.0
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
              الخرائط الذهنية والاستراتيجية القانونية
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              صمم، فرع ونظم استراتيجيات القضايا، العقود والعمليات الإدارية بدعم الذكاء الاصطناعي وبمحاذاة القانون الكويتي مع التصدير والطباعة الذكية.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-102 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>توليد بالذكاء الاصطناعي (AI)</span>
            </button>

            <Button
              onClick={onCreateNew}
              className="h-11 px-5 rounded-2xl gap-2 font-black text-xs bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-950 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء مخطط ذهني جديد</span>
            </Button>
          </div>
        </div>

        {/* Quick KPI Stat Metric Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-0.5">إجمالي المخططات النشطة</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.mapsCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-0.5">إجمالي العقد والمحاور</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {stats.nodesCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
              <Network className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 block mb-0.5">محاور استراتيجية عاجلة</span>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                {stats.urgentCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Toolbar: Category Tabs + Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {tabFilters.map((tab) => {
              const Icon = tab.icon;
              const active = categoryFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setCategoryFilter(tab.key)}
                  className={`
                    flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-black transition-all cursor-pointer
                    ${active 
                      ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'}
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المخططات المحفوظة..."
              className="w-full text-xs font-bold pr-10 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-3xs"
            />
          </div>
        </div>

        {/* Saved Mind Maps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Create New Card */}
          <motion.div 
            whileHover={{ scale: 1.015 }}
            onClick={onCreateNew}
            className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white dark:hover:bg-slate-900/60 hover:border-amber-500 transition-all shadow-xs group min-h-[220px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all transform group-hover:rotate-90 shadow-inner">
              <Plus className="w-7 h-7" />
            </div>
            <span className="text-sm font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
              إنشاء مخطط ذهني جديد
            </span>
          </motion.div>

          {/* Render Saved Maps */}
          {filteredMaps.map((map) => (
            <motion.div 
              key={map.id}
              whileHover={{ y: -4 }}
              onClick={() => onOpenMap(map.id)}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between min-h-[220px] relative overflow-hidden"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-amber-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  
                  {/* Actions: Clone & Delete */}
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => onCloneMap(map.id)}
                      title="نسخ المخطط"
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteMap(map.id)}
                      title="حذف المخطط"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2 group-hover:text-amber-500 transition-colors line-clamp-2">
                  {map.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-bold block">
                  أنشئت في: {new Date(map.createdAt).toLocaleDateString('ar-KW')}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">
                    {map.category || 'cases'}
                  </span>
                </div>
                <div className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl text-slate-700 dark:text-slate-300 font-mono">
                  {map.data?.rfNodes?.length || 0} عقدة
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ready Kuwaiti Legal Templates Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Gavel className="w-5 h-5 text-amber-500" />
                <span>قوالب العمل الإداري والقضائي الكويتي الجاهزة</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                نماذج استراتيجية مبنية ومطابقة لقانون المرافعات، القانون المدني والتجاري والأحوال الشخصية الكويتي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {KUWAIT_LEGAL_TEMPLATES.map((tpl) => (
              <div 
                key={tpl.id}
                onClick={() => onLaunchTemplate(tpl)}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 cursor-pointer transition-all flex flex-col justify-between hover:shadow-xl group"
              >
                <div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono mb-3 inline-block">
                    {tpl.category === 'cases' ? 'مرافعات وقضايا' : tpl.category === 'contracts' ? 'عقود تجارية' : 'هيكل تنظيمي'}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-amber-500 transition-colors mb-2">
                    {tpl.title}
                  </h4>
                  {tpl.data?.description && (
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {tpl.data.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <span className="text-[10px] text-slate-400 font-bold font-mono">
                    {tpl.data?.rfNodes?.length || 0} عقدة
                  </span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>تشغيل القالب</span>
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Mind Map Generator Modal */}
      {isAiModalOpen && (
        <MindMapAiGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onApplyGeneratedMap={onApplyAiGeneratedMap}
        />
      )}
    </div>
  );
};
