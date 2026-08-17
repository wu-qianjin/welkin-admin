# AGENTS.md — welkin-admin

Fork of [soybean-admin](https://github.com/soybeanjs/soybean-admin) (MIT) maintained as "Welkin". Vue 3 + Vite 8 + TypeScript + NaiveUI + UnoCSS admin template, pnpm monorepo. Node >= 20.19.0, pnpm >= 10.5.0.

## Branches (critical to know before any edit)

- `main` — streamlined Welkin fork: only home + login pages, no manage pages. Workspace packages are named **`@welkin/*`**.
- `example` (current) — full-featured branch from upstream soybean-admin: manage (user/role/menu), alova samples, plugin demos. Workspace packages are named **`@sa/*`**.
- **Porting code between `main` and `example` requires rewriting all `@welkin/*` ↔ `@sa/*` imports.**
- After switching branches, `node_modules/` can hold the wrong workspace packages: delete `node_modules/` and `packages/*/node_modules/`, then `pnpm install`, or Vite crashes with `Cannot find module '@sa/uno-preset'` (or `@welkin/*`).

## Commands

- `pnpm dev` — dev server on port **9527** (mode: test, backend = Apifox mock). `pnpm dev:prod` for prod mode.
- `pnpm typecheck` — `vue-tsc --noEmit --skipLibCheck`
- `pnpm lint` — `oxlint --fix && eslint --fix .`; `pnpm fmt` — `oxfmt`
- `pnpm build` / `pnpm build:test` — vite build (prod/test mode)
- `pnpm gen-route` — regenerate elegant-router files; **do not hand-edit `src/router/elegant/*.ts`** (routes are derived from `src/views` structure)
- No test suite exists in this repo.

## Monorepo layout

- `packages/` — `alova`, `axios`, `color`, `hooks`, `materials`, `scripts`, `uno-preset`, `utils` (named `@sa/*` on this branch)
- `src/views/` — pages; `src/router/` — elegant-router generated routes + guards
- `src/service/` — axios-based API layer; `src/service-alova/` — alova client with local mocks (`src/service-alova/mocks`)
- `src/locales/langs/` — i18n (`zh-cn.ts`, `en-us.ts`); `src/typings/` — global types incl. i18n Schema
- Backend is the soybean-admin Apifox mock; business codes live in `.env` (`VITE_SERVICE_SUCCESS_CODE=0000`, logout/expired-token codes).

## Conventions

- **i18n**: every new key must be added to BOTH `src/locales/langs/zh-cn.ts` and `en-us.ts`, AND to `src/typings/app.d.ts` (`namespace I18n` → `type Schema`) in the same change — keys are type-derived via `GetI18nKey<Schema>`. Login keys follow `page.login.{common|pwdLogin|codeLogin|register|resetPwd|bindWeChat|banner}.*`.
- Brand strings: zh title `Welkin 管理系统`, en title `WelkinAdmin`; watermark default `WelkinAdmin`. No ICP footer / real social login — those UI bits are placeholders.

## Commit / pre-commit gotchas

- `simple-git-hooks` pre-commit runs `pnpm typecheck && pnpm lint && pnpm fmt && git diff --exit-code`; commit-msg runs `pnpm sa git-commit-verify` (conventional commits).
- `package.json` must stay valid strict JSON — a trailing comma breaks every pnpm invocation inside the hook.
- `lint --fix` / `fmt` can rewrite staged files mid-commit, failing the `git diff --exit-code` check — re-`git add` and retry.
- `pnpm-lock.yaml` is intentionally not committed (upstream convention).
