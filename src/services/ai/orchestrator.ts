import {
  ChatMessage,
  Question,
  StudentProfile,
  StudentAttempt,
  TeachingMode
} from '../../types';
import { getConceptById } from '../../data/knowledgeGraph';
import { tutorAgent } from './tutorAgent';
import { assessorAgent } from './assessorAgent';
import { evaluatorAgent } from './evaluatorAgent';
import { plannerAgent } from './plannerAgent';
import { verifierAgent } from './verifierAgent';
import { geminiClient } from './geminiClient';
import { learnerService } from '../learnerModel';

export class LearningOrchestrator {
  /**
   * Process an incoming conversational message from the student
   */
  public async handleStudentMessage(
    messageText: string,
    activeConceptId: string,
    activeQuestion?: Question,
    preferredMode: TeachingMode = 'socratic_questioning',
    currentProfile: StudentProfile = learnerService.getProfile()
  ): Promise<ChatMessage> {
    const concept = getConceptById(activeConceptId) || {
      id: activeConceptId,
      name: 'Algebraic Principles',
      chapter: 'Foundations',
      description: 'Foundations of mathematical reasoning',
      level: 1,
      bloomLevel: 'application' as const,
      subjectId: 'mathematics' as const,
      prerequisites: [],
      realWorldApplication: 'Real-world problem modeling',
      commonMisconceptions: []
    };

    // 1. Try Gemini API first if configured
    if (geminiClient.hasApiKey()) {
      const systemPrompt = `You are AI Learning Coach for SDG 4 (Quality Education).
Your goal is NOT to answer homework questions directly.
Your goal is to guide students using the Socratic method and help them think independently.
Active Concept: ${concept.name}.
Description: ${concept.description}.
Mode: ${preferredMode}.
Student grade: ${currentProfile.grade}.
Rules:
- Never just reveal the final answer.
- Ask a guiding question or provide a targeted scaffold.
- Keep response concise and inspiring.
- Format math in LaTeX $...$.`;

      const aiResponse = await geminiClient.generateContent(
        systemPrompt,
        `Student says: "${messageText}"`
      );

      if (aiResponse) {
        return {
          id: `msg_${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toISOString(),
          content: aiResponse,
          teachingMode: preferredMode,
          activeQuestion
        };
      }
    }

    // 2. Deterministic Pedagogical AI Engine
    const socratic = tutorAgent.generateSocraticResponse(
      messageText,
      concept,
      activeQuestion,
      preferredMode
    );

    return {
      id: `msg_${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      content: socratic.messageText,
      latexFormula: socratic.latexEquation,
      teachingMode: socratic.teachingMode,
      activeQuestion,
      interactiveOptions: socratic.options
    };
  }

  /**
   * Process a student attempt on a question with mistake diagnosis and real-time adaptation
   */
  public handleQuestionAnswer(
    question: Question,
    studentAnswer: string,
    timeSpentSec: number,
    confidenceReported: 1 | 2 | 3 | 4 | 5,
    hintsUsedCount: number
  ): {
    attempt: StudentAttempt;
    feedbackMessage: ChatMessage;
    requiresIntervention: boolean;
    recommendedPrerequisiteId?: string;
  } {
    const isCorrect = studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();

    let diagnosedMistake: StudentAttempt['diagnosedMistake'] = undefined;
    let requiresIntervention = false;
    let recommendedPrereq: string | undefined = undefined;

    if (!isCorrect) {
      const classification = evaluatorAgent.classifyMistake(question, studentAnswer);
      diagnosedMistake = {
        category: classification.category,
        description: classification.description,
        targetPrerequisiteId: classification.targetPrerequisiteId,
        scaffoldingAdvice: classification.advice
      };

      // Check if this error points to a missing prerequisite
      if (classification.targetPrerequisiteId) {
        requiresIntervention = true;
        recommendedPrereq = classification.targetPrerequisiteId;
      }
    }

    const attempt: StudentAttempt = {
      id: `att_${Date.now()}`,
      timestamp: new Date().toISOString(),
      questionId: question.id,
      conceptId: question.conceptId,
      studentAnswer,
      isCorrect,
      timeSpentSec,
      confidenceReported,
      hintsUsedCount,
      diagnosedMistake
    };

    // Record into the learner model (triggers multi-signal mastery update)
    learnerService.recordAttempt(attempt);

    // Formulate feedback chat message
    let feedbackContent = '';
    if (isCorrect) {
      feedbackContent = `Outstanding work! You arrived at ${question.correctAnswer} with solid reasoning.`;
      if (confidenceReported <= 2) {
        feedbackContent += ` Notice that your confidence was rated low, yet you solved it accurately! Trust your skills.`;
      }
    } else {
      feedbackContent = `Not quite, but this is a valuable learning signal.\n\n**Diagnosis:** ${diagnosedMistake?.description}\n\n💡 **Coaching Tip:** ${diagnosedMistake?.scaffoldingAdvice}`;
    }

    const feedbackMessage: ChatMessage = {
      id: `msg_eval_${Date.now()}`,
      sender: 'ai',
      timestamp: new Date().toISOString(),
      content: feedbackContent,
      latexFormula: isCorrect ? undefined : question.latexEquation,
      teachingMode: isCorrect ? 'socratic_questioning' : 'visual_explanation'
    };

    return {
      attempt,
      feedbackMessage,
      requiresIntervention,
      recommendedPrerequisiteId: recommendedPrereq
    };
  }
}

export const orchestrator = new LearningOrchestrator();
export { tutorAgent, assessorAgent, evaluatorAgent, plannerAgent, verifierAgent, geminiClient };
