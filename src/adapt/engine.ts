// ADAPT adaptive engine, ported to run inside Genlink.
// Source of the logic: Darrelongithub/Adapt (Python). Interface removed; behaviour kept.
// No network calls here: everything is deterministic and testable.

export type Topic = "Quadratics" | "Trigonometry" | "Statistics";

export interface Item {
  id: string;
  topic: Topic;
  difficulty: number; // 1..5
  prompt: string;
  options: string[];
  answer: number;
  teaching: string[];
  hints: string[];
}

export interface Attempt {
  itemId: string;
  topic: Topic;
  difficulty: number;
  correct: boolean;
  ms: number;
  usedHint: boolean;
  at: number;
}

export interface Metrics {
  n: number;
  accuracy: number;
  firstHalf: number;
  secondHalf: number;
  lateDrop: number; // percentage points, positive means worse late
  meanMs: number;
  hintRate: number;
  topicAccuracy: Record<string, number>;
}

export type HypothesisStatus = "proposed" | "applied" | "declined" | "refuted";

export interface Hypothesis {
  id: string;
  claim: string;
  confidence: number;
  disproof: string;
  evidence: string;
  status: HypothesisStatus;
}

export interface Proposal {
  id: string;
  hypothesisId: string;
  change: string;
  why: string;
  alternatives: string[];
  measure: string;
  createdAt: number;
}

export type DecisionKind = "yes" | "change" | "no" | "later";

export interface DecisionRecord {
  proposalId: string;
  kind: DecisionKind;
  note?: string;
  at: number;
  auditId: string;
}

export const ITEMS: Item[] = [
  {
    id: "q1", topic: "Quadratics", difficulty: 1,
    prompt: "Factorise x squared + 7x + 12",
    options: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "It does not factorise"], answer: 0,
    teaching: [
      "Look for two numbers that multiply to 12 and add to 7.",
      "Those numbers are 3 and 4.",
      "So the brackets are (x + 3) and (x + 4)."
    ],
    hints: ["Which two numbers multiply to 12?", "Now check their sum: does it make 7?"]
  },
  {
    id: "q2", topic: "Quadratics", difficulty: 2,
    prompt: "Solve x squared + 6x - 7 = 0",
    options: ["x = 1 or x = -7", "x = 7 or x = -1", "x = 3 or x = -2", "No real roots"], answer: 0,
    teaching: [
      "Move the constant: x squared + 6x = 7.",
      "Half of 6 is 3. Add 9 to both sides.",
      "(x + 3) squared = 16, so x + 3 = plus or minus 4.",
      "x = 1 or x = -7."
    ],
    hints: ["Start by moving -7 across.", "What is half of the x coefficient?"]
  },
  {
    id: "q3", topic: "Quadratics", difficulty: 3,
    prompt: "What is the discriminant of x squared + 4x + 5 = 0?",
    options: ["-4", "4", "36", "0"], answer: 0,
    teaching: [
      "The discriminant is b squared minus 4ac.",
      "Here b is 4, a is 1, c is 5.",
      "16 minus 20 equals -4. Negative means no real roots."
    ],
    hints: ["Write down a, b and c first.", "Negative discriminant means what?"]
  },
  {
    id: "t1", topic: "Trigonometry", difficulty: 1,
    prompt: "A right triangle has opposite 3 and hypotenuse 5. What is sin theta?",
    options: ["0.6", "0.8", "0.75", "1.67"], answer: 0,
    teaching: [
      "sin of an angle is opposite over hypotenuse.",
      "That is 3 over 5.",
      "3 over 5 is 0.6."
    ],
    hints: ["Which two sides does sin use?", "Divide, do not multiply."]
  },
  {
    id: "t2", topic: "Trigonometry", difficulty: 2,
    prompt: "In the sine rule, a over sin A equals what?",
    options: ["b over sin B", "b cos B", "a cos A", "c tan C"], answer: 0,
    teaching: [
      "Every side pairs with the angle opposite it.",
      "The sine rule keeps those pairs in one ratio.",
      "So a over sin A equals b over sin B equals c over sin C."
    ],
    hints: ["Which angle is opposite side b?", "The ratio must pair each side with its own angle."]
  },
  {
    id: "t3", topic: "Trigonometry", difficulty: 3,
    prompt: "What is cos 60 degrees?",
    options: ["0.5", "0.866", "1", "0"], answer: 0,
    teaching: [
      "Use the exact values table, not the calculator, in an exam.",
      "cos 60 is one half.",
      "cos 0 is 1 and cos 90 is 0, so 60 sits halfway."
    ],
    hints: ["Recall the exact value triangle.", "Is it more or less than cos 90?"]
  },
  {
    id: "s1", topic: "Statistics", difficulty: 1,
    prompt: "Find the mean of 4, 6, 8 and 10",
    options: ["7", "6.5", "8", "28"], answer: 0,
    teaching: [
      "Add the values: 4 + 6 + 8 + 10 = 28.",
      "Divide by how many values there are, which is 4.",
      "28 divided by 4 is 7."
    ],
    hints: ["Add first, divide second.", "Do not stop at the total."]
  },
  {
    id: "s2", topic: "Statistics", difficulty: 2,
    prompt: "Find the median of 3, 7, 7, 9 and 12",
    options: ["7", "7.6", "8", "9"], answer: 0,
    teaching: [
      "Put the numbers in order first.",
      "With five values the middle one is the third.",
      "The third value is 7."
    ],
    hints: ["Order matters for the median.", "Count how many values you have."]
  },
  {
    id: "s3", topic: "Statistics", difficulty: 3,
    prompt: "A grouped table has 0-10 with frequency 4 and 10-20 with frequency 6. What is the mean?",
    options: ["11", "10", "12", "15"], answer: 0,
    teaching: [
      "Use midpoints: 5 and 15.",
      "Multiply each by its frequency: 20 and 90.",
      "Total 110 over total frequency 10 gives 11."
    ],
    hints: ["Do not use the group edges as values.", "What is the midpoint of each group?"]
  }
];

export const TOPICS: Topic[] = ["Quadratics", "Trigonometry", "Statistics"];

export function itemsByTopic(topic: Topic): Item[] {
  return ITEMS.filter(function (i) { return i.topic === topic; });
}

export function nextItem(theta: number, asked: string[]): Item {
  var pool = ITEMS.filter(function (i) { return asked.indexOf(i.id) < 0; });
  if (pool.length === 0) pool = ITEMS;
  var target = Math.max(1, Math.min(5, Math.round(theta)));
  pool.sort(function (a, b) {
    return Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target);
  });
  return pool[0];
}

export function updateTheta(theta: number, item: Item, correct: boolean): number {
  var step = 0.45 + item.difficulty * 0.08;
  var next = correct ? theta + step : theta - step;
  return Math.max(1, Math.min(5, next));
}

export function computeBands(attempts: Attempt[]): Record<string, number> {
  var out: Record<string, number> = {};
  TOPICS.forEach(function (t) {
    var rows = attempts.filter(function (a) { return a.topic === t; });
    if (rows.length === 0) { out[t] = 3; return; }
    var score = 0;
    var weight = 0;
    rows.forEach(function (r) {
      var w = 0.8 + r.difficulty * 0.25;
      score += (r.correct ? 1 : 0) * w;
      weight += w;
    });
    var band = Math.round(1 + (score / weight) * 4);
    out[t] = Math.max(1, Math.min(5, band));
  });
  return out;
}

function pct(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 100);
}

export function observe(attempts: Attempt[]): Metrics {
  var n = attempts.length;
  var correct = attempts.filter(function (a) { return a.correct; }).length;
  var mid = Math.floor(n / 2);
  var first = attempts.slice(0, mid);
  var second = attempts.slice(mid);
  var f = first.filter(function (a) { return a.correct; }).length;
  var s = second.filter(function (a) { return a.correct; }).length;
  var ms = n ? attempts.reduce(function (t, a) { return t + a.ms; }, 0) / n : 0;
  var hints = attempts.filter(function (a) { return a.usedHint; }).length;
  var topicAccuracy: Record<string, number> = {};
  TOPICS.forEach(function (t) {
    var rows = attempts.filter(function (a) { return a.topic === t; });
    topicAccuracy[t] = pct(rows.filter(function (a) { return a.correct; }).length, rows.length);
  });
  var firstPct = pct(f, first.length);
  var secondPct = pct(s, second.length);
  return {
    n: n,
    accuracy: pct(correct, n),
    firstHalf: firstPct,
    secondHalf: secondPct,
    lateDrop: firstPct - secondPct,
    meanMs: Math.round(ms),
    hintRate: pct(hints, n),
    topicAccuracy: topicAccuracy
  };
}

export function understand(m: Metrics): Hypothesis[] {
  var out: Hypothesis[] = [];
  if (m.n < 4) {
    out.push({
      id: "h-thin",
      claim: "There is not enough evidence yet to change anything.",
      confidence: 0.2,
      evidence: "Only " + m.n + " attempts recorded.",
      disproof: "Four or more attempts would allow a stable estimate.",
      status: "proposed"
    });
    return out;
  }
  if (m.lateDrop >= 20) {
    out.push({
      id: "h-fatigue",
      claim: "Accuracy falls late in a set because the set is too long, not because the work is harder.",
      confidence: Math.min(0.9, 0.55 + m.lateDrop / 200),
      evidence: "First half " + m.firstHalf + " percent, second half " + m.secondHalf + " percent on comparable difficulty.",
      disproof: "Accuracy stays flat when sets are cut to four items.",
      status: "proposed"
    });
  }
  var worst = null as { topic: string; acc: number } | null;
  Object.keys(m.topicAccuracy).forEach(function (t) {
    if (m.topicAccuracy[t] < 50 && (worst === null || m.topicAccuracy[t] < worst.acc)) {
      worst = { topic: t, acc: m.topicAccuracy[t] };
    }
  });
  if (worst !== null) {
    var w = worst as { topic: string; acc: number };
    out.push({
      id: "h-topic",
      claim: "The gap is topic-specific: " + w.topic + " is weak while other topics hold.",
      confidence: 0.62,
      evidence: w.topic + " at " + w.acc + " percent against a session average of " + m.accuracy + " percent.",
      disproof: "The same topic is strong in a second session with different items.",
      status: "proposed"
    });
  }
  if (m.meanMs < 6000 && m.accuracy < 60) {
    out.push({
      id: "h-pace",
      claim: "Answers are being submitted too quickly to be checked.",
      confidence: 0.58,
      evidence: "Mean " + m.meanMs + " ms per item with " + m.accuracy + " percent accuracy.",
      disproof: "Accuracy rises when a 20 second minimum reading time is enforced.",
      status: "proposed"
    });
  }
  if (m.hintRate > 40) {
    out.push({
      id: "h-hint",
      claim: "Hints are being used as answers, which hides what is actually understood.",
      confidence: 0.5,
      evidence: "Hints used on " + m.hintRate + " percent of items.",
      disproof: "Accuracy holds when the answer step is withheld until two hints are read.",
      status: "proposed"
    });
  }
  if (out.length === 0) {
    out.push({
      id: "h-stable",
      claim: "Nothing needs changing yet. Performance is steady across the session.",
      confidence: 0.66,
      evidence: "Accuracy " + m.accuracy + " percent with a late drop of only " + m.lateDrop + " points.",
      disproof: "A late drop of 20 points or more on a longer set.",
      status: "proposed"
    });
  }
  return out;
}

export function propose(h: Hypothesis): Proposal {
  var map: Record<string, Omit<Proposal, "id" | "hypothesisId" | "createdAt">> = {
    "h-fatigue": {
      change: "Cut practice sets from eight items to four, with a 60 second break between sets.",
      why: "Accuracy is lost late in the set, so the set length is the variable worth moving.",
      alternatives: ["Keep eight items but add a break at item four.", "Keep eight items and drop the hardest one."],
      measure: "Accuracy in sets two and three over the next five sessions."
    },
    "h-topic": {
      change: "Insert one worked example before every item in the weak topic, and leave other topics unchanged.",
      why: "The gap is concentrated in one topic, not spread across the session.",
      alternatives: ["Re-run placement on that topic only.", "Drop the topic back one band for two weeks."],
      measure: "Accuracy in that topic across the next five sessions."
    },
    "h-pace": {
      change: "Enforce a 20 second minimum before the answer buttons unlock.",
      why: "Fast submissions with low accuracy point at reading time, not knowledge.",
      alternatives: ["Show a countdown instead of a lock.", "Require the question to be re-read once."],
      measure: "Accuracy and mean time per item over the next three sessions."
    },
    "h-hint": {
      change: "Reveal the final step only after two hints have been read.",
      why: "Hints are being used as the answer, so the measure of understanding is unreliable.",
      alternatives: ["Remove hints for one week.", "Show the method after the attempt instead."],
      measure: "Hint rate and unaided accuracy over the next five sessions."
    },
    "h-stable": {
      change: "No change. Keep the current set length and review again after three sessions.",
      why: "The evidence does not support an intervention, and changing things without evidence is the failure mode this system exists to avoid.",
      alternatives: ["Raise difficulty by one band.", "Move to the next topic."],
      measure: "Accuracy and late drop after three sessions."
    },
    "h-thin": {
      change: "No change. Collect four more attempts first.",
      why: "One session is not evidence.",
      alternatives: ["Run a two item check on the weakest topic."],
      measure: "Evidence count reaching four or more."
    }
  };
  var base = map[h.id] || map["h-stable"];
  return {
    id: "p-" + h.id + "-" + Date.now().toString(36),
    hypothesisId: h.id,
    change: base.change,
    why: base.why,
    alternatives: base.alternatives,
    measure: base.measure,
    createdAt: Date.now()
  };
}

export function auditId(): string {
  return "audit_" + Math.random().toString(36).slice(2, 10);
}

export function bandLabel(b: number): string {
  return ["", "Band 1 - foundations", "Band 2 - developing", "Band 3 - secure", "Band 4 - strong", "Band 5 - extension"][b] || "Band 3";
}