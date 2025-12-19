import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { fetchFrontendData } from './services/frontendData'

// Render app immediately, then preload data in the background
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Preload database and data in the background (non-blocking)
fetchFrontendData().then(() => {
  console.log('Database and data preloaded successfully');
}).catch(err => {
  console.warn('Preload error (non-critical):', err);
});
