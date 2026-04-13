import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BuildingsProvider } from './contexts/BuildingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BuildingsProvider>
      <App />
    </BuildingsProvider>
  </StrictMode>,
)
