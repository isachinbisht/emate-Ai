import { openRouterCompletion } from '@/lib/openrouter';
import type { QuizGenerationRequest, MCQQuiz, MCQQuestion } from './types';

/**
 * MCQ Agent — generates multiple-choice quizzes from notebook context.
 * Enforces strict JSON output format and validates the response.
 */
export async function generateQuiz(
  apiKey: string,
  request: QuizGenerationRequest
): Promise<MCQQuiz> {
  const { subject, unit, count, difficulty, notebookContext } = request;

  const systemPrompt =
    `You are an expert exam question writer for ${subject}.\n` +
    `Generate exactly ${count} multiple-choice questions at ${difficulty} difficulty level.\n` +
    `Focus area: ${unit || 'general ${subject}'}\n\n` +
    `STRICT FORMAT RULES:\n` +
    `- Return ONLY a valid JSON array — no markdown, no explanation, no text outside the array.\n` +
    `- Each object must have exactly these fields:\n` +
    `  {\n` +
    `    "question": "string — the question text",\n` +
    `    "options": ["A", "B", "C", "D"],\n` +
    `    "correctAnswer": 0,  // index 0-3\n` +
    `    "topicTag": "string — specific sub-topic name",\n` +
    `    "explanation": "string — brief explanation of the correct answer"\n` +
    `  }\n` +
    `- Questions should test understanding, not just recall.\n` +
    `- Each option should be plausible.\n` +
    `- The "topicTag" should identify the specific concept being tested.\n` +
    `- Use ⭐ markers in explanations for exam-important points.`;

  const notebookSection = notebookContext
    ? `\n\n## Student's Personal Notebook (use this to create relevant questions):\n${notebookContext}`
    : '';

  const userMessage = `Generate ${count} ${difficulty}-level MCQ questions for ${subject}${unit ? ` — ${unit}` : ''}.${notebookSection}`;

  const response = await openRouterCompletion(apiKey, {
    model: 'google/gemini-2.0-flash',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.8,
    max_tokens: 2000,
  });

  const content = response?.choices?.[0]?.message?.content;
  const text =
    typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content
            .filter((p: any) => p.type === 'text')
            .map((p: any) => p.text)
            .join('')
        : '';

  const questions = extractAndValidateQuestions(text);

  return {
    id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subject,
    unit,
    questions,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Extract JSON array from the LLM response text, handling markdown code blocks.
 */
function extractAndValidateQuestions(raw: string): MCQQuestion[] {
  // Try to extract JSON from markdown code blocks first
  const codeBlockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : raw.trim();

  let parsed: any[];
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Try to find a JSON array in the text
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      parsed = JSON.parse(arrayMatch[0]);
    } else {
      throw new Error('Failed to parse quiz JSON from LLM response');
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('LLM response is not a JSON array');
  }

  // Validate and assign IDs
  return parsed.map((q, index) => {
    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Invalid question at index ${index}: missing question or options`);
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Invalid correctAnswer at index ${index}`);
    }
    return {
      id: `q-${Date.now()}-${index}`,
      question: String(q.question),
      options: [
        String(q.options[0]),
        String(q.options[1]),
        String(q.options[2]),
        String(q.options[3]),
      ],
      correctAnswer: q.correctAnswer,
      topicTag: String(q.topicTag || `Topic ${index + 1}`),
      explanation: String(q.explanation || ''),
    };
  });
}
