import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Global base styles, Tailwind is primary
import './services/i18n';
import { ErrorBoundary } from './components/ErrorBoundary';
import { JurisdictionProvider } from './components/JurisdictionContext';
import { CaseTaskProvider } from './components/CaseTaskContext';
import { LanguageProvider } from './components/i18n/LanguageProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <JurisdictionProvider>
          <CaseTaskProvider>
            <App />
          </CaseTaskProvider>
        </JurisdictionProvider>
      </LanguageProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
