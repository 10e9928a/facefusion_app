# 迭代文档

## 当前基线（2026-08-19）

- 上传从第三方图床切换为 User JWT + Upload Hub 私有资产。
- 删除客户端直连 GPU engine，人脸检测统一经 FaceFusion API。
- 人脸库、目标和结果以 assetId 为真源，使用前刷新 URL。
- 任务轮询仅在页面可见且存在 active task 时运行。
- 生产配置缺失、HTTP/localhost、占位 credential 或错误 `/upload` path 会阻断构建。

## 近期优先级

### P0

- 完成后端正式域名、租户、价格、私有资产和 engine 内网 E2E。
- 完成微信/HBuilderX/真机的图片/视频权限、上传、检测和任务回归。

### P1

- 补中英文/目标市场完整多语言和发布法律材料，不把 Norma 客户端文案直接复制。
- 增加 asset URL 过期、App 后台/恢复和弱网下的任务状态测试。
- 评估旧 DCloud 工具链升级，走独立平台矩阵，禁止强制依赖修复。

### 当前阻断

- 原工程复用了 Norma AI 的 DCloud、微信和快手 AppID，现已清空，防止误发布到错误产品。
  FaceFusion 正式构建前必须创建并评审独立平台标识，不得恢复复用。

### 暂不建设

- 不在客户端做 GPU 参数全量面板、任意 engine 调试或持久价格配置。

## 迭代记录模板

```markdown
## YYYY-MM-DD / 版本(build)
- 平台：
- 用户/媒体/API 变化：
- assetId/任务兼容：
- 权限与隐私：
- 测试证据：
- 发布状态与回滚：
```
