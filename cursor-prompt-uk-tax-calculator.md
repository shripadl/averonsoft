# Cursor Build Prompt — UK Salary/Tax Calculator

Copy everything below into Cursor as the project brief / initial instruction.

---

## Project Goal

Build a UK take-home pay / income tax calculator web app, initially deployed at
`averonsoft.com/uk-tax-calculator` (or `tax.averonsoft.com`), but architected from
day one so it can be **detached into its own standalone repo and domain** with
minimal rework if it later becomes its own product (e.g. `listentopay.co.uk` or
similar).

This is an **original build**. Do not copy any layout, colour scheme, copy text,
component structure, CSS class names, or visual design from any existing tax
calculator site (listentotaxman.com, thesalarycalculator.co.uk, etc.). Those
sites may only be referenced for **which input fields and output figures a UK
salary calculator conventionally needs** — never for how it looks or reads.
All UI copy, layout, colour palette, iconography and component design must be
original work.

---

## 1. Detachability requirements (non-negotiable)

- Build as a **self-contained module/package**, not tightly coupled to any
  existing Averonsoft codebase, even if it's initially mounted inside one.
- Structure as its own folder (`/apps/uk-tax-calculator` if using a monorepo,
  or a fully separate repo from the start — prefer separate repo with a
  subpath proxy/rewrite from the main Averonsoft site).
- No hardcoded references to "Averonsoft" in code, config, or component
  internals. All branding (site name, logo, domain, footer links, analytics
  IDs, contact email) must live in a single `brand.config.ts` (or `.env`)
  file that can be swapped in one edit if the site is ever spun out.
- Domain-agnostic routing: don't assume it's served from a subpath. Use
  relative asset paths and environment-driven `NEXT_PUBLIC_BASE_URL` (or
  equivalent) so it can run at root domain or subpath without code changes.
- Own `package.json`, own dependencies, own build — should be deployable
  independently to Vercel/Netlify/any static host without touching the rest
  of the Averonsoft codebase.
- No shared global state, shared database, or shared auth with the rest of
  the site unless explicitly optional and feature-flagged off by default.
- Include a short `DETACH.md` in the repo explaining the 3–5 steps to move
  this to a new domain (update brand config, update DNS/CNAME, update
  analytics ID, redeploy).

---

## 2. Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS with a custom design token set (see Section 4 —
  do not use default Tailwind "slate/indigo" starter look)
- **State:** Local component state / URL search params for shareable results
  (no backend needed for the core calculator — pure client-side computation)
- **Testing:** Vitest or Jest for the tax calculation engine (this is the
  part that must be bulletproof — see Section 6)
- **Deployment target:** Vercel, but should build as static export if needed
- **Analytics:** stub in a generic analytics wrapper (e.g. Plausible or GA4)
  driven entirely by env vars, not hardcoded

---

## 3. Core calculation engine (build first, as a pure, framework-agnostic module)

Create `/lib/tax-engine/` as pure TypeScript functions with zero UI
dependencies, fully unit-testable in isolation. This is the module most
worth getting exactly right and most reusable if detached.

Inputs to support:
- Gross salary (annual / monthly / weekly / daily / hourly, with hours-per-week
  and days-per-week for hourly/daily conversion)
- Tax year selector (support current + prior 2 years, structured so adding a
  new year is just adding a new rates config object, not new logic)
- Region: England/Wales/NI vs Scotland (different income tax bands)
- Tax code (support standard codes, and overrides like BR, D0, D1, NT, 0T)
- Age band (affects nothing directly now that NI/State Pension age logic has
  changed, but keep the field for future-proofing / NI category letter logic)
- NI category letter (A, B, C, H, M, etc.)
- Pension contribution: percentage or fixed amount, and method (salary
  sacrifice / relief at source / net pay arrangement) — these produce
  different taxable-pay and NI outcomes and should be modeled correctly
- Student loan plan (Plan 1, 2, 4, 5, Postgraduate) with correct thresholds
- Blind person's allowance toggle
- Marriage allowance toggle
- Rental/other income (added to total income for tax band purposes, flagged
  separately from employment income for NI purposes since NI doesn't apply
  to rental income)
- Additional pre-tax salary sacrifice deductions (generic "other deductions"
  field)
- Optional: employer NI calculation (useful for freelance/contractor
  comparisons and for showing "true cost to employer")

Outputs to calculate and clearly separate:
- Gross pay (annual/monthly/weekly)
- Personal allowance (with the £100k–£125,140 taper applied correctly)
- Taxable income
- Income tax due, broken down by band (basic/higher/additional, or Scottish
  bands) — show the band breakdown, not just the total
- National Insurance due (correct 2024+ employee rates, respecting NI
  category and any changes for the selected tax year)
- Student loan repayment
- Pension contribution amount
- Total deductions
- Net take-home pay (annual/monthly/weekly/daily)
- Employer NI cost (if included)
- Effective tax rate and marginal tax rate (nice original touch — most
  competitor calculators don't show marginal rate clearly)

**Data source discipline:** All rates, bands and thresholds must be sourced
from HMRC's published rates for each tax year (gov.uk), stored in a typed
config object per tax year (e.g. `rates/2026-27.ts`), with a comment citing
the HMRC page. Never estimate or guess a threshold — if unsure, flag it in
the code with a `// TODO: verify against HMRC` rather than inventing a
number. Ask me to confirm current-year figures before shipping if you can't
verify them.

---

## 4. Original design direction

- Do not replicate the dense, spreadsheet-style, orange/blue table layout of
  listentotaxman. Design something cleaner and more modern: a single
  input panel (left or top) and a results panel (right or below) that
  updates live as the user types, with a simple annual/monthly/weekly toggle.
- Pick an original colour palette and typography that matches Averonsoft's
  existing brand if one exists — otherwise propose a clean, professional
  palette (avoid generic Tailwind indigo-500 defaults; pick something
  distinctive, e.g. a deep teal/charcoal or navy/amber combination).
- Results should be visually scannable: a simple horizontal bar or donut
  showing the gross pay split into take-home / tax / NI / pension /
  student loan, rather than a dense multi-column table.
- Add an optional "compare two scenarios" view (e.g. before/after a pension
  contribution change, or before/after a salary offer) — this is a genuinely
  useful original feature not commonly found on competitor sites.
- Mobile-first responsive layout; the source screenshot's UI is desktop-table
  heavy and not mobile-friendly — deliberately do better here.
- Write all UI copy, labels, tooltips and help text from scratch in your own
  words — don't paraphrase competitor tooltip text closely.

---

## 5. Content & legal

- Include a clearly written, original disclaimer: figures are estimates for
  guidance only, not financial/tax advice, based on HMRC rates for the
  selected tax year, and users should confirm with HMRC or a qualified
  accountant for their specific circumstances.
- Cite gov.uk as the source of rates in a small "data sources" footnote,
  linking to the relevant HMRC page — this is good practice and also
  reinforces originality (we're citing the primary source, not a competitor).
- No scraped or copied glossary text, blog content, or FAQ wording from any
  competitor site. If a glossary/FAQ section is wanted, write original
  definitions.

---

## 6. Testing

- Unit tests for the tax engine covering: basic/higher/additional rate
  boundaries, personal allowance taper edge cases (exactly £100k, £125,140+),
  Scottish band differences, each student loan plan's threshold, NI category
  differences, and salary-sacrifice vs relief-at-source pension math.
- Include a handful of known worked examples (e.g. "£50,000 salary, standard
  tax code, England, Plan 2 student loan, 5% pension") with manually
  verified expected outputs as regression tests.

---

## 7. Deliverable structure

```
/uk-tax-calculator
  /app                  → Next.js routes/pages
  /components           → original UI components
  /lib/tax-engine        → pure calculation logic + rates configs
    /rates/2024-25.ts
    /rates/2025-26.ts
    /rates/2026-27.ts
  /lib/tax-engine/__tests__
  /config
    brand.config.ts      → single source of truth for name/domain/logo/links
  DETACH.md
  README.md
```

---

## Instruction to Cursor

Start by scaffolding the Next.js + TypeScript + Tailwind project with this
folder structure, then build the tax engine and its tests first (Section 3
and 6) before touching any UI. Confirm the HMRC rate figures you're using for
the current tax year before finalizing the rates config — ask me if anything
is ambiguous rather than guessing. Once the engine passes tests, build the
original UI (Section 4) around it.
