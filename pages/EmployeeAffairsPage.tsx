
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Card from '../components/ui/Card';
import { 
    UsersIcon, CalculatorIcon, CalendarDaysIcon, UserCircleIcon, 
    CurrencyDollarIcon, ExclamationTriangleIcon, ChatBubbleLeftEllipsisIcon, 
    GavelIcon, IdentificationIcon, DocumentTextIcon, ShieldCheckIcon, 
    BuildingOffice2Icon, ChartBarIcon, ArrowRightIcon, BellIcon,
    TableCellsIcon, DocumentDuplicateIcon, SparklesIcon, ChevronRightIcon,
    ArrowDownTrayIcon, PaperAirplaneIcon, ChatBubbleLeftRightIcon, ClockIcon
} from '../constants';
import Button from '../components/ui/Button';
import PrintHeader from '../components/ui/PrintHeader';
import { geminiService } from '../services/geminiService';
import { initialEmployees } from './EmployeeProfilePage';

interface FeatureCardProps {
  title: string;
  description: string;
  linkTo: string;
  icon: React.ReactNode;
  status?: 'active' | 'developing';
  color?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, linkTo, icon, status = 'active', color = 'indigo' }) => (
  <Link to={linkTo} className={`group block h-full ${status === 'developing' ? 'pointer-events-none' : ''}`}>
    <Card className={`h-full border-none shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden group-hover:-translate-y-2 ${status === 'developing' ? 'opacity-60 bg-slate-50' : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}>
      <div className="p-8 flex flex-col h-full">
        <div className={`mb-6 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 group-hover:rotate-6`}>
            {icon}
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 truncate tracking-tight">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow line-clamp-2">
          {description}
        </p>
        <div className="flex items-center text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
            <span>استكشاف القسم</span>
            <ArrowRightIcon className="w-4 h-4 ms-2 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Card>
  </Link>
);


const EmployeeAffairsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'main' | 'ai'>('main');

    // AI Assistant State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
        { role: 'model', content: 'مرحباً بك في مركز استشارات الموارد البشرية الذكي. يمكنني مساعدتك في تحليل بيانات الموظفين، صياغة لوائح العمل، أو تقديم استشارات حول قانون العمل الكويتي. كيف يمكنني مساعدتك اليوم؟' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isAiLoading) return;

        const userMessage = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsAiLoading(true);

        try {
            const history = chatMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const contextPrompt = `
                أنت خبير موارد بشرية مدمج في نظام إدارة قانوني كويتي.
                بيانات حالية:
                - عدد الموظفين: ${initialEmployees.length}
                - تنبيهات انتهاء مستندات: ${complianceStats.expiringCivilIds + complianceStats.expiringPassports + complianceStats.expiringResidencies}
                
                طلب المستخدم: ${userMessage}
            `;

            const response = await geminiService.getChatbotResponse(contextPrompt, history);
            setChatMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'model', content: 'عذراً، واجه المساعد مشكلة في معالجة طلبك حالياً.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const complianceStats = useMemo(() => {
        const today = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(today.getDate() + 60);

        let expiringCivilIds = 0;
        let expiringPassports = 0;
        let expiringResidencies = 0;

        initialEmployees.forEach(emp => {
            if (emp.civilIdExpiry) {
                const expiry = new Date(emp.civilIdExpiry);
                if (expiry <= sixtyDaysFromNow) expiringCivilIds++;
            }
            if (emp.passportExpiry) {
                const expiry = new Date(emp.passportExpiry);
                if (expiry <= sixtyDaysFromNow) expiringPassports++;
            }
            if (emp.residencyExpiry) {
                const expiry = new Date(emp.residencyExpiry);
                if (expiry <= sixtyDaysFromNow) expiringResidencies++;
            }
        });

        return { expiringCivilIds, expiringPassports, expiringResidencies };
    }, []);

    const features: FeatureCardProps[] = [
        {
            title: 'ملفات الموظفين',
            description: 'السجلات الكاملة، العقود الرقمية، وأرشفة الأوراق الثبوتية للموظفين.',
            linkTo: '/employee-affairs/profiles',
            icon: <UserCircleIcon className="w-8 h-8" />,
            color: 'indigo'
        },
        {
            title: 'نهاية الخدمة',
            description: 'حاسبة المستحقات النهائية آلياً وفقاً للمادة 51 من قانون العمل الكويتي.',
            linkTo: '/employee-affairs/end-of-service',
            icon: <CalculatorIcon className="w-8 h-8" />,
            color: 'rose'
        },
        {
            title: 'إدارة الإجازات',
            description: 'نظام تتبع الأرصدة (السنوية، المرضية، والطارئة) والموافقات الإدارية.',
            linkTo: '/employee-affairs/leave-management',
            icon: <CalendarDaysIcon className="w-8 h-8" />,
            color: 'amber'
        },
        {
            title: 'الرواتب والقروض',
            description: 'كشوف المرتبات الشهرية، البدلات، وإدارة أرصدة السلف والخصومات.',
            linkTo: '/employee-affairs/loans',
            icon: <CurrencyDollarIcon className="w-8 h-8" />,
            color: 'emerald'
        },
        {
            title: 'الإجراءات التأديبية',
            description: 'سجل التنبيهات، الإنذارات، والجزاءات الإدارية وفق اللائحة الداخلية.',
            linkTo: '/employee-affairs/disciplinary',
            icon: <ExclamationTriangleIcon className="w-8 h-8" />,
            color: 'orange'
        },
        {
            title: 'التقييم السنوي',
            description: 'منظومة قياس الأداء KPI، مراجعة الأهداف السنوية وتطوير المهارات.',
            linkTo: '/employee-affairs/performance',
            icon: <ChartBarIcon className="w-8 h-8" />,
            color: 'blue'
        }
    ];

    return (
        <div className="space-y-10 pb-20 font-sans" dir="rtl">
            <PrintHeader title="تقرير إدارة الموارد البشرية وشؤون الموظفين" />

            {/* Premium Header Container */}
            <div className="max-w-7xl mx-auto mb-10 no-print">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-2xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-3xl opacity-50" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                                    <UsersIcon className="w-8 h-8 text-white" />
                                </div>
                                <span className="text-indigo-600 font-black uppercase tracking-[0.2em] text-xs">Human Resources Management</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-tight">
                                إدارة الأصول <span className="text-indigo-600">البشرية</span>
                            </h1>
                            <p className="text-slate-500 text-lg max-w-2xl font-medium leading-relaxed">
                                نظام مركزي ذكي لإدارة شؤون الموظفين، يضمن الامتثال الكامل لقانون العمل الكويتي (6/2010)، إدارة الرواتب، التقييم، وتنبيهات انتهاء المستندات الرسمية.
                            </p>
                        </div>
                        
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                                <button 
                                    onClick={() => setActiveTab('main')}
                                    className={`flex-1 py-3 px-6 rounded-xl transition-all font-black text-sm ${activeTab === 'main' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    لوحة التحكم
                                </button>
                                <button 
                                    onClick={() => setActiveTab('ai')}
                                    className={`flex-1 py-3 px-6 rounded-xl transition-all font-black text-sm flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    <SparklesIcon className="w-4 h-4" />
                                    المساعد الذكي
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-xl h-14 border-slate-200" leftIcon={<ArrowDownTrayIcon className="w-5"/>}>تصدير التقرير</Button>
                                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-14 font-black shadow-lg shadow-indigo-600/20" leftIcon={<BellIcon className="w-5"/>}>التنبيهات</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'main' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        key="main-view"
                        className="space-y-10"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Main Content Info */}
                            <div className="lg:col-span-8">
                                <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-indigo-500/20">
                                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-50"></div>
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl opacity-50"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                                                <ShieldCheckIcon className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <h2 className="text-3xl font-black tracking-tight">
                                                الامتثال الرقمي <span className="text-indigo-400 tracking-normal">(Kuwait Law 6/2010)</span>
                                            </h2>
                                        </div>
                                        <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl font-medium">
                                            نظام إدارة الموارد البشرية مؤتمت كلياً ليتفق مع تشريعات القطاع الأهلي الكويتي. 
                                            يدير النظام آلياً فترات التجربة، تدرج الإجازات المرضية، ومكافآت نهاية الخدمة بناءً على آخر القرارات الوزارية.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                                <div className="flex items-center gap-3 mb-2 opacity-60">
                                                    <ClockIcon className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">تحديث اللوائح</span>
                                                </div>
                                                <p className="font-bold text-sm">تعديلات بدلات السكن 2024</p>
                                            </div>
                                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-md">
                                                <div className="flex items-center gap-3 mb-2 opacity-60">
                                                    <BuildingOffice2Icon className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">النظام القانوني</span>
                                                </div>
                                                <p className="font-bold text-sm">القطاع الأهلي - الكويت</p>
                                            </div>
                                            <div className="p-6 bg-indigo-600/20 rounded-[2rem] border border-indigo-400/30 backdrop-blur-md flex items-center justify-center gap-3 group cursor-pointer hover:bg-indigo-600/30 transition-all">
                                                <span className="font-black text-sm">دليل الموظف</span>
                                                <ChevronRightIcon className="w-5 h-5 -rotate-180 group-hover:-translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Compliance Sidebar */}
                            <div className="lg:col-span-4">
                                <div className="bg-white rounded-[3rem] p-8 h-full shadow-2xl shadow-slate-100 border border-slate-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">صلاحية المستندات</h3>
                                        <div className="p-2 bg-rose-50 rounded-lg">
                                            <BellIcon className="w-5 h-5 text-rose-500 animate-swing" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <ComplianceRow 
                                            icon={<IdentificationIcon className="w-5 text-rose-600"/>} 
                                            label="البطاقة المدنية" 
                                            count={complianceStats.expiringCivilIds} 
                                            color="rose"
                                        />
                                        <ComplianceRow 
                                            icon={<DocumentTextIcon className="w-5 text-amber-600"/>} 
                                            label="جواز السفر" 
                                            count={complianceStats.expiringPassports} 
                                            color="amber"
                                        />
                                        <ComplianceRow 
                                            icon={<BuildingOffice2Icon className="w-5 text-indigo-600"/>} 
                                            label="الإقامة / إذن العمل" 
                                            count={complianceStats.expiringResidencies} 
                                            color="indigo"
                                        />
                                        <div className="pt-8 text-center">
                                            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black italic">نظام التنبيه المبكر • 60 يوم</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Categories */}
                        <div>
                            <div className="flex items-center justify-between mb-8 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">الخدمات الإدارية والقانوية</h2>
                                </div>
                                <span className="text-xs font-black text-slate-400 bg-slate-100 px-4 py-2 rounded-full uppercase tracking-widest">{features.length} ACTIVE MODULES</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {features.map(feature => (
                                    <FeatureCard 
                                        key={feature.title}
                                        {...feature}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key="ai-view"
                        className="max-w-4xl mx-auto h-[700px] flex flex-col bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden"
                    >
                        <div className="bg-indigo-600 p-8 flex items-center justify-between text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
                                    <SparklesIcon className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black font-sans tracking-tight">مستشار الموارد البشرية الذكي</h3>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">AI powered human resources intelligence</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/30">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm border ${
                                        msg.role === 'user' 
                                        ? 'bg-white text-slate-700 border-slate-100 rounded-tr-none' 
                                        : 'bg-indigo-600 text-white border-transparent rounded-tl-none font-medium'
                                    }`}>
                                        <div className="markdown-body text-sm leading-relaxed">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isAiLoading && (
                                <div className="flex justify-end">
                                    <div className="bg-indigo-50 border border-indigo-100 rounded-[1.5rem] p-4 flex gap-2">
                                        <span className="w-2 h-2 bg-indigo-600/40 rounded-full animate-bounce" />
                                        <span className="w-2 h-2 bg-indigo-600/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-2 h-2 bg-indigo-600/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-white">
                            <div className="flex gap-4 p-2 bg-slate-50 rounded-[2.5rem] border border-slate-200">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-transparent px-6 py-4 focus:outline-none text-sm font-bold placeholder:text-slate-400"
                                    placeholder="اسأل المستشار الذكي حول قانون العمل، الرواتب، أو أي قضية إدارية..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={isAiLoading || !chatInput.trim()}
                                    className="bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center w-14 h-14 shrink-0"
                                >
                                    <PaperAirplaneIcon className="w-6 h-6 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Injected CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                .animate-swing { animation: swing 2s infinite ease-in-out; }
                @keyframes swing {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

const ComplianceRow = ({ icon, label, count, color }: { icon: any, label: string, count: number, color: string }) => (
    <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] transition-all hover:scale-[1.02] cursor-default border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/10`}>
                {icon}
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className={`px-4 py-1 rounded-full text-xs font-black ${
            count > 0 ? `bg-${color}-500 text-white shadow-lg shadow-${color}-500/20` : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
        }`}>
            {count}
        </span>
    </div>
);

export default EmployeeAffairsPage;
