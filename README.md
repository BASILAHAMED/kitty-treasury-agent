# Kitty — Autonomous Shared-Treasury Agent

Kitty is an autonomous financial agent for group treasuries (roommates, trips, and team offices). It combines AI vision and reasoning with PayPal Sandbox Invoicing and Orders APIs, plus Channel3 commerce product search, to eliminate manual spreadsheets and reminder messages.

---

## Core Capabilities

### 1. Collect Flow (Receipt Splitting & Invoicing)
- **Visual Receipt Parsing**: Extracts individual items, prices, subtotals, tax, and tip.
- **Ambiguity Detection**: Prompts the user with focused questions only when item attribution is unclear (e.g., shared dessert or appetizers).
- **Proportional Math**: Allocates tax and tip proportionally based on each participant's item share.
- **PayPal Invoicing**: Autonomously creates draft invoices (`create_invoice`) and dispatches them (`send_invoice`) to group members in the sandbox.
- **Autonomous Reminder Policy**: Polls invoice status and delivers up to 2 automated reminders per unpaid bill, then halts automated notifications and flags the human organizer for review.

### 2. Spend Flow (Autonomous Restock & Orders)
- **Automated Triggers**: Triggered by shelf/pantry photos (e.g. coffee beans canister depleted), member chat prompts, or recurring schedules.
- **Channel3 Commerce Integration**: Searches in-budget items via the Channel3 Product API.
- **Hard Spend Cap Enforcement**: When an item exceeds the group's spend cap (e.g. $50.00), the agent halts purchase and requests 1-click organizer authorization.
- **Automatic Top-Up**: If pooled kitty funds are insufficient, the agent triggers the Collect flow to request proportional member top-ups prior to purchase.
- **PayPal Orders API**: Creates and captures payment orders (`intent: CAPTURE`) directly from the pooled treasury.

### 3. Real-Time Operational Dashboard
- **AG Grid Ledger**: High-density table displaying invoices, participant status, proportional splits, PayPal sandbox invoice IDs, and purchase history.
- **Webhook Integration**: Ingests `INVOICING.INVOICE.PAID` and `PAYMENT.CAPTURE.COMPLETED` events, with a 1-click sandbox webhook relay for local testing.
- **Live Agent Reasoning Stream**: Shows real-time agent thoughts, tool calls, payloads, and guardrail enforcement.

---

## Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, AG Grid Community, Lucide Icons, Motion.
- **Backend**: Express on Node.js / Vite middleware mode.
- **Payment Engine**: PayPal Developer Sandbox (Invoicing API v2 & Orders API v2).
- **AI Models**: Vision & reasoning via Gemini 2.5 Flash / Groq LLMs.
- **Commerce**: Channel3 Product Search API.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (.env)
```bash
cp .env.example .env
```
Fill in the following credentials:
```env
# AI API Key (automatically injected in AI Studio)
GEMINI_API_KEY="your-gemini-key"
GROQ_API_KEY="optional-groq-key"

# PayPal Sandbox Credentials (developer.paypal.com)
PAYPAL_CLIENT_ID="your-sandbox-client-id"
PAYPAL_CLIENT_SECRET="your-sandbox-client-secret"
PAYPAL_MODE="sandbox"

# Channel3 Product API
CHANNEL3_API_KEY="your-channel3-key"

PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with Kitty.

---

## Verifying Each Phase in the UI

1. **Collect Flow**: Click on the "1. Collect" tab, select a sample receipt or upload a photo, answer any clarifying questions, compute proportional shares, and click "Autonomously Create & Dispatch Real PayPal Invoices".
2. **Autonomous Reminder Check**: Click "Trigger Autonomous Reminder Cycle" to observe the 2-reminder cutoff enforcement.
3. **Spend Flow**: Click "2. Spend", choose a supply photo (e.g., low coffee beans), search Channel3, and trigger the autonomous purchase. Test the spend cap guardrail by selecting the high-value commercial grinder ($149.95 vs $50 cap).
4. **Ledger & Webhooks**: Switch to the "3. AG Grid Ledger" tab and test the "Simulate INVOICE.PAID Webhook" button to watch the treasury update live.
5. **Agent Reasoning**: Open the "Agent Reasoning Panel" tab or expand the floating bottom bar to inspect every tool call and payload.
