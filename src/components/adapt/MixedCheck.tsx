import { useState } from "react";
import { ArrowRight, CheckCircle2, Gauge, Lightbulb, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Domain, Probe, ProbeResult, DOMAINS, mixProfile, mixedSet, recheckSet } from "@/adapt/assessment";

interface Props {
  declinedLane?: "spark" | "deep" | null;
  onDone?: (results: ProbeResult[], domain: Domain) => void;
}

export default function MixedCheck({ declinedLane, onDone }: Props) {
  const [domain, setDomain] = useState<Domain>("web");
  const [queue, setQueue] = useState<Probe[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(Date.now());

  const probe = queue[index] ?? null;
  const profile = mixProfile(results);
  const finished = queue.length > 0 && index >= queue.length;
  const wasWrong = answered && picked !== null && probe !== null && !probe.options[picked].correct;
  const wasRight = answered && picked !== null && probe !== null && probe.options[picked].correct;

  const start = (list: Probe[]) => {
    setQueue(list); setIndex(0); setResults([]); setPicked(null);
    setAnswered(false); setHintStep(0); setShowWhy(false); setStartedAt(Date.now());
  };

  const answer = (optionIndex: number) => {
    if (!probe || answered) return;
    const option = probe.options[optionIndex];
    const result: ProbeResult = {
      probeId: probe.id, kind: probe.kind, domain: probe.domain, dimension: probe.dimension,
      correct: option.correct, usedHint: hintStep > 0, ms: Date.now() - startedAt, at: Date.now()
    };
    setPicked(optionIndex);
    setAnswered(true);
    setResults((prev) => [...prev, result]);
  };

  const giveHint = () => {
    if (!probe) return;
    if (hintStep < probe.hints.length) setHintStep(hintStep + 1);
  };

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex); setPicked(null); setAnswered(false); setHintStep(0); setShowWhy(false);
    setStartedAt(Date.now());
    if (nextIndex >= queue.length && onDone) onDone(results, domain);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Aptitude check
            {profile.preferredLane === "spark" && <Badge variant="secondary">short probes work best</Badge>}
            {profile.preferredLane === "deep" && <Badge variant="secondary">long questions work best</Badge>}
          </CardTitle>
          <CardDescription>
            Not a maths test. Pick what you want to learn, then answer a mix of quick probes and longer scenarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() => { setDomain(d.id); setQueue([]); }}
                className={`rounded-xl border-2 p-4 text-left transition-all ${domain === d.id ? "border-accent bg-accent/10 shadow-lg" : "border-border/50 hover:border-accent/50 hover:bg-muted/50"}`}
              >
                <p className="text-sm font-semibold text-foreground">{d.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{d.blurb}</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Quick probes</p>
              <p className="text-2xl font-semibold text-foreground">{profile.sparkAccuracy}%</p>
              <Progress value={profile.sparkAccuracy} className="h-1.5 mt-2" />
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Deep questions</p>
              <p className="text-2xl font-semibold text-foreground">{profile.deepAccuracy}%</p>
              <Progress value={profile.deepAccuracy} className="h-1.5 mt-2" />
            </div>
            <div className="rounded-xl border border-border/50 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Stamina</p>
              <p className="text-2xl font-semibold text-foreground">{profile.stamina}%</p>
              <Progress value={profile.stamina} className="h-1.5 mt-2" />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{profile.note}</p>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => start(mixedSet(domain, 3, 2))}>
              <Sparkles className="mr-2 w-4 h-4" /> Start the check
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            {declinedLane && (
              <Button variant="outline" onClick={() => start(recheckSet(domain, declinedLane))}>
                <RotateCcw className="mr-2 w-4 h-4" /> Different mix after your no
              </Button>
            )}
            {queue.length > 0 && (
              <Button variant="ghost" onClick={() => { setQueue([]); setIndex(0); setResults([]); }}>Clear</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {probe && !finished && (
        <section className="bg-card rounded-2xl p-8 shadow-xl border border-border/50">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <Badge variant="outline" className="border-accent/30 text-accent px-4 py-1.5">
              {probe.kind === "spark" ? <Sparkles className="w-4 h-4 mr-2" /> : <Gauge className="w-4 h-4 mr-2" />}
              {probe.kind === "spark" ? "Quick probe" : "Deep question"} - {probe.dimension}
            </Badge>
            <p className="text-sm text-muted-foreground">{index + 1} of {queue.length}</p>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-5">{probe.prompt}</h3>
          <div className={probe.options.length > 2 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-2 gap-4"} data-answered={answered ? "yes" : "no"}>
            {probe.options.map((option, i) => {
              const chosen = picked === i;
              const revealRight = showWhy && option.correct;
              const markWrong = wasWrong && chosen;
              return (
                <button
                  key={option.label}
                  onClick={() => answer(i)}
                  disabled={answered}
                  className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${chosen && !showWhy ? "border-accent/60 bg-muted/60" : ""} ${revealRight ? "border-accent bg-accent/10 shadow-lg" : ""} ${markWrong ? "border-destructive bg-destructive/5" : ""} ${!answered ? "border-border/50 hover:border-accent/50 hover:bg-muted/50" : ""}`}
                >
                  <span className="font-medium text-foreground">{option.label}</span>
                  {revealRight && <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-accent animate-scale-in" />}
                  {markWrong && <XCircle className="absolute top-3 right-3 w-5 h-5 text-destructive animate-scale-in" />}
                </button>
              );
            })}
          </div>

          {wasRight && (
            <div className="mt-5 flex items-center gap-2 text-sm text-accent">
              <CheckCircle2 className="w-4 h-4" /> Correct. No hint needed.
            </div>
          )}

          {wasWrong && hintStep === 0 && !showWhy && (
            <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="text-sm text-foreground mb-3">Not quite. Want a hint before the explanation?</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={giveHint}><Lightbulb className="mr-2 w-4 h-4" /> Give me a hint</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowWhy(true)}>Skip to the explanation</Button>
              </div>
            </div>
          )}

          {hintStep > 0 && (
            <div className="mt-4 space-y-2">
              {probe.hints.slice(0, hintStep).map((h, i) => (
                <div key={i} className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground">{h}</div>
              ))}
            </div>
          )}

          {hintStep > 0 && !showWhy && hintStep >= probe.hints.length && (
            <div className="mt-3">
              <Button size="sm" variant="outline" onClick={() => setShowWhy(true)}>Show me why</Button>
            </div>
          )}

          {showWhy && (
            <div className="mt-4 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-foreground/90">
              <p className="font-medium mb-1">Why</p>
              <p className="text-muted-foreground">{probe.why}</p>
            </div>
          )}

          {answered && (wasRight || showWhy) && (
            <Button className="mt-5" onClick={next}>
              {index + 1 >= queue.length ? "Finish check" : "Next"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </section>
      )}

      {finished && (
        <section className="bg-card rounded-2xl p-8 shadow-xl border border-border/50">
          <h3 className="text-xl font-semibold text-foreground mb-2">Check complete</h3>
          <p className="text-muted-foreground mb-4">
            Quick probes {profile.sparkAccuracy} percent, deep questions {profile.deepAccuracy} percent, stamina {profile.stamina} percent.
          </p>
          <p className="text-sm text-foreground/80 mb-5">{profile.note}</p>
          <Button variant="outline" onClick={() => start(mixedSet(domain, 3, 2))}>Run another mix</Button>
        </section>
      )}
    </div>
  );
}