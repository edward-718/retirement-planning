import { useStore } from '@/store/useStore';
import { formatMoneyShort } from '@/utils/format';
import { Target, CheckCircle, Clock, BookOpen, MapPin, PiggyBank, Trophy, Star, Flame, Zap, Medal, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export default function Progress() {
  const { progress, updateTaskProgress, completeTask } = useStore();
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'achievements'>('milestones');
  const [celebratingTask, setCelebratingTask] = useState<string | null>(null);
  const [celebratingMilestone, setCelebratingMilestone] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const taskTypeConfig = {
    savings: { icon: PiggyBank, label: '储蓄任务', color: 'bg-gold-100 text-gold-700', gradient: 'from-gold-500 to-amber-600' },
    knowledge: { icon: BookOpen, label: '知识任务', color: 'bg-teal-100 text-teal-700', gradient: 'from-teal-500 to-emerald-600' },
    exploration: { icon: MapPin, label: '探索任务', color: 'bg-sky-100 text-sky-700', gradient: 'from-sky-500 to-blue-600' },
  };

  const handleCompleteTask = (taskId: string) => {
    const task = progress.tasks.find(t => t.id === taskId);
    if (task && task.progress < 100) {
      setCelebratingTask(taskId);
      setShowConfetti(true);
      setTimeout(() => {
        completeTask(taskId);
        setCelebratingTask(null);
        setTimeout(() => setShowConfetti(false), 1500);
      }, 300);
    }
  };

  const completedTasks = progress.tasks.filter(t => t.progress === 100);
  const totalReward = completedTasks.reduce((sum, t) => sum + t.reward, 0);

  return (
    <div className="py-8 space-y-8 relative overflow-hidden">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: ['#f59e0b', '#0d9488', '#10b981', '#8b5cf6', '#e11d48'][i % 5],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${Math.random() * 1 + 1}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Target size={32} className="text-white" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-teal-900 mb-2">
          进度追踪 🎯
        </h1>
        <p className="text-teal-600">
          每一步都算数，看着目标一步步实现
        </p>
      </div>

      <div className="card p-6 animate-fade-in-up animate-stagger-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-teal-500 text-sm">总体进度</p>
            <p className="text-4xl font-bold font-serif text-teal-800">
              <AnimatedNumber value={progress.progressPercentage} formatter={(v) => v.toFixed(1)} />%
            </p>
            <p className="text-teal-600 text-sm mt-1">
              {formatMoneyShort(progress.currentSavings)} / {formatMoneyShort(progress.totalTarget)}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center p-3 bg-gold-50 rounded-xl">
              <p className="text-2xl font-bold text-gold-600 flex items-center justify-center gap-1">
                <Medal size={20} />
                {progress.milestones.filter(m => m.status === 'completed').length}
              </p>
              <p className="text-xs text-teal-500 mt-1">已完成里程碑</p>
            </div>
            <div className="text-center p-3 bg-teal-50 rounded-xl">
              <p className="text-2xl font-bold text-teal-600 flex items-center justify-center gap-1">
                <Trophy size={20} />
                {progress.achievements.filter(a => a.unlocked).length}/{progress.achievements.length}
              </p>
              <p className="text-xs text-teal-500 mt-1">已解锁成就</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-xl">
              <p className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-1">
                <Award size={20} />
                {completedTasks.length}/{progress.tasks.length}
              </p>
              <p className="text-xs text-teal-500 mt-1">已完成任务</p>
            </div>
          </div>
        </div>
        <div className="w-full h-4 bg-teal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-gold-500 rounded-full transition-all duration-1000 relative"
            style={{ width: `${progress.progressPercentage}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent" />
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-teal-500">
          <span>开始</span>
          <span className="flex items-center gap-1">
            <Flame size={12} className="text-gold-500" />
            累计获得 {totalReward} 积分
          </span>
          <span>目标</span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-teal-200 animate-fade-in-up animate-stagger-2">
        {[
          { key: 'milestones', label: '里程碑', icon: Target },
          { key: 'tasks', label: '任务', icon: CheckCircle },
          { key: 'achievements', label: '成就墙', icon: Trophy },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 -mb-px relative group ${
              activeTab === tab.key
                ? 'text-teal-700 border-teal-600'
                : 'text-teal-500 border-transparent hover:text-teal-700'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'milestones' && (
        <div className="space-y-4 animate-fade-in-up">
          {progress.milestones.map((milestone, index) => {
            const percent = Math.min(100, (milestone.currentAmount / milestone.targetAmount) * 100);
            const isCelebrating = celebratingMilestone === milestone.id;
            return (
              <div
                key={milestone.id}
                className={`card p-5 relative overflow-hidden transition-all duration-300 ${
                  milestone.status === 'completed' ? 'opacity-90' : ''
                } ${isCelebrating ? 'animate-bounce-in scale-105' : ''} ${
                  milestone.status === 'completed' ? 'ring-2 ring-gold-400 ring-offset-2' : ''
                }`}
              >
                {/* 里程碑完成金色流光扫描 */}
                {milestone.status === 'completed' && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-200/40 to-transparent animate-shimmer" />
                  </div>
                )}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 to-gold-500" />
                <div className="flex items-start justify-between ml-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {milestone.status === 'completed' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg animate-bounce-in">
                          <CheckCircle size={20} className="text-white" />
                        </div>
                      ) : milestone.status === 'in_progress' ? (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center animate-pulse shadow-lg">
                          <Clock size={20} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center border-2 border-teal-200">
                          <span className="text-teal-600 font-bold">{index + 1}</span>
                        </div>
                      )}
                      <div>
                        <h3 className={`font-serif text-lg font-bold ${
                          milestone.status === 'completed' ? 'text-teal-600 line-through' : 'text-teal-800'
                        }`}>
                          {milestone.title}
                        </h3>
                        {milestone.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full mt-1">
                            <Zap size={10} /> 已达成
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-teal-500 text-sm ml-14">
                      目标 {formatMoneyShort(milestone.targetAmount)} · 截止 {milestone.deadline}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-700">
                      <AnimatedNumber value={percent} formatter={(v) => v.toFixed(0)} />%
                    </p>
                    <p className="text-xs text-teal-400">
                      {formatMoneyShort(milestone.currentAmount)} / {formatMoneyShort(milestone.targetAmount)}
                    </p>
                  </div>
                </div>
                <div className="ml-14 mt-4">
                  <div className="w-full h-3 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 relative ${
                        milestone.status === 'completed'
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          : milestone.status === 'in_progress'
                          ? 'bg-gradient-to-r from-teal-500 to-gold-500'
                          : 'bg-teal-200'
                      }`}
                      style={{ width: `${percent}%` }}
                    >
                      {milestone.status === 'in_progress' && (
                        <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/30 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up">
          {progress.tasks.map(task => {
            const config = taskTypeConfig[task.type];
            const Icon = config.icon;
            const isCelebrating = celebratingTask === task.id;
            return (
              <div 
                key={task.id} 
                className={`card p-5 transition-all duration-300 ${
                  isCelebrating ? 'animate-bounce-in scale-105' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-teal-800">{task.title}</h3>
                      <p className="text-xs text-teal-500">{config.label} · 截止 {task.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-gold-100 px-2 py-1 rounded-full">
                    <Star size={14} fill="#f59e0b" className="text-gold-500" />
                    <span className="text-sm font-medium text-gold-700">{task.reward}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 relative ${
                        task.progress === 100
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                          : 'bg-gradient-to-r from-teal-500 to-teal-600'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    >
                      {task.progress < 100 && (
                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 rounded-full" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-teal-700 w-14 text-right">
                    <AnimatedNumber value={task.progress} formatter={(v) => `${v}%`} />
                  </span>
                </div>
                {task.progress < 100 && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateTaskProgress(task.id, Math.min(100, task.progress + 25))}
                      className="flex-1 py-2 text-sm bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-all hover:scale-105 active:scale-95"
                    >
                      +25%
                    </button>
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="flex-1 py-2 text-sm bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all hover:scale-105 active:scale-95 shadow-md"
                    >
                      标记完成
                    </button>
                  </div>
                )}
                {task.progress === 100 && (
                  <div className="mt-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-center rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    已完成 · +{task.reward} 积分
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'achievements' && (
        <>
          {/* 成就解锁仪式感动画 */}
          {progress.achievements.map((achievement) => (
            achievement.unlocked && achievement.unlockedAt && (
              <div key={`ceremony-${achievement.id}`} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none animate-fade-in">
                <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-gold-300 text-center animate-bounce-in">
                  <div className="text-6xl mb-4">{achievement.icon}</div>
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-lg ring-4 ring-gold-200">
                    <Trophy size={32} className="text-white" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-teal-800 mb-1">{achievement.title}</h3>
                  <p className="text-teal-500 text-sm">{achievement.description}</p>
                  <p className="text-gold-600 text-xs mt-2 flex items-center justify-center gap-1">
                    <Award size={12} /> {achievement.unlockedAt} 解锁
                  </p>
                </div>
              </div>
            )
          ))}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
            {progress.achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`card p-5 text-center transition-all duration-300 hover:scale-105 ${
                  achievement.unlocked ? '' : 'opacity-40 grayscale hover:opacity-60'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`text-5xl mb-3 transition-transform ${achievement.unlocked ? 'animate-bounce-in' : ''}`}>
                  {achievement.icon}
                </div>
                <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-gold-100 to-amber-100' 
                    : 'bg-gray-100'
                }`}>
                  <Trophy size={24} className={achievement.unlocked ? 'text-gold-600' : 'text-gray-400'} />
                </div>
                <h3 className="font-semibold text-teal-800 mb-1">{achievement.title}</h3>
                <p className="text-xs text-teal-500">{achievement.description}</p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="mt-2 pt-2 border-t border-teal-100">
                    <p className="text-xs text-gold-600 flex items-center justify-center gap-1">
                      <Award size={10} />
                      {achievement.unlockedAt} 解锁
                    </p>
                  </div>
                )}
                {!achievement.unlocked && (
                  <div className="mt-2 pt-2 border-t border-teal-100">
                    <p className="text-xs text-gray-400">继续努力...</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'tasks' && completedTasks.length === progress.tasks.length && progress.tasks.length > 0 && (
        <div className="card p-6 bg-gradient-to-br from-gold-50 to-amber-50 animate-fade-in-up text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="font-serif text-xl font-bold text-teal-800 mb-2">恭喜！所有任务已完成</h3>
          <p className="text-teal-600">继续保持，离目标更近一步</p>
        </div>
      )}
    </div>
  );
}
