-- =============================================================
-- Basenji Brasil – Migração 002: Confirmar RLS update/delete basenjis
-- Execute no SQL Editor do Supabase se as políticas não existirem
-- (idempotente — usa IF NOT EXISTS via DO block)
-- =============================================================

DO $$
BEGIN
  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'basenjis'
      AND policyname = 'Tutor atualiza seus próprios basenjis'
  ) THEN
    CREATE POLICY "Tutor atualiza seus próprios basenjis"
      ON public.basenjis FOR UPDATE
      USING      (auth.uid() = dono_id)
      WITH CHECK (auth.uid() = dono_id);
  END IF;

  -- DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'basenjis'
      AND policyname = 'Tutor exclui seus próprios basenjis'
  ) THEN
    CREATE POLICY "Tutor exclui seus próprios basenjis"
      ON public.basenjis FOR DELETE
      USING (auth.uid() = dono_id);
  END IF;
END;
$$;
