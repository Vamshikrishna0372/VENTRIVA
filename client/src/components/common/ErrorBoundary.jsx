import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardBody } from './Card';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Ventriva UI Error Boundary caught an exception:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-rose-500/30 bg-rose-500/5 p-6 my-4 text-center">
          <CardBody className="space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-100 text-sm">
                {this.props.fallbackTitle || 'Unable to render component'}
              </h3>
              <p className="text-xs text-slate-400">
                {this.props.fallbackMessage || 'An isolated rendering error occurred in this view section.'}
              </p>
            </div>
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={this.handleRetry}>
              Retry Rendering
            </Button>
          </CardBody>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
