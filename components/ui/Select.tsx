import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, Check } from 'lucide-react';

interface SelectProps {
  label?: string;
  error?: string;
  options?: Array<{ value: string | number; label: string }>;
  containerClassName?: string;
  placeholder?: string;
  className?: string;
  value?: string | number;
  name?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  id?: string;
  children?: React.ReactNode;
  required?: boolean;
  defaultValue?: string | number;
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  error,
  options,
  className = '',
  containerClassName = '',
  placeholder,
  children,
  value,
  name,
  disabled,
  onChange,
  defaultValue,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substring(7));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Parse children options for backwards compatibility (e.g., if children options are passed instead of standard options array)
  const parsedOptions = useMemo(() => {
    if (options) return options;
    if (!children) return [];
    
    const opts: Array<{ value: string | number; label: string }> = [];
    React.Children.forEach(children, (childNode) => {
      if (React.isValidElement(childNode)) {
        const child = childNode as React.ReactElement<{ value?: string | number; children?: React.ReactNode }>;
        if (child.type === 'option' || (child.props && child.props.value !== undefined)) {
          opts.push({
            value: child.props.value ?? '',
            label: child.props.children?.toString() ?? ''
          });
        } else if (child.props && child.props.children) {
          // Flatten depth if option elements are nested or dynamic wrappers
          React.Children.forEach(child.props.children, (nestedChildNode) => {
            if (React.isValidElement(nestedChildNode)) {
              const nestedChild = nestedChildNode as React.ReactElement<{ value?: string | number; children?: React.ReactNode }>;
              if (nestedChild.type === 'option' || (nestedChild.props && nestedChild.props.value !== undefined)) {
                opts.push({
                  value: nestedChild.props.value ?? '',
                  label: nestedChild.props.children?.toString() ?? ''
                });
              }
            }
          });
        }
      }
    });
    return opts;
  }, [options, children]);

  // Handle option selection
  const handleSelectOption = (v: string | number) => {
    if (disabled) return;
    setIsOpen(false);
    setSearchQuery('');
    
    if (onChange) {
      // Create a mock synthetic React.ChangeEvent matching standard form handlers
      const mockEvent = {
        target: {
          name: name || '',
          value: v,
          id: defaultId
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(mockEvent);
    }
  };

  // Find currently selected option's label
  const selectedOption = useMemo(() => {
    const activeVal = value !== undefined ? value : defaultValue;
    return parsedOptions.find(opt => opt.value === activeVal || opt.value?.toString() === activeVal?.toString());
  }, [parsedOptions, value, defaultValue]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery) return parsedOptions;
    return parsedOptions.filter(opt =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parsedOptions, searchQuery]);

  // Standardize the displays for search. Auto-toggle search if options pool is > 5 items
  const isSearchable = parsedOptions.length > 5;

  return (
    <div className={`relative mb-4 ${containerClassName}`} ref={containerRef} dir="rtl">
      {label && (
        <label htmlFor={defaultId} className="block text-xs font-black text-gray-700 dark:text-gray-355 mb-1.5">
          {label}
        </label>
      )}

      <div
        id={defaultId}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full min-h-[44px] px-3.5 py-2.5 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 shadow-sm
          ${disabled ? 'bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-800' : 'bg-white dark:bg-slate-900'}
          ${isOpen ? 'border-primary ring-2 ring-primary-light/30 dark:border-amber-500/30' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}
          ${error ? 'border-red-500 ring-2 ring-red-500/10' : ''}
          ${className}
        `}
      >
        <span className={`text-xs font-bold ${selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'} leading-relaxed block truncate`}>
          {selectedOption ? selectedOption.label : (placeholder || 'اختر...')}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 mr-2 ${isOpen ? 'rotate-180 text-primary dark:text-amber-500' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-[150] max-h-[320px] overflow-hidden flex flex-col"
          >
            {isSearchable && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-800/80 flex items-center gap-2 bg-gray-50/50 dark:bg-slate-950/20">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="ابحث هنا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent border-none text-xs text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-0 h-7"
                />
              </div>
            )}
            
            <div className="overflow-y-auto p-1.5 custom-scrollbar max-h-[250px] space-y-0.5" dir="rtl">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => {
                  const isSelected = value?.toString() === opt.value?.toString();
                  return (
                    <button
                      key={`${opt.value}-${index}`}
                      type="button"
                      onClick={() => handleSelectOption(opt.value)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-right text-xs transition-colors duration-150 leading-normal
                        ${isSelected 
                          ? 'bg-primary/10 text-primary-dark dark:bg-primary/20 dark:text-primary font-black' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold'}
                      `}
                    >
                      <span className="flex-1 whitespace-pre-wrap">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary dark:text-amber-500 shrink-0 mr-2" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-gray-400 italic">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
