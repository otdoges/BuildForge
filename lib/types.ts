export interface Project {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Website {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  website_id: string;
  name: string;
  path: string;
  content: PageContent;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  components: Component[];
  styles?: Record<string, any>;
  settings?: PageSettings;
}

export interface PageSettings {
  title?: string;
  description?: string;
  favicon?: string;
  customScripts?: string[];
  customStyles?: string[];
}

export interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Component[];
  styles?: Record<string, any>;
}

export interface ApiKey {
  id: string;
  project_id: string;
  name: string;
  key: string;
  created_at: string;
  expires_at: string | null;
}

export interface GithubConnection {
  id: string;
  project_id: string;
  repo_url: string;
  access_token: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
} 