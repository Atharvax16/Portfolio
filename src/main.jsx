import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Lab from './lab.jsx'
import Instruments from './instruments.jsx'

/* Hash routing, no dependency: "#/lab..." is the Architecture Lab,
   "#/metrics..." is the Instrument Room, anything else is the paper. Hash
   (rather than history) keeps deep links working on GitHub Pages, which has
   no server to rewrite them — and the leading slash is what keeps these
   apart from the paper's own "#Architectures" / "#Metrics" section anchors. */
const currentRoom = () => {
  const h = window.location.hash
  if (h.startsWith('#/lab')) return 'lab'
  if (h.startsWith('#/metrics')) return 'metrics'
  return null
}

function Root() {
  const [room, setRoom] = useState(currentRoom)

  useEffect(() => {
    const onHash = () => setRoom(currentRoom())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (room === 'lab') return <Lab />
  if (room === 'metrics') return <Instruments />
  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
