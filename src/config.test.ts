import { expect, test } from "bun:test";

import { ConfigParser } from "./config";

test("resolves built-in rustup template", () => {
  const parser = new ConfigParser();
  const config = parser.parse('{"rustup":{}}');

  expect(config).toHaveLength(1);
  expect(config[0].name).toBe("rustup");
  expect(config[0].key).toBe("rustup-{os}-{arch}-{toolchain}-{toolchain-hash}");
  expect(config[0].restoreKeys).toBeUndefined();
});

test("resolves built-in cargo-registry template", () => {
  const parser = new ConfigParser();
  const config = parser.parse('{"cargo-registry":{}}');

  expect(config[0].key).toBe("cargo-registry-{os}-{arch}-{lock-hash}");
});

test("resolves built-in cargo-build template", () => {
  const parser = new ConfigParser();
  const config = parser.parse('{"cargo-build":{}}');

  expect(config[0].key).toBe(
    "cargo-{suffix}-{os}-{toolchain}-{lock-hash}-{src-hash}",
  );
});

test("resolves built-in node-modules template", () => {
  const parser = new ConfigParser();
  const config = parser.parse('{"node-modules":{}}');

  expect(config[0].key).toBe("node-modules-{os}-{arch}-{lock-hash}");
});

test("accepts custom template with explicit key", () => {
  const parser = new ConfigParser();
  const config = parser.parse(
    '{"my-cache":{"key":"myapp-{os}-{arch}-{branch}"}}',
  );

  expect(config).toHaveLength(1);
  expect(config[0].name).toBe("my-cache");
  expect(config[0].key).toBe("myapp-{os}-{arch}-{branch}");
});

test("overrides built-in template key", () => {
  const parser = new ConfigParser();
  const config = parser.parse('{"rustup":{"key":"custom-rustup-{os}"}}');

  expect(config[0].key).toBe("custom-rustup-{os}");
});

test("overrides built-in template restore-keys", () => {
  const parser = new ConfigParser();
  const config = parser.parse(
    '{"cargo-build":{"restore-keys":"custom-fallback\\ncustom-fallback-2"}}',
  );

  expect(config[0].key).toBe(
    "cargo-{suffix}-{os}-{toolchain}-{lock-hash}-{src-hash}",
  );
  expect(config[0].restoreKeys).toBe("custom-fallback\ncustom-fallback-2");
});

test("parses multiple templates in one config", () => {
  const parser = new ConfigParser();
  const config = parser.parse('{"rustup":{},"my-cache":{"key":"myapp-{os}"}}');

  expect(config).toHaveLength(2);
  expect(config[0].name).toBe("rustup");
  expect(config[1].name).toBe("my-cache");
});

test("throws on unknown built-in name", () => {
  const parser = new ConfigParser();
  expect(() => parser.parse('{"nonexistent":{}}')).toThrow(
    'Unknown cache type: "nonexistent"',
  );
});

test("throws on custom template without key", () => {
  const parser = new ConfigParser();
  expect(() => parser.parse('{"custom":{}}')).toThrow(
    'Unknown cache type: "custom"',
  );
});

test("parses YAML config", () => {
  const parser = new ConfigParser();
  const config = parser.parse("rustup: {}\ncargo-registry: {}\n");

  expect(config).toHaveLength(2);
  expect(config[0].name).toBe("rustup");
  expect(config[1].name).toBe("cargo-registry");
});

test("parses YAML config with custom template", () => {
  const parser = new ConfigParser();
  const config = parser.parse("my-cache:\n  key: myapp-{os}-{arch}\n");

  expect(config[0].key).toBe("myapp-{os}-{arch}");
});

test("parses TOML config", () => {
  const parser = new ConfigParser();
  const config = parser.parse("[rustup]\n[cargo-registry]\n");

  expect(config).toHaveLength(2);
  expect(config[0].name).toBe("rustup");
  expect(config[1].name).toBe("cargo-registry");
});

test("parses TOML config with custom template", () => {
  const parser = new ConfigParser();
  const config = parser.parse('[my-cache]\nkey = "myapp-{os}-{arch}"\n');

  expect(config[0].key).toBe("myapp-{os}-{arch}");
});

test("parses TOML config with restore-keys", () => {
  const parser = new ConfigParser();
  const config = parser.parse(
    '[cargo-build]\nrestore-keys = "custom-fallback-"\n',
  );

  expect(config[0].restoreKeys).toBe("custom-fallback-");
});

test("throws on invalid input that fails all formats", () => {
  const parser = new ConfigParser();
  expect(() => parser.parse("{{broken")).toThrow(
    "Failed to parse config: not valid JSON, YAML, or TOML",
  );
});

test("throws when config is an array instead of object", () => {
  const parser = new ConfigParser();
  expect(() => parser.parse("[]")).toThrow(
    "Config must be a mapping of cache names to template configs",
  );
});

test("throws when entry value is not an object", () => {
  const parser = new ConfigParser();
  expect(() => parser.parse('{"bad-entry":"string"}')).toThrow(
    'Invalid config for "bad-entry": expected an object',
  );
});

test("parses YAML config with multiline restore-keys", () => {
  const parser = new ConfigParser();
  const config = parser.parse(
    "cargo-build:\n  restore-keys: |\n    first-fallback-\n    second-fallback-\n",
  );

  expect(config[0].restoreKeys).toBe("first-fallback-\nsecond-fallback-\n");
});

test("parses multiline JSON config", () => {
  const parser = new ConfigParser();
  const config = parser.parse('{\n  "rustup": {}\n}\n');

  expect(config).toHaveLength(1);
  expect(config[0].name).toBe("rustup");
});
