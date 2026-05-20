
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SignaturePad from '../components/ui/SignaturePad';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    GavelIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, ClockIcon, MagnifyingGlassIcon, CheckCircleIcon, 
    ExclamationTriangleIcon, ArrowUturnLeftIcon, DocumentTextIcon, PrinterIcon, 
    ShieldCheckIcon, ScaleIcon, UsersIcon, BriefcaseIcon, OFFICE_NAME
} from '../constants';
import { 
    Investigation, InvestigationSession, InvestigationQuestion, 
    InvestigationStatus, InvestigationPartyType, Case, Employee
} from '../types';
import { initialCases } from '../data/caseData';
import { 
    investigationStatusOptions, 
    investigationPartyTypeOptions, 
    INVESTIGATION_TEMPLATES, 
    KUWAIT_LABOR_LAW_INVESTIGATION_RULES,
    INVESTIGATION_STATUS_LEGAL
} from '../constants';
import { Badge } from '../components/ui/Badge';
import { sampleEmployees } from '../data/employeeData';
import { useToast } from '../components/ui/Toast';

// --- Legal Summons View ---
const SummonsModal: React.FC<{ isOpen: boolean; onClose: () => void; investigation: Investigation | null; employee: Employee | null }> = ({ isOpen, onClose, investigation, employee }) => {
    if (!investigation || !employee) return null;
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إعلان رسمي للمثول أمام التحقيق" size="lg">
            <div id="printable-summons" className="p-12 bg-white text-slate-900 font-serif text-right" dir="rtl">
                <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-8">
                    <div>
                        <h2 className="text-xl font-black">{OFFICE_NAME}</h2>
                        <p className="text-sm font-bold">الإدارة القانونية - وحدة التحقيقات</p>
                    </div>
                    <div className="text-left font-mono text-xs">
                        <p>REF: SUM-{investigation.id.split('-').pop()?.toUpperCase()}</p>
                        <p>DATE: {new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-black underline underline-offset-8 uppercase tracking-widest">إعلان بالحضور للتحقيق الإداري</h1>
                    <p className="text-xs font-bold text-slate-500 mt-2">(إخطار رسمي مسجل)</p>
                </div>

                <div className="space-y-6 text-sm leading-relaxed mb-12">
                    <p>السيد/ <strong>{employee.fullNameAr}</strong> المحترم</p>
                    <p>المسمى الوظيفي: <strong>{employee.jobTitle}</strong> | الرقم الوظيفي: <strong>{employee.employeeId}</strong></p>
                    
                    <div className="p-6 bg-slate-50 border-r-4 border-slate-900">
                        <p className="mb-4">تحية طيبة وبعد ،،،</p>
                        <p>بناءً على مقتضيات المصلحة العامة، وبإشارة إلى ملف التحقيق رقم <strong>({investigation.investigationNumber})</strong> المقيد تحت موضوع <strong>({investigation.subject})</strong>.</p>
                        <p className="mt-4">تقرر استدعاؤكم للمثول أمام المحقق المختص بالإدارة القانونية، وذلك لسماع أقوالكم فيما هو منسوب إليكم من وقائع، وذلك في الموعد والمكان المحددين أدناه:</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 border rounded-xl bg-indigo-50">
                            <p className="text-[10px] font-black text-indigo-600 mb-1 uppercase tracking-widest">تاريخ الجلسة</p>
                            <p className="font-black text-lg">{new Date().toLocaleDateString('ar-EG')}</p>
                        </div>
                        <div className="p-4 border rounded-xl bg-indigo-50">
                            <p className="text-[10px] font-black text-indigo-600 mb-1 uppercase tracking-widest">وقت الحضور</p>
                            <p className="font-black text-lg">10:00 صباحاً</p>
                        </div>
                    </div>

                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                        <p className="text-[10px] font-black text-rose-700 underline mb-2">تنبيه قانوني هام:</p>
                        <ul className="list-disc list-inside text-[11px] space-y-1 font-bold text-rose-900">
                            <li>يعتبر حضوركم لهذا التحقيق إلزامياً بموجب لوائح العمل والقانون.</li>
                            <li>لكم الحق في الاستعانة بمن ترون من ذوي الاختصاص القانوني.</li>
                            <li>التخلف عن الحضور دون عذر مقبول قد يترتب عليه إجراءات تأديبية غيابية.</li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-10">
                    <div className="text-center">
                        <p className="text-xs font-black mb-12">توقيع الموظف المستلم</p>
                        <p className="text-[10px] text-slate-400 border-t pt-1 w-40">................................</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-black mb-12">اعتماد مدير الإدارة القانونية</p>
                        <div className="w-24 h-24 border-2 border-dashed border-slate-200 mx-auto mb-2 flex items-center justify-center">
                            <span className="text-[10px] text-slate-300 italic">ختم الإدارة</span>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-4 border-t border-slate-100 flex justify-between text-[9px] font-black text-slate-400 uppercase italic">
                    <span>Adala Juridical Module - Investigation Summons</span>
                    <Button variant="primary" size="sm" className="no-print bg-slate-900" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة الإعلان الآن</Button>
                </div>
            </div>
        </Modal>
    );
};

// MOCK DATA - Expanded with diverse scenarios
const mockInvestigations: Investigation[] = [
    {
        id: 'inv-001',
        investigationNumber: 'INV-2024-001',
        subject: 'التحقيق في شكوى إفشاء أسرار العمل (قضية العميل س)',
        investigator: 'المحامي/ عبدالله الفهد (رئيس قسم الامتثال)',
        status: InvestigationStatus.ONGOING,
        startDate: '2024-08-11',
        createdAt: '2024-08-10',
        relatedCaseIds: ['1'],
        summary: "تم استدعاء الموظف ومواجهته بالأدلة الرقمية التي تشير إلى إرسال مستندات حساسة لبريد خارجي.",
        sessions: [
            {
                id: 'inv-001-s1',
                partyName: 'فاطمة علي حسين السيد',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-08-11',
                questions: [
                    { id: 'q1', questionText: 'س: ما هو قولك فيما هو منسوب إليك من إفشاء أسرار العميل (س)؟', answerText: 'ج: أنكر ذلك تماماً، لم أقم بإرسال أي شيء.', timestamp: '2024-08-11T10:15:00Z' },
                    { id: 'q2', questionText: 'س: لدينا سجلات تقنية تفيد بإرسال بريد إلكتروني من حسابك الشخصي يحوي الملفات، كيف تفسرين ذلك؟', answerText: 'ج: ربما تم اختراق حسابي أو تركت الجهاز مفتوحاً.', timestamp: '2024-08-11T10:20:00Z' },
                ]
            }
        ]
    },
    {
        id: 'inv-002',
        investigationNumber: 'INV-2024-005',
        subject: 'تحقيق في عجز مالي بالعهدة النقدية (الخزينة)',
        investigator: 'لجنة التحقيق المالية',
        status: InvestigationStatus.ON_HOLD,
        startDate: '2024-07-25',
        createdAt: '2024-07-24',
        summary: "وجود عجز بقيمة 150 د.ك في عهدة المحاسب. تم تعليق التحقيق لحين مراجعة الكاميرات.",
        sessions: [
            {
                id: 'inv-002-s1',
                partyName: 'علي محمد جاسم',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-07-25',
                questions: [
                    { id: 'q1', questionText: 'س: متى اكتشفت العجز في الصندوق؟', answerText: 'ج: عند جرد نهاية اليوم بتاريخ 24-07-2024.', timestamp: '2024-07-25T09:00:00Z' },
                    { id: 'q2', questionText: 'س: هل قام أحد غيرك باستخدام الخزينة؟', answerText: 'ج: لا، المفتاح معي فقط.', timestamp: '2024-07-25T09:05:00Z' },
                ]
            }
        ]
    },
    {
        id: 'inv-003',
        investigationNumber: 'INV-2024-012',
        subject: 'مخالفة لائحة السلوك (مشادة كلامية مع مدير مباشر)',
        investigator: 'مدير الموارد البشرية',
        status: InvestigationStatus.CLOSED,
        startDate: '2024-06-10',
        endDate: '2024-06-12',
        createdAt: '2024-06-09',
        summary: "ثبوت الواقعة باعتراف الموظف وشهادة الزملاء.",
        recommendation: "توجيه إنذار كتابي وخصم يوم عمل واحد.",
        relatedDisciplinaryActionId: 'da-003',
        sessions: [
            {
                id: 'inv-003-s1',
                partyName: 'أحمد محمود (شاهد)',
                partyType: InvestigationPartyType.WITNESS,
                sessionDate: '2024-06-10',
                questions: [
                    { id: 'q1', questionText: 'س: هل كنت متواجداً وقت المشادة؟', answerText: 'ج: نعم، كنت في المكتب المجاور.', timestamp: '2024-06-10T11:00:00Z' },
                    { id: 'q2', questionText: 'س: هل سمعت الموظف يتلفظ بألفاظ نابية؟', answerText: 'ج: نعم، سمعت صراخاً وكلمات غير لائقة.', timestamp: '2024-06-10T11:05:00Z' },
                ]
            },
            {
                id: 'inv-003-s2',
                partyName: 'عادل إبراهيم (الموظف)',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-06-11',
                questions: [
                    { id: 'q3', questionText: 'س: ما سبب رفع صوتك على مديرك المباشر؟', answerText: 'ج: شعرت بالظلم في توزيع المهام وفقدت أعصابي.', timestamp: '2024-06-11T13:00:00Z' },
                    { id: 'q4', questionText: 'س: هل تعتذر عما بدر منك؟', answerText: 'ج: نعم، أعتذر وأتعهد بعدم التكرار.', timestamp: '2024-06-11T13:10:00Z' },
                ]
            }
        ]
    },
    {
        id: 'inv-004',
        investigationNumber: 'INV-2024-020',
        subject: 'تحقيق غياب متصل بدون إذن (7 أيام)',
        investigator: 'أ. سارة العلي (باحث قانوني)',
        status: InvestigationStatus.CLOSED,
        startDate: '2024-05-01',
        endDate: '2024-05-03',
        createdAt: '2024-04-30',
        summary: "الموظف قدم تقريراً طبياً من مستشفى خاص يغطي فترة الغياب.",
        recommendation: "حفظ التحقيق واعتماد الإجازة المرضية بعد التصديق عليها.",
        sessions: [
            {
                id: 'inv-004-s1',
                partyName: 'خالد ناصر',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-05-01',
                questions: [
                    { id: 'q1', questionText: 'س: تغيبت عن العمل من تاريخ ... إلى ... دون إخطار مسبق، ما هو السبب؟', answerText: 'ج: تعرضت لوعكة صحية مفاجئة دخلت على إثرها المستشفى.', timestamp: '2024-05-01T10:00:00Z' },
                    { id: 'q2', questionText: 'س: لماذا لم تقم بالاتصال للإبلاغ؟', answerText: 'ج: حالتي الصحية لم تسمح، وقمت بإرسال رسالة واتساب لزميلي.', timestamp: '2024-05-01T10:05:00Z' },
                ]
            }
        ]
    },
    {
        id: 'inv-005',
        investigationNumber: 'INV-2024-033',
        subject: 'شبهة تزوير في تقرير طبي (مرضية)',
        investigator: 'لجنة التحقيق',
        status: InvestigationStatus.ONGOING,
        startDate: '2024-08-15',
        createdAt: '2024-08-14',
        summary: "التقرير الطبي المقدم يبدو عليه آثار تعديل في التواريخ. تم مخاطبة المستشفى للإفادة.",
        sessions: [
            {
                id: 'inv-005-s1',
                partyName: 'سالم عبدالله',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-08-15',
                questions: [
                    { id: 'q1', questionText: 'س: كيف تفسر عدم تطابق البيانات في المستند الطبي مع السجلات الرسمية؟', answerText: 'ج: لا أعلم، استلمت التقرير من الطبيب كما هو.', timestamp: '2024-08-15T11:00:00Z' },
                    { id: 'q2', questionText: 'س: هل تعلم أن التزوير في المحررات الرسمية جريمة يعاقب عليها القانون الجنائي والإداري؟', answerText: 'ج: نعم أعلم، وأؤكد أنني لم أقم بأي تزوير.', timestamp: '2024-08-15T11:05:00Z' },
                ]
            }
        ]
    },
    {
        id: 'inv-006',
        investigationNumber: 'INV-2024-040',
        subject: 'عدم تنفيذ أوامر إدارية (عصيان)',
        investigator: 'مدير العمليات',
        status: InvestigationStatus.CLOSED,
        startDate: '2024-08-01',
        endDate: '2024-08-02',
        createdAt: '2024-07-31',
        summary: "الموظف رفض الانتقال للموقع الجديد. تم التوصل لحل ودي بعد التحقيق.",
        recommendation: "الاكتفاء بتنبيه شفهي بعد امتثال الموظف للقرار.",
        sessions: [
            {
                id: 'inv-006-s1',
                partyName: 'جاسم محمد',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-08-01',
                questions: [
                    { id: 'q1', questionText: 'س: هل تسلمت التوجيه الصادر بخصوص الانتقال لفرع حولي؟', answerText: 'ج: نعم تسلمته.', timestamp: '2024-08-01T09:30:00Z' },
                    { id: 'q2', questionText: 'س: لماذا امتنعت عن تنفيذ هذا الأمر الإداري المباشر؟', answerText: 'ج: لدي ظروف عائلية تمنعني من العمل في منطقة بعيدة، وطلبت استثناء.', timestamp: '2024-08-01T09:35:00Z' },
                ]
            }
        ]
    }
];

const InvestigationStatCard: React.FC<{ title: string; count: number; icon: React.ReactNode; color: string }> = ({ title, count, icon, color }) => (
    <div className={`p-4 rounded-lg bg-white shadow-sm border-s-4 ${color} flex items-center justify-between`}>
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('border-', 'bg-')} ${color.replace('border-', 'text-')}`}>
            {icon}
        </div>
    </div>
);

// --- Session Editor Component (NEW) ---
interface SessionEditorProps {
    session: Partial<InvestigationSession>;
    onSave: (session: InvestigationSession) => void;
    onCancel: () => void;
}

const SessionEditor: React.FC<SessionEditorProps> = ({ session, onSave, onCancel }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<InvestigationSession>>(session);
    const [questions, setQuestions] = useState<InvestigationQuestion[]>(session.questions || []);
    const [partySignature, setPartySignature] = useState(session.partySignature || '');
    const [investigatorSignature, setInvestigatorSignature] = useState(session.investigatorSignature || '');
    const [signatureType, setSignatureType] = useState<'party' | 'investigator' | null>(null);
    
    // New Question Inputs
    const [newQText, setNewQText] = useState('');
    const [newAText, setNewAText] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');

    const handleApplyTemplate = () => {
        const template = INVESTIGATION_TEMPLATES.find(t => t.id === selectedTemplate);
        if (template) {
            const newQuestions: InvestigationQuestion[] = template.questions.map((qText, index) => ({
                id: `q-temp-${Date.now()}-${index}`,
                questionText: `س: ${qText}`,
                answerText: '',
                timestamp: new Date().toISOString()
            }));
            setQuestions(prev => [...prev, ...newQuestions]);
        }
    };

    const handleAddQuestion = () => {
        if (!newQText.trim()) return;
        const newQ: InvestigationQuestion = {
            id: `q-${Date.now()}`,
            questionText: newQText.startsWith('س:') ? newQText : `س: ${newQText}`,
            answerText: newAText ? (newAText.startsWith('ج:') ? newAText : `ج: ${newAText}`) : '',
            timestamp: new Date().toISOString()
        };
        setQuestions([...questions, newQ]);
        setNewQText('');
        setNewAText('');
    };

    const handleUpdateQuestion = (id: string, field: 'questionText' | 'answerText', value: string) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const handleDeleteQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleSave = () => {
        if (!formData.sessionDate || !formData.partyName) {
            addToast({ type: 'error', title: 'بيانات ناقصة', message: 'يرجى إدخال تاريخ الجلسة واسم الطرف.' });
            return;
        }

        if (!partySignature || !investigatorSignature) {
            addToast({ type: 'warning', title: 'توقيعات مطلوبة', message: 'يجب استكمال توقيعات الطرف والمحقق قبل حفظ المحضر.' });
            return;
        }

        onSave({ 
            ...formData, 
            id: formData.id || `sess-${Date.now()}`, 
            questions,
            partySignature,
            investigatorSignature
        } as InvestigationSession);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-3 rounded border">
                <Input label="تاريخ الجلسة" type="date" value={formData.sessionDate || ''} onChange={e => setFormData({...formData, sessionDate: e.target.value})} required />
                <Input label="اسم الطرف (المستجوب/الشاهد)" value={formData.partyName || ''} onChange={e => setFormData({...formData, partyName: e.target.value})} required />
                <Select label="صفة الطرف" value={formData.partyType || ''} options={investigationPartyTypeOptions} onChange={e => setFormData({...formData, partyType: e.target.value as any})} />
            </div>

            <Card title="مجريات التحقيق (سؤال وجواب)" className="border-t-4 border-primary">
                {/* Template Selector */}
                <div className="flex gap-2 mb-4 items-end bg-blue-50 p-2 rounded">
                    <Select 
                        label="استخدام نموذج أسئلة جاهز" 
                        value={selectedTemplate} 
                        options={[{value:'', label:'-- اختر النموذج --'}, ...INVESTIGATION_TEMPLATES.map(t => ({value: t.id, label: t.title}))]} 
                        onChange={e => setSelectedTemplate(e.target.value)} 
                        containerClassName="mb-0 flex-grow"
                    />
                    <Button size="sm" onClick={handleApplyTemplate} disabled={!selectedTemplate} leftIcon={<DocumentTextIcon className="w-4"/>}>إدراج الأسئلة</Button>
                </div>

                {/* Questions List (Editable) */}
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto p-1">
                    {questions.map((q, idx) => (
                        <div key={q.id} className="border p-2 rounded bg-white relative group">
                            <div className="absolute top-2 left-2 hidden group-hover:flex">
                                <button onClick={() => handleDeleteQuestion(q.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><TrashIcon className="w-4"/></button>
                            </div>
                            <div className="mb-2">
                                <label className="text-xs font-bold text-gray-500">سؤال {idx + 1}:</label>
                                <textarea 
                                    className="w-full text-sm border-none focus:ring-0 resize-none font-bold text-gray-800 bg-transparent"
                                    value={q.questionText}
                                    onChange={e => handleUpdateQuestion(q.id, 'questionText', e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <div className="border-t pt-1">
                                <label className="text-xs font-bold text-gray-500">الجواب:</label>
                                <textarea 
                                    className="w-full text-sm border-none focus:ring-0 resize-none text-gray-600 bg-transparent"
                                    value={q.answerText || ''}
                                    onChange={e => handleUpdateQuestion(q.id, 'answerText', e.target.value)}
                                    placeholder="(أدخل إجابة الموظف هنا...)"
                                    rows={2}
                                />
                            </div>
                        </div>
                    ))}
                    {questions.length === 0 && <p className="text-center text-gray-400 py-4">لم يتم إضافة أسئلة بعد.</p>}
                </div>

                {/* New Question Input */}
                <div className="flex flex-col gap-2 border-t pt-3">
                    <Input placeholder="نص السؤال الجديد..." value={newQText} onChange={e => setNewQText(e.target.value)} containerClassName="mb-0" />
                    <Input placeholder="نص الإجابة (اختياري)" value={newAText} onChange={e => setNewAText(e.target.value)} containerClassName="mb-0" />
                    <Button size="sm" variant="outline" onClick={handleAddQuestion} disabled={!newQText} className="self-end" leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة السؤال</Button>
                </div>
            </Card>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">التوقيعات الإلكترونية والاعتماد</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center p-3 border rounded bg-white">
                        <p className="text-xs font-bold mb-2">توقيع {formData.partyType === InvestigationPartyType.WITNESS ? 'الشاهد' : 'المستجوب'}</p>
                        {partySignature ? (
                            <img src={partySignature} alt="Party Signature" className="h-16 mb-2 border p-1" />
                        ) : (
                            <div className="h-16 w-full border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-300 text-xs mb-2">بانتظار التوقيع</div>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSignatureType('party')}>
                            {partySignature ? 'تغيير التوقيع' : 'بدء التوقيع'}
                        </Button>
                    </div>
                    <div className="flex flex-col items-center p-3 border rounded bg-white">
                        <p className="text-xs font-bold mb-2">توقيع المحقق</p>
                        {investigatorSignature ? (
                            <img src={investigatorSignature} alt="Investigator Signature" className="h-16 mb-2 border p-1" />
                        ) : (
                            <div className="h-16 w-full border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-300 text-xs mb-2">بانتظار التوقيع</div>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSignatureType('investigator')}>
                            {investigatorSignature ? 'تغيير التوقيع' : 'بدء التوقيع'}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onCancel}>إلغاء</Button>
                <Button onClick={handleSave} disabled={!partySignature || !investigatorSignature}>حفظ الجلسة واعتماد المحضر</Button>
            </div>

            {signatureType && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-dm-card p-6 rounded-2xl shadow-2xl max-w-lg w-full">
                        <SignaturePad 
                            title={signatureType === 'party' ? `توقيع الطرف (${formData.partyName})` : "توقيع المحقق"}
                            onSave={(sig) => {
                                if (signatureType === 'party') setPartySignature(sig);
                                else setInvestigatorSignature(sig);
                                setSignatureType(null);
                            }}
                            onCancel={() => setSignatureType(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Investigation Form ---
interface InvestigationFormProps {
    initialData?: Partial<Investigation> | null;
    onSubmit: (data: Investigation) => void;
    onCancel: () => void;
}

const InvestigationForm: React.FC<InvestigationFormProps> = ({ initialData, onSubmit, onCancel }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<Investigation>>(
        initialData || {
            investigationNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
            status: InvestigationStatus.ONGOING,
            startDate: new Date().toISOString().split('T')[0],
            sessions: [],
            createdAt: new Date().toISOString(),
        }
    );
    
    // Session Management State
    const [isSessionEditorOpen, setIsSessionEditorOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Partial<InvestigationSession> | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSession = (session: InvestigationSession) => {
        const currentSessions = formData.sessions || [];
        const index = currentSessions.findIndex(s => s.id === session.id);
        let updatedSessions;
        if (index >= 0) {
            updatedSessions = currentSessions.map((s, i) => i === index ? session : s);
        } else {
            updatedSessions = [...currentSessions, session];
        }
        setFormData({ ...formData, sessions: updatedSessions });
        setIsSessionEditorOpen(false);
        setEditingSession(null);
    };

    const handleEditSession = (session: InvestigationSession) => {
        setEditingSession(session);
        setIsSessionEditorOpen(true);
    };

    const handleDeleteSession = (id: string) => {
        setFormData(prev => ({
            ...prev,
            sessions: prev.sessions?.filter(s => s.id !== id)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subject || !formData.investigator) {
            addToast({
                type: 'warning',
                title: 'تنبيه',
                message: "يرجى ملء الحقول الإلزامية."
            });
            return;
        }
        onSubmit({ ...formData, updatedAt: new Date().toISOString() } as Investigation);
    };

    if (isSessionEditorOpen) {
        return (
            <SessionEditor 
                session={editingSession || { sessionDate: new Date().toISOString().split('T')[0], questions: [] }} 
                onSave={handleSaveSession} 
                onCancel={() => setIsSessionEditorOpen(false)} 
            />
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="رقم التحقيق" name="investigationNumber" value={formData.investigationNumber || ''} onChange={handleChange} required />
                <Select label="الحالة" name="status" value={formData.status} options={investigationStatusOptions} onChange={handleChange} />
            </div>
            <Input label="موضوع التحقيق" name="subject" value={formData.subject || ''} onChange={handleChange} required />
            <Input label="المحقق / اللجنة" name="investigator" value={formData.investigator || ''} onChange={handleChange} required />
            
            {/* Related Cases Selection */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">ربط بالقضايا ذات الصلة</label>
                <div className="border rounded-md p-3 bg-white max-h-40 overflow-y-auto space-y-2 shadow-sm">
                    {initialCases.map(c => (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition p-1">
                            <input 
                                type="checkbox" 
                                className="rounded text-primary focus:ring-primary h-4 w-4"
                                checked={formData.relatedCaseIds?.includes(c.id) || false}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFormData(prev => {
                                        const currentIds = prev.relatedCaseIds || [];
                                        if (checked) {
                                            return { ...prev, relatedCaseIds: [...currentIds, c.id] };
                                        } else {
                                            return { ...prev, relatedCaseIds: currentIds.filter(id => id !== c.id) };
                                        }
                                    });
                                }}
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{c.title}</span>
                                <span className="text-[10px] text-gray-400">{c.caseNumber} - {c.clientName}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="تاريخ البدء" type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} required />
                <Input label="تاريخ الانتهاء" type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} />
            </div>
            
            {/* Sessions List */}
            <Card title="جلسات التحقيق" className="bg-gray-50" actions={<Button size="sm" type="button" variant="outline" onClick={() => { setEditingSession(null); setIsSessionEditorOpen(true); }} leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة جلسة</Button>}>
                {formData.sessions && formData.sessions.length > 0 ? (
                    <div className="space-y-2">
                        {formData.sessions.map((session, idx) => (
                            <div key={session.id} className="flex justify-between items-center p-2 bg-white border rounded">
                                <div>
                                    <p className="font-bold text-sm">جلسة {idx + 1}: {new Date(session.sessionDate).toLocaleDateString('ar-EG')}</p>
                                    <p className="text-xs text-gray-500">مع: {session.partyName} ({session.partyType})</p>
                                    <p className="text-xs text-gray-400">{session.questions.length} سؤال</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button size="sm" variant="ghost" type="button" onClick={() => handleEditSession(session)}><PencilIcon className="w-4 text-blue-600"/></Button>
                                    <Button size="sm" variant="ghost" type="button" onClick={() => handleDeleteSession(session.id)}><TrashIcon className="w-4 text-red-600"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-gray-400 py-2">لا توجد جلسات مسجلة.</p>}
            </Card>

            <TextArea label="ملخص التحقيق" name="summary" value={formData.summary || ''} onChange={handleChange} rows={3} />
            <TextArea label="التوصيات والنتائج" name="recommendation" value={formData.recommendation || ''} onChange={handleChange} rows={2} placeholder="اكتب التوصيات النهائية هنا..." />
            <div className="flex justify-end space-x-2 space-x-reverse pt-2 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>إلغاء</Button>
                <Button type="submit">{initialData?.id ? 'حفظ التعديلات' : 'إنشاء الملف'}</Button>
            </div>
        </form>
    );
};

// --- Printable Minutes View ---
const InvestigationPrintView: React.FC<{ investigation: Investigation }> = ({ investigation }) => (
    <div id="printable-investigation-minutes" className="hidden print:block p-8 bg-white text-black font-serif dir-rtl">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h2 className="text-xl font-bold">محضر تحقيق إداري</h2>
            <p>رقم: {investigation.investigationNumber}</p>
            <p>التاريخ: {new Date().toLocaleDateString('ar-EG')}</p>
        </div>

        <div className="mb-6 leading-loose">
            <p><strong>الموضوع:</strong> {investigation.subject}</p>
            <p><strong>المحقق:</strong> {investigation.investigator}</p>
            <p><strong>تاريخ البدء:</strong> {new Date(investigation.startDate).toLocaleDateString('ar-EG')}</p>
            {investigation.relatedCaseIds && investigation.relatedCaseIds.length > 0 && (
                <p><strong>القضايا المرتبطة:</strong> {investigation.relatedCaseIds.map(id => initialCases.find(c => c.id === id)?.title || id).join(' - ')}</p>
            )}
        </div>

        {investigation.sessions.map((session, idx) => (
            <div key={session.id} className="mb-8 border-t border-dashed pt-4">
                <h3 className="font-bold text-lg mb-2 underline">محضر جلسة رقم ({idx + 1})</h3>
                <p className="mb-4">
                    إنه في يوم {new Date(session.sessionDate).toLocaleDateString('ar-EG', {weekday: 'long'})} الموافق {new Date(session.sessionDate).toLocaleDateString('ar-EG')}، 
                    تم استدعاء السيد/ <strong>{session.partyName}</strong> بصفته ({session.partyType}) لسماع أقواله.
                </p>
                
                <div className="space-y-4">
                    {session.questions.map((q, qIdx) => (
                        <div key={q.id}>
                            <p className="font-bold">{q.questionText}</p>
                            <p className="mr-8 mt-1 border-r-2 border-gray-400 pr-2">{q.answerText || '(لم يجب)'}</p>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-between mt-8 pt-4">
                    <div className="text-center"><p>توقيع المستجوب</p><p>....................</p></div>
                    <div className="text-center"><p>توقيع المحقق</p><p>....................</p></div>
                </div>
            </div>
        ))}

        {investigation.recommendation && (
            <div className="mt-8 border-2 border-black p-4">
                <h3 className="font-bold mb-2">النتيجة والتوصيات:</h3>
                <p>{investigation.recommendation}</p>
            </div>
        )}
    </div>
);

// --- Printable Investigation Minutes ---
const PrintableInvestigationModal: React.FC<{ investigation: Investigation | null; onClose: () => void }> = ({ investigation, onClose }) => {
    if (!investigation) return null;
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
    
    return (
        <Modal isOpen={!!investigation} onClose={onClose} title="محضر تحقيق (نموذج رسمي)" size="lg">
            <div id="printable-investigation-content" className="p-10 bg-white text-slate-900 print:p-0" dir="rtl">
                <style>{`
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        #printable-investigation-content { p: 0 !important; font-size: 11pt !important; line-height: 1.6; }
                        .no-print { display: none !important; }
                    }
                    .doc-header { border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 2rem; }
                    .doc-title { text-align: center; font-size: 1.6rem; font-weight: 800; margin-bottom: 2rem; color: #1e293b; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; }
                    .info-section { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
                    .session-box { border: 1px solid #e2e8f0; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; page-break-inside: avoid; }
                    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 3rem; }
                    .signature-box { border-top: 1px dashed #94a3b8; padding-top: 1rem; text-align: center; }
                `}</style>

                <div className="doc-header flex justify-between items-start">
                    <div className="text-right">
                        <h2 className="text-xl font-bold">{OFFICE_NAME}</h2>
                        <p className="text-sm text-slate-500">إدارة الشؤون القانونية - قسم التحقيقات</p>
                    </div>
                    <div className="text-left">
                        <p className="font-bold">رقم الملف: {investigation.investigationNumber}</p>
                        <p className="text-xs text-slate-500">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</p>
                    </div>
                </div>

                <h1 className="doc-title">محضـر تحقيـق إداري رسمي</h1>

                <div className="info-section">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <p><strong>موضوع التحقيق:</strong> {investigation.subject}</p>
                        <p><strong>المحقق / اللجنة:</strong> {investigation.investigator}</p>
                        <p><strong>تاريخ بدء الإجراءات:</strong> {formatDate(investigation.startDate)}</p>
                        <p><strong>حالة الملف الحالية:</strong> {investigation.status}</p>
                        {investigation.relatedCaseIds && investigation.relatedCaseIds.length > 0 && (
                            <p className="col-span-2">
                                <strong>القضايا القائمة ذات الصلة:</strong>{' '}
                                {investigation.relatedCaseIds.map(id => {
                                    const c = initialCases.find(cx => cx.id === id);
                                    return c ? `${c.title} (${c.caseNumber})` : id;
                                }).join(' | ')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="font-bold text-lg mb-3 border-r-4 border-blue-600 pr-3 bg-blue-50 py-1">سجل الجلسات وأقوال الأطراف:</h3>
                    {investigation.sessions.map((session, idx) => (
                        <div key={session.id} className="session-box">
                            <div className="flex justify-between items-center mb-4 border-b pb-2">
                                <h4 className="font-bold text-blue-800">جلسة رقم ({idx + 1})</h4>
                                <span className="text-xs text-slate-500">{formatDate(session.sessionDate)}</span>
                            </div>
                            <p className="mb-4 text-sm font-medium">
                                إنه في يوم {new Date(session.sessionDate).toLocaleDateString('ar-EG', {weekday: 'long'})} الموافق {formatDate(session.sessionDate)}، 
                                تم استدعاء السيد/ <strong>{session.partyName}</strong> بصفته ({session.partyType})، وتم توجيه الأسئلة التالية:
                            </p>
                            
                            <div className="space-y-4 pr-4">
                                {session.questions.map((q, qIdx) => (
                                    <div key={q.id} className="text-sm">
                                        <p className="font-bold text-slate-800 mb-1">{q.questionText}</p>
                                        <p className="pr-4 border-r-2 border-slate-200 text-slate-700 italic">{q.answerText || '(لم يحرر إجابة)'}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="signature-grid mt-8 text-xs font-bold">
                                <div className="signature-box flex flex-col items-center">
                                    <p className="mb-2">توقيع المستجوب</p>
                                    {session.partySignature ? (
                                        <img src={session.partySignature} alt="Party Signature" className="h-12 object-contain" />
                                    ) : (
                                        <p className="mt-4 text-slate-300">....................</p>
                                    )}
                                </div>
                                <div className="signature-box flex flex-col items-center">
                                    <p className="mb-2">توقيع المحقق</p>
                                    {session.investigatorSignature ? (
                                        <img src={session.investigatorSignature} alt="Investigator Signature" className="h-12 object-contain" />
                                    ) : (
                                        <p className="mt-4 text-slate-300">....................</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {investigation.recommendation && (
                    <div className="mt-8 border-2 border-slate-800 p-6 rounded-xl bg-slate-50">
                        <h3 className="font-black text-lg mb-3 underline">النتائج والتوصيات النهائية:</h3>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{investigation.recommendation}</p>
                    </div>
                )}

                <div className="mt-20 pt-4 border-t border-slate-100 text-[9px] text-slate-400 text-center">
                    تم إصدار هذا المحضر إلكترونياً عبر منظومة عدالة القانونية - حقوق الطبع محفوظة
                </div>
            </div>

            <div className="flex justify-end p-4 border-t gap-3 no-print bg-slate-50">
                <Button variant="ghost" onClick={onClose}>إغلاق</Button>
                <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>بدء الطباعة</Button>
            </div>
        </Modal>
    );
};

const InvestigationsPage: React.FC = () => {
    const { addToast } = useToast();
    const [investigations, setInvestigations] = useState<Investigation[]>(mockInvestigations);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<InvestigationStatus | ''>('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isSummonsModalOpen, setIsSummonsModalOpen] = useState(false);
    const [editingInvestigation, setEditingInvestigation] = useState<Partial<Investigation> | null>(null);
    const [viewingInvestigation, setViewingInvestigation] = useState<Investigation | null>(null);
    const [printingInvestigation, setPrintingInvestigation] = useState<Investigation | null>(null);
    const [selectedEmployeeForSummons, setSelectedEmployeeForSummons] = useState<Employee | null>(null);

    const stats = useMemo(() => ({
        total: investigations.length,
        ongoing: investigations.filter(i => i.status === InvestigationStatus.ONGOING).length,
        closed: investigations.filter(i => i.status === InvestigationStatus.CLOSED).length,
        penaltyIssued: investigations.filter(i => (i as any).status === 'Penalty_Issued').length,
    }), [investigations]);

    const handleSummons = (inv: Investigation) => {
        const firstParty = inv.sessions[0]?.partyName;
        const emp = sampleEmployees.find(e => e.fullNameAr === firstParty) || sampleEmployees[0];
        setEditingInvestigation(inv);
        setSelectedEmployeeForSummons(emp);
        setIsSummonsModalOpen(true);
    };

    const handleReferral = (inv: Investigation) => {
        if (window.confirm('هل ترغب في إحالة ملف التحقيق هذا إلى اللجنة التأديبية لإصدار قرار جزائي؟')) {
            const updatedInv = { ...inv, status: 'Referred_to_Legal' as any };
            setInvestigations(prev => prev.map(i => i.id === inv.id ? updatedInv : i));
            addToast({ type: 'info', title: 'إحالة للتحقيق', message: 'تمت إحالة الملف إلى اللجنة التأديبية بنجاح.' });
        }
    };

    const filteredInvestigations = useMemo(() => {
        return investigations.filter(inv => 
            (inv.investigationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
             inv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
             inv.investigator.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (filterStatus ? inv.status === filterStatus : true)
        );
    }, [investigations, searchTerm, filterStatus]);

    const handleAdd = () => { setEditingInvestigation(null); setIsFormModalOpen(true); };
    const handleEdit = (inv: Investigation) => { setEditingInvestigation(inv); setIsFormModalOpen(true); };
    const handleDelete = (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف ملف التحقيق هذا؟')) {
            setInvestigations(prev => prev.filter(i => i.id !== id));
            addToast({ type: 'success', title: 'حذف ملف', message: 'تم حذف ملف التحقيق بنجاح.' });
        }
    };
    const handleFormSubmit = (data: Investigation) => {
        if (editingInvestigation?.id) {
            setInvestigations(prev => prev.map(i => i.id === editingInvestigation.id ? data : i));
            addToast({ type: 'success', title: 'تحديث بيانات', message: 'تم تحديث بيانات ملف التحقيق بنجاح.' });
        } else {
            setInvestigations(prev => [{...data, id: `inv-${Date.now()}`}, ...prev]);
            addToast({ type: 'success', title: 'إضافة تحقيق', message: 'تم فتح ملف تحقيق إداري جديد بنجاح.' });
        }
        setIsFormModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center print:hidden">
                <div className="flex items-center mb-4 md:mb-0">
                    <GavelIcon className="w-8 h-8 text-primary me-3" />
                    <h1 className="text-3xl font-bold text-primary-dark">إدارة التحقيقات الإدارية</h1>
                </div>
                <Button onClick={handleAdd} leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>فتح ملف تحقيق</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 print:hidden">
                <div className="lg:col-span-3 space-y-6">
                     {/* Dashboard Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <InvestigationStatCard title="إجمالي الملفات" count={stats.total} color="border-blue-500" icon={<FolderIcon className="w-5 h-5"/>}/>
                        <InvestigationStatCard title="تحقيقات جارية" count={stats.ongoing} color="border-yellow-500" icon={<ClockIcon className="w-5 h-5"/>}/>
                        <InvestigationStatCard title="تم إغلاقها" count={stats.closed} color="border-green-500" icon={<CheckCircleIcon className="w-5 h-5"/>}/>
                        <InvestigationStatCard title="أحيلت للجزاء" count={stats.penaltyIssued} color="border-rose-500" icon={<ScaleIcon className="w-5 h-5"/>}/>
                    </div>

                    <Card>
                        <div className="flex flex-col md:flex-row gap-4 mb-4 p-2 bg-gray-50 rounded">
                            <div className="relative flex-grow">
                                <Input placeholder="بحث برقم التحقيق، الموضوع، المحقق..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} containerClassName="mb-0 pl-10"/>
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3"/>
                            </div>
                            <Select options={[{value:'', label:'كل الحالات'}, ...investigationStatusOptions]} value={filterStatus} onChange={e => setFilterStatus(e.target.value as InvestigationStatus | '')} containerClassName="mb-0 w-full md:w-48"/>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['رقم التحقيق', 'الموضوع', 'المحقق', 'تاريخ البدء', 'الحالة', 'إجراءات'].map(h => <th key={h} className="px-3 py-2 text-right">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredInvestigations.map(inv => (
                                        <tr key={inv.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium">{inv.investigationNumber}</td>
                                            <td className="px-3 py-2 max-w-xs truncate">{inv.subject}</td>
                                            <td className="px-3 py-2">{inv.investigator}</td>
                                            <td className="px-3 py-2">{new Date(inv.startDate).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-3 py-2"><Badge text={inv.status} color={inv.status === InvestigationStatus.CLOSED ? 'green' : inv.status === InvestigationStatus.ONGOING ? 'yellow' : 'gray'} size="sm"/></td>
                                            <td className="px-3 py-2 space-x-1 space-x-reverse">
                                                <Button variant="ghost" size="sm" onClick={() => handleSummons(inv)} title="إصدار إعلان حضور"><UsersIcon className="w-4 text-indigo-600"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setViewingInvestigation(inv)} title="عرض وتعديل المحضر"><EyeIcon className="w-4 text-primary"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => setPrintingInvestigation(inv)} title="طباعة المحضر"><PrinterIcon className="w-4 text-slate-600"/></Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(inv)} title="تعديل البيانات"><PencilIcon className="w-4 text-yellow-600"/></Button>
                                                {inv.status !== InvestigationStatus.CLOSED && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleReferral(inv)} title="إحالة للجنة التأديبية"><ScaleIcon className="w-4 text-rose-600"/></Button>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)} className="text-danger"><TrashIcon className="w-4"/></Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredInvestigations.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">لا توجد ملفات تحقيق.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                
                {/* Legal Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                     <Card title="دليل التحقيق القانوني (قانون العمل)" className="bg-blue-50 border-blue-200">
                        <ul className="space-y-3 text-xs text-blue-900">
                            {KUWAIT_LABOR_LAW_INVESTIGATION_RULES.map((rule, idx) => (
                                <li key={idx} className="bg-white p-2 rounded border border-blue-100 shadow-sm">
                                    <strong className="block mb-1 text-blue-700">المادة {rule.article}:</strong>
                                    {rule.text}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card title="نصائح للمحقق">
                        <ul className="list-disc list-inside text-xs text-gray-600 space-y-2">
                            <li>يجب مواجهة العامل بالمخالفة كتابةً.</li>
                            <li>لا يعتد بأي تحقيق شفهي في المخالفات الجسيمة.</li>
                            <li>يجب توقيع العامل على كل صفحة من صفحات المحضر.</li>
                            <li>يراعى الحياد التام وعدم توجيه إجابات العامل.</li>
                        </ul>
                    </Card>
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingInvestigation?.id ? "تعديل ملف تحقيق" : "فتح ملف تحقيق جديد"} size="xl">
                <InvestigationForm initialData={editingInvestigation} onSubmit={handleFormSubmit} onCancel={() => setIsFormModalOpen(false)} />
            </Modal>

            {/* Viewing Modal with Print Capability */}
            <Modal isOpen={!!viewingInvestigation} onClose={() => setViewingInvestigation(null)} title={`ملف تحقيق: ${viewingInvestigation?.investigationNumber}`} size="full">
                {viewingInvestigation && (
                    <div className="flex flex-col h-full">
                        <div className="flex-grow overflow-auto p-4">
                             {/* Standard View */}
                            <div className="print:hidden space-y-6">
                                <Card title="البيانات الأساسية">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <p><strong>الموضوع:</strong> {viewingInvestigation.subject}</p>
                                        <p><strong>المحقق:</strong> {viewingInvestigation.investigator}</p>
                                        <p><strong>الحالة:</strong> {viewingInvestigation.status}</p>
                                        <p><strong>تاريخ البدء:</strong> {viewingInvestigation.startDate}</p>
                                    </div>
                                    
                                    {viewingInvestigation.relatedCaseIds && viewingInvestigation.relatedCaseIds.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <p className="text-xs font-bold text-gray-500 mb-2">القضايا المرتبطة:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {viewingInvestigation.relatedCaseIds.map(caseId => {
                                                    const relatedCase = initialCases.find(c => c.id === caseId);
                                                    return (
                                                        <div key={caseId} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                                                            <FolderIcon className="w-3 h-3" />
                                                            <span>{relatedCase?.title || 'قضية غير موجودة'}</span>
                                                            <span className="text-[10px] opacity-60">({relatedCase?.caseNumber})</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(viewingInvestigation)} leftIcon={<PencilIcon className="w-4"/>}>تعديل البيانات / إضافة جلسات</Button>
                                        <Button variant="secondary" size="sm" onClick={() => setPrintingInvestigation(viewingInvestigation)} leftIcon={<PrinterIcon className="w-4"/>}>عرض نسخة الطباعة</Button>
                                    </div>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-700">سجل الجلسات (للعرض فقط)</h3>
                                    {viewingInvestigation.sessions.map((session, idx) => (
                                        <Card key={session.id} title={`جلسة ${idx+1}: ${new Date(session.sessionDate).toLocaleDateString('ar-EG')} - ${session.partyName}`}>
                                            <div className="space-y-2 bg-gray-50 p-3 rounded">
                                                {session.questions.map(q => (
                                                    <div key={q.id} className="text-sm border-b pb-2 last:border-0">
                                                        <p className="font-bold text-primary-dark">{q.questionText}</p>
                                                        <p className="text-gray-700 mr-4">{q.answerText || '(لا توجد إجابة)'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    ))}
                                    {(!viewingInvestigation.sessions || viewingInvestigation.sessions.length === 0) && <p className="text-gray-500">لا توجد جلسات.</p>}
                                </div>
                            </div>
                            
                            {/* Hidden Print View */}
                            <InvestigationPrintView investigation={viewingInvestigation} />
                        </div>
                        <div className="p-4 border-t flex justify-end print:hidden">
                            <Button variant="outline" onClick={() => setViewingInvestigation(null)}>إغلاق</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <PrintableInvestigationModal investigation={printingInvestigation} onClose={() => setPrintingInvestigation(null)} />
            <SummonsModal 
                isOpen={isSummonsModalOpen} 
                onClose={() => setIsSummonsModalOpen(false)} 
                investigation={editingInvestigation as Investigation} 
                employee={selectedEmployeeForSummons} 
            />
        </div>
    );
};

export default InvestigationsPage;
