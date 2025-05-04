"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Book, Code, FileCode, FileText, Terminal } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="container max-w-6xl py-10">
      <div className="flex flex-col gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Documentation</h1>
          <p className="text-lg text-muted-foreground">Learn how to use BuildBox and its AI models</p>
        </div>
        
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="webcontainer">WebContainer</TabsTrigger>
            <TabsTrigger value="apis">API Reference</TabsTrigger>
          </TabsList>
          
          <TabsContent value="getting-started" className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <h2 className="text-2xl font-bold">Getting Started with BuildBox</h2>
                <p>BuildBox is a powerful website builder that integrates with multiple AI models to help you create websites quickly and efficiently. Follow these steps to get started:</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Terminal className="h-5 w-5" />
                      Step 1: Set up your environment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Create a GitHub token with <code>models:read</code> permission</li>
                      <li>Add your token to the environment variables</li>
                      <li>Install required dependencies</li>
                    </ol>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/docs/environment">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Step 2: Create your first project
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Navigate to the dashboard</li>
                      <li>Click on "New Project"</li>
                      <li>Select a template or start from scratch</li>
                      <li>Start building your website</li>
                    </ol>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/docs/projects">
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="models" className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <h2 className="text-2xl font-bold">AI Models</h2>
                <p>BuildBox integrates with multiple AI models to provide different capabilities. Each model has its strengths and use cases:</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>GPT-4.1</CardTitle>
                    <CardDescription>Advanced reasoning and coding capabilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Excellent for complex problem solving and generating clean, well-structured code. Provides comprehensive solutions with a focus on security and best practices.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>O4-Mini</CardTitle>
                    <CardDescription>Fast and efficient coding assistance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Specialized in rapid prototyping and efficient solutions. Great for quick implementations and modern JavaScript/TypeScript patterns.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Phi-4 Reasoning</CardTitle>
                    <CardDescription>Methodical reasoning and problem decomposition</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Excels at breaking down complex problems into manageable steps. Provides logical, well-structured solutions with clear reasoning.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>GPT-4.1 Nano</CardTitle>
                    <CardDescription>Lightweight, efficient implementations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Focused on minimal, elegant code with optimization for performance. Great for browser compatibility and resource efficiency.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Llama-4 Maverick</CardTitle>
                    <CardDescription>Creative problem-solving and reasoning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Specializes in creative approaches to complex problems. Balances innovation with pragmatic implementation and user experience.</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>BuildBox Combined</CardTitle>
                    <CardDescription>Multi-model intelligence system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Leverages the strengths of all models to provide comprehensive solutions. The default and recommended option for most users.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="webcontainer" className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <h2 className="text-2xl font-bold">WebContainer</h2>
                <p>BuildBox uses WebContainer technology to create and test websites entirely in your browser without requiring a server or backend.</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="h-5 w-5" />
                      WebContainer Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li>In-browser Node.js runtime</li>
                      <li>Local file system simulation</li>
                      <li>NPM package management</li>
                      <li>Real-time preview of changes</li>
                      <li>JavaScript/TypeScript execution</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Limitations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Cannot run native binaries</li>
                      <li>Limited to browser-compatible code</li>
                      <li>No C/C++ compiler available</li>
                      <li>Python limited to standard library</li>
                      <li>No Git support</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="apis" className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <h2 className="text-2xl font-bold">API Reference</h2>
                <p>BuildBox provides several APIs for working with AI models, data storage, and website building.</p>
              </div>
              
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      AI Model API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">The ModelClient class provides methods for interacting with AI models:</p>
                    <div className="space-y-2">
                      <div className="p-2 bg-muted rounded-md">
                        <code>setToken(token: string): void</code>
                        <p className="text-sm text-muted-foreground mt-1">Sets the GitHub authentication token for API calls.</p>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <code>chatCompletion(modelType: ModelType, messages: Message[], options?: Options): Promise&lt;ChatResponse&gt;</code>
                        <p className="text-sm text-muted-foreground mt-1">Sends a chat completion request to the specified model.</p>
                      </div>
                      <div className="p-2 bg-muted rounded-md">
                        <code>processToolCall(modelType: ModelType, messages: Message[], toolCall: any, toolFunction: Function): Promise&lt;ChatResponse&gt;</code>
                        <p className="text-sm text-muted-foreground mt-1">Processes a tool call from the model response.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/docs/api-reference">
                        View Full API Reference <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 