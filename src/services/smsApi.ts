/**
 * 短信登录 — 统一走 user_hub；hub 再按需调用 uniCloud 云函数发真实短信。
 */

import * as hub from '@/services/hubApi';
import { getStoredInviterId, HUB_CONFIG } from '@/config/hub';

export type SendCodeResult = { sent: boolean; devMode?: boolean; devCode?: string };

/** 发送登录验证码 */
export async function sendSmsCode(phone: string): Promise<SendCodeResult> {
  const data = await hub.sendSmsCode(phone) as { devCode?: string } | undefined;
  if (data?.devCode) {
    return { sent: true, devMode: true, devCode: data.devCode };
  }
  return { sent: true };
}

/** 校验验证码并登录 */
export async function smsLogin(
  phone: string,
  code: string,
  platform?: string,
  inviterId?: string,
) {
  return hub.loginWithSms(
    phone,
    code,
    platform || HUB_CONFIG.platform,
    inviterId ?? getStoredInviterId(),
  );
}
