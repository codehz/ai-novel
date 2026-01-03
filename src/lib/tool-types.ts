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

export interface OutputSchema {
  type: OutputRenderType;
  fields?: OutputField[]; // For structured output like card-list
  titleField?: string; // Which field to use as title in card
  descriptionField?: string; // Which field to use as description in card
  categoryField?: string; // Which field to use for categorization/grouping
}

export interface PromptSet {
  system?: string;
  userTemplate: string;
  examples?: { input: any; output: any }[];
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
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ToolHistoryItem {
  id: string;
  toolId: string;
  inputs: Record<string, any>;
  outputs: any;
  timestamp: number;
  providerId?: number;
  modelId?: number;
  modelName?: string;
  providerName?: string;
}
