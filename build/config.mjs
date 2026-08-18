const REQUIRED_URLS = [
  'VITE_HUB_BASE',
  'VITE_FF_API_BASE',
  'VITE_FF_ENGINE_BASE',
  'VITE_UPLOAD_URL',
]

const REQUIRED_VALUES = [
  'VITE_HUB_APP_KEY',
  'VITE_HUB_CLIENT_SECRET',
]

function requiredValue(env, name) {
  const value = String(env[name] || '').trim()
  if (!value) throw new Error(`[config] ${name} is required`)
  return value
}

function validateUrl(name, value, production) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`[config] ${name} must be an absolute URL`)
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`[config] ${name} must use HTTP or HTTPS`)
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(`[config] ${name} must not contain credentials, query, or fragment`)
  }
  if (production) {
    if (url.protocol !== 'https:') throw new Error(`[config] ${name} must use HTTPS in production`)
    if (['localhost', '127.0.0.1', '::1'].includes(url.hostname)) {
      throw new Error(`[config] ${name} must not target localhost in production`)
    }
  }
  if (name === 'VITE_UPLOAD_URL' && url.pathname.replace(/\/+$/, '') !== '/upload') {
    throw new Error('[config] VITE_UPLOAD_URL must point to the /upload endpoint')
  }
}

export function validateClientEnvironment(env, production = false) {
  for (const name of REQUIRED_VALUES) requiredValue(env, name)
  for (const name of REQUIRED_URLS) validateUrl(name, requiredValue(env, name), production)

  const appKey = requiredValue(env, 'VITE_HUB_APP_KEY')
  const credential = requiredValue(env, 'VITE_HUB_CLIENT_SECRET')
  if (!/^[a-z0-9][a-z0-9_-]{1,63}$/i.test(appKey)) {
    throw new Error('[config] VITE_HUB_APP_KEY has an invalid format')
  }
  if (/change-me|replace-with|example/i.test(credential)) {
    throw new Error('[config] VITE_HUB_CLIENT_SECRET is still a placeholder')
  }
}
