/**
 * VerifierAgent: Anti-Hallucination & Mathematical Correctness Layer
 * Validates generated solutions, equations, and answer keys before presentation.
 */

export class VerifierAgent {
  /**
   * Safely evaluate numeric math expressions
   */
  public evaluateNumericExpression(expr: string): number | null {
    try {
      // Clean expression of spaces and standard notation
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/[^0-9+\-*/().]/g, '');

      // Check for division by zero
      if (/\/0(?![0-9])/.test(sanitized)) {
        return null;
      }

      // Safe arithmetic evaluator using Function constructor with restricted scope
      const result = new Function(`'use strict'; return (${sanitized});`)();
      return typeof result === 'number' && !isNaN(result) ? result : null;
    } catch {
      return null;
    }
  }

  /**
   * Validates linear equation solution: checks if substituting x into LHS equals RHS
   */
  public verifyLinearSolution(
    lhsTemplate: (x: number) => number,
    rhsTemplate: (x: number) => number,
    candidateX: number
  ): boolean {
    try {
      const lhs = lhsTemplate(candidateX);
      const rhs = rhsTemplate(candidateX);
      return Math.abs(lhs - rhs) < 0.0001;
    } catch {
      return false;
    }
  }

  /**
   * Verify distractor options uniqueness & ensure exactly one option matches the correct answer
   */
  public validateMultipleChoiceQuestion(options: string[], correctAnswer: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    if (!options || options.length < 2) {
      issues.push('Question must have at least 2 distinct options.');
    }
    const uniqueOptions = new Set(options);
    if (uniqueOptions.size !== options.length) {
      issues.push('Duplicate options detected.');
    }
    const matchingCorrect = options.filter(opt => opt.trim() === correctAnswer.trim());
    if (matchingCorrect.length === 0) {
      issues.push(`Correct answer "${correctAnswer}" is not present in the options list.`);
    } else if (matchingCorrect.length > 1) {
      issues.push('Multiple identical correct answers detected.');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Compare two algebraic expressions at test points to verify mathematical equivalence
   */
  public testEquivalence(
    fnA: (x: number) => number,
    fnB: (x: number) => number,
    samplePoints = [-3, -1, 0, 2, 5]
  ): boolean {
    return samplePoints.every(pt => {
      try {
        const valA = fnA(pt);
        const valB = fnB(pt);
        return Math.abs(valA - valB) < 0.0001;
      } catch {
        return false;
      }
    });
  }
}

export const verifierAgent = new VerifierAgent();
