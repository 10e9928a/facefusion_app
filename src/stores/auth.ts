/**
 * 登录态与积分单例。全端(微信/快手小程序 / H5 / App)。
 */

import { ref } from 'vue';
import { getStoredInviterId, HUB_CONFIG, STORAGE_KEYS } from '@/config/hub';
import * as hub from '@/services/hubApi';
import * as sms from '@/services/smsApi';

export const credits = ref<number>(Number(uni.getStorageSync(STORAGE_KEYS.credits) || 0));
export const userId = ref<string>(uni.getStorageSync(STORAGE_KEYS.userId) || '');

export function getToken(): string {
  return uni.getStorageSync(STORAGE_KEYS.token) || '';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

function hasManualLogout(): boolean {
  return uni.getStorageSync(STORAGE_KEYS.manualLogout) === '1';
}

function setAuth(result: hub.AuthResult) {
  uni.setStorageSync(STORAGE_KEYS.token, result.token);
  uni.setStorageSync(STORAGE_KEYS.userId, result.userId);
  uni.setStorageSync(STORAGE_KEYS.credits, result.credits ?? 0);
  uni.removeStorageSync(STORAGE_KEYS.manualLogout);
  userId.value = result.userId;
  credits.value = result.credits ?? 0;
}

export function clearAuth() {
  uni.removeStorageSync(STORAGE_KEYS.token);
  uni.removeStorageSync(STORAGE_KEYS.userId);
  uni.removeStorageSync(STORAGE_KEYS.credits);
  userId.value = '';
  credits.value = 0;
}

export function logout() {
  clearAuth();
  uni.setStorageSync(STORAGE_KEYS.manualLogout, '1');
}

export async function refreshCredits(): Promise<number> {
  try {
    const data = await hub.fetchBalance();
    credits.value = data.credits ?? 0;
    uni.setStorageSync(STORAGE_KEYS.credits, credits.value);
  } catch (e) {
    // token 失效等, 忽略
  }
  return credits.value;
}

// ── 小程序静默登录 ──

async function miniProgramLogin(provider: 'weixin' | 'kuaishou', platform: string, inviterId?: string) {
  const loginRes: any = await uni.login({ provider } as UniApp.LoginOptions);
  if (!loginRes.code) throw new Error('小程序登录失败: 未获取 code');
  const result = await hub.loginWithCode(loginRes.code, inviterId, platform);
  setAuth(result);
  return result;
}

/** 微信小程序一键登录(登录页主动触发) */
export async function wxMiniProgramLogin(inviterId?: string) {
  // #ifdef MP-WEIXIN
  return miniProgramLogin('weixin', 'wechat', inviterId ?? getStoredInviterId());
  // #endif
  throw new Error('当前环境不支持微信登录');
}

/**
 * 确保已登录。
 * - 小程序: 启动时自动静默登录(用户主动退出后跳过)。
 * - H5 / App: 已有 token 返回 true, 否则返回 false(由调用方跳转登录页)。
 */
export async function ensureLogin(inviterId?: string): Promise<boolean> {
  if (isLoggedIn()) {
    void refreshCredits();
    return true;
  }
  if (hasManualLogout()) return false;

  const invite = inviterId ?? getStoredInviterId();

  // #ifdef MP-WEIXIN
  try {
    await miniProgramLogin('weixin', 'wechat', invite);
    return true;
  } catch {
    return false;
  }
  // #endif
  // #ifdef MP-KUAISHOU
  try {
    await miniProgramLogin('kuaishou', 'kuaishou', invite);
    return true;
  } catch {
    return false;
  }
  // #endif
  // #ifdef H5 || APP-PLUS
  return false;
  // #endif
  // eslint-disable-next-line no-unreachable
  return false;
}

// ── 登录页调用 ──

export async function smsLogin(phone: string, code: string, inviterId?: string) {
  const result = await sms.smsLogin(phone, code, HUB_CONFIG.platform, inviterId ?? getStoredInviterId());
  setAuth(result);
  return result;
}
