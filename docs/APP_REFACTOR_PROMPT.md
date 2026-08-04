# Codex Prompt：移动端入口模块化重构

你是负责维护 Expo + React Native 应用的资深工程师。请在不改变任何 UI、交互、路由语义、接口调用或 Mock 数据的前提下，将 `apps/mobile/App.tsx` 从单文件实现重构为按领域分组的模块。

## 重构目标

- `App.tsx` 只负责应用级状态、路由选择、登录拦截和页面装配。
- 底部导航、Toast 等应用外壳组件放入 `src/components/navigation/`。
- 分类、搜索、AI 搜索放入 `src/screens/discovery/`。
- 福利、书架、筛选放入 `src/screens/library/`。
- 个人中心、历史、用户主页放入 `src/screens/profile/`。
- 阅读器及其面板放入 `src/screens/reader/`。
- 各领域使用自己的 `styles.ts`，禁止重新形成单个巨型共享样式文件。
- 所有代码使用正常缩进和折行；为模块职责、复杂状态或副作用添加简短中文注释，不为显而易见的 JSX 逐行注释。

## 约束

1. 不改变已有组件文案、样式数值、动画时长、页面顺序或按钮行为。
2. 不修改 API、数据库、数据模型和现有 Home/BookDetail/Shorts 页面实现。
3. 不新增运行时依赖，不使用循环依赖。
4. 保留用户已有未提交改动，不执行 commit、push、reset 或 clean。
5. App 入口目标控制在约 150 行以内，单个领域文件尽量控制在 300 行以内。

## 验证

- 运行 `tsc --noEmit`、Vitest 和 Expo Web export。
- 执行 `git diff --check`。
- 在 430×844 视口检查首页首屏，并至少验证一次底部 Tab 切换和一次搜索/分类入口，确保重构前后无视觉或交互回归。
