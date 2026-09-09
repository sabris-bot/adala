import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, Node, Edge, addEdge, MarkerType } from '@xyflow/react';
import { 
  Plus, Trash2, Edit3, Sparkles, Check, Paperclip, 
  Link2, ChevronDown, ChevronUp, Copy, BookOpen, AlertCircle, 
  Clock, ShieldAlert, CheckCircle2, User, FileText, ArrowDownRight,
  Maximize2, Eye
} from 'lucide-react';
import { MindMapShape } from '../../../types';
import { CustomNodeData } from '../types';
import { 
  NODE_COLOR_PALETTES, 
  ICONS_REGISTRY, 
  getShapeClass, 
  getInnerShapeClass 
} from '../utils/themeConstants';

interface CustomMindMapNodeProps {
  id: string;
  data: CustomNodeData;
  selected: boolean;
}

export const CustomMindMapNode: React.FC<CustomMindMapNodeProps> = ({ id, data, selected }) => {
  const { setNodes, setEdges, getNode, getNodes, getEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label || '');
  const [tempContent, setTempContent] = useState(data.content || '');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setTempLabel(data.label || '');
    setTempContent(data.content || '');
  }, [data.label, data.content]);

  // Find color palette config
  const colorConfig = NODE_COLOR_PALETTES.find(c => c.class === data.colorClass) || NODE_COLOR_PALETTES[0];
  const IconComponent = ICONS_REGISTRY[data.iconName || 'scale'] || FileText;

  // Calculate children count
  const allEdges = getEdges();
  const childEdges = allEdges.filter(e => e.source === id);
  const hasChildren = childEdges.length > 0;
  const isCollapsed = Boolean(data.collapsed);

  const handleSaveEdit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.stopPropagation();
    setIsEditing(false);
    setNodes(nds => nds.map(n => n.id === id ? {
      ...n,
      data: {
        ...n.data,
        label: tempLabel.trim() || 'عنصر بدون عنوان',
        content: tempContent
      }
    } : n));
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setTempLabel(data.label || '');
    setTempContent(data.content || '');
  };

  // Add child branch directly
  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const childId = `node-${Date.now()}`;
    const parentNode = getNode(id);
    const parentX = parentNode?.position?.x || 0;
    const parentY = parentNode?.position?.y || 0;

    const newNode: Node = {
      id: childId,
      type: 'strategic',
      position: { x: parentX - 280, y: parentY + 160 },
      data: {
        label: `فرع جديد عن: ${data.label}`,
        content: 'سجل تفاصيل وملاحظات هذا الفرع هنا...',
        colorClass: NODE_COLOR_PALETTES[3].class,
        shape: MindMapShape.ROUNDED,
        iconName: 'filetext',
        priority: 'medium',
        status: 'pending',
        attachments: [],
        linkedEntity: null
      }
    };

    setNodes(nds => nds.concat(newNode));
    setEdges(eds => addEdge({
      id: `edge-${id}-${childId}`,
      source: id,
      target: childId,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: colorConfig.accentBorder || '#c19a5b' },
      style: { strokeWidth: 2.5, stroke: colorConfig.accentBorder || '#c19a5b' }
    }, eds));
  };

  // AI Expand branch quick action
  const handleAiExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    const parentNode = getNode(id);
    const parentX = parentNode?.position?.x || 0;
    const parentY = parentNode?.position?.y || 0;

    const suggestions = [
      { label: `الدفع القانوني المرتبط بـ (${data.label})`, content: 'التمسك بالدفوع الموضوعية والمستندات الدالة وفق المادة ذات الصلة.', icon: 'scale', color: NODE_COLOR_PALETTES[4].class },
      { label: `المستند والإثبات المطلوب: (${data.label})`, content: 'استخراج شهادة رسمية من الجهة المختصة أو كشف الحساب المصرفي.', icon: 'filecheck', color: NODE_COLOR_PALETTES[2].class }
    ];

    const newNodes: Node[] = suggestions.map((s, idx) => ({
      id: `node-ai-${Date.now()}-${idx}`,
      type: 'strategic',
      position: { x: parentX - 320, y: parentY + (idx === 0 ? -90 : 130) },
      data: {
        label: s.label,
        content: s.content,
        colorClass: s.color,
        shape: MindMapShape.ROUNDED,
        iconName: s.icon,
        priority: 'high',
        status: 'in_progress',
        attachments: []
      }
    }));

    const newEdges: Edge[] = newNodes.map(n => ({
      id: `edge-${id}-${n.id}`,
      source: id,
      target: n.id,
      type: 'smoothstep',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' },
      style: { strokeWidth: 2.5, stroke: '#c19a5b' }
    }));

    setNodes(nds => nds.concat(newNodes));
    setEdges(eds => eds.concat(newEdges));
  };

  // Duplicate node
  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const parentNode = getNode(id);
    const newId = `node-copy-${Date.now()}`;
    const newNode: Node = {
      id: newId,
      type: 'strategic',
      position: { x: (parentNode?.position?.x || 0) + 40, y: (parentNode?.position?.y || 0) + 40 },
      data: {
        ...data,
        label: `${data.label} (نسخة)`
      }
    };
    setNodes(nds => nds.concat(newNode));
  };

  // Delete node
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  };

  // Toggle Collapse / Expand
  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextCollapsed = !isCollapsed;

    // Helper to recursively hide or show descendant nodes
    const descendantIds = new Set<string>();
    const findDescendants = (parentId: string) => {
      const edges = allEdges.filter(e => e.source === parentId);
      edges.forEach(e => {
        descendantIds.add(e.target);
        findDescendants(e.target);
      });
    };
    findDescendants(id);

    setNodes(nds => nds.map(n => {
      if (n.id === id) {
        return { ...n, data: { ...n.data, collapsed: nextCollapsed } };
      }
      if (descendantIds.has(n.id)) {
        return { ...n, hidden: nextCollapsed };
      }
      return n;
    }));

    setEdges(eds => eds.map(e => {
      if (descendantIds.has(e.target) || descendantIds.has(e.source)) {
        return { ...e, hidden: nextCollapsed };
      }
      return e;
    }));
  };

  // Drag and drop attachment support
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
        type: file.type || 'Document'
      };
      setNodes(nds => nds.map(n => n.id === id ? {
        ...n,
        data: {
          ...n.data,
          attachments: [...((n.data.attachments as any[]) || []), newAttach]
        }
      } : n));
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative transition-all duration-300 min-w-[300px] max-w-[360px] group select-none text-right
        ${getShapeClass(data.shape)}
        ${data.colorClass || NODE_COLOR_PALETTES[0].class}
        ${selected 
          ? 'ring-4 ring-amber-500/80 shadow-2xl scale-[1.02] z-30' 
          : 'hover:shadow-xl hover:scale-[1.01] shadow-md'}
        ${isDragOver ? 'border-dashed border-amber-400 bg-amber-500/10 scale-105' : ''}
        ${data.searchHighlighted ? 'ring-4 ring-amber-400 animate-pulse' : ''}
      `}
      style={{
        boxShadow: selected ? `0 20px 35px -10px ${colorConfig.glow}` : undefined
      }}
    >
      {/* 4 Multi-Directional Handles for seamless connection */}
      <Handle type="target" position={Position.Top} id="top" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform !cursor-crosshair" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform !cursor-crosshair" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform !cursor-crosshair" />
      <Handle type="target" position={Position.Left} id="left" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white dark:!border-slate-900 hover:!scale-150 transition-transform !cursor-crosshair" />

      {/* Floating Action Bar on Hover / Selection */}
      <div className={`
        absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 dark:bg-slate-950/95 text-white px-2.5 py-1 rounded-xl shadow-xl border border-slate-700/80 transition-all duration-200 z-40
        ${selected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto'}
      `}>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('mindmap:open-node-details', { detail: { nodeId: id, data } }));
          }}
          title="عرض كارت التفاصيل والبيانات المرتبطة"
          className="p-1 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors text-sky-400 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleAddChild} 
          title="إضافة تفرع جديد (+)"
          className="p-1 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleAiExpand} 
          title="توليد وتوسيع بالذكاء الاصطناعي"
          className="p-1 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors text-amber-400 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => setIsEditing(true)} 
          title="تعديل سريع للنصوص"
          className="p-1 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleDuplicate} 
          title="تكرار العقدة"
          className="p-1 hover:bg-amber-500 hover:text-slate-950 rounded-lg transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-3 bg-slate-700 mx-0.5" />
        <button 
          onClick={handleDelete} 
          title="حذف العقدة"
          className="p-1 hover:bg-rose-500 hover:text-white rounded-lg transition-colors text-rose-400 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className={`${getInnerShapeClass(data.shape)} p-4.5`}>
        {/* Stage Number / Root Indicator */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {data.isRoot && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono tracking-tight shadow-xs">
                المحور الرئيسي
              </span>
            )}
            {data.stageNumber && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-500 text-white font-mono shadow-xs">
                المرحلة #{data.stageNumber}
              </span>
            )}
            {data.legalArticle && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800/10 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1">
                <BookOpen className="w-2.5 h-2.5" />
                {data.legalArticle}
              </span>
            )}
          </div>

          {/* Priority & Status Badges */}
          <div className="flex items-center gap-1">
            {data.priority === 'high' && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                عاجل 🟥
              </span>
            )}
            {data.status === 'completed' && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                مكتمل ✅
              </span>
            )}
          </div>
        </div>

        {/* Card Header with Icon & Title */}
        {isEditing ? (
          <div className="space-y-2.5 w-full my-1" onClick={(e) => e.stopPropagation()}>
            <input 
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              className="w-full text-xs font-black p-2 border-2 border-amber-500 rounded-xl focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="عنوان العقدة..."
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(e)}
            />
            <textarea 
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              className="w-full text-[11px] font-medium p-2 border border-slate-300 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none h-16"
              placeholder="الشرح والتفاصيل الإجرائية..."
            />
            <div className="flex gap-1.5 justify-end">
              <button 
                onClick={handleCancelEdit} 
                className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] px-2.5 py-1 rounded-lg font-bold hover:bg-slate-300 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="bg-amber-500 text-slate-950 text-[10px] px-3 py-1 rounded-lg font-black hover:bg-amber-400 transition-colors shadow-xs"
              >
                حفظ
              </button>
            </div>
          </div>
        ) : (
          <div onDoubleClick={() => setIsEditing(true)}>
            <div className="flex items-start gap-2.5 mb-2">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5"
                style={{ backgroundColor: colorConfig.hex }}
              >
                <IconComponent className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-extrabold tracking-tight leading-snug line-clamp-2 hover:text-amber-500 transition-colors cursor-pointer" title="انقر مرتين للتعديل السريع">
                  {data.label}
                </h3>
              </div>
            </div>

            {data.content && (
              <p className="text-[11px] font-medium leading-relaxed opacity-85 line-clamp-3 select-none mb-2.5">
                {data.content}
              </p>
            )}

            {/* Linked System Entity Card / Badge */}
            {data.linkedEntity && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(new CustomEvent('mindmap:open-node-details', { detail: { nodeId: id, data } }));
                }}
                className="mb-2.5 p-2 rounded-xl bg-slate-950/10 dark:bg-white/5 border border-slate-950/10 dark:border-white/10 flex items-center justify-between text-[10px] hover:border-amber-500/60 transition-colors cursor-pointer group/link"
                title="انقر لعرض تفاصيل السجل المرتبط بالنظام"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Link2 className="w-3.5 h-3.5 text-amber-500 shrink-0 group-hover/link:rotate-45 transition-transform" />
                  <span className="font-extrabold truncate text-slate-800 dark:text-slate-200">
                    {data.linkedEntity.name}
                  </span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-900/10 dark:bg-white/10 shrink-0">
                  {data.linkedEntity.type === 'case' ? 'ملف قضية' : data.linkedEntity.type === 'contract' ? 'عقد' : 'عميل'}
                </span>
              </div>
            )}

            {/* Attachments List */}
            {data.attachments && data.attachments.length > 0 && (
              <div className="mb-2.5 pt-2 border-t border-slate-500/20 space-y-1">
                <div className="flex items-center gap-1 text-[9px] font-bold opacity-75">
                  <Paperclip className="w-3 h-3" />
                  <span>المستندات المرفقة ({data.attachments.length}):</span>
                </div>
                <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
                  {data.attachments.map(att => (
                    <div 
                      key={att.id}
                      className="text-[9px] font-bold px-2 py-1 rounded-lg bg-white/40 dark:bg-slate-950/40 flex items-center justify-between border border-slate-500/10"
                    >
                      <span className="truncate max-w-[190px]">{att.name}</span>
                      <span className="text-[8px] opacity-70 font-mono">{att.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer info: Expand / Collapse toggle button */}
        {hasChildren && (
          <div className="pt-2 border-t border-slate-500/15 flex items-center justify-between">
            <button
              onClick={handleToggleCollapse}
              className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg bg-white/60 dark:bg-slate-950/60 hover:bg-amber-400 hover:text-slate-950 transition-all border border-slate-400/20 cursor-pointer shadow-3xs"
              title={isCollapsed ? 'فتح الفروع التابعة' : 'طي وإخفاء الفروع التابعة'}
            >
              {isCollapsed ? (
                <>
                  <ChevronDown className="w-3 h-3 text-amber-500" />
                  <span>إظهار الفروع ({childEdges.length})</span>
                </>
              ) : (
                <>
                  <ChevronUp className="w-3 h-3" />
                  <span>طي الفروع ({childEdges.length})</span>
                </>
              )}
            </button>
            <span className="text-[9px] opacity-60 font-mono font-bold">
              {childEdges.length} تفرع
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
