'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ModelClient } from './model-client';
import { ModelType, Message, ChatConfig } from './types';
import { generateChatConfig, getSystemPrompt } from './system-prompt';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, ThumbsUp, ThumbsDown, Code } from 'lucide-react';
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
  const modelClientRef = useRef<ModelClient | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize the model client
  useEffect(() => {
    const modelClient = new ModelClient(config);
    modelClientRef.current = modelClient;

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
      // Try server processing first if enabled
      if (isServerProcessing && !serverFailed) {
        try {
          const response = await modelClientRef.current.chatCompletion(
            selectedModel,
            [...messages, userMessage],
            { useMCP: true } // Enable MCP for sequential thinking
          );

          if (response.choices && response.choices.length > 0) {
            const assistantMessage: Message = {
              role: 'assistant',
              content: response.choices[0].message.content
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Server processing failed, falling back to client:', error);
          // If server processing fails, continue to client processing
          if (!serverFailed) {
            setServerFailed(true);
          }
        }
      }

      // Client processing (or fallback)
      const response = await modelClientRef.current.chatCompletion(
        selectedModel,
        [...messages, userMessage],
        { useMCP: false } // Disable MCP for client-side processing
      );

      if (response.choices && response.choices.length > 0) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.choices[0].message.content
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
          </div>
          <div className="flex items-center space-x-3">
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
