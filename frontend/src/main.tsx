import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 26, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#00d4ff',
              secondary: '#0a0a0f',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a0a0f',
            },
          },
          duration: 4000,
        }}
      />
    </BrowserRouter>
  </StrictMode>
);
