import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../ui/Logo';
import NotificationDropdown from './NotificationDropdown';
import { notificationService } from '../../services/notificationService';
import { useLanguage } from '../i18n/LanguageProvider';
import { GlobalSearchEngine, SearchItem } from '../../services/globalSearchService';
import { 
    Globe, 
    Bell, 
    Search, 
    PlusCircle, 
    User, 
    Settings, 
    LogOut, 
    ChevronDown, 
    Building, 
    Shield, 
    Sparkles, 
    Plus, 
    ArrowLeft, 
    Menu, 
    X,
    FileText,
    FolderPlus,
    UserPlus,
    Moon,
    Sun,
    ExternalLink,
    Mic,
    MicOff
} from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { t, i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<string>('');

  // Unified global search states
  const [searchQuery, setSearchQuery] = useState('');
  const [liveSearchResults, setLiveSearchResults] = useState<SearchItem[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Live query matching
  useEffect(() => {
    if (searchQuery.trim()) {
      const { items } = GlobalSearchEngine.search({ searchTerm: searchQuery });
      setLiveSearchResults(items.slice(0, 6)); // Top 6 hits in real time
    } else {
      setLiveSearchResults([]);
    }
  }, [searchQuery]);

  // Hook command/ctrl + K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const startVoiceSearch = () => {
    const isAr = i18n.language === 'ar';
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError(isAr ? 'البحث الصوتي غير مدعوم في هذا المتصفح' : 'Voice search is not supported in this browser');
      setTimeout(() => setVoiceError(null), 3000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = i18n.language === 'ar' ? 'ar-KW' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceStatus(isAr ? 'جاري الاستماع... تحدّث الآن' : 'Listening... Speak now');
        setVoiceError(null);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setVoiceError(isAr ? 'يرجى السماح بالوصول للميكروفون' : 'Please allow microphone access');
        } else {
          setVoiceError(isAr ? 'حدث خطأ في التعرف على الصوت' : 'Voice recognition error');
        }
        setTimeout(() => {
          setVoiceError(null);
          setVoiceStatus('');
        }, 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          const queryText = transcript.trim();
          setSearchQuery(queryText);
          setIsSearchFocused(true);
          setVoiceStatus(isAr ? `تم التقاط: "${queryText}"` : `Captured: "${queryText}"`);

          // Look up instant exact matches
          const { items } = GlobalSearchEngine.search({ searchTerm: queryText });
          
          if (items.length > 0) {
            // Find if there is an exact or very strong match (e.g., matching caseNumber or name exactly)
            const exactMatch = items.find(
              item => 
                item.number.toLowerCase() === queryText.toLowerCase() ||
                item.name.toLowerCase() === queryText.toLowerCase() ||
                (item.client && item.client.toLowerCase() === queryText.toLowerCase())
            );

            if (exactMatch) {
              setVoiceStatus(isAr ? `جاري الانتقال لـ: ${exactMatch.name}` : `Navigating to: ${exactMatch.name}`);
              setTimeout(() => {
                navigate(exactMatch.link);
                setIsSearchFocused(false);
                setVoiceStatus('');
              }, 1500);
            } else {
              setVoiceStatus(isAr ? `جاري الانتقال لنتائج البحث...` : `Navigating to search results...`);
              setTimeout(() => {
                navigate(`/search?q=${encodeURIComponent(queryText)}`);
                setIsSearchFocused(false);
                setVoiceStatus('');
              }, 1500);
            }
          } else {
            setVoiceStatus(isAr ? `جاري الانتقال لنتائج البحث...` : `Navigating to search results...`);
            setTimeout(() => {
              navigate(`/search?q=${encodeURIComponent(queryText)}`);
              setIsSearchFocused(false);
              setVoiceStatus('');
            }, 1500);
          }
        }
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setVoiceError(isAr ? 'فشل بدء تشغيل التعرف على الصوت' : 'Failed to start speech recognition');
      setIsListening(false);
      setTimeout(() => {
        setVoiceError(null);
        setVoiceStatus('');
      }, 3000);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
      searchInputRef.current?.blur();
    }
  };

  // Dynamic user and office data, synced via event listeners
  const [userInfo, setUserInfo] = useState({
    fullName: 'أ. صبري شطا',
    roleTitle: 'شريك شرفي - المدير العام',
    email: 'sabri.s@alwagayan.com',
    avatar: 'https://picsum.photos/seed/sabri/100/100'
  });

  const [officeName, setOfficeName] = useState('مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية');

  const loadDataFromStorage = () => {
    try {
      const savedUser = localStorage.getItem('profile_personal_info');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUserInfo({
          fullName: parsed.fullName || 'أ. صبري شطا',
          roleTitle: parsed.roleTitle || 'شريك شرفي - المدير العام',
          email: parsed.email || 'sabri.s@alwagayan.com',
          avatar: parsed.avatar || 'https://picsum.photos/seed/sabri/100/100'
        });
      }
      
      const savedOffice = localStorage.getItem('profile_office_info');
      if (savedOffice) {
        const parsed = JSON.parse(savedOffice);
        setOfficeName(parsed.name || 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية');
      }
    } catch (e) {
      console.error('Failed to load profile details in header', e);
    }
  };

  useEffect(() => {
    loadDataFromStorage();

    // Event listeners to sync profiles across pages instantly
    window.addEventListener('profile_updated', loadDataFromStorage);
    window.addEventListener('office_info_updated', loadDataFromStorage);

    return () => {
      window.removeEventListener('profile_updated', loadDataFromStorage);
      window.removeEventListener('office_info_updated', loadDataFromStorage);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifications) => {
        setUnreadCount(notifications.filter(n => !n.isRead).length);
    });
    return unsubscribe;
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="bg-white dark:bg-dm-card shadow-sm h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 print:hidden border-b border-gray-100 dark:border-gray-800 transition-all duration-300 z-30 relative">
      {/* Right Section: Brand, Sidebar Toggle, Back Button */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          onClick={handleGoBack}
          className="p-2 rounded-xl text-gray-500 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background hover:text-primary transition-all flex-shrink-0 border border-transparent hover:border-gray-100"
          title={t('go_back', { defaultValue: "الرجوع للخلف" })}
        >
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </button>

        {/* System Name "Adala / عدالة" and Logo */}
        <div className="flex items-center gap-2 ps-2 border-s border-gray-100 dark:border-gray-800">
          <Logo 
            iconClassName="w-8 h-8 text-accent" 
            variant="dark"
            hideText={true}
          />
          <div className="flex flex-col select-none leading-none">
            <span className="text-sm font-black text-primary dark:text-accent font-tajawal">عدالة</span>
            <span className="text-[8px] font-black text-gray-400 tracking-wider">ADALA</span>
          </div>
        </div>

        {/* Office name (Visible on Desktop/Tablet with graceful responsive scaling) */}
        <div className="hidden sm:flex flex-col border-s border-gray-100 dark:border-gray-800 ps-4">
          <span className="text-xs font-black text-gray-900 dark:text-dm-text line-clamp-1 max-w-[280px] lg:max-w-[400px]">
            {officeName}
          </span>
          <span className="text-[9px] font-black text-primary/70 dark:text-primary-light">مكتب محاماة واستشارات قانونية مرخص</span>
        </div>

        {/* Menu toggler on small mobile only */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl text-gray-500 dark:text-dm-text hover:bg-gray-50 flex-shrink-0 border border-gray-100"
          aria-label="القائمة الجانبية"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Middle Section: Global Search */}
      <div className="flex-1 max-w-sm mx-4 hidden lg:block relative">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative group">
            <button 
              type="submit"
              className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400 group-focus-within:text-primary transition-colors hover:text-gray-600 dark:hover:text-dm-text"
            >
               <Search className="w-4 h-4" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
              placeholder={t('search_placeholder', { defaultValue: "ابحث في النظام..." })}
              className="w-full ps-11 pe-24 py-2.5 bg-gray-50 dark:bg-dm-background border border-gray-100 dark:border-gray-700 rounded-2xl 
                         text-xs text-gray-700 dark:text-dm-text placeholder-gray-400
                         focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-right font-bold"
            />
            {/* Microphone Voice Search Button */}
            <div className="absolute inset-y-0 end-12 flex items-center">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startVoiceSearch();
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md ring-4 ring-rose-500/20' 
                    : 'text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-dm-background'
                }`}
                title={i18n.language === 'ar' ? 'البحث الصوتي الذكي' : 'Smart Voice Search'}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="absolute inset-y-0 end-3 flex items-center select-none pointer-events-none">
               <div className="px-1.5 py-0.5 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-md shadow-sm">
                  <span className="text-[9px] font-black text-gray-300 font-mono tracking-tighter">⌘K</span>
               </div>
            </div>
          </div>
        </form>

        {/* Voice Search Status Overlay */}
        <AnimatePresence>
          {(isListening || voiceStatus || voiceError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute right-0 left-0 -bottom-10 mx-auto px-4 py-1.5 rounded-xl text-[10px] font-black text-center shadow-lg border flex items-center justify-center gap-1.5 z-40 ${
                voiceError
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40'
                  : 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-accent border-primary/20 bg-white'
              }`}
            >
              {isListening && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
              <span>{voiceError || voiceStatus}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Search Floating List */}
        <AnimatePresence>
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-right"
            >
              <div className="px-4 py-2 bg-gray-50 dark:bg-dm-background/60 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400">البحث الفوري الذكي</span>
                <span className="text-[9px] font-bold text-primary dark:text-accent bg-primary/5 dark:bg-accent/10 px-1.5 py-0.5 rounded-md">
                  {liveSearchResults.length} نتائج
                </span>
              </div>

              {liveSearchResults.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-xs font-bold">
                  لم يتم العثور على سجلات مطابقة لـ <span className="text-secondary font-black truncate max-w-[120px] inline-block align-middle">"{searchQuery}"</span>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                  {liveSearchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.link);
                        setIsSearchFocused(false);
                      }}
                      className="w-full text-right p-2.5 hover:bg-gray-50 dark:hover:bg-dm-background rounded-xl transition-all cursor-pointer block border border-transparent hover:border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-gray-300 dark:text-gray-500 font-mono">
                          {item.number}
                        </span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 bg-gray-100 dark:bg-dm-background text-gray-500 rounded-md">
                          {item.type}
                        </span>
                      </div>
                      
                      <div className="text-xs font-black text-gray-800 dark:text-dm-text truncate mt-1">
                        {item.name}
                      </div>
                      
                      <div className="text-[10px] text-gray-400 mt-1 truncate hover:text-clip">
                        {item.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="p-2 bg-gray-50 dark:bg-dm-background/50 border-t border-gray-100 dark:border-gray-800 text-center">
                <button
                  type="button"
                  onClick={() => {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setIsSearchFocused(false);
                  }}
                  className="w-full py-2 hover:bg-primary hover:text-white bg-primary/5 dark:bg-accent/10 text-primary dark:text-accent font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  عرض كافة النتائج بالتفصيل <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Left Section: User Control Panel */}
      <div className="flex items-center gap-2 sm:gap-3 justify-end">
        {/* Quick Shortcut Buttons (Header navigation menus) */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink 
            to="/dashboard" 
            className="p-2 py-1.5 text-xs font-black text-gray-600 hover:text-primary hover:bg-gray-50 dark:text-dm-text rounded-xl transition-all"
          >
            الرئيسية
          </NavLink>
          <NavLink 
            to="/cases" 
            className="p-2 py-1.5 text-xs font-black text-gray-600 hover:text-primary hover:bg-gray-50 dark:text-dm-text rounded-xl transition-all"
          >
            القضايا
          </NavLink>
          <NavLink 
            to="/settings" 
            className="p-2 py-1.5 text-xs font-black text-gray-600 hover:text-primary hover:bg-gray-50 dark:text-dm-text rounded-xl transition-all"
          >
            التهيئة
          </NavLink>
        </div>

        <div className="h-4 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block mx-1"></div>

        {/* Quick Action Dropdown + */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            onBlur={() => setTimeout(() => setIsQuickActionsOpen(false), 200)}
            className="p-2 rounded-xl text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all font-black flex items-center justify-center"
            title="إجراء سريع"
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {isQuickActionsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 mt-2 w-48 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 overflow-hidden text-right"
              >
                <div className="px-4 py-2 bg-gray-50 dark:bg-dm-background/50 border-b border-gray-50 dark:border-gray-800">
                  <span className="text-[10px] font-black tracking-wider text-gray-400">إجراءات سريعة</span>
                </div>
                <div className="p-1.5 space-y-1">
                  <button 
                    onClick={() => navigate('/cases')} 
                    className="w-full flex items-center justify-start gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background rounded-xl transition-all"
                  >
                    <FolderPlus className="w-4 h-4 text-teal-600" /> تسجيل قضية جديدة
                  </button>
                  <button 
                    onClick={() => navigate('/contracts')} 
                    className="w-full flex items-center justify-start gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background rounded-xl transition-all"
                  >
                    <FileText className="w-4 h-4 text-indigo-600" /> تحليل عقد ذكي
                  </button>
                  <button 
                    onClick={() => navigate('/employee-affairs')} 
                    className="w-full flex items-center justify-start gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background rounded-xl transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-600" /> إضافة موظف جديد
                  </button>
                  <button 
                    onClick={() => navigate('/ai-assistant')} 
                    className="w-full flex items-center justify-start gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background rounded-xl transition-all bg-amber-500/10 text-amber-900"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" /> الذكاء الاصطناعي
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Switcher */}
        <button 
          onClick={toggleLanguage}
          className="p-2 rounded-xl text-gray-500 dark:text-dm-text hover:bg-gray-50 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
          title="تغيير اللغة"
        >
          <Globe className="w-4 h-4 text-gray-400 hover:text-primary shrink-0" />
          <span className="font-sans font-black">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
            <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-xl text-gray-500 dark:text-dm-text hover:bg-gray-50 relative group transition-all"
                aria-label="التنبيهات"
            >
                <Bell className="w-5 h-5 group-hover:text-primary text-gray-450 dark:text-dm-text" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] font-black px-1 rounded-full border border-white dark:border-dm-card shadow-sm animate-bounce min-w-[14px] flex items-center justify-center">
                        {unreadCount > 9 ? '+9' : unreadCount}
                    </span>
                )}
            </button>
            {isNotificationOpen && (
                <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
            )}
        </div>

        <div className="h-6 w-px bg-gray-100 dark:bg-gray-800 mx-1"></div>

        {/* User Avatar Menu Dropdown (Logged in user info & shortcut profile access) */}
        <div className="relative">
          <button 
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 p-0.5 rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all shadow-sm bg-gray-50 dark:bg-dm-background/50 group cursor-pointer"
          >
            <img
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[14px] object-cover border border-white shrink-0"
              src={userInfo.avatar}
              alt={userInfo.fullName}
              referrerPolicy="no-referrer"
            />
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary dark:text-dm-text me-1 hidden sm:block" />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-3 w-72 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden text-right"
                >
                  {/* Miniature profile header */}
                  <div className="p-5 bg-gradient-to-l from-primary/10 to-transparent dark:bg-primary-dark/10 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3">
                    <img 
                      src={userInfo.avatar} 
                      alt={userInfo.fullName} 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-black text-sm text-gray-900 dark:text-dm-text truncate leading-tight">{userInfo.fullName}</h4>
                      <p className="text-[10px] text-primary/80 dark:text-accent font-extrabold truncate mt-0.5">{userInfo.roleTitle}</p>
                      <p className="text-[9px] text-gray-400 truncate mt-0.5">{userInfo.email}</p>
                    </div>
                  </div>

                  {/* Active connections display */}
                  <div className="px-5 py-2.5 bg-gray-50 dark:bg-dm-background border-b border-gray-50 dark:border-gray-800 flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">مستوى الأمان: ممتد</span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      متصل بالشبكة
                    </span>
                  </div>

                  {/* Navigation links inside dropdown */}
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={() => { navigate('/profile'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-xs font-black text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background rounded-xl transition-all"
                    >
                      <User className="w-4 h-4 text-primary" /> الملف الشخصي والإلكتروني
                    </button>
                    
                    <button 
                      onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-xs font-black text-gray-700 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background rounded-xl transition-all"
                    >
                      <Settings className="w-4 h-4 text-primary" /> إعدادات بيئة المنظومة
                    </button>
                    
                    <button 
                      onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-xs font-black text-gray-400 hover:text-gray-900 rounded-xl transition-all border-t border-gray-50/50 pt-2.5"
                    >
                      <Building className="w-4 h-4 text-gray-400" /> إدارة قوالب المكتب والمصاميم
                    </button>
                  </div>

                  {/* Dropdown footer action keys */}
                  <div className="p-2 bg-gray-50/50 dark:bg-dm-background/50 border-t border-gray-50 dark:border-gray-800">
                    <button 
                      onClick={() => { navigate('/'); setIsUserMenuOpen(false); }}
                      className="w-full flex items-center justify-start gap-3 px-4 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" /> تسجيل الخروج الإداري
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
