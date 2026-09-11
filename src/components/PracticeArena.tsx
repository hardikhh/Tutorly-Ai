import React, { useState, useEffect } from 'react';
import { Question, StudentProfile } from '../types';
import { SAMPLE_QUESTIONS, getConceptById, KNOWLEDGE_GRAPH_NODES } from '../data/knowledgeGraph';
import { orchestrator } from '../services/ai/orchestrator';
import { KatexRenderer } from './KatexRenderer';
import { learnerService } from '../services/learnerModel';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PracticeArenaProps {
  initialConceptId?: string;
  profile: StudentProfile;
  onProfileUpdated: () => void;
  onSwitchToLesson: (conceptId: string) => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  initialConceptId = 'math_linear_equations',
  profile,
  onProfileUpdated,
  onSwitchToLesson
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(initialConceptId);
  const [activeQuestion, setActiveQuestion] = useState<Question>(() => {
    return (
      SAMPLE_QUESTIONS.find(q => q.conceptId === initialConceptId) ||
      SAMPLE_QUESTIONS[0]
    );
  });

  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [hintsRevealed, setHintsRevealed] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    mistakeCategory?: string;
    advice?: string;
  } | null>(null);

  const [difficultyTier, setDifficultyTier] = useState<'easy' | 'medium' | 'hard' | 'mastery_challenge'>('medium');
  const [consecutiveMistakes, setConsecutiveMistakes] = useState<number>(0);
  const [adaptationIntervention, setAdaptationIntervention] = useState<{
    show: boolean;
    reason: string;
    prereqId?: string;
  }>({ show: false, reason: '' });

  const currentConcept = getConceptById(selectedConceptId) || KNOWLEDGE_GRAPH_NODES[0];
  const conceptMastery = profile.masteryByConcept[selectedConceptId];

  // Update question when concept changes
  useEffect(() => {
    const matching = SAMPLE_QUESTIONS.find(q => q.conceptId === selectedConceptId);
    if (matching) {
      setActiveQuestion(matching);
    } else {
      // Fallback synthetic question
      setActiveQuestion({
        id: `prac_${selectedConceptId}`,
        conceptId: selectedConceptId,
        conceptName: currentConcept.name,
        prompt: `Apply foundational principles to solve for ${currentConcept.name}:`,
        latexEquation: currentConcept.keyFormulaLatex,
        questionType: 'multiple_choice',
        difficulty: difficultyTier,
        options: ['Accurate Solution', 'Inverted Operation', 'Omitted Prerequisite', 'Arithmetic Slip'],
        correctAnswer: 'Accurate Solution',
        explanation: `Applies ${currentConcept.description}`,
        hints: ['Consider the balance of the equation at each step.']
      });
    }
    setSelectedAnswer('');
    setHintsRevealed(0);
    setHasSubmitted(false);
    setFeedback(null);
  }, [selectedConceptId, difficultyTier]);

  const handleRevealHint = () => {
    if (hintsRevealed < activeQuestion.hints.length) {
      setHintsRevealed(prev => prev + 1);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || hasSubmitted) return;

    const result = orchestrator.handleQuestionAnswer(
      activeQuestion,
      selectedAnswer,
      15, // time spent
      confidenceLevel,
      hintsRevealed
    );

    setHasSubmitted(true);
    setFeedback({
      isCorrect: result.attempt.isCorrect,
      explanation: activeQuestion.explanation,
      mistakeCategory: result.attempt.diagnosedMistake?.category,
      advice: result.attempt.diagnosedMistake?.scaffoldingAdvice
    });

    if (result.attempt.isCorrect) {
      setConsecutiveMistakes(0);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      // Scale difficulty up
      if (difficultyTier === 'easy') setDifficultyTier('medium');
      else if (difficultyTier === 'medium') setDifficultyTier('hard');
      else if (difficultyTier === 'hard') setDifficultyTier('mastery_challenge');
    } else {
      const newMistakes = consecutiveMistakes + 1;
      setConsecutiveMistakes(newMistakes);

      // Scale difficulty down or trigger mid-session intervention
      if (difficultyTier === 'mastery_challenge') setDifficultyTier('hard');
      else if (difficultyTier === 'hard') setDifficultyTier('medium');
      else if (difficultyTier === 'medium') setDifficultyTier('easy');

      if (newMistakes >= 2 || result.requiresIntervention) {
        setAdaptationIntervention({
          show: true,
          reason: `Detected pattern of difficulty with ${result.attempt.diagnosedMistake?.category?.replace(/_/g, ' ')}. Switching to prerequisite reinforcement.`,
          prereqId: result.recommendedPrerequisiteId
        });
      }
    }

    onProfileUpdated();
  };

  const handleNextProblem = () => {
    setSelectedAnswer('');
    setHintsRevealed(0);
    setHasSubmitted(false);
    setFeedback(null);
  };

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: '900px' }}>
      {/* Header & Concept Selection */}
      <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
            <Award size={22} color="var(--primary-light)" />
            <h1 style={{ fontSize: '1.8rem' }}>Adaptive Practice Arena</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Questions dynamically adjust in difficulty and cognitive complexity based on your mastery signals.
          </p>
        </div>

        {/* Concept Dropdown */}
        <select
          value={selectedConceptId}
          onChange={e => setSelectedConceptId(e.target.value)}
          style={{
            fontSize: '0.85rem',
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {KNOWLEDGE_GRAPH_NODES.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({profile.masteryByConcept[c.id]?.masteryScore || 0}%)
            </option>
          ))}
        </select>
      </div>

      {/* Real-Time Adaptation Mid-Session Alert */}
      {adaptationIntervention.show && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid var(--developing)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={22} color="var(--developing)" />
            <div>
              <strong style={{ color: 'var(--developing)', fontSize: '0.9rem' }}>
                Real-Time Adaptation Triggered
              </strong>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                {adaptationIntervention.reason}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (adaptationIntervention.prereqId) {
                  onSwitchToLesson(adaptationIntervention.prereqId);
                } else {
                  onSwitchToLesson(selectedConceptId);
                }
              }}
              className="btn-primary"
              style={{ fontSize: '0.8rem', padding: '6px 14px' }}
            >
              Open Targeted Socratic Lesson <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setAdaptationIntervention({ show: false, reason: '' })}
              className="btn-ghost"
              style={{ fontSize: '0.8rem' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        {/* Difficulty & Mastery State Bar */}
        <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
          <div className="flex items-center gap-2">
            <span
              className="badge"
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-light)',
                border: '1px solid var(--border-accent)'
              }}
            >
              Cognitive Level: {currentConcept.bloomLevel.toUpperCase()}
            </span>

            <span
              className="badge"
              style={{
                background:
                  difficultyTier === 'mastery_challenge'
                    ? 'var(--accent-purple-glow)'
                    : difficultyTier === 'hard'
                    ? 'var(--critical-gap-bg)'
                    : difficultyTier === 'medium'
                    ? 'var(--developing-bg)'
                    : 'var(--learning-bg)',
                color:
                  difficultyTier === 'mastery_challenge'
                    ? 'var(--accent-purple)'
                    : difficultyTier === 'hard'
                    ? 'var(--critical-gap)'
                    : difficultyTier === 'medium'
                    ? 'var(--developing)'
                    : 'var(--learning)'
              }}
            >
              Difficulty: {difficultyTier.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Current Mastery: <strong style={{ color: 'var(--primary-light)' }}>{conceptMastery?.masteryScore || 0}%</strong>
          </div>
        </div>

        {/* Prompt */}
        <h2 style={{ fontSize: '1.3rem', marginBottom: '14px' }}>{activeQuestion.prompt}</h2>

        {activeQuestion.latexEquation && (
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
            <KatexRenderer latex={activeQuestion.latexEquation} block />
          </div>
        )}

        {/* Options */}
        <div className="flex flex-col gap-3" style={{ margin: '24px 0' }}>
          {activeQuestion.options?.map((opt, idx) => {
            const isSelected = selectedAnswer === opt;
            const isCorrect = opt === activeQuestion.correctAnswer;
            let bgColor = 'var(--bg-tertiary)';
            let borderColor = 'var(--border-medium)';

            if (hasSubmitted) {
              if (isCorrect) {
                bgColor = 'rgba(16, 185, 129, 0.2)';
                borderColor = 'var(--mastered)';
              } else if (isSelected && !isCorrect) {
                bgColor = 'rgba(239, 68, 68, 0.2)';
                borderColor = 'var(--critical-gap)';
              }
            } else if (isSelected) {
              bgColor = 'rgba(99, 102, 241, 0.25)';
              borderColor = 'var(--primary-light)';
            }

            return (
              <button
                key={idx}
                disabled={hasSubmitted}
                onClick={() => setSelectedAnswer(opt)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: isSelected ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{opt}</span>
                {hasSubmitted && isCorrect && <CheckCircle2 size={18} color="var(--mastered)" />}
                {hasSubmitted && isSelected && !isCorrect && <XCircle size={18} color="var(--critical-gap)" />}
              </button>
            );
          })}
        </div>

        {/* Hints Bar */}
        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
          <button
            onClick={handleRevealHint}
            disabled={hintsRevealed >= activeQuestion.hints.length || hasSubmitted}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <Lightbulb size={15} color="var(--developing)" />
            {hintsRevealed === 0
              ? 'Request Pedagogical Hint (-5% penalty)'
              : hintsRevealed < activeQuestion.hints.length
              ? `Next Hint (${hintsRevealed}/${activeQuestion.hints.length})`
              : 'All Hints Revealed'}
          </button>

          {hintsRevealed > 0 && (
            <div style={{ fontSize: '0.8rem', color: 'var(--developing)', fontStyle: 'italic' }}>
              Hint {hintsRevealed}: {activeQuestion.hints[hintsRevealed - 1]}
            </div>
          )}
        </div>

        {/* Metacognitive Confidence Rating */}
        {!hasSubmitted && (
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '24px'
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Rate your confidence (1 = Guess, 5 = Absolute Mastery):
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                {confidenceLevel} / 5
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setConfidenceLevel(lvl as 1 | 2 | 3 | 4 | 5)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: 'var(--radius-sm)',
                    background: confidenceLevel === lvl ? 'var(--primary)' : 'var(--bg-input)',
                    color: confidenceLevel === lvl ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section after Submission */}
        {hasSubmitted && feedback && (
          <div
            style={{
              padding: '18px 22px',
              borderRadius: 'var(--radius-md)',
              background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${feedback.isCorrect ? 'var(--mastered)' : 'var(--critical-gap)'}`,
              marginBottom: '24px'
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
              {feedback.isCorrect ? (
                <>
                  <CheckCircle2 size={18} color="var(--mastered)" />
                  <strong style={{ color: 'var(--mastered)', fontSize: '0.95rem' }}>
                    Correct! Concept reinforced.
                  </strong>
                </>
              ) : (
                <>
                  <AlertCircle size={18} color="var(--critical-gap)" />
                  <strong style={{ color: 'var(--critical-gap)', fontSize: '0.95rem' }}>
                    Mistake Diagnosed: {feedback.mistakeCategory?.replace(/_/g, ' ').toUpperCase()}
                  </strong>
                </>
              )}
            </div>

            <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {feedback.explanation}
            </div>

            {feedback.advice && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                💡 <strong>Coach Advice:</strong> {feedback.advice}
              </div>
            )}
          </div>
        )}

        {/* Submit or Next Button */}
        {!hasSubmitted ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: selectedAnswer ? 1 : 0.5 }}
          >
            Submit Answer & Diagnose Performance
          </button>
        ) : (
          <button
            onClick={handleNextProblem}
            className="btn-accent"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            Next Adaptive Question <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
