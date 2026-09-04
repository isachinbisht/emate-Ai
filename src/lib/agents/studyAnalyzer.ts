import type {
  MCQSubmission,
  MCQQuiz,
  MCQResult,
  MCQQuestionResult,
  WeaknessArea,
  StudyAnalyzerReport,
} from './types';

/**
 * Study Analyzer — evaluates quiz submissions, identifies weak areas,
 * and generates actionable feedback. Pure computation, no API calls.
 */

export function analyzeQuizResults(submission: MCQSubmission, quiz: MCQQuiz): MCQResult {
  const questionResults: MCQQuestionResult[] = quiz.questions.map((q) => {
    const selected = submission.answers[q.id];
    const timeSpent = submission.timePerQuestion[q.id] ?? 0;
    return {
      questionId: q.id,
      selectedAnswer: selected ?? -1,
      correctAnswer: q.correctAnswer,
      isCorrect: selected === q.correctAnswer,
      timeSpent,
    };
  });

  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const totalQuestions = quiz.questions.length;

  return {
    quizId: quiz.id,
    score: totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0,
    totalQuestions,
    correctCount,
    questionResults,
  };
}

export function generateWeaknessReport(result: MCQResult, quiz: MCQQuiz): WeaknessArea[] {
  // Group question results by topicTag
  const topicMap = new Map<string, { attempted: number; missed: string[] }>();

  for (const qr of result.questionResults) {
    const question = quiz.questions.find((q) => q.id === qr.questionId);
    const tag = question?.topicTag ?? 'Unknown';

    if (!topicMap.has(tag)) {
      topicMap.set(tag, { attempted: 0, missed: [] });
    }
    const entry = topicMap.get(tag)!;
    entry.attempted++;
    if (!qr.isCorrect) {
      entry.missed.push(qr.questionId);
    }
  }

  // Convert to WeaknessArea[], only include topics with < 100% accuracy
  const weakAreas: WeaknessArea[] = [];
  for (const [topicTag, data] of topicMap) {
    const correct = data.attempted - data.missed.length;
    const accuracy = data.attempted > 0 ? correct / data.attempted : 0;
    if (accuracy < 1) {
      weakAreas.push({
        topicTag,
        accuracy,
        questionsAttempted: data.attempted,
        missedQuestions: data.missed,
      });
    }
  }

  // Sort by accuracy ascending (worst topics first)
  weakAreas.sort((a, b) => a.accuracy - b.accuracy);

  return weakAreas;
}

export function generateRecommendations(weakAreas: WeaknessArea[]): string[] {
  if (weakAreas.length === 0) {
    return [
      'Excellent performance! You have a strong grasp of all topics covered in this quiz.',
      'Consider trying a harder difficulty level to further challenge yourself.',
    ];
  }

  const recommendations: string[] = [];

  // Prioritise the weakest topics
  const criticalTopics = weakAreas.filter((w) => w.accuracy < 0.5);
  if (criticalTopics.length > 0) {
    recommendations.push(
      `🔴 Priority: Focus on ${criticalTopics.map((w) => w.topicTag).join(', ')} — these need immediate attention (below 50% accuracy).`
    );
  }

  const strugglingTopics = weakAreas.filter((w) => w.accuracy >= 0.5 && w.accuracy < 0.8);
  if (strugglingTopics.length > 0) {
    recommendations.push(
      `🟡 Review: ${strugglingTopics.map((w) => w.topicTag).join(', ')} — you're close but need more practice.`
    );
  }

  // General recommendations
  if (weakAreas.length > 0) {
    recommendations.push(
      '📖 Re-read the relevant sections in your notebook for the weak topics above.'
    );
    recommendations.push(
      '🔄 Ask e-Mate to explain the weak concepts in detail — click the "Reinforce" button below.'
    );
  }

  // Time-based insight
  const allResults = weakAreas.flatMap((w) => (w.missedQuestions.length > 0 ? [w] : []));
  if (allResults.length > 0) {
    recommendations.push(
      '⏱️ Quick tip: If you spent too long on a question, you may need to strengthen your foundational understanding of that topic.'
    );
  }

  return recommendations;
}

/**
 * Dynamic fallback report when no quiz data is available.
 * Uses the active topic/subject instead of hardcoded DBMS defaults.
 */
export function getFallbackReport(topicName?: string): StudyAnalyzerReport {
  const currentSubject = topicName || 'General Knowledge';
  return {
    id: `report-fallback-${Date.now()}`,
    quizId: '',
    overallScore: 0,
    weakAreas: [
      {
        topicTag: `${currentSubject} Fundamentals`,
        accuracy: 0,
        questionsAttempted: 0,
        missedQuestions: [],
      },
    ],
    recommendations: [
      `Review foundational concepts in ${currentSubject}.`,
      'Take a quiz to identify your weak areas.',
    ],
    generatedAt: new Date().toISOString(),
  };
}

export function generateAnalyzerReport(
  submission: MCQSubmission,
  quiz: MCQQuiz
): StudyAnalyzerReport {
  const result = analyzeQuizResults(submission, quiz);
  const weakAreas = generateWeaknessReport(result, quiz);
  const recommendations = generateRecommendations(weakAreas);

  return {
    id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    quizId: quiz.id,
    overallScore: result.score,
    weakAreas,
    recommendations,
    generatedAt: new Date().toISOString(),
    submissionData: submission,
  };
}
