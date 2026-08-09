# FaceFusion 客户端

uni-app 多端换脸应用（微信 / 快手小程序、H5 与 App），对接 User Hub 中台、`facefusion_api` 业务后端与 FaceFusion 引擎。

## 架构

```
facefusion_app
  ├─ HMAC + JWT → user_hub_api（登录 / 积分 / 计费）
  ├─ Bearer JWT → facefusion_api（人脸库 / 换脸任务）
  ├─ 直连 → facefusion 引擎（人脸检测 /reference）
  └─ uni.uploadFile → pan2.evaplat.com/upload（文件上传，不经 Hub）
```

## 本地开发

```bash
# 依赖：user_hub_api (:5001)、facefusion_api (:8400)、facefusion 引擎
cp .env.development.example .env.development
yarn install --frozen-lockfile
yarn dev:h5   # 或 yarn dev:mp-weixin
```

`.env.development` 示例：

```env
VITE_HUB_BASE=http://127.0.0.1:5001
VITE_FF_API_BASE=http://127.0.0.1:8400
VITE_FF_ENGINE_BASE=http://127.0.0.1:8000
VITE_HUB_APP_KEY=facefusion
VITE_HUB_CLIENT_SECRET=change-me
VITE_UPLOAD_URL=https://pan2.evaplat.com/upload
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_HUB_BASE` | User Hub 地址 |
| `VITE_HUB_APP_KEY` | 应用标识，默认 `facefusion` |
| `VITE_HUB_CLIENT_SECRET` | HMAC 签名密钥 |
| `VITE_FF_API_BASE` | facefusion_api 地址 |
| `VITE_FF_ENGINE_BASE` | facefusion 引擎（人脸检测） |
| `VITE_UPLOAD_URL` | 文件上传，默认 `https://pan2.evaplat.com/upload` |

`.env.development` 仅用于本地环境，已被 Git 忽略。所有 `VITE_` 变量都会进入客户端包；`VITE_HUB_CLIENT_SECRET`
只能用作应用识别，不应具有其他后端权限，也不能被当作可信客户端的安全边界。
