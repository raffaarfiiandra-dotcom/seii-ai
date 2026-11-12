import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, systemPrompt, password, enableWebSearch } = await req.json();

    if (password !== process.env.AUTH_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Password salah / Akses ditolak.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const defaultSystem = `You are Seii AI, an elite autonomous personal AI suite.
You are equipped with specialized project capabilities:
- Fullstack web & mobile app engineering (Next.js, React, Node, Capacitor).
- Live real-time market data analysis (Crypto, Stocks, Macroeconomics, live news).
- Photo/Image Vision analysis (school homework, math formulas, diagrams, OCR).
- Cinematic AI Video/Photo prompt generation (Kling, Runway Gen-3, Midjourney, Flux.1).
Always provide direct, actionable, and verified answers. Format all code neatly in markdown.`;

    const systemMessage = {
      role: 'system',
      content: systemPrompt || defaultSystem,
    };

    let targetUrl = 'https://openrouter.ai/api/v1/chat/completions';
    let authHeader = `Bearer ${process.env.OPENROUTER_API_KEY}`;
    let targetModel = model || 'deepseek/deepseek-chat';

    const extraHeaders: Record<string, string> = {
      'HTTP-Referer': 'https://seii-ai.local',
      'X-Title': 'Seii AI Hub',
    };

    const requestBody: any = {
      model: targetModel,
      messages: [systemMessage, ...messages],
      stream: true,
      max_tokens: 4096,
    };

    // If live web search is enabled, activate OpenRouter web plugin
    if (enableWebSearch) {
      requestBody.plugins = [{ id: 'web' }];
    }

    // Direct Cohere handling if requested
    if (targetModel.startsWith('cohere:')) {
      const realModel = targetModel.replace('cohere:', '');
      targetUrl = 'https://api.cohere.com/compatibility/v1/chat/completions';
      authHeader = `Bearer ${process.env.COHERE_API_KEY || 'yoZ7ZX6JoiGKj1duo3JiyNBFz2upZE5O1sYDCGxH'}`;
      requestBody.model = realModel;
      delete requestBody.plugins;
    }

    // Direct OpenAI handling if requested
    if (targetModel.startsWith('openai-direct:')) {
      const realModel = targetModel.replace('openai-direct:', '');
      targetUrl = 'https://api.openai.com/v1/chat/completions';
      authHeader = `Bearer ${process.env.OPENAI_API_KEY}`;
      requestBody.model = realModel;
      delete requestBody.plugins;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(JSON.stringify({ error: `Provider Error (${response.status}): ${errorData}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
