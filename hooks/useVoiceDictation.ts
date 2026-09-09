import { useState, useEffect, useRef, useCallback } from 'react';

// Declaration for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export interface VoiceDictationOptions {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
}

export interface UseVoiceDictationReturn {
    isListening: boolean;
    isSupported: boolean;
    transcript: string;
    interimTranscript: string;
    fullTranscript: string;
    audioLevel: number;
    recordingDuration: number;
    error: string | null;
    language: string;
    startListening: (initialText?: string) => Promise<boolean>;
    stopListening: () => void;
    toggleListening: (initialText?: string) => Promise<void>;
    resetTranscript: () => void;
    setTranscript: (text: string) => void;
    setLanguage: (lang: string) => void;
    appendMacro: (textToAppend: string) => void;
}

export const useVoiceDictation = (options: VoiceDictationOptions = {}): UseVoiceDictationReturn => {
    const {
        language: defaultLang = 'ar-KW',
        continuous = true,
        interimResults = true,
        onTranscriptChange,
        onError
    } = options;

    const [language, setLanguage] = useState<string>(defaultLang);
    const [isListening, setIsListening] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>('');
    const [interimTranscript, setInterimTranscript] = useState<string>('');
    const [audioLevel, setAudioLevel] = useState<number>(0);
    const [recordingDuration, setRecordingDuration] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const timerIntervalRef = useRef<any>(null);
    const isManuallyStoppedRef = useRef<boolean>(false);
    const accumulatedTextRef = useRef<string>('');

    // Check Web Speech API support
    const isSupported = typeof window !== 'undefined' && 
        !!(window.SpeechRecognition || window.webkitSpeechRecognition);

    // Clean up audio analyzer
    const cleanupAudioAnalysis = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try {
                audioContextRef.current.close();
            } catch (e) {}
            audioContextRef.current = null;
        }
        setAudioLevel(0);
    }, []);

    // Clean up timer
    const cleanupTimer = useCallback(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }, []);

    // Setup live audio visualizer via Web Audio API
    const setupAudioAnalysis = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            mediaStreamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;

            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.5;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateMeter = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                const normalized = Math.min(100, Math.round((avg / 128) * 100));
                setAudioLevel(normalized);

                animFrameRef.current = requestAnimationFrame(updateMeter);
            };

            updateMeter();
        } catch (err) {
            console.warn('Could not initialize audio visualizer stream:', err);
        }
    }, []);

    // Initialize or reconfigure speech recognition
    const initRecognition = useCallback(() => {
        if (!isSupported) return null;

        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SpeechRec();
        rec.continuous = continuous;
        rec.interimResults = interimResults;
        rec.lang = language;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
            setIsListening(true);
            setError(null);
            setRecordingDuration(0);

            cleanupTimer();
            timerIntervalRef.current = setInterval(() => {
                setRecordingDuration(d => d + 1);
            }, 1000);
        };

        rec.onresult = (event: any) => {
            let finalStr = '';
            let interimStr = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalStr += text + ' ';
                } else {
                    interimStr += text;
                }
            }

            if (finalStr) {
                const combined = (accumulatedTextRef.current + ' ' + finalStr).replace(/\s+/g, ' ').trim();
                accumulatedTextRef.current = combined;
                setTranscript(combined);
                setInterimTranscript('');
                if (onTranscriptChange) {
                    onTranscriptChange(combined, true);
                }
            } else {
                setInterimTranscript(interimStr);
                if (onTranscriptChange) {
                    const preview = (accumulatedTextRef.current + ' ' + interimStr).replace(/\s+/g, ' ').trim();
                    onTranscriptChange(preview, false);
                }
            }
        };

        rec.onerror = (event: any) => {
            console.warn('Speech recognition error:', event.error);
            let errorMessage = 'حدث خطأ أثناء الاستماع للميكروفون.';
            if (event.error === 'not-allowed') {
                errorMessage = 'تم رفض الإذن بالوصول للميكروفون. يرجى السماح بالوصول من إعدادات المتصفح.';
            } else if (event.error === 'no-speech') {
                errorMessage = 'لم يتم رصد أي صوت. يرجى التحدث بوضوح.';
            } else if (event.error === 'network') {
                errorMessage = 'تعذر الاتصال بخدمة التعرف الصوتي. يرجى التأكد من اتصال الإنترنت.';
            }

            if (event.error !== 'no-speech') {
                setError(errorMessage);
                if (onError) onError(errorMessage);
            }
        };

        rec.onend = () => {
            if (!isManuallyStoppedRef.current && isListening) {
                // Try auto-reconnect if not stopped manually
                try {
                    rec.start();
                    return;
                } catch (e) {}
            }
            setIsListening(false);
            setInterimTranscript('');
            cleanupAudioAnalysis();
            cleanupTimer();
        };

        return rec;
    }, [isSupported, continuous, interimResults, language, onTranscriptChange, onError, isListening, cleanupAudioAnalysis, cleanupTimer]);

    // Start listening
    const startListening = useCallback(async (initialText?: string): Promise<boolean> => {
        if (!isSupported) {
            const msg = 'متصفحك لا يدعم واجهة التعرف الصوتي Web Speech API مباشرة.';
            setError(msg);
            if (onError) onError(msg);
            return false;
        }

        try {
            isManuallyStoppedRef.current = false;
            if (typeof initialText === 'string') {
                accumulatedTextRef.current = initialText;
                setTranscript(initialText);
            }

            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {}
            }

            const rec = initRecognition();
            if (!rec) return false;
            recognitionRef.current = rec;

            await setupAudioAnalysis();
            rec.start();
            return true;
        } catch (err: any) {
            console.error('Failed to start speech recognition:', err);
            setError('تعذر تشغيل الميكروفون. تأكد من منح الصلاحية.');
            cleanupAudioAnalysis();
            cleanupTimer();
            return false;
        }
    }, [isSupported, initRecognition, setupAudioAnalysis, cleanupAudioAnalysis, cleanupTimer, onError]);

    // Stop listening
    const stopListening = useCallback(() => {
        isManuallyStoppedRef.current = true;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {}
        }
        setIsListening(false);
        setInterimTranscript('');
        cleanupAudioAnalysis();
        cleanupTimer();
    }, [cleanupAudioAnalysis, cleanupTimer]);

    // Toggle listening
    const toggleListening = useCallback(async (initialText?: string) => {
        if (isListening) {
            stopListening();
        } else {
            await startListening(initialText);
        }
    }, [isListening, startListening, stopListening]);

    // Reset
    const resetTranscript = useCallback(() => {
        accumulatedTextRef.current = '';
        setTranscript('');
        setInterimTranscript('');
    }, []);

    const handleSetTranscript = useCallback((text: string) => {
        accumulatedTextRef.current = text;
        setTranscript(text);
    }, []);

    // Append macro or punctuation (e.g. . or ، or س: or ج:)
    const appendMacro = useCallback((textToAppend: string) => {
        const current = accumulatedTextRef.current;
        let updated = '';
        if (textToAppend === '.' || textToAppend === '،' || textToAppend === '؟' || textToAppend === '!') {
            updated = current ? `${current.trim()}${textToAppend} ` : `${textToAppend} `;
        } else if (textToAppend === '\n' || textToAppend === '\n\n') {
            updated = current ? `${current.trim()}${textToAppend}` : `${textToAppend}`;
        } else {
            updated = current ? `${current.trim()} ${textToAppend} ` : `${textToAppend} `;
        }
        accumulatedTextRef.current = updated;
        setTranscript(updated);
        if (onTranscriptChange) {
            onTranscriptChange(updated, true);
        }
    }, [onTranscriptChange]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isManuallyStoppedRef.current = true;
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {}
            }
            cleanupAudioAnalysis();
            cleanupTimer();
        };
    }, [cleanupAudioAnalysis, cleanupTimer]);

    const fullTranscript = (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim();

    return {
        isListening,
        isSupported,
        transcript,
        interimTranscript,
        fullTranscript,
        audioLevel,
        recordingDuration,
        error,
        language,
        startListening,
        stopListening,
        toggleListening,
        resetTranscript,
        setTranscript: handleSetTranscript,
        setLanguage,
        appendMacro
    };
};
