{
  "name": "{{name}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "type": "module",
  "bin": {
    "{{name}}": "./bin/cli.js"
  },
  "scripts": {
    "start": "node bin/cli.js --help",
    "test": "vitest run",
    "bench": "node bench/bench.js"
  },
  "keywords": ["cli"],
  "author": "{{author}}",
  "license": "MIT",
  "dependencies": {
    "commander": "^12.1.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "vitest": "^2.1.8"
  },
  "engines": {
    "node": ">=18"
  }
}
