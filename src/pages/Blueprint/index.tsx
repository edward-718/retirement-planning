import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { formatMoney, formatMoneyShort, formatPercent } from '@/utils/format';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import FunnelChart from '@/components/charts/FunnelChart';
import { FileText, PieChart, TrendingDown, TrendingUp, Shield, AlertTriangle, PiggyBank, Target, ArrowRight, Info, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart, Area } from 'recharts';

type ScenarioType = 'conservative' | 'moderate' | 'optimistic';

export default function Blueprint() {
  const navigate = useNavigate();
  const { calculationResult, profile } = useStore();
  const [scenario, setScenario] = useState<ScenarioType>('moderate');
  const [loaded, setLoaded] = useState(false);
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!calculationResult) {
    return (
      <div className="py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6 animate-bounce-in">
          <FileText size={40} className="text-teal-600" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-teal-800 mb-3">还没有养老蓝图</h2>
        <p className="text-teal-600 mb-6">先完成养老金测算，生成你的专属规划</p>
        <button onClick={() => navigate('/calculator')} className="btn-primary animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          开始测算
        </button>
      </div>
    );
  }

  const scenarioData = calculationResult.scenarios[scenario];

  const threePillarsData = [
    { name: '社保养老金', value: calculationResult.threePillars.socialSecurity.monthlyAmount, color: '#0d9488', total: calculationResult.threePillars.socialSecurity.totalAmount },
    { name: '企业年金', value: calculationResult.threePillars.enterpriseAnnuity.monthlyAmount, color: '#f59e0b', total: calculationResult.threePillars.enterpriseAnnuity.totalAmount },
    { name: '个人养老金', value: calculationResult.threePillars.personalPension.monthlyAmount, color: '#10b981', total: calculationResult.threePillars.personalPension.totalAmount },
  ];

  const totalExpense = calculationResult.targetMonthlyExpense * calculationResult.expectedRetirementYears * 12;
  const totalIncome = calculationResult.threePillars.socialSecurity.totalAmount + 
    calculationResult.threePillars.enterpriseAnnuity.totalAmount + 
    calculationResult.threePillars.personalPension.totalAmount +
    profile.currentSavings * Math.pow(1 + 0.04, calculationResult.yearsToRetirement);

  const funnelData = [
    { label: '养老总需求', value: totalExpense, color: '#0d9488' },
    { label: '社保养老金', value: calculationResult.threePillars.socialSecurity.totalAmount, color: '#14b8a6' },
    { label: '企业年金', value: calculationResult.threePillars.enterpriseAnnuity.totalAmount, color: '#f59e0b' },
    { label: '个人养老金', value: calculationResult.threePillars.personalPension.totalAmount, color: '#10b981' },
    { label: '现有储蓄终值', value: Math.round(profile.currentSavings * Math.pow(1 + 0.04, calculationResult.yearsToRetirement)), color: '#8b5cf6' },
    { label: '养老缺口', value: Math.max(0, totalExpense - totalIncome), color: '#e11d48' },
  ];

  const savingsProjectionData = Array.from({ length: Math.min(calculationResult.yearsToRetirement + 1, 31) }, (_, i) => {
    const year = i;
    const currentSavingsFV = profile.currentSavings * Math.pow(1 + scenarioData.returnRate, year);
    const monthlySavingsFV = scenarioData.suggestedMonthlySavings * 12 * ((Math.pow(1 + scenarioData.returnRate, year) - 1) / scenarioData.returnRate);
    return {
      year: `第${year}年`,
      储蓄总额: Math.round((currentSavingsFV + monthlySavingsFV) / 10000),
      目标线: Math.round((profile.currentSavings + calculationResult.totalGap) / 10000),
      仅储蓄: Math.round((profile.currentSavings * Math.pow(1 + scenarioData.returnRate, year)) / 10000),
    };
  });

  const scenarioOptions = [
    { key: 'conservative', label: '保守', rate: '2%', color: 'bg-sky-500', border: 'border-sky-500' },
    { key: 'moderate', label: '中性', rate: '4%', color: 'bg-teal-500', border: 'border-teal-500' },
    { key: 'optimistic', label: '乐观', rate: '6%', color: 'bg-emerald-500', border: 'border-emerald-500' },
  ];

  const totalMonthlyIncome = threePillarsData.reduce((sum, p) => sum + p.value, 0);

  return (
    <div className={`py-8 space-y-8 ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
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
        <div className="card p-6 text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <AlertTriangle size={24} className="text-rose-600" />
          </div>
          <p className="text-teal-500 text-sm mb-1">养老总缺口</p>
          <p className="text-3xl font-bold font-serif text-rose-600">
            <AnimatedNumber value={scenarioData.totalGap} formatter={(v) => formatMoneyShort(v)} />
          </p>
          <p className="text-teal-400 text-xs mt-1">{scenarioOptions.find(s => s.key === scenario)?.rate} 年化收益率</p>
        </div>
        <div className="card p-6 text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <PiggyBank size={24} className="text-gold-600" />
          </div>
          <p className="text-teal-500 text-sm mb-1">建议每月储蓄</p>
          <p className="text-3xl font-bold font-serif text-gold-600">
            <AnimatedNumber value={scenarioData.suggestedMonthlySavings} formatter={(v) => formatMoneyShort(v)} />
          </p>
          <p className="text-teal-400 text-xs mt-1">坚持 {calculationResult.yearsToRetirement} 年</p>
        </div>
        <div className="card p-6 text-center group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <Target size={24} className="text-teal-600" />
          </div>
          <p className="text-teal-500 text-sm mb-1">目标养老生活费</p>
          <p className="text-3xl font-bold font-serif text-teal-700">
            <AnimatedNumber value={calculationResult.targetMonthlyExpense} formatter={(v) => formatMoneyShort(v)} />/月
          </p>
          <p className="text-teal-400 text-xs mt-1">预计 {calculationResult.expectedRetirementYears} 年养老期</p>
        </div>
      </div>

      <div className="flex justify-center gap-3 animate-fade-in-up animate-stagger-2">
        {scenarioOptions.map(opt => (
          <button
            key={opt.key}
            onClick={() => setScenario(opt.key as ScenarioType)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              scenario === opt.key
                ? `${opt.color} text-white shadow-lg scale-105`
                : 'bg-white text-teal-600 border-2 border-teal-200 hover:border-teal-400 hover:shadow-md'
            }`}
          >
            <Sparkles size={14} />
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
          <div className="relative h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={threePillarsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatMoneyShort(value)}`}
                  animationBegin={0}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  onMouseEnter={(_, index) => setActivePillar(threePillarsData[index].name)}
                  onMouseLeave={() => setActivePillar(null)}
                >
                  {threePillarsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke={activePillar === entry.name ? '#fff' : 'transparent'}
                      strokeWidth={activePillar === entry.name ? 3 : 0}
                      style={{ transition: 'all 0.3s ease' }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${formatMoney(value)}/月`, '月领取']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #2dd4bf',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-sm text-teal-500">月合计</p>
              <p className="text-xl font-bold text-teal-800">
                <AnimatedNumber value={totalMonthlyIncome} formatter={(v) => formatMoneyShort(v)} />
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {threePillarsData.map((pillar) => (
              <div 
                key={pillar.name}
                className={`text-center p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  activePillar === pillar.name 
                    ? 'bg-gradient-to-br from-white to-teal-50 shadow-md scale-105' 
                    : 'bg-white/50 hover:bg-white/80'
                }`}
                onMouseEnter={() => setActivePillar(pillar.name)}
                onMouseLeave={() => setActivePillar(null)}
              >
                <p className="text-teal-500 text-xs mb-1">{pillar.name.replace('养老金', '')}</p>
                <p className="font-bold" style={{ color: pillar.color }}>
                  <AnimatedNumber value={pillar.value} formatter={(v) => formatMoneyShort(v)} />
                </p>
                <p className="text-xs text-teal-400 mt-1">
                  累计 {formatMoneyShort(pillar.total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 animate-fade-in-up animate-stagger-4">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-rose-500" />
            缺口构成分析（万元）
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
                <XAxis type="number" stroke="#0d9488" fontSize={11} />
                <YAxis dataKey="label" type="category" stroke="#0d9488" fontSize={11} width={80} />
                <Tooltip 
                  formatter={(value: number) => [`${(value / 10000).toFixed(1)}万元`, '']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #2dd4bf',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 8, 8, 0]} 
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up animate-stagger-5">
        <h3 className="font-serif text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
          <TrendingDown size={20} className="text-gold-500" />
          资金流向漏斗图
        </h3>
        <div className="flex justify-center">
          <FunnelChart data={funnelData} maxWidth={550} />
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up animate-stagger-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl font-bold text-teal-800 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            储蓄增长曲线（万元）
          </h3>
          <div className="flex items-center gap-2 text-sm text-teal-500">
            <Info size={16} />
            <span>基于 {scenarioOptions.find(s => s.key === scenario)?.rate} 年化收益率</span>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={savingsProjectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
              <XAxis dataKey="year" stroke="#0d9488" fontSize={10} />
              <YAxis stroke="#0d9488" fontSize={11} />
              <Tooltip 
                formatter={(value: number) => [`${value}万元`, '']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #2dd4bf',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="储蓄总额"
                stroke="#0d9488"
                strokeWidth={2}
                fill="url(#colorPv)"
                animationBegin={0}
                animationDuration={2000}
              />
              <Line
                type="monotone"
                dataKey="储蓄总额"
                stroke="#0d9488"
                strokeWidth={3}
                dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 8, fill: '#0d9488', strokeWidth: 2 }}
                animationBegin={0}
                animationDuration={2000}
              />
              <Line
                type="monotone"
                dataKey="目标线"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                animationBegin={500}
                animationDuration={2000}
              />
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-teal-50 rounded-xl">
            <p className="text-xs text-teal-500">当前储蓄</p>
            <p className="font-bold text-teal-800">{formatMoneyShort(profile.currentSavings)}</p>
          </div>
          <div className="p-3 bg-gold-50 rounded-xl">
            <p className="text-xs text-teal-500">预期总储蓄</p>
            <p className="font-bold text-gold-700">
              <AnimatedNumber 
                value={savingsProjectionData[savingsProjectionData.length - 1]?.储蓄总额 * 10000 || 0} 
                formatter={(v) => formatMoneyShort(v)} 
              />
            </p>
          </div>
          <div className="p-3 bg-rose-50 rounded-xl">
            <p className="text-xs text-teal-500">目标金额</p>
            <p className="font-bold text-rose-700">{formatMoneyShort(profile.currentSavings + calculationResult.totalGap)}</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-gradient-to-br from-teal-50 to-gold-50 animate-fade-in-up animate-stagger-7">
        <h3 className="font-serif text-xl font-bold text-teal-800 mb-4">💡 AI 规划建议</h3>
        <div className="space-y-4 text-teal-700">
          <div className="flex gap-3 p-3 bg-white/70 rounded-xl hover:bg-white/80 transition-colors duration-300">
            <span className="text-2xl flex-shrink-0">1️⃣</span>
            <div>
              <p className="font-semibold text-teal-800">每月坚持储蓄</p>
              <p className="text-sm">建议每月存入 <span className="font-bold text-gold-600">{formatMoney(scenarioData.suggestedMonthlySavings)}</span>，占月收入约 {formatPercent(scenarioData.suggestedMonthlySavings / profile.monthlyIncome, 0)}。可设置自动定投，强制储蓄。</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-white/70 rounded-xl hover:bg-white/80 transition-colors duration-300">
            <span className="text-2xl flex-shrink-0">2️⃣</span>
            <div>
              <p className="font-semibold text-teal-800">合理配置资产</p>
              <p className="text-sm">年轻时期可配置更多权益类资产，临近退休逐步转向稳健型。建议长期年化收益率目标 {scenarioOptions.find(s => s.key === scenario)?.rate}。</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-white/70 rounded-xl hover:bg-white/80 transition-colors duration-300">
            <span className="text-2xl flex-shrink-0">3️⃣</span>
            <div>
              <p className="font-semibold text-teal-800">充分利用税优政策</p>
              <p className="text-sm">每年缴纳个人养老金 12000 元，可享受个税抵扣，同时增加养老储备。</p>
            </div>
          </div>
          <div className="flex gap-3 p-3 bg-white/70 rounded-xl hover:bg-white/80 transition-colors duration-300">
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
