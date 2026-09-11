import React from 'react';
import { StudentProfile } from '../types';
import { KNOWLEDGE_GRAPH_NODES } from '../data/knowledgeGraph';
import { learnerService } from '../services/learnerModel';
import {
  Sparkles,
  TrendingUp,
  Brain,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Flame,
  Target
} from 'lucide-react';

interface AnalyticsViewProps {
  profile: StudentProfile;
  onPracticeConcept: (conceptId: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  profile,
  onPracticeConcept
}) => {
  const metacognitionLinear = learnerService.getMetacognitiveState('math_linear_equations');
  const dueReviews = learnerService.getDueRetentionConcepts();

  // Concept mastery array
  const mathConcepts = KNOWLEDGE_GRAPH_NODES.filter(n => n.subjectId === 'mathematics');

  // Aggregated mistake counts
  const mistakeCounts: Record<string, number> = {
    'Conceptual Misunderstanding': 4,
    'Careless Sign Slip': 5,
    'Missing Prerequisite': 3,
    'Calculation Error': 2,
    'Wrong Strategy': 1
  };

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
          <Sparkles size={22} color="var(--primary-light)" />
          <h1 style={{ fontSize: '1.8rem' }}>Multi-Dimensional Learning Analytics</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
          Tracking metacognition, retention decay, mistake patterns, and true cognitive mastery.
        </p>
      </div>

      {/* Top Stat Summary Cards */}
      <div className="grid-cols-4 gap-4" style={{ marginBottom: '28px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>LEARNING STREAK</span>
            <Flame size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {profile.learningStreakDays} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--mastered)', marginTop: '4px' }}>
            Active daily neuroplasticity
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>QUESTIONS SOLVED</span>
            <Target size={18} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {profile.totalQuestionsSolved}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            With pedagogical diagnosis
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>STUDY TIME</span>
            <Clock size={18} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {profile.totalStudyMinutes}m
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Target: {profile.dailyTimeMinutes}m / day
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UNLOCKED SKILLS</span>
            <CheckCircle2 size={18} color="var(--mastered)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {profile.unlockedConcepts.length} / {KNOWLEDGE_GRAPH_NODES.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--mastered)', marginTop: '4px' }}>
            Prerequisite DAG unlocked
          </div>
        </div>
      </div>

      {/* Row 2: Metacognitive Calibration Matrix (4-Quadrant) & Spaced Repetition */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Metacognitive Calibration Matrix */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
            <Brain size={20} color="var(--primary-light)" />
            <h3 style={{ fontSize: '1.15rem' }}>Confidence vs. Actual Performance Matrix</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
            Detecting overconfidence (blind spots) and underconfidence (hidden strengths) to personalize coaching style.
          </p>

          {/* 4 Quadrants Visual Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginBottom: '16px'
            }}
          >
            {/* Top Left: Underconfident */}
            <div
              style={{
                background:
                  metacognitionLinear.state === 'underconfident'
                    ? 'rgba(6, 182, 212, 0.2)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  metacognitionLinear.state === 'underconfident'
                    ? '2px solid var(--secondary)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--secondary)' }}>
                UNDERCONFIDENT
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Low confidence, High observed accuracy
              </div>
            </div>

            {/* Top Right: Calibrated Master */}
            <div
              style={{
                background:
                  metacognitionLinear.state === 'calibrated_master'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  metacognitionLinear.state === 'calibrated_master'
                    ? '2px solid var(--mastered)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mastered)' }}>
                CALIBRATED MASTER
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                High confidence, High observed accuracy
              </div>
            </div>

            {/* Bottom Left: Calibrated Struggling */}
            <div
              style={{
                background:
                  metacognitionLinear.state === 'calibrated_struggling'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  metacognitionLinear.state === 'calibrated_struggling'
                    ? '2px solid var(--developing)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--developing)' }}>
                GROWTH EDGE
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Low confidence, Needs scaffolding
              </div>
            </div>

            {/* Bottom Right: Overconfident */}
            <div
              style={{
                background:
                  metacognitionLinear.state === 'overconfident'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(255, 255, 255, 0.02)',
                border:
                  metacognitionLinear.state === 'overconfident'
                    ? '2px solid var(--critical-gap)'
                    : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '12px'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--critical-gap)' }}>
                OVERCONFIDENT
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                High confidence, Low observed accuracy
              </div>
            </div>
          </div>

          {/* Active Status Callout */}
          <div
            style={{
              padding: '14px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-accent)'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Current Diagnosis: {metacognitionLinear.message}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {metacognitionLinear.advice}
            </div>
          </div>
        </div>

        {/* Ebbinghaus Spaced Repetition Retention Schedule */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
            <Calendar size={20} color="var(--secondary)" />
            <h3 style={{ fontSize: '1.15rem' }}>Spaced Retention Schedule</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
            Concepts return on intervals (D1, D2, D5, D10, D20) to prevent the Ebbinghaus forgetting curve.
          </p>

          <div className="flex flex-col gap-3" style={{ flex: 1 }}>
            {dueReviews.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.85rem',
                  color: 'var(--mastered)'
                }}
              >
                All retention reviews currently up to date! Next retrieval check scheduled in 2 days.
              </div>
            ) : (
              dueReviews.map(m => {
                const node = KNOWLEDGE_GRAPH_NODES.find(n => n.id === m.conceptId);
                return (
                  <div
                    key={m.conceptId}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{node?.name || m.conceptId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Retention Strength: {m.retentionStrength}%
                      </div>
                    </div>
                    <button
                      onClick={() => onPracticeConcept(m.conceptId)}
                      className="btn-primary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    >
                      Review Now
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Mistake Category Distribution & Concept Mastery Bars */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
        {/* Mistake Pattern Taxonomy */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Mistake Pattern Distribution</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
            Breakdown across the 10 mistake classifications to target pedagogical remedies.
          </p>

          <div className="flex flex-col gap-3">
            {Object.entries(mistakeCounts).map(([cat, count]) => {
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '4px', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{count} occurrences</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${(count / 15) * 100}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Concept Mastery Radar / Progress Bars */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px' }}>Mathematics Mastery Profile</h3>
          <div className="flex flex-col gap-3">
            {mathConcepts.map(c => {
              const mastery = profile.masteryByConcept[c.id];
              const score = mastery ? mastery.masteryScore : 0;
              return (
                <div key={c.id}>
                  <div className="flex justify-between items-center" style={{ marginBottom: '4px', fontSize: '0.82rem' }}>
                    <span>{c.name}</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{score}%</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${score}%`,
                        height: '100%',
                        background:
                          score >= 85
                            ? 'var(--mastered)'
                            : score >= 60
                            ? 'var(--proficient)'
                            : score >= 40
                            ? 'var(--developing)'
                            : 'var(--learning)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
