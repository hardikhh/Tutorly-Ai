import React from 'react';
import {
  Compass,
  MessageSquareCode,
  Network,
  Activity,
  Award,
  Layers,
  Sparkles,
  School,
  FileText,
  FileCheck2,
  Calendar,
  Settings,
  Flame,
  Volume2
} from 'lucide-react';
import { StudentProfile } from '../types';

export type ActiveTab =
  | 'home'
  | 'coach'
  | 'knowledge_graph'
  | 'diagnostic'
  | 'work_analyzer'
  | 'practice'
  | 'learning_path'
  | 'analytics'
  | 'multimodal'
  | 'exam_prep'
  | 'teacher';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: StudentProfile;
  onOpenWowDemo: () => void;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  profile,
  onOpenWowDemo,
  onOpenSettings,
  theme,
  onToggleTheme
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Today', icon: <Compass size={18} /> },
    { id: 'coach', label: 'Socratic Coach', icon: <MessageSquareCode size={18} /> },
    { id: 'knowledge_graph', label: 'Concept Graph', icon: <Network size={18} /> },
    { id: 'diagnostic', label: 'Diagnostic', icon: <Activity size={18} /> },
    { id: 'work_analyzer', label: 'Work Analyzer', icon: <FileCheck2 size={18} /> },
    { id: 'practice', label: 'Adaptive Practice', icon: <Award size={18} /> },
    { id: 'learning_path', label: 'Roadmap', icon: <Layers size={18} /> },
    { id: 'multimodal', label: 'Multimodal Hub', icon: <FileText size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <Sparkles size={18} /> },
    { id: 'exam_prep', label: 'Exam Prep', icon: <Calendar size={18} /> },
    { id: 'teacher', label: 'Teacher Mode', icon: <School size={18} /> }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel" style={{ borderRadius: 0, borderBottom: '1px solid var(--border-medium)' }}>
      <div className="container flex items-center justify-between" style={{ height: '72px' }}>
        {/* Brand & SDG 4 Badge */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2"
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Compass size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
                  AI Learning Coach
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
                  title="United Nations Sustainable Development Goal 4: Quality Education"
                >
                  SDG 4
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Adaptive Socratic Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Scrollable) */}
        <nav
          className="flex items-center gap-1"
          style={{
            overflowX: 'auto',
            padding: '4px 0',
            maxWidth: '620px',
            scrollbarWidth: 'none'
          }}
        >
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)'
                    : 'transparent',
                  border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: isActive ? 'var(--primary-light)' : 'inherit' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: WOW Demo, Streak, Settings */}
        <div className="flex items-center gap-3">
          {/* WOW Demonstration Button */}
          <button
            onClick={onOpenWowDemo}
            className="animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#ffffff',
              padding: '7px 13px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            title="Live comparison: Generic Chatbot vs. AI Learning Coach"
          >
            <Sparkles size={15} />
            <span>WOW Demo</span>
          </button>

          {/* Learning Streak */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--developing)'
            }}
            title={`${profile.learningStreakDays} days streak`}
          >
            <Flame size={15} color="#f59e0b" fill="#f59e0b" />
            <span>{profile.learningStreakDays}d</span>
          </div>

          {/* Theme Switch & Settings */}
          <button
            onClick={onToggleTheme}
            className="btn-ghost"
            style={{ padding: '8px' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            <Volume2 size={18} />
          </button>

          <button
            onClick={onOpenSettings}
            className="btn-ghost"
            style={{ padding: '8px' }}
            title="Settings & Gemini API Configuration"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
