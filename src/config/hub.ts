/**
 * 后端接入配置。
 * - user_hub(用户中台): 登录 / 积分, 走 HMAC + JWT。
 * - facefusion_api(业务后端): 模版 / 人脸库 / 换脸任务, 走 JWT。
 * - 文件上传: pan2.evaplat.com/upload（过渡态直连, 后续收敛为文件中台）。
 */

function env(key: keyof ImportMetaEnv, fallback: string): string {
  const v = import.meta.env[key];
  return v === undefined || v === null || v === '' ? fallback : String(v);
}

// 运行平台标识(用于 X-Platform 与登录 provider)
export function resolvePlatform(): string {
  // #ifdef MP-WEIXIN
  return 'wechat';
  // #endif
  // #ifdef MP-KUAISHOU
  return 'kuaishou';
  // #endif
  // #ifdef H5
  return 'h5';
  // #endif
  // #ifdef APP-PLUS
  try {
    return uni.getDeviceInfo().platform === 'ios' ? 'apple' : 'android';
  } catch (e) {
    return 'android';
  }
  // #endif
  // eslint-disable-next-line no-unreachable
  return 'h5';
}

export const HUB_CONFIG = {
  baseUrl: env('VITE_HUB_BASE', 'http://127.0.0.1:5001'),
  appKey: env('VITE_HUB_APP_KEY', 'facefusion'),
  clientSecret: env('VITE_HUB_CLIENT_SECRET', ''),
  platform: resolvePlatform(),
};

export const FACEFUSION_CONFIG = {
  baseUrl: env('VITE_FF_API_BASE', 'http://127.0.0.1:8400'),
};

export const FACEFUSION_ENGINE_CONFIG = {
  baseUrl: env('VITE_FF_ENGINE_BASE', 'http://127.0.0.1:8000'),
};

export const UPLOAD_CONFIG = {
  url: env('VITE_UPLOAD_URL', 'https://pan2.evaplat.com/upload'),
};

export const STORAGE_KEYS = {
  token: 'ff:token',
  userId: 'ff:userId',
  credits: 'ff:credits',
  manualLogout: 'ff:manualLogout',
  inviterId: 'ff:inviterId',
};

export function getStoredInviterId(): string | undefined {
  const id = String(uni.getStorageSync(STORAGE_KEYS.inviterId) || '').trim();
  return id || undefined;
}

export function saveInviterIdFromQuery(query?: Record<string, string | undefined>) {
  const id = String(query?.inviterId || '').trim();
  if (id) uni.setStorageSync(STORAGE_KEYS.inviterId, id);
}
