/**
 * Session-based Learning Analytics Service
 * Tracks live metrics, real quiz attempts, accuracy, doubts, and mistake patterns for the CURRENT active session.
 * Automatically persists to sessionStorage and clears when the browser/website is closed.
 */

export interface SessionMistake {
  question: string;
  chosen: string;
  correct: string;
  explanation: string;
  category: string;
}

export interface SessionQuizAttempt {
  id: string;
  topic: string;
  totalQuestions: number;
  score: number;
  accuracy: number;
  timeSpentSec: number;
  timestamp: string;
  tabSwitchStrikes: number;
  mistakes: SessionMistake[];
}

export interface SessionData {
  sessionStartTime: string;
  doubtsAskedCount: number;
  quizzesCompletedCount: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  sessionFocusMinutes: number;
  topicsStudied: string[];
  quizAttempts: SessionQuizAttempt[];
  mistakeCategories: Record<string, number>;
}

const SESSION_STORAGE_KEY = 'tutorly_live_session_analytics_v1';

class SessionAnalyticsService {
  private listeners: (() => void)[] = [];

  private createDefaultSession(): SessionData {
    return {
      sessionStartTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      doubtsAskedCount: 0,
      quizzesCompletedCount: 0,
      totalQuestionsAttempted: 0,
      totalQuestionsCorrect: 0,
      sessionFocusMinutes: 0,
      topicsStudied: [],
      quizAttempts: [],
      mistakeCategories: {}
    };
  }

  public getSessionData(): SessionData {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.totalQuestionsAttempted === 'number') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    const fresh = this.createDefaultSession();
    this.saveSessionData(fresh);
    return fresh;
  }

  public saveSessionData(data: SessionData): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save session analytics:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.error(err);
      }
    });
  }

  /**
   * Record when a student asks a doubt in the study chat
   */
  public recordDoubt(subject: string, topic?: string): void {
    const data = this.getSessionData();
    data.doubtsAskedCount += 1;

    const topicToAdd = (topic || subject || '').trim();
    if (topicToAdd && topicToAdd !== 'General Academic' && !data.topicsStudied.includes(topicToAdd)) {
      data.topicsStudied = [topicToAdd, ...data.topicsStudied].slice(0, 10);
    }

    this.saveSessionData(data);
  }

  /**
   * Record a completed quiz attempt with actual score and mistakes
   */
  public recordQuizAttempt(params: {
    topic: string;
    totalQuestions: number;
    score: number;
    timeSpentSec: number;
    tabSwitchStrikes: number;
    mistakes: SessionMistake[];
  }): void {
    const data = this.getSessionData();
    const accuracy = params.totalQuestions > 0 ? Math.round((params.score / params.totalQuestions) * 100) : 0;

    const attempt: SessionQuizAttempt = {
      id: `attempt_${Date.now()}`,
      topic: params.topic,
      totalQuestions: params.totalQuestions,
      score: params.score,
      accuracy,
      timeSpentSec: params.timeSpentSec,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tabSwitchStrikes: params.tabSwitchStrikes,
      mistakes: params.mistakes
    };

    data.quizAttempts = [attempt, ...data.quizAttempts];
    data.quizzesCompletedCount += 1;
    data.totalQuestionsAttempted += params.totalQuestions;
    data.totalQuestionsCorrect += params.score;
    data.sessionFocusMinutes += Math.max(1, Math.round(params.timeSpentSec / 60));

    if (!data.topicsStudied.includes(params.topic)) {
      data.topicsStudied = [params.topic, ...data.topicsStudied].slice(0, 10);
    }

    // Accumulate real mistake categories
    params.mistakes.forEach(m => {
      const cat = m.category || 'Concept Understanding Gap';
      data.mistakeCategories[cat] = (data.mistakeCategories[cat] || 0) + 1;
    });

    this.saveSessionData(data);
  }

  /**
   * Record timer focus minutes
   */
  public recordFocusTime(minutes: number): void {
    const data = this.getSessionData();
    data.sessionFocusMinutes += minutes;
    this.saveSessionData(data);
  }

  /**
   * Reset the current session stats
   */
  public resetSession(): SessionData {
    const fresh = this.createDefaultSession();
    this.saveSessionData(fresh);
    return fresh;
  }
}

export const sessionAnalytics = new SessionAnalyticsService();
