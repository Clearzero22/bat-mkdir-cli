# Benchmark — bat-mkdir-cli

> 运行环境：Windows 11, Node v24.11.1, Intel i7, `node bench/bench.js`  
> 日期：2026-09-03  
> 命令：`npm run bench` / `bat bench`

## 1. 测试项

| 测试 | 次数 | 描述 |
|------|------|------|
| mkdir | 1000x | 嵌套 `a/b/c` 递归创建（`fs.mkdir {recursive:true}`） |
| cat highlight | 20x | 1.07 MB / 75k 行 JS 文件，高亮+行号 |
| cat plain | 20x | 同文件，`--plain` 无高亮 |
| utils | 100k x | `expandPath` + `getLanguage` + `highlightLine` |

## 2. 实测结果（本机）

```
=== bat-mkdir-cli bench ===

mkdir 1000x nested (a/b/c): 889.5 ms (0.89 ms/op)

big file size: 1.07 MB (75001 lines)
cat highlight 20x 1MB: 8621.7 ms (431.08 ms/op, 2.5 MB/s)
cat plain     20x 1MB: 262.5 ms (13.13 ms/op)

utils 100000x expand+lang+highlight: 699.2 ms (6.99 µs/op)

--- total: 10472.9 ms ---
✔ cat highlight performance OK (<500ms/op)
```

### 解读

- **mkdir**：平均 <1ms/次，`mkdir -p` 语义，递归安全，符合预期（阈值 <2ms/op）
- **cat highlight**：含正则高亮（字符串/数字/关键字/注释）+ 行号着色，`431ms / 1.07MB ≈ 2.5 MB/s`，阈值 <500ms/op 通过
- **cat plain**：13ms/op，快 33 倍，证明高亮是主要开销，符合设计
- **utils**：7µs/op，极轻量

## 3. 打包体积

```sh
npm pack --dry-run
# package size: 9.7 kB, unpacked: 26.4 kB, 18 files
# 仅依赖 chalk@5.3 + commander@12.1，无原生模块
```

## 4. 复现

```sh
npm install
npm test        # 21 tests
npm run bench   # 或 bat bench
npm pack --dry-run
```

> 不同机器结果会有波动，但 `mkdir <2ms/op` 且 `cat highlight <500ms/op` 为 CI 门禁。
