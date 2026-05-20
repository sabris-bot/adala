import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import { Badge } from '../components/ui/Badge';
import SignaturePad from '../components/ui/SignaturePad';
import { useToast } from '../components/ui/Toast';
import { 
    User as UserIcon, 
    Building2, 
    Shield, 
    Settings, 
    PenTool, 
    Activity, 
    Bell, 
    Lock, 
    Mail, 
    Phone, 
    MapPin, 
    Globe, 
    Award,
    CheckCircle2, 
    RefreshCw, 
    Image as ImageIcon,
    Download,
    Trash2,
    Eye,
    EyeOff
} from 'lucide-react';

export default function ProfilePage() {
    const { t, i18n } = useTranslation();
    const { addToast } = useToast();

    // Active visual tab
    const [activeTab, setActiveTab] = useState<'profile' | 'office' | 'signature' | 'permissions' | 'preferences' | 'security'>('profile');

    // Load or initialize state from localStorage to ensure synchronization
    const [personalInfo, setPersonalInfo] = useState(() => {
        const saved = localStorage.getItem('profile_personal_info');
        if (saved) return JSON.parse(saved);
        return {
            fullName: 'أ. صبري شطا',
            email: 'sabri.s@alwagayan.com',
            phone: '+965 2244 8877',
            spec: 'القضاء العام والتحكيم التجاري الدولي',
            bio: 'محامٍ مقيد لدى محكمة التمييز والدستورية في الكويت، ذو خبرة تمتد لأكثر من عشرين عاماً في صياغة العقود المتكاملة والتقاضي وحل النزاعات المعقدة.',
            roleTitle: 'شريك شرفي - المدير العام',
            avatar: 'https://picsum.photos/seed/sabri/200/200'
        };
    });

    const [officeInfo, setOfficeInfo] = useState(() => {
        const saved = localStorage.getItem('profile_office_info');
        if (saved) return JSON.parse(saved);
        return {
            name: 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية',
            license: 'ADV-2024-9981',
            unifiedId: '7766554433',
            address: 'مدينة الكويت، شرق، برج الراية، الدور 45',
            phone: '+965 2244 8877',
            email: 'info@shatta-law.com',
            website: 'www.shatta-law.com',
            disclaimer: 'هذه وثيقة رسمية وسرية صادرة عن مكتب صبري شطا للمحاماة، مخصصة للمقاصد القانونية المعتمدة فقط ويمنع تداولها خارج النطاق القانوني المصرح به.'
        };
    });

    const [preferenceInfo, setPreferenceInfo] = useState(() => {
        const saved = localStorage.getItem('profile_preferences');
        if (saved) return JSON.parse(saved);
        return {
            lang: i18n.language || 'ar',
            currency: 'KWD',
            dateFormat: 'DD/MM/YYYY',
            autoSave: true,
            smartSuggestions: true,
            emailAlerts: true,
            smsAlerts: true,
            whatsappAlerts: false
        };
    });

    const [signatureData, setSignatureData] = useState(() => {
        return localStorage.getItem('profile_signature_data') || '';
    });

    const [isDrawingSig, setIsDrawingSig] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Security Passwords mockup form
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Mock interactive data
    const permissions = [
        { key: 'admin', label: 'التحكم الإداري الأعلى (Super Admin)', desc: 'صلاحيات تعديل وحذف وإضافة على مستوى قاعدة البيانات والمنظومة بالكامل.', active: true },
        { key: 'fin', label: 'إدارة السجل المالي والفوترة', desc: 'استعراض الحسابات والمصروفات والرسوم القضائية والتقارير المالية.', active: true },
        { key: 'cases', label: 'صياغة ومتابعة ملفات القضايا', desc: 'إدارة الموكلين والأطراف ومحاضر الجلسات والتحقيقات الرسمية.', active: true },
        { key: 'ai', label: 'استخدام رادارات الذكاء الاصطناعي', desc: 'تحليل العقود الذكية وترخيص استخدام Gemini لصياغة المستندات الفورية.', active: true },
        { key: 'human', label: 'شؤون المحامين والموظفين', desc: 'إدارة سجلات الحضور والإيرادات والمكافآت التلقائية والقرارات التأديبية.', active: true },
        { key: 'delete', label: 'الحذف الآمن للملفات المؤرشفة', desc: 'مسح أو أرشفة وثائق القضايا التي تم الحكم فيها بشكل نهائي.', active: false }
    ];

    const activityLogs = [
        { id: 1, action: 'تعديل التوقيع الإلكتروني المعتمد للمستندات', device: 'Chrome - macOS Catalina', ip: '188.236.41.98', date: 'اليوم، 14:32' },
        { id: 2, action: 'حفظ إعدادات الهوية والتسميات الرسمية للمكتب', device: 'Safari - iPad Pro', ip: '188.236.41.98', date: 'اليوم، 11:15' },
        { id: 3, action: 'الموافقة على مسودة عقد الشراكة التجارية (عقد-498)', device: 'Firefox - Windows 11', ip: '37.34.112.5', date: 'أمس، 18:40' },
        { id: 4, action: 'تسجيل دخول ناجح إلى النظام الإداري (عدالة)', device: 'Chrome - macOS Catalina', ip: '188.236.41.98', date: '2026-05-19، 09:00' }
    ];

    // Persist changes to local storage & trigger change events for context sync
    const handleSaveProfile = () => {
        localStorage.setItem('profile_personal_info', JSON.stringify(personalInfo));
        // Push event so Header or other components know about the update immediately
        window.dispatchEvent(new Event('profile_updated'));
        addToast({
            type: 'success',
            title: 'تم حفظ الملف الشخصي',
            message: 'تم تحديث بياناتك الشخصية بنجاح ومزامنتها عبر المنظومة.'
        });
    };

    const handleSaveOffice = () => {
        localStorage.setItem('profile_office_info', JSON.stringify(officeInfo));
        // Crucial: Update the global OFFICE_NAME equivalent if any components refer to it
        window.dispatchEvent(new Event('office_info_updated'));
        addToast({
            type: 'success',
            title: 'تم حفظ بيانات المكتب',
            message: 'تم تحديث الاسم المعتمد للمكتب وتفاصيل المقر، وتطبيقها فوراً على المستندات والتقارير المطبوعة.'
        });
    };

    const handleSavePreferences = () => {
        localStorage.setItem('profile_preferences', JSON.stringify(preferenceInfo));
        if (preferenceInfo.lang !== i18n.language) {
            i18n.changeLanguage(preferenceInfo.lang);
        }
        addToast({
            type: 'success',
            title: 'تم تحديث المفضلات',
            message: 'تم ضبط اللغة وتفضيلات العرض والمظهر العام.'
        });
    };

    const handleSaveSignature = (dataUrl: string) => {
        setSignatureData(dataUrl);
        localStorage.setItem('profile_signature_data', dataUrl);
        setIsDrawingSig(false);
        window.dispatchEvent(new Event('signature_updated'));
        addToast({
            type: 'success',
            title: 'تم اعتماد توقيعك',
            message: 'توقيعك الإلكتروني متاح الآن للتحميل التلقائي وإدراجه فوراً في العقود والمحاضر الرسمية.'
        });
    };

    const handleClearSignature = () => {
        setSignatureData('');
        localStorage.removeItem('profile_signature_data');
        window.dispatchEvent(new Event('signature_updated'));
        addToast({
            type: 'info',
            title: 'تم مسح التوقيع',
            message: 'تم إزالة التوقيع بنجاح.'
        });
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            addToast({ type: 'error', title: 'خطأ في الإدخال', message: 'يرجى ملء جميع حقول كلمات المرور.' });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            addToast({ type: 'error', title: 'تأكيد كلمة المرور', message: 'كلمتا المرور الجديدتان غير متطابقتين.' });
            return;
        }
        addToast({
            type: 'success',
            title: 'تغيير كلمة المرور',
            message: 'تم تحديث كلمة المرور للأمان الإداري الخاص بك.'
        });
        setPasswords({ current: '', new: '', confirm: '' });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-32 px-4" dir="rtl">
            {/* Header Identity Card */}
            <div className="relative bg-gradient-to-l from-primary via-primary/95 to-primary-dark text-white rounded-[40px] p-8 md:p-10 shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-12 -translate-y-12 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full translate-y-36 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
                    {/* User Avatar Frame */}
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-[28px] overflow-hidden border-4 border-white/20 shadow-2xl bg-primary-light transition-transform duration-500 group-hover:scale-105">
                            <img 
                                src={personalInfo.avatar} 
                                alt={personalInfo.fullName} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <div className="absolute -bottom-2 -left-2 bg-accent text-slate-900 p-2 rounded-xl shadow-lg cursor-pointer hover:bg-accent-dark transition-all" title="تغيير الصورة">
                            <ImageIcon className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Meta information */}
                    <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-3xl font-black tracking-tight">{personalInfo.fullName}</h1>
                            <Badge 
                                text={personalInfo.roleTitle} 
                                className="bg-accent text-primary-dark font-black px-3 py-1 text-xs rounded-lg shadow-sm border-none" 
                            />
                            <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                نشط الآن
                            </span>
                        </div>

                        <p className="text-sm text-slate-100 font-medium max-w-2xl leading-relaxed">
                            {personalInfo.spec} | {officeInfo.name}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1 text-xs text-slate-200">
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {personalInfo.email}</span>
                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {personalInfo.phone}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> الكويت</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Navigation Tabs for Profile Sections */}
            <div className="bg-white dark:bg-dm-card p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-wrap gap-1 md:gap-2 no-print z-20">
                {[
                    { id: 'profile', label: 'البيانات الشخصية', icon: UserIcon },
                    { id: 'office', label: 'ملف المكتب القانوني', icon: Building2 },
                    { id: 'signature', label: 'التوقيع والختم المعتمد', icon: PenTool },
                    { id: 'permissions', label: 'أدوار النظام والصلاحيات', icon: Shield },
                    { id: 'preferences', label: 'التفضيلات وحساب البيئة', icon: Settings },
                    { id: 'security', label: 'الأمان وسجلات النشاط', icon: Lock },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-bold rounded-xl transition-all ${
                            activeTab === tab.id
                                ? 'bg-primary text-white shadow-md shadow-primary/10'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dm-background hover:text-primary'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Contents Frame */}
            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {/* 1. PERSONAL PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-8">
                                <div className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-dm-text flex items-center gap-2">
                                        <UserIcon className="w-5 h-5 text-primary" />
                                        البيانات الشخصية والمهنية
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">إدارة معلوماتك الشخصية وحساب المحامي المعتمد الذي يظهر في النظام والمطبوعات.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="الاسم الكامل المعتمد" 
                                        value={personalInfo.fullName} 
                                        onChange={e => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <Input 
                                        label="المسمى الإداري والوظيفي" 
                                        value={personalInfo.roleTitle} 
                                        onChange={e => setPersonalInfo({...personalInfo, roleTitle: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <Input 
                                        label="عنوان البريد الإلكتروني المهني" 
                                        value={personalInfo.email} 
                                        onChange={e => setPersonalInfo({...personalInfo, email: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <Input 
                                        label="رقم الهاتف الخليوي" 
                                        value={personalInfo.phone} 
                                        onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="التخصص القانوني والبحثي الدقيق" 
                                            value={personalInfo.spec} 
                                            onChange={e => setPersonalInfo({...personalInfo, spec: e.target.value})}
                                            containerClassName="mb-0"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <TextArea 
                                            label="النبذة المهنية والمؤهلات" 
                                            value={personalInfo.bio} 
                                            onChange={e => setPersonalInfo({...personalInfo, bio: e.target.value})}
                                            rows={4}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <Button 
                                        variant="primary" 
                                        className="rounded-xl px-12 h-12 shadow-md shadow-primary/20"
                                        onClick={handleSaveProfile}
                                    >
                                        حفظ التغييرات الشخصية
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* 2. LAW OFFICE TAB - CORE SYSTEM SYNC */}
                        {activeTab === 'office' && (
                            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-8">
                                <div className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        <h2 className="text-xl font-black text-gray-900 dark:text-dm-text">بيانات ومعماريات المكتب القانوني المعتمد</h2>
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium">التحكم في بيانات المكتب الافتراضية؛ أي تعديل يتم هنا ينساب تلقائياً عبر جميع العقود، والتقارير المالية والمستندات القضائية لمنع التضارب.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="الاسم الرسمي الكامل للمنشأة القانونية" 
                                            value={officeInfo.name} 
                                            onChange={e => setOfficeInfo({...officeInfo, name: e.target.value})}
                                            containerClassName="mb-0"
                                        />
                                    </div>
                                    <Input 
                                        label="رقم الرخصة أو القيد المهني" 
                                        value={officeInfo.license} 
                                        onChange={e => setOfficeInfo({...officeInfo, license: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <Input 
                                        label="الرقم الموحد للجهة القانونية" 
                                        value={officeInfo.unifiedId} 
                                        onChange={e => setOfficeInfo({...officeInfo, unifiedId: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <Input 
                                        label="هاتف الاتصال والفاكس" 
                                        value={officeInfo.phone} 
                                        onChange={e => setOfficeInfo({...officeInfo, phone: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <Input 
                                        label="البريد الإلكتروني العام للمكتب" 
                                        value={officeInfo.email} 
                                        onChange={e => setOfficeInfo({...officeInfo, email: e.target.value})}
                                        containerClassName="mb-0"
                                    />
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="الموقع الإلكتروني الرسمي" 
                                            value={officeInfo.website} 
                                            onChange={e => setOfficeInfo({...officeInfo, website: e.target.value})}
                                            containerClassName="mb-0"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input 
                                            label="العنوان البريدي الرئيسي والمعتمد" 
                                            value={officeInfo.address} 
                                            onChange={e => setOfficeInfo({...officeInfo, address: e.target.value})}
                                            containerClassName="mb-0"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <TextArea 
                                            label="صيغة وإخلاء المسؤولية الافتراضي (الأوراق الرسمية والمخرجات)" 
                                            value={officeInfo.disclaimer} 
                                            onChange={e => setOfficeInfo({...officeInfo, disclaimer: e.target.value})}
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <Button 
                                        variant="primary" 
                                        className="rounded-xl px-12 h-12 shadow-md shadow-primary/20"
                                        onClick={handleSaveOffice}
                                    >
                                        حفظ وترحيل بيانات المنشأة
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* 3. SIGNATURE & STAMP TAB */}
                        {activeTab === 'signature' && (
                            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-8">
                                <div className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-dm-text flex items-center gap-2">
                                        <PenTool className="w-5 h-5 text-primary" />
                                        التواقيع والأختام المهنية المبرمة
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">وقع إلكترونياً هنا، أو ارفع قالب توقيعك. سيتم إدراجه فورياً وتلقائياً في ترويسات ومذيلات العقود والشهادات والتحقيقات الإدارية.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    {/* Action Board */}
                                    <div className="space-y-6">
                                        <h3 className="font-black text-slate-800 dark:text-dm-text text-sm uppercase tracking-wide">التوقيع الإلكتروني المعتمد</h3>
                                        {signatureData ? (
                                            <div className="space-y-4">
                                                <div className="border border-gray-100 dark:border-gray-700 rounded-3xl p-6 bg-slate-50 dark:bg-dm-background shadow-inner flex flex-col items-center justify-center">
                                                    <img 
                                                        src={signatureData} 
                                                        alt="التوقيع المعتمد" 
                                                        className="h-32 object-contain bg-white rounded-lg p-2 dark:bg-slate-100" 
                                                    />
                                                    <span className="text-[10px] font-bold text-gray-400 mt-2">توقيع رقمي مسجل وتلقائي</span>
                                                </div>
                                                <div className="flex gap-2 justify-center">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="border-rose-100 text-rose-500 hover:bg-rose-50 py-2 rounded-xl"
                                                        onClick={handleClearSignature}
                                                        leftIcon={<Trash2 className="w-4 h-4" />}
                                                    >
                                                        إزالة التوقيع
                                                    </Button>
                                                    <a 
                                                        href={signatureData} 
                                                        download="Sabri_Shatta_E_Signature.png" 
                                                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-xs font-bold rounded-xl transition-all"
                                                    >
                                                        <Download className="w-4 h-4" /> تحميل النسخة عالية الدقة
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-[28px] p-8 text-center bg-gray-50 dark:bg-dm-background flex flex-col items-center justify-center space-y-4">
                                                <PenTool className="w-10 h-10 text-gray-300 dark:text-gray-600 animate-pulse" />
                                                <div>
                                                    <p className="font-black text-gray-700 dark:text-dm-text text-sm">لم تقم بإعداد توقيعك بعد</p>
                                                    <p className="text-[11px] text-gray-400 mt-1 leading-normal max-w-xs mx-auto">ارسم توقيعك مباشرة لتتمكن المنظومة من تذييل مخرجاتك القانونية ومستنداتك تلقائياً.</p>
                                                </div>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm"
                                                    className="rounded-xl px-6 py-2.5 font-black shrink-0"
                                                    onClick={() => setIsDrawingSig(true)}
                                                >
                                                    البدء بالرسم الرقمي الآن
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Drawing Board or help instructions */}
                                    <div className="space-y-6">
                                        {isDrawingSig ? (
                                            <div className="border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl space-y-4">
                                                <SignaturePad 
                                                    title="المستطيل القانوني للتمثيل والتوقيع"
                                                    onSave={handleSaveSignature}
                                                    onCancel={() => setIsDrawingSig(false)}
                                                />
                                            </div>
                                        ) : (
                                            <div className="bg-primary/5 dark:bg-dm-background border border-primary/10 rounded-3xl p-6 md:p-8 space-y-4">
                                                <h4 className="font-black text-primary text-sm tracking-tight flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    قواعد استخدام التواقيع الرقمية
                                                </h4>
                                                <ul className="space-y-3 text-xs text-gray-600 dark:text-gray-300 list-decimal ps-4 leading-relaxed">
                                                    <li>يحق فقط للشريك المدير أو المحامي المالك الحساب إعداد وتغيير التواقيع المعتبرة قانونياً.</li>
                                                    <li>يتم تشفير التوقيع محلياً ويُدرج تلقائياً في قوالب الإعانات القضائية الصادرة للمحكمة، والتحقيقات، والفواتير والخطابات.</li>
                                                    <li>بموجب قوانين جمعية المحامين الكويتية وقانون المطبوعات الكويتي، يُعتبر استخدام التوقيع مفيداً للأصالة وسرعة التقاضي.</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* 4. ROLES & PERMISSIONS TAB */}
                        {activeTab === 'permissions' && (
                            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-8">
                                <div className="border-b border-gray-50 dark:border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 dark:text-dm-text flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-primary" />
                                            مصفوفة الوصول والصلاحيات الممنوحة
                                        </h2>
                                        <p className="text-xs text-gray-400 font-medium">مستويات الحماية والوصول الممنوحة لك على مستوى الإقرار الإداري للمنظومة.</p>
                                    </div>
                                    <Badge 
                                        text="دورك: مدير دائم بالنظام" 
                                        className="bg-primary hover:bg-primary-dark text-white font-black px-4 py-1.5 text-xs rounded-xl shadow-inner border-none" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {permissions.map((perm, index) => (
                                        <div 
                                            key={perm.key} 
                                            className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50 dark:bg-dm-background border border-gray-50 dark:border-gray-800 hover:border-primary/25 transition-all"
                                        >
                                            <div className="pt-0.5">
                                                {perm.active ? (
                                                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black shadow-inner">✓</span>
                                                ) : (
                                                    <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-black shadow-inner">✗</span>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-extrabold text-sm text-gray-900 dark:text-dm-text flex items-center gap-2">
                                                    {perm.label}
                                                    {perm.active ? (
                                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">مفعل</span>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase">معطل</span>
                                                    )}
                                                </h4>
                                                <p className="text-[11px] text-gray-400 leading-normal font-medium">{perm.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* 5. PREFERENCES & ENVIRONMENT TAB */}
                        {activeTab === 'preferences' && (
                            <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-8">
                                <div className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-dm-text flex items-center gap-2">
                                        <Settings className="w-5 h-5 text-primary" />
                                        إعدادات الحساب وبيئة العرض الرقمي
                                    </h2>
                                    <p className="text-xs text-gray-400 font-medium">قم بتعديل وتخصيص تجربتك أثناء الاستخدام، واللغة ومحيط المعالجات التلقائية.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="font-black text-sm text-slate-800 dark:text-dm-text">لغة الحساب الافتراضية</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => setPreferenceInfo({...preferenceInfo, lang: 'ar'})}
                                                className={`p-4 rounded-xl border text-xs font-black transition-all ${
                                                    preferenceInfo.lang === 'ar' 
                                                        ? 'bg-primary/5 text-primary border-primary' 
                                                        : 'bg-white dark:bg-dm-background border-gray-100 dark:border-gray-700 text-gray-500'
                                                }`}
                                            >
                                                العربية (اللغة الرسمية)
                                            </button>
                                            <button 
                                                onClick={() => setPreferenceInfo({...preferenceInfo, lang: 'en'})}
                                                className={`p-4 rounded-xl border text-xs font-black transition-all ${
                                                    preferenceInfo.lang === 'en' 
                                                        ? 'bg-primary/5 text-primary border-primary' 
                                                        : 'bg-white dark:bg-dm-background border-gray-100 dark:border-gray-700 text-gray-500'
                                                }`}
                                            >
                                                English (Specialized Templates)
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-black text-sm text-slate-800 dark:text-dm-text">طريقة عرض وحفظ التاريخ</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['DD/MM/YYYY', 'YYYY-MM-DD'].map(fmt => (
                                                <button 
                                                    key={fmt}
                                                    onClick={() => setPreferenceInfo({...preferenceInfo, dateFormat: fmt})}
                                                    className={`p-4 rounded-xl border text-xs font-black transition-all ${
                                                        preferenceInfo.dateFormat === fmt 
                                                            ? 'bg-primary/5 text-primary border-primary' 
                                                            : 'bg-white dark:bg-dm-background border-gray-100 dark:border-gray-700 text-gray-500'
                                                    }`}
                                                >
                                                    {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Automatic helpers toggles */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h3 className="font-black text-sm text-slate-800 dark:text-dm-text">خيارات التقارير الذكية والمراسلات</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'autoSave', label: 'الحفظ الفوري والتلقائي للمسودات', desc: 'حفظ العقود والتقاضي تلقائياً عند التوقف عن الكتابة.' },
                                                { id: 'smartSuggestions', label: 'إظهار التنبيهات واقتراحات الذكاء الاصطناعي', desc: 'تزويدك بمواد من القانون الكويتي عند صياغة العريضة مسبقاً.' },
                                                { id: 'emailAlerts', label: 'تلقي تنبيهات البريد الإلكتروني العاجلة', desc: 'إشعارك بكل الجلسات والمواعيد النهائية قبل 24 ساعة.' },
                                                { id: 'smsAlerts', label: 'إرسال تنبيهات نصية مؤمنة (SMS)', desc: 'تزويدك برموز الدخول والإلغاء وتغيير القضايا فوراً.' }
                                            ].map(opt => (
                                                <div 
                                                    key={opt.id} 
                                                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-dm-background rounded-2xl hover:bg-gray-100/50 transition-all border border-transparent"
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={(preferenceInfo as any)[opt.id]}
                                                        onChange={e => setPreferenceInfo({...preferenceInfo, [opt.id]: e.target.checked})}
                                                        className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer border-gray-300"
                                                    />
                                                    <div>
                                                        <p className="text-xs font-black text-gray-800 dark:text-dm-text">{opt.label}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1 leading-normal font-medium">{opt.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <Button 
                                        variant="primary" 
                                        className="rounded-xl px-12 h-12 shadow-md shadow-primary/20"
                                        onClick={handleSavePreferences}
                                    >
                                        حفظ التفضيلات
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* 6. SECURITY & ACTIVITY LOGS TAB */}
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                {/* Passwords update card */}
                                <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-6">
                                    <div className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-dm-text flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-primary" />
                                            حماية الدخول وكلمة المرور
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium">قم بتغيير كلمة المرور بشكل منتظم لزيادة التأمين على بيانات عملائك وملفاتهم.</p>
                                    </div>

                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="relative">
                                                <Input 
                                                    type={showPassword ? "text" : "password"}
                                                    label="كلمة المرور الحالية" 
                                                    value={passwords.current} 
                                                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                                                    containerClassName="mb-0"
                                                />
                                            </div>
                                            <Input 
                                                type={showPassword ? "text" : "password"}
                                                label="كلمة المرور الجديدة" 
                                                value={passwords.new} 
                                                onChange={e => setPasswords({...passwords, new: e.target.value})}
                                                containerClassName="mb-0"
                                            />
                                            <Input 
                                                type={showPassword ? "text" : "password"}
                                                label="تأكيد كلمة المرور الجديدة" 
                                                value={passwords.confirm} 
                                                onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                                containerClassName="mb-0"
                                            />
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <button 
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-xs font-black text-primary flex items-center gap-1.5 hover:text-primary-dark"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                {showPassword ? "إخفاء كلمات المرور" : "عرض كلمات المرور"}
                                            </button>
                                            <Button 
                                                type="submit"
                                                variant="primary" 
                                                className="rounded-xl px-12 h-12 shadow-md shadow-primary/20"
                                            >
                                                تحديث كلمة المرور
                                            </Button>
                                        </div>
                                    </form>
                                </Card>

                                {/* Activity Logs Audit Component */}
                                <Card className="p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card rounded-[32px] shadow-sm space-y-6">
                                    <div className="border-b border-gray-50 dark:border-gray-800 pb-4">
                                        <h3 className="text-lg font-black text-gray-900 dark:text-dm-text flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-primary" />
                                            سجل نشاطات الدخول والأمان (Audit Logs)
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium font-tajawal">مراقبة الجلسات النشطة، العناوين الرقمية والأجهزة التي استخدمت حسابك لمنع الاختراقات.</p>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-right text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-dm-background font-black text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                                    <th className="p-4 rounded-s-2xl">النشاط المسجل</th>
                                                    <th className="p-4 text-center">نوع المتصفح والجهاز</th>
                                                    <th className="p-4 text-center">عنوان IP</th>
                                                    <th className="p-4 text-left rounded-e-2xl">تاريخ المعالجة</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                                {activityLogs.map(log => (
                                                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-dm-background/50 transition-colors">
                                                        <td className="p-4 font-bold text-gray-700 dark:text-dm-text">{log.action}</td>
                                                        <td className="p-4 text-center text-gray-500 font-medium">{log.device}</td>
                                                        <td className="p-4 text-center text-gray-500 font-mono tracking-wide">{log.ip}</td>
                                                        <td className="p-4 text-left text-gray-400 font-bold">{log.date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
