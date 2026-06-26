import { useStore } from '@/store/useStore';
import { formatMoneyShort, formatMoney } from '@/utils/format';
import CircularProgress from '@/components/charts/CircularProgress';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { Calculator, FileText, Target, MapPin, TrendingUp, Wallet, AlertTriangle, PiggyBank, ArrowRight, Sparkles, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { progress, profile, calculationResult, calculate } = useStore();
  const [loaded, setLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!calculationResult) {
      calculate();
    }
    const timer = setTimeout(() => {
      setLoaded(true);
      setShowWelcome(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const nextMilestone = progress.milestones.find(m => m.status === 'in_progress') || progress.milestones.find(m => m.status === 'pending');

  const completedMilestones = progress.milestones.filter(m => m.status === 'completed').length;
  const completedAchievements = progress.achievements.filter(a => a.unlocked).length;

  const statCards = [
    {
      title: '目标金额',
      value: progress.totalTarget,
      icon: Target,
      color: 'from-teal-500 to-teal-700',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700',
    },
    {
      title: '已储蓄',
      value: progress.currentSavings,
      icon: Wallet,
      color: 'from-gold-500 to-gold-600',
      bgColor: 'bg-gold-50',
      textColor: 'text-gold-700',
    },
    {
      title: '养老缺口',
      value: calculationResult?.totalGap || 0,
      icon: AlertTriangle,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
    },
    {
      title: '建议月存',
      value: calculationResult?.suggestedMonthlySavings || 0,
      icon: PiggyBank,
      color: 'from-emerald-500 to-emerald-700',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
    },
  ];

  const quickActions = [
    { title: '养老金测算', desc: '30秒快速估算', icon: Calculator, path: '/calculator', color: 'from-teal-500 to-teal-700' },
    { title: '养老蓝图', desc: '查看完整规划', icon: FileText, path: '/blueprint', color: 'from-gold-500 to-gold-600' },
    { title: '进度追踪', desc: '里程碑与成就', icon: Target, path: '/progress', color: 'from-emerald-500 to-emerald-700' },
    { title: '养老城市', desc: '探索理想之地', icon: MapPin, path: '/cities', color: 'from-sky-500 to-sky-700' },
  ];

  const tips = [
    {
      title: '复利效应',
      icon: '📈',
      content: '假设年化收益率 4%，每月存 3000 元，30 年后你将拥有约 208 万元。',
      highlight: '208 万元',
    },
    {
      title: '时间就是金钱',
      icon: '⏰',
      content: '越早开始储蓄，需要每月投入的金额越少。同样目标 200 万，30 岁开始每月只需存 3000，40 岁开始则需要每月存 5500。',
      highlight: '3000 vs 5500',
    },
    {
      title: '三支柱策略',
      icon: '🏛️',
      content: '合理配置社保、企业年金和个人养老金，形成稳健的养老保障体系。',
      highlight: '三支柱',
    },
  ];

  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tips.length]);

  if (!loaded) return null;

  return (
    <div className="py-6 space-y-6 sm:py-8 sm:space-y-8">
      {showWelcome && (
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-100 to-amber-100 rounded-full mb-4">
            <Sparkles size={16} className="text-gold-600" />
            <span className="text-sm text-teal-700 font-medium">欢迎回来！今天也要为未来努力 💪</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-teal-900 mb-2">
            你好，未来的你会感谢现在的自己 🌟
          </h1>
          <p className="text-teal-600 text-base sm:text-lg">
            距离 <span className="font-semibold text-teal-800"><AnimatedNumber value={profile.expectedRetirementAge} formatter={(v) => v.toString()} /></span> 岁退休还有{' '}
            <span className="font-semibold text-gold-600"><AnimatedNumber value={calculationResult?.yearsToRetirement || 0} formatter={(v) => v.toString()} /></span> 年
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-1 flex justify-center animate-fade-in-up animate-stagger-1">
          <div className="card p-6 sm:p-8 w-full sm:w-auto">
            <CircularProgress
              percentage={progress.progressPercentage}
              size={220}
              title="养老进度"
              subtitle={`已完成 ${formatMoneyShort(progress.currentSavings)} / ${formatMoneyShort(progress.totalTarget)}`}
            />
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-teal-100">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Award size={16} className="text-gold-500" />
                  <span className="text-lg font-bold text-teal-700">{completedMilestones}</span>
                </div>
                <span className="text-xs text-teal-500">里程碑</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <Sparkles size={16} className="text-teal-500" />
                  <span className="text-lg font-bold text-teal-700">{completedAchievements}</span>
                </div>
                <span className="text-xs text-teal-500">成就</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className={`card p-4 sm:p-6 animate-fade-in-up animate-stagger-${index + 2}`}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3 sm:mb-4`}>
                <stat.icon size={24} className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
              </div>
              <p className="text-teal-500 text-xs sm:text-sm mb-1">{stat.title}</p>
              <p className={`text-2xl sm:text-3xl font-bold font-serif ${stat.textColor}`}>
                {stat.title.includes('月存') ? (
                  <>
                    <AnimatedNumber value={stat.value} formatter={(v) => formatMoneyShort(v)} />
                    <span className="text-base sm:text-lg">/月</span>
                  </>
                ) : (
                  <AnimatedNumber value={stat.value} formatter={(v) => formatMoneyShort(v)} />
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {nextMilestone && (
        <div className="card p-5 sm:p-6 animate-fade-in-up animate-stagger-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-teal-800">下一个里程碑</h3>
                <p className="text-teal-500 text-sm">{nextMilestone.title} · 截止 {nextMilestone.deadline}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold text-gold-600">
                <AnimatedNumber value={nextMilestone.currentAmount} formatter={(v) => formatMoneyShort(v)} />
                <span className="text-base sm:text-lg text-teal-400"> / </span>
                <AnimatedNumber value={nextMilestone.targetAmount} formatter={(v) => formatMoneyShort(v)} />
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-teal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-gold-500 rounded-full transition-all duration-1000 relative"
              style={{ width: `${Math.min(100, (nextMilestone.currentAmount / nextMilestone.targetAmount) * 100)}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-teal-600 text-sm">
              还差 <span className="font-semibold text-teal-800"><AnimatedNumber value={nextMilestone.targetAmount - nextMilestone.currentAmount} formatter={(v) => formatMoney(v)} /></span> 达成目标
            </p>
            <button
              onClick={() => navigate('/progress')}
              className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm font-medium transition-colors"
            >
              查看详情 <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-teal-800 animate-fade-in-up">快速开始</h2>
          <div className="flex items-center gap-1 text-sm text-teal-500">
            <Clock size={14} />
            <span>开始规划，越早越好</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className={`card p-4 sm:p-6 text-left group animate-fade-in-up animate-stagger-${index + 1}`}
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                <action.icon size={28} className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-semibold text-teal-800 text-base sm:text-lg mb-1">{action.title}</h3>
              <p className="text-teal-500 text-xs sm:text-sm">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-5 sm:p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-teal-700" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-teal-800">三支柱概览</h3>
              <p className="text-xs text-teal-500">退休后月收入来源</p>
            </div>
          </div>
          {calculationResult ? (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-teal-600">社保养老金</span>
                  <span className="font-semibold text-teal-800">
                    <AnimatedNumber value={calculationResult.threePillars.socialSecurity.monthlyAmount} formatter={(v) => formatMoneyShort(v)} />/月
                  </span>
                </div>
                <div className="w-full h-2 sm:h-2.5 bg-teal-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: '70%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-teal-600">企业年金</span>
                  <span className="font-semibold text-gold-700">
                    <AnimatedNumber value={calculationResult.threePillars.enterpriseAnnuity.monthlyAmount} formatter={(v) => formatMoneyShort(v)} />/月
                  </span>
                </div>
                <div className="w-full h-2 sm:h-2.5 bg-gold-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full transition-all duration-1000" style={{ width: '15%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-teal-600">个人养老金</span>
                  <span className="font-semibold text-emerald-700">
                    <AnimatedNumber value={calculationResult.threePillars.personalPension.monthlyAmount} formatter={(v) => formatMoneyShort(v)} />/月
                  </span>
                </div>
                <div className="w-full h-2 sm:h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-teal-500 mb-4">还没有测算数据</p>
              <button onClick={() => navigate('/calculator')} className="btn-primary text-sm">
                开始测算
              </button>
            </div>
          )}
        </div>

        <div className="card p-5 sm:p-6 bg-gradient-to-br from-teal-50 to-gold-50 animate-fade-in-up animate-stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tips[currentTip].icon}</span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-teal-800">💡 今日小贴士</h3>
            </div>
            <div className="flex gap-1">
              {tips.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTip(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentTip ? 'bg-teal-600 w-4' : 'bg-teal-300'}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-teal-800">{tips[currentTip].title}</p>
            <p className="text-teal-700 text-sm leading-relaxed">
              {tips[currentTip].content.replace(tips[currentTip].highlight, `<span class="font-bold text-gold-600">${tips[currentTip].highlight}</span>`)}
              <span className="font-bold text-gold-600">{tips[currentTip].highlight}</span>
            </p>
          </div>
        </div>
      </div>

      {!calculationResult && (
        <div className="card p-6 bg-gradient-to-r from-teal-600 to-teal-700 text-white animate-fade-in-up">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-serif text-xl font-bold mb-2">📊 开始你的养老规划之旅</h3>
              <p className="text-teal-100 text-sm">只需 30 秒，AI 将为你生成专属养老蓝图</p>
            </div>
            <button onClick={() => navigate('/calculator')} className="btn-gold text-white">
              立即测算
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
