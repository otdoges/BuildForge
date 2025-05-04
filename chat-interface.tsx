'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ModelClient } from './model-client';
import { ModelType, Message, ChatConfig } from './types';
import { generateChatConfig, getSystemPrompt } from './system-prompt';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Download, ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from "@/lib/utils"

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

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value as ModelType);
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
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-lg mr-2">B</div>
          <h1 className="text-xl font-bold">BuildBox</h1>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="password"
            value={token}
            onChange={handleTokenChange}
            placeholder="GitHub Token"
            className="px-3 py-1 bg-gray-700 rounded-md text-white text-sm"
          />
          <button 
            onClick={saveToken}
            className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-md text-sm"
          >
            Save Token
          </button>
          <select 
            value={selectedModel}
            onChange={handleModelChange}
            className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm"
          >
            {config.models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(msg => msg.role !== 'system').map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-3/4 p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-violet-600 text-white' 
                  : 'bg-gray-700 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-gray-800">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-700 rounded-md text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-md font-medium disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
