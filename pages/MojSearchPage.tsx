
import React, { useState, useMemo } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
    MagnifyingGlassIcon, InformationCircleIcon, BriefcaseIcon, UsersIcon, 
    FolderIcon, BuildingLibraryIcon, IdentificationIcon, ArrowPathIcon, 
    CheckCircleIcon, ClockIcon, EyeIcon, ScaleIcon, HomeIcon, 
    ArrowDownTrayIcon, ExclamationTriangleIcon
} from '../constants';
import { CaseStatus } from '../types';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

// --- Types ---
type SearchTab = 'case_no' | 'civil_id' | 'party_name' | 'experts';

interface MojSearchResult {
    id: string;
    automatedNumber: string; // الرقم الآلي
    caseNumber: string; // رقم القضية في المحكمة
    year: string;
    courtName: string;
    courtBranch?: string; // قصر العدل، الفروانية، الرقعي...
    circuit: string; // الدائرة
    caseType: string;
    status: string;
    parties: { name: string; role: string; civilId?: string; lawyer?: string }[];
    lastAction: string;
    lastActionDate: string;
    nextHearingDate?: string;
    nextHearingLocation?: string;
    judge?: string;
    totalJudgements?: number;
}

// --- Mock Data ---
const mockMojData: MojSearchResult[] = [
    {
        id: 'moj-101',
        automatedNumber: '20240015678',
        caseNumber: '101/2024 تجاري مدني كلي',
        year: '2024',
        courtName: 'المحكمة الكلية',
        courtBranch: 'قصر العدل',
        circuit: 'تجاري مدني كلي / 5',
        caseType: 'مطالبة مالية',
        status: 'متداولة',
        parties: [
            { name: 'شركة الأمل للتجارة العامة', role: 'مدعي', lawyer: 'أ. صبري أحمد' },
            { name: 'مؤسسة البناء الحديث', role: 'مدعى عليه' }
        ],
        lastAction: 'تأجيل لتقديم المستندات',
        lastActionDate: '2024-05-15',
        nextHearingDate: '2026-05-20',
        nextHearingLocation: 'الدور الرابع - قاعة 15',
        judge: 'المستشار/ خالد الفهد',
        totalJudgements: 0
    },
    {
        id: 'moj-102',
        automatedNumber: '20230099887',
        caseNumber: '55/2023 عمالي',
        year: '2023',
        courtName: 'محكمة حولي',
        courtBranch: 'مجمع محاكم حولي',
        circuit: 'عمالي / 2',
        caseType: 'مستحقات عمالية',
        status: 'محكومة',
        parties: [
            { name: 'سارة عبدالله أحمد', role: 'مدعي', civilId: '290010101234' },
            { name: 'شركة الخدمات اللوجستية', role: 'مدعى عليه' }
        ],
        lastAction: 'حكم قطعي بالرفض',
        lastActionDate: '2024-02-10',
        judge: 'المستشار/ علي حسين',
        totalJudgements: 1
    },
    {
        id: 'moj-103',
        automatedNumber: '20240055443',
        caseNumber: '88/2024 إيجارات',
        year: '2024',
        courtName: 'محكمة الاستئناف',
        courtBranch: 'قصر العدل',
        circuit: 'إيجارات / 1',
        caseType: 'إخلاء لعدم سداد الأجرة',
        status: 'مستأنفة',
        parties: [
            { name: 'مجموعة الأنوار العقارية', role: 'مستأنف' },
            { name: 'محمد جاسم (مستأجر)', role: 'مستأنف ضده', civilId: '280050512345' }
        ],
        lastAction: 'حجز للحكم',
        lastActionDate: '2024-05-20',
        nextHearingDate: '2026-06-30',
        judge: 'المستشار/ ناصر الصالح'
    },
    {
        id: 'moj-105',
        automatedNumber: '2024112233',
        caseNumber: '990/2024 تنفيذ',
        year: '2024',
        courtName: 'إدارة التنفيذ',
        courtBranch: 'الفروانية',
        circuit: 'تنفيذ مدني / 12',
        caseType: 'تنفيذ حكم مالي',
        status: 'قيد التنفيذ',
        parties: [
            { name: 'بنك الكويت الدولي', role: 'طالب تنفيذ' },
            { name: 'يوسف العلي', role: 'منفذ ضده', civilId: '277112200556' }
        ],
        lastAction: 'إصدار أمر حجز',
        lastActionDate: '2024-04-12',
        judge: 'المستشار/ فهد العتيبي'
    }
];

const mockSearchHistory = [
    { query: '20240015678', type: 'رقم آلي', date: '2024-05-20' },
    { query: '290010101234', type: 'رقم مدني', date: '2024-05-18' },
    { query: 'شركة الأمل', type: 'اسم طرف', date: '2024-05-15' },
    { query: '990/2024', type: 'رقم قضية', date: '2024-05-10' },
];

// --- Components ---

const SearchResultModal: React.FC<{ result: MojSearchResult | null; onClose: () => void; onImport: (res: MojSearchResult) => void }> = ({ result, onClose, onImport }) => {
    if (!result) return null;

    return (
        <Modal isOpen={!!result} onClose={onClose} title="تفاصيل المعاملة القضائية" size="lg">
            <div className="space-y-4 p-2 max-h-[80vh] overflow-y-auto scrollbar-hide">
                <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                       <BuildingLibraryIcon className="w-32 h-32 text-primary" />
                   </div>
                   <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">الرقم الآلي (Automated #)</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-black text-primary">{result.automatedNumber}</span>
                                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(result.automatedNumber)} className="p-1"><FolderIcon className="w-3 h-3"/></Button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم القضية</span>
                            <p className="font-bold text-gray-800">{result.caseNumber}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الموسم القضائي</span>
                            <p className="font-bold text-gray-800">{result.year}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الوضعية الحالية</span>
                            <div>
                                <Badge 
                                    text={result.status} 
                                    variant={result.status === 'متداولة' || result.status === 'قيد التنفيذ' ? 'success' : 'secondary'} 
                                    size="sm"
                                />
                            </div>
                        </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-gray-100 shadow-sm" title="بيانات الدائرة والجهـة" icon={<ScaleIcon className="w-5 h-5 text-accent"/>}>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-bold">المحكمة المختصة</span>
                                <span className="text-sm font-black text-gray-800">{result.courtName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-bold">فرع المحكمة</span>
                                <span className="text-sm font-black text-gray-800">{result.courtBranch || '---'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500 font-bold">الدائرة القضائية</span>
                                <span className="text-sm font-black text-gray-800">{result.circuit}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-500 font-bold">القاضي / المستشار</span>
                                <span className="text-sm font-black text-primary">{result.judge || 'غير معلن'}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-gray-100 shadow-sm" title="سجل التحديثات الإجرائية" icon={<ArrowPathIcon className="w-5 h-5 text-primary"/>}>
                        <div className="space-y-3">
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <span className="text-[10px] font-black text-gray-400 block mb-1">آخـر إجراء مسجل</span>
                                <p className="text-sm font-black text-gray-800">{result.lastAction}</p>
                                <div className="text-[10px] text-primary mt-1 font-bold flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3"/> تم بتاريخ: {result.lastActionDate}
                                </div>
                            </div>
                            
                            {result.nextHearingDate && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                    <span className="text-[10px] font-black text-blue-400 block mb-1">الجلسة القادمة المقررة</span>
                                    <p className="text-sm font-black text-blue-900">{result.nextHearingDate}</p>
                                    <div className="text-[10px] text-blue-500 mt-1 font-bold flex items-center gap-1">
                                        <HomeIcon className="w-3 h-3"/> {result.nextHearingLocation || 'قاعة الجلسات'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <Card title="أطراف النزاع والتمثيل القانوني" icon={<UsersIcon className="w-5 h-5 text-gray-400"/>}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-right">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-black text-gray-400">الاسم / الصفة</th>
                                    <th className="px-4 py-3 font-black text-gray-400 text-center">الرقم المدني</th>
                                    <th className="px-4 py-3 font-black text-gray-400 text-left">المحامي الوكيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {result.parties.map((party, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <div className="font-black text-gray-800">{party.name}</div>
                                            <div className="text-[10px] text-gray-400 font-bold">{party.role}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-gray-500">
                                            {party.civilId || '---'}
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            {party.lawyer ? (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-bold">{party.lawyer}</span>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">بدون تمثيل</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t mt-4">
                    <p className="text-[10px] text-gray-400 font-bold max-w-xs text-center md:text-right">
                        * البيانات أعلاه مستخرجة من الأنظمة التقنية التابعة لوزارة العدل وتخضع للتحديث الدوري.
                    </p>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Button variant="outline" fullWidth onClick={onClose} className="rounded-xl font-bold">إلغاء</Button>
                        <Button variant="primary" fullWidth onClick={() => { onImport(result); onClose(); }} className="rounded-xl shadow-lg shadow-primary/20 font-bold" leftIcon={<ArrowDownTrayIcon className="w-5 h-5"/>}>
                            أرشفة واستيراد للبرنامج
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const MojSearchPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SearchTab>('case_no');
    
    // Inputs
    const [caseNo, setCaseNo] = useState('');
    const [caseYear, setCaseYear] = useState(new Date().getFullYear().toString());
    const [courtType, setCourtType] = useState('1'); 
    const [courtBranch, setCourtBranch] = useState('0'); // 0: All, 1: Asima, 2: Hawally, 3: Farwaniya...
    const [civilId, setCivilId] = useState('');
    const [partyName, setPartyName] = useState('');
    const [captcha, setCaptcha] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<MojSearchResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedResult, setSelectedResult] = useState<MojSearchResult | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setResults(null);
        setError(null);
        setIsLoading(true);

        // Validation logic...
        if (activeTab === 'case_no' && !caseNo) { setError('يرجى إدخال رقم القضية أو الرقم الآلي.'); setIsLoading(false); return; }
        if (activeTab === 'civil_id' && civilId.length !== 12) { setError('يرجى إدخال رقم مدني صحيح (12 خانة).'); setIsLoading(false); return; }
        if (activeTab === 'party_name' && partyName.length < 3) { setError('يرجى كتابة 3 أحرف على الأقل من الاسم للبحث.'); setIsLoading(false); return; }
        if (!captcha) { setError('يجب إدخال رمز التحقق (Captcha) للمتابعة.'); setIsLoading(false); return; }

        setTimeout(() => {
            let filtered = [];
            if (activeTab === 'case_no') {
                filtered = mockMojData.filter(r => r.caseNumber.includes(caseNo) || r.automatedNumber.includes(caseNo));
            } else if (activeTab === 'civil_id') {
                filtered = mockMojData.filter(r => r.parties.some(p => p.civilId === civilId));
            } else if (activeTab === 'party_name') {
                filtered = mockMojData.filter(r => r.parties.some(p => p.name.includes(partyName)));
            } else {
                filtered = mockMojData.filter(r => r.caseNumber.includes('تنفيذ'));
            }

            if (filtered.length > 0) {
                setResults(filtered);
            } else {
                if (caseNo === '1' || partyName.includes('ال')) setResults(mockMojData);
                else setResults([]);
            }
            setIsLoading(false);
        }, 1200);
    };

    const handleImport = (caseData: MojSearchResult) => {
        alert(`تم جلب بيانات القضية ${caseData.caseNumber} وحفظها في قاعدة البيانات المحلية بنجاح.`);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex items-center">
                    <div className="p-3 bg-primary/10 rounded-2xl me-4">
                        <BuildingLibraryIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">بوابة العدل الكويتية - الاستعلام القضائي</h1>
                        <p className="text-sm text-gray-500 font-bold mt-1">واجهة الربط المتقدمة للبحث في السجلات المركزية لوزارة العدل</p>
                    </div>
                </div>
                <div className="bg-success/10 px-4 py-2 rounded-xl flex items-center gap-2 border border-success/20">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse"/>
                    <span className="text-[11px] font-black text-success">حالة الاتصال: متصل بالبوابة</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Search Panel */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Tabs Navigation */}
                        <div className="flex bg-gray-50/50 p-2 gap-2 border-b border-gray-100">
                            {[
                                { id: 'case_no', label: 'الرقم الآلي والقضية', icon: BriefcaseIcon },
                                { id: 'civil_id', label: 'الرقم المدني للطرف', icon: IdentificationIcon },
                                { id: 'party_name', label: 'اسم الخصم / الشركة', icon: UsersIcon },
                                { id: 'experts', label: 'قضايا الخبراء', icon: ScaleIcon },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as SearchTab); setResults(null); setError(null); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-white text-primary shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-gray-300'}`}/>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleSearch} className="space-y-6">
                                {activeTab === 'case_no' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Select label="درجة التقاضي" value={courtType} onChange={(e) => setCourtType(e.target.value)} 
                                            options={[
                                                {value: '1', label: 'المحكمة الكلية'},
                                                {value: '2', label: 'محكمة الاستئناف'},
                                                {value: '3', label: 'محكمة التمييز'},
                                                {value: '5', label: 'الأسرة'},
                                            ]} 
                                        />
                                        <Select label="الموسم القضائي" value={caseYear} onChange={(e) => setCaseYear(e.target.value)} 
                                            options={Array.from({length: 20}, (_, i) => ({value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString()}))} 
                                        />
                                        <Input label="رقم القضية / الآلي" value={caseNo} onChange={(e) => setCaseNo(e.target.value)} placeholder="مثال: 2024..." />
                                    </div>
                                )}

                                {activeTab === 'civil_id' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="رقم الهوية المدنية" value={civilId} onChange={(e) => setCivilId(e.target.value)} placeholder="12 خانة رقمية..." maxLength={12} />
                                        <Select label="صفة الطرف المطلوب" options={[{value: '', label: 'كافة الصفات'}, {value: '1', label: 'مدعي / مستأنف'}, {value: '2', label: 'مدعى عليه / مستأنف ضده'}]} />
                                    </div>
                                )}

                                {activeTab === 'party_name' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="اسم الطرف / المنشأة" value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder="اكتب 3 أحرف " />
                                        <Select label="محافظة النطاق القضائي" options={[
                                            {value: '0', label: 'كافة المحافظات'},
                                            {value: '1', label: 'العاصمة'},
                                            {value: '2', label: 'حولي'},
                                            {value: '3', label: 'الفروانية'},
                                            {value: '4', label: 'الجهراء'},
                                            {value: '5', label: 'الأحمدي/مبارك الكبير'}
                                        ]} />
                                    </div>
                                )}

                                {activeTab === 'experts' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="رقم ملف الخبراء" placeholder="أدخل رقم الملف السنوي..." />
                                        <Select label="جهة الخبرة" options={[
                                            {value: '1', label: 'إدارة الخبراء - الرقعي'},
                                            {value: '2', label: 'إدارة الخبراء - حولي'},
                                        ]} />
                                    </div>
                                )}

                                {/* Captcha */}
                                <div className="flex flex-col md:flex-row items-end gap-6 pt-4 border-t border-gray-50">
                                    <div className="w-full md:w-1/3 p-4 bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/10 via-gray-400/10 to-gray-100/10 -rotate-45 scale-150 animate-pulse"/>
                                        <span className="text-2xl font-mono font-black italic tracking-[0.5em] text-gray-400 select-none drop-shadow-sm blur-[0.5px]">88H9P</span>
                                        <button className="absolute right-2 top-2 p-1 hover:bg-gray-200 rounded-lg text-gray-400"><ArrowPathIcon className="w-4 h-4"/></button>
                                    </div>
                                    <div className="flex-grow w-full">
                                        <Input label="أدخل رمز التحقق البصري" value={captcha} onChange={(e) => setCaptcha(e.target.value)} placeholder="أرقام وحروف الرمز..." containerClassName="mb-0" />
                                    </div>
                                    <div className="w-full md:w-auto">
                                        <Button type="submit" size="lg" fullWidth isLoading={isLoading} className="rounded-2xl h-[52px] px-10 shadow-lg shadow-primary/20 font-black" leftIcon={!isLoading ? <MagnifyingGlassIcon className="w-5 h-5"/> : undefined}>
                                            بدء البحث
                                        </Button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-shake">
                                        <ExclamationTriangleIcon className="w-5 h-5"/> {error}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    {/* Results Table */}
                    {results && (
                        <div className="animate-fadeIn">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-black text-gray-800">سجل نتائج الاستعلام ({results.length})</h3>
                                {results.length > 0 && <Button variant="ghost" size="sm" className="text-primary font-bold">تصدير النتائج لملف CSV</Button>}
                            </div>
                            
                            {results.length === 0 ? (
                                <div className="bg-white rounded-3xl p-20 border border-dashed border-gray-200 text-center">
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FolderIcon className="w-10 h-10 text-gray-300"/>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-700">عفواً، لا توجد تطابقات</h4>
                                    <p className="text-sm text-gray-500 mt-2">تأكد من اختيار الموسم القضائي الصحيح أو مراجعة الرقم الآلي</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {results.map(res => (
                                        <div 
                                            key={res.id} 
                                            onClick={() => setSelectedResult(res)}
                                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
                                        >
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-black text-gray-500 uppercase tracking-tighter">رقم القضية</span>
                                                        <h4 className="font-black text-lg text-primary group-hover:underline">{res.caseNumber}</h4>
                                                        <Badge text={res.status} variant={res.status === 'متداولة' ? 'success' : 'secondary'} size="sm" />
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-gray-500">
                                                        <span className="flex items-center gap-1"><BuildingLibraryIcon className="w-3.5 h-3.5"/> {res.courtName}</span>
                                                        <span className="flex items-center gap-1"><HomeIcon className="w-3.5 h-3.5"/> {res.courtBranch}</span>
                                                        <span className="flex items-center gap-1 font-mono">الرقم الآلي: {res.automatedNumber}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full md:w-auto text-right md:text-left pt-3 md:pt-0 border-t md:border-0 border-gray-50">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">آخر تحديث إجرائي</div>
                                                    <p className="text-sm font-black text-gray-800">{res.lastAction}</p>
                                                    <p className="text-[11px] text-gray-400 font-bold">{res.lastActionDate}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4 pt-4 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-[11px] font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-full"><span className="text-primary font-black">الطرف 1:</span> {res.parties[0].name}</span>
                                                    <span className="text-[11px] font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-full"><span className="text-primary font-black">الطرف 2:</span> {res.parties[1]?.name || '...'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary font-black text-xs">
                                                    عرض كافة التفاصيل <EyeIcon className="w-4 h-4"/>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Quick Guide Card */}
                    <div className="bg-gradient-to-br from-primary to-primary-dark p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                        <ScaleIcon className="absolute -bottom-8 -left-8 w-48 h-48 opacity-10 rotate-12" />
                        <h4 className="text-xl font-black mb-4 flex items-center gap-2">
                            <InformationCircleIcon className="w-6 h-6" /> دليل الاستخدام
                        </h4>
                        <div className="space-y-4 text-sm opacity-90 leading-relaxed font-bold">
                            <div className="flex gap-3">
                                <span className="bg-white/20 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">1</span>
                                <p>اختر نوع الاستعلام المناسب من التبويبات المتاحة.</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="bg-white/20 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">2</span>
                                <p>أدخل البيانات المطلوبة بدقة (الرقم الآلي يتكون من 11 خانة).</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="bg-white/20 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0">3</span>
                                <p>بعد ظهور النتيجة، يمكنك "أرشفة" القضية لتضاف فوريّاً لنظام المكتب.</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/10 text-[11px] font-bold text-white/60">
                            * الربط يتم عبر القنوات الآمنة لوزارة العدل مباشرة.
                        </div>
                    </div>

                    {/* Search History */}
                    <Card title="سجل الاستعلامات الأخيرة" icon={<ClockIcon className="w-5 h-5 text-gray-400"/>}>
                        <div className="space-y-4">
                            {mockSearchHistory.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            <MagnifyingGlassIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-700 group-hover:text-primary transition-colors">{item.query}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{item.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-400 font-bold">{item.date}</p>
                                        <button 
                                            className="text-[10px] text-primary font-black hover:underline mt-1" 
                                            onClick={() => {
                                                if (item.type === 'رقم آلي') { setActiveTab('case_no'); setCaseNo(item.query); }
                                                else if (item.type === 'رقم مدني') { setActiveTab('civil_id'); setCivilId(item.query); }
                                                else { setActiveTab('party_name'); setPartyName(item.query); }
                                            }}
                                        >تكرار البحث</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* System Tips */}
                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
                        <h5 className="text-sm font-black text-blue-900 mb-2">تلميـح تقني</h5>
                        <p className="text-xs text-blue-700 leading-relaxed font-bold">يمكنك البحث باستخدام "الرقم الآلي الموحد" للحصول على أدق النتائج، حيث يربط هذا الرقم بين كافة درجات التقاضي لنفس النزاع.</p>
                    </div>
                </div>
            </div>

            <SearchResultModal 
                result={selectedResult} 
                onClose={() => setSelectedResult(null)} 
                onImport={handleImport} 
            />
        </div>
    );
};

export default MojSearchPage;
