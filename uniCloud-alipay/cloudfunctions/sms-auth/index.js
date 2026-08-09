'use strict';

const { randomInt } = require('crypto');

/**
 * 短信云服务 — 仅负责发码与校验，登录态由 user_hub 签发。
 *
 * 环境变量:
 *   SMS_TEMPLATE_ID  短信模板 ID, 默认 38507
 *   SMS_DEV_MODE     1 时不发短信, 日志打印 devCode
 */

const APPID = '__UNI__9C561CD';
const CODE_TTL_MS = 5 * 60 * 1000;
const SEND_INTERVAL_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

const SMS_TEMPLATE_ID = process.env.SMS_TEMPLATE_ID || '38507';
const SMS_DEV_MODE = process.env.SMS_DEV_MODE === '1';

const db = uniCloud.database();
const codesCol = db.collection('ff_sms_codes');

function ok(data) {
  return { ok: true, data };
}

function fail(message, code = 'ERROR') {
  return { ok: false, error: { code, message } };
}

function assertPhone(phone) {
  const p = String(phone || '').trim();
  if (!/^1\d{10}$/.test(p)) throw new Error('手机号格式不正确');
  return p;
}

function genCode() {
  return String(randomInt(100000, 1000000));
}

async function sendCode(phone) {
  const normalized = assertPhone(phone);
  const now = Date.now();
  const existing = await codesCol.doc(normalized).get();
  const row = existing.data && existing.data[0];

  if (row && row.last_sent_at && now - row.last_sent_at < SEND_INTERVAL_MS) {
    const wait = Math.ceil((SEND_INTERVAL_MS - (now - row.last_sent_at)) / 1000);
    return fail(`请 ${wait} 秒后再获取验证码`, 'RATE_LIMITED');
  }

  const code = genCode();
  await codesCol.doc(normalized).set({
    phone: normalized,
    code,
    expires_at: now + CODE_TTL_MS,
    last_sent_at: now,
    attempts: 0,
  });

  if (SMS_DEV_MODE) {
    console.log(`[sms-auth][dev] ${normalized} => ${code}`);
    return ok({ sent: true, devMode: true, devCode: code });
  }

  try {
    await uniCloud.sendSms({
      appid: APPID,
      phone: normalized,
      templateId: SMS_TEMPLATE_ID,
      data: { code },
    });
  } catch (err) {
    console.error('[sms-auth] sendSms failed', err);
    await codesCol.doc(normalized).remove();
    return fail(err.errMsg || err.message || '短信发送失败', String(err.errCode || 'SMS_FAILED'));
  }

  return ok({ sent: true });
}

async function verifyCode(phone, code) {
  const normalized = assertPhone(phone);
  const inputCode = String(code || '').trim();
  if (!inputCode) return fail('验证码不能为空', 'BAD_REQUEST');

  const existing = await codesCol.doc(normalized).get();
  const row = existing.data && existing.data[0];
  if (!row) return fail('请先获取验证码', 'CODE_NOT_FOUND');

  const now = Date.now();
  if (now > row.expires_at) {
    await codesCol.doc(normalized).remove();
    return fail('验证码已过期', 'CODE_EXPIRED');
  }

  if ((row.attempts || 0) >= MAX_VERIFY_ATTEMPTS) {
    await codesCol.doc(normalized).remove();
    return fail('验证码错误次数过多, 请重新获取', 'TOO_MANY_ATTEMPTS');
  }

  if (row.code !== inputCode) {
    await codesCol.doc(normalized).update({ attempts: (row.attempts || 0) + 1 });
    return fail('验证码错误', 'CODE_INVALID');
  }

  await codesCol.doc(normalized).remove();
  return ok({ verified: true });
}

function normalizeEvent(event, context) {
  const tryParse = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const pick = (value) => {
    const parsed = tryParse(value) || (typeof value === 'object' ? value : null);
    if (parsed && typeof parsed === 'object' && (parsed.action || parsed.type)) return parsed;
    return null;
  };

  if (typeof event === 'string') return pick(event) || {};
  if (!event || typeof event !== 'object') return {};

  const direct = pick(event);
  if (direct) return direct;

  for (const item of [event.body, event.data, event.params, event.payload, event.queryStringParameters, context?.args?.[0], context?.DATA]) {
    const payload = pick(item);
    if (payload) return payload;
  }

  let body = event.body;
  if (event.isBase64Encoded && typeof body === 'string') {
    body = Buffer.from(body, 'base64').toString('utf8');
  }
  return pick(body) || {};
}

exports.main = async (event, context) => {
  const payload = normalizeEvent(event, context);
  const action = payload.action || payload.type;
  try {
    if (action === 'sendCode') return await sendCode(payload.phone);
    if (action === 'verifyCode') return await verifyCode(payload.phone, payload.code);
    return fail(`unknown action: ${action}`, 'BAD_REQUEST');
  } catch (err) {
    console.error('[sms-auth]', err);
    return fail(err.message || '服务异常', 'INTERNAL');
  }
};
