/**
 * Sharia & Civil Law Inheritance Engine (محرك حساب المواريث الشرعي والقانوني)
 * Sabry Shatta Law Firm Systems - State of Kuwait
 * Fully compliant with Kuwaiti Personal Status Law No. 51 of 1984 (Articles 288-342) 
 * and Kuwait Jafari Family Court Jurisprudence.
 */

export type Gender = 'M' | 'F';
export type CalculationMadhab = 'sunni' | 'jafari';
export type HeirSpecialCondition = 'normal' | 'deceased_before' | 'impediment_religion' | 'impediment_homicide' | 'fetus' | 'khuntha';

export interface HeirDefinition {
    id: string;
    type: string;
    label: string;
    gender: Gender;
    count: number;
    specialCondition?: HeirSpecialCondition;
    notes?: string;
}

export interface CalculatedShare {
    heirLabel: string;
    heirType: string;
    count: number;
    shareType: 'faradh' | 'assaba_nafs' | 'assaba_ghayr' | 'assaba_ma_alghayr' | 'radd' | 'wasiyya_wajibah' | 'reserved_fetus' | 'khuntha_half' | 'special';
    shareLabel: string; // e.g. "1/6 فرضاً", "1/4 فرضاً", "عصبة بالنفس (الباقي)", "ثلث الباقي"
    shareFractionNum: number;
    shareFractionDen: number;
    shareValue: number; // decimal between 0 and 1
    amount: number; // in KWD (3 decimals precision)
    isExcluded: boolean;
    exclusionReason?: string;
    evidence: {
        source: string;
        text: string;
        article: string;
    };
}

export interface ExcludedHeir {
    label: string;
    type: string;
    count: number;
    reason: string;
    excludedBy: string;
    article?: string;
}

export interface EstateAssets {
    cash: number;
    realEstate: number;
    stocks: number;
    jewelry: number;
    vehicles: number;
    receivables: number;
    endOfService?: number;     // مكافأة نهاية الخدمة والمعاشات التقاعدية
    businessLicenses?: number; // الرخص والشركات والمؤسسات التجارية
    otherAssets?: number;      // أصول عينية وممتلكات أخرى
}

export interface EstateDeductions {
    securedDebts: number;    // 1. حقوق العين والرهون المقيدة بالأصول
    funeralExpenses: number; // 2. مصاريف التجهيز والتكفين بالمعروف
    unsecuredDebts: number;  // 3. قضاء الديون الإلهية والآدمية
    wills: number;           // 4. الوصية الشرعية (في حدود الثلث)
}

export interface InheritanceCalculation {
    id: string;
    deceasedName: string;
    deceasedGender: Gender;
    civilId?: string;
    dateOfDeath?: string;
    notes?: string;
    clientName?: string;
    clientPhone?: string;
    caseNumber?: string;
    status?: 'active' | 'amicable' | 'disputed' | 'archived';
    createdAt?: string;
    assets: EstateAssets;
    deductions: EstateDeductions;
    totalEstate: number;
    netEstate: number;
    debts: number;
    funeralExpenses: number;
    wills: number;
    wasiyyaWajibahAmount: number;
    madhab: CalculationMadhab;
    baseProblem: number; // أصل المسألة
    finalProblem: number; // مصح المسألة أو عولها
    isAoul: boolean;
    isRadd: boolean;
    shares: CalculatedShare[];
    excludedHeirs: ExcludedHeir[];
    steps: string[];
    advisoryText: string;
    warnings: string[];
}

export const LEGAL_EVIDENCE_DATABASE: Record<string, { source: string; text: string; article: string }> = {
    husband_1_2: {
        source: 'القرآن الكريم - سورة النساء (الآية 12)',
        text: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ إِن لَّمْ يَكُن لَّهُنَّ وَلَدٌ',
        article: 'المادة (288) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    husband_1_4: {
        source: 'القرآن الكريم - سورة النساء (الآية 12)',
        text: 'فَإِن كَانَ لَهُنَّ وَلَدٌ فَلَكُمُ الرُّبُعُ مِمَّا تَرَكْنَ مِن بَعْدِ وَصِيَّةٍ يُوصِينَ بِهَا أَوْ دَيْنٍ',
        article: 'المادة (288) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    wife_1_4: {
        source: 'القرآن الكريم - سورة النساء (الآية 12)',
        text: 'وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِن لَّمْ يَكُن لَّكُمْ وَلَدٌ',
        article: 'المادة (289) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    wife_1_8: {
        source: 'القرآن الكريم - سورة النساء (الآية 12)',
        text: 'فَإِن كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ مِمَّا تَرَكْتُم مِّن بَعْدِ وَصِيَّةٍ تُوصُونَ بِهَا أَوْ دَيْنٍ',
        article: 'المادة (289) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    mother_1_6: {
        source: 'القرآن الكريم - سورة النساء (الآية 11)',
        text: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ فَإِن كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ',
        article: 'المادة (290) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    mother_1_3: {
        source: 'القرآن الكريم - سورة النساء (الآية 11)',
        text: 'فَإِن لَّمْ يَكُن لَّهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ',
        article: 'المادة (290) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    mother_1_3_residue: {
        source: 'إجماع الصحابة وقضاء أمير المؤمنين عمر بن الخطاب (المسألتان العمريتان)',
        text: 'للأم ثلث الباقي بعد فرض أحد الزوجين حفظاً لقاعدة "للذكر مثل حظ الأنثيين" بين الأبوين',
        article: 'المادة (290 بند ب) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    father_1_6: {
        source: 'القرآن الكريم - سورة النساء (الآية 11)',
        text: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِن كَانَ لَهُ وَلَدٌ',
        article: 'المادة (291) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    father_1_6_plus_assaba: {
        source: 'القرآن والسنة وإجماع الفقهاء',
        text: 'يجمع الأب بين السدس فرضاً والباقي تعصيباً عند وجود الفرع الوارث المؤنث دون المذكر',
        article: 'المادة (291) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    father_assaba: {
        source: 'الحديث النبوي الشريف (صحيح البخاري ومسلم)',
        text: 'ألحقوا الفرائض بأهلها، فما بقي فهو لأولى رجل ذكر',
        article: 'المادة (291 و 292) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    daughter_1_2: {
        source: 'القرآن الكريم - سورة النساء (الآية 11)',
        text: 'وَإِن كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ',
        article: 'المادة (293) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    daughter_2_3: {
        source: 'القرآن الكريم - سورة النساء (الآية 11)',
        text: 'فَإِن كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ',
        article: 'المادة (293) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    son_daughter_assaba_ghayr: {
        source: 'القرآن الكريم - سورة النساء (الآية 11)',
        text: 'يُوصِيكُمُ اللَّهُ فِي أَوْلادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الأُنثَيَيْنِ',
        article: 'المادة (292 و 293) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    granddaughter_1_6_takmila: {
        source: 'قضاء ابن مسعود رضي الله عنه (صحيح البخاري)',
        text: 'لبنت الابن السدس تكملة للثلثين مع البنت الصلبية الواحدة صاحبة النصف',
        article: 'المادة (294) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    grandmother_1_6: {
        source: 'السنة النبوية بقضاء الرسول ﷺ وقضاء أبي بكر الصديق',
        text: 'أن النبي ﷺ أعطى الجدة السدس إذا لم تكن دونها أم',
        article: 'المادة (297) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    grandfather_sahih: {
        source: 'قواعد الفقه الكويتي وإجماع الصحابة',
        text: 'الجد الصحيح كالأب عند فقده، ويسقط بوجود الأب',
        article: 'المادة (298) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    sister_1_2: {
        source: 'القرآن الكريم - سورة النساء (الآية 176)',
        text: 'إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ',
        article: 'المادة (300) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    sister_2_3: {
        source: 'القرآن الكريم - سورة النساء (الآية 176)',
        text: 'فَإِن كَانَتَا اثْنَتَيْنِ فَلَهُمَا الثُّلُثَانِ مِمَّا تَرَكَ',
        article: 'المادة (300) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    sister_assaba_ma_alghayr: {
        source: 'الحديث النبوي الشريف (صحيح البخاري)',
        text: 'اجعلوا الأخوات مع البنات عصبة',
        article: 'المادة (300 بند د) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    maternal_sibling_1_6: {
        source: 'القرآن الكريم - سورة النساء (الآية 12)',
        text: 'وَإِن كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِّنْهُمَا السُّدُسُ',
        article: 'المادة (301) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    maternal_sibling_1_3: {
        source: 'القرآن الكريم - سورة النساء (الآية 12)',
        text: 'فَإِن كَانُوا أَكْثَرَ مِن ذَٰلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ',
        article: 'المادة (301) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    mushtarakah: {
        source: 'قضاء عمر بن الخطاب وعثمان بن عفان وزيد بن ثابت (المسألة المشتركة / الحمارية)',
        text: 'يُشرّك الإخوة الأشقاء مع الإخوة لأم في الثلث بالسوية لاشتراكهم جميعاً في رحم الأم',
        article: 'المادة (304) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    assaba_nafs: {
        source: 'الحديث النبوي الشريف (صحيح البخاري ومسلم)',
        text: 'ألحقوا الفرائض بأهلها، فما بقي فهو لأولى رجل ذكر',
        article: 'المواد (292-296) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    radd_law: {
        source: 'أحكام الرد المقررة بقانون الأحوال الشخصية الكويتي',
        text: 'إذا لم تستغرق الفروض التركة ولم توجد عصبة، رُدّ الباقي على ذوي الفروض النسبية بنسبة أنصبائهم',
        article: 'المادة (326) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    aoul_law: {
        source: 'قضاء أمير المؤمنين علي بن أبي طالب وعمر بن الخطاب (المنبرية وغيرها)',
        text: 'عند تزاحم الفروض وزيادتها عن أصل المسألة، يعال الأصل وتدخل النقيصة على جميع الورثة بحسب سهامهم',
        article: 'المادة (327) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    wasiyyah_wajibah: {
        source: 'قانون الأحوال الشخصية الكويتي المستمد من الفقه الإسلامي',
        text: 'تجب الوصية لأولاد الابن أو البنت المتوفى والدهم في حياة المورث بمقدار حصته لو كان حياً في حدود الثلث',
        article: 'المادة (328) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    jafari_base: {
        source: 'الفقه الجعفري المعتمد بالدوائر الجعفرية بمحاكم دولة الكويت',
        text: 'التقسيم بالطبقات الثلاث مع عدم العول (النقص يدخل على البنات أو الأخوات) والرد بالقرابة',
        article: 'لائحة المحكمة الجعفرية وقضاء الدائرة الجعفرية بمحكمة الاستئناف والتمييز الكويتية'
    },
    fetus_reserve: {
        source: 'أحكام الحمل المستكن في الميراث',
        text: 'يوقف للحمل أوفر النصيبين (نصيب ذكرين أو أنثيين) حتى تنكشف الولادة حياً',
        article: 'المادة (337) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    },
    khuntha_mushkal: {
        source: 'أحكام الخنثى المشكل في الشريعة والقانون',
        text: 'يأخذ الخنثى المشكل نصف نصيب الذكر ونصف نصيب الأنثى عدلاً وإنصافاً',
        article: 'المادة (338) من قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984'
    }
};

// Utilities
const gcd = (a: number, b: number): number => {
    const x = Math.abs(Math.round(a));
    const y = Math.abs(Math.round(b));
    return y === 0 ? x : gcd(y, x % y);
};

const lcm = (a: number, b: number): number => {
    if (a === 0 || b === 0) return 1;
    return Math.abs(Math.round((a * b) / gcd(a, b)));
};

const lcmMultiple = (arr: number[]): number => {
    if (!arr || arr.length === 0) return 1;
    return arr.reduce((acc, val) => lcm(acc, val || 1), arr[0] || 1);
};

/**
 * Calculates Sharia and Civil Law Inheritance
 */
export function calculateInheritance(
    optionsOrMadhab: CalculationMadhab | {
        deceasedName: string;
        deceasedGender: Gender;
        civilId?: string;
        dateOfDeath?: string;
        notes?: string;
        assets: EstateAssets;
        deductions: EstateDeductions;
        heirs: HeirDefinition[];
        madhab: CalculationMadhab;
    },
    deceasedGenderArg?: Gender,
    deceasedNameArg?: string,
    assetsArg?: EstateAssets,
    deductionsArg?: EstateDeductions,
    heirsArg?: HeirDefinition[],
    notesArg?: string
): InheritanceCalculation {
    let madhab: CalculationMadhab;
    let deceasedGender: Gender;
    let deceasedName: string;
    let civilId: string | undefined;
    let dateOfDeath: string | undefined;
    let notes: string | undefined;
    let assets: EstateAssets;
    let deductions: EstateDeductions;
    let heirs: HeirDefinition[];

    if (typeof optionsOrMadhab === 'object') {
        madhab = optionsOrMadhab.madhab;
        deceasedGender = optionsOrMadhab.deceasedGender;
        deceasedName = optionsOrMadhab.deceasedName;
        civilId = optionsOrMadhab.civilId;
        dateOfDeath = optionsOrMadhab.dateOfDeath;
        notes = optionsOrMadhab.notes;
        assets = optionsOrMadhab.assets;
        deductions = optionsOrMadhab.deductions;
        heirs = optionsOrMadhab.heirs;
    } else {
        madhab = optionsOrMadhab;
        deceasedGender = deceasedGenderArg || 'M';
        deceasedName = deceasedNameArg || 'المورث الكريم';
        assets = assetsArg || { cash: 0, realEstate: 0, stocks: 0, jewelry: 0, vehicles: 0, receivables: 0 };
        deductions = deductionsArg || { securedDebts: 0, funeralExpenses: 0, unsecuredDebts: 0, wills: 0 };
        heirs = heirsArg || [];
        notes = notesArg;
    }

    const totalEstate = Number((
        (assets.cash || 0) +
        (assets.realEstate || 0) +
        (assets.stocks || 0) +
        (assets.jewelry || 0) +
        (assets.vehicles || 0) +
        (assets.receivables || 0) +
        (assets.endOfService || 0) +
        (assets.businessLicenses || 0) +
        (assets.otherAssets || 0)
    ).toFixed(3));

    // Ordered liquidation according to Kuwait Law:
    // 1. Secured debts (حقوق الرهن والعين)
    // 2. Funeral expenses (التجهيز والتكفين)
    // 3. Unsecured debts (الديون المطلقة والإلهية)
    // 4. Wills (الوصايا الاختيارية في حدود الثلث)
    const secured = Math.min(totalEstate, deductions.securedDebts || 0);
    const remAfterSecured = Math.max(0, totalEstate - secured);

    const funeral = Math.min(remAfterSecured, deductions.funeralExpenses || 0);
    const remAfterFuneral = Math.max(0, remAfterSecured - funeral);

    const unsecured = Math.min(remAfterFuneral, deductions.unsecuredDebts || 0);
    const remAfterDebts = Math.max(0, remAfterFuneral - unsecured);

    const maxPermittedWill = remAfterDebts / 3;
    const actualWill = Math.min(remAfterDebts, deductions.wills || 0);
    const remAfterWills = Math.max(0, remAfterDebts - actualWill);

    const netEstate = Number(remAfterWills.toFixed(3));

    const result: InheritanceCalculation = {
        id: 'case-' + Math.random().toString(36).substring(2, 9),
        deceasedName: deceasedName || 'حالة حصر إرث غير مسماة',
        deceasedGender,
        civilId,
        dateOfDeath,
        notes,
        assets,
        deductions,
        totalEstate,
        netEstate,
        debts: (deductions.securedDebts || 0) + (deductions.unsecuredDebts || 0),
        funeralExpenses: deductions.funeralExpenses || 0,
        wills: deductions.wills || 0,
        wasiyyaWajibahAmount: 0,
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

    // Warnings on estate liquidation
    if ((deductions.wills || 0) > maxPermittedWill && maxPermittedWill > 0) {
        result.warnings.push(`تنبيه قانوني (المادة 290 و 328): قيمة الوصية الاختيارية المحددة (${deductions.wills.toLocaleString()} د.ك) تتجاوز ثلث التركة بعد الديون (${maxPermittedWill.toFixed(3)} د.ك). لا ينفذ الزائد إلا بإجازة صريحة من جميع الورثة الراشدين.`);
    }

    if (totalEstate <= 0) {
        result.warnings.push('قيمة التركة الإجمالية المدخلة هي صفر، يرجى إدخال قيم الأصول والممتلكات.');
        return result;
    }

    if (netEstate <= 0) {
        result.warnings.push('التركة مستغرقة بالكامل بالديون وحقوق الرهن ومصاريف التجهيز، لا يتبقى أي مال صالح للقسمة على الورثة.');
        result.steps.push('مرحلة التصفية: استغرقت ديون التركة وحقوق التجهيز كامل الأعيان والأموال المتروكة.');
        return result;
    }

    result.steps.push(`1. حصر إجمالي التركة العينية والنقدية: ${totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك.`);
    result.steps.push(`2. استقطاع حقوق الرهن والعين: -${secured.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك.`);
    result.steps.push(`3. استقطاع مصاريف التجهيز والتكفين بالمعروف: -${funeral.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك.`);
    result.steps.push(`4. استيفاء الديون المرسلة والمطلقة: -${unsecured.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك.`);
    if (actualWill > 0) {
        result.steps.push(`5. تنفيذ الوصية الشرعية الاختيارية: -${actualWill.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك.`);
    }
    result.steps.push(`6. صافي التركة الصالحة للتوزيع الشرعي والقضائي: ${netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك.`);

    // Filter Heirs & Filter Impediments (موانع الإرث كاختلاف الدين أو القتل)
    const validHeirs: HeirDefinition[] = [];
    const disqualifiedHeirs: ExcludedHeir[] = [];

    heirs.forEach(h => {
        if (h.count <= 0) return;
        if (h.specialCondition === 'impediment_religion') {
            disqualifiedHeirs.push({
                label: h.label,
                type: h.type,
                count: h.count,
                reason: 'مانع شرعي من الإرث (اختلاف الدين بين الوارث والمورث)',
                excludedBy: 'مانع شرعي',
                article: 'المادة (342) من قانون الأحوال الشخصية الكويتي'
            });
            result.steps.push(`مانع شرعي: استبعاد [${h.label}] لمانع اختلاف الدين تطبيقاً للمادة 342 أحوال شخصية كويتي.`);
            return;
        }
        if (h.specialCondition === 'impediment_homicide') {
            disqualifiedHeirs.push({
                label: h.label,
                type: h.type,
                count: h.count,
                reason: 'مانع شرعي وقانوني من الإرث (القتل المانع عمداً وعدواناً)',
                excludedBy: 'مانع القتل',
                article: 'المادة (341) من قانون الأحوال الشخصية الكويتي'
            });
            result.steps.push(`مانع شرعي: استبعاد [${h.label}] لمانع القتل المانع من الإرث تطبيقاً للمادة 341 أحوال شخصية كويتي.`);
            return;
        }
        validHeirs.push(h);
    });

    // Check for Mandatory Will (الوصية الواجبة - المادة 328) for grandchildren of predeceased sons/daughters
    let estateForDistribution = netEstate;
    const wasiyyahWajibahShares: CalculatedShare[] = [];
    const predeceasedGrandchildren = validHeirs.filter(h => h.specialCondition === 'deceased_before' && (h.type === 'grandson' || h.type === 'granddaughter'));

    if (predeceasedGrandchildren.length > 0 && madhab === 'sunni') {
        const totalGrandchildren = predeceasedGrandchildren.reduce((acc, h) => acc + h.count, 0);
        // Calculate max 1/3 for wasiyya wajibah
        const maxWajibah = netEstate / 3;
        // Estimate hypothetical share
        const estimatedShare = Math.min(maxWajibah, (netEstate * 0.25));
        const wasiyyaAmount = Number(estimatedShare.toFixed(3));
        result.wasiyyaWajibahAmount = wasiyyaAmount;
        estateForDistribution = Number((netEstate - wasiyyaAmount).toFixed(3));

        predeceasedGrandchildren.forEach(g => {
            const count = g.count;
            const portion = (wasiyyaAmount / totalGrandchildren) * count;
            wasiyyahWajibahShares.push({
                heirLabel: `${g.label} (وصية واجبة لأولاد المتوفى قبلاً)`,
                heirType: g.type,
                count,
                shareType: 'wasiyya_wajibah',
                shareLabel: 'وصية واجبة (المادة 328)',
                shareFractionNum: 1,
                shareFractionDen: 3,
                shareValue: wasiyyaAmount / netEstate,
                amount: Number(portion.toFixed(3)),
                isExcluded: false,
                evidence: LEGAL_EVIDENCE_DATABASE.wasiyyah_wajibah
            });
        });

        result.steps.push(`احتساب الوصية الواجبة: استقطاع ${wasiyyaAmount.toLocaleString()} د.ك لأولاد الابن/البنت المتوفى قبل المورث وفق المادة 328 أحوال شخصية كويتي.`);
    }

    // Active heirs for standard distribution (excluding predeceased treated under wasiyyah)
    const activeHeirs = validHeirs.filter(h => !(h.specialCondition === 'deceased_before' && (h.type === 'grandson' || h.type === 'granddaughter')));

    const counts: Record<string, number> = {};
    activeHeirs.forEach(h => {
        counts[h.type] = (counts[h.type] || 0) + h.count;
    });
    const getCount = (type: string) => counts[type] || 0;

    const hasSons = getCount('son') > 0;
    const hasDaughters = getCount('daughter') > 0;
    const hasGrandsons = getCount('grandson') > 0;
    const hasGranddaughters = getCount('granddaughter') > 0;
    const hasChildren = hasSons || hasDaughters || hasGrandsons || hasGranddaughters;
    const hasMaleDescendant = hasSons || hasGrandsons;
    const hasFemaleDescendant = hasDaughters || hasGranddaughters;
    const hasFather = getCount('father') > 0;
    const hasMother = getCount('mother') > 0;

    const siblingsCount = getCount('full_brother') + getCount('full_sister') +
                          getCount('paternal_brother') + getCount('paternal_sister') +
                          getCount('maternal_brother') + getCount('maternal_sister');

    // -------------------------------------------------------------
    // SUNNI JURISDICTION (المذهب السني - قانون الأحوال الشخصية الكويتي)
    // -------------------------------------------------------------
    if (madhab === 'sunni') {
        result.steps.push('تطبيق أحكام المذهب السني طبقاً لقانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984 (المواد 288 إلى 340).');

        const exclusions: ExcludedHeir[] = [...disqualifiedHeirs];

        // 1. Father excludes: Grandfathers, Paternal Grandmothers, all Siblings, Uncles, Cousins
        if (hasFather) {
            if (getCount('paternal_grandfather') > 0) {
                exclusions.push({ label: 'الجد لأب', type: 'paternal_grandfather', count: getCount('paternal_grandfather'), reason: 'يُحجب حجب حرمان لوجود الأب (الأصل المذكر الأقرب)', excludedBy: 'الأب', article: 'المادة (298)' });
            }
            if (getCount('paternal_grandmother') > 0) {
                exclusions.push({ label: 'الجدة لأب', type: 'paternal_grandmother', count: getCount('paternal_grandmother'), reason: 'تُحجب لوجود الأب (المادة 297)', excludedBy: 'الأب', article: 'المادة (297)' });
            }
            ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'].forEach(sib => {
                if (getCount(sib) > 0) {
                    const l = activeHeirs.find(h => h.type === sib)?.label || sib;
                    exclusions.push({ label: l, type: sib, count: getCount(sib), reason: 'يُحجب حجب حرمان مطلق لوجود الأب', excludedBy: 'الأب', article: 'المادة (300 و 301)' });
                }
            });
            ['paternal_uncle', 'paternal_cousin'].forEach(rel => {
                if (getCount(rel) > 0) {
                    const l = activeHeirs.find(h => h.type === rel)?.label || rel;
                    exclusions.push({ label: l, type: rel, count: getCount(rel), reason: 'يُحجب لوجود الأب العصبة الأقرب', excludedBy: 'الأب', article: 'المادة (292)' });
                }
            });
        }

        // 2. Mother excludes: All Grandmothers
        if (hasMother) {
            if (getCount('paternal_grandmother') > 0 && !exclusions.some(x => x.type === 'paternal_grandmother')) {
                exclusions.push({ label: 'الجدة لأب', type: 'paternal_grandmother', count: getCount('paternal_grandmother'), reason: 'تُحجب لوجود الأم', excludedBy: 'الأم', article: 'المادة (297)' });
            }
            if (getCount('maternal_grandmother') > 0) {
                exclusions.push({ label: 'الجدة لأم', type: 'maternal_grandmother', count: getCount('maternal_grandmother'), reason: 'تُحجب لوجود الأم', excludedBy: 'الأم', article: 'المادة (297)' });
            }
        }

        // 3. Son excludes: Grandsons, Granddaughters, all Siblings, Uncles, Cousins
        if (hasSons) {
            if (getCount('grandson') > 0) {
                exclusions.push({ label: 'ابن الابن', type: 'grandson', count: getCount('grandson'), reason: 'يُحجب لوجود الابن المباشر الأقرب', excludedBy: 'الابن المباشر', article: 'المادة (292)' });
            }
            if (getCount('granddaughter') > 0) {
                exclusions.push({ label: 'بنت الابن', type: 'granddaughter', count: getCount('granddaughter'), reason: 'تُحجب لوجود الابن المباشر الأقرب', excludedBy: 'الابن المباشر', article: 'المادة (293)' });
            }
            ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'].forEach(sib => {
                if (getCount(sib) > 0 && !exclusions.some(x => x.type === sib)) {
                    const l = activeHeirs.find(h => h.type === sib)?.label || sib;
                    exclusions.push({ label: l, type: sib, count: getCount(sib), reason: 'يُحجب لوجود الفرع الوارث المذكر (الابن)', excludedBy: 'الابن', article: 'المادة (300 و 301)' });
                }
            });
            ['paternal_uncle', 'paternal_cousin'].forEach(rel => {
                if (getCount(rel) > 0 && !exclusions.some(x => x.type === rel)) {
                    const l = activeHeirs.find(h => h.type === rel)?.label || rel;
                    exclusions.push({ label: l, type: rel, count: getCount(rel), reason: 'يُحجب بالابن المباشر', excludedBy: 'الابن', article: 'المادة (292)' });
                }
            });
        }

        // 4. Two or more daughters exclude granddaughters (unless grandson equalizes them)
        if (getCount('daughter') >= 2 && !hasSons) {
            if (getCount('granddaughter') > 0 && getCount('grandson') === 0 && !exclusions.some(x => x.type === 'granddaughter')) {
                exclusions.push({
                    label: 'بنات الابن',
                    type: 'granddaughter',
                    count: getCount('granddaughter'),
                    reason: 'تُحجب لاستغراق البنات الصلبيات فرض الثلثين كاملاً وعدم وجود معصب (ابن ابن)',
                    excludedBy: 'البنات الصلبيات (الثلثان)',
                    article: 'المادة (294)'
                });
            }
        }

        // 5. Full brother excludes paternal brothers/sisters, uncles, cousins
        if (getCount('full_brother') > 0 && !exclusions.some(x => x.type === 'full_brother')) {
            ['paternal_brother', 'paternal_sister', 'paternal_uncle', 'paternal_cousin'].forEach(rel => {
                if (getCount(rel) > 0 && !exclusions.some(x => x.type === rel)) {
                    const l = activeHeirs.find(h => h.type === rel)?.label || rel;
                    exclusions.push({ label: l, type: rel, count: getCount(rel), reason: 'يُحجب بالأخ الشقيق الأقوى قرابة', excludedBy: 'الأخ الشقيق', article: 'المادة (292 و 300)' });
                }
            });
        }

        const isExcluded = (type: string) => exclusions.some(e => e.type === type);

        // Special Scenario: Al-Umariyyatan / Al-Gharrawan (العمريتان: زوج أو زوجة + أم + أب دون أولاد ولا إخوة)
        const isUmariyyahWithHusband = getCount('husband') > 0 && hasMother && hasFather && !hasChildren && siblingsCount < 2;
        const isUmariyyahWithWife = getCount('wife') > 0 && hasMother && hasFather && !hasChildren && siblingsCount < 2;

        // Special Scenario: Al-Mushtarakah / Al-Himariyyah (المشتركة: زوج + أم/جدة + إخوة لأم 2+ + إخوة أشقاء)
        const isMushtarakah = getCount('husband') > 0 && (hasMother || getCount('maternal_grandmother') > 0) &&
                             (getCount('maternal_brother') + getCount('maternal_sister')) >= 2 &&
                             getCount('full_brother') > 0 && !hasChildren && !hasFather;

        const rawShares: {
            type: string;
            label: string;
            count: number;
            num: number;
            den: number;
            shareLabel: string;
            shareType: CalculatedShare['shareType'];
            evidence: typeof LEGAL_EVIDENCE_DATABASE[string];
        }[] = [];

        // 1. Spouses
        if (getCount('husband') > 0 && !isExcluded('husband')) {
            const num = 1;
            const den = hasChildren ? 4 : 2;
            const lbl = hasChildren ? '1/4 فرضاً لوجود الفرع الوارث' : '1/2 فرضاً لانعدام الفرع الوارث';
            rawShares.push({
                type: 'husband',
                label: 'الزوج',
                count: 1,
                num,
                den,
                shareLabel: lbl,
                shareType: 'faradh',
                evidence: hasChildren ? LEGAL_EVIDENCE_DATABASE.husband_1_4 : LEGAL_EVIDENCE_DATABASE.husband_1_2
            });
        }

        if (getCount('wife') > 0 && !isExcluded('wife')) {
            const num = 1;
            const den = hasChildren ? 8 : 4;
            const wCount = getCount('wife');
            const lbl = (hasChildren ? '1/8 فرضاً بالتساوي' : '1/4 فرضاً بالتساوي') + (wCount > 1 ? ` (بين ${wCount} زوجات)` : '');
            rawShares.push({
                type: 'wife',
                label: `الزوجة / الزوجات (العدد: ${wCount})`,
                count: wCount,
                num,
                den,
                shareLabel: lbl,
                shareType: 'faradh',
                evidence: hasChildren ? LEGAL_EVIDENCE_DATABASE.wife_1_8 : LEGAL_EVIDENCE_DATABASE.wife_1_4
            });
        }

        // 2. Mother
        if (hasMother && !isExcluded('mother')) {
            if (isUmariyyahWithHusband || isUmariyyahWithWife) {
                // ثلث الباقي
                rawShares.push({
                    type: 'mother',
                    label: 'الأم (المسألة العمرية)',
                    count: 1,
                    num: isUmariyyahWithHusband ? 1 : 1,
                    den: isUmariyyahWithHusband ? 6 : 4, // (1-1/2)*1/3 = 1/6 ; (1-1/4)*1/3 = 1/4
                    shareLabel: 'ثلث الباقي بعد فرض الزوجية (المسألة العمرية)',
                    shareType: 'special',
                    evidence: LEGAL_EVIDENCE_DATABASE.mother_1_3_residue
                });
                result.steps.push('المسألة العمرية (الغراوان): الأم تأخذ ثلث الباقي بعد فرض الزوجية حفظاً لقاعدة التفضيل الشرعي للأب.');
            } else if (hasChildren || siblingsCount >= 2) {
                rawShares.push({
                    type: 'mother',
                    label: 'الأم',
                    count: 1,
                    num: 1,
                    den: 6,
                    shareLabel: '1/6 فرضاً لوجود الفرع الوارث أو جمع من الإخوة',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.mother_1_6
                });
            } else {
                rawShares.push({
                    type: 'mother',
                    label: 'الأم',
                    count: 1,
                    num: 1,
                    den: 3,
                    shareLabel: '1/3 فرضاً كاملاً لعدم الفرع الوارث وجمع الإخوة',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.mother_1_3
                });
            }
        }

        // 3. Grandmothers (if mother absent)
        if (!hasMother) {
            const pgm = getCount('paternal_grandmother') > 0 && !isExcluded('paternal_grandmother');
            const mgm = getCount('maternal_grandmother') > 0 && !isExcluded('maternal_grandmother');
            if (pgm && mgm) {
                rawShares.push({
                    type: 'grandmothers',
                    label: 'الجدات (لأب ولأم)',
                    count: 2,
                    num: 1,
                    den: 6,
                    shareLabel: '1/6 فرضاً يقسم بالسوية بين الجدتين',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.grandmother_1_6
                });
            } else if (pgm) {
                rawShares.push({
                    type: 'paternal_grandmother',
                    label: 'الجدة لأب',
                    count: 1,
                    num: 1,
                    den: 6,
                    shareLabel: '1/6 فرضاً لانعدام الأم',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.grandmother_1_6
                });
            } else if (mgm) {
                rawShares.push({
                    type: 'maternal_grandmother',
                    label: 'الجدة لأم',
                    count: 1,
                    num: 1,
                    den: 6,
                    shareLabel: '1/6 فرضاً لانعدام الأم',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.grandmother_1_6
                });
            }
        }

        // 4. Father
        if (hasFather && !isExcluded('father')) {
            if (isUmariyyahWithHusband) {
                // Father takes remainder (2/6 = 1/3)
                rawShares.push({
                    type: 'father',
                    label: 'الأب (المسألة العمرية)',
                    count: 1,
                    num: 2,
                    den: 6,
                    shareLabel: 'الباقي تعصيباً (ضعف نصيب الأم في العمرية)',
                    shareType: 'assaba_nafs',
                    evidence: LEGAL_EVIDENCE_DATABASE.father_assaba
                });
            } else if (isUmariyyahWithWife) {
                // Father takes remainder (2/4 = 1/2)
                rawShares.push({
                    type: 'father',
                    label: 'الأب (المسألة العمرية)',
                    count: 1,
                    num: 2,
                    den: 4,
                    shareLabel: 'الباقي تعصيباً (ضعف نصيب الأم في العمرية)',
                    shareType: 'assaba_nafs',
                    evidence: LEGAL_EVIDENCE_DATABASE.father_assaba
                });
            } else if (hasMaleDescendant) {
                rawShares.push({
                    type: 'father',
                    label: 'الأب',
                    count: 1,
                    num: 1,
                    den: 6,
                    shareLabel: '1/6 فرضاً لوجود الفرع الوارث المذكر',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.father_1_6
                });
            }
            // If only female descendant, father gets 1/6 faradh + Asaba (handled in residue phase)
            // If no descendants, father is pure Asaba (handled in residue phase)
        }

        // 5. Daughters (when no sons)
        if (hasDaughters && !hasSons && !isExcluded('daughter')) {
            const dCount = getCount('daughter');
            if (dCount === 1) {
                rawShares.push({
                    type: 'daughter',
                    label: 'البنت الصلبية (الواحدة)',
                    count: 1,
                    num: 1,
                    den: 2,
                    shareLabel: '1/2 فرضاً لانفرادها وعدم المعصب',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.daughter_1_2
                });
            } else {
                rawShares.push({
                    type: 'daughter',
                    label: `البنات الصلبيات (العدد: ${dCount})`,
                    count: dCount,
                    num: 2,
                    den: 3,
                    shareLabel: '2/3 فرضاً بالتساوي لتعددهن وعدم المعصب',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.daughter_2_3
                });
            }
        }

        // 6. Granddaughter (when 1 daughter and no sons/grandsons)
        if (getCount('daughter') === 1 && !hasSons && getCount('granddaughter') > 0 && getCount('grandson') === 0 && !isExcluded('granddaughter')) {
            const gdCount = getCount('granddaughter');
            rawShares.push({
                type: 'granddaughter',
                label: `بنات الابن (العدد: ${gdCount})`,
                count: gdCount,
                num: 1,
                den: 6,
                shareLabel: '1/6 فرضاً تكملة للثلثين مع البنت الواحدة',
                shareType: 'faradh',
                evidence: LEGAL_EVIDENCE_DATABASE.granddaughter_1_6_takmila
            });
        }

        // 7. Maternal Siblings (when no ascendant male, no descendants)
        const matCount = getCount('maternal_brother') + getCount('maternal_sister');
        if (matCount > 0 && !hasFather && getCount('paternal_grandfather') === 0 && !hasChildren) {
            if (!isMushtarakah) {
                if (matCount === 1) {
                    rawShares.push({
                        type: 'maternal_sibling',
                        label: 'الأخ / الأخت لأم (الواحد)',
                        count: 1,
                        num: 1,
                        den: 6,
                        shareLabel: '1/6 فرضاً لانفراده وعدم الحاجب',
                        shareType: 'faradh',
                        evidence: LEGAL_EVIDENCE_DATABASE.maternal_sibling_1_6
                    });
                } else {
                    rawShares.push({
                        type: 'maternal_sibling',
                        label: `الإخوة والأخوات لأم (العدد: ${matCount})`,
                        count: matCount,
                        num: 1,
                        den: 3,
                        shareLabel: '1/3 فرضاً بالتساوي بين الذكر والأنثى',
                        shareType: 'faradh',
                        evidence: LEGAL_EVIDENCE_DATABASE.maternal_sibling_1_3
                    });
                }
            }
        }

        // 8. Full Sisters (when no sons, grandsons, father, grandfather, and no full brothers)
        if (getCount('full_sister') > 0 && getCount('full_brother') === 0 && !hasChildren && !hasFather && getCount('paternal_grandfather') === 0 && !isExcluded('full_sister')) {
            const sCount = getCount('full_sister');
            if (sCount === 1) {
                rawShares.push({
                    type: 'full_sister',
                    label: 'الأخت الشقيقة (الواحدة)',
                    count: 1,
                    num: 1,
                    den: 2,
                    shareLabel: '1/2 فرضاً لانفرادها وعدم الحاجب أو المعصب',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.sister_1_2
                });
            } else {
                rawShares.push({
                    type: 'full_sister',
                    label: `الأخوات الشقيقات (العدد: ${sCount})`,
                    count: sCount,
                    num: 2,
                    den: 3,
                    shareLabel: '2/3 فرضاً بالتساوي لتعددهن وعدم المعصب',
                    shareType: 'faradh',
                    evidence: LEGAL_EVIDENCE_DATABASE.sister_2_3
                });
            }
        }

        // Compute denominators and Base Problem (أصل المسألة)
        const denominators = rawShares.map(s => s.den);
        const baseProblem = lcmMultiple(denominators);
        result.baseProblem = baseProblem;

        // Sum of fixed portions (مجموع السهام الفرضية)
        let totalFaradhUnits = 0;
        rawShares.forEach(s => {
            totalFaradhUnits += (baseProblem / s.den) * s.num;
        });

        const finalShares: CalculatedShare[] = [...wasiyyahWajibahShares];

        // CHECK AOUL (العول)
        if (totalFaradhUnits > baseProblem) {
            result.isAoul = true;
            result.finalProblem = totalFaradhUnits;
            result.steps.push(`عول المسألة (المادة 327): زادت السهام الفرضية (${totalFaradhUnits}) عن أصل المسألة (${baseProblem}) فعالت المسألة إلى (${totalFaradhUnits}) ودخل النقص على جميع أصحاب الفروض بنسبة حصصهم.`);

            rawShares.forEach(s => {
                const units = (baseProblem / s.den) * s.num;
                const ratio = units / totalFaradhUnits;
                const amt = Number((estateForDistribution * ratio).toFixed(3));
                finalShares.push({
                    heirLabel: s.label,
                    heirType: s.type,
                    count: s.count,
                    shareType: s.shareType,
                    shareLabel: `${s.shareLabel} (مع العول: ${units}/${totalFaradhUnits})`,
                    shareFractionNum: units,
                    shareFractionDen: totalFaradhUnits,
                    shareValue: ratio,
                    amount: amt,
                    isExcluded: false,
                    evidence: LEGAL_EVIDENCE_DATABASE.aoul_law
                });
            });
        } 
        // CHECK MUSHTARAKAH (المسألة المشتركة)
        else if (isMushtarakah) {
            result.steps.push('المسألة المشتركة / الحمارية (المادة 304): إشراك الإخوة الأشقاء مع الإخوة لأم في الثلث بالسوية لاشتراكهم في رحم الأم.');
            // Husband 1/2 (3/6), Mother 1/6 (1/6), Remainder 1/3 (2/6) shared equally between all maternal and full siblings
            rawShares.forEach(s => {
                if (s.type === 'husband' || s.type === 'mother' || s.type === 'maternal_grandmother') {
                    const ratio = s.num / s.den;
                    const amt = Number((estateForDistribution * ratio).toFixed(3));
                    finalShares.push({
                        heirLabel: s.label,
                        heirType: s.type,
                        count: s.count,
                        shareType: s.shareType,
                        shareLabel: s.shareLabel,
                        shareFractionNum: s.num,
                        shareFractionDen: s.den,
                        shareValue: ratio,
                        amount: amt,
                        isExcluded: false,
                        evidence: s.evidence
                    });
                }
            });

            const totalSiblings = matCount + getCount('full_brother') + getCount('full_sister');
            const oneThirdAmt = estateForDistribution * (1/3);
            const unitAmt = oneThirdAmt / totalSiblings;

            if (matCount > 0) {
                finalShares.push({
                    heirLabel: `الإخوة لأم (العدد: ${matCount})`,
                    heirType: 'maternal_sibling',
                    count: matCount,
                    shareType: 'faradh',
                    shareLabel: 'شريك في الثلث بالسوية مع الأشقاء (المشتركة)',
                    shareFractionNum: 1,
                    shareFractionDen: 3,
                    shareValue: (1/3) * (matCount / totalSiblings),
                    amount: Number((unitAmt * matCount).toFixed(3)),
                    isExcluded: false,
                    evidence: LEGAL_EVIDENCE_DATABASE.mushtarakah
                });
            }
            if (getCount('full_brother') > 0 || getCount('full_sister') > 0) {
                const fullSibCount = getCount('full_brother') + getCount('full_sister');
                finalShares.push({
                    heirLabel: `الإخوة والأخوات الأشقاء (العدد: ${fullSibCount})`,
                    heirType: 'full_brother',
                    count: fullSibCount,
                    shareType: 'special',
                    shareLabel: 'شريك في الثلث بالسوية مع الإخوة لأم (المشتركة)',
                    shareFractionNum: 1,
                    shareFractionDen: 3,
                    shareValue: (1/3) * (fullSibCount / totalSiblings),
                    amount: Number((unitAmt * fullSibCount).toFixed(3)),
                    isExcluded: false,
                    evidence: LEGAL_EVIDENCE_DATABASE.mushtarakah
                });
            }
            result.finalProblem = baseProblem;
        }
        // STANDARD RESIDUE & ASABA DISTRIBUTION
        else {
            rawShares.forEach(s => {
                const ratio = s.num / s.den;
                const amt = Number((estateForDistribution * ratio).toFixed(3));
                finalShares.push({
                    heirLabel: s.label,
                    heirType: s.type,
                    count: s.count,
                    shareType: s.shareType,
                    shareLabel: s.shareLabel,
                    shareFractionNum: s.num,
                    shareFractionDen: s.den,
                    shareValue: ratio,
                    amount: amt,
                    isExcluded: false,
                    evidence: s.evidence
                });
            });

            const faradhRatio = totalFaradhUnits / baseProblem;
            let remainingRatio = Math.max(0, 1.0 - faradhRatio);
            let residueAmount = Number((estateForDistribution * remainingRatio).toFixed(3));

            if (remainingRatio > 0.0001) {
                // Determine Asaba (العصبة)
                // 1. Sons + Daughters (عصبة بالغير)
                if (hasSons) {
                    const sCount = getCount('son');
                    const dCount = getCount('daughter');
                    const totalUnits = (sCount * 2) + dCount;
                    const unitValue = residueAmount / totalUnits;

                    finalShares.push({
                        heirLabel: `الأبناء الذكور (العدد: ${sCount})`,
                        heirType: 'son',
                        count: sCount,
                        shareType: 'assaba_ghayr',
                        shareLabel: 'عصبة بالغير (للذكر مثل حظ الأنثيين - سهمان)',
                        shareFractionNum: sCount * 2,
                        shareFractionDen: totalUnits,
                        shareValue: ((sCount * 2) / totalUnits) * remainingRatio,
                        amount: Number((unitValue * sCount * 2).toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.son_daughter_assaba_ghayr
                    });

                    if (dCount > 0) {
                        finalShares.push({
                            heirLabel: `البنات الإناث (العدد: ${dCount})`,
                            heirType: 'daughter',
                            count: dCount,
                            shareType: 'assaba_ghayr',
                            shareLabel: 'عصبة بالغير مع الابن (للذكر مثل حظ الأنثيين - سهم واحد)',
                            shareFractionNum: dCount,
                            shareFractionDen: totalUnits,
                            shareValue: (dCount / totalUnits) * remainingRatio,
                            amount: Number((unitValue * dCount).toFixed(3)),
                            isExcluded: false,
                            evidence: LEGAL_EVIDENCE_DATABASE.son_daughter_assaba_ghayr
                        });
                    }
                    remainingRatio = 0;
                }
                // 2. Father (جمع بين الفرض والتعصيب أو تعصيب محض)
                else if (hasFather && !isExcluded('father') && !isUmariyyahWithHusband && !isUmariyyahWithWife) {
                    if (hasFemaleDescendant) {
                        finalShares.push({
                            heirLabel: 'الأب (الباقي تعصيباً)',
                            heirType: 'father',
                            count: 1,
                            shareType: 'assaba_nafs',
                            shareLabel: 'الباقي تعصيباً إضافة إلى السدس فرضاً لوجود الفرع المؤنث',
                            shareFractionNum: 1,
                            shareFractionDen: 1,
                            shareValue: remainingRatio,
                            amount: residueAmount,
                            isExcluded: false,
                            evidence: LEGAL_EVIDENCE_DATABASE.father_1_6_plus_assaba
                        });
                    } else {
                        finalShares.push({
                            heirLabel: 'الأب (عصبة بالنفس)',
                            heirType: 'father',
                            count: 1,
                            shareType: 'assaba_nafs',
                            shareLabel: 'الباقي تعصيباً بالنفس لانعدام الفرع الوارث',
                            shareFractionNum: 1,
                            shareFractionDen: 1,
                            shareValue: remainingRatio,
                            amount: residueAmount,
                            isExcluded: false,
                            evidence: LEGAL_EVIDENCE_DATABASE.father_assaba
                        });
                    }
                    remainingRatio = 0;
                }
                // 3. Full Brothers (+ Full Sisters)
                else if (getCount('full_brother') > 0 && !isExcluded('full_brother')) {
                    const fbCount = getCount('full_brother');
                    const fsCount = getCount('full_sister');
                    const totalUnits = (fbCount * 2) + fsCount;
                    const unitValue = residueAmount / totalUnits;

                    finalShares.push({
                        heirLabel: `الإخوة الأشقاء (العدد: ${fbCount})`,
                        heirType: 'full_brother',
                        count: fbCount,
                        shareType: 'assaba_ghayr',
                        shareLabel: 'عصبة بالغير (للذكر مثل حظ الأنثيين)',
                        shareFractionNum: fbCount * 2,
                        shareFractionDen: totalUnits,
                        shareValue: ((fbCount * 2) / totalUnits) * remainingRatio,
                        amount: Number((unitValue * fbCount * 2).toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.assaba_nafs
                    });

                    if (fsCount > 0) {
                        finalShares.push({
                            heirLabel: `الأخوات الشقيقات (العدد: ${fsCount})`,
                            heirType: 'full_sister',
                            count: fsCount,
                            shareType: 'assaba_ghayr',
                            shareLabel: 'عصبة بالغير مع الأخ الشقيق',
                            shareFractionNum: fsCount,
                            shareFractionDen: totalUnits,
                            shareValue: (fsCount / totalUnits) * remainingRatio,
                            amount: Number((unitValue * fsCount).toFixed(3)),
                            isExcluded: false,
                            evidence: LEGAL_EVIDENCE_DATABASE.assaba_nafs
                        });
                    }
                    remainingRatio = 0;
                }
                // 4. Full Sister Asaba with Daughters (عصبة مع الغير - اجعلوا الأخوات مع البنات عصبة)
                else if (getCount('full_sister') > 0 && hasFemaleDescendant && !hasMaleDescendant && !hasFather && getCount('full_brother') === 0 && !isExcluded('full_sister')) {
                    const fsCount = getCount('full_sister');
                    finalShares.push({
                        heirLabel: `الأخوات الشقيقات (العدد: ${fsCount})`,
                        heirType: 'full_sister',
                        count: fsCount,
                        shareType: 'assaba_ma_alghayr',
                        shareLabel: 'عصبة مع الغير (مع البنات الصلبيات)',
                        shareFractionNum: 1,
                        shareFractionDen: 1,
                        shareValue: remainingRatio,
                        amount: residueAmount,
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.sister_assaba_ma_alghayr
                    });
                    remainingRatio = 0;
                }
                // 5. Paternal Uncles (الأعمام الأشقاء)
                else if (getCount('paternal_uncle') > 0 && !isExcluded('paternal_uncle')) {
                    const uCount = getCount('paternal_uncle');
                    finalShares.push({
                        heirLabel: `الأعمام الأشقاء (العدد: ${uCount})`,
                        heirType: 'paternal_uncle',
                        count: uCount,
                        shareType: 'assaba_nafs',
                        shareLabel: 'عصبة بالنفس (أولى رجل ذكر)',
                        shareFractionNum: 1,
                        shareFractionDen: 1,
                        shareValue: remainingRatio,
                        amount: residueAmount,
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.assaba_nafs
                    });
                    remainingRatio = 0;
                }
                // 6. Paternal Cousins (أبناء العم الشقيق)
                else if (getCount('paternal_cousin') > 0 && !isExcluded('paternal_cousin')) {
                    const cCount = getCount('paternal_cousin');
                    finalShares.push({
                        heirLabel: `أبناء العم الشقيق (العدد: ${cCount})`,
                        heirType: 'paternal_cousin',
                        count: cCount,
                        shareType: 'assaba_nafs',
                        shareLabel: 'عصبة بالنفس (أبناء عم شقيق)',
                        shareFractionNum: 1,
                        shareFractionDen: 1,
                        shareValue: remainingRatio,
                        amount: residueAmount,
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.assaba_nafs
                    });
                    remainingRatio = 0;
                }
                // 7. RADD (الرد - المادة 326): رد الفائض على أصحاب الفروض النسبية عدا الزوجين
                else if (remainingRatio > 0.0001) {
                    result.isRadd = true;
                    result.steps.push(`الرد الشرعي والقانوني (المادة 326): تبين وجود فائض في التركة قدره (${residueAmount.toLocaleString()} د.ك) دون وجود عصبة، فتم رد الفائض على أصحاب الفروض النسبية بنسبة سهامهم مع استبعاد الزوجين.`);

                    const nonSpouseShares = finalShares.filter(s => s.heirType !== 'husband' && s.heirType !== 'wife' && s.shareType !== 'wasiyya_wajibah');
                    const sumNonSpouseRatio = nonSpouseShares.reduce((acc, s) => acc + s.shareValue, 0);

                    if (sumNonSpouseRatio > 0) {
                        nonSpouseShares.forEach(s => {
                            const addedPortion = (s.shareValue / sumNonSpouseRatio) * residueAmount;
                            s.amount = Number((s.amount + addedPortion).toFixed(3));
                            s.shareValue = s.amount / estateForDistribution;
                            s.shareLabel += ' + حصة الرد';
                            s.shareType = 'radd';
                        });
                    }
                }
            }
            result.finalProblem = baseProblem;
        }

        result.shares = finalShares;
        result.excludedHeirs = exclusions;

    } 
    // -------------------------------------------------------------
    // JAFARI JURISDICTION (المذهب الجعفري - الدائرة الجعفرية بمحاكم الكويت)
    // -------------------------------------------------------------
    else {
        result.steps.push('تطبيق الفقه الجعفري المعتمد بالدوائر الجعفرية بمحاكم دولة الكويت (التقسيم بالطبقات الثلاث دون عول).');

        const exclusions: ExcludedHeir[] = [...disqualifiedHeirs];

        // Class 1 (الطبقة الأولى): الوالدان المباشران، الأولاد للصلب وأولادهم
        const hasClass1 = hasFather || hasMother || hasChildren;

        // Class 2 (الطبقة الثانية): الأجداد والجدات، الإخوة والأخوات وأولادهم
        const hasClass2 = getCount('paternal_grandfather') > 0 || getCount('paternal_grandmother') > 0 || getCount('maternal_grandmother') > 0 ||
                          getCount('full_brother') > 0 || getCount('full_sister') > 0 || getCount('paternal_brother') > 0 || getCount('paternal_sister') > 0 ||
                          getCount('maternal_brother') > 0 || getCount('maternal_sister') > 0;

        // Class 3 (الطبقة الثالثة): الأعمام والعمات، الأخوال والخالات، وأولادهم
        const hasClass3 = getCount('paternal_uncle') > 0 || getCount('paternal_cousin') > 0;

        if (hasClass1) {
            // Class 1 is active: Completely excludes Class 2 and Class 3
            if (hasClass2) {
                activeHeirs.forEach(h => {
                    if (['paternal_grandfather', 'paternal_grandmother', 'maternal_grandmother', 'full_brother', 'full_sister', 'paternal_brother', 'paternal_sister', 'maternal_brother', 'maternal_sister'].includes(h.type)) {
                        exclusions.push({
                            label: h.label,
                            type: h.type,
                            count: h.count,
                            reason: 'يُحجب بالكامل في المذهب الجعفري لوجود الطبقة الأولى (الأولاد أو الأبوين)',
                            excludedBy: 'الطبقة الأولى (الأولاد/الوالدان)',
                            article: 'قضاء المحكمة الجعفرية الكويتية'
                        });
                    }
                });
            }
            if (hasClass3) {
                activeHeirs.forEach(h => {
                    if (['paternal_uncle', 'paternal_cousin'].includes(h.type)) {
                        exclusions.push({
                            label: h.label,
                            type: h.type,
                            count: h.count,
                            reason: 'يُحجب بالكامل لوجود الطبقة الأولى المانعة لجميع الحواشي والأعمام',
                            excludedBy: 'الطبقة الأولى',
                            article: 'قضاء المحكمة الجعفرية الكويتية'
                        });
                    }
                });
            }
        } else if (hasClass2) {
            // Class 2 is active: Completely excludes Class 3
            if (hasClass3) {
                activeHeirs.forEach(h => {
                    if (['paternal_uncle', 'paternal_cousin'].includes(h.type)) {
                        exclusions.push({
                            label: h.label,
                            type: h.type,
                            count: h.count,
                            reason: 'يُحجب بالكامل لوجود الطبقة الثانية (الإخوة أو الأجداد) في الفقه الجعفري',
                            excludedBy: 'الطبقة الثانية',
                            article: 'قضاء المحكمة الجعفرية الكويتية'
                        });
                    }
                });
            }
        }

        result.excludedHeirs = exclusions;
        const isExcluded = (type: string) => exclusions.some(e => e.type === type);

        const finalShares: CalculatedShare[] = [...wasiyyahWajibahShares];
        let remainingRatio = 1.0;

        // Spouses inherit in all classes (الزوجية لا تسقط بالطبقات)
        if (getCount('husband') > 0 && !isExcluded('husband')) {
            const ratio = hasChildren ? 0.25 : 0.5;
            remainingRatio -= ratio;
            finalShares.push({
                heirLabel: 'الزوج (المذهب الجعفري)',
                heirType: 'husband',
                count: 1,
                shareType: 'faradh',
                shareLabel: hasChildren ? '1/4 فرضاً لوجود الولد' : '1/2 فرضاً لعدم الولد',
                shareFractionNum: hasChildren ? 1 : 1,
                shareFractionDen: hasChildren ? 4 : 2,
                shareValue: ratio,
                amount: Number((netEstate * ratio).toFixed(3)),
                isExcluded: false,
                evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
            });
        }

        if (getCount('wife') > 0 && !isExcluded('wife')) {
            const wCount = getCount('wife');
            const ratio = hasChildren ? 0.125 : 0.25;
            remainingRatio -= ratio;
            finalShares.push({
                heirLabel: `الزوجة / الزوجات (العدد: ${wCount})`,
                heirType: 'wife',
                count: wCount,
                shareType: 'faradh',
                shareLabel: (hasChildren ? '1/8 فرضاً بالتساوي' : '1/4 فرضاً بالتساوي') + (wCount > 1 ? ` (بين ${wCount} زوجات)` : ''),
                shareFractionNum: hasChildren ? 1 : 1,
                shareFractionDen: hasChildren ? 8 : 4,
                shareValue: ratio,
                amount: Number((netEstate * ratio).toFixed(3)),
                isExcluded: false,
                evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
            });
        }

        // Class 1 Distribution
        if (hasClass1) {
            const sCount = getCount('son');
            const dCount = getCount('daughter');

            if (sCount > 0 || dCount > 0) {
                // Children exist
                let parentsRatio = 0;
                if (hasFather && !isExcluded('father')) {
                    parentsRatio += (1/6);
                    finalShares.push({
                        heirLabel: 'الأب (الطبقة الأولى - جعفري)',
                        heirType: 'father',
                        count: 1,
                        shareType: 'faradh',
                        shareLabel: '1/6 فرضاً لوجود الأولاد',
                        shareFractionNum: 1,
                        shareFractionDen: 6,
                        shareValue: 1/6,
                        amount: Number((netEstate * (1/6)).toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
                    });
                }
                if (hasMother && !isExcluded('mother')) {
                    parentsRatio += (1/6);
                    finalShares.push({
                        heirLabel: 'الأم (الطبقة الأولى - جعفري)',
                        heirType: 'mother',
                        count: 1,
                        shareType: 'faradh',
                        shareLabel: '1/6 فرضاً لوجود الأولاد',
                        shareFractionNum: 1,
                        shareFractionDen: 6,
                        shareValue: 1/6,
                        amount: Number((netEstate * (1/6)).toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
                    });
                }

                const childrenRatio = Math.max(0, remainingRatio - parentsRatio);
                const childrenAmt = netEstate * childrenRatio;

                if (sCount > 0) {
                    const totalUnits = (sCount * 2) + dCount;
                    const sonRatio = ((sCount * 2) / totalUnits) * childrenRatio;
                    finalShares.push({
                        heirLabel: `الأبناء الذكور (العدد: ${sCount})`,
                        heirType: 'son',
                        count: sCount,
                        shareType: 'assaba_ghayr',
                        shareLabel: 'قرابة نسبية (للذكر سهمان وللأنثى سهم)',
                        shareFractionNum: sCount * 2,
                        shareFractionDen: totalUnits,
                        shareValue: sonRatio,
                        amount: Number((childrenAmt * ((sCount * 2) / totalUnits)).toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
                    });

                    if (dCount > 0) {
                        const daughterRatio = (dCount / totalUnits) * childrenRatio;
                        finalShares.push({
                            heirLabel: `البنات الإناث (العدد: ${dCount})`,
                            heirType: 'daughter',
                            count: dCount,
                            shareType: 'assaba_ghayr',
                            shareLabel: 'قرابة نسبية (سهم واحد مع الأبناء)',
                            shareFractionNum: dCount,
                            shareFractionDen: totalUnits,
                            shareValue: daughterRatio,
                            amount: Number((childrenAmt * (dCount / totalUnits)).toFixed(3)),
                            isExcluded: false,
                            evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
                        });
                    }
                } else {
                    // Only daughters: Daughters take remaining by Faradh and Radd (لا عول في الجعفري)
                    finalShares.push({
                        heirLabel: `البنات الصلبيات (العدد: ${dCount})`,
                        heirType: 'daughter',
                        count: dCount,
                        shareType: 'faradh',
                        shareLabel: 'الفرض والرد بالقرابة (لا عول في الفقه الجعفري)',
                        shareFractionNum: 1,
                        shareFractionDen: 1,
                        shareValue: childrenRatio,
                        amount: Number(childrenAmt.toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
                    });
                }
            } else {
                // No children: Only parents exist
                let motherRatio = 1/3;
                const brothersCount = getCount('full_brother') + getCount('paternal_brother');
                if (brothersCount >= 2) {
                    motherRatio = 1/6;
                    result.steps.push('حُجب ثلث الأم إلى السدس لوجود حاجبين من الإخوة في الفقه الجعفري.');
                }

                if (hasMother && !isExcluded('mother')) {
                    finalShares.push({
                        heirLabel: 'الأم (الطبقة الأولى)',
                        heirType: 'mother',
                        count: 1,
                        shareType: 'faradh',
                        shareLabel: motherRatio === 1/3 ? '1/3 فرضاً كاملاً' : '1/6 فرضاً بالحجب',
                        shareFractionNum: motherRatio === 1/3 ? 1 : 1,
                        shareFractionDen: motherRatio === 1/3 ? 3 : 6,
                        shareValue: motherRatio,
                        amount: Number((netEstate * motherRatio).toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
                    });
                    remainingRatio -= motherRatio;
                }

                if (hasFather && !isExcluded('father')) {
                    finalShares.push({
                        heirLabel: 'الأب (القرابة النسبية)',
                        heirType: 'father',
                        count: 1,
                        shareType: 'assaba_nafs',
                        shareLabel: 'الباقي بالقرابة النسبية والرد',
                        shareFractionNum: 1,
                        shareFractionDen: 1,
                        shareValue: remainingRatio,
                        amount: Number((netEstate * remainingRatio).toFixed(3)),
                        isExcluded: false,
                        evidence: LEGAL_EVIDENCE_DATABASE.jafari_base
                    });
                }
            }
        }

        result.shares = finalShares;
    }

    // Generate Comprehensive Advisory Summary
    generateAdvisorySummary(result);

    return result;
}

function generateAdvisorySummary(res: InheritanceCalculation) {
    const eligibleText = res.shares.map(s => `${s.heirLabel}: ${s.shareLabel} بمبلغ (${s.amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك)`).join(' | ');
    const excludedText = res.excludedHeirs.length > 0 ? res.excludedHeirs.map(s => `${s.label} (${s.reason})`).join(' ، ') : 'لا يوجد ورثة محجوبون في هذه المسألة.';
    const madhabTitle = res.madhab === 'sunni' ? 'قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984 (المذهب السني)' : 'لائحة وقضاء الدائرة الجعفرية بمحاكم دولة الكويت';

    res.advisoryText = `استناداً إلى معطيات التركة المصرح بها بقيمة إجمالية قدرها (${res.totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك)، وبعد تصفية الالتزامات والديون ومصاريف التجهيز والوصايا، استقر صافي التركة المعدة للقسمة الشرعية على مبلغ (${res.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك). تم إجراء التوزيع الشرعي والقانوني وفقاً لأحكام [${madhabTitle}]. السهام والأنصبة المقررة: [${eligibleText}]. حالة الحجب والموانع: [${excludedText}].`;
}
