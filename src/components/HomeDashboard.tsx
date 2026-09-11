import React from 'react';
import { StudentProfile } from '../types';
import { plannerAgent } from '../services/ai/plannerAgent';
import { ActiveTab } from './Navbar';
import {
  Compass,
  Play,
  Flame,
  Brain,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Network,
  Activity,
  FileCheck2,
  Award
} from 'lucide-react';

interface HomeDashboardProps {
  profile: StudentProfile;
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectConcept: (conceptId: string) => void;
  onOpenOnboarding: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  onNavigateTab,
  onSelectConcept,
  onOpenOnboarding
}) => {
  const dailySession = plannerAgent.generateDailySession(profile, 'math_linear_equations');
  const proactiveNudges = plannerAgent.generateProactiveNudges(profile);

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1200px' }}>
      {/* Welcome Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '32px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.12) 100%)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
            <span className="badge badge-mastered" style={{ fontSize: '0.72rem' }}>
              SDG 4: Quality Education Platform
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {profile.grade} • {profile.targetGoal}
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
            Welcome back, {profile.name}!
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Your coach has prepared today's personalized learning loop. Rather than drilling raw questions, we’ll reinforce foundational prerequisites and guide you through multi-step mastery.
          </p>

          <div className="flex gap-3" style={{ marginTop: '20px' }}>
            <button
              onClick={() => onNavigateTab('coach')}
              className="btn-primary"
              style={{ padding: '12px 22px', fontSize: '0.92rem' }}
            >
              <Play size={16} /> Start Today’s Socratic Session
            </button>

            <button
              onClick={() => onNavigateTab('diagnostic')}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontSize: '0.92rem' }}
            >
              <Activity size={16} /> Run Adaptive Diagnostic
            </button>
          </div>
        </div>

        {/* Quick Streak & Target Widget */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '20px 24px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            minWidth: '240px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LEARNING STREAK</span>
            <Flame size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--developing)', fontFamily: 'var(--font-mono)' }}>
            {profile.learningStreakDays} Days Active
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Goal: {profile.dailyTimeMinutes} min/day commitment
          </div>
          <button
            onClick={onOpenOnboarding}
            className="btn-ghost"
            style={{ fontSize: '0.78rem', padding: '4px 0', color: 'var(--primary-light)', justifyContent: 'flex-start' }}
          >
            Edit Student Profile →
          </button>
        </div>
      </div>

      {/* Proactive Coaching Nudges */}
      <div style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary-light)" /> Proactive Learning Insights
        </h3>
        <div className="grid-cols-2 gap-4">
          {proactiveNudges.map(nudge => {
            return (
              <div
                key={nudge.id}
                className="glass-panel"
                style={{
                  padding: '18px 22px',
                  borderLeft: `4px solid ${
                    nudge.urgency === 'high' ? 'var(--critical-gap)' : 'var(--developing)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}
              >
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                    <strong style={{ fontSize: '0.92rem' }}>{nudge.title}</strong>
                    {nudge.urgency === 'high' && (
                      <span className="badge badge-critical" style={{ fontSize: '0.62rem' }}>
                        High Priority
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {nudge.message}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (nudge.targetConceptId) onSelectConcept(nudge.targetConceptId);
                    else onNavigateTab('coach');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
                >
                  {nudge.actionText} <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's 25-Min Study Session & Fast Action Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
        {/* Today's Session Plan */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="flex items-center gap-2">
              <Clock size={20} color="var(--secondary)" />
              <h3 style={{ fontSize: '1.15rem' }}>Today’s Structured Learning Loop</h3>
            </div>
            <span className="badge badge-learning" style={{ fontSize: '0.75rem' }}>
              {dailySession.estimatedMinutes} Mins Total
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            Target Focus: <strong style={{ color: 'var(--text-primary)' }}>{dailySession.targetConceptName}</strong>
          </div>

          <div className="flex flex-col gap-3">
            {dailySession.steps.map(step => (
              <div
                key={step.stepIndex}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {step.stepIndex}
                </div>

                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{step.title}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {step.durationMinutes}m
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigateTab('coach')}
            className="btn-accent"
            style={{ width: '100%', justifyContent: 'center', marginTop: '20px', padding: '12px' }}
          >
            Launch Study Loop Now <ArrowRight size={16} />
          </button>
        </div>

        {/* Feature Fast-Travel Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div
            onClick={() => onNavigateTab('knowledge_graph')}
            className="glass-panel glass-panel-hover"
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Network size={22} color="var(--primary-light)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Concept Knowledge Graph</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Inspect prerequisite trees and unlocked skills
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>

          <div
            onClick={() => onNavigateTab('work_analyzer')}
            className="glass-panel glass-panel-hover"
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileCheck2 size={22} color="var(--secondary)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Step-by-Step Work Checker</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Pinpoint exact line of breakdown in multi-step math
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>

          <div
            onClick={() => onNavigateTab('practice')}
            className="glass-panel glass-panel-hover"
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Award size={22} color="var(--mastered)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Adaptive Practice Arena</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Dynamic difficulty with real-time mid-session adaptation
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>

          <div
            onClick={() => onNavigateTab('multimodal')}
            className="glass-panel glass-panel-hover"
            style={{ padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={22} color="var(--accent-purple)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Multimodal Hub</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Syllabus upload, image scans, and speech interaction
              </div>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </div>
        </div>
      </div>
    </div>
  );
};
