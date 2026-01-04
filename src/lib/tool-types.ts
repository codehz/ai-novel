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
}

export type OutputRenderType = "card-list" | "text" | "markdown" | "json";

export interface OutputField {
  name: string;
  label?: string;
  type: "string" | "number" | "boolean" | "json";
}

export interface CategoryConfig {
  id: string;
  label: string;
  icon?: string; // Icon name from lucide
  hue?: number; // HSL hue value (0-360)
}

export interface OutputSchema {
  type: OutputRenderType;
  titleField?: string; // Which field to use as title in card
  descriptionField?: string; // Which field to use as description in card
  categoryField?: string; // Which field to use for categorization/grouping
  categories?: CategoryConfig[];
}

export interface PromptSet {
  systemTemplate?: string;
  userTemplate: string;
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon?: any; // We might need to store icon name string and resolve it in UI, or just use a component if defined in code
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
  modelId?: number;
  modelName?: string;
  providerName?: string;
}
