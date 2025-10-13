
import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { MagnifyingGlassIcon, InformationCircleIcon, BriefcaseIcon, UsersIcon, FolderIcon } from '../constants';
import { Case, CaseStatus, CaseMainType, RiskLevel, CasePriority, CourtLevel } from '../types';

type SearchType = 'caseNumber' | 'civilId' | 'partyName';

const mockSearchResults: Partial<Case>[] = [
    { id: 'moj-res-1', caseNumber: 'CML/2024/101-MOJ', title: 'مطالبة تجارية', clientName: 'شركة الأمل للتجارة', opposingPartyName: 'شركة المقاولون المتحدون', status: CaseStatus.IN_PROGRESS, courtName: 'المحكمة الكلية - الدائرة التجارية الخامسة', filingDate: '2024-03-15' },
    { id: 'moj-res-2', caseNumber: 'LAB/2024/055-MOJ', title: 'دعوى عمالية', clientName: 'سارة عبدالله أحمد', opposingPartyName: 'شركة الخدمات الحديثة', status: CaseStatus.OPEN, courtName: 'المحكمة الكلية - الدائرة العمالية الأولى', filingDate: '2024-05-10' },
    { id: 'moj-res-3', caseNumber: 'RE-APP/2024/088-MOJ', title: 'استئناف حكم إخلاء', clientName: 'مجموعة الأنوار العقارية', opposingPartyName: 'المستأجر (س)', status: CaseStatus.APPEALED, courtName: 'محكمة الاستئناف - الدائرة الإيجارية الثانية', filingDate: '2024-03-01' },
];

const MojSearchPage: React.FC = () => {
    const [searchType, setSearchType] = useState<SearchType>('caseNumber');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [caseYear, setCaseYear] = useState<string>(new Date().getFullYear().toString());
    const [courtLevels, setCourtLevels] = useState<string[]>(['FIRST_INSTANCE']);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [results, setResults] = useState<Partial<Case>[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setError("يرجى إدخال قيمة للبحث.");
            return;
        }
        setIsLoading(true);
        setResults(null);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real scenario, you'd make an API call here.
        // For now, we'll just return the mock results if the search query is not empty.
        setResults(mockSearchResults);
        setIsLoading(false);
    };
    
    const handleImport = (caseData: Partial<Case>) => {
        alert(`تم استيراد القضية رقم ${caseData.caseNumber} بنجاح إلى النظام (محاكاة).`);
    };

    const searchTypeOptions = [
        { value: 'caseNumber', label: 'البحث برقم القضية الآلي' },
        { value: 'civilId', label: 'البحث بالرقم المدني لأحد الأطراف' },
        { value: 'partyName', label: 'البحث باسم أحد الأطراف' },
    ];
    
    const courtLevelOptions = [
        { value: 'FIRST_INSTANCE', label: 'أول درجة' },
        { value: 'APPEALS_COURT', label: 'الاستئناف' },
        { value: 'CASSATION_COURT', label: 'التمييز' },
        { value: 'ADMINISTRATIVE_COURT', label: 'الإدارية' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <MagnifyingGlassIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">بحث متقدم في بوابة العدل (محاكاة)</h1>
            </div>

            <Card className="bg-primary-light/5 dark:bg-dm-card/30">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-primary me-3 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="text-md font-semibold text-primary-dark mb-1">وصول مباشر لمعلومات القضايا</h3>
                        <p className="text-sm text-neutral-text dark:text-dm-text-light leading-relaxed">
                            توفر هذه الواجهة محاكاة لعملية البحث المباشر في بوابة وزارة العدل. يمكنك البحث عن القضايا باستخدام معايير مختلفة واستيراد بياناتها مباشرة إلى نظام "عدالة" لتوفير الوقت وتقليل الأخطاء اليدوية.
                            <br/>
                            <strong>ملاحظة:</strong> هذه الميزة تعتمد على توفر واجهة برمجة تطبيقات (API) رسمية من وزارة العدل، وهي حاليًا لأغراض العرض التوضيحي فقط.
                        </p>
                    </div>
                </div>
            </Card>

            <Card title="معايير البحث">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="نوع البحث" options={searchTypeOptions} value={searchType} onChange={(e) => setSearchType(e.target.value as SearchType)} />
                        <Input label="قيمة البحث" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} required 
                               placeholder={
                                   searchType === 'caseNumber' ? 'مثال: 2024/1234' : 
                                   searchType === 'civilId' ? 'أدخل الرقم المدني...' : 
                                   'أدخل اسم الطرف...'
                               }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">درجة التقاضي</label>
                        <div className="flex flex-wrap gap-4">
                            {courtLevelOptions.map(opt => (
                                <label key={opt.value} className="flex items-center">
                                    <input type="checkbox" className="form-checkbox" value={opt.value} 
                                           checked={courtLevels.includes(opt.value)}
                                           onChange={(e) => {
                                               const { value, checked } = e.target;
                                               setCourtLevels(prev => checked ? [...prev, value] : prev.filter(v => v !== value));
                                           }}
                                    />
                                    <span className="ms-2">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-1/4">
                        <Input label="سنة القضية (اختياري)" value={caseYear} onChange={(e) => setCaseYear(e.target.value)} placeholder="مثال: 2024" />
                    </div>
                    {error && <p className="text-sm text-danger">{error}</p>}
                    <div className="flex justify-end">
                        <Button type="submit" size="lg" isLoading={isLoading} disabled={isLoading} leftIcon={!isLoading ? <MagnifyingGlassIcon className="w-5"/> : undefined}>
                            {isLoading ? 'جاري البحث...' : 'بحث'}
                        </Button>
                    </div>
                </form>
            </Card>

            {isLoading && (
                <Card>
                    <div className="flex flex-col items-center justify-center p-10">
                        <LoadingSpinner size="lg" />
                        <p className="mt-4 text-primary-dark">جاري الاتصال ببوابة العدل والبحث عن النتائج...</p>
                    </div>
                </Card>
            )}

            {results && (
                <Card title={`نتائج البحث (${results.length} نتائج)`}>
                    {results.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">
                            <FolderIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                            <p>لم يتم العثور على أية قضايا تطابق معايير البحث.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {results.map(res => (
                                <Card key={res.id} className="bg-gray-50 hover:shadow-md transition-shadow">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                                        <div><p className="font-semibold text-primary">{res.caseNumber}</p><p className="text-xs text-gray-500">{res.title}</p></div>
                                        <div><p className="font-semibold">الأطراف</p><p className="text-xs">{res.clientName} ضد {res.opposingPartyName}</p></div>
                                        <div><p className="font-semibold">المحكمة</p><p className="text-xs">{res.courtName}</p></div>
                                        <div><p className="font-semibold">الحالة</p><p className="text-xs">{res.status}</p></div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t flex justify-end">
                                        <Button size="sm" onClick={() => handleImport(res)} leftIcon={<BriefcaseIcon className="w-4"/>}>
                                            استيراد إلى النظام
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card>
            )}

        </div>
    );
};

export default MojSearchPage;
