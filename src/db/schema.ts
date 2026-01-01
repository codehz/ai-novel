import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const modelProviders = sqliteTable("model_providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerType: text("provider_type").notNull().unique(), // 'openai', 'anthropic', etc.
  providerName: text("provider_name").notNull(),
  apiKey: text("api_key"), // Should be encrypted in application layer
  apiEndpoint: text("api_endpoint"),
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
  callLogs: many(modelCallLogs),
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
    modelId: integer("model_id").notNull(), // No foreign key to avoid data loss on model deletion
    providerId: integer("provider_id").notNull(), // No foreign key to avoid data loss on provider deletion
    status: text("status").notNull().default("pending"), // 'pending', 'success', 'error'
    input: text("input"),
    output: text("output"),
    errorMessage: text("error_message"),
    inputTokens: integer("input_tokens").default(0),
    outputTokens: integer("output_tokens").default(0),
    inputCost: real("input_cost").default(0),
    outputCost: real("output_cost").default(0),
    totalCost: real("total_cost").default(0),
    callReason: text("call_reason").notNull(), // URL format
    metadata: text("metadata", { mode: "json" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    modelIdIdx: index("idx_model_call_logs_model_id").on(table.modelId),
    providerIdIdx: index("idx_model_call_logs_provider_id").on(table.providerId),
    createdAtIdx: index("idx_model_call_logs_created_at").on(table.createdAt),
  }),
);

export const modelCallLogsRelations = relations(modelCallLogs, ({ one }) => ({
  provider: one(modelProviders, {
    fields: [modelCallLogs.providerId],
    references: [modelProviders.id],
  }),
}));
