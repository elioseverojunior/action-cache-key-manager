import { expect, test } from "bun:test";

import { CacheKeyBuilder, CacheKeySetBuilder } from "./builder";

test("builds single key with chained api", () => {
  const result = new CacheKeyBuilder()
    .withKey("rustup-{os}-{arch}-{toolchain}-{hash}")
    .withVars({
      os: "Linux",
      arch: "x86_64",
      toolchain: "stable",
      hash: "abc123",
    })
    .build();

  expect(result.key).toBe("rustup-Linux-x86_64-stable-abc123");
  expect(result.restoreKeys).toBe(
    "rustup-Linux-x86_64-stable-\nrustup-Linux-x86_64-\nrustup-Linux-",
  );
});

test("builds single key with explicit restore-keys override", () => {
  const result = new CacheKeyBuilder()
    .withKey("rustup-{os}-{arch}-{toolchain}-{hash}")
    .withVars({
      os: "Linux",
      arch: "x86_64",
      toolchain: "stable",
      hash: "abc123",
    })
    .withRestoreKeys("rustup-Linux-x86_64-stable-\nrustup-Linux-")
    .build();

  expect(result.restoreKeys).toBe("rustup-Linux-x86_64-stable-\nrustup-Linux-");
});

test("builds from resolved entry", () => {
  const result = new CacheKeyBuilder()
    .withEntry({ name: "test", key: "prefix-{os}-{arch}" })
    .withVars({ os: "Linux", arch: "x86_64" })
    .build();

  expect(result.key).toBe("prefix-Linux-x86_64");
});

test("builds from entry with explicit restore-keys", () => {
  const result = new CacheKeyBuilder()
    .withEntry({
      name: "test",
      key: "prefix-{os}",
      restoreKeys: "override-fallback-",
    })
    .withVars({ os: "Linux" })
    .build();

  expect(result.restoreKeys).toBe("override-fallback-");
});

test("throws when key is not set", () => {
  expect(() => new CacheKeyBuilder().withVars({}).build()).toThrow(
    "Key template is required",
  );
});

test("CacheKeySetBuilder builds multiple entries", () => {
  const results = new CacheKeySetBuilder()
    .addEntry({ name: "a", key: "key-{os}" })
    .addEntry({ name: "b", key: "other-{arch}" })
    .withVars({ os: "Linux", arch: "x86_64" })
    .build();

  expect(results).toEqual({
    a: { key: "key-Linux", restoreKeys: "" },
    b: { key: "other-x86_64", restoreKeys: "" },
  });
});

test("CacheKeySetBuilder.addEntries builds multiple entries", () => {
  const results = new CacheKeySetBuilder()
    .addEntries([
      { name: "a", key: "key-{os}" },
      { name: "b", key: "other-{arch}" },
    ])
    .withVars({ os: "Linux", arch: "x86_64" })
    .build();

  expect(results).toEqual({
    a: { key: "key-Linux", restoreKeys: "" },
    b: { key: "other-x86_64", restoreKeys: "" },
  });
});

test("CacheKeySetBuilder merges vars", () => {
  const results = new CacheKeySetBuilder()
    .addEntry({ name: "test", key: "key-{os}-{arch}" })
    .withVars({ os: "Linux" })
    .withVars({ arch: "x86_64" })
    .build();

  expect(results.test.key).toBe("key-Linux-x86_64");
});

test("CacheKeySetBuilder throws on duplicate entry name", () => {
  expect(() =>
    new CacheKeySetBuilder()
      .addEntry({ name: "dup", key: "key-{os}" })
      .addEntry({ name: "dup", key: "other-{arch}" }),
  ).toThrow('Duplicate cache entry: "dup"');
});
