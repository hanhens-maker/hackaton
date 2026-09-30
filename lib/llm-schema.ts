import { z } from "zod";
import { LlmResponseSchema } from "@/lib/schema";

// OpenAI strict structured outputs accept only a subset of JSON Schema:
// every property required (optional → nullable), anyOf instead of oneOf, no string lengths.
// We derive that from the Zod schema, and keep the original JSON Schema to clip strings on the way back.

type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  const?: unknown;
  maxLength?: number;
  maxItems?: number;
  [key: string]: unknown;
};

const zodJsonSchema = z.toJSONSchema(LlmResponseSchema) as JsonSchema;

function toStrict(schema: JsonSchema): JsonSchema {
  const { oneOf, ...out } = schema;
  delete out.minLength;
  delete out.maxLength;
  delete out.$schema;
  const variants = oneOf ?? schema.anyOf;
  if (variants) out.anyOf = variants.map(toStrict);
  if (schema.items) out.items = toStrict(schema.items);
  if (schema.properties) {
    const required = new Set(schema.required ?? []);
    out.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => {
        const strict = toStrict(value);
        return [key, required.has(key) ? strict : { anyOf: [strict, { type: "null" }] }];
      }),
    );
    out.required = Object.keys(schema.properties);
    out.additionalProperties = false;
  }
  return out;
}

export const openAiResponseSchema = toStrict(zodJsonSchema) as Record<string, unknown>;

const KEEP_NULL = new Set(["layout", "signals"]);

/** Nullable-in-the-wire fields come back as null; our Zod schema expects them absent. */
export function stripNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripNulls);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key, v]) => v !== null || KEEP_NULL.has(key)) // layout/signals: null is meaningful
        .map(([key, v]) => [key, stripNulls(v)]),
    );
  }
  return value;
}

/** Trim strings and arrays to the Zod caps so a slightly long answer isn't a hard failure. Numbers stay strict. */
export function clipToSchema(value: unknown, schema: JsonSchema = zodJsonSchema): unknown {
  const variants = schema.oneOf ?? schema.anyOf;
  if (variants) {
    if (value === null) return value;
    const type = (value as { type?: unknown } | undefined)?.type;
    const match =
      variants.find((v) => v.properties?.type?.const !== undefined && v.properties.type.const === type) ??
      variants.find((v) => (Array.isArray(value) ? v.type === "array" : v.type !== "null"));
    return match ? clipToSchema(value, match) : value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return schema.maxLength ? trimmed.slice(0, schema.maxLength) : trimmed;
  }
  if (Array.isArray(value) && schema.items) {
    const items = schema.maxItems ? value.slice(0, schema.maxItems) : value;
    return items.map((v) => clipToSchema(v, schema.items!));
  }
  if (value && typeof value === "object" && schema.properties) {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, schema.properties![key] ? clipToSchema(v, schema.properties![key]) : v]),
    );
  }
  return value;
}
