-- FightReplay AI Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ PROFILES TABLE ============
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  ads_consent BOOLEAN DEFAULT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============ UPLOADS TABLE ============
CREATE TABLE IF NOT EXISTS uploads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_paths TEXT[] NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;

-- Uploads policies
CREATE POLICY "Users can view own uploads" ON uploads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create uploads" ON uploads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own uploads" ON uploads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own uploads" ON uploads
  FOR DELETE USING (auth.uid() = user_id);

-- ============ CONVERSATIONS TABLE ============
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES uploads(id) ON DELETE SET NULL,
  timeline_json JSONB NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- ============ BATTLES TABLE ============
CREATE TABLE IF NOT EXISTS battles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  participant_a_name TEXT NOT NULL,
  participant_b_name TEXT NOT NULL,
  attacks_json JSONB NOT NULL,
  analysis_json JSONB,
  winner TEXT CHECK (winner IN ('A', 'B') OR winner IS NULL),
  final_hp_a INTEGER DEFAULT 100,
  final_hp_b INTEGER DEFAULT 100,
  stats_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Battles policies
CREATE POLICY "Users can view own battles" ON battles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create battles" ON battles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own battles" ON battles
  FOR DELETE USING (auth.uid() = user_id);

-- ============ SHARE CARDS TABLE ============
CREATE TABLE IF NOT EXISTS share_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  public_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public BOOLEAN DEFAULT TRUE,
  image_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Enable RLS
ALTER TABLE share_cards ENABLE ROW LEVEL SECURITY;

-- Share cards policies
CREATE POLICY "Anyone can view public share cards" ON share_cards
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can view own share cards" ON share_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create share cards" ON share_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own share cards" ON share_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own share cards" ON share_cards
  FOR DELETE USING (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_battles_user_id ON battles(user_id);
CREATE INDEX IF NOT EXISTS idx_battles_conversation_id ON battles(conversation_id);
CREATE INDEX IF NOT EXISTS idx_share_cards_public_token ON share_cards(public_token);
CREATE INDEX IF NOT EXISTS idx_share_cards_battle_id ON share_cards(battle_id);

-- ============ STORAGE BUCKETS ============
-- Run these in Supabase dashboard or via API

-- INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('assets', 'assets', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('share-cards', 'share-cards', true);

-- Storage policies (run separately)
-- CREATE POLICY "Users can upload to uploads bucket" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'uploads' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can read own uploads" ON storage.objects
--   FOR SELECT USING (
--     bucket_id = 'uploads' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Anyone can read public share cards" ON storage.objects
--   FOR SELECT USING (bucket_id = 'share-cards');
