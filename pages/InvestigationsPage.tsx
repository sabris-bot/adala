import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { GavelIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, InformationCircleIcon, UsersIcon, CalendarDaysIcon, ClockIcon, PrinterIcon } from '../constants';
import { 
    Investigation, InvestigationSession, InvestigationQuestion, 
    InvestigationStatus, InvestigationPartyType 
} from '../types';
import { investigationStatusOptions, investigationPartyTypeOptions } from '../constants';
import { Badge } from '../components/ui/Badge';

// MOCK DATA (EXPANDED AND DIVERSIFIED)
const mockInvestigations: Investigation[] = [
    {
        id: 'inv-001',
        investigationNumber: 'INV-2024-001',
        subject: 'التحقيق في شكوى إفشاء أسرار العمل (قضية العميل س)',
        investigator: 'المحامي/ عبدالله الفهد (رئيس قسم الامتثال)',
        status: InvestigationStatus.ONGOING,
        startDate: '2024-08-11',
        createdAt: '2024-08-10',
        summary: "التحقيق لا يزال جاريًا. تم استجواب الموظفة المشكو بحقها والتي أنكرت التهمة، كما تم سماع شهادة زميلها التي جاءت في صالحها. الخطوة التالية هي فحص سجلات النظام والاتصالات.",
        recommendation: "استكمال إجراءات التحقيق الفني قبل إصدار توصية نهائية.",
        sessions: [
            {
                id: 'inv-001-s1',
                partyName: 'فاطمة علي حسين السيد',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-08-11',
                questions: [
                    { id: 'q1', questionText: 'هل قمتِ بمناقشة تفاصيل قضية العميل (س) مع أي طرف خارجي غير مصرح له؟', answerText: 'لا، لم أقم بذلك مطلقًا. جميع مناقشاتي كانت داخلية مع فريق العمل المعني بالقضية.', timestamp: '2024-08-11T10:15:00Z' },
                    { id: 'q2', questionText: 'هل تمانعين في فحص جهاز الكمبيوتر الخاص بكِ وسجل الاتصالات للتحقق من ذلك؟', answerText: 'لا أمانع، وأنا على استعداد تام للتعاون مع التحقيق لإثبات براءتي.', timestamp: '2024-08-11T10:30:00Z' },
                ]
            },
            {
                id: 'inv-001-s2',
                partyName: 'أحمد محمود مبارك الأنصاري',
                partyType: InvestigationPartyType.WITNESS,
                sessionDate: '2024-08-12',
                questions: [
                    { id: 'q3', questionText: 'بصفتك زميل عمل مباشر للسيدة فاطمة، هل لاحظت أي سلوك غير معتاد أو مثير للقلق من جانبها مؤخرًا؟', answerText: 'لا، على العكس، هي من أكثر الموظفين حرصًا على سرية المعلومات والالتزام بالسياسات.', timestamp: '2024-08-12T11:00:00Z' },
                ]
            }
        ]
    },
    {
        id: 'inv-002',
        investigationNumber: 'INV-2024-002',
        subject: 'التحقيق في واقعة إتلاف جهاز طابعة ليزرية في القسم القانوني',
        investigator: 'مدير الشؤون الإدارية',
        status: InvestigationStatus.CLOSED,
        startDate: '2024-07-20',
        endDate: '2024-07-25',
        summary: 'بعد مراجعة كاميرات المراقبة وسماع أقوال الموظفين، تبين أن إتلاف الطابعة كان نتيجة خطأ غير مقصود من الموظف (علي محمد جاسم) أثناء محاولته إصلاح انحشار الورق. لم يكن هناك نية للإتلاف.',
        recommendation: '1. إلزام الموظف بتحمل 50% من تكلفة إصلاح الطابعة.\n2. توجيه لفت نظر للموظف بعدم محاولة إصلاح المعدات المكتبية بنفسه مستقبلاً.\n3. إغلاق ملف التحقيق.',
        relatedDisciplinaryActionId: 'da-005-latenotice',
        createdAt: '2024-07-19',
        sessions: [
            {
                id: 'inv-002-s1',
                partyName: 'علي محمد جاسم',
                partyType: InvestigationPartyType.EMPLOYEE_UNDER_COMPLAINT,
                sessionDate: '2024-07-22',
                questions: [
                    {id: 'q2s1', questionText: 'ما هي معلوماتك عن واقعة تعطل الطابعة يوم 2024-07-19؟', answerText: 'كنت أحاول طباعة مستندات عاجلة وحصل انحشار للورق. حاولت سحب الورقة ولكنها تمزقت بالداخل، مما أدى إلى تعطل التروس الداخلية عن غير قصد مني.', timestamp: '2024-07-22T09:30:00Z'}
                ]
            },
            {
                id: 'inv-002-s2',
                partyName: 'سارة عبدالله (موظفة)',
                partyType: InvestigationPartyType.WITNESS,
                sessionDate: '2024-07-22',
                questions: [
                    {id: 'q2s2', questionText: 'هل شاهدتِ الواقعة؟', answerText: 'نعم، شاهدت زميلي علي وهو يحاول جاهدًا إصلاح الطابعة لطباعة مستندات هامة، ولم يبدو عليه أنه كان يقصد إتلافها.', timestamp: '2024-07-22T10:00:00Z'}
                ]
            }
        ],
    },
    {
        id: 'inv-003',
        investigationNumber: 'INV-2024-003',
        subject: 'التحقيق في شكوى بشأن مخالفة لائحة السلوك (استخدام غير لائق)',
        investigator: 'لجنة تحقيق',
        status: InvestigationStatus.CLOSED,
        startDate: '2024-06-10',
        endDate: '2024-06-12',
        summary: 'التحقيق بشأن استخدام أحد الموظفين لسيارة الشركة لأغراض شخصية. بعد التحقيق، لم يتم العثور على دليل قاطع يثبت الواقعة.',
        recommendation: 'حفظ التحقيق لعدم كفاية الأدلة، مع التنبيه على جميع الموظفين بضرورة الالتزام بلائحة استخدام مركبات الشركة وتعميمها مرة أخرى.',
        createdAt: '2024-06-09',
        sessions: []
    }
];

// Helper to format date
const formatDate = (dateString?: string, includeTime = false) => {
    if (!dateString) return '-';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      return new Date(dateString).toLocaleDateString('ar-EG', options);
    } catch (e) { return dateString; }
};

const InvestigationsPage: React.FC = () => {
    const [investigations, setInvestigations] = useState<Investigation[]>(mockInvestigations);
    const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null);

    const handleOpenInvestigation = (inv: Investigation) => {
        setCurrentInvestigation(inv);
        setIsManagementModalOpen(true);
    };

    const handleCreateNew = () => {
        const newInvestigation: Investigation = {
            id: `inv-${Date.now()}`,
            investigationNumber: `INV-${new Date().getFullYear()}-${String(investigations.length + 1).padStart(3, '0')}`,
            subject: '',
            investigator: '',
            status: InvestigationStatus.ONGOING,
            startDate: new Date().toISOString().split('T')[0],
            sessions: [],
            createdAt: new Date().toISOString()
        };
        setCurrentInvestigation(newInvestigation);
        setIsManagementModalOpen(true);
    };

    const handleSaveAndClose = (updatedInvestigation: Investigation) => {
        const exists = investigations.some(inv => inv.id === updatedInvestigation.id);
        if (exists) {
            setInvestigations(investigations.map(inv => inv.id === updatedInvestigation.id ? updatedInvestigation : inv));
        } else {
            setInvestigations([updatedInvestigation, ...investigations]);
        }
        setIsManagementModalOpen(false);
        setCurrentInvestigation(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("هل أنت متأكد من حذف ملف التحقيق هذا بالكامل؟ لا يمكن التراجع عن هذا الإجراء.")) {
            setInvestigations(investigations.filter(inv => inv.id !== id));
        }
    };

    const handlePrint = (investigation: Investigation) => {
        setCurrentInvestigation(investigation);
        setIsPrintModalOpen(true);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                    <GavelIcon className="w-8 h-8 text-primary me-3" />
                    <h1 className="text-3xl font-bold text-primary-dark">التحقيقات الإدارية</h1>
                </div>
                <Button onClick={handleCreateNew} leftIcon={<PlusCircleIcon className="w-5" />}>فتح ملف تحقيق جديد</Button>
            </div>
            
             <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-blue-600 me-3 mt-1 flex-shrink-0" />
                    <p className="text-sm text-blue-700 leading-relaxed">
                        هذه الوحدة مخصصة لإدارة التحقيقات الإدارية الداخلية بشكل منظم ومفصل، بما يحاكي إجراءات التحقيق الرسمية. يمكنك هنا توثيق محاضر التحقيق مع مختلف الأطراف (موظفين، شهود، إلخ)، وتسجيل الأسئلة والأجوبة بدقة، والخلوص إلى توصيات وقرارات مبنية على أسس سليمة.
                    </p>
                </div>
            </Card>

            <Card title="ملفات التحقيق">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {investigations.map(inv => (
                        <Card key={inv.id} title={inv.investigationNumber} className="shadow-md hover:shadow-lg transition-shadow">
                            <p className="font-semibold text-sm text-primary-dark truncate" title={inv.subject}>{inv.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">المحقق: {inv.investigator}</p>
                            <p className="text-xs text-gray-500">تاريخ البدء: {formatDate(inv.startDate)}</p>
                            <div className="mt-2"><Badge text={inv.status} color="blue" size="sm" /></div>
                            <div className="mt-4 pt-2 border-t flex justify-between items-center">
                                <Button variant="primary" size="sm" onClick={() => handleOpenInvestigation(inv)}>إدارة التحقيق</Button>
                                <div className="flex space-x-1 space-x-reverse">
                                    <Button variant="ghost" size="sm" onClick={() => handlePrint(inv)} title="طباعة"><PrinterIcon className="w-4 text-gray-600"/></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(inv.id)} className="text-danger" title="حذف"><TrashIcon className="w-4"/></Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                     {investigations.length === 0 && <p className="text-center text-gray-500 py-4 col-span-full">لا توجد ملفات تحقيق مسجلة.</p>}
                </div>
            </Card>

            {isManagementModalOpen && currentInvestigation && (
                <InvestigationManagementModal 
                    investigation={currentInvestigation}
                    onClose={() => setIsManagementModalOpen(false)}
                    onSave={handleSaveAndClose}
                    onPrint={handlePrint}
                />
            )}

            {isPrintModalOpen && currentInvestigation && (
                <PrintableInvestigation 
                    investigation={currentInvestigation}
                    onClose={() => setIsPrintModalOpen(false)}
                />
            )}
        </div>
    );
};

// --- Investigation Management Modal ---
interface InvestigationManagementModalProps {
    investigation: Investigation;
    onClose: () => void;
    onSave: (investigation: Investigation) => void;
    onPrint: (investigation: Investigation) => void;
}
const InvestigationManagementModal: React.FC<InvestigationManagementModalProps> = ({ investigation, onClose, onSave, onPrint }) => {
    const [currentData, setCurrentData] = useState<Investigation>(investigation);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(investigation.sessions[0]?.id || null);
    const [newQuestion, setNewQuestion] = useState('');

    const activeSession = useMemo(() => currentData.sessions.find(s => s.id === activeSessionId), [currentData, activeSessionId]);
    
    const handleAddSession = () => {
        const newSession: InvestigationSession = {
            id: `s-${Date.now()}`,
            partyName: '',
            partyType: InvestigationPartyType.WITNESS,
            sessionDate: new Date().toISOString().split('T')[0],
            questions: []
        };
        setCurrentData(prev => ({...prev, sessions: [...prev.sessions, newSession]}));
        setActiveSessionId(newSession.id);
    };

    const handleSessionChange = (sessionId: string, field: keyof InvestigationSession, value: any) => {
        setCurrentData(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === sessionId ? {...s, [field]: value} : s)
        }));
    };
    
    const handleAddQuestion = (sessionId: string) => {
        if (!newQuestion.trim()) return;
        const newQ: InvestigationQuestion = { id: `q-${Date.now()}`, questionText: newQuestion, timestamp: new Date().toISOString() };
        setCurrentData(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === sessionId ? {...s, questions: [...s.questions, newQ]} : s)
        }));
        setNewQuestion('');
    };

    const handleAnswerChange = (sessionId: string, questionId: string, answerText: string) => {
        setCurrentData(prev => ({
            ...prev,
            sessions: prev.sessions.map(s => s.id === sessionId ? {
                ...s,
                questions: s.questions.map(q => q.id === questionId ? {...q, answerText} : q)
            } : s)
        }));
    };
    
    const handleInvestigationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setCurrentData(prev => ({...prev, [e.target.name]: e.target.value}));
    };


    return (
        <Modal isOpen={true} onClose={onClose} title={`إدارة التحقيق رقم: ${currentData.investigationNumber}`} size="xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 max-h-[80vh]">
                {/* Left Panel: Sessions List */}
                <div className="md:col-span-3 space-y-2 overflow-y-auto pr-1">
                    <Button onClick={handleAddSession} size="sm" className="w-full" leftIcon={<PlusCircleIcon className="w-4"/>}>إضافة محضر تحقيق</Button>
                    {currentData.sessions.map(session => (
                        <div key={session.id} onClick={() => setActiveSessionId(session.id)}
                             className={`p-2 border rounded-md cursor-pointer ${activeSessionId === session.id ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <p className="font-semibold text-sm truncate">{session.partyName || 'محضر جديد'}</p>
                            <p className="text-xs">{session.partyType}</p>
                            <p className="text-xs opacity-80">{formatDate(session.sessionDate)}</p>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Details */}
                <div className="md:col-span-9 space-y-3 overflow-y-auto pr-2 border-r pr-2">
                    <Card title="بيانات التحقيق الأساسية" titleClassName="text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input label="موضوع التحقيق" name="subject" value={currentData.subject} onChange={handleInvestigationChange} />
                            <Input label="المحقق" name="investigator" value={currentData.investigator} onChange={handleInvestigationChange} />
                            <Input label="تاريخ البدء" name="startDate" type="date" value={currentData.startDate} onChange={handleInvestigationChange} />
                            <Select label="حالة التحقيق" name="status" value={currentData.status} options={investigationStatusOptions} onChange={handleInvestigationChange} />
                        </div>
                    </Card>

                    {activeSession ? (
                        <Card title="تفاصيل محضر التحقيق الحالي" titleClassName="text-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input label="اسم الحاضر" value={activeSession.partyName} onChange={(e) => handleSessionChange(activeSessionId!, 'partyName', e.target.value)} />
                                <Select label="صفة الحاضر" value={activeSession.partyType} options={investigationPartyTypeOptions} onChange={(e) => handleSessionChange(activeSessionId!, 'partyType', e.target.value)} />
                                <Input label="تاريخ المحضر" type="date" value={activeSession.sessionDate} onChange={(e) => handleSessionChange(activeSessionId!, 'sessionDate', e.target.value)} />
                            </div>
                            <div className="mt-4 pt-3 border-t">
                                <h4 className="text-xs font-semibold mb-2">الأسئلة والأجوبة (س/ج)</h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded">
                                    {activeSession.questions.map((q, index) => (
                                        <div key={q.id}>
                                            <p className="font-semibold text-sm">س{index + 1}: {q.questionText}</p>
                                            <TextArea placeholder="أدخل إجابة الحاضر هنا..." value={q.answerText || ''} onChange={(e) => handleAnswerChange(activeSessionId!, q.id, e.target.value)} rows={2} className="text-sm mt-1 bg-white" />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <Input containerClassName="flex-grow mb-0" placeholder="اكتب السؤال الجديد هنا..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)}/>
                                    <Button size="sm" onClick={() => handleAddQuestion(activeSessionId!)} disabled={!newQuestion.trim()}>إضافة سؤال</Button>
                                </div>
                            </div>
                        </Card>
                    ) : <p className="text-center text-gray-500 p-4">الرجاء اختيار أو إضافة محضر تحقيق.</p>}

                     <Card title="ملخص التحقيق النهائي والتوصية" titleClassName="text-sm">
                        <TextArea label="ملخص وقائع التحقيق" name="summary" value={currentData.summary || ''} onChange={handleInvestigationChange} rows={3}/>
                        <TextArea label="التوصية النهائية" name="recommendation" value={currentData.recommendation || ''} onChange={handleInvestigationChange} rows={3}/>
                     </Card>
                </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t">
                <Button variant="outline" onClick={() => onPrint(currentData)} leftIcon={<PrinterIcon className="w-4"/>}>طباعة التحقيق</Button>
                <div className="flex space-x-3 space-x-reverse">
                    <Button variant="outline" onClick={onClose}>إلغاء</Button>
                    <Button variant="primary" onClick={() => onSave(currentData)}>حفظ وإغلاق</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Printable Investigation Component ---
const PrintableInvestigation: React.FC<{
  investigation: Investigation;
  onClose: () => void;
}> = ({ investigation, onClose }) => {
    return (
        <Modal isOpen={true} onClose={onClose} title="معاينة طباعة التحقيق" size="xl">
            <div id="printable-investigation-content" className="p-4 bg-white text-black">
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold">محضر تحقيق إداري</h2>
                    <h3 className="text-lg">رقم التحقيق: {investigation.investigationNumber}</h3>
                </div>

                <div className="mb-4 p-3 border rounded">
                    <p><strong>موضوع التحقيق:</strong> {investigation.subject}</p>
                    <p><strong>المحقق:</strong> {investigation.investigator}</p>
                    <p><strong>تاريخ البدء:</strong> {formatDate(investigation.startDate)}</p>
                    <p><strong>الحالة:</strong> {investigation.status}</p>
                </div>

                {investigation.sessions.map((session, sessionIndex) => (
                    <div key={session.id} className="mb-4 page-break-before">
                        <h4 className="text-md font-bold bg-gray-200 p-2 rounded text-center">
                            محضر تحقيق بتاريخ {formatDate(session.sessionDate)} مع السيد/ة: {session.partyName} (صفته/ها: {session.partyType})
                        </h4>
                        <div className="p-2 border rounded-b">
                            {session.questions.map((q, qIndex) => (
                                <div key={q.id} className="mb-3 border-b pb-2 last:border-b-0">
                                    <p className="font-semibold"><strong>س{qIndex + 1}:</strong> {q.questionText}</p>
                                    <p><strong>ج{qIndex + 1}:</strong> {q.answerText || '(لم تتم الإجابة بعد)'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {investigation.summary && (
                    <div className="mt-4">
                        <h4 className="text-md font-bold">ملخص وقائع التحقيق:</h4>
                        <pre className="whitespace-pre-wrap font-sans p-2 border rounded bg-gray-50">{investigation.summary}</pre>
                    </div>
                )}
                {investigation.recommendation && (
                    <div className="mt-4">
                        <h4 className="text-md font-bold">التوصية النهائية:</h4>
                        <pre className="whitespace-pre-wrap font-sans p-2 border rounded bg-gray-50">{investigation.recommendation}</pre>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-dashed border-gray-400 text-sm">
                    <p className="mb-8">إقرار بصحة الأقوال الواردة في هذا المحضر.</p>
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div>
                            <p>توقيع الشخص الذي تم التحقيق معه:</p>
                            <p className="mt-12">........................................</p>
                            <p>الاسم: ........................................</p>
                        </div>
                         <div>
                            <p>توقيع المحقق:</p>
                            <p className="mt-12">........................................</p>
                            <p>الاسم: {investigation.investigator || '........................................'}</p>
                        </div>
                         <div>
                            <p>توقيع للاعتماد:</p>
                            <p className="mt-12">........................................</p>
                            <p>الاسم/المنصب: مدير الشؤون القانونية</p>
                        </div>
                    </div>
                </div>
            </div>
             <div className="flex justify-end space-x-2 mt-4 p-3 border-t bg-gray-50 print-hide-in-modal">
                <Button variant="outline" onClick={onClose}>إغلاق المعاينة</Button>
                <Button onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4"/>}>طباعة</Button>
            </div>
        </Modal>
    );
};


export default InvestigationsPage;
