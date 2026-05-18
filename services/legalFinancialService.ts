
/**
 * Legal Financial Service for Kuwaiti Law Compliance
 * Centralizes all financial calculations for the Adala system.
 */

export interface CourtFeeResult {
  proportionalFee: number;
  fixedFee: number;
  total: number;
  ref: string;
}

export interface InterestResult {
  principal: number;
  interest: number;
  total: number;
  days: number;
  rate: number;
}

/**
 * Calculate Proportional Court Fees in Kuwait
 * Decree Law No. 17/1960 on Judicial Fees
 * 
 * @param amount Total claim amount
 * @param stage Litigation stage (First Instance, Appeal, Cassation)
 * @returns Object with fee details
 */
export const calculateKuwaitCourtFee = (amount: number, stage: 'FIRST_INSTANCE' | 'APPEAL' | 'CASSATION' | 'EXECUTION' = 'FIRST_INSTANCE'): CourtFeeResult => {
  if (amount <= 0) return { proportionalFee: 0, fixedFee: 0, total: 0, ref: '' };

  let proportionalFee = 0;
  let fixedFee = 0;
  let ref = '';

  if (stage === 'FIRST_INSTANCE') {
    // 2.5% for first 10,000 KWD, 1% for rest
    if (amount <= 10000) {
      proportionalFee = amount * 0.025;
    } else {
      proportionalFee = (10000 * 0.025) + ((amount - 10000) * 0.01);
    }
    // Min fee usually 5 KWD for registration
    proportionalFee = Math.max(5, proportionalFee);
    ref = 'مادة 1 من قانون الرسوم القضائية';
  } else if (stage === 'APPEAL') {
    // Half of the First Instance fee
    const base = calculateKuwaitCourtFee(amount, 'FIRST_INSTANCE').proportionalFee;
    proportionalFee = base / 2;
    ref = 'مادة 8 من قانون الرسوم القضائية (نصف رسم الدرجة الأولى)';
  } else if (stage === 'CASSATION') {
    // Cassation fees vary, but often have fixed components for entry
    fixedFee = 100;
    ref = 'مادة 10 من قانون الرسوم القضائية (رسم ثابت للتمييز)';
  } else if (stage === 'EXECUTION') {
    fixedFee = 10; // Simple execution opening fee
    proportionalFee = amount * 0.005; // 0.5% for execution proceedings often
    ref = 'رسوم إدارة التنفيذ';
  }

  return {
    proportionalFee: Number(proportionalFee.toFixed(3)),
    fixedFee: Number(fixedFee.toFixed(3)),
    total: Number((proportionalFee + fixedFee).toFixed(3)),
    ref
  };
};

/**
 * Calculate Legal/Commercial Interest in Kuwait
 * 7% for Commercial, 4% for Civil
 */
export const calculateLegalInterest = (
  principal: number, 
  startDate: Date, 
  endDate: Date, 
  type: 'COMMERCIAL' | 'CIVIL' = 'COMMERCIAL'
): InterestResult => {
  const rate = type === 'COMMERCIAL' ? 7 : 4;
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Kuwait follows 365 days for interest calc usually
  const interest = (principal * (rate / 100) * diffDays) / 365;
  
  return {
    principal,
    interest: Number(interest.toFixed(3)),
    total: Number((principal + interest).toFixed(3)),
    days: diffDays,
    rate
  };
};

export const legalFinancialService = {
  calculateKuwaitCourtFee,
  calculateLegalInterest
};
