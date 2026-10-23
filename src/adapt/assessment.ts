// Aptitude assessment, not a maths test.
// Two lanes: spark (short, playful, format-switching) and deep (multi-step reasoning).
// Domains change what is asked, so a future web builder is not drilled on quadratics.

export type Lane = "spark" | "deep";
export type Domain = "web" | "data" | "business" | "cyber";

export interface ProbeOption { label: string; correct: boolean; }

export interface Probe {
  id: string;
  kind: Lane;
  domain: Domain;
  dimension: "logic" | "pattern" | "verbal" | "system";
  format: "odd-one-out" | "true-false" | "sequence" | "scenario";
  prompt: string;
  options: ProbeOption[];
  hints: string[];
  why: string;
  expectedMs: number;
}

export interface ProbeResult {
  probeId: string;
  kind: Lane;
  domain: Domain;
  dimension: string;
  correct: boolean;
  usedHint: boolean;
  ms: number;
  at: number;
}

export interface DomainInfo { id: Domain; label: string; blurb: string; }

export const DOMAINS: DomainInfo[] = [
  { id: "web", label: "Build for the web", blurb: "Layouts, logic, debugging" },
  { id: "data", label: "Work with data", blurb: "Patterns, tables, inference" },
  { id: "business", label: "Run a business", blurb: "Numbers, trade-offs, judgement" },
  { id: "cyber", label: "Security and systems", blurb: "Rules, exceptions, risk" }
];

const WEB: Probe[] = [
  { id: "w-s1", kind: "spark", domain: "web", dimension: "logic", format: "odd-one-out",
    prompt: "Three of these belong together. Which one does not?",
    options: [{ label: "A header", correct: false }, { label: "A footer", correct: false }, { label: "A button", correct: false }, { label: "A stylesheet", correct: true }],
    hints: ["Which one describes how things look rather than a part of the page?"],
    why: "A stylesheet controls appearance. The other three are parts of the page itself.", expectedMs: 20000 },
  { id: "w-s2", kind: "spark", domain: "web", dimension: "pattern", format: "true-false",
    prompt: "True or false: if a page looks right on your laptop, it will look right on a phone.",
    options: [{ label: "True", correct: false }, { label: "False", correct: true }],
    hints: ["Think about screen width."],
    why: "Screen size changes layout. Responsive design exists for this reason.", expectedMs: 15000 },
  { id: "w-s3", kind: "spark", domain: "web", dimension: "system", format: "sequence",
    prompt: "A button does nothing when clicked. What is the first thing worth checking?",
    options: [{ label: "Whether the click is wired to anything", correct: true }, { label: "Whether the colours match", correct: false }, { label: "Whether the font is loaded", correct: false }, { label: "Whether the page is too long", correct: false }],
    hints: ["Start where the action should happen."],
    why: "Check the handler before anything visual. No handler, no response.", expectedMs: 25000 },
  { id: "w-d1", kind: "deep", domain: "web", dimension: "logic", format: "scenario",
    prompt: "You build a sign-up form. Half of new users abandon it. Which change is most worth testing first?",
    options: [{ label: "Cut the number of required fields and measure completion", correct: true }, { label: "Change the background colour", correct: false }, { label: "Add more validation messages", correct: false }, { label: "Move the form lower on the page", correct: false }],
    hints: ["Where do people usually give up?", "Which change is measurable in one week?"],
    why: "Effort is the usual cause of abandonment. Fewer required fields is the testable version.", expectedMs: 80000 },
  { id: "w-d2", kind: "deep", domain: "web", dimension: "system", format: "scenario",
    prompt: "A page loads slowly only for users in another country. What is the most likely cause?",
    options: [{ label: "Distance to the server and asset weight", correct: true }, { label: "The users have older browsers", correct: false }, { label: "The page has too many headings", correct: false }, { label: "The domain name is too long", correct: false }],
    hints: ["What differs by location?", "What gets sent over the wire?"],
    why: "Latency and asset size grow with distance. That is what a CDN addresses.", expectedMs: 75000 }
];

const DATA: Probe[] = [
  { id: "d-s1", kind: "spark", domain: "data", dimension: "pattern", format: "sequence",
    prompt: "2, 6, 12, 20, 30, ... what comes next?",
    options: [{ label: "42", correct: true }, { label: "36", correct: false }, { label: "40", correct: false }, { label: "44", correct: false }],
    hints: ["Look at the gaps: 4, 6, 8, 10."],
    why: "The gaps grow by two, so the next gap is 12.", expectedMs: 25000 },
  { id: "d-s2", kind: "spark", domain: "data", dimension: "logic", format: "odd-one-out",
    prompt: "Which does not belong?",
    options: [{ label: "Average", correct: false }, { label: "Median", correct: false }, { label: "Mode", correct: false }, { label: "Total", correct: true }],
    hints: ["Three of them describe a typical value."],
    why: "Average, median and mode are measures of the middle. A total is a sum.", expectedMs: 20000 },
  { id: "d-s3", kind: "spark", domain: "data", dimension: "system", format: "true-false",
    prompt: "True or false: a chart with a cut-off vertical axis can make a small difference look large.",
    options: [{ label: "True", correct: true }, { label: "False", correct: false }],
    hints: ["Where does the vertical axis start?"],
    why: "Truncating the axis exaggerates differences. That is a common deception.", expectedMs: 15000 },
  { id: "d-d1", kind: "deep", domain: "data", dimension: "logic", format: "scenario",
    prompt: "Two classes sit the same test. Both average 62. Class A ranges 58 to 66, Class B ranges 45 to 79. What follows?",
    options: [{ label: "Same centre, very different spread, so B is less consistent", correct: true }, { label: "Class A is better", correct: false }, { label: "Class B is better", correct: false }, { label: "Nothing can be said", correct: false }],
    hints: ["Equal averages tell you about the middle.", "What does the range describe?"],
    why: "Equal means mean equal centres. The range difference is about consistency, not quality.", expectedMs: 80000 },
  { id: "d-d2", kind: "deep", domain: "data", dimension: "system", format: "scenario",
    prompt: "A shop sees sales rise after a discount. What would make you doubt that the discount caused it?",
    options: [{ label: "Sales also rose the same week last year", correct: true }, { label: "The discount was advertised", correct: false }, { label: "The shop is popular", correct: false }, { label: "The product is cheap", correct: false }],
    hints: ["What else could have moved at the same time?"],
    why: "A matching rise without the discount points at seasonality, not the promotion.", expectedMs: 75000 }
];

const BUSINESS: Probe[] = [
  { id: "b-s1", kind: "spark", domain: "business", dimension: "logic", format: "true-false",
    prompt: "True or false: a business can grow sales and still run out of cash.",
    options: [{ label: "True", correct: true }, { label: "False", correct: false }],
    hints: ["When do customers actually pay?"],
    why: "Cash arrives later than cost. Growth can drain cash before it pays back.", expectedMs: 15000 },
  { id: "b-s2", kind: "spark", domain: "business", dimension: "pattern", format: "sequence",
    prompt: "You sell 10 units at 500. Costs are 200 each. What is the profit?",
    options: [{ label: "3000", correct: true }, { label: "5000", correct: false }, { label: "2000", correct: false }, { label: "7000", correct: false }],
    hints: ["Margin per unit first."],
    why: "Margin is 300 per unit, times 10 units.", expectedMs: 30000 },
  { id: "b-s3", kind: "spark", domain: "business", dimension: "system", format: "odd-one-out",
    prompt: "Which is not a fixed cost?",
    options: [{ label: "Rent", correct: false }, { label: "Salaries", correct: false }, { label: "Packaging per order", correct: true }, { label: "Insurance", correct: false }],
    hints: ["Which cost changes with each sale?"],
    why: "Packaging scales with volume, so it is variable.", expectedMs: 20000 },
  { id: "b-d1", kind: "deep", domain: "business", dimension: "logic", format: "scenario",
    prompt: "One product sells well but barely breaks even. Another sells less but has triple the margin. What do you do first?",
    options: [{ label: "Raise the price or cut the cost of the high-volume product and measure", correct: true }, { label: "Drop the high-volume product immediately", correct: false }, { label: "Advertise the low-margin product more", correct: false }, { label: "Nothing, volume is what matters", correct: false }],
    hints: ["Volume without margin does not pay rent.", "Which lever is testable in a month?"],
    why: "Volume with thin margin is a treadmill. Fix the margin before scaling it.", expectedMs: 80000 },
  { id: "b-d2", kind: "deep", domain: "business", dimension: "system", format: "scenario",
    prompt: "A supplier raises prices 20 percent and you cannot pass it all on. What is the strongest first response?",
    options: [{ label: "Model the margin hit, then test a partial price rise on one segment", correct: true }, { label: "Absorb it and hope volume covers it", correct: false }, { label: "Switch supplier immediately", correct: false }, { label: "Cut staff", correct: false }],
    hints: ["What do you need to know before acting?", "Which action is reversible?"],
    why: "Understand the size of the hit, then test the least destructive lever.", expectedMs: 85000 }
];

const CYBER: Probe[] = [
  { id: "c-s1", kind: "spark", domain: "cyber", dimension: "system", format: "odd-one-out",
    prompt: "Which is the weakest form of protection for an account?",
    options: [{ label: "A password reused across sites", correct: true }, { label: "A long unique password", correct: false }, { label: "Two-factor authentication", correct: false }, { label: "A password manager", correct: false }],
    hints: ["What happens when one site leaks?"],
    why: "Reuse turns one breach into many. Uniqueness matters more than complexity.", expectedMs: 20000 },
  { id: "c-s2", kind: "spark", domain: "cyber", dimension: "logic", format: "true-false",
    prompt: "True or false: a message from a known contact is safe to open.",
    options: [{ label: "True", correct: false }, { label: "False", correct: true }],
    hints: ["How could the sender name be forged?"],
    why: "Accounts get compromised. The name proves nothing about the link.", expectedMs: 15000 },
  { id: "c-s3", kind: "spark", domain: "cyber", dimension: "pattern", format: "sequence",
    prompt: "You find a USB stick in the car park. What is the safest action?",
    options: [{ label: "Hand it to IT without plugging it in", correct: true }, { label: "Plug it into a spare laptop", correct: false }, { label: "Plug it into yours to identify the owner", correct: false }, { label: "Throw it away", correct: false }],
    hints: ["What is the risk of plugging it in?"],
    why: "An unknown device can run code on connection. Do not connect it.", expectedMs: 20000 },
  { id: "c-d1", kind: "deep", domain: "cyber", dimension: "system", format: "scenario",
    prompt: "A staff member reports a suspicious email and says they already clicked the link. What is the correct order?",
    options: [{ label: "Contain the account, then investigate, then inform", correct: true }, { label: "Investigate first, then contain", correct: false }, { label: "Wait to see if anything happens", correct: false }, { label: "Delete the email and move on", correct: false }],
    hints: ["Which action limits damage?", "When is evidence still intact?"],
    why: "Containment first limits spread. Investigation follows on a safe account.", expectedMs: 80000 },
  { id: "c-d2", kind: "deep", domain: "cyber", dimension: "logic", format: "scenario",
    prompt: "A system should ask for the minimum permission needed. A colleague asks for admin access to save time. Best response?",
    options: [{ label: "Give the narrow permission and measure whether it blocks the work", correct: true }, { label: "Grant admin, it is faster", correct: false }, { label: "Refuse and escalate", correct: false }, { label: "Share one admin account", correct: false }],
    hints: ["What does least privilege protect?", "Is the narrow option testable?"],
    why: "Least privilege is the default. Widen only when a real task fails.", expectedMs: 80000 }
];

const BANK: Record<Domain, Probe[]> = { web: WEB, data: DATA, business: BUSINESS, cyber: CYBER };

export function probesFor(domain: Domain, lane: Lane): Probe[] {
  return BANK[domain].filter((x) => x.kind === lane);
}

export function mixedSet(domain: Domain, sparkCount = 3, deepCount = 2): Probe[] {
  const spark = probesFor(domain, "spark").slice(0, sparkCount);
  const deep = probesFor(domain, "deep").slice(0, deepCount);
  const out: Probe[] = [];
  const max = Math.max(spark.length, deep.length);
  for (let i = 0; i < max; i++) {
    if (spark[i]) out.push(spark[i]);
    if (deep[i]) out.push(deep[i]);
  }
  return out;
}

export function recheckSet(domain: Domain, declinedLane: Lane): Probe[] {
  if (declinedLane === "deep") return mixedSet(domain, 4, 1);
  return mixedSet(domain, 1, 3);
}

export interface MixProfile {
  sparkAccuracy: number;
  deepAccuracy: number;
  sparkSpeed: number;
  deepSpeed: number;
  preferredLane: Lane | "balanced";
  stamina: number;
  hintRate: number;
  note: string;
}

export function mixProfile(results: ProbeResult[]): MixProfile {
  const spark = results.filter((r) => r.kind === "spark");
  const deep = results.filter((r) => r.kind === "deep");
  const pct = (rows: ProbeResult[]) => (rows.length ? Math.round((rows.filter((r) => r.correct).length / rows.length) * 100) : 0);
  const meanMs = (rows: ProbeResult[]) => (rows.length ? Math.round(rows.reduce((t, r) => t + r.ms, 0) / rows.length) : 0);
  const sparkAccuracy = pct(spark);
  const deepAccuracy = pct(deep);
  let preferredLane: MixProfile["preferredLane"] = "balanced";
  if (spark.length && deep.length) {
    if (sparkAccuracy - deepAccuracy >= 15) preferredLane = "spark";
    else if (deepAccuracy - sparkAccuracy >= 15) preferredLane = "deep";
  }
  const ordered = results.slice().sort((a, b) => a.at - b.at);
  const half = Math.floor(ordered.length / 2);
  const stamina = ordered.length ? Math.max(0, Math.min(100, pct(ordered.slice(0, half)) - pct(ordered.slice(half)) + 80)) : 0;
  const hintRate = results.length ? Math.round((results.filter((r) => r.usedHint).length / results.length) * 100) : 0;
  let note = "Both lanes agree. The reading is trustworthy.";
  if (preferredLane === "spark") note = "Short varied probes score higher. Keep sessions short and switch format often.";
  if (preferredLane === "deep") note = "Long multi-step questions score higher. Give fewer, deeper tasks.";
  if (stamina < 55) note = "Accuracy falls across the set. Session length is the limiting factor, not ability.";
  if (hintRate > 50) note = "Hints are being used heavily, so the unaided score is the honest one.";
  return { sparkAccuracy, deepAccuracy, sparkSpeed: meanMs(spark), deepSpeed: meanMs(deep), preferredLane, stamina, hintRate, note };
}