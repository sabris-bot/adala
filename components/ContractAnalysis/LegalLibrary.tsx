import React from 'react';
import Card from '../ui/Card';
import { 
    BookOpenIcon, 
    MagnifyingGlassIcon, 
    ArrowRightIcon, 
    ScaleIcon,
    ShieldCheckIcon,
    DocumentDuplicateIcon
} from '../../constants';
import Button from '../ui/Button';

const LegalLibrary: React.FC = () => {
    const libraryCategories = [
        { title: 'القانون المدني', count: 45, icon: <ScaleIcon className="w-5 h-5 text-indigo-600"/> },
        { title: 'قانون العمل', count: 120, icon: <BookOpenIcon className="w-5 h-5 text-emerald-600"/> },
        { title: 'التجارة والشركات', count: 86, icon: <ShieldCheckIcon className="w-5 h-5 text-amber-600"/> },
        { title: 'التحكيم الدولي', count: 32, icon: <DocumentDuplicateIcon className="w-5 h-5 text-rose-600"/> },
    ];

    return (
        <div className="space-y-8">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="بحث في المرجعية القانونية والسابقة القضائية..." 
                    className="w-full h-16 bg-white dark:bg-dm-card rounded-2xl border-none shadow-xl pr-14 pl-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all font-black"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {libraryCategories.map((cat, i) => (
                    <Card key={i} className="border-none shadow-lg rounded-3xl p-6 hover:shadow-xl transition-all cursor-pointer group">
                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 mb-4 w-fit group-hover:scale-110 transition-transform">
                            {cat.icon}
                        </div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-white mb-1">{cat.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">{cat.count} مستند ومرجع</p>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">أحدث المراجع المضافة</h3>
                <div className="grid grid-cols-1 gap-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="border-none shadow-md rounded-[2rem] p-5 flex justify-between items-center bg-white dark:bg-dm-card hover:bg-slate-50 transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl">
                                    <BookOpenIcon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">مذكرة تفسيرية للمادة 45 من قانون الشركات</h5>
                                    <p className="text-[10px] text-slate-500 font-medium">تاريخ الإضافة: 12 مايو 2026 • المراجعة القانونية: مكتملة</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="rounded-xl" size="sm"><ArrowRightIcon className="w-4 h-4 rtl:rotate-180"/></Button>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LegalLibrary;
