import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Lab from './lab.jsx'
import Instruments from './instruments.jsx'
import Resume from './resume.jsx'
import { countPageview } from './analytics.js'

/* Hash routing, no dependency: "#/lab..." is the Architecture Lab,
   "#/metrics..." is the Instrument Room, "#/resume" is the CV, anything else
   is the paper. Hash (rather than history) keeps deep links working on GitHub
   Pages, which has no server to rewrite them — and the leading slash is what
   keeps these apart from the paper's own "#Architectures" / "#Metrics"
   section anchors. (public/resume/index.html redirects the pretty
   "/resume" URL here, so the shareable link is one hop from a bare path.) */
const currentRoom = () => {
  const h = window.location.hash
  if (h.startsWith('#/lab')) return 'lab'
  if (h.startsWith('#/metrics')) return 'metrics'
  if (h.startsWith('#/resume')) return 'resume'
  return null
}

function Root() {
  const [room, setRoom] = useState(currentRoom)

  useEffect(() => {
    const onHash = () => setRoom(currentRoom())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  /* One document, four rooms — count the landing view and every room change
     after it, so the dashboard sees the lab and the CV, not just the paper. */
  useEffect(() => {
    countPageview()
    window.addEventListener('hashchange', countPageview)
    return () => window.removeEventListener('hashchange', countPageview)
  }, [])

  if (room === 'lab') return <Lab />
  if (room === 'metrics') return <Instruments />
  if (room === 'resume') return <Resume />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
