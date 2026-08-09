/**
 * user_hub 客户端 HMAC 签名。
 * 与服务端 buildClientSignature 对齐:
 *   HMAC-SHA256(clientSecret, `${timestamp}\n${nonce}\n${METHOD}\n${path}`)
 * path 不含 query string。
 */

import CryptoJS from 'crypto-js';
import { HUB_CONFIG } from '@/config/hub';

function randomNonce(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
  );
}

export function hmacSha256(secret: string, payload: string): string {
  return CryptoJS.HmacSHA256(payload, secret).toString(CryptoJS.enc.Hex);
}

export function buildHubHeaders(
  method: string,
  path: string,
  token?: string,
): Record<string, string> {
  const timestamp = String(Date.now());
  const nonce = randomNonce();
  const signPath = path.split('?')[0];
  const payload = `${timestamp}\n${nonce}\n${method.toUpperCase()}\n${signPath}`;
  const signature = hmacSha256(HUB_CONFIG.clientSecret, payload);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-App-Key': HUB_CONFIG.appKey,
    'X-Platform': HUB_CONFIG.platform,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature,
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
