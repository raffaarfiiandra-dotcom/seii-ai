import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, systemPrompt, password } = await req.json();

    if (password !== process.env.AUTH_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Password salah / Akses ditolak.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const defaultSystem = `You are Seii AI, an elite autonomous AI suite. 
You excel at:
1. End-to-end software engineering & project architecture.
2. AI Video, VFX, & Cinematic Image prompting (Midjourney v6, Flux.1, Kling AI, Runway Gen-3, Luma Dream Machine).
3. Critical logical reasoning, breakdown, and execution.
Always format code blocks with language identifiers. Be articulate, practical, direct, and conversational in Indonesian (or English when requested).`;

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

    // Route directly to OpenAI API if model is an official OpenAI model
    if (targetModel.startsWith('openai-direct:')) {
      const realModel = targetModel.replace('openai-direct:', '');
      targetUrl = 'https://api.openai.com/v1/chat/completions';
      authHeader = `Bearer ${process.env.OPENAI_API_KEY}`;
      targetModel = realModel;
      delete extraHeaders['HTTP-Referer'];
      delete extraHeaders['X-Title'];
    } else if (targetModel.startsWith('deepseek-direct:') && process.env.DEEPSEEK_API_KEY?.startsWith('sk-')) {
      const realModel = targetModel.replace('deepseek-direct:', '');
      targetUrl = 'https://api.deepseek.com/chat/completions';
      authHeader = `Bearer ${process.env.DEEPSEEK_API_KEY}`;
      targetModel = realModel;
      delete extraHeaders['HTTP-Referer'];
      delete extraHeaders['X-Title'];
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...extraHeaders,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [systemMessage, ...messages],
        stream: true,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return new Response(JSON.stringify({ error: `API Provider Error (${response.status}): ${errorData}` }), {
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
