/**
 * user_hub(用户中台) HTTP 客户端: 登录 / 积分 / 上传。
 * 响应统一 { ok, data } / { ok:false, error }。
 */

import { HUB_CONFIG, STORAGE_KEYS, UPLOAD_CONFIG } from '@/config/hub';
import { buildHubHeaders } from '@/utils/hubSign';

type HubResponse<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string } };

function getToken(): string {
  return uni.getStorageSync(STORAGE_KEYS.token) || '';
}

function hubRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: any,
  requireUser = false,
  platformOverride?: string,
): Promise<T> {
  const token = getToken();
  if (requireUser && !token) return Promise.reject(new Error('未登录'));

  const headers = buildHubHeaders(method, path, token || undefined);
  if (platformOverride) headers['X-Platform'] = platformOverride;
  if (body === undefined) delete headers['Content-Type'];

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${HUB_CONFIG.baseUrl}${path}`,
      method,
      header: headers,
      ...(body !== undefined ? { data: body } : {}),
      success: (res) => {
        const payload = res.data as HubResponse<T>;
        if (payload && payload.ok) resolve(payload.data as T);
        else reject(new Error(payload?.error?.message || `请求失败(${res.statusCode})`));
      },
      fail: (err) => reject(new Error(err.errMsg || '网络错误')),
    });
  });
}

// ── 认证 ──

export type AuthResult = {
  userId: string;
  token: string;
  credits: number;
  platform?: string;
  deletionPending?: boolean;
};

export function loginWithCode(code: string, inviterId?: string, platform?: string) {
  return hubRequest<AuthResult>('POST', '/v1/auth/login', { code, inviterId }, false, platform);
}

export function sendSmsCode(phone: string) {
  return hubRequest<any>('POST', '/v1/auth/send-code', { phone });
}

export function loginWithSms(phone: string, code: string, platform?: string, inviterId?: string) {
  return hubRequest<AuthResult>(
    'POST',
    '/v1/auth/sms-login',
    { phone, code, inviterId },
    false,
    platform,
  );
}

// ── 积分 ──

export function fetchBalance() {
  return hubRequest<{ credits: number }>('GET', '/v1/credits/balance', undefined, true);
}

export function fetchTransactions(limit = 30) {
  return hubRequest<any[]>('GET', `/v1/credits/transactions?limit=${limit}`, undefined, true);
}

export function checkIn() {
  return hubRequest<any>('POST', '/v1/credits/check-in', {}, true);
}

export function watchAdReward() {
  return hubRequest<any>('POST', '/v1/credits/watch-ad', {}, true);
}

export function redeem(code: string) {
  return hubRequest<any>('POST', '/v1/credits/redeem', { code }, true);
}

// ── 上传 ──

function parseUploadUrl(data: string): string {
  const payload = JSON.parse(data);
  const url = payload?.data?.url || payload?.url || payload?.name || payload?.data?.name;
  if (!url) throw new Error(payload?.error || payload?.message || '上传失败');
  return url;
}

/** 上传图片 / 视频到 pan2.evaplat.com/upload, 返回文件 URL。 */
export function uploadMedia(filePath: string): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: UPLOAD_CONFIG.url,
      filePath,
      name: 'file',
      success: (res) => {
        try {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`上传失败(${res.statusCode})`));
            return;
          }
          resolve({ url: parseUploadUrl(res.data) });
        } catch (e: any) {
          reject(new Error(e.message || '上传响应解析失败'));
        }
      },
      fail: (err) => reject(new Error(err.errMsg || '上传失败')),
    });
  });
}
