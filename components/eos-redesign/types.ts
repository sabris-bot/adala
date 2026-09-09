import { TerminationReasonKuwait, ContractTypeKuwait } from '../../types';

export interface RedesignedTakenLeave {
  id: string;
  fromDate: string;
  toDate: string;
  days: number;
  fridaysCount: number;
  netDays: number;
  leaveType: string;
  note: string;
  leaveTypeKey?: string;
  isUnpaid?: boolean;
}

export interface RedesignedFinancialItem {
  id: string;
  description: string;
  amount: number;
}

export interface RedesignedAuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export interface LegalArticle {
  id: string;
  articleNumber: string;
  title: string;
  text: string;
}

export const EOS_LEGAL_BASIS: LegalArticle[] = [
  {
    id: "art-51",
    articleNumber: "المادة (51) من قانون العمل الكويتي رقم 6 لسنة 2010",
    title: "مكافأة نهاية الخدمة",
    text: "يستحق العامل مكافأة نهاية خدمة في حال إنهاء عقده، بمعدل 15 يوماً عن كل سنة من السنوات الخمس الأولى، و30 يوماً عن كل سنة تالية، على ألا تزيد المكافأة عن أجر 18 شهراً لذوي الأجور الشهرية، وأجر سنة لمن يتقاضى أجره على أسس أخرى."
  },
  {
    id: "art-53",
    articleNumber: "المادة (53) من قانون العمل الكويتي رقم 6 لسنة 2010",
    title: "أثر الاستقالة على مكافأة نهاية الخدمة",
    text: "يستحق العامل المستقيل نصف المكافأة إذا قاربت خدمته بين 3 و5 سنوات، وثلثي المكافأة إذا بلغت خدمته 5 سنوات ولم تبلغ 10 سنوات، ويستحق المكافأة كاملة إذا بلغت خدمته 10 سنوات فأكثر."
  },
  {
    id: "art-54",
    articleNumber: "المادة (54) من قانون العمل الكويتي رقم 6 لسنة 2010",
    title: "استثناءات الاستقالة (المرأة العاملة)",
    text: "تستحق العاملة المكافأة كاملة في حال استقالتها بسبب زواجها خلال سنة من تاريخ عقد الزواج، أو بسبب الولادة خلال ستة أشهر من تاريخ الوضع."
  },
  {
    id: "art-62",
    articleNumber: "المادة (62) من قانون العمل الكويتي رقم 6 لسنة 2010",
    title: "حساب الأجر الشامل",
    text: "يراعى في حساب مستحقات العامل آخر أجر تقاضاه، ويقصد بالأجر الأجر الأساسي مضافاً إليه جميع العلاوات والبدلات والعمولات والمكافآت التي تصرف له بانتظام بصفة دورية."
  },
  {
    id: "art-70",
    articleNumber: "المادة (70) من قانون العمل الكويتي رقم 6 لسنة 2010",
    title: "الإجازة السنوية وتصفية الرصيد",
    text: "للعامل الحق في إجازة سنوية مدفوعة الأجر لا تقل عن 30 يوماً، ويستحق العامل تعويضاً نقدياً عن رصيد إجازاته المتراكمة عند انتهاء خدمته محسوباً على أساس آخر أجر تقاضاه."
  },
  {
    id: "art-72",
    articleNumber: "المادة (72) من قانون العمل الكويتي رقم 6 لسنة 2010",
    title: "تراكم رصيد الإجازات",
    text: "لصاحب العمل تنظيم الإجازات السنوية، ولا يجوز تجميع الإجازات لأكثر من سنتين إلا بموافقة العامل وبحد أقصى تصفية 60 يوماً عند المغادرة في حال التمسك بحدود المادة."
  }
];
