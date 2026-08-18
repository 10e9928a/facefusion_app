import assert from 'node:assert/strict'
import test from 'node:test'
import { validateClientEnvironment } from './config.mjs'

const valid = {
  VITE_HUB_BASE: 'https://user.example.com:8443',
  VITE_HUB_APP_KEY: 'facefusion',
  VITE_HUB_CLIENT_SECRET: 'public-client-credential',
  VITE_FF_API_BASE: 'https://facefusion.example.com:8443',
  VITE_FF_ENGINE_BASE: 'https://engine.example.com:8443',
  VITE_UPLOAD_URL: 'https://upload.example.com:8443/upload',
}

test('accepts explicit HTTPS production targets', () => {
  assert.doesNotThrow(() => validateClientEnvironment(valid, true))
})

test('rejects missing and placeholder client configuration', () => {
  assert.throws(
    () => validateClientEnvironment({ ...valid, VITE_HUB_BASE: '' }, true),
    /VITE_HUB_BASE is required/,
  )
  assert.throws(
    () => validateClientEnvironment({ ...valid, VITE_HUB_CLIENT_SECRET: 'change-me' }, true),
    /placeholder/,
  )
})

test('production rejects local or plaintext service targets', () => {
  assert.throws(
    () => validateClientEnvironment({ ...valid, VITE_FF_API_BASE: 'http://127.0.0.1:8400' }, true),
    /HTTPS in production/,
  )
})

test('upload target must be the unified upload endpoint', () => {
  assert.throws(
    () => validateClientEnvironment({ ...valid, VITE_UPLOAD_URL: 'https://pan.example.com/files' }, true),
    /\/upload endpoint/,
  )
})
