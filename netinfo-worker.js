// Reads navigator.connection from a Worker context, where Blink's
// NetInfoDownlinkMax runtime flag actually exposes NetworkInformation.type
// on desktop. Posts a snapshot back on startup and again whenever the
// connection changes.

const conn =
  self.navigator.connection ||
  self.navigator.mozConnection ||
  self.navigator.webkitConnection ||
  {};

function snap() {
  return {
    type:          conn.type          || null,
    effectiveType: conn.effectiveType || null,
    rtt:           typeof conn.rtt      === 'number' ? conn.rtt      : null,
    downlink:      typeof conn.downlink === 'number' ? conn.downlink : null,
    saveData:      !!conn.saveData,
  };
}

self.onmessage = () => {
  const s = snap();
  console.log('[netinfo-worker] snapshot', s, 'raw connection =', conn);
  self.postMessage(s);
};

if (conn && typeof conn.addEventListener === 'function') {
  conn.addEventListener('change', () => {
    const s = snap();
    console.log('[netinfo-worker] change', s);
    self.postMessage(s);
  });
}
