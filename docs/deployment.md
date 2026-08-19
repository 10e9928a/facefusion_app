# 部署与发布文档

## 1. 发布物

| 平台 | 构建入口 |
| --- | --- |
| H5 | `yarn build:h5` |
| 微信小程序 | `yarn build:mp-weixin` |
| 快手小程序 | `yarn build:mp-kuaishou` |
| iOS/Android App | `yarn build:app-ios` / `yarn build:app-android` + HBuilderX |

当前仓库未配置自动镜像/商店发布 workflow；发布必须形成独立 release manifest。

## 2. 前置

- User Hub 已创建 FaceFusion app、平台登录配置、价格规则和商品。
- Upload Hub 多 app secret 映射包含 FaceFusion，私有 COS/资产 E2E 通过。
- FaceFusion API 已经 NPM TLS 暴露，engine 仅内部网络。
- production 构建变量显式提供非本机 HTTPS 地址和公开 app credential。
- 小程序 request/upload/download 合法域名与端口已配置。
- 协议、隐私、收集/共享清单、账号删除和商店隐私披露完成。

## 3. 发布顺序

1. 先部署兼容旧客户端的 User/Upload Hub 和 FaceFusion API/engine。
2. `yarn install --frozen-lockfile && yarn run check`，对目标平台构建。
3. 用 H5 做基本流程回归，再在对应小程序工具/真机验证端能力。
4. App 通过 HBuilderX 使用独立 bundle/package、证书/profile 打包并上传商店测试渠道。
5. 覆盖登录、上传、检测、多脸选择、图片/视频任务、积分、失败退款、历史、下载和删除。
6. 记录版本/build、提交 SHA、构建配置 profile、平台状态和回滚方式。

## 4. 验证

生产构建必须拒绝 localhost、HTTP 外部地址、占位 credential 和错误上传路径。公网客户端只能
访问 User Hub、Upload Hub 和 FaceFusion API；浏览器网络面板中不得出现 engine origin。

## 5. 回滚

H5/小程序/App 回滚使用上一稳定产物/版本。服务端 API 和资产 schema 必须保持商店旧版本兼容；
不能要求全部用户升级后才修复安全或计费问题。
