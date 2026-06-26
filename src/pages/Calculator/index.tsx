import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { CITY_LIST } from '@/data/cities';
import { LIFESTYLE_LABELS } from '@/data/constants';
import { formatMoney, formatMoneyShort } from '@/utils/format';
import { Calculator, Clock, Sparkles, ChevronRight, Zap, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CalculatorMode, UserProfile } from '@/types';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const { profile, calculatorMode, setProfile, setCalculatorMode, calculate, calculationResult } = useStore();
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const handleChange = (key: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    setProfile(localProfile);
    setTimeout(() => {
      calculate();
      navigate('/blueprint');
    }, 100);
  };

  const simpleFields = [
    { key: 'age', label: '当前年龄', type: 'number', placeholder: '30', suffix: '岁' },
    { key: 'currentCity', label: '当前所在城市', type: 'select', options: CITY_LIST.map(c => ({ value: c.id, label: c.name })) },
    { key: 'monthlyIncome', label: '月收入', type: 'number', placeholder: '15000', suffix: '元' },
    { key: 'currentSavings', label: '现有存款', type: 'number', placeholder: '200000', suffix: '元' },
    { key: 'targetCity', label: '目标养老城市', type: 'select', options: CITY_LIST.map(c => ({ value: c.id, label: c.name })) },
    { key: 'expectedRetirementAge', label: '预期退休年龄', type: 'number', placeholder: '60', suffix: '岁' },
  ];

  const standardExtraFields = [
    { key: 'socialInsuranceYears', label: '社保已缴年限', type: 'number', placeholder: '8', suffix: '年' },
    { key: 'socialInsuranceBase', label: '社保缴费基数', type: 'number', placeholder: '10000', suffix: '元/月' },
    { key: 'lifestyleLevel', label: '养老生活方式', type: 'select', options: [
      { value: 'basic', label: LIFESTYLE_LABELS.basic },
      { value: 'comfortable', label: LIFESTYLE_LABELS.comfortable },
      { value: 'luxury', label: LIFESTYLE_LABELS.luxury },
    ]},
  ];

  const allFields = calculatorMode === 'simple' ? simpleFields : [...simpleFields, ...standardExtraFields];

  return (
    <div className="py-8 max-w-3xl mx-auto">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4">
          <Calculator size={32} className="text-white" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-teal-900 mb-3">
          养老金测算器
        </h1>
        <p className="text-teal-600">
          输入你的基本信息，AI 智能生成专属养老规划
        </p>
      </div>

      <div className="flex gap-4 mb-8 animate-fade-in-up animate-stagger-1">
        <button
          onClick={() => setCalculatorMode('simple')}
          className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 ${
            calculatorMode === 'simple'
              ? 'border-teal-600 bg-teal-50 shadow-lg'
              : 'border-teal-100 bg-white hover:border-teal-300'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            calculatorMode === 'simple' ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-600'
          }`}>
            <Zap size={20} />
          </div>
          <div className="text-left">
            <p className={`font-semibold ${calculatorMode === 'simple' ? 'text-teal-800' : 'text-teal-600'}`}>
              极简模式
            </p>
            <p className="text-xs text-teal-500 flex items-center gap-1">
              <Clock size={12} /> 约30秒 · 6项输入
            </p>
          </div>
        </button>

        <button
          onClick={() => setCalculatorMode('standard')}
          className={`flex-1 p-4 rounded-2xl border-2 transition-all duration-300 flex items-center gap-3 ${
            calculatorMode === 'standard'
              ? 'border-gold-500 bg-gold-50 shadow-lg'
              : 'border-teal-100 bg-white hover:border-gold-300'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            calculatorMode === 'standard' ? 'bg-gold-500 text-white' : 'bg-gold-100 text-gold-600'
          }`}>
            <FileText size={20} />
          </div>
          <div className="text-left">
            <p className={`font-semibold ${calculatorMode === 'standard' ? 'text-gold-800' : 'text-teal-600'}`}>
              标准模式
            </p>
            <p className="text-xs text-teal-500 flex items-center gap-1">
              <Clock size={12} /> 约2分钟 · 更精准
            </p>
          </div>
        </button>
      </div>

      <div className="card p-6 md:p-8 animate-fade-in-up animate-stagger-2">
        <div className="space-y-6">
          {allFields.map((field, index) => (
            <div key={field.key} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <label className="label-text">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  value={localProfile[field.key as keyof UserProfile] as string}
                  onChange={(e) => handleChange(field.key as keyof UserProfile, e.target.value)}
                  className="select-field"
                >
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={localProfile[field.key as keyof UserProfile] as number || ''}
                    onChange={(e) => handleChange(field.key as keyof UserProfile, Number(e.target.value))}
                    placeholder={field.placeholder}
                    className="input-field pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400 text-sm">
                    {field.suffix}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {calculatorMode === 'simple' && (
          <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
            <p className="text-sm text-teal-700 flex items-start gap-2">
              <Sparkles size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
              <span>
                极简模式下，缺失数据由 AI 基于城市平均值估算。
                <br />
                切换到<span className="font-semibold text-gold-600">标准模式</span>可获得更精准的结果。
              </span>
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full mt-8 btn-primary text-lg py-4 flex items-center justify-center gap-2 group"
        >
          <span>生成养老蓝图</span>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {calculationResult && (
        <div className="card p-6 mt-6 animate-slide-in-right">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-4">实时预估</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-teal-50 rounded-xl">
              <p className="text-teal-500 text-sm mb-1">预计缺口</p>
              <p className="text-xl font-bold text-rose-600">{formatMoneyShort(calculationResult.totalGap)}</p>
            </div>
            <div className="text-center p-4 bg-gold-50 rounded-xl">
              <p className="text-teal-500 text-sm mb-1">建议月存</p>
              <p className="text-xl font-bold text-gold-600">{formatMoneyShort(calculationResult.suggestedMonthlySavings)}</p>
            </div>
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-teal-500 text-sm mb-1">社保月领</p>
              <p className="text-xl font-bold text-emerald-600">{formatMoneyShort(calculationResult.threePillars.socialSecurity.monthlyAmount)}</p>
            </div>
            <div className="text-center p-4 bg-sky-50 rounded-xl">
              <p className="text-teal-500 text-sm mb-1">距退休</p>
              <p className="text-xl font-bold text-sky-600">{calculationResult.yearsToRetirement}年</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
