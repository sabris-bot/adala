
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { 
    CpuChipIcon, PlusCircleIcon, TrashIcon, LightBulbIcon, 
    PrinterIcon, DocumentTextIcon, SparklesIcon, 
    Squares2X2Icon, XMarkIcon, BoltIcon, CursorArrowRaysIcon,
    MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon, ArrowsPointingOutIcon, ArrowLeftIcon,
    AdjustmentsHorizontalIcon, AcademicCapIcon, BriefcaseIcon, 
    UserGroupIcon, CalendarDaysIcon, DocumentDuplicateIcon
} from '../constants';
import { MindMapData, MindMapNode, MindMapLayoutType, MindMapShape } from '../types';
import { mindMapLayoutOptions, nodeColorOptions, mindMapNodeIcons } from '../constants'; 
import { geminiService } from '../services/geminiService';

// --- Types & Constants ---
interface Template {
    id: string;
    title: string;
    icon: any;
    description: string;
    category: 'legal' | 'admin' | 'project';
}

const TEMPLATES: Template[] = [
    { id: 't1', title: 'تحليل دفوع قضائية', icon: <AcademicCapIcon />, description: 'تقسيم الدفوع الشكلية والموضوعية.', category: 'legal' },
    { id: 't2', title: 'هيكلة عقد تجاري', icon: <DocumentTextIcon />, description: 'تنظيم بنود العقد والالتزامات.', category: 'legal' },
    { id: 't3', title: 'خطة عمل إدارية', icon: <BriefcaseIcon />, description: 'توزيع المهام والمراحل الإدارية.', category: 'admin' },
    { id: 't4', title: 'شجرة الهيكل التنظيمي', icon: <UserGroupIcon />, description: 'تمثيل بصري لتدرج السلطات.', category: 'admin' },
];

// --- Sub-Components ---

const TopToolbar: React.FC<{
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
    onToggleSidebar: () => void;
    onExport: (type: 'pdf' | 'png') => void;
    currentLayout: MindMapLayoutType;
    onChangeLayout: (layout: MindMapLayoutType) => void;
    title: string;
}> = ({ onZoomIn, onZoomOut, onResetZoom, onToggleSidebar, onExport, currentLayout, onChangeLayout, title }) => (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] no-print transition-all">
        <div className="flex items-center gap-2 px-5 py-2 mr-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800">
            <Square2StackIcon className="w-4 h-4 text-indigo-600" />
            <h2 className="text-[11px] font-black text-slate-800 dark:text-white whitespace-nowrap uppercase tracking-widest">{title}</h2>
        </div>
        
        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full gap-0.5">
            <ToolbarButton onClick={onZoomIn} icon={<MagnifyingGlassPlusIcon className="w-4 h-4"/>} tooltip="تكبير" />
            <ToolbarButton onClick={onZoomOut} icon={<MagnifyingGlassMinusIcon className="w-4 h-4"/>} tooltip="تصغير" />
            <ToolbarButton onClick={onResetZoom} icon={<ArrowsPointingOutIcon className="w-4 h-4"/>} tooltip="ملائمة" />
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full gap-0.5">
            {mindMapLayoutOptions.map(opt => (
                <button 
                    key={opt.value}
                    onClick={() => onChangeLayout(opt.value)}
                    className={`py-2 px-4 rounded-full text-[9px] font-black transition-all ${currentLayout === opt.value ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        <div className="flex gap-1 pr-1">
            <button onClick={() => onExport('pdf')} className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                <PrinterIcon className="w-4 h-4" />
                <span>تصدير</span>
            </button>
            <button onClick={onToggleSidebar} className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

const Square2StackIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H4.125C3.504 3.75 3 4.254 3 4.875v8.25c0 .621.504 1.125 1.125 1.125h2.25M16.5 8.25h2.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125H11.625A1.125 1.125 0 0 1 10.5 17.625V15.75M16.5 8.25l-2.25 2.25m0 0H11.625A1.125 1.125 0 0 0 10.5 11.625v2.25m0 0L8.25 15.75" />
    </svg>
);

const ToolbarButton = ({ onClick, icon, tooltip }: { onClick: () => void, icon: any, tooltip: string }) => (
    <button 
        onClick={onClick}
        className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all group relative"
    >
        {icon}
        <span className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/90 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl backdrop-blur-sm">{tooltip}</span>
    </button>
);

const MiniMap: React.FC<{ nodes: MindMapNode[], activeMapId: string | null }> = ({ nodes }) => (
    <div className="absolute bottom-8 left-8 w-56 h-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.1)] z-40 hidden md:block group cursor-pointer transition-all hover:scale-105">
        <div className="absolute top-4 right-4 flex items-center gap-2 p-1.5 px-4 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-[pulse_2s_infinite]" />
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Live Radar</span>
        </div>
        <div className="p-8 w-full h-full opacity-20 flex items-center justify-center filter blur-[1px]">
            <div className="grid grid-cols-4 gap-2 transform rotate-[-8deg] scale-125">
               {nodes.slice(0, 12).map((n, i) => (
                   <div key={i} className={`w-4 h-4 rounded-md ${n.color.replace('bg-', 'bg-opacity-80 bg-')}`} />
               ))}
            </div>
        </div>
    </div>
);

// --- Main Node Renderer ---
const SmartNode: React.FC<{ 
    node: MindMapNode; 
    onSelect: (node: MindMapNode) => void; 
    onAddChild: (parentId: string) => void;
    isSelected: boolean;
}> = ({ node, onSelect, onAddChild, isSelected }) => {
    const Icon = mindMapNodeIcons[node.iconName || 'default'] || mindMapNodeIcons.default;
    
    return (
        <motion.div 
            layout
            onClick={(e) => { e.stopPropagation(); onSelect(node); }}
            className={`relative group cursor-grab active:cursor-grabbing p-5 min-w-[320px] rounded-[2rem] bg-white dark:bg-slate-950 border-2 transition-all duration-500 ${isSelected ? 'border-indigo-500 ring-[12px] ring-indigo-500/5 shadow-[0_40px_80px_rgba(99,102,241,0.15)] z-50' : 'border-slate-100 dark:border-slate-900 hover:border-indigo-300 shadow-[0_20px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)]'}`}
        >
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl ${node.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight truncate">{node.label}</h3>
                    <div className="flex gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 dark:bg-indigo-900" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                </div>
                <div className="flex gap-1.5 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
                        className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 shadow-lg active:scale-90 transition-all"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-50 dark:border-slate-800/50">
                {node.content}
            </p>

            <div className="mt-5 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1, 2].map(i => (
                             <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 text-[9px] flex items-center justify-center font-black text-slate-400">MK</div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">+4</span>
                 </div>
                 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${node.parentId === null ? 'bg-indigo-600 text-white border-none shadow-[0_5px_15px_rgba(79,70,229,0.3)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/50 dark:border-slate-700/50'}`}>
                    <Squares2X2Icon className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">
                        {node.parentId === null ? 'MASTER HUB' : `${node.childrenIds.length} BRANCHES`}
                    </span>
                 </div>
            </div>

            {/* Micro-interaction: Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 rounded-tr-[2rem] rounded-bl-[1rem] opacity-20 ${node.color}`} />
        </motion.div>
    );
};

// --- Tree Layout Component ---
const CanvasTree: React.FC<{
    nodes: MindMapNode[];
    nodeId: string;
    onSelect: (node: MindMapNode) => void;
    onAddChild: (parentId: string) => void;
    selectedNodeId: string | null;
    layout: MindMapLayoutType;
}> = ({ nodes, nodeId, onSelect, onAddChild, selectedNodeId, layout }) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const isHorizontal = layout === MindMapLayoutType.TREE_HORIZONTAL || layout === MindMapLayoutType.FLOWCHART_HORIZONTAL;

    return (
        <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center gap-48 relative`}>
            <SmartNode 
                node={node} 
                onSelect={onSelect} 
                onAddChild={onAddChild} 
                isSelected={node.id === selectedNodeId} 
             />
            
            {node.childrenIds.length > 0 && (
                <div className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-16 relative items-center`}>
                    <svg className={`absolute ${isHorizontal ? '-right-48 w-48 h-full top-0' : '-top-48 w-full h-48 left-0'} pointer-events-none z-0 overflow-visible`}>
                       {node.childrenIds.map((childId, idx) => {
                           const total = node.childrenIds.length;
                           const offset = (idx - (total - 1) / 2) * (isHorizontal ? 220 : 380);
                           
                           return (
                               <path 
                                  key={childId}
                                  d={isHorizontal 
                                    ? `M 0 50% Q 96 50%, 96 ${50 + (offset / 10)}% T 192 ${50 + (offset / 4)}%`
                                    : `M 50% 0 Q 50% 96, ${50 + (offset / 10)}% 96 T ${50 + (offset / 4)}% 192`
                                  }
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  className="text-indigo-100 dark:text-slate-800 transition-all duration-700 opacity-60 group-hover:opacity-100"
                               />
                           );
                       })}
                    </svg>

                    {node.childrenIds.map(childId => (
                        <CanvasTree
                            key={childId}
                            nodes={nodes}
                            nodeId={childId}
                            onSelect={onSelect}
                            onAddChild={onAddChild}
                            selectedNodeId={selectedNodeId}
                            layout={layout}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
const SmartMindMapPage: React.FC = () => {
    const [mindMaps, setMindMaps] = useState<MindMapData[]>([]);
    const [activeMapId, setActiveMapId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [aiInput, setAiInput] = useState('');
    
    const canvasRef = useRef<HTMLDivElement>(null);

    const activeMap = useMemo(() => mindMaps.find(m => m.id === activeMapId), [mindMaps, activeMapId]);
    const rootNode = useMemo(() => activeMap?.nodes.find(n => n.parentId === null), [activeMap]);

    const handleAddNode = useCallback((parentId: string, label = 'تفرع جديد', content = 'سجل تفاصيل النقطة هنا...') => {
        if (!activeMapId) return;
        const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newNode: MindMapNode = {
            id: newId,
            label,
            content,
            parentId: parentId,
            childrenIds: [],
            color: 'bg-indigo-500',
            iconName: 'info',
            shape: MindMapShape.ROUNDED
        };

        setMindMaps(prev => prev.map(m => m.id === activeMapId ? {
            ...m,
            nodes: [...m.nodes, newNode].map(n => n.id === parentId ? {...n, childrenIds: [...n.childrenIds, newId]} : n)
        } : m));
        setSelectedNode(newNode);
    }, [activeMapId]);

    const handleUpdateNode = (updatedFields: Partial<MindMapNode>) => {
        if (!activeMapId || !selectedNode) return;
        setMindMaps(prev => prev.map(m => m.id === activeMapId ? {
            ...m,
            nodes: m.nodes.map(n => n.id === selectedNode.id ? { ...n, ...updatedFields } : n)
        } : m));
        setSelectedNode(prev => prev ? { ...prev, ...updatedFields } : null);
    };

    const handleAiGenerate = async () => {
        if (!aiInput || !selectedNode || !activeMapId) return;
        setIsLoading(true);
        try {
            const prompt = `بصفتك مستشاراً قانونياً وإدارياً خبيراً، قم بتحليل النقطة التالية من خريطة ذهنية واقترح 3 تفرعات منطقية جديدة لها باللغة العربية.
            النقطة الحالية: ${selectedNode.label}
            المضمون الحالى: ${selectedNode.content}
            الهدف المطلوب: ${aiInput}
            أجب بصيغة JSON حصراً كالتالي:
            { "suggestions": [ { "label": "عنوان الفرع", "content": "شرح مختصر" }, ... ] }`;

            const response = await geminiService.generateContent(prompt, "أنت مساعد ذكي متخصص في الاستراتيجيات القانونية والإدارية.");
            const data = JSON.parse(response);

            if (data.suggestions && Array.isArray(data.suggestions)) {
                data.suggestions.forEach((s: any) => {
                    handleAddNode(selectedNode.id, s.label, s.content);
                });
            }
            
            setIsLoading(false);
            setAiInput('');
        } catch (e) {
            console.error("AI Error:", e);
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#FDFDFF] dark:bg-slate-950 flex flex-col overflow-hidden transition-colors duration-700" dir="rtl">
            <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]"></div>
            </div>

            <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between z-50 shadow-sm shrink-0 no-print">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <CpuChipIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none">محرك الاستراتيجيات الذهني</h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Legal Strategy & Mind Mapping</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Intelligence</span>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl px-5 border-slate-200 dark:border-slate-800 text-xs font-black" onClick={() => setActiveMapId(null)}>المكتبة</Button>
                    <Button className="rounded-xl px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xl" onClick={() => {
                        const newId = `map-${Date.now()}`;
                        const newMap: MindMapData = {
                            id: newId,
                            title: 'مشروع استراتيجي جديد',
                            layoutType: MindMapLayoutType.TREE_HORIZONTAL,
                            createdAt: new Date().toISOString(),
                            nodes: [{ id: `${newId}-root`, label: 'المحور الأساسي', content: 'حدد الهدف الاستراتيجي أو القضية المركزية هنا...', parentId: null, childrenIds: [], color: 'bg-indigo-600', iconName: 'lightbulb', shape: MindMapShape.ROUNDED }],
                            edges: []
                        };
                        setMindMaps([newMap, ...mindMaps]);
                        setActiveMapId(newId);
                    }}>إنشاء خريطة</Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!activeMapId ? (
                            <motion.div 
                                key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="h-full overflow-y-auto p-12 custom-scrollbar flex flex-col items-center"
                            >
                                <div className="max-w-7xl w-full">
                                    <div className="flex justify-between items-end mb-12">
                                        <div>
                                            <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tighter">المخططات الاستراتيجية</h2>
                                            <p className="text-slate-400 font-medium">نظم أفكارك القانونية والإدارية بأسلوب بصري تفاعلي.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <StatMini label="الخرائط" value={mindMaps.length} color="indigo" />
                                            <StatMini label="العناصر" value={mindMaps.reduce((a,b)=>a+b.nodes.length, 0)} color="emerald" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                                        {mindMaps.map((map, i) => (
                                            <MapGalleryCard key={map.id} map={map} index={i} onClick={() => setActiveMapId(map.id)} />
                                        ))}
                                        
                                        <motion.div 
                                            whileHover={{ scale: 1.02 }}
                                            className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all group"
                                            onClick={() => {
                                                const newId = `map-${Date.now()}`;
                                                const newMap: MindMapData = {
                                                    id: newId,
                                                    title: 'خريطة أفكار',
                                                    layoutType: MindMapLayoutType.TREE_HORIZONTAL,
                                                    createdAt: new Date().toISOString(),
                                                    nodes: [{ id: `${newId}-root`, label: 'النواة المركزية', content: 'ابدأ بصياغة المحور الأساسي...', parentId: null, childrenIds: [], color: 'bg-indigo-600', iconName: 'lightbulb', shape: MindMapShape.ROUNDED }],
                                                    edges: []
                                                };
                                                setMindMaps([newMap, ...mindMaps]);
                                                setActiveMapId(newId);
                                            }}
                                        >
                                            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-90">
                                                <PlusCircleIcon className="w-10 h-10" />
                                            </div>
                                            <span className="text-lg font-black text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">بناء مسودة جديدة</span>
                                        </motion.div>
                                    </div>

                                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-8 pr-2">نماذج انطلاق سريعة</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {TEMPLATES.map(t => (
                                            <TemplateCard key={t.id} template={t} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full relative overflow-hidden"
                            >
                                <TopToolbar 
                                    title={activeMap?.title || ''}
                                    currentLayout={activeMap?.layoutType || MindMapLayoutType.TREE_HORIZONTAL}
                                    onChangeLayout={(l) => setMindMaps(prev => prev.map(m => m.id === activeMapId ? {...m, layoutType: l} : m))}
                                    onZoomIn={() => setZoomLevel(z => Math.min(z + 0.15, 3))}
                                    onZoomOut={() => setZoomLevel(z => Math.max(z - 0.15, 0.2))}
                                    onResetZoom={() => setZoomLevel(1)}
                                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                                    onExport={() => window.print()}
                                />

                                <div className="h-full overflow-auto cursor-grab active:cursor-grabbing scrollbar-none p-[800px]" ref={canvasRef}>
                                    <motion.div drag dragConstraints={canvasRef} style={{ scale: zoomLevel, transformOrigin: 'center' }} className="flex items-center justify-center min-w-max min-h-max py-96 px-96">
                                        {activeMap && rootNode && (
                                            <CanvasTree 
                                                nodes={activeMap.nodes}
                                                nodeId={rootNode.id}
                                                onSelect={setSelectedNode}
                                                onAddChild={handleAddNode}
                                                selectedNodeId={selectedNode?.id || null}
                                                layout={activeMap.layoutType}
                                            />
                                        )}
                                    </motion.div>
                                </div>

                                <MiniMap nodes={activeMap?.nodes || []} activeMapId={activeMapId} />

                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-3xl px-8 no-print">
                                    <div className="bg-slate-900/98 backdrop-blur-3xl border border-white/5 rounded-full p-2.5 shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg overflow-hidden relative active:scale-95 transition-transform cursor-pointer">
                                            <SparklesIcon className="w-6 h-6 relative z-10" />
                                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent)]" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={aiInput}
                                            onChange={e => setAiInput(e.target.value)}
                                            placeholder={selectedNode ? `توسيع النقطة: "${selectedNode.label}"...` : "اختر نقطة لتوسيعها بالذكاء الاصطناعي..."}
                                            className="flex-1 bg-transparent border-none text-white text-sm font-bold placeholder:text-slate-500 focus:ring-0 px-2"
                                            onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
                                        />
                                        <button 
                                            onClick={handleAiGenerate}
                                            disabled={isLoading || !aiInput || !selectedNode}
                                            className="px-8 h-12 bg-white text-slate-900 rounded-full text-xs font-black hover:bg-indigo-50 transition-all disabled:opacity-30 flex items-center gap-2 shadow-xl"
                                        >
                                            {isLoading ? 'جاري التفكير...' : 'تنفيذ التوسيع'}
                                            <BoltIcon className="w-4 h-4 text-indigo-600" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <AnimatePresence>
                    {activeMapId && isSidebarOpen && (
                        <motion.aside initial={{ x: 450 }} animate={{ x: 0 }} exit={{ x: 450 }} className="w-[450px] bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-40 shadow-[-50px_0_100px_rgba(0,0,0,0.05)] flex flex-col no-print">
                            <div className="p-8 pb-4 flex justify-between items-center">
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 dark:text-white pr-1">لوحة التحكم الفني</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Strategic Workspace</p>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"><XMarkIcon className="w-6 h-6"/></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                                {selectedNode ? (
                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">عنوان العقدة</label>
                                            <input 
                                                type="text" 
                                                value={selectedNode.label}
                                                onChange={e => handleUpdateNode({ label: e.target.value })}
                                                className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl px-8 font-black text-lg text-slate-800 dark:text-white focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">التفصيل الإجرائي</label>
                                            <textarea 
                                                value={selectedNode.content}
                                                onChange={e => handleUpdateNode({ content: e.target.value })}
                                                className="w-full h-40 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 text-sm font-bold leading-relaxed resize-none focus:border-indigo-500/50 focus:ring-8 focus:ring-indigo-500/5 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">التصنيف اللوني</label>
                                            <div className="grid grid-cols-5 gap-4 px-2">
                                                {nodeColorOptions.map(opt => (
                                                    <button 
                                                        key={opt.value}
                                                        onClick={() => handleUpdateNode({ color: opt.value })}
                                                        className={`w-12 h-12 rounded-2xl transition-all ${opt.value} ${selectedNode.color === opt.value ? 'ring-8 ring-indigo-500/10 border-4 border-white dark:border-slate-900 scale-125 shadow-2xl' : 'hover:scale-110 opacity-40 hover:opacity-100'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">ربط الكيانات</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <IntegrationButton icon={<BriefcaseIcon/>} label="ملف قضية" />
                                                <IntegrationButton icon={<DocumentTextIcon/>} label="بنود عقد" />
                                                <IntegrationButton icon={<UserGroupIcon/>} label="فريق مختص" />
                                                <IntegrationButton icon={<CalendarDaysIcon/>} label="جدولة" />
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                            <button onClick={() => {
                                                if (selectedNode.parentId === null) return;
                                                setMindMaps(prev => prev.map(m => m.id === activeMapId ? {
                                                    ...m,
                                                    nodes: m.nodes.filter(n => n.id !== selectedNode.id).map(n => n.id === selectedNode.parentId ? {...n, childrenIds: n.childrenIds.filter(id => id !== selectedNode.id)} : n)
                                                } : m));
                                                setSelectedNode(null);
                                            }} className="w-full rounded-2xl h-16 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-black flex items-center justify-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all active:scale-95 border border-rose-100 dark:border-rose-900/30">
                                                <TrashIcon className="w-5 h-5"/>
                                                إزالة العقدة من الهيكل
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 text-center">
                                        <div className="w-24 h-24 rounded-[3rem] bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 flex items-center justify-center mb-8 shadow-inner animate-[bounce_3s_infinite]">
                                            <CursorArrowRaysIcon className="w-10 h-10" />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
                                            يرجى اختيار عنصر<br/>لتخصيص بيانات الاستراتيجية
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Helper Functions ---

const StatMini = ({ label, value, color }: { label: string, value: any, color: string }) => (
    <div className={`px-10 py-5 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center group transition-all hover:border-indigo-300 hover:shadow-xl`}>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</span>
        <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter group-hover:scale-110 transition-transform">{value}</span>
    </div>
);

const MapGalleryCard = ({ map, index, onClick }: { map: MindMapData, index: number, onClick: () => void }) => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -12, scale: 1.02 }} onClick={onClick} className="bg-white dark:bg-slate-950 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-900 shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_40px_80px_rgba(0,0,0,0.3)] transition-all cursor-pointer group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000" />
        <div className="flex justify-between items-start mb-10 relative">
            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center transform group-hover:rotate-[15deg] transition-transform duration-500 shadow-xl shadow-slate-900/20">
                <Square2StackIcon className="w-8 h-8" />
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest dark:text-slate-700">#{index + 1}</div>
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 tracking-tighter transition-colors group-hover:text-indigo-600">{map.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-3 mb-10 opacity-70 italic pr-1">{map.nodes[0]?.content}</p>
        <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-900 mt-auto">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{map.nodes.length} Elements</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform scale-0 group-hover:scale-100">
                <ArrowLeftIcon className="w-5 h-5 rotate-180" />
            </div>
        </div>
    </motion.div>
);

const TemplateCard = ({ template }: { template: Template }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-pointer group shadow-sm hover:shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center mb-6 shadow-sm transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-12">
            {React.cloneElement(template.icon, { className: 'w-7 h-7' })}
        </div>
        <h4 className="text-md font-black text-slate-800 dark:text-white mb-3 tracking-tighter leading-tight">{template.title}</h4>
        <p className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-2 pr-1">{template.description}</p>
    </div>
);

const IntegrationButton = ({ icon, label }: { icon: any, label: string }) => (
    <button className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 border-2 border-transparent hover:border-indigo-500/30 transition-all gap-3 group shadow-sm hover:shadow-xl active:scale-95">
        <div className="text-slate-300 group-hover:text-indigo-600 transition-all transform group-hover:scale-125">
            {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' } as any)}
        </div>
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-tighter">{label}</span>
    </button>
);

export default SmartMindMapPage;
