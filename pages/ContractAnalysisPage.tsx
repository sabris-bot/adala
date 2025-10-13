
import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { GeminiAnalysisResult, RiskLevel } from '../types';
import { RiskLevelBadge } from '../components/ui/Badge';
import { DocumentTextIcon, ClipboardListCheckIcon, ShieldExclamationIcon, LightBulbIcon, SparklesIcon, InformationCircleIcon, PaperClipIcon, XCircleIcon, CameraIcon } from '../constants';

const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // The result includes the data URL prefix "data:mime/type;base64,"
            // We need to extract just the base64 part.
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


const ContractAnalysisPage: React.FC = () => {
  const [contractText, setContractText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null); // For image previews
  const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setContractText(''); // Clear text input if a file is selected
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null); // No preview for non-image files
      }
    }
  };
  
  const clearSelection = () => {
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleAnalyzeContract = async () => {
    if (!contractText.trim() && !selectedFile) {
      setError("يرجى إدخال نص العقد أو رفع ملف للتحليل.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      let result: GeminiAnalysisResult;
      if (selectedFile) {
        const { base64Data, mimeType } = await fileToBase64(selectedFile);
        result = await geminiService.analyzeContract(undefined, { base64Data, mimeType });
      } else {
        result = await geminiService.analyzeContract(contractText, undefined);
      }
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ غير متوقع أثناء تحليل العقد.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode; className?: string }> = ({ title, icon, className }) => (
    <div className={`flex items-center mb-3 ${className}`}>
      {icon && <span className="me-3 text-primary">{icon}</span>}
      <h3 className="text-xl font-semibold text-primary-dark">{title}</h3>
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <SparklesIcon className="w-8 h-8 text-accent-DEFAULT me-3" />
        <h1 className="text-3xl font-bold text-primary-dark">تحليل العقود بالذكاء الاصطناعي (Gemini)</h1>
      </div>
      
      <Card title="نظرة عامة على وحدة تحليل العقود" className="bg-primary-light/5">
        <div className="flex items-start">
          <InformationCircleIcon className="w-7 h-7 text-primary me-3 mt-1 flex-shrink-0"/>
          <div>
            <p className="text-gray-700 leading-relaxed">
              تمثل وحدة تحليل العقود أداة متقدمة تستفيد من قدرات نموذج الذكاء الاصطناعي Gemini لمساعدتك في فهم وتقييم العقود القانونية باللغة العربية.
              يمكنك إدخال نص العقد عبر لصق النص، رفع ملف (PDF, Word)، أو التقاط صورة للمستند. يقوم النظام بالمهام التالية:
            </p>
            <ul className="list-disc list-inside mt-3 text-gray-600 space-y-1.5 ps-4 text-sm">
                <li><strong>الملخص التنفيذي:</strong> يقدم موجزاً لأهم النقاط الواردة في العقد لمساعدتك على فهم جوهره بسرعة.</li>
                <li><strong>استخلاص البنود الرئيسية:</strong> يحدد ويعرض البنود الأساسية في العقد، مثل شروط الدفع، مدة العقد، التزامات الأطراف، شروط الإنهاء، وغيرها.</li>
                <li><strong>تقييم المخاطر:</strong> يحلل البنود المستخرجة ويقدم تقييماً لمستوى المخاطر المحتملة (منخفض، متوسط، مرتفع) المرتبطة بكل بند، بالإضافة إلى تقييم شامل لمخاطر العقد ككل.</li>
                <li><strong>تقديم توصيات وملاحظات:</strong> يلفت انتباهك إلى النقاط التي قد تحتاج إلى مزيد من التدقيق، التفاوض، أو التوضيح، ويقدم اقتراحات عملية قد تساهم في تحسين شروط العقد.</li>
            </ul>
          </div>
        </div>
      </Card>
      
      <Card title="إدخال العقد للتحليل">
         <TextArea
          label="الطريقة الأولى: الصق نص العقد"
          value={contractText}
          onChange={(e) => { setContractText(e.target.value); clearSelection(); }}
          placeholder="الصق نص العقد بالكامل هنا ليقوم النظام بتحليله..."
          rows={8}
          className="min-h-[150px] text-sm leading-relaxed focus:border-primary-light transition-colors duration-200"
          aria-label="نص العقد للتحليل"
        />
        
        <div className="text-center my-4 font-semibold text-gray-500">أو</div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الطريقة الثانية: ارفع ملفًا أو التقط صورة</label>
            {!selectedFile ? (
                 <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div className="text-center">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                            <Button type="button" variant="ghost" onClick={() => fileInputRef.current?.click()} leftIcon={<PaperClipIcon className="w-4 h-4"/>}>
                                ارفع ملفًا
                            </Button>
                             <Button type="button" variant="ghost" onClick={() => cameraInputRef.current?.click()} leftIcon={<CameraIcon className="w-4 h-4"/>} className="ms-2">
                                التقط صورة
                            </Button>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">PDF, DOCX, PNG, JPG up to 10MB</p>
                    </div>
                </div>
            ) : (
                <div className="mt-2 p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                        {filePreview ? (
                            <img src={filePreview} alt="Preview" className="h-16 w-16 object-cover rounded-md me-3"/>
                        ) : (
                             <DocumentTextIcon className="h-12 w-12 text-gray-400 me-3" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearSelection} title="إزالة الملف">
                        <XCircleIcon className="w-6 h-6 text-danger"/>
                    </Button>
                </div>
            )}
             <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,image/jpeg,image/png"/>
             <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
        </div>


        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleAnalyzeContract} 
            isLoading={isLoading} 
            disabled={isLoading || (!contractText.trim() && !selectedFile)}
            size="lg"
            leftIcon={!isLoading ? <SparklesIcon className="w-5 h-5"/> : undefined}
          >
            {isLoading ? 'جاري التحليل الذكي...' : 'بدء تحليل العقد'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="bg-danger/10 border-danger border animate-fadeIn">
            <div className="flex items-center">
                <ShieldExclamationIcon className="w-6 h-6 text-danger me-2"/>
                <p className="text-danger font-semibold">خطأ في عملية التحليل:</p>
            </div>
          <p className="text-sm text-danger mt-1">{error}</p>
        </Card>
      )}

      {isLoading && !analysisResult && (
         <Card className="animate-fadeIn">
            <div className="flex flex-col items-center justify-center p-10">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-lg text-primary-dark font-medium">يقوم الذكاء الاصطناعي بتحليل العقد الآن...</p>
                <p className="text-sm text-gray-500">قد تستغرق هذه العملية بضع لحظات، شكرًا لانتظارك.</p>
            </div>
         </Card>
      )}

      {analysisResult && (
        <Card title="النتائج المفصلة لتحليل العقد" className="animate-fadeIn border-t-4 border-primary">
          <p className="text-sm text-gray-600 mb-6">
            فيما يلي النتائج التي توصل إليها نظام الذكاء الاصطناعي بعد تحليل نص العقد المُقدم. يرجى مراجعة هذه النتائج بعناية، مع الأخذ في الاعتبار أنها تمثل تحليلاً آليًا وقد تحتاج إلى تدقيق من قبل متخصص قانوني.
          </p>
          <div className="space-y-8">
            
            <Card title="" className="bg-indigo-50/60 p-0 shadow-none border border-indigo-200 rounded-lg">
                <div className="p-4">
                    <SectionHeader title="الملخص التنفيذي للعقد" icon={<ClipboardListCheckIcon className="w-6 h-6 text-indigo-600" />} />
                    <p className="text-gray-700 bg-white p-4 rounded-md border border-gray-200 shadow-sm leading-relaxed text-sm">{analysisResult.summary}</p>
                </div>
            </Card>

            <Card title="" className="bg-red-50/50 p-0 shadow-none border border-red-200 rounded-lg">
              <div className="p-4">
                <SectionHeader title="تقييم المخاطر الإجمالي" icon={<ShieldExclamationIcon className="w-6 h-6 text-red-600" />} />
                <div className="flex items-center p-4 bg-white rounded-md border border-gray-200 shadow-sm">
                  <RiskLevelBadge level={analysisResult.overallRiskAssessment} size="sm"/>
                  <span className="ms-3 font-semibold text-xl text-secondary-dark">{RiskLevel[analysisResult.overallRiskAssessment.toUpperCase() as keyof typeof RiskLevel] || analysisResult.overallRiskAssessment}</span>
                </div>
              </div>
            </Card>

            {analysisResult.extractedClauses && analysisResult.extractedClauses.length > 0 && (
              <Card title="" className="bg-yellow-50/50 p-0 shadow-none border border-yellow-200 rounded-lg">
                <div className="p-4">
                    <SectionHeader title="أهم البنود المستخرجة وتحليلها" icon={<DocumentTextIcon className="w-6 h-6 text-yellow-700" />} />
                    <div className="space-y-4">
                    {analysisResult.extractedClauses.map((clause, index) => (
                        <Card key={index} title={clause.title} className="bg-white shadow-md border border-gray-200 transition-all hover:shadow-lg" titleClassName="text-secondary-dark font-medium text-md">
                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap leading-relaxed">{clause.content}</p>
                        {clause.risk && (
                            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center">
                            <span className="text-xs font-semibold me-2 text-gray-600">تقييم المخاطر لهذا البند:</span>
                            <RiskLevelBadge level={clause.risk} />
                            </div>
                        )}
                        </Card>
                    ))}
                    </div>
                </div>
              </Card>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <Card title="" className="bg-green-50/50 p-0 shadow-none border border-green-200 rounded-lg">
                <div className="p-4">
                    <SectionHeader title="التوصيات والملاحظات الهامة" icon={<LightBulbIcon className="w-6 h-6 text-green-600" />} />
                    <ul className="list-disc list-inside space-y-2 text-gray-700 bg-white p-4 rounded-md border border-gray-200 shadow-sm leading-relaxed text-sm">
                    {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="mb-1">{rec}</li>
                    ))}
                    </ul>
                </div>
              </Card>
            )}
          </div>
           <div className="mt-8 pt-4 border-t border-gray-300">
            <p className="text-xs text-gray-500 text-center">
              <strong>إخلاء مسؤولية:</strong> هذا التحليل مُقدم بواسطة الذكاء الاصطناعي وهو لأغراض إرشادية ومعلوماتية فقط. لا يُعتبر بديلاً عن الاستشارة القانونية المتخصصة. يجب دائمًا مراجعة العقود الهامة من قبل محامٍ مؤهل قبل التوقيع عليها.
            </p>
          </div>
        </Card>
      )}
       {!isLoading && !analysisResult && !error && (
        <Card className="text-center py-12 border-2 border-dashed border-gray-300 hover:border-primary-light transition-colors duration-200">
            <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">جاهز لتحليل عقدك بعمق</h3>
            <p className="text-gray-500 max-w-2xl mx-auto">
                الصق نص العقد في الحقل المخصص أعلاه، أو ارفع ملفًا، أو التقط صورة.
                <br />
                سيقوم نظامنا الذكي القائم على Gemini بمراجعته وتقديم رؤى قيمة، ملخصات، وتقييم للمخاطر لمساعدتك على اتخاذ قرارات أفضل.
            </p>
        </Card>
      )}
    </div>
  );
};

export default ContractAnalysisPage;