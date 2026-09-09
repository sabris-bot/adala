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
  useReactFlow,
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MindMapData, MindMapLayoutType, MindMapShape } from '../../../types';
import { CustomNodeData } from '../types';
import { CustomMindMapNode } from './CustomMindMapNode';
import { MindMapToolbar } from './MindMapToolbar';
import { MindMapInspector } from './MindMapInspector';
import { MindMapAiGeneratorModal } from './MindMapAiGeneratorModal';
import { MindMapPrintExportModal } from './MindMapPrintExportModal';
import { MindMapNodeDetailModal } from './MindMapNodeDetailModal';
import { applyAutoLayout } from '../utils/layoutAlgorithms';
import { NODE_COLOR_PALETTES } from '../utils/themeConstants';
import { useToast } from '../../../components/ui/Toast';

interface MindMapEditorComponentProps {
  initialData: MindMapData;
  onClose: () => void;
  onSave: (data: any) => void;
  lang: string;
  onNavigateToCase?: (caseId: string) => void;
  onNavigateToContract?: (contractId: string) => void;
}

const nodeTypes = {
  strategic: CustomMindMapNode
};

export const MindMapEditorComponent: React.FC<MindMapEditorComponentProps> = ({
  initialData,
  onClose,
  onSave,
  lang,
  onNavigateToCase,
  onNavigateToContract
}) => {
  const { addToast } = useToast();
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState(initialData.title || 'مخطط استراتيجي جديد');
  const [layoutType, setLayoutType] = useState<MindMapLayoutType>(
    initialData.layoutType || MindMapLayoutType.DECISION_TREE
  );
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPrintExportOpen, setIsPrintExportOpen] = useState(false);
  const [printExportMode, setPrintExportMode] = useState<'print' | 'export'>('print');

  // Node details modal
  const [detailModalNode, setDetailModalNode] = useState<{ id: string; data: CustomNodeData } | null>(null);

  // Selected node for inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Listen for custom event to open node details modal
  useEffect(() => {
    const handleOpenDetails = (e: Event) => {
      const customEvt = e as CustomEvent<{ nodeId: string; data: CustomNodeData }>;
      if (customEvt.detail) {
        setDetailModalNode({
          id: customEvt.detail.nodeId,
          data: customEvt.detail.data
        });
      }
    };

    window.addEventListener('mindmap:open-node-details', handleOpenDetails);
    return () => window.removeEventListener('mindmap:open-node-details', handleOpenDetails);
  }, []);

  // Initialize nodes & edges from initialData
  const initialRfNodes = initialData.data?.rfNodes || [
    {
      id: 'root-1',
      type: 'strategic',
      position: { x: 500, y: 220 },
      data: {
        label: initialData.title || 'المحور الاستراتيجي الأساسي',
        content: 'سجل تفاصيل ومستندات هذا المحور القضائي أو الإداري...',
        colorClass: NODE_COLOR_PALETTES[0].class,
        shape: MindMapShape.ROUNDED,
        iconName: 'scale',
        priority: 'high',
        status: 'in_progress',
        isRoot: true,
        attachments: []
      }
    }
  ];

  const initialRfEdges = initialData.data?.rfEdges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialRfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialRfEdges);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Push to history when state changes
  const saveSnapshot = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, { nodes: newNodes, edges: newEdges }];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleConnect = useCallback((connection: Connection) => {
    setEdges((eds) => {
      const newEdges = addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' },
        style: { strokeWidth: 2.5, stroke: '#c19a5b' }
      }, eds);
      saveSnapshot(nodes, newEdges);
      return newEdges;
    });
  }, [nodes, saveSnapshot, setEdges]);

  // Handle Search and Highlighting
  useEffect(() => {
    if (!searchQuery.trim()) {
      setNodes(nds => nds.map(n => ({
        ...n,
        data: { ...n.data, searchHighlighted: false }
      })));
      return;
    }

    const q = searchQuery.toLowerCase();
    setNodes(nds => nds.map(n => {
      const nd = n.data as unknown as CustomNodeData;
      const match = (nd.label || '').toLowerCase().includes(q) ||
                    (nd.content || '').toLowerCase().includes(q) ||
                    (nd.legalArticle || '').toLowerCase().includes(q);
      return {
        ...n,
        data: { ...n.data, searchHighlighted: match }
      };
    }));
  }, [searchQuery, setNodes]);

  // Auto-Save Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave({
        rfNodes: nodes,
        rfEdges: edges,
        title,
        layoutType
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [nodes, edges, title, layoutType, onSave]);

  // Apply Auto-Layout algorithm
  const handleAutoLayout = useCallback((typeToApply?: MindMapLayoutType) => {
    const targetType = typeToApply || layoutType;
    const result = applyAutoLayout(nodes, edges, targetType, lang === 'ar');
    setNodes(result.nodes);
    setEdges(result.edges);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 600 });
    }, 50);
  }, [nodes, edges, layoutType, lang, setNodes, setEdges, fitView]);

  // Switch layout mode and re-align
  const handleLayoutChange = (newLayout: MindMapLayoutType) => {
    setLayoutType(newLayout);
    handleAutoLayout(newLayout);
    addToast({
      type: 'info',
      title: 'تم تغيير نمط المخطط',
      message: `تم تطبيق نمط العرض: ${newLayout}`
    });
  };

  // Add new standalone node
  const handleAddNode = () => {
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'strategic',
      position: { x: 500 + (Math.random() * 80 - 40), y: 300 + (Math.random() * 80 - 40) },
      data: {
        label: 'عقدة جديدة',
        content: 'اكتب تفاصيل هذا العنصر القانوني هنا...',
        colorClass: NODE_COLOR_PALETTES[1].class,
        shape: MindMapShape.ROUNDED,
        iconName: 'lightbulb',
        priority: 'medium',
        status: 'pending',
        attachments: []
      }
    };
    const nextNodes = nodes.concat(newNode);
    setNodes(nextNodes);
    saveSnapshot(nextNodes, edges);
    setSelectedNodeId(id);
  };

  // Undo / Redo
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

  // Node Selection Handler
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  };

  const onPaneClick = () => {
    setSelectedNodeId(null);
  };

  // Update specific node data from Inspector
  const handleUpdateNodeData = (id: string, updates: Partial<CustomNodeData>) => {
    setNodes(nds => nds.map(n => {
      if (n.id === id) {
        return {
          ...n,
          data: { ...n.data, ...updates }
        };
      }
      return n;
    }));
  };

  // Apply AI Generated Map
  const handleApplyGeneratedMap = (
    newTitle: string, 
    generatedNodes: Node[], 
    generatedEdges: Edge[], 
    newLayout: MindMapLayoutType
  ) => {
    setTitle(newTitle);
    setLayoutType(newLayout);
    setNodes(generatedNodes);
    setEdges(generatedEdges);
    saveSnapshot(generatedNodes, generatedEdges);
    setTimeout(() => {
      handleAutoLayout(newLayout);
    }, 100);
    addToast({
      type: 'success',
      title: 'تم توليد المخطط بنجاح',
      message: `تم إنشاء هيكل استراتيجي متكامل لموضوع: ${newTitle}`
    });
  };

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  return (
    <div 
      ref={canvasRef} 
      className="relative w-full h-screen bg-slate-900 overflow-hidden select-none"
    >
      {/* Top Floating Glassmorphism Toolbar */}
      <MindMapToolbar
        title={title}
        onTitleChange={setTitle}
        layoutType={layoutType}
        onLayoutChange={handleLayoutChange}
        onAutoLayout={() => handleAutoLayout()}
        onAddNode={handleAddNode}
        onOpenAiGenerator={() => setIsAiModalOpen(true)}
        onOpenPrintExport={(mode) => {
          setPrintExportMode(mode);
          setIsPrintExportOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onFitView={() => fitView({ padding: 0.2, duration: 500 })}
        onZoomIn={() => zoomIn({ duration: 300 })}
        onZoomOut={() => zoomOut({ duration: 300 })}
        onClose={onClose}
        nodeCount={nodes.length}
        lang={lang}
      />

      {/* Main Flow Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2.5, stroke: '#c19a5b' }
        }}
        className="w-full h-full"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#334155" 
          className="bg-slate-950" 
        />
        <MiniMap 
          nodeStrokeWidth={3}
          nodeColor={(n) => {
            const nd = n.data as unknown as CustomNodeData;
            if (nd.isRoot) return '#c19a5b';
            if (nd.priority === 'high') return '#e11d48';
            return '#0284c7';
          }}
          className="!bg-slate-900/90 !border !border-slate-800 !rounded-2xl !shadow-xl !bottom-4 !right-4"
          maskColor="rgba(15, 23, 42, 0.7)"
        />
      </ReactFlow>

      {/* Slide-over Node Inspector */}
      {selectedNode && (
        <MindMapInspector
          selectedNode={selectedNode}
          onUpdateNodeData={handleUpdateNodeData}
          onClose={() => setSelectedNodeId(null)}
          onAiExpandNode={(id) => {
            const nd = selectedNode.data as unknown as CustomNodeData;
            addToast({
              type: 'info',
              title: 'توسيع بالذكاء الاصطناعي',
              message: `جاري توليد دفوع ومقترحات لعنصر: ${nd.label}`
            });
          }}
        />
      )}

      {/* AI Mind Map Generator Modal */}
      {isAiModalOpen && (
        <MindMapAiGeneratorModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onApplyGeneratedMap={handleApplyGeneratedMap}
        />
      )}

      {/* Smart Print & Export Modal */}
      {isPrintExportOpen && (
        <MindMapPrintExportModal
          isOpen={isPrintExportOpen}
          onClose={() => setIsPrintExportOpen(false)}
          title={title}
          nodes={nodes}
          edges={edges}
          canvasRef={canvasRef}
          defaultMode={printExportMode}
        />
      )}

      {/* Dynamic Linked Node Details Modal */}
      {detailModalNode && (
        <MindMapNodeDetailModal
          isOpen={Boolean(detailModalNode)}
          onClose={() => setDetailModalNode(null)}
          nodeData={detailModalNode.data}
          nodeId={detailModalNode.id}
          onNavigateToCase={onNavigateToCase}
          onNavigateToContract={onNavigateToContract}
        />
      )}
    </div>
  );
};
