import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, mode, subject, unit, model } = await req.json();

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

    const systemPrompt = `You are e-Mate AI, a helpful, intelligent, and versatile AI assistant.

Guidelines:
- Answer naturally, conversationally, and directly to what the user asks.
- Do NOT force academic/study jargon or default subject context (like DBMS/study modes) into everyday general conversations unless the user specifically asks for academic or study assistance.
- Format responses cleanly using standard Markdown when helpful.`;

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
