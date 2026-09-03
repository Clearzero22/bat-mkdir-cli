# API — bat-mkdir-cli

Programmatic usage (ESM):

```js
import { mkdir, catFiles, initProject, highlightLine, getLanguage, expandPath } from 'bat-mkdir-cli';
import { mkdir } from 'bat-mkdir-cli/src/mkdir.js';
```

## `mkdir(dirs, opts)`

- `dirs: string[]`
- `opts: { verbose?: boolean, mode?: string, dryRun?: boolean }`
- returns `Promise<Array<{path, created, alreadyExists, error?}>>`

## `catFiles(files, opts)`

- `files: string[]`
- `opts: { number?: boolean, plain?: boolean, showHeader?: boolean, encoding?: string, silent?: boolean }`
- returns `Promise<Array<{file, content, rendered, lines, lang}>>`
- writes to stdout unless `silent:true`

## `initProject(dir, opts)`

- `dir: string`
- `opts: { template?: string, name?: string, force?: boolean, verbose?: boolean }`
- returns `Promise<{dest, template, name, files}>`

## `highlightLine(line, lang, opts)`

Lightweight highlighter, `lang` ∈ `js|py|json|md|...`

## `getLanguage(filePath)`

Detect language by extension.

## `expandPath(p)`

Expand `~` and env vars.

## Errors

All async APIs throw with descriptive messages; `mkdir`/`catFiles` have `throwOnError` opt to control.
