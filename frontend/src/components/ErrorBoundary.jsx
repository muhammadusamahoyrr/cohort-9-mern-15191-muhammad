import { Component } from 'react';

/**
 * Last line of defence for render-time crashes. Without it a single thrown
 * error in any page unmounts the whole tree and the user gets a blank page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // No client-side log shipping in this project; the console is the record.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="page not-found">
        <h1>Something broke</h1>
        <p className="muted">The page hit an unexpected error. Reloading usually clears it.</p>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
