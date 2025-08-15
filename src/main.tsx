import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './views/App';
import './styles/global.css';
import { AuthProvider } from './lib/auth';

console.log('🚀 APP START: Application starting...');
console.log('🚀 APP START: Timestamp:', new Date().toISOString());
console.log('🚀 APP START: Current URL:', window.location.href);
console.log('🚀 APP START: User agent:', navigator.userAgent);

const container = document.getElementById('root');
if (container) {
  console.log('🚀 APP START: Root container found, creating React root...');
  const root = createRoot(container);
  console.log('🚀 APP START: Rendering React app with AuthProvider...');
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
  console.log('🚀 APP START: React app rendered successfully');
} else {
  console.error('❌ APP START: Root container not found!');
}
