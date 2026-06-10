CREATE TABLE IF NOT EXISTS sessions (
  id                      TEXT    PRIMARY KEY,
  created_at              INTEGER NOT NULL,
  completed               INTEGER NOT NULL DEFAULT 0,
  flow_type               TEXT    NOT NULL DEFAULT 'check',
  is_bulk                 INTEGER NOT NULL DEFAULT 0,
  language                TEXT    NOT NULL DEFAULT 'en',
  ip_hash                 TEXT    NOT NULL,
  scoring_version         TEXT    NOT NULL DEFAULT 'v1',
  org_id                  TEXT,
  previous_session_id     TEXT,

  -- form answers
  q1_company_raw          TEXT,
  q1_company_clean        TEXT,
  q2_source               TEXT,
  q3_payment              TEXT,
  q4_compensation         TEXT,
  q5_pressure             TEXT,
  q6_interview            TEXT,
  q7_college              TEXT,
  q8_offer_letter         TEXT,
  q9_structure            TEXT,

  -- uploaded document
  extracted_text          TEXT,

  -- scoring output
  base_score              INTEGER,
  final_score             INTEGER,
  deductions              TEXT,
  adjustments             TEXT,
  verdict                 TEXT,
  verdict_sentence        TEXT,
  red_flags               TEXT,
  green_flags             TEXT,
  hr_questions            TEXT,

  -- post-result
  email                   TEXT,
  testimonial_permission  INTEGER DEFAULT 0,
  testimonial_status      TEXT    DEFAULT 'pending',
  testimonial_text        TEXT,
  testimonial_submitted_at INTEGER,

  -- scam wall
  wall_submitted          INTEGER DEFAULT 0,
  wall_status             TEXT    DEFAULT 'pending',
  wall_approved_at        INTEGER,
  is_verified             INTEGER DEFAULT 0,

  -- disputes
  dispute_submitted       INTEGER DEFAULT 0,
  dispute_reason          TEXT
);

CREATE INDEX IF NOT EXISTS idx_company  ON sessions (q1_company_clean);
CREATE INDEX IF NOT EXISTS idx_wall     ON sessions (wall_status);
CREATE INDEX IF NOT EXISTS idx_created  ON sessions (created_at);
CREATE INDEX IF NOT EXISTS idx_ip       ON sessions (ip_hash);
CREATE INDEX IF NOT EXISTS idx_org      ON sessions (org_id);
