# 拾光阅读移动端

[返回项目总览](../../README.md) · [查看 API 项目](../api/README.md)

移动端基于 Expo、React Native、React Native Web、NativeWind 和 Expo SQLite，同时支持原生端和浏览器预览。

## 启动与验证

```bash
# 启动 Expo
pnpm --filter @novel/app start

# 类型检查
pnpm --filter @novel/app typecheck

# 单元测试
pnpm --filter @novel/app test

# 导出 Web 构建
pnpm --filter @novel/app build

# 仅检查移动端 ESLint（在仓库根目录执行）
pnpm exec eslint apps/mobile

# 仅检查移动端代码格式（在仓库根目录执行）
pnpm exec prettier --check apps/mobile
```

Expo 启动后按 `w` 打开 Web，或使用 Expo Go 扫码运行原生版本。

移动端启用 TypeScript 严格模式、React 与 React Hooks ESLint 规则，并使用根目录 Prettier 配置统一 TypeScript、CSS、JSON 和 Markdown 格式。推荐提交前在仓库根目录运行 `pnpm validate` 完成全量校验。

## 主要功能

- 书城推荐榜、双列推荐流、频道切换和小说筛选。
- 分类、普通搜索和 SSE 流式 AI 智能寻书；分类页按频道请求后端数据，右侧连续滚动时会同步左侧分区。
- 书籍详情、目录、书评和阅读设置。
- 书架批量编辑、福利签到、个人中心和浏览历史。
- 正文阅读、主题与字体设置、夜间模式、自动阅读和划线想法。
- Expo SQLite 章节缓存和离线操作队列。
- 未开发入口统一 Toast 提示。

## 应用入口与工程配置

- [App.tsx](App.tsx)：应用入口；维护路由历史、当前书籍、登录拦截、Toast 触发和页面装配。
- [index.ts](index.ts)：将根组件注册到 Expo/React Native。
- [global.css](global.css)：Web 页面尺寸、安全区、字体渲染和焦点状态。
- [app.json](app.json)：Expo 应用标识、平台配置和插件声明。
- [package.json](package.json)：移动端依赖和工作区命令。
- [tsconfig.json](tsconfig.json)：TypeScript 编译选项和源码范围。
- [metro.config.js](metro.config.js)：Metro Bundler 和 NativeWind 配置。
- [tailwind.config.js](tailwind.config.js)：NativeWind/Tailwind 扫描范围与主题。
- [nativewind-env.d.ts](nativewind-env.d.ts)：NativeWind TypeScript 类型引用。
- [public/index.html](public/index.html)：Expo Web HTML 外壳和根挂载节点。

## 组件

- [src/components/common.tsx](src/components/common.tsx)：颜色常量、胶囊按钮、骨架态、顶部栏和登录底部弹层。
- [src/components/books.tsx](src/components/books.tsx)：书籍封面占位、书籍列表行和批量选择状态。
- [src/components/contentFeeds.tsx](src/components/contentFeeds.tsx)：后端数据驱动的横向分页榜单和无限双列瀑布流。
- [src/components/navigation/AppNavigation.tsx](src/components/navigation/AppNavigation.tsx)：五栏底部导航和全局 Toast 动画。

## 页面

- [src/screens/HomeScreen.tsx](src/screens/HomeScreen.tsx)：书城首页、频道切换、推荐榜、双列推荐流和筛选项。
- [src/screens/BookDetailScreen.tsx](src/screens/BookDetailScreen.tsx)：书籍详情、评分、简介、书评、目录和设置弹层。
- [src/screens/ShortsScreen.tsx](src/screens/ShortsScreen.tsx)：短剧首页、热播主卡和双列推荐。
- [src/screens/discovery/DiscoveryScreens.tsx](src/screens/discovery/DiscoveryScreens.tsx)：分类、普通搜索和 AI 智能寻书页面。
- [src/screens/library/LibraryScreens.tsx](src/screens/library/LibraryScreens.tsx)：福利、书架、批量编辑和书架筛选页面。
- [src/screens/profile/ProfileScreens.tsx](src/screens/profile/ProfileScreens.tsx)：个人中心、浏览历史和用户主页。
- [src/screens/reader/ReaderScreen.tsx](src/screens/reader/ReaderScreen.tsx)：正文阅读器、控制栏、目录、笔记和阅读设置。

## 数据、服务与样式

- [src/data/books.ts](src/data/books.ts)：书籍 Mock 数据。
- [src/types.ts](src/types.ts)：`Book`、`Route` 和 `Filters` 等共享类型。
- [src/services/api.ts](src/services/api.ts)：API 地址、Token 管理和业务请求封装。
- [src/services/offline.ts](src/services/offline.ts)：Expo SQLite 初始化、章节缓存和离线队列。
- [src/styles/appStyles.ts](src/styles/appStyles.ts)：应用外壳和领域页面共享的视觉参数。
- [src/utils/contrast.ts](src/utils/contrast.ts)：根据阅读背景计算正文和弱化文本颜色。
- [src/utils/contrast.test.ts](src/utils/contrast.test.ts)：颜色对比度单元测试。

## 运行时目录

- `dist/`：Expo Web 导出结果。
- `.expo/`：Expo 缓存与本地日志。
- `node_modules/`：移动端依赖链接。

这些目录由工具生成，不应手工维护。
