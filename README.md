# Cache Keys Manager

[![GitHub Release](https://img.shields.io/GitHub/v/release/elioseverojunior/action-cache-keys)](https://github.com/elioseverojunior/action-cache-keys/releases)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Cache%20Keys%20Manager-blue?logo=GitHub)](https://github.com/marketplace/actions/cache-keys-manager)
[![License](https://img.shields.io/badge/license-MIT%20%7C%20Apache--2.0-blue)](LICENSE)

Generate standardized cache keys with automatic restore-key fallback chains for GitHub Actions. Define cache names and key templates once, and get fully resolved cache keys plus restore-key chains for every entry.

## Features

- **Built-in templates** for popular ecosystems: `rustup`, `cargo-registry`, `cargo-build`, `node-modules` — no manual key crafting needed
- **Custom key templates** with variables (`{os}`, `{arch}`) and runtime-resolved values via YAML/TOML/JSON config
- **Automatic restore-key chains** — each cache entry gets a prioritized fallback list for partial cache hits
- **Zero-config defaults** — sensible keys out of the box for built-in types

<!-- action-docs-inputs source="action.yml" -->

## Inputs

| name     | description                                                                                                                                                                                                 | required | default              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- |
| `config` | <p>JSON, YAML, or TOML object mapping cache names to template configs. Built-in types: rustup, cargo-registry, cargo-build, node-modules. Example: {"rustup":{},"my-cache":{"key":"myapp-{os}-{arch}"}}</p> | `true`   | `""`                 |
| `os`     | <p>Runner OS</p>                                                                                                                                                                                            | `false`  | `${{ runner.os }}`   |
| `arch`   | <p>Runner OS</p>                                                                                                                                                                                            | `false`  | `${{ runner.arch }}` |

<!-- action-docs-inputs source="action.yml" -->

<!-- action-docs-outputs source="action.yml" -->

## Outputs

| name                          | description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| `rustup-key`                  | <p>Generated cache key for 'rustup' built-in</p>            |
| `rustup-restore-keys`         | <p>Generated restore keys for 'rustup' built-in</p>         |
| `cargo-registry-key`          | <p>Generated cache key for 'cargo-registry' built-in</p>    |
| `cargo-registry-restore-keys` | <p>Generated restore keys for 'cargo-registry' built-in</p> |
| `cargo-build-key`             | <p>Generated cache key for 'cargo-build' built-in</p>       |
| `cargo-build-restore-keys`    | <p>Generated restore keys for 'cargo-build' built-in</p>    |
| `node-modules-key`            | <p>Generated cache key for 'node-modules' built-in</p>      |
| `node-modules-restore-keys`   | <p>Generated restore keys for 'node-modules' built-in</p>   |
| `myapp-key`                   | <p>Generated cache key for 'myapp' custom template</p>      |
| `a-key`                       | <p>Generated cache key for 'a' entry</p>                    |
| `a-restore-keys`              | <p>Generated restore keys for 'a' entry</p>                 |
| `b-key`                       | <p>Generated cache key for 'b' entry</p>                    |
| `b-restore-keys`              | <p>Generated restore keys for 'b' entry</p>                 |
| `my-cache-key`                | <p>Generated cache key for 'my-cache' entry</p>             |
| `my-cache-restore-keys`       | <p>Generated restore keys for 'my-cache' entry</p>          |
| `custom-cache-key`            | <p>Generated cache key for 'custom-cache' entry</p>         |
| `custom-cache-restore-keys`   | <p>Generated restore keys for 'custom-cache' entry</p>      |
| `os-arch-key`                 | <p>Generated cache key for 'os-arch' entry</p>              |
| `os-arch-restore-keys`        | <p>Generated restore keys for 'os-arch' entry</p>           |
| `special-key`                 | <p>Generated cache key for 'special' entry</p>              |
| `special-restore-keys`        | <p>Generated restore keys for 'special' entry</p>           |
| `os`                          | <p>Resolved OS value</p>                                    |
| `arch`                        | <p>Resolved architecture value</p>                          |

<!-- action-docs-outputs source="action.yml" -->

<!-- action-docs-runs source="action.yml" -->

## Runs

This action is a `node24` action.
<!-- action-docs-runs source="action.yml" -->

<!-- action-docs-usage source="action.yml" -->

## Usage

```yaml
- uses: @
  with:
    config:
    # JSON, YAML, or TOML object mapping cache names to template configs. Built-in types: rustup, cargo-registry, cargo-build, node-modules. Example: {"rustup":{},"my-cache":{"key":"myapp-{os}-{arch}"}}
    #
    # Required: true
    # Default: ""

    os:
    # Runner OS
    #
    # Required: false
    # Default: ${{ runner.os }}

    arch:
    # Runner OS
    #
    # Required: false
    # Default: ${{ runner.arch }}
```

<!-- action-docs-usage source="action.yml" -->

## License

Dual-licensed under [MIT](LICENSES/MIT) or [Apache 2.0](LICENSES/Apache-2.0) at your option. See [LICENSE](LICENSE) for details.
