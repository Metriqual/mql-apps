# mql-apps

Live, open-source apps built on [Metriqual](https://metriqual.com) — each one demonstrates a specific production problem the proxy solves, with real numbers.

These aren't toy demos. Every app here ships with the integration-cost receipts in its README: how many lines of code the same feature takes with and without Metriqual, and what it costs to run.

## Apps

| App | What it proves | Guide |
|---|---|---|
| [**TruthLens**](./apps/truthlens) | The hallucination blocker, made visceral — same question, same model, side by side: one lane raw, one lane fact-checked by the proxy. Zero verification code in the app. | [setup guide](https://metriqual.com/apps/truthlens) |

More coming: automatic-failover support bot, one-key multimodal studio, per-client spend-cap billing.

## The pitch, honestly

Every AI feature you ship direct-to-provider accretes the same infrastructure: per-provider auth, retries, failover, streaming quirks, spend tracking, content guardrails, prompt versioning. Five providers × all of that is thousands of lines you maintain forever.

With Metriqual the integration is one SDK call against one key, and the infrastructure — failover chains, spend caps, PII filters, hallucination verification, prompt injection — is configuration on the key, not code in your repo. Change it in the dashboard; no redeploy.

## Running any app locally

```bash
cd apps/<app>
npm install
cp .env.example .env.local   # fill in your Metriqual proxy keys
npm run dev
```

Get keys at [metriqual.com](https://metriqual.com) — the free tier covers running these demos.

## License

MIT — fork anything here as a starting point for your own product.
