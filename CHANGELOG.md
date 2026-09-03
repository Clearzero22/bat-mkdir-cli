# Changelog

## 0.1.1 (2026-09-03)
- fix: 规范化 `bin` 路径 `bin/cli.js`，消除 `npm publish` 自动校正警告
- chore: bump version, 同步 GitHub release

## 0.1.0 (2026-09-03)
- feat: 初始发布
  - `bat cat` / `bat <file>` — 行号+语法高亮（JS/TS/Py/JSON/MD/YAML/Shell）
  - `bat mkdir -v/--dry-run/-m` — `mkdir -p` 跨平台，支持 `~` 展开
  - `bat init <dir> -t basic|node-cli` — 项目脚手架，模板变量渲染
  - `bat templates` / `bat bench`
  - 3 bins: `bat`, `bat-mkdir`, `bmk`
  - 文档：README(中英)、USAGE、API、BENCHMARK
  - 测试：21 tests (vitest) 全部通过
  - 性能：bench 门禁通过，9.7kB pack
  - 发布：npm `bat-mkdir-cli@0.1.0` + GitHub `Clearzero22/bat-mkdir-cli` via `gh`
