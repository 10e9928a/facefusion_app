# uniCloud 短信云服务 (sms-auth)

服务空间: **norma-ai** / `env-00jy6futmtdk`（支付宝云，目录 `uniCloud-alipay`）

云函数**只负责发短信和校验验证码**，JWT 由 **user_hub** 签发。

## 架构

```
小程序 → user_hub /v1/auth/send-code
              ↓ (SMS_PROVIDER=unicloud)
         uniCloud sms-auth sendCode

小程序 → user_hub /v1/auth/sms-login
              ↓ verifyCode
         uniCloud sms-auth
              ↓ loginWithVerifiedPhone
         user_hub 签发 token
```

## HTTP 地址

```
https://env-00jy6futmtdk.dev-hz.cloudbasefunction.cn/sms-auth
```

配置到 **user_hub** `.env` 的 `SMS_CLOUD_URL`（不是小程序）。

## 云函数环境变量

| 变量 | 说明 |
|------|------|
| `SMS_TEMPLATE_ID` | 短信模板 ID，默认 `38507` |
| `SMS_DEV_MODE` | `1` 时不发短信，日志打印 devCode |

无需再配置 `HUB_URL` / `HUB_SERVICE_SECRET`。

## user_hub 配置

```env
SMS_PROVIDER=unicloud
SMS_CLOUD_URL=https://env-00jy6futmtdk.dev-hz.cloudbasefunction.cn/sms-auth
```

本地开发：

```env
SMS_PROVIDER=memory
```

验证码固定 `123456`，控制台打印。
