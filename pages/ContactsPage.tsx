
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import { 
    UserGroupIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    EnvelopeIcon, PhoneIcon, BuildingStorefrontIcon, UserTieIcon, BriefcaseIcon,
    UserCircleIcon, ScaleIcon, LightBulbIcon, BuildingLibraryIcon, BanknotesIcon, ListBulletIcon,
    DocumentDuplicateIcon, DocumentTextIcon, MapPinIcon, MagnifyingGlassIcon,
    FunnelIcon, StarIcon, ShareIcon, SparklesIcon, ChatBubbleLeftRightIcon, ClockIcon
} from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { Contact, ContactType, Case, AdminTask } from '../types';
import { contactTypeOptions } from '../constants';
import { Badge } from '../components/ui/Badge';
import { initialCases } from '../data/caseData';
import { mockFinancialTransactions } from './FinancialManagementPage';

// Helper to get profile color based on name
const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const initialMockContacts: Contact[] = [
  { id: 'contact1', fullName: 'شركة الأمل للتجارة العامة', contactType: [ContactType.CLIENT], organization: 'شركة الأمل للتجارة العامة', emailPrimary: 'amal@example.com', phonePrimary: '22221111', whatsapp: '22221111', relatedCaseIds: ['1'], createdAt: '2023-01-10T10:00:00Z', city: 'مدينة الكويت', country: 'الكويت', notes: 'موكل رئيسي في قضايا تجارية متعددة.', jobTitle:'مدير عام', address: 'شرق، قطعة 1، شارع 2، مبنى 3', isFavorite: true, tags: ['كبار العملاء', 'عقد سنوي'] },
  { id: 'contact2', fullName: 'سارة عبدالله أحمد', contactType: [ContactType.CLIENT, ContactType.FACT_WITNESS], emailPrimary: 'sara.a@example.com', phonePrimary: '55554444', relatedCaseIds: ['2'], createdAt: '2023-03-15T11:00:00Z', jobTitle: 'مديرة تسويق', organization: 'مؤسسة النور', phoneSecondary: '50505050', city: 'حولي', country: 'الكويت' },
  { id: 'contact3', fullName: 'مؤسسة النور للمقاولات', contactType: [ContactType.OPPOSING_PARTY], organization: 'مؤسسة النور للمقاولات', emailPrimary: 'noor.corp@example.com', phonePrimary: '33336666', relatedCaseIds: ['5'], createdAt: '2023-05-01T12:00:00Z', address: 'الشويخ الصناعية، قطعة 3، قسيمة 100', city:'الشويخ', country:'الكويت' },
  { id: 'contact4', fullName: 'د. علي حسين الخبير', contactType: [ContactType.EXPERT_WITNESS], emailPrimary: 'dr.ali.h@example.com', phonePrimary: '66667777', whatsapp: '66667777', jobTitle: 'خبير هندسي معتمد', organization: 'مكتب الخبرة الهندسية', createdAt: '2023-06-20T14:30:00Z', notes: 'خبير متخصص في تقييم الأضرار الإنشائية.', city: 'الفروانية' },
  { id: 'contact5', fullName: 'محمد جاسم الفضلي', contactType: [ContactType.FACT_WITNESS], phonePrimary: '99998888', relatedCaseIds: ['4'], createdAt: '2023-07-01T09:00:00Z', city: 'الجهراء' },
  { id: 'contact6', fullName: 'المحامي/ خالد ناصر السالم', contactType: [ContactType.OPPOSING_COUNSEL], organization: 'مكتب السالم للمحاماة', emailPrimary: 'khaled.salem@lawfirm.com', phonePrimary: '22445566', whatsapp: '22445566', createdAt: '2023-08-10T16:00:00Z', tags: ['قضايا تجارية'] },
  { id: 'contact7', fullName: 'محكمة الاستئناف - قلم الكتاب', contactType: [ContactType.COURT_CLERK], organization: 'محكمة الاستئناف', phonePrimary: '22550011', createdAt: '2023-09-05T10:30:00Z', notes: 'للاستفسار عن مواعيد الجلسات في دائرة الاستئناف.', city: 'مجمع محاكم العاصمة' },
];

const getContactTypeIcon = (type: ContactType): React.ReactNode => {
    switch(type) {
        case ContactType.CLIENT: return <UserCircleIcon className="w-4 h-4" />;
        case ContactType.OPPOSING_PARTY: return <UserGroupIcon className="w-4 h-4" />;
        case ContactType.OPPOSING_COUNSEL: return <UserTieIcon className="w-4 h-4" />;
        case ContactType.JUDGE: case ContactType.COURT_CLERK: return <ScaleIcon className="w-4 h-4" />; 
        case ContactType.EXPERT_WITNESS: return <LightBulbIcon className="w-4 h-4" />;
        case ContactType.GOVERNMENT_ENTITY: return <BuildingLibraryIcon className="w-4 h-4" />;
        case ContactType.SERVICE_PROVIDER: return <BuildingStorefrontIcon className="w-4 h-4" />;
        case ContactType.COLLEAGUE: return <BriefcaseIcon className="w-4 h-4"/>;
        default: return <UserCircleIcon className="w-4 h-4" />;
    }
};

// --- Contact Form Modal ---
interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Contact) => void;
  initialData?: Partial<Contact> | null;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Contact>>(
    initialData || { contactType: [ContactType.CLIENT], createdAt: new Date().toISOString(), tags: [], isFavorite: false }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { contactType: [ContactType.CLIENT], createdAt: new Date().toISOString(), relatedCaseIds: [], tags: [], isFavorite: false });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value as ContactType);
    setFormData(prev => ({ ...prev, contactType: selectedOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.contactType || formData.contactType.length === 0) {
        alert("يرجى إدخال الاسم الكامل واختيار نوع جهة الاتصال على الأقل.");
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل بيانات جهة الاتصال" : "إضافة جهة اتصال جديدة"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1 no-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="fullName" label="الاسم الكامل/اسم المؤسسة (*)" value={formData.fullName || ''} onChange={handleChange} required />
            <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع جهة الاتصال (*) (متعدد)</label>
                <select 
                    multiple 
                    value={formData.contactType} 
                    onChange={handleMultiSelectChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary h-24 text-sm"
                    required
                >
                    {contactTypeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="organization" label="المؤسسة/الشركة" value={formData.organization || ''} onChange={handleChange} />
            <Input name="jobTitle" label="المسمى الوظيفي" value={formData.jobTitle || ''} onChange={handleChange} />
        </div>

        <div className="bg-gray-50 dark:bg-dm-card/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-dm-text">معلومات الاتصال</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <Input name="phonePrimary" label="الهاتف الأساسي" value={formData.phonePrimary || ''} onChange={handleChange} type="tel" placeholder="965+"/>
                 <Input name="phoneSecondary" label="هاتف ثانوي" value={formData.phoneSecondary || ''} onChange={handleChange} type="tel"/>
                 <Input name="whatsapp" label="رقم الواتساب" value={formData.whatsapp || ''} onChange={handleChange} type="tel"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Input name="emailPrimary" label="البريد الإلكتروني الأساسي" value={formData.emailPrimary || ''} onChange={handleChange} type="email" placeholder="example@law.com"/>
                 <Input name="emailSecondary" label="بريد إلكتروني ثانوي" value={formData.emailSecondary || ''} onChange={handleChange} type="email"/>
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-dm-card/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-dm-text">العنوان والمكان</h4>
            <TextArea name="address" label="تفاصيل العنوان" value={formData.address || ''} onChange={handleChange} rows={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="city" label="المدينة/المنطقة" value={formData.city || ''} onChange={handleChange} />
                <Input name="country" label="الدولة" value={formData.country || 'الكويت'} onChange={handleChange} />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
                name="tags" 
                label="الوسوم (يفصل بينها بفاصلة)" 
                value={formData.tags?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({...prev, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s)}))} 
                placeholder="مثال: عقارات، كبار العملاء"
            />
            <Input 
                name="relatedCaseIds" 
                label="أرقام القضايا المرتبطة" 
                value={formData.relatedCaseIds?.join(', ') || ''} 
                onChange={(e) => setFormData(prev => ({...prev, relatedCaseIds: e.target.value.split(',').map(s => s.trim()).filter(s => s)}))} 
                placeholder="مثال: C-101, LAW-2024-001"
            />
        </div>

        <TextArea name="notes" label="ملاحظات إضافية" value={formData.notes || ''} onChange={handleChange} rows={3} />
        
        <div className="flex justify-end space-x-3 space-x-reverse pt-4 sticky bottom-0 bg-white dark:bg-dm-card p-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة جهة الاتصال"}</Button>
        </div>
      </form>
    </Modal>
  );
};

// --- 360 View Modal (Advanced) ---
interface ViewContactModalProps {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onSendNotification: (contact: Contact) => void;
}

const ViewContactModal: React.FC<ViewContactModalProps> = ({ contact, onClose, onEdit, onSendNotification }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cases' | 'financial' | 'history'>('overview');

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

  const renderOverview = () => (
      <div className="space-y-6 pt-2">
        <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 dark:bg-dm-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className={`h-24 w-24 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-lg ${getAvatarColor(contact.fullName)}`}>
                {contact.fullName.charAt(0)}
            </div>
            <div className="text-center md:text-right">
                <h3 className="text-2xl font-black text-gray-900 dark:text-dm-text mb-1">{contact.fullName}</h3>
                <p className="text-primary font-bold">{contact.jobTitle} {contact.organization ? `في ${contact.organization}` : ''}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-1 mt-3">
                    {contact.contactType.map(type => <Badge key={type} text={type} variant="secondary" size="xs"/>)}
                </div>
            </div>
            <div className="md:ms-auto flex flex-col items-center">
                <span className="text-[10px] text-gray-400 uppercase font-black mb-1">الرسمي</span>
                <div className="bg-white dark:bg-dm-background p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
                    <ScaleIcon className="w-5 h-5 text-primary"/>
                    <span className="text-lg font-black">{relatedCases.length}</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-primary"/> قنوات الاتصال
                </h4>
                <div className="grid grid-cols-1 gap-2">
                    {contact.phonePrimary && (
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-dm-card rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-sm text-gray-500">الهاتف الأساسي</span>
                            <a href={`tel:${contact.phonePrimary}`} className="font-bold text-gray-800 hover:text-primary transition-colors">{contact.phonePrimary}</a>
                        </div>
                    )}
                    {contact.whatsapp && (
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 shadow-sm">
                            <span className="text-sm text-green-700">واتساب</span>
                            <a href={`https://wa.me/${contact.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 flex items-center gap-1">
                                {contact.whatsapp} <ChatBubbleLeftRightIcon className="w-4 h-4"/>
                            </a>
                        </div>
                    )}
                    {contact.emailPrimary && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 shadow-sm">
                            <span className="text-sm text-blue-700">البريد الإلكتروني</span>
                            <a href={`mailto:${contact.emailPrimary}`} className="font-bold text-blue-600 hover:underline">{contact.emailPrimary}</a>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4 text-primary"/> العنوان والموقع
                </h4>
                <div className="p-4 bg-white dark:bg-dm-card rounded-xl border border-gray-100 shadow-sm text-sm space-y-2">
                    <p className="font-medium text-gray-800">{contact.address || 'لا يوجد عنوان مسجل'}</p>
                    <p className="text-gray-500">{contact.city} {contact.country ? `، ${contact.country}` : ''}</p>
                    <Button variant="ghost" size="sm" className="w-full mt-2 border border-gray-100" leftIcon={<MapPinIcon className="w-4"/>}>خرائط جوجل</Button>
                </div>
                {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {contact.tags.map(tag => <span key={tag} className="px-2 py-1 bg-primary/10 text-primary-dark text-[10px] font-bold rounded-lg border border-primary/20">{tag}</span>)}
                    </div>
                )}
            </div>
        </div>
        
        {contact.notes && (
            <div className="space-y-2">
                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">ملاحظات الملف</h4>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 shadow-sm text-sm">
                    <p className="text-amber-800 leading-relaxed italic">"{contact.notes}"</p>
                </div>
            </div>
        )}
      </div>
  );

  const renderCases = () => (
      <div className="grid grid-cols-1 gap-4 pt-2">
          {relatedCases.length > 0 ? (
              relatedCases.map(c => (
                  <div key={c.id} className="bg-white dark:bg-dm-card p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                              <FolderIcon className="w-6 h-6" />
                          </div>
                          <div>
                              <p className="font-black text-gray-900 mb-0.5">{c.title}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{c.caseNumber}</span>
                                  <span>{c.courtName}</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                          <Badge text={c.status} variant={c.status === 'قيد الانتظار' ? 'warning' : 'success'} size="xs" />
                          <Badge text={c.clientName === contact.fullName ? 'موكل' : 'خصم'} variant="secondary" size="xs" />
                      </div>
                  </div>
              ))
          ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                  <FolderIcon className="w-12 h-12 mx-auto text-gray-200 mb-2"/>
                  <p className="text-gray-400">لا توجد قضايا مرتبطة</p>
              </div>
          )}
      </div>
  );

  return (
    <Modal isOpen={!!contact} onClose={onClose} title={`ملف جهة الاتصال: ${contact.fullName}`} size="xl">
      <div className="flex border-b mb-6 bg-gray-50 p-1 rounded-xl">
          {[
              { id: 'overview', label: 'المعلومات الأساسية', icon: <UserCircleIcon className="w-4 h-4"/> },
              { id: 'cases', label: `القضايا (${relatedCases.length})`, icon: <ScaleIcon className="w-4 h-4"/> },
              { id: 'financial', label: 'السجل المالي', icon: <BanknotesIcon className="w-4 h-4"/> },
              { id: 'history', label: 'سجل التفاعلات', icon: <ClockIcon className="w-4 h-4"/> }
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black transition-all rounded-lg ${activeTab === tab.id ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
          ))}
      </div>

      <div className="min-h-[400px] max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'cases' && renderCases()}
          {activeTab === 'financial' && (
              <div className="p-4 space-y-4">
                  {relatedFinancials.length > 0 ? (
                      relatedFinancials.map(tx => (
                          <div key={tx.id} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                              <div>
                                  <p className="font-bold text-gray-900">{tx.description}</p>
                                  <p className="text-xs text-gray-500">{formatDate(tx.transactionDate)}</p>
                              </div>
                              <div className={`text-lg font-black ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {tx.amount.toFixed(3)} د.ك
                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="text-center text-gray-500 py-12 italic">لا توجد سجلات مالية مباشرة مرتبطة بجهة الاتصال.</p>
                  )}
              </div>
          )}
          {activeTab === 'history' && (
              <div className="p-4 space-y-4">
                  {[
                      { date: '2024-05-01', action: 'تم إرسال رسالة تذكير بالموعد عبر واتساب', user: 'أحمد محمود' },
                      { date: '2024-04-15', action: 'تم تحديث بيانات العنوان والمكتب التجاري', user: 'فاطمة علي' },
                      { date: '2024-03-10', action: 'تم ربط جهة الاتصال بملف القضية رقم LAW-2024-001', user: 'النظام' }
                  ].map((h, i) => (
                      <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                          {i < 2 && <div className="absolute top-2 bottom-0 right-[7px] w-[2px] bg-gray-100"></div>}
                          <div className="w-4 h-4 rounded-full bg-primary mt-1 border-4 border-white shadow-sm shrink-0"></div>
                          <div>
                              <p className="text-sm font-bold text-gray-800">{h.action}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{h.date} | بواسطة: {h.user}</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      <div className="mt-8 flex justify-between items-center pt-5 border-t">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              الملف الشخصي: {contact.fullName}
          </div>
          <div className="flex space-x-2 space-x-reverse">
            <Button variant="outline" onClick={() => onEdit(contact)} leftIcon={<PencilIcon className="w-4"/>}>تعديل البيانات</Button>
            <Button variant="primary" onClick={() => onSendNotification(contact)} leftIcon={<EnvelopeIcon className="w-4"/>}>مراسلة</Button>
            <Button variant="ghost" onClick={onClose}>إغلاق</Button>
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
            alert("محتوى الرسالة لا يمكن أن يكون فارغًا.");
            return;
        }
        if (type === 'email' && !subject.trim()) {
            alert("موضوع البريد الإلكتروني مطلوب.");
            return;
        }
        onSend(type, type === 'email' ? subject : undefined, message, contactsToNotify);
    };

    if (!isOpen || contactsToNotify.length === 0) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إرسال إشعار للملف الشخصي" size="md">
            <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-xl text-sm border border-primary/10">
                    جاري الإرسال إلى: <span className="font-black text-primary">{contactsToNotify.length > 1 ? `${contactsToNotify.length} مستلمين` : contactsToNotify[0].fullName}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'email', label: 'بريد', icon: <EnvelopeIcon className="w-4 h-4"/> },
                        { id: 'whatsapp', label: 'واتساب', icon: <ChatBubbleLeftRightIcon className="w-4 h-4"/> },
                        { id: 'sms', label: 'SMS', icon: <PhoneIcon className="w-4 h-4"/> }
                    ].map(t => (
                        <button 
                            key={t.id}
                            type="button"
                            onClick={() => setType(t.id as any)}
                            className={`flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all ${type === t.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}
                        >
                            {t.icon}
                            <span className="text-[10px] mt-1 font-black uppercase">{t.label}</span>
                        </button>
                    ))}
                </div>
                
                {type === 'email' && (
                    <Input label="الموضوع" value={subject} onChange={e => setSubject(e.target.value)} required />
                )}
                
                <TextArea label="محتوى الرسالة" value={message} onChange={e => setMessage(e.target.value)} rows={5} required placeholder="اكتب رسالتك الاحترافية هنا..." />
                
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button variant="primary" onClick={handleSend} leftIcon={<EnvelopeIcon className="w-4"/>}>إرسال المراسلة</Button>
                </div>
            </div>
        </Modal>
    );
};


const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = React.useState<Contact[]>(initialMockContacts);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState<ContactType | ''>('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [contactsForNotification, setContactsForNotification] = useState<Contact[]>([]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = (
        contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.emailPrimary && contact.emailPrimary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.phonePrimary && contact.phonePrimary.includes(searchTerm)) ||
        (contact.organization && contact.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.city && contact.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      const matchesType = filterType === '' || contact.contactType.includes(filterType as ContactType);
      const matchesFavorite = !showFavoritesOnly || contact.isFavorite;
      
      return matchesSearch && matchesType && matchesFavorite;
    }).sort((a,b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [contacts, searchTerm, filterType, showFavoritesOnly]);
  
  const stats = useMemo(() => ({
      total: contacts.length,
      clients: contacts.filter(c => c.contactType.includes(ContactType.CLIENT)).length,
      judges: contacts.filter(c => c.contactType.includes(ContactType.JUDGE)).length,
      experts: contacts.filter(c => c.contactType.includes(ContactType.EXPERT_WITNESS)).length,
  }), [contacts]);

  const handleAddContact = () => { setEditingContact(null); setIsFormModalOpen(true); };
  const handleEditContact = (contact: Contact) => { setEditingContact(contact); setIsFormModalOpen(true); };
  const handleViewContact = (contact: Contact) => { setViewingContact(contact); };

  const handleDeleteContact = useCallback((contactId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف جهة الاتصال هذه؟')) {
      setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
  }, []);

  const handleToggleFavorite = useCallback((contactId: string) => {
    setContacts(prev => prev.map(c => c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c));
  }, []);

  const handleFormSubmit = (data: Contact) => {
    if (editingContact && editingContact.id) {
      setContacts(prev => prev.map(c => (c.id === editingContact.id ? data : c)));
    } else {
      setContacts(prev => [data, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingContact(null);
  };
  
  const toggleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => 
        prev.includes(contactId) ? prev.filter(id => id !== contactId) : [...prev, contactId]
    );
  };
  
  const handleSendNotificationFlow = (contact?: Contact) => {
      let targets: Contact[] = [];
      if (contact) {
          targets = [contact];
      } else if (selectedContacts.length > 0) {
          targets = contacts.filter(c => selectedContacts.includes(c.id));
      }
      
      if (targets.length === 0) {
          alert("يرجى تحديد جهة اتصال واحدة على الأقل لإرسال إشعار.");
          return;
      }
      setContactsForNotification(targets);
      setIsNotificationModalOpen(true);
  };

  const handleNotificationSubmit = (type: string, subject: string | undefined, message: string, recipients: Contact[]) => {
    alert(`تم إرسال ${type} إلى ${recipients.length} مستلم بنجاح!`);
    setSelectedContacts([]); 
    setIsNotificationModalOpen(false);
  };

  const handleExport = () => {
      const csvContent = "data:text/csv;charset=utf-8," 
          + "الاسم,الهاتف,البريد الإلكتروني,النوع,الشركة,المدينة\n"
          + filteredContacts.map(e => `${e.fullName},${e.phonePrimary},${e.emailPrimary},${e.contactType.join('-')},${e.organization || ''},${e.city || ''}`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
  };
  
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
            {filteredContacts.map(contact => (
                <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={contact.id}
                >
                    <div className={`group relative bg-white dark:bg-dm-card rounded-3xl border-2 transition-all duration-300 flex flex-col p-6 shadow-sm hover:shadow-xl ${selectedContacts.includes(contact.id) ? 'border-primary ring-2 ring-primary/10' : 'border-gray-100 dark:border-gray-800'}`}>
                        {/* Checkbox Toggle */}
                        <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-lg border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                checked={selectedContacts.includes(contact.id)}
                                onChange={() => toggleSelectContact(contact.id)}
                            />
                        </div>

                        {/* Favorite Button */}
                        <button 
                            onClick={() => handleToggleFavorite(contact.id)}
                            className={`absolute top-4 right-4 p-2 rounded-xl transition-all ${contact.isFavorite ? 'bg-amber-100 text-amber-500 shadow-sm' : 'bg-gray-50 text-gray-300 hover:text-amber-500'}`}
                        >
                            <StarIcon className={`w-4 h-4 ${contact.isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        <div className="flex items-center gap-4 mb-5">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-inner shadow-black/10 ${getAvatarColor(contact.fullName)} flex-shrink-0`}>
                                {contact.fullName.charAt(0)}
                            </div>
                            <div className="min-w-0 pr-2">
                                <h3 className="text-lg font-black text-gray-900 dark:text-dm-text leading-tight group-hover:text-primary transition-colors line-clamp-1 cursor-pointer" onClick={() => handleViewContact(contact)}>
                                    {contact.fullName}
                                </h3>
                                <p className="text-xs font-bold text-gray-400 mt-0.5 truncate">{contact.organization || 'فرد مستقل'}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6 flex-grow">
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <div className="p-1.5 bg-gray-50 dark:bg-dm-background rounded-lg"><PhoneIcon className="w-3.5 h-3.5 text-primary"/></div>
                                <span className="font-bold">{contact.phonePrimary || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <div className="p-1.5 bg-gray-50 dark:bg-dm-background rounded-lg"><EnvelopeIcon className="w-3.5 h-3.5 text-primary"/></div>
                                <span className="truncate">{contact.emailPrimary || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                                <div className="p-1.5 bg-gray-50 dark:bg-dm-background rounded-lg"><MapPinIcon className="w-3.5 h-3.5 text-primary"/></div>
                                <span>{contact.city || 'غير محدد'}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-6">
                            {contact.contactType.slice(0, 2).map(t => (
                                <Badge key={t} text={t} variant={t === ContactType.CLIENT ? 'success' : t === ContactType.OPPOSING_PARTY ? 'danger' : 'secondary'} size="xs"/>
                            ))}
                            {contact.contactType.length > 2 && <span className="text-[10px] text-gray-400 font-bold self-center">+{contact.contactType.length - 2}</span>}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                            <div className="flex gap-1.5">
                                <button 
                                    onClick={() => handleViewContact(contact)}
                                    className="p-2.5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                    title="عرض كامل"
                                >
                                    <EyeIcon className="w-4 h-4"/>
                                </button>
                                <button 
                                    onClick={() => handleEditContact(contact)}
                                    className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                                    title="تعديل"
                                >
                                    <PencilIcon className="w-4 h-4"/>
                                </button>
                                <button 
                                    onClick={() => handleDeleteContact(contact.id)}
                                    className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    title="حذف"
                                >
                                    <TrashIcon className="w-4 h-4"/>
                                </button>
                            </div>
                            <div className="flex gap-1.5">
                                {contact.phonePrimary && (
                                    <a href={`tel:${contact.phonePrimary}`} className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:shadow-md transition-all shadow-sm">
                                        <PhoneIcon className="w-4 h-4"/>
                                    </a>
                                )}
                                {contact.whatsapp && (
                                    <a href={`https://wa.me/${contact.whatsapp.replace(/\+/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:shadow-md transition-all shadow-sm">
                                        <ChatBubbleLeftRightIcon className="w-4 h-4"/>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </AnimatePresence>
    </div>
  );

  const renderListView = () => (
      <Card className="p-0 overflow-hidden rounded-3xl border-none shadow-xl">
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                  <thead>
                      <tr className="bg-gray-50 dark:bg-dm-card border-b dark:border-gray-800">
                          <th className="p-4 w-12"><input type="checkbox" className="rounded border-gray-300" onChange={(e) => setSelectedContacts(e.target.checked ? filteredContacts.map(c=>c.id) : [])}/></th>
                          <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">جهة الاتصال</th>
                          <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">التصنيف</th>
                          <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest px-12">الهاتف وواتساب</th>
                          <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest">البريد الإلكتروني</th>
                          <th className="p-4 font-black uppercase text-[10px] text-gray-400 tracking-widest text-center">الإجراءات</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {filteredContacts.map(contact => (
                          <tr key={contact.id} className="hover:bg-gray-50/50 dark:hover:bg-dm-card/50 transition-colors group">
                              <td className="p-4"><input type="checkbox" className="rounded border-gray-300" checked={selectedContacts.includes(contact.id)} onChange={() => toggleSelectContact(contact.id)}/></td>
                              <td className="p-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${getAvatarColor(contact.fullName)}`}>
                                          {contact.fullName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-black text-gray-900 dark:text-dm-text hover:text-primary cursor-pointer" onClick={() => handleViewContact(contact)}>{contact.fullName}</p>
                                          <p className="text-[10px] text-gray-400 font-bold">{contact.organization || '-'}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4">
                                  <div className="flex flex-wrap gap-1">
                                      {contact.contactType.map(t=><Badge key={t} text={t} size="xs" variant="secondary"/>)}
                                  </div>
                              </td>
                              <td className="p-4 px-12">
                                  <div className="flex items-center gap-4">
                                      <span className="font-mono font-bold text-gray-600">{contact.phonePrimary || '-'}</span>
                                      {contact.whatsapp && <ChatBubbleLeftRightIcon className="w-4 h-4 text-green-500"/>}
                                  </div>
                              </td>
                              <td className="p-4 text-gray-500 font-medium">{contact.emailPrimary || '-'}</td>
                              <td className="p-4">
                                  <div className="flex justify-center gap-2">
                                      <button onClick={() => handleEditContact(contact)} className="p-2 text-gray-400 hover:text-orange-600"><PencilIcon className="w-4 h-4"/></button>
                                      <button onClick={() => handleDeleteContact(contact.id)} className="p-2 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
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
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <div className="flex items-center gap-3">
                <UserGroupIcon className="w-10 h-10 text-primary" />
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">إدارة جهات الاتصال</h1>
            </div>
            <div className="flex items-center gap-4 mt-2">
                <span className="text-xs bg-primary/5 text-primary-dark px-2 py-1 rounded-lg border border-primary/10">الإجمالي: <strong>{stats.total}</strong></span>
                <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">الموكلين: <strong>{stats.clients}</strong></span>
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-lg border border-amber-100">الخبراء: <strong>{stats.experts}</strong></span>
            </div>
        </div>
        <div className="flex gap-2">
             <Button onClick={() => handleExport()} variant="outline" leftIcon={<ShareIcon className="w-5 h-5"/>}>تصدير البيانات</Button>
             <Button onClick={() => handleSendNotificationFlow()} leftIcon={<EnvelopeIcon className="w-5 h-5"/>} disabled={selectedContacts.length === 0} variant="secondary">
                مراسلة ({selectedContacts.length})
            </Button>
            <Button onClick={handleAddContact} leftIcon={<PlusCircleIcon className="w-5 h-5" />} className="shadow-lg shadow-primary/20">جهة اتصال جديدة</Button>
        </div>
      </div>
      
      {/* Search & Filter Bar */}
      <Card className="border-none shadow-xl shadow-gray-200/50 p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
                <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input 
                    placeholder="ابحث بالاسم، الهاتف، البريد أو المنطقة..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-4 bg-gray-50 dark:bg-dm-card/50 rounded-2xl border-2 border-transparent focus:border-primary focus:bg-white dark:focus:bg-dm-card transition-all outline-none text-sm font-bold"
                />
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <Select 
                    options={[{value: '', label: 'كل التصنيفات'}, ...contactTypeOptions]} 
                    value={filterType} 
                    onChange={e => setFilterType(e.target.value as ContactType | '')} 
                    containerClassName="mb-0 w-full md:w-56"
                />
                <button 
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className={`px-4 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 whitespace-nowrap ${showFavoritesOnly ? 'bg-amber-100 border-amber-200 text-amber-600' : 'bg-gray-50 border-transparent text-gray-400'}`}
                >
                    <StarIcon className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`}/>
                    <span className="text-sm font-bold">المفضلة</span>
                </button>
            </div>
            <div className="flex p-1.5 bg-gray-100 dark:bg-dm-card rounded-2xl shadow-inner shrink-0">
                <button onClick={() => setViewMode('card')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'card' ? 'bg-white shadow-md text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`} title="عرض البطاقات"><UserGroupIcon className="w-5 h-5"/></button>
                <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-primary scale-110' : 'text-gray-400 hover:text-gray-600'}`} title="عرض الجدول"><ListBulletIcon className="w-5 h-5"/></button>
            </div>
        </div>
      </Card>

      {/* Content Section */}
      {filteredContacts.length > 0 ? (
          viewMode === 'card' ? renderCardView() : renderListView()
      ) : (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <SparklesIcon className="w-20 h-20 mx-auto text-gray-200 mb-4"/>
              <p className="text-xl font-black text-gray-400 tracking-tight">لا توجد نتائج مطابقة</p>
              <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black">جرب تغيير معايير البحث أو إضافة جهة اتصال جديدة</p>
          </div>
      )}

      {/* Footer Info */}
      <div className="flex justify-center flex-wrap gap-x-8 gap-y-2 opacity-50 text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"></div> موكلين</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> خصوم</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> خبراء</span>
          <span className="flex items-center gap-1"><StarIcon className="w-2 h-2 fill-amber-500"/> مفضلة</span>
      </div>

      {/* Modals */}
      <ContactFormModal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingContact(null); }} onSubmit={handleFormSubmit} initialData={editingContact} />
      <ViewContactModal contact={viewingContact} onClose={() => setViewingContact(null)} onEdit={(c) => { setViewingContact(null); handleEditContact(c);}} onSendNotification={(c) => handleSendNotificationFlow(c)}/>
      <NotificationModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} contactsToNotify={contactsForNotification} onSend={handleNotificationSubmit}/>
    </div>
  );
};

export default ContactsPage;
