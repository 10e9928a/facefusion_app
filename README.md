# FaceFusion 客户端

uni-app 多端换脸应用（微信 / 快手小程序、H5 与 App），对接 User Hub 中台、
`facefusion_api` 业务后端、FaceFusion 检测引擎与通用 Upload Hub。

## 架构

```
facefusion_app
  ├─ HMAC + JWT → user_hub_api（登录 / 积分 / 计费）
  ├─ Bearer JWT → facefusion_api（人脸库 / 换脸任务）
  ├─ 直连 → facefusion 引擎（人脸检测 /reference）
  └─ Bearer JWT → upload_hub（COS 私有媒体上传）
```

客户端内的 HMAC 凭据是公开应用凭据，只用于协议兼容与请求完整性，不能证明客户端可信。
用户身份、资产归属和敏感操作均以服务端验证 JWT、租户边界、限流和幂等为准。

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
VITE_HUB_CLIENT_SECRET=replace-with-public-client-credential
VITE_UPLOAD_URL=http://127.0.0.1:5010/upload
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_HUB_BASE` | User Hub 地址 |
| `VITE_HUB_APP_KEY` | User Hub 应用标识，必须显式配置 |
| `VITE_HUB_CLIENT_SECRET` | 打入客户端的公开 HMAC 凭据，不是真正密钥 |
| `VITE_FF_API_BASE` | facefusion_api 地址 |
| `VITE_FF_ENGINE_BASE` | facefusion 引擎（人脸检测） |
| `VITE_UPLOAD_URL` | Upload Hub 的完整 `/upload` 入口 |

`.env.development` 仅用于本地环境，已被 Git 忽略。所有 `VITE_` 变量都会进入客户端包；`VITE_HUB_CLIENT_SECRET`
只能用作应用识别，不应具有其他后端权限，也不能被当作可信客户端的安全边界。生产构建
会校验所有地址均为非本机 HTTPS，缺失配置、占位凭据和错误上传路径会直接阻止构建。

## 质量门禁

```bash
yarn run check
```

任务历史仅在页面可见且存在排队/执行中任务时轮询；进入后台或全部任务结束会停止请求。
升级 DCloud/uni-app 工具链前必须用 HBuilderX、微信开发者工具和真机分别回归，不使用
`audit fix --force` 跨越锁定版本。
