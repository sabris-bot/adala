import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { MindMapData, MindMapLayoutType, MindMapShape } from '../types';
import { KUWAIT_LEGAL_TEMPLATES } from './mindmaps/data/defaultTemplates';
import { MindMapGallery } from './mindmaps/components/MindMapGallery';
import { MindMapEditorComponent } from './mindmaps/components/MindMapEditorComponent';
import { NODE_COLOR_PALETTES } from './mindmaps/utils/themeConstants';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { Node, Edge } from '@xyflow/react';

const STORAGE_KEY = 'adala_smart_mind_maps_v3';

export const SmartMindMapPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { i18n } = useTranslation();
  const lang = i18n.language || 'ar';

  // Load mind maps from localStorage or fallback to default template copies
  const [mindMaps, setMindMaps] = useState<MindMapData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load mind maps from localStorage:", e);
    }
    // Default seed from templates
    return KUWAIT_LEGAL_TEMPLATES.slice(0, 3);
  });

  const [activeMapId, setActiveMapId] = useState<string | null>(null);

  // Auto-sync with local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mindMaps));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        addToast({
          type: 'error',
          title: 'مساحة التخزين ممتلئة',
          message: 'يرجى حذف بعض المخططات القديمة لتحرير مساحة التخزين.'
        });
      }
    }
  }, [mindMaps, addToast]);

  const activeMap = useMemo(() => {
    return mindMaps.find(m => m.id === activeMapId) || null;
  }, [mindMaps, activeMapId]);

  // Create brand new blank map
  const handleCreateNew = () => {
    const id = `map-${Date.now()}`;
    const newMap: MindMapData = {
      id,
      title: 'مخطط استراتيجي قانوني جديد',
      layoutType: MindMapLayoutType.DECISION_TREE,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'cases',
      data: {
        rfNodes: [
          {
            id: 'root-1',
            type: 'strategic',
            position: { x: 500, y: 220 },
            data: {
              label: 'المحور الاستراتيجي الأساسي',
              content: 'سجل تفاصيل وملاحظات هذا المحور القضائي أو الإداري...',
              colorClass: NODE_COLOR_PALETTES[0].class,
              shape: MindMapShape.ROUNDED,
              iconName: 'scale',
              priority: 'high',
              status: 'in_progress',
              isRoot: true,
              attachments: []
            }
          }
        ],
        rfEdges: []
      }
    };
    setMindMaps(prev => [newMap, ...prev]);
    setActiveMapId(id);
  };

  // Update existing map
  const handleUpdateMap = (id: string, updates: Partial<MindMapData>) => {
    setMindMaps(prev => prev.map(m => m.id === id ? { 
      ...m, 
      ...updates,
      title: updates.data?.title || updates.title || m.title,
      layoutType: updates.data?.layoutType || updates.layoutType || m.layoutType,
      updatedAt: new Date().toISOString() 
    } : m));
  };

  // Delete map
  const handleDeleteMap = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المخطط الذهني نهائياً؟')) {
      setMindMaps(prev => prev.filter(m => m.id !== id));
      if (activeMapId === id) setActiveMapId(null);
      addToast({
        type: 'info',
        title: 'تم الحذف',
        message: 'تم حذف المخطط الذهني بنجاح.'
      });
    }
  };

  // Clone map
  const handleCloneMap = (id: string) => {
    const source = mindMaps.find(m => m.id === id);
    if (!source) return;
    const clonedId = `map-copy-${Date.now()}`;
    const cloned: MindMapData = {
      ...source,
      id: clonedId,
      title: `${source.title} (نسخة معدلة)`,
      createdAt: new Date().toISOString()
    };
    setMindMaps(prev => [cloned, ...prev]);
    addToast({
      type: 'success',
      title: 'تم تكرار المخطط',
      message: 'تم إنشاء نسخة مكررة من المخطط.'
    });
  };

  // Launch Template
  const handleLaunchTemplate = (template: MindMapData) => {
    const clonedId = `map-tpl-${Date.now()}`;
    const cloned: MindMapData = {
      ...template,
      id: clonedId,
      title: `${template.title} (مخصص)`,
      createdAt: new Date().toISOString()
    };
    setMindMaps(prev => [cloned, ...prev]);
    setActiveMapId(clonedId);
  };

  // Apply AI Generated Map from Gallery
  const handleApplyAiGeneratedMap = (
    title: string, 
    nodes: Node[], 
    edges: Edge[], 
    layout: MindMapLayoutType
  ) => {
    const id = `map-ai-${Date.now()}`;
    const newMap: MindMapData = {
      id,
      title,
      layoutType: layout,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      category: 'cases',
      data: {
        rfNodes: nodes,
        rfEdges: edges,
        title,
        layoutType: layout
      }
    };
    setMindMaps(prev => [newMap, ...prev]);
    setActiveMapId(id);
  };

  if (activeMapId && activeMap) {
    return (
      <ReactFlowProvider>
        <MindMapEditorComponent
          initialData={activeMap}
          onClose={() => setActiveMapId(null)}
          onSave={(data) => handleUpdateMap(activeMapId, { data })}
          lang={lang}
          onNavigateToCase={(caseId) => navigate(`/cases/${caseId}`)}
          onNavigateToContract={() => navigate('/contracts')}
        />
      </ReactFlowProvider>
    );
  }

  return (
    <MindMapGallery
      mindMaps={mindMaps}
      onOpenMap={(id) => setActiveMapId(id)}
      onCreateNew={handleCreateNew}
      onDeleteMap={handleDeleteMap}
      onCloneMap={handleCloneMap}
      onLaunchTemplate={handleLaunchTemplate}
      onApplyAiGeneratedMap={handleApplyAiGeneratedMap}
      lang={lang}
    />
  );
};

export default SmartMindMapPage;
