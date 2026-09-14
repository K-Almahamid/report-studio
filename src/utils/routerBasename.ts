/** BrowserRouter basename derived from Vite `base` (e.g. `/report-studio` on GitHub Pages). */
export function getRouterBasename(): string | undefined {
  const baseUrl = import.meta.env.BASE_URL
  if (!baseUrl || baseUrl === '/') {
    return undefined
  }
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}
