

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
    CpuChipIcon, PlusCircleIcon, PencilIcon, TrashIcon, InformationCircleIcon, LightBulbIcon, FolderIcon, 
    ShareIcon, ArrowPathIcon, MinusCircleIcon, LinkIcon, Bars3Icon, PrinterIcon, BriefcaseIcon,
    ArrowUpCircleIcon, ArrowDownCircleIcon, CameraIcon, PaperClipIcon, DocumentTextIcon, XCircleIcon,
    MagnifyingGlassIcon, SparklesIcon, ScaleIcon, BanknotesIcon, UsersIcon, ArrowUturnLeftIcon
} from '../constants';
import { MindMapData, MindMapNode, MindMapEdge, MindMapLayoutType, AISuggestedNode, Case, ComplianceRequirement, ComplianceStatus, MindMapShape } from '../types';
import { mindMapLayoutOptions, nodeColorOptions, mindMapShapeOptions, mindMapNodeIcons } from '../constants'; 
import { geminiService } from '../services/geminiService';
import { initialCases } from '../data/caseData';
import { initialComplianceData } from './CompliancePage';

const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { 
      return dateString; 
    }
};

// --- INITIAL MOCK DATA ---
const initialMindMaps: MindMapData[] = [
    {
        id: 'map-example-1',
        title: 'مثال: استراتيجية قضية نزاع تجاري',
        layoutType: MindMapLayoutType.TREE_HORIZONTAL,
        createdAt: new Date().toISOString(),
        nodes: [
            { id: 'ex1-root', label: 'قضية شركة الأمل ضد المقاولين', content: 'الهدف: الحصول على تعويض بقيمة 50,000 د.ك للإخلال بالعقد.', parentId: null, childrenIds: ['ex1-c1', 'ex1-c2', 'ex1-c3', 'ex1-c4'], color: 'bg-primary', iconName: 'briefcase', shape: MindMapShape.ROUNDED },
            { id: 'ex1-c1', label: 'نقاط القوة لدينا', content: 'بنود العقد واضحة، شهود يؤكدون التأخير.', parentId: 'ex1-root', childrenIds: ['ex1-c1a'], color: 'bg-green-600', iconName: 'lightbulb', shape: MindMapShape.ROUNDED },
            { id: 'ex1-c1a', label: 'الأدلة الداعمة', content: 'العقد الموقع، المراسلات الإلكترونية، تقرير استلام أولي.', parentId: 'ex1-c1', childrenIds: [], color: 'bg-teal-500', iconName: 'folder', shape: MindMapShape.RECTANGLE },
            { id: 'ex1-c2', label: 'نقاط ضعف الخصم', content: 'يعاني من مشاكل مالية، لديه سوابق في تأخير المشاريع.', parentId: 'ex1-root', childrenIds: [], color: 'bg-red-500', iconName: 'warning', shape: MindMapShape.ROUNDED },
            { id: 'ex1-c3', label: 'الخطوات القادمة', content: 'تقديم مذكرة بالطلبات الختامية، حجز جلسة للشهود.', parentId: 'ex1-root', childrenIds: [], color: 'bg-blue-600', iconName: 'task', shape: MindMapShape.RECTANGLE },
            { id: 'ex1-c4', label: 'استراتيجية التفاوض', content: 'عرض تسوية مبدئية بقيمة 35,000 د.ك قبل جلسة الحكم.', parentId: 'ex1-root', childrenIds: [], color: 'bg-yellow-500', iconName: 'users', shape: MindMapShape.ROUNDED },
        ],
        edges: [],
    },
    {
        id: 'map-example-2',
        title: 'مثال: خطوات صفقة عقارية (مخطط انسيابي)',
        layoutType: MindMapLayoutType.FLOWCHART_HORIZONTAL,
        createdAt: new Date().toISOString(),
        nodes: [
            { id: 'ex2-root', label: 'بدء الصفقة', content: 'تلقي عرض شراء للعقار.', parentId: null, childrenIds: ['ex2-c1'], color: 'bg-primary', iconName: 'briefcase', shape: MindMapShape.OVAL },
            { id: 'ex2-c1', label: 'التفاوض على السعر', content: 'التواصل مع المشتري للوصول لسعر نهائي.', parentId: 'ex2-root', childrenIds: ['ex2-c2'], color: 'bg-blue-600', iconName: 'users', shape: MindMapShape.DIAMOND },
            { id: 'ex2-c2', label: 'توقيع العقد الابتدائي', content: 'استلام عربون وتوقيع العقد المبدئي.', parentId: 'ex2-c1', childrenIds: ['ex2-c3'], color: 'bg-yellow-500', iconName: 'task', shape: MindMapShape.RECTANGLE },
            { id: 'ex2-c3', label: 'إجراءات التسجيل', content: 'تقديم المستندات لوزارة العدل.', parentId: 'ex2-c2', childrenIds: ['ex2-c4'], color: 'bg-teal-500', iconName: 'folder', shape: MindMapShape.PARALLELOGRAM },
            { id: 'ex2-c4', label: 'التوقيع النهائي وإنهاء الصفقة', content: 'استلام باقي المبلغ وتوقيع العقد النهائي ونقل الملكية.', parentId: 'ex2-c3', childrenIds: [], color: 'bg-green-600', iconName: 'lightbulb', shape: MindMapShape.PILL },
        ],
        edges: [],
    },
    {
        id: 'map-example-4',
        title: 'تحليل قانوني: جريمة غسل أموال (نموذج معقد)',
        layoutType: MindMapLayoutType.ORGANIZATION_CHART,
        createdAt: new Date().toISOString(),
        nodes: [
            { id: 'ex4-root', label: 'جريمة غسل الأموال', content: 'تحليل الأركان والمراحل والعقوبات.', parentId: null, childrenIds: ['ex4-c1', 'ex4-c2', 'ex4-c3'], color: 'bg-slate-800', iconName: 'law', shape: MindMapShape.ROUNDED },
            { id: 'ex4-c1', label: 'أركان الجريمة', content: 'الركن المادي والمعنوي والشرعي.', parentId: 'ex4-root', childrenIds: ['ex4-c1a', 'ex4-c1b'], color: 'bg-red-700', iconName: 'info', shape: MindMapShape.RECTANGLE },
            { id: 'ex4-c1a', label: 'الركن المادي', content: 'فعل التحويل أو النقل أو الإخفاء.', parentId: 'ex4-c1', childrenIds: [], color: 'bg-red-800', iconName: 'folder', shape: MindMapShape.RECTANGLE },
            { id: 'ex4-c1b', label: 'الركن المعنوي', content: 'القصد الجنائي مع العلم بمصدر الأموال.', parentId: 'ex4-c1', childrenIds: [], color: 'bg-red-800', iconName: 'lightbulb', shape: MindMapShape.RECTANGLE },
            { id: 'ex4-c2', label: 'مراحل الغسل', content: 'التوظيف، التمويه، الإدماج.', parentId: 'ex4-root', childrenIds: ['ex4-c2a', 'ex4-c2b', 'ex4-c2c'], color: 'bg-blue-700', iconName: 'task', shape: MindMapShape.RECTANGLE },
            { id: 'ex4-c2a', label: 'التوظيف (Placement)', content: 'إدخال الأموال للنظام المالي لأول مرة.', parentId: 'ex4-c2', childrenIds: [], color: 'bg-blue-800', iconName: 'money', shape: MindMapShape.RECTANGLE },
            { id: 'ex4-c2b', label: 'التمويه (Layering)', content: 'عمليات معقدة لإخفاء منشأ الأموال.', parentId: 'ex4-c2', childrenIds: [], color: 'bg-blue-800', iconName: 'folder', shape: MindMapShape.RECTANGLE },
            { id: 'ex4-c2c', label: 'الإدماج (Integration)', content: 'إضفاء المظهر الشرعي النهائي على الأموال.', parentId: 'ex4-c2', childrenIds: [], color: 'bg-blue-800', iconName: 'lightbulb', shape: MindMapShape.RECTANGLE },
            { id: 'ex4-c3', label: 'العقوبات المقررة', content: 'الحبس والغرامة والمصادرة.', parentId: 'ex4-root', childrenIds: [], color: 'bg-amber-700', iconName: 'warning', shape: MindMapShape.ROUNDED },
        ],
        edges: [],
    }
];

const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) {
                resolve({ base64Data, mimeType: file.type });
            } else {
                reject(new Error("Failed to extract base64 data from file."));
            }
        };
        reader.onerror = error => reject(error);
    });
};

function generateFlatNodesFromAi(
    aiNodeList: AISuggestedNode[],
    mapId: string,
    parentId: string | null = null,
    level: number = 0,
    allNodes: MindMapNode[] = [] 
): void {
    aiNodeList.forEach((aiNode, index) => {
        const nodeId = `${mapId}-node-${level}-${index}-${Date.now().toString(36).slice(-4)}`;
        const newNode: MindMapNode = {
            id: nodeId,
            label: aiNode.label,
            content: aiNode.content || '',
            parentId: parentId,
            childrenIds: [], 
            color: nodeColorOptions[level % nodeColorOptions.length].value,
            iconName: level === 0 ? 'lightbulb' : (aiNode.children && aiNode.children.length > 0 ? 'folder' : 'info'), 
            shape: MindMapShape.ROUNDED, // Default shape
        };
        allNodes.push(newNode);

        if (aiNode.children && aiNode.children.length > 0) {
            generateFlatNodesFromAi(aiNode.children, mapId, nodeId, level + 1, allNodes);
        }
    });
}

function convertAiResultToMapData(
    aiResultNodes: AISuggestedNode[],
    titlePrefix: string
): MindMapData | null {
    if (!aiResultNodes || aiResultNodes.length === 0) return null;

    const newMapId = `map-ai-${Date.now()}`;
    const flatNodes: MindMapNode[] = [];
    
    generateFlatNodesFromAi(aiResultNodes, newMapId, null, 0, flatNodes);

    if (flatNodes.length === 0) return null; 

    flatNodes.forEach(node => {
        node.childrenIds = flatNodes
            .filter(childNode => childNode.parentId === node.id)
            .map(childNode => childNode.id);
    });
    
    const newMapData: MindMapData = {
        id: newMapId,
        title: `${titlePrefix}: "${flatNodes.find(n=>n.parentId === null)?.label?.substring(0, 25) || 'خريطة جديدة'}..."`,
        createdAt: new Date().toISOString(),
        layoutType: MindMapLayoutType.TREE_HORIZONTAL,
        nodes: flatNodes,
        edges: [], 
    };
    return newMapData;
}


// --- Visual Node Component ---
const NodeDisplay: React.FC<{ 
  node: MindMapNode; 
  onSelect: (node: MindMapNode) => void; 
  onAddChild?: (parentId: string) => void;
  isSelected: boolean; 
}> = React.memo(({ node, onSelect, onAddChild, isSelected }) => {
    const selectedBorderClass = isSelected ? 'ring-4 ring-offset-2 dark:ring-offset-dm-background ring-primary shadow-2xl scale-110 z-50' : 'shadow-md hover:shadow-lg hover:scale-105';
    const NodeIconComponent = mindMapNodeIcons[node.iconName || 'default'] || mindMapNodeIcons.default;
    
    const getShapeClass = (shape?: MindMapShape) => {
        switch (shape) {
            case MindMapShape.RECTANGLE: return 'shape-rectangle border-2';
            case MindMapShape.PILL: return 'shape-pill px-6 text-center';
            case MindMapShape.OVAL: return 'shape-oval min-h-[100px] flex flex-col justify-center';
            case MindMapShape.DIAMOND: return 'shape-diamond w-44 h-44 flex flex-col justify-center items-center text-center p-2';
            case MindMapShape.PARALLELOGRAM: return 'shape-parallelogram px-8';
            case MindMapShape.ROUNDED:
            default: return 'rounded-2xl';
        }
    };

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className={`node-display group/node node-card p-4 border border-black/5 dark:border-white/5 ${selectedBorderClass} ${node.color} min-w-[220px] max-w-[300px] transition-all duration-300 transform cursor-pointer text-white relative overflow-hidden ${getShapeClass(node.shape)}`}
        onClick={(e) => { e.stopPropagation(); onSelect(node);}}
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
        
        <div className="flex items-center mb-2 relative z-10">
          <div className="p-1.5 bg-white/20 rounded-lg me-2">
            <NodeIconComponent className="w-5 h-5 flex-shrink-0" />
          </div>
          <p className="text-sm font-bold truncate">{node.label || "بدون عنوان"}</p>
        </div>
        {node.content && (
            <p className="text-xs mt-2 opacity-90 line-clamp-4 leading-relaxed font-medium relative z-10 border-t border-white/10 pt-2">
                {node.content}
            </p>
        )}

        {/* Quick Add Button */}
        {onAddChild && (
            <button 
                onClick={(e) => { e.stopPropagation(); onAddChild(node.id); }}
                className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white text-primary p-1 rounded-full shadow-lg opacity-0 group-hover/node:opacity-100 transition-opacity translate-x-4 group-hover/node:translate-x-0 z-20"
            >
                <PlusCircleIcon className="w-4 h-4" />
            </button>
        )}
      </motion.div>
    );
});

// --- Recursive Tree Renderer ---
const TreeRenderer: React.FC<{
  nodes: MindMapNode[];
  nodeId: string;
  onSelect: (node: MindMapNode) => void;
  onAddChild?: (parentId: string) => void;
  selectedNodeId: string | null;
  layout: MindMapLayoutType;
}> = ({ nodes, nodeId, onSelect, onAddChild, selectedNodeId, layout }) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const children = node.childrenIds.map(childId => (
        <li key={childId} className="relative">
            <TreeRenderer
                nodes={nodes}
                nodeId={childId}
                onSelect={onSelect}
                onAddChild={onAddChild}
                selectedNodeId={selectedNodeId}
                layout={layout}
            />
        </li>
    ));

    const isHorizontal = layout === MindMapLayoutType.TREE_HORIZONTAL || layout === MindMapLayoutType.FLOWCHART_HORIZONTAL;
    const isFlowchart = layout === MindMapLayoutType.FLOWCHART_HORIZONTAL || layout === MindMapLayoutType.FLOWCHART_VERTICAL;

    const containerStyle = {
        [MindMapLayoutType.TREE_HORIZONTAL]: 'flex-row',
        [MindMapLayoutType.ORGANIZATION_CHART]: 'flex-col',
        [MindMapLayoutType.FLOWCHART_HORIZONTAL]: 'flex-row',
        [MindMapLayoutType.FLOWCHART_VERTICAL]: 'flex-col',
        [MindMapLayoutType.RADIAL]: 'flex-row'
    }[layout] || 'flex-row';

    return (
        <div className={`flex ${containerStyle} items-center gap-8 py-4 px-4 relative`}>
            <NodeDisplay node={node} onSelect={onSelect} onAddChild={onAddChild} isSelected={node.id === selectedNodeId} />
            
            {children.length > 0 && (
                <div className={`relative flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-0`}>
                    <div className={`absolute ${isHorizontal ? 'top-1/2 -left-1 w-8 h-[2px]' : 'left-1/2 -top-1 w-[2px] h-8'} bg-slate-300 dark:bg-slate-700`} />
                    <ul className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} gap-4 relative border-l-2 border-slate-200 dark:border-slate-800 pl-8`}>
                        {children}
                    </ul>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
const SmartMindMapPage: React.FC = () => {
    const [mindMaps, setMindMaps] = useState<MindMapData[]>(initialMindMaps);
    const [activeMapId, setActiveMapId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'gallery' | 'editor'>('gallery');
    
    // AI Generation state
    const [aiText, setAiText] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [activeTab, setActiveTab] = useState<'text' | 'case' | 'file' | 'system'>('text');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddChild = useCallback((parentId: string) => {
        if(!activeMapId) return;
        const newNodeId = `node-${Date.now()}`;
        const newNode: MindMapNode = {
            id: newNodeId,
            label: 'تفرع جديد',
            content: '',
            parentId: parentId,
            childrenIds: [],
            color: 'bg-indigo-500',
            iconName: 'info',
            shape: MindMapShape.ROUNDED
        };
        setMindMaps(prev => prev.map(m => m.id === activeMapId ? {
            ...m,
            nodes: [...m.nodes, newNode].map(n => n.id === parentId ? { ...n, childrenIds: [...n.childrenIds, newNodeId]} : n)
        } : m));
        setSelectedNode(newNode);
    }, [activeMapId]);

    const activeMap = useMemo(() => mindMaps.find(m => m.id === activeMapId), [mindMaps, activeMapId]);

    useEffect(() => {
        if (activeMapId) {
            setViewMode('editor');
        } else {
            setViewMode('gallery');
        }
    }, [activeMapId]);

    const handleSelectNode = useCallback((node: MindMapNode) => {
        setSelectedNode(node);
    }, []);
    
    useEffect(() => {
        if (!activeMap) {
            setSelectedNode(null);
        } else {
            const nodeStillExists = activeMap.nodes.some(n => n.id === selectedNode?.id);
            if (!nodeStillExists) {
                setSelectedNode(null);
            }
        }
    }, [activeMap, selectedNode]);

    const handleUpdateMap = (field: keyof MindMapData, value: any) => {
        if (!activeMapId) return;
        setMindMaps(prevMaps => prevMaps.map(map => 
            map.id === activeMapId ? { ...map, [field]: value } : map
        ));
    };

    const handleUpdateNode = (updatedNode: MindMapNode) => {
        if (!activeMapId) return;
        setMindMaps(prevMaps => prevMaps.map(map => {
            if (map.id === activeMapId) {
                return {
                    ...map,
                    nodes: map.nodes.map(n => n.id === updatedNode.id ? updatedNode : n)
                };
            }
            return map;
        }));
        setSelectedNode(updatedNode);
    };

    const handleAiGenerate = async (
        type: 'text' | 'case' | 'compliance' | 'file',
        titlePrefix: string
    ) => {
        setIsLoading(true);
        setError(null);
        try {
            let input: any = {};
            if (type === 'text') input.text = aiText;
            else if (type === 'case') {
                const caseData = initialCases.find(c => c.id === selectedCaseId);
                if (!caseData) throw new Error("لم يتم العثور على القضية المحددة.");
                input.caseData = caseData;
            } else if (type === 'compliance') {
                const complianceData = initialComplianceData.filter(c => 
                    c.status === ComplianceStatus.OVERDUE || c.status === ComplianceStatus.IN_PROGRESS
                );
                if (complianceData.length === 0) throw new Error("لا توجد مهام امتثال متأخرة أو قيد التنفيذ حاليًا.");
                input.moduleData = { type: 'Compliance', data: complianceData };
            } else if (type === 'file' && selectedFile) {
                input.file = await fileToBase64(selectedFile);
            }

            const aiResult = await geminiService.generateMindMap(input);
            const newMap = convertAiResultToMapData(aiResult.nodes, titlePrefix);
            
            if (newMap) {
                setMindMaps(prev => [newMap, ...prev]);
                setActiveMapId(newMap.id);
                setAiText('');
                setSelectedCaseId('');
                setSelectedFile(null);
            } else {
                throw new Error("لم يتمكن الذكاء الاصطناعي من إنشاء هيكل خريطة صالح.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const rootNode = useMemo(() => activeMap?.nodes.find(n => n.parentId === null), [activeMap]);
    const controlPanelRef = useRef<HTMLDivElement>(null);
    const mapAreaRef = useRef<HTMLDivElement>(null);

    const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'top' | 'bottom') => {
        if(ref.current) {
            ref.current.scrollTo({ top: direction === 'top' ? 0 : ref.current.scrollHeight, behavior: 'smooth'});
        }
    };
    
    // --- RENDER FUNCTIONS ---
    const renderMapGallery = () => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-dm-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">مكتبة الخرائط الذهنية</h2>
                    <p className="text-sm text-slate-500">اختر خريطة للبدء أو أنشئ واحدة جديدة من لوحة التحكم.</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input placeholder="بحث في الخرائط..." className="pl-9 text-sm h-11 min-w-[250px] rounded-xl" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mindMaps.map((map, idx) => (
                    <motion.div
                        key={map.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card 
                            className="group hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer h-full border-none shadow-md overflow-hidden rounded-2xl" 
                            onClick={() => setActiveMapId(map.id)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors`}>
                                    <CpuChipIcon className="w-6 h-6" />
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                        {map.nodes.length} عقدة
                                    </span>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-2 line-clamp-1">{map.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] font-medium">{map.nodes[0]?.content || "خريطة ذهنية ذكية تم إنشاؤها لتبسيط المعلومات القانونية المعقدة."}</p>
                            
                            <div className="flex justify-between items-center py-2 px-4 mt-4 -mx-6 -mb-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{formatDate(map.updatedAt || map.createdAt)}</span>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" className="!p-1 h-7 w-7 text-red-500 hover:bg-red-50" onClick={(e) => {
                                        e.stopPropagation();
                                        if(window.confirm(`حذف خريطة "${map.title}"؟`)) {
                                            setMindMaps(prev => prev.filter(m => m.id !== map.id));
                                        }
                                    }}><TrashIcon className="w-3.5"/></Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mindMaps.length * 0.05 }}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-dm-card/50 hover:bg-white hover:border-primary transition-all cursor-pointer min-h-[180px]"
                    onClick={() => {
                        const newId = `map-manual-${Date.now()}`;
                        const newMap: MindMapData = {
                            id: newId,
                            title: 'خريطة ذهنية جديدة',
                            layoutType: MindMapLayoutType.TREE_HORIZONTAL,
                            createdAt: new Date().toISOString(),
                            nodes: [{ id: `${newId}-root`, label: 'البداية', content: 'ابدأ بتحديد الفكرة الرئيسية هنا...', parentId: null, childrenIds: [], color: 'bg-primary', iconName: 'lightbulb', shape: MindMapShape.ROUNDED }],
                            edges: []
                        };
                        setMindMaps([newMap, ...mindMaps]);
                        setActiveMapId(newId);
                    }}
                >
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                        <PlusCircleIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <span className="font-bold text-slate-500">إنشاء خريطة يدوية</span>
                    <p className="text-xs text-slate-400 mt-1">ابدأ من الصفر وقم ببناء هيكلك الخاص</p>
                </motion.div>
            </div>
        </div>
    );

    const renderMapEditor = () => (
        <div className="relative group/map" id="printable-mindmap-area">
            <div className="flex justify-between items-center mb-4 print-hide">
                <Button variant="ghost" size="sm" onClick={() => setActiveMapId(null)} leftIcon={<ArrowUturnLeftIcon className="w-4"/>}>العودة للمكتبة</Button>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" leftIcon={<PrinterIcon className="w-4"/>} onClick={() => window.print()}>طباعة كملف PDF</Button>
                </div>
            </div>
            
            <div ref={mapAreaRef} className="overflow-auto p-12 bg-white dark:bg-dm-background rounded-[2.5rem] h-[78vh] border border-slate-100 dark:border-slate-800 shadow-inner scrollbar-thin relative mindmap-canvas">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                {activeMap && rootNode ? (
                     <div className={`min-w-fit min-h-fit ${activeMap.layoutType === MindMapLayoutType.ORGANIZATION_CHART ? 'tree-v' : 'tree-h'}`}>
                        <TreeRenderer 
                            nodes={activeMap.nodes}
                            nodeId={rootNode.id}
                            onSelect={handleSelectNode}
                            onAddChild={handleAddChild}
                            selectedNodeId={selectedNode?.id || null}
                            layout={activeMap.layoutType}
                        />
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center flex-col text-slate-400">
                        <InformationCircleIcon className="w-12 h-12 mb-4 opacity-50" />
                        <p className="font-bold">يرجى اختيار خريطة صالحة لعرضها</p>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-8 right-8 flex flex-col space-y-3 print-hide pointer-events-none group-hover/map:pointer-events-auto opacity-0 group-hover/map:opacity-100 transition-opacity">
                <Button variant="secondary" size="sm" className="rounded-full !p-3 shadow-xl hover:scale-110 bg-white/80 backdrop-blur" onClick={() => handleScroll(mapAreaRef, 'top')}><ArrowUpCircleIcon className="w-6 h-6 text-primary"/></Button>
                <Button variant="secondary" size="sm" className="rounded-full !p-3 shadow-xl hover:scale-110 bg-white/80 backdrop-blur" onClick={() => handleScroll(mapAreaRef, 'bottom')}><ArrowDownCircleIcon className="w-6 h-6 text-primary"/></Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-[1640px] mx-auto pb-12">
            <style>{`
                @media print {
                    .print-hide { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    #printable-mindmap-area { position: absolute; top: 0; left: 0; width: 100vw; height: auto; padding: 0; margin: 0; }
                    .mindmap-canvas { height: auto !important; border: none !important; box-shadow: none !important; padding: 20px !important; }
                    .node-display { break-inside: avoid; box-shadow: none !important; border: 1px solid #ccc !important; }
                }
                .shape-rectangle { border-radius: 6px; }
                .shape-pill { border-radius: 9999px; }
                .shape-oval { border-radius: 50% / 50%; }
                .shape-diamond { transform: rotate(45deg); display: flex; align-items: center; justify-content: center; }
                .shape-diamond > * { transform: rotate(-45deg); }
                .shape-parallelogram { transform: skewX(-15deg); }
                .shape-parallelogram > * { transform: skewX(15deg); }
            `}</style>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 print-hide px-2">
                <div className="flex items-center">
                    <div className="p-4 bg-indigo-600 rounded-2xl me-5 shadow-lg shadow-indigo-200 dark:shadow-none">
                        <SparklesIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">الخرائط الذهنية الذكية</h1>
                        <p className="text-slate-500 font-bold">نمذجة البيانات القانونية المعقدة بأحدث تقنيات الذكاء الاصطناعي</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">
                <div className={viewMode === 'editor' ? 'lg:col-span-9' : 'lg:col-span-12'}>
                    <AnimatePresence mode="wait">
                         {activeMap ? (
                            <motion.div key="editor" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
                                {renderMapEditor()}
                            </motion.div>
                         ) : (
                            <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                {renderMapGallery()}
                            </motion.div>
                         )}
                    </AnimatePresence>
                </div>

                <div className={`lg:col-span-3 print-hide ${viewMode === 'gallery' ? 'lg:col-start-12 opacity-0 pointer-events-none absolute' : ''}`}>
                    <div ref={controlPanelRef} className="space-y-6 h-[85vh] overflow-y-auto scrollbar-none p-1 sticky top-6">
                        <Card className="border-none shadow-xl rounded-[2.5rem] bg-indigo-600 text-white">
                            <div className="p-5">
                                <h3 className="text-sm font-black border-b border-white/20 pb-4 mb-5 flex items-center gap-3">
                                    <CpuChipIcon className="w-5 h-5"/> تحليلي الذكي (AI)
                                </h3>
                                {isLoading ? (
                                    <div className="py-10 flex flex-col items-center">
                                        <LoadingSpinner />
                                        <p className="text-xs text-white/70 mt-4 animate-pulse font-bold">جاري التصميم الهيكلي...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Source selection tabs */}
                                        <div className="flex bg-white/10 p-1 rounded-xl gap-1">
                                            <button 
                                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'text' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'}`}
                                                onClick={() => setActiveTab('text')}
                                            >نص</button>
                                            <button 
                                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'case' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'}`}
                                                onClick={() => setActiveTab('case')}
                                            >قضية</button>
                                            <button 
                                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'}`}
                                                onClick={() => setActiveTab('file')}
                                            >صورة</button>
                                            <button 
                                                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activeTab === 'system' ? 'bg-white text-indigo-600 shadow-sm' : 'text-white/60 hover:text-white'}`}
                                                onClick={() => setActiveTab('system')}
                                            >نظام</button>
                                        </div>

                                        <div className="mt-2">
                                            {activeTab === 'text' && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                                    <TextArea 
                                                        label="تحويل تفاصيل إلى خريطة" 
                                                        value={aiText || ''} 
                                                        onChange={e=>setAiText(e.target.value)} 
                                                        rows={4} 
                                                        placeholder="أدخل ملخص القضية أو النقاط الرئيسية..." 
                                                        className="text-xs bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl" 
                                                    />
                                                    <Button size="md" variant="secondary" fullWidth onClick={() => handleAiGenerate('text', 'تحليل ذكي')} disabled={!aiText} className="font-black">توليد من النص</Button>
                                                </div>
                                            )}

                                            {activeTab === 'case' && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                                    <Select 
                                                        label="اختر من القضايا المسجلة" 
                                                        value={selectedCaseId || ''} 
                                                        onChange={e=>setSelectedCaseId(e.target.value)} 
                                                        options={[{value:'', label:'اختر القضية...'}, ...initialCases.map(c=>({value:c.id, label:`${c.caseNumber} - ${c.title}`}))]}
                                                        className="dark bg-white/10 border-white/20 text-white rounded-xl"
                                                    />
                                                    <Button size="md" variant="secondary" fullWidth onClick={() => handleAiGenerate('case', 'تحليل قضية')} disabled={!selectedCaseId} className="font-black">توليد من القضية</Button>
                                                </div>
                                            )}

                                            {activeTab === 'file' && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                                    <div 
                                                        className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:bg-white/5 transition-colors"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                                                        <CameraIcon className="w-8 h-8 mx-auto mb-2 text-white/50" />
                                                        <p className="text-[10px] text-white/70">{selectedFile ? selectedFile.name : 'اضغط لرفع صورة أو وثيقة (JPG, PNG)'}</p>
                                                    </div>
                                                    <Button size="md" variant="secondary" fullWidth onClick={() => handleAiGenerate('file', 'تحليل وثيقة')} disabled={!selectedFile} className="font-black">توليد من الصورة</Button>
                                                </div>
                                            )}

                                            {activeTab === 'system' && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                                    <div className="bg-white/5 p-4 rounded-xl">
                                                        <h4 className="text-[11px] font-bold mb-2">استيراد بيانات الامتثال</h4>
                                                        <p className="text-[10px] text-white/60 mb-3">سيقوم النظام بتحليل كافة مهام الامتثال النشطة والمعلقة لإعطائك نظرة شاملة.</p>
                                                        <Button size="sm" variant="secondary" fullWidth onClick={() => handleAiGenerate('compliance', 'ملخص الامتثال')} className="font-black">استيراد وبناء الخريطة</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {selectedNode && (
                            <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-900 text-white">
                                <div className="p-5">
                                    <h3 className="text-sm font-black border-b border-white/10 pb-4 mb-5 flex items-center gap-3">
                                        <PencilIcon className="w-5 h-5"/> تحرير العناصر
                                    </h3>
                                    <div className="space-y-5">
                                        <Input label="عنوان العقدة" value={selectedNode.label || ''} onChange={e => handleUpdateNode({...selectedNode, label: e.target.value})} containerClassName="dark !bg-slate-800" className="rounded-xl" />
                                        <TextArea label="تفاصيل إضافية" value={selectedNode.content || ''} onChange={e => handleUpdateNode({...selectedNode, content: e.target.value})} rows={4} className="dark bg-slate-800 rounded-xl" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Select label="اللون" value={selectedNode.color || ''} options={nodeColorOptions} onChange={e => handleUpdateNode({...selectedNode, color: e.target.value})} className="dark bg-slate-800 rounded-xl" />
                                            <Select label="الشكل" value={selectedNode.shape || MindMapShape.ROUNDED} options={mindMapShapeOptions} onChange={e => handleUpdateNode({...selectedNode, shape: e.target.value as MindMapShape})} className="dark bg-slate-800 rounded-xl" />
                                        </div>
                                        <Select label="الأيقونة الرمزية" value={selectedNode.iconName || 'default'} options={Object.keys(mindMapNodeIcons).map(key => ({value: key, label: key}))} onChange={e => handleUpdateNode({...selectedNode, iconName: e.target.value})} className="dark bg-slate-800 rounded-xl" />
                                        
                                        <div className="flex gap-3 border-t border-white/10 pt-5 mt-3">
                                            <Button size="md" variant="primary" className="w-full font-bold" onClick={() => {
                                                if(!activeMap) return;
                                                const newNodeId = `node-${Date.now()}`;
                                                const newNode: MindMapNode = {
                                                    id: newNodeId,
                                                    label: 'تفرع جديد',
                                                    content: '',
                                                    parentId: selectedNode.id,
                                                    childrenIds: [],
                                                    color: 'bg-indigo-500',
                                                    iconName: 'info',
                                                    shape: MindMapShape.ROUNDED
                                                };
                                                setMindMaps(prev => prev.map(m => m.id === activeMapId ? {
                                                    ...m,
                                                    nodes: [...m.nodes, newNode].map(n => n.id === selectedNode.id ? { ...n, childrenIds: [...n.childrenIds, newNodeId]} : n)
                                                } : m));
                                                setSelectedNode(newNode);
                                            }} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>إضافة فرع</Button>
                                            <Button size="md" variant="danger" className="shrink-0 !p-3 shadow-lg" onClick={() => {
                                                 if(window.confirm("حذف هذا العنصر نهائياً؟")){
                                                     setMindMaps(prev => prev.map(m => m.id === activeMapId ? {
                                                         ...m,
                                                         nodes: m.nodes.filter(n => n.id !== selectedNode.id).map(n => n.id === selectedNode.parentId ? { ...n, childrenIds: n.childrenIds.filter(cid => cid !== selectedNode.id)} : n)
                                                     } : m));
                                                     setSelectedNode(null);
                                                 }
                                            }}><TrashIcon className="w-5 h-5"/></Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                        
                        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white dark:bg-dm-card">
                            <div className="p-5">
                                <h3 className="text-sm font-black border-b pb-4 mb-5 flex items-center gap-3">
                                    <Bars3Icon className="w-5 h-5"/> خصائص العرض
                                </h3>
                                <div className="space-y-5">
                                    <Input label="تعديل اسم الخريطة" value={activeMap?.title || ''} onChange={e => handleUpdateMap('title', e.target.value)} className="rounded-xl" />
                                    <Select label="نمط توزيع العناصر" value={activeMap?.layoutType || MindMapLayoutType.TREE_HORIZONTAL} options={mindMapLayoutOptions} onChange={e => handleUpdateMap('layoutType', e.target.value as MindMapLayoutType)} className="rounded-xl" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartMindMapPage;