import { ModelType, ChatConfig, Message, ChatResponse, Tool, MCPServer } from './types';

// Import the Azure AI modules statically
import * as azureAIInference from '@azure-rest/ai-inference';
import * as azureCoreAuth from '@azure/core-auth';

// For server-side only imports
const isServer = typeof window === 'undefined';
// Only import on server side
const importChildProcess = isServer 
  ? () => import('child_process').then(mod => mod) 
  : () => Promise.resolve(null);

/**
 * Client for interacting with AI models via their respective APIs.
 * Handles authentication, request formatting, and response parsing.
 */
export class ModelClient {
  private config: ChatConfig;
  private token: string | null = null;
  private mcpServerProcesses: Record<string, any> = {};

  constructor(config: ChatConfig) {
    this.config = config;
    
    // Try to get token from environment variables with various possible names
    const envToken = this.getTokenFromEnv();
    if (envToken) {
      this.token = envToken;
    }
    
    // For development/testing - hardcoded fallback token
    // Remove this in production
    if (!this.token) {
      this.token = "default_development_token";
      console.warn("Using default development token - replace with your actual token in .env file");
    }
  }

  /**
   * Try to get the token from various environment variable names
   */
  private getTokenFromEnv(): string | null {
    if (typeof process === 'undefined' || !process.env) {
      return null;
    }

    // Try different possible environment variable names
    return process.env.GITHUB_TOKEN || 
           process.env.NEXT_PUBLIC_GITHUB_TOKEN || 
           process.env.API_TOKEN ||
           process.env.NEXT_PUBLIC_API_TOKEN ||
           null;
  }

  /**
   * Start MCP server processes if configured
   */
  async startMCPServers(): Promise<void> {
    if (!this.config.mcpServers || !isServer) {
      return;
    }

    try {
      const childProcessModule = await importChildProcess();
      if (!childProcessModule) {
        console.warn('child_process module not available in this environment');
        return;
      }
      
      const { spawn } = childProcessModule;

      for (const [serverName, serverConfig] of Object.entries(this.config.mcpServers)) {
        try {
          console.log(`Starting MCP server: ${serverName}`);
          const serverProcess = spawn(serverConfig.command, serverConfig.args, {
            stdio: 'pipe'
          });

          serverProcess.stdout.on('data', (data: Buffer) => {
            console.log(`[${serverName}] ${data.toString().trim()}`);
          });

          serverProcess.stderr.on('data', (data: Buffer) => {
            console.error(`[${serverName}] ${data.toString().trim()}`);
          });

          serverProcess.on('close', (code: number) => {
            console.log(`MCP server ${serverName} exited with code ${code}`);
            delete this.mcpServerProcesses[serverName];
          });

          this.mcpServerProcesses[serverName] = serverProcess;
        } catch (error) {
          console.error(`Failed to start MCP server ${serverName}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to import child_process module:', error);
    }
  }

  /**
   * Stop all running MCP server processes
   */
  async stopMCPServers(): Promise<void> {
    if (!isServer || Object.keys(this.mcpServerProcesses).length === 0) {
      return;
    }
    
    for (const [serverName, process] of Object.entries(this.mcpServerProcesses)) {
      console.log(`Stopping MCP server: ${serverName}`);
      process.kill();
    }
    this.mcpServerProcesses = {};
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
      useMCP?: boolean;
    } = {}
  ): Promise<ChatResponse> {
    if (!this.token) {
      throw new Error('Authentication token not set. Call setToken() first or set GITHUB_TOKEN environment variable.');
    }

    const modelConfig = this.getModelConfig(modelType);
    if (!modelConfig) {
      throw new Error(`Model configuration not found for type: ${modelType}`);
    }

    // Check if we should use MCP for sequential thinking
    const useMCP = options.useMCP !== false && this.config.mcpServers && 'sequential-thinking' in this.config.mcpServers;

    // Use the statically imported modules
    const ModelClientLib = azureAIInference.default || azureAIInference;
    const { isUnexpected } = azureAIInference;
    const { AzureKeyCredential } = azureCoreAuth;

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

    // Add MCP configuration when enabled
    if (useMCP) {
      requestBody.mcp = {
        server: 'sequential-thinking'
      };
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
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        name: functionName,
        content: typeof functionResult === 'string' ? functionResult : JSON.stringify(functionResult)
      }
    ];

    // Get the next response from the model
    return this.chatCompletion(modelType, updatedMessages, options);
  }
} 