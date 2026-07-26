# 验收映射

| 需求 | 实现位置 |
| --- | --- |
| IMAGE-01~04 书城、搜索、分类、AI | `apps/mobile/App.tsx` 的 Home / Search / Category / Ai |
| IMAGE-05/06/15 筛选、书架、批量管理 | Filter / Shelf；批量 API `/api/shelf/batch` |
| IMAGE-07~09 我的、历史、档案 | Profile / History / User；历史与笔记数据库隔离 |
| IMAGE-10~14 阅读器与面板 | Reader / ReaderPanel；长按暂停、换肤、目录/笔记 |
| 登录拦截与 Auto-Retry | `LoginSheet` + App `guard` / `pending` |
| SQLite 离线缓存 | `src/services/offline.ts` |
| SSE 及 300ms 防抖 | Ai + `/api/ai/search` |
| Supabase DDL 与 Mock | `supabase/schema.sql`、`supabase/seed.sql` |

外部大模型密钥、Supabase 云端实例和系统级护眼滤镜需要部署方提供或授予原生系统权限；本地验收默认使用确定性的标签检索和内存数据。
