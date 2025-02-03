import React, { Component, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  resetKey: number; // When this changes, the ErrorBoundary resets
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

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props) {
    // 🔥 If resetKey changes, clear the error
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute bottom-12 right-12 pointer-events-auto bg-red-400 text-white p-4 rounded-full z-10 shadow-lg flex items-center">
          <CircleAlert className="w-6 h-6 mr-2" />
          <span>{this.state.error?.message}</span>
        </div>
      );
    }

    return this.props.children;
  }
}