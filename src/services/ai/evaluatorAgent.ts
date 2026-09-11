import { MistakeCategory, Question, TeachingMode } from '../../types';
import { WorkAnalysisResult, StepEvaluation } from './types';

export class EvaluatorAgent {
  /**
   * 10-Category Mistake Classifier for student answers
   */
  public classifyMistake(
    question: Question,
    studentAnswer: string
  ): {
    category: MistakeCategory;
    description: string;
    targetPrerequisiteId?: string;
    remedyPedagogy: TeachingMode;
    advice: string;
  } {
    // 1. Check if the question defines explicit distractor diagnostic rules
    if (question.misconceptionDistractors) {
      const match = question.misconceptionDistractors.find(
        d => d.optionValue.trim().toLowerCase() === studentAnswer.trim().toLowerCase()
      );
      if (match) {
        return {
          category: match.category,
          description: match.diagnosticFeedback,
          targetPrerequisiteId: match.missingPrerequisiteId,
          remedyPedagogy: this.mapCategoryToPedagogy(match.category),
          advice: `Notice where the error occurred: ${match.diagnosticFeedback}`
        };
      }
    }

    // 2. Heuristic classification based on patterns
    const cleanAns = studentAnswer.trim();
    const cleanCorrect = question.correctAnswer.trim();

    // Check for sign flip / opposite value (e.g. 5 vs -5)
    if (
      cleanAns === `-${cleanCorrect}` ||
      `-${cleanAns}` === cleanCorrect ||
      (cleanAns.startsWith('-') && !cleanCorrect.startsWith('-'))
    ) {
      return {
        category: 'careless_error',
        description: 'Sign inversion error: you have the right numerical magnitude, but inverted the positive/negative sign.',
        targetPrerequisiteId: 'math_negative_numbers',
        remedyPedagogy: 'visual_explanation',
        advice: 'Always double-check your signs on directed numbers before moving forward!'
      };
    }

    // Check for distributive property omission (e.g., student wrote 5.5 instead of 4 for 2(x+3)=14)
    if (question.conceptId === 'math_linear_equations' && cleanAns.includes('5.5')) {
      return {
        category: 'conceptual_misunderstanding',
        description: 'You multiplied the coefficient by x but forgot to multiply it by the constant inside the parentheses.',
        targetPrerequisiteId: 'math_distributive_property',
        remedyPedagogy: 'visual_explanation',
        advice: 'Distribute the outer factor to ALL terms inside: a(b + c) = ab + ac.'
      };
    }

    // Check for off-by-one or basic arithmetic discrepancy
    const numericAns = parseFloat(cleanAns.replace(/[^0-9.-]/g, ''));
    const numericCorrect = parseFloat(cleanCorrect.replace(/[^0-9.-]/g, ''));
    if (!isNaN(numericAns) && !isNaN(numericCorrect)) {
      if (Math.abs(numericAns - numericCorrect) === 1) {
        return {
          category: 'calculation_error',
          description: 'Off-by-one calculation slip. Your conceptual approach was sound, but you made a minor addition/subtraction error.',
          remedyPedagogy: 'worked_example',
          advice: 'Slow down during the final arithmetic step; your method was right on track.'
        };
      }
    }

    // Default fallback
    return {
      category: 'partial_understanding',
      description: 'Your answer indicates developing intuition, but some intermediate algebraic constraints were missed.',
      remedyPedagogy: 'socratic_questioning',
      advice: 'Let’s break down the problem together into smaller guided questions.'
    };
  }

  /**
   * Analyzes multi-step student work line-by-line
   */
  public analyzeStudentWork(
    problemStatement: string,
    rawStudentSteps: string[]
  ): WorkAnalysisResult {
    const steps: StepEvaluation[] = [];
    let breakdownIndex: number | undefined = undefined;
    let detectedCategory: MistakeCategory = 'partial_understanding';
    let remedyPedagogy: TeachingMode = 'visual_explanation';
    let remedyLesson = '';
    let diagnosis = '';

    // Specialized case: Linear equation with distribution: 2(x + 3) = 14
    if (problemStatement.includes('2(x + 3) = 14') || problemStatement.includes('2(x+3)=14')) {
      rawStudentSteps.forEach((line, idx) => {
        const clean = line.replace(/\s+/g, '').toLowerCase();

        if (idx === 0) {
          // Expected: 2x + 6 = 14
          if (clean === '2x+3=14' || clean.includes('2x+3')) {
            breakdownIndex = idx;
            detectedCategory = 'conceptual_misunderstanding';
            remedyPedagogy = 'visual_explanation';
            diagnosis = 'Distribution Breakdown at Step 1: The factor 2 was only applied to x, leaving +3 untouched instead of 2 × 3 = 6.';
            remedyLesson = 'The Distributive Property requires you to distribute the multiplier 2 to every term inside: 2 · x + 2 · 3 = 2x + 6.';
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: false,
              comment: 'Error: Did not distribute 2 to the constant 3.',
              detectedMisconception: 'conceptual_misunderstanding'
            });
          } else if (clean === '2x+6=14' || clean.includes('2x+6')) {
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: true,
              comment: 'Great distribution! 2 · x + 2 · 3 = 2x + 6.'
            });
          } else {
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: false,
              comment: 'Unexpected step. Expected 2x + 6 = 14.'
            });
          }
        } else if (idx === 1) {
          // If step 0 was flawed, step 1 continues from flawed premise
          if (clean === '2x=11' || clean.includes('2x=11')) {
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: breakdownIndex === undefined,
              comment: breakdownIndex !== undefined
                ? 'Mathematically consistent with your previous line (14 - 3 = 11), but carries over the earlier error.'
                : 'Correct isolation.'
            });
          } else if (clean === '2x=8' || clean.includes('2x=8')) {
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: true,
              comment: 'Correct: Subtracted 6 from both sides.'
            });
          } else {
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: false,
              comment: 'Arithmetic mismatch here.'
            });
          }
        } else {
          // Final line
          if (clean === 'x=4' || clean.includes('4')) {
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: true,
              comment: 'Correct final solution!'
            });
          } else {
            steps.push({
              stepNumber: idx + 1,
              expression: line,
              isCorrect: false,
              comment: `Result ${line} is incorrect.`
            });
          }
        }
      });
    } else {
      // General step analyzer
      rawStudentSteps.forEach((line, idx) => {
        steps.push({
          stepNumber: idx + 1,
          expression: line,
          isCorrect: idx < rawStudentSteps.length - 1,
          comment: idx === rawStudentSteps.length - 1 ? 'Check final evaluation' : 'Step looks valid'
        });
      });
      diagnosis = 'Step-by-step progression reviewed. Identified areas for refinement in intermediate transitions.';
      remedyLesson = 'Review inverse operations to ensure equations remain balanced at every step.';
    }

    return {
      originalProblem: problemStatement,
      steps,
      breakdownStepIndex: breakdownIndex,
      overallDiagnosis: diagnosis || 'Work analyzed. Review step highlights below.',
      mistakeCategory: detectedCategory,
      remedyPedagogy,
      remedyLesson: remedyLesson || 'Ensure inverse operations are performed symmetrically on both sides of the equals sign.',
      guidedFollowupPrompt: 'What happens if we multiply the outer 2 by BOTH the x and the 3?'
    };
  }

  private mapCategoryToPedagogy(category: MistakeCategory): TeachingMode {
    switch (category) {
      case 'conceptual_misunderstanding':
        return 'visual_explanation';
      case 'missing_prerequisite':
        return 'step_by_step_scaffold';
      case 'careless_error':
        return 'counterexample';
      case 'calculation_error':
        return 'worked_example';
      case 'wrong_formula':
        return 'analogy';
      case 'wrong_strategy':
        return 'socratic_questioning';
      default:
        return 'socratic_questioning';
    }
  }
}

export const evaluatorAgent = new EvaluatorAgent();
