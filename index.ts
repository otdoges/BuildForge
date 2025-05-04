// Export all components from a single entry point
export * from './types';
export * from './system-prompt';
export * from './model-client';

// Main entry point to initialize the chat interface
import { generateChatConfig } from './system-prompt';
import { ModelClient } from './model-client';

/**
 * Initialize the BuildBox chat interface with multiple AI models
 */
export const initializeBuildBox = async () => {
  // Create configuration
  const config = generateChatConfig();
  
  // Initialize model client
  const modelClient = new ModelClient(config);
  
  // Start MCP servers if available
  await modelClient.startMCPServers();
  
  return {
    config,
    modelClient,
    // Add additional initialization logic here
  };
};

/**
 * Clean up resources used by BuildBox
 */
export const cleanupBuildBox = (modelClient: ModelClient) => {
  // Stop all MCP servers
  modelClient.stopMCPServers();
}; 