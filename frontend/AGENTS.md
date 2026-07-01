# AGENTS.md

## 项目定位

本目录是 `sports-lottery-website` 前端项目，定位为体育彩票投注记录管理系统的 Vue 单页应用。

当前真实技术栈以源码和配置为准：

- Vue 3 + TypeScript + Vite 5
- Vue Router 4、Pinia
- Element Plus、Element Plus Icons
- Axios、dayjs、lodash-es
- ECharts / vue-echarts、FullCalendar
- Tailwind CSS 已接入，但配置需要以当前 `tailwind.config.js` 为准

不要按 Next.js 项目处理。根目录存在 `next.config.js`，但当前入口、依赖和构建链路都是 Vite + Vue。

## 工作原则

- 修改前先阅读真实代码路径，不要只依赖历史文档或猜测。
- 保持小范围、易审查的 diff；除非用户明确要求，不做大规模重构。
- 优先沿用项目现有分层：
  - 页面级组件在 `src/views/`
  - 复用组件在 `src/components/`
  - 状态模块在 `src/stores/`
  - 请求封装在 `src/utils/api.ts`
  - 共享类型在 `src/types/index.ts`
- 不要凭空新增接口、配置文件或目录；不确定时先用 `rg` 搜索。
- 不要改动无关文件，尤其不要顺手整理生成文件或历史遗留配置。
- 如果发现工作区已有他人修改，先保留并绕开；不要回滚用户改动。

## 常用命令

执行命令前先说明命令和原因。

- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 生产构建：`npm run build`
- 本地预览：`npm run preview`
- 代码检查：`npm run lint`

注意：

- 当前 `package.json` 中 `build` 是 `vite build`。
- 当前 `vite.config.ts` 中开发服务端口是 `80`，并且 `open: true`。
- `npm run lint` 带 `--fix`，会修改文件；运行前必须确认这是用户可接受的。
- 当前没有独立测试脚本。功能改动优先跑最快相关检查，通常是 `npm run build`；UI/交互改动还需要手动或浏览器验证关键页面。

## API 与数据约定

- 统一使用 `src/utils/api.ts` 中的 Axios 实例，不要绕过拦截器新建重复客户端。
- `api` 响应拦截器返回的是 `response.data`，调用方应按后端统一结构读取 `res.code`、`res.data`、`res.message`。
- 后端成功码按当前代码约定为 `res.code === 200`。
- `baseURL` 优先读取 `VITE_API_BASE_URL`，未配置时为 `/api`。
- Vite 代理中 `/api` 转发到 `http://localhost:8080`，当前没有 rewrite；不要把前端请求路径里的 `/api` 或业务路径凭空改掉。
- 登录 token 存在 `localStorage`，请求拦截器会追加 `Authorization: Bearer <token>`。
- `401` 会清理登录信息并跳转 `/login`；不要在业务页面重复实现一套全局鉴权处理。

## 业务模块注意事项

- 路由入口在 `src/router/index.ts`，受保护页面通过 `meta.requiresAuth` 和路由守卫控制。
- 登录状态在 `src/stores/auth.ts`，登录走 `loginApi('/user/login')`；注册逻辑当前仍是模拟实现，接入真实接口前要先确认后端路由和响应结构。
- 投注记录页面是 `src/views/Records.vue`：
  - 页面事件进入 `src/stores/records.ts`。
  - 单条新增、编辑、删除当前走 `/betting/records`、`/betting/records/{id}`。
  - store 内有前后端字段转换，例如 `date -> betDate`、`actualWinning -> actualWinnings`、中文结果与数字状态映射。
  - 批量新增当前仍包含本地 `mockRecords` 逻辑；修改前必须确认用户期望是继续本地处理还是接入真实批量接口。
- 推荐记录页面是 `src/views/RecommendRecords.vue`：
  - 当前页面直接调用 `api` 请求 `/recommend/records` 和 `/recommend/recommenders`。
  - 不要擅自把它迁移到 Pinia，除非任务需要。
- 表格分页修改后，优先保持当前页刷新语义，不要只在本地数组中乐观修改，除非用户明确要求。

## UI 与样式规范

- 后台管理界面优先使用 Element Plus 组件和 Element Plus Icons。
- 页面保持现有紧凑后台风格：搜索区、表格区、分页区清晰分层。
- 新增页面级样式优先使用 `<style scoped>`，避免污染全局。
- 路径别名使用 `@/` 指向 `src/`。
- 自动导入由 `unplugin-auto-import` 和 `unplugin-vue-components` 处理；不要手动编辑 `auto-imports.d.ts`、`components.d.ts`，除非是明确处理生成文件问题。
- Tailwind 已接入，但 `tailwind.config.js` 的扫描路径可能未覆盖 `src`；依赖新增 Tailwind 类名前先核对配置。

## 类型与错误处理

- 优先补充或复用 `src/types/index.ts` 中的类型。
- 避免新增 `any`；如果必须使用，限定在接口边界并尽快转换为明确类型。
- 接口错误要返回或展示明确失败原因，优先使用后端 `res.message`。
- 不要吞掉异常后让 UI 显示成功状态。
- 表单数据提交前要处理前后端字段差异，不要把中文展示值直接假定为后端 DTO。

## 安全与配置

- 不要把 `.env.development`、`.env.production`、token、私钥、账号密码或任何凭证内容复制到代码、日志、文档或回复中。
- 如需敏感信息，让用户通过环境变量提供。
- 除非用户明确要求，不要新增 analytics、telemetry 或额外网络请求。
- 不要在控制台打印 token、完整请求头或包含个人信息的响应。

## 调试与验证

调试问题时按这个顺序输出和执行：

- Hypotheses：先列可能原因。
- Experiments：说明已读文件、已执行命令、观察到的证据。
- Minimal Fix：给出影响最小的修复方案。

常见排查路径：

- 页面按钮无效：先查 `views` 事件，再查 `components` emit，再查 `stores` 或 `utils/api.ts`。
- 接口没打到后端：确认 `api` baseURL、Vite `/api` 代理、浏览器实际请求路径、后端真实路由。
- 构建失败：先确认是否是 TypeScript、Vite、依赖或生成文件问题；不要直接大面积清理代码。
- 中文显示异常：用 UTF-8 读取文件确认，不要直接判断文件损坏。

## 输出要求

代码修改完成后，回复应包含：

- 简短修改摘要。
- 修改过的文件列表。
- 实际执行过的验证命令；如果未运行验证，说明原因。

文档类修改通常不需要运行构建，但仍需复核文件内容和 git diff。
