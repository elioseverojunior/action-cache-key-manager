# AGENTS.md

## Toolchain

- **Runtime/Package mgr**: Bun (managed by mise). `bun.lock` is lockfile.
- **Config**: `mise.toml` manages tools/bun + env (`GITHUB_TOKEN` sourced via `gh auth token`, mise-only).
- **TypeScript**: `tsc -p tsconfig.base.json --noEmit` for typechecking (strict mode). _Note: `tsconfig.json` has `"include": []` — run against `tsconfig.base.json` directly._ Test files excluded via `tsconfig.base.json`.

## Commands (run in this order before commit)

```sh
bun run fix:all
bun run typecheck
bun run test
```

Use `mise run` to invoke tasks defined in `mise.toml` (e.g. `mise run uap` to update action pinning).

## Testing

- **Framework**: Bun built-in test runner.
- **Files**: `**/*.test.ts` alongside source (e.g. `src/foo.test.ts`).
- **Coverage gate**: `bunfig.toml` enforces 100% lines/functions/statements for all files in `src/`, excluding `**/bin/**`, `**/__tests__/**`, `**/integration-*/**`.
- **Run single test**: `bun test src/path/to/file.test.ts`.

## Development Workflow

### Mandatory: TDD

1. Write test first (red).
2. Write minimal code to pass (green).
3. Refactor while keeping green.

### Principles

- **100% coverage** at all times.
- **TDD** for new code AND when refactoring existing code (test first, then refactor).
- **KISS/DRY/YAGNI/TDA/SOLID** — apply what fits, don't over-engineer.

## Architecture

- **Entrypoint**: `src/index.ts` — GitHub Action entrypoint. Builds to `dist/action/index.js`.
- **Build**: `bun run build:action` (or `bun build src/index.ts --outdir dist/action --target node --external none --outfile index.js`)
- **Source layout**:
  - `src/core.ts` — template engine (parse, render, restore-key generation)
  - `src/config.ts` — config parser + built-in templates (rustup, cargo-registry, cargo-build, node-modules)
  - `src/builder.ts` — fluent `CacheKeyBuilder` / `CacheKeySetBuilder`
  - `src/*.test.ts` — co-located tests (excluded from tsc via tsconfig.base.json)

## GitHub Actions

- **Pin to commit SHA**: All `uses:` references in `.github/workflows/*.yml` and `.github/actions/*/action.yml` MUST use the full commit SHA of the release tag (e.g. `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`). Never use `@v{major}` or `@v{major}.{minor}` tag annotations — they are mutable and undermine supply-chain security. The comment after the pin documents the SemVer for human readability.
- **Name every job and step in Title Case**: Every `jobs:` and `steps:` entry MUST have a `name:` key using Title Case (e.g., `Setup`, `Lint`, `Build Action`, `Run Tests`). Separate job properties from `steps:` with an empty line.
- **Use `gh` CLI to inspect runs**: `gh run view <run-id>`, `gh run view <run-id> --log-failed`, `gh run list`.

## Code Style

- **ESLint**: Flat config v9+, strict TS rules. `explicit-function-return-type: error`, `no-explicit-any: error` (relaxed in test files).
- **Imports**: `import-x/order` enforced — builtin → external → internal → parent → sibling. `bun:` prefixed to external. Blank lines between groups.
- **Format**: Prettier with `prettier-plugin-organize-imports`. Double quotes, trailing commas, 80-width.
- **Fluent Builder pattern**: prefer chained builder methods with a terminal `.build()` call over large constructors.
- **No `console.log` restriction** (off by config).
- **Unused vars**: `error` (prefix with `_` to ignore).
