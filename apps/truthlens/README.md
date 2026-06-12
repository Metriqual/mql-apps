# TruthLens

A research assistant that shows its receipts. Ask one question; get two answers from **the same model** side by side — one straight from the provider, one routed through a Metriqual proxy key with the [hallucination blocker](https://metriqual.com/docs/hallucination) attached.

The verified lane runs ReAct prompt scaffolding and Chain-of-Verification (and optionally Self-RAG / MARCH) **inside the proxy**. This app contains zero verification logic.

![Same question, raw vs verified, side by side](./screenshot.png)

## The receipts

**Tech debt.** Implementing this comparison without Metriqual means building, in your app: claim extraction, verification-question generation, independent re-answering, discrepancy reconciliation, response rewriting, timeouts and fail-open behavior, plus prompt-injection for ReAct. That's the contents of five research papers as production code you maintain.

With Metriqual, the entire integration in this repo is:

```ts
const mql = new MQL({ apiKey: process.env.MQL_KEY_VERIFIED });
const res = await mql.chat.create({ model: 'gpt-4o-mini', messages });
```

The difference between the raw lane and the verified lane is **which key you use**. The verification pipeline is configuration on the key — change strategies, sensitivity, or the verification model in the dashboard and the next request picks it up. No redeploy.

**Cost.** The verified lane adds verification-LLM calls (CoVe ≈ 1 extra call; MARCH ≈ N+1). Run them on `gpt-4o-mini` and a verified answer costs fractions of a cent more than a raw one — you pay pennies per thousand requests for answers that don't invent citations. Spend caps on the key put a hard ceiling on it.

## Run it

1. Create two proxy keys at [metriqual.com](https://metriqual.com), both pointing at the same provider/model.
2. On the second key, attach a hallucination filter (dashboard → Anti-Halluc → New Filter — `react` + `cove`, medium sensitivity is a good start; or `mql hallucination create -n truthlens -s react,cove --key <key>`).
3. ```bash
   npm install
   cp .env.example .env.local   # paste both keys
   npm run dev
   ```

## Stack

Next.js 14 (App Router) · [`@metriqual/sdk`](https://www.npmjs.com/package/@metriqual/sdk) · Tailwind. One API route, one page.

## License

MIT
