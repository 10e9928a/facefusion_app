# 第三方与跨服务接入文档

## 1. User Hub

负责登录、用户、余额和最终计费。客户端使用公开 HMAC credential + 用户 JWT。FaceFusion app
必须使用独立 app key、平台 client ID、service secret 和价格 category，不与 Norma 租户混用。

## 2. Upload Hub/COS

客户端只接 Upload Hub `/upload`，不获得 COS key。返回 assetId 进入人脸库/任务请求，短签名 URL
用于预览。对象 private、跨 app/user 拒绝、过期刷新和删除必须在发布前验证。

## 3. FaceFusion API

所有业务 route 使用 Bearer Hub JWT 和固定 app context。检测、任务和结果通过 API；客户端不
接受配置 engine origin。API 响应新增字段向后兼容，任务终态和 output assetId 是真源。

## 4. GPU FaceFusion Engine

engine 无用户鉴权，只能由 FaceFusion API 在内部网络访问。它不是客户端第三方接入点，不配置
NPM Proxy Host、不加入小程序域名、不发布宿主端口。

## 5. 微信/快手/HBuilderX/商店

各平台 app ID、登录、包名、证书和权限独立配置。任何登录 code 送 User Hub 服务端交换，不在
客户端保存平台 secret。引入支付前必须使用平台官方 IAP/支付和服务端幂等验单。

## 6. 短信登录

客户端只调用 User Hub 的短信接口，不绑定 uniCloud 服务空间或短信模板。实际短信 Provider 由
User Hub 服务端配置；FaceFusion 的用户、租户与 JWT 仍以 User Hub 为唯一事实源。

## 7. 接入检查

- provider 是否接收人脸、图片/视频、生物特征或用户标识，隐私/同意是否充分。
- 数据存储地域、保留/删除、模型训练政策和未成年人限制。
- 凭据是否服务端最小权限、可轮换；客户端是否只含公开值。
- provider 故障是否保持资产/积分一致且可恢复。
