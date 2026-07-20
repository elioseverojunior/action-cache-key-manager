import { load as yamlLoad } from "js-yaml";
import { parse as tomlParse } from "smol-toml";

export interface ResolvedEntry {
  name: string;
  key: string;
  restoreKeys?: string;
}

interface RawEntry {
  key?: string;
  "restore-keys"?: string;
}

interface BuiltinTemplate {
  key: string;
}

const BUILTIN_TEMPLATES: Record<string, BuiltinTemplate> = {
  rustup: { key: "rustup-{os}-{arch}-{toolchain}-{toolchain-hash}" },
  "cargo-registry": { key: "cargo-registry-{os}-{arch}-{lock-hash}" },
  "cargo-build": {
    key: "cargo-{suffix}-{os}-{toolchain}-{lock-hash}-{src-hash}",
  },
  "node-modules": { key: "node-modules-{os}-{arch}-{lock-hash}" },
};

export function parseAny(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Empty input");

  try {
    return JSON.parse(trimmed);
  } catch {
    // Not valid JSON — try YAML
  }

  try {
    return yamlLoad(trimmed);
  } catch {
    // Not valid YAML — try TOML
  }

  try {
    return tomlParse(trimmed);
  } catch {
    // Not valid TOML — fail below
  }

  throw new Error("Failed to parse config: not valid JSON, YAML, or TOML");
}

export class ConfigParser {
  constructor() {}

  private isBuiltin(name: string): boolean {
    return name in BUILTIN_TEMPLATES;
  }

  parse(input: string): ResolvedEntry[] {
    const raw = parseAny(input) as Record<string, RawEntry>;

    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      throw new Error(
        "Config must be a mapping of cache names to template configs",
      );
    }

    const entries: ResolvedEntry[] = [];

    for (const [name, entry] of Object.entries(raw)) {
      if (typeof entry !== "object" || entry === null) {
        throw new Error(`Invalid config for "${name}": expected an object`);
      }

      if (this.isBuiltin(name)) {
        const builtin = BUILTIN_TEMPLATES[name]!;
        entries.push({
          name,
          key: entry.key ?? builtin.key,
          restoreKeys: entry["restore-keys"],
        });
      } else if (entry.key) {
        entries.push({
          name,
          key: entry.key,
          restoreKeys: entry["restore-keys"],
        });
      } else {
        throw new Error(
          `Unknown cache type: "${name}". For custom caches, provide a "key" field.`,
        );
      }
    }

    return entries;
  }
}
