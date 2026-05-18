
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SearchIcon, PlusIcon, XIcon, CheckIcon, ChevronDownIcon } from '../constants';
import { partyRoleGroups } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface LegalRoleSelectorProps {
    value: string | string[]; // Can be single string or multiple
    onChange: (value: string | string[]) => void;
    label?: string;
    isMulti?: boolean;
    error?: string;
    placeholder?: string;
}

const LegalRoleSelector: React.FC<LegalRoleSelectorProps> = ({
    value,
    onChange,
    label,
    isMulti = false,
    error,
    placeholder = 'Search or select legal role...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedValues = useMemo(() => {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    }, [value]);

    const filteredGroups = useMemo(() => {
        if (!searchQuery) return partyRoleGroups;

        return partyRoleGroups.map(group => ({
            ...group,
            options: group.options.filter(opt => 
                opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                opt.value.toLowerCase().includes(searchQuery.toLowerCase())
            )
        })).filter(group => group.options.length > 0);
    }, [searchQuery]);

    const handleSelect = (optionValue: string) => {
        if (isMulti) {
            const nextValue = selectedValues.includes(optionValue)
                ? selectedValues.filter(v => v !== optionValue)
                : [...selectedValues, optionValue];
            onChange(nextValue);
        } else {
            onChange(optionValue);
            setIsOpen(false);
        }
        setSearchQuery('');
    };

    const handleRemove = (e: React.MouseEvent, val: string) => {
        e.stopPropagation();
        if (isMulti) {
            onChange(selectedValues.filter(v => v !== val));
        } else {
            onChange('');
        }
    };

    const handleAddCustom = () => {
        if (searchQuery && !selectedValues.includes(searchQuery)) {
            handleSelect(searchQuery);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative mb-6" ref={containerRef} dir="rtl">
            {label && (
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">
                    {label}
                </label>
            )}

            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    min-h-[56px] w-full bg-white dark:bg-slate-900 border-2 rounded-2xl flex flex-wrap items-center gap-2 p-3 cursor-pointer transition-all duration-300
                    ${isOpen ? 'border-primary ring-8 ring-primary/5 shadow-lg' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}
                    ${error ? 'border-rose-500 ring-rose-500/10' : ''}
                `}
            >
                {selectedValues.length === 0 && !isOpen && (
                    <span className="text-slate-400 text-sm italic px-2">{placeholder}</span>
                )}

                <div className="flex flex-wrap gap-2 flex-1">
                    {selectedValues.map(val => (
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={val}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2 group hover:bg-slate-900 hover:text-white transition-colors"
                        >
                            {val}
                            <button 
                                onClick={(e) => handleRemove(e, val)}
                                className="text-slate-400 group-hover:text-white"
                            >
                                <XIcon className="w-3.5 h-3.5" />
                            </button>
                        </motion.span>
                    ))}
                    {isOpen && (
                        <input 
                            autoFocus
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery) {
                                    e.preventDefault();
                                    handleAddCustom();
                                }
                            }}
                            placeholder="Type to search or add..."
                            className="bg-transparent border-none focus:ring-0 text-sm font-bold flex-1 min-w-[120px] dark:text-white h-full"
                        />
                    )}
                </div>

                <div className="flex items-center gap-2 px-2 text-slate-400">
                    {isOpen ? <SearchIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl z-[100] max-h-[400px] overflow-hidden flex flex-col"
                    >
                        <div className="overflow-y-auto p-2 custom-scrollbar">
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map(group => (
                                    <div key={group.label} className="mb-4 last:mb-0">
                                        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest italic bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-1">
                                            {group.label}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 px-1">
                                            {group.options.map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleSelect(opt.value)}
                                                    className={`
                                                        flex items-center justify-between px-4 py-2.5 rounded-xl text-right text-sm font-bold transition-all
                                                        ${selectedValues.includes(opt.value) 
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}
                                                    `}
                                                >
                                                    <span>{opt.label}</span>
                                                    {selectedValues.includes(opt.value) && <CheckIcon className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : searchQuery ? (
                                <button
                                    onClick={handleAddCustom}
                                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <PlusIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-800 dark:text-white">إضافة كصفة جديدة</p>
                                            <p className="text-xs font-bold text-slate-400">"{searchQuery}"</p>
                                        </div>
                                    </div>
                                    <ChevronDownIcon className="w-5 h-5 text-slate-300 -rotate-90" />
                                </button>
                            ) : (
                                <div className="p-10 text-center opacity-30 italic text-sm">No results found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && <p className="mt-2 text-xs font-bold text-rose-500 px-1 italic">{error}</p>}
        </div>
    );
};

export default LegalRoleSelector;
