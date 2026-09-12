// Source excerpt from AI Team Coordinator. Requires the Next.js application.
// No credentials are included; live provider use reads server environment variables.
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type RequestBody = {
  prompt?: string;
  role?: 'architect' | 'developer';
};

function extractOutputText(data: any): string {
  if (typeof data?.output_text === 'string') return data.output_text;

  const chunks: string[] = [];
  for (const item of data?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === 'string') chunks.push(content.text);
    }
  }

  return chunks.join('\n').trim();
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is missing. Create .env.local and add OPENAI_API_KEY=your_key_here.' },
      { status: 400 },
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'OpenAI request failed.', details: data },
        { status: response.status },
      );
    }

    const output = extractOutputText(data);
    if (!output) {
      return NextResponse.json({ error: 'OpenAI returned no text output.', details: data }, { status: 502 });
    }

    return NextResponse.json({ output, model, role: body.role ?? 'architect' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
