# TruthLens

A research assistant that shows its receipts. Ask one question; get two answers from **the same model** side by side — one straight from the provider, one routed through a Metriqual proxy key with the [hallucination blocker](https://metriqual.com/docs/hallucination) attached.

The verified lane runs ReAct prompt scaffolding and Chain-of-Verification (and optionally Self-RAG / MARCH) **inside the proxy**. This app contains zero verification logic.


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

## Deploy (Cloudflare Pages)

The API route runs on the edge runtime and the SDK is pure `fetch`, so this deploys to Cloudflare Pages as-is:

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → select this repo
2. **Root directory:** `apps/truthlens` · **Framework preset:** Next.js (build command `npx @cloudflare/next-on-pages@1`, output `.vercel/output/static`)
3. Add env vars `MQL_KEY_RAW` and `MQL_KEY_VERIFIED`
4. Deploy, then **Custom domains** → add your subdomain (DNS is created automatically if the zone is on the same account)

Also works on Vercel unchanged (root directory `apps/truthlens`).

## Stack

Next.js 14 (App Router) · [`@metriqual/sdk`](https://www.npmjs.com/package/@metriqual/sdk) · Tailwind. One API route, one page.

## License

MIT
