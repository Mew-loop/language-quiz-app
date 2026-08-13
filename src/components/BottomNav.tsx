import React from 'react';
import { Home, Award, BarChart3, User } from 'lucide-react';
import { AppTab } from '../types';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  questsBadgeCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  questsBadgeCount = 1
}) => {
  const tabs = [
    { id: 'home' as AppTab, label: 'Home', icon: Home },
    { id: 'quests' as AppTab, label: 'Quests', icon: Award, badge: questsBadgeCount },
    { id: 'stats' as AppTab, label: 'Stats', icon: BarChart3 },
    { id: 'profile' as AppTab, label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md bg-[#0f0f1c]/85 backdrop-blur-2xl border border-white/[0.09] rounded-3xl p-1.5 shadow-2xl shadow-black/80">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                playClickSound();
                triggerHaptic('light');
                onTabChange(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-white bg-gradient-to-b from-purple-500/25 to-pink-500/10 border border-purple-400/30 shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-purple-300' : ''}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[9px] font-bold text-white flex items-center justify-center shadow-md">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-semibold tracking-tight transition-all ${
                isActive ? 'text-purple-200 font-bold' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
