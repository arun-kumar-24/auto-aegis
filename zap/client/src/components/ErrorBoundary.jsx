import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Uncaught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
                    <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-5">
                        <div className="w-14 h-14 bg-red-900/20 border border-red-800/40 rounded-full flex items-center justify-center mx-auto">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-zinc-100">Something went wrong</h1>
                            <p className="text-zinc-500 text-sm mt-1">
                                An unexpected error occurred. Please try refreshing the page.
                            </p>
                        </div>
                        {this.state.error && (
                            <pre className="text-left bg-zinc-800 text-red-400 text-xs rounded-xl px-4 py-3 overflow-auto max-h-32">
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
