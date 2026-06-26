import type { UserProfile, CalculationResult, CalculationScenario } from '@/types';
import { CITY_LIST } from '@/data/cities';
import {
  LIFE_EXPECTANCY,
  SCENARIO_RATES,
  SOCIAL_INSURANCE_DEFAULT_BASE,
  AVG_WAGE_GROWTH_RATE,
} from '@/data/constants';

export function calculatePension(profile: UserProfile): CalculationResult {
  const yearsToRetirement = Math.max(0, profile.expectedRetirementAge - profile.age);
  const expectedRetirementYears = Math.max(0, LIFE_EXPECTANCY - profile.expectedRetirementAge);

  const targetCity = CITY_LIST.find(c => c.id === profile.targetCity) || CITY_LIST[0];
  const targetMonthlyExpense = targetCity.costDetails.total[profile.lifestyleLevel];

  const socialBase = profile.socialInsuranceBase || SOCIAL_INSURANCE_DEFAULT_BASE;
  const socialYears = profile.socialInsuranceYears || Math.max(0, profile.age - 22);

  const avgWageAtRetirement = socialBase * Math.pow(1 + AVG_WAGE_GROWTH_RATE, yearsToRetirement);
  const totalContributionYears = socialYears + yearsToRetirement;

  const socialSecurityMonthly = calculateSocialSecurity(
    avgWageAtRetirement,
    totalContributionYears,
    socialBase
  );

  const enterpriseAnnuityMonthly = profile.enterpriseAnnuity
    ? calculateEnterpriseAnnuityMonthly(profile.enterpriseAnnuity, yearsToRetirement, expectedRetirementYears)
    : 0;

  const personalPensionMonthly = profile.personalPension
    ? calculatePersonalPensionMonthly(profile.personalPension, yearsToRetirement, expectedRetirementYears)
    : 0;

  const socialSecurityTotal = socialSecurityMonthly * expectedRetirementYears * 12;
  const enterpriseAnnuityTotal = enterpriseAnnuityMonthly * expectedRetirementYears * 12;
  const personalPensionTotal = personalPensionMonthly * expectedRetirementYears * 12;

  const totalExpense = targetMonthlyExpense * expectedRetirementYears * 12;
  const totalPensionIncome = socialSecurityTotal + enterpriseAnnuityTotal + personalPensionTotal;

  const currentSavingsFV = calculateFutureValue(
    profile.currentSavings,
    SCENARIO_RATES.moderate,
    yearsToRetirement
  );

  const totalGap = Math.max(0, totalExpense - totalPensionIncome - currentSavingsFV);
  const monthlyGap = totalGap / (expectedRetirementYears * 12);

  const suggestedMonthlySavings = calculateMonthlySavings(
    totalGap,
    SCENARIO_RATES.moderate,
    yearsToRetirement
  );

  const scenarios = {
    conservative: calculateScenario(profile, SCENARIO_RATES.conservative, targetMonthlyExpense, expectedRetirementYears, yearsToRetirement, socialSecurityTotal, enterpriseAnnuityTotal, personalPensionTotal),
    moderate: calculateScenario(profile, SCENARIO_RATES.moderate, targetMonthlyExpense, expectedRetirementYears, yearsToRetirement, socialSecurityTotal, enterpriseAnnuityTotal, personalPensionTotal),
    optimistic: calculateScenario(profile, SCENARIO_RATES.optimistic, targetMonthlyExpense, expectedRetirementYears, yearsToRetirement, socialSecurityTotal, enterpriseAnnuityTotal, personalPensionTotal),
  };

  return {
    threePillars: {
      socialSecurity: { monthlyAmount: socialSecurityMonthly, totalAmount: socialSecurityTotal },
      enterpriseAnnuity: { monthlyAmount: enterpriseAnnuityMonthly, totalAmount: enterpriseAnnuityTotal },
      personalPension: { monthlyAmount: personalPensionMonthly, totalAmount: personalPensionTotal },
    },
    totalGap,
    monthlyGap,
    suggestedMonthlySavings,
    yearsToRetirement,
    expectedRetirementYears,
    targetMonthlyExpense,
    scenarios,
  };
}

function calculateSocialSecurity(avgWage: number, years: number, base: number): number {
  if (years < 15) return 0;
  const index = Math.min(3, base / 8000);
  const basicPension = avgWage * (1 + index) / 2 * Math.min(years, 40) * 0.01;
  const personalAccount = base * 0.08 * years * 12 / 139;
  return Math.round(basicPension + personalAccount);
}

function calculateEnterpriseAnnuityMonthly(
  currentAmount: number,
  yearsToRetirement: number,
  retirementYears: number
): number {
  const fv = calculateFutureValue(currentAmount, SCENARIO_RATES.moderate, yearsToRetirement);
  return Math.round(fv / (retirementYears * 12));
}

function calculatePersonalPensionMonthly(
  currentAmount: number,
  yearsToRetirement: number,
  retirementYears: number
): number {
  const fv = calculateFutureValue(currentAmount, SCENARIO_RATES.moderate, yearsToRetirement);
  return Math.round(fv / (retirementYears * 12));
}

function calculateFutureValue(pv: number, rate: number, years: number): number {
  return pv * Math.pow(1 + rate, years);
}

function calculateMonthlySavings(
  target: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0 || target <= 0) return 0;
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  if (monthlyRate === 0) return Math.round(target / months);
  const monthly = target * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(monthly);
}

function calculateScenario(
  profile: UserProfile,
  rate: number,
  targetMonthlyExpense: number,
  expectedRetirementYears: number,
  yearsToRetirement: number,
  socialSecurityTotal: number,
  enterpriseAnnuityTotal: number,
  personalPensionTotal: number
): CalculationScenario {
  const totalExpense = targetMonthlyExpense * expectedRetirementYears * 12;
  const currentSavingsFV = calculateFutureValue(profile.currentSavings, rate, yearsToRetirement);
  const totalGap = Math.max(0, totalExpense - socialSecurityTotal - enterpriseAnnuityTotal - personalPensionTotal - currentSavingsFV);
  const suggestedMonthlySavings = calculateMonthlySavings(totalGap, rate, yearsToRetirement);

  return {
    returnRate: rate,
    totalGap,
    suggestedMonthlySavings,
  };
}
