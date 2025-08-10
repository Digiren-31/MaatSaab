import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './views/App';
import './styles/global.css';
import { AuthProvider } from './lib/auth';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}
