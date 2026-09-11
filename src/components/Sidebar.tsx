import React from 'react';
import {
  Compass,
  MessageSquare,
  Layers,
  Target,
  FileCheck2,
  BarChart3,
  Settings,
  Plus,
  Flame,
  Volume2,
  Sparkles,
  School
} from 'lucide-react';

export type MainView = 'chat' | 'flashcards' | 'quiz' | 'work_checker' | 'analytics';

interface SidebarProps {
  activeView: MainView;
  onSelectView: (view: MainView) => void;
  onNewChat: () => void;
  streakDays: number;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSelectRecentTopic?: (topic: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  onNewChat,
  streakDays,
  onOpenSettings,
  theme,
  onToggleTheme,
  onSelectRecentTopic
}) => {
  const navItems: { id: MainView; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'AI Study Chat', icon: <MessageSquare size={18} /> },
    { id: 'flashcards', label: 'Flashcards Deck', icon: <Layers size={18} /> },
    { id: 'quiz', label: 'Mastery Quizzes', icon: <Target size={18} /> },
    { id: 'work_checker', label: 'Step Work Checker', icon: <FileCheck2 size={18} /> },
    { id: 'analytics', label: 'Progress & Stats', icon: <BarChart3 size={18} /> }
  ];

  const recentTopics = [
    'Quadratic Equations & Roots',
    'Photosynthesis & Respiration',
    'French Revolution Causes',
    'Binary Search in Python'
  ];

  return (
    <aside
      className="glass-panel"
      style={{
        width: '270px',
        height: '100vh',
        borderRadius: 0,
        borderRight: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 16px',
        flexShrink: 0
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: '24px', padding: '0 4px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}
        >
          <Compass size={22} color="#ffffff" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              Tutorly
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 700
              }}
            >
              SDG 4
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            AI Learning Coach
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <button
        onClick={onNewChat}
        className="btn-primary"
        style={{
          width: '100%',
          justifyContent: 'center',
          marginBottom: '20px',
          fontSize: '0.88rem',
          padding: '10px'
        }}
      >
        <Plus size={18} /> New Study Session
      </button>

      {/* Streak Gamification Card */}
      <div
        style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div className="flex items-center gap-2">
          <Flame size={20} fill="#f59e0b" color="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--developing)' }}>
              {streakDays} Day Streak! 🔥
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Keep learning today!
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-1" style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0 8px 6px' }}>
          CORE TOOLS
        </div>
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                textAlign: 'left'
              }}
            >
              <span style={{ color: isActive ? 'var(--primary-light)' : 'inherit' }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Recent History */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '0 8px 6px' }}>
          RECENT TOPICS
        </div>
        <div className="flex flex-col gap-1">
          {recentTopics.map((topic, i) => (
            <button
              key={i}
              onClick={() => {
                if (onSelectRecentTopic) {
                  onSelectRecentTopic(topic);
                } else {
                  onSelectView('chat');
                }
              }}
              className="btn-ghost"
              style={{
                fontSize: '0.78rem',
                justifyContent: 'flex-start',
                padding: '7px 10px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'left'
              }}
            >
              <span style={{ marginRight: '6px' }}>💬</span>
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div
        style={{
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <button
          onClick={onOpenSettings}
          className="btn-ghost"
          style={{ fontSize: '0.82rem', padding: '6px 8px' }}
        >
          <Settings size={16} /> Settings
        </button>

        <button
          onClick={onToggleTheme}
          className="btn-ghost"
          style={{ padding: '6px 8px', fontSize: '0.82rem' }}
          title="Toggle Theme"
        >
          <Volume2 size={16} /> {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </div>
    </aside>
  );
};
