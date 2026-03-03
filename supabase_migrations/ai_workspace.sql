-- AI Code Workspace - New tables for AveronSoft
-- Run this in Supabase SQL Editor after the main schema

-- AI Workspace Files table
CREATE TABLE IF NOT EXISTS ai_workspace_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL DEFAULT 'default',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  content TEXT DEFAULT '',
  language TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, workspace_id, file_path)
);

-- AI Workspace Embeddings table (for context engine - chunks for semantic search)
CREATE TABLE IF NOT EXISTS ai_workspace_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES ai_workspace_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_workspace_files_user_id ON ai_workspace_files(user_id);
CREATE INDEX idx_ai_workspace_files_workspace_id ON ai_workspace_files(workspace_id);
CREATE INDEX idx_ai_workspace_embeddings_file_id ON ai_workspace_embeddings(file_id);
CREATE INDEX idx_ai_workspace_embeddings_user_id ON ai_workspace_embeddings(user_id);

-- RLS
ALTER TABLE ai_workspace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workspace_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_workspace_files
CREATE POLICY "Users can view their own ai workspace files"
  ON ai_workspace_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ai workspace files"
  ON ai_workspace_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai workspace files"
  ON ai_workspace_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ai workspace files"
  ON ai_workspace_files FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_workspace_embeddings
CREATE POLICY "Users can view their own embeddings"
  ON ai_workspace_embeddings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own embeddings"
  ON ai_workspace_embeddings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own embeddings"
  ON ai_workspace_embeddings FOR DELETE
  USING (auth.uid() = user_id);
