'use client';

import { useState } from 'react';

type LaneResult = {
  content: string;
  latencyMs: number;
  tokens: number | null;
  error?: string;
};

type AskResponse = {
  model: string;
  raw: LaneResult;
  verified: LaneResult;
};

// Questions engineered to tempt models into fabricating citations,
// statistics, DOIs, and study names — exactly what the blocker catches.
const SAMPLE_QUESTIONS = [
  'Cite three peer-reviewed studies, with DOIs, proving coffee extends lifespan.',
  'What did the 2019 Stanford Microplastics Study conclude? Give the exact statistics.',
  'Give me the precise market share percentages of every cloud provider in 2024.',
  'Quote what Einstein said about quantum entanglement, with the source.',
];

export default function Home() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [error, setError] = useState('');

  const ask = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">◎</span>
            <span className="font-semibold">TruthLens</span>
            <span className="text-xs text-neutral-500 hidden sm:inline">research assistant that shows its receipts</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a href="https://github.com/Metriqual/mql-apps" className="text-neutral-400 hover:text-white transition-colors">Source</a>
            <a href="https://metriqual.com/docs/hallucination" className="text-amber-400 hover:text-amber-300 transition-colors">Built on Metriqual ↗</a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Same question. Same model.{' '}
            <span className="text-amber-400">One lane fact-checks itself.</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base">
            Both answers come from the same LLM. The right lane routes through a Metriqual
            proxy key with the <strong className="text-neutral-200">hallucination blocker</strong> attached
            — ReAct prompt scaffolding plus Chain-of-Verification — and this app contains{' '}
            <strong className="text-neutral-200">zero verification code</strong>.
          </p>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); ask(question); }}
          className="max-w-2xl mx-auto mb-4"
        >
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask something a model might hallucinate about…"
              className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-5 py-3 rounded-xl bg-white text-neutral-900 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {loading ? 'Asking…' : 'Ask both'}
            </button>
          </div>
        </form>

        {/* Sample questions */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-3xl mx-auto">
          {SAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => { setQuestion(q); ask(q); }}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-neutral-700 text-neutral-400 hover:border-amber-500/50 hover:text-neutral-200 transition-colors disabled:opacity-40 text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {(loading || result) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Lane
              title="Raw model"
              subtitle="straight passthrough"
              tone="neutral"
              result={result?.raw ?? null}
              loading={loading}
            />
            <Lane
              title="Hallucination blocker ON"
              subtitle="ReAct + Chain-of-Verification via Metriqual"
              tone="amber"
              result={result?.verified ?? null}
              loading={loading}
            />
          </div>
        )}

        {/* How it works */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-px rounded-xl overflow-hidden border border-neutral-800 bg-neutral-800">
          {[
            ['1 · Two proxy keys', 'Both keys point at the same provider and model. One has a hallucination-blocker filter attached in the Metriqual dashboard; the other doesn’t.'],
            ['2 · Zero app code', 'This app makes the same SDK call twice. All verification — prompt scaffolding, claim extraction, independent re-answering, response rewriting — happens inside the proxy.'],
            ['3 · Flip it anytime', 'Toggle the filter, change strategies, or swap the verification model from the dashboard. No redeploy. The next request picks it up.'],
          ].map(([title, body]) => (
            <div key={title} className="bg-neutral-950 p-5">
              <p className="text-sm font-semibold text-amber-400 mb-1.5">{title}</p>
              <p className="text-xs text-neutral-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <footer className="mt-12 pb-8 text-center text-xs text-neutral-500">
          MIT licensed ·{' '}
          <a href="https://github.com/Metriqual/mql-apps" className="underline hover:text-neutral-300">view source</a>
          {' '}· powered by{' '}
          <a href="https://metriqual.com" className="underline hover:text-neutral-300">Metriqual</a>
        </footer>
      </div>
    </main>
  );
}

// ── Lane ─────────────────────────────────────────────────────────────────────

function Lane({
  title, subtitle, tone, result, loading,
}: {
  title: string;
  subtitle: string;
  tone: 'neutral' | 'amber';
  result: LaneResult | null;
  loading: boolean;
}) {
  const border = tone === 'amber' ? 'border-amber-500/30' : 'border-neutral-800';
  const header = tone === 'amber' ? 'text-amber-400' : 'text-neutral-300';

  return (
    <div className={`rounded-xl border ${border} bg-neutral-950 overflow-hidden flex flex-col`}>
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${header}`}>{title}</p>
          <p className="text-[11px] text-neutral-500">{subtitle}</p>
        </div>
        {result && !result.error && (
          <div className="text-right text-[11px] text-neutral-500">
            <p>{(result.latencyMs / 1000).toFixed(1)}s</p>
            {result.tokens != null && <p>{result.tokens} tokens</p>}
          </div>
        )}
      </div>
      <div className="p-4 text-sm leading-relaxed flex-1 min-h-[180px]">
        {loading && !result && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-neutral-800 rounded w-full" />
            <div className="h-3 bg-neutral-800 rounded w-5/6" />
            <div className="h-3 bg-neutral-800 rounded w-4/6" />
          </div>
        )}
        {result?.error && (
          <p className="text-red-400 text-xs">{result.error}</p>
        )}
        {result && !result.error && <Annotated text={result.content} />}
      </div>
    </div>
  );
}

// ── Annotated rendering ──────────────────────────────────────────────────────
// Highlights [UNCERTAIN] markers and renders the blocker's appended
// verification notice as a distinct callout.

function Annotated({ text }: { text: string }) {
  // Split off the disclaimer the blocker appends ("---" + warning)
  const disclaimerIdx = text.indexOf('\n\n---\n');
  const body = disclaimerIdx !== -1 ? text.slice(0, disclaimerIdx) : text;
  const disclaimer = disclaimerIdx !== -1 ? text.slice(disclaimerIdx + 6).trim() : null;

  const parts = body.split(/(\[UNCERTAIN\])/g);

  return (
    <div>
      <p className="whitespace-pre-wrap text-neutral-200">
        {parts.map((part, i) =>
          part === '[UNCERTAIN]' ? (
            <mark key={i} className="bg-amber-500/20 text-amber-300 rounded px-1 py-0.5 text-xs font-semibold">
              UNCERTAIN
            </mark>
          ) : (
            <span key={i}>{part}</span>
          ),
        )}
      </p>
      {disclaimer && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-xs text-amber-200/90 whitespace-pre-wrap">
          {disclaimer}
        </div>
      )}
    </div>
  );
}
