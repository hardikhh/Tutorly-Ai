import { ConceptNode, TeachingMode, Question } from '../../types';
import { SocraticResponse } from './types';

export class TutorAgent {
  /**
   * Generates a Socratic response tailored to the student's inquiry or mistake
   */
  public generateSocraticResponse(
    studentMessage: string,
    concept: ConceptNode,
    activeQuestion?: Question,
    preferredMode: TeachingMode = 'socratic_questioning'
  ): SocraticResponse {
    const text = studentMessage.toLowerCase();

    // Check if the student is asking for a direct answer
    const asksDirectAnswer =
      text.includes('what is the answer') ||
      text.includes('just tell me') ||
      text.includes('give me the answer') ||
      text.includes('solve it for me') ||
      text.includes('answer to');

    if (asksDirectAnswer && activeQuestion) {
      return {
        messageText:
          `I want to make sure you truly master this rather than just handing you the answer! Let's take it one step at a time. What operation should we undo first to isolate the variable?`,
        latexEquation: activeQuestion.latexEquation,
        teachingMode: 'socratic_questioning',
        guidedQuestion: 'Which term is currently furthest from the variable on the left side?',
        options: ['The constant term (+3 or -7)', 'The coefficient attached to x', 'Both simultaneously'],
        encouragement: 'You are capable of solving this! Think about the inverse operation.',
        nextBestAction: 'continue_dialogue'
      };
    }

    // Check if the student expresses frustration or being stuck
    if (text.includes("i don't understand") || text.includes('stuck') || text.includes('confused') || text.includes('help')) {
      return this.provideAdaptiveScaffolding(concept, preferredMode, activeQuestion);
    }

    // Pedagogical mode responses
    switch (preferredMode) {
      case 'analogy':
        return {
          messageText: `Think of this concept like an analogy:\n\n${concept.visualMetaphor || 'A balanced seesaw: whatever you do to one side, you must do to the other to keep it level.'}`,
          latexEquation: concept.keyFormulaLatex,
          teachingMode: 'analogy',
          encouragement: 'Does this picture help visualize how the equation stays balanced?',
          nextBestAction: 'continue_dialogue'
        };

      case 'real_world_example':
        return {
          messageText: `Here is where you see this in the real world:\n\n${concept.realWorldApplication}`,
          latexEquation: concept.keyFormulaLatex,
          teachingMode: 'real_world_example',
          encouragement: 'Connecting abstract symbols to concrete situations makes them stick!',
          nextBestAction: 'continue_dialogue'
        };

      case 'visual_explanation':
        return {
          messageText: `Let's visualize the geometry of this problem:\n\n${concept.visualMetaphor || 'Imagine physical weights on a scale balance.'}\n\nWhen we apply an operation, imagine adding or removing equal physical blocks from each side.`,
          latexEquation: concept.keyFormulaLatex,
          teachingMode: 'visual_explanation',
          encouragement: 'Visualizing equations turns algebra into spatial logic.',
          nextBestAction: 'continue_dialogue'
        };

      case 'worked_example':
        return {
          messageText: `Here is a parallel worked example to observe:\n\nProblem: Solve $3(x + 2) = 18$\n\nStep 1: Distribute 3 to both x and 2: $3x + 6 = 18$\nStep 2: Subtract 6 from both sides: $3x = 12$\nStep 3: Divide by 3: $x = 4$\n\nNotice how the distributive multiplier touched EVERY term inside the parentheses!`,
          latexEquation: '3(x + 2) = 18 \\implies 3x + 6 = 18 \\implies x = 4',
          teachingMode: 'worked_example',
          encouragement: 'Can you spot where the multiplier was distributed in Step 1?',
          nextBestAction: 'attempt_question'
        };

      case 'counterexample':
        return {
          messageText: `Let's test why the common shortcut fails by testing a counterexample:\n\nIf someone writes $2(x + 3) = 2x + 3$ and plugs in $x = 1$:\nLHS: $2(1 + 3) = 2(4) = 8$\nRHS: $2(1) + 3 = 2 + 3 = 5$\nSince $8 \\neq 5$, the formula broke! To keep it true, we must multiply the 3 by 2 as well: $2(3) = 6$.`,
          latexEquation: '2(1 + 3) = 8 \\neq 5',
          teachingMode: 'counterexample',
          encouragement: 'Counterexamples are the strongest proof in mathematics.',
          nextBestAction: 'continue_dialogue'
        };

      case 'teach_back':
        return {
          messageText: `You are now the teacher! Explain in your own words: why do we have to perform the same operation on both sides of an equals sign?`,
          teachingMode: 'teach_back',
          encouragement: 'Teaching a concept back is the single highest-retention learning technique.',
          nextBestAction: 'continue_dialogue'
        };

      case 'socratic_questioning':
      default:
        return {
          messageText: `Let's reason through ${concept.name}. If we want to isolate our variable, what is our goal for the numbers surrounding it?`,
          latexEquation: concept.keyFormulaLatex,
          teachingMode: 'socratic_questioning',
          guidedQuestion: 'What is the inverse operation of addition?',
          options: ['Subtraction', 'Multiplication', 'Division'],
          encouragement: 'Take your time to reflect on the relationship.',
          nextBestAction: 'continue_dialogue'
        };
    }
  }

  /**
   * Adaptive scaffolding for students when stuck
   */
  public provideAdaptiveScaffolding(
    concept: ConceptNode,
    mode: TeachingMode,
    activeQuestion?: Question
  ): SocraticResponse {
    return {
      messageText:
        `It is completely normal to feel stuck at this step! That is where real cognitive growth happens. Let's switch our explanation angle:\n\n${concept.visualMetaphor || 'Think of this like an unwrapping process.'}\n\nWhat would happen if we isolated the simplest part first?`,
      latexEquation: activeQuestion?.latexEquation || concept.keyFormulaLatex,
      teachingMode: mode === 'visual_explanation' ? 'analogy' : 'visual_explanation',
      guidedQuestion: 'Would you like a hint, a simpler example, or a step breakdown?',
      options: ['Give me a subtle hint', 'Show a simpler example', 'Break into smaller steps', 'Show a visual diagram'],
      encouragement: 'Every expert was once a beginner who persisted through this exact hurdle.',
      nextBestAction: 'continue_dialogue'
    };
  }

  /**
   * 7-Tier Progressive "I'm Stuck" Drawer Content
   */
  public getStuckDrawerTier(
    tier: number,
    concept: ConceptNode,
    question?: Question
  ): {
    tierNumber: number;
    tierTitle: string;
    description: string;
    latex?: string;
    guidance: string;
    suggestedReply: string;
  } {
    switch (tier) {
      case 1:
        return {
          tierNumber: 1,
          tierTitle: 'Subtle Nudge (Hint 1)',
          description: 'A gentle orientation clue that preserves the discovery challenge.',
          guidance: question?.hints[0] || 'Identify the operation currently holding the terms together.',
          latex: question?.latexEquation,
          suggestedReply: 'I see that. What should I do next?'
        };
      case 2:
        return {
          tierNumber: 2,
          tierTitle: 'Simpler Numerical Example',
          description: 'Same mathematical structure using friendly small whole numbers.',
          guidance: 'Instead of complex coefficients, try: $2(x + 1) = 6$. What is $2 \\times x$ plus $2 \\times 1$?',
          latex: '2(x + 1) = 6 \\implies 2x + 2 = 6',
          suggestedReply: 'That makes sense for the small numbers.'
        };
      case 3:
        return {
          tierNumber: 3,
          tierTitle: 'Visual / Spatial Metaphor',
          description: 'Translates symbolic variables into intuitive spatial pictures.',
          guidance: concept.visualMetaphor || 'Picture a balance scale with weights on each pan.',
          suggestedReply: 'The visual balance helps me see it.'
        };
      case 4:
        return {
          tierNumber: 4,
          tierTitle: 'Step-by-Step Unrolling',
          description: 'Deconstructs the problem into isolated sequential checkpoints.',
          guidance: 'Step 1: Expand parentheses.\nStep 2: Group like terms.\nStep 3: Move constants to the right.\nStep 4: Divide by the coefficient.',
          latex: 'a(b + c) \\to ab + ac',
          suggestedReply: 'Let me try Step 1 now.'
        };
      case 5:
        return {
          tierNumber: 5,
          tierTitle: 'Guided Socratic Multiple-Choice',
          description: 'Frames the decision as an actionable multiple-choice choice.',
          guidance: 'What is the exact result of distributing 2 across $(x + 3)$?',
          latex: '2 \\times (x + 3) = ?',
          suggestedReply: 'It is 2x + 6!'
        };
      case 6:
        return {
          tierNumber: 6,
          tierTitle: 'Parallel Worked Example',
          description: 'Complete solution for a sister problem with different numbers.',
          guidance: 'Solve $4(x + 2) = 20$:\n1. $4x + 8 = 20$\n2. $4x = 12$\n3. $x = 3$.',
          latex: '4(x + 2) = 20 \\implies x = 3',
          suggestedReply: 'I will apply the exact same steps to my problem.'
        };
      case 7:
      default:
        return {
          tierNumber: 7,
          tierTitle: 'Full Scaffolding & Conceptual Debrief',
          description: 'Complete solution breakdown with key lesson takeaways.',
          guidance: question?.explanation || 'Full step breakdown with inverse operations highlighted.',
          latex: question?.latexEquation,
          suggestedReply: 'I understand now. Give me a fresh practice problem to test myself!'
        };
    }
  }
}

export const tutorAgent = new TutorAgent();
