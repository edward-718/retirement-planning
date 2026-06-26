import { useStore } from '@/store/useStore';
import { formatMoneyShort, formatMoney } from '@/utils/format';
import CircularProgress from '@/components/charts/CircularProgress';
import { Calculator, FileText, Target, MapPin, TrendingUp, Wallet, AlertTriangle, PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { progress, profile, calculationResult, calculate } = useStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!calculationResult) {
      calculate();
    }
    setLoaded(true);
  }, []);

  const nextMilestone = progress.milestones.find(m => m.status === 'in_progress') || progress.milestones.find(m => m.status === 'pending');

  const statCards = [
    {
      title: '目标金额',
      value: formatMoneyShort(progress.totalTarget),
      icon: Target,
      color: 'from-teal-500 to-teal-700',
      bgColor: 'bg-teal-50',
    },
    {
      title: '已储蓄',
      value: formatMoneyShort(progress.currentSavings),
      icon: Wallet,
      color: 'from-gold-500 to-gold-600',
      bgColor: 'bg-gold-50',
    },
    {
      title: '养老缺口',
      value: calculationResult ? formatMoneyShort(calculationResult.totalGap) : '—',
      icon: AlertTriangle,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
    },
    {
      title: '建议月存',
      value: calculationResult ? formatMoneyShort(calculationResult.suggestedMonthlySavings) : '—',
      icon: PiggyBank,
      color: 'from-emerald-500 to-emerald-700',
      bgColor: 'bg-emerald-50',
    },
  ];

  const quickActions = [
    { title: '养老金测算', desc: '30秒快速估算', icon: Calculator, path: '/calculator', color: 'from-teal-500 to-teal-700' },
    { title: '养老蓝图', desc: '查看完整规划', icon: FileText, path: '/blueprint', color: 'from-gold-500 to-gold-600' },
    { title: '进度追踪', desc: '里程碑与成就', icon: Target, path: '/progress', color: 'from-emerald-500 to-emerald-700' },
    { title: '养老城市', desc: '探索理想之地', icon: MapPin, path: '/cities', color: 'from-sky-500 to-sky-700' },
  ];

  if (!loaded) return null;

  return (
    <div className="py-8 space-y-8">
      <div className="text-center mb-12 animate-fade-in-up">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-teal-900 mb-3">
          你好，未来的你会感谢现在的自己 🌟
        </h1>
        <p className="text-teal-600 text-lg">
          距离 <span className="font-semibold text-teal-800">{profile.expectedRetirementAge}</span> 岁退休还有{' '}
          <span className="font-semibold text-gold-600">{calculationResult?.yearsToRetirement || 0}</span> 年
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-1 flex justify-center animate-fade-in-up animate-stagger-1">
          <div className="card p-8">
            <CircularProgress
              percentage={progress.progressPercentage}
              size={260}
              title="养老进度"
              subtitle={`已完成 ${formatMoneyShort(progress.currentSavings)} / ${formatMoneyShort(progress.totalTarget)}`}
            />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={stat.title}
              className={`card p-6 animate-fade-in-up animate-stagger-${index + 2}`}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <stat.icon className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} size={24} style={{ color: stat.color.includes('teal') ? '#0d9488' : stat.color.includes('gold') ? '#d97706' : stat.color.includes('rose') ? '#e11d48' : '#059669' }} />
              </div>
              <p className="text-teal-500 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold font-serif text-teal-800">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {nextMilestone && (
        <div className="card p-6 animate-fade-in-up animate-stagger-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-teal-800">下一个里程碑</h3>
              <p className="text-teal-500 text-sm mt-1">{nextMilestone.title} · 截止 {nextMilestone.deadline}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gold-600">
                {formatMoneyShort(nextMilestone.currentAmount)} / {formatMoneyShort(nextMilestone.targetAmount)}
              </p>
            </div>
          </div>
          <div className="w-full h-3 bg-teal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-gold-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(100, (nextMilestone.currentAmount / nextMilestone.targetAmount) * 100)}%` }}
            />
          </div>
          <p className="text-teal-600 text-sm mt-2">
            还差 <span className="font-semibold text-teal-800">{formatMoney(nextMilestone.targetAmount - nextMilestone.currentAmount)}</span> 达成目标
          </p>
        </div>
      )}

      <div>
        <h2 className="font-serif text-2xl font-bold text-teal-800 mb-6 animate-fade-in-up">快速开始</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={() => navigate(action.path)}
              className={`card p-6 text-left group animate-fade-in-up animate-stagger-${index + 1}`}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon size={28} className="text-white" />
              </div>
              <h3 className="font-semibold text-teal-800 text-lg mb-1">{action.title}</h3>
              <p className="text-teal-500 text-sm">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-teal-700" />
            </div>
            <h3 className="font-serif text-xl font-bold text-teal-800">三支柱概览</h3>
          </div>
          {calculationResult ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-teal-600">社保养老金</span>
                  <span className="font-semibold text-teal-800">{formatMoneyShort(calculationResult.threePillars.socialSecurity.monthlyAmount)}/月</span>
                </div>
                <div className="w-full h-2 bg-teal-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '70%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-teal-600">企业年金</span>
                  <span className="font-semibold text-teal-800">{formatMoneyShort(calculationResult.threePillars.enterpriseAnnuity.monthlyAmount)}/月</span>
                </div>
                <div className="w-full h-2 bg-gold-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-teal-600">个人养老金</span>
                  <span className="font-semibold text-teal-800">{formatMoneyShort(calculationResult.threePillars.personalPension.monthlyAmount)}/月</span>
                </div>
                <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '15%' }} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-teal-500">请先完成测算</p>
          )}
        </div>

        <div className="card p-6 animate-fade-in-up animate-stagger-2">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-4">💡 今日小贴士</h3>
          <div className="space-y-3 text-teal-700">
            <p className="leading-relaxed">
              <span className="text-gold-600 font-semibold">复利效应</span>：
              假设年化收益率 4%，每月存 3000 元，30 年后你将拥有约{' '}
              <span className="font-bold text-teal-800">208 万元</span>。
            </p>
            <p className="leading-relaxed">
              <span className="text-teal-600 font-semibold">时间就是金钱</span>：
              越早开始储蓄，需要每月投入的金额越少。同样目标 200 万，
              30 岁开始每月只需存 3000，40 岁开始则需要每月存 5500。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
