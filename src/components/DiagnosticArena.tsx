import React, { useState } from 'react';
import { assessorAgent, DiagnosticResult } from '../services/ai/assessorAgent';
import { Question, StudentProfile } from '../types';
import { KatexRenderer } from './KatexRenderer';
import { learnerService } from '../services/learnerModel';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiagnosticArenaProps {
  profile: StudentProfile;
  onInterventionSelected: (conceptId: string) => void;
  onProfileUpdated: () => void;
}

export const DiagnosticArena: React.FC<DiagnosticArenaProps> = ({
  profile,
  onInterventionSelected,
  onProfileUpdated
}) => {
  const [targetConceptId, setTargetConceptId] = useState<string>('math_linear_equations');
  const [questions, setQuestions] = useState<Question[]>(() =>
    assessorAgent.generateDiagnosticTest('math_linear_equations')
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{
    questionId: string;
    conceptId: string;
    studentAnswer: string;
    isCorrect: boolean;
    confidence: 1 | 2 | 3 | 4 | 5;
  }[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [confidenceRating, setConfidenceRating] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isTestComplete, setIsTestComplete] = useState<boolean>(false);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticResult | null>(null);

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (opt: string) => {
    setSelectedOption(opt);
  };

  const handleNextQuestion = () => {
    if (!selectedOption) return;

    const isCorrect = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

    const updatedAnswers = [
      ...userAnswers,
      {
        questionId: currentQ.id,
        conceptId: currentQ.conceptId,
        studentAnswer: selectedOption,
        isCorrect,
        confidence: confidenceRating
      }
    ];
    setUserAnswers(updatedAnswers);
    setSelectedOption('');
    setConfidenceRating(3);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Evaluate full diagnostic
      const report = assessorAgent.evaluateDiagnostic(updatedAnswers);
      setDiagnosticReport(report);
      setIsTestComplete(true);

      if (report.overallScorePercentage >= 75) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }

      onProfileUpdated();
    }
  };

  const handleRestartTest = (newConceptId?: string) => {
    const cId = newConceptId || targetConceptId;
    setTargetConceptId(cId);
    setQuestions(assessorAgent.generateDiagnosticTest(cId));
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOption('');
    setIsTestComplete(false);
    setDiagnosticReport(null);
  };

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '900px' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Activity size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>Adaptive Diagnostic Engine</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              We test foundational prerequisites to uncover why mistakes occur before teaching.
            </p>
          </div>
        </div>

        {isTestComplete && (
          <button onClick={() => handleRestartTest()} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            <RefreshCw size={15} /> Retest Diagnostic
          </button>
        )}
      </div>

      {!isTestComplete && currentQ ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          {/* Progress Indicator */}
          <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
            <span className="badge badge-learning">
              Concept Check: {currentQ.conceptName}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '3px',
              marginBottom: '24px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          {/* Question Prompt */}
          <h2 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>{currentQ.prompt}</h2>

          {currentQ.latexEquation && (
            <div
              style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                margin: '16px 0',
                textAlign: 'center',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <KatexRenderer latex={currentQ.latexEquation} block />
            </div>
          )}

          {/* Multiple Choice Options */}
          <div className="flex flex-col gap-3" style={{ margin: '24px 0' }}>
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-tertiary)',
                    border: isSelected ? '2px solid var(--primary-light)' : '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    fontWeight: isSelected ? 600 : 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 0 12px var(--primary-glow)' : 'none'
                  }}
                >
                  <span>{opt}</span>
                  {isSelected && <CheckCircle2 size={18} color="var(--primary-light)" />}
                </button>
              );
            })}
          </div>

          {/* Metacognitive Confidence Self-Rating */}
          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                How confident are you in this answer? (Metacognitive Calibration)
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--primary-light)', fontWeight: 700 }}>
                {confidenceRating === 1
                  ? '1 - Complete Guess'
                  : confidenceRating === 3
                  ? '3 - Moderate Certainty'
                  : confidenceRating === 5
                  ? '5 - 100% Certain'
                  : `${confidenceRating} / 5`}
              </span>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  onClick={() => setConfidenceRating(val as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    background: confidenceRating === val ? 'var(--primary)' : 'var(--bg-input)',
                    color: confidenceRating === val ? '#fff' : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextQuestion}
            disabled={!selectedOption}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '14px',
              opacity: selectedOption ? 1 : 0.5
            }}
          >
            {currentQuestionIndex + 1 === questions.length ? 'Complete Diagnostic & Analyze Gaps' : 'Submit & Next Check'}
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        /* Diagnostic Results View */
        diagnosticReport && (
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Overall Score & Insight */}
            <div className="flex justify-between items-center" style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="badge badge-learning" style={{ marginBottom: '6px' }}>
                  Diagnostic Complete
                </span>
                <h2 style={{ fontSize: '1.6rem' }}>Comprehensive Knowledge Gap Analysis</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Rather than a simplistic raw score, here is your multi-dimensional concept status.
                </p>
              </div>

              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'var(--bg-tertiary)',
                  border: '3px solid var(--primary-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px var(--primary-glow)'
                }}
              >
                <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  {diagnosticReport.overallScorePercentage}%
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>ACCURACY</span>
              </div>
            </div>

            {/* Root Prerequisite Alert Banner */}
            {diagnosticReport.rootPrerequisiteDetected && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid var(--critical-gap)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px'
                }}
              >
                <AlertTriangle size={24} color="var(--critical-gap)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                    <strong style={{ color: '#fca5a5', fontSize: '1rem' }}>
                      Root Prerequisite Discovered: {diagnosticReport.rootPrerequisiteDetected.conceptName}
                    </strong>
                    <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                      Root Cause
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {diagnosticReport.rootPrerequisiteDetected.reason}
                  </p>
                  <button
                    onClick={() => onInterventionSelected(diagnosticReport.rootPrerequisiteDetected!.conceptId)}
                    className="btn-accent"
                    style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                  >
                    Start Targeted Prerequisite Lesson on {diagnosticReport.rootPrerequisiteDetected.conceptName} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Evaluated Concepts Table */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Concept Mastery Breakdown</h3>
              <div className="flex flex-col gap-2">
                {diagnosticReport.evaluatedConcepts.map(c => {
                  return (
                    <div
                      key={c.conceptId}
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
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.conceptName}</span>
                          {c.isRootPrerequisiteGap && (
                            <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                              Root Gap
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {c.recommendation}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`badge ${
                            c.status === 'mastered'
                              ? 'badge-mastered'
                              : c.status === 'proficient'
                              ? 'badge-proficient'
                              : c.status === 'developing'
                              ? 'badge-developing'
                              : 'badge-critical'
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>
                          {c.masteryPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendation CTA */}
            <div className="flex justify-end gap-3" style={{ marginTop: '12px' }}>
              <button
                onClick={() => onInterventionSelected(diagnosticReport.recommendedNextConceptId)}
                className="btn-primary"
                style={{ padding: '12px 24px' }}
              >
                Proceed to Personalized Study Loop <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};
