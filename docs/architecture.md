# 架构文档

## 1. 定位

uni-app 多端客户端，覆盖 App、H5、微信和快手小程序。负责登录、媒体选择、人脸检测/选择、
换脸任务和结果历史展示，不直连数据库、COS 或 GPU 引擎。

```text
pages/components/stores
  -> Hub service（登录/用户/积分）
  -> Upload service（目标/源脸私有资产）
  -> FaceFusion API service（检测/人脸库/任务/结果）
       -> internal GPU engine
```

## 2. 关键模块

- `src/config/hub.ts`：User Hub、FaceFusion API、Upload Hub 构建配置。
- `src/services/hubApi.ts`：HMAC + JWT 的中台请求。
- `src/services/facefusionApi.ts`：检测、任务和输出。
- `src/stores/auth.ts`：用户会话与 app 身份。
- `src/utils/media.ts`：媒体选择、assetId 和签名 URL 处理。
- `build/config.mjs`：生产地址/凭据/上传路径 fail-closed 守卫。
- `src/themes/`：视觉主题；Logo/配色保持产品一致。

## 3. 媒体与任务

目标图/视频、源脸和结果长期保存 `assetId`；短签名 URL 在显示、检测或提交前刷新。检测统一
通过已鉴权 `facefusion_api`，客户端看不到内部 engine 地址。页面只在可见且存在 active task
时轮询，后台或终态停止。

## 4. 身份与积分

User Hub app key 固定为 FaceFusion 租户；公开 HMAC credential 不能证明客户端可信。用户 JWT
归属由服务端校验。FaceFusion API 负责 hold/settle/refund 协调，最终金额/余额来自 User Hub。

## 5. 平台差异

小程序、H5 和原生 App 的文件 API、权限、登录和 web-view 能力不同。共享 service/store，不在
页面复制业务逻辑；端差异收敛在 uni API 适配和构建配置。

## 6. 不可破坏约束

- 不恢复客户端直连无鉴权 engine `/reference`/`/swap`。
- 不恢复 SuperBed/网盘/公开对象上传。
- 不保存过期 URL 代替 assetId，不允许跨用户复用资产。
- `VITE_*` 均公开，真实 service/COS/DB secret 只在后端。
