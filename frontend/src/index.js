import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Use Vercel rewrites (proxy) in production to avoid CSP errors and direct cross-origin calls.
// In development, we fallback to localhost.
if (process.env.NODE_ENV === 'development') {
  axios.defaults.baseURL = 'http://localhost:5000';
} else {
  // In production, baseURL should be empty to use relative paths (proxied by vercel.json)
  axios.defaults.baseURL = '';
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
