-- =============================================================
-- Basenji Brasil – Migração Inicial do Banco de Dados
-- Supabase PostgreSQL | Row Level Security habilitado
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. TABELA: profiles
--    Espelho público de auth.users com campos de localização
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT        NOT NULL DEFAULT '',
  email       TEXT        NOT NULL DEFAULT '',
  avatar_url  TEXT,
  cidade      TEXT,
  estado      CHAR(2),     -- sigla do estado (ex: SP, RJ)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Leitura pública (qualquer usuário autenticado pode ver perfis)
CREATE POLICY "Perfis visíveis para todos autenticados"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Gravação apenas pelo próprio usuário
CREATE POLICY "Usuário atualiza próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────────────────────────
-- 2. TABELA: basenjis
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.basenjis (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  dono_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome        TEXT        NOT NULL,
  data_nasc   DATE,
  sexo        TEXT        NOT NULL CHECK (sexo IN ('macho', 'femea')),
  cor         TEXT        NOT NULL,
  foto_url    TEXT,
  bio         TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.basenjis ENABLE ROW LEVEL SECURITY;

-- Leitura pública para todos autenticados
CREATE POLICY "Basenjis visíveis para todos autenticados"
  ON public.basenjis FOR SELECT
  USING (auth.role() = 'authenticated');

-- Inserção apenas para o próprio usuário
CREATE POLICY "Tutor insere seus próprios basenjis"
  ON public.basenjis FOR INSERT
  WITH CHECK (auth.uid() = dono_id);

-- Atualização apenas pelo dono
CREATE POLICY "Tutor atualiza seus próprios basenjis"
  ON public.basenjis FOR UPDATE
  USING (auth.uid() = dono_id)
  WITH CHECK (auth.uid() = dono_id);

-- Exclusão apenas pelo dono
CREATE POLICY "Tutor exclui seus próprios basenjis"
  ON public.basenjis FOR DELETE
  USING (auth.uid() = dono_id);

-- ─────────────────────────────────────────────────────────────
-- 3. TABELA: events
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  criador_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo      TEXT        NOT NULL,
  descricao   TEXT,
  local       TEXT        NOT NULL,
  cidade      TEXT        NOT NULL,
  estado      CHAR(2)     NOT NULL,
  data_hora   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos visíveis para todos autenticados"
  ON public.events FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuário cria eventos"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = criador_id);

CREATE POLICY "Criador atualiza seu evento"
  ON public.events FOR UPDATE
  USING (auth.uid() = criador_id)
  WITH CHECK (auth.uid() = criador_id);

CREATE POLICY "Criador exclui seu evento"
  ON public.events FOR DELETE
  USING (auth.uid() = criador_id);

-- ─────────────────────────────────────────────────────────────
-- 4. TABELA: event_attendees
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id   UUID        NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  usuario_id  UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT        NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'not_going')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT event_attendees_unique UNIQUE (evento_id, usuario_id)
);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Confirmações visíveis para todos autenticados"
  ON public.event_attendees FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuário confirma presença"
  ON public.event_attendees FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuário atualiza própria presença"
  ON public.event_attendees FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuário cancela própria presença"
  ON public.event_attendees FOR DELETE
  USING (auth.uid() = usuario_id);

-- ─────────────────────────────────────────────────────────────
-- 5. TRIGGER: popula profiles ao registrar com Google/Facebook
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email, ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
    SET
      nome       = EXCLUDED.nome,
      email      = EXCLUDED.email,
      avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$;

-- Remove trigger existente antes de recriar (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- 6. STORAGE: bucket para fotos dos basenjis
-- ─────────────────────────────────────────────────────────────
-- Execute no painel Supabase > Storage, ou via API:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('basenjis', 'basenjis', true)
-- ON CONFLICT DO NOTHING;

-- Policy de leitura pública no bucket basenjis
-- CREATE POLICY "Fotos públicas" ON storage.objects
--   FOR SELECT USING (bucket_id = 'basenjis');

-- Policy de upload apenas para autenticados
-- CREATE POLICY "Autenticados podem fazer upload" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'basenjis' AND auth.role() = 'authenticated');
