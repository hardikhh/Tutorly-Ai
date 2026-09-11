import {
  StudentProfile,
  StudentAttempt,
  ConceptMastery,
  MasteryLevel,
  MistakeCategory,
  TeachingMode
} from '../types';
import { KNOWLEDGE_GRAPH_NODES, getConceptById } from '../data/knowledgeGraph';

const STORAGE_KEY = 'ai_learning_coach_profile_v1';

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  id: 'stu_demo_01',
  name: 'Alex Rivera',
  grade: 'Grade 10',
  targetGoal: 'Master Linear Systems & Score 90%+ in Algebra',
  targetExam: 'SAT / State Assessment',
  examDate: '2026-10-15',
  dailyTimeMinutes: 30,
  preferredLearningStyle: 'socratic',
  learningStreakDays: 0,
  totalQuestionsSolved: 28,
  totalStudyMinutes: 145,
  completedLessons: ['math_negative_numbers'],
  unlockedConcepts: [
    'math_negative_numbers',
    'math_order_of_operations',
    'math_variables_expressions',
    'math_distributive_property',
    'math_one_step_equations',
    'phys_vectors_scalars',
    'cs_variables_types'
  ],
  memoryNotes: [
    'Tends to drop negative signs when distributing coefficients like -2(x - 4)',
    'Responds very well to visual balance seesaw metaphors and guided Socratic steps',
    'Underconfident on multi-step algebra despite high accuracy'
  ],
  masteryByConcept: {
    math_negative_numbers: {
      conceptId: 'math_negative_numbers',
      masteryScore: 88,
      level: 'proficient',
      attemptsCount: 14,
      correctCount: 12,
      streak: 4,
      averageResponseTimeSec: 8.5,
      lastPracticedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      nextReviewDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      retentionStrength: 82,
      confidenceRating: 4,
      identifiedMisconceptions: ['careless_error']
    },
    math_order_of_operations: {
      conceptId: 'math_order_of_operations',
      masteryScore: 92,
      level: 'mastered',
      attemptsCount: 10,
      correctCount: 9,
      streak: 6,
      averageResponseTimeSec: 6.2,
      lastPracticedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
      nextReviewDate: new Date(Date.now() + 6 * 86400000).toISOString(),
      retentionStrength: 90,
      confidenceRating: 5,
      identifiedMisconceptions: []
    },
    math_distributive_property: {
      conceptId: 'math_distributive_property',
      masteryScore: 48,
      level: 'developing',
      attemptsCount: 8,
      correctCount: 4,
      streak: 1,
      averageResponseTimeSec: 18.0,
      lastPracticedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      nextReviewDate: new Date().toISOString(),
      retentionStrength: 52,
      confidenceRating: 2,
      identifiedMisconceptions: ['conceptual_misunderstanding', 'careless_error']
    },
    math_one_step_equations: {
      conceptId: 'math_one_step_equations',
      masteryScore: 78,
      level: 'proficient',
      attemptsCount: 12,
      correctCount: 10,
      streak: 3,
      averageResponseTimeSec: 10.0,
      lastPracticedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
      nextReviewDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      retentionStrength: 75,
      confidenceRating: 4,
      identifiedMisconceptions: []
    },
    math_linear_equations: {
      conceptId: 'math_linear_equations',
      masteryScore: 42,
      level: 'developing',
      attemptsCount: 6,
      correctCount: 2,
      streak: 0,
      averageResponseTimeSec: 26.5,
      lastPracticedDate: new Date().toISOString(),
      nextReviewDate: new Date().toISOString(),
      retentionStrength: 45,
      confidenceRating: 2,
      identifiedMisconceptions: ['missing_prerequisite', 'conceptual_misunderstanding']
    }
  },
  recentAttempts: [
    {
      id: 'att_01',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      questionId: 'q_linear_01',
      conceptId: 'math_linear_equations',
      studentAnswer: 'x = 5.5',
      isCorrect: false,
      timeSpentSec: 24,
      confidenceReported: 3,
      hintsUsedCount: 1,
      diagnosedMistake: {
        category: 'conceptual_misunderstanding',
        description: 'Failed to distribute 2 to constant 3 inside parentheses.',
        targetPrerequisiteId: 'math_distributive_property',
        scaffoldingAdvice: 'Review the distributive property before tackling multi-step equations.'
      }
    }
  ]
};

const STREAK_KEY = 'tutorly_streak_v1';

/**
 * Computes the real daily streak:
 * - First visit ever → streak = 1
 * - Visited yesterday → streak + 1
 * - Visited today already → keep current streak
 * - Missed one or more days → reset to 1
 */
function computeAndSaveStreak(currentStreak: number): number {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      const { lastVisit, streak } = JSON.parse(raw) as { lastVisit: string; streak: number };
      if (lastVisit === today) {
        // Already recorded today – keep streak unchanged
        return streak;
      }
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = lastVisit === yesterday ? streak + 1 : 1;
      localStorage.setItem(STREAK_KEY, JSON.stringify({ lastVisit: today, streak: newStreak }));
      return newStreak;
    }
  } catch {}
  // First-time visit or parse error – start at 1
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify({ lastVisit: today, streak: 1 }));
  } catch {}
  return 1;
}

export class LearnerModelService {
  private profile: StudentProfile;

  constructor() {
    this.profile = this.loadProfile();
  }

  public getProfile(): StudentProfile {
    return { ...this.profile };
  }

  private loadProfile(): StudentProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const base: StudentProfile = stored ? JSON.parse(stored) : { ...DEFAULT_STUDENT_PROFILE };
      // Always compute real streak on load (updates if it's a new day)
      const realStreak = computeAndSaveStreak(base.learningStreakDays);
      if (base.learningStreakDays !== realStreak) {
        base.learningStreakDays = realStreak;
        // Persist the updated streak immediately
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(base)); } catch {}
      }
      return base;
    } catch {
      // fallback
    }
    return { ...DEFAULT_STUDENT_PROFILE, learningStreakDays: computeAndSaveStreak(0) };
  }

  public saveProfile(newProfile: StudentProfile): void {
    this.profile = newProfile;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error('Failed to save student profile', e);
    }
  }

  public resetProfile(): StudentProfile {
    this.profile = { ...DEFAULT_STUDENT_PROFILE };
    this.saveProfile(this.profile);
    return this.profile;
  }

  public getConceptMastery(conceptId: string): ConceptMastery {
    if (this.profile.masteryByConcept[conceptId]) {
      return this.profile.masteryByConcept[conceptId];
    }
    return {
      conceptId,
      masteryScore: 0,
      level: 'unknown',
      attemptsCount: 0,
      correctCount: 0,
      streak: 0,
      averageResponseTimeSec: 0,
      lastPracticedDate: new Date(0).toISOString(),
      nextReviewDate: new Date().toISOString(),
      retentionStrength: 0,
      confidenceRating: 3,
      identifiedMisconceptions: []
    };
  }

  // Multi-signal mastery score calculator
  public recordAttempt(attempt: StudentAttempt): StudentProfile {
    const concept = getConceptById(attempt.conceptId);
    const existing = this.getConceptMastery(attempt.conceptId);

    const attemptsCount = existing.attemptsCount + 1;
    const correctCount = existing.correctCount + (attempt.isCorrect ? 1 : 0);
    const streak = attempt.isCorrect ? existing.streak + 1 : 0;

    // Response time rolling average
    const avgTime =
      existing.attemptsCount === 0
        ? attempt.timeSpentSec
        : Math.round((existing.averageResponseTimeSec * existing.attemptsCount + attempt.timeSpentSec) / attemptsCount);

    // Multi-signal mastery algorithm
    // 1. Raw accuracy factor (40%)
    const rawAccuracy = (correctCount / attemptsCount) * 100;
    // 2. Streak consistency bonus (20%) - rewards unbroken consecutive mastery
    const streakFactor = Math.min(streak * 5, 20);
    // 3. Hint dependency penalty (15%) - independent solves carry more weight
    const hintFactor = Math.max(0, 15 - attempt.hintsUsedCount * 5);
    // 4. Time efficiency factor (10%)
    const timeFactor = avgTime < 15 ? 10 : avgTime < 30 ? 7 : 4;
    // 5. Recent outcome weight (15%)
    const recentOutcomeFactor = attempt.isCorrect ? 15 : 0;

    let calculatedScore = Math.round(
      rawAccuracy * 0.4 + streakFactor + hintFactor + timeFactor + recentOutcomeFactor
    );
    calculatedScore = Math.max(0, Math.min(100, calculatedScore));

    // Determine mastery status
    let level: MasteryLevel = 'unknown';
    if (calculatedScore >= 85 && attemptsCount >= 3) {
      level = 'mastered';
    } else if (calculatedScore >= 70) {
      level = 'proficient';
    } else if (calculatedScore >= 45) {
      level = 'developing';
    } else if (attemptsCount > 0) {
      level = 'learning';
    }

    // Spaced repetition interval calculation
    const intervalsDays = [1, 2, 5, 10, 20];
    const nextInterval = intervalsDays[Math.min(streak, intervalsDays.length - 1)];
    const nextReviewDate = new Date(Date.now() + nextInterval * 86400000).toISOString();

    const misconceptions = [...existing.identifiedMisconceptions];
    if (attempt.diagnosedMistake && !misconceptions.includes(attempt.diagnosedMistake.category)) {
      misconceptions.push(attempt.diagnosedMistake.category);
    }

    const updatedMastery: ConceptMastery = {
      conceptId: attempt.conceptId,
      masteryScore: calculatedScore,
      level,
      attemptsCount,
      correctCount,
      streak,
      averageResponseTimeSec: avgTime,
      lastPracticedDate: new Date().toISOString(),
      nextReviewDate,
      retentionStrength: Math.min(100, Math.round(calculatedScore * 0.95)),
      confidenceRating: attempt.confidenceReported,
      identifiedMisconceptions: misconceptions
    };

    const newMasteryMap = {
      ...this.profile.masteryByConcept,
      [attempt.conceptId]: updatedMastery
    };

    // Check unlocks for dependent concepts
    const newUnlocked = new Set(this.profile.unlockedConcepts);
    newUnlocked.add(attempt.conceptId);

    // If score >= 65, check if downstream concepts can now be unlocked
    if (calculatedScore >= 65 && concept) {
      for (const node of KNOWLEDGE_GRAPH_NODES) {
        if (!newUnlocked.has(node.id)) {
          const allPrereqsMet = node.prerequisites.every(pId => {
            const pMastery = newMasteryMap[pId];
            return pMastery && pMastery.masteryScore >= 60;
          });
          if (allPrereqsMet) {
            newUnlocked.add(node.id);
          }
        }
      }
    }

    const updatedProfile: StudentProfile = {
      ...this.profile,
      totalQuestionsSolved: this.profile.totalQuestionsSolved + 1,
      totalStudyMinutes: this.profile.totalStudyMinutes + Math.ceil(attempt.timeSpentSec / 60),
      masteryByConcept: newMasteryMap,
      unlockedConcepts: Array.from(newUnlocked),
      recentAttempts: [attempt, ...this.profile.recentAttempts.slice(0, 19)]
    };

    this.saveProfile(updatedProfile);
    return updatedProfile;
  }

  // Metacognitive Calibration Analysis: compares reported confidence (1-5) to actual performance
  public getMetacognitiveState(conceptId: string): {
    state: 'calibrated_master' | 'calibrated_struggling' | 'overconfident' | 'underconfident';
    message: string;
    advice: string;
  } {
    const mastery = this.getConceptMastery(conceptId);
    const confidence = mastery.confidenceRating; // 1 to 5
    const score = mastery.masteryScore; // 0 to 100

    if (confidence >= 4 && score < 50) {
      return {
        state: 'overconfident',
        message: 'High Confidence vs. Emerging Knowledge Gap',
        advice: 'You feel confident, but application tests show key misconceptions. Let’s do a targeted Socratic drill to solidify the foundation!'
      };
    } else if (confidence <= 2 && score >= 75) {
      return {
        state: 'underconfident',
        message: 'Hidden Mastery vs. Self-Doubt',
        advice: 'Your observed accuracy is exceptional! You know this concept significantly better than you think. Trust your problem-solving instinct!'
      };
    } else if (score >= 70) {
      return {
        state: 'calibrated_master',
        message: 'Accurately Calibrated Mastery',
        advice: 'High self-awareness matched with proven accuracy. You are primed for mastery challenges and higher-order transfer questions.'
      };
    } else {
      return {
        state: 'calibrated_struggling',
        message: 'Aware of Growth Edge',
        advice: 'You correctly identified this as an area of growth. We will scaffold this step-by-step with zero pressure.'
      };
    }
  }

  // Get topics requiring spaced review
  public getDueRetentionConcepts(): ConceptMastery[] {
    const now = new Date();
    return Object.values(this.profile.masteryByConcept).filter(m => {
      return new Date(m.nextReviewDate) <= now && m.attemptsCount > 0;
    });
  }

  // Active intervention recommendation
  public detectRootPrerequisiteGap(strugglingConceptId: string): {
    rootConceptId: string;
    reason: string;
    teachingMode: TeachingMode;
  } | null {
    const concept = getConceptById(strugglingConceptId);
    if (!concept || concept.prerequisites.length === 0) return null;

    // Check all prerequisites in reverse dependency order
    for (const prereqId of concept.prerequisites) {
      const prereqMastery = this.getConceptMastery(prereqId);
      if (prereqMastery.masteryScore < 65) {
        return {
          rootConceptId: prereqId,
          reason: `Struggle in "${concept.name}" stems from root prerequisite "${getConceptById(prereqId)?.name}" (${prereqMastery.masteryScore}% mastery).`,
          teachingMode: 'visual_explanation'
        };
      }
    }
    return null;
  }
}

export const learnerService = new LearnerModelService();
