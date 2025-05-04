"use client";

import { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface MCPStatusProps {
  modelClient: any;
}

export function MCPStatus({ modelClient }: MCPStatusProps) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [serverInfo, setServerInfo] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!modelClient) return;

    const checkStatus = () => {
      const mcpServers = modelClient.config.mcpServers || {};
      const processes = modelClient.mcpServerProcesses || {};
      
      const newServerInfo: Record<string, boolean> = {};
      let anyActive = false;
      
      for (const serverName of Object.keys(mcpServers)) {
        const isServerActive = Boolean(processes[serverName]);
        newServerInfo[serverName] = isServerActive;
        if (isServerActive) anyActive = true;
      }
      
      setIsActive(anyActive);
      setServerInfo(newServerInfo);
    };

    // Initial check
    checkStatus();
    
    // Check every 5 seconds
    const interval = setInterval(checkStatus, 5000);
    
    return () => clearInterval(interval);
  }, [modelClient]);

  if (!modelClient?.config?.mcpServers) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <Badge variant={isActive ? "success" : "destructive"} className="ml-2">
              MCP {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <h3 className="font-medium mb-1">Model Context Protocol</h3>
            <ul className="space-y-1">
              {Object.entries(serverInfo).map(([name, status]) => (
                <li key={name} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>{name}: {status ? 'Running' : 'Stopped'}</span>
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 