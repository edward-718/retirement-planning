import { CITY_LIST } from '@/data/cities';
import type { CityData } from '@/types';
import { formatMoney } from '@/utils/format';
import { MapPin, Star, Home, Heart, Thermometer, Users, Bus, ArrowLeft, Plus, X, ChevronDown, Sparkles, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

type SortKey = 'costOfLiving' | 'healthcare' | 'climate' | 'socialSupport' | 'transportation' | 'total';

export default function CitiesPage() {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('climate');
  const [showCompare, setShowCompare] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

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

  const toggleFavorite = (cityId: string) => {
    setFavorites(prev => 
      prev.includes(cityId) ? prev.filter(id => id !== cityId) : [...prev, cityId]
    );
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

  const avgCost = CITY_LIST.reduce((sum, c) => sum + c.costDetails.total.comfortable, 0) / CITY_LIST.length;

  if (selectedCity) {
    const isFavorite = favorites.includes(selectedCity.id);
    const totalScore = Object.values(selectedCity.scores).reduce((sum, s) => sum + s, 0) / 5;
    const costDiff = selectedCity.costDetails.total.comfortable - avgCost;

    return (
      <div className="py-8 animate-fade-in">
        <button
          onClick={() => setSelectedCity(null)}
          className="flex items-center gap-2 text-teal-600 hover:text-teal-800 mb-6 transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>返回城市列表</span>
        </button>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card overflow-hidden group">
            <div className="relative overflow-hidden">
              <img
                src={selectedCity.image}
                alt={selectedCity.name}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => toggleFavorite(selectedCity.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
                    isFavorite 
                      ? 'bg-rose-500 text-white shadow-lg' 
                      : 'bg-white/20 text-white hover:bg-white/40'
                  }`}
                >
                  <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={24} className="text-teal-400" />
                  <h2 className="font-serif text-4xl font-bold text-white">{selectedCity.name}</h2>
                </div>
                <p className="text-white/80 text-lg">{selectedCity.province}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Star size={16} className="text-gold-400 fill-current" />
                    <span className="text-white font-bold">{totalScore.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <Sparkles size={16} className="text-teal-400" />
                    <span className="text-white text-sm">{scoreLabels.find(s => s.key === sortKey)?.label || '综合评分'}排名 {sortedCities.findIndex(c => c.id === selectedCity.id) + 1}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {selectedCity.highlights.map(h => (
                  <span key={h} className="px-4 py-2 bg-gradient-to-r from-teal-50 to-gold-50 text-teal-700 rounded-full text-sm font-medium">
                    ✨ {h}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-teal-800">五维评分</h3>
              <div className="flex items-center gap-1 text-sm text-teal-500">
                <Info size={14} />
                <span>点击查看详情</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData(selectedCity)}>
                  <PolarGrid stroke="#5eead4" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#0d9488', fontSize: 12, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#99f6e4', fontSize: 10 }} />
                  <Radar
                    name={selectedCity.name}
                    dataKey="value"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fill="#14b8a6"
                    fillOpacity={0.3}
                    animationBegin={0}
                    animationDuration={1500}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {scoreLabels.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="text-center p-2 bg-white/50 rounded-xl hover:bg-white/80 transition-colors cursor-pointer">
                    <Icon size={16} style={{ color: item.color }} className="mx-auto mb-1" />
                    <p className="text-xs text-teal-600">{item.label}</p>
                    <p className="text-sm font-bold" style={{ color: item.color }}>
                      {selectedCity.scores[item.key as keyof typeof selectedCity.scores]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card p-6 mt-6">
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-6">生活成本明细（元/月）</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {(['basic', 'comfortable', 'luxury'] as const).map(level => (
              <div key={level} className="p-5 bg-gradient-to-br from-teal-50 to-gold-50 rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-teal-800">
                    {level === 'basic' ? '简朴生活' : level === 'comfortable' ? '舒适生活' : '品质生活'}
                  </h4>
                  {level === 'comfortable' && (
                    <span className="px-2 py-1 bg-gold-100 text-gold-700 text-xs rounded-full">推荐</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-teal-600">房租</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.rent[level])}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-teal-600">餐饮</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.food)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-teal-600">交通</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.transportation)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-teal-600">水电物业</span>
                    <span className="font-medium text-teal-800">{formatMoney(selectedCity.costDetails.utilities)}</span>
                  </div>
                  <div className="border-t border-teal-200 pt-3 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-teal-800">合计</span>
                      <div className="text-right">
                        <span className="font-bold text-gold-600 text-lg">{formatMoney(selectedCity.costDetails.total[level])}</span>
                        {level === 'comfortable' && (
                          <div className={`flex items-center gap-1 text-xs mt-1 ${costDiff < 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                            {costDiff < 0 ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                            <span>比平均{costDiff < 0 ? '低' : '高'} {formatMoney(Math.abs(costDiff))}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={() => toggleFavorite(selectedCity.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              isFavorite 
                ? 'bg-rose-500 text-white hover:bg-rose-600' 
                : 'bg-white text-rose-500 border-2 border-rose-300 hover:border-rose-500'
            }`}
          >
            <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
            {isFavorite ? '已收藏' : '收藏城市'}
          </button>
          <button
            onClick={() => toggleCompare(selectedCity.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              compareList.includes(selectedCity.id)
                ? 'bg-teal-600 text-white hover:bg-teal-700'
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
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
        <div className="card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl font-bold text-teal-800">城市对比</h3>
            <button
              onClick={() => setShowCompare(false)}
              className="text-teal-500 hover:text-teal-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareBarData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccfbf1" />
                <XAxis dataKey="name" stroke="#0d9488" fontSize={12} />
                <YAxis stroke="#0d9488" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #2dd4bf',
                    borderRadius: '12px',
                    padding: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                {compareCities.map((city, idx) => (
                  <Bar 
                    key={city.id} 
                    dataKey={city.name} 
                    fill={barColors[idx]} 
                    radius={[4, 4, 0, 0]}
                    animationBegin={idx * 200}
                    animationDuration={1000}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-2 mt-4">
            {compareCities.map((city, idx) => (
              <button
                key={city.id}
                onClick={() => toggleCompare(city.id)}
                className="px-3 py-1 rounded-full text-sm transition-all"
                style={{ backgroundColor: `${barColors[idx]}20`, color: barColors[idx] }}
              >
                {city.name} <X size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {sortedCities.map((city, index) => {
          const totalScore = Object.values(city.scores).reduce((sum, s) => sum + s, 0) / 5;
          const isInCompare = compareList.includes(city.id);
          const isFavorite = favorites.includes(city.id);
          const isHovered = hoveredCity === city.id;

          return (
            <div
              key={city.id}
              className="card overflow-hidden cursor-pointer group animate-fade-in-up transition-all duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedCity(city)}
              onMouseEnter={() => setHoveredCity(city.id)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              <div className="relative overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-44 object-cover transition-transform duration-700"
                  style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60" />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(city.id);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
                      isFavorite 
                        ? 'bg-rose-500 text-white shadow-lg' 
                        : 'bg-white/80 text-teal-600 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCompare(city.id);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
                      isInCompare
                        ? 'bg-gold-500 text-white shadow-lg'
                        : 'bg-white/80 text-teal-600 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Plus size={16} className={isInCompare ? 'rotate-45' : ''} />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-white">{city.name}</h3>
                    <span className="text-white/70 text-sm">{city.province}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <Star size={12} className="text-gold-400 fill-current" />
                      <span className="text-white text-sm font-bold">{totalScore.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {scoreLabels.slice(0, 3).map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.key} className="flex items-center gap-2 text-xs">
                        <Icon size={12} style={{ color: item.color }} />
                        <span className="text-teal-600 w-14">{item.label}</span>
                        <div className="flex-1 h-1.5 bg-teal-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${city.scores[item.key as keyof typeof city.scores]}%`, 
                              backgroundColor: item.color 
                            }}
                          />
                        </div>
                        <span className="text-teal-500 w-6 text-right">{city.scores[item.key as keyof typeof city.scores]}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-teal-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-teal-500">舒适生活成本</p>
                    <p className="font-semibold text-teal-800">{formatMoney(city.costDetails.total.comfortable)}/月</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
