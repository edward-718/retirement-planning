import { CITY_LIST } from '@/data/cities';
import type { CityData } from '@/types';
import { formatMoney } from '@/utils/format';
import { MapPin, Star, Home, Heart, Thermometer, Users, Bus, ArrowLeft, Plus, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type SortKey = 'costOfLiving' | 'healthcare' | 'climate' | 'socialSupport' | 'transportation' | 'total';

export default function CitiesPage() {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('climate');
  const [showCompare, setShowCompare] = useState(false);

  const sortedCities = [...CITY_LIST].sort((a, b) => {
    if (sortKey === 'total') {
      const aTotal = Object.values(a.scores).reduce((sum, s) => sum + s, 0);
      const bTotal = Object.values(b.scores).reduce((sum, s) => sum + s, 0);
      return bTotal - aTotal;
    }
    return b.scores[sortKey] - a.scores[sortKey];
  });

  const scoreLabels = [
    { key: 'costOfLiving', label: '生活成本', icon: Home, color: '#f59e0b' },
    { key: 'healthcare', label: '医疗资源', icon: Heart, color: '#ef4444' },
    { key: 'climate', label: '气候舒适', icon: Thermometer, color: '#10b981' },
    { key: 'socialSupport', label: '社交配套', icon: Users, color: '#8b5cf6' },
    { key: 'transportation', label: '交通便利', icon: Bus, color: '#0ea5e9' },
  ];

  const toggleCompare = (cityId: string) => {
    setCompareList(prev => {
      if (prev.includes(cityId)) {
        return prev.filter(id => id !== cityId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, cityId];
    });
  };

  const compareCities = CITY_LIST.filter(c => compareList.includes(c.id));

  const radarData = (city: CityData) => [
    { subject: '生活成本', value: city.scores.costOfLiving, fullMark: 100 },
    { subject: '医疗资源', value: city.scores.healthcare, fullMark: 100 },
    { subject: '气候舒适', value: city.scores.climate, fullMark: 100 },
    { subject: '社交配套', value: city.scores.socialSupport, fullMark: 100 },
    { subject: '交通便利', value: city.scores.transportation, fullMark: 100 },
  ];

  const compareBarData = [
    { name: '生活成本', ...Object.fromEntries(compareCities.map(c => [c.name, c.scores.costOfLiving])) },
    { name: '医疗资源', ...Object.fromEntries(compareCities.map(c => [c.name, c.scores.healthcare])) },
    { name: '气候舒适', ...Object.fromEntries(compareCities.map(c => [c.name, c.scores.climate])) },
    { name: '社交配套', ...Object.fromEntries(compareCities.map(c => [c.name, c.scores.socialSupport])) },
    { name: '交通便利', ...Object.fromEntries(compareCities.map(c => [c.name, c.scores.transportation])) },
  ];

  const barColors = ['#0d9488', '#f59e0b', '#8b5cf6'];

  if (selectedCity) {
    return (
      <div className="py-8 animate-fade-in">
        <button
          onClick={() => setSelectedCity(null)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-800 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>返回城市列表</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card overflow-hidden">
            <img
              src={selectedCity.image}
              alt={selectedCity.name}
              className="w-full h-56 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={20} className="text-teal-600" />
                <h2 className="font-serif text-3xl font-bold text-teal-800">{selectedCity.name}</h2>
                <span className="text-teal-500">{selectedCity.province}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedCity.highlights.map(h => (
                  <span key={h} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-serif text-xl font-bold text-teal-800 mb-4">五维评分</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData(selectedCity)}>
                  <PolarGrid stroke="#5eead4" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#0d9488', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#99f6e4', fontSize: 10 }} />
                  <Radar
                    name={selectedCity.name}
                    dataKey="value"
                    stroke="#0d9488"
                    fill="#14b8a6"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card p-6 mt-6">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-6">生活成本明细（元/月）</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {(['basic', 'comfortable', 'luxury'] as const).map(level => (
              <div key={level} className="p-5 bg-gradient-to-br from-teal-50 to-gold-50 rounded-2xl">
                <h4 className="font-semibold text-teal-800 mb-4">
                  {level === 'basic' ? '简朴生活' : level === 'comfortable' ? '舒适生活' : '品质生活'}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-teal-600">房租</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.rent[level])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-600">餐饮</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.food)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-600">交通</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.transportation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-600">水电物业</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.utilities)}</span>
                  </div>
                  <div className="border-t border-teal-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-teal-800">合计</span>
                      <span className="font-bold text-gold-600 text-lg">{formatMoney(selectedCity.costDetails.total[level])}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => toggleCompare(selectedCity.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              compareList.includes(selectedCity.id)
                ? 'bg-teal-600 text-white'
                : 'bg-white text-teal-700 border-2 border-teal-300 hover:border-teal-500'
            }`}
          >
            {compareList.includes(selectedCity.id) ? (
              <><X size={18} /> 已加入对比 ({compareList.length}/3)</>
            ) : (
              <><Plus size={18} /> 加入对比</>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center mx-auto mb-4">
          <MapPin size={32} className="text-white" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-teal-900 mb-2">
          养老城市探索 🏙️
        </h1>
        <p className="text-teal-600">
          找到最适合你的理想养老之地
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center animate-fade-in-up animate-stagger-1">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-teal-600 text-sm">排序：</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="select-field max-w-xs"
          >
            <option value="climate">气候舒适度</option>
            <option value="costOfLiving">生活成本</option>
            <option value="healthcare">医疗资源</option>
            <option value="socialSupport">社交配套</option>
            <option value="transportation">交通便利</option>
            <option value="total">综合评分</option>
          </select>
        </div>
        {compareList.length > 0 && (
          <button
            onClick={() => setShowCompare(!showCompare)}
            className="btn-gold flex items-center gap-2"
          >
            <Star size={18} />
            对比城市 ({compareList.length}/3)
            <ChevronDown size={18} className={`transition-transform ${showCompare ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {showCompare && compareCities.length >= 2 && (
        <div className="card p-6 animate-slide-in-right">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-6">城市对比</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
                <XAxis dataKey="name" stroke="#0d9488" fontSize={12} />
                <YAxis stroke="#0d9488" fontSize={12} />
                <Tooltip />
                <Legend />
                {compareCities.map((city, idx) => (
                  <Bar key={city.id} dataKey={city.name} fill={barColors[idx]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedCities.map((city, index) => {
          const totalScore = Object.values(city.scores).reduce((sum, s) => sum + s, 0) / 5;
          const isInCompare = compareList.includes(city.id);
          return (
            <div
              key={city.id}
              className="card overflow-hidden cursor-pointer group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedCity(city)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompare(city.id);
                  }}
                  className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isInCompare
                      ? 'bg-gold-500 text-white'
                      : 'bg-white/80 text-teal-600 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Plus size={18} className={isInCompare ? 'rotate-45' : ''} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-white">{city.name}</h3>
                    <span className="text-white/80 text-sm">{city.province}</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gold-500 font-bold flex items-center gap-1">
                    <Star size={16} fill="currentColor" />
                    {totalScore.toFixed(1)}
                  </span>
                  <span className="text-teal-400 text-sm">综合评分</span>
                </div>
                <div className="space-y-2">
                  {scoreLabels.map(item => (
                    <div key={item.key} className="flex items-center gap-2 text-xs">
                      <item.icon size={12} style={{ color: item.color }} />
                      <span className="text-teal-600 w-14">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-teal-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${city.scores[item.key as keyof typeof city.scores]}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-teal-500 w-6 text-right">{city.scores[item.key as keyof typeof city.scores]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-teal-100">
                  <p className="text-sm text-teal-500">
                    生活成本约 <span className="font-semibold text-teal-800">{formatMoney(city.costDetails.total.comfortable)}/月</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
