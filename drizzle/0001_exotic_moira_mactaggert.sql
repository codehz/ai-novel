CREATE TABLE `tool_histories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tool_id` text NOT NULL,
	`inputs` text NOT NULL,
	`outputs` text NOT NULL,
	`timestamp` integer NOT NULL,
	`provider_id` integer,
	`model_id` integer,
	`model_name` text,
	`provider_name` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tool_histories_tool_id` ON `tool_histories` (`tool_id`);--> statement-breakpoint
CREATE INDEX `idx_tool_histories_created_at` ON `tool_histories` (`created_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_model_call_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`model_id` integer NOT NULL,
	`provider_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`input` text,
	`output` text,
	`error_message` text,
	`input_tokens` integer DEFAULT 0,
	`output_tokens` integer DEFAULT 0,
	`input_cost` real DEFAULT 0,
	`output_cost` real DEFAULT 0,
	`total_cost` real DEFAULT 0,
	`duration_ms` integer DEFAULT 0,
	`call_reason` text NOT NULL,
	`model_config_snapshot` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_model_call_logs`("id", "model_id", "provider_id", "status", "input", "output", "error_message", "input_tokens", "output_tokens", "input_cost", "output_cost", "total_cost", "duration_ms", "call_reason", "model_config_snapshot", "metadata", "created_at", "updated_at") SELECT "id", "model_id", "provider_id", "status", "input", "output", "error_message", "input_tokens", "output_tokens", "input_cost", "output_cost", "total_cost", "duration_ms", "call_reason", "model_config_snapshot", "metadata", "created_at", "updated_at" FROM `model_call_logs`;--> statement-breakpoint
DROP TABLE `model_call_logs`;--> statement-breakpoint
ALTER TABLE `__new_model_call_logs` RENAME TO `model_call_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_model_call_logs_model_id` ON `model_call_logs` (`model_id`);--> statement-breakpoint
CREATE INDEX `idx_model_call_logs_provider_id` ON `model_call_logs` (`provider_id`);--> statement-breakpoint
CREATE INDEX `idx_model_call_logs_created_at` ON `model_call_logs` (`created_at`);