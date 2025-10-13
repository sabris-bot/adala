
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Hearing, Case } from '../types';
import { initialCases } from './CaseListPage'; 
import { ListBulletIcon, InformationCircleIcon, CalendarDaysIcon, BriefcaseIcon } from '../constants';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Badge } from '../components/ui/Badge';

// Helper to generate mock hearings from existing cases
const generateMockHearings = (): Hearing[] => {
    const today = new Date();
    const hearings: Hearing[] = [];

    initialCases.slice(0, 8).forEach((caseItem, index) => {
        const hearingDate = new Date(today);
        hearingDate.setDate(today.getDate() + (index % 4)); // Distribute hearings over the next 4 days
        
        const hearingTime = `${String(9 + (index % 5)).padStart(2, '0')}:${String((index * 15) % 60).padStart(2, '0')}`;
        
        let status: Hearing['status'] = 'Scheduled';
        const hearingDateTime = new Date(`${hearingDate.toISOString().split('T')[0]}T${hearingTime}`);
        
        if (hearingDateTime < today) {
            status = index % 3 === 0 ? 'Postponed' : 'Completed';
        }

        hearings.push({
            id: `h-docket-${index}`,
            caseId: caseItem.id,
            caseTitle: caseItem.title,
            clientName: caseItem.clientName,
            date: hearingDate.toISOString().split('T')[0],
            time: hearingTime,
            courtRoomOrLocation: `${caseItem.courtName} - ${caseItem.courtLevel}`,
            type: index % 2 === 0 ? 'جلسة مرافعة' : 'لتقديم مستندات',
            status: status,
            notes: status === 'Postponed' ? 'تأجلت لعدم حضور شاهد.' : (status === 'Completed' ? 'تم تقديم المذكرة.' : 'الجلسة مجدولة.'),
            attendedBy: status === 'Completed' ? [caseItem.assignedLawyer] : [],
        });
    });
    
    // Add a hearing for yesterday
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    hearings.push({
        id: 'h-docket-yesterday',
        caseId: initialCases[8]?.id,
        caseTitle: initialCases[8]?.title,
        clientName: initialCases[8]?.clientName,
        date: yesterday.toISOString().split('T')[0],
        time: '11:00',
        courtRoomOrLocation: initialCases[8]?.courtName,
        type: 'النطق بالحكم',
        status: 'Completed',
        notes: 'صدر الحكم لصالح الموكل.',
        attendedBy: [initialCases[8]?.assignedLawyer]
    });


    return hearings;
};

const allMockHearings = generateMockHearings();

const AutomatedDocketPage: React.FC = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);
    const [hearings, setHearings] = useState<Hearing[]>(allMockHearings);

    const hearingsForSelectedDate = useMemo(() => {
        return hearings.filter(h => h.date === selectedDate)
                       .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));
    }, [hearings, selectedDate]);
    
    const summaryStats = useMemo(() => {
        return {
            total: hearingsForSelectedDate.length,
            completed: hearingsForSelectedDate.filter(h => h.status === 'Completed').length,
            postponed: hearingsForSelectedDate.filter(h => h.status === 'Postponed').length,
            scheduled: hearingsForSelectedDate.filter(h => h.status === 'Scheduled').length,
        };
    }, [hearingsForSelectedDate]);
    
    const formatDateForDisplay = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getStatusBadge = (status: Hearing['status']) => {
        switch(status) {
            case 'Completed': return <Badge text="منتهية" color="green" />;
            case 'Postponed': return <Badge text="مؤجلة" color="orange" />;
            case 'Scheduled': return <Badge text="مجدولة" color="blue" />;
            case 'Cancelled': return <Badge text="ملغاة" color="gray" />;
            default: return <Badge text={status} color="gray"/>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <ListBulletIcon className="w-8 h-8 text-primary me-3" />
                <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">الرول اليومي الآلي (محاكاة)</h1>
            </div>

            <Card className="bg-primary-light/5 dark:bg-dm-card/30">
                <div className="flex items-start">
                    <InformationCircleIcon className="w-6 h-6 text-primary me-3 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="text-md font-semibold text-primary-dark mb-1">متابعة آلية لجلسات اليوم</h3>
                        <p className="text-sm text-neutral-text dark:text-dm-text-light leading-relaxed">
                            تعرض هذه الصفحة "الرول اليومي" أو جدول الجلسات لليوم المحدد. في النظام المتكامل، يتم تحديث هذه البيانات تلقائيًا من مصادر المحاكم لتوفير نظرة فورية ودقيقة على جدول أعمال المحامين، مع إمكانية تحديث حالة كل جلسة (منتهية، مؤجلة) بشكل آلي أو يدوي.
                        </p>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-gray-50 dark:bg-dm-card/50 rounded-lg shadow-sm">
                    <Input 
                        label="اختر تاريخ الرول"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        containerClassName="w-full md:w-auto mb-0"
                    />
                    <div className="flex-grow font-semibold text-lg text-primary-dark text-center">
                        جلسات يوم: {formatDateForDisplay(selectedDate)}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card title="إجمالي الجلسات" className="text-center"><p className="text-3xl font-bold">{summaryStats.total}</p></Card>
                <Card title="مجدولة" className="text-center"><p className="text-3xl font-bold text-blue-600">{summaryStats.scheduled}</p></Card>
                <Card title="منتهية" className="text-center"><p className="text-3xl font-bold text-green-600">{summaryStats.completed}</p></Card>
                <Card title="مؤجلة" className="text-center"><p className="text-3xl font-bold text-orange-600">{summaryStats.postponed}</p></Card>
            </div>

            <Card title={`تفاصيل جلسات يوم ${formatDateForDisplay(selectedDate)}`}>
                {hearingsForSelectedDate.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <CalendarDaysIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                        <p>لا توجد جلسات مجدولة في هذا التاريخ.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    {['الوقت', 'رقم القضية', 'الموكل', 'المحكمة/الدائرة', 'نوع الجلسة', 'الحالة', 'ملاحظات', 'إجراءات'].map(h => (
                                        <th key={h} className="px-3 py-3 text-right font-medium">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {hearingsForSelectedDate.map(hearing => (
                                    <tr key={hearing.id}>
                                        <td className="px-3 py-2 font-mono">{hearing.time}</td>
                                        <td className="px-3 py-2 font-semibold text-primary">{initialCases.find(c => c.id === hearing.caseId)?.caseNumber || 'N/A'}</td>
                                        <td className="px-3 py-2">{hearing.clientName}</td>
                                        <td className="px-3 py-2 max-w-xs truncate" title={hearing.courtRoomOrLocation}>{hearing.courtRoomOrLocation}</td>
                                        <td className="px-3 py-2">{hearing.type}</td>
                                        <td className="px-3 py-2">{getStatusBadge(hearing.status)}</td>
                                        <td className="px-3 py-2 max-w-xs truncate" title={hearing.notes}>{hearing.notes}</td>
                                        <td className="px-3 py-2">
                                            <Link to={`/cases?view=${hearing.caseId}`}>
                                                <Button variant="outline" size="sm" leftIcon={<BriefcaseIcon className="w-3"/>}>ملف القضية</Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AutomatedDocketPage;
