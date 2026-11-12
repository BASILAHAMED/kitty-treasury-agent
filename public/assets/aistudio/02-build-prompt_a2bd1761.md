# Build Prompt — hand this to a coding agent (Claude Code / Codex / fresh Hermes session)

```
ROLE: You are building a hackathon submission for "PayPal AI Hackathon: Build What's Next with PayPal and AI" (paypalaihackathon.devpost.com). HARD DEADLINE: Nov 12, 2026, 12:00pm PST — build fast, ship something that actually runs, do not over-engineer.

PROJECT: "Kitty" — an autonomous shared-treasury agent for groups (roommates, trip groups, office teams). It does two things, both driven by an AI agent, both settled through real PayPal sandbox transactions:

1. COLLECT: A user uploads a photo of a receipt. The agent itemizes it (vision model), asks clarifying questions in chat only where the photo is ambiguous ("who had the dessert?"), computes each participant's share including proportional tax/tip, and autonomously creates + sends a PayPal payment request to each participant via the PayPal Agent Toolkit / MCP tools (create_invoice, send_invoice). It polls get_invoice_status and updates a live ledger. It sends at most 2 autonomous reminders per unpaid request, then stops and flags the organizer — never escalates amount or frequency beyond that without explicit human approval.

2. SPEND: Each group has a "kitty" (pooled balance) with a hard spend cap (e.g. $50 per autonomous purchase) set by the organizer. When triggered (a photo of a low/empty supply, a recurring restock date, or an explicit request typed in chat), the agent searches Channel3's product API for an in-budget option, and if the kitty balance covers it, autonomously completes the purchase via PayPal Orders API from the pooled funds. If the kitty is short, it first runs the COLLECT flow to top up proportionally from members, then purchases. Any purchase above the spend cap requires explicit organizer approval before it proceeds — never silently exceed the cap.

REQUIRED INTEGRATIONS (both must be genuinely load-bearing, not decorative):
- PayPal: Agent Toolkit / MCP server in sandbox mode for invoicing (create_invoice, send_invoice, get_invoice_status) AND Orders API for the autonomous purchase flow. Use webhooks (INVOICING.INVOICE.PAID, PAYMENT.CAPTURE.COMPLETED) to update status live, not polling-only.
- AI: a vision-capable model for receipt/shelf-photo itemization, and a reasoning model acting as the orchestrating agent that decides when to ask a clarifying question, when to send a reminder, when to trigger a restock, and when to block on a spend-cap violation. Use Groq (GROQ_API_KEY from env) for both — fast inference matters for a live demo.
- Channel3 API/MCP for product search during the SPEND flow (sign up at trychannel3.com/developers, promo code PAYPAL-HACKATHON-2026 for free credits).
- AG Grid for the ledger/dashboard: trips/kitties, participants, amounts, paid/pending/reminded status, purchase history — a real operational dashboard, not just chat bubbles.

NON-NEGOTIABLE UX ELEMENT: a visible "agent reasoning" panel in the UI that streams the agent's actual decision steps (itemized receipt → computed shares → tool call made → result) as they happen, so a judge watching the demo can see the autonomy is real, not hardcoded. Do not fake this with canned text — it must reflect real tool calls and real model output.

STACK: Next.js (App Router), deployed on Render (sponsor prize — use it, don't default to Vercel). TypeScript. Store PayPal/Groq/Channel3 credentials in .env — never hardcode. If any credential is missing, tell me explicitly what you need rather than stubbing with fake values.

HONESTY RULE: If sandbox or time constraints force you to simulate any step (e.g. a webhook you can't receive locally), label it clearly in the UI ("simulated — see README") and in the README. Never present a mocked result as if it were a real API response. The hackathon disqualifies non-functional demos — a labeled simulation beats a silent fake every time.

BUILD ORDER (respect this order — each phase must fully work before starting the next):
Phase 1 — PayPal sandbox app created, Agent Toolkit/MCP wired, one hardcoded invoice successfully created+sent+paid end to end in sandbox. Prove this works before writing any UI.
Phase 2 — Groq vision itemization on a real receipt photo, returning structured line items + totals.
Phase 3 — COLLECT flow: itemize → compute shares → send real invoices to multiple sandbox buyer accounts → webhook flips status → ledger updates live.
Phase 4 — AG Grid dashboard wired to the live ledger.
Phase 5 — SPEND flow: Channel3 search → spend-cap check → Orders API purchase → kitty balance update → auto top-up via COLLECT flow if short.
Phase 6 — Reasoning panel streaming real agent decisions. Polish UI. Write README with exact setup/run steps (judges must be able to run this themselves) and a .env.example.

DELIVERABLES: public GitHub repo with LICENSE visible in the About section, complete README (setup, run, architecture, which AI tools were used and how), and the app deployed and reachable at a URL. Do not consider this done until a stranger could clone the repo and get it running from the README alone.

Work in small verifiable increments. After each phase, tell me what you tested and what the actual output was — do not claim a phase works without showing the real result (API response, screenshot, log).
```
