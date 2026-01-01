CREATE TABLE `model_call_logs` (
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
	`call_reason` text NOT NULL,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_model_call_logs_model_id` ON `model_call_logs` (`model_id`);--> statement-breakpoint
CREATE INDEX `idx_model_call_logs_provider_id` ON `model_call_logs` (`provider_id`);--> statement-breakpoint
CREATE INDEX `idx_model_call_logs_created_at` ON `model_call_logs` (`created_at`);