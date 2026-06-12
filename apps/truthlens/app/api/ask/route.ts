import { NextRequest, NextResponse } from 'next/server';
import { MQL } from '@metriqual/sdk';

// Two Metriqual proxy keys pointed at the same provider/model:
//   MQL_KEY_RAW      — no filters attached
//   MQL_KEY_VERIFIED — hallucination blocker filter attached
//                      (e.g. strategies: ["react", "cove"], sensitivity: medium)
//
// That's the entire integration. The hallucination pipeline — ReAct prompt
// scaffolding, Chain-of-Verification passes, response rewriting — runs inside
// the Metriqual proxy. This app contains zero verification code.

const BASE_URL = process.env.MQL_BASE_URL || 'https://api.metriqual.com';
const MODEL = process.env.MQL_MODEL || 'gpt-4o-mini';

export const maxDuration = 60; // verified lane may run CoVe verification passes

export async function POST(req: NextRequest) {
  const rawKey = process.env.MQL_KEY_RAW;
  const verifiedKey = process.env.MQL_KEY_VERIFIED;
  if (!rawKey || !verifiedKey) {
    return NextResponse.json(
      { error: 'Server is missing MQL_KEY_RAW / MQL_KEY_VERIFIED env vars.' },
      { status: 500 },
    );
  }

  let question: string;
  try {
    const body = await req.json();
    question = String(body.question ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ error: 'Question is required.' }, { status: 400 });
  }
  if (question.length > 2000) {
    return NextResponse.json({ error: 'Question too long (max 2000 chars).' }, { status: 400 });
  }

  const messages = [{ role: 'user' as const, content: question }];

  const ask = async (apiKey: string) => {
    const started = Date.now();
    const mql = new MQL({ apiKey, baseUrl: BASE_URL, timeout: 55_000 });
    const res = await mql.chat.create({ model: MODEL, messages, maxTokens: 1024 });
    return {
      content: res.choices[0]?.message?.content ?? '',
      latencyMs: Date.now() - started,
      tokens: res.usage?.totalTokens ?? null,
    };
  };

  // Same question, both lanes, in parallel
  const [raw, verified] = await Promise.allSettled([ask(rawKey), ask(verifiedKey)]);

  const unwrap = (r: PromiseSettledResult<Awaited<ReturnType<typeof ask>>>) =>
    r.status === 'fulfilled'
      ? r.value
      : { content: '', latencyMs: 0, tokens: null, error: String(r.reason?.message ?? r.reason) };

  return NextResponse.json({
    model: MODEL,
    raw: unwrap(raw),
    verified: unwrap(verified),
  });
}
