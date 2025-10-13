
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import { 
    UserGroupIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, EnvelopeIcon, PhoneIcon, BuildingStorefrontIcon, UserTieIcon, BriefcaseIcon,
    UserCircleIcon, ScaleIcon, LightBulbIcon, BuildingLibraryIcon // Added missing icons
} from '../constants';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { Contact, ContactType } from '../types';
import { contactTypeOptions } from '../constants';
import { Badge } from '../components/ui/Badge'; // Changed to named import

const initialMockContacts: Contact[] = [
  { id: 'contact1', fullName: 'شركة الأمل للتجارة العامة', contactType: [ContactType.CLIENT], organization: 'شركة الأمل للتجارة العامة', emailPrimary: 'amal@example.com', phonePrimary: '22221111', relatedCaseIds: ['CML-2024-101'], createdAt: '2023-01-10T10:00:00Z', city: 'مدينة الكويت', country: 'الكويت', notes: 'موكل رئيسي في قضايا تجارية متعددة.', jobTitle:'مدير عام', address: 'شرق، قطعة 1، شارع 2، مبنى 3' },
  { id: 'contact2', fullName: 'سارة عبدالله أحمد', contactType: [ContactType.CLIENT, ContactType.FACT_WITNESS], emailPrimary: 'sara.a@example.com', phonePrimary: '55554444', relatedCaseIds: ['LAB-2024-055'], createdAt: '2023-03-15T11:00:00Z', jobTitle: 'مديرة تسويق', organization: 'مؤسسة النور', phoneSecondary: '50505050', emailSecondary:'sara.personal@example.com' },
  { id: 'contact3', fullName: 'مؤسسة النور للمقاولات', contactType: [ContactType.OPPOSING_PARTY], organization: 'مؤسسة النور للمقاولات', emailPrimary: 'noor.corp@example.com', phonePrimary: '33336666', relatedCaseIds: ['CIV-002'], createdAt: '2023-05-01T12:00:00Z', address: 'الشويخ الصناعية، قطعة 3، قسيمة 100', city:'الشويخ', country:'الكويت' },
  { id: 'contact4', fullName: 'د. علي حسين الخبير', contactType: [ContactType.EXPERT_WITNESS], emailPrimary: 'dr.ali.h@example.com', phonePrimary: '66667777', jobTitle: 'خبير هندسي معتمد', organization: 'مكتب الخبرة الهندسية', createdAt: '2023-06-20T14:30:00Z', notes: 'خبير متخصص في تقييم الأضرار الإنشائية.' },
  { id: 'contact5', fullName: 'محمد جاسم الفضلي', contactType: [ContactType.FACT_WITNESS], phonePrimary: '99998888', relatedCaseIds: ['CRIM-2024-789'], createdAt: '2023-07-01T09:00:00Z' },
  { id: 'contact6', fullName: 'المحامي/ خالد ناصر السالم', contactType: [ContactType.OPPOSING_COUNSEL], organization: 'مكتب السالم للمحاماة', emailPrimary: 'khaled.salem@lawfirm.com', phonePrimary: '22445566', createdAt: '2023-08-10T16:00:00Z' },
  { id: 'contact7', fullName: 'محكمة الاستئناف - قلم الكتاب', contactType: [ContactType.COURT_CLERK], organization: 'محكمة الاستئناف', phonePrimary: '22550011', createdAt: '2023-09-05T10:30:00Z', notes: 'للاستفسار عن مواعيد الجلسات في دائرة الاستئناف.' },
];

const getContactTypeIcon = (type: ContactType): React.ReactNode => {
    switch(type) {
        case ContactType.CLIENT: return <UserCircleIcon className="w-4 h-4 text-green-600" />;
        case ContactType.OPPOSING_PARTY: return <UserGroupIcon className="w-4 h-4 text-red-600" />;
        case ContactType.OPPOSING_COUNSEL: return <UserTieIcon className="w-4 h-4 text-orange-600" />;
        case ContactType.JUDGE: case ContactType.COURT_CLERK: return <ScaleIcon className="w-4 h-4 text-blue-600" />; 
        case ContactType.EXPERT_WITNESS: return <LightBulbIcon className="w-4 h-4 text-purple-600" />;
        case ContactType.GOVERNMENT_ENTITY: return <BuildingLibraryIcon className="w-4 h-4 text-gray-700" />;
        case ContactType.SERVICE_PROVIDER: return <BuildingStorefrontIcon className="w-4 h-4 text-teal-600" />;
        case ContactType.COLLEAGUE: return <BriefcaseIcon className="w-4 h-4 text-indigo-600"/>;
        default: return <UserCircleIcon className="w-4 h-4 text-gray-500" />;
    }
};

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contact: Contact) => void;
  initialData?: Partial<Contact> | null;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<Contact>>(
    initialData || { contactType: [ContactType.CLIENT], createdAt: new Date().toISOString() }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || { contactType: [ContactType.CLIENT], createdAt: new Date().toISOString(), relatedCaseIds: [] });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // --- FIX START ---
    // Explicitly type 'option' as HTMLOptionElement to resolve error on 'option.value'.
    const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value as ContactType);
    // --- FIX END ---
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
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto p-1 scrollbar-thin">
        <Input name="fullName" label="الاسم الكامل/اسم المؤسسة (*)" value={formData.fullName || ''} onChange={handleChange} required />
        <div>
            <label htmlFor="contactType" className="block text-sm font-medium text-gray-700 mb-1">نوع جهة الاتصال (*) (يمكن اختيار أكثر من نوع)</label>
            <select 
                id="contactType" 
                name="contactType" 
                multiple 
                value={formData.contactType} 
                onChange={handleMultiSelectChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent h-28"
                required
            >
                {contactTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input name="organization" label="المؤسسة/الشركة" value={formData.organization || ''} onChange={handleChange} />
            <Input name="jobTitle" label="المسمى الوظيفي" value={formData.jobTitle || ''} onChange={handleChange} />
        </div>
        <Card title="معلومات الاتصال الأساسية" titleClassName="text-sm !pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                 <Input name="phonePrimary" label="رقم الهاتف الأساسي" value={formData.phonePrimary || ''} onChange={handleChange} type="tel"/>
                 <Input name="emailPrimary" label="البريد الإلكتروني الأساسي" value={formData.emailPrimary || ''} onChange={handleChange} type="email"/>
            </div>
        </Card>
         <Card title="معلومات اتصال إضافية" titleClassName="text-sm !pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <Input name="phoneSecondary" label="رقم هاتف ثانوي" value={formData.phoneSecondary || ''} onChange={handleChange} type="tel"/>
                <Input name="emailSecondary" label="بريد إلكتروني ثانوي" value={formData.emailSecondary || ''} onChange={handleChange} type="email"/>
            </div>
        </Card>
        <Card title="العنوان" titleClassName="text-sm !pb-2">
            <TextArea name="address" label="تفاصيل العنوان" value={formData.address || ''} onChange={handleChange} rows={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <Input name="city" label="المدينة" value={formData.city || ''} onChange={handleChange} />
                <Input name="country" label="الدولة" value={formData.country || ''} onChange={handleChange} />
            </div>
        </Card>
        <Input name="relatedCaseIds" label="أرقام القضايا المرتبطة (يفصل بينها بفاصلة)" value={formData.relatedCaseIds?.join(', ') || ''} onChange={(e) => setFormData(prev => ({...prev, relatedCaseIds: e.target.value.split(',').map(s => s.trim()).filter(s => s)}))} placeholder="مثال: C-101, L-202"/>
        <TextArea name="notes" label="ملاحظات إضافية" value={formData.notes || ''} onChange={handleChange} rows={3} />
        
        <div className="flex justify-end space-x-3 space-x-reverse pt-3">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة جهة الاتصال"}</Button>
        </div>
      </form>
    </Modal>
  );
};

interface ViewContactModalProps {
  contact: Contact | null;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onSendNotification: (contact: Contact) => void;
}

const ViewContactModal: React.FC<ViewContactModalProps> = ({ contact, onClose, onEdit, onSendNotification }) => {
  if (!contact) return null;
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute:'2-digit'}) : 'غير متوفر';

  return (
    <Modal isOpen={!!contact} onClose={onClose} title={`تفاصيل جهة الاتصال: ${contact.fullName}`} size="lg">
      <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto p-1 scrollbar-thin">
        <Card title="المعلومات الأساسية" className="bg-slate-50" titleClassName="text-xs font-semibold">
            <p><strong>أنواع جهة الاتصال:</strong> {contact.contactType.map(type => <Badge key={type} text={type} color="blue" size="xs" className="me-1 mb-1"/>)}</p>
            {contact.organization && <p className="flex items-center mt-1"><BuildingStorefrontIcon className="w-4 h-4 me-1.5 text-gray-500"/><strong>المؤسسة/الشركة:</strong> {contact.organization}</p>}
            {contact.jobTitle && <p className="flex items-center mt-1"><UserTieIcon className="w-4 h-4 me-1.5 text-gray-500"/><strong>المسمى الوظيفي:</strong> {contact.jobTitle}</p>}
        </Card>
         <Card title="معلومات الاتصال" className="bg-slate-50" titleClassName="text-xs font-semibold">
            {contact.phonePrimary && <p className="flex items-center"><PhoneIcon className="w-4 h-4 me-1.5 text-green-600"/><strong>الهاتف الأساسي:</strong> {contact.phonePrimary}</p>}
            {contact.emailPrimary && <p className="flex items-center mt-1"><EnvelopeIcon className="w-4 h-4 me-1.5 text-blue-600"/><strong>البريد الأساسي:</strong> {contact.emailPrimary}</p>}
            {contact.phoneSecondary && <p className="flex items-center mt-1"><PhoneIcon className="w-4 h-4 me-1.5 text-gray-500"/><strong>الهاتف الثانوي:</strong> {contact.phoneSecondary}</p>}
            {contact.emailSecondary && <p className="flex items-center mt-1"><EnvelopeIcon className="w-4 h-4 me-1.5 text-gray-500"/><strong>البريد الثانوي:</strong> {contact.emailSecondary}</p>}
        </Card>
        {(contact.address || contact.city || contact.country) && (
            <Card title="العنوان" className="bg-slate-50" titleClassName="text-xs font-semibold">
                {contact.address && <p><strong>العنوان التفصيلي:</strong> {contact.address}</p>}
                {contact.city && <p><strong>المدينة:</strong> {contact.city}</p>}
                {contact.country && <p><strong>الدولة:</strong> {contact.country}</p>}
            </Card>
        )}
        {contact.relatedCaseIds && contact.relatedCaseIds.length > 0 && (
          <Card title="القضايا المرتبطة" className="bg-slate-50" titleClassName="text-xs font-semibold">
            <ul className="list-disc ps-5 text-xs">{contact.relatedCaseIds.map(id => <li key={id} className="hover:text-primary">{id}</li>)}</ul>
          </Card>
        )}
        {contact.notes && <Card title="ملاحظات" className="bg-yellow-50 border-yellow-200" titleClassName="text-xs font-semibold text-yellow-800"><pre className="whitespace-pre-wrap font-sans">{contact.notes}</pre></Card>}
        <p className="text-xs text-gray-400 text-center pt-2">تاريخ الإنشاء: {formatDate(contact.createdAt)} | آخر تحديث: {formatDate(contact.updatedAt)}</p>
      </div>
      <div className="mt-4 flex justify-end space-x-2 space-x-reverse p-3 border-t">
          <Button variant="outline" onClick={() => onEdit(contact)} leftIcon={<PencilIcon className="w-4"/>}>تعديل</Button>
          <Button variant="primary" onClick={() => onSendNotification(contact)} leftIcon={<EnvelopeIcon className="w-4"/>}>إرسال إشعار</Button>
          <Button onClick={onClose}>إغلاق</Button>
      </div>
    </Modal>
  );
};

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactsToNotify: Contact[];
    onSend: (type: 'email' | 'sms', subject: string | undefined, message: string, recipients: Contact[]) => void;
}
const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, contactsToNotify, onSend }) => {
    const [type, setType] = useState<'email' | 'sms'>('email');
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
        <Modal isOpen={isOpen} onClose={onClose} title="إرسال إشعار/تحديث" size="md">
            <div className="space-y-3">
                <p className="text-sm">إرسال إلى: <span className="font-semibold">{contactsToNotify.map(c => c.fullName).join(', ')}</span> ({contactsToNotify.length} جهات اتصال)</p>
                <Select label="نوع الإشعار" value={type} onChange={(e) => setType(e.target.value as 'email' | 'sms')}
                    options={[{value: 'email', label: 'بريد إلكتروني'}, {value: 'sms', label: 'رسالة نصية (SMS)'}]} />
                {type === 'email' && (
                    <Input label="الموضوع" value={subject} onChange={e => setSubject(e.target.value)} required />
                )}
                <TextArea label="محتوى الرسالة/الإشعار" value={message} onChange={e => setMessage(e.target.value)} rows={5} required />
                <p className="text-xs text-gray-500">ملاحظة: الإرسال الفعلي للرسائل يتطلب تكامل مع خدمات خارجية (غير مطبق حاليًا). سيتم تسجيل الطلب في وحدة التحكم.</p>
                <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button variant="primary" onClick={handleSend}>إرسال الإشعار</Button>
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

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [contactsForNotification, setContactsForNotification] = useState<Contact[]>([]);


  const filteredContacts = useMemo(() => {
    return contacts.filter(contact =>
      (contact.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (contact.emailPrimary && contact.emailPrimary.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (contact.phonePrimary && contact.phonePrimary.includes(searchTerm)) ||
       (contact.organization && contact.organization.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterType === '' ? true : contact.contactType.includes(filterType as ContactType))
    ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [contacts, searchTerm, filterType]);
  
  const handleAddContact = () => {
    setEditingContact(null);
    setIsFormModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormModalOpen(true);
  };
  
  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
  };

  const handleDeleteContact = useCallback((contactId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف جهة الاتصال هذه؟')) {
      setContacts(prevContacts => prevContacts.filter(c => c.id !== contactId));
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
    }
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

  const handleNotificationSubmit = (type: 'email' | 'sms', subject: string | undefined, message: string, recipients: Contact[]) => {
    console.log("==== إرسال إشعار (محاكاة) ====");
    console.log("المستلمون:", recipients.map(r => ({ name: r.fullName, email: r.emailPrimary, phone: r.phonePrimary })));
    console.log("نوع الإشعار:", type);
    if (type === 'email') console.log("الموضوع:", subject);
    console.log("الرسالة:", message);
    console.log("==============================");
    alert(`تم تسجيل الإشعار لـ ${recipients.length} جهات اتصال للإرسال (انظر وحدة التحكم للمزيد).`);
    setSelectedContacts([]); 
    setIsNotificationModalOpen(false);
  };

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <UserGroupIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark">إدارة جهات الاتصال</h1>
        </div>
        <div className="flex space-x-2 space-x-reverse">
             <Button onClick={() => handleSendNotificationFlow()} leftIcon={<EnvelopeIcon className="w-4"/>} disabled={selectedContacts.length === 0} variant="outline">
                إرسال إشعار للمحددين
            </Button>
            <Button onClick={handleAddContact} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>
                إضافة جهة اتصال
            </Button>
        </div>
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 mb-1">دليل جهات الاتصال الشامل</h3>
                <p className="text-sm text-blue-600 leading-relaxed">
                    هنا يمكنك إدارة جميع جهات الاتصال المتعلقة بعملك القانوني، بما في ذلك الموكلين، الخصوم، محامو الخصوم، الشهود، الخبراء، الجهات الحكومية، وغيرهم. 
                    <br/> استخدم الفلاتر للبحث، وأدوات التعديل لتحديث البيانات. يمكنك تحديد جهات اتصال متعددة لإرسال إشعارات أو تحديثات مجمعة (محاكاة حاليًا).
                </p>
            </div>
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <Input placeholder="ابحث بالاسم، المؤسسة، الهاتف، البريد..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0"/>
            <Select 
                label="تصفية بنوع جهة الاتصال" 
                options={[{value: '', label: 'الكل'}, ...contactTypeOptions]} 
                value={filterType} 
                onChange={e => setFilterType(e.target.value as ContactType | '')} 
                containerClassName="mb-0"
            />
            <div className="flex items-end">
                <p className="text-sm text-gray-600">المحدد: {selectedContacts.length} من {filteredContacts.length}</p>
            </div>
        </div>
        
        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContacts.map(contact => (
                <Card key={contact.id} className={`shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col bg-white rounded-lg border-2 ${selectedContacts.includes(contact.id) ? 'border-primary' : 'border-transparent'}`}>
                    <div className="p-4 flex-grow">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                                <input type="checkbox" className="form-checkbox h-5 w-5 text-primary rounded focus:ring-primary-light border-gray-300 me-3" 
                                       checked={selectedContacts.includes(contact.id)} onChange={() => toggleSelectContact(contact.id)} aria-label={`تحديد ${contact.fullName}`}/>
                                <h3 className="text-md font-semibold text-primary-dark line-clamp-1" title={contact.fullName}>{contact.fullName}</h3>
                            </div>
                            <div className="flex-shrink-0 space-x-1 space-x-reverse">
                                {contact.contactType.slice(0,2).map(type => (
                                    <span key={type} title={type} className="inline-block p-1 bg-gray-100 rounded">
                                        {getContactTypeIcon(type)}
                                    </span>
                                ))}
                                {contact.contactType.length > 2 && <span className="text-xs text-gray-400">+{contact.contactType.length - 2}</span>}
                            </div>
                        </div>
                        
                        {contact.organization && <p className="text-xs text-gray-600 mb-1 flex items-center"><BuildingStorefrontIcon className="w-3.5 h-3.5 me-1 text-gray-400"/>{contact.organization}</p>}
                        {contact.jobTitle && <p className="text-xs text-gray-600 mb-1 flex items-center"><UserTieIcon className="w-3.5 h-3.5 me-1 text-gray-400"/>{contact.jobTitle}</p>}
                        {contact.phonePrimary && <p className="text-xs text-gray-600 mb-1 flex items-center"><PhoneIcon className="w-3.5 h-3.5 me-1 text-green-500"/>{contact.phonePrimary}</p>}
                        {contact.emailPrimary && <p className="text-xs text-gray-600 mb-1 flex items-center"><EnvelopeIcon className="w-3.5 h-3.5 me-1 text-blue-500"/>{contact.emailPrimary}</p>}
                        {contact.notes && <p className="text-xs text-gray-500 bg-slate-50 p-1.5 rounded-md line-clamp-2 my-1.5" title={contact.notes}>{contact.notes}</p>}
                        {contact.relatedCaseIds && contact.relatedCaseIds.length > 0 && <p className="text-xs text-indigo-600 mt-1">مرتبط بـ {contact.relatedCaseIds.length} قضايا</p>}
                    </div>
                    <div className="border-t p-3 bg-slate-50/50 flex justify-start space-x-1 space-x-reverse rounded-b-lg">
                        <Button variant="ghost" size="sm" onClick={() => handleViewContact(contact)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditContact(contact)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteContact(contact.id)} title="حذف" className="text-danger hover:text-red-700"><TrashIcon className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSendNotificationFlow(contact)} title="إرسال إشعار لهذه الجهة" className="text-green-600"><EnvelopeIcon className="w-4 h-4" /></Button>
                    </div>
                </Card>
            ))}
          </div>
        ) : (
            <div className="text-center py-10 text-gray-500">
                <FolderIcon className="w-16 h-16 mx-auto text-gray-300 mb-3"/>
                <p className="text-lg">لا توجد جهات اتصال تطابق معايير البحث الحالية.</p>
            </div>
        )}
      </Card>

      <ContactFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => { setIsFormModalOpen(false); setEditingContact(null); }} 
        onSubmit={handleFormSubmit} 
        initialData={editingContact} 
      />
      <ViewContactModal 
        contact={viewingContact} 
        onClose={() => setViewingContact(null)} 
        onEdit={(contactToEdit) => { setViewingContact(null); handleEditContact(contactToEdit);}}
        onSendNotification={(contactToSendTo) => handleSendNotificationFlow(contactToSendTo)}
      />
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        contactsToNotify={contactsForNotification}
        onSend={handleNotificationSubmit}
      />
    </div>
  );
};

export default ContactsPage;
