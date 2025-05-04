'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ModelClient } from './model-client';
import { ModelType, Message, ChatConfig } from './types';
import { generateChatConfig, getSystemPrompt } from './system-prompt';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, ThumbsUp, ThumbsDown, Code, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { MCPStatus } from '@/components/ui/mcp-status';
import Image from 'next/image';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  initialModel?: ModelType;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  initialModel = 'combined' 
}) => {
  const [config] = useState<ChatConfig>(generateChatConfig());
  const [selectedModel, setSelectedModel] = useState<ModelType>(initialModel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCodingMode, setIsCodingMode] = useState(false);
  const [isServerProcessing, setIsServerProcessing] = useState(true);
  const [serverFailed, setServerFailed] = useState(false);
  const [isUsingDefaultToken, setIsUsingDefaultToken] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const modelClientRef = useRef<ModelClient | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize the model client
  useEffect(() => {
    const modelClient = new ModelClient(config);
    modelClientRef.current = modelClient;

    // Check if we're using the default token
    if (modelClient.getToken() === 'default_development_token') {
      setIsUsingDefaultToken(true);
    }

    // Add system message for the selected model
    const systemMessage: Message = {
      role: 'system',
      content: getSystemPrompt(selectedModel)
    };
    setMessages([systemMessage]);

    // Start MCP servers if configured
    const startServers = async () => {
      try {
        await modelClient.startMCPServers();
      } catch (error) {
        console.error('Failed to start MCP servers:', error);
        setServerFailed(true);
      }
    };
    
    startServers();

    // Cleanup on unmount
    return () => {
      if (modelClientRef.current) {
        modelClientRef.current.stopMCPServers();
      }
    };
  }, [config]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Update system message when model changes
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === 'system') {
      const systemMessage: Message = {
        role: 'system',
        content: getSystemPrompt(selectedModel)
      };
      setMessages(prev => [systemMessage, ...prev.slice(1)]);
    }
  }, [selectedModel]);

  // Detect if we should switch to coding mode
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      // Check if message contains code blocks or appears to be showing code
      const hasCodeBlock = lastMessage.content.includes('```') || 
                           lastMessage.content.includes('function') ||
                           lastMessage.content.includes('const ') ||
                           lastMessage.content.includes('class ');
      if (hasCodeBlock && !isCodingMode) {
        setIsCodingMode(true);
      }
    }
  }, [messages, isCodingMode]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value as ModelType);
  };

  const toggleCodingMode = () => {
    setIsCodingMode(!isCodingMode);
  };

  const toggleProcessingMode = () => {
    if (serverFailed) {
      // If server failed, we can only use client processing
      setIsServerProcessing(false);
      return;
    }
    setIsServerProcessing(!isServerProcessing);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const saveApiKey = () => {
    if (apiKey && modelClientRef.current) {
      modelClientRef.current.setToken(apiKey);
      setIsUsingDefaultToken(false);
      setShowApiKeyInput(false);
      // Show confirmation feedback
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: '✅ API key has been updated.'
        }
      ]);
    }
  };

  const toggleApiKeyInput = () => {
    setShowApiKeyInput(!showApiKeyInput);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !modelClientRef.current) return;

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get model config to determine endpoint, etc.
      const modelConfig = modelClientRef.current.getModelConfig(selectedModel);
      if (!modelConfig) {
        throw new Error(`Model configuration not found for type: ${selectedModel}`);
      }

      // Build the request payload
      const allMessages = [...messages, userMessage];
      const requestBody = {
        messages: allMessages,
        model: modelConfig.modelId,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens
      };

      // Direct POST request
      const token = modelClientRef.current.getToken() || 'default_development_token';
      
      // Determine the authorization header format based on endpoint
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Azure OpenAI expects "api-key", some other APIs expect "Authorization: Bearer"
      if (modelConfig.endpoint.includes('openai.azure.com')) {
        headers['api-key'] = token;
      } else {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(modelConfig.endpoint + '/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
        } else {
          // Handle non-JSON error responses
          const errorText = await response.text();
          throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
        }
      }

      const responseData = await response.json();
      
      if (responseData.choices && responseData.choices.length > 0) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: responseData.choices[0].message.content
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the editor panel (placeholder for now)
  const renderEditorPanel = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b p-2 flex justify-between items-center">
          <h3 className="text-sm font-medium">Code Editor</h3>
          <Button variant="ghost" size="sm" onClick={toggleCodingMode}>
            <Code className="h-4 w-4 mr-1" /> Close
          </Button>
        </div>
        <div className="flex-1 bg-muted p-4 overflow-auto">
          <pre className="text-sm">
            {/* Code editor would go here */}
            <code>// Ready for editing</code>
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-2">
              <Image src="/logo.svg" alt="BuildBox Logo" width={32} height={32} />
            </div>
            <h1 className="text-xl font-bold">BuildBox</h1>
            {isUsingDefaultToken && (
              <div 
                className="ml-2 flex items-center text-yellow-500 cursor-pointer hover:underline" 
                title="Using default development token. Click to set your own API key."
                onClick={toggleApiKeyInput}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">Set API key</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {showApiKeyInput && (
              <div className="flex space-x-2">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter API key"
                  className="w-60 h-9"
                />
                <Button onClick={saveApiKey} size="sm">
                  Save
                </Button>
                <Button onClick={toggleApiKeyInput} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            )}
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {config.models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!showApiKeyInput && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleApiKeyInput} 
                title="Change API key"
              >
                API Key
              </Button>
            )}
            <Button 
              variant={isServerProcessing ? "default" : "outline"}
              size="sm"
              onClick={toggleProcessingMode}
              disabled={serverFailed}
              title={serverFailed ? "Server processing unavailable" : ""}
            >
              {isServerProcessing ? "Server" : "Client"}
            </Button>
            {!isCodingMode && (
              <Button variant="outline" size="sm" onClick={toggleCodingMode}>
                <Image src="/coding-icon.svg" alt="Split Screen" width={16} height={16} className="mr-1" />
                Split
              </Button>
            )}
            {modelClientRef.current && (
              <MCPStatus modelClient={modelClientRef.current} />
            )}
          </div>
        </div>
      </header>

      {/* Content - Adapts between full screen and split screen */}
      {isCodingMode ? (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={50} minSize={30}>
            <ScrollArea className="h-full p-4">
              <div className="container mx-auto space-y-4">
                {messages.filter(msg => msg.role !== 'system').map((message, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={50} minSize={30}>
            {renderEditorPanel()}
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <ScrollArea className="flex-1 p-4">
          <div className="container mx-auto space-y-4 max-w-4xl">
            {messages.filter(msg => msg.role !== 'system').map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[80%] p-3 rounded-lg",
                    message.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-4xl">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Thinking...
                </>
              ) : 'Send'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
