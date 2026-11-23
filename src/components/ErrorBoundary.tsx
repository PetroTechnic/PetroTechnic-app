import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let message = error.message || 'An unexpected application error occurred.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string; path?: string };
      if (parsed.error) {
        message = parsed.path
          ? `Database ${parsed.operationType ?? 'operation'} failed on ${parsed.path}: ${parsed.error}`
          : parsed.error;
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('PetroTechnics ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F9FB] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-[#E5EBF0] rounded-2xl p-8 space-y-5 shadow-[0_20px_50px_-25px_rgba(11,21,32,0.16)]">
            <div className="inline-flex items-center gap-2 text-[#B45309] text-xs font-semibold uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Application Recovery</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-[#0B1520] tracking-[-0.02em]">
              Unable to complete request
            </h1>
            <p className="text-sm text-[#4A5B6C] leading-relaxed font-mono-data break-words bg-[#F7F9FB] border border-[#E5EBF0] rounded-xl p-4">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B1520] hover:bg-[#0E4D64] rounded-full transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Platform</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
