
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
  FileImage, FileDown, FileJson, FileType, FileCode
} from 'lucide-react';

import { 
  MindMapData, 
  MindMapNode, 
  MindMapLayoutType, 
  MindMapShape 
} from '../types';
import { geminiService } from '../services/geminiService';
import Button from '../components/ui/Button';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';

// --- Default Data & Constants ---
const NODE_COLORS = [
  { name: 'Teal', class: 'bg-[#00796B]', hex: '#00796B' },
  { name: 'Indigo', class: 'bg-[#4F46E5]', hex: '#4F46E5' },
  { name: 'Rose', class: 'bg-[#E11D48]', hex: '#E11D48' },
  { name: 'Amber', class: 'bg-[#D97706]', hex: '#D97706' },
  { name: 'Emerald', class: 'bg-[#059669]', hex: '#059669' },
  { name: 'Slate', class: 'bg-[#475569]', hex: '#475569' },
  { name: 'Violet', class: 'bg-[#7C3AED]', hex: '#7C3AED' },
  { name: 'Sky', class: 'bg-[#0284C7]', hex: '#0284C7' },
];

const INITIAL_NODES: Node[] = [
  {
    id: 'root',
    type: 'strategic',
    position: { x: 0, y: 0 },
    data: { 
      label: 'المحور الاستراتيجي الأساسي', 
      content: 'ابدأ بصياغة الهدف أو القضية المركزية هنا لتوسيع آفاق القضية.', 
      color: 'bg-[#00796B]',
      icon: 'lightbulb'
    },
  },
];

// --- Custom Components ---

// 1. Strategic Node component
const StrategicNode = ({ data, selected }: { data: any, selected: boolean }) => {
  return (
    <div className={`
      relative px-6 py-5 rounded-[2rem] bg-white dark:bg-slate-900 border-2 transition-all duration-300
      ${selected 
        ? 'border-primary shadow-[0_20px_50px_rgba(0,121,107,0.2)] ring-8 ring-primary/5' 
        : 'border-slate-100 dark:border-slate-800 shadow-xl hover:border-primary-light/50'}
      min-w-[280px] group
    `}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary border-2 border-white dark:border-slate-900" />
      
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-12 h-12 rounded-2xl ${data.color || 'bg-primary'} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight truncate">{data.label}</h3>
          <div className="flex gap-1 mt-1 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed line-clamp-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
        {data.content}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 text-[8px] flex items-center justify-center font-black text-slate-400">MK</div>
          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 bg-slate-100 dark:bg-slate-800 text-[8px] flex items-center justify-center font-black text-slate-400">AA</div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
          <Layers className="w-3 h-3" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Strategic Unit</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary border-2 border-white dark:border-slate-900" />
      
      {/* Selection Glow */}
      {selected && (
        <div className="absolute inset-0 -z-10 bg-primary/5 blur-2xl rounded-[2rem] animate-pulse" />
      )}
    </div>
  );
};

const nodeTypes = {
  strategic: StrategicNode,
};

// --- Main Inner Component (to use hooks within Provider) ---
const MindMapEditor: React.FC<{ 
  onClose: () => void;
  initialData?: MindMapData;
  onSave: (data: any) => void;
}> = ({ onClose, initialData, onSave }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData ? (initialData.data?.rfNodes || INITIAL_NODES) : INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData ? (initialData.data?.rfEdges || []) : []);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  
  // Undo/Redo State
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const { zoomIn, zoomOut, setViewport, fitView, getNodes, getEdges } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({ rfNodes: nodes, rfEdges: edges });
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges, onSave]);

  // History logic
  const takeSnapshot = useCallback(() => {
    const snapshot = { nodes, edges };
    setHistory(prev => [...prev.slice(0, historyIndex + 1), snapshot].slice(-20)); // Keep last 20
    setHistoryIndex(prev => prev + 1);
  }, [nodes, edges, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'smoothstep', 
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#00796B' },
        style: { strokeWidth: 2, stroke: '#00796B' }
      }, eds));
    },
    [setEdges, takeSnapshot]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
    setIsSidebarOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const addNode = useCallback(() => {
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'strategic',
      position: { x: Math.random() * 400 - 200, y: Math.random() * 400 - 200 },
      data: { 
        label: 'عنوان جديد', 
        content: 'سجل التفاصيل هنا...', 
        color: 'bg-[#4F46E5]',
        icon: 'plus'
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  const addNeighborNode = useCallback((sourceNode: Node) => {
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'strategic',
      position: { x: sourceNode.position.x, y: sourceNode.position.y + 250 },
      data: { 
        label: 'تفرع جديد', 
        content: 'سجل المسار الجديد هنا...', 
        color: sourceNode.data.color || 'bg-[#00796B]',
        icon: 'plus'
      },
    };
    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => addEdge({
      id: `edge-${sourceNode.id}-${id}`,
      source: sourceNode.id,
      target: id,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#00796B' },
      style: { strokeWidth: 2, stroke: '#00796B' }
    }, eds));
  }, [setNodes, setEdges]);

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) => 
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };

  const deleteNode = (id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNode(null);
  };

  const handleAiExpand = async () => {
    if (!selectedNode || !aiInput) return;
    setAiLoading(true);
    try {
      const prompt = `بصفتك مستشاراً قانونياً وإدارياً خبيراً، قم بتحليل النقطة التالية من خريطة ذهنية واقترح 3 تفرعات منطقية جديدة لها باللغة العربية.
      العنصر المختار: ${selectedNode.data.label}
      المحتوى: ${selectedNode.data.content}
      التوجه المطلوب: ${aiInput}
      أجب بصيغة JSON حصراً كالتالي:
      { "suggestions": [ { "label": "عنوان الفرع", "content": "شرح مختصر وعميق" }, ... ] }`;

      const response = await geminiService.generateContent(prompt, "أنت مساعد استراتيجي في منظومة قانونية متكاملة.");
      const data = JSON.parse(response);

      if (data.suggestions && Array.isArray(data.suggestions)) {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];
        
        data.suggestions.forEach((s: any, i: number) => {
          const id = `ai-node-${Date.now()}-${i}`;
          newNodes.push({
            id,
            type: 'strategic',
            position: { x: selectedNode.position.x + (i - 1) * 350, y: selectedNode.position.y + 300 },
            data: { 
              label: s.label, 
              content: s.content, 
              color: 'bg-[#7C3AED]',
              icon: 'sparkles'
            },
          });
          newEdges.push({
            id: `edge-${selectedNode.id}-${id}`,
            source: selectedNode.id,
            target: id,
            type: 'smoothstep',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#7C3AED' },
            style: { strokeWidth: 2, stroke: '#7C3AED' }
          });
        });

        setNodes((nds) => nds.concat(newNodes));
        setEdges((eds) => eds.concat(newEdges));
      }
      setAiInput('');
    } catch (e) {
      console.error("AI Expansion Error:", e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = async (format: 'png' | 'pdf' | 'svg') => {
    if (!reactFlowWrapper.current) return;
    
    // Select the actual flow container
    const element = reactFlowWrapper.current.querySelector('.react-flow__renderer') as HTMLElement;
    if (!element) return;

    try {
      if (format === 'png') {
        const dataUrl = await toPng(element, { backgroundColor: '#fff', quality: 1 });
        const link = document.createElement('a');
        link.download = `mindmap-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } else if (format === 'pdf') {
        const dataUrl = await toJpeg(element, { backgroundColor: '#fff', quality: 0.95 });
        const pdf = new jsPDF('l', 'px', [element.offsetWidth, element.offsetHeight]);
        pdf.addImage(dataUrl, 'JPEG', 0, 0, element.offsetWidth, element.offsetHeight);
        pdf.save(`mindmap-${Date.now()}.pdf`);
      } else if (format === 'svg') {
        const dataUrl = await toSvg(element);
        const link = document.createElement('a');
        link.download = `mindmap-${Date.now()}.svg`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  // Helper to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNode) {
        deleteNode(selectedNode.id);
      }
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        // Trigger save notification (simulation)
        console.log('Autosaving...');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-500 overflow-hidden" dir="rtl">
      {/* Header / Top Toolbar */}
      <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-100 dark:border-slate-800 px-8 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 dark:text-white leading-none">محرر الخرائط الذهنية</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Modern Strategic MindMapping Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
            <ToolbarIconButton icon={<Plus />} label="إضافة عقدة" onClick={addNode} primary />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />
            <ToolbarIconButton icon={<Undo2 />} label="تراجع" onClick={undo} disabled={historyIndex <= 0} />
            <ToolbarIconButton icon={<Redo2 />} label="إعادة" onClick={redo} disabled={historyIndex >= history.length - 1} />
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1">
             <div className="flex items-center px-4 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer group relative">
               <Download className="w-4 h-4 text-slate-500 group-hover:text-primary" />
               <span className="text-xs font-black text-slate-600 dark:text-slate-300 mr-2">تصدير</span>
               <div className="absolute top-full left-0 mt-2 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all translate-y-1 group-hover:translate-y-0 z-[100] p-2">
                 <ExportOption icon={<FileImage />} label="تحميل كصورة PNG" onClick={() => handleExport('png')} />
                 <ExportOption icon={<FileType />} label="تحميل كمستند PDF" onClick={() => handleExport('pdf')} />
                 <ExportOption icon={<FileCode />} label="تصدير بصيغة SVG" onClick={() => handleExport('svg')} />
               </div>
             </div>
             <ToolbarIconButton icon={<Printer />} label="طباعة" onClick={() => window.print()} />
          </div>

          <Button 
            variant="outline" 
            className="rounded-2xl h-11 border-slate-100 dark:border-slate-800 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={onClose}
          >
            خروج
          </Button>
          <Button 
            className="rounded-2xl h-11 bg-slate-900 dark:bg-white dark:text-slate-950 text-white text-xs font-black px-8 shadow-xl"
            onClick={() => {}}
          >
            حفظ المخطط
          </Button>
        </div>
      </header>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* React Flow Canvas */}
        <main className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.2}
            maxZoom={4}
            className="bg-slate-50/50 dark:bg-slate-950/50"
          >
            <Background color="#94a3b8" gap={20} size={1} />
            <Controls position="bottom-right" className="!bg-white dark:!bg-slate-900 !border-slate-100 dark:!border-slate-800 !shadow-2xl !rounded-2xl !p-1.5" />
            <MiniMap 
              position="bottom-left" 
              className="!bg-white/80 dark:!bg-slate-900/80 !backdrop-blur-xl !border-slate-100 dark:!border-slate-800 !rounded-3xl !p-2 !shadow-2xl" 
              nodeColor={(n: any) => (n.data?.color as string)?.includes('primary') ? '#00796B' : '#4F46E5'}
              maskColor="rgba(248, 250, 252, 0.5)"
            />
            
            <Panel position="top-right" className="flex flex-col gap-2 p-4">
              <div className="flex flex-col gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-2 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl">
                 <PanButton icon={<Maximize />} tooltip="احتواء المشهد" onClick={() => fitView({ duration: 800 })} />
                 <PanButton icon={<ZoomIn />} tooltip="تكبير" onClick={() => zoomIn()} />
                 <PanButton icon={<ZoomOut />} tooltip="تصغير" onClick={() => zoomOut()} />
              </div>
            </Panel>

            <Panel position="bottom-center" className="w-full max-w-2xl px-4 pb-8 pointer-events-none">
              <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-2.5 shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center text-white shadow-lg relative group overflow-hidden active:scale-95 transition-all">
                  <Sparkles className={`w-6 h-6 z-10 ${aiLoading ? 'animate-spin' : ''}`} />
                  <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[spin_4s_linear_infinite]" />
                </div>
                <input 
                  type="text" 
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={selectedNode ? `توسيع وتحليل النقطة: "${selectedNode.data.label}"...` : "اختر نقطة لتوسيعها بذكاء اصطناعي..."}
                  className="flex-1 bg-transparent border-none text-white text-sm font-bold placeholder:text-slate-500 focus:ring-0 px-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiExpand()}
                />
                <button 
                  onClick={handleAiExpand}
                  disabled={aiLoading || !aiInput || !selectedNode}
                  className="px-8 h-12 bg-white text-slate-900 rounded-full text-xs font-black hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-900 flex items-center gap-2 shadow-xl shrink-0"
                >
                  {aiLoading ? 'تحليل...' : 'توليد أفكار'}
                  <Zap className="w-4 h-4" />
                </button>
              </div>
            </Panel>
          </ReactFlow>
        </main>

        {/* Sidebar Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside 
              initial={{ x: 400 }} 
              animate={{ x: 0 }} 
              exit={{ x: 400 }} 
              className="w-[400px] bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800 z-50 shadow-[-40px_0_100px_rgba(0,0,0,0.05)] flex flex-col shrink-0"
            >
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-black text-slate-800 dark:text-white">خصائص العقدة</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Strategic Control Center</p>
                </div>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                {selectedNode ? (
                  <div className="space-y-10 animate-fade-in">
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Type className="w-4 h-4" />
                        عنوان العنصر
                      </label>
                      <input 
                        type="text" 
                        value={selectedNode.data.label as string}
                        onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                        className="w-full h-16 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] px-8 font-black text-lg text-slate-800 dark:text-white focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Layers className="w-4 h-4" />
                        التفصيل والمضمون
                      </label>
                      <textarea 
                        value={selectedNode.data.content as string}
                        onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
                        className="w-full h-44 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 text-sm font-bold leading-relaxed resize-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <Palette className="w-4 h-4" />
                        السمة اللونية
                      </label>
                      <div className="grid grid-cols-4 gap-4">
                        {NODE_COLORS.map((color) => (
                          <button 
                            key={color.class}
                            onClick={() => updateNodeData(selectedNode.id, { color: color.class })}
                            className={`
                              h-12 rounded-2xl transition-all relative overflow-hidden
                              ${color.class} 
                              ${selectedNode.data.color === color.class ? 'ring-4 ring-primary ring-offset-4 dark:ring-offset-slate-950 scale-110 shadow-xl' : 'hover:scale-105 opacity-60 hover:opacity-100'}
                            `}
                          >
                             {selectedNode.data.color === color.class && <Zap className="w-4 h-4 text-white mx-auto" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 space-y-4">
                      <Button 
                        onClick={() => addNeighborNode(selectedNode)}
                        className="w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-primary hover:text-white border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                         <Plus className="w-5 h-5" />
                         إضافة فرع جديد مرتبط
                      </Button>
                      
                      <button 
                        onClick={() => deleteNode(selectedNode.id)}
                        className="w-full h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center gap-3 border border-rose-100 dark:border-rose-900/30"
                      >
                        <Trash2 className="w-5 h-5 font-bold" />
                        حذف هذا العنصر
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 text-center opacity-40">
                    <div className="w-24 h-24 rounded-[3rem] bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mb-10 shadow-inner">
                      <MousePointer2 className="w-12 h-12" />
                    </div>
                    <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] leading-relaxed">
                      اختر عقدة للتعديل على<br/>بياناتها الاستراتيجية
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

// --- Helper UI Components ---

const ToolbarIconButton = ({ icon, label, onClick, primary = false, disabled = false }: { icon: any, label: string, onClick: () => void, primary?: boolean, disabled?: boolean }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      w-10 h-10 flex items-center justify-center rounded-xl transition-all group relative
      ${primary 
        ? 'bg-primary text-white shadow-lg hover:shadow-primary/30 hover:scale-105' 
        : 'text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700'}
      ${disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''}
    `}
  >
    {icon}
    <span className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/90 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl backdrop-blur-sm z-[100]">{label}</span>
  </button>
);

const PanButton = ({ icon, tooltip, onClick }: { icon: any, tooltip: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group relative"
  >
    {icon}
    <span className="absolute right-full mr-3 px-2 py-1 bg-slate-900/90 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all shadow-xl z-[100]">{tooltip}</span>
  </button>
);

const ExportOption = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
  >
    <div className="text-slate-400 group-hover:text-primary">{icon}</div>
    <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{label}</span>
  </button>
);

// --- The Wrapper Component (Entrance / Gallery) ---

const DEFAULT_MAPS: MindMapData[] = [
  {
    id: 'demo-legal-1',
    title: 'استراتيجية الدفاع في قضايا التعويضات',
    layoutType: MindMapLayoutType.MINDMAP,
    createdAt: new Date().toISOString(),
    nodes: [],
    edges: [],
    data: {
      rfNodes: [
        { id: 'root', type: 'strategic', position: { x: 0, y: 0 }, data: { label: 'قضية تعويض عمالي', content: 'تحليل الاستحقاقات والمسؤولية التقصيرية.', color: 'bg-[#00796B]' } },
        { id: 'n1', type: 'strategic', position: { x: -350, y: 200 }, data: { label: 'المسؤولية', content: 'إثبات الخطأ والضرر وعلاقة السببية.', color: 'bg-[#4F46E5]' } },
        { id: 'n2', type: 'strategic', position: { x: 350, y: 200 }, data: { label: 'حساب التعويض', content: 'الأضرار المادية والأدبية والكسب الفائت.', color: 'bg-[#E11D48]' } },
        { id: 'n3', type: 'strategic', position: { x: 0, y: 400 }, data: { label: 'الدفوع', content: 'سقوط الحق، المصالحة السابقة، القوة القاهرة.', color: 'bg-[#D97706]' } },
      ],
      rfEdges: [
        { id: 'e-r-1', source: 'root', target: 'n1', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#4F46E5' } },
        { id: 'e-r-2', source: 'root', target: 'n2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#E11D48' } },
        { id: 'e-r-3', source: 'root', target: 'n3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#D97706' } },
      ]
    }
  }
];

const SmartMindMapPage: React.FC = () => {
  const [activeMapId, setActiveMapId] = useState<string | null>(null);
  const [mindMaps, setMindMaps] = useState<MindMapData[]>(() => {
    const saved = localStorage.getItem('qanooni_mindmaps');
    if (saved) return JSON.parse(saved);
    return DEFAULT_MAPS;
  });

  useEffect(() => {
    localStorage.setItem('qanooni_mindmaps', JSON.stringify(mindMaps));
  }, [mindMaps]);

  const activeMap = useMemo(() => mindMaps.find(m => m.id === activeMapId), [mindMaps, activeMapId]);

  const handleCreateNew = () => {
    const id = `map-${Date.now()}`;
    const newMap: MindMapData = {
      id,
      title: 'خريطة أفكار قانونية جديدة',
      layoutType: MindMapLayoutType.MINDMAP,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      data: {
        rfNodes: INITIAL_NODES,
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
    if(confirm('هل أنت متأكد من حذف هذه الخريطة؟')) {
      setMindMaps(prev => prev.filter(m => m.id !== id));
    }
  };

  if (activeMapId && activeMap) {
    return (
      <ReactFlowProvider>
        <MindMapEditor 
          onClose={() => setActiveMapId(null)} 
          initialData={activeMap}
          onSave={(data) => handleUpdateMap(activeMapId, { data, updatedAt: new Date().toISOString() })}
        />
      </ReactFlowProvider>
    );
  }

  return (
    <div className="h-screen bg-[#FDFDFF] dark:bg-slate-950 flex flex-col overflow-hidden transition-colors duration-700 pt-10 px-8" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center">
         <div className="text-center mb-16 relative z-10">
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-6"
           >
             <Cpu className="w-10 h-10" />
           </motion.div>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">المخططات الذهنية الاستراتيجية</h1>
           <p className="text-lg text-slate-500 dark:text-slate-400 font-bold">نظم رؤيتك القانونية وخططك الإدارية بوضوح تام باستخدام الذكاء الاصطناعي.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full pb-20 relative z-10">
            {/* Create New Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              onClick={handleCreateNew}
              className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] p-12 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all group shadow-sm hover:shadow-2xl"
            >
               <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-90">
                 <Plus className="w-10 h-10" />
               </div>
               <span className="text-xl font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">بناء مخطط جديد</span>
            </motion.div>

            {mindMaps.map((map) => (
              <motion.div 
                key={map.id}
                whileHover={{ y: -10 }}
                onClick={() => setActiveMapId(map.id)}
                className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex justify-between items-start mb-8 relative">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                    <FolderOpen className="w-7 h-7" />
                  </div>
                  <button 
                    onClick={(e) => deleteMap(map.id, e)}
                    className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-primary transition-colors">{map.title}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">تم الإنشاء في {new Date(map.createdAt).toLocaleDateString('ar-KW')}</p>
                
                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                   <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-[11px] font-black text-slate-400 uppercase">Strategic Assets</span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                     <ChevronLeft className="w-5 h-5" />
                   </div>
                </div>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SmartMindMapPage;
