import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, mode, subject, unit, model, notebookContext } = await req.json();

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
      return NextResponse.json(
        {
          error:
            'OpenRouter API key is missing or not configured. Please set a valid OPENROUTER_API_KEY in your .env file.',
        },
        { status: 400 }
      );
    }

    // Default to popular OpenRouter model if not specified
    const selectedModel = model || 'meta-llama/llama-3.3-70b-instruct';

    // Build personalised system prompt — inject notebook context when available
    const notebookSection = notebookContext
      ? `\n\n## Student's Personal Notebook for ${subject} (USE THIS to personalise answers — these are the student's saved notes and key insights):\n${notebookContext}\n\nAlways reference relevant notebook entries when answering to make answers feel personalised.`
      : '';

    const modeInstruction =
      mode === 'sprint'
        ? '\n\nMode: SPRINT — Give concise, bullet-pointed answers optimised for last-minute revision. Prioritise key formulas, definitions and exam tips.'
        : '\n\nMode: DEEP DIVE — Give thorough, step-by-step explanations with examples. Cover edge cases and exam pitfalls.';

    const contextSection =
      subject && unit
        ? `\n\nCurrent study context: Subject = ${subject}, Unit = ${unit}. Tailor all answers to this scope.`
        : '';

    const systemPrompt =
      `You are e-Mate AI, an expert AI academic tutor helping students ace their university exams.\n` +
      `Guidelines:\n` +
      `- Answer naturally, conversationally, and directly to what the user asks.\n` +
      `- Use Markdown formatting (headers, bullet points, code blocks) for clarity.\n` +
      `- If the student's notebook contains relevant notes, reference them and build upon them.\n` +
      `- Always highlight exam-important points with a ⭐ or 📌 marker.` +
      contextSection +
      modeInstruction +
      notebookSection;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4028',
        'X-Title': 'e-Mate AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: formattedMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData?.error?.message || `OpenRouter API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response returned from model.';

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
