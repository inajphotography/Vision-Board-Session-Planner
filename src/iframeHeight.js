// Reports this app's height to a parent page when embedded in an iframe.
// Lets the embedding site (inajphotography.com) auto-resize the iframe so
// there is never an internal scrollbar or dead space. Only sends a single
// number (the height), and only runs when actually inside a frame.

const MESSAGE_TYPE = 'ina-vision-board:height'

function currentHeight() {
  const doc = document.documentElement
  const body = document.body
  return Math.max(
    body ? body.scrollHeight : 0,
    body ? body.offsetHeight : 0,
    doc ? doc.scrollHeight : 0,
    doc ? doc.offsetHeight : 0,
  )
}

export function initIframeHeightReporter() {
  // Not embedded, nothing to do.
  if (typeof window === 'undefined' || window.parent === window) return

  let lastHeight = 0

  const send = () => {
    const height = currentHeight()
    if (height && height !== lastHeight) {
      lastHeight = height
      // Height only, non-sensitive. frame-ancestors already restricts embedders.
      window.parent.postMessage({ type: MESSAGE_TYPE, height }, '*')
    }
  }

  // Fire on load, on any content size change, and on viewport resize.
  window.addEventListener('load', send)
  window.addEventListener('resize', send)

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => send())
    if (document.body) observer.observe(document.body)
  } else {
    // Fallback for older browsers: poll a couple of times a second.
    setInterval(send, 500)
  }

  // Initial send in case load already fired.
  send()
}
