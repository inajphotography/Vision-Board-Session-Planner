import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initIframeHeightReporter } from './iframeHeight.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Auto-resize support when embedded on inajphotography.com.
initIframeHeightReporter()
