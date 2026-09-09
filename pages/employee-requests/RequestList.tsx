import React from 'react';
import { 
    Search, AlertTriangle, Eye, Printer, Trash,
    Calendar, Clock, FileText, Award, UserCog, Coins, GraduationCap, MapPin, ArrowLeftRight, ChevronUp, CheckSquare, FileCheck
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmployeeRequest, RequestType, statusTranslations } from './request-types';

interface RequestListProps {
    requests?: EmployeeRequest[];
    filteredRequests: EmployeeRequest[];
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    filterType: string;
    setFilterType: (val: string) => void;
    filterStatus: string;
    setFilterStatus: (val: string) => void;
    onViewDetails: (req: EmployeeRequest) => void;
    onViewPrint: (req: EmployeeRequest) => void;
    onDeleteRequest: (id: string, refNum: string) => void;
}

// Map English RequestType strings to beautiful, authoritative Arabic translations
const getArabicRequestType = (type: string): string => {
    switch (type) {
        case RequestType.LEAVE: return 'طلب إجازة دورية';
        case RequestType.PERMISSION: return 'طلب استئذان غياب';
        case RequestType.SALARY_CERTIFICATE: return 'شهادة تعريف راتب كويتي';
        case RequestType.CERTIFICATE: return 'طلب شهادة لمن يهمه الأمر';
        case RequestType.DATA_UPDATE: return 'تعديل البيانات القانونية';
        case RequestType.LOAN: return 'طلب قرض مالي للموظف';
        case RequestType.ADVANCE: return 'طلب سلفة راتب مقدمة';
        case RequestType.TRAINING: return 'طلب دورة تدريبية مهنية';
        case RequestType.DEPUTATION: return 'طلب انتداب ومهمة خارجية';
        case RequestType.TRANSFER: return 'طلب نقل بين الأقسام';
        case RequestType.PROMOTION: return 'طلب ترقية وتعديل مسمى';
        case RequestType.DUTY_RESUMPTION: return 'إقرار مباشرة عمل بالبصمة';
        case RequestType.END_OF_SERVICE: return 'تسوية مكافأة نهاية الخدمة';
        case RequestType.CUSTOM: return 'طلب إداري مخصص آخر';
        default: return type;
    }
};

// Select highly relevant, beautiful Lucide icons for each of the 13 request types
const getRequestTypeIcon = (type: string) => {
    switch (type) {
        case RequestType.LEAVE: return <Calendar className="w-4 h-4" />;
        case RequestType.PERMISSION: return <Clock className="w-4 h-4" />;
        case RequestType.SALARY_CERTIFICATE: return <FileText className="w-4 h-4" />;
        case RequestType.CERTIFICATE: return <Award className="w-4 h-4" />;
        case RequestType.DATA_UPDATE: return <UserCog className="w-4 h-4" />;
        case RequestType.LOAN: 
        case RequestType.ADVANCE: return <Coins className="w-4 h-4" />;
        case RequestType.TRAINING: return <GraduationCap className="w-4 h-4" />;
        case RequestType.DEPUTATION: return <MapPin className="w-4 h-4" />;
        case RequestType.TRANSFER: return <ArrowLeftRight className="w-4 h-4" />;
        case RequestType.PROMOTION: return <ChevronUp className="w-4 h-4" />;
        case RequestType.DUTY_RESUMPTION: return <CheckSquare className="w-4 h-4" />;
        case RequestType.END_OF_SERVICE: return <Award className="w-4 h-4 text-amber-500" />;
        default: return <FileCheck className="w-4 h-4" />;
    }
};

export const RequestList: React.FC<RequestListProps> = ({
    requests,
    filteredRequests,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    onViewDetails,
    onViewPrint,
    onDeleteRequest
}) => {
    const [activeTab, setActiveTab] = React.useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

    // Sync quick status tabs when filterStatus prop is modified externally
    React.useEffect(() => {
        if (filterStatus === 'Signed & Completed') {
            setActiveTab('APPROVED');
        } else if (filterStatus === 'Rejected') {
            setActiveTab('REJECTED');
        } else if (filterStatus === 'ALL') {
            // Retain active tab, or switch to ALL if not already set to PENDING
            if (activeTab !== 'PENDING') {
                setActiveTab('ALL');
            }
        } else {
            setActiveTab('PENDING');
        }
    }, [filterStatus]);

    // Compute the search and request-type filtered list (ignoring status filter) to get accurate tab counts
    const requestsMatchingSearchAndType = React.useMemo(() => {
        const list = requests || filteredRequests;
        return list.filter(req => {
            const matchesQuery = 
                req.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.requestType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (req.reasonNote && req.reasonNote.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesType = filterType === 'ALL' || req.requestType === filterType;
            return matchesQuery && matchesType;
        });
    }, [requests, filteredRequests, searchQuery, filterType]);

    // Calculate real-time dynamic counts for each of the 4 quick filters
    const counts = React.useMemo(() => {
        let all = requestsMatchingSearchAndType.length;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        requestsMatchingSearchAndType.forEach(req => {
            if (req.status === 'Signed & Completed') {
                approved++;
            } else if (req.status === 'Rejected') {
                rejected++;
            } else {
                pending++;
            }
        });

        return { all, pending, approved, rejected };
    }, [requestsMatchingSearchAndType]);

    // Filter displayed requests according to selected quick status tab
    const displayedRequests = React.useMemo(() => {
        return requestsMatchingSearchAndType.filter(req => {
            if (activeTab === 'ALL') return true;
            if (activeTab === 'APPROVED') return req.status === 'Signed & Completed';
            if (activeTab === 'REJECTED') return req.status === 'Rejected';
            if (activeTab === 'PENDING') {
                return req.status !== 'Signed & Completed' && req.status !== 'Rejected';
            }
            return true;
        });
    }, [requestsMatchingSearchAndType, activeTab]);

    // Handle tab click to update internal state and parent filterStatus prop
    const handleTabClick = (tab: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED') => {
        setActiveTab(tab);
        if (tab === 'ALL') {
            setFilterStatus('ALL');
        } else if (tab === 'PENDING') {
            setFilterStatus('ALL'); // Load all matching in parent, filter locally
        } else if (tab === 'APPROVED') {
            setFilterStatus('Signed & Completed');
        } else if (tab === 'REJECTED') {
            setFilterStatus('Rejected');
        }
    };

    // Render bespoke, rich visual metrics for specific request types to reduce cognitive overload
    const renderRequestSpecificDetails = (req: EmployeeRequest) => {
        const detailContainerClass = "flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-semibold bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60";
        switch (req.requestType) {
            case RequestType.LEAVE:
                return (
                    <div className={detailContainerClass}>
                        <div>📅 <span className="text-slate-400 dark:text-slate-500">الفترة:</span> من {req.startDate} إلى {req.endDate}</div>
                        <div className="text-[#00796B] dark:text-accent">⏱️ <span className="text-slate-400 dark:text-slate-500">المدة:</span> {req.leaveDaysCount} يوم</div>
                        {req.leaveType && (
                            <div>🏷️ <span className="text-slate-400 dark:text-slate-500">النوع:</span> {
                                req.leaveType === 'annual' ? 'سنوية دورية' :
                                req.leaveType === 'sick' ? 'مرضية معتمدة' :
                                req.leaveType === 'emergency' ? 'طارئة مستعجلة' :
                                req.leaveType === 'maternity' ? 'وضع وطفولة' :
                                req.leaveType === 'pilgrimage' ? 'حج وعمرة' : 'إجازة خاصة'
                            }</div>
                        )}
                    </div>
                );
            case RequestType.PERMISSION:
                return (
                    <div className={detailContainerClass}>
                        <div>📅 <span className="text-slate-400 dark:text-slate-500">التاريخ:</span> {req.permissionDate}</div>
                        <div>⏱️ <span className="text-slate-400 dark:text-slate-500">التوقيت:</span> {req.permissionTimeRange}</div>
                        <div className="text-[#00796B] dark:text-accent">⌛ <span className="text-slate-400 dark:text-slate-500">المدة:</span> {req.permissionHours} ساعة</div>
                    </div>
                );
            case RequestType.LOAN:
            case RequestType.ADVANCE:
                return (
                    <div className={detailContainerClass}>
                        <div className="text-emerald-750 dark:text-emerald-400 font-bold">💰 <span className="text-slate-400 dark:text-slate-500">المبلغ المطلوب:</span> {req.loanAmount} د.ك</div>
                        <div>📅 <span className="text-slate-400 dark:text-slate-500">الأقساط:</span> {req.installmentsCount} شهر</div>
                        {req.monthlyInstallment && <div className="text-emerald-700 dark:text-emerald-400/80">💳 <span className="text-slate-400 dark:text-slate-500">الشريحة الشهرية:</span> {req.monthlyInstallment} د.ك</div>}
                        {req.guarantorName && <div className="text-slate-500 dark:text-slate-400 w-full mt-1">🔒 <span className="text-slate-400 dark:text-slate-500">الكفالة:</span> {req.guarantorName}</div>}
                    </div>
                );
            case RequestType.SALARY_CERTIFICATE:
            case RequestType.CERTIFICATE:
                return (
                    <div className={detailContainerClass}>
                        <div>🏢 <span className="text-slate-400 dark:text-slate-500">الجهة الموجهة:</span> {req.recipientName || 'من يهمه الأمر'}</div>
                        <div>🌐 <span className="text-slate-400 dark:text-slate-500">اللغة:</span> {req.language === 'ar' ? 'العربية' : 'English'}</div>
                        {req.includeSalaryDetails !== undefined && (
                            <div className={`w-full mt-1 ${req.includeSalaryDetails ? 'text-emerald-700 dark:text-emerald-450' : 'text-slate-400 dark:text-slate-550'}`}>
                                💵 {req.includeSalaryDetails ? 'تفاصيل البدلات الكلية والراتب الأساسي مدرجة' : 'الشهادة لا تتضمن البنود المالية'}
                            </div>
                        )}
                    </div>
                );
            case RequestType.DATA_UPDATE:
                return (
                    <div className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        <div>📝 <span className="text-slate-400 dark:text-slate-500">تحديث سجل:</span> <span className="text-[#00796B] dark:text-accent">{req.fieldToUpdate}</span></div>
                        <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                            <div className="text-slate-400 dark:text-slate-500">❌ الحالي: <span className="line-through text-rose-600 dark:text-rose-400 block text-xs mt-0.5">{req.oldValue || 'لا يوجد'}</span></div>
                            <div className="text-slate-500 dark:text-slate-450">✅ المقترح: <span className="text-emerald-700 dark:text-emerald-400 block text-xs mt-0.5 font-bold">{req.newValue}</span></div>
                        </div>
                    </div>
                );
            case RequestType.TRAINING:
                return (
                    <div className={detailContainerClass}>
                        <div className="w-full">🎓 <span className="text-slate-400 dark:text-slate-500">البرنامج:</span> <span className="text-[#00796B] dark:text-accent">{req.trainingCourseTitle}</span></div>
                        <div>🏢 <span className="text-slate-400 dark:text-slate-500">المركز المعتمد:</span> {req.trainingProvider}</div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold">💰 <span className="text-slate-400 dark:text-slate-500">الرسوم الكلية:</span> {req.trainingCost} د.ك</div>
                    </div>
                );
            case RequestType.DEPUTATION:
                return (
                    <div className={detailContainerClass}>
                        <div>📍 <span className="text-slate-400 dark:text-slate-500">الجهة الخارجية:</span> {req.deputationLocation}</div>
                        <div>⏱️ <span className="text-slate-400 dark:text-slate-500">فترة الانتداب:</span> {req.deputationDurationDays} يوم عمالي</div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold">💵 <span className="text-slate-400 dark:text-slate-500">مخصص البدل واليومية:</span> {req.deputationPerDiem} د.ك/يوم</div>
                    </div>
                );
            case RequestType.TRANSFER:
                return (
                    <div className={detailContainerClass}>
                        <div>🏢 <span className="text-slate-400 dark:text-slate-500">القسم الجديد:</span> {req.requestedDept}</div>
                        {req.requestedTitle && <div>💼 <span className="text-slate-400 dark:text-slate-500">المسمى:</span> {req.requestedTitle}</div>}
                        {req.proposedSalary && <div className="text-emerald-700 dark:text-emerald-400 w-full mt-1">💵 <span className="text-slate-400 dark:text-slate-500">الراتب الجديد للقسم:</span> {req.proposedSalary} د.ك</div>}
                    </div>
                );
            case RequestType.PROMOTION:
                return (
                    <div className={detailContainerClass}>
                        <div>📈 <span className="text-slate-400 dark:text-slate-500">المسمى والدرجة الجديدة:</span> {req.requestedTitle}</div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold">💰 <span className="text-slate-400 dark:text-slate-500">الراتب الشامل المقترح:</span> {req.proposedSalary} د.ك</div>
                        {req.retroactiveDate && <div>📅 <span className="text-slate-400 dark:text-slate-500">تاريخ أثر الزيادة:</span> {req.retroactiveDate}</div>}
                    </div>
                );
            case RequestType.DUTY_RESUMPTION:
                return (
                    <div className={detailContainerClass}>
                        <div>✅ <span className="text-slate-400 dark:text-slate-500">تاريخ المباشرة الفعلي:</span> {req.resumptionDate}</div>
                        <div>📎 <span className="text-slate-400 dark:text-slate-500">كود الإجازة الصادر:</span> <span className="font-mono text-slate-800 dark:text-slate-200 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{req.resumptionReferenceCode}</span></div>
                    </div>
                );
            case RequestType.END_OF_SERVICE:
                return (
                    <div className="flex flex-col gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                            <div>⚖️ <span className="text-slate-400 dark:text-slate-500">نوع الفصل/الإنهاء:</span> <span className="text-[#00796B] dark:text-accent font-bold">{
                                req.eosReason === 'resignation' ? 'استقالة اختيارية' :
                                req.eosReason === 'termination' ? 'إنهاء خدمات من العمل' :
                                req.eosReason === 'retirement' ? 'تقاعد وتصفية اختيارية' : 'أخرى'
                            }</span></div>
                            <div>⌛ <span className="text-slate-400 dark:text-slate-500">مدة الخدمة:</span> {req.serviceDurationYears || 0} سنة و {req.serviceDurationMonths || 0} شهر</div>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-800 pt-2 mt-1">
                            <span className="text-slate-400 dark:text-slate-500 font-bold">💰 مستحقات تصفية نهاية الخدمة:</span>
                            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">{(req.calculatedIndemnityAmount || 0).toLocaleString()} د.ك</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                            {req.entitledToFullBonus ? (
                                <span className="text-emerald-600 dark:text-emerald-450 font-black">✓ مستحق للمكافأة بالكامل عمالياً (قانون العمل كويتي مادة 51)</span>
                            ) : (
                                <span className="text-amber-600 dark:text-accent font-black">⚠️ خصم نسبي طبقاً للمادة 53 من قانون العمل (مدة أقل من 10 سنوات)</span>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Search and request-type filters hub */}
            <div className="bg-white dark:bg-[#1E3C50] p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search bar */}
                    <div className="md:col-span-2 relative">
                        <input 
                            type="text" 
                            placeholder="ابحث عن معاملة أو قرار... (باسم الموظف، الرقم المرجعي، أو نوع المعاملة)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full text-xs font-bold pr-10 pl-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#00796B] dark:focus:border-accent focus:ring-0 bg-slate-50 dark:bg-[#102A3A]/40 text-slate-800 dark:text-white text-right outline-none transition-colors"
                        />
                        <Search className="w-4 h-4 text-slate-450 absolute right-3.5 top-3.5" />
                    </div>

                    {/* Type filter */}
                    <div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full text-xs font-bold py-3 pr-8 pl-3 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#00796B] dark:focus:border-accent focus:ring-0 bg-slate-50 dark:bg-[#102A3A]/40 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                        >
                            <option value="ALL">جميع أنواع المعاملات (13 نوع)</option>
                            {Object.values(RequestType).map(type => (
                                <option key={type} value={type}>{getArabicRequestType(type)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Quick Status Filter Tabs with counts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                    onClick={() => handleTabClick('ALL')}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeTab === 'ALL'
                            ? 'bg-[#00796B] text-white border-transparent shadow-md scale-[1.02]'
                            : 'bg-white dark:bg-[#1E3C50] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#102A3A]/50'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'ALL' ? 'bg-white' : 'bg-slate-400'}`} />
                        <span className="text-[11px] font-black">جميع المعاملات</span>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${activeTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#102A3A] text-slate-600 dark:text-slate-400'}`}>
                        {counts.all}
                    </span>
                </button>

                <button
                    onClick={() => handleTabClick('PENDING')}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeTab === 'PENDING'
                            ? 'bg-amber-600 text-white border-transparent shadow-md scale-[1.02]'
                            : 'bg-white dark:bg-[#1E3C50] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#102A3A]/50'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'PENDING' ? 'bg-white' : 'bg-amber-500'}`} />
                        <span className="text-[11px] font-black">تحت التدقيق والاعتماد</span>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${activeTab === 'PENDING' ? 'bg-white/20 text-white' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-accent'}`}>
                        {counts.pending}
                    </span>
                </button>

                <button
                    onClick={() => handleTabClick('APPROVED')}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeTab === 'APPROVED'
                            ? 'bg-emerald-600 text-white border-transparent shadow-md scale-[1.02]'
                            : 'bg-white dark:bg-[#1E3C50] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#102A3A]/50'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'APPROVED' ? 'bg-white' : 'bg-emerald-500'}`} />
                        <span className="text-[11px] font-black">مكتمل ومعتمد نهائياً</span>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${activeTab === 'APPROVED' ? 'bg-white/20 text-white' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'}`}>
                        {counts.approved}
                    </span>
                </button>

                <button
                    onClick={() => handleTabClick('REJECTED')}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                        activeTab === 'REJECTED'
                            ? 'bg-rose-600 text-white border-transparent shadow-md scale-[1.02]'
                            : 'bg-white dark:bg-[#1E3C50] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#102A3A]/50'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'REJECTED' ? 'bg-white' : 'bg-rose-500'}`} />
                        <span className="text-[11px] font-black">المعاملات المرفوضة</span>
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${activeTab === 'REJECTED' ? 'bg-white/20 text-white' : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400'}`}>
                        {counts.rejected}
                    </span>
                </button>
            </div>

            {/* Vertical Cards Feed Grid */}
            {displayedRequests.length === 0 ? (
                <div className="bg-white dark:bg-[#1E3C50] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-16 text-center text-slate-400 dark:text-slate-500 font-bold space-y-3 shadow-sm">
                    <AlertTriangle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-sm">لم يتم العثور على أي طلبات أو معاملات إدارية تطابق خيارات التصفية المحددة!</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">جرب تعديل شروط البحث أو اختيار تبويب تصفية سريع آخر من الأعلى.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayedRequests.map((req) => {
                        const uiStatus = statusTranslations[req.status] || req.status;
                        let statusColor = 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800';
                        let avatarGrad = 'from-slate-150 to-slate-50 dark:from-slate-800 dark:to-slate-900';
                        
                        if (req.status === 'Signed & Completed') {
                            statusColor = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30';
                            avatarGrad = 'from-emerald-50 to-emerald-100/30 dark:from-emerald-950/35 dark:to-emerald-900/10';
                        } else if (req.status === 'Rejected') {
                            statusColor = 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/30';
                            avatarGrad = 'from-rose-50 to-rose-100/30 dark:from-rose-950/35 dark:to-rose-900/10';
                        } else if (req.status.startsWith('Under')) {
                            statusColor = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-accent border-amber-200 dark:border-amber-900/30';
                            avatarGrad = 'from-amber-50 to-amber-100/30 dark:from-amber-950/35 dark:to-amber-900/10';
                        } else if (req.status === 'Pending Line Manager') {
                            statusColor = 'bg-[#00796B]/10 dark:bg-[#00796B]/20 text-[#00796B] dark:text-primary-light border-[#00796B]/20 dark:border-[#00796B]/30';
                            avatarGrad = 'from-[#00796B]/15 to-[#00796B]/5 dark:from-[#00796B]/30 dark:to-[#00796B]/10';
                        }

                        return (
                            <div 
                                key={req.id} 
                                className="bg-white dark:bg-[#1E3C50] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 hover:shadow-xl hover:border-[#00796B]/30 dark:hover:border-accent/30 transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden shadow-sm"
                            >
                                {/* Decorative top gradient banner */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-slate-100 via-slate-200/50 to-slate-100 dark:from-slate-800 dark:via-slate-750 dark:to-slate-800 group-hover:from-transparent group-hover:via-[#00796B]/20 group-hover:to-transparent transition-all" />

                                {/* Card Header: Employee and Status */}
                                <div className="flex items-start justify-between pt-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center font-black text-slate-700 dark:text-slate-200 text-sm border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-300`}>
                                            {req.employeeName[0]}
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight">{req.employeeName}</h3>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">{req.employeeJobTitle} • {req.employeeDepartment}</p>
                                        </div>
                                    </div>
                                    <Badge text={uiStatus} className={`px-2.5 py-1 text-[10px] border rounded-lg font-black shrink-0 ${statusColor}`} />
                                </div>

                                {/* Divider line */}
                                <div className="h-px bg-slate-150 dark:bg-slate-800/80 w-full" />

                                {/* Transaction Type with custom icon and reference number */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00796B]/5 dark:bg-[#00796B]/15 text-[#00796B] dark:text-accent border border-[#00796B]/10 dark:border-accent/10 font-black text-xs">
                                        {getRequestTypeIcon(req.requestType)}
                                        <span>{getArabicRequestType(req.requestType)}</span>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">الرقم المرجعي: </span>
                                        <span className="font-mono text-slate-800 dark:text-slate-200 text-[10px] font-black bg-slate-100 dark:bg-[#102A3A] px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-800">{req.referenceNumber}</span>
                                    </div>
                                </div>

                                {/* Request Specific Details Grid (Dynamic based on requestType) */}
                                <div className="w-full">
                                    {renderRequestSpecificDetails(req)}
                                </div>

                                {/* Compact motive/reason note section */}
                                <div className="bg-slate-50/75 dark:bg-[#102A3A]/40 p-3.5 rounded-xl border-r-2 border-[#00796B] dark:border-accent text-slate-600 dark:text-slate-300 text-[11px] font-semibold leading-relaxed">
                                    <p className="text-slate-400 dark:text-slate-500 text-[9px] font-black mb-1">المسوّغ الإداري والامتثال القانوني:</p>
                                    <p className="line-clamp-2" title={req.reasonNote}>{req.reasonNote}</p>
                                </div>

                                {/* Divider line */}
                                <div className="h-px bg-slate-150 dark:bg-slate-800/80 w-full" />

                                {/* Card Footer: Submission date and action controls */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold self-start sm:self-center">
                                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                                        <span>تاريخ التقديم: {req.requestDate}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => onViewDetails(req)}
                                            className="px-3 py-2 text-[10px] flex items-center gap-1.5 font-bold hover:text-[#00796B] dark:hover:text-accent hover:bg-[#00796B]/5 dark:hover:bg-accent/5 border-slate-200 dark:border-slate-800 rounded-xl"
                                            title="عرض مراحل الاعتماد والتفاصيل"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            مراحل الاعتماد
                                        </Button>
                                        
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => onViewPrint(req)}
                                            className="px-3 py-2 text-[10px] text-[#00796B] dark:text-accent border-[#00796B]/20 dark:border-accent/20 hover:bg-[#00796B]/5 dark:hover:bg-accent/5 flex items-center gap-1.5 font-bold rounded-xl"
                                            title="تعديل وصياغة المستند قبل الطباعة"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            صياغة وطباعة
                                        </Button>

                                        <button 
                                            onClick={() => onDeleteRequest(req.id, req.referenceNumber)}
                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                                            title="حذف السجل الإداري"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
