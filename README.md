# SOT Platform Demo

Interactive web prototype for the **Stock Ownership Transfer (SOT)** platform — a CMA-supervised, bilingual (Arabic/English) demo for regulated private share transfers in Saudi Arabia.

## Quick start

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

## Demo walkthrough

1. **Seller registration** — OTP → Nafath KYC (enter the 2-digit code shown)
2. **Company KYB** — Wathq lookup with CR `1010123456` (clean), `1010987654` (discrepancy), `1010444444` (seller not in Wathq → document fallback), or `1010222222` (API fail → retry/fallback)
3. **Transfer initiation** — price, shares, market condition, fee + VAT breakdown
4. **Fairness Opinion** — reference-price validation with secondary-market discount bands (no NAV)
5. **Buyer confirmation** — Nafath auth, SAR 0 platform fee
6. **ROFR** — company review, 30-day window (use Demo Director to fast-forward)
7. **Signing** — seller → company → buyer via Nafath
8. **Dhamen escrow** — buyer funds after all signatures
9. **MoCI filing** — SBC portal guide → Wathq re-query
10. **Completion** — certificate + ZATCA e-invoice + dashboards

## Demo Director (floating panel)

- Switch roles: Seller / Buyer / Company Admin / Platform Admin
- Fast-forward ROFR to Day 15 or Day 30
- Trigger branches: discrepancy, price out-of-range, ROFR exercised, decline to sign
- Jump to any step

## Key compliance features

| Feature | Implementation |
|---------|----------------|
| KYC | Nafath (identity) — separate badge |
| KYB | Wathq API #31 — CR, UNN, entity type, Active status, parties, managers, capital |
| Fairness Opinion | Last reference price + secondary-market bands — validation only, no NAV |
| VAT | Deal exempt; 2% platform fee + 15% VAT on fee (seller only) |
| Escrow | Dhamen (Elm) — fund after signing, conditional release/refund |
| Audit trail | Visible on every screen |

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · In-memory state · Mock API layer

## Demo CR numbers (Wathq-shaped)

| CR | Type | Status | Notes |
|----|------|--------|-------|
| `1010123456` | SJSC (مساهمة مبسطة) | Active · confirmed 2025-11-20 | Happy path — Wathq match |
| `1010987654` | SJSC | Active | Discrepancy branch |
| `1010444444` | SJSC | Active | Seller not in Wathq parties → REG-03 document fallback |
| `1010222222` | SJSC | Active | First lookup fails (API) · retry succeeds · or document fallback |
| `1010111111` | LLC | Suspended | Rejected — ineligible + inactive |

Mock responses follow [Wathq Commercial Registration (New Legislation)](https://developer.wathq.sa/en/api/31) field structure: `crNumber`, `crNationalNumber`, `entityType`, `status`, `parties`, `management`, `capital.stockCapital`, etc.

## Seed data

- Reference price: SAR 100/share (Future Tech Ventures SJSC)
- Normal market validation range: SAR 80–90/share (from SAR 100 reference)
- In-range demo price: SAR 85 · Out-of-range: SAR 65
- Large deal preset hits SAR 20,000 fee cap when triggered via Demo Director
