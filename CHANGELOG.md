# Changelog

All notable changes to **WelkinAdmin** are documented in this file.

WelkinAdmin is a fork of [soybean-admin](https://github.com/soybeanjs/soybean-admin) (MIT). The history before `0.1.0` belongs to the upstream project — see its repository for the full record.

## [0.1.0] - Initial fork

### Changed

- Renamed project to `welkin-admin`; updated `package.json`, env files, footer, watermark defaults, and component identifiers (`SoybeanAvatar` → `WelkinAvatar`).
- Replaced `README.md` and `README.en_US.md` with project-specific documentation while preserving MIT attribution.
- Updated issue templates to point to the new repository.
- Removed upstream changelog files.

### Example branch

- Ported the same branding cleanup to the `example` branch: app title / description / storage prefix (`WELKIN_`), watermark presets, about-page introduction, project news, plugin demo texts, `welkin-avatar` component, `preset-welkin-admin` UnoCSS preset, CLI name (`welkin-admin`), mock tokens, and package metadata.
- Removed upstream-specific document routes (project docs iframe / external link, promo video) from the static routes.
