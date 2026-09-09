import { MindMapData, MindMapLayoutType, MindMapShape } from '../../../types';
import { MarkerType } from '@xyflow/react';
import { NODE_COLOR_PALETTES } from '../utils/themeConstants';

export const KUWAIT_LEGAL_TEMPLATES: MindMapData[] = [
  // 1. Enforcement Workflow
  {
    id: 'tpl-execution-kuwait',
    title: 'مخطط إجراءات التنفيذ الجبري والمدني (قانون المرافعات الكويتي)',
    layoutType: MindMapLayoutType.FLOWCHART_HORIZONTAL,
    category: 'cases',
    createdAt: '2026-08-01T00:00:00.000Z',
    nodes: [],
    edges: [],
    data: {
      description: 'خارطة طريق إجرائية متكاملة تبدأ من صدور الحكم النهائي المذيل بالصيغة التنفيذية وصولاً للتحصيل وإغلاق ملف التنفيذ.',
      rfNodes: [
        {
          id: 'ex-1',
          type: 'strategic',
          position: { x: 950, y: 220 },
          data: {
            label: 'الحكم النهائي والصيغة التنفيذية',
            content: 'استلام الصورة التنفيذية للحكم الصادر من محكمة أول درجة أو الاستئناف ممهوراً بخاتم الصيغة التنفيذية الجبرية.',
            colorClass: NODE_COLOR_PALETTES[0].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'gavel',
            priority: 'high',
            status: 'completed',
            legalArticle: 'المادة 197 من قانون المرافعات',
            isRoot: true,
            tags: ['صيغة تنفيذية', 'حكم نهائي']
          }
        },
        {
          id: 'ex-2',
          type: 'strategic',
          position: { x: 620, y: 220 },
          data: {
            label: 'إعلان السند التنفيذي والتكليف بالوفاء',
            content: 'إعلان المدين رسمياً بواسطة مندوب الإعلان وتكليفه بالوفاء بالدين خلال المدة القانونية المقررة.',
            colorClass: NODE_COLOR_PALETTES[3].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'filetext',
            priority: 'high',
            status: 'in_progress',
            legalArticle: 'المادة 204 مرافعات',
            tags: ['مندوب الإعلان', 'تكليف بالوفاء']
          }
        },
        {
          id: 'ex-3',
          type: 'strategic',
          position: { x: 300, y: 80 },
          data: {
            label: 'إجراءات الحجز التحفظي على الحسابات (البنوك)',
            content: 'مخاطبة بنك الكويت المركزي وتوقيع الحجز التنفيذي على حسابات وأرصدة المدين لدى كافة البنوك المحلية.',
            colorClass: NODE_COLOR_PALETTES[2].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'landmark',
            priority: 'high',
            status: 'pending',
            legalArticle: 'المادة 227 مرافعات',
            tags: ['حجز بنوك', 'بنك الكويت المركزي']
          }
        },
        {
          id: 'ex-4',
          type: 'strategic',
          position: { x: 300, y: 360 },
          data: {
            label: 'أمر منع السفر والضبط والإحضار',
            content: 'استصدار أمر على عريضة من قاضي التنفيذ بمنع المدين من مغادرة البلاد وضبطه وإحضاره في حال الامتناع.',
            colorClass: NODE_COLOR_PALETTES[4].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'shieldalert',
            priority: 'high',
            status: 'pending',
            legalArticle: 'المادة 297 مرافعات',
            tags: ['منع سفر', 'ضبط وإحضار']
          }
        },
        {
          id: 'ex-5',
          type: 'strategic',
          position: { x: -20, y: 220 },
          data: {
            label: 'التحصيل والمخالصة وإلغاء القيود',
            content: 'استلام المبالغ المحجوزة وتوريدها للمحكوم لصالحه عبر خزينة المحكمة ورفع كافة الحجوزات والقيود.',
            colorClass: NODE_COLOR_PALETTES[1].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'check',
            priority: 'medium',
            status: 'pending',
            legalArticle: 'إنهاء التنفيذ',
            tags: ['تحصيل', 'مخالصة نهائية']
          }
        }
      ],
      rfEdges: [
        { id: 'e-ex-1-2', source: 'ex-1', target: 'ex-2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' } },
        { id: 'e-ex-2-3', source: 'ex-2', target: 'ex-3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' } },
        { id: 'e-ex-2-4', source: 'ex-2', target: 'ex-4', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' } },
        { id: 'e-ex-3-5', source: 'ex-3', target: 'ex-5', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' } },
        { id: 'e-ex-4-5', source: 'ex-4', target: 'ex-5', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' } }
      ]
    }
  },

  // 2. Legal Qualification and Defenses Tree
  {
    id: 'tpl-legal-defenses',
    title: 'شجرة التكييف القانوني والدفوع الموضوعية والشكلية',
    layoutType: MindMapLayoutType.DECISION_TREE,
    category: 'cases',
    createdAt: '2026-08-05T00:00:00.000Z',
    nodes: [],
    edges: [],
    data: {
      description: 'هيكل تراتبي لتشريح الدعاوى القضائية وتوزيع الدفوع الإجرائية والدفوع الموضوعية وطلبات الإثبات الفني.',
      rfNodes: [
        {
          id: 'def-root',
          type: 'strategic',
          position: { x: 880, y: 240 },
          data: {
            label: 'التكييف القانوني لموضوع النزاع',
            content: 'تحديد الأساس القانوني للالتزام المترتب (مسؤولية عقدية / تقصيرية / إثراء بلا سبب) والنظام القانوني الحاكم.',
            colorClass: NODE_COLOR_PALETTES[0].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'scale',
            priority: 'high',
            status: 'completed',
            isRoot: true,
            tags: ['تكييف قانوني', 'أصل النزاع']
          }
        },
        {
          id: 'def-formal',
          type: 'strategic',
          position: { x: 500, y: 100 },
          data: {
            label: 'الدفوع الشكلية والإجرائية المسبقة',
            content: 'التمسك بالدفوع المتعلقة بالنظام العام أو الشكل قبل إبداء أي دفاع في الموضوع (عدم الاختصاص، بطلان الإعلان، التقادم).',
            colorClass: NODE_COLOR_PALETTES[4].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'shieldalert',
            priority: 'high',
            status: 'in_progress',
            legalArticle: 'المادة 77 مرافعات',
            tags: ['دفوع شكلية', 'عدم اختصاص']
          }
        },
        {
          id: 'def-substantive',
          type: 'strategic',
          position: { x: 500, y: 380 },
          data: {
            label: 'الدفوع الموضوعية وأوجه الدفاع',
            content: 'دحض أسس ادعاء الخصم، إثبات الوفاء بالالتزام، أو التمسك بالقوة القاهرة والسبب الأجنبي ونفي ركن الضرر.',
            colorClass: NODE_COLOR_PALETTES[3].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'book',
            priority: 'high',
            status: 'in_progress',
            legalArticle: 'القانون المدني الكويتي',
            tags: ['دفاع موضوعي', 'نفي الضرر']
          }
        },
        {
          id: 'def-formal-jurisdiction',
          type: 'strategic',
          position: { x: 120, y: 30 },
          data: {
            label: 'الدفع بوجود شرط التحكيم / عدم الاختصاص الولائي',
            content: 'طلب عدم سماع الدعوى لوجود شرط تحكيمي ملزم أو إحالتها للدائرة الإدارية/العمالية المختصة نوعياً.',
            colorClass: NODE_COLOR_PALETTES[5].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'gavel',
            priority: 'high',
            status: 'pending',
            legalArticle: 'المادة 173 مرافعات',
            tags: ['تحكيم', 'اختصاص']
          }
        },
        {
          id: 'def-formal-limitation',
          type: 'strategic',
          position: { x: 120, y: 170 },
          data: {
            label: 'الدفع بسقوط الحق بالتقادم الحولي / الخمسي',
            content: 'سقوط المطالبة لمضي المدة القانونية المقررة دون اتخاذ إجراء قاطع للتقادم المنصوص عليه تشريعياً.',
            colorClass: NODE_COLOR_PALETTES[4].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'clock',
            priority: 'medium',
            status: 'pending',
            legalArticle: 'المادة 440 مدني',
            tags: ['تقادم', 'سقوط الحق']
          }
        },
        {
          id: 'def-expert',
          type: 'strategic',
          position: { x: 120, y: 380 },
          data: {
            label: 'الطلب الاحتياطي: ندب خبير هندسي / محاسبي',
            content: 'طلب تمكيني جازم بإحالة الدعوى لإدارة الخبراء بوزارة العدل لفحص الحسابات والانتقال والمعاينة.',
            colorClass: NODE_COLOR_PALETTES[2].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'user',
            priority: 'medium',
            status: 'pending',
            legalArticle: 'مرسوم تنظيم الخبرة',
            tags: ['إدارة الخبراء', 'طلب احتياطي']
          }
        }
      ],
      rfEdges: [
        { id: 'e-def-root-formal', source: 'def-root', target: 'def-formal', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' } },
        { id: 'e-def-root-sub', source: 'def-root', target: 'def-substantive', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' } },
        { id: 'e-def-f-jur', source: 'def-formal', target: 'def-formal-jurisdiction', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' } },
        { id: 'e-def-f-lim', source: 'def-formal', target: 'def-formal-limitation', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' } },
        { id: 'e-def-sub-exp', source: 'def-substantive', target: 'def-expert', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' } }
      ]
    }
  },

  // 3. Contract Risk Analysis Matrix
  {
    id: 'tpl-contract-risk',
    title: 'مصفوفة تحليل مخاطر العقود وبنود الامتثال الكويتي',
    layoutType: MindMapLayoutType.MINDMAP,
    category: 'contracts',
    createdAt: '2026-08-10T00:00:00.000Z',
    nodes: [],
    edges: [],
    data: {
      description: 'فحص نافي للجهالة لبنود العقود التجارية ومذكرات التفاهم لتفادي النزاعات ومراجعة نصوص الشرط الجزائي والتحكيم.',
      rfNodes: [
        {
          id: 'cr-root',
          type: 'strategic',
          position: { x: 420, y: 220 },
          data: {
            label: 'تدقيق العقد التجاري وضمانات الامتثال',
            content: 'مراجعة التوازن العقدي وحماية حقوق الموكل وصياغة شروط مانعة للنزاع وفق القانون التجاري الكويتي.',
            colorClass: NODE_COLOR_PALETTES[0].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'filecheck',
            priority: 'high',
            status: 'completed',
            isRoot: true,
            tags: ['عقد تجاري', 'فحص قانوني']
          }
        },
        {
          id: 'cr-penalty',
          type: 'strategic',
          position: { x: 80, y: 60 },
          data: {
            label: 'الشرط الجزائي والتعويض الاتفاقي',
            content: 'التأكد من عدم المبالغة الفاحشة في التعويض لتمكين القاضي من تعديله ومراعاة الضرر الفعلي.',
            colorClass: NODE_COLOR_PALETTES[4].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'shieldalert',
            priority: 'high',
            status: 'in_progress',
            legalArticle: 'المادة 303 من القانون المدني',
            tags: ['شرط جزائي', 'تعويض']
          }
        },
        {
          id: 'cr-arbitration',
          type: 'strategic',
          position: { x: 760, y: 60 },
          data: {
            label: 'بند التحكيم وفض المنازعات',
            content: 'صياغة شرط تحكيم صحيح يحدد مقر التحكيم (مثل مركز الكويت للتحكيم التجاري) واللغة والقانون الواجب التطبيق.',
            colorClass: NODE_COLOR_PALETTES[5].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'gavel',
            priority: 'high',
            status: 'completed',
            tags: ['تحكيم تجاري', 'غرفة التجارة']
          }
        },
        {
          id: 'cr-force-majeure',
          type: 'strategic',
          position: { x: 80, y: 380 },
          data: {
            label: 'القوة القاهرة والظروف الطارئة',
            content: 'تحديد شروط الإعفاء من المسؤولية عند وقوع حوادث استثنائية عامة لا يمكن توقعها أو دفعها.',
            colorClass: NODE_COLOR_PALETTES[3].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'alert',
            priority: 'medium',
            status: 'pending',
            legalArticle: 'المادة 198 مدني',
            tags: ['قوة قاهرة', 'ظروف طارئة']
          }
        },
        {
          id: 'cr-termination',
          type: 'strategic',
          position: { x: 760, y: 380 },
          data: {
            label: 'الفسخ الاتفاقي والإخطارات المسبقة',
            content: 'تنظيم آلية إنهاء العقد بالإرادة المنفردة أو عند الإخلال الجوهري مع تحديد مدد الإخطار القانونية.',
            colorClass: NODE_COLOR_PALETTES[1].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'filetext',
            priority: 'medium',
            status: 'pending',
            tags: ['فسخ العقد', 'إخطار خطي']
          }
        }
      ],
      rfEdges: [
        { id: 'e-cr-1', source: 'cr-root', target: 'cr-penalty', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' } },
        { id: 'e-cr-2', source: 'cr-root', target: 'cr-arbitration', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#7c3aed' } },
        { id: 'e-cr-3', source: 'cr-root', target: 'cr-force-majeure', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' } },
        { id: 'e-cr-4', source: 'cr-root', target: 'cr-termination', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' } }
      ]
    }
  },

  // 4. Law Firm Organizational Structure
  {
    id: 'tpl-org-lawfirm',
    title: 'الهيكل التنظيمي وإدارة الصلاحيات بمكتب المحاماة',
    layoutType: MindMapLayoutType.ORGANIZATION_CHART,
    category: 'departments',
    createdAt: '2026-08-15T00:00:00.000Z',
    nodes: [],
    edges: [],
    data: {
      description: 'التوزيع الإداري والمهني للأقسام القضائية والاستشارية وشعبة التنفيذ والتحصيل.',
      rfNodes: [
        {
          id: 'org-managing-partner',
          type: 'strategic',
          position: { x: 450, y: 50 },
          data: {
            label: 'المحامي العام / الشريك المدير',
            content: 'الإشراف الاستراتيجي على سياسات المكتب، القضايا الكبرى، والعلاقات الحكومية والقضائية العليا.',
            colorClass: NODE_COLOR_PALETTES[0].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'landmark',
            priority: 'high',
            status: 'completed',
            isRoot: true,
            tags: ['إدارة عليا', 'شريك مدير']
          }
        },
        {
          id: 'org-litigation-head',
          type: 'strategic',
          position: { x: 120, y: 260 },
          data: {
            label: 'رئيس قسم التقاضي والمرافعات',
            content: 'إدارة فريق المحامين أمام محاكم الجنايات، التجاري، المدني، العمالي، وأسواق المال.',
            colorClass: NODE_COLOR_PALETTES[3].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'gavel',
            priority: 'high',
            status: 'completed',
            tags: ['قصر العدل', 'استئناف وتمييز']
          }
        },
        {
          id: 'org-corporate-head',
          type: 'strategic',
          position: { x: 450, y: 260 },
          data: {
            label: 'رئيس قسم الشركات والعقود الدولية',
            content: 'صياغة العقود، عمليات الدمج والاستحواذ، التحكيم التجاري، واستشارات الامتثال وحوكمة الشركات.',
            colorClass: NODE_COLOR_PALETTES[1].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'briefcase',
            priority: 'high',
            status: 'completed',
            tags: ['حوكمة شركات', 'عقود دولية']
          }
        },
        {
          id: 'org-execution-head',
          type: 'strategic',
          position: { x: 780, y: 260 },
          data: {
            label: 'رئيس قسم المتابعة والتنفيذ الجبري',
            content: 'متابعة إدارة التنفيذ بالمحافظات، إجراءات حجز البنوك والسيارات والعقارات والتحصيل السريع.',
            colorClass: NODE_COLOR_PALETTES[2].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'shieldcheck',
            priority: 'high',
            status: 'completed',
            tags: ['تنفيذ أحكام', 'تحصيل مالي']
          }
        }
      ],
      rfEdges: [
        { id: 'e-org-1', source: 'org-managing-partner', target: 'org-litigation-head', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' } },
        { id: 'e-org-2', source: 'org-managing-partner', target: 'org-corporate-head', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' } },
        { id: 'e-org-3', source: 'org-managing-partner', target: 'org-execution-head', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' } }
      ]
    }
  },

  // 5. Litigation Timeline
  {
    id: 'tpl-litigation-timeline',
    title: 'التسلسل الزمني لمراحل القضية القضائية (Litigation Timeline)',
    layoutType: MindMapLayoutType.TIMELINE,
    category: 'cases',
    createdAt: '2026-08-18T00:00:00.000Z',
    nodes: [],
    edges: [],
    data: {
      description: 'مخطط تتابعي زمني يوضح المحطات الإجرائية من قيد الصحيفة إلى الحكم البات النهائي.',
      rfNodes: [
        {
          id: 'tl-1',
          type: 'strategic',
          position: { x: 950, y: 150 },
          data: {
            label: 'المحطة الأولى: إيداع وقيد صحيفة الدعوى',
            content: 'سداد الرسوم القضائية، قيد الدعوى بجدول المحكمة المختصة وتحديد موعد أول جلسة مرافعة.',
            colorClass: NODE_COLOR_PALETTES[0].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'filetext',
            priority: 'high',
            status: 'completed',
            stageNumber: 1,
            tags: ['قيد الدعوى', 'جدول المحكمة']
          }
        },
        {
          id: 'tl-2',
          type: 'strategic',
          position: { x: 680, y: 320 },
          data: {
            label: 'المحطة الثانية: جلسات المرافعة وتبادل المذكرات',
            content: 'حضور الجلسات، إيداع حافظة المستندات ومذكرات الدفاع والرد على دفاع الخصم واستجواب الشهود.',
            colorClass: NODE_COLOR_PALETTES[3].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'calendar',
            priority: 'high',
            status: 'in_progress',
            stageNumber: 2,
            tags: ['مرافعة', 'مذكرات دفاع']
          }
        },
        {
          id: 'tl-3',
          type: 'strategic',
          position: { x: 410, y: 150 },
          data: {
            label: 'المحطة الثالثة: حجز الدعوى للحكم الابتدائي',
            content: 'صدور حكم محكمة أول درجة في الشقين الموضوعي والمصروفات ومقابل أتعاب المحاماة الفعلية.',
            colorClass: NODE_COLOR_PALETTES[2].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'gavel',
            priority: 'high',
            status: 'pending',
            stageNumber: 3,
            tags: ['حكم أول درجة', 'أتعاب محاماة']
          }
        },
        {
          id: 'tl-4',
          type: 'strategic',
          position: { x: 140, y: 320 },
          data: {
            label: 'المحطة الرابعة: الاستئناف والطعن بالتمييز',
            content: 'قيد صحيفة الاستئناف خلال الميعاد القانوني (30 يوماً) ومن ثم مراجعة أسباب الطعن بالتمييز إن وجد.',
            colorClass: NODE_COLOR_PALETTES[1].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'scale',
            priority: 'high',
            status: 'pending',
            stageNumber: 4,
            tags: ['محكمة الاستئناف', 'محكمة التمييز']
          }
        }
      ],
      rfEdges: [
        { id: 'e-tl-1-2', source: 'tl-1', target: 'tl-2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' } },
        { id: 'e-tl-2-3', source: 'tl-2', target: 'tl-3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' } },
        { id: 'e-tl-3-4', source: 'tl-3', target: 'tl-4', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' } }
      ]
    }
  },

  // 6. Administrative Investigation & Disciplinary Actions (Kuwait Labor Law)
  {
    id: 'tpl-disciplinary-kuwait',
    title: 'شجرة التحقيق الإداري والمساءلة التأديبية (قانون العمل الكويتي 6/2010)',
    layoutType: MindMapLayoutType.DECISION_TREE,
    category: 'administrative',
    createdAt: '2026-08-21T00:00:00.000Z',
    nodes: [],
    edges: [],
    data: {
      description: 'دليل تراتبي لضمانات التحقيق العمالي الإلزامي وسماع الأقوال وتدرج الجزاءات والتظلم القانوني خلال 20 يوماً.',
      rfNodes: [
        {
          id: 'disc-1',
          type: 'strategic',
          position: { x: 920, y: 220 },
          data: {
            label: 'إخطار المخالفة وتكليف بالتحقيق',
            content: 'إخطار العامل خطياً بالمخالفة المنسوبة إليه وسماع أقواله وتحقيق دفاعه وإثباته في محضر رسمي موقع.',
            colorClass: NODE_COLOR_PALETTES[0].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'filetext',
            priority: 'high',
            status: 'completed',
            legalArticle: 'المادة 35 من قانون العمل',
            isRoot: true,
            tags: ['تحقيق إداري', 'محضر سماع أقوال']
          }
        },
        {
          id: 'disc-2',
          type: 'strategic',
          position: { x: 550, y: 100 },
          data: {
            label: 'الضمانات الإجرائية للتحقيق',
            content: 'مواجهة العامل بالأدلة والشهود، إتاحة الاستعانة بممثل أو محام، وتدوين كافة الدفوع قبل إصدار القرار.',
            colorClass: NODE_COLOR_PALETTES[3].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'shieldcheck',
            priority: 'high',
            status: 'in_progress',
            tags: ['ضمانات الدفاع', 'حياد التحقيق']
          }
        },
        {
          id: 'disc-3',
          type: 'strategic',
          position: { x: 550, y: 350 },
          data: {
            label: 'تدرج الجزاءات التأديبية المشروعة',
            content: 'الإنذار الخطي، الخصم من الأجر (بما لا يجاوز 5 أيام في المخالفة الواحدة)، الوقف عن العمل، أو الفصل المسبب.',
            colorClass: NODE_COLOR_PALETTES[4].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'alert',
            priority: 'high',
            status: 'pending',
            legalArticle: 'المادة 35 و 41 عمل',
            tags: ['لائحة الجزاءات', 'سقف الخصم']
          }
        },
        {
          id: 'disc-4',
          type: 'strategic',
          position: { x: 160, y: 100 },
          data: {
            label: 'سجل التظلمات والاعتراض الإلكتروني',
            content: 'حق العامل في تقديم تظلم رسمي إلى الشؤون القانونية خلال 20 يوماً من تاريخ إعلانه بالقرار الجزائي.',
            colorClass: NODE_COLOR_PALETTES[1].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'clock',
            priority: 'medium',
            status: 'pending',
            legalArticle: 'العداد القانوني 20 يوماً',
            tags: ['تظلم عمالي', 'ميعاد قاطع']
          }
        },
        {
          id: 'disc-5',
          type: 'strategic',
          position: { x: 160, y: 350 },
          data: {
            label: 'القرار النهائي وإخطار القوى العاملة',
            content: 'اعتماد القرار التأديبي من الإدارة القانونية، قيده في الملف الوظيفي، وتوريد حصيلة الخصومات لوزارة الشؤون.',
            colorClass: NODE_COLOR_PALETTES[2].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'check',
            priority: 'medium',
            status: 'pending',
            tags: ['قرار تأديبي', 'القوى العاملة']
          }
        }
      ],
      rfEdges: [
        { id: 'e-disc-1-2', source: 'disc-1', target: 'disc-2', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' } },
        { id: 'e-disc-1-3', source: 'disc-1', target: 'disc-3', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' } },
        { id: 'e-disc-2-4', source: 'disc-2', target: 'disc-4', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' } },
        { id: 'e-disc-3-5', source: 'disc-3', target: 'disc-5', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' } }
      ]
    }
  },

  // 7. Estate Liquidation & Inheritance Distribution
  {
    id: 'tpl-estate-kuwait',
    title: 'استراتيجية حصر التركات وتصفية أموال المورثين (قانون الأحوال الشخصية)',
    layoutType: MindMapLayoutType.MINDMAP,
    category: 'cases',
    createdAt: '2026-08-20T00:00:00.000Z',
    nodes: [],
    edges: [],
    data: {
      description: 'إجراءات استخراج حصر الوراثة، سداد ديون التركة وتنفيذ الوصايا وتوزيع الحصص العقارية والمالية.',
      rfNodes: [
        {
          id: 'est-root',
          type: 'strategic',
          position: { x: 450, y: 220 },
          data: {
            label: 'تصفية وتقسيم تركة المورث',
            content: 'إدارة ملف التركة بالكامل وفقاً لقانون الأحوال الشخصية الكويتي وأحكام الشريعة الإسلامية.',
            colorClass: NODE_COLOR_PALETTES[0].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'landmark',
            priority: 'high',
            status: 'completed',
            isRoot: true,
            tags: ['حصر وراثة', 'تركات']
          }
        },
        {
          id: 'est-debts',
          type: 'strategic',
          position: { x: 100, y: 80 },
          data: {
            label: 'سداد ديون التركة العينية والنقدية',
            content: 'تقديم سداد ديون العباد والرهون الرسمية قبل توزيع أي نصيب شرعي على الورثة.',
            colorClass: NODE_COLOR_PALETTES[4].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'shieldalert',
            priority: 'high',
            status: 'in_progress',
            legalArticle: 'قانون الأحوال الشخصية',
            tags: ['سداد ديون', 'حقوق التركة']
          }
        },
        {
          id: 'est-wills',
          type: 'strategic',
          position: { x: 800, y: 80 },
          data: {
            label: 'تنفيذ الوصية الشرعية (في حدود الثلث)',
            content: 'التثبت من صحة الوصية الواجبة أو الاختيارية وتنفيذها بما لا يجاوز ثلث مجموع التركة الصافية.',
            colorClass: NODE_COLOR_PALETTES[1].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'filetext',
            priority: 'medium',
            status: 'pending',
            tags: ['وصية شرعية', 'ثلث التركة']
          }
        },
        {
          id: 'est-realestate',
          type: 'strategic',
          position: { x: 100, y: 360 },
          data: {
            label: 'حصر وتقييم العقارات والشركات',
            content: 'مخاطبة إدارة التسجيل العقاري ووزارة التجارة لتقييم الأصول وتعيين حارس قضائي إذا لزم الأمر.',
            colorClass: NODE_COLOR_PALETTES[2].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'building',
            priority: 'high',
            status: 'in_progress',
            tags: ['تسجيل عقاري', 'تقييم أصول']
          }
        },
        {
          id: 'est-distribution',
          type: 'strategic',
          position: { x: 800, y: 360 },
          data: {
            label: 'توزيع الأنصبة الشرعية على الورثة',
            content: 'قسمة المبالغ النقدية وإفراز العقارات رضائياً أو إحالة الأمر لمحكمة القسمة والمزاد العلني.',
            colorClass: NODE_COLOR_PALETTES[3].class,
            shape: MindMapShape.ROUNDED,
            iconName: 'check',
            priority: 'medium',
            status: 'pending',
            tags: ['قسمة رضائية', 'مزاد علني']
          }
        }
      ],
      rfEdges: [
        { id: 'e-est-1', source: 'est-root', target: 'est-debts', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' } },
        { id: 'e-est-2', source: 'est-root', target: 'est-wills', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#c19a5b' } },
        { id: 'e-est-3', source: 'est-root', target: 'est-realestate', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#059669' } },
        { id: 'e-est-4', source: 'est-root', target: 'est-distribution', type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#0284c7' } }
      ]
    }
  }
];
