<div align="center">
	<img src="./public/favicon.svg" width="160" />
	<h1>WelkinAdmin</h1>
  <span><a href="./README.md">中文</a> | English</span>
</div>

<div align="center">

[![license](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

</div>

# WelkinAdmin

`WelkinAdmin` is a clean, elegant, and powerful admin platform built with [Vue3](https://vuejs.org), [Vite](https://vitejs.dev), [TypeScript](https://www.typescriptlang.org), [Pinia](https://pinia.vuejs.org), [Naive UI](https://www.naiveui.com) and [UnoCSS](https://unocss.dev). It ships with rich theme presets, strict code conventions, an automated file-based router, and a ready-to-use project scaffold. The `example` branch is the full-featured edition, including system management (user/role/menu), monitoring pages, and a rich set of plugin demos.

> **This project is forked from [soybean-admin](https://github.com/soybeanjs/soybean-admin) under the MIT License.** In accordance with the MIT terms, the original copyright notice is preserved in [`LICENSE`](./LICENSE) and acknowledgement is listed below. If you reuse the code, please retain the license and the original attribution.

## Features

- **Modern stack**: Vue 3 + Vite + TypeScript + Pinia + Naive UI + UnoCSS with full TypeScript hints and instant HMR.
- **Clear architecture**: pnpm monorepo with a clean, easy-to-follow layout.
- **Strict code style**: oxlint / oxfmt / simple-git-hooks keep the codebase consistent.
- **Automated file routing**: routes are auto-generated, imported and typed via [Elegant Router](https://github.com/soybeanjs/elegant-router).
- **Flexible permission routing**: supports both static and dynamic route modes.
- **Rich theming**: multiple theme presets, deeply integrated with UnoCSS, plus watermark / tab / layout mode controls.
- **Built-in i18n**: multi-language support out of the box via `vue-i18n`.
- **Rich components**: 403 / 404 / 500 pages, plus layout, tab, theme drawer, and table components.
- **Unified HTTP layer**: wrappers around `alova` / `axios` with token refresh, error code handling, retry and mock.
- **Complete business examples**: system management (user/role/menu/dict), monitoring dashboards, and 20+ plugin demos such as barcode, gantt and print.

## Quick Start

Requirements: **Node.js >= 20.19.0**, **pnpm >= 10.5.0**.

```bash
# 1. Install dependencies
pnpm install

# 2. Start the dev server
pnpm dev

# 3. Build for production
pnpm build

# 4. Preview the production build
pnpm preview
```

> The dev server uses the mock base URL in `.env.test`. To integrate with your own backend, update `VITE_SERVICE_BASE_URL` in `.env.prod`.

## Project Structure

```
welkin-admin/
├── build/                # Vite / UnoCSS custom plugins
├── mock/                 # local mock service (dev-mode middleware)
├── packages/             # Internal packages (@sa/*)
│   ├── alova/            #   alova request wrapper
│   ├── axios/            #   axios request wrapper
│   ├── color/            #   color utilities
│   ├── hooks/            #   composables
│   ├── materials/        #   business component library
│   ├── scripts/          #   CLI tool (sa)
│   ├── uno-preset/       #   UnoCSS preset
│   └── utils/            #   general utilities
├── public/               # static assets (not bundled)
├── scripts/              # seed scripts (menus / dicts)
├── src/                  # main app
│   ├── assets/           #   images & styles
│   ├── components/       #   shared components
│   ├── layouts/          #   layout components
│   ├── locales/          #   i18n messages
│   ├── router/           #   router & guards
│   ├── service/          #   API wrappers
│   ├── store/            #   pinia stores
│   ├── typings/          #   global types
│   └── views/            #   pages (home / system / monitor / plugin ...)
├── .env / .env.test / .env.prod
├── index.html
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── uno.config.ts
└── vite.config.ts
```

## CLI

The `sa` command bundles common housekeeping tasks:

```bash
pnpm sa cleanup         # remove example pages / routes / menus
pnpm sa gen-route       # regenerate routes
pnpm sa git-commit      # conventional git commit
pnpm sa release         # release a new version
pnpm sa update-pkg      # upgrade dependencies
```

## Acknowledgements

This project stands on the shoulders of these open-source projects — thank you to the original authors:

- [soybean-admin](https://github.com/soybeanjs/soybean-admin) — the original project, MIT License.
- [Vue](https://github.com/vuejs/core) — the progressive JavaScript framework.
- [Vite](https://github.com/vitejs/vite) — the next-generation frontend build tool.
- [Naive UI](https://github.com/tusen-ai/naiveui) — Vue 3 component library.
- [Pinia](https://github.com/vuejs/pinia) — the official Vue state management library.
- [UnoCSS](https://github.com/unocss/unocss) — the instant on-demand atomic CSS engine.
- [Elegant Router](https://github.com/soybeanjs/elegant-router) — file-based router generator.
- [Alova](https://github.com/alovajs/alova) / [axios](https://github.com/axios/axios) — HTTP clients.

## License

Released under the [MIT License](./LICENSE). See `LICENSE` for the original copyright notice.
