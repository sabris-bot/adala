import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import TextArea from '../components/ui/TextArea';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { SparklesIcon, InformationCircleIcon, LightBulbIcon, CpuChipIcon, BookOpenIcon, ClipboardIcon, PrinterIcon, PaperClipIcon, CameraIcon, XCircleIcon, DocumentTextIcon } from '../constants';

const SectionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; }> = ({ title, icon, children }) => (
  <div>
    <div className="flex items-center mb-2">
      {icon}
      <h3 className="text-lg font-semibold text-primary-dark ms-2">{title}</h3>
    </div>
    <div className="text-gray-700 dark:text-dm-text-light leading-relaxed text-sm ps-8">
      {children}
    </div>
  </div>
);

const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) {
                resolve({ base64Data, mimeType: file.type });
            } else {
                reject(new Error("Failed to extract base64 data from file."));
            }
        };
        reader.onerror = error => reject(error);
    });
};


const AiAssistantPage: React.FC = () => {
  const [queryText, setQueryText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [userPromptForDisplay, setUserPromptForDisplay] = useState<{ text: string | null; file: File | null }>({ text: null, file: null });
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const responseDisplayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearSelection = () => {
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
  };


  const handleAskAI = async () => {
    if (!queryText.trim() && !selectedFile) {
      setError("يرجى إدخال سؤال أو رفع ملف للمساعد القانوني.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAiResponse(null);
    setUserPromptForDisplay({ text: queryText, file: selectedFile }); 

    try {
      let fileInput: { base64Data: string; mimeType: string } | undefined = undefined;
      if (selectedFile) {
        fileInput = await fileToBase64(selectedFile);
      }
      const responseText = await geminiService.getChatbotResponse(queryText, fileInput);
      setAiResponse(responseText);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء التواصل مع المساعد القانوني.";
      setError(errorMessage);
      setAiResponse(`عذرًا، حدث خطأ: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setQueryText('');
      clearSelection();
    }
  };

  const handleCopyToClipboard = () => {
    if (aiResponse && responseDisplayRef.current) {
      const textToCopy = responseDisplayRef.current.innerText; // Get text as rendered
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert('تم نسخ الرد إلى الحافظة!'))
        .catch(err => console.error('فشل نسخ النص: ', err));
    }
  };

  const handlePrintResponse = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <SparklesIcon className="w-8 h-8 text-accent-DEFAULT me-3" />
        <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">المساعد القانوني الذكي (Gemini)</h1>
      </div>

      <Card title="نظرة عامة على المساعد القانوني الذكي" className="bg-primary-light/5 dark:bg-dm-card/50">
        <div className="space-y-4 text-sm">
            <SectionItem icon={<CpuChipIcon className="w-6 h-6 text-accent-DEFAULT" />} title="ما هو المساعد القانوني الذكي؟">
            <p>
                المساعد القانوني الذكي هو شريكك الافتراضي المتقدم، المبني على أحدث نماذج الذكاء الاصطناعي التوليدي (Gemini) من جوجل. تم تدريبه وتخصيصه لتقديم دعم قانوني استثنائي باللغة العربية، مع فهم عميق ودقيق للقوانين والأنظمة السائدة في منطقة الشرق الأوسط، وبتركيز خاص على دولة الكويت ودول مجلس التعاون الخليجي.
            </p>
            </SectionItem>
            <SectionItem icon={<LightBulbIcon className="w-6 h-6 text-primary dark:text-primary-light" />} title="قدرات المساعد القانوني الذكي المتقدمة:">
            <ul className="list-disc list-inside space-y-1.5">
                <li>الإجابة على استفسارات قانونية معقدة.</li>
                <li>شرح المفاهيم والمصطلحات القانونية.</li>
                <li>تحليل وتلخيص النصوص القانونية.</li>
                <li>المساعدة في صياغة الوثائق القانونية (عقود، مذكرات، إلخ).</li>
                <li>البحث القانوني المعمق واستخراج مواد قانونية وأحكام ذات صلة.</li>
                <li>تحليل سيناريوهات قانونية افتراضية.</li>
                <li>مقارنة بين مفاهيم أو تشريعات قانونية.</li>
            </ul>
            </SectionItem>
            <SectionItem icon={<InformationCircleIcon className="w-6 h-6 text-secondary dark:text-secondary-light" />} title="آلية عمله والنتائج وكيفية استخدامها">
            <p>
                يعمل المساعد من خلال فهم دقيق للغة الطبيعية وسياق استفسارك. يقوم بمعالجة طلبك، والبحث في قاعدة معارفه الواسعة، ثم يولد الرد الأكثر ملاءمة وشمولاً. يمكن أن تكون النتائج في هيئة نصوص تحليلية، شروحات مفصلة، أو مسودات وثائق.
            </p>
            <p className="mt-1.5">
                من الضروري التأكيد على أن النتائج المقدمة هي <strong>لأغراض إرشادية، معلوماتية، وتعليمية فقط.</strong> لا ينبغي اعتبارها استشارة قانونية نهائية أو بديلاً عن رأي محامٍ بشري متخصص.
            </p>
            <p className="font-semibold text-danger dark:text-danger mt-2">
                إخلاء مسؤولية هام: هذا المساعد هو أداة متطورة للمساندة القانونية، ولكنه لا يحل محل الاستشارة القانونية المتخصصة من محامٍ مرخص ومؤهل.
            </p>
            </SectionItem>
             <SectionItem icon={<BookOpenIcon className="w-6 h-6 text-green-500" />} title="التطور المستمر والمعرفة المتجددة">
            <p>
                يتم تحديث قاعدة معارف المساعد القانوني باستمرار لضمان مواكبته لأحدث التطورات التشريعية والسوابق القضائية الهامة.
            </p>
            </SectionItem>
        </div>
      </Card>

      <Card title="اطرح سؤالك أو ارفع مستندك القانوني هنا" className="shadow-lg">
        <div className="space-y-3">
          <TextArea
            label="سؤالك / طلبك للمساعد الذكي:"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="مثال: ما هي شروط صحة عقد البيع في القانون الكويتي؟ أو قم بتحليل المستند المرفق وتحديد المخاطر..."
            rows={4}
            className="min-h-[80px] text-sm leading-relaxed focus:border-primary-light transition-colors duration-200 dark:bg-dm-background/70 dark:text-dm-text dark:placeholder-gray-500"
            aria-label="صندوق إدخال السؤال للمساعد القانوني"
          />
          
          <div>
            {!selectedFile ? (
                 <div className="flex justify-center items-center gap-x-4 rounded-lg border border-dashed border-gray-900/25 px-6 py-4">
                    <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()} leftIcon={<PaperClipIcon className="w-4 h-4"/>}>
                        ارفع ملفًا (PDF, صورة)
                    </Button>
                     <Button type="button" variant="ghost" onClick={() => cameraInputRef.current?.click()} leftIcon={<CameraIcon className="w-4 h-4"/>}>
                        التقط صورة
                    </Button>
                </div>
            ) : (
                <div className="p-3 border rounded-lg bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center overflow-hidden">
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded-md me-3"/>
                        ) : (
                             <DocumentTextIcon className="h-10 w-10 text-gray-400 me-3 flex-shrink-0" />
                        )}
                        <div className="truncate">
                            <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearSelection} title="إزالة الملف">
                        <XCircleIcon className="w-6 h-6 text-danger"/>
                    </Button>
                </div>
            )}
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,image/jpeg,image/png"/>
             <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleAskAI} 
            isLoading={isLoading} 
            disabled={isLoading || (!queryText.trim() && !selectedFile)}
            size="lg"
            leftIcon={!isLoading ? <SparklesIcon className="w-5 h-5"/> : undefined}
          >
            {isLoading ? 'جاري معالجة طلبك...' : 'اسأل المساعد الذكي'}
          </Button>
        </div>
      </Card>

      {isLoading && (
        <Card className="animate-fadeIn text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-primary-dark dark:text-primary-light">يعمل المساعد الذكي على إعداد الرد...</p>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="bg-danger/10 border-danger border animate-fadeIn dark:bg-danger/20 dark:border-red-700">
            <div className="flex items-center">
                <InformationCircleIcon className="w-6 h-6 text-danger dark:text-red-400 me-2"/>
                <p className="text-danger dark:text-red-300 font-semibold">خطأ في الاستجابة:</p>
            </div>
          <p className="text-sm text-danger dark:text-red-300 mt-1 ms-8">{error}</p>
        </Card>
      )}

      {aiResponse && !isLoading && (
        <div id="ai-response-printable-area" className="animate-fadeIn">
          <Card title="استجابة المساعد القانوني الذكي">
              {userPromptForDisplay.text || userPromptForDisplay.file ? (
                  <div className="mb-4 p-3 bg-gray-100 dark:bg-dm-card/60 rounded-md border-s-4 border-primary dark:border-primary-light">
                      <h4 className="text-sm font-semibold text-primary-dark dark:text-primary-light mb-1">سؤالك/طلبك:</h4>
                      {userPromptForDisplay.text && <p className="text-sm text-gray-700 dark:text-dm-text-light whitespace-pre-wrap">{userPromptForDisplay.text}</p>}
                      {userPromptForDisplay.file && <p className="text-xs text-gray-500 dark:text-dm-text-light/70 mt-1"><em>(مع تحليل الملف المرفق: {userPromptForDisplay.file.name})</em></p>}
                  </div>
              ) : null}
            <h4 className="text-sm font-semibold text-primary-dark dark:text-primary-light mb-1">رد المساعد:</h4>
            <div ref={responseDisplayRef} className="text-sm text-gray-800 dark:text-dm-text leading-relaxed whitespace-pre-wrap bg-white dark:bg-dm-background p-4 border border-gray-200 dark:border-secondary-dark rounded-md shadow-inner min-h-[150px] max-h-[60vh] overflow-y-auto scrollbar-thin">
              {aiResponse}
            </div>
            <div className="mt-6 flex justify-end space-x-3 space-x-reverse print-hide">
              <Button onClick={handleCopyToClipboard} variant="outline" size="md" leftIcon={<ClipboardIcon className="w-4 h-4"/>}>
                نسخ الرد
              </Button>
              <Button onClick={handlePrintResponse} variant="primary" size="md" leftIcon={<PrinterIcon className="w-4 h-4"/>}>
                طباعة الرد
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AiAssistantPage;