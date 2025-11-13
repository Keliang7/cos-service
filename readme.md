# COS 独立后端服务（cos-service）

此项目作为 **独立的文件服务微服务**，专门负责与腾讯云 COS 交互，为其他后端服务提供统一的文件上传、删除、签名等能力。  
整个架构以“安全、可控、可扩展”为核心设计原则。

---

## 🎯 项目需求分析（你目前的全部目标）

根据现有规划，总结如下 7 个核心需求：

### 1. **将 COS 单独拆成独立后端项目**

避免与业务耦合，保证后期可替换（COS / OSS / MinIO）。

### 2. **前端禁止直接访问 COS**

前端永远无法接触密钥，也不走直传，所有操作由业务后端 → cos-service 完成。

### 3. **其他后端通过 Docker 网络访问 cos-service**

例如：

- gateway-service
- user-service
- admin-service
- partner-service  
  在 Docker 网络内部通过：

```
http://cos-service:3000
```

### 4. **后端技术栈使用 Express**

轻量、易维护、易扩展，适合作为文件代理服务。

### 5. **整个项目扮演“微服务 + 代理层”的角色**

所有文件操作统一从这一层经过：

- 命名规范
- 上传策略
- 权限控制
- 日志 & 审计
- 目录规则（avatar / poster / logs / ai 等）

### 6. **允许将项目映射到服务器，方便开发联调**

例如：

```
docker run -p 3000:3000 cos-service
```

这样你在本地业务后端可以直接访问远程 cos-service，保持一致体验。

### 7. **允许在开发环境中暴露给外部访问（仅限调试）**

例如通过端口映射：

```
localhost:3000/upload
```

便于 Postman / 前端调试，但生产环境会关闭外网访问。

---

## 📦 提供的接口能力

| 路径             | 方法 | 描述                            |
| ---------------- | ---- | ------------------------------- |
| `/upload`        | POST | 后端服务上传文件到 COS          |
| `/upload/base64` | POST | AI/前端生成图上传（转码后上传） |
| `/delete`        | POST | 删除文件                        |
| `/signed-url`    | POST | 业务后端内部使用的预签名接口    |
| `/url/:key`      | GET  | 将 COS key 转为完整访问 URL     |

---

## 🌐 Docker / 网络设计

所有后端服务加入同一个 `backend` 网络：

```
cos-service
gateway
user-service
admin-service
partner-service
```

调用方式：

```
http://cos-service:3000/upload
```

无需 IP，完全由 Docker DNS 解析。

---

## 🛠 开发环境访问方式

### 方式 1：本地端口映射（推荐）

```
docker run -p 3000:3000 cos-service
```

适用：

- Postman 调试
- 前端本地跑 H5 / Admin / Partner
- 联调业务后端

### 方式 2：远程服务器映射

```
docker run -p 3000:3000 cos-service
```

这样你可以直接访问服务器调试：

```
http://your-server-ip:3000
```

> ⚠️ 生产版本不要暴露端口，只在开发阶段启用。

---

## 🚀 后续扩展（建议路线）

- 文件压缩（sharp）
- 缩略图生成（AI 图非常有用）
- 上传回调（COS → cos-service → 业务服务）
- 定时清理（cron）
- 内部 SDK（cos-client.js）供所有后端统一调用
- 多目录管理（avatar/poster/banner/ai-temp）

---

## ✅ 项目的本质价值

cos-service 做一件事：

> **让所有后端都用统一、可控、安全的方式访问 COS。**

减少重复代码  
避免密钥泄露  
减少 COS 配置分散  
支持未来快速扩展

---
