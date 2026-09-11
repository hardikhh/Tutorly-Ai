// Domain types for AI Learning Coach (SDG 4: Quality Education)

export type SubjectId = 'mathematics' | 'physics' | 'computer_science';

export type CognitiveLevel = 'recall' | 'comprehension' | 'application' | 'analysis';

export type MasteryLevel = 'unknown' | 'learning' | 'developing' | 'proficient' | 'mastered';

export type MistakeCategory =
  | 'calculation_error'
  | 'conceptual_misunderstanding'
  | 'misread_question'
  | 'wrong_formula'
  | 'wrong_strategy'
  | 'missing_prerequisite'
  | 'careless_error'
  | 'partial_understanding'
  | 'guessing'
  | 'language_comprehension';

export type TeachingMode =
  | 'simple_explanation'
  | 'analogy'
  | 'real_world_example'
  | 'visual_explanation'
  | 'step_by_step_scaffold'
  | 'socratic_questioning'
  | 'worked_example'
  | 'counterexample'
  | 'teach_back';

export interface ConceptNode {
  id: string;
  name: string;
  subjectId: SubjectId;
  chapter: string;
  description: string;
  prerequisites: string[]; // IDs of prerequisite concepts
  level: number; // Graph depth level
  bloomLevel: CognitiveLevel;
  realWorldApplication: string;
  commonMisconceptions: string[];
  keyFormulaLatex?: string;
  visualMetaphor?: string;
}

export interface ConceptMastery {
  conceptId: string;
  masteryScore: number; // 0 to 100
  level: MasteryLevel;
  attemptsCount: number;
  correctCount: number;
  streak: number;
  averageResponseTimeSec: number;
  lastPracticedDate: string; // ISO string
  nextReviewDate: string; // ISO string (Spaced Repetition)
  retentionStrength: number; // 0 to 100 (Ebbinghaus decay)
  confidenceRating: number; // 1 to 5 self-reported
  identifiedMisconceptions: MistakeCategory[];
}

export interface Question {
  id: string;
  conceptId: string;
  conceptName: string;
  prompt: string;
  latexEquation?: string;
  questionType: 'multiple_choice' | 'numeric' | 'step_by_step' | 'text_reasoning';
  difficulty: 'easy' | 'medium' | 'hard' | 'mastery_challenge';
  options?: string[]; // for multiple choice
  correctAnswer: string;
  explanation: string;
  prerequisiteId?: string;
  hints: string[];
  misconceptionDistractors?: {
    optionValue: string;
    category: MistakeCategory;
    diagnosticFeedback: string;
    missingPrerequisiteId?: string;
  }[];
}

export interface StudentAttempt {
  id: string;
  timestamp: string;
  questionId: string;
  conceptId: string;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
  confidenceReported: 1 | 2 | 3 | 4 | 5;
  hintsUsedCount: number;
  diagnosedMistake?: {
    category: MistakeCategory;
    description: string;
    targetPrerequisiteId?: string;
    scaffoldingAdvice: string;
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  targetGoal: string;
  targetExam?: string;
  examDate?: string;
  dailyTimeMinutes: number;
  preferredLearningStyle: 'visual' | 'socratic' | 'step_by_step' | 'real_world';
  learningStreakDays: number;
  totalQuestionsSolved: number;
  totalStudyMinutes: number;
  masteryByConcept: Record<string, ConceptMastery>;
  recentAttempts: StudentAttempt[];
  completedLessons: string[]; // concept IDs
  unlockedConcepts: string[]; // concept IDs
  activeIntervention?: {
    conceptId: string;
    rootPrerequisiteId: string;
    reason: string;
    pedagogySelected: TeachingMode;
  };
  memoryNotes: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'student' | 'system';
  timestamp: string;
  content: string;
  latexFormula?: string;
  teachingMode?: TeachingMode;
  activeQuestion?: Question;
  interactiveOptions?: string[];
  stuckScaffolding?: {
    level: number;
    title: string;
    guidance: string;
    suggestedReply?: string;
  };
  stepAnalysis?: {
    originalProblem: string;
    steps: {
      stepNumber: number;
      expression: string;
      isCorrect: boolean;
      comment?: string;
    }[];
    breakdownStepIndex?: number;
    diagnosis: string;
    remedy: string;
  };
}

export interface ExamPreparationPlan {
  examName: string;
  daysRemaining: number;
  targetScore: string;
  readinessPercentage: number;
  priorityTopics: {
    conceptId: string;
    conceptName: string;
    urgency: 'high' | 'medium' | 'low';
    currentMastery: number;
  }[];
  retentionAlerts: {
    conceptId: string;
    conceptName: string;
    daysSinceReview: number;
  }[];
}

export interface ClassStudentSummary {
  id: string;
  name: string;
  overallMastery: number;
  strugglingConcepts: string[];
  recentMistakeCategory: MistakeCategory;
  lastActive: string;
  needsIntervention: boolean;
}
