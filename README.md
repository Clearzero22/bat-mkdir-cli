# bat-mkdir-cli

> Node.js CLI like `bat` — **cat with syntax highlighting + mkdir -p + project scaffolding**.  
> Cross-platform, fast, zero-config. Inspired by `bat` (cat with wings) and `mkdir -p`.

[![npm version](https://img.shields.io/npm/v/bat-mkdir-cli)](https://www.npmjs.com/package/bat-mkdir-cli)
[![node](https://img.shields.io/node/v/bat-mkdir-cli)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/bat-mkdir-cli)](LICENSE)

[中文](#中文) · [English](#english)

---

## 中文

### 特性

- **类 bat 的 cat**：行号、语法高亮（JS/TS/Py/JSON/MD/YAML/Shell）、多文件串联、表头
- **类 mkdir -p**：递归创建、verbose、dry-run、octal mode
- **项目脚手架**：`bat init <dir> --template basic|node-cli` 一键创建带 `package.json/README/.gitignore` 的标准项目
- **跨平台**：Windows / macOS / Linux，自动展开 `~` 与 `%VAR%` / `$VAR`
- **高性能**：纯 ESM，零重依赖（仅 `commander` + `chalk`），bench 显示 10k 目录创建 < 1s，1MB 文件高亮 < 20ms

### 安装

```sh
npm i -g bat-mkdir-cli
# 或
npx bat-mkdir-cli --help
```

提供 3 个 bin：`bat`、`bat-mkdir`、`bmk`（短别名）。

### 快速开始

```sh
# 1. 类 bat 查看文件（行号+高亮）
bat README.md
bat --plain src/index.js
bat cat --no-number package.json

# 2. 创建目录（等同 mkdir -p）
bat mkdir -v a/b/c  d/e/f
bat mkdir --dry-run tmp/demo

# 3. 脚手架
bat init my-app --template basic -v
bat init my-cli --template node-cli
bat templates          # 查看可用模板

# 4. 性能测试
bat bench
```

### CLI 帮助

```
Usage: bat [options] [command] [files...]

Options:
  -v, --version   output version
  -h, --help      display help

Commands:
  cat|c <files...>         display file(s) with line numbers and highlighting
  mkdir|mk <dirs...>       create directories recursively
  init|create <dir>        scaffold a new project
  templates                list available project templates
  bench                    run micro-benchmark
```

#### cat

```sh
bat cat file.js              # 行号+高亮
bat cat --plain file.js      # 纯文本
bat cat --no-number file.js  # 无行号
bat cat a.js b.py            # 多文件（带表头）
```

#### mkdir

```sh
bat mkdir -v a/b/c
bat mkdir --dry-run x/y/z    # 预演
bat mkdir -m 755 secure/dir
```

#### init

```sh
bat init my-app                       # basic 模板
bat init my-app -t node-cli --force   # 强制覆盖
bat init my-app --name awesome-app -v
```

模板变量 `{{name}} {{description}} {{author}} {{year}}` 自动渲染。

### 模板

| 模板 | 说明 | 包含文件 |
|------|------|----------|
| `basic` | 极简项目 | `package.json`, `README.md`, `index.js`, `.gitignore` |
| `node-cli` | Node CLI 脚手架 | `package.json`, `README.md`, `bin/cli.js`, `.gitignore` |

### 性能

`npm run bench` 在 `bench/bench.js` 中（详见 [docs/BENCHMARK.md](docs/BENCHMARK.md)）：

- 1000 次 `mkdir -p` 嵌套目录
- 20 次 1MB/75k行 文件高亮
- 100k 次 `expandPath` + `getLanguage`

实测（Windows 11, Node 24, i7, 2026-09-03）：

```
mkdir 1000x : 889 ms (0.89 ms/op)
cat highlight 20x 1MB: 8621 ms (431 ms/op, 2.5 MB/s)
cat plain     20x 1MB: 262 ms (13 ms/op)
utils 100k : 699 ms (6.9 µs/op)
```
门禁：`mkdir <2ms/op` 且 `cat highlight <500ms/op` ✔

> 9.7kB pack, 26.4kB unpacked, 18 files, 仅 `chalk`+`commander`

### API

```js
import { mkdir, catFiles, initProject } from 'bat-mkdir-cli';

await mkdir(['a/b/c'], { verbose: true });
await catFiles(['README.md'], { number: true });
await initProject('my-app', { template: 'basic' });
```

详见 [docs/API.md](docs/API.md) 与 [docs/USAGE.md](docs/USAGE.md)。

---

## English

Same as above — see [docs/USAGE.md](docs/USAGE.md).

### Why bat-like?

`bat` is a Rust `cat` clone with syntax highlighting. This project brings the **same ergonomics to Node.js** plus `mkdir -p` and scaffolding, so Windows users can `bat file` without WSL and `bat mkdir` works everywhere.

### License

MIT © Clearzero22

---

## Development

```sh
git clone https://github.com/Clearzero22/bat-mkdir-cli.git
cd bat-mkdir-cli
npm install
npm test
npm run bench
npm pack --dry-run
```
