import { StudentProfile, ExamPreparationPlan, SubjectId } from '../../types';
import { KNOWLEDGE_GRAPH_NODES, getConceptById } from '../../data/knowledgeGraph';

export interface DailyStudySession {
  targetConceptId: string;
  targetConceptName: string;
  estimatedMinutes: number;
  steps: {
    stepIndex: number;
    title: string;
    durationMinutes: number;
    type: 'warmup' | 'lesson' | 'guided_practice' | 'adaptive_challenge' | 'retention_check';
    description: string;
  }[];
}

export interface ProactiveNudge {
  id: string;
  type: 'spaced_retention' | 'prerequisite_alert' | 'exam_countdown' | 'streak_encouragement';
  title: string;
  message: string;
  actionText: string;
  targetConceptId?: string;
  urgency: 'high' | 'medium' | 'low';
}

export class PlannerAgent {
  /**
   * Generates a structured daily 25-30 minute study session
   */
  public generateDailySession(
    profile: StudentProfile,
    targetConceptId: string = 'math_linear_equations'
  ): DailyStudySession {
    const concept = getConceptById(targetConceptId) || KNOWLEDGE_GRAPH_NODES[0];
    const prereqId = concept.prerequisites[0];
    const prereqConcept = prereqId ? getConceptById(prereqId) : null;

    return {
      targetConceptId: concept.id,
      targetConceptName: concept.name,
      estimatedMinutes: profile.dailyTimeMinutes || 25,
      steps: [
        {
          stepIndex: 1,
          title: '3-Min Retrieval Warm-Up',
          durationMinutes: 3,
          type: 'warmup',
          description: prereqConcept
            ? `Rapid retrieval practice on prerequisite: "${prereqConcept.name}".`
            : 'Active recall on foundational rules.'
        },
        {
          stepIndex: 2,
          title: '5-Min Conceptual Scaffolding',
          durationMinutes: 5,
          type: 'lesson',
          description: `Visual explanation and intuitive real-world grounding for ${concept.name}.`
        },
        {
          stepIndex: 3,
          title: '8-Min Guided Practice with Socratic Feedback',
          durationMinutes: 8,
          type: 'guided_practice',
          description: 'Step-by-step problem attempts with instant mistake diagnosis.'
        },
        {
          stepIndex: 4,
          title: '6-Min Adaptive Challenge',
          durationMinutes: 6,
          type: 'adaptive_challenge',
          description: 'Dynamic difficulty scaling: easy -> medium -> mastery challenge.'
        },
        {
          stepIndex: 5,
          title: '3-Min Mastery Check & Retention Logging',
          durationMinutes: 3,
          type: 'retention_check',
          description: 'Metacognitive calibration check and automatic spaced repetition scheduling.'
        }
      ]
    };
  }

  /**
   * Evaluates syllabus coverage and computes exam readiness score
   */
  public calculateExamReadiness(
    profile: StudentProfile,
    targetSubject: SubjectId = 'mathematics'
  ): ExamPreparationPlan {
    const subjectNodes = KNOWLEDGE_GRAPH_NODES.filter(n => n.subjectId === targetSubject);
    let totalScore = 0;
    const priorityTopics: ExamPreparationPlan['priorityTopics'] = [];

    subjectNodes.forEach(node => {
      const mastery = profile.masteryByConcept[node.id];
      const score = mastery ? mastery.masteryScore : 0;
      totalScore += score;

      if (score < 65) {
        priorityTopics.push({
          conceptId: node.id,
          conceptName: node.name,
          urgency: score < 40 ? 'high' : 'medium',
          currentMastery: score
        });
      }
    });

    const avgMastery = subjectNodes.length > 0 ? Math.round(totalScore / subjectNodes.length) : 0;

    // Calculate days remaining if examDate exists
    let daysRemaining = 24;
    if (profile.examDate) {
      const diffMs = new Date(profile.examDate).getTime() - Date.now();
      daysRemaining = Math.max(1, Math.ceil(diffMs / 86400000));
    }

    return {
      examName: profile.targetExam || 'Standardized Assessment',
      daysRemaining,
      targetScore: 'Top 10th Percentile (90%+)',
      readinessPercentage: avgMastery,
      priorityTopics: priorityTopics.sort((a, b) => a.currentMastery - b.currentMastery),
      retentionAlerts: [
        {
          conceptId: 'math_negative_numbers',
          conceptName: 'Negative Numbers & Signs',
          daysSinceReview: 5
        }
      ]
    };
  }

  /**
   * Generates proactive coach notifications
   */
  public generateProactiveNudges(profile: StudentProfile): ProactiveNudge[] {
    const nudges: ProactiveNudge[] = [];

    // 1. Spaced review nudge
    nudges.push({
      id: 'nudge_retention_01',
      type: 'spaced_retention',
      title: 'Retention Check Due',
      message: 'You have not practiced "Negative Numbers & Signs" for 5 days. A quick 3-minute retrieval challenge will lock it in long-term memory.',
      actionText: 'Start 3-Min Check',
      targetConceptId: 'math_negative_numbers',
      urgency: 'high'
    });

    // 2. Prerequisite alert
    const linearMastery = profile.masteryByConcept['math_linear_equations']?.masteryScore || 0;
    const distMastery = profile.masteryByConcept['math_distributive_property']?.masteryScore || 0;
    if (linearMastery < 50 && distMastery < 65) {
      nudges.push({
        id: 'nudge_prereq_01',
        type: 'prerequisite_alert',
        title: 'Prerequisite Insight Detected',
        message: 'Your recent mistakes in Linear Equations correlate with Distributive Property gaps. Let’s do a quick 4-minute visual refresher.',
        actionText: 'Review Prerequisite',
        targetConceptId: 'math_distributive_property',
        urgency: 'high'
      });
    }

    // 3. Streak encouragement
    if (profile.learningStreakDays > 0) {
      nudges.push({
        id: 'nudge_streak_01',
        type: 'streak_encouragement',
        title: `${profile.learningStreakDays}-Day Active Streak! 🔥`,
        message: 'Consistency builds true neuroplastic connections. One short study session today keeps your momentum going!',
        actionText: 'Open Today’s Session',
        urgency: 'medium'
      });
    }

    return nudges;
  }
}

export const plannerAgent = new PlannerAgent();
