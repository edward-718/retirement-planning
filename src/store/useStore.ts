import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, CalculationResult, ProgressData, CalculatorMode, Milestone, Task, Achievement } from '@/types';
import { calculatePension } from '@/utils/calculator';

const defaultProfile: UserProfile = {
  age: 30,
  currentCity: 'shanghai',
  monthlyIncome: 15000,
  currentSavings: 200000,
  targetCity: 'chengdu',
  expectedRetirementAge: 60,
  socialInsuranceYears: 8,
  socialInsuranceBase: 10000,
  lifestyleLevel: 'comfortable',
};

const defaultMilestones: Milestone[] = [
  { id: 'm1', title: '存下第一桶金', targetAmount: 100000, currentAmount: 200000, deadline: '2025-12', status: 'completed' },
  { id: 'm2', title: '建立应急储备', targetAmount: 300000, currentAmount: 200000, deadline: '2027-12', status: 'in_progress' },
  { id: 'm3', title: '完成50万目标', targetAmount: 500000, currentAmount: 200000, deadline: '2029-12', status: 'pending' },
  { id: 'm4', title: '突破百万大关', targetAmount: 1000000, currentAmount: 200000, deadline: '2033-12', status: 'pending' },
  { id: 'm5', title: '实现财务自由', targetAmount: 2000000, currentAmount: 200000, deadline: '2040-12', status: 'pending' },
];

const defaultTasks: Task[] = [
  { id: 't1', title: '本月储蓄目标 5000 元', type: 'savings', progress: 60, reward: 50, deadline: '2026-06-30' },
  { id: 't2', title: '了解个人养老金政策', type: 'knowledge', progress: 100, reward: 20, deadline: '2026-06-20' },
  { id: 't3', title: '探索成都养老环境', type: 'exploration', progress: 30, reward: 30, deadline: '2026-07-15' },
  { id: 't4', title: '阅读《养老规划指南》', type: 'knowledge', progress: 10, reward: 25, deadline: '2026-07-31' },
];

const defaultAchievements: Achievement[] = [
  { id: 'a1', title: '初出茅庐', description: '完成首次养老测算', icon: '🌱', unlocked: true, unlockedAt: '2026-06-01' },
  { id: 'a2', title: '第一桶金', description: '储蓄达到 10 万元', icon: '💰', unlocked: true, unlockedAt: '2026-06-10' },
  { id: 'a3', title: '城市探险家', description: '探索 5 个养老城市', icon: '🗺️', unlocked: false },
  { id: 'a4', title: '知识达人', description: '完成 10 个知识任务', icon: '📚', unlocked: false },
  { id: 'a5', title: '坚持不懈', description: '连续储蓄 12 个月', icon: '🏆', unlocked: false },
  { id: 'a6', title: '百万富翁', description: '储蓄突破 100 万', icon: '💎', unlocked: false },
  { id: 'a7', title: '规划大师', description: '完成专业模式测算', icon: '🎯', unlocked: false },
  { id: 'a8', title: '家庭顶梁柱', description: '完善家庭养老规划', icon: '👨‍👩‍👧', unlocked: false },
];

interface AppState {
  profile: UserProfile;
  calculatorMode: CalculatorMode;
  calculationResult: CalculationResult | null;
  progress: ProgressData;
  setProfile: (profile: Partial<UserProfile>) => void;
  setCalculatorMode: (mode: CalculatorMode) => void;
  calculate: () => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  completeTask: (taskId: string) => void;
}

// 成就检查函数
function checkAchievements(
  achievements: Achievement[],
  profile: UserProfile,
  tasks: Task[],
  currentSavings: number
): Achievement[] {
  const today = new Date().toISOString().split('T')[0];
  const completedTasks = tasks.filter(t => t.progress === 100);
  const completedKnowledgeTasks = completedTasks.filter(t => t.type === 'knowledge');
  
  return achievements.map(achievement => {
    if (achievement.unlocked) return achievement;
    
    let shouldUnlock = false;
    
    switch (achievement.id) {
      // 第一桶金：储蓄达到 10 万元
      case 'a2':
        shouldUnlock = currentSavings >= 100000;
        break;
      // 城市探险家：完成 5 个探索任务（这里简化为完成探索任务）
      case 'a3':
        shouldUnlock = completedTasks.filter(t => t.type === 'exploration').length >= 5;
        break;
      // 知识达人：完成 10 个知识任务
      case 'a4':
        shouldUnlock = completedKnowledgeTasks.length >= 10;
        break;
      // 坚持不懈：连续储蓄 12 个月（模拟：完成12个储蓄任务）
      case 'a5':
        shouldUnlock = completedTasks.filter(t => t.type === 'savings').length >= 12;
        break;
      // 百万富翁：储蓄突破 100 万
      case 'a6':
        shouldUnlock = currentSavings >= 1000000;
        break;
      // 规划大师：完成标准模式测算（通过是否有企业年金或个人养老金判断）
      case 'a7':
        shouldUnlock = profile.enterpriseAnnuity !== undefined || profile.personalPension !== undefined;
        break;
      // 家庭顶梁柱：储蓄达到50万
      case 'a8':
        shouldUnlock = currentSavings >= 500000;
        break;
      default:
        break;
    }
    
    return shouldUnlock ? { ...achievement, unlocked: true, unlockedAt: today } : achievement;
  });
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      calculatorMode: 'simple',
      calculationResult: null,
      progress: {
        totalTarget: 2000000,
        currentSavings: defaultProfile.currentSavings,
        progressPercentage: (defaultProfile.currentSavings / 2000000) * 100,
        milestones: defaultMilestones,
        tasks: defaultTasks,
        achievements: defaultAchievements,
      },

      setProfile: (partialProfile) => {
        const newProfile = { ...get().profile, ...partialProfile };
        set({ profile: newProfile });
      },

      setCalculatorMode: (mode) => {
        set({ calculatorMode: mode });
      },

      calculate: () => {
        const result = calculatePension(get().profile);
        const progress = get().progress;
        const newProgress = {
          ...progress,
          totalTarget: get().profile.currentSavings + result.totalGap,
          currentSavings: get().profile.currentSavings,
          progressPercentage: Math.min(100, (get().profile.currentSavings / (get().profile.currentSavings + result.totalGap)) * 100),
        };
        set({ calculationResult: result, progress: newProgress });
      },

      updateTaskProgress: (taskId, progressValue) => {
        set((state) => {
          const updatedTasks = state.progress.tasks.map((t) =>
            t.id === taskId ? { ...t, progress: progressValue } : t
          );
          // 检查成就解锁
          const updatedAchievements = checkAchievements(
            state.progress.achievements,
            state.profile,
            updatedTasks,
            state.progress.currentSavings
          );
          return {
            progress: {
              ...state.progress,
              tasks: updatedTasks,
              achievements: updatedAchievements,
            },
          };
        });
      },

      completeTask: (taskId) => {
        set((state) => {
          const updatedTasks = state.progress.tasks.map((t) =>
            t.id === taskId ? { ...t, progress: 100 } : t
          );
          // 检查成就解锁
          const updatedAchievements = checkAchievements(
            state.progress.achievements,
            state.profile,
            updatedTasks,
            state.progress.currentSavings
          );
          return {
            progress: {
              ...state.progress,
              tasks: updatedTasks,
              achievements: updatedAchievements,
            },
          };
        });
      },
    }),
    {
      name: 'retirement-planning-storage',
    }
  )
);
