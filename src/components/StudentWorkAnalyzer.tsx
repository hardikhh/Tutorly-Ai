import React, { useState } from 'react';
import { evaluatorAgent } from '../services/ai/evaluatorAgent';
import { WorkAnalysisResult } from '../services/ai/types';
import { KatexRenderer } from './KatexRenderer';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface StudentWorkAnalyzerProps {
  onStartRemedialLesson: (prereqId: string) => void;
}

export const StudentWorkAnalyzer: React.FC<StudentWorkAnalyzerProps> = ({
  onStartRemedialLesson
}) => {
  const [problemStatement, setProblemStatement] = useState<string>('Solve 2(x + 3) = 14 for x');
  const [studentStepsInput, setStudentStepsInput] = useState<string>(
    `2x + 3 = 14\n2x = 11\nx = 5.5`
  );
  const [analysisResult, setAnalysisResult] = useState<WorkAnalysisResult | null>(null);

  const handleRunAnalysis = () => {
    const rawLines = studentStepsInput
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const result = evaluatorAgent.analyzeStudentWork(problemStatement, rawLines);
    setAnalysisResult(result);
  };

  const handleLoadPreset = (type: 'distributive_error' | 'negative_sign_error') => {
    if (type === 'distributive_error') {
      setProblemStatement('Solve 2(x + 3) = 14 for x');
      setStudentStepsInput(`2x + 3 = 14\n2x = 11\nx = 5.5`);
      setAnalysisResult(null);
    } else {
      setProblemStatement('Solve -3(x - 4) = 18 for x');
      setStudentStepsInput(`-3x - 12 = 18\n-3x = 30\nx = -10`);
      setAnalysisResult(null);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileCheck2 size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>Step-by-Step Work Analyzer</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              We don’t just grade the final number. We pinpoint the exact line where mathematical understanding broke down.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Input panel on Left, Diagnostic Breakdown on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Input Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: '1.1rem' }}>Student Solution Steps</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleLoadPreset('distributive_error')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Sample 1 (Distribution Gap)
              </button>
              <button
                onClick={() => handleLoadPreset('negative_sign_error')}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              >
                Sample 2 (Sign Error)
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              PROBLEM STATEMENT:
            </label>
            <input
              type="text"
              value={problemStatement}
              onChange={e => setProblemStatement(e.target.value)}
              style={{ width: '100%', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              INTERMEDIATE CALCULATION STEPS (ONE PER LINE):
            </label>
            <textarea
              rows={6}
              value={studentStepsInput}
              onChange={e => setStudentStepsInput(e.target.value)}
              placeholder="e.g.&#10;2x + 3 = 14&#10;2x = 11&#10;x = 5.5"
              style={{
                width: '100%',
                fontSize: '0.95rem',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.6
              }}
            />
          </div>

          <button
            onClick={handleRunAnalysis}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            <Sparkles size={18} /> Analyze Solution Breakdown
          </button>
        </div>

        {/* Diagnostic Output Panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Pedagogical Diagnosis</h3>

          {!analysisResult ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--text-muted)',
                gap: '12px'
              }}
            >
              <Lightbulb size={36} color="var(--primary-light)" />
              <div>Click "Analyze Solution Breakdown" to inspect the intermediate logic steps.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.3s ease-out' }}>
              {/* Step-by-Step Inspection List */}
              <div className="flex flex-col gap-2">
                {analysisResult.steps.map(s => {
                  const isBreakdown = analysisResult.breakdownStepIndex === s.stepNumber - 1;
                  return (
                    <div
                      key={s.stepNumber}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: isBreakdown
                          ? 'rgba(239, 68, 68, 0.12)'
                          : s.isCorrect
                          ? 'rgba(16, 185, 129, 0.08)'
                          : 'var(--bg-tertiary)',
                        border: isBreakdown
                          ? '1px solid var(--critical-gap)'
                          : s.isCorrect
                          ? '1px solid rgba(16, 185, 129, 0.3)'
                          : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {isBreakdown ? (
                          <XCircle size={18} color="var(--critical-gap)" />
                        ) : s.isCorrect ? (
                          <CheckCircle2 size={18} color="var(--mastered)" />
                        ) : (
                          <AlertTriangle size={18} color="var(--developing)" />
                        )}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            Step {s.stepNumber}: {s.expression}
                          </span>
                          {isBreakdown && (
                            <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                              Breakdown Point
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: isBreakdown ? '#fca5a5' : 'var(--text-secondary)' }}>
                          {s.comment}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Exact Root Misconception Card */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                  <AlertTriangle size={16} color="var(--developing)" />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--developing)' }}>
                    Diagnosed Misconception: {analysisResult.mistakeCategory.replace(/_/g, ' ').toUpperCase()}
                  </strong>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {analysisResult.overallDiagnosis}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <strong>Targeted Remedy:</strong> {analysisResult.remedyLesson}
                </div>
              </div>

              {/* Action: Open Micro-Lesson on the Root Prerequisite */}
              <button
                onClick={() => onStartRemedialLesson('math_distributive_property')}
                className="btn-accent"
                style={{ justifyContent: 'center', width: '100%', marginTop: 'auto' }}
              >
                Launch Targeted Micro-Lesson on Distributive Property <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
