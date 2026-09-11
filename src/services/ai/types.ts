import {
  ConceptNode,
  MistakeCategory,
  TeachingMode,
  Question,
  StudentProfile,
  ChatMessage
} from '../../types';

export interface AgentContext {
  studentProfile: StudentProfile;
  activeConcept?: ConceptNode;
  activeQuestion?: Question;
  recentChatHistory: ChatMessage[];
  preferredMode?: TeachingMode;
}

export interface StepEvaluation {
  stepNumber: number;
  expression: string;
  isCorrect: boolean;
  comment?: string;
  detectedMisconception?: MistakeCategory;
}

export interface WorkAnalysisResult {
  originalProblem: string;
  steps: StepEvaluation[];
  breakdownStepIndex?: number;
  overallDiagnosis: string;
  mistakeCategory: MistakeCategory;
  remedyPedagogy: TeachingMode;
  remedyLesson: string;
  guidedFollowupPrompt: string;
}

export interface SocraticResponse {
  messageText: string;
  latexEquation?: string;
  teachingMode: TeachingMode;
  guidedQuestion?: string;
  options?: string[];
  encouragement: string;
  nextBestAction: 'continue_dialogue' | 'attempt_question' | 'review_prerequisite' | 'celebrate_mastery';
}
