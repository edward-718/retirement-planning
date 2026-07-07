export interface UserProfile {
  age: number;
  currentCity: string;
  monthlyIncome: number;
  currentSavings: number;
  targetCity: string;
  expectedRetirementAge: number;
  socialInsuranceYears: number;
  socialInsuranceBase: number;
  lifestyleLevel: 'basic' | 'comfortable' | 'luxury';
  enterpriseAnnuity?: number;
  personalPension?: number;
}

export interface CalculationResult {
  threePillars: {
    socialSecurity: { monthlyAmount: number; totalAmount: number };
    enterpriseAnnuity: { monthlyAmount: number; totalAmount: number };
    personalPension: { monthlyAmount: number; totalAmount: number };
  };
  totalGap: number;
  monthlyGap: number;
  suggestedMonthlySavings: number;
  yearsToRetirement: number;
  expectedRetirementYears: number;
  targetMonthlyExpense: number;
  scenarios: {
    conservative: CalculationScenario;
    moderate: CalculationScenario;
    optimistic: CalculationScenario;
  };
}

export interface CalculationScenario {
  returnRate: number;
  totalGap: number;
  suggestedMonthlySavings: number;
}

export interface ProgressData {
  totalTarget: number;
  currentSavings: number;
  progressPercentage: number;
  milestones: Milestone[];
  tasks: Task[];
  achievements: Achievement[];
}

export interface Milestone {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface Task {
  id: string;
  title: string;
  type: 'savings' | 'knowledge' | 'exploration';
  progress: number;
  reward: number;
  deadline: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface CityData {
  id: string;
  name: string;
  province: string;
  image: string;
  scores: {
    costOfLiving: number;
    healthcare: number;
    climate: number;
    socialSupport: number;
    transportation: number;
  };
  costDetails: {
    rent: { basic: number; comfortable: number; luxury: number };
    food: number;
    transportation: number;
    utilities: number;
    total: { basic: number; comfortable: number; luxury: number };
  };
  highlights: string[];
}

export type CalculatorMode = 'simple' | 'standard';
