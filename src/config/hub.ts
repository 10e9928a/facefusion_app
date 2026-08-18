/**
 * 后端接入配置。
 * - user_hub(用户中台): 登录 / 积分, 走 HMAC + JWT。
 * - facefusion_api(业务后端): 模版 / 人脸库 / 换脸任务, 走 JWT。
 * - upload_hub(文件中台): 上传图片 / 视频，走用户 JWT。
 */

function requiredEnv(key: keyof ImportMetaEnv): string {
  const v = import.meta.env[key];
  const value = v === undefined || v === null ? '' : String(v).trim();
  if (!value) throw new Error(`环境配置缺少 ${key}`);
  return value;
}

function baseUrl(key: keyof ImportMetaEnv): string {
  return requiredEnv(key).replace(/\/+$/, '');
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
  baseUrl: baseUrl('VITE_HUB_BASE'),
  appKey: requiredEnv('VITE_HUB_APP_KEY'),
  /** 公开客户端凭据，会进入安装包；不能作为敏感操作的安全边界。 */
  clientSecret: requiredEnv('VITE_HUB_CLIENT_SECRET'),
  platform: resolvePlatform(),
};

export const FACEFUSION_CONFIG = {
  baseUrl: baseUrl('VITE_FF_API_BASE'),
};

export const UPLOAD_CONFIG = {
  url: requiredEnv('VITE_UPLOAD_URL'),
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
