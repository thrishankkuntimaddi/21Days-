import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <BrowserRouter basename="/21Days-/">
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: '0',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  letterSpacing: '0.02em',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: 'var(--bg-card)' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-card)' } },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
);
