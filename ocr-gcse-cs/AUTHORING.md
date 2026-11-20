# Authoring brief — OCR GCSE Computer Science (J277) course lessons

You are writing lesson content files for a ready-to-teach GCSE course. Each lesson is ONE JSON file at
`content/<id>.json`. The renderer (`assets/course.js`) turns it into a web page. Follow this brief exactly.

## Audience and standard
- OCR GCSE Computer Science J277 (first teaching 2020). GCSE ONLY — no A-level content, no `extension` field.
- Students are 14–16, many weak readers; teachers may be non-specialists teaching from the page.
- Written by/for an OCR examiner: exam answers follow the SHAPE of J277 points-based schemes (one mark per distinct
  point; "describe" = what/how, "explain" = what + because; "compare" refers to both items in each sentence).
  NEVER reproduce text from OCR mark schemes or papers. Write original questions in J277 style.
- British English. Plain words. Sentences under 25 words where possible.

## Schema (copy the structure of `content/2-1-07.json` for a normal lesson, `content/1-1-05.json` for an
## exam-practice lesson, `content/1-1-06.json` for a unit test)
Required keys for a normal lesson:
- `id`, `title`, `spec` (e.g. "1.2.3"), `duration` (60)
- `specPoints`: 2–3 bullets in OCR's wording of the spec content (bold the key terms with **)
- `learn`: 4–6 bullets "By the end you must be able to…" — concrete, assessable verbs
- `hook`: 2–4 sentences a teacher reads aloud to open; concrete, surprising, classroom-doable
- `video`: `{ "title", "brief" }` — brief = 3–5 sentence storyboard for a 3–5 minute explainer video (no url)
- `explain`: 4–6 sections `{ "h", "p": [..], "code"?: "...", "list"?: [..], "after"?: [..] }`. Use `code` blocks
  for tables (monospace columns), calculations, worked examples. Inline markup: **bold**, `code`.
- `simple`: 3–5 sections, same shape, SAME content at a lower reading age (short sentences, concrete, no
  subordinate clauses). This is shown when the student turns on "Easier text".
- `keyterms`: 4–8 `{ "term", "def" }` — the spec's vocabulary, one-sentence definitions
- `try`: 4–5 activities. Types:
  - `{ "type":"task", "title", "p":[..]?, "steps":[..]?, "code"?: "...", "after":[..]? }` — paper/discussion task
  - `{ "type":"embed", "title", "url", "instructions":[..] }` — iframe of an existing tool (see URL list below)
  - `{ "type":"python", "title", "p":[..], "code":"starter code" }` — in-page Python runner (students run it)
  - `{ "type":"sql", ... }` — only for SQL lessons (not needed in Paper 1)
  Paper 1 lessons MUST still be practice-heavy: at least one embed of a relevant tool, at least one hands-on
  task (calculation, conversion, classification, design, card-sort), and where it genuinely helps, a short
  `python` activity that makes the concept concrete (e.g. convert binary, compute file size, simulate packets,
  Caesar cipher). Do not force Python where it adds nothing.
- `check`: 5 multiple-choice `{ "q", "opts":[4], "a": index, "fb": "one-line why" }`
- `exam`: 3 questions `{ "q", "marks", "model":[..], "commentary": "..." }` in J277 style across command words
  (state/describe/explain/compare/justify). `model` = indicative points with (1) per mark. `commentary` = the
  examiner's note on where marks are won/lost (shown in Teacher view). Include one applied (scenario) question.
- `home`: one homework sentence/paragraph
- `teacher`: `{ "timing", "misconceptions":[3-4], "say":[2-3 teacher one-liners], "skip": "...", "differentiation":[support, stretch] }`
Do NOT include `i18n`. Do NOT include `extension`.

Exam-practice lesson (the unit's penultimate slot where course.json says "exam questions"): like `1-1-05.json` —
`explain` has a short "how to use" + reminders; `exam` has ~10 questions (≈24 marks) across the unit; no `try`,
`check` optional, `home` present.
Unit test (last slot "Unit review and test" / "Writing the long-answer question" for 1.6): like `1-1-06.json` —
a 5-minute review list in `explain`, 8–10 exam questions totalling 25–30 marks, teacher notes with bands.
For 1.6 the final slot is "Writing the long-answer question": make it a lesson on the 8-mark Paper 1 question
applied to 1.6 scenarios (plan grid, PEAC paragraphs, conclusion), with 2 full 8-mark practice stems and
indicative content in `model`, plus a short review list. Cross-reference "the Exam technique unit, lesson 5".

## Tools you may embed (all live under https://beanwise.coderra.je/)
cs_animations/binary.html (binary/denary/ASCII), cs_animations/bases.html (number bases), cs_animations/binary-math.html
(binary addition, shifts), cs_animations/cpu.html, cs_animations/logic.html, cs_animations/cipher.html (encryption),
cs_animations/web-technologies-workbench.html (networks/web), Hexadecimal/ (hex converter tool), binary/ (binary tool),
GCSE_homepage/bitmap.html (image representation), GCSE_homepage/sound.html (sound sampling), GCSE_homepage/compression.html,
GCSE_homepage/networks.html, GCSE_homepage/cybersecurity.html, GCSE_homepage/Topic2_Data.html, GCSE_homepage/Topic3_Computers.html,
GCSE_homepage/Topic4_Networks.html, GCSE_homepage/Topic5_Issues.html, GCSE_homepage/Hardware_Topic_Games.html,
GCSE_homepage/Software_Topic_Games.html, GCSE_homepage/Paper1_Answer_Builder.html, GCSE_homepage/CS_Crossword.html,
GCSE_homepage/Connect_Wall.html, revision-hub/key-terms/, revision-hub/, connections_game/, boggle/.
Use the full URL. Pick the ones that fit; 1–2 embeds per lesson.

## Style rules
- Every explanation section must teach something a student could be asked about; no filler.
- Numbers and worked examples wherever the spec involves calculation (units, file sizes, binary, hex, sample rates).
- Exam commentary must be specific: which word earns the mark, which common slip loses it.
- No emoji. No references to "this website". Don't mention Claude or AI.
- Valid JSON (double quotes, no trailing commas, escape backslashes and quotes inside strings).
