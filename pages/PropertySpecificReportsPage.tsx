
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { 
    PresentationChartLineIcon, 
    InformationCircleIcon, 
    PrinterIcon, 
    BuildingOffice2Icon, 
    UsersIcon, 
    BanknotesIcon, 
    WrenchScrewdriverIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ArrowRightIcon
} from '../constants';
import { 
    Property, PropertyType, PropertyUnitStatus, 
    PropertyCategoryKuwait, RentPayment, RentPaymentStatus 
} from '../types';
import { mockProperties, mockRentPayments, mockLeaseAgreements } from '../data/propertyData';
import { PropertyUnitStatusBadge } from '../components/ui/Badge';

// Helper for dates and money
const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';
const formatCurrency = (amount?: number) => amount !== undefined ? `${amount.toFixed(3)} د.ك` : '-';

const PropertySpecificReportsPage: React.FC = () => {
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(mockProperties[0]?.id || '');

    const selectedProperty = useMemo(() => 
        mockProperties.find(p => p.id === selectedPropertyId), 
    [selectedPropertyId]);

    const propertyPayments = useMemo(() => {
        const propertyLeaseIds = mockLeaseAgreements
            .filter(l => l.propertyId === selectedPropertyId)
            .map(l => l.id);
        return mockRentPayments.filter(p => propertyLeaseIds.includes(p.leaseAgreementId));
    }, [selectedPropertyId]);

    const stats = useMemo(() => {
        if (!selectedProperty) return null;
        const totalUnits = selectedProperty.units?.length || 0;
        const rentedUnits = selectedProperty.units?.filter(u => u.status === PropertyUnitStatus.RENTED).length || 0;
        const vacantUnits = totalUnits - rentedUnits;
        const totalIncome = propertyPayments
            .filter(p => p.status === RentPaymentStatus.PAID)
            .reduce((sum, p) => sum + p.amountPaid, 0);
        const outstanding = propertyPayments
            .filter(p => p.status === RentPaymentStatus.OVERDUE)
            .reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

        return { totalUnits, rentedUnits, vacantUnits, totalIncome, outstanding };
    }, [selectedProperty, propertyPayments]);

    if (!selectedProperty) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center">
                    <Link to="/property-management" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full me-4 transition-colors">
                        <ArrowRightIcon className="w-5 h-5 text-gray-600" />
                    </Link>
                    <PresentationChartLineIcon className="w-8 h-8 text-primary me-3" />
                    <h1 className="text-3xl font-bold text-primary-dark">التحليل التفصيلي للعقارات</h1>
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-hidden">
                    <Select 
                        value={selectedPropertyId} 
                        onChange={e => setSelectedPropertyId(e.target.value)}
                        options={mockProperties.map(p => ({ value: p.id, label: p.name }))}
                    />
                    <Button variant="outline" leftIcon={<PrinterIcon className="w-4 h-4"/>} onClick={() => window.print()}>تصدير تقرير</Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-100 flex items-center justify-between p-4">
                    <div>
                        <p className="text-blue-600 text-xs font-bold mb-1">نسبة الإشغال</p>
                        <p className="text-2xl font-bold text-blue-900">{stats?.totalUnits ? Math.round((stats.rentedUnits / stats.totalUnits) * 100) : 0}%</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg"><BuildingOffice2Icon className="w-6 h-6 text-blue-600"/></div>
                </Card>
                <Card className="bg-green-50 border-green-100 flex items-center justify-between p-4">
                    <div>
                        <p className="text-green-600 text-xs font-bold mb-1">إجمالي المحصل</p>
                        <p className="text-2xl font-bold text-green-900">{formatCurrency(stats?.totalIncome || 0)}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg"><BanknotesIcon className="w-6 h-6 text-green-600"/></div>
                </Card>
                <Card className="bg-red-50 border-red-100 flex items-center justify-between p-4">
                    <div>
                        <p className="text-red-600 text-xs font-bold mb-1">المتأخرات القائمة</p>
                        <p className="text-2xl font-bold text-red-900">{formatCurrency(stats?.outstanding || 0)}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg"><ExclamationTriangleIcon className="w-6 h-6 text-red-600"/></div>
                </Card>
                <Card className="bg-purple-50 border-purple-100 flex items-center justify-between p-4">
                    <div>
                        <p className="text-purple-600 text-xs font-bold mb-1">الوحدات الشاغرة</p>
                        <p className="text-2xl font-bold text-purple-900">{stats?.vacantUnits} وحدة</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg"><UsersIcon className="w-6 h-6 text-purple-600"/></div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Property Identity Card */}
                <Card title="بيانات العقار الأساسية" className="lg:col-span-1">
                    <div className="space-y-4">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                             <HomeIcon className="w-12 h-12"/>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-gray-500 font-medium">اسم العقار:</span>
                            <span className="font-bold text-right">{selectedProperty.name}</span>
                            
                            <span className="text-gray-500 font-medium">نوع العقار:</span>
                            <span className="text-right">{selectedProperty.type}</span>
                            
                            <span className="text-gray-500 font-medium">التصنيف:</span>
                            <span className="text-right">{selectedProperty.propertyCategory}</span>

                            <span className="text-gray-500 font-medium">العنوان:</span>
                            <span className="text-right text-xs leading-tight">{selectedProperty.address}</span>

                            <span className="text-gray-500 font-medium">تاريخ الإضافة:</span>
                            <span className="text-right">{formatDate(selectedProperty.createdAt)}</span>
                        </div>
                    </div>
                </Card>

                {/* Units List */}
                <Card title="جرد الوحدات والحالة الراهنة" className="lg:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-gray-50 uppercase text-[10px] text-gray-500">
                                <tr>
                                    <th className="px-3 py-3 text-right font-extrabold">رقم الوحدة</th>
                                    <th className="px-3 py-3 text-right font-extrabold">الطابق</th>
                                    <th className="px-3 py-3 text-right font-extrabold">النوع</th>
                                    <th className="px-3 py-3 text-right font-extrabold">الحالة</th>
                                    <th className="px-3 py-3 text-right font-extrabold">المزايا</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {selectedProperty.units?.map(unit => (
                                    <tr key={unit.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-3 py-3 font-bold text-slate-800">{unit.unitNumber}</td>
                                        <td className="px-3 py-3">{unit.floor}</td>
                                        <td className="px-3 py-3 text-xs text-gray-540">{unit.unitType || 'سكنية'}</td>
                                        <td className="px-3 py-3"><PropertyUnitStatusBadge status={unit.status}/></td>
                                        <td className="px-3 py-3 flex gap-1">
                                            {unit.bedrooms && <span className="text-[10px] px-1 bg-gray-100 rounded">{unit.bedrooms}غ</span>}
                                            {unit.bathrooms && <span className="text-[10px] px-1 bg-gray-100 rounded">{unit.bathrooms}ح</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Maintenance History Overview */}
            <Card title="الصيانة الدورية والطارئة">
                <div className="flex items-center gap-4 p-4 mb-4 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><WrenchScrewdriverIcon className="w-5 h-5"/></div>
                    <div>
                        <p className="font-bold text-yellow-800 text-sm">تنبيه: صيانة دورية مقررة</p>
                        <p className="text-xs text-yellow-600">يوجد وحدات (104, 202) مدرجة ضمن قائمة الفحص الفني للأسبوع القادم.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 border rounded-xl flex justify-between items-center">
                         <div>
                             <p className="text-xs text-gray-500 mb-1">مصروفات الصيانة (هذا العام)</p>
                             <p className="text-lg font-bold">1,450.000 د.ك</p>
                         </div>
                         <Button variant="ghost" size="sm" className="text-blue-600">التفاصيل</Button>
                     </div>
                     <div className="p-4 border rounded-xl flex justify-between items-center">
                         <div>
                             <p className="text-xs text-gray-500 mb-1">عدد طلبات الصيانة المكتملة</p>
                             <p className="text-lg font-bold">12 طلب</p>
                         </div>
                         <div className="text-green-500 flex items-center gap-1 text-xs font-bold"><CheckCircleIcon className="w-4 h-4"/> 100% نجاح</div>
                     </div>
                </div>
            </Card>
        </div>
    );
};

// Internal icons needed for consistency
const HomeIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );

export default PropertySpecificReportsPage;
