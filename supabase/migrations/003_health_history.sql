-- =============================================================
-- Basenji Brasil – Migração 003: Histórico de Saúde e Cuidados
-- Adiciona suporte a histórico de saúde na tabela basenjis
-- =============================================================

ALTER TABLE public.basenjis 
ADD COLUMN IF NOT EXISTS condicoes_saude JSONB DEFAULT '[]'::jsonb;

-- Índice GIN para consultas agregadas e estatísticas comunitárias
CREATE INDEX IF NOT EXISTS idx_basenjis_condicoes_saude 
ON public.basenjis USING GIN (condicoes_saude);
