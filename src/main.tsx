import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const buildId = "BUILD_20260923_FIX02";
const buildTs = "2026-09-23T05:40:00Z";
console.log("Dissonant PWA Build ID:", buildId, "Built:", buildTs);
(window as any).DISSONANT_BUILD_ID = buildId;
(window as any).DISSONANT_BUILD_TS = buildTs;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
