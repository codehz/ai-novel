import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

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
  inputPrice: real("input_price").default(0), // Price per 1k tokens
  outputPrice: real("output_price").default(0), // Price per 1k tokens
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
