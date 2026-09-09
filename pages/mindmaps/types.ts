import { MindMapLayoutType, MindMapShape } from '../../types';

export interface LinkedEntity {
  type: 'case' | 'client' | 'contract' | 'hearing' | 'investigation' | 'statute' | 'task';
  id: string;
  name: string;
  subtitle?: string;
  referenceNumber?: string;
  extraDetails?: {
    caseNumber?: string;
    courtName?: string;
    circuit?: string;
    clientName?: string;
    clientRole?: string;
    opposingParty?: string;
    litigationStage?: string;
    nextHearingDate?: string;
    status?: string;
    priority?: string;
    contractValue?: number;
    effectiveDate?: string;
    civilId?: string;
    phone?: string;
    poaNumber?: string;
    totalFees?: number;
    paidFees?: number;
    remainingFees?: number;
    summary?: string;
    lawyer?: string;
    [key: string]: any;
  };
}

export interface NodeAttachment {
  id: string;
  name: string;
  size?: string;
  type?: string;
  fileUrl?: string;
  isCaseDocument?: boolean;
}

export interface CustomNodeData {
  label: string;
  content?: string;
  colorClass?: string;
  shape?: MindMapShape;
  iconName?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignee?: string;
  dueDate?: string;
  linkedEntity?: LinkedEntity | null;
  attachments?: NodeAttachment[];
  searchHighlighted?: boolean;
  isRoot?: boolean;
  collapsed?: boolean;
  childCount?: number;
  tags?: string[];
  notes?: string;
  legalArticle?: string; // Reference to Kuwaiti Law Article (e.g., م 197 مرافعات)
  riskScore?: 'low' | 'medium' | 'high' | 'critical';
  stageNumber?: number; // For timelines / steps
}

export interface MindMapExportConfig {
  format: 'png' | 'jpeg' | 'svg' | 'pdf' | 'json' | 'text';
  pageSize: 'A4' | 'A3' | 'Letter';
  orientation: 'landscape' | 'portrait';
  fitToPage: boolean;
  includeSummary: boolean;
  includeLetterhead: boolean;
  includeClausesTable: boolean;
  includeQrStamp: boolean;
  watermark: boolean;
  resolution: '1x' | '2x' | '4x';
  scale: number;
}

