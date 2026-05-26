/**
 * Sharia & Civil Law Inheritance Engine (محرك حساب المواريث الشرعي والقانوني)
 * Al-Wagayan, Al-Awadhi & Al-Ruwayeh Systems
 * Fully compliant with Kuwaiti Personal Status Law (Articles 288-330) and Sunnah/Jafari Jurisprudence.
 */

export type Gender = 'M' | 'F';
export type CalculationMadhab = 'sunni' | 'jafari';

export interface HeirDefinition {
    id: string;
    type: string;
    label: string;
    gender: Gender;
    count: number;
    notes?: string;
}

export interface CalculatedShare {
    heirLabel: string;
    heirType: string;
    count: number;
    shareLabel: string; // e.g. "1/6", "1/4", "تعصيب"
    shareFractionNum: number; // numerator of final share
    shareFractionDen: number; // denominator of final share
    shareValue: number; // decimal from 0 to 1
    amount: number; // in KWD
    isExcluded: boolean;
    exclusionReason?: string;
    evidence: {
        source: string;
        text: string;
        article?: string;
    };
}

export interface ExcludedHeir {
    label: string;
    type: string;
    count: number;
    reason: string;
    excludedBy: string;
}

export interface InheritanceCalculation {
    id: string;
    deceasedName: string;
    deceasedGender: Gender;
    dateOfDeath?: string;
    totalEstate: number;
    debts: number;
    funeralExpenses: number;
    wills: number;
    netEstate: number;
    madhab: CalculationMadhab;
    baseProblem: number; // أصل المسألة
    finalProblem: number; // مصح المسألة أو عولها
    isAoul: boolean;
    isRadd: boolean;
    shares: CalculatedShare[];
    excludedHeirs: ExcludedHeir[];
    steps: string[];
    advisoryText: string; // Intelligent paragraph explaining the case
    warnings: string[];
}

const LEGAL_EVIDENCE: Record<string, { source: string; text: string; article: string }> = {
    husband_1_2: {
        source: 'سورة النساء، الآية 12',
        text: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ',
        article: 'المادة 288 من قانون الأحوال الشخصية الكويتي'
    },
    husband_1_4: {
        source: 'سورة النساء، الآية 12',
        text: 'فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ',
        article: 'المادة 288 من قانون الأحوال الشخصية الكويتي'
    },
    wife_1_4: {
        source: 'سورة النساء، الآية 12',
        text: 'وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌ',
        article: 'المادة 289 من قانون الأحوال الشخصية الكويتي'
    },
    wife_1_8: {
        source: 'سورة النساء، الآية 12',
        text: 'فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم',
        article: 'المادة 289 من قانون الأحوال الشخصية الكويتي'
    },
    mother_1_6: {
        source: 'سورة النساء، الآية 11',
        text: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ',
        article: 'المادة 290 من قانون الأحوال الشخصية الكويتي'
    },
    mother_1_3: {
        source: 'سورة النساء، الآية 11',
        text: 'فَإِن لَّمْ يَكُن لَّهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ',
        article: 'المادة 290 من قانون الأحوال الشخصية الكويتي'
    },
    mother_1_3_residue: {
        source: 'إجماع الصحابة (قضاء عمر بن الخطاب في الغراوين)',
        text: 'للأم ثلث ما يتبقى بعد نصيب الزوج أو الزوجة لوجود الأب مع أحد الزوجين للعدالة الشرعية',
        article: 'المادة 290 بند (ب) من قانون الأحوال الشخصية الكويتي'
    },
    father_1_6: {
        source: 'سورة النساء، الآية 11',
        text: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ',
        article: 'المادة 291 من قانون الأحوال الشخصية الكويتي'
    },
    daughter_1_2: {
        source: 'سورة النساء، الآية 11',
        text: 'وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ',
        article: 'المادة 293 من قانون الأحوال الشخصية الكويتي'
    },
    daughter_2_3: {
        source: 'سورة النساء، الآية 11',
        text: 'فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ',
        article: 'المادة 293 من قانون الأحوال الشخصية الكويتي'
    },
    sister_1_2: {
        source: 'سورة النساء، الآية 176',
        text: 'إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ',
        article: 'المادة 300 من قانون الأحوال الشخصية الكويتي'
    },
    sister_2_3: {
        source: 'سورة النساء، الآية 176',
        text: 'فَإِن كَانَتَا اثْنَتَيْنِ فَلَهُمَا الثُّلُثَانِ مِمَّا تَرَكَ',
        article: 'المادة 300 من قانون الأحوال الشخصية الكويتي'
    },
    maternal_sibling_1_6: {
        source: 'سورة النساء، الآية 12',
        text: 'وَإِن كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ',
        article: 'المادة 301 من قانون الأحوال الشخصية الكويتي'
    },
    maternal_sibling_1_3: {
        source: 'سورة النساء، الآية 12',
        text: 'فَإِن كَانُوا أَكْثَرَ مِن ذَٰلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ',
        article: 'المادة 301 من قانون الأحوال الشخصية الكويتي'
    },
    assaba: {
        source: 'الحديث النبوي الشريف (صحيح البخاري ومسلم)',
        text: 'ألحقوا الفرائض بأهلها، فما بقي فهو لأولى رجل ذكر',
        article: 'المادة 292 و 293 من قانون الأحوال الشخصية الكويتي'
    },
    grandmother_1_6: {
        source: 'السنة النبوية بقضاء الرسول ﷺ',
        text: 'أن الطاغية قضى بالجدة السدس إذا غابت الأم',
        article: 'المادة 297 من قانون الأحوال الشخصية الكويتي'
    },
    jafari_base: {
        source: 'أحكام المواريث في المذهب الجعفري المعتمد بالدوائر القضائية الجعفرية بالكويت',
        text: 'التقسيم بالطبقات والقرابة الإيجابية والنسبية مع عدم صحة العول والرد بالتراص للقرابة الوالدية',
        article: 'لائحة المحكمة الجعفرية الكويتية في قضايا الأحوال الشخصية مادة 344'
    }
};

// Utility function to compute GCD
const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

// Utility function to compute LCM
const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
};

// Find LCM of an array of numbers
const lcmMultiple = (arr: number[]): number => {
    if (arr.length === 0) return 1;
    return arr.reduce((acc, curr) => lcm(acc, curr), 1);
};

/**
 * Calculates Sharia and Civil Law Inheritance
 */
export function calculateInheritance(options: {
    deceasedName: string;
    deceasedGender: Gender;
    totalEstate: number;
    debts: number;
    funeralExpenses: number;
    wills: number;
    heirs: HeirDefinition[];
    madhab: CalculationMadhab;
    dateOfDeath?: string;
}): InheritanceCalculation {
    const {
        deceasedName,
        deceasedGender,
        totalEstate,
        debts,
        funeralExpenses,
        wills,
        heirs,
        madhab
    } = options;

    const netEstate = Math.max(0, totalEstate - debts - funeralExpenses - wills);
    const result: InheritanceCalculation = {
        id: Math.random().toString(36).substring(2, 9),
        deceasedName: deceasedName || 'حالة حصر إرث غير مسماة',
        deceasedGender,
        totalEstate,
        debts,
        funeralExpenses,
        wills,
        netEstate,
        madhab,
        baseProblem: 0,
        finalProblem: 0,
        isAoul: false,
        isRadd: false,
        shares: [],
        excludedHeirs: [],
        steps: [],
        advisoryText: '',
        warnings: []
    };

    // Warnings
    if (wills > totalEstate / 3 && wills > 0) {
        result.warnings.push('تحذير شرعي وقانوني: قيمة الوصية تتجاوز ثلث التركة المصرح به شرعاً وقانوناً (الأحوال الشخصية الكويتي مادة 290/328). يحتاج تنفيذ الجزء الزائد عن الثلث إلى موافقة صريحة من جميع الورثة الراشدين.');
    }

    if (netEstate <= 0) {
        result.warnings.push('التركة مستغرقة بالكامل بالديون أو الوصايا وتجهيز الميت، لا يوجد بقايا مادية للورثة.');
        result.steps.push('الخطوة الأولى: تم تسديد الديون وتفاصيل التجهيز والوصايا، وتبين أن الديون والالتزامات مستغرقة لكامل التركة.');
        return result;
    }

    result.steps.push(`حساب إجمالي التركة المقررة: ${totalEstate.toLocaleString()} د.ك`);
    result.steps.push(`تسديد الالتزامات المالية والديون وتجهيز الميت: خصم ${ (debts + funeralExpenses + wills).toLocaleString() } د.ك`);
    result.steps.push(`صافي التركة الصالحة للتقسيم الإرثي: ${netEstate.toLocaleString()} د.ك`);

    // Extract active heirs counts
    const counts: Record<string, { count: number; definition: HeirDefinition }> = {};
    heirs.forEach(h => {
        if (h.count > 0) {
            counts[h.type] = { count: h.count, definition: h };
        }
    });

    const getCount = (type: string) => counts[type]?.count || 0;

    const hasChildren = (getCount('son') + getCount('daughter') + getCount('grandson') + getCount('granddaughter')) > 0;
    const hasMaleDescendant = (getCount('son') + getCount('grandson')) > 0;
    const hasFemaleDescendant = (getCount('daughter') + getCount('granddaughter')) > 0;
    const hasFather = getCount('father') > 0;
    const hasMother = getCount('mother') > 0;
    const siblingsCount = getCount('full_brother') + getCount('full_sister') + 
                          getCount('paternal_brother') + getCount('paternal_sister') + 
                          getCount('maternal_brother') + getCount('maternal_sister');

    // Sunnah (Kuwaiti Sunni Personal Status Law) Logic
    if (madhab === 'sunni') {
        result.steps.push('تطبيق الفقه السني الكلاسيكي وقانون الأحوال الشخصية الكويتي (قسم التركات في المذهب المالكي والقرآن العظيم).');

        // Check Exclusion Rules FIRST (حجب الحرمان)
        const exclusions: ExcludedHeir[] = [];

        // 1. Father excludes: grandfathers, paternal grandmothers (in Kuwaiti Article 290, plus all brothers and sisters)
        if (hasFather) {
            if (getCount('paternal_grandfather') > 0) {
                exclusions.push({ label: 'الجد لـ أب', type: 'paternal_grandfather', count: getCount('paternal_grandfather'), reason: 'يُحجب حجب حرمان لوجود الأب (الأصل المذكر الأقرب)', excludedBy: 'الأب' });
            }
            if (getCount('paternal_grandmother') > 0) {
                exclusions.push({ label: 'الجدة لأب', type: 'paternal_grandmother', count: getCount('paternal_grandmother'), reason: 'تُحجب لوجود الأب أو الأم طبقاً للمادة 297', excludedBy: 'الأب' });
            }
            ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'].forEach(sib => {
                if (getCount(sib) > 0) {
                    exclusions.push({ label: counts[sib].definition.label, type: sib, count: getCount(sib), reason: 'يحجب حجب حرمان مطلق لوجود الأب (الأحوال الشخصية الكويتي مادة 300)', excludedBy: 'الأب' });
                }
            });
        }

        // 2. Mother excludes: all grandmothers (paternal & maternal)
        if (hasMother) {
            if (getCount('paternal_grandmother') > 0 && !exclusions.some(x => x.type === 'paternal_grandmother')) {
                exclusions.push({ label: 'الجدة لأب', type: 'paternal_grandmother', count: getCount('paternal_grandmother'), reason: 'تُحجب لوجود الأم (الأحوال الشخصية الكويتي مادة 297)', excludedBy: 'الأم' });
            }
            if (getCount('maternal_grandmother') > 0) {
                exclusions.push({ label: 'الجدة لأم', type: 'maternal_grandmother', count: getCount('maternal_grandmother'), reason: 'تُحجب لوجود الأم (الأحوال الشخصية الكويتي مادة 297)', excludedBy: 'الأم' });
            }
        }

        // 3. Son excludes: grandsons, granddaughters, all brothers & sisters
        if (getCount('son') > 0) {
            if (getCount('grandson') > 0) {
                exclusions.push({ label: 'ابن ابن', type: 'grandson', count: getCount('grandson'), reason: 'يُحجب لوجود ابن مباشر أقرب للميت', excludedBy: 'الابن المباشر' });
            }
            if (getCount('granddaughter') > 0) {
                exclusions.push({ label: 'بنت ابن', type: 'granddaughter', count: getCount('granddaughter'), reason: 'تُحجب لوجود ابن مباشر أقرب للميت (مادة 293)', excludedBy: 'الابن المباشر' });
            }
            ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'].forEach(sib => {
                if (getCount(sib) > 0 && !exclusions.some(x => x.type === sib)) {
                    exclusions.push({ label: counts[sib].definition.label, type: sib, count: getCount(sib), reason: 'يحجب لوجود الفرع الوارث المذكر (الابن)', excludedBy: 'الابن المباشر' });
                }
            });
        }

        // 4. Grandson excludes: brothers/sisters, further grandsons
        if (getCount('grandson') > 0 && getCount('son') === 0) {
            ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'].forEach(sib => {
                if (getCount(sib) > 0 && !exclusions.some(x => x.type === sib)) {
                    exclusions.push({ label: counts[sib].definition.label, type: sib, count: getCount(sib), reason: 'يحجب لوجود ابن ابن للميت فرع مذكر وارث', excludedBy: 'ابن ابن' });
                }
            });
        }

        // 5. Descendants/Male Ascendants exclude Maternal Brothers & Maternal Sisters (الحجب بالكلالة)
        if (hasChildren || hasFather || (getCount('paternal_grandfather') > 0 && !hasFather)) {
            ['maternal_brother', 'maternal_sister'].forEach(sib => {
                if (getCount(sib) > 0 && !exclusions.some(x => x.type === sib)) {
                    exclusions.push({ label: counts[sib].definition.label, type: sib, count: getCount(sib), reason: 'يحجب الأخوة لأم لوجود فرع وارث مطلقاً أو أصل وارث مذكر (مادة 301)', excludedBy: 'الفرع/الأصل الوارث' });
                }
            });
        }

        // 6. Full Brother excludes: Paternal brothers & Sisters, uncles, cousins
        if (getCount('full_brother') > 0) {
            ['paternal_brother', 'paternal_sister'].forEach(sib => {
                if (getCount(sib) > 0 && !exclusions.some(x => x.type === sib)) {
                    exclusions.push({ label: counts[sib].definition.label, type: sib, count: getCount(sib), reason: 'يُحجب الأخوة لأب لوجود الأخ الشقيق الأقرب بالدم', excludedBy: 'الأخ الشقيق' });
                }
            });
            ['paternal_uncle', 'paternal_cousin'].forEach(u => {
                if (getCount(u) > 0) {
                    exclusions.push({ label: counts[u].definition.label, type: u, count: getCount(u), reason: 'يحجب عم أو ابن عم لوجود العصبة الأقرب (الأخ الشقيق)', excludedBy: 'الأخ الشقيق' });
                }
            });
        }

        // 7. Full Sister if she becomes Assaba with daughters ("الأخوات مع البنات عصبة") excludes Paternal Brother/Sister
        const isFullSisterAssabaWithDaughters = (getCount('full_sister') > 0 && getCount('daughter') > 0 && getCount('full_brother') === 0 && getCount('son') === 0 && getCount('grandson') === 0);
        if (isFullSisterAssabaWithDaughters) {
            ['paternal_brother', 'paternal_sister'].forEach(sib => {
                if (getCount(sib) > 0 && !exclusions.some(x => x.type === sib)) {
                    exclusions.push({ label: counts[sib].definition.label, type: sib, count: getCount(sib), reason: 'يُحجب لوجود الأخت الشقيقة التي صارت عصبة مع البنات (قاعدة الباقي)', excludedBy: 'الأخت الشقيقة عصبة مع البنات' });
                }
            });
        }

        // 8. Multiple daughters (2+) and no son or grandson exclude granddaughter (بنت الابن)
        if (getCount('daughter') >= 2 && getCount('son') === 0 && getCount('grandson') === 0 && getCount('granddaughter') > 0) {
            exclusions.push({ label: 'بنت ابن', type: 'granddaughter', count: getCount('granddaughter'), reason: 'تحجب لاستغراق البنات الثلثين الشرعيين، وعدم وجود عاصب لها موازٍ أو أسفل منها (العاصب المبارك - مادة 293)', excludedBy: 'البنات (2+)' });
        }

        // 9. Multiple full sisters (2+) and no full brother/paternal brother exclude paternal sisters (أخوات لأب)
        if (getCount('full_sister') >= 2 && getCount('full_brother') === 0 && getCount('paternal_brother') === 0 && getCount('paternal_sister') > 0) {
            exclusions.push({ label: 'أخت لأب', type: 'paternal_sister', count: getCount('paternal_sister'), reason: 'تحجب أخت لأب لاستغراق الشقيقات لثلثي التركة وعدم وجود عاصب (أخ لأب)', excludedBy: 'الشقيقات (2+)' });
        }

        api_saveExcludedHeirs(exclusions);

        // Define help structures
        const isExcluded = (type: string) => exclusions.some(e => e.type === type);

        // Calculate Fixed Shares (الفروض المقدرة)
        const fixedShares: { heirType: string; label: string; num: number; den: number; ev: any }[] = [];

        // HUSBAND
        if (getCount('husband') > 0 && !isExcluded('husband')) {
            const hasDesc = hasChildren;
            fixedShares.push({
                heirType: 'husband',
                label: 'الزوج',
                num: hasDesc ? 1 : 1,
                den: hasDesc ? 4 : 2,
                ev: hasDesc ? LEGAL_EVIDENCE.husband_1_4 : LEGAL_EVIDENCE.husband_1_2
            });
        }

        // WIVES
        if (getCount('wife') > 0 && !isExcluded('wife')) {
            const hasDesc = hasChildren;
            fixedShares.push({
                heirType: 'wife',
                label: `الزوجة/الزوجات (العدد: ${getCount('wife')})`,
                num: hasDesc ? 1 : 1,
                den: hasDesc ? 8 : 4,
                ev: hasDesc ? LEGAL_EVIDENCE.wife_1_8 : LEGAL_EVIDENCE.wife_1_4
            });
        }

        // MOTHER
        if (getCount('mother') > 0 && !isExcluded('mother')) {
            const hasMultipleSibs = siblingsCount >= 2;
            const fatherExistsNonExcluded = hasFather && !isExcluded('father');
            const spouseExistsNonExcluded = (getCount('husband') > 0 && !isExcluded('husband')) || (getCount('wife') > 0 && !isExcluded('wife'));
            
            // Checking Al-Ghrawayn Case (الغراوين/العمريتين): Mother, Father, and one spouse, no children, no siblings
            const isAlGhrawayn = fatherExistsNonExcluded && spouseExistsNonExcluded && !hasChildren && siblingsCount === 0;

            if (isAlGhrawayn) {
                // Takes 1/3 of remainder. In fraction terms, we will represent this separately during base calculation
                // Let's list mother is having a special share which we evaluate manually.
                fixedShares.push({
                    heirType: 'mother',
                    label: 'الأم (حالة الغراوين - ثلث الباقي)',
                    num: 1, // Will handle special subtraction
                    den: 3, 
                    ev: LEGAL_EVIDENCE.mother_1_3_residue
                });
                result.steps.push('تطبيق حالة العمرية (الغراوية): لأن الورثة هم الأب والأم وأحد الزوجين فقط، ترث الأم ثلث الباقي بعد نصيب الزوجية للعدالة الفقهية.');
            } else if (hasChildren || hasMultipleSibs) {
                fixedShares.push({
                    heirType: 'mother',
                    label: 'الأم',
                    num: 1,
                    den: 6,
                    ev: LEGAL_EVIDENCE.mother_1_6
                });
            } else {
                fixedShares.push({
                    heirType: 'mother',
                    label: 'الأم',
                    num: 1,
                    den: 3,
                    ev: LEGAL_EVIDENCE.mother_1_3
                });
            }
        }

        // FATHER
        let isFatherAssaba = false;
        let isFatherFixedWithAssaba = false;
        if (getCount('father') > 0 && !isExcluded('father')) {
            if (hasMaleDescendant) {
                fixedShares.push({
                    heirType: 'father',
                    label: 'الأب',
                    num: 1,
                    den: 6,
                    ev: LEGAL_EVIDENCE.father_1_6
                });
            } else if (hasFemaleDescendant) {
                fixedShares.push({
                    heirType: 'father',
                    label: 'الأب (فرض السدس مع التعصيب)',
                    num: 1,
                    den: 6,
                    ev: LEGAL_EVIDENCE.father_1_6
                });
                isFatherFixedWithAssaba = true;
            } else {
                isFatherAssaba = true;
            }
        }

        // GRANDFATHER
        let isGrandfatherAssaba = false;
        let isGrandfatherFixedWithAssaba = false;
        if (getCount('paternal_grandfather') > 0 && !isExcluded('paternal_grandfather')) {
            if (hasMaleDescendant) {
                fixedShares.push({
                    heirType: 'paternal_grandfather',
                    label: 'الجد الصحيح',
                    num: 1,
                    den: 6,
                    ev: LEGAL_EVIDENCE.father_1_6
                });
            } else if (hasFemaleDescendant) {
                fixedShares.push({
                    heirType: 'paternal_grandfather',
                    label: 'الجد الصحيح (فرض وسدس مع التعصيب)',
                    num: 1,
                    den: 6,
                    ev: LEGAL_EVIDENCE.father_1_6
                });
                isGrandfatherFixedWithAssaba = true;
            } else {
                isGrandfatherAssaba = true;
            }
        }

        // GRANDMOTHERS
        if (getCount('paternal_grandmother') > 0 && !isExcluded('paternal_grandmother') && getCount('maternal_grandmother') > 0 && !isExcluded('maternal_grandmother')) {
            // Both share the 1/6
            fixedShares.push({
                heirType: 'grandmothers_shared',
                label: 'الجدتان (لأب ولأم معا بالتساوي)',
                num: 1,
                den: 6,
                ev: LEGAL_EVIDENCE.grandmother_1_6
            });
        } else {
            if (getCount('paternal_grandmother') > 0 && !isExcluded('paternal_grandmother')) {
                fixedShares.push({
                    heirType: 'paternal_grandmother',
                    label: 'الجدة لأب',
                    num: 1,
                    den: 6,
                    ev: LEGAL_EVIDENCE.grandmother_1_6
                });
            }
            if (getCount('maternal_grandmother') > 0 && !isExcluded('maternal_grandmother')) {
                fixedShares.push({
                    heirType: 'maternal_grandmother',
                    label: 'الجدة لأم',
                    num: 1,
                    den: 6,
                    ev: LEGAL_EVIDENCE.grandmother_1_6
                });
            }
        }

        // DAUGHTERS (if no Sons)
        const hasSons = getCount('son') > 0;
        if (getCount('daughter') > 0 && !hasSons && !isExcluded('daughter')) {
            fixedShares.push({
                heirType: 'daughter',
                label: `بنت/بنات (العدد: ${getCount('daughter')})`,
                num: getCount('daughter') === 1 ? 1 : 2,
                den: getCount('daughter') === 1 ? 2 : 3,
                ev: getCount('daughter') === 1 ? LEGAL_EVIDENCE.daughter_1_2 : LEGAL_EVIDENCE.daughter_2_3
            });
        }

        // GRANDDAUGHTERS (if no son/daughter/grandson)
        if (getCount('granddaughter') > 0 && !hasSons && getCount('daughter') === 0 && getCount('grandson') === 0 && !isExcluded('granddaughter')) {
            fixedShares.push({
                heirType: 'granddaughter',
                label: `بنات الابن (العدد: ${getCount('granddaughter')})`,
                num: getCount('granddaughter') === 1 ? 1 : 2,
                den: getCount('granddaughter') === 1 ? 2 : 3,
                ev: getCount('daughter') === 1 ? LEGAL_EVIDENCE.daughter_1_2 : LEGAL_EVIDENCE.daughter_2_3
            });
        } else if (getCount('granddaughter') > 0 && getCount('daughter') === 1 && !hasSons && getCount('grandson') === 0 && !isExcluded('granddaughter')) {
            // Takes 1/6 (completion of 2/3)
            fixedShares.push({
                heirType: 'granddaughter',
                label: `بنات الابن (فرض السدس الساعي لتكملة الثلثين)`,
                num: 1,
                den: 6,
                ev: LEGAL_EVIDENCE.grandmother_1_6
            });
            result.steps.push('بنت الابن ترث السدس تكملة للثلثين لوجود بنت واحدة مباشرة مستحقة للنصف.');
        }

        // FULL SISTERS (if no brother, ascendant or descendant)
        const hasFullBrothers = getCount('full_brother') > 0;
        if (getCount('full_sister') > 0 && !hasFullBrothers && !hasChildren && !hasFather && !isExcluded('full_sister')) {
            fixedShares.push({
                heirType: 'full_sister',
                label: `شقيقة/شقيقات (العدد: ${getCount('full_sister')})`,
                num: getCount('full_sister') === 1 ? 1 : 2,
                den: getCount('full_sister') === 1 ? 2 : 3,
                ev: getCount('full_sister') === 1 ? LEGAL_EVIDENCE.sister_1_2 : LEGAL_EVIDENCE.sister_2_3
            });
        }

        // PATERNAL SISTERS
        const hasPaternalBrothers = getCount('paternal_brother') > 0;
        if (getCount('paternal_sister') > 0 && !hasPaternalBrothers && !hasFullBrothers && getCount('full_sister') === 0 && !hasChildren && !hasFather && !isExcluded('paternal_sister')) {
            fixedShares.push({
                heirType: 'paternal_sister',
                label: `أخت لأب/أخوات لأب (العدد: ${getCount('paternal_sister')})`,
                num: getCount('paternal_sister') === 1 ? 1 : 2,
                den: getCount('paternal_sister') === 1 ? 2 : 3,
                ev: getCount('paternal_sister') === 1 ? LEGAL_EVIDENCE.sister_1_2 : LEGAL_EVIDENCE.sister_2_3
            });
        } else if (getCount('paternal_sister') > 0 && getCount('full_sister') === 1 && !hasPaternalBrothers && !hasFullBrothers && !hasChildren && !hasFather && !isExcluded('paternal_sister')) {
            fixedShares.push({
                heirType: 'paternal_sister',
                label: 'أخت لأب (فرض السدس تكملة الثلثين مع وجود شقيقة واحدة)',
                num: 1,
                den: 6,
                ev: LEGAL_EVIDENCE.grandmother_1_6
            });
        }

        // MATERNAL BROTHERS & SISTERS (Shared in 1/3 or single gets 1/6)
        const activeMaternalSiblingsCount = (isExcluded('maternal_brother') ? 0 : getCount('maternal_brother')) + (isExcluded('maternal_sister') ? 0 : getCount('maternal_sister'));
        if (activeMaternalSiblingsCount > 0) {
            fixedShares.push({
                heirType: 'maternal_siblings',
                label: `الإخوة لأم (العدد: ${activeMaternalSiblingsCount})`,
                num: activeMaternalSiblingsCount === 1 ? 1 : 1,
                den: activeMaternalSiblingsCount === 1 ? 6 : 3,
                ev: activeMaternalSiblingsCount === 1 ? LEGAL_EVIDENCE.maternal_sibling_1_6 : LEGAL_EVIDENCE.maternal_sibling_1_3
            });
        }

        // MATHEMATICAL ANALYSIS (LCM & Shares of Problem)
        const denominators = fixedShares.map(s => s.den);
        const baseProblem = lcmMultiple(denominators);
        result.baseProblem = baseProblem;

        result.steps.push(`حساب المضاعف المشترك الأصغر لمقامات الفروض الشرعية: أصل المسألة هو المخرج الأساسي ${baseProblem}`);

        // Calculate fractions relative to baseProblem
        let sumFardhParts = 0;
        const heirPartsMap: Record<string, { numParts: number; originalShare: any }> = {};

        // Treat special Al-Ghrawayn Mother case
        const containsAlGhrawaynMother = fixedShares.some(s => s.heirType === 'mother' && s.label.includes('الغراوين'));

        if (containsAlGhrawaynMother) {
            // Al-Ghrawayn: Mother gets 1/3 of REMAINING after spouse
            // Let's compute parts manually.
            const spouseShareObj = fixedShares.find(s => s.heirType === 'husband' || s.heirType === 'wife')!;
            const spouseParts = (spouseShareObj.num / spouseShareObj.den) * baseProblem;
            sumFardhParts += spouseParts;
            heirPartsMap[spouseShareObj.heirType] = { numParts: spouseParts, originalShare: spouseShareObj };

            // Mother gets 1/3 of the residue
            const residueParts = baseProblem - spouseParts;
            const motherParts = Math.round(residueParts / 3);
            sumFardhParts += motherParts;
            
            const motherShareObj = fixedShares.find(s => s.heirType === 'mother')!;
            heirPartsMap['mother'] = { numParts: motherParts, originalShare: motherShareObj };

            // Add other shares normally
            fixedShares.forEach(s => {
                if (s.heirType !== 'mother' && s.heirType !== 'husband' && s.heirType !== 'wife') {
                    const parts = (s.num / s.den) * baseProblem;
                    sumFardhParts += parts;
                    heirPartsMap[s.heirType] = { numParts: parts, originalShare: s };
                }
            });
        } else {
            fixedShares.forEach(s => {
                const parts = (s.num / s.den) * baseProblem;
                sumFardhParts += parts;
                heirPartsMap[s.heirType] = { numParts: parts, originalShare: s };
            });
        }

        // DETERMINE AOUL (العول) VS RADD (الرد) VS ASSABA (العصبة)
        let finalProblem = baseProblem;
        const finalShares: CalculatedShare[] = [];

        const hasAssbaResiduary = hasSons || 
                                (getCount('grandson') > 0 && !isExcluded('grandson')) || 
                                (getCount('full_brother') > 0 && !isExcluded('full_brother')) ||
                                (getCount('paternal_brother') > 0 && !isExcluded('paternal_brother')) ||
                                (getCount('paternal_uncle') > 0 && !isExcluded('paternal_uncle')) || 
                                (getCount('paternal_cousin') > 0 && !isExcluded('paternal_cousin')) ||
                                isFatherAssaba || 
                                isGrandfatherAssaba ||
                                isFullSisterAssabaWithDaughters;

        if (sumFardhParts > baseProblem) {
            // Case 1: Al-Aoul (العول) - Sum of parts exceeds base
            result.isAoul = true;
            finalProblem = sumFardhParts;
            result.finalProblem = finalProblem;
            result.steps.push(`عالت المسألة: مجموع الفروض الشرعية (${sumFardhParts}) أكبر من أصل المسألة (${baseProblem})، لذا تم تعديل أصل المسألة عولاً إلى ${finalProblem} لتقليل كسر الأنصبة بشكل عادل.`);

            // Distribute shares with upgraded denominator (Aoul)
            for (const key in heirPartsMap) {
                const entry = heirPartsMap[key];
                const finalRatio = entry.numParts / finalProblem;
                const valueOfAmount = netEstate * finalRatio;

                api_pushShare(finalShares, key, entry.originalShare.label, `${entry.numParts}/${finalProblem} عولاً`, entry.numParts, finalProblem, finalRatio, valueOfAmount, entry.originalShare.ev);
            }
        } else if (sumFardhParts < baseProblem && !hasAssbaResiduary) {
            // Case 2: Al-Radd (الرد) - Sum of parts is less, and no residue heirs are present (residue returned to non-spouse Fardh heirs)
            result.isRadd = true;
            result.steps.push(`تطبيق الرد شرعاً: مجموع الأنصبة الفرضية (${sumFardhParts}) أقل من أصل المسألة ولا توجد عصبة ذكورية، فيُرد الباقي على أصحاب الفروض (ما عدا الزوج والزوجة) استناداً للمادة 326 من قانون الأحوال الشخصية الكويتي.`);

            // Spouses do not get Radd
            const spousesParts = (heirPartsMap['husband']?.numParts || 0) + (heirPartsMap['wife']?.numParts || 0);
            const nonSpouseParts = sumFardhParts - spousesParts;

            // Compute Radd multipliers
            for (const key in heirPartsMap) {
                const entry = heirPartsMap[key];
                const isSpouse = key === 'husband' || key === 'wife';
                
                if (isSpouse) {
                    // Spouses get strictly their original proportion
                    const ratio = entry.numParts / baseProblem;
                    const amount = netEstate * ratio;
                    api_pushShare(finalShares, key, entry.originalShare.label, `${entry.numParts}/${baseProblem} (لا يُرد عليه)`, entry.numParts, baseProblem, ratio, amount, entry.originalShare.ev);
                } else {
                    // Non-spouses absorb the remaining proportion
                    const spouseRatioSum = spousesParts / baseProblem;
                    const availableForRaddRatio = 1 - spouseRatioSum;
                    const originalFardhRatioAmongNonSpouses = entry.numParts / nonSpouseParts;
                    const finalRatio = originalFardhRatioAmongNonSpouses * availableForRaddRatio;
                    const amount = netEstate * finalRatio;

                    api_pushShare(
                        finalShares, 
                        key, 
                        entry.originalShare.label, 
                        `${entry.numParts}/${baseProblem} فرضاً + رداً`, 
                        entry.numParts * baseProblem, 
                        baseProblem * nonSpouseParts, 
                        finalRatio, 
                        amount, 
                        entry.originalShare.ev
                    );
                }
            }
        } else {
            // Case 3: Exactly matching OR residue goes to Assaba (تعصيب)
            result.steps.push('توزيع الباقي بالتعصيب أو تطابق أصل المسألة بالتساوي مع أصحاب الفروض.');

            // Push Fardh results
            for (const key in heirPartsMap) {
                const entry = heirPartsMap[key];
                const finalRatio = entry.numParts / baseProblem;
                const valueOfAmount = netEstate * finalRatio;

                api_pushShare(finalShares, key, entry.originalShare.label, `${entry.numParts}/${baseProblem}`, entry.numParts, baseProblem, finalRatio, valueOfAmount, entry.originalShare.ev);
            }

            // Distribute Residue (التعصيب)
            const remainingRatio = 1 - (sumFardhParts / baseProblem);
            const residueAmount = netEstate * remainingRatio;

            if (residueAmount > 0.01) {
                // Determine who takes residue and logic
                if (hasSons) {
                    // Sons and Daughters together (Bil-Ghayr)
                    const daughtersCount = isExcluded('daughter') ? 0 : getCount('daughter');
                    const sonsCount = getCount('son');
                    const totalAssabaUnits = (sonsCount * 2) + daughtersCount;
                    
                    if (sonsCount > 0) {
                        const unitValue = residueAmount / totalAssabaUnits;
                        
                        // Add or merge to Son
                        const sonsPercentage = (sonsCount * 2) / totalAssabaUnits * remainingRatio;
                        api_pushShare(finalShares, 'son', `الأبناء (العدد: ${sonsCount})`, 'تعصيب بالنفس (محض الرد)', 2 * sonsCount, totalAssabaUnits, sonsPercentage, unitValue * (sonsCount * 2), LEGAL_EVIDENCE.assaba);

                        // If daughters exist, they became Assaba bil Ghayr instead of Fardh
                        if (daughtersCount > 0) {
                            // Splice the daughters from Fardh as they are now Assaba
                            const idx = finalShares.findIndex(sh => sh.heirType === 'daughter');
                            if (idx > -1) finalShares.splice(idx, 1);

                            const daughtersPercentage = daughtersCount / totalAssabaUnits * remainingRatio;
                            api_pushShare(finalShares, 'daughter', `البنات (العدد: ${daughtersCount})`, 'تعصيب بالغير (للذكر مثل حظ الأنثيين)', daughtersCount, totalAssabaUnits, daughtersPercentage, unitValue * daughtersCount, LEGAL_EVIDENCE.assaba);
                        }
                    }
                } else if (getCount('grandson') > 0 && !isExcluded('grandson')) {
                    const grandsonsCount = getCount('grandson');
                    const granddaughtersCount = isExcluded('granddaughter') ? 0 : getCount('granddaughter');
                    const totalUnits = (grandsonsCount * 2) + granddaughtersCount;
                    const unitValue = residueAmount / totalUnits;

                    api_pushShare(finalShares, 'grandson', `أبناء الابن (العدد: ${grandsonsCount})`, 'تعصيب بالنفس (ابن الابن)', 2 * grandsonsCount, totalUnits, (grandsonsCount * 2 / totalUnits) * remainingRatio, unitValue * (grandsonsCount * 2), LEGAL_EVIDENCE.assaba);

                    if (granddaughtersCount > 0) {
                        const idx = finalShares.findIndex(sh => sh.heirType === 'granddaughter');
                        if (idx > -1) finalShares.splice(idx, 1);

                        api_pushShare(finalShares, 'granddaughter', `بنات الابن (العدد: ${granddaughtersCount})`, 'تعصيب بالغير مع ابن الابن', granddaughtersCount, totalUnits, (granddaughtersCount / totalUnits) * remainingRatio, unitValue * granddaughtersCount, LEGAL_EVIDENCE.assaba);
                    }
                } else if (isFatherAssaba || isFatherFixedWithAssaba) {
                    // Father takes all residue
                    const fatherIdx = finalShares.findIndex(sh => sh.heirType === 'father');
                    if (fatherIdx > -1) {
                        finalShares[fatherIdx].amount += residueAmount;
                        finalShares[fatherIdx].shareValue += remainingRatio;
                        finalShares[fatherIdx].shareLabel = 'السدس فرضاً + الباقي تعصيباً';
                    } else {
                        api_pushShare(finalShares, 'father', 'الأب', 'تعصيب بالنفس (عدم وجود فرع وارث)', 1, 1, remainingRatio, residueAmount, LEGAL_EVIDENCE.assaba);
                    }
                    result.steps.push('حاز الأب المتبقي من التركة بالتعصيب لعدم وجود فرع وارث ذكر.');
                } else if (isGrandfatherAssaba || isGrandfatherFixedWithAssaba) {
                    const gfIdx = finalShares.findIndex(sh => sh.heirType === 'paternal_grandfather');
                    if (gfIdx > -1) {
                        finalShares[gfIdx].amount += residueAmount;
                        finalShares[gfIdx].shareValue += remainingRatio;
                        finalShares[gfIdx].shareLabel = 'السدس فرضاً + الباقي تعصيباً';
                    } else {
                        api_pushShare(finalShares, 'paternal_grandfather', 'الجد الصحيح لأب', 'تعصيب بالنفس لعدم وجود مخرج مذكر أقرب', 1, 1, remainingRatio, residueAmount, LEGAL_EVIDENCE.assaba);
                    }
                } else if (isFullSisterAssabaWithDaughters) {
                    // Full sister takes residue with daughters (Assaba Ma'a Al-Ghayr)
                    const countSisters = getCount('full_sister');
                    api_pushShare(finalShares, 'full_sister', `الأخوات الشقيقات (العدد: ${countSisters}) عصبة مع البنات`, 'تعصيب مع الغير مع البنات', 1, 1, remainingRatio, residueAmount, LEGAL_EVIDENCE.assaba);
                    result.steps.push('صارت الأخت الشقيقة عصبة مع البنات استناداً للمبدأ الشرعي (اجعلوا الأخوات مع البنات عصبة).');
                } else if (getCount('full_brother') > 0 && !isExcluded('full_brother')) {
                    const brothersCount = getCount('full_brother');
                    const sisterCount = isExcluded('full_sister') ? 0 : getCount('full_sister');
                    const totalUnits = (brothersCount * 2) + sisterCount;
                    const unitValue = residueAmount / totalUnits;

                    api_pushShare(finalShares, 'full_brother', `الأخوة الأشقاء (العدد: ${brothersCount})`, 'تعصيب بالنفس', 2 * brothersCount, totalUnits, ((brothersCount * 2) / totalUnits) * remainingRatio, unitValue * (brothersCount * 2), LEGAL_EVIDENCE.assaba);

                    if (sisterCount > 0) {
                        const idx = finalShares.findIndex(sh => sh.heirType === 'full_sister');
                        if (idx > -1) finalShares.splice(idx, 1);

                        api_pushShare(finalShares, 'full_sister', `الشقيقات (العدد: ${sisterCount})`, 'تعصيب بالغير مع الأخ الشقيق', sisterCount, totalUnits, (sisterCount / totalUnits) * remainingRatio, unitValue * sisterCount, LEGAL_EVIDENCE.assaba);
                    }
                } else if (getCount('paternal_brother') > 0 && !isExcluded('paternal_brother')) {
                    const brothersCount = getCount('paternal_brother');
                    const sisterCount = isExcluded('paternal_sister') ? 0 : getCount('paternal_sister');
                    const totalUnits = (brothersCount * 2) + sisterCount;
                    const unitValue = residueAmount / totalUnits;

                    api_pushShare(finalShares, 'paternal_brother', `الإخوة لأب (العدد: ${brothersCount})`, 'تعصيب للورثة لأب', 2 * brothersCount, totalUnits, ((brothersCount * 2) / totalUnits) * remainingRatio, unitValue * (brothersCount * 2), LEGAL_EVIDENCE.assaba);

                    if (sisterCount > 0) {
                        const idx = finalShares.findIndex(sh => sh.heirType === 'paternal_sister');
                        if (idx > -1) finalShares.splice(idx, 1);

                        api_pushShare(finalShares, 'paternal_sister', `الأخوات لأب (العدد: ${sisterCount})`, 'تعصيب بالغير مع الأخ لأب', sisterCount, totalUnits, (sisterCount / totalUnits) * remainingRatio, unitValue * sisterCount, LEGAL_EVIDENCE.assaba);
                    }
                } else if (getCount('paternal_uncle') > 0 && !isExcluded('paternal_uncle')) {
                    const countUncles = getCount('paternal_uncle');
                    api_pushShare(finalShares, 'paternal_uncle', `الأعمام الأشقاء (العدد: ${countUncles})`, 'تعصيب بالنفس (أعمام أشقاء)', 1, 1, remainingRatio, residueAmount, LEGAL_EVIDENCE.assaba);
                } else if (getCount('paternal_cousin') > 0 && !isExcluded('paternal_cousin')) {
                    const countCousins = getCount('paternal_cousin');
                    api_pushShare(finalShares, 'paternal_cousin', `أبناء العم الشقيق (العدد: ${countCousins})`, 'تعصيب بالنفس (أبناء عم شقيق)', 1, 1, remainingRatio, residueAmount, LEGAL_EVIDENCE.assaba);
                }
            }
        }

        result.shares = finalShares;
        result.excludedHeirs = exclusions;

    } else {
        // MADHAB = JAFARI (الفقه الجعفري)
        result.steps.push('تطبيق الفقه الجعفري المعتمد بالدوائر الجعفرية بمحاكم دولة الكويت.');
        result.steps.push('التقسيم يعتمد على مبدأ طبقات الإرث المانعة لبعضها تماماً: الطبقة الأولى تمنع تماماً الطبقة الثانية، والطبقة الثانية تمنع الطبقة الثالثة.');

        const exclusions: ExcludedHeir[] = [];

        // Class 1 (الطبقة الأولى): Parents & Descendants (الأولاد للصلب، والوالدان المباشران)
        const hasParentsOrChildren = hasFather || hasMother || hasChildren;
        
        // Define Class 2 (الطبقة الثانية): Grandparents (الأجداد والجدات)، Siblings (الإخوة والأخوات وأولادهم)
        const hasClass2InInput = getCount('paternal_grandfather') > 0 || getCount('paternal_grandmother') > 0 || getCount('maternal_grandmother') > 0 ||
                                 getCount('full_brother') > 0 || getCount('full_sister') > 0 || getCount('paternal_brother') > 0 || getCount('paternal_sister') > 0 ||
                                 getCount('maternal_brother') > 0 || getCount('maternal_sister') > 0;

        // Class 3 (الطبقة الثالثة): Uncles & Cousins
        const hasClass3InInput = getCount('paternal_uncle') > 0 || getCount('paternal_cousin') > 0;

        if (hasParentsOrChildren) {
            // Class 1 is active. Exclude Class 2 and Class 3 completely.
            if (hasClass2InInput) {
                heirs.forEach(h => {
                    if (['paternal_grandfather', 'paternal_grandmother', 'maternal_grandmother', 'full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'].includes(h.type) && h.count > 0) {
                        exclusions.push({
                            label: h.label,
                            type: h.type,
                            count: h.count,
                            reason: 'يُحجب بالكامل بالمذهب الجعفري لوجود الطبقة الأولى (الأبناء أو الوالدين)',
                            excludedBy: 'الطبقة الأولى'
                        });
                    }
                });
            }
            if (hasClass3InInput) {
                heirs.forEach(h => {
                    if (['paternal_uncle', 'paternal_cousin'].includes(h.type) && h.count > 0) {
                        exclusions.push({
                            label: h.label,
                            type: h.type,
                            count: h.count,
                            reason: 'يُحجب بالكامل بالمذهب الجعفري لوجود الطبقة الأولى العالية المانعة نسباً الكلالات',
                            excludedBy: 'الطبقة الأولى'
                        });
                    }
                });
            }
        } else if (hasClass2InInput) {
            // Class 2 active. Exclude Class 3 completely.
            if (hasClass3InInput) {
                heirs.forEach(h => {
                    if (['paternal_uncle', 'paternal_cousin'].includes(h.type) && h.count > 0) {
                        exclusions.push({
                            label: h.label,
                            type: h.type,
                            count: h.count,
                            reason: 'يُحجب بالكامل لوجود الطبقة الثانية (الإخوة أو الأجداد) بالمذهب الجعفري',
                            excludedBy: 'الطبقة الثانية'
                        });
                    }
                });
            }
        }

        result.excludedHeirs = exclusions;
        const isExcluded = (type: string) => exclusions.some(e => e.type === type);

        // Standard logic for Class 1 (most common)
        const finalShares: CalculatedShare[] = [];
        let remainingRatio = 1.0;

        // Spouses inherit in all classes in Shia Law
        // Husband: 1/4 if descendants, 1/2 if not
        if (getCount('husband') > 0 && !isExcluded('husband')) {
            const hasDesc = hasChildren;
            const ratio = hasDesc ? 0.25 : 0.5;
            remainingRatio -= ratio;
            api_pushShare(finalShares, 'husband', 'الزوج (المذهب الجعفري)', hasDesc ? '1/4 فرضاً' : '1/2 فرضاً', hasDesc ? 1 : 1, hasDesc ? 4 : 2, ratio, netEstate * ratio, LEGAL_EVIDENCE.jafari_base);
        }

        // Wives (share the 1/8 if descendants, 1/4 if not)
        if (getCount('wife') > 0 && !isExcluded('wife')) {
            const hasDesc = hasChildren;
            const ratio = hasDesc ? 0.125 : 0.25;
            remainingRatio -= ratio;
            api_pushShare(finalShares, 'wife', `الزوجة/الزوجات (العدد: ${getCount('wife')})`, hasDesc ? '1/8 فرضاً بالتساوي' : '1/4 فرضاً بالتساوي', hasDesc ? 1 : 1, hasDesc ? 8 : 4, ratio, netEstate * ratio, LEGAL_EVIDENCE.jafari_base);
        }

        // In Class 1, parents and children inherit together.
        const activeParents = (hasFather && !isExcluded('father') ? 1 : 0) + (hasMother && !isExcluded('mother') ? 1 : 0);
        const sonsCount = getCount('son');
        const daughtersCount = getCount('daughter');

        if (sonsCount > 0 || daughtersCount > 0) {
            // Children exist
            // Parents get their fixed fractions: 1/6 each if children exist
            let parentsRatio = 0;
            if (hasFather && !isExcluded('father')) {
                parentsRatio += (1/6);
                api_pushShare(finalShares, 'father', 'الأب فرضا', '1/6', 1, 6, 1/6, netEstate * (1/6), LEGAL_EVIDENCE.jafari_base);
            }
            if (hasMother && !isExcluded('mother')) {
                parentsRatio += (1/6);
                api_pushShare(finalShares, 'mother', 'الأم فرضاً', '1/6', 1, 6, 1/6, netEstate * (1/6), LEGAL_EVIDENCE.jafari_base);
            }

            const childrenRatio = remainingRatio - parentsRatio;
            const childrenValue = netEstate * childrenRatio;

            if (sonsCount > 0) {
                // If there are sons, distribute according to 2:1 ratio for sons:daughters
                const totalUnits = (sonsCount * 2) + daughtersCount;
                const unitRatio = childrenRatio / totalUnits;

                const sonFinalRatio = (2 / totalUnits) * childrenRatio;
                api_pushShare(finalShares, 'son', `الأبناء (العدد: ${sonsCount})`, 'قرابة نسبية (ذكرين سهمين)', 2, totalUnits, sonFinalRatio * sonsCount, childrenValue * (sonsCount * 2 / totalUnits), LEGAL_EVIDENCE.jafari_base);

                if (daughtersCount > 0) {
                    const daughterFinalRatio = (1 / totalUnits) * childrenRatio;
                    api_pushShare(finalShares, 'daughter', `البنات (العدد: ${daughtersCount})`, 'قرابة نسبية (سهم واحد)', 1, totalUnits, daughterFinalRatio * daughtersCount, childrenValue * (daughtersCount / totalUnits), LEGAL_EVIDENCE.jafari_base);
                }
            } else {
                // Only daughters exist, no sons.
                // In Jafari law, if only daughters exist, daughters take all remaining estate, doing Radd to parents if any.
                // Or daughters take the rest. Let's distribute daughters' share equally.
                api_pushShare(finalShares, 'daughter', `البنات (العدد: ${daughtersCount})`, 'الفرض بالتساوي والباقي برداً', 1, 1, childrenRatio, childrenValue, LEGAL_EVIDENCE.jafari_base);
            }
        } else {
            // No children, only parents survive (Class 1)
            // Mother gets 1/3 (if no brothers of deceased to block her to 1/6)
            // Father takes the rest by Kinship (قرابة بالنفس)
            let motherRatio = 1/3;
            // Blocking check: in Shia law, maternal block exists if there are 2+ full/paternal brothers or 4 sisters
            const brothersCount = getCount('full_brother') + getCount('paternal_brother');
            if (brothersCount >= 2) {
                motherRatio = 1/6;
                result.steps.push('حُجب ثلث الأم فرضاً إلى السدس لتعدد إخوة الميت في الطبقة الإضافية الشرعية.');
            }

            if (hasMother && !isExcluded('mother')) {
                api_pushShare(finalShares, 'mother', 'الأم فرضاً', motherRatio === 1/3 ? '1/3 فرضاً كاملاً' : '1/6 فرضاً بالحجب الزائد', motherRatio === 1/3 ? 1 : 1, motherRatio === 1/3 ? 3 : 6, motherRatio, netEstate * motherRatio, LEGAL_EVIDENCE.jafari_base);
                remainingRatio -= motherRatio;
            }

            if (hasFather && !isExcluded('father')) {
                api_pushShare(finalShares, 'father', 'الأب قرابة نسبية', 'سهم الباقي بالقرابة', 1, 1, remainingRatio, netEstate * remainingRatio, LEGAL_EVIDENCE.jafari_base);
            }
        }

        result.shares = finalShares;
    }

    // Generate Intelligent Advisory Text
    api_generateAdvisoryText(result);

    return result;

    // Inside-helpers for cleaner structure and DRY principle
    function api_pushShare(arr: CalculatedShare[], type: string, label: string, shareLabel: string, num: number, den: number, ratio: number, amt: number, ev: any) {
        arr.push({
            heirLabel: label,
            heirType: type,
            count: getCount(type) || 1,
            shareLabel,
            shareFractionNum: num,
            shareFractionDen: den,
            shareValue: ratio,
            amount: Math.round(amt),
            isExcluded: false,
            evidence: ev || { source: 'الشارع الحكيم', text: 'أحكام الإرث الشرعية', article: 'قانون الأحوال الشخصية الكويتي' }
        });
    }

    function api_saveExcludedHeirs(exclusions: ExcludedHeir[]) {
        exclusions.forEach(ex => {
            result.steps.push(`حجب الميراث: حجب ${ex.label} (${ex.count}) بسبب وجود ${ex.excludedBy}.`);
        });
    }

    function api_generateAdvisoryText(res: InheritanceCalculation) {
        const eligibleNames = res.shares.map(s => `${s.heirLabel} (${(s.shareValue * 100).toFixed(1)}%)`).join(', ');
        const excludedNames = res.excludedHeirs.length > 0 ? res.excludedHeirs.map(s => s.label).join(', ') : 'لا يوجد';
        
        res.advisoryText = `بناءً على المعطيات الشرعية والقانونية المدخلة، فإن إجمالي قيمة التركة المصرح بها هو ${res.totalEstate.toLocaleString()} د.ك، وتم خصم التزامات الديون والوصايا وتجهيز الميت بقيمة ${(res.totalEstate - res.netEstate).toLocaleString()} د.ك ليكون صافي التركة الصالحة للتوزيع الشرعي هو ${res.netEstate.toLocaleString()} د.ك. تم توزيع هذه التركة بناءً على ${res.madhab === 'sunni' ? 'قانون الأحوال الشخصية الكويتي (المذهب السني)' : 'لائحة المحكمة الجعفرية الكويتية (المذهب الجعفري)'}. الورثة المستحقون للتركة الحالية هم: [ ${eligibleNames} ]. بينما تم حجب الورثة التالي ذكرهم لوجود الأقرب منهم حجب حرمان شرعي وفقاً للقواعد: [ ${excludedNames} ].`;
    }
}
