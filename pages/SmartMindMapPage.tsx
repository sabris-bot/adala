
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
    mindMapNodeIcons 
} from '../constants';
import { MindMapData, MindMapNode, MindMapEdge, MindMapLayoutType, AISuggestedNode, Case, ComplianceRequirement, ComplianceStatus, MindMapShape } from '../types';
import { mindMapLayoutOptions, nodeColorOptions, mindMapShapeOptions } from '../constants'; 
import { geminiService } from '../services/geminiService';
import { initialCases } from './CaseListPage'; 
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
            { id: 'ex1-c1a', label: 'الأدلة الداعمة', content: 'العقد الموقع، المراسلات الإلكترونية، تقرير استلام أولي.', parentId: 'ex1-c1', childrenIds: [], color: 'bg-green-600', iconName: 'folder', shape: MindMapShape.RECTANGLE },
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
        id: 'map-example-3',
        title: 'مثال: إجراء تأديبي لموظف (هيكل تنظيمي)',
        layoutType: MindMapLayoutType.ORGANIZATION_CHART,
        createdAt: new Date().toISOString(),
        nodes: [
            { id: 'ex3-root', label: 'مخالفة الموظف (س)', content: 'نوع المخالفة: غياب متكرر.', parentId: null, childrenIds: ['ex3-c1'], color: 'bg-primary', iconName: 'warning', shape: MindMapShape.ROUNDED },
            { id: 'ex3-c1', label: 'التحقيق الإداري', content: 'جمع الأدلة وسماع أقوال الموظف.', parentId: 'ex3-root', childrenIds: ['ex3-c1a', 'ex3-c1b'], color: 'bg-blue-600', iconName: 'folder', shape: MindMapShape.ROUNDED },
            { id: 'ex3-c1a', label: 'جمع الأدلة', content: 'سجلات الحضور، تقرير المدير المباشر.', parentId: 'ex3-c1', childrenIds: [], color: 'bg-teal-500', iconName: 'folder', shape: MindMapShape.RECTANGLE },
            { id: 'ex3-c1b', label: 'جلسة الاستماع', content: 'توثيق أقوال الموظف ودفاعه.', parentId: 'ex3-c1', childrenIds: [], color: 'bg-teal-500', iconName: 'users', shape: MindMapShape.RECTANGLE },
            { id: 'ex3-c2', label: 'الرأي القانوني', content: 'تكييف الواقعة وتحديد الجزاء المناسب.', parentId: 'ex3-root', childrenIds: [], color: 'bg-yellow-500', iconName: 'lightbulb', shape: MindMapShape.RECTANGLE },
            { id: 'ex3-c3', label: 'اتخاذ القرار', content: 'إصدار قرار الجزاء وإبلاغ الموظف.', parentId: 'ex3-root', childrenIds: [], color: 'bg-red-500', iconName: 'task', shape: MindMapShape.RECTANGLE },
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
  isSelected: boolean; 
}> = React.memo(({ node, onSelect, isSelected }) => {
    const selectedBorderClass = isSelected ? 'ring-2 ring-offset-2 dark:ring-offset-dm-background ring-accent-DEFAULT shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl';
    const NodeIconComponent = mindMapNodeIcons[node.iconName || 'default'] || mindMapNodeIcons.default;
    
    const getShapeClass = (shape?: MindMapShape) => {
        switch (shape) {
            case MindMapShape.RECTANGLE: return 'shape-rectangle';
            case MindMapShape.PILL: return 'shape-pill';
            case MindMapShape.OVAL: return 'shape-oval';
            case MindMapShape.DIAMOND: return 'shape-diamond';
            case MindMapShape.PARALLELOGRAM: return 'shape-parallelogram';
            case MindMapShape.ROUNDED:
            default: return 'rounded-lg';
        }
    };

    return (
      <div 
        className={`node-display node-card p-3 border border-black/10 dark:border-white/10 ${selectedBorderClass} ${node.color} min-w-[200px] max-w-[280px] transition-all duration-150 transform cursor-pointer text-white ${getShapeClass(node.shape)}`}
        onClick={(e) => { e.stopPropagation(); onSelect(node);}}
      >
        <div className="flex items-center mb-1">
          <NodeIconComponent className="w-4 h-4 me-2 flex-shrink-0" />
          <p className="text-sm font-semibold truncate">{node.label || "بدون عنوان"}</p>
        </div>
        {node.content && <p className="text-xs mt-1 opacity-90 line-clamp-3 leading-snug">{node.content}</p>}
      </div>
    );
});

// --- Recursive Tree Renderer ---
const TreeRenderer: React.FC<{
  nodes: MindMapNode[];
  nodeId: string;
  onSelect: (node: MindMapNode) => void;
  selectedNodeId: string | null;
  layout: MindMapLayoutType;
}> = ({ nodes, nodeId, onSelect, selectedNodeId, layout }) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const children = node.childrenIds.map(childId => (
        <li key={childId}>
            <TreeRenderer
                nodes={nodes}
                nodeId={childId}
                onSelect={onSelect}
                selectedNodeId={selectedNodeId}
                layout={layout}
            />
        </li>
    ));

    const isHorizontal = layout === MindMapLayoutType.TREE_HORIZONTAL || layout === MindMapLayoutType.FLOWCHART_HORIZONTAL;
    const isFlowchart = layout === MindMapLayoutType.FLOWCHART_HORIZONTAL || layout === MindMapLayoutType.FLOWCHART_VERTICAL;

    const layoutClass = {
        [MindMapLayoutType.TREE_HORIZONTAL]: 'tree-h',
        [MindMapLayoutType.ORGANIZATION_CHART]: 'tree-v',
        [MindMapLayoutType.FLOWCHART_HORIZONTAL]: 'flow-h',
        [MindMapLayoutType.FLOWCHART_VERTICAL]: 'flow-v',
        [MindMapLayoutType.RADIAL]: 'radial' // placeholder
    }[layout] || 'tree-h';

    return (
        <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center p-2 relative`}>
            <NodeDisplay node={node} onSelect={onSelect} isSelected={node.id === selectedNodeId} />
            {children.length > 0 && (
                <ul className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} ${isFlowchart ? 'gap-x-8' : 'gap-y-4'} ${!isFlowchart ? 'pl-8' : ''}`}>
                    {children}
                </ul>
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
    
    // AI Generation state
    const [aiText, setAiText] = useState('');
    const [selectedCaseId, setSelectedCaseId] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeMap = useMemo(() => mindMaps.find(m => m.id === activeMapId), [mindMaps, activeMapId]);

    const handleSelectNode = useCallback((node: MindMapNode) => {
        setSelectedNode(node);
    }, []);
    
    useEffect(() => {
        // If the active map is deleted, or on initial load, reset selection
        if (!activeMap) {
            setSelectedNode(null);
        } else {
            // Ensure selected node is still valid for the active map
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
        <Card title="مكتبة الخرائط الذهنية">
            <p className="text-sm text-gray-600 mb-4">اختر خريطة للبدء أو أنشئ واحدة جديدة من لوحة التحكم على اليمين.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mindMaps.map(map => (
                    <Card key={map.id} title={map.title} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveMapId(map.id)}>
                        <p className="text-xs text-gray-500">عدد العقد: {map.nodes.length}</p>
                        <p className="text-xs text-gray-500">نوع التخطيط: {mindMapLayoutOptions.find(o => o.value === map.layoutType)?.label}</p>
                        <p className="text-xs text-gray-500 mt-2">آخر تحديث: {formatDate(map.updatedAt || map.createdAt)}</p>
                    </Card>
                ))}
            </div>
        </Card>
    );

    const renderMapEditor = () => (
        <div className="relative">
            <div ref={mapAreaRef} className="overflow-auto p-4 bg-gray-50 dark:bg-dm-card/50 rounded-lg h-[75vh] scrollbar-thin">
                {activeMap && rootNode ? (
                     <div className={activeMap.layoutType === MindMapLayoutType.ORGANIZATION_CHART ? 'tree-v' : 'tree-h'}>
                        <TreeRenderer 
                            nodes={activeMap.nodes}
                            nodeId={rootNode.id}
                            onSelect={handleSelectNode}
                            selectedNodeId={selectedNode?.id || null}
                            layout={activeMap.layoutType}
                        />
                    </div>
                ) : (
                    <p>خطأ: لم يتم العثور على العقدة الجذرية للخريطة.</p>
                )}
            </div>
             <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <Button variant="secondary" size="sm" className="rounded-full !p-2" onClick={() => handleScroll(mapAreaRef, 'top')}><ArrowUpCircleIcon className="w-5 h-5"/></Button>
                <Button variant="secondary" size="sm" className="rounded-full !p-2" onClick={() => handleScroll(mapAreaRef, 'bottom')}><ArrowDownCircleIcon className="w-5 h-5"/></Button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <CpuChipIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark">الخرائط الذهنية الذكية</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    {activeMap ? renderMapEditor() : renderMapGallery()}
                </div>
                <div className="lg:col-span-4 relative">
                    <div ref={controlPanelRef} className="space-y-4 h-[80vh] overflow-y-auto scrollbar-thin p-1">
                        <Card title="لوحة التحكم" actions={activeMap && <Button size="sm" variant="outline" onClick={() => setActiveMapId(null)}>عرض كل الخرائط</Button>}>
                           {/* AI Generation Section */}
                           <Card title="إنشاء خريطة جديدة (AI)" titleClassName="text-sm">
                               {isLoading ? <LoadingSpinner/> : (
                                   <div className="space-y-3 text-sm">
                                       <div>
                                           <TextArea label="من نص" value={aiText} onChange={e=>setAiText(e.target.value)} rows={3} placeholder="الصق نصًا هنا..."/>
                                           <Button size="sm" className="w-full mt-1" onClick={() => handleAiGenerate('text', 'من نص')} disabled={!aiText}>إنشاء من النص</Button>
                                       </div>
                                       <div className="border-t pt-2">
                                           <Select label="من قضية مسجلة" value={selectedCaseId} onChange={e=>setSelectedCaseId(e.target.value)} options={[{value:'', label:'اختر قضية'}, ...initialCases.map(c=>({value:c.id, label:`${c.caseNumber} - ${c.title}`}))]}/>
                                           <Button size="sm" className="w-full mt-1" onClick={() => handleAiGenerate('case', 'ملخص قضية')} disabled={!selectedCaseId}>إنشاء من القضية</Button>
                                       </div>
                                       <div className="border-t pt-2">
                                           <p className="font-medium text-gray-700 mb-1">من قسم بالنظام</p>
                                           <Button size="sm" className="w-full" onClick={() => handleAiGenerate('compliance', 'ملخص الامتثال')}>إنشاء ملخص لمهام الامتثال النشطة</Button>
                                       </div>
                                   </div>
                               )}
                           </Card>

                           {/* Node Editor Section */}
                           {activeMap && (
                               <Card title="تحرير العقدة المحددة" titleClassName="text-sm">
                                   {selectedNode ? (
                                       <div className="space-y-3">
                                           <Input label="عنوان العقدة" value={selectedNode.label} onChange={e => handleUpdateNode({...selectedNode, label: e.target.value})} />
                                           <TextArea label="المحتوى" value={selectedNode.content || ''} onChange={e => handleUpdateNode({...selectedNode, content: e.target.value})} rows={5} />
                                           <Select label="لون العقدة" value={selectedNode.color} options={nodeColorOptions} onChange={e => handleUpdateNode({...selectedNode, color: e.target.value})} />
                                           <Select label="أيقونة العقدة" value={selectedNode.iconName} options={Object.keys(mindMapNodeIcons).map(key => ({value: key, label: key}))} onChange={e => handleUpdateNode({...selectedNode, iconName: e.target.value})} />
                                           <Select label="شكل العقدة" value={selectedNode.shape} options={mindMapShapeOptions} onChange={e => handleUpdateNode({...selectedNode, shape: e.target.value as MindMapShape})} />
                                       </div>
                                   ) : <p className="text-center text-xs text-gray-500 py-4">حدد عقدة من الخريطة لتعديلها.</p>}
                               </Card>
                           )}

                           {/* Map Settings Section */}
                           {activeMap && (
                               <Card title="إعدادات الخريطة الحالية" titleClassName="text-sm">
                                   <Input label="عنوان الخريطة" value={activeMap.title} onChange={e => handleUpdateMap('title', e.target.value)} />
                                   <Select label="نوع التخطيط" value={activeMap.layoutType} options={mindMapLayoutOptions} onChange={e => handleUpdateMap('layoutType', e.target.value as MindMapLayoutType)} containerClassName="mt-2"/>
                                   <Button size="sm" variant="danger" className="w-full mt-3" onClick={() => {
                                        if(window.confirm(`هل أنت متأكد من حذف خريطة "${activeMap.title}"؟`)){
                                            setMindMaps(prev => prev.filter(m => m.id !== activeMap.id));
                                            setActiveMapId(null);
                                        }
                                   }}>حذف الخريطة</Button>
                               </Card>
                           )}
                        </Card>
                    </div>
                    <div className="absolute bottom-1 right-1 flex flex-col space-y-2">
                        <Button variant="secondary" size="sm" className="rounded-full !p-2" onClick={() => handleScroll(controlPanelRef, 'top')}><ArrowUpCircleIcon className="w-5 h-5"/></Button>
                        <Button variant="secondary" size="sm" className="rounded-full !p-2" onClick={() => handleScroll(controlPanelRef, 'bottom')}><ArrowDownCircleIcon className="w-5 h-5"/></Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartMindMapPage;
