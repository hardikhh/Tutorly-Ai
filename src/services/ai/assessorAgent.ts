import { ConceptNode, Question, MasteryLevel } from '../../types';
import { KNOWLEDGE_GRAPH_NODES, SAMPLE_QUESTIONS, getConceptById, getPrerequisiteChain } from '../../data/knowledgeGraph';

export interface DiagnosticResult {
  overallScorePercentage: number;
  evaluatedConcepts: {
    conceptId: string;
    conceptName: string;
    masteryPercentage: number;
    status: MasteryLevel | 'critical_gap';
    isRootPrerequisiteGap?: boolean;
    recommendation: string;
  }[];
  rootPrerequisiteDetected?: {
    conceptId: string;
    conceptName: string;
    reason: string;
  };
  recommendedNextConceptId: string;
}

export class AssessorAgent {
  /**
   * Generates an adaptive diagnostic test targeting core and prerequisite concepts
   */
  public generateDiagnosticTest(targetConceptId: string): Question[] {
    const chain = getPrerequisiteChain(targetConceptId);
    const questions: Question[] = [];

    // For each concept in the dependency chain, pick or generate a diagnostic question
    chain.forEach(node => {
      const matching = SAMPLE_QUESTIONS.find(q => q.conceptId === node.id);
      if (matching) {
        questions.push(matching);
      } else {
        // Generate a synthetic diagnostic question
        questions.push({
          id: `diag_${node.id}`,
          conceptId: node.id,
          conceptName: node.name,
          prompt: `Diagnostic Check for ${node.name}: Apply the fundamental principles of this concept.`,
          latexEquation: node.keyFormulaLatex,
          questionType: 'multiple_choice',
          difficulty: 'medium',
          options: ['Option A (Correct)', 'Option B (Common Slip)', 'Option C (Wrong Operation)', 'Option D (Inverted)'],
          correctAnswer: 'Option A (Correct)',
          explanation: `Demonstrates mastery of ${node.name} and its underlying foundations.`,
          hints: [`Review the definition of ${node.name}.`]
        });
      }
    });

    return questions;
  }

  /**
   * Analyzes diagnostic test answers to identify root prerequisite gaps
   */
  public evaluateDiagnostic(
    answers: { questionId: string; conceptId: string; isCorrect: boolean }[]
  ): DiagnosticResult {
    let totalCorrect = 0;
    const conceptScoreMap: Record<string, { correct: number; total: number }> = {};

    answers.forEach(ans => {
      if (ans.isCorrect) totalCorrect++;
      if (!conceptScoreMap[ans.conceptId]) {
        conceptScoreMap[ans.conceptId] = { correct: 0, total: 0 };
      }
      conceptScoreMap[ans.conceptId].total++;
      if (ans.isCorrect) {
        conceptScoreMap[ans.conceptId].correct++;
      }
    });

    const evaluatedConcepts: DiagnosticResult['evaluatedConcepts'] = [];
    let rootPrereq: { conceptId: string; conceptName: string; reason: string } | undefined = undefined;

    // Check prerequisites first
    const checkedNodes = KNOWLEDGE_GRAPH_NODES.filter(n => conceptScoreMap[n.id]);

    for (const node of checkedNodes) {
      const stats = conceptScoreMap[node.id] || { correct: 0, total: 1 };
      const pct = Math.round((stats.correct / stats.total) * 100);

      let status: MasteryLevel | 'critical_gap' = 'developing';
      if (pct >= 80) status = 'mastered';
      else if (pct >= 60) status = 'proficient';
      else if (pct >= 35) status = 'developing';
      else status = 'critical_gap';

      // Check if this node is a prerequisite for other struggling concepts
      const isPrereqForFailing = answers.some(
        a => !a.isCorrect && a.conceptId !== node.id && (getConceptById(a.conceptId)?.prerequisites.includes(node.id) ?? false)
      );

      const isRoot = status === 'critical_gap' || (pct < 50 && isPrereqForFailing);

      if (isRoot && !rootPrereq) {
        rootPrereq = {
          conceptId: node.id,
          conceptName: node.name,
          reason: `Student struggles downstream because prerequisite "${node.name}" scored ${pct}%. Intervene here first!`
        };
      }

      evaluatedConcepts.push({
        conceptId: node.id,
        conceptName: node.name,
        masteryPercentage: pct,
        status,
        isRootPrerequisiteGap: isRoot,
        recommendation: isRoot
          ? `Immediate intervention needed: Revisit ${node.name} before continuing.`
          : pct >= 80
          ? `Solid foundation confirmed.`
          : `Review recommended.`
      });
    }

    const overallPct = answers.length > 0 ? Math.round((totalCorrect / answers.length) * 100) : 0;
    const recommendedNext = rootPrereq ? (rootPrereq as { conceptId: string }).conceptId : evaluatedConcepts[0]?.conceptId || 'math_negative_numbers';

    return {
      overallScorePercentage: overallPct,
      evaluatedConcepts,
      rootPrerequisiteDetected: rootPrereq,
      recommendedNextConceptId: recommendedNext
    };
  }
}

export const assessorAgent = new AssessorAgent();
