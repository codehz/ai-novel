/* eslint-disable @typescript-eslint/no-explicit-any */
export type InputType = "text" | "textarea" | "select" | "number";

export interface InputField {
  name: string;
  label: string;
  type: InputType;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  options?: { label: string; value: string | number }[]; // For select
  description?: string;
}

export interface InputSchema {
  fields: InputField[];
  submitLabel?: string;
  titleField?: string;
}

export type OutputRenderType = "card-list" | "text";

export interface CategoryConfig {
  id: string;
  label: string;
  icon?: string; // Icon name from lucide
  hue?: number; // HSL hue value (0-360)
}

export interface OutputSchema {
  type: OutputRenderType;
  categories?: CategoryConfig[];
}

export type StreamStepResult<T> = { type: "item"; data: T } | { type: "error"; error: string } | { type: "complete" };

export interface PromptSet {
  systemTemplate?: string;
  userTemplate: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon?: string | null; // Icon name from lucide
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
  prompts?: PromptSet;
  version: string;
  isEnabled?: boolean;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ToolHistoryItem {
  id: number;
  toolId: string;
  inputs: Record<string, any>;
  outputs: any;
  timestamp: number;
  modelId: number;
  modelName?: string;
  providerName?: string;
}
