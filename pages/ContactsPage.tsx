import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import { 
    UserGroupIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    EnvelopeIcon, PhoneIcon, BuildingStorefrontIcon, UserTieIcon, BriefcaseIcon,
    UserCircleIcon, ScaleIcon, LightBulbIcon, BuildingLibraryIcon, BanknotesIcon, ListBulletIcon,
    DocumentDuplicateIcon, MapPinIcon, MagnifyingGlassIcon,
    FunnelIcon, StarIcon, ShareIcon, SparklesIcon, ChatBubbleLeftRightIcon, ClockIcon,
    ArrowPathIcon, CheckIcon, XMarkIcon
} from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import PrintHeader from '../components/ui/PrintHeader';
import { Contact, ContactType } from '../types';
import { contactTypeOptions } from '../constants';
import { Badge } from '../components/ui/Badge';
import { initialCases } from '../data/caseData';
import { mockFinancialTransactions } from './FinancialManagementPage';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../components/ui/Toast';

// Helper to get profile color based on name
const getAvatarColor = (name: string) => {
    const colors = [
        'bg-[#00796B]', 'bg-[#004D40]', 'bg-[#1565C0]', 'bg-[#0284C7]', 
        'bg-[#7C3AED]', 'bg-[#C2185B]', 'bg-[#D97706]', 'bg-[#059669]'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const ContactStatCard: React.FC<{ 
  title: string; 
  count: number; 
  colorClass: string; 
  icon: React.ReactNode; 
  onClick?: () => void;
  isSelected?: boolean;
}> = ({ title, count, colorClass, icon, onClick, isSelected }) => (
  <button 
    onClick={onClick}
    type="button"
    className={`w-full text-right p-5 rounded-2xl border transition-all duration-200 font-sans cursor-pointer group flex items-center justify-between shadow-sm ${
      isSelected 
        ? 'bg-[#00796B]/10 border-[#00796B] ring-2 ring-[#00796B]/20' 
        : 'bg-white dark:bg-dm-card border-slate-100 hover:border-slate-200 hover:shadow-md'
    }`}
  >
      <div>
          <p className="text-[11px] font-bold text-slate-400 mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-800 dark:text-dm-text">{count}</p>
      </div>
      <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${colorClass}`}>
          {icon}
      </div>
  </button>
);

const initialMockContacts: Contact[] = [
  { 
    id: 'contact1', 
    fullName: 'شركة الأمل للتجارة العامة والمقاولات', 
    contactType: [ContactType.CLIENT], 
    organization: 'شركة الأمل للتجارة العامة', 
    emailPrimary: 'amal@example.com', 
    phonePrimary: '22221111', 
    whatsapp: '22221111', 
    relatedCaseIds: ['1'], 
    createdAt: '2023-01-10T10:00:00Z', 
    city: 'مدينة الكويت', 
    country: 'الكويت', 
    notes: 'موكل رئيسي في قضايا تجارية متعددة وعقود تزويد سنوية مع المكتب.', 
    jobTitle:'مدير عام', 
    address: 'شرق، برج كيبكو، الدور 14، مكتب 3', 
    isFavorite: true, 
    tags: ['كبار العملاء', 'عقد سنوي', 'شركات'],
    poaNumber: '24559/2023',
    poaDate: '2023-01-10',
    poaType: 'توكيل عام بالبيع والرهن والقضايا والصلح وتفويض الغير',
    poaStatus: 'valid',
    interactions: [
      { id: '1', date: '2024-06-01T10:30:00Z', type: 'meeting', note: 'اجتماع لمناقشة مذكرة الاستئناف مع المستشار القانوني بالمكتب وتعديل الدفوع.', user: 'الأستاذ/ محمد الخالدي' },
      { id: '2', date: '2024-05-12T09:00:00Z', type: 'call', note: 'اتصال هاتفي للاستفسار عن تحصيل الشيك المودع في حرز محكمة التنفيذ.', user: 'أحمد محمود' }
    ]
  },
  { 
    id: 'contact2', 
    fullName: 'سارة عبدالله أحمد', 
    contactType: [ContactType.CLIENT, ContactType.FACT_WITNESS], 
    emailPrimary: 'sara.a@example.com', 
    phonePrimary: '55554444', 
    whatsapp: '55554444', 
    relatedCaseIds: ['2'], 
    createdAt: '2023-03-15T11:00:00Z', 
    jobTitle: 'مديرة تسويق', 
    organization: 'مؤسسة النور', 
    phoneSecondary: '50505050', 
    city: 'حولي', 
    country: 'الكويت',
    notes: 'موكلة في قضية الأحوال الشخصية وإثبات الحضانة والنفقة المستحقة.',
    poaNumber: '9833/2024',
    poaDate: '2024-03-12',
    poaType: 'توكيل خاص في القضايا والأحوال الشخصية',
    poaStatus: 'valid',
    interactions: [
      { id: '1', date: '2024-04-15T12:00:00Z', type: 'whatsapp', note: 'تم إرسال نسخة حكم الدرجة الأولى عبر الواتساب وتطمينها بشأن حضانة الأولاد.', user: 'فاطمة علي' }
    ]
  },
  { 
    id: 'contact3', 
    fullName: 'مؤسسة النور الدولية للمقاولات', 
    contactType: [ContactType.OPPOSING_PARTY], 
    organization: 'مؤسسة النور الدولية', 
    emailPrimary: 'noor.corp@example.com', 
    phonePrimary: '33336666', 
    relatedCaseIds: ['5'], 
    createdAt: '2023-05-01T12:00:00Z', 
    address: 'الشويخ الصناعية، قطعة 3، قسيمة 100', 
    city:'الشويخ', 
    country:'الكويت',
    notes: 'الخصم المباشر في قضية التعويض عن عيوب المقاولة الإنشائية بمستشفى الصباح.',
    interactions: [
      { id: '1', date: '2024-03-10T14:00:00Z', type: 'call', note: 'اتصال من محاميهم لعرض تسوية ودية بقيمة 12,000 د.ك مقابل التنازل واستلام الأعمال.', user: 'الأستاذ/ محمد الخالدي' }
    ]
  },
  { 
    id: 'contact4', 
    fullName: 'د. علي حسين الخبير', 
    contactType: [ContactType.EXPERT_WITNESS], 
    emailPrimary: 'dr.ali.h@example.com', 
    phonePrimary: '66667777', 
    whatsapp: '66667777', 
    jobTitle: 'خبير هندسي معتمد', 
    organization: 'مكتب الخبرة الهندسية التخصصية', 
    createdAt: '2023-06-20T14:30:00Z', 
    notes: 'خبير معتمد ومندوب من قبل وزارة العدل - إدارة الخبراء لتقييم الأضرار الإنشائية بنزاع المقاولات.', 
    city: 'الفروانية',
    tags: ['خبير هندسي', 'انتداب محكمة'],
    interactions: [
      { id: '1', date: '2024-05-20T11:00:00Z', type: 'meeting', note: 'تم حضور جلسة الانتقال مع الخبير للموقع وإثبات العيوب الظاهرية للخرسانة المسلحة.', user: 'الأستاذ/ محمد الخالدي' }
    ]
  },
  { 
    id: 'contact5', 
    fullName: 'محمد جاسم الفضلي', 
    contactType: [ContactType.FACT_WITNESS], 
    phonePrimary: '99998888', 
    relatedCaseIds: ['4'], 
    createdAt: '2023-07-01T09:00:00Z', 
    city: 'الجهراء',
    notes: 'شاهد واقعة في قضية إثبات واقعة تعدي وعقد إيجار باطل بالتفويض الفرعي.',
    interactions: [
      { id: '1', date: '2024-02-18T10:00:00Z', type: 'meeting', note: 'جلسة تمهيدية مع الشاهد لتأكيد تفاصيل حضور الواقعة أمام الهيئة الاستئنافية الموقرة.', user: 'أحمد محمود' }
    ]
  },
  { 
    id: 'contact6', 
    fullName: 'المحامي/ خالد ناصر السالم', 
    contactType: [ContactType.OPPOSING_COUNSEL], 
    organization: 'مكتب السالم ومشاركوه للمحاماة', 
    emailPrimary: 'khaled.salem@lawfirm.com', 
    phonePrimary: '22445566', 
    whatsapp: '22445566', 
    createdAt: '2023-08-10T16:00:00Z', 
    tags: ['محامي الخصم', 'مستشار تجاري'],
    city: 'شرق، شارع الشهيد، برج التحرير',
    interactions: [
      { id: '1', date: '2024-04-02T13:00:00Z', type: 'meeting', note: 'اجتماع ثنائي بقاعة المحامين لبحث تبادل مذكرات الدفاع وتأجيل الجلسة بطلب مشترك لورود الخبير.', user: 'الأستاذ/ محمد الخالدي' }
    ]
  },
  { 
    id: 'contact7', 
    fullName: 'محكمة الاستئناف - دائرة الإيجارات', 
    contactType: [ContactType.COURT_CLERK], 
    organization: 'وزارة العدل الكلية', 
    phonePrimary: '22550011', 
    createdAt: '2023-09-05T10:30:00Z', 
    notes: 'أمين سر الدائرة السابعة بالمحكمة الكلية للاستفسار وتسهيل سحب الملف والصحف.', 
    city: 'مجمع محاكم العاصمة',
    interactions: [
      { id: '1', date: '2024-05-09T08:30:00Z', type: 'other', note: 'مراجعة المندوب لقلم السر لتصوير محضر الجلسة السابقة وتأكيد إيداع تقرير السادة الخبراء الماليين.', user: 'خلف المطيري (مندوب المكتب)' }
    ]
  },
  { 
    id: 'contact8', 
    fullName: 'البنك المركزي الكويتي', 
    contactType: [ContactType.GOVERNMENT_ENTITY], 
    organization: 'البنك المركزي كجهة سيادية رقابية', 
    emailPrimary: 'info@cbk.gov.kw', 
    phonePrimary: '1814444', 
    createdAt: '2023-10-12T08:00:00Z', 
    city: 'العاصمة - شرق', 
    isFavorite: true,
    notes: 'خطابات توجيه الحجز والتحفظ على الحسابات المصرفية وطلب كشوفات سرية الحساب الكويتي.'
  },
  { 
    id: 'contact9', 
    fullName: 'م. فهد الساير', 
    contactType: [ContactType.EXPERT_WITNESS], 
    jobTitle: 'خبير حسابي معتمد', 
    organization: 'مكتب الساير لتدقيق الحسابات والاستشارات والخبرة القضائية', 
    phonePrimary: '55667788', 
    createdAt: '2023-11-20T11:00:00Z', 
    tags: ['خبير مالي', 'انتداب مصرفي'], 
    city: 'شرق' 
  },
];

// --- Contact Form Modal ---
interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Contact) => void;
  initialData?: Partial<Contact> | null;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<Contact>>(
    initialData || { contactType: [ContactType.CLIENT], createdAt: new Date().toISOString(), tags: [], isFavorite: false, poaStatus: 'valid' }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { contactType: [ContactType.CLIENT], createdAt: new Date().toISOString(), relatedCaseIds: [], tags: [], isFavorite: false, poaStatus: 'valid' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleTypeBadge = (typeVal: ContactType) => {
    setFormData(prev => {
      const current = prev.contactType || [];
      if (current.includes(typeVal)) {
        if (current.length === 1) return prev; // Keep at least one
        return { ...prev, contactType: current.filter(t => t !== typeVal) };
      } else {
        return { ...prev, contactType: [...current, typeVal] };
      }
    });
  };

  const handlePoaStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, poaStatus: e.target.value as any }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.contactType || formData.contactType.length === 0) {
        addToast({
            type: 'warning',
            title: 'بيانات ناقصة',
            message: "يرجى إدخال الاسم الكامل واختيار نوع جهة الاتصال على الأقل."
        });
        return;
    }
    onSubmit({
        ...formData,
        id: formData.id || `contact-${Date.now()}`,
        updatedAt: new Date().toISOString(),
        createdAt: formData.createdAt || new Date().toISOString(),
    } as Contact);
    onClose();
  };

  const isClient = formData.contactType?.includes(ContactType.CLIENT);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل بيانات جهة الاتصال" : "إضافة جهة اتصال جديدة"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto p-1 font-sans no-scrollbar">
        
        {/* Contact Type Selector as interactive pills */}
        <div className="bg-slate-50 dark:bg-dm-card/40 p-4 rounded-2xl border border-slate-100">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                تصنيف جهة الاتصال (*) <span className="text-[10px] text-slate-400 font-normal">(يمكن تحديد أكثر من صفة)</span>
            </label>
            <div className="flex flex-wrap gap-2">
                {contactTypeOptions.map(option => {
                    const isSelected = formData.contactType?.includes(option.value as ContactType);
                    return (
                        <button
                            type="button"
                            key={option.value}
                            onClick={() => toggleTypeBadge(option.value as ContactType)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                                isSelected 
                                    ? 'bg-[#00796B] text-white border-[#00796B] shadow-sm' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {isSelected && <CheckIcon className="w-3.5 h-3.5" />}
                            <span>{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="fullName" label="الاسم الكامل / اسم الشركة أو المؤسسة (*)" value={formData.fullName || ''} onChange={handleChange} required />
            <Input name="organization" label="المؤسسة / التبعية الإدارية" value={formData.organization || ''} onChange={handleChange} placeholder="مثال: شركة الأمل / وزارة العدل" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="jobTitle" label="المسمى الوظيفي / الصفة" value={formData.jobTitle || ''} onChange={handleChange} placeholder="مثال: مدير عام / خبير هندسي" />
            <Input 
                name="tags" 
                label="الوسوم والتصنيفات الفرعية (فاصلة)" 
                value={formData.tags?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s)}))} 
                placeholder="مثال: كبار العملاء، عقارات، شركات"
            />
        </div>

        {/* Dynamic POA Section if CLIENT */}
        {isClient && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-4">
                <div className="flex items-center gap-2 text-[#00796B] font-black text-xs">
                    <ScaleIcon className="w-4 h-4"/>
                    <span>بيانات التوكيل القضائي بالعدل</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input name="poaNumber" label="رقم الوكالة بالعدل" value={formData.poaNumber || ''} onChange={handleChange} placeholder="مثال: 24559/2023" />
                    <Input name="poaDate" label="تاريخ التوثيق" value={formData.poaDate || ''} onChange={handleChange} type="date" />
                    <div className="flex flex-col">
                        <label className="block text-xs font-black text-gray-500 mb-1">حالة التوكيل</label>
                        <select 
                            value={formData.poaStatus || 'valid'} 
                            onChange={handlePoaStatusChange}
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                        >
                            <option value="valid">نشط / ساري المفعول ✅</option>
                            <option value="expired">منتهي الصلاحية ⚠️</option>
                            <option value="revoked">ملغى من الموكل ❌</option>
                        </select>
                    </div>
                </div>
                <Input name="poaType" label="حدود وصلاحيات التوكيل القانوني" value={formData.poaType || ''} onChange={handleChange} placeholder="مثال: توكيل عام قضايا وتمثيل أمام الخبراء والتمييز والصلح" />
            </div>
        )}

        <div className="bg-slate-50 dark:bg-dm-card/30 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">قنوات الاتصال والتواصل</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <Input name="phonePrimary" label="الهاتف الأساسي" value={formData.phonePrimary || ''} onChange={handleChange} type="tel" placeholder="965+"/>
                 <Input name="phoneSecondary" label="هاتف ثانوي" value={formData.phoneSecondary || ''} onChange={handleChange} type="tel"/>
                 <Input name="whatsapp" label="رقم الواتساب المعتمد" value={formData.whatsapp || ''} onChange={handleChange} type="tel"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input name="emailPrimary" label="البريد الإلكتروني الأساسي" value={formData.emailPrimary || ''} onChange={handleChange} type="email" placeholder="client@domain.com"/>
                 <Input name="emailSecondary" label="بريد إلكتروني إضافي" value={formData.emailSecondary || ''} onChange={handleChange} type="email"/>
            </div>
        </div>

        <div className="bg-slate-50 dark:bg-dm-card/30 p-4 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">العنوان والموقع</h4>
            <TextArea name="address" label="العنوان التفصيلي" value={formData.address || ''} onChange={handleChange} rows={2} placeholder="المنطقة، قطعة، الشارع، المبنى/البرج..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="city" label="المدينة / المنطقة" value={formData.city || ''} onChange={handleChange} />
                <Input name="country" label="الدولة" value={formData.country || 'الكويت'} onChange={handleChange} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                name="relatedCaseIds" 
                label="أرقام الملفات أو القضايا المرتبطة" 
                value={formData.relatedCaseIds?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({...prev, relatedCaseIds: e.target.value.split(',').map(s => s.trim()).filter(s => s)}))} 
                placeholder="مثال: C-101, LAW-2024-001"
            />
            <div className="flex items-center pt-6 gap-2">
                <input 
                    type="checkbox" 
                    id="isFavorite" 
                    checked={formData.isFavorite || false} 
                    onChange={e => setFormData(prev => ({...prev, isFavorite: e.target.checked}))}
                    className="w-4 h-4 rounded text-[#00796B] focus:ring-[#00796B]"
                />
                <label htmlFor="isFavorite" className="text-xs font-extrabold text-slate-700 cursor-pointer">إضافة للمفضلة في الدليل السريع</label>
            </div>
        </div>

        <TextArea name="notes" label="ملاحظات وسجل إداري حر" value={formData.notes || ''} onChange={handleChange} rows={3} placeholder="أي ملاحظات خاصة بالتواصل، سلوك الخصم، أو توجيهات الموكل..." />
        
        <div className="flex justify-end space-x-3 space-x-reverse pt-4 sticky bottom-0 bg-white dark:bg-dm-card p-2 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
          <Button type="submit" className="rounded-xl bg-[#00796B] hover:bg-[#004D40] text-white font-black">{initialData?.id ? "حفظ التعديلات" : "إضافة جهة الاتصال"}</Button>
        </div>
      </form>
    </Modal>
  );
};

// --- vCard QR & ID Display utility ---
const ContactVCardQR: React.FC<{ contact: Contact }> = ({ contact }) => {
    const handleDownloadVCard = () => {
        const vcardText = `BEGIN:VCARD
VERSION:3.0
FN;CHARSET=UTF-8:${contact.fullName}
ORG;CHARSET=UTF-8:${contact.organization || ''}
TITLE;CHARSET=UTF-8:${contact.jobTitle || ''}
TEL;TYPE=CELL,VOICE:${contact.phonePrimary || ''}
TEL;TYPE=HOME,VOICE:${contact.phoneSecondary || ''}
TEL;TYPE=WORK,FAX:${contact.whatsapp || ''}
EMAIL;TYPE=PREF,INTERNET:${contact.emailPrimary || ''}
ADR;TYPE=WORK;CHARSET=UTF-8:;;${contact.address || ''};${contact.city || ''};;${contact.country || 'الكويت'}
NOTE;CHARSET=UTF-8:${contact.notes?.replace(/\n/g, ' ') || 'سجل اتصالات عدالة'}
REV:${new Date().toISOString()}
END:VCARD`;

        const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${contact.fullName.replace(/\s+/g, '_')}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex flex-col items-center justify-center text-center font-sans">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-3">
                <svg width="110" height="110" viewBox="0 0 100 100" className="text-slate-800">
                    <rect width="100" height="100" fill="white" />
                    <rect x="5" y="5" width="25" height="25" className="fill-current" />
                    <rect x="8" y="8" width="19" height="19" fill="white" />
                    <rect x="12" y="12" width="11" height="11" className="fill-current" />

                    <rect x="70" y="5" width="25" height="25" className="fill-current" />
                    <rect x="73" y="8" width="19" height="19" fill="white" />
                    <rect x="77" y="12" width="11" height="11" className="fill-current" />

                    <rect x="5" y="70" width="25" height="25" className="fill-current" />
                    <rect x="8" y="73" width="19" height="19" fill="white" />
                    <rect x="12" y="77" width="11" height="11" className="fill-current" />

                    <rect x="40" y="5" width="5" height="5" className="fill-current" />
                    <rect x="50" y="10" width="10" height="5" className="fill-current" />
                    <rect x="45" y="20" width="5" height="15" className="fill-current" />
                    <rect x="60" y="15" width="5" height="5" className="fill-current" />
                    <rect x="35" y="45" width="15" height="5" className="fill-current" />
                    <rect x="10" y="40" width="5" height="10" className="fill-current" />
                    <rect x="25" y="35" width="5" height="5" className="fill-current" />
                    <rect x="55" y="35" width="10" height="5" className="fill-current" />
                    <rect x="60" y="50" width="5" height="10" className="fill-current" />
                    <rect x="45" y="60" width="10" height="10" className="fill-current" />
                    <rect x="35" y="75" width="5" height="5" className="fill-current" />
                    <rect x="75" y="40" width="15" height="15" className="fill-current" />
                    <rect x="80" y="65" width="10" height="10" className="fill-current" />
                    <rect x="70" y="80" width="5" height="15" className="fill-current" />
                    <rect x="80" y="85" width="15" height="5" className="fill-current" />
                    <circle cx="50" cy="50" r="7" className="fill-[#00796B]" />
                    <path d="M48 48h4v4h-4z" fill="white"/>
                </svg>
            </div>
            <p className="text-xs font-black text-slate-700 mb-0.5">بطاقة الهوية السريعة (vCard)</p>
            <p className="text-[10px] text-slate-400 mb-3">امسح الكود بكاميرا الجوال لحفظ جهة الاتصال مباشرة</p>
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white text-slate-700 border-slate-200 rounded-xl font-bold"
                onClick={handleDownloadVCard}
                leftIcon={<DocumentDuplicateIcon className="w-4 h-4"/>}
            >
                تحميل ملف vCard
            </Button>
        </div>
    );
};

// --- AI Smart Legal Messenger module ---
const AIMessageDrafter: React.FC<{ contact: Contact }> = ({ contact }) => {
    const { addToast } = useToast();
    const [templateType, setTemplateType] = useState('warning');
    const [tone, setTone] = useState('formal');
    const [additionalContext, setAdditionalContext] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [draftedText, setDraftedText] = useState('');

    const generateLanguagePrompt = () => {
        let typeLabel = '';
        switch(templateType) {
            case 'warning': typeLabel = 'إنذار وتنبيه رسمي بتأخر سداد مستحقات مالية وإعطاء مهلة أخيرة.'; break;
            case 'invite': typeLabel = 'دعوة لمراجعة مكتب المحاماة فوراً لأمر بالغ الأهمية وتوقيع صحيفة الدعوى التكميلية.'; break;
            case 'court_verdict': typeLabel = 'إبلاغ رسمي ومفصل بصدور حكم قضائي في ملف القضية وشرح منطوق الحكم بنبرة عقلانية.'; break;
            case 'doc_request': typeLabel = 'طلب مستندات رسمية تكميلية وثبوتيات مهمة (كالبطاقة المدنية، رخص تجارية) لتقديمها أمام الخبراء.'; break;
            case 'whatsapp_friendly': typeLabel = 'رسالة تواصل ومتابعة ودية عبر تطبيق واتساب لإبقاء الطرف على علم بالمستجدات.'; break;
        }

        let toneLabel = '';
        switch(tone) {
            case 'formal': toneLabel = 'رسمية، مهنية، قانونية رصينة وواضحة جداً.'; break;
            case 'serious': toneLabel = 'شديدة الجدية والصرامة والحزم مع التحذير من العواقب القانونية والإجراءات القضائية.'; break;
            case 'friendly': toneLabel = 'ودية، حليمة، مطمئنة وبناءة لشراكة مستديمة.'; break;
        }

        return `المتلقي: ${contact.fullName}
توصيف العلاقة: ${contact.contactType.join(' - ')}
الشركة/المؤسسة: ${contact.organization || 'شخص بمفرده'}
المسمى الوظيفي: ${contact.jobTitle || 'غير متوفر'}
رقم التوكيل القضائي (إن وجد للموكلين): ${contact.poaNumber || 'لا يوجد'}

الموضوع المراد صياغته: [${typeLabel}]
النبرة والأسلوب: [${toneLabel}]
ملاحظات وتفاصيل إضافية مخصصة من المستخدم: [${additionalContext || 'صياغة قياسية متزنة'}]

المطلوب: قم بصياغة نص رسالة قانونية / مهنية كاملة ومكتوبة باللغة العربية الفصحى السليمة وبشكل مباشر، تبدأ بالتحية الرسمية وتنتهي بتوقيع المكتب (مكتب عدالة للمحاماة والاستشارات القانونية). لا تشمل أي وسوم، فقط الرسالة جاهزة للنسخ الفوري.`;
    };

    const handleGenDraft = async () => {
        setIsGenerating(true);
        try {
            const prompt = generateLanguagePrompt();
            const result = await geminiService.getChatbotResponse(prompt);
            setDraftedText(result);
            addToast({
                type: 'success',
                title: 'توليد النص الذكي',
                message: 'تمت صياغة الرسالة بنجاح بواسطة عقل عدالة الذكي.'
            });
        } catch (e) {
            setDraftedText("عذراً، فشل نظام الذكاء الاصطناعي في معالجة طلب الصياغة حالياً. يرجى مراجعة تفاصيل الاتصال بالإنترنت.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(draftedText);
        addToast({
            type: 'success',
            title: 'تم النسخ',
            message: 'تم نسخ نص الرسالة إلى الحافظة بنجاح.'
        });
    };

    const handleSendWhatsApp = () => {
        const phone = contact.whatsapp || contact.phonePrimary || '';
        if (!phone) {
             addToast({
                 type: 'info',
                 title: 'رقم هاتف ناقص',
                 message: 'لا يتوفر رقم واتساب معتمد في دليل هذا الملف.'
             });
             return;
        }
        const encodedText = encodeURIComponent(draftedText);
        window.open(`https://wa.me/${phone.replace(/\+/g, '')}?text=${encodedText}`, '_blank');
    };

    return (
        <div className="bg-gradient-to-br from-[#00796B]/5 to-indigo-50/20 border border-[#00796B]/15 p-5 rounded-2xl space-y-4 font-sans">
            <div className="flex items-center gap-2 text-[#00796B] font-black text-xs">
                <SparklesIcon className="w-5 h-5"/>
                <span>مساعد المراسلة والمبرق الذكي (عدالة AI)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1">غرض الرسالة</label>
                    <select 
                        value={templateType} 
                        onChange={(e) => setTemplateType(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                    >
                        <option value="warning">⚠️ إنذار رسمي بتأخر السداد المالي</option>
                        <option value="invite">📅 دعوة مستعجلة لزيارة وتوقيع</option>
                        <option value="court_verdict">⚖️ إشعار وتفصيل صدور حكم قضائي</option>
                        <option value="doc_request">📁 طلب تزويد بمستندات تكميلية</option>
                        <option value="whatsapp_friendly">💬 رسالة واتساب قصيرة وودية</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1">النبرة القانونية</label>
                    <select 
                        value={tone} 
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                    >
                        <option value="formal">👔 رسمي مهني مستقر</option>
                        <option value="serious">🔥 حازم وجاد جداً (قانوني صارم)</option>
                        <option value="friendly">🤝 ودي متعاون ومرن</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1">تفاصيل إضافية مخصصة (اختياري)</label>
                <textarea 
                    value={additionalContext}
                    onChange={(e) => setAdditionalContext(e.target.value)}
                    placeholder="مثال: ذكّرهم بمهلة الـ 48 ساعة قبل اللجوء لإجراء المنع المباشر من السفر وتحصيل المطالبة..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B] resize-none"
                    rows={2}
                />
            </div>

            <Button 
                onClick={handleGenDraft} 
                className="w-full bg-[#00796B] hover:bg-[#004D40] text-white font-black text-xs py-2.5 rounded-xl flex items-center justify-center shadow-md transition-all"
                isLoading={isGenerating}
                leftIcon={<SparklesIcon className="w-4 h-4"/>}
            >
                صياغة الرسالة بالذكاء الاصطناعي
            </Button>

            {draftedText && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-500 pt-2 border-t">
                        <span>المعايش والمستند المصاغ:</span>
                        <div className="flex gap-3">
                            <button onClick={handleCopyToClipboard} className="text-[#00796B] hover:underline font-black cursor-pointer">نسخ النص</button>
                            {contact.whatsapp && <button onClick={handleSendWhatsApp} className="text-emerald-600 hover:underline font-black cursor-pointer">إرسال واتساب 💬</button>}
                        </div>
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl leading-relaxed text-xs font-semibold text-slate-800 whitespace-pre-wrap text-right border-r-4 border-r-emerald-500 shadow-sm max-h-56 overflow-y-auto no-scrollbar">
                        {draftedText}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// --- 360 View Modal (Advanced) ---
interface ViewContactModalProps {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onSendNotification: (contact: Contact) => void;
  onUpdateInteractions: (contactId: string, newInteractions: any[]) => void;
}

const ViewContactModal: React.FC<ViewContactModalProps> = ({ contact, onClose, onEdit, onSendNotification, onUpdateInteractions }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'financial' | 'history' | 'ai'>('overview');
  const [newInteractionType, setNewInteractionType] = useState<'call' | 'meeting' | 'email' | 'whatsapp' | 'other'>('call');
  const [newInteractionNote, setNewInteractionNote] = useState('');
  const [newInteractionUser, setNewInteractionUser] = useState('الأستاذ/ الموكل المتابع');
  const { addToast } = useToast();

  if (!contact) return null;
  
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : 'غير متوفر';
  const relatedCases = initialCases.filter(c => 
      c.clientName === contact.fullName || 
      c.opposingPartyName === contact.fullName || 
      contact.relatedCaseIds?.includes(c.id) ||
      contact.relatedCaseIds?.includes(c.caseNumber)
  );
  
  const relatedFinancials = mockFinancialTransactions.filter(ft => 
      ft.vendorOrPayee === contact.fullName || 
      (ft.relatedToEntity === 'client' && ft.relatedEntityName === contact.fullName)
  );

  const localInteractions = contact.interactions || [];

  const handleCreateInteraction = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newInteractionNote.trim()) {
           addToast({
               type: 'warning',
               title: 'ملاحظة غير مكتملة',
               message: 'يرجى كتابة ملخص أو ملاحظة للتفاعل المراد تسجيله.'
           });
           return;
      }
      const newAction = {
          id: `inter-${Date.now()}`,
          date: new Date().toISOString(),
          type: newInteractionType,
          note: newInteractionNote.trim(),
          user: newInteractionUser.trim()
      };
      const updatedList = [newAction, ...localInteractions];
      onUpdateInteractions(contact.id, updatedList);
      setNewInteractionNote('');
      addToast({
          type: 'success',
          title: 'تسجيل التفاعل',
          message: 'تم إدراج وتسجيل معاملة الاتصال في الملف بنجاح.'
      });
  };

  const getInteractionIcon = (type: string) => {
      switch(type) {
          case 'call': return <PhoneIcon className="w-3.5 h-3.5 text-blue-500" />;
          case 'meeting': return <UserGroupIcon className="w-3.5 h-3.5 text-purple-500" />;
          case 'email': return <EnvelopeIcon className="w-3.5 h-3.5 text-amber-500" />;
          case 'whatsapp': return <ChatBubbleLeftRightIcon className="w-3.5 h-3.5 text-emerald-500" />;
          default: return <ClockIcon className="w-3.5 h-3.5 text-slate-500" />;
      }
  };

  const getInteractionLabel = (type: string) => {
      switch(type) {
         case 'call': return 'اتصال هاتفي صادر/وارد';
         case 'meeting': return 'اجتماع عمل بالمكتب الرئيسي';
         case 'email': return 'مراسلة عبر البريد الإلكتروني';
         case 'whatsapp': return 'تحديث ومراسلة فورية عبر واتساب';
         default: return 'مراجعة ميدانية / أخرى';
      }
  };

  const isClient = contact.contactType.includes(ContactType.CLIENT);

  const renderOverview = () => (
      <div className="space-y-6 pt-2 font-sans">
        <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 dark:bg-dm-card p-6 rounded-2xl border border-slate-100">
            <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-md ${getAvatarColor(contact.fullName)} shrink-0`}>
                {contact.fullName.charAt(0)}
            </div>
            <div className="text-center md:text-right">
                <h3 className="text-xl font-black text-slate-900 dark:text-dm-text mb-1">{contact.fullName}</h3>
                <p className="text-[#00796B] font-bold text-xs">{contact.jobTitle} {contact.organization ? `في ${contact.organization}` : ''}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-3">
                    {contact.contactType.map(type => <Badge key={type} text={type} variant={type === ContactType.CLIENT ? 'success' : 'secondary'} size="xs"/>)}
                </div>
            </div>
            <div className="md:ms-auto flex flex-col items-center">
                <span className="text-[10px] text-slate-400 uppercase font-black mb-1">القضايا المرتبطة</span>
                <div className="bg-white dark:bg-dm-background p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <ScaleIcon className="w-5 h-5 text-[#00796B]"/>
                    <span className="text-lg font-black">{relatedCases.length}</span>
                </div>
            </div>
        </div>

        {/* Dynamic POA Display Panel */}
        {isClient && (
            <div className={`p-5 rounded-2xl border ${contact.poaStatus === 'valid' ? 'bg-emerald-50/40 border-emerald-100 text-[#00796B]' : 'bg-rose-50/40 border-rose-100 text-rose-700'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 font-black text-sm">
                        <ScaleIcon className="w-5 h-5 shrink-0" />
                        <span>بيانات التوكيل القضائي الموثق بالعدل</span>
                    </div>
                    {contact.poaNumber ? (
                        <p className="text-xs font-bold text-slate-600 dark:text-gray-400 leading-relaxed">
                            مقيد تحت رقم الوكالة <span className="font-mono text-[#00796B] font-black">{contact.poaNumber}</span> بتاريخ توثيق <span className="font-mono font-bold">{contact.poaDate || '-'}</span>. 
                            <br />
                            <span className="text-[11px] text-slate-500 font-medium">الصلاحيات: {contact.poaType || 'عام القضايا والاستئناف والتمييز.'}</span>
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400 font-bold">لا تتوفر تفاصيل توكيل بالعدل لهذا الموكل حالياً. يمكنك تعديل الملف لتحديث البيانات.</p>
                    )}
                </div>
                <div>
                    <span className={`px-4 py-2 font-extrabold text-xs rounded-xl ${contact.poaStatus === 'valid' ? 'bg-emerald-100 text-emerald-800' : contact.poaStatus === 'expired' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'}`}>
                        {contact.poaStatus === 'valid' ? 'الوكالة: سارية ✅' : contact.poaStatus === 'expired' ? 'الوكالة: منتهية ⚠️' : 'الوكالة: ملغاة ❌'}
                    </span>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-[#00796B]"/> قنوات الاتصال والتواصل
                </h4>
                <div className="grid grid-cols-1 gap-2">
                    {contact.phonePrimary && (
                        <div className="flex items-center justify-between p-3.5 bg-white dark:bg-dm-card rounded-xl border border-slate-100 shadow-sm">
                            <span className="text-xs text-slate-500 font-bold">الهاتف الأساسي</span>
                            <a href={`tel:${contact.phonePrimary}`} className="font-mono font-bold text-slate-800 hover:text-[#00796B] transition-colors text-sm">{contact.phonePrimary}</a>
                        </div>
                    )}
                    {contact.whatsapp && (
                        <div className="flex items-center justify-between p-3.5 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 shadow-sm">
                            <span className="text-xs text-emerald-700 font-black">رقم المراسلات (واتساب)</span>
                            <a href={`https://wa.me/${contact.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-600 flex items-center gap-1 text-sm">
                                {contact.whatsapp} <ChatBubbleLeftRightIcon className="w-4 h-4"/>
                            </a>
                        </div>
                    )}
                    {contact.emailPrimary && (
                        <div className="flex items-center justify-between p-3.5 bg-blue-50/40 dark:bg-blue-950/20 rounded-xl border border-blue-100 shadow-sm">
                            <span className="text-xs text-blue-700 font-black">البريد الإلكتروني الرئيسي</span>
                            <a href={`mailto:${contact.emailPrimary}`} className="font-bold text-blue-600 hover:underline text-sm font-mono">{contact.emailPrimary}</a>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <ContactVCardQR contact={contact} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-[#00796B]"/> العنوان والموقع
                </h4>
                <div className="p-4 bg-white dark:bg-dm-card rounded-2xl border border-slate-100 shadow-sm text-xs space-y-2">
                    <p className="font-black text-slate-800">{contact.address || 'لا يوجد عنوان مسجل بالتفصيل'}</p>
                    <p className="text-slate-500 font-bold">{contact.city} {contact.country ? `، ${contact.country}` : ''}</p>
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${contact.fullName} ${contact.city || ''} الكويت`)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full mt-2 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors bg-white font-black text-slate-700 cursor-pointer"
                    >
                        <MapPinIcon className="w-4 h-4 text-[#00796B]"/> عرض الموقع على الخريطة
                    </a>
                </div>
                {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {contact.tags.map(tag => <span key={tag} className="px-2.5 py-1 bg-[#00796B]/10 text-[#00796B] text-[10px] font-black rounded-lg border border-[#00796B]/20">{tag}</span>)}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">ملاحظات الملف</h4>
                <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100/60 shadow-sm text-xs min-h-[140px] flex items-center">
                    <p className="text-amber-900 leading-relaxed italic font-semibold">
                        "{contact.notes || 'لا تتوفر ملاحظات إدارية مسجلة في ملف جهة الاتصال هذه.'}"
                    </p>
                </div>
            </div>
        </div>
      </div>
  );

  const renderCases = () => (
      <div className="grid grid-cols-1 gap-4 pt-2 font-sans">
          {relatedCases.length > 0 ? (
              relatedCases.map(c => (
                  <div key={c.id} className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-[#00796B]/10 rounded-xl text-[#00796B] group-hover:bg-[#00796B] group-hover:text-white transition-colors">
                              <FolderIcon className="w-6 h-6" />
                          </div>
                          <div>
                              <p className="font-black text-slate-900 mb-0.5">{c.title}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-lg font-black">{c.caseNumber}</span>
                                  <span>{c.courtName}</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-right">
                          <Badge text={c.status} variant={c.status === 'قيد الانتظار' ? 'warning' : 'success'} size="xs" />
                          <Badge text={c.clientName === contact.fullName ? 'موكل مباشر' : 'خصم معارض'} variant={c.clientName === contact.fullName ? 'success' : 'danger'} size="xs" />
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FolderIcon className="w-12 h-12 mx-auto text-slate-300 mb-2"/>
                  <p className="text-slate-400 font-bold">لا توجد قضايا أو دعاوى مسجلة ومرتبطة بهذا الاسم حالياً</p>
              </div>
          )}
      </div>
  );

  return (
    <Modal isOpen={!!contact} onClose={onClose} title={`الملف المركزي الكامل: ${contact.fullName}`} size="xl">
      <div className="flex border-b border-slate-200 mb-6 bg-slate-50 p-1 rounded-2xl font-sans overflow-x-auto no-scrollbar whitespace-nowrap">
          {[
              { id: 'overview', label: 'المعلومات ٣٦٠°', icon: <UserCircleIcon className="w-4 h-4"/> },
              { id: 'cases', label: `القضايا والطعون (${relatedCases.length})`, icon: <ScaleIcon className="w-4 h-4"/> },
              { id: 'financial', label: 'الذمة المالية والمقبوضات', icon: <BanknotesIcon className="w-4 h-4"/> },
              { id: 'history', label: `سجل الاتصالات (${localInteractions.length})`, icon: <ClockIcon className="w-4 h-4"/> },
              { id: 'ai', label: 'الصياغة والذكاء الاصطناعي', icon: <SparklesIcon className="w-4 h-4 text-[#00796B]"/> }
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-black transition-all rounded-xl cursor-pointer ${activeTab === tab.id ? 'bg-white shadow-sm text-[#00796B]' : 'text-slate-500 hover:text-slate-800'}`}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
          ))}
      </div>

      <div className="min-h-[440px] max-h-[65vh] overflow-y-auto no-scrollbar pr-1">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'cases' && renderCases()}
          {activeTab === 'ai' && <AIMessageDrafter contact={contact} />}
          {activeTab === 'financial' && (
              <div className="p-4 space-y-4 font-sans">
                  <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-5 mb-4 text-[#00796B] flex justify-between items-center">
                       <div>
                            <span className="text-[10px] uppercase font-black text-slate-400 block mb-1">إجمالي الحركة المالية</span>
                            <span className="text-xl font-black">
                                 {relatedFinancials.length > 0 
                                      ? relatedFinancials.reduce((sum, current) => sum + current.amount, 0).toFixed(3)
                                      : '0.000'} د.ك
                            </span>
                       </div>
                       <Badge text="دفعت بالكامل" variant="success" size="sm" />
                  </div>
                  {relatedFinancials.length > 0 ? (
                      relatedFinancials.map(tx => (
                          <div key={tx.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <div>
                                  <p className="font-bold text-slate-900 text-xs">{tx.description}</p>
                                  <p className="text-[10px] text-slate-400 font-mono mt-1">{formatDate(tx.transactionDate)}</p>
                              </div>
                              <div className={`text-sm font-black font-mono ${tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {tx.amount.toFixed(3)} د.ك
                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="text-center text-slate-400 py-12 italic text-xs">لا توجد سجلات مالية أو دفعات مسجلة مباشرة تحت اسم جهة الاتصال.</p>
                  )}
              </div>
          )}
          {activeTab === 'history' && (
              <div className="space-y-6 font-sans">
                  {/* Register New Interaction Live Form */}
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
                       <h5 className="text-xs font-black text-slate-800">تسجيل وتوثيق تواصل أو مقابلة جديدة</h5>
                       <form onSubmit={handleCreateInteraction} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-3">
                                <label className="block text-[10px] font-black text-slate-500 mb-1">قناة التفاعل</label>
                                <select 
                                    value={newInteractionType} 
                                    onChange={(e) => setNewInteractionType(e.target.value as any)}
                                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-right focus:outline-none"
                                >
                                    <option value="call">📞 اتصال هاتفي</option>
                                    <option value="meeting">🤝 اجتماع بالمكتب</option>
                                    <option value="whatsapp">💬 رسالة واتساب</option>
                                    <option value="email">✉️ بريد إلكتروني</option>
                                    <option value="other">🏛️ مراجعة ميدانية</option>
                                </select>
                            </div>
                            <div className="md:col-span-6">
                                <label className="block text-[10px] font-black text-slate-500 mb-1">موجز ما تم بالإجراء</label>
                                <input 
                                    type="text" 
                                    value={newInteractionNote} 
                                    onChange={(e) => setNewInteractionNote(e.target.value)}
                                    placeholder="اكتب خلاصة الاتصال أو ما تقرر بالاجتماع..." 
                                    className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-right focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                                />
                            </div>
                            <div className="md:col-span-3">
                                 <Button type="submit" variant="primary" className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-900 border-none rounded-xl font-black shrink-0">حفظ الإجراء</Button>
                            </div>
                       </form>
                  </div>

                  {/* chronological timeline list */}
                  <div className="space-y-4 pr-1 mt-4">
                      {localInteractions.length > 0 ? (
                          localInteractions.map((h, i) => (
                              <div key={h.id || i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                                  {i < localInteractions.length - 1 && <div className="absolute top-2 bottom-0 right-[15px] w-[2px] bg-slate-200"></div>}
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm z-10">
                                      {getInteractionIcon(h.type)}
                                  </div>
                                  <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm flex-grow">
                                      <div className="flex justify-between items-start">
                                          <p className="text-xs font-black text-slate-800">{getInteractionLabel(h.type)}</p>
                                          <p className="text-[10px] text-slate-400 font-bold font-mono">{formatDate(h.date)}</p>
                                      </div>
                                      <p className="text-xs text-slate-600 font-bold leading-relaxed mt-2 p-2.5 bg-slate-50 rounded-xl border-r-2 border-slate-300">
                                          {h.note}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-black mt-2 text-left">المسؤول: {h.user || 'المكتب الرئيسي'}</p>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-12 text-slate-400 italic text-xs">
                               لا توجد تواصلات سابقة مسجلة ومقيدة على هذا الملف. ابدأ بإضافة الإجراء في الحقل أعلاه!
                          </div>
                      )}
                  </div>
              </div>
          )}
      </div>

      <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-200">
          <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider font-sans">
              النظام الحوكمي لإدارة العلاقات • عدالة ٣٦٠
          </div>
          <div className="flex space-x-2 space-x-reverse font-sans">
            <Button variant="outline" onClick={() => onEdit(contact)} leftIcon={<PencilIcon className="w-4"/>} className="rounded-xl">تعديل البيانات</Button>
            <Button variant="primary" onClick={() => onSendNotification(contact)} leftIcon={<EnvelopeIcon className="w-4"/>} className="rounded-xl bg-[#00796B] text-white">مراسلة</Button>
            <Button variant="ghost" onClick={onClose} className="rounded-xl">إغلاق</Button>
          </div>
      </div>
    </Modal>
  );
};

// --- Notification Modal ---
interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactsToNotify: Contact[];
    onSend: (type: 'email' | 'sms' | 'whatsapp', subject: string | undefined, message: string, recipients: Contact[]) => void;
}
const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, contactsToNotify, onSend }) => {
    const { addToast } = useToast();
    const [type, setType] = useState<'email' | 'sms' | 'whatsapp'>('email');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
      if(isOpen) {
        setType('email');
        setSubject('');
        setMessage('');
      }
    }, [isOpen]);

    const handleSend = () => {
        if (!message.trim()) {
            addToast({
                type: 'warning',
                title: 'محتوى فارغ',
                message: "محتوى الرسالة لا يمكن أن يكون فارغًا."
            });
            return;
        }
        if (type === 'email' && !subject.trim()) {
            addToast({
                type: 'warning',
                title: 'بيانات ناقصة',
                message: "موضوع البريد الإلكتروني مطلوب."
            });
            return;
        }
        onSend(type, type === 'email' ? subject : undefined, message, contactsToNotify);
    };

    if (!isOpen || contactsToNotify.length === 0) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إرسال مراسلة لجهات الاتصال" size="md">
            <div className="space-y-4 font-sans">
                <div className="bg-[#00796B]/5 p-4 rounded-2xl text-xs border border-[#00796B]/10 font-bold">
                    جاري الإرسال إلى: <span className="font-black text-[#00796B]">{contactsToNotify.length > 1 ? `${contactsToNotify.length} جهات اتصال محددة` : contactsToNotify[0].fullName}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'email', label: 'بريد الكتروني', icon: <EnvelopeIcon className="w-4 h-4"/> },
                        { id: 'whatsapp', label: 'مواكبة واتساب', icon: <ChatBubbleLeftRightIcon className="w-4 h-4"/> },
                        { id: 'sms', label: 'رسالة نصية SMS', icon: <PhoneIcon className="w-4 h-4"/> }
                    ].map(t => (
                        <button 
                            key={t.id}
                            type="button"
                            onClick={() => setType(t.id as any)}
                            className={`flex flex-col items-center justify-center py-3.5 rounded-2xl border transition-all cursor-pointer ${type === t.id ? 'border-[#00796B] bg-[#00796B]/10 text-[#00796B] font-black' : 'border-slate-200 text-slate-500 hover:border-slate-300 font-bold'}`}
                        >
                            {t.icon}
                            <span className="text-[10px] mt-1.5 uppercase">{t.label}</span>
                        </button>
                    ))}
                </div>
                
                {type === 'email' && (
                    <Input label="موضوع البريد" value={subject} onChange={e => setSubject(e.target.value)} required />
                )}
                
                <TextArea label="محتوى الرسالة الموجهة" value={message} onChange={e => setMessage(e.target.value)} rows={5} required placeholder="اكتب نص الرسالة هنا..." />
                
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button variant="outline" onClick={onClose} className="rounded-xl">إلغاء</Button>
                    <Button variant="primary" onClick={handleSend} leftIcon={<EnvelopeIcon className="w-4"/>} className="rounded-xl bg-[#00796B] text-white">إرسال المراسلة</Button>
                </div>
            </div>
        </Modal>
    );
};

const ContactsPage: React.FC = () => {
  const { addToast } = useToast();
  const [contacts, setContacts] = React.useState<Contact[]>(() => {
      const stored = localStorage.getItem('adala_contacts_list_v3');
      if (stored) {
         try {
           return JSON.parse(stored);
         } catch(e) {
           return initialMockContacts;
         }
      }
      return initialMockContacts;
  });

  useEffect(() => {
     localStorage.setItem('adala_contacts_list_v3', JSON.stringify(contacts));
  }, [contacts]);

  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<ContactType | ''>('');
  const [poaFilter, setPoaFilter] = React.useState<'all' | 'valid' | 'expired'>('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'ai'>('current');

  // AI Section State
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
  const [viewingContactId, setViewingContactId] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [contactsForNotification, setContactsForNotification] = useState<Contact[]>([]);

  const viewingContact = useMemo(() => {
      return contacts.find(c => c.id === viewingContactId) || null;
  }, [contacts, viewingContactId]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = (
        contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.emailPrimary && contact.emailPrimary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phonePrimary && contact.phonePrimary.includes(searchTerm)) ||
        (contact.organization && contact.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.city && contact.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.poaNumber && contact.poaNumber.includes(searchTerm))
      );
      const matchesType = filterType === '' || contact.contactType.includes(filterType as ContactType);
      const matchesFavorite = !showFavoritesOnly || contact.isFavorite;
      const matchesPoa = poaFilter === 'all' || (poaFilter === 'valid' && contact.poaStatus === 'valid') || (poaFilter === 'expired' && contact.poaStatus === 'expired');
      
      return matchesSearch && matchesType && matchesFavorite && matchesPoa;
    }).sort((a,b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [contacts, searchTerm, filterType, showFavoritesOnly, poaFilter]);
  
  const stats = useMemo(() => ({
      total: contacts.length,
      clients: contacts.filter(c => c.contactType.includes(ContactType.CLIENT)).length,
      opponents: contacts.filter(c => c.contactType.includes(ContactType.OPPOSING_PARTY)).length,
      experts: contacts.filter(c => c.contactType.includes(ContactType.EXPERT_WITNESS)).length,
      judges: contacts.filter(c => c.contactType.includes(ContactType.JUDGE) || c.contactType.includes(ContactType.COURT_CLERK)).length,
  }), [contacts]);

  const handleAddContact = () => { setEditingContact(null); setIsFormModalOpen(true); };
  const handleEditContact = (contact: Contact) => { setEditingContact(contact); setIsFormModalOpen(true); };
  const handleViewContact = (contact: Contact) => { setViewingContactId(contact.id); };

  const handleDeleteContact = useCallback((contactId: string) => {
    if (window.confirm('هل أنت متأكد من حذف جهة الاتصال هذه من النظام؟')) {
      setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
      addToast({
          type: 'success',
          title: 'حذف السجل',
          message: 'تم شطب جهة الاتصال بنجاح.'
      });
    }
  }, [addToast]);

  const handleToggleFavorite = useCallback((contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const handleFormSubmit = (data: Contact) => {
    if (editingContact && editingContact.id) {
      setContacts(prev => prev.map(c => (c.id === editingContact.id ? data : c)));
      addToast({
          type: 'success',
          title: 'تعديل السجل',
          message: 'تم تحديث بيانات الاتصال بنجاح.'
      });
    } else {
      setContacts(prev => [data, ...prev]);
      addToast({
          type: 'success',
          title: 'تسجيل السجل',
          message: 'تم إدراج جهة الاتصال في الدليل بنجاح.'
      });
    }
    setIsFormModalOpen(false);
    setEditingContact(null);
  };
  
  const toggleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
        prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };

  const handleUpdateInteractions = (contactId: string, updatedInteracts: any[]) => {
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, interactions: updatedInteracts } : c));
  };
  
  const handleSendNotificationFlow = (contact?: Contact) => {
      let targets: Contact[] = [];
      if (contact) {
          targets = [contact];
      } else if (selectedContacts.length > 0) {
          targets = contacts.filter(c => selectedContacts.includes(c.id));
      }
      
      if (targets.length === 0) {
          addToast({
              type: 'info',
              title: 'تحديد جهة اتصال',
              message: "يرجى تحديد جهة اتصال واحدة على الأقل لإرسال إشعار."
          });
          return;
      }
      setContactsForNotification(targets);
      setIsNotificationModalOpen(true);
  };

  const handleNotificationSubmit = (type: string, subject: string | undefined, message: string, recipients: Contact[]) => {
    addToast({
        type: 'success',
        title: 'تم الإرسال',
        message: `تم إرسال المراسلة بنجاح إلى ${recipients.length} من المحددين!`
    });
    setSelectedContacts([]); 
    setIsNotificationModalOpen(false);
  };

  const handleAIInsight = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
        const contactContext = contacts.map(c => `- ${c.fullName} (${c.contactType.join(', ')})${c.notes ? ` [ملاحظة: ${c.notes}]` : ''}`).join('\n');
        const prompt = `أنت مستشار علاقات قانونية ومساعد إستراتيجي في منظومة "عدالة" للمحاماة.
قائمة جهات الاتصال المسجلة بالدليل:
${contactContext}

الطلب الإداري أو الاستشارة المطلوبة: "${aiQuery}".

توجيهات الإجابة:
1. قدم تحليلاً مهنياً قانونياً متزناً، خطة عمل أو نصائح للتواصل والتحاور بفعالية.
2. استخدم مصطلحات قانونية كويتية وخليجية موثوقة عند اللزوم.
3. لخص الإجابة بنقاط واضحة ومباشرة.`;
        const response = await geminiService.getChatbotResponse(prompt);
        setAiResponse(response);
    } catch (e) {
        setAiResponse("عذراً، تعذر الاتصال بمركز الذكاء الاصطناعي حالياً.");
    } finally {
        setAiLoading(false);
    }
  };

  const handleExport = () => {
      const exportList = selectedContacts.length > 0 
          ? filteredContacts.filter(c => selectedContacts.includes(c.id))
          : filteredContacts;

      const csvContent = "\uFEFF"
          + "الاسم,الهاتف,البريد الإلكتروني,النوع,الشركة,المدينة,رقم الوكالة بالعدل,حالة الوكالة\n"
          + exportList.map(e => `"${e.fullName}","${e.phonePrimary || ''}","${e.emailPrimary || ''}","${e.contactType.join('-')}","${e.organization || ''}","${e.city || ''}","${e.poaNumber || ''}","${e.poaStatus === 'valid' ? 'سارية': e.poaStatus || ''}"`).join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `adala_contacts_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast({
          type: 'success',
          title: 'تصدير البيانات',
          message: `تم تصدير ${exportList.length} جهة اتصال كملف CSV.`
      });
  };

  // Bento category filter selections
  const quickCategoryOptions = [
      { type: '' as const, label: 'الكل', count: stats.total, icon: UserGroupIcon, color: 'hover:bg-slate-100 text-slate-700' },
      { type: ContactType.CLIENT, label: 'الموكلين', count: stats.clients, icon: UserCircleIcon, color: 'hover:bg-emerald-50 text-emerald-700' },
      { type: ContactType.OPPOSING_PARTY, label: 'الخصوم', count: stats.opponents, icon: UserGroupIcon, color: 'hover:bg-rose-50 text-rose-700' },
      { type: ContactType.OPPOSING_COUNSEL, label: 'محامو الخصم', count: contacts.filter(c => c.contactType.includes(ContactType.OPPOSING_COUNSEL)).length, icon: BriefcaseIcon, color: 'hover:bg-[#A3845B]/10 text-[#A3845B]' },
      { type: ContactType.EXPERT_WITNESS, label: 'الخبراء', count: stats.experts, icon: LightBulbIcon, color: 'hover:bg-cyan-50 text-cyan-700' },
      { type: ContactType.JUDGE, label: 'السلك القضائي', count: stats.judges, icon: ScaleIcon, color: 'hover:bg-indigo-50 text-indigo-700' },
  ];
  
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        <AnimatePresence mode="popLayout">
            {filteredContacts.map(contact => {
                const isContactClient = contact.contactType.includes(ContactType.CLIENT);
                const isSelected = selectedContacts.includes(contact.id);
                return (
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        key={contact.id}
                    >
                        <div className={`group relative bg-white dark:bg-dm-card rounded-2xl border transition-all duration-300 flex flex-col p-6 shadow-sm hover:shadow-lg ${isSelected ? 'border-[#00796B] ring-2 ring-[#00796B]/20 bg-emerald-50/10' : 'border-slate-100 dark:border-slate-800'}`}>
                            
                            {/* Checkbox Toggle */}
                            <div className="absolute top-4 left-4 z-10">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-slate-300 text-[#00796B] focus:ring-[#00796B] cursor-pointer"
                                    checked={isSelected}
                                    onChange={() => toggleSelectContact(contact.id)}
                                />
                            </div>

                            {/* Favorite Button */}
                            <button 
                                onClick={() => handleToggleFavorite(contact.id)}
                                className={`absolute top-4 right-4 p-1.5 rounded-xl transition-all cursor-pointer ${contact.isFavorite ? 'bg-amber-100 text-amber-500' : 'bg-slate-50 text-slate-300 hover:text-amber-500'}`}
                            >
                                <StarIcon className={`w-4 h-4 ${contact.isFavorite ? 'fill-current' : ''}`} />
                            </button>

                            <div className="flex items-center gap-4 mb-5 pt-2">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-sm ${getAvatarColor(contact.fullName)} shrink-0`}>
                                    {contact.fullName.charAt(0)}
                                </div>
                                <div className="min-w-0 pr-1">
                                    <h3 className="text-base font-black text-slate-900 dark:text-dm-text leading-tight hover:text-[#00796B] transition-colors line-clamp-1 cursor-pointer" onClick={() => handleViewContact(contact)}>
                                        {contact.fullName}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1 truncate">{contact.organization || 'فرد مستقل'}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4 flex-grow text-right">
                                {contact.phonePrimary && (
                                    <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-gray-400">
                                        <div className="p-1.5 bg-slate-50 dark:bg-dm-background rounded-lg text-[#00796B]"><PhoneIcon className="w-3.5 h-3.5"/></div>
                                        <span className="font-bold font-mono">{contact.phonePrimary}</span>
                                    </div>
                                )}
                                {contact.emailPrimary && (
                                    <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-gray-400">
                                        <div className="p-1.5 bg-slate-50 dark:bg-dm-background rounded-lg text-[#00796B]"><EnvelopeIcon className="w-3.5 h-3.5"/></div>
                                        <span className="truncate font-medium">{contact.emailPrimary}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-gray-400">
                                    <div className="p-1.5 bg-slate-50 dark:bg-dm-background rounded-lg text-[#00796B]"><MapPinIcon className="w-3.5 h-3.5"/></div>
                                    <span className="font-bold">{contact.city || 'دولة الكويت'}</span>
                                </div>
                            </div>

                            {/* Client specialized PoA status layout on card */}
                            {isContactClient && (
                                <div className="mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-500">التوكيل بالعدل:</span>
                                    <span className={contact.poaStatus === 'valid' ? 'text-emerald-600 font-extrabold' : 'text-rose-600 font-extrabold'}>
                                        {contact.poaStatus === 'valid' ? 'ساري (نشط) ✅' : contact.poaStatus === 'expired' ? 'منتهي ⚠️' : 'ملغى ❌'}
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1 mb-5">
                                {contact.contactType.map(t => (
                                    <Badge key={t} text={t} variant={t === ContactType.CLIENT ? 'success' : t === ContactType.OPPOSING_PARTY ? 'danger' : 'secondary'} size="xs"/>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex gap-1.5">
                                    <button 
                                        onClick={() => handleViewContact(contact)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-[#00796B] hover:text-white transition-all cursor-pointer"
                                        title="معاينة الملف 360°"
                                    >
                                        <EyeIcon className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        onClick={() => handleEditContact(contact)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
                                        title="تعديل السجل"
                                    >
                                        <PencilIcon className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteContact(contact.id)}
                                        className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                                        title="شطب جهة الاتصال"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                                <div className="flex gap-1.5">
                                    {contact.phonePrimary && (
                                        <a href={`tel:${contact.phonePrimary}`} className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all" title="اتصال مباشر">
                                            <PhoneIcon className="w-4 h-4"/>
                                        </a>
                                    )}
                                    {contact.whatsapp && (
                                        <a href={`https://wa.me/${contact.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all" title="مراسلة واتساب">
                                            <ChatBubbleLeftRightIcon className="w-4 h-4"/>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </AnimatePresence>
    </div>
  );

  const renderListView = () => (
      <Card className="p-0 overflow-hidden rounded-2xl border border-slate-100 shadow-sm font-sans">
          <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                  <thead>
                      <tr className="bg-slate-50 dark:bg-dm-card border-b border-slate-100 dark:border-gray-800 text-slate-500 font-black">
                          <th className="p-4 w-12 text-center">
                              <input 
                                  type="checkbox" 
                                  className="rounded border-slate-300 text-[#00796B] focus:ring-[#00796B]" 
                                  checked={filteredContacts.length > 0 && selectedContacts.length === filteredContacts.length}
                                  onChange={(e) => setSelectedContacts(e.target.checked ? filteredContacts.map(c=>c.id) : [])}
                              />
                          </th>
                          <th className="p-4 uppercase tracking-wider">الاسم والتصنيف</th>
                          <th className="p-4 uppercase tracking-wider">الجهة / المؤسسة</th>
                          <th className="p-4 uppercase tracking-wider">بيانات التوكيل</th>
                          <th className="p-4 uppercase tracking-wider text-center">الهاتف والواتساب</th>
                          <th className="p-4 uppercase tracking-wider">البريد الإلكتروني</th>
                          <th className="p-4 uppercase tracking-wider text-center">الإجراءات</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800 font-bold text-slate-700">
                      {filteredContacts.map(contact => (
                          <tr key={contact.id} className="hover:bg-slate-50/80 dark:hover:bg-dm-card/50 transition-colors group">
                              <td className="p-4 text-center">
                                  <input 
                                      type="checkbox" 
                                      className="rounded border-slate-300 text-[#00796B] focus:ring-[#00796B]" 
                                      checked={selectedContacts.includes(contact.id)} 
                                      onChange={() => toggleSelectContact(contact.id)}
                                  />
                              </td>
                              <td className="p-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black shrink-0 ${getAvatarColor(contact.fullName)}`}>
                                          {contact.fullName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-extrabold text-slate-900 dark:text-dm-text hover:text-[#00796B] cursor-pointer text-sm" onClick={() => handleViewContact(contact)}>{contact.fullName}</p>
                                          <div className="flex gap-1 mt-1">
                                              {contact.contactType.map(t=><Badge key={t} text={t} size="xs" variant={t === ContactType.CLIENT ? 'success' : 'secondary'}/>)}
                                          </div>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4 text-slate-500 font-extrabold">{contact.organization || 'سجل فردي'}</td>
                              <td className="p-4">
                                  {contact.contactType.includes(ContactType.CLIENT) ? (
                                      <div className="flex flex-col gap-0.5">
                                          <span className="font-mono text-[10px] text-slate-800">رقم: {contact.poaNumber || 'غير مسجل'}</span>
                                          <span className={contact.poaStatus === 'valid' ? 'text-emerald-600 text-[10px]' : 'text-rose-600 text-[10px]'}>
                                              {contact.poaStatus === 'valid' ? '● ساري' : '● غير سار'}
                                          </span>
                                      </div>
                                  ) : (
                                      <span className="text-slate-300">-</span>
                                  )}
                              </td>
                              <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                      <span className="font-mono font-bold text-slate-600">{contact.phonePrimary || '-'}</span>
                                      {contact.whatsapp && <span title="يملك حساب واتساب"><ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-500 inline"/></span>}
                                  </div>
                              </td>
                              <td className="p-4 text-slate-500 font-medium font-mono">{contact.emailPrimary || '-'}</td>
                              <td className="p-4">
                                  <div className="flex justify-center gap-1">
                                      <button onClick={() => handleViewContact(contact)} className="p-2 text-slate-400 hover:text-[#00796B] hover:bg-slate-100 rounded-lg cursor-pointer" title="معاينة 360°"><EyeIcon className="w-4 h-4"/></button>
                                      <button onClick={() => handleEditContact(contact)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="تعديل"><PencilIcon className="w-4 h-4"/></button>
                                      <button onClick={() => handleDeleteContact(contact.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="شطب نهائي"><TrashIcon className="w-4 h-4"/></button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      <PrintHeader title="دليل جهات الاتصال والشركاء" subtitle="قاعدة بيانات الموكلين والخبراء والخصوم المعتمدة" />

      {/* --- Premium Slate System Header --- */}
      <div className="relative overflow-hidden bg-[#0F172A] rounded-3xl p-8 md:p-10 text-white shadow-xl dark:bg-dm-card border border-slate-800 font-sans">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00796B]/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C5A880]/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6 text-center md:text-right">
                <div className="p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
                    <UserGroupIcon className="w-10 h-10 text-[#C5A880]" />
                </div>
                <div>
                    <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight">إدارة العلاقات وجهات الاتصال</h1>
                        <span className="px-3 py-1 rounded-full bg-[#00796B]/40 text-emerald-300 border border-[#00796B]/50 text-xs font-bold">
                            {contacts.length} جهة مقيدة
                        </span>
                    </div>
                    <p className="text-slate-300 text-xs font-semibold leading-relaxed max-w-xl">
                        الدليل المركزي لتصنيف الموكلين، الخبراء المنتدبين، الخصوم، ومراجعي وزارة العدل مع الرصد المباشر للتوكيلات الرسمية وسجل المراسلات.
                    </p>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap justify-center shrink-0">
                <Button 
                    variant="primary" 
                    size="md" 
                    className="rounded-xl px-6 bg-[#00796B] hover:bg-[#004D40] text-white font-black border-none transition-all shadow-md cursor-pointer"
                    onClick={handleAddContact}
                >
                    <PlusCircleIcon className="w-5 h-5 me-2 text-white" />
                    إضافة جهة اتصال
                </Button>
                <Button 
                    variant="outline" 
                    size="md" 
                    className="rounded-xl px-5 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer"
                    onClick={handleExport}
                >
                    <ShareIcon className="w-4 h-4 me-2" />
                    تصدير البيانات
                </Button>
            </div>
        </div>
      </div>
      
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ContactStatCard 
              title="إجمالي الدليل" 
              count={stats.total} 
              colorClass="bg-slate-100 text-slate-700" 
              icon={<UserGroupIcon className="w-6 h-6 text-slate-600"/>} 
              isSelected={filterType === '' && !showFavoritesOnly}
              onClick={() => { setFilterType(''); setShowFavoritesOnly(false); setPoaFilter('all'); }}
          />
          <ContactStatCard 
              title="الموكلين والعملاء" 
              count={stats.clients} 
              colorClass="bg-emerald-50 text-emerald-700" 
              icon={<UserTieIcon className="w-6 h-6 text-emerald-600"/>} 
              isSelected={filterType === ContactType.CLIENT}
              onClick={() => { setFilterType(ContactType.CLIENT); setShowFavoritesOnly(false); setPoaFilter('all'); }}
          />
          <ContactStatCard 
              title="الخصوم والأضداد" 
              count={stats.opponents} 
              colorClass="bg-rose-50 text-rose-700" 
              icon={<UserGroupIcon className="w-6 h-6 text-rose-600"/>} 
              isSelected={filterType === ContactType.OPPOSING_PARTY}
              onClick={() => { setFilterType(ContactType.OPPOSING_PARTY); setShowFavoritesOnly(false); setPoaFilter('all'); }}
          />
          <ContactStatCard 
              title="الخبراء والاستشاريين" 
              count={stats.experts} 
              colorClass="bg-cyan-50 text-cyan-700" 
              icon={<LightBulbIcon className="w-6 h-6 text-cyan-600"/>} 
              isSelected={filterType === ContactType.EXPERT_WITNESS}
              onClick={() => { setFilterType(ContactType.EXPERT_WITNESS); setShowFavoritesOnly(false); setPoaFilter('all'); }}
          />
          <ContactStatCard 
              title="السلك القضائي" 
              count={stats.judges} 
              colorClass="bg-indigo-50 text-indigo-700" 
              icon={<ScaleIcon className="w-6 h-6 text-indigo-600"/>} 
              isSelected={filterType === ContactType.JUDGE}
              onClick={() => { setFilterType(ContactType.JUDGE); setShowFavoritesOnly(false); setPoaFilter('all'); }}
          />
      </div>

      {/* Navigation Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 print:hidden font-sans">
          <div className="flex items-center gap-1 bg-white dark:bg-dm-card p-1 rounded-2xl shadow-sm border border-slate-200 w-fit">
              {[
                  { id: 'current', label: 'دليل الاتصالات والتوكيلات', icon: ListBulletIcon },
                  { id: 'ai', label: 'المستشار الذكي لإدارة العلاقات (AI)', icon: SparklesIcon },
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${activeTab === tab.id ? 'bg-[#00796B] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'current' ? (
          <motion.div key="current" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            
            {/* Search, Filter Toolbar and Category Scroller */}
            <div className="space-y-4 font-sans">
                <Card className="border border-slate-100 shadow-sm p-5 rounded-2xl">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                      <div className="relative flex-grow w-full">
                          <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                          <input 
                              placeholder="ابحث بالاسم، رقم الهوية، الهاتف، الوكالة، أو المنطقة..." 
                              value={searchTerm} 
                              onChange={e => setSearchTerm(e.target.value)}
                              className="w-full pr-11 pl-4 py-3 bg-slate-50 dark:bg-dm-card/50 rounded-xl border border-slate-200 focus:border-[#00796B] focus:bg-white transition-all outline-none text-xs font-bold"
                          />
                          {searchTerm && (
                              <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                  <XMarkIcon className="w-4 h-4" />
                              </button>
                          )}
                      </div>
                      <div className="flex gap-2 w-full md:w-auto flex-wrap md:flex-nowrap">
                          <select 
                              value={filterType} 
                              onChange={e => setFilterType(e.target.value as ContactType | '')}
                              className="h-[44px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-right outline-none focus:border-[#00796B] w-full md:w-48"
                          >
                              <option value="">جميع التصنيفات</option>
                              {contactTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>

                          <select 
                              value={poaFilter} 
                              onChange={e => setPoaFilter(e.target.value as any)}
                              className="h-[44px] px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-right outline-none focus:border-[#00796B] w-full md:w-44"
                          >
                              <option value="all">حالة الوكالة (الكل)</option>
                              <option value="valid">وكالة سارية ✅</option>
                              <option value="expired">وكالة منتهية ⚠️</option>
                          </select>

                          <button 
                              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                              className={`px-4 py-2.5 rounded-xl border transition-all flex items-center gap-2 whitespace-nowrap text-xs font-bold cursor-pointer ${showFavoritesOnly ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                          >
                              <StarIcon className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current text-amber-500' : ''}`}/>
                              <span>المفضلة</span>
                          </button>
                      </div>
                      <div className="flex p-1 bg-slate-100 dark:bg-dm-card rounded-xl shrink-0 gap-1 border border-slate-200">
                          <button onClick={() => setViewMode('card')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'card' ? 'bg-white shadow-sm text-[#00796B]' : 'text-slate-400 hover:text-slate-600'}`} title="عرض البطاقات"><UserGroupIcon className="w-4 h-4"/></button>
                          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white shadow-sm text-[#00796B]' : 'text-slate-400 hover:text-slate-600'}`} title="عرض الجدول"><ListBulletIcon className="w-4 h-4"/></button>
                      </div>
                  </div>
                </Card>

                {/* Horizontal Category Pill Bar */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {quickCategoryOptions.map(option => {
                        const Icon = option.icon;
                        const isSelected = filterType === option.type && !showFavoritesOnly;
                        return (
                            <button
                                key={option.type || 'all'}
                                onClick={() => { setFilterType(option.type); setShowFavoritesOnly(false); }}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isSelected ? 'bg-[#00796B] border-[#00796B] text-white shadow-sm' : `bg-white border-slate-200 ${option.color}`}`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{option.label}</span>
                                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    {option.count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Bulk Actions Floating Bar */}
            {selectedContacts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#00796B] text-white p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 px-6 shadow-lg font-sans">
                    <div className="flex items-center gap-4">
                        <span className="font-extrabold text-xs">تم تحديد {selectedContacts.length} من جهات الاتصال</span>
                        <div className="w-px h-5 bg-white/20"/>
                        <button onClick={() => setSelectedContacts([])} className="text-xs font-bold text-emerald-200 hover:text-white transition-colors cursor-pointer">إلغاء التحديد</button>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="primary" className="rounded-xl px-4 py-2 bg-white text-[#00796B] hover:bg-emerald-50 border-none text-xs font-black" onClick={() => handleSendNotificationFlow()} leftIcon={<EnvelopeIcon className="w-4"/>}>مراسلة المحدد</Button>
                        <Button size="sm" variant="outline" className="rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs font-bold" onClick={handleExport}>تصدير CSV</Button>
                        <Button size="sm" variant="outline" className="rounded-xl bg-rose-500/20 text-rose-100 border-rose-300/30 hover:bg-rose-500/40 text-xs font-bold" onClick={() => { if(confirm(`هل أنت متأكد من حذف ${selectedContacts.length} جهة اتصال؟`)) { setContacts(prev => prev.filter(c => !selectedContacts.includes(c.id))); setSelectedContacts([]); } }}>حذف المحدد</Button>
                    </div>
                </motion.div>
            )}

            {/* Content Display */}
            {filteredContacts.length > 0 ? (
                viewMode === 'card' ? renderCardView() : renderListView()
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 font-sans">
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200">
                         <FunnelIcon className="w-8 h-8 text-slate-400"/>
                    </div>
                    <p className="text-sm font-black text-slate-700">لا توجد نتائج مطابقة لبحثك</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">جرب تغيير كلمة البحث أو إعادة ضبط الفلاتر</p>
                    <Button variant="ghost" className="mt-4 text-[#00796B] font-bold text-xs" onClick={() => {setSearchTerm(''); setFilterType(''); setShowFavoritesOnly(false); setPoaFilter('all');}}>إعادة ضبط البحث</Button>
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <Card className="p-8 md:p-10 rounded-3xl border border-slate-100 shadow-lg bg-gradient-to-br from-slate-50 via-white to-white dark:from-dm-card dark:to-dm-card font-sans">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-[#00796B] rounded-2xl shadow-md text-white">
                          <SparklesIcon className="w-7 h-7" />
                      </div>
                      <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">مساعد عدالة الإستراتيجي للعلاقات والتواصل</h3>
                          <p className="text-xs text-slate-500 font-semibold mt-1">احصل على استشارات، خطط تفاوض، أو صياغات قانونية للتواصل مع الموكلين والخصوم والخبراء</p>
                      </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <TextArea 
                          placeholder="مثال: كيف يمكنني صياغة برقية لشركة الأمل حول تأخر استلام التقارير الإنشائية؟ أو اقترح خطة للتحاور مع الخبير م. فهد الساير..."
                          value={aiQuery}
                          onChange={(e) => setAiQuery(e.target.value)}
                          containerClassName="flex-grow"
                          rows={3}
                          className="p-4 text-xs font-bold border border-slate-200 focus:border-[#00796B] rounded-2xl bg-white"
                      />
                      <Button 
                          className="h-auto px-8 rounded-2xl text-xs font-black bg-[#00796B] text-white hover:bg-[#004D40] shadow-md w-full md:w-auto shrink-0 cursor-pointer"
                          onClick={handleAIInsight}
                          isLoading={aiLoading}
                      >
                          تحليل واقتراح الخطة
                      </Button>
                  </div>

                  {aiResponse && (
                      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-[#00796B]/5 rounded-2xl border border-[#00796B]/15">
                          <div className="flex justify-between items-center mb-4 border-b pb-3 border-slate-200">
                              <span className="flex items-center gap-2 text-[#00796B] font-black text-xs">
                                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                                  الرؤية والخطط التوجيهية من عدالة AI
                              </span>
                              <Button variant="ghost" size="sm" onClick={() => setAiResponse(null)} className="text-slate-400 hover:text-rose-600 font-bold text-xs">مسح الرؤية</Button>
                          </div>
                          <div className="markdown-body text-slate-800 text-xs font-bold leading-relaxed max-w-none pr-1">
                              <ReactMarkdown>{aiResponse}</ReactMarkdown>
                          </div>
                      </motion.div>
                  )}
              </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info Legend */}
      <div className="flex justify-center flex-wrap gap-x-8 gap-y-2 opacity-60 text-[10px] font-black uppercase tracking-wider pt-6 font-sans">
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div> الموكلون</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div> الخصوم</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-cyan-500 rounded-full"></div> الخبراء</span>
          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div> الهيئات القضائية</span>
          <span className="flex items-center gap-1.5"><StarIcon className="w-3 h-3 fill-amber-500 text-amber-500"/> المفضلة</span>
      </div>

      {/* Modals */}
      <ContactFormModal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingContact(null); }} onSubmit={handleFormSubmit} initialData={editingContact} />
      <ViewContactModal contact={viewingContact} onClose={() => setViewingContactId(null)} onEdit={(c) => { setViewingContactId(null); handleEditContact(c);}} onSendNotification={(c) => handleSendNotificationFlow(c)} onUpdateInteractions={handleUpdateInteractions} />
      <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} contactsToNotify={contactsForNotification} onSend={handleNotificationSubmit}/>
    </div>
  );
};

export default ContactsPage;
