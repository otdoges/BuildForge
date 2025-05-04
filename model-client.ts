import { ModelType, ChatConfig, Message, ChatResponse, Tool } from './types';

/**
 * Client for interacting with AI models via their respective APIs.
 * Handles authentication, request formatting, and response parsing.
 */
export class ModelClient {
  private config: ChatConfig;
  private token: string | null = null;

  constructor(config: ChatConfig) {
    this.config = config;
  }

  /**
   * Set the authentication token for API calls
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get the model configuration by type
   */
  getModelConfig(modelType: ModelType) {
    return this.config.models.find(model => model.id === modelType);
  }

  /**
   * Send a chat completion request to the specified model
   */
  async chatCompletion(
    modelType: ModelType,
    messages: Message[],
    options: {
      temperature?: number;
      maxTokens?: number;
      tools?: Tool[];
      stream?: boolean;
    } = {}
  ): Promise<ChatResponse> {
    if (!this.token) {
      throw new Error('Authentication token not set. Call setToken() first.');
    }

    const modelConfig = this.getModelConfig(modelType);
    if (!modelConfig) {
      throw new Error(`Model configuration not found for type: ${modelType}`);
    }

    // Import modules dynamically to avoid bundling issues
    const { default: ModelClientLib, isUnexpected } = await import('@azure-rest/ai-inference');
    const { AzureKeyCredential } = await import('@azure/core-auth');

    const client = ModelClientLib(
      modelConfig.endpoint,
      new AzureKeyCredential(this.token),
      modelType === 'o4-mini' ? { apiVersion: '2024-12-01-preview' } : undefined
    );

    // Prepare request body based on model type
    const requestBody: any = {
      messages,
      model: modelConfig.modelId,
      temperature: options.temperature ?? modelConfig.temperature,
      max_tokens: options.maxTokens ?? modelConfig.maxTokens
    };

    // Add tools if provided
    if (options.tools && options.tools.length > 0) {
      requestBody.tools = options.tools;
    }

    const response = await client.path('/chat/completions').post({
      body: requestBody
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    return response.body as ChatResponse;
  }

  /**
   * Process a tool call from the model response
   */
  async processToolCall(
    modelType: ModelType,
    messages: Message[],
    toolCall: any,
    toolFunction: (name: string, args: any) => Promise<any>,
    options: {
      temperature?: number;
      maxTokens?: number;
      tools?: Tool[];
    } = {}
  ): Promise<ChatResponse> {
    // Execute the tool function
    const functionName = toolCall.function.name;
    const functionArgs = JSON.parse(toolCall.function.arguments);
    const functionResult = await toolFunction(functionName, functionArgs);

    // Add the tool response to messages
    const updatedMessages = [
      ...messages,
      {
        role: 'tool',
        tool_call_id: toolCall.id,
        name: functionName,
        content: typeof functionResult === 'string' ? functionResult : JSON.stringify(functionResult)
      }
    ];

    // Get the next response from the model
    return this.chatCompletion(modelType, updatedMessages, options);
  }

  /**
   * Store API keys securely in IndexedDB
   */
  async storeApiKey(keyName: string, keyValue: string): Promise<void> {
    if (!this.config.security.storeApiKeysInIndexedDB) {
      console.warn('API key storage in IndexedDB is disabled in configuration');
      return;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.error('IndexedDB not available');
      return;
    }

    // Simple encryption (for better security, use a proper encryption library)
    const encryptedValue = this.config.security.encryptionEnabled
      ? btoa(keyValue) // Basic encoding, not true encryption
      : keyValue;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BuildBoxApiKeys', 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('apiKeys')) {
          db.createObjectStore('apiKeys', { keyPath: 'name' });
        }
      };

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['apiKeys'], 'readwrite');
        const store = transaction.objectStore('apiKeys');
        
        const storeRequest = store.put({ name: keyName, value: encryptedValue });
        
        storeRequest.onsuccess = () => resolve();
        storeRequest.onerror = () => reject(new Error('Failed to store API key'));
        
        transaction.oncomplete = () => db.close();
      };

      request.onerror = () => reject(new Error('Failed to open database'));
    });
  }

  /**
   * Retrieve API key from IndexedDB
   */
  async getApiKey(keyName: string): Promise<string | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.error('IndexedDB not available');
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('BuildBoxApiKeys', 1);

      request.onsuccess = (event: any) => {
        const db = event.target.result;
        const transaction = db.transaction(['apiKeys'], 'readonly');
        const store = transaction.objectStore('apiKeys');
        
        const getRequest = store.get(keyName);
        
        getRequest.onsuccess = () => {
          const result = getRequest.result;
          if (result) {
            const decryptedValue = this.config.security.encryptionEnabled
              ? atob(result.value) // Basic decoding
              : result.value;
            resolve(decryptedValue);
          } else {
            resolve(null);
          }
        };
        
        getRequest.onerror = () => reject(new Error('Failed to retrieve API key'));
        
        transaction.oncomplete = () => db.close();
      };

      request.onerror = () => reject(new Error('Failed to open database'));
    });
  }
} 