# 拾光阅读 API

[返回项目总览](../../README.md) · [查看移动端项目](../mobile/README.md)

API 基于 Express、JWT 和 Zod，开发环境使用 Node.js SQLite，本地无需云端凭据即可运行；生产数据结构支持 Supabase/PostgreSQL。

## 启动与验证

```bash
# 启动开发服务
pnpm --filter @novel/api dev

# 类型检查
pnpm --filter @novel/api typecheck

# 接口测试
pnpm --filter @novel/api test

# 编译生产代码
pnpm --filter @novel/api build

# 仅检查 API ESLint（在仓库根目录执行）
pnpm exec eslint apps/api

# 仅检查 API 代码格式（在仓库根目录执行）
pnpm exec prettier --check apps/api
```

默认地址为 `http://127.0.0.1:4000`，健康检查接口为 `GET /health`。

API 启用 TypeScript 严格模式和 Node.js ESLint 环境，并使用根目录 Prettier 配置统一 TypeScript、JSON 和 Markdown 格式。推荐提交前在仓库根目录运行 `pnpm validate` 完成全量校验。

## 后端职责

- 提供健康检查、分页书籍流、频道分类标签、登录、书架、历史、批量操作和章节下载接口。
- `GET /api/categories?channel=男生` 根据顶部频道返回对应的热门标签、主题、角色和情节分区；移动端侧栏和标签均以该响应驱动。
- 使用 JWT 保护需要登录的业务操作。
- 使用 Zod 校验请求数据。
- 本地运行时自动创建 SQLite 表并写入演示数据。
- 为 Supabase/PostgreSQL 生产环境保留独立 DDL 和种子脚本。

## 工程配置

- [package.json](package.json)：API 依赖及 dev、test、typecheck、build、start 命令。
- [tsconfig.json](tsconfig.json)：开发与测试 TypeScript 配置。
- [tsconfig.build.json](tsconfig.build.json)：生产编译配置，排除测试目录并输出到 `dist/`。

## 源码

- [src/index.ts](src/index.ts)：服务启动入口；读取端口、初始化数据库并监听本机地址。
- [src/app.ts](src/app.ts)：Express 应用、JSON 中间件、CORS、鉴权、健康检查和业务路由。
- [src/database.ts](src/database.ts)：SQLite 连接、建表、种子数据及数据库查询封装。
- [src/data.ts](src/data.ts)：API 使用的书籍、用户和章节演示数据。
- [src/categoryData.ts](src/categoryData.ts)：六个频道下的分类分区与标签数据。
- [test/app.test.ts](test/app.test.ts)：健康检查、登录和鉴权业务接口测试。

## 数据库

本地数据库在首次启动时写入 `data/novel.db`。该文件属于运行数据，不应提交或手工修改。

生产数据库结构位于仓库根目录：

- [../../supabase/schema.sql](../../supabase/schema.sql)：表、索引、关系与约束。
- [../../supabase/seed.sql](../../supabase/seed.sql)：演示种子数据。

## 构建产物

- `dist/`：TypeScript 编译后的 JavaScript。
- `data/`：本地 SQLite 数据库。
- `node_modules/`：API 工作区依赖链接。

这些目录由运行工具生成，不应手工维护。
