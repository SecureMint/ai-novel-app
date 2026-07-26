# 拾光阅读

依据 PRD-001 独立开发的小说阅读 App monorepo。移动端采用 Expo + React Native + NativeWind + Expo SQLite；API 采用 Express + JWT，数据层支持 Supabase PostgreSQL，同时内置无需云端凭据的演示数据。

## 启动

要求 Node.js 22+、pnpm 10+。

```bash
pnpm install
cp .env.example .env
pnpm dev
```

- App：`pnpm --filter @novel/app start`，按 `w` 预览 Web，或用 Expo Go 扫码。
- API：默认 `http://localhost:4000`，健康检查 `/health`。
- 演示登录：任意长度不少于 3 的用户名和不少于 6 位的密码。

## 已实现范围

- 书城、分类、搜索、AI 寻书、福利、书架、筛选、批量编辑、个人中心、历史、用户详情、阅读器及设置面板。
- 敏感动作登录拦截与登录后的原动作自动重试。
- SSE 流式 AI 寻书；新查询前关闭旧连接，输入 300ms 防抖。
- SQLite 章节下载、离线进度/笔记队列和最新时间戳优先同步策略。
- 阅读器正文长按暂停自动阅读并打开划线/想法菜单；动态 WebAIM 对比色。
- 历史删除与笔记资产隔离；书架批量操作使用 `bookIds`。

数据库与 Mock 数据位于 `supabase/`。未配置 Supabase 时 API 自动使用内存 Mock，方便验收。
