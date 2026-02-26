import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AudioTestPage } from './components/AudioTestPage.tsx'

const isAudioTest = window.location.hash === '#/audio-test'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAudioTest ? <AudioTestPage /> : <App />}
  </StrictMode>,
)
