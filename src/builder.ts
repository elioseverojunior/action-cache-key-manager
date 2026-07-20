import type { ResolvedEntry } from "./config";
import { TemplateEngine, type RenderResult, type VariableSet } from "./core";

export class CacheKeyBuilder {
  constructor() {}

  private engine = new TemplateEngine();
  private template: string | undefined;
  private vars: VariableSet = {};
  private restoreKeysOverride: string | undefined;

  withKey(key: string): this {
    this.template = key;
    return this;
  }

  withEntry(entry: ResolvedEntry): this {
    this.template = entry.key;
    this.restoreKeysOverride = entry.restoreKeys;
    return this;
  }

  withVars(vars: VariableSet): this {
    this.vars = { ...this.vars, ...vars };
    return this;
  }

  withRestoreKeys(restoreKeys?: string): this {
    this.restoreKeysOverride = restoreKeys;
    return this;
  }

  build(): RenderResult {
    if (!this.template) {
      throw new Error("Key template is required");
    }

    const parsed = this.engine.parse(this.template);
    const rendered = this.engine.render(parsed, this.vars);
    return this.engine.buildResult(parsed, rendered, this.restoreKeysOverride);
  }
}

export class CacheKeySetBuilder {
  constructor() {}

  private engine = new TemplateEngine();
  private entries: ResolvedEntry[] = [];
  private vars: VariableSet = {};

  addEntries(entries: ResolvedEntry[]): this {
    for (const entry of entries) {
      this.addEntry(entry);
    }
    return this;
  }

  addEntry(entry: ResolvedEntry): this {
    if (this.entries.some((e) => e.name === entry.name)) {
      throw new Error(`Duplicate cache entry: "${entry.name}"`);
    }
    this.entries.push(entry);
    return this;
  }

  withVars(vars: VariableSet): this {
    this.vars = { ...this.vars, ...vars };
    return this;
  }

  build(): Record<string, RenderResult> {
    const results: Record<string, RenderResult> = {};

    for (const entry of this.entries) {
      const parsed = this.engine.parse(entry.key);
      const rendered = this.engine.render(parsed, this.vars);
      results[entry.name] = this.engine.buildResult(
        parsed,
        rendered,
        entry.restoreKeys,
      );
    }

    return results;
  }
}
