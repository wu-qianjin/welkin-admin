<div align="center">
	<img src="./public/favicon.svg" width="160" />
	<h1>WelkinAdmin</h1>
  <span>中文 | <a href="./README.en_US.md">English</a></span>
</div>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

</div>

# WelkinAdmin

`WelkinAdmin` 是一个清新优雅的中后台管理平台，基于 [Vue3](https://vuejs.org)、[Vite](https://vitejs.dev)、[TypeScript](https://www.typescriptlang.org)、[Pinia](https://pinia.vuejs.org)、[Naive UI](https://www.naiveui.com) 和 [UnoCSS](https://unocss.dev) 构建。它内置丰富的主题配置与组件、严谨的代码规范、自动化文件路由系统，并提供开箱即用的项目脚手架。`example` 分支为全功能版本，包含系统管理（用户/角色/菜单）、监控、示例页面与丰富的插件演示。

> **本项目基于 [soybean-admin](https://github.com/soybeanjs/soybean-admin) (MIT License) 二次开发。** 依据 MIT 协议,我们在 `LICENSE` 中保留了原始版权声明,并在本文档下方列出致谢。如需在自己的项目中使用,请保留协议与原作者署名。

## 特性

- **现代技术栈**:Vue3 + Vite + TypeScript + Pinia + Naive UI + UnoCSS,享受完整的类型提示与极速 HMR。
- **清晰的项目架构**:采用 pnpm monorepo 架构,结构清晰、优雅易懂。
- **严格的代码规范**:集成 oxlint / oxfmt / simple-git-hooks,统一风格与提交规范。
- **自动化文件路由系统**:自动生成路由导入、声明和类型,基于 [Elegant Router](https://github.com/soybeanjs/elegant-router)。
- **灵活的权限路由**:同时支持前端静态路由与后端动态路由。
- **丰富的主题配置**:内置多套主题预设,与 UnoCSS 完美结合,支持水印、标签栏、布局模式等细节定制。
- **内置国际化方案**:基于 `vue-i18n`,轻松实现多语言支持。
- **丰富的页面组件**:内置 403 / 404 / 500 页面,以及布局、标签、主题配置等组件。
- **请求层封装**:基于 `alova` / `axios` 的统一请求方案,内置 token 刷新、错误码处理、重试与 Mock。
- **完整的业务示例**:系统管理（用户/角色/菜单/字典）、监控大盘,以及 barcode、gantt、print 等 20+ 插件演示。

## 快速开始

环境要求:**Node.js >= 20.19.0**、**pnpm >= 10.5.0**。

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发服务
pnpm dev

# 3. 构建生产产物
pnpm build

# 4. 预览构建产物
pnpm preview
```

> 默认会读取 `.env.test` 中的 mock 服务地址。如需对接自有后端,修改 `.env.prod` 中的 `VITE_SERVICE_BASE_URL` 即可。

## 项目结构

```
welkin-admin/
├── build/                # Vite / UnoCSS 自定义插件
├── mock/                 # 本地 mock 服务 (开发模式中间件)
├── packages/             # 子包 (@sa/*)
│   ├── alova/            #   alova 请求封装
│   ├── axios/            #   axios 请求封装
│   ├── color/            #   颜色工具
│   ├── hooks/            #   组合式函数
│   ├── materials/        #   业务组件库
│   ├── scripts/          #   命令行工具 (sa)
│   ├── uno-preset/       #   UnoCSS 预设
│   └── utils/            #   通用工具
├── public/               # 静态资源 (不经打包)
├── scripts/              # 数据种子脚本 (菜单 / 字典)
├── src/                  # 主应用
│   ├── assets/           #   图片与样式
│   ├── components/       #   公共组件
│   ├── layouts/          #   布局组件
│   ├── locales/          #   国际化文案
│   ├── router/           #   路由与守卫
│   ├── service/          #   API 封装
│   ├── store/            #   Pinia 状态
│   ├── typings/          #   全局类型
│   └── views/            #   页面 (home / system / monitor / plugin 等)
├── .env / .env.test / .env.prod
├── index.html
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── uno.config.ts
└── vite.config.ts
```

## 命令行工具

仓库内置的 `sa` 命令提供以下能力:

```bash
pnpm sa cleanup         # 清理示例页面/路由/菜单
pnpm sa gen-route       # 重新生成路由
pnpm sa git-commit      # 规范化 git 提交
pnpm sa release         # 一键发布版本
pnpm sa update-pkg      # 升级依赖
```

## 致谢 / Acknowledgements

本项目基于以下开源项目构建,感谢原作者的无私贡献:

- [soybean-admin](https://github.com/soybeanjs/soybean-admin) — 原始项目,MIT License。
- [Vue](https://github.com/vuejs/core) — 渐进式 JavaScript 框架。
- [Vite](https://github.com/vitejs/vite) — 下一代前端构建工具。
- [Naive UI](https://github.com/tusen-ai/naiveui) — Vue 3 组件库。
- [Pinia](https://github.com/vuejs/pinia) — Vue 官方状态管理。
- [UnoCSS](https://github.com/unocss/unocss) — 即时按需原子化 CSS 引擎。
- [Elegant Router](https://github.com/soybeanjs/elegant-router) — 文件路由生成器。
- [Alova](https://github.com/alovajs/alova) / [axios](https://github.com/axios/axios) — HTTP 客户端。

## License

本项目遵循 [MIT License](./LICENSE)。原始版权信息见 `LICENSE` 文件。
