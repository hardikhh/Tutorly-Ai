import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { plannerAgent } from '../services/ai/plannerAgent';
import {
  Calendar,
  AlertTriangle,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface ExamReadinessViewProps {
  profile: StudentProfile;
  onDrillConcept: (conceptId: string) => void;
}

export const ExamReadinessView: React.FC<ExamReadinessViewProps> = ({
  profile,
  onDrillConcept
}) => {
  const [selectedExam, setSelectedExam] = useState<string>(profile.targetExam || 'SAT / State Assessment');
  const examPlan = plannerAgent.calculateExamReadiness(profile, 'mathematics');

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1000px' }}>
      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: '28px' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
            <Calendar size={22} color="var(--primary-light)" />
            <h1 style={{ fontSize: '1.8rem' }}>Exam Readiness Hub</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Personalized study schedule and weak-area priority drills aligned with your exam date.
          </p>
        </div>

        <select
          value={selectedExam}
          onChange={e => setSelectedExam(e.target.value)}
          style={{
            fontSize: '0.88rem',
            padding: '8px 14px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <option value="SAT / State Assessment">SAT / State Assessment</option>
          <option value="AP Calculus / High School Math">AP Calculus / High School Math</option>
          <option value="GCSE / IGCSE Mathematics">GCSE / IGCSE Mathematics</option>
          <option value="General High School Algebra">General High School Algebra</option>
        </select>
      </div>

      {/* Hero Exam Status Card */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid var(--border-accent)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            TARGET EXAM
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedExam}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', marginTop: '4px' }}>
            Target: 90th+ Percentile
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            DAYS REMAINING
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--developing)', fontFamily: 'var(--font-mono)' }}>
            {examPlan.daysRemaining} Days
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Scheduled Date: {profile.examDate || 'Oct 15, 2026'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px' }}>
            SYLLABUS READINESS
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--mastered)', fontFamily: 'var(--font-mono)' }}>
            {examPlan.readinessPercentage}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Based on weighted concept mastery
          </div>
        </div>
      </div>

      {/* Priority Weak Area Drills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
            <AlertTriangle size={20} color="var(--critical-gap)" />
            <h3 style={{ fontSize: '1.15rem' }}>High Priority Exam Topics</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
            These topics have high weight on the exam and are currently below the 65% proficiency threshold.
          </p>

          <div className="flex flex-col gap-3">
            {examPlan.priorityTopics.map(t => (
              <div
                key={t.conceptId}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{t.conceptName}</span>
                    <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                      {t.urgency.toUpperCase()} URGENCY
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Current Mastery: {t.currentMastery}%
                  </div>
                </div>

                <button
                  onClick={() => onDrillConcept(t.conceptId)}
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                >
                  Start Drill <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Check Alerts */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
            <Clock size={20} color="var(--developing)" />
            <h3 style={{ fontSize: '1.15rem' }}>Memory Retention Alerts</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
            Concepts you previously learned that require a rapid review to keep fresh for exam day.
          </p>

          <div className="flex flex-col gap-3">
            {examPlan.retentionAlerts.map(a => (
              <div
                key={a.conceptId}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                  {a.conceptName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Last reviewed {a.daysSinceReview} days ago.
                </div>
                <button
                  onClick={() => onDrillConcept(a.conceptId)}
                  className="btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', padding: '6px' }}
                >
                  3-Min Quick Retrieval Check
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
