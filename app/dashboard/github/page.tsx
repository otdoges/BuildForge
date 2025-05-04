"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Project, GithubConnection } from "@/lib/types";
import { getProjects, getGithubConnections, createGithubConnection } from "@/lib/supabase";
import { Github, Plus, ExternalLink, RefreshCw, Code, Download, Upload } from "lucide-react";

export default function GitHubPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [githubConnections, setGithubConnections] = useState<GithubConnection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    repoUrl: "",
    accessToken: "",
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      if (user) {
        try {
          const data = await getProjects(user.id);
          setProjects(data);
          if (data.length > 0) {
            setSelectedProjectId(data[0].id);
          }
        } catch (error) {
          console.error("Error fetching projects:", error);
          toast.error("Failed to load projects");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProjects();
  }, [user]);

  useEffect(() => {
    const fetchGithubConnections = async () => {
      if (selectedProjectId) {
        try {
          setLoading(true);
          const data = await getGithubConnections(selectedProjectId);
          setGithubConnections(data);
        } catch (error) {
          console.error("Error fetching GitHub connections:", error);
          toast.error("Failed to load GitHub connections");
        } finally {
          setLoading(false);
        }
      } else {
        setGithubConnections([]);
      }
    };

    fetchGithubConnections();
  }, [selectedProjectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConnectGithub = async () => {
    if (!formData.repoUrl.trim() || !formData.accessToken.trim()) {
      toast.error("Please enter both repository URL and access token");
      return;
    }

    setIsConnecting(true);
    try {
      const newConnection = await createGithubConnection(
        selectedProjectId,
        formData.repoUrl,
        formData.accessToken
      );
      setGithubConnections([...githubConnections, newConnection]);
      toast.success("GitHub repository connected successfully");
      setFormData({ repoUrl: "", accessToken: "" });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error connecting GitHub repository:", error);
      toast.error("Failed to connect GitHub repository");
    } finally {
      setIsConnecting(false);
    }
  };

  const getRepoName = (url: string) => {
    try {
      const parts = new URL(url).pathname.split("/");
      return `${parts[1]}/${parts[2]}`;
    } catch (error) {
      return url;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">GitHub Integration</h1>
          <p className="text-muted-foreground">
            Connect your websites to GitHub repositories
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
            disabled={loading || projects.length === 0}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedProjectId}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Repository
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect GitHub Repository</DialogTitle>
                <DialogDescription>
                  Link your website to a GitHub repository for version control and collaboration.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="repoUrl">Repository URL</Label>
                  <Input
                    id="repoUrl"
                    name="repoUrl"
                    placeholder="https://github.com/username/repo"
                    value={formData.repoUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">
                    GitHub Personal Access Token
                  </Label>
                  <Input
                    id="accessToken"
                    name="accessToken"
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxx"
                    value={formData.accessToken}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Create a token with repo scope at{" "}
                    <a
                      href="https://github.com/settings/tokens/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      GitHub Settings
                    </a>
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConnectGithub}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect Repository"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {!selectedProjectId || projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Github className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  {projects.length === 0
                    ? "Create a project first to connect a GitHub repository"
                    : "Select a project to view its GitHub connections"}
                </p>
              </CardContent>
            </Card>
          ) : githubConnections.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Github className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No GitHub repositories connected to this project
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Connect your first repository
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {githubConnections.map((connection) => (
                <Card key={connection.id}>
                  <CardHeader>
                    <div className="flex items-center">
                      <Github className="h-5 w-5 mr-2" />
                      <CardTitle>{getRepoName(connection.repo_url)}</CardTitle>
                    </div>
                    <CardDescription>
                      Connected on{" "}
                      {new Date(connection.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
                      <code className="text-xs flex-1 truncate">
                        {connection.repo_url}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <a
                          href={connection.repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Open repository</span>
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      Last synced: Never
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Sync
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-3 w-3" />
                        Push
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-3 w-3" />
                        Pull
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 