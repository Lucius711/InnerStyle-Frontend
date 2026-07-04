import { Component } from "react";

/**
 * Minimal error boundary that renders the actual error on screen instead of a white page.
 * Useful for debugging on devices with no dev console (e.g. a phone scanning the AR QR).
 * NOTE: only catches render/lifecycle errors — it cannot catch a failed module/chunk load
 * (e.g. a tunnel interstitial returning HTML for a .js request); those still blank the page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-3 overflow-auto bg-[radial-gradient(ellipse_at_top,#15182a,#06070d)] p-6 text-center text-white/80">
        <p className="text-sm font-semibold text-red-300">Something went wrong</p>
        <pre className="max-w-full whitespace-pre-wrap break-words text-[11px] text-white/60">
          {String(error?.message || error)}
        </pre>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-full bg-brand-violet px-5 py-2 text-sm font-semibold text-white"
        >
          Reload
        </button>
      </div>
    );
  }
}
