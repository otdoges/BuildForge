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
export const initializeBuildBox = () => {
  // Create configuration
  const config = generateChatConfig();
  
  // Initialize model client
  const modelClient = new ModelClient(config);
  
  return {
    config,
    modelClient,
    // Add additional initialization logic here
  };
}; 