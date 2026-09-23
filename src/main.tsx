import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const buildId = "BUILD_20260923_FIX01";
console.log("Dissonant PWA Build ID:", buildId);
(window as any).DISSONANT_BUILD_ID = buildId;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
