-- Create schemas
CREATE SCHEMA IF NOT EXISTS "public";

-- Enable Row Level Security
ALTER TABLE IF EXISTS "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."websites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."pages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."github_connections" ENABLE ROW LEVEL SECURITY;

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS "public"."users" (
  "id" UUID NOT NULL DEFAULT auth.uid() PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "full_name" TEXT,
  "avatar_url" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Projects table
CREATE TABLE IF NOT EXISTS "public"."projects" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "user_id" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Websites table
CREATE TABLE IF NOT EXISTS "public"."websites" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "project_id" UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  "domain" TEXT,
  "settings" JSONB DEFAULT '{}'::JSONB NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Pages table
CREATE TABLE IF NOT EXISTS "public"."pages" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "website_id" UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  "html" TEXT DEFAULT '',
  "css" TEXT DEFAULT '',
  "js" TEXT DEFAULT '',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(website_id, slug)
);

-- GitHub connections table
CREATE TABLE IF NOT EXISTS "public"."github_connections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  "access_token" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_project_id ON public.websites(project_id);
CREATE INDEX IF NOT EXISTS idx_pages_website_id ON public.pages(website_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_user_id ON public.github_connections(user_id);

-- Create the storage.objects trigger for avatar uploads
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update trigger for syncing auth user data
CREATE OR REPLACE FUNCTION public.handle_updated_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET email = new.email,
      full_name = COALESCE(new.raw_user_meta_data->>'full_name', public.users.full_name),
      avatar_url = COALESCE(new.raw_user_meta_data->>'avatar_url', public.users.avatar_url),
      updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_user();

-- ########
-- # RLS Policies for secure table access
-- ########

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON "public"."users"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON "public"."users"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON "public"."projects"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON "public"."projects"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON "public"."projects"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON "public"."projects"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Websites policies
CREATE POLICY "Users can view their own websites"
  ON "public"."websites"
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.websites.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create websites for their projects"
  ON "public"."websites"
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.websites.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own websites"
  ON "public"."websites"
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.websites.project_id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own websites"
  ON "public"."websites"
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE public.projects.id = public.websites.project_id
    AND public.projects.user_id = auth.uid()
  ));

-- Pages policies
CREATE POLICY "Users can view their own pages"
  ON "public"."pages"
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.websites
    JOIN public.projects ON public.websites.project_id = public.projects.id
    WHERE public.pages.website_id = public.websites.id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create pages for their websites"
  ON "public"."pages"
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.websites
    JOIN public.projects ON public.websites.project_id = public.projects.id
    WHERE public.pages.website_id = public.websites.id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own pages"
  ON "public"."pages"
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.websites
    JOIN public.projects ON public.websites.project_id = public.projects.id
    WHERE public.pages.website_id = public.websites.id
    AND public.projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own pages"
  ON "public"."pages"
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.websites
    JOIN public.projects ON public.websites.project_id = public.projects.id
    WHERE public.pages.website_id = public.websites.id
    AND public.projects.user_id = auth.uid()
  ));

-- GitHub connections policies
CREATE POLICY "Users can view their own GitHub connections"
  ON "public"."github_connections"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own GitHub connections"
  ON "public"."github_connections"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub connections"
  ON "public"."github_connections"
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own GitHub connections"
  ON "public"."github_connections"
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 