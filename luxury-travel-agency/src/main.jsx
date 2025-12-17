import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { fetchFrontendData } from './services/frontendData'

// Preload database and data immediately on app start
fetchFrontendData().then(() => {
  console.log('Database and data preloaded successfully');
}).catch(err => {
  console.error('Preload error:', err);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
