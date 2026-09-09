import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceDictation } from '../../hooks/useVoiceDictation';

interface VoiceDictationButtonProps {
    value?: string;
    onTranscript: (newText: string) => void;
    placeholderTitle?: string;
    size?: 'sm' | 'md' | 'lg';
    language?: string;
    className?: string;
    mode?: 'append' | 'replace';
}

export const VoiceDictationButton: React.FC<VoiceDictationButtonProps> = ({
    value = '',
    onTranscript,
    placeholderTitle = 'بدء التدوين الصوتي المباشر',
    size = 'sm',
    language = 'ar-KW',
    className = '',
    mode = 'append'
}) => {
    const {
        isListening,
        isSupported,
        audioLevel,
        toggleListening,
        error
    } = useVoiceDictation({
        language,
        onTranscriptChange: (liveText, isFinal) => {
            if (isFinal) {
                if (mode === 'append') {
                    const base = value.trim();
                    const next = base ? `${base} ${liveText}`.trim() : liveText.trim();
                    onTranscript(next);
                } else {
                    onTranscript(liveText.trim());
                }
            }
        }
    });

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleListening('');
    };

    const sizeClasses = {
        sm: 'p-1.5 text-xs',
        md: 'px-2.5 py-1.5 text-xs',
        lg: 'px-3 py-2 text-sm'
    };

    if (!isSupported) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            title={isListening ? 'إيقاف التدوين الصوتي' : placeholderTitle}
            className={`inline-flex items-center gap-1.5 rounded-xl font-black transition-all cursor-pointer select-none relative ${
                isListening
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md animate-pulse ring-2 ring-rose-300 dark:ring-rose-900'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700'
            } ${sizeClasses[size]} ${className}`}
        >
            {isListening ? (
                <>
                    <Mic className="w-3.5 h-3.5 text-white animate-bounce" />
                    <span className="text-[10px] font-black tracking-tight flex items-center gap-1">
                        جارِ الاستماع...
                        {audioLevel > 5 && (
                            <span 
                                className="inline-block w-1.5 h-1.5 rounded-full bg-white"
                                style={{ transform: `scale(${1 + audioLevel / 50})` }}
                            />
                        )}
                    </span>
                </>
            ) : (
                <>
                    <Mic className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-teal-600" />
                    {size !== 'sm' && (
                        <span className="text-[10px] font-bold">تدوين صوتي</span>
                    )}
                </>
            )}
        </button>
    );
};
