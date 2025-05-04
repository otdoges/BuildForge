"use client";

import { useState, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Editor } from "@monaco-editor/react";
import { Save, Play, Code, Eye, Download, Github } from "lucide-react";

export default function WebEditorPage() {
  const [activeTab, setActiveTab] = useState("preview");
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Website</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <h1>Welcome to My Website</h1>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Services</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section class="hero">
      <h2>Building Beautiful Websites</h2>
      <p>Create stunning websites with our easy-to-use editor.</p>
      <button class="cta-button">Get Started</button>
    </section>
    
    <section class="features">
      <div class="feature">
        <h3>Responsive Design</h3>
        <p>Looks great on any device.</p>
      </div>
      <div class="feature">
        <h3>Fast Loading</h3>
        <p>Optimized for speed.</p>
      </div>
      <div class="feature">
        <h3>Easy to Use</h3>
        <p>No coding skills required.</p>
      </div>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2025 My Website Builder. All rights reserved.</p>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>`);

  const [cssCode, setCssCode] = useState(`* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
}

header {
  background-color: #222;
  color: white;
  padding: 1rem 2rem;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 1rem;
  margin-top: 0.5rem;
}

nav a {
  color: white;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

.hero {
  background-color: #f8f9fa;
  padding: 4rem 2rem;
  text-align: center;
}

.hero h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #555;
}

.cta-button {
  background-color: #4b70e2;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cta-button:hover {
  background-color: #3a5bbf;
}

.features {
  display: flex;
  padding: 4rem 2rem;
  gap: 2rem;
  justify-content: space-between;
}

.feature {
  flex: 1;
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
}

.feature h3 {
  margin-bottom: 1rem;
  color: #4b70e2;
}

footer {
  background-color: #222;
  color: white;
  text-align: center;
  padding: 2rem;
}`);

  const [jsCode, setJsCode] = useState(`document.addEventListener('DOMContentLoaded', function() {
  const ctaButton = document.querySelector('.cta-button');
  
  ctaButton.addEventListener('click', function() {
    alert('Thanks for your interest! This is a demo button.');
  });
});`);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const updatePreview = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(htmlCode);
        doc.close();
        
        // Add CSS
        const style = doc.createElement('style');
        style.innerHTML = cssCode;
        doc.head.appendChild(style);
        
        // Add JS
        const script = doc.createElement('script');
        script.innerHTML = jsCode;
        doc.body.appendChild(script);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="border-b px-4 py-2 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Web Editor</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button size="sm" onClick={updatePreview}>
            <Play className="mr-2 h-4 w-4" />
            Run
          </Button>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={50} minSize={30}>
          <Tabs defaultValue="html" className="h-full flex flex-col">
            <div className="border-b px-4">
              <TabsList>
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="html" className="flex-1 p-0">
              <Editor
                height="100%"
                defaultLanguage="html"
                value={htmlCode}
                onChange={(value) => setHtmlCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </TabsContent>
            <TabsContent value="css" className="flex-1 p-0">
              <Editor
                height="100%"
                defaultLanguage="css"
                value={cssCode}
                onChange={(value) => setCssCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </TabsContent>
            <TabsContent value="js" className="flex-1 p-0">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={jsCode}
                onChange={(value) => setJsCode(value || "")}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                }}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="h-full flex flex-col">
            <div className="border-b px-4 py-2 flex justify-between items-center">
              <div className="flex gap-2">
                <Button 
                  variant={activeTab === "code" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("code")}
                >
                  <Code className="mr-2 h-4 w-4" />
                  Code
                </Button>
                <Button 
                  variant={activeTab === "preview" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setActiveTab("preview")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button size="sm" variant="outline">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </div>
            <div className="flex-1">
              {activeTab === "preview" ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full bg-white"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <ScrollArea className="h-full p-4">
                  <pre className="whitespace-pre-wrap text-sm">{htmlCode}</pre>
                </ScrollArea>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
} 