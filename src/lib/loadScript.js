const loaded = new Map()

export function loadScript(src) {
  if (loaded.has(src)) return loaded.get(src)
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
  loaded.set(src, promise)
  return promise
}
