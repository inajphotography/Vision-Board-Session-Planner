// Reports this app's height to a parent page when embedded in an iframe, so the
// embedding site (inajphotography.com) can auto-resize the iframe. Only sends a
// single number (the height), and only runs when actually inside a frame.

const MESSAGE_TYPE = 'ina-vision-board:height'

// When embedded, `100vh` (Tailwind's min-h-screen / h-screen) equals the iframe's
// OWN height. Combined with auto-resize that creates a feedback loop: taller
// iframe -> taller 100vh element -> bigger reported height -> taller iframe, forever
// (the page appears to scroll down into blank space). Force natural content height
// instead so the reported height is stable.
function neutralizeViewportHeight() {
  if (document.querySelector('style[data-iframe-embed]')) return
  const style = document.createElement('style')
  style.setAttribute('data-iframe-embed', 'true')
  style.textContent =
    'html,body{height:auto!important}' +
    '.min-h-screen{min-height:0!important}' +
    '.h-screen{height:auto!important}'
  ;(document.head || document.documentElement).appendChild(style)
}

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
  // Not embedded, nothing to do (leaves the standalone app untouched).
  if (typeof window === 'undefined' || window.parent === window) return

  neutralizeViewportHeight()

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
