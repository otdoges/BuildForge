export type ModelType = 'gpt-4.1' | 'o4-mini' | 'llama-maverick' | 'phi-4-reasoning' | 'gpt-4.1-nano' | 'combined' | 'default';

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'meta' | 'anthropic' | 'mistral' | 'microsoft' | 'buildbox' | string;
  endpoint: string;
  modelId: string;
  description: string;
  maxTokens: number;
  temperature: number;
}

export interface WebContainerConfig {
  enabled: boolean;
  defaultPackages: string[];
  supportedLanguages: string[];
}

export interface SecurityConfig {
  storeApiKeysInIndexedDB: boolean;
  encryptionEnabled: boolean;
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'system';
  branding: string;
  showModelSelection: boolean;
}

export interface ChatConfig {
  models: ModelConfig[];
  webContainer: WebContainerConfig;
  security: SecurityConfig;
  ui: UIConfig;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'developer' | 'tool';
  content: string;
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

export interface ChatResponse {
  choices: {
    message: {
      role: string;
      content: string;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }[];
}

export interface Options {
  temperature?: number;
  maxTokens?: number;
  tools?: Tool[];
  stream?: boolean;
}

export interface StorageItem<T> {
  name: string;
  value: T;
}

export interface WebsiteProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
}

export interface ProjectFile {
  path: string;
  content: string;
  type: 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'image' | 'other';
} 