import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { PresentationChartLineIcon, InformationCircleIcon, PrinterIcon } from '../constants';
import { Property, PropertyUnit, Tenant, LeaseAgreement, RentPayment, PropertyType, PropertyUnitStatus, LeaseAgreementStatus, RentPaymentFrequency, RentPaymentStatus, PropertyCategoryKuwait, LeaseTermType } from '../types';

// --- Mock Data (Local to this page for self-sufficiency) ---

const mockTenantsData: Tenant[] = [
  { id: 't1', fullNameAr: 'أحمد عبدالله محمد', civilIdOrPassport: '280010112345', nationality: 'كويتي', phone: '98765432', email: 'ahmed.a@example.com', createdAt: '2023-01-01', occupation: 'مهندس' },
  { id: 't2', fullNameAr: 'شركة الأمل للتجارة', civilIdOrPassport: 'CR100200', nationality: 'كويتية (شركة)', phone: '22446688', email: 'info@alamal.com', createdAt: '2022-11-10', occupation: 'شركة تجارية' },
  { id: 't3', fullNameAr: 'نورة خالد السالم', civilIdOrPassport: '295121200000', nationality: 'كويتية', phone: '50501010', email: 'noura.k@example.com', createdAt: '2024-02-15', occupation: 'طبيبة'},
  { id: 't4', fullNameAr: 'محمد جاسم الفهد', civilIdOrPassport: '288050599887', nationality: 'كويتي', phone: '51234567', email: 'mohd.j.alfahad@email.com', createdAt: '2023-08-01', occupation: 'محاسب'},
];

const mockPropertiesData: Property[] = [
  { 
    id: 'propA', name: 'بناية النخيل', type: PropertyType.BUILDING, propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL, address: 'السالمية، ق5', createdAt: '2022-01-01',
    units: [
      { id: 'uA1', propertyId: 'propA', unitNumber: '101', status: PropertyUnitStatus.RENTED, currentLeaseId: 'leaseA1', areaSqM: 80, bedrooms: 2 },
      { id: 'uA2', propertyId: 'propA', unitNumber: '102', status: PropertyUnitStatus.RENTED, currentLeaseId: 'leaseA2', areaSqM: 75, bedrooms: 2 },
      { id: 'uA3', propertyId: 'propA', unitNumber: '201', status: PropertyUnitStatus.VACANT, areaSqM: 90, bedrooms: 3 },
    ]
  },
  { 
    id: 'propB', name: 'برج الأفق', type: PropertyType.BUILDING, propertyCategory: PropertyCategoryKuwait.COMMERCIAL, address: 'شرق، ق2', createdAt: '2021-05-01',
    units: [
      { id: 'uB1', propertyId: 'propB', unitNumber: 'مكتب 501', status: PropertyUnitStatus.RENTED, currentLeaseId: 'leaseB1', areaSqM: 120 },
      { id: 'uB2', propertyId: 'propB', unitNumber: 'مكتب 502', status: PropertyUnitStatus.UNDER_MAINTENANCE, areaSqM: 100 },
    ]
  },
  { id: 'propC', name: 'فيلا السعادة', type: PropertyType.VILLA, propertyCategory: PropertyCategoryKuwait.PRIVATE_RESIDENTIAL, address: 'السرة، ق3', status: PropertyUnitStatus.RENTED, currentLeaseId: 'leaseC1', createdAt: '2020-01-01' },
  { id: 'propD', name: 'أرض فضاء - جنوب السرة', type: PropertyType.LAND, propertyCategory: PropertyCategoryKuwait.INVESTMENT_RESIDENTIAL, address: 'جنوب السرة، ق2', status: PropertyUnitStatus.VACANT, createdAt: '2019-01-01' },
];

const mockLeasesData: LeaseAgreement[] = [
  { id: 'leaseA1', contractNumber: 'L001', propertyId: 'propA', unitId: 'uA1', tenantId: 't1', startDate: '2023-01-01', endDate: '2024-12-31', rentAmount: 500, rentFrequency: RentPaymentFrequency.MONTHLY, status: LeaseAgreementStatus.ACTIVE, paymentDueDateDay: 5, createdAt: '2022-12-15' },
  { id: 'leaseA2', contractNumber: 'L002', propertyId: 'propA', unitId: 'uA2', tenantId: 't3', startDate: '2024-03-01', endDate: '2025-02-28', rentAmount: 450, rentFrequency: RentPaymentFrequency.MONTHLY, status: LeaseAgreementStatus.ACTIVE, paymentDueDateDay: 1, createdAt: '2024-02-20' },
  { id: 'leaseB1', contractNumber: 'L003', propertyId: 'propB', unitId: 'uB1', tenantId: 't2', startDate: '2023-06-01', endDate: '2024-08-31', rentAmount: 1200, rentFrequency: RentPaymentFrequency.QUARTERLY, status: LeaseAgreementStatus.ACTIVE, paymentDueDateDay: 1, createdAt: '2023-05-15' }, // Expiring in < 60 days if "today" is Aug 1, 2024
  { id: 'leaseC1', contractNumber: 'L004', propertyId: 'propC', tenantId: 't4', startDate: '2022-09-01', endDate: '2024-08-15', rentAmount: 1000, rentFrequency: RentPaymentFrequency.MONTHLY, status: LeaseAgreementStatus.ACTIVE, paymentDueDateDay: 10, createdAt: '2022-08-20' }, // Expiring in < 30 days
  { id: 'leaseOld', contractNumber: 'L000', propertyId: 'propA', unitId: 'uA1', tenantId: 't1', startDate: '2022-01-01', endDate: '2022-12-31', rentAmount: 480, rentFrequency: RentPaymentFrequency.MONTHLY, status: LeaseAgreementStatus.EXPIRED, createdAt: '2021-12-15' }, // Already expired
];

const mockPaymentsData: RentPayment[] = [
  // LeaseA1 (Ahmed, PropA-101, Rent 500, Due 5th)
  { id: 'pA1-1', leaseAgreementId: 'leaseA1', paymentDate: '2024-07-03', dueDate: '2024-07-05', amountPaid: 500, amountDue: 500, status: RentPaymentStatus.PAID, recordedAt: '2024-07-03', paymentForPeriod: 'July 2024 Rent' },
  { id: 'pA1-2', leaseAgreementId: 'leaseA1', paymentDate: '2024-06-05', dueDate: '2024-06-05', amountPaid: 500, amountDue: 500, status: RentPaymentStatus.PAID, recordedAt: '2024-06-05', paymentForPeriod: 'June 2024 Rent' },
  { id: 'pA1-3', leaseAgreementId: 'leaseA1', dueDate: '2024-05-05', amountPaid: 0, amountDue: 500, status: RentPaymentStatus.OVERDUE, recordedAt: '2024-05-06', paymentDate: '', paymentForPeriod: 'May 2024 Rent' }, // Overdue
  // LeaseA2 (Noura, PropA-102, Rent 450, Due 1st)
  { id: 'pA2-1', leaseAgreementId: 'leaseA2', paymentDate: '2024-07-01', dueDate: '2024-07-01', amountPaid: 450, amountDue: 450, status: RentPaymentStatus.PAID, recordedAt: '2024-07-01', paymentForPeriod: 'July 2024 Rent' },
  { id: 'pA2-2', leaseAgreementId: 'leaseA2', paymentDate: '2024-06-01', dueDate: '2024-06-01', amountPaid: 200, amountDue: 450, status: RentPaymentStatus.PARTIALLY_PAID, recordedAt: '2024-06-01', paymentForPeriod: 'June 2024 Rent' }, // Partially paid
  // LeaseB1 (Alamal, PropB-501, Rent 1200/Q, Due 1st of Quarter)
  { id: 'pB1-1', leaseAgreementId: 'leaseB1', paymentDate: '2024-07-01', dueDate: '2024-07-01', amountPaid: 1200, amountDue: 1200, status: RentPaymentStatus.PAID, recordedAt: '2024-07-01', paymentForPeriod: 'Q3 2024 Rent' }, // Q3
  // LeaseC1 (Mohd, PropC-Villa, Rent 1000, Due 10th)
  { id: 'pC1-1', leaseAgreementId: 'leaseC1', paymentDate: '2024-07-09', dueDate: '2024-07-10', amountPaid: 1000, amountDue: 1000, status: RentPaymentStatus.PAID, recordedAt: '2024-07-09', paymentForPeriod: 'July 2024 Rent' },
  { id: 'pC1-2', leaseAgreementId: 'leaseC1', dueDate: '2024-06-10', amountPaid: 0, amountDue: 1000, status: RentPaymentStatus.PENDING, recordedAt: '2024-06-10', paymentDate: '', paymentForPeriod: 'June 2024 Rent' }, // Pending (assume today is before due date for PENDING vs OVERDUE based on current date)
];

// Report Types
const reportTypes = [
    { value: 'occupancy', label: 'تقرير إشغال العقارات' },
    { value: 'revenue', label: 'تقرير الإيرادات (المتوقعة والمحصلة)' },
    { value: 'late_payments', label: 'تقرير الإيجارات المتأخرة' },
    { value: 'lease_expiry', label: 'تقرير عقود الإيجار (المنتهية/القريبة من الانتهاء)' },
];

const leaseExpiryPeriodOptions = [
    { value: 'expired', label: 'منتهية بالفعل' },
    { value: 'next_30_days', label: 'خلال 30 يومًا القادمة' },
    { value: 'next_60_days', label: 'خلال 60 يومًا القادمة' },
    { value: 'next_90_days', label: 'خلال 90 يومًا القادمة' },
];

const formatDateForDisplay = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) { return dateString; } 
};

const formatCurrencyForDisplay = (amount?: number): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toFixed(3)} د.ك`;
};


const PropertySpecificReportsPage: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<string>(reportTypes[0].value);
  const [filterPropertyId, setFilterPropertyId] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterDaysOverdue, setFilterDaysOverdue] = useState<number>(0);
  const [filterLeaseExpiryPeriod, setFilterLeaseExpiryPeriod] = useState<string>(leaseExpiryPeriodOptions[0].value);
  
  const [generatedReportTitle, setGeneratedReportTitle] = useState<string>('');
  const [generatedReportData, setGeneratedReportData] = useState<any[]>([]);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);

  const propertyOptions = [{value: '', label: 'جميع العقارات'}, ...mockPropertiesData.map(p => ({value: p.id, label: p.name}))];

  const handleGenerateReport = useCallback(() => {
    setReportGenerated(false);
    let data: any[] = [];
    let title = reportTypes.find(rt => rt.value === selectedReportType)?.label || 'تقرير مخصص';

    const today = new Date();
    today.setHours(0,0,0,0); 

    const sDate = filterStartDate ? new Date(filterStartDate) : null;
    const eDate = filterEndDate ? new Date(filterEndDate) : null;
    if(sDate) sDate.setHours(0,0,0,0);
    if(eDate) eDate.setHours(23,59,59,999);

    title += ` (فترة: ${sDate ? formatDateForDisplay(sDate.toISOString()) : 'منذ البداية'} - ${eDate ? formatDateForDisplay(eDate.toISOString()) : 'حتى اليوم'})`;
    if (filterPropertyId) title += ` - لعقار: ${mockPropertiesData.find(p => p.id === filterPropertyId)?.name}`;

    const propertiesToReport = filterPropertyId ? mockPropertiesData.filter(p => p.id === filterPropertyId) : mockPropertiesData;

    switch (selectedReportType) {
        case 'occupancy':
            data = propertiesToReport.map(prop => {
                let totalUnits = 0, rentedUnits = 0, vacantUnits = 0, maintenanceUnits = 0;
                if (prop.type === PropertyType.BUILDING && prop.units) {
                    totalUnits = prop.units.length;
                    prop.units.forEach(unit => {
                        if (unit.status === PropertyUnitStatus.RENTED) rentedUnits++;
                        else if (unit.status === PropertyUnitStatus.VACANT) vacantUnits++;
                        else if (unit.status === PropertyUnitStatus.UNDER_MAINTENANCE) maintenanceUnits++;
                    });
                } else if (prop.status) { // Single unit property
                    totalUnits = 1;
                    if (prop.status === PropertyUnitStatus.RENTED) rentedUnits = 1;
                    else if (prop.status === PropertyUnitStatus.VACANT) vacantUnits = 1;
                    else if (prop.status === PropertyUnitStatus.UNDER_MAINTENANCE) maintenanceUnits = 1;
                }
                return {
                    property_name: prop.name,
                    total_units: totalUnits,
                    rented_units: rentedUnits,
                    vacant_units: vacantUnits,
                    maintenance_units: maintenanceUnits,
                    occupancy_rate: totalUnits > 0 ? `${((rentedUnits / totalUnits) * 100).toFixed(1)}%` : 'N/A',
                };
            });
            break;
        
        case 'revenue':
            const revenueReport: Record<string, { expected: number, collected: number }> = {};
            mockLeasesData.forEach(lease => {
                if (filterPropertyId && lease.propertyId !== filterPropertyId) return;
                const propName = mockPropertiesData.find(p => p.id === lease.propertyId)?.name || 'عقار غير معروف';
                if (!revenueReport[propName]) revenueReport[propName] = { expected: 0, collected: 0 };
                
                const leaseStartDate = new Date(lease.startDate);
                const leaseEndDate = new Date(lease.endDate);

                // Calculate expected rent within the filter period
                // Simplified: counts full months within filter period. More complex logic needed for partial months.
                for (let d = new Date(leaseStartDate); d <= leaseEndDate; d.setMonth(d.getMonth() + 1)) {
                    if ((!sDate || d >= sDate) && (!eDate || d <= eDate)) {
                         revenueReport[propName].expected += lease.rentAmount; // Assuming monthly for simplicity
                    }
                }
            });
            mockPaymentsData.forEach(payment => {
                const lease = mockLeasesData.find(l => l.id === payment.leaseAgreementId);
                if (!lease || (filterPropertyId && lease.propertyId !== filterPropertyId)) return;
                const paymentDate = new Date(payment.paymentDate);
                if ((!sDate || paymentDate >= sDate) && (!eDate || paymentDate <= eDate)) {
                    const propName = mockPropertiesData.find(p => p.id === lease.propertyId)?.name || 'عقار غير معروف';
                     if (!revenueReport[propName]) revenueReport[propName] = { expected: 0, collected: 0 };
                    revenueReport[propName].collected += payment.amountPaid;
                }
            });
            data = Object.entries(revenueReport).map(([propName, amounts]) => ({
                property_name: propName,
                expected_revenue: formatCurrencyForDisplay(amounts.expected),
                collected_revenue: formatCurrencyForDisplay(amounts.collected),
                collection_rate: amounts.expected > 0 ? `${((amounts.collected / amounts.expected) * 100).toFixed(1)}%` : 'N/A',
            }));
            break;

        case 'late_payments':
            data = mockLeasesData.filter(lease => 
                lease.status === LeaseAgreementStatus.ACTIVE &&
                (!filterPropertyId || lease.propertyId === filterPropertyId)
            ).flatMap(lease => {
                const tenant = mockTenantsData.find(t => t.id === lease.tenantId);
                const property = mockPropertiesData.find(p => p.id === lease.propertyId);
                const unit = property?.units?.find(u => u.id === lease.unitId);

                return mockPaymentsData
                    .filter(p => p.leaseAgreementId === lease.id && (p.status === RentPaymentStatus.OVERDUE || (p.status === RentPaymentStatus.PENDING && new Date(p.dueDate) < today)))
                    .map(payment => {
                        const dueDate = new Date(payment.dueDate);
                        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
                        if (daysOverdue >= filterDaysOverdue) {
                            return {
                                tenant_name: tenant?.fullNameAr || 'مستأجر غير معروف',
                                property_name: property?.name || 'عقار غير معروف',
                                unit_number: unit?.unitNumber || (property?.type !== PropertyType.BUILDING ? 'وحدة وحيدة' : '-'),
                                lease_contract_number: lease.contractNumber,
                                overdue_amount: formatCurrencyForDisplay(payment.amountDue - (payment.amountPaid || 0)),
                                due_date: formatDateForDisplay(payment.dueDate),
                                days_overdue: daysOverdue,
                                tenant_phone: tenant?.phone || '-',
                            };
                        }
                        return null;
                    }).filter(item => item !== null);
            });
            title += ` (حد أدنى ${filterDaysOverdue} أيام تأخير)`;
            break;

        case 'lease_expiry':
            data = mockLeasesData.filter(lease => {
                if (filterPropertyId && lease.propertyId !== filterPropertyId) return false;
                const endDateLease = new Date(lease.endDate);
                endDateLease.setHours(23,59,59,999); // Ensure end of day for comparison

                switch (filterLeaseExpiryPeriod) {
                    case 'expired': return endDateLease < today;
                    case 'next_30_days': 
                        const thirtyDays = new Date(today); thirtyDays.setDate(today.getDate() + 30);
                        return endDateLease >= today && endDateLease <= thirtyDays;
                    case 'next_60_days':
                        const sixtyDays = new Date(today); sixtyDays.setDate(today.getDate() + 60);
                        return endDateLease > new Date(new Date(today).setDate(today.getDate() + 30)) && endDateLease <= sixtyDays;
                    case 'next_90_days':
                        const ninetyDays = new Date(today); ninetyDays.setDate(today.getDate() + 90);
                        return endDateLease > new Date(new Date(today).setDate(today.getDate() + 60)) && endDateLease <= ninetyDays;
                    default: return false;
                }
            }).map(lease => {
                const tenant = mockTenantsData.find(t => t.id === lease.tenantId);
                const property = mockPropertiesData.find(p => p.id === lease.propertyId);
                const unit = property?.units?.find(u => u.id === lease.unitId);
                return {
                    tenant_name: tenant?.fullNameAr || 'مستأجر غير معروف',
                    property_name: property?.name || 'عقار غير معروف',
                    unit_number: unit?.unitNumber || (property?.type !== PropertyType.BUILDING ? 'وحدة وحيدة' : '-'),
                    lease_contract_number: lease.contractNumber,
                    expiry_date: formatDateForDisplay(lease.endDate),
                    rent_amount: formatCurrencyForDisplay(lease.rentAmount),
                    status: lease.status,
                };
            });
            title += ` (حسب فترة: ${leaseExpiryPeriodOptions.find(o => o.value === filterLeaseExpiryPeriod)?.label})`;
            break;

        default:
            data = [];
            title = "يرجى اختيار نوع تقرير صالح.";
            break;
    }

    setGeneratedReportTitle(title);
    setGeneratedReportData(data);
    setReportGenerated(true);
  }, [selectedReportType, filterPropertyId, filterStartDate, filterEndDate, filterDaysOverdue, filterLeaseExpiryPeriod]);

  const handlePrintReport = () => {
    window.print();
  };

  const renderReportTable = () => {
    if (!reportGenerated) return null;
    if (generatedReportData.length === 0) {
      return <p className="text-center text-gray-500 py-6">لا توجد بيانات لعرضها لهذا التقرير والفلاتر المحددة.</p>;
    }
    const headers = Object.keys(generatedReportData[0] || {}).map(key => 
        key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // Simple formatter for keys
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-100 dark:bg-dm-card/80">
            <tr>
              {headers.map(header => <th key={header} className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-300">{header}</th>)}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dm-background divide-y divide-gray-200 dark:divide-gray-600">
            {generatedReportData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-dm-card/60">
                {Object.values(row).map((value: any, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-dm-text">{String(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <PresentationChartLineIcon className="w-8 h-8 text-primary me-3" />
        <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">تقارير العقارات والإيجارات</h1>
      </div>

      <Card className="bg-blue-50 dark:bg-dm-card/30 border-blue-200 dark:border-blue-700/50 report-selection-card">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 dark:text-blue-300 mb-1">تحليلات مفصلة لأداء محفظتك العقارية</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                    حدد نوع التقرير والفلاتر المناسبة لاستعراض بيانات محفظتك العقارية.
                </p>
            </div>
        </div>
      </Card>

      <Card title="اختيار التقرير والفلاتر" className="report-selection-card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select label="نوع التقرير" value={selectedReportType} onChange={e => setSelectedReportType(e.target.value)} options={reportTypes} />
          <Select label="العقار (اختياري)" value={filterPropertyId} onChange={e => setFilterPropertyId(e.target.value)} options={propertyOptions} />
        
          {(selectedReportType === 'revenue' || selectedReportType === 'late_payments') && (
            <>
              <Input label="من تاريخ" type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
              <Input label="إلى تاريخ" type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
            </>
          )}
          {selectedReportType === 'late_payments' && (
            <Input label="أيام التأخير (حد أدنى)" type="number" value={filterDaysOverdue.toString()} onChange={e => setFilterDaysOverdue(parseInt(e.target.value) || 0)} />
          )}
          {selectedReportType === 'lease_expiry' && (
            <Select label="فترة انتهاء العقد" value={filterLeaseExpiryPeriod} onChange={e => setFilterLeaseExpiryPeriod(e.target.value)} options={leaseExpiryPeriodOptions} />
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <Button onClick={handleGenerateReport} variant="primary">إنشاء التقرير</Button>
        </div>
      </Card>

      {reportGenerated && (
        <Card title={generatedReportTitle || "نتائج التقرير"} className="printable-report-wrapper">
            <div className="report-print-header print-only"> {/* This will only be visible on print */}
                <h1>{generatedReportTitle}</h1>
            </div>
            {renderReportTable()}
            <div className="mt-6 flex justify-end print-report-button">
                <Button onClick={handlePrintReport} variant="outline" leftIcon={<PrinterIcon className="w-4"/>}>طباعة التقرير</Button>
            </div>
        </Card>
      )}
    </div>
  );
};

export default PropertySpecificReportsPage;