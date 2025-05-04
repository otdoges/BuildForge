'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ModelClient } from './model-client';
import { ModelType, Message, ChatConfig } from './types';
import { generateChatConfig, getSystemPrompt } from './system-prompt';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from "@/lib/utils";

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
  const [token, setToken] = useState('');
  const modelClientRef = useRef<ModelClient | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize the model client
  useEffect(() => {
    const modelClient = new ModelClient(config);
    modelClientRef.current = modelClient;

    // Try to get token from environment
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('github_token');
      if (storedToken) {
        setToken(storedToken);
        modelClient.setToken(storedToken);
      }
    }

    // Add system message for the selected model
    const systemMessage: Message = {
      role: 'system',
      content: getSystemPrompt(selectedModel)
    };
    setMessages([systemMessage]);
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

  const handleModelChange = (value: string) => {
    setSelectedModel(value as ModelType);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value);
  };

  const saveToken = () => {
    if (token && modelClientRef.current) {
      localStorage.setItem('github_token', token);
      modelClientRef.current.setToken(token);
      alert('GitHub token saved!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !modelClientRef.current) return;

    // Check if token is set
    if (!token) {
      alert('Please enter your GitHub token first');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await modelClientRef.current.chatCompletion(
        selectedModel,
        [...messages, userMessage]
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

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mr-2">B</div>
            <h1 className="text-xl font-bold">BuildBox</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              <Input
                type="password"
                value={token}
                onChange={handleTokenChange}
                placeholder="GitHub Token"
                className="w-60 h-9"
              />
              <Button onClick={saveToken} size="sm">
                Save Token
              </Button>
            </div>
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
          </div>
        </div>
      </header>

      {/* Messages */}
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
              {isLoading ? 'Thinking...' : 'Send'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
