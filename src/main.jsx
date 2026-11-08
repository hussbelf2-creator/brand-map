import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import * as E from './engine/engine.js';
import App from './App.jsx';
import { route } from './nav.js';

// نافذة تشخيص للاختبارات الآلية والتطوير
window.__BM = E;

createRoot(document.getElementById('root')).render(<App />);
const h = (location.hash || '').slice(1);
if (!h || h === 'home' || ['idea', 'axes', 'how', 'out'].includes(h)) E.setUI({ view: 'home' });
E.bootEngine().then(() => { if (h && !['home', 'idea', 'axes', 'how', 'out'].includes(h)) route(); });
window.addEventListener('hashchange', () => route());
