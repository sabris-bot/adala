import { 
  Scale, Briefcase, FileText, User, Calendar, AlertCircle, 
  Sparkles, CheckCircle, Lightbulb, Cpu, FolderOpen, ShieldCheck, 
  Gavel, BookOpen, Clock, Layers, Award, Landmark, Building, 
  FileCheck, ShieldAlert, Zap, GitBranch, ArrowRight
} from 'lucide-react';
import { MindMapShape } from '../../../types';

export const NODE_COLOR_PALETTES = [
  { 
    name: 'كحلي عدالة (رئيسي)', 
    nameEn: 'Adala Navy',
    class: 'bg-slate-900/90 text-white border-slate-700 shadow-slate-900/40', 
    accentBorder: '#1e293b', 
    badgeBg: 'bg-amber-400 text-slate-950',
    hex: '#0f172a',
    ring: 'ring-amber-400',
    glow: 'rgba(15, 23, 42, 0.35)',
    handleColor: '#c19a5b'
  },
  { 
    name: 'ذهبي الإدارة والامتياز', 
    nameEn: 'Royal Gold',
    class: 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-amber-500/70', 
    accentBorder: '#d97706', 
    badgeBg: 'bg-amber-500 text-white',
    hex: '#c19a5b',
    ring: 'ring-amber-500',
    glow: 'rgba(193, 154, 91, 0.35)',
    handleColor: '#c19a5b'
  },
  { 
    name: 'زمردي الامتثال والإنفاذ', 
    nameEn: 'Emerald Green',
    class: 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-500/70', 
    accentBorder: '#059669', 
    badgeBg: 'bg-emerald-600 text-white',
    hex: '#059669',
    ring: 'ring-emerald-500',
    glow: 'rgba(5, 150, 105, 0.35)',
    handleColor: '#059669'
  },
  { 
    name: 'أزرق التقاضي والمحاكم', 
    nameEn: 'Litigation Sapphire',
    class: 'bg-sky-500/10 dark:bg-sky-950/40 text-sky-950 dark:text-sky-200 border-sky-500/70', 
    accentBorder: '#0284c7', 
    badgeBg: 'bg-sky-600 text-white',
    hex: '#0284c7',
    ring: 'ring-sky-500',
    glow: 'rgba(2, 132, 199, 0.35)',
    handleColor: '#0284c7'
  },
  { 
    name: 'عنابي المخاطر والنزاع', 
    nameEn: 'Risk Crimson',
    class: 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200 border-rose-500/70', 
    accentBorder: '#e11d48', 
    badgeBg: 'bg-rose-600 text-white',
    hex: '#e11d48',
    ring: 'ring-rose-500',
    glow: 'rgba(225, 29, 72, 0.35)',
    handleColor: '#e11d48'
  },
  { 
    name: 'بنفسجي الاستشارات والتحكيم', 
    nameEn: 'Arbitration Violet',
    class: 'bg-violet-500/10 dark:bg-violet-950/40 text-violet-950 dark:text-violet-200 border-violet-500/70', 
    accentBorder: '#7c3aed', 
    badgeBg: 'bg-violet-600 text-white',
    hex: '#7c3aed',
    ring: 'ring-violet-500',
    glow: 'rgba(124, 58, 237, 0.35)',
    handleColor: '#7c3aed'
  },
  { 
    name: 'رمادي التوثيق والإجراءات', 
    nameEn: 'Formal Slate',
    class: 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-400 dark:border-slate-700', 
    accentBorder: '#64748b', 
    badgeBg: 'bg-slate-600 text-white',
    hex: '#64748b',
    ring: 'ring-slate-400',
    glow: 'rgba(100, 116, 139, 0.25)',
    handleColor: '#64748b'
  }
];

export const ICONS_REGISTRY: Record<string, any> = {
  scale: Scale,
  briefcase: Briefcase,
  filetext: FileText,
  user: User,
  calendar: Calendar,
  alert: AlertCircle,
  sparkles: Sparkles,
  check: CheckCircle,
  lightbulb: Lightbulb,
  cpu: Cpu,
  files: FolderOpen,
  shield: ShieldCheck,
  gavel: Gavel,
  book: BookOpen,
  clock: Clock,
  layers: Layers,
  award: Award,
  landmark: Landmark,
  building: Building,
  filecheck: FileCheck,
  shieldalert: ShieldAlert,
  zap: Zap,
  gitbranch: GitBranch
};

export const getShapeClass = (shape?: MindMapShape): string => {
  switch (shape) {
    case MindMapShape.RECTANGLE: 
      return 'rounded-lg border-2';
    case MindMapShape.PILL: 
      return 'rounded-full px-4 py-2 border-2';
    case MindMapShape.OVAL: 
      return 'rounded-[40px] border-2';
    case MindMapShape.DIAMOND: 
      return 'rotate-45 border-2 aspect-square flex items-center justify-center p-2';
    case MindMapShape.PARALLELOGRAM: 
      return '-skew-x-6 border-2';
    case MindMapShape.ROUNDED:
    default: 
      return 'rounded-2xl border-2';
  }
};

export const getInnerShapeClass = (shape?: MindMapShape): string => {
  switch (shape) {
    case MindMapShape.DIAMOND: 
      return '-rotate-45 w-[140%] h-[140%] flex flex-col justify-center items-center text-center p-2';
    case MindMapShape.PARALLELOGRAM: 
      return 'skew-x-6';
    default: 
      return '';
  }
};
