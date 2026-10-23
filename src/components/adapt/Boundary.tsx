import { Component, ReactNode } from "react";

interface Props { children: ReactNode; }
interface State { error: Error | null; }

// Visible failure instead of a blank screen or a silent bounce to home.
export default class Boundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container mx-auto px-4 py-16">
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-8">
            <h2 className="text-xl font-semibold text-foreground mb-2">This page could not render</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The error is shown below so it can be fixed instead of hidden.
            </p>
            <pre className="text-xs whitespace-pre-wrap text-destructive">{String(this.state.error.message)}</pre>
            <button
              className="mt-5 rounded-lg border border-border px-4 py-2 text-sm"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}