import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center glass p-8 rounded-lg border-glow"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-6xl text-neon-pink mb-6"
            >
              ⚡
            </motion.div>
            
            <h2 className="text-2xl font-cyber text-neon-blue mb-4">
              System Error
            </h2>
            
            <p className="text-gray-300 mb-6 font-mono text-sm">
              The trading matrix has encountered an unexpected error.
              Please restart the system.
            </p>
            
            {this.state.error && (
              <motion.details
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.5 }}
                className="mb-6 text-left"
              >
                <summary className="text-cyber-yellow cursor-pointer hover:text-cyber-orange transition-colors">
                  Error Details
                </summary>
                <pre className="text-xs text-gray-400 mt-2 p-3 bg-dark-800 rounded border-l-2 border-cyber-pink overflow-auto">
                  {this.state.error.message}
                </pre>
              </motion.details>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-cyber-blue text-dark-900 rounded-lg font-semibold 
                       hover:bg-cyber-purple transition-colors glow-blue font-mono"
            >
              RESTART SYSTEM
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
