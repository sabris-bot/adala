import React from 'react';
import Card from '../ui/Card';
import { 
    AnalyzedContract, 
    AnalyzedContractStatus, 
    RiskLevel 
} from '../../types';
import { Badge, RiskLevelBadge } from '../ui/Badge';
import { 
    DocumentTextIcon, 
    CalendarDaysIcon, 
    UserGroupIcon,
    ArrowRightIcon,
    MagnifyingGlassIcon
} from '../../constants';

interface ContractListProps {
    contracts: AnalyzedContract[];
    onSelect: (contract: AnalyzedContract) => void;
}

const ContractList: React.FC<ContractListProps> = ({ contracts, onSelect }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {contracts.map(contract => (
                <Card 
                    key={contract.id} 
                    className="border-none shadow-lg rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all group border border-transparent hover:border-indigo-100 cursor-pointer"
                    onClick={() => onSelect(contract)}
                >
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl group-hover:scale-110 transition-transform">
                                <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <RiskLevelBadge level={contract.overallRisk} size="sm" />
                                <Badge 
                                    variant={contract.status === AnalyzedContractStatus.APPROVED ? 'success' : 'warning'}
                                    text={contract.status}
                                />
                            </div>
                        </div>

                        <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {contract.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mb-4 line-clamp-2">
                            {contract.summary}
                        </p>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                <UserGroupIcon className="w-4 h-4" />
                                <span className="truncate">{contract.parties.secondParty}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                                <CalendarDaysIcon className="w-4 h-4" />
                                <span>{contract.createdAt.split('T')[0]}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-3 flex justify-between items-center px-6 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{contract.category}</span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 group-hover:text-indigo-600 transition-colors">
                            عرض التحليل
                            <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </div>
                    </div>
                </Card>
            ))}

            <Card 
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center p-12 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-indigo-900/5 transition-all cursor-pointer group"
                onClick={() => {}}
            >
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform mb-4">
                    <MagnifyingGlassIcon className="w-10 h-10 text-slate-400 group-hover:text-indigo-600" />
                </div>
                <h4 className="text-sm font-black text-slate-600 dark:text-slate-400">تحليل عقد جديد</h4>
                <p className="text-[10px] text-slate-400 font-medium text-center mt-2">ابدأ تجربة التحليل الذكي الآن</p>
            </Card>
        </div>
    );
};

export default ContractList;
