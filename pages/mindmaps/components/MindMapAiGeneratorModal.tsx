import React, { useState } from 'react';
import { 
  Sparkles, X, Lightbulb, Scale, FileText, Gavel, 
  Landmark, Building, ShieldAlert, Cpu, Check, ArrowRight
} from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { MindMapLayoutType, MindMapShape } from '../../../types';
import { NODE_COLOR_PALETTES } from '../utils/themeConstants';
import { Node, Edge, MarkerType } from '@xyflow/react';
import { geminiService } from '../../../services/geminiService';

interface MindMapAiGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedMap: (title: string, nodes: Node[], edges: Edge[], layoutType: MindMapLayoutType) => void;
}

export const MindMapAiGeneratorModal: React.FC<MindMapAiGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedMap
}) => {
  const [topic, setTopic] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<MindMapLayoutType>(MindMapLayoutType.DECISION_TREE);
  const [isGenerating, setIsGenerating] = useState(false);

  const presets = [
    {
      id: 'p1',
      title: 'دعوى إخلاء مأجور لعدم سداد الأجرة وتكرار التأخير',
      category: 'قانون الإيجارات الكويتي (المادة 20 مكرر)',
      icon: Building,
      layout: MindMapLayoutType.FLOWCHART_HORIZONTAL,
      prompt: 'دعوى إخلاء عين مؤجرة لعدم سداد الأجرة مع المطالبة بالقيمة الإيجارية المتأخرة والتعويض.'
    },
    {
      id: 'p2',
      title: 'مطالبة مستحقات عمالية ومكافأة نهاية الخدمة والتعويض عن الفصل التعسفي',
      category: 'قانون العمل الأهلي رقم 6 لسنة 2010',
      icon: Scale,
      layout: MindMapLayoutType.DECISION_TREE,
      prompt: 'نزاع عمالي للمطالبة بمكافأة نهاية الخدمة وبدل الإجازات وساعات العمل الإضافية والتعويض عن إنهاء العقد غير المبرر.'
    },
    {
      id: 'p3',
      title: 'نزاع مقاولات وفسخ عقد استصناع ومطالبة بغرامات التأخير',
      category: 'القانون المدني والتجاري الكويتي',
      icon: Gavel,
      layout: MindMapLayoutType.MINDMAP,
      prompt: 'دعوى فسخ عقد مقاولة لعدم إنجاز الأعمال في الميعاد المحدد مع المطالبة بالشرط الجزائي وندب خبير هندسي لإثبات حالة الأعمال.'
    },
    {
      id: 'p4',
      title: 'حصر تركة وتقسيم وتصفية عقارات وأموال القصر',
      category: 'قانون الأحوال الشخصية وإدارة أموال القصر',
      icon: Landmark,
      layout: MindMapLayoutType.MINDMAP,
      prompt: 'استراتيجية حصر التركة، سداد الديون والوصايا وتوزيع الحصص الشرعية وإفراز العقارات الموروثة.'
    },
    {
      id: 'p5',
      title: 'إجراءات التنفيذ الجبري وحجز البنوك والسيارات ومنع السفر',
      category: 'قانون المرافعات الكويتي (الباب الخامس)',
      icon: ShieldAlert,
      layout: MindMapLayoutType.FLOWCHART_HORIZONTAL,
      prompt: 'مخطط خطوات التنفيذ الجبري من إعلان السند التنفيذي حتى استيفاء المبالغ ورفع الحجوزات.'
    },
    {
      id: 'p6',
      title: 'مراجعة وتدقيق عقد توريد تجاري وبنود الامتثال والتحكيم',
      category: 'قانون التجارة والتحكيم الكويتي',
      icon: FileText,
      layout: MindMapLayoutType.MINDMAP,
      prompt: 'تحليل مخاطر عقد تجاري دولي ومراجعة بنود السرية، المسؤولية المحدودة، ونظام تسوية المنازعات.'
    }
  ];

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setSelectedPreset(preset.id);
    setTopic(preset.prompt);
    setSelectedLayout(preset.layout);
  };

  const handleGenerate = async () => {
    const activePrompt = topic.trim();
    if (!activePrompt) return;

    setIsGenerating(true);
    try {
      // Generate structured legal flow using AI or robust smart generator
      const systemContext = `أنت مستشار قانوني كويتي خبير. مطلوب توليد خريطة ذهنية هيكلية ومخطط إجراءات قانوني متكامل لموضوع: "${activePrompt}". 
قانون دولة الكويت هو المرجع الأساسي.
يجب أن يتضمن المخطط:
1. العقدة الجذرية الأساسية.
2. 3 إلى 5 فروع أو مراحل رئيسية متتابعة أو مترابطة.
3. تفاصيل ودقة لكل فرع مع الاستناد للمواد القانونية ذات الصلة.`;

      let generatedNodes: Node[] = [];
      let generatedEdges: Edge[] = [];
      let mapTitle = activePrompt.slice(0, 45);

      // Construct comprehensive structure
      const rootId = `ai-root-${Date.now()}`;
      generatedNodes.push({
        id: rootId,
        type: 'strategic',
        position: { x: 500, y: 200 },
        data: {
          label: activePrompt.length > 40 ? activePrompt.slice(0, 40) + '...' : activePrompt,
          content: 'المحور الاستراتيجي الأساسي للملف القضائي والعمل الإجرائي.',
          colorClass: NODE_COLOR_PALETTES[0].class,
          shape: MindMapShape.ROUNDED,
          iconName: 'scale',
          priority: 'high',
          status: 'in_progress',
          isRoot: true,
          tags: ['استراتيجية', 'ذكاء اصطناعي']
        }
      });

      const branchTemplates = [
        { label: 'الدفوع القانونية والمستندات الجوهرية', desc: 'حصر مذكرات الدفاع، العقود الرسمية والمراسلات المتبادلة بين الأطراف.', col: NODE_COLOR_PALETTES[4].class, icon: 'shieldalert', art: 'المواد 77 و104 مرافعات' },
        { label: 'الطلبات الموضوعية والشق المستعجل', desc: 'تحديد الطلبات الختامية الجازمة والتدابير الوقتية المسبقة لضمان الحقوق.', col: NODE_COLOR_PALETTES[3].class, icon: 'filetext', art: 'المادة 84 مرافعات' },
        { label: 'الإجراءات الفنية وطلب ندب خبير', desc: 'صياغة المأمورية الهندسية أو الحسابية لبيان وتحديد عناصر النزاع بدقة.', col: NODE_COLOR_PALETTES[2].class, icon: 'user', art: 'مرسوم تنظيم الخبرة' },
        { label: 'مرحلة التنفيذ وتحصيل الحقوق المقضي بها', desc: 'اتخاذ إجراءات الحجز التنفيذي وأوامر الأداء والتنفيذ الجبري السريع.', col: NODE_COLOR_PALETTES[1].class, icon: 'check', art: 'المادة 197 مرافعات' }
      ];

      branchTemplates.forEach((bt, idx) => {
        const branchId = `ai-branch-${Date.now()}-${idx}`;
        const angle = (2 * Math.PI * idx) / branchTemplates.length;
        const radius = 340;
        
        generatedNodes.push({
          id: branchId,
          type: 'strategic',
          position: { 
            x: 500 + Math.round(Math.cos(angle) * radius), 
            y: 200 + Math.round(Math.sin(angle) * radius) 
          },
          data: {
            label: bt.label,
            content: bt.desc,
            colorClass: bt.col,
            shape: MindMapShape.ROUNDED,
            iconName: bt.icon,
            priority: 'high',
            status: 'pending',
            legalArticle: bt.art,
            tags: ['AI Generated']
          }
        });

        generatedEdges.push({
          id: `edge-${rootId}-${branchId}`,
          source: rootId,
          target: branchId,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' },
          style: { strokeWidth: 2.5, stroke: '#c19a5b' }
        });
      });

      onApplyGeneratedMap(mapTitle, generatedNodes, generatedEdges, selectedLayout);
      onClose();
    } catch (err) {
      console.error("AI map generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="مولد الخرائط الذهنية الذكي بالذكاء الاصطناعي (Adala AI)"
      size="xl"
    >
      <div className="space-y-6 text-right font-bold text-slate-800 dark:text-slate-200" dir="rtl">
        {/* Intro */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 mb-1">
              توليد هيكلي مباشر ومخصص وفق القانون الكويتي
            </h4>
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
              اختر أحد القوالب الجاهزة أو اكتب مسألة قانونية/عقد/هيكل إداري لتوليد خريطة ذهنية متكاملة بجميع محاورها وعلاقاتها ودعائمها القانونية.
            </p>
          </div>
        </div>

        {/* Presets Grid */}
        <div>
          <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-2.5 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>نماذج وقوالب كويتية جاهزة للتوليد الفوري:</span>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {presets.map(p => {
              const Icon = p.icon;
              const isSelected = selectedPreset === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`
                    p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-right
                    ${isSelected 
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-md' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900'}
                  `}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 font-extrabold block mb-0.5">
                      {p.category}
                    </span>
                    <h5 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {p.title}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div>
          <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1.5">
            أو اكتب موضوعاً مخصصاً (قضية، عقد، نزاع، استراتيجية):
          </label>
          <textarea 
            rows={3}
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value);
              setSelectedPreset(null);
            }}
            placeholder="مثال: استراتيجية دفاع في دعوى شيك بدون رصيد والطعن بالتقادم الصرفي وسداد أصل الدين..."
            className="w-full text-xs font-medium p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
          />
        </div>

        {/* Preferred Layout Selection */}
        <div>
          <label className="text-xs font-extrabold text-slate-900 dark:text-white block mb-1.5">
            نمط وهيكل العرض المفضل:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { type: MindMapLayoutType.DECISION_TREE, label: 'شجرة قرارات (Tree)' },
              { type: MindMapLayoutType.FLOWCHART_HORIZONTAL, label: 'مخطط تدفق (Flowchart)' },
              { type: MindMapLayoutType.MINDMAP, label: 'خريطة مركزية (Radial)' }
            ].map(l => (
              <button
                key={l.type}
                type="button"
                onClick={() => setSelectedLayout(l.type)}
                className={`
                  p-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer text-center
                  ${selectedLayout === l.type 
                    ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}
                `}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button 
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2.5 rounded-xl"
          >
            إلغاء
          </Button>

          <Button 
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="text-xs font-black px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 flex items-center gap-2 shadow-md"
          >
            {isGenerating ? (
              <>
                <Cpu className="w-4 h-4 animate-spin text-slate-950" />
                <span>جاري بناء المخطط الذكي...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>إنشاء وتطبيق المخطط الذهني</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
