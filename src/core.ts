export interface VariableSet {
  [name: string]: string;
}

export interface Segment {
  type: "literal" | "variable";
  value?: string;
  name?: string;
}

export interface ParsedTemplate {
  segments: Segment[];
}

export interface RenderedTemplate {
  key: string;
  segments: string[];
}

export interface RenderResult {
  key: string;
  restoreKeys: string;
}

export class TemplateEngine {
  constructor() {}

  parse(template: string): ParsedTemplate {
    const segments: Segment[] = [];
    const parts = template.split(/(\{[^}]+\})/);

    for (const part of parts) {
      if (part === "") continue;

      const varMatch = part.match(/^\{(\w+(?:-\w+)*)\}$/);
      if (varMatch) {
        segments.push({ type: "variable", name: varMatch[1] });
      } else {
        const literals = part.split("-");
        for (const lit of literals) {
          if (lit !== "") {
            segments.push({ type: "literal", value: lit });
          }
        }
      }
    }

    return { segments };
  }

  render(parsed: ParsedTemplate, vars: VariableSet): RenderedTemplate {
    const segments = parsed.segments.map((seg) => {
      if (seg.type === "literal") return seg.value!;
      const value = vars[seg.name!];
      if (value === undefined) {
        throw new Error(`Missing variable: ${seg.name}`);
      }
      return value;
    });
    return { key: segments.join("-"), segments };
  }

  hasVariables(parsed: ParsedTemplate): boolean {
    return parsed.segments.some((seg) => seg.type === "variable");
  }

  generateRestoreKeys(
    rendered: RenderedTemplate,
    parsed: ParsedTemplate,
  ): string[] {
    if (!this.hasVariables(parsed)) return [];

    const keys: string[] = [];
    for (let i = rendered.segments.length - 1; i >= 2; i--) {
      keys.push(rendered.segments.slice(0, i).join("-") + "-");
    }
    return keys;
  }

  buildResult(
    parsed: ParsedTemplate,
    rendered: RenderedTemplate,
    explicitRestoreKeys?: string,
  ): RenderResult {
    if (explicitRestoreKeys !== undefined) {
      return { key: rendered.key, restoreKeys: explicitRestoreKeys };
    }
    return {
      key: rendered.key,
      restoreKeys: this.generateRestoreKeys(rendered, parsed).join("\n"),
    };
  }
}
