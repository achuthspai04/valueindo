import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
  GROQ_API_KEY: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function hashIP(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function todayMidnightMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function cleanCompanyName(raw: string): string {
  let clean = raw.toLowerCase().trim();
  // Multi-word phrases first so "pvt. ltd." doesn't leave orphaned words
  clean = clean.replace(/pvt\.?\s*ltd\.?/gi, "");
  clean = clean.replace(/private\s+limited/gi, "");
  for (const w of [
    "technologies",
    "solutions",
    "services",
    "infotech",
    "tech",
    "india",
  ]) {
    clean = clean.replace(new RegExp(`\\b${w}\\b`, "gi"), "");
  }
  return clean.trim().replace(/\s+/g, " ");
}

async function callGroq(
  apiKey: string,
  messages: { role: string; content: string }[],
  maxTokens: number,
  temperature: number
): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });
  if (!res.ok) throw new Error(`Groq HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json<{
    choices: { message: { content: string } }[];
  }>();
  return data.choices[0].message.content;
}

// ─── Answer maps ──────────────────────────────────────────────────────────────

const sourceMap: Record<string, string> = {
  messaged_first: "The company messaged them first on WhatsApp, LinkedIn, or email",
  college_contact: "The company claimed to get their contact from their college",
  applied: "The student applied through a job platform themselves",
  referred: "A friend or contact referred them",
};

const paymentMap: Record<string, string> = {
  no: "No — never asked to pay",
  yes_confirm: "Yes — asked to pay to confirm the offer",
  yes_register: "Yes — asked to pay a registration fee",
  yes_training: "Yes — asked to pay for training material or a kit",
  yes_other: "Yes — asked to pay for an unspecified reason",
};

const compensationMap: Record<string, string> = {
  fixed_stipend: "Fixed monthly stipend",
  commission: "Performance or commission based only",
  unpaid: "Unpaid — no money at all",
  credits_only: "Academic credits only",
  certificate_only: "Certificate only — no money",
  not_mentioned: "Compensation was never mentioned",
};

const pressureMap: Record<string, string> = {
  hours: "Yes — pressured to confirm within a few hours",
  day: "Yes — pressured to confirm within a day",
  no_deadline: "No — no deadline was given",
};

const interviewMap: Record<string, string> = {
  proper: "Yes — a proper interview was conducted",
  form_quiz: "Only a quick form or quiz — not a real interview",
  instant: "No interview at all — offer came instantly",
  not_yet: "Not yet — still in process",
};

const collegeMap: Record<string, string> = {
  yes: "Yes — explicitly said the college gave them the contact",
  no: "No",
  implied: "They implied the college gave the contact but didn't say directly",
};

const offerLetterMap: Record<string, string> = {
  yes: "Yes — a formal offer letter was provided",
  no: "No offer letter was provided",
  later: "They said an offer letter would come later",
};

// ─── App ──────────────────────────────────────────────────────────────────────

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

// POST /session/create
app.post("/session/create", async (c) => {
  const ip = c.req.header("CF-Connecting-IP") ?? "127.0.0.1";
  const ipHash = await hashIP(ip);

  const row = await c.env.DB.prepare(
    "SELECT COUNT(*) AS count FROM sessions WHERE ip_hash = ? AND created_at > ?"
  )
    .bind(ipHash, todayMidnightMs())
    .first<{ count: number }>();

  if ((row?.count ?? 0) >= 5) {
    return c.json(
      { error: "Too many checks today. Come back tomorrow." },
      429
    );
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO sessions (id, created_at, ip_hash, completed, scoring_version) VALUES (?, ?, ?, 0, 'v1')"
  )
    .bind(id, Date.now(), ipHash)
    .run();

  return c.json({ id }, 200);
});

// POST /analyse
app.post("/analyse", async (c) => {
  type Answers = {
    q1_company: string;
    q2_source: string;
    q3_payment: string;
    q4_compensation: string;
    q5_pressure: string;
    q6_interview: string;
    q7_college?: string;
    q8_offer_letter?: string;
  };

  const body = await c.req.json<{
    sessionId: string;
    answers: Answers;
    extractedText?: string;
  }>();

  const { sessionId, answers, extractedText } = body;

  // Verify session exists
  const session = await c.env.DB.prepare(
    "SELECT id FROM sessions WHERE id = ?"
  )
    .bind(sessionId)
    .first<{ id: string }>();

  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  // ── Step 1: Company name ────────────────────────────────────────────────────

  const q1CompanyRaw = answers.q1_company ?? "";
  const q1CompanyClean = cleanCompanyName(q1CompanyRaw);

  // ── Step 2: Deterministic scoring ──────────────────────────────────────────

  type Change = { reason: string; points: number };
  const changes: Change[] = [];
  let score = 100;

  const apply = (points: number, reason: string) => {
    if (points === 0) return;
    changes.push({ reason, points });
    score += points;
  };

  // Tier 1 — instant red flags
  let hasTier1Flag = false;

  const tier1: [string | undefined, string, number, string][] = [
    [answers.q3_payment, "yes_confirm",       -45, "Asked to pay to confirm offer"],
    [answers.q3_payment, "yes_register",      -40, "Asked to pay a registration fee"],
    [answers.q3_payment, "yes_training",      -35, "Asked to pay for training or kit"],
    [answers.q3_payment, "yes_other",         -30, "Asked to pay — unspecified reason"],
    [answers.q5_pressure, "hours",            -30, "Pressured to confirm within hours"],
    [answers.q4_compensation, "certificate_only", -25, "Certificate only — no stipend"],
    [answers.q6_interview, "instant",         -20, "No interview — offer came instantly"],
    [answers.q5_pressure, "day",              -15, "Pressured to confirm within a day"],
    [answers.q4_compensation, "credits_only", -15, "Academic credits only"],
    [answers.q4_compensation, "unpaid",        -8, "Unpaid internship"],
  ];

  for (const [value, match, pts, reason] of tier1) {
    if (value === match) {
      apply(pts, reason);
      hasTier1Flag = true;
    }
  }

  // Tier 2 — context signals, amplified by Tier 1
  if (answers.q2_source === "messaged_first") {
    apply(hasTier1Flag ? -10 : -5, "Unsolicited outreach");
  }
  if (answers.q2_source === "college_contact") {
    apply(hasTier1Flag ? -10 : 0, "Claimed college gave contact");
  }
  if (answers.q4_compensation === "commission") {
    apply(hasTier1Flag ? -8 : -5, "Commission based only");
  }
  if (answers.q8_offer_letter === "no") {
    apply(hasTier1Flag ? -10 : -5, "No offer letter provided");
  }
  if (answers.q8_offer_letter === "later") {
    apply(hasTier1Flag ? -5 : -2, "Offer letter promised later");
  }
  if (answers.q7_college === "implied") {
    apply(hasTier1Flag ? -8 : -3, "Implied college gave contact");
  }
  if (answers.q7_college === "yes") {
    apply(hasTier1Flag ? -10 : 0, "Claimed college gave contact");
  }

  // Tier 3 — positive signals
  if (answers.q4_compensation === "fixed_stipend") apply(20, "Fixed monthly stipend offered");
  if (answers.q6_interview === "proper")            apply(20, "Proper interview conducted");
  if (answers.q2_source === "applied")              apply(10, "Student applied themselves");
  if (answers.q8_offer_letter === "yes")            apply(10, "Formal offer letter provided");
  if (answers.q2_source === "referred")             apply(5,  "Referred by someone known");
  if (answers.q6_interview === "form_quiz")         apply(-5, "Only a form or quiz, no real interview");

  score = Math.max(0, Math.min(100, score));
  const baseScore = score;

  const verdict =
    score <= 40 ? "Likely scam"
    : score <= 70 ? "Proceed with caution"
    : "Looks legit";

  const redFlags  = changes.filter((ch) => ch.points < 0).map((ch) => ch.reason);
  const greenFlags = changes.filter((ch) => ch.points > 0).map((ch) => ch.reason);

  // ── Step 4: Groq phrase detection (only if extractedText present) ───────────

  const adjustments: { phrase: string; type: string; points: number }[] = [];

  if (extractedText?.trim()) {
    try {
      const raw = await callGroq(
        c.env.GROQ_API_KEY,
        [
          {
            role: "system",
            content:
              "You are a document analyser. Find ONLY the specific phrases listed below in the provided text. Partial matches count. Return ONLY valid JSON with no explanation, no markdown, no extra text.",
          },
          {
            role: "user",
            content: `Find these RED FLAG phrases (partial match is fine):
"registration fee", "confirmation deposit", "pay to join", "self-funded", "brand ambassador", "brand representative", "limited seats", "certificate upon completion", "no fixed salary", "performance based only", "commission only", "training fee", "security deposit"

Find these GREEN FLAG phrases (partial match is fine):
"fixed stipend", "monthly stipend", "offer letter", "reporting to", "joining date", "employment agreement", "CTC", "per month"

Text to analyse:
${extractedText}

Return ONLY this exact JSON. Nothing else:
{"found": [{"phrase": "exact phrase found", "type": "red"}, {"phrase": "exact phrase found", "type": "green"}]}
If nothing is found return exactly: {"found": []}`,
          },
        ],
        500,
        0
      );

      const parsed = JSON.parse(raw) as {
        found: { phrase: string; type: "red" | "green" }[];
      };

      let phraseRedTotal = 0;
      let phraseGreenTotal = 0;

      for (const item of parsed.found) {
        if (item.type === "red" && phraseRedTotal > -20) {
          const pts = Math.max(-8, -20 - phraseRedTotal);
          phraseRedTotal += pts;
          adjustments.push({ phrase: item.phrase, type: "red", points: pts });
          score += pts;
        } else if (item.type === "green" && phraseGreenTotal < 20) {
          const pts = Math.min(5, 20 - phraseGreenTotal);
          phraseGreenTotal += pts;
          adjustments.push({ phrase: item.phrase, type: "green", points: pts });
          score += pts;
        }
      }

      score = Math.max(0, Math.min(100, score));
    } catch (err) {
      console.error("Groq phrase detection failed:", err);
    }
  }

  // ── Step 5: Groq verdict writing (always runs) ──────────────────────────────

  const fallbackSentence =
    verdict === "Likely scam"
      ? "This offer has serious red flags — do not accept without verifying every detail."
      : verdict === "Proceed with caution"
      ? "Some concerns with this offer — verify before accepting."
      : "This offer looks genuine based on what you shared.";

  const fallbackHrQuestions = [
    "Can you send me a formal offer letter before I confirm?",
    "What is the fixed monthly stipend for this role?",
    "Who will I be reporting to during the internship?",
  ];

  let verdictSentence = fallbackSentence;
  let hrQuestions = fallbackHrQuestions;

  try {
    const raw = await callGroq(
      c.env.GROQ_API_KEY,
      [
        {
          role: "system",
          content: `You are a blunt, accurate internship scam analyser for Indian college students. Your job is to explain a pre-calculated trust score in plain language. The score was calculated by a deterministic engine — you are only writing the explanation.
Rules you must follow without exception:
- Never say "I", "we", "it seems", "it appears", "might be", "could be", "may be"
- Never invent facts not present in the data given to you
- Never mention the score number in the verdict_sentence
- Write like you are texting a friend who needs the truth fast
- HR questions must sound like something a student would actually send on WhatsApp or email — not formal corporate language
- Return ONLY valid JSON. No markdown. No explanation outside the JSON.`,
        },
        {
          role: "user",
          content: `A student checked an internship offer. Here is everything we know:

Company: ${q1CompanyRaw}
Trust score: ${score}/100
Verdict: ${verdict}

What the student told us:
- How the offer came to them: ${sourceMap[answers.q2_source] ?? answers.q2_source}
- Asked to pay anything: ${paymentMap[answers.q3_payment] ?? answers.q3_payment}
- Compensation offered: ${compensationMap[answers.q4_compensation] ?? answers.q4_compensation}
- Pressure to confirm quickly: ${pressureMap[answers.q5_pressure] ?? answers.q5_pressure}
- Interview or selection process: ${interviewMap[answers.q6_interview] ?? answers.q6_interview}
- College gave contact: ${answers.q7_college ? (collegeMap[answers.q7_college] ?? answers.q7_college) : "Not answered"}
- Offer letter provided: ${answers.q8_offer_letter ? (offerLetterMap[answers.q8_offer_letter] ?? answers.q8_offer_letter) : "Not answered"}

Red flags identified: ${redFlags.join(", ") || "None"}
Green flags identified: ${greenFlags.join(", ") || "None"}

Your task:
1. Write a verdict_sentence — one sentence, under 20 words, explaining WHY this scored ${score}/100. Be specific to their actual answers. Do not be generic. Do not mention the number.
2. Write exactly 3 hr_questions the student should ask this company before accepting. Make them specific to the concerning answers — not generic interview questions. Frame them as things a student would actually say in a message.

Return ONLY this JSON:
{
  "verdict_sentence": "...",
  "hr_questions": ["...", "...", "..."]
}`,
        },
      ],
      400,
      0.3
    );

    const parsed = JSON.parse(raw) as {
      verdict_sentence: string;
      hr_questions: string[];
    };
    verdictSentence = parsed.verdict_sentence;
    hrQuestions = parsed.hr_questions;
  } catch (err) {
    console.error("Groq verdict writing failed:", err);
    // fallbacks already set above
  }

  // ── Step 6: Save to D1 ──────────────────────────────────────────────────────

  await c.env.DB.prepare(`
    UPDATE sessions SET
      q1_company_raw       = ?,
      q1_company_clean     = ?,
      q2_source            = ?,
      q3_payment           = ?,
      q4_compensation      = ?,
      q5_pressure          = ?,
      q6_interview         = ?,
      q7_college           = ?,
      q8_offer_letter      = ?,
      extracted_text       = ?,
      base_score           = ?,
      final_score          = ?,
      deductions           = ?,
      adjustments          = ?,
      verdict              = ?,
      verdict_sentence     = ?,
      red_flags            = ?,
      green_flags          = ?,
      hr_questions         = ?,
      completed            = 1
    WHERE id = ?
  `)
    .bind(
      q1CompanyRaw,
      q1CompanyClean,
      answers.q2_source,
      answers.q3_payment,
      answers.q4_compensation,
      answers.q5_pressure,
      answers.q6_interview,
      answers.q7_college ?? null,
      answers.q8_offer_letter ?? null,
      extractedText ?? null,
      baseScore,
      score,
      JSON.stringify(changes),
      JSON.stringify(adjustments),
      verdict,
      verdictSentence,
      JSON.stringify(redFlags),
      JSON.stringify(greenFlags),
      JSON.stringify(hrQuestions),
      sessionId
    )
    .run();

  // ── Step 7: Return ──────────────────────────────────────────────────────────

  return c.json(
    {
      score,
      verdict,
      verdict_sentence: verdictSentence,
      red_flags: redFlags,
      green_flags: greenFlags,
      hr_questions: hrQuestions,
      deductions: changes,
      sessionId,
    },
    200
  );
});

// GET /result/:id
app.get("/result/:id", async (c) => {
  const id = c.req.param("id");

  type SessionRow = {
    id: string;
    created_at: number;
    completed: number;
    q1_company_raw: string | null;
    final_score: number | null;
    verdict: string | null;
    verdict_sentence: string | null;
    red_flags: string | null;
    green_flags: string | null;
    hr_questions: string | null;
    deductions: string | null;
  };

  const row = await c.env.DB.prepare("SELECT * FROM sessions WHERE id = ?")
    .bind(id)
    .first<SessionRow>();

  if (!row) {
    return c.json({ error: "Result not found" }, 404);
  }

  if (row.completed === 0) {
    return c.json({ status: "processing" }, 202);
  }

  return c.json(
    {
      score: row.final_score,
      verdict: row.verdict,
      verdict_sentence: row.verdict_sentence,
      red_flags: JSON.parse(row.red_flags ?? "[]"),
      green_flags: JSON.parse(row.green_flags ?? "[]"),
      hr_questions: JSON.parse(row.hr_questions ?? "[]"),
      deductions: JSON.parse(row.deductions ?? "[]"),
      company: row.q1_company_raw,
      analysedAt: row.created_at,
      sessionId: row.id,
    },
    200
  );
});

// POST /email
app.post("/email", async (c) => {
  const body = await c.req.json<{
    sessionId?: string;
    email?: string;
    testimonialPermission?: boolean;
  }>();

  const { sessionId, email, testimonialPermission } = body;

  if (!sessionId) {
    return c.json({ error: "sessionId required" }, 400);
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: "Invalid email address" }, 400);
  }

  const session = await c.env.DB.prepare(
    "SELECT id FROM sessions WHERE id = ?"
  )
    .bind(sessionId)
    .first<{ id: string }>();

  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  await c.env.DB.prepare(
    `UPDATE sessions SET
       email = ?,
       testimonial_permission = ?,
       testimonial_submitted_at = ?
     WHERE id = ?`
  )
    .bind(email, testimonialPermission ? 1 : 0, Date.now(), sessionId)
    .run();

  return c.json({ success: true }, 200);
});

export default app;
