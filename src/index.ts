import * as core from "@actions/core";

import { CacheKeySetBuilder } from "./builder";
import { ConfigParser } from "./config";
import type { RenderResult } from "./core";

function run(): void {
  try {
    const configInput = core.getInput("config");
    const os = core.getInput("os");
    const arch = core.getInput("arch");

    const parser = new ConfigParser();
    const entries = parser.parse(configInput);

    const results: Record<string, RenderResult> = new CacheKeySetBuilder()
      .addEntries(entries)
      .withVars({ os, arch })
      .build();

    for (const [name, result] of Object.entries(results)) {
      core.setOutput(`${name}-key`, result.key);
      core.setOutput(`${name}-restore-keys`, result.restoreKeys);
    }
    core.setOutput("os", os);
    core.setOutput("arch", arch);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
