import { expect, test } from "bun:test";

import { TemplateEngine } from "./core";

test("parses template into segments", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("cargo-{suffix}-{os}-{toolchain}-{lock-hash}");

  expect(parsed.segments).toEqual([
    { type: "literal", value: "cargo" },
    { type: "variable", name: "suffix" },
    { type: "variable", name: "os" },
    { type: "variable", name: "toolchain" },
    { type: "variable", name: "lock-hash" },
  ]);
});

test("renders template with variable substitution", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("rustup-{os}-{arch}-{toolchain}-{hash}");

  const rendered = engine.render(parsed, {
    os: "Linux",
    arch: "x86_64",
    toolchain: "stable",
    hash: "abc123",
  });

  expect(rendered.key).toBe("rustup-Linux-x86_64-stable-abc123");
});

test("renders literal-only template as-is", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("static-key");

  const rendered = engine.render(parsed, {});

  expect(rendered.key).toBe("static-key");
});

test("throws on missing variable", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("prefix-{missing}");

  expect(() => engine.render(parsed, {})).toThrow("Missing variable: missing");
});

test("generates restore keys by stripping rightmost segments", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse(
    "cargo-{suffix}-{os}-{toolchain}-{lock-hash}-{src-hash}",
  );
  const rendered = engine.render(parsed, {
    suffix: "prod",
    os: "Linux",
    toolchain: "stable",
    "lock-hash": "abc",
    "src-hash": "def",
  });

  const restoreKeys = engine.generateRestoreKeys(rendered, parsed);

  expect(restoreKeys).toEqual([
    "cargo-prod-Linux-stable-abc-",
    "cargo-prod-Linux-stable-",
    "cargo-prod-Linux-",
    "cargo-prod-",
  ]);
});

test("handles dash in variable values correctly", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("cache-{toolchain}-{arch}");
  const rendered = engine.render(parsed, {
    toolchain: "nightly-2024-01",
    arch: "x86_64",
  });

  const restoreKeys = engine.generateRestoreKeys(rendered, parsed);

  expect(restoreKeys).toEqual(["cache-nightly-2024-01-"]);
  expect(rendered.key).toBe("cache-nightly-2024-01-x86_64");
});

test("generates empty restore keys for literal-only template", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("static-key");
  const rendered = engine.render(parsed, {});

  const restoreKeys = engine.generateRestoreKeys(rendered, parsed);

  expect(restoreKeys).toEqual([]);
});

test("no restore keys for 2-segment template (prefix + 1 var)", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("cache-{var}");
  const rendered = engine.render(parsed, { var: "val" });

  const restoreKeys = engine.generateRestoreKeys(rendered, parsed);

  expect(restoreKeys).toEqual([]);
});

test("buildResult auto-generates restore keys when no override given", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse(
    "cargo-{suffix}-{os}-{toolchain}-{lock-hash}-{src-hash}",
  );
  const rendered = engine.render(parsed, {
    suffix: "prod",
    os: "Linux",
    toolchain: "stable",
    "lock-hash": "abc",
    "src-hash": "def",
  });

  const result = engine.buildResult(parsed, rendered);

  expect(result.key).toBe("cargo-prod-Linux-stable-abc-def");
  expect(result.restoreKeys).toBe(
    "cargo-prod-Linux-stable-abc-\ncargo-prod-Linux-stable-\ncargo-prod-Linux-\ncargo-prod-",
  );
});

test("respects explicit restore-keys override", () => {
  const engine = new TemplateEngine();
  const parsed = engine.parse("rustup-{os}-{arch}-{toolchain}-{hash}");
  const rendered = engine.render(parsed, {
    os: "Linux",
    arch: "x86_64",
    toolchain: "stable",
    hash: "abc123",
  });

  const explicitOverride = "rustup-Linux-x86_64-stable-\nrustup-Linux-";
  const result = engine.buildResult(parsed, rendered, explicitOverride);

  expect(result.key).toBe("rustup-Linux-x86_64-stable-abc123");
  expect(result.restoreKeys).toBe(explicitOverride);
});
