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
    placeholder = 'العلاقة / الصفة القضائية'
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
    };

    const handleRemove = (e: React.MouseEvent | React.TouchEvent, val: string) => {
        e.stopPropagation();
        if (isMulti) {
            onChange(selectedValues.filter(v => v !== val));
        } else {
            onChange('');
        }
    };

    const handleAddCustom = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (searchQuery && !selectedValues.includes(searchQuery)) {
            handleSelect(searchQuery);
            setSearchQuery('');
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

    const displayLabel = useMemo(() => {
        if (selectedValues.length === 0) return placeholder;
        return selectedValues.join('، ');
    }, [selectedValues, placeholder]);

    return (
        <div className="relative mb-4" ref={containerRef} dir="rtl">
            {label && (
                <label className="block text-xs font-black text-gray-750 dark:text-gray-300 mb-1.5">
                    {label}
                </label>
            )}

            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 shadow-sm bg-white dark:bg-slate-900
                    ${isOpen ? 'border-primary ring-2 ring-primary-light/30 dark:border-amber-500/30' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
                    ${error ? 'border-rose-500 ring-rose-500/10' : ''}
                `}
            >
                <span className={`text-xs font-bold leading-relaxed block truncate ${selectedValues.length > 0 ? 'text-gray-900 dark:text-gray-100' : 'text-gray-405'}`}>
                    {displayLabel}
                </span>
                
                <div className="flex items-center gap-2 px-1 text-gray-400 shrink-0">
                    <ChevronDownIcon className={`w-4 h-4 text-gray-450 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        className="absolute top-full left-0 md:left-0 md:right-auto mt-1.5 w-[280px] sm:w-[320px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-[250] max-h-[350px] overflow-hidden flex flex-col"
                    >
                        {/* Search Input Box */}
                        <div className="p-2 border-b border-gray-150 dark:border-gray-800/80 flex items-center gap-2 bg-gray-50/50 dark:bg-slate-950/20">
                            <SearchIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="ابحث أو اكتب صفة جديدة..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery) {
                                        e.preventDefault();
                                        if (!selectedValues.includes(searchQuery)) {
                                            handleSelect(searchQuery);
                                            setSearchQuery('');
                                        }
                                    }
                                }}
                                className="w-full bg-transparent border-none text-xs text-gray-800 dark:text-white placeholder-gray-455 focus:outline-none focus:ring-0 h-7"
                            />
                        </div>

                        {/* Selected tags list */}
                        {isMulti && selectedValues.length > 0 && (
                            <div className="p-2 border-b border-gray-100 dark:border-gray-800/60 bg-slate-50/50 dark:bg-slate-900/40 flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto custom-scrollbar">
                                {selectedValues.map(val => (
                                    <span
                                        key={val}
                                        className="bg-primary/10 dark:bg-primary/20 text-primary-dark dark:text-primary px-2 py-0.5 rounded-lg text-[10px] font-black border border-primary/10 flex items-center gap-1 shrink-0"
                                    >
                                        {val}
                                        <button 
                                            type="button"
                                            onClick={(e) => handleRemove(e, val)}
                                            className="text-primary-dark dark:text-primary hover:bg-black/5 rounded-full p-0.5 transition-colors cursor-pointer"
                                        >
                                            <XIcon className="w-2.5 h-2.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="overflow-y-auto p-1.5 custom-scrollbar max-h-[250px]" dir="rtl">
                            {filteredGroups.length > 0 ? (
                                filteredGroups.map(group => (
                                    <div key={group.label} className="mb-2 last:mb-0">
                                        <div className="px-3 py-1 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/40 rounded-lg mb-1">
                                            {group.label}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 px-0.5">
                                            {group.options.map(opt => {
                                                const isSelected = selectedValues.includes(opt.value);
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => handleSelect(opt.value)}
                                                        className={`
                                                            flex items-center justify-between px-3 py-2 rounded-lg text-right text-xs transition-colors duration-150 leading-normal
                                                            ${isSelected 
                                                                ? 'bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary font-black' 
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'}
                                                        `}
                                                    >
                                                        <span className="truncate">{opt.label}</span>
                                                        {isSelected && <CheckIcon className="w-3.5 h-3.5 text-primary shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            ) : searchQuery ? (
                                <button
                                    type="button"
                                    onClick={handleAddCustom}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                                            <PlusIcon className="w-4 h-4" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-800 dark:text-white">إضافة كصفة جديدة</p>
                                            <p className="text-[10px] font-bold text-gray-400">"{searchQuery}"</p>
                                        </div>
                                    </div>
                                    <ChevronDownIcon className="w-4 h-4 text-slate-300 -rotate-90" />
                                </button>
                            ) : (
                                <div className="py-8 text-center text-xs text-gray-400 italic">
                                    لا توجد نتائج مطابقة
                                </div>
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
