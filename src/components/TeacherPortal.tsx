import React, { useState } from 'react';
import { ClassStudentSummary } from '../types';
import {
  School,
  AlertTriangle,
  Users,
  CheckCircle2,
  PlusCircle,
  TrendingDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const [students] = useState<ClassStudentSummary[]>([
    {
      id: 'st_01',
      name: 'Alex Rivera',
      overallMastery: 72,
      strugglingConcepts: ['Linear Equations', 'Distributive Property'],
      recentMistakeCategory: 'conceptual_misunderstanding',
      lastActive: '10 mins ago',
      needsIntervention: false
    },
    {
      id: 'st_02',
      name: 'Maya Chen',
      overallMastery: 44,
      strugglingConcepts: ['Negative Numbers & Signs', 'Order of Operations'],
      recentMistakeCategory: 'missing_prerequisite',
      lastActive: '1 hour ago',
      needsIntervention: true
    },
    {
      id: 'st_03',
      name: 'Jordan Taylor',
      overallMastery: 89,
      strugglingConcepts: [],
      recentMistakeCategory: 'careless_error',
      lastActive: 'Yesterday',
      needsIntervention: false
    },
    {
      id: 'st_04',
      name: 'Marcus Williams',
      overallMastery: 52,
      strugglingConcepts: ['Distributive Property'],
      recentMistakeCategory: 'partial_understanding',
      lastActive: '3 hours ago',
      needsIntervention: true
    }
  ]);

  const [activeTab, setActiveTab] = useState<'roster' | 'misconceptions' | 'create_assignment'>('roster');
  const [createdNotice, setCreatedNotice] = useState<string | null>(null);

  const handleCreateTargetedQuiz = () => {
    setCreatedNotice('Targeted 5-Question Scaffolded Assignment on "Distributive Property" created and assigned to struggling students (Maya Chen & Marcus Williams)!');
    setTimeout(() => setCreatedNotice(null), 5000);
  };

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '28px' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
            <School size={24} color="var(--primary-light)" />
            <h1 style={{ fontSize: '1.8rem' }}>Teacher & Mentor Hub</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            View class-level misconception patterns, identify students needing intervention, and dispatch targeted Socratic assignments.
          </p>
        </div>

        <button onClick={handleCreateTargetedQuiz} className="btn-accent" style={{ fontSize: '0.85rem' }}>
          <PlusCircle size={16} /> Create Prerequisite Drill
        </button>
      </div>

      {createdNotice && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid var(--mastered)',
            color: 'var(--text-primary)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            fontSize: '0.88rem'
          }}
        >
          {createdNotice}
        </div>
      )}

      {/* Class Overview Metric Cards */}
      <div className="grid-cols-3 gap-4" style={{ marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            CLASS AVERAGE MASTERY
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)', fontFamily: 'var(--font-mono)' }}>
            64.2%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Period 3 • Algebra I (28 Students)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            TOP CLASS MISCONCEPTION
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--critical-gap)' }}>
            Distributive Property
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            38% of students miss distributing to second term
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            INTERVENTION ALERTS
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--developing)', fontFamily: 'var(--font-mono)' }}>
            2 Students
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Prerequisite gaps blocking linear equations
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2" style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('roster')}
          className={activeTab === 'roster' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.82rem' }}
        >
          <Users size={16} /> Student Roster
        </button>
        <button
          onClick={() => setActiveTab('misconceptions')}
          className={activeTab === 'misconceptions' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: '0.82rem' }}
        >
          <AlertTriangle size={16} /> Misconception Heatmap
        </button>
      </div>

      {activeTab === 'roster' ? (
        /* Student Roster Table */
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Student Performance & Diagnostic Status</h3>
          <div className="flex flex-col gap-3">
            {students.map(s => {
              return (
                <div
                  key={s.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    background: s.needsIntervention ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-tertiary)',
                    border: s.needsIntervention ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-3" style={{ marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.98rem' }}>{s.name}</span>
                      {s.needsIntervention && (
                        <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                          Needs Intervention
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Last Active: {s.lastActive} • Recent Error: {s.recentMistakeCategory.replace(/_/g, ' ')}
                    </div>
                  </div>

                  {/* Struggling Concepts */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      KNOWLEDGE GAPS:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.strugglingConcepts.length > 0 ? (
                        s.strugglingConcepts.map((c, i) => (
                          <span key={i} className="badge badge-developing" style={{ fontSize: '0.65rem' }}>
                            {c}
                          </span>
                        ))
                      ) : (
                        <span className="badge badge-mastered" style={{ fontSize: '0.65rem' }}>
                          None (All Proficient)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mastery Score */}
                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {s.overallMastery}%
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>OVERALL</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Misconception Heatmap */
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Class-Wide Misconception Heatmap</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Identifies systemic conceptual breakdowns across the entire classroom for targeted whole-group mini-lessons.
          </p>

          <div className="flex flex-col gap-4">
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>1. Omission of Second Term in Distribution (2(x + 3) &rarr; 2x + 3)</span>
                <span style={{ color: 'var(--critical-gap)', fontWeight: 700 }}>38% of class</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Recommended Action: Whole-class visual party-favor analogy lesson before continuing linear systems.
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>2. Negative Sign Transposition (-5 - (-8) = -13)</span>
                <span style={{ color: 'var(--developing)', fontWeight: 700 }}>24% of class</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Recommended Action: 5-minute number line retrieval warmup.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
