import { useState } from "react";
import { Brain, ShieldCheck, Target, ThumbsDown, ThumbsUp } from "lucide-react";
import StickyNav from "@/components/StickyNav";
import PillarHeader from "@/components/learning/PillarHeader";
import { GoldParticles } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MixedCheck from "@/components/adapt/MixedCheck";
import Boundary from "@/components/adapt/Boundary";
import { Domain, ProbeResult, mixProfile } from "@/adapt/assessment";

interface Decision {
  id: string;
  change: string;
  kind: "yes" | "no" | "later" | "change";
  auditId: string;
}

const AdaptivePractice = () => {
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [domain, setDomain] = useState<Domain>("web");
  const [declinedLane, setDeclinedLane] = useState<"spark" | "deep" | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);

  const profile = mixProfile(results);

  const proposal = (() => {
    if (results.length < 3) {
      return {
        change: "Nothing yet. Run the aptitude check first.",
        why: "A proposal without evidence is a guess, and guesses are what this system exists to avoid.",
        measure: "Three probes minimum."
      };
    }
    if (profile.hintRate > 50) {
      return {
        change: "Hold the explanation until after a second attempt, and count hints as part of the score.",
        why: "Hints are being opened before the learner commits, so the unaided score is the honest one.",
        measure: "Unaided accuracy over the next three checks."
      };
    }
    if (profile.stamina < 55) {
      return {
        change: "Cut checks from five items to three, with a short break between checks.",
        why: "Accuracy falls across the set, which points at session length rather than ability.",
        measure: "Accuracy in the second half of the next three checks."
      };
    }
    if (profile.preferredLane === "spark") {
      return {
        change: "Teach this learner with short, varied probes and switch the format every two items.",
        why: "Quick probes score at least 15 points higher than long questions, consistently.",
        measure: "Completion and accuracy when the next unit uses the short format."
      };
    }
    if (profile.preferredLane === "deep") {
      return {
        change: "Give fewer tasks, each multi-step, and remove the quick quizzes from this pathway.",
        why: "Deep questions score at least 15 points higher than quick probes, consistently.",
        measure: "Accuracy and time-to-complete on the next two units."
      };
    }
    return {
      change: "No change. Keep the current mix and review after three more checks.",
      why: "Quick and deep scores agree, so there is no evidence for a different teaching shape.",
      measure: "Stability across the next three checks."
    };
  })();

  const decide = (kind: Decision["kind"]) => {
    const record: Decision = {
      id: Math.random().toString(36).slice(2, 8),
      change: proposal.change,
      kind,
      auditId: "audit_" + Math.random().toString(36).slice(2, 10)
    };
    setDecisions((prev) => [record, ...prev]);
    if (kind === "no") setDeclinedLane(profile.preferredLane === "spark" ? "spark" : "deep");
  };

  return (
    <Boundary>
      <div className="min-h-screen bg-cinematic-surface relative">
        <GoldParticles count={14} opacity={0.06} />
        <StickyNav />

        <PillarHeader
          theme="digital-literacy"
          title="Aptitude"
          tagline="Find out how you learn, not just what you know"
          icon={<Brain className="w-8 h-8" />}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="border-white/30 text-white/80 px-4 py-1.5">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Consent built in
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white/80 px-4 py-1.5">
              <Target className="w-4 h-4 mr-2" />
              {results.length} probes answered
            </Badge>
          </div>
          <p className="text-lg text-white/80 max-w-3xl mt-3">
            Short playful probes and longer scenarios, mixed in one check. No maths unless you picked it. The system reads the gap between the two lanes and proposes a teaching shape, which you can accept or refuse.
          </p>
        </PillarHeader>

        <div className="container mx-auto px-4 py-12 space-y-10">
          <MixedCheck
            declinedLane={declinedLane}
            onDone={(r, d) => { setResults((prev) => prev.concat(r)); setDomain(d); }}
          />

          <section className="bg-card rounded-2xl p-8 shadow-xl border-2 border-accent/40">
            <Badge variant="outline" className="border-accent/30 text-accent px-4 py-1.5 mb-4">
              A proposal for you
            </Badge>
            <h2 className="text-2xl font-bold text-foreground mb-3">{proposal.change}</h2>
            <p className="text-muted-foreground mb-2">{proposal.why}</p>
            <p className="text-sm text-muted-foreground mb-6">Measured by: {proposal.measure}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => decide("yes")}><ThumbsUp className="mr-2 w-4 h-4" /> Yes, try it</Button>
              <Button variant="outline" onClick={() => decide("change")}>Change it</Button>
              <Button variant="ghost" onClick={() => decide("no")}><ThumbsDown className="mr-2 w-4 h-4" /> No</Button>
              <Button variant="ghost" onClick={() => decide("later")}>Later</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Nothing changes until you answer. Saying no is recorded, and the next check shifts the mix instead of repeating it.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What was measured</CardTitle>
                <CardDescription>Derived features only. No keystrokes, no screen content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Quick probes</span><span className="font-medium">{profile.sparkAccuracy}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Deep questions</span><span className="font-medium">{profile.deepAccuracy}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Stamina</span><span className="font-medium">{profile.stamina}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Hint rate</span><span className="font-medium">{profile.hintRate}%</span></div>
                <Separator className="my-3" />
                <p className="text-xs text-muted-foreground">Domain in use: {domain}. No answers leave this browser in the demo.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Decision log</CardTitle>
                <CardDescription>Audited. Revocation is immediate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {decisions.length === 0 && <p className="text-muted-foreground">No decisions recorded yet.</p>}
                {decisions.map((d) => (
                  <div key={d.auditId} className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-2">
                    <span className="font-mono text-xs text-muted-foreground">{d.auditId}</span>
                    <Badge variant={d.kind === "no" ? "destructive" : "secondary"}>{d.kind}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Boundary>
  );
};

export default AdaptivePractice;