# 开发文档

## 1. 环境

项目固定 yarn 1.x 锁文件。

```bash
cp .env.development.example .env.development
yarn install --frozen-lockfile
yarn run check
yarn dev:h5
```

联调至少需要研发 User Hub、Upload Hub local、FaceFusion API 和内部 engine。真机不可用
`127.0.0.1` 访问电脑服务，使用可信局域网地址并保持 engine 不对公网开放。

## 2. 开发规则

- 网络调用集中在 `src/services/`，页面不拼接 engine URL。
- 媒体状态同时保存 assetId 和可刷新的展示 URL，以 assetId 为真源。
- 上传成功后再提交检测/任务；失败和取消不得留下假历史。
- 轮询由页面可见性和 active 状态共同控制，有界退避并在终态停止。
- 积分只展示 Hub 结果，不在客户端估算最终扣费。
- 新端能力分别验证 H5、目标小程序和 App。

## 3. 门禁

```bash
yarn install --frozen-lockfile
yarn run check
yarn build:h5
```

`check` 包含 Vue TypeScript 与构建配置测试。原生相机/相册、视频、权限、登录和支付必须真机
回归；微信/快手分别用对应开发者工具验证合法域名和上传限制。

## 4. 安全/失败测试

覆盖未登录上传、错误 app、过期 JWT、签名 URL 过期、跨用户 assetId、检测超时、任务失败、
页面后台停止轮询和生产 localhost/HTTP/占位配置阻断。

## 5. 完成标准

- UI、API 和资产状态在刷新/重启/签名过期后仍一致。
- 无 engine/第三方图床直连、服务 secret 或硬编码生产回退。
- 后端 API 变化保持旧客户端兼容或有明确发布顺序。
- 更新本目录文档并独立提交。
