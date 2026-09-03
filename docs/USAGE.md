# Usage Guide — bat-mkdir-cli

## Installation

```sh
npm i -g bat-mkdir-cli
bat --help
```

Bins: `bat`, `bat-mkdir`, `bmk`

## Commands

### `bat cat <files...>`

Display files with highlighting.

Options:
- `-n, --number` (default true) — show line numbers
- `--no-number` — hide numbers
- `--plain` — disable colors
- `--header` / `--no-header` — control file header

Examples:
```sh
bat README.md
bat cat src/*.js
bat --plain package.json | grep name
```

### `bat mkdir <dirs...>`

Create directories recursively (mkdir -p semantics).

- `-v, --verbose` — log created/exists
- `--dry-run` — preview without FS changes
- `-m, --mode <octal>` — chmod mode e.g. 755
- `-p, --parents` — always recursive (default true)

Examples:
```sh
bat mkdir -v a/b/c d/e
bat mkdir --dry-run tmp/test
```

Cross-platform: expands `~`, `%VAR%`, `$VAR`.

### `bat init <dir>`

Scaffold project.

Options:
- `-t, --template <name>` — `basic` (default) or `node-cli`
- `--name <name>` — override package name
- `-f, --force` — overwrite non-empty dir
- `-v, --verbose`

```sh
bat init hello --template basic
bat init my-cli -t node-cli -v
bat templates
```

### `bat bench`

Run micro-benchmarks (mkdir, cat highlight, utils).

## Environment

- Node >=18
- No native deps, pure ESM
