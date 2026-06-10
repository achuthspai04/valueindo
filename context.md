# Valueindo — project context

Read this before doing anything. This is the source of truth for the product.

---

## What is this

Valueindo is an internship scam checker for Indian students — especially tier 2/3 college students who frequently get approached by fake or exploitative internship offers. The name comes from Malayalam slang: "value indo?" = "does it have any value?"

The tool lets a student answer structured questions about an internship offer and get back a trust score, red/green flags, a verdict sentence, and questions to ask HR before deciding.

---

## Monorepo structure

```
valueindo/
  web/      → Next.js frontend (Cloudflare Pages)
  worker/   → Cloudflare Worker backend (Hono.js)
  CONTEXT.md
```

---

## Frontend stack (web/)

- Next.js (App Router)
- shadcn/ui components
- Tailwind CSS
- Light mode only — no dark mode
- Tesseract.js for OCR (runs in browser, extracts text from uploaded images/PDFs before sending to worker)

---

## Backend stack (worker/)

- Cloudflare Workers (Hono.js)
- Cloudflare D1 (SQLite database)
- Groq API — llama-3.3-70b-versatile (free tier, 6k req/day)
- NO Claude API, NO OpenAI

---

## Design tokens

```
Primary red (danger, scam signals, CTA):  #E8380D
Primary blue (trust, legit signals):      #2563EB
Amber (caution):                          #F59E0B
Background:                               #FFFFFF
Body text:                                #0f0f0f
Secondary text:                           #6b7280
Border:                                   #f3f4f6
```

Fonts: Space Grotesk (logo, numbers), Instrument Serif (headlines, italic), Inter (body).

---

## Pages (web/)

### 1. Landing page (/)
- Navbar: logo "valueindo?" (indo in #E8380D), "how it works" right
- Hero: h1 "That internship offer — is it real or a trap?", subtext, red pill CTA "Is it legit?"
- Raw quote below CTA — no box, just typography
- Footer: "built for Indian students, by one of you"

### 2. Form (/check/[step])
One question per screen, separate route per step, auto-advance on radio select.

Steps in order:
- /check/1 — Company name (text input)
- /check/2 — How did it come to you? (radio)
- /check/3 — Did they ask you to pay? (radio)
- /check/4 — Compensation offered? (radio)
- /check/5 — Pressured to confirm quickly? (radio)
- /check/6 — Was there an interview? (radio)
- /check/upload — Upload offer letter / screenshot (optional, nudge not gate)
- /check/optional/7 — College contact? (radio, optional)
- /check/optional/8 — Offer letter provided? (radio, optional)
- /check/optional/9 — How was this internship structured? (radio, optional)
- /check/analysing — Loading screen with step ticker

Session ID is generated at /check/1 and stored in browser state throughout.
OCR runs in browser on upload screen before submitting.

#### Optional questions — answer codes

Q9 (optional) — How was this internship structured?
- one_on_one: One-on-one with a company or team
- cohort: Part of a group or cohort of students
- course_style: Like a course or training program with modules and sessions
- not_sure: Not sure yet

### 3. Result page (/result/[id])
- Score (0–100), verdict label, red/green flag pills
- AI verdict sentence
- HR questions
- Email collect (optional, before card unlocks)
- Shareable card (downloadable PNG)
- "Check another offer" CTA

---

## Verdict thresholds

- 0–40 → Likely scam (#E8380D)
- 41–70 → Proceed with caution (#F59E0B)
- 71–100 → Looks legit (#2563EB)

---

## Scoring logic — deterministic (your code, not AI)

Start at 100, apply deductions/additions.

### Tier 1 — Standalone flags (always deduct)
| Answer | Points |
|---|---|
| Asked to pay to confirm offer | -45 |
| Asked to pay to register | -40 |
| Asked to pay for training/kit | -35 |
| Asked to pay — other | -30 |
| Pressured within hours | -30 |
| Certificate only | -25 |
| No interview — instant offer | -20 |
| Pressured within a day | -15 |
| Academic credits only | -15 |
| Unpaid | -8 |

### Tier 2 — Context signals (amplified if combined with Tier 1)
| Answer | Alone | With Tier 1 flag |
|---|---|---|
| They messaged first | -5 | -10 |
| College gave contact | 0 | -10 |
| Commission based | -5 | -8 |
| No offer letter | -5 | -10 |
| They implied college contact | -3 | -8 |
| Course-style structure (q9_structure = course_style) | -10 | -20 |
| Cohort structure (q9_structure = cohort) | -5 | -15 |

### Tier 3 — Positive signals (always add)
| Answer | Points |
|---|---|
| Fixed monthly stipend | +20 |
| Proper interview | +20 |
| Applied themselves | +10 |
| Offer letter provided | +10 |
| Referred by someone known | +5 |
| Just a form/quiz | -5 |

Clamp final score between 0 and 100.
Store scoring_version = 'v1' with every result.

---

## Worker endpoints (worker/)

### POST /session/create
- Generate unique session ID (crypto.randomUUID)
- Hash IP for rate limiting
- Check: max 5 sessions per IP per day
- Create blank row in D1
- Return { id }

### POST /analyse
Receives: { sessionId, answers: {q1–q8}, extractedText? }

1. Save answers to D1
2. Clean company name (lowercase, trim, strip "pvt ltd" etc)
3. Run deterministic scoring engine → base_score + deductions array
4. If extractedText exists → Groq call 1 (phrase detection) → adjust score
5. Groq call 2 (verdict sentence + HR questions) with full context
6. Save everything to D1, mark completed = 1
7. Return full result JSON

### GET /result/:id
- Fetch session from D1 by ID
- If not found → 404
- If completed = 0 → return { status: 'processing' }
- If completed = 1 → return full result

### POST /email
- Receives: { sessionId, email, testimonialPermission }
- Validate email format
- Update D1 row
- Return { success: true }

---

## Groq integration

Model: llama-3.3-70b-versatile
Base URL: https://api.groq.com/openai/v1

### Groq call 1 — phrase detection (only if extractedText exists)
Input: raw extracted text from uploaded document
Output: JSON array of { phrase, type: 'red'|'green' }
Each red phrase: -8 points. Each green phrase: +5 points. Max adjustment: ±20 points.

Red phrases: "registration fee", "confirmation deposit", "pay to join",
"self-funded", "brand ambassador", "brand representative", "limited seats",
"certificate upon completion", "no fixed salary", "performance based only",
"commission only", "training fee", "security deposit"

Green phrases: "fixed stipend", "monthly stipend", "offer letter",
"reporting to", "joining date", "employment agreement", "CTC", "per month"

### Groq call 2 — verdict writing (always runs)
Input: company name + all answers + final score + all flags
Output: { verdict_sentence, hr_questions: string[3] }
- verdict_sentence under 20 words, direct, no hedging
- HR questions specific to their answers
- Indian internship context
- Never say "I" or "we"

---

## D1 schema

See worker/schema.sql for full schema.

Key fields:
- Identity: id, created_at, completed, ip_hash, scoring_version, flow_type, is_bulk, language, org_id, previous_session_id
- Inputs: q1_company_raw, q1_company_clean, q2–q8 answers, extracted_text
- Scoring: base_score, final_score, deductions (JSON), adjustments (JSON)
- LLM output: verdict, verdict_sentence, red_flags (JSON), green_flags (JSON), hr_questions (JSON)
- Post-result: email, testimonial_permission, testimonial_status, testimonial_text, testimonial_submitted_at
- Wall: wall_submitted, wall_status, wall_approved_at, is_verified
- Dispute: dispute_submitted, dispute_reason

Indexes: idx_company (q1_company_clean), idx_wall (wall_status), idx_created (created_at), idx_ip (ip_hash), idx_org (org_id)

---

## Rate limiting

5 sessions per IP per day.
Checked in /session/create using D1 query on ip_hash + created_at.
Return 429 if exceeded.

---

## V1 — ship this

- Landing page ✓
- Full form flow Q1–Q8 + upload + optionals ✓
- Analysing screen ✓
- Deterministic scoring engine
- Groq phrase detection + verdict generation
- Result page (score + verdict + flags + HR questions + email collect)
- Shareable link /result/[id] — permanent
- Downloadable share card (PNG)
- Company name soft validation
- Rate limiting by IP
- Legal disclaimer on result page
- "Check another offer" CTA
- Result analysis date shown

## V2 — data ready, build later

- Community scam wall (public)
- Admin approval queue UI
- Verified/unverified badges
- Company name autocomplete ("3 reports for this company")
- PDF result download
- Testimonial outreach flow
- Malayalam/Hindi verdict
- Placement cell / bulk check version
- "Already in a scam internship" flow
- State of Internship Scams annual report
- Dispute this result button

---

## Tone and copy rules

- Conversational, not corporate
- Direct — students are anxious, don't hedge
- Indian student context — WhatsApp outreach, placement cells, certificate mills
- Never use "leverage", "utilize", "synergy"
- Footer line: "built for Indian students, by one of you" — keep exactly
