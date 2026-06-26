import { useStore } from '@/store/useStore';
import { useNavigate } from 'react-router-dom';
import { CITY_LIST } from '@/data/cities';
import { LIFESTYLE_LABELS } from '@/data/constants';
import { formatMoneyShort } from '@/utils/format';
import { Calculator, Clock, Sparkles, ChevronRight, ChevronLeft, Zap, FileText, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { CalculatorMode, UserProfile } from '@/types';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const { profile, calculatorMode, setProfile, setCalculatorMode, calculate } = useStore();
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const validateField = (key: keyof UserProfile, value: any): string | null => {
    switch (key) {
      case 'age':
        if (!value || value < 18 || value > 80) return '年龄需在 18-80 岁之间';
        if (localProfile.expectedRetirementAge && value >= localProfile.expectedRetirementAge) return '年龄应小于退休年龄';
        break;
      case 'expectedRetirementAge':
        if (!value || value < 50 || value > 70) return '退休年龄需在 50-70 岁之间';
        if (localProfile.age && value <= localProfile.age) return '退休年龄应大于当前年龄';
        break;
      case 'monthlyIncome':
        if (!value || value < 1000) return '月收入需大于 1000 元';
        if (value > 1000000) return '月收入不能超过 100 万元';
        break;
      case 'currentSavings':
        if (value < 0) return '存款不能为负数';
        break;
      case 'socialInsuranceYears':
        if (localProfile.age && value > localProfile.age - 22) return '社保年限不能超过实际工作年限';
        break;
      case 'socialInsuranceBase':
        if (value && (value < 3000 || value > 50000)) return '社保基数需在 3000-50000 元之间';
        break;
    }
    return null;
  };

  const handleChange = (key: keyof UserProfile, value: any) => {
    setLocalProfile(prev => ({ ...prev, [key]: value }));
    if (touched[key]) {
      const error = validateField(key, value);
      setErrors(prev => ({ ...prev, [key]: error || '' }));
    }
  };

  const handleBlur = (key: keyof UserProfile) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    const error = validateField(key, localProfile[key]);
    setErrors(prev => ({ ...prev, [key]: error || '' }));
  };

  const validateStep = (): boolean => {
    const stepFields = currentFields.map(f => f.key as keyof UserProfile);
    const newErrors: Record<string, string> = {};
    let isValid = true;

    stepFields.forEach(key => {
      const error = validateField(key, localProfile[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(stepFields.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (!validateStep()) return;
    setProfile(localProfile);
    setIsCalculating(true);
    setTimeout(() => {
      calculate();
      setIsCalculating(false);
      navigate('/blueprint');
    }, 800);
  };

  const stepConfig = [
    { step: 1, title: '基本信息', description: '年龄和所在城市' },
    { step: 2, title: '财务状况', description: '收入和储蓄' },
    { step: 3, title: '养老规划', description: '目标城市和退休计划' },
  ];

  const simpleSteps = [
    [
      { key: 'age', label: '当前年龄', type: 'number', placeholder: '30', suffix: '岁' },
      { key: 'currentCity', label: '当前所在城市', type: 'select', options: CITY_LIST.map(c => ({ value: c.id, label: c.name })) },
    ],
    [
      { key: 'monthlyIncome', label: '月收入', type: 'number', placeholder: '15000', suffix: '元' },
      { key: 'currentSavings', label: '现有存款', type: 'number', placeholder: '200000', suffix: '元' },
    ],
    [
      { key: 'targetCity', label: '目标养老城市', type: 'select', options: CITY_LIST.map(c => ({ value: c.id, label: c.name })) },
      { key: 'expectedRetirementAge', label: '预期退休年龄', type: 'number', placeholder: '60', suffix: '岁' },
    ],
  ];

  const standardSteps = [
    [
      { key: 'age', label: '当前年龄', type: 'number', placeholder: '30', suffix: '岁' },
      { key: 'currentCity', label: '当前所在城市', type: 'select', options: CITY_LIST.map(c => ({ value: c.id, label: c.name })) },
    ],
    [
      { key: 'monthlyIncome', label: '月收入', type: 'number', placeholder: '15000', suffix: '元' },
      { key: 'currentSavings', label: '现有存款', type: 'number', placeholder: '200000', suffix: '元' },
    ],
    [
      { key: 'targetCity', label: '目标养老城市', type: 'select', options: CITY_LIST.map(c => ({ value: c.id, label: c.name })) },
      { key: 'expectedRetirementAge', label: '预期退休年龄', type: 'number', placeholder: '60', suffix: '岁' },
      { key: 'socialInsuranceYears', label: '社保已缴年限', type: 'number', placeholder: '8', suffix: '年' },
    ],
    [
      { key: 'socialInsuranceBase', label: '社保缴费基数', type: 'number', placeholder: '10000', suffix: '元/月' },
      { key: 'lifestyleLevel', label: '养老生活方式', type: 'select', options: [
        { value: 'basic', label: LIFESTYLE_LABELS.basic },
        { value: 'comfortable', label: LIFESTYLE_LABELS.comfortable },
        { value: 'luxury', label: LIFESTYLE_LABELS.luxury },
      ]},
    ],
  ];

  const totalSteps = calculatorMode === 'simple' ? 3 : 4;
  const currentFields = calculatorMode === 'simple' 
    ? simpleSteps[currentStep - 1] 
    : standardSteps[currentStep - 1];

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
          onClick={() => { setCalculatorMode('simple'); setCurrentStep(1); }}
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
          onClick={() => { setCalculatorMode('standard'); setCurrentStep(1); }}
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

      <div className="mb-8 animate-fade-in-up animate-stagger-2">
        <div className="flex items-center justify-between mb-4">
          {stepConfig.slice(0, totalSteps).map((step, index) => (
            <div key={step.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep > step.step
                    ? 'bg-emerald-500 text-white'
                    : currentStep === step.step
                    ? 'bg-teal-600 text-white shadow-lg scale-110'
                    : 'bg-teal-100 text-teal-500'
                }`}>
                  {currentStep > step.step ? <Check size={20} /> : step.step}
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  currentStep >= step.step ? 'text-teal-700' : 'text-teal-400'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < totalSteps - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                  currentStep > step.step ? 'bg-emerald-500' : 'bg-teal-100'
                }`} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-teal-500 text-sm">
          {stepConfig[Math.min(currentStep - 1, stepConfig.length - 1)].description}
        </p>
      </div>

      <div className="card p-6 md:p-8 animate-fade-in-up animate-stagger-3">
        <div className="space-y-6 min-h-[240px]">
          {currentFields.map((field) => {
            const error = errors[field.key];
            const hasError = error && touched[field.key];
            return (
              <div key={field.key} className="animate-fade-in">
                <label className="label-text">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={localProfile[field.key as keyof UserProfile] as string}
                    onChange={(e) => handleChange(field.key as keyof UserProfile, e.target.value)}
                    onBlur={() => handleBlur(field.key as keyof UserProfile)}
                    className={`select-field ${hasError ? 'border-rose-500 focus:border-rose-500' : ''}`}
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
                      onBlur={() => handleBlur(field.key as keyof UserProfile)}
                      placeholder={field.placeholder}
                      className={`input-field pr-16 ${hasError ? 'border-rose-500 focus:border-rose-500' : ''}`}
                    />
                    <span className="absolute right-12 top-1/2 -translate-y-1/2 text-teal-400 text-sm">
                      {field.suffix}
                    </span>
                  </div>
                )}
                {hasError && (
                  <p className="text-rose-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 mt-8">
          {currentStep > 1 && (
            <button
              onClick={handlePrev}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              上一步
            </button>
          )}
          <div className="flex-1" />
          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2"
            >
              下一步
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCalculating}
              className={`btn-gold flex items-center gap-2 ${isCalculating ? 'opacity-75' : ''}`}
            >
              {isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  生成养老蓝图
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {calculatorMode === 'simple' && (
        <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100 animate-fade-in-up">
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
    </div>
  );
}
