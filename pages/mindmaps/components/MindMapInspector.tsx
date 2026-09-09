import React, { useState } from 'react';
import { 
  X, Sparkles, Link2, Paperclip, Trash2, Plus, 
  Palette, Shapes, Tag, User, Calendar, BookOpen, 
  AlertCircle, CheckCircle2, ShieldAlert, FileText, 
  Scale, Briefcase, ChevronRight, ExternalLink, Download
} from 'lucide-react';
import { Node } from '@xyflow/react';
import { MindMapShape } from '../../../types';
import { CustomNodeData, LinkedEntity } from '../types';
import { NODE_COLOR_PALETTES, ICONS_REGISTRY } from '../utils/themeConstants';
import { initialCases } from '../../../data/caseData';
import Button from '../../../components/ui/Button';

interface MindMapInspectorProps {
  selectedNode: Node | null;
  onUpdateNodeData: (id: string, updates: Partial<CustomNodeData>) => void;
  onClose: () => void;
  onAiExpandNode: (id: string) => void;
}

export const MindMapInspector: React.FC<MindMapInspectorProps> = ({
  selectedNode,
  onUpdateNodeData,
  onClose,
  onAiExpandNode
}) => {
  if (!selectedNode) return null;

  const data = selectedNode.data as unknown as CustomNodeData;
  const [activeTab, setActiveTab] = useState<'content' | 'linking' | 'style' | 'attachments'>('content');
  const [linkSearch, setLinkSearch] = useState('');

  const shapeOptions = [
    { value: MindMapShape.ROUNDED, label: 'مستدير الحواف' },
    { value: MindMapShape.PILL, label: 'كبسولة (Pill)' },
    { value: MindMapShape.RECTANGLE, label: 'مستطيل قياسي' },
    { value: MindMapShape.OVAL, label: 'بيضاوي' },
    { value: MindMapShape.DIAMOND, label: 'معين قرار (Diamond)' },
    { value: MindMapShape.PARALLELOGRAM, label: 'متوازي أضلاع' }
  ];

  // Dummy mock contracts / clients for linking options alongside initialCases
  const availableEntities: LinkedEntity[] = [
    ...initialCases.map(c => ({
      type: 'case' as const,
      id: c.id,
      name: `قضية رقم ${c.caseNumber} - ${c.title}`,
      subtitle: `العميل: ${c.clientName} | المحكمة: ${c.courtName}`,
      referenceNumber: c.caseNumber
    })),
    {
      type: 'contract' as const,
      id: 'ctr-101',
      name: 'عقد استشارات وتطوير برمجيات وحماية ملكية فكرية',
      subtitle: 'شركة وفرة للاستثمار | القيمة: 45,000 د.ك',
      referenceNumber: 'CTR-2026-091'
    },
    {
      type: 'contract' as const,
      id: 'ctr-102',
      name: 'اتفاقية تسوية تخارج وتوزيع أرباح شركاء',
      subtitle: 'مجموعة الصالحية التجارية | القيمة: 120,000 د.ك',
      referenceNumber: 'CTR-2026-114'
    },
    {
      type: 'client' as const,
      id: 'cli-201',
      name: 'شركة المشاريع المتحدة للتجارة العامة والمقاولات',
      subtitle: 'الرقم المدني للجهة: 10492837 | ممثل الشركة: أحمد المطيري',
      referenceNumber: 'CLI-084'
    }
  ];

  const filteredEntities = availableEntities.filter(e => 
    e.name.toLowerCase().includes(linkSearch.toLowerCase()) ||
    (e.subtitle && e.subtitle.toLowerCase().includes(linkSearch.toLowerCase()))
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newAttach = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type || 'Document'
      };
      onUpdateNodeData(selectedNode.id, {
        attachments: [...(data.attachments || []), newAttach]
      });
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    onUpdateNodeData(selectedNode.id, {
      attachments: (data.attachments || []).filter(a => a.id !== attId)
    });
  };

  return (
    <div className="absolute top-20 left-4 bottom-4 w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl z-40 flex flex-col overflow-hidden text-right" dir="rtl">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white">
              خصائص وبيانات العقدة
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {selectedNode.id}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-3 pt-2 gap-1 bg-slate-50/30 dark:bg-slate-950/20">
        {[
          { id: 'content', label: 'المحتوى والبيانات', icon: FileText },
          { id: 'linking', label: 'الربط بالنظام', icon: Link2 },
          { id: 'style', label: 'المظهر واللون', icon: Palette },
          { id: 'attachments', label: 'المرفقات', icon: Paperclip }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex-1 py-2 text-[11px] font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer
                ${active 
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5' 
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
        {/* 1. CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-1.5">
                عنوان العقدة / المحور:
              </label>
              <input 
                type="text"
                value={data.label || ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
                className="w-full text-xs font-black p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                placeholder="اكتب عنوان العقدة..."
              />
            </div>

            {/* Content description */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-1.5">
                الشرح والتفاصيل الإجرائية:
              </label>
              <textarea 
                rows={4}
                value={data.content || ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { content: e.target.value })}
                className="w-full text-xs font-medium p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none leading-relaxed"
                placeholder="سجل الشرح المستفيض، مذكرات الدفاع، أو الخطوات المطلوبة..."
              />
            </div>

            {/* Statutory Article Reference */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>المرجع التشريعي وسند القانون الكويتي:</span>
              </label>
              <input 
                type="text"
                value={data.legalArticle || ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { legalArticle: e.target.value })}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                placeholder="مثال: المادة 197 من قانون المرافعات / م 303 مدني"
              />
            </div>

            {/* Priority & Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block mb-1">
                  الأولوية:
                </label>
                <select 
                  value={data.priority || 'medium'}
                  onChange={(e) => onUpdateNodeData(selectedNode.id, { priority: e.target.value as any })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                >
                  <option value="high">عالية الأهمية 🟥</option>
                  <option value="medium">متوسطة الأهمية 🟧</option>
                  <option value="low">منخفضة الأهمية 🟦</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 block mb-1">
                  الحالة الإجرائية:
                </label>
                <select 
                  value={data.status || 'pending'}
                  onChange={(e) => onUpdateNodeData(selectedNode.id, { status: e.target.value as any })}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                >
                  <option value="pending">قيد الانتظار ⏳</option>
                  <option value="in_progress">جاري العمل ⚙️</option>
                  <option value="completed">مكتمل ومصادق ✅</option>
                  <option value="cancelled">ملغى / مستبعد 🚫</option>
                </select>
              </div>
            </div>

            {/* AI Expand Quick Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => onAiExpandNode(selectedNode.id)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/15 hover:from-amber-500/25 hover:to-amber-600/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-3xs"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>اقتراح دفوع وفروع ذكية لهذه العقدة (AI)</span>
              </button>
            </div>
          </div>
        )}

        {/* 2. SYSTEM LINKING TAB */}
        {activeTab === 'linking' && (
          <div className="space-y-4">
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
              اربط هذه العقدة مباشرة بملف قضية نشط، عقد تجاري، أو سجل عميل للاطلاع السريع والمزامنة.
            </p>

            {data.linkedEntity ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                    {data.linkedEntity.type === 'case' ? 'ملف قضية' : data.linkedEntity.type === 'contract' ? 'عقد' : 'عميل'}
                  </span>
                  <button 
                    onClick={() => onUpdateNodeData(selectedNode.id, { linkedEntity: null })}
                    className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>إلغاء الربط</span>
                  </button>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                  {data.linkedEntity.name}
                </h4>
                {data.linkedEntity.subtitle && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {data.linkedEntity.subtitle}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <input 
                  type="text"
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  placeholder="ابحث برقم القضية، العقد، أو اسم العميل..."
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
                />

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {filteredEntities.map(entity => (
                    <div 
                      key={entity.id}
                      onClick={() => onUpdateNodeData(selectedNode.id, { linkedEntity: entity })}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {entity.type === 'case' ? 'قضية' : entity.type === 'contract' ? 'عقد' : 'عميل'}
                        </span>
                        <span className="text-[10px] text-amber-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          اختر للربط +
                        </span>
                      </div>
                      <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate">
                        {entity.name}
                      </h5>
                      {entity.subtitle && (
                        <span className="text-[9px] text-slate-400 block truncate mt-0.5 font-mono">
                          {entity.subtitle}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. STYLE TAB */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Color Palette selection */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-2">
                السمة اللونية للعقدة:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {NODE_COLOR_PALETTES.map(col => {
                  const isSelected = data.colorClass === col.class;
                  return (
                    <button
                      key={col.name}
                      onClick={() => onUpdateNodeData(selectedNode.id, { colorClass: col.class })}
                      className={`
                        flex items-center gap-2 p-2.5 rounded-xl border text-right transition-all cursor-pointer
                        ${isSelected ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}
                      `}
                    >
                      <span className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: col.hex }} />
                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">
                        {col.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shape selection */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-2">
                الشكل الهندسي:
              </label>
              <select 
                value={data.shape || MindMapShape.ROUNDED}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { shape: e.target.value as MindMapShape })}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none"
              >
                {shapeOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Semantics Icon Selection */}
            <div>
              <label className="text-[11px] font-extrabold text-slate-900 dark:text-white block mb-2">
                الأيقونة الدلالية:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {Object.keys(ICONS_REGISTRY).map(iconKey => {
                  const IconComp = ICONS_REGISTRY[iconKey];
                  const isSelected = (data.iconName || 'scale') === iconKey;
                  return (
                    <button
                      key={iconKey}
                      onClick={() => onUpdateNodeData(selectedNode.id, { iconName: iconKey })}
                      className={`
                        p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer
                        ${isSelected ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                      `}
                    >
                      <IconComp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. ATTACHMENTS TAB */}
        {activeTab === 'attachments' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors cursor-pointer relative bg-slate-50/50 dark:bg-slate-950/20">
              <input 
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-2" />
              <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">
                اضغط لرفع مستند أو مذكرة
              </span>
              <span className="text-[9px] text-slate-400">PDF, Word, Excel (بحد أقصى 25MB)</span>
            </div>

            {/* List of files */}
            <div className="space-y-2">
              {(data.attachments || []).map(file => (
                <div 
                  key={file.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="truncate">
                      <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 block truncate">
                        {file.name}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{file.size}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRemoveAttachment(file.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
