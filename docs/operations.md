# 运维文档

## 1. 诊断关联

按 app 版本/build、平台、脱敏用户 ID、assetId、FaceFusion output/job ID、Hub hold/ledger ID 和
request ID 关联。不要收集完整人脸图片、视频、签名 URL、JWT 或平台登录 code。

## 2. 常见故障

### 上传/预览失败

区分平台选择器权限、类型/大小、Upload 401/413/5xx、URL 过期和对象缺失。刷新 URL 不应重复
上传；绝不把 COS 改 public 或恢复第三方图床。

### 检测不到脸

核对目标 asset/URL、媒体类型、API 下载限制、engine 模型/GPU和检测参数。客户端应展示可理解
错误，不把内部路径/命令/模型日志暴露给用户。

### 任务卡住/积分异常

按 output/job → engine job → Hub hold 追踪。未知 engine 状态不能自动重提/退款；明确失败才
refund，结果 asset 写入并落库后再 settle。

### 历史结果打不开

先刷新 output assetId 的签名 URL，再查资产是否被删除/注销 purge。历史表不应只存旧 URL。

## 3. 发布后观察

关注登录、上传、检测、任务成功/失败/耗时、URL 刷新、跨用户拒绝和 hold 年龄。App 切后台后
轮询应停止，恢复前台后从服务端刷新。

## 4. 隐私事故

人脸或媒体跨用户访问、公开对象、错误删除、未经披露的第三方出站均按 P0：隔离入口、轮换
凭据、保留访问/资产/job 证据并确认影响。客户端日志/截图不得含生物特征素材正文。

## 5. 恢复

客户端无服务端真源；恢复依赖 User Hub、FaceFusion DB、Upload metadata/COS 和 engine job 的
一致性。重新安装 App 不应丢失服务端历史，也不能作为修复账本/资产问题的方法。
