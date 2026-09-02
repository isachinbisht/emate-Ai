// ─── MCQ Agent Types ─────────────────────────────────────────────────────────

export interface MCQQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0-3
  topicTag: string;
  explanation: string;
}

export interface MCQQuiz {
  id: string;
  subject: string;
  unit: string;
  questions: MCQQuestion[];
  createdAt: string;
}

export interface MCQSubmission {
  quizId: string;
  answers: Record<string, number>; // questionId -> selected index
  timePerQuestion: Record<string, number>; // questionId -> seconds
  completedAt: string;
}

export interface MCQQuestionResult {
  questionId: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface MCQResult {
  quizId: string;
  score: number; // percentage 0-100
  totalQuestions: number;
  correctCount: number;
  questionResults: MCQQuestionResult[];
}

// ─── Study Analyzer Types ────────────────────────────────────────────────────

export interface WeaknessArea {
  topicTag: string;
  accuracy: number; // 0-1
  questionsAttempted: number;
  missedQuestions: string[]; // question IDs
}

export interface StudyAnalyzerReport {
  id: string;
  quizId: string;
  overallScore: number;
  weakAreas: WeaknessArea[];
  recommendations: string[];
  generatedAt: string;
}

// ─── Agent Input Types ───────────────────────────────────────────────────────

export interface QuizGenerationRequest {
  subject: string;
  unit: string;
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
  notebookContext: string;
}

export interface StudyExplanationRequest {
  weakTopics: string[];
  subject: string;
  notebookContext: string;
}
