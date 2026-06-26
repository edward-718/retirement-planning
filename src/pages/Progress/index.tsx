import { useStore } from '@/store/useStore';
import { formatMoneyShort } from '@/utils/format';
import { Target, CheckCircle, Clock, BookOpen, MapPin, PiggyBank, Trophy, Star } from 'lucide-react';
import { useState } from 'react';

export default function Progress() {
  const { progress, updateTaskProgress, completeTask } = useStore();
  const [activeTab, setActiveTab] = useState<'milestones' | 'tasks' | 'achievements'>('milestones');

  const taskTypeConfig = {
    savings: { icon: PiggyBank, label: '储蓄任务', color: 'bg-gold-100 text-gold-700' },
    knowledge: { icon: BookOpen, label: '知识任务', color: 'bg-teal-100 text-teal-700' },
    exploration: { icon: MapPin, label: '探索任务', color: 'bg-sky-100 text-sky-700' },
  };

  return (
    <div className="py-8 space-y-8">
      <div className="text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mx-auto mb-4">
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
              {progress.progressPercentage.toFixed(1)}%
            </p>
            <p className="text-teal-600 text-sm mt-1">
              {formatMoneyShort(progress.currentSavings)} / {formatMoneyShort(progress.totalTarget)}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-600">{progress.milestones.filter(m => m.status === 'completed').length}</p>
              <p className="text-xs text-teal-500">已完成里程碑</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">{progress.achievements.filter(a => a.unlocked).length}/{progress.achievements.length}</p>
              <p className="text-xs text-teal-500">已解锁成就</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">{progress.tasks.filter(t => t.progress === 100).length}/{progress.tasks.length}</p>
              <p className="text-xs text-teal-500">已完成任务</p>
            </div>
          </div>
        </div>
        <div className="w-full h-4 bg-teal-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-gold-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress.progressPercentage}%` }}
          />
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
            className={`flex items-center gap-2 px-5 py-3 font-medium transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-teal-700 border-teal-600'
                : 'text-teal-500 border-transparent hover:text-teal-700'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'milestones' && (
        <div className="space-y-4 animate-fade-in-up">
          {progress.milestones.map((milestone, index) => {
            const percent = Math.min(100, (milestone.currentAmount / milestone.targetAmount) * 100);
            return (
              <div
                key={milestone.id}
                className={`card p-5 relative overflow-hidden ${
                  milestone.status === 'completed' ? 'opacity-80' : ''
                }`}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 to-gold-500" />
                <div className="flex items-start justify-between ml-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {milestone.status === 'completed' ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                          <CheckCircle size={18} className="text-white" />
                        </div>
                      ) : milestone.status === 'in_progress' ? (
                        <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center animate-pulse">
                          <Clock size={18} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-teal-200 flex items-center justify-center">
                          <span className="text-teal-600 font-bold text-sm">{index + 1}</span>
                        </div>
                      )}
                      <h3 className={`font-serif text-lg font-bold ${
                        milestone.status === 'completed' ? 'text-teal-600 line-through' : 'text-teal-800'
                      }`}>
                        {milestone.title}
                      </h3>
                    </div>
                    <p className="text-teal-500 text-sm ml-11">
                      目标 {formatMoneyShort(milestone.targetAmount)} · 截止 {milestone.deadline}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-teal-700">{percent.toFixed(0)}%</p>
                  </div>
                </div>
                <div className="ml-11 mt-4">
                  <div className="w-full h-2 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        milestone.status === 'completed'
                          ? 'bg-emerald-500'
                          : milestone.status === 'in_progress'
                          ? 'bg-gradient-to-r from-teal-500 to-gold-500'
                          : 'bg-teal-300'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
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
            return (
              <div key={task.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-teal-800">{task.title}</h3>
                      <p className="text-xs text-teal-500">{config.label} · 截止 {task.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gold-600">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-medium">{task.reward}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-teal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-teal-700 w-12 text-right">{task.progress}%</span>
                </div>
                {task.progress < 100 && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateTaskProgress(task.id, Math.min(100, task.progress + 25))}
                      className="flex-1 py-2 text-sm bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors"
                    >
                      +25%
                    </button>
                    <button
                      onClick={() => completeTask(task.id)}
                      className="flex-1 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      标记完成
                    </button>
                  </div>
                )}
                {task.progress === 100 && (
                  <div className="mt-4 py-2 bg-emerald-50 text-emerald-700 text-center rounded-lg text-sm font-medium">
                    ✅ 已完成
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
          {progress.achievements.map(achievement => (
            <div
              key={achievement.id}
              className={`card p-5 text-center transition-all ${
                achievement.unlocked ? '' : 'opacity-40 grayscale'
              }`}
            >
              <div className="text-5xl mb-3">{achievement.icon}</div>
              <h3 className="font-semibold text-teal-800 mb-1">{achievement.title}</h3>
              <p className="text-xs text-teal-500">{achievement.description}</p>
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-xs text-gold-600 mt-2">🏆 {achievement.unlockedAt}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
