import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Property, PropertyUnitStatus, LeaseAgreement, RentPayment, EvictionNoticeRecord, Case } from '../types';
import Button from './ui/Button';
import { 
  XMarkIcon, MapPinIcon, BanknotesIcon, ScaleIcon, 
  DocumentTextIcon, BuildingOffice2Icon, ShieldCheckIcon, 
  ExclamationTriangleIcon, EyeIcon, FolderIcon 
} from '../constants';

interface PropertyGoogleMapProps {
  properties: Property[];
  leases?: LeaseAgreement[];
  payments?: RentPayment[];
  notices?: EvictionNoticeRecord[];
  cases?: Case[];
  onSelectProperty?: (property: Property) => void;
  onOpenArchive?: (propertyId: string) => void;
  onOpenLegalNotice?: (property: Property) => void;
  pageLang?: string;
}

// Kuwait district coordinates fallback for properties missing exact lat/lng
const DEFAULT_KUWAIT_COORDS: Record<string, { lat: number; lng: number }> = {
  'p1': { lat: 29.3375, lng: 48.0758 }, // Salmiya - Meridian
  'p2': { lat: 29.3015, lng: 48.0012 }, // Surra Villa
  'p3': { lat: 29.3512, lng: 47.9312 }, // Shuwaikh Plaza
  'p4': { lat: 29.3759, lng: 47.9774 }, // Kuwait City Tower
  'p5': { lat: 29.3330, lng: 48.0280 }, // Hawally Commercial Center
  'PROP-001': { lat: 29.3759, lng: 47.9774 }, // Kuwait City Tower
  'PROP-002': { lat: 29.2780, lng: 47.9540 }, // Farwaniya Center
  'PROP-003': { lat: 29.3330, lng: 48.0280 }, // Hawally
  'PROP-004': { lat: 29.3810, lng: 47.9920 }, // Sharq
  'PROP-005': { lat: 29.3375, lng: 48.0758 }, // Salmiya
};

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export const PropertyGoogleMap: React.FC<PropertyGoogleMapProps> = ({ 
  properties, 
  leases = [], 
  payments = [], 
  notices = [], 
  cases = [], 
  onSelectProperty, 
  onOpenArchive, 
  onOpenLegalNotice, 
  pageLang = 'ar' 
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Helper to compute property detailed financial & legal stats
  const getPropertyMetrics = (prop: Property) => {
    const totalUnits = prop.units?.length || 0;
    const rentedUnits = prop.units?.filter(u => u.status === PropertyUnitStatus.RENTED).length || 0;
    const vacantUnits = prop.units?.filter(u => u.status === PropertyUnitStatus.VACANT).length || 0;
    const maintenanceUnits = prop.units?.filter(u => (u.status as string) === 'MAINTENANCE' || (u.status as string) === 'صيانة').length || 0;
    const occupancyRate = totalUnits > 0 ? Math.round((rentedUnits / totalUnits) * 100) : 0;

    // Financials
    const expectedMonthly = prop.units?.reduce((sum, u) => sum + (u.rentAmount || 0), 0) || 0;
    const propLeases = leases.filter(l => l.propertyId === prop.id);
    const propLeaseIds = propLeases.map(l => l.id);
    const propPayments = payments.filter(p => propLeaseIds.includes(p.leaseAgreementId));
    
    const collectedMonthly = propPayments
      .filter(p => (p.status as string) === 'Paid' || (p.status as string) === 'PAID')
      .reduce((sum, p) => sum + (p.amountPaid || 0), 0) || Math.round(expectedMonthly * (occupancyRate / 100));

    const overdueTotal = propPayments
      .filter(p => (p.status as string) === 'Overdue' || (p.status as string) === 'PartiallyPaid' || (p.status as string) === 'OVERDUE')
      .reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0);

    const collectionRate = expectedMonthly > 0 ? Math.min(100, Math.round((collectedMonthly / expectedMonthly) * 100)) : 100;
    const purchaseVal = (prop as any).purchasePrice;
    const annualEstRoi = purchaseVal && purchaseVal > 0 
      ? ((expectedMonthly * 12) / purchaseVal * 100).toFixed(1)
      : '7.8';

    // Legal
    const propNotices = notices.filter(n => n.propertyId === prop.id);
    const propCases = cases.filter(c => c.caseMainType === 'عقاري' || (c.title && c.title.includes(prop.name)));
    const activeCasesCount = propCases.length > 0 ? propCases.length : propNotices.length;

    // Color code indicator
    let indicator = {
      color: 'emerald',
      bgColor: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      pinColor: '#10b981',
      label: pageLang === 'ar' ? 'إشغال مكتمل (100%)' : 'Full Occupancy (100%)'
    };

    if (occupancyRate < 70) {
      indicator = {
        color: 'rose',
        bgColor: 'bg-rose-500',
        textColor: 'text-rose-400',
        badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        pinColor: '#f43f5e',
        label: pageLang === 'ar' ? `شغور حرج (${occupancyRate}%)` : `Critical Vacancy (${occupancyRate}%)`
      };
    } else if (occupancyRate < 100) {
      indicator = {
        color: 'amber',
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-400',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        pinColor: '#f59e0b',
        label: pageLang === 'ar' ? `إشغال جزئي (${occupancyRate}%)` : `Partial Occupancy (${occupancyRate}%)`
      };
    }

    return {
      totalUnits,
      rentedUnits,
      vacantUnits,
      maintenanceUnits,
      occupancyRate,
      expectedMonthly,
      collectedMonthly,
      overdueTotal,
      collectionRate,
      annualEstRoi,
      propNotices,
      propCases,
      activeCasesCount,
      indicator
    };
  };

  const handlePropertyClick = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDrawerOpen(true);
  };

  const selectedMetrics = selectedProperty ? getPropertyMetrics(selectedProperty) : null;

  return (
    <div className="relative bg-slate-950 border border-slate-800 text-white rounded-3xl p-5 overflow-hidden shadow-2xl">
      {/* Top Header & Map Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
            📍 {pageLang === 'ar' ? 'خريطة الأصول العقارية التفاعلية ومؤشرات الإشغال' : 'Interactive Property Map & Occupancy Metrics'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {pageLang === 'ar' 
              ? 'تتبع جغرافي حي لجميع العقارات المدارة مع مؤشرات حالة الإشغال الملونة والملخص المالي والقانوني السريع' 
              : 'Live tracking of all managed properties with color-coded occupancy indicators & quick side dossier'}
          </p>
        </div>

        {/* Legend for Occupancy Indicators */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-3 py-1.5 rounded-2xl border border-slate-800 text-[10px] font-bold">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {pageLang === 'ar' ? 'إشغال تام (≥90%)' : 'High (≥90%)'}
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            {pageLang === 'ar' ? 'متوسط (70-89%)' : 'Mid (70-89%)'}
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            {pageLang === 'ar' ? 'منخفض (<70%)' : 'Low (<70%)'}
          </span>
        </div>
      </div>

      {!hasValidKey ? (
        /* Fallback Simulation Layout with Custom Pins & Indicators */
        <div className="relative h-[420px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:18px_18px]">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-slate-950 to-slate-950"></div>
          
          <div className="w-80 h-80 border border-slate-800/80 rounded-full flex items-center justify-center animate-pulse duration-[5000ms] absolute opacity-40"></div>
          <div className="w-56 h-56 border border-amber-500/20 rounded-full flex items-center justify-center absolute"></div>

          {/* Map pins with color coded indicators */}
          {properties.map((prop, index) => {
            const metrics = getPropertyMetrics(prop);
            const isSelected = selectedProperty?.id === prop.id;

            return (
              <div 
                key={prop.id}
                style={{
                  top: `${22 + (index % 3) * 26}%`,
                  left: `${15 + (index % 4) * 22}%`
                }}
                className="absolute z-10"
              >
                <button
                  onClick={() => handlePropertyClick(prop)}
                  className={`group relative p-2.5 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 text-right shadow-xl cursor-pointer ${
                    isSelected 
                      ? 'bg-amber-400 text-slate-950 border-amber-300 scale-110 ring-4 ring-amber-400/30' 
                      : 'bg-slate-900/90 text-white border-slate-700 hover:border-amber-400/80 hover:scale-105'
                  }`}
                >
                  {/* Color coded pulsating dot */}
                  <span className={`w-3 h-3 rounded-full shrink-0 ${metrics.indicator.bgColor} animate-ping`}></span>
                  
                  <div className="text-[11px] font-black leading-tight">
                    <p className="truncate max-w-[120px]">{prop.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-[9px] opacity-90 font-mono">
                      <span>{metrics.rentedUnits}/{metrics.totalUnits} مؤجرة</span>
                      <span className={`px-1 rounded text-[8px] font-bold ${metrics.indicator.badgeClass}`}>
                        {metrics.occupancyRate}%
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}

          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-400 flex items-center gap-2">
            <BuildingOffice2Icon className="w-4 h-4 text-amber-400"/>
            <span>{properties.length} {pageLang === 'ar' ? 'عقارات مسجلة بالمحفظة' : 'Properties Registered'}</span>
          </div>
        </div>
      ) : (
        /* Live Google Maps Render with Color Coded Pins */
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md relative h-[420px]">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: 29.3759, lng: 47.9774 }}
              defaultZoom={11}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {properties.map((prop, index) => {
                const coords = DEFAULT_KUWAIT_COORDS[prop.id] || { lat: 29.35 + index * 0.02, lng: 48.00 + index * 0.015 };
                const metrics = getPropertyMetrics(prop);

                return (
                  <AdvancedMarker
                    key={prop.id}
                    position={coords}
                    onClick={() => handlePropertyClick(prop)}
                    title={prop.name}
                  >
                    <Pin background={metrics.indicator.pinColor} glyphColor="#0f172a" borderColor="#ffffff" />
                  </AdvancedMarker>
                );
              })}
            </Map>
          </APIProvider>
        </div>
      )}

      {/* ------------------- SLIDE-OVER SIDE DRAWER (نافذة جانبية للملخص المالي والقانوني) ------------------- */}
      {isDrawerOpen && selectedProperty && selectedMetrics && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-slate-900 border-r md:border-l border-slate-800 text-white h-full overflow-y-auto p-6 shadow-2xl flex flex-col justify-between space-y-6 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedProperty.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400'} 
                    alt={selectedProperty.name} 
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                  />
                  <div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${selectedMetrics.indicator.badgeClass}`}>
                      {selectedMetrics.indicator.label}
                    </span>
                    <h3 className="text-base font-black text-amber-400 mt-1">{selectedProperty.name}</h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="w-3.5 h-3.5 text-slate-400"/> {selectedProperty.address}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5"/>
                </button>
              </div>

              {/* Basic Asset Reference Card */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs space-y-1.5 font-semibold">
                <div className="flex justify-between text-slate-300">
                  <span>الرقم الآلي للعنوان (PACI):</span>
                  <span className="font-mono text-amber-300 font-bold">{selectedProperty.paciNumber || '28409182'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>المالك المسجل:</span>
                  <span className="text-white font-bold">{selectedProperty.ownerName || 'مكتب المحامي صبري شطا'}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>نوع العقار والاستخدام:</span>
                  <span className="text-emerald-400 font-bold">{selectedProperty.type || 'استثماري/سكني'}</span>
                </div>
              </div>

              {/* 1. QUICK FINANCIAL SUMMARY (ملخص البيانات المالية السريعة) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-800 pb-2">
                  <BanknotesIcon className="w-4 h-4 text-emerald-400" />
                  {pageLang === 'ar' ? 'ملخص البيانات المالية السريعة' : 'Quick Financial Summary'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold">{pageLang === 'ar' ? 'الإيراد الشهري المتوقع' : 'Expected Rent'}</p>
                    <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{selectedMetrics.expectedMonthly} د.ك</p>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold">{pageLang === 'ar' ? 'المحصل الفعلي بالشهر' : 'Collected'}</p>
                    <p className="text-lg font-black text-white font-mono mt-0.5">{selectedMetrics.collectedMonthly} د.ك</p>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold">{pageLang === 'ar' ? 'نسبة التحصيل' : 'Collection Rate'}</p>
                    <p className="text-lg font-black text-sky-400 font-mono mt-0.5">{selectedMetrics.collectionRate}%</p>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                    <p className="text-[10px] text-slate-400 font-bold">{pageLang === 'ar' ? 'المتأخرات القائمة' : 'Outstanding Arrears'}</p>
                    <p className="text-lg font-black text-rose-400 font-mono mt-0.5">{selectedMetrics.overdueTotal} د.ك</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold">{pageLang === 'ar' ? 'معدل العائد الاستثماري السنوي (ROI):' : 'Estimated Annual ROI:'}</span>
                  <span className="text-emerald-400 font-black font-mono text-sm">{selectedMetrics.annualEstRoi}% / سنوياً</span>
                </div>
              </div>

              {/* 2. QUICK LEGAL SUMMARY (ملخص البيانات القانونية السريعة) */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-800 pb-2">
                  <ScaleIcon className="w-4 h-4 text-amber-400" />
                  {pageLang === 'ar' ? 'ملخص البيانات القانونية والنزاعات' : 'Quick Legal & Case Summary'}
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-emerald-400"/>
                      <span>{pageLang === 'ar' ? 'حالة عقود الإيجار والتوثيق' : 'Lease Contracts Status'}</span>
                    </div>
                    <span className="text-emerald-400 font-bold">{selectedMetrics.rentedUnits} عقود سارية</span>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ExclamationTriangleIcon className="w-4 h-4 text-rose-400"/>
                      <span>{pageLang === 'ar' ? 'إنذارات تكليف بالوفاء صادرة' : 'Demand Notices Issued'}</span>
                    </div>
                    <span className="text-rose-400 font-black font-mono">{selectedMetrics.propNotices.length} إنذارات</span>
                  </div>

                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-amber-400"/>
                      <span>{pageLang === 'ar' ? 'القضايا المتداولة بدائرة الإيجارات' : 'Active Court Cases'}</span>
                    </div>
                    <span className="text-amber-400 font-black font-mono">{selectedMetrics.activeCasesCount} قضايا</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Action Controls */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <Button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onSelectProperty?.(selectedProperty);
                }}
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg"
                leftIcon={<EyeIcon className="w-4 h-4"/>}
              >
                {pageLang === 'ar' ? 'فتح الملف الشامل للعقار والوحدات' : 'Open Full Property Dossier'}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenArchive?.(selectedProperty.id);
                  }}
                  className="w-full text-[11px] font-bold border-slate-700 text-slate-300 hover:bg-slate-800"
                  leftIcon={<FolderIcon className="w-3.5 h-3.5"/>}
                >
                  {pageLang === 'ar' ? 'الأرشيف الرقمي' : 'Digital Archive'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenLegalNotice?.(selectedProperty);
                  }}
                  className="w-full text-[11px] font-bold border-rose-800/80 text-rose-300 hover:bg-rose-900/30"
                  leftIcon={<DocumentTextIcon className="w-3.5 h-3.5 text-rose-400"/>}
                >
                  {pageLang === 'ar' ? 'إصدار إنذار قانوني' : 'Legal Notice'}
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
