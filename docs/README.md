# FaceFusion 客户端文档

最后更新：2026-08-19

本项目是独立换脸产品客户端，复用 User Hub 身份/积分和 Upload Hub 私有资产，通过
`facefusion_api` 使用业务能力。

- [架构文档](architecture.md)
- [开发文档](development.md)
- [部署文档](deployment.md)
- [迭代文档](iteration.md)
- [第三方与跨服务接入](integrations.md)
- [运维文档](operations.md)

应用版本以 `src/manifest.json` 为准。线上/商店状态必须由对应发布 manifest 证明；本目录不
保存任何生产 credential、证书或平台账号。
