import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force light mode on initial script load before React mounts
document.documentElement.classList.remove('dark');
document.documentElement.classList.add('light');
localStorage.setItem('liferpg_theme', 'light');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);