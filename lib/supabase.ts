import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvrhcylwmdtrhjtttjqs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2cmhjeWx3bWR0cmhqdHR0anFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjY5MzQsImV4cCI6MjA2MTk0MjkzNH0.bSzqN_sZkkIqY_v_s-WjNjrDBikx2Yw2OaGyrG60cOs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', userId);
  
  if (error) throw error;
  return data;
};

export const createProject = async (name: string, description: string, userId: string) => {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ name, description, owner_id: userId }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getWebsites = async (projectId: string) => {
  const { data, error } = await supabase
    .from('websites')
    .select('*')
    .eq('project_id', projectId);
  
  if (error) throw error;
  return data;
};

export const createWebsite = async (projectId: string, name: string, description: string) => {
  const { data, error } = await supabase
    .from('websites')
    .insert([{ project_id: projectId, name, description }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getPages = async (websiteId: string) => {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('website_id', websiteId);
  
  if (error) throw error;
  return data;
};

export const createPage = async (websiteId: string, name: string, path: string, content = {}) => {
  const { data, error } = await supabase
    .from('pages')
    .insert([{ website_id: websiteId, name, path, content }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePage = async (pageId: string, content: any) => {
  const { data, error } = await supabase
    .from('pages')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', pageId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getApiKeys = async (projectId: string) => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('project_id', projectId);
  
  if (error) throw error;
  return data;
};

export const createApiKey = async (projectId: string, name: string) => {
  const key = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('api_keys')
    .insert([{ project_id: projectId, name, key }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteApiKey = async (keyId: string) => {
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId);
  
  if (error) throw error;
  return true;
};

export const getGithubConnections = async (projectId: string) => {
  const { data, error } = await supabase
    .from('github_connections')
    .select('*')
    .eq('project_id', projectId);
  
  if (error) throw error;
  return data;
};

export const createGithubConnection = async (projectId: string, repoUrl: string, accessToken: string) => {
  const { data, error } = await supabase
    .from('github_connections')
    .insert([{ project_id: projectId, repo_url: repoUrl, access_token: accessToken }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}; 