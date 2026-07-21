import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import Lab from './lab.jsx'

/* Hash routing, no dependency: "#/lab..." is the Architecture Lab, anything
   else is the paper. Hash (rather than history) keeps deep links working on
   GitHub Pages, which has no server to rewrite them — and it leaves the
   paper's own "#Architectures" section anchors untouched. */
const isLab = () => window.location.hash.startsWith('#/lab')

function Root() {
  const [lab, setLab] = useState(isLab)

  useEffect(() => {
    const onHash = () => setLab(isLab())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return lab ? <Lab /> : <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
