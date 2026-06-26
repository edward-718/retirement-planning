import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { formatMoney, formatMoneyShort, formatPercent } from '@/utils/format';
import { FileText, PieChart, TrendingDown, TrendingUp, Shield, AlertTriangle, PiggyBank, Target, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

type ScenarioType = 'conservative' | 'moderate' | 'optimistic';

export default function Blueprint() {
  const navigate = useNavigate();
  const { calculationResult, profile } = useStore();
  const [scenario, setScenario] = useState<ScenarioType>('moderate');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  if (!calculationResult) {
    return (
      <div className="py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
          <FileText size={40} className="text-teal-600" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-teal-800 mb-3">还没有养老蓝图</h2>
        <p className="text-teal-600 mb-6">先完成养老金测算，生成你的专属规划</p>
        <button onClick={() => navigate('/calculator')} className="btn-primary">
          开始测算
        </button>
      </div>
    );
  }

  const scenarioData = calculationResult.scenarios[scenario];

  const threePillarsData = [
    { name: '社保养老金', value: calculationResult.threePillars.socialSecurity.monthlyAmount, color: '#0d9488' },
    { name: '企业年金', value: calculationResult.threePillars.enterpriseAnnuity.monthlyAmount, color: '#f59e0b' },
    { name: '个人养老金', value: calculationResult.threePillars.personalPension.monthlyAmount, color: '#10b981' },
  ];

  const gapAnalysisData = [
    { name: '总需求', value: calculationResult.targetMonthlyExpense * calculationResult.expectedRetirementYears * 12 / 10000, fill: '#0d9488' },
    { name: '社保', value: calculationResult.threePillars.socialSecurity.totalAmount / 10000, fill: '#14b8a6' },
    { name: '企业年金', value: calculationResult.threePillars.enterpriseAnnuity.totalAmount / 10000, fill: '#f59e0b' },
    { name: '个人养老金', value: calculationResult.threePillars.personalPension.totalAmount / 10000, fill: '#10b981' },
    { name: '现有储蓄终值', value: profile.currentSavings * Math.pow(1 + 0.04, calculationResult.yearsToRetirement) / 10000, fill: '#8b5cf6' },
  ];

  const savingsProjectionData = Array.from({ length: calculationResult.yearsToRetirement + 1 }, (_, i) => {
    const year = i;
    const currentSavingsFV = profile.currentSavings * Math.pow(1 + scenarioData.returnRate, year);
    const monthlySavingsFV = scenarioData.suggestedMonthlySavings * 12 * ((Math.pow(1 + scenarioData.returnRate, year) - 1) / scenarioData.returnRate);
    return {
      year: `第${year}年`,
      储蓄总额: Math.round((currentSavingsFV + monthlySavingsFV) / 10000),
      目标线: Math.round((profile.currentSavings + calculationResult.totalGap) / 10000),
    };
  });

  const scenarioOptions = [
    { key: 'conservative', label: '保守', rate: '2%', color: 'bg-sky-500' },
    { key: 'moderate', label: '中性', rate: '4%', color: 'bg-teal-500' },
    { key: 'optimistic', label: '乐观', rate: '6%', color: 'bg-emerald-500' },
  ];

  return (
    <div className={`py-8 space-y-8 ${loaded ? 'animate-fade-in' : 'opacity-0'}`}>
      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-4">
          <FileText size={32} className="text-white" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-teal-900 mb-2">
          你的养老蓝图 🌟
        </h1>
        <p className="text-teal-600">
          基于你的情况，AI 生成了这份专属规划
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 animate-fade-in-up animate-stagger-1">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={24} className="text-rose-600" />
          </div>
          <p className="text-teal-500 text-sm mb-1">养老总缺口</p>
          <p className="text-3xl font-bold font-serif text-rose-600">
            {formatMoneyShort(scenarioData.totalGap)}
          </p>
          <p className="text-teal-400 text-xs mt-1">{scenarioOptions.find(s => s.key === scenario)?.rate} 年化收益率</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-3">
            <PiggyBank size={24} className="text-gold-600" />
          </div>
          <p className="text-teal-500 text-sm mb-1">建议每月储蓄</p>
          <p className="text-3xl font-bold font-serif text-gold-600">
            {formatMoneyShort(scenarioData.suggestedMonthlySavings)}
          </p>
          <p className="text-teal-400 text-xs mt-1">坚持 {calculationResult.yearsToRetirement} 年</p>
        </div>
        <div className="card p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
            <Target size={24} className="text-teal-600" />
          </div>
          <p className="text-teal-500 text-sm mb-1">目标养老生活费</p>
          <p className="text-3xl font-bold font-serif text-teal-700">
            {formatMoneyShort(calculationResult.targetMonthlyExpense)}/月
          </p>
          <p className="text-teal-400 text-xs mt-1">预计 {calculationResult.expectedRetirementYears} 年养老期</p>
        </div>
      </div>

      <div className="flex justify-center gap-2 animate-fade-in-up animate-stagger-2">
        {scenarioOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setScenario(opt.key as ScenarioType)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              scenario === opt.key
                ? `${opt.color} text-white shadow-lg`
                : 'bg-white text-teal-600 border border-teal-200 hover:border-teal-400'
            }`}
          >
            {opt.label} ({opt.rate})
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-fade-in-up animate-stagger-3">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-teal-600" />
            三支柱养老金（月领取）
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={threePillarsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatMoneyShort(value)}`}
                >
                  {threePillarsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatMoney(value)} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-3 bg-teal-50 rounded-xl">
              <p className="text-teal-500 text-xs">社保</p>
              <p className="font-bold text-teal-700">{formatMoneyShort(calculationResult.threePillars.socialSecurity.monthlyAmount)}</p>
            </div>
            <div className="text-center p-3 bg-gold-50 rounded-xl">
              <p className="text-teal-500 text-xs">企业年金</p>
              <p className="font-bold text-gold-700">{formatMoneyShort(calculationResult.threePillars.enterpriseAnnuity.monthlyAmount)}</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-teal-500 text-xs">个人养老金</p>
              <p className="font-bold text-emerald-700">{formatMoneyShort(calculationResult.threePillars.personalPension.monthlyAmount)}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 animate-fade-in-up animate-stagger-4">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-rose-500" />
            缺口构成分析（万元）
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapAnalysisData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
                <XAxis type="number" stroke="#0d9488" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#0d9488" fontSize={12} width={90} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}万元`} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up animate-stagger-5">
        <h3 className="font-serif text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          储蓄增长曲线（万元）
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={savingsProjectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
              <XAxis dataKey="year" stroke="#0d9488" fontSize={11} tick={{ fill: '#0d9488' }} />
              <YAxis stroke="#0d9488" fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="储蓄总额"
                stroke="#0d9488"
                strokeWidth={3}
                dot={false}
                fill="url(#colorPv)"
              />
              <Line
                type="monotone"
                dataKey="目标线"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-br from-teal-50 to-gold-50 animate-fade-in-up animate-stagger-6">
        <h3 className="font-serif text-xl font-bold text-teal-800 mb-4">💡 AI 规划建议</h3>
        <div className="space-y-4 text-teal-700">
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">1️⃣</span>
            <div>
              <p className="font-semibold text-teal-800">每月坚持储蓄</p>
              <p className="text-sm">建议每月存入 <span className="font-bold text-gold-600">{formatMoney(scenarioData.suggestedMonthlySavings)}</span>，占月收入约 {formatPercent(scenarioData.suggestedMonthlySavings / profile.monthlyIncome, 0)}。可设置自动定投，强制储蓄。</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">2️⃣</span>
            <div>
              <p className="font-semibold text-teal-800">合理配置资产</p>
              <p className="text-sm">年轻时期可配置更多权益类资产，临近退休逐步转向稳健型。建议长期年化收益率目标 {scenarioOptions.find(s => s.key === scenario)?.rate}。</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">3️⃣</span>
            <div>
              <p className="font-semibold text-teal-800">充分利用税优政策</p>
              <p className="text-sm">每年缴纳个人养老金 12000 元，可享受个税抵扣，同时增加养老储备。</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl flex-shrink-0">4️⃣</span>
            <div>
              <p className="font-semibold text-teal-800">每年复盘调整</p>
              <p className="text-sm">收入变化、目标调整、市场波动都会影响规划，建议每年年初重新测算和调整。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
        <button onClick={() => navigate('/calculator')} className="btn-secondary flex items-center justify-center gap-2">
          重新测算
        </button>
        <button onClick={() => navigate('/progress')} className="btn-primary flex items-center justify-center gap-2">
          查看进度追踪
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
