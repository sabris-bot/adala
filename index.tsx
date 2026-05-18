import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Global base styles, Tailwind is primary
import './services/i18n';
import { JurisdictionProvider } from './components/JurisdictionContext';
import { CaseTaskProvider } from './components/CaseTaskContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <JurisdictionProvider>
      <CaseTaskProvider>
        <App />
      </CaseTaskProvider>
    </JurisdictionProvider>
  </React.StrictMode>
);
