# 拾光阅读

依据 PRD-001 开发的小说阅读 App Monorepo。移动端采用 Expo、React Native、NativeWind 和 Expo SQLite；API 采用 Express、JWT 和 Node.js SQLite，同时保留 Supabase/PostgreSQL 生产数据结构。

## 文档导航

- [移动端项目说明](apps/mobile/README.md)：页面、组件、服务、离线能力及移动端文件索引。
- [API 项目说明](apps/api/README.md)：接口、鉴权、数据库、测试及后端文件索引。
- [功能验收清单](docs/ACCEPTANCE.md)
- [首页视频还原 Prompt](docs/HOME_VIDEO_RECONSTRUCTION_PROMPT.md)
- [应用入口重构 Prompt](docs/APP_REFACTOR_PROMPT.md)

## 总体架构

```text
novel-reader-app/
├── apps/
│   ├── mobile/                 Expo + React Native 移动端与 Web 端
│   └── api/                    Express API 与本地 SQLite 数据层
├── supabase/                   PostgreSQL/Supabase 建表与种子脚本
├── scripts/                    本地开发启动脚本
├── docs/                       验收、还原 Prompt 与重构说明
├── package.json                Monorepo 根配置
└── pnpm-workspace.yaml         pnpm 工作区定义
```

页面组件通过移动端 API Service 调用 Express API。API 在本地开发时使用 SQLite，在生产环境中可连接 Supabase/PostgreSQL。移动端使用 Expo SQLite 缓存章节并保存待同步操作。

## 快速启动

要求 Node.js 22+、pnpm 10+。

```bash
pnpm install
cp .env.example .env
pnpm dev
```

在 Codex 桌面运行时中，可以直接启动本地 API、SQLite 和 Web：

```bash
sh scripts/start-local.sh
```

- Web：`http://localhost:8081`
- API：`http://127.0.0.1:4000`
- 健康检查：`http://127.0.0.1:4000/health`
- 演示登录：任意长度不少于 3 的用户名和不少于 6 位的密码

## 已实现范围

- 书城、分类、搜索、AI 寻书、短剧、福利和书架。
- 书籍详情、浏览历史、个人中心、用户档案和正文阅读器。
- 登录拦截、批量书架操作、章节下载、离线队列及阅读设置。
- SSE 流式 AI 寻书和 SQLite/Supabase 双数据层结构。

## 根目录文件

- [package.json](package.json)：Monorepo 脚本、版本和 pnpm 配置。
- [pnpm-workspace.yaml](pnpm-workspace.yaml)：工作区项目范围。
- [pnpm-lock.yaml](pnpm-lock.yaml)：依赖版本锁文件，由 pnpm 自动维护。
- [.gitignore](.gitignore)：依赖、构建结果和本地数据忽略规则。
- [.editorconfig](.editorconfig)：编辑器通用缩进、换行和字符集规则。
- [.prettierrc.json](.prettierrc.json)：Prettier 代码格式配置。
- [.prettierignore](.prettierignore)：Prettier 忽略目录与生成文件。
- [eslint.config.mjs](eslint.config.mjs)：前后端统一 ESLint 规则。
- [commitlint.config.mjs](commitlint.config.mjs)：Conventional Commits 校验规则。
- [lint-staged.config.mjs](lint-staged.config.mjs)：提交前仅检查暂存文件的规则。
- [.husky/pre-commit](.husky/pre-commit)：提交前执行 lint-staged。
- [.husky/commit-msg](.husky/commit-msg)：提交信息写入后执行 Commitlint。
- [.vscode/settings.json](.vscode/settings.json)：仓库级 VS Code 格式化和自动修复设置。
- [.vscode/extensions.json](.vscode/extensions.json)：前后端开发推荐扩展。
- [scripts/start-local.sh](scripts/start-local.sh)：同时启动 API 和 Expo Web，并在退出时清理子进程。
- [supabase/schema.sql](supabase/schema.sql)：Supabase/PostgreSQL 表、索引和约束。
- [supabase/seed.sql](supabase/seed.sql)：生产数据结构对应的演示种子数据。

## 全仓命令

```bash
# 同时启动所有工作区
pnpm dev

# 本地全栈快捷启动
pnpm dev:local

# 类型检查
pnpm typecheck

# ESLint 检查与自动修复
pnpm lint
pnpm lint:fix

# Prettier 检查与格式化
pnpm format:check
pnpm format

# 测试
pnpm test

# 构建
pnpm build

# 代码规范完整校验
pnpm validate
```

## 代码与提交规范

### 日常开发流程

1. 开发时使用 VS Code 保存自动格式化和 ESLint 自动修复。
2. 提交前运行 `pnpm validate`，完整执行格式、Lint、类型、测试和构建检查。
3. 使用 Conventional Commits 格式填写提交信息。

ESLint 同时覆盖 React Native/React Hooks 前端代码与 Node.js 后端代码；Prettier 统一 TypeScript、JavaScript、JSON、Markdown、CSS 和 YAML 的排版。TypeScript 在两个工作区均启用严格模式、文件名大小写一致性检查和 `switch` 穿透检查。

### 提交信息

提交信息格式为：

```text
<type>(<scope>): <subject>
```

允许的 `type`：`build`、`chore`、`ci`、`docs`、`feat`、`fix`、`perf`、`refactor`、`revert`、`style`、`test`。`scope` 可省略，建议使用 `mobile`、`api`、`docs` 或具体功能名。

```text
feat(mobile): add reader settings
fix(api): validate login payload
docs: update project structure
```

[pre-commit Hook](.husky/pre-commit) 会通过 lint-staged 格式化并检查暂存文件；[commit-msg Hook](.husky/commit-msg) 会通过 Commitlint 拒绝不符合规则的提交信息。安装依赖时，`prepare` 脚本会自动初始化 Husky。

### VS Code 配置

使用 VS Code 打开仓库后，[工作区设置](.vscode/settings.json) 会启用保存时格式化、ESLint 自动修复、TypeScript 工作区版本和文件尾换行。可在扩展面板执行“Show Recommended Extensions”安装 [.vscode/extensions.json](.vscode/extensions.json) 中的推荐扩展：

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Expo Tools
- TypeScript Nightly
- Error Lens
- DotENV
- GitLens

## 非源码目录

- `node_modules/`：pnpm 安装的依赖。
- `apps/mobile/dist/`：Expo Web 导出产物。
- `apps/mobile/.expo/`：Expo 本地缓存和日志。
- `apps/api/dist/`：API TypeScript 编译产物。
- `apps/api/data/`：本地 SQLite 运行数据。
