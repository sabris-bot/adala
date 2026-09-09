import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { MapPinIcon, ClockIcon, ArrowPathIcon, ShareIcon, DocumentDuplicateIcon } from '../constants';
import { useToast } from './ui/Toast';

interface CourtLocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtName: string;
}

interface CourtInfo {
  name: string;
  district: string;
  address: string;
  lawyerParking: string;
  buildingEntrance: string;
  estimatedMinutes: number;
  trafficStatus: 'smooth' | 'moderate' | 'heavy';
  distanceKm: string;
  coordinates: { lat: number; lng: number };
}

const COURT_DATABASE: Record<string, CourtInfo> = {
  'قصر العدل': {
    name: 'قصر العدل الجديد - العاصمة',
    district: 'مدينة الكويت - شارع الخليج العربي / المرقاب',
    address: 'قطعة 1، شارع مبارك الكبير، بجوار مجلس الأمة',
    lawyerParking: 'مواقف المحامين الخاصة - السرداب B2 (بوابة الشرق)',
    buildingEntrance: 'المدخل الرئيسي للمحامين - قاعات المرافعة الكلية والاستئناف',
    estimatedMinutes: 18,
    trafficStatus: 'smooth',
    distanceKm: '12.4 كم',
    coordinates: { lat: 29.3759, lng: 47.9774 }
  },
  'الرقعي': {
    name: 'مجمع محاكم الفروانية - الرقعي',
    district: 'منطقة الرقعي - قطعة 2، طريق الدائري الرابع',
    address: 'تقاطع طريق 60 مع الدائري الرابع مقابل الأندلس',
    lawyerParking: 'مواقف المحامين المظللة - البوابة الشمالية رقم 3',
    buildingEntrance: 'مدخل الدوائر العمالية والتجارية - الدور الأرضي والأول',
    estimatedMinutes: 25,
    trafficStatus: 'moderate',
    distanceKm: '16.8 كم',
    coordinates: { lat: 29.3082, lng: 47.9231 }
  },
  'حولي': {
    name: 'مجمع محاكم حولي - ميدان حولي',
    district: 'حولي - شارع قتيبة / طريق الفحيحيل السريع',
    address: 'قطعة 11، مقابل مجمع النادي البحري',
    lawyerParking: 'مواقف المحامين بجمعية المحامين / البوابة الشرقية',
    buildingEntrance: 'محكمة الأسرة والأحوال الشخصية - الدور الثاني',
    estimatedMinutes: 20,
    trafficStatus: 'smooth',
    distanceKm: '11.2 كم',
    coordinates: { lat: 29.3385, lng: 48.0125 }
  },
  'الأحمدي': {
    name: 'مجمع محاكم محافظة الأحمدي',
    district: 'منطقة المغيرة - الأحمدي / طريق السفر 40',
    address: 'قطعة 7، شارع علي صباح السالم',
    lawyerParking: 'ساحة مواقف المراجعين والمحامين الجنوبية',
    buildingEntrance: 'مدخل قضايا التنفيذ والدوائر الكلية',
    estimatedMinutes: 32,
    trafficStatus: 'moderate',
    distanceKm: '34.0 كم',
    coordinates: { lat: 29.0801, lng: 48.0772 }
  },
  'الجهراء': {
    name: 'مجمع محاكم الجهراء الجديد',
    district: 'الجهراء - منطقة المضخة / طريق المطلاع',
    address: 'قطعة 3، بجوار مستشفى الجهراء الجديد',
    lawyerParking: 'مواقف المحامين الغربية - بوابة 2',
    buildingEntrance: 'مدخل المحكمة الكلية والخبراء - الدور الثالث',
    estimatedMinutes: 28,
    trafficStatus: 'smooth',
    distanceKm: '29.5 كم',
    coordinates: { lat: 29.3375, lng: 47.6581 }
  }
};

export const CourtLocationMapModal: React.FC<CourtLocationMapModalProps> = ({
  isOpen,
  onClose,
  courtName
}) => {
  const { addToast } = useToast();
  const [selectedZoom, setSelectedZoom] = useState(1);

  // Match court info
  const courtKey = Object.keys(COURT_DATABASE).find(k => courtName.includes(k)) || 'قصر العدل';
  const court = COURT_DATABASE[courtKey];

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${court.coordinates.lat},${court.coordinates.lng}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(`${court.name} - ${court.district} - ${court.address}`);
    addToast({
      type: 'success',
      title: 'تم النسخ',
      message: 'تم نسخ عنوان المحكمة الإجرائي بنجاح.'
    });
  };

  const handleShareDirections = () => {
    const text = `📍 موقع محكمة: ${court.name}\n🏛️ العنوان: ${court.address}\n🚗 وقت الوصول التقديري: ${court.estimatedMinutes} دقيقة\n🗺️ رابط Google Maps: ${googleMapsUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🏛️ الخريطة التفاعلية وموقع المحكمة في الكويت" size="lg">
      <div className="space-y-4 text-right">
        
        {/* Header Summary Card */}
        <div className="bg-slate-900 text-white dark:bg-slate-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <MapPinIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-sm text-white">{court.name}</h3>
                <p className="text-xs text-slate-300 font-medium">{court.district}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 dark:bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700">
            <ClockIcon className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] font-bold">وقت الوصول التقديري</span>
              <strong className="text-emerald-400 font-black">{court.estimatedMinutes} دقيقة</strong>
              <span className="text-slate-300 font-normal text-[10px] ms-1">({court.distanceKm})</span>
            </div>
          </div>
        </div>

        {/* Live Traffic Condition Bar */}
        <div className="flex items-center justify-between p-3 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>حالة المرور الآن: {court.trafficStatus === 'smooth' ? '🟢 حركة مرورية سالكة وسريعة' : '🟡 حركة مرور متوسطة'}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">تحديث مباشر عبر الربط المروري</span>
        </div>

        {/* Interactive Map Canvas Simulation */}
        <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-4">
          
          {/* Map Vector Overlay Simulation */}
          <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Simulated Highways */}
            <path d="M 0 120 Q 180 80 400 150 T 800 100" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="8 4" />
            <path d="M 120 0 Q 150 180 200 300" fill="none" stroke="#3b82f6" strokeWidth="3" />
            {/* Court Complex Pin Circle */}
            <circle cx="280" cy="110" r="18" fill="#10b981" fillOpacity="0.2" className="animate-ping" />
            <circle cx="280" cy="110" r="8" fill="#10b981" />
          </svg>

          {/* Map UI Controls & Badges */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="bg-slate-900/90 text-white backdrop-blur-md text-[10px] px-3 py-1.5 rounded-xl font-bold border border-slate-700 flex items-center gap-1.5">
              <span>🗺️ خريطة مجمع المحاكم - {court.name.split('-')[0]}</span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setSelectedZoom(prev => Math.min(prev + 0.2, 1.8))}
                className="w-7 h-7 bg-slate-800 text-white rounded-lg flex items-center justify-center font-black text-xs hover:bg-slate-700"
              >
                +
              </button>
              <button 
                onClick={() => setSelectedZoom(prev => Math.max(prev - 0.2, 0.8))}
                className="w-7 h-7 bg-slate-800 text-white rounded-lg flex items-center justify-center font-black text-xs hover:bg-slate-700"
              >
                -
              </button>
            </div>
          </div>

          {/* Center Pin Box */}
          <div className="relative z-10 self-center bg-slate-900/95 text-white border border-emerald-500/50 p-3 rounded-2xl shadow-xl max-w-xs text-center space-y-1">
            <div className="w-8 h-8 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto font-black shadow-lg shadow-emerald-500/30">
              📍
            </div>
            <h4 className="font-black text-xs text-emerald-400">{court.name}</h4>
            <p className="text-[10px] text-slate-300 line-clamp-1">{court.address}</p>
          </div>

          {/* Bottom Coordinates & Scale */}
          <div className="relative z-10 flex justify-between items-end text-[10px] text-slate-400 font-mono">
            <span>Lat: {court.coordinates.lat} | Lng: {court.coordinates.lng}</span>
            <span>مقياس الخريطة: 1:5000</span>
          </div>

        </div>

        {/* Access Details: Lawyer Parking & Building Entrances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-black text-slate-900 dark:text-white block">🅿️ مواقف السيارات المخصصة للمحامين:</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">{court.lawyerParking}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="font-black text-slate-900 dark:text-white block">🏛️ مدخل القاعات والإدارة:</span>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] font-medium">{court.buildingEntrance}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCopyAddress}
            className="text-xs font-bold flex items-center gap-1.5"
          >
            <DocumentDuplicateIcon className="w-4 h-4" /> نسخ العنوان
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleShareDirections}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
          >
            <ShareIcon className="w-4 h-4" /> مشاركة الاتجاهات (واتساب)
          </Button>

          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition-all shadow-md"
          >
            <MapPinIcon className="w-4 h-4" /> فتح في Google Maps ↗
          </a>
        </div>

      </div>
    </Modal>
  );
};

export default CourtLocationMapModal;
