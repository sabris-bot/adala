export type CurrencyCode = 'KWD' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED';

export interface CurrencyInfo {
    code: CurrencyCode;
    nameAr: string;
    nameEn: string;
    symbol: string;
    rateVsKwd: number; // How many units of target currency equal 1 KWD (e.g. 1 KWD = 3.26 USD)
    flag: string;
}

export const DEFAULT_CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
    KWD: {
        code: 'KWD',
        nameAr: 'دينار كويتي',
        nameEn: 'Kuwaiti Dinar',
        symbol: 'د.ك',
        rateVsKwd: 1.0,
        flag: '🇰🇼'
    },
    USD: {
        code: 'USD',
        nameAr: 'دولار أمريكي',
        nameEn: 'US Dollar',
        symbol: '$',
        rateVsKwd: 3.26, // 1 KWD = 3.26 USD
        flag: '🇺🇸'
    },
    EUR: {
        code: 'EUR',
        nameAr: 'يورو أوربي',
        nameEn: 'Euro',
        symbol: '€',
        rateVsKwd: 3.01,
        flag: '🇪🇺'
    },
    GBP: {
        code: 'GBP',
        nameAr: 'جنيه إسترليني',
        nameEn: 'British Pound',
        symbol: '£',
        rateVsKwd: 2.58,
        flag: '🇬🇧'
    },
    SAR: {
        code: 'SAR',
        nameAr: 'ريال سعودي',
        nameEn: 'Saudi Riyal',
        symbol: 'ر.س',
        rateVsKwd: 12.23,
        flag: '🇸🇦'
    },
    AED: {
        code: 'AED',
        nameAr: 'درهم إماراتي',
        nameEn: 'UAE Dirham',
        symbol: 'د.إ',
        rateVsKwd: 11.97,
        flag: '🇦🇪'
    }
};

const STORAGE_KEY_RATES = 'adala_property_exchange_rates';
const STORAGE_KEY_SELECTED_CURRENCY = 'adala_property_selected_currency';

// Get active rates dictionary
export const getActiveCurrencyRates = (): Record<CurrencyCode, CurrencyInfo> => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_RATES);
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_CURRENCIES;
};

// Save custom rate
export const setCustomExchangeRate = (code: CurrencyCode, rateVsKwd: number) => {
    const active = getActiveCurrencyRates();
    if (active[code]) {
        active[code].rateVsKwd = rateVsKwd;
        localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(active));
    }
};

// Get / Set selected display currency
export const getSelectedCurrency = (): CurrencyCode => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SELECTED_CURRENCY) as CurrencyCode;
        if (stored && DEFAULT_CURRENCIES[stored]) return stored;
    } catch (e) {}
    return 'KWD';
};

export const setSelectedCurrency = (code: CurrencyCode) => {
    localStorage.setItem(STORAGE_KEY_SELECTED_CURRENCY, code);
};

// Currency Conversion Calculation
export const convertKwdToTarget = (amountInKwd: number, targetCurrency: CurrencyCode): number => {
    const rates = getActiveCurrencyRates();
    const info = rates[targetCurrency] || DEFAULT_CURRENCIES[targetCurrency] || DEFAULT_CURRENCIES.KWD;
    return amountInKwd * info.rateVsKwd;
};

// Format currency value cleanly
export const formatCurrencyValue = (
    amount: number, 
    currencyCode: CurrencyCode = 'KWD',
    showSymbol = true
): string => {
    const rates = getActiveCurrencyRates();
    const info = rates[currencyCode] || DEFAULT_CURRENCIES[currencyCode] || DEFAULT_CURRENCIES.KWD;
    
    // KWD has 3 decimals, others generally 2 decimals
    const decimals = currencyCode === 'KWD' ? 3 : 2;
    const formattedNum = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount);

    if (!showSymbol) return formattedNum;

    if (currencyCode === 'USD' || currencyCode === 'EUR' || currencyCode === 'GBP') {
        return `${info.symbol}${formattedNum} ${currencyCode}`;
    }
    return `${formattedNum} ${info.symbol}`;
};

// Dual-Currency String (e.g. "12,500.000 د.ك (≈ $40,750.00 USD)")
export const formatDualCurrencyString = (
    amountInKwd: number, 
    targetCurrency: CurrencyCode = 'USD'
): string => {
    const kwdStr = formatCurrencyValue(amountInKwd, 'KWD');
    if (targetCurrency === 'KWD') return kwdStr;

    const converted = convertKwdToTarget(amountInKwd, targetCurrency);
    const convertedStr = formatCurrencyValue(converted, targetCurrency);

    return `${kwdStr} (≈ ${convertedStr})`;
};
