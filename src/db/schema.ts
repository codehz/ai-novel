import { InputSchema, OutputSchema, PromptSet } from "@/shared/tool-types";
import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const modelProviders = sqliteTable("model_providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerType: text("provider_type").notNull(), // 'openai', 'anthropic', etc.
  providerName: text("provider_name").notNull(),
  apiKey: text("api_key"),
  apiEndpoint: text("api_endpoint"),
  config: text("config", { mode: "json" }), // Provider specific configuration
  isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const models = sqliteTable("models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerId: integer("provider_id")
    .notNull()
    .references(() => modelProviders.id, { onDelete: "cascade" }),
  modelName: text("model_name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  parameters: text("parameters", { mode: "json" }), // Default parameters like temperature, max_tokens
  inputPrice: real("input_price").default(0), // Price per 1M tokens
  outputPrice: real("output_price").default(0), // Price per 1M tokens
  isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const modelProvidersRelations = relations(modelProviders, ({ many }) => ({
  models: many(models),
}));

export const modelsRelations = relations(models, ({ one }) => ({
  provider: one(modelProviders, {
    fields: [models.providerId],
    references: [modelProviders.id],
  }),
}));

export const modelCallLogs = sqliteTable(
  "model_call_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    providerName: text("provider_name").notNull(),
    modelName: text("model_name").notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'success', 'error'
    input: text("input", { mode: "json" }),
    output: text("output", { mode: "json" }),
    errorMessage: text("error_message"),
    inputTokens: integer("input_tokens").default(0),
    outputTokens: integer("output_tokens").default(0),
    inputCost: real("input_cost").default(0),
    outputCost: real("output_cost").default(0),
    totalCost: real("total_cost").default(0),
    durationMs: integer("duration_ms").default(0),
    callReason: text("call_reason").notNull(), // URL format
    modelConfigSnapshot: text("model_config_snapshot", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    metadata: text("metadata", { mode: "json" }),
    workflowRunId: text("workflow_run_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [index("idx_model_call_logs_created_at").on(table.createdAt)],
);

export const toolHistories = sqliteTable(
  "tool_histories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    toolId: text("tool_id").notNull(),
    inputs: text("inputs", { mode: "json" }).notNull(),
    outputs: text("outputs", { mode: "json" }).notNull(),
    timestamp: integer("timestamp").notNull(),
    modelId: integer("model_id").references(() => models.id, { onDelete: "set null" }),
    modelName: text("model_name"),
    providerName: text("provider_name"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_tool_histories_tool_id").on(table.toolId),
    index("idx_tool_histories_created_at").on(table.createdAt),
  ],
);

export const toolConfigs = sqliteTable(
  "tool_configs",
  {
    toolId: text("tool_id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    icon: text("icon"),
    version: text("version").notNull(),
    inputSchema: text("input_schema", { mode: "json" }).$type<InputSchema>().notNull(),
    outputSchema: text("output_schema", { mode: "json" }).$type<OutputSchema>().notNull(),
    prompts: text("prompts", { mode: "json" }).$type<PromptSet>(),
    isEnabled: integer("is_enabled", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_tool_configs_is_enabled").on(table.isEnabled),
    index("idx_tool_configs_created_at").on(table.createdAt),
  ],
);
