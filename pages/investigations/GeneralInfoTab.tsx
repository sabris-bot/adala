import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
    FileText, Save, Lock, Scale, Calendar, Users, FilePlus, 
    ShieldCheck, CheckSquare, Square, Plus, Trash2, Phone, AlertCircle,
    Paperclip, ShieldAlert
} from 'lucide-react';
import { VoiceDictationButton } from '../../components/VoiceDictation/VoiceDictationButton';
import { InvestigationCase, InvestigationWitness, InvestigationEvidence, LegalSafeguards } from './types';

interface GeneralInfoTabProps {
    selectedCase: InvestigationCase | null;
    onSave: (data: {
        facts: string;
        parties: string;
        associatedDates: string;
        confidentialNotes: string;
        witnesses?: InvestigationWitness[];
        evidence?: InvestigationEvidence[];
        safeguards?: LegalSafeguards;
    }) => void;
    addToast: (toast: { type: string; title: string; message: string }) => void;
}

export const GeneralInfoTab: React.FC<GeneralInfoTabProps> = ({ 
    selectedCase, 
    onSave,
    addToast 
}) => {
    const [facts, setFacts] = useState('');
    const [parties, setParties] = useState('');
    const [associatedDates, setAssociatedDates] = useState('');
    const [confidentialNotes, setConfidentialNotes] = useState('');
    
    // Witnesses
    const [witnesses, setWitnesses] = useState<InvestigationWitness[]>([]);
    const [newWitnessName, setNewWitnessName] = useState('');
    const [newWitnessPhone, setNewWitnessPhone] = useState('');
    const [newWitnessStatus, setNewWitnessStatus] = useState<'summoned' | 'attended' | 'absent'>('summoned');
    const [newWitnessStatement, setNewWitnessStatement] = useState('');

    // Evidence
    const [evidence, setEvidence] = useState<InvestigationEvidence[]>([]);
    const [newEvidenceName, setNewEvidenceName] = useState('');
    const [newEvidenceType, setNewEvidenceType] = useState('مستند رقمي');
    const [newEvidenceNotes, setNewEvidenceNotes] = useState('');

    // Safeguards
    const [safeguards, setSafeguards] = useState<LegalSafeguards>({
        within15Days: true,
        writtenNotice: true,
        heardEmployee: true,
        signedOnPages: false,
        proportionalPenalty: true
    });

    useEffect(() => {
        if (selectedCase) {
            setFacts(selectedCase.facts || '');
            setParties(selectedCase.parties || '');
            setAssociatedDates(selectedCase.associatedDates || '');
            setConfidentialNotes(selectedCase.confidentialNotes || '');
            setWitnesses(selectedCase.witnesses || []);
            setEvidence(selectedCase.evidence || []);
            if (selectedCase.safeguards) {
                setSafeguards(selectedCase.safeguards);
            }
        }
    }, [selectedCase]);

    if (!selectedCase) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">يرجى اختيار محضر تحقيق لعرض تفاصيل الملف العام.</p>
            </div>
        );
    }

    const handleSaveClick = () => {
        onSave({ 
            facts, 
            parties, 
            associatedDates, 
            confidentialNotes,
            witnesses,
            evidence,
            safeguards
        });
        addToast({
            type: 'success',
            title: 'تم حفظ التعديلات',
            message: 'تم تحديث بيانات ملف التحقيق والأدلة والشهود بنجاح.'
        });
    };

    const handleAddWitness = () => {
        if (!newWitnessName.trim()) return;
        const newW: InvestigationWitness = {
            id: `wit-${Date.now()}`,
            name: newWitnessName.trim(),
            phone: newWitnessPhone.trim() || '965--------',
            status: newWitnessStatus,
            statement: newWitnessStatement.trim()
        };
        setWitnesses([...witnesses, newW]);
        setNewWitnessName('');
        setNewWitnessPhone('');
        setNewWitnessStatement('');
        addToast({ type: 'success', title: 'إضافة شاهد', message: 'تم إدراج الشاهد بسجل أطراف التحقيق.' });
    };

    const handleDeleteWitness = (id: string) => {
        setWitnesses(witnesses.filter(w => w.id !== id));
    };

    const handleAddEvidence = () => {
        if (!newEvidenceName.trim()) return;
        const newE: InvestigationEvidence = {
            id: `ev-${Date.now()}`,
            name: newEvidenceName.trim(),
            type: newEvidenceType,
            dateAdded: new Date().toISOString().split('T')[0],
            notes: newEvidenceNotes.trim()
        };
        setEvidence([...evidence, newE]);
        setNewEvidenceName('');
        setNewEvidenceNotes('');
        addToast({ type: 'success', title: 'إضافة حرز/دليل', message: 'تم قيد الدليل في ملف القضية.' });
    };

    const handleDeleteEvidence = (id: string) => {
        setEvidence(evidence.filter(e => e.id !== id));
    };

    const toggleSafeguard = (key: keyof LegalSafeguards) => {
        setSafeguards(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in text-right font-sans" style={{ direction: 'rtl' }}>
            
            {/* Top Grid: Scribe Details & Facts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Right Column: Case Overview & Narrative Facts (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Primary Dossier Metadata */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                                    <FileText className="w-4 h-4" />
                                </span>
                                <h3 className="text-xs font-extrabold text-slate-900">بيانات البلاغ والجهة الشاكية</h3>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                                {selectedCase.caseNumber}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                                <span className="text-[10px] text-slate-400 block font-bold">الجهة الشاكية / مقدّم المذكرة:</span>
                                <p className="text-slate-900 font-extrabold text-xs">{selectedCase.complainantName}</p>
                                <p className="text-[10px] text-slate-500">{selectedCase.complainantTitle}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                                <span className="text-[10px] text-slate-400 block font-bold">المشكو في حقه:</span>
                                <p className="text-slate-900 font-extrabold text-xs">{selectedCase.employeeName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">الرقم المدني: {selectedCase.civilId || '292000000000'}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                                <span className="text-[10px] text-slate-400 block font-bold">تاريخ فتح القيد:</span>
                                <p className="text-slate-900 font-mono font-bold text-xs">{selectedCase.startDate}</p>
                                <p className="text-[10px] text-amber-700 font-bold">مهلة مادة 35: 15 يوماً عمالياً</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-0.5">
                                <span className="text-[10px] text-slate-400 block font-bold">تصنيف المخالفة الرئيسي:</span>
                                <p className="text-slate-900 font-bold text-xs">{selectedCase.category || 'مخالفة لائحية'}</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block">موضوع البلاغ المقيد بالملف:</span>
                            <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">{selectedCase.subject}</p>
                        </div>
                    </Card>

                    {/* Scribe Narrative & Facts with Voice Dictation Button */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                                    <Scale className="w-4 h-4" />
                                </span>
                                <h3 className="text-xs font-extrabold text-slate-900">سرد مجريات الواقعة والتكييف التفصيلي</h3>
                            </div>
                            <VoiceDictationButton 
                                value={facts}
                                onTranscript={(t) => setFacts(t)}
                                placeholderTitle="تدوين وقائع التحقيق صوتياً"
                                size="sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">تسلسل تفاصيل الواقعة ومحور الاتهام:</label>
                            <textarea 
                                className="w-full text-xs font-medium border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl p-4 bg-slate-50 min-h-[140px] leading-relaxed transition-all outline-none"
                                placeholder="اكتب تفاصيل الواقعة، تسلسل الأحداث، ومحور الادعاء عمالياً، أو استخدم زر التدوين الصوتي..."
                                value={facts}
                                onChange={(e) => setFacts(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* Evidence & Exhibits Section */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                                    <Paperclip className="w-4 h-4" />
                                </span>
                                <h3 className="text-xs font-extrabold text-slate-900">الأدلة والمستندات المحرزة بالملف ({evidence.length})</h3>
                            </div>
                        </div>

                        {/* Existing Evidence List */}
                        <div className="space-y-2">
                            {evidence.map(ev => (
                                <div key={ev.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-800">{ev.name}</p>
                                        <p className="text-[10px] text-slate-400">{ev.type} • أُضيف في: {ev.dateAdded} {ev.notes ? `• ${ev.notes}` : ''}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteEvidence(ev.id)}
                                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Evidence Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-100">
                            <div className="sm:col-span-5">
                                <input
                                    type="text"
                                    placeholder="اسم المستند أو الحرز..."
                                    value={newEvidenceName}
                                    onChange={(e) => setNewEvidenceName(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                />
                            </div>
                            <div className="sm:col-span-3">
                                <select
                                    value={newEvidenceType}
                                    onChange={(e) => setNewEvidenceType(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                >
                                    <option value="مستند رقمي">مستند رقمي</option>
                                    <option value="تقرير فني">تقرير فني</option>
                                    <option value="مراسلات بريد">مراسلات بريد</option>
                                    <option value="تسجيل مرئي/صوتي">تسجيل مرئي/صوتي</option>
                                </select>
                            </div>
                            <div className="sm:col-span-3">
                                <input
                                    type="text"
                                    placeholder="ملاحظات..."
                                    value={newEvidenceNotes}
                                    onChange={(e) => setNewEvidenceNotes(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                />
                            </div>
                            <div className="sm:col-span-1">
                                <button
                                    onClick={handleAddEvidence}
                                    className="w-full h-full min-h-[38px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center text-xs"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Left Column: Safeguards, Witnesses & Confidential Notes (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Kuwait Labor Law 5-Point Safeguards Checklist */}
                    <Card className="p-6 bg-slate-900 text-white rounded-2xl shadow-md space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                <h3 className="text-xs font-black text-white">صمام الأمان والضمانات اللائحية (5 نقاط)</h3>
                            </div>
                            <span className="text-[10px] text-amber-400 font-mono font-bold">المادتان 35 و 102</span>
                        </div>

                        <p className="text-[11px] text-slate-300">
                            تحقق من استيفاء هذه الضمانات لدرء بطلان القرار التأديبي أمام الدائرة العمالية بالمحكمة:
                        </p>

                        <div className="space-y-2.5 text-xs">
                            <button
                                onClick={() => toggleSafeguard('within15Days')}
                                className="w-full flex items-center gap-2.5 text-right p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                            >
                                {safeguards.within15Days ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className={safeguards.within15Days ? 'text-white font-bold' : 'text-slate-400'}>
                                    1. مباشرة التحقيق خلال 15 يوماً من ثبوت الواقعة (مادة 35).
                                </span>
                            </button>

                            <button
                                onClick={() => toggleSafeguard('writtenNotice')}
                                className="w-full flex items-center gap-2.5 text-right p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                            >
                                {safeguards.writtenNotice ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className={safeguards.writtenNotice ? 'text-white font-bold' : 'text-slate-400'}>
                                    2. إبلاغ الموظف كتابةً بما نُسب إليه من مخالفات.
                                </span>
                            </button>

                            <button
                                onClick={() => toggleSafeguard('heardEmployee')}
                                className="w-full flex items-center gap-2.5 text-right p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                            >
                                {safeguards.heardEmployee ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className={safeguards.heardEmployee ? 'text-white font-bold' : 'text-slate-400'}>
                                    3. سماع أقوال الموظف وتحقيق دفاعه رسمياً.
                                </span>
                            </button>

                            <button
                                onClick={() => toggleSafeguard('signedOnPages')}
                                className="w-full flex items-center gap-2.5 text-right p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                            >
                                {safeguards.signedOnPages ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className={safeguards.signedOnPages ? 'text-white font-bold' : 'text-slate-400'}>
                                    4. توقيع الموظف على كافة صفحات محضر الاستجواب.
                                </span>
                            </button>

                            <button
                                onClick={() => toggleSafeguard('proportionalPenalty')}
                                className="w-full flex items-center gap-2.5 text-right p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
                            >
                                {safeguards.proportionalPenalty ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                    <Square className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className={safeguards.proportionalPenalty ? 'text-white font-bold' : 'text-slate-400'}>
                                    5. التدرج في توقيع الجزاء وفق المادة 102.
                                </span>
                            </button>
                        </div>
                    </Card>

                    {/* Witnesses Management */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-700" />
                                <h3 className="text-xs font-extrabold text-slate-900">سجل الشهود والإفادات ({witnesses.length})</h3>
                            </div>
                        </div>

                        {/* Witness List */}
                        <div className="space-y-2.5">
                            {witnesses.map(wit => (
                                <div key={wit.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5 text-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{wit.name}</span>
                                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                                                wit.status === 'attended' ? 'bg-emerald-100 text-emerald-800' :
                                                wit.status === 'summoned' ? 'bg-amber-100 text-amber-800' :
                                                'bg-rose-100 text-rose-800'
                                            }`}>
                                                {wit.status === 'attended' ? 'حضر وشهد' : wit.status === 'summoned' ? 'تم استدعاؤه' : 'تخلف'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteWitness(wit.id)}
                                            className="text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-mono text-slate-500">{wit.phone}</p>
                                    {wit.statement && (
                                        <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-slate-100 leading-relaxed font-sans">
                                            "{wit.statement}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add Witness Form */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="اسم الشاهد..."
                                    value={newWitnessName}
                                    onChange={(e) => setNewWitnessName(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="رقم الهاتف..."
                                    value={newWitnessPhone}
                                    onChange={(e) => setNewWitnessPhone(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                />
                            </div>
                            <textarea
                                placeholder="إفادة الشاهد المبدئية أو ملخص أقواله..."
                                value={newWitnessStatement}
                                onChange={(e) => setNewWitnessStatement(e.target.value)}
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none h-16"
                            />
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-xs font-bold"
                                onClick={handleAddWitness}
                            >
                                <Plus className="w-3.5 h-3.5 ml-1 inline-block" />
                                قيد الشاهد في المحضر
                            </Button>
                        </div>
                    </Card>

                    {/* Confidential Lawyer Notes */}
                    <Card className="p-6 bg-amber-50/20 border border-amber-200/70 rounded-2xl shadow-3xs space-y-3">
                        <div className="flex items-center gap-2 border-b border-amber-200/50 pb-2">
                            <Lock className="w-4 h-4 text-amber-700" />
                            <h3 className="text-xs font-extrabold text-amber-950">ملاحظات سرية خاصة بالمحقق</h3>
                        </div>
                        <textarea
                            className="w-full text-xs p-3 bg-white border border-amber-200 rounded-xl outline-none min-h-[90px] leading-relaxed"
                            placeholder="ملاحظات سرية غير قابلة للنشر أو التداول مع الموظف..."
                            value={confidentialNotes}
                            onChange={(e) => setConfidentialNotes(e.target.value)}
                        />
                    </Card>

                    {/* Save All Changes Button */}
                    <Button
                        size="lg"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs py-3 rounded-xl shadow-xs"
                        onClick={handleSaveClick}
                    >
                        <Save className="w-4 h-4 ml-1.5 inline-block" />
                        حفظ بيانات وتحديثات ملف التحقيق
                    </Button>
                </div>
            </div>
        </div>
    );
};
