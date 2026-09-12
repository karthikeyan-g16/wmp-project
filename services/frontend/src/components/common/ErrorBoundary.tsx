import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Something went wrong</h2>
          <p className="text-slate-500 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
