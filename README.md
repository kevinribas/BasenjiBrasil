# Basenji Brasil 🐕

Uma rede social mobile-first para a comunidade de tutores da raça Basenji no Brasil.

## Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **Estilização**: Tailwind CSS v4 (Mobile-First)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Ícones**: Lucide React

## Estrutura do Projeto

```
app/
  (auth)/
    login/          # Tela de login com Google e Facebook OAuth
    onboarding/     # Onboarding para cidade/estado no primeiro acesso
  (app)/
    feed/           # Lista de Basenjis com filtros de localização
    events/         # Encontros e eventos com confirmação de presença
    basenjis/new/   # Formulário de cadastro de Basenji
    profile/        # Perfil do tutor e seus cães
  api/
    auth/callback/  # Callback OAuth → redireciona para onboarding se necessário
components/
  layout/           # BottomNav, TopBar
  features/         # Componentes específicos por feature
lib/supabase/       # Clientes browser/server do Supabase
hooks/              # Custom hooks (useProfile)
types/              # Interfaces TypeScript e enums BR
supabase/
  migrations/       # Scripts SQL com schema + RLS + Triggers
```

## Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Banco de Dados Supabase

Execute o script em `supabase/migrations/001_initial_schema.sql` no **SQL Editor** do painel Supabase.

Isso irá criar:
- Tabelas: `profiles`, `basenjis`, `events`, `event_attendees`
- RLS habilitado em todas as tabelas
- Trigger `on_auth_user_created` → popula `profiles` automaticamente no login social

### 3. Storage Supabase

No painel Supabase > Storage, crie um bucket público chamado `basenjis`.

### 4. OAuth (Google)

No painel Supabase > Authentication > Providers:
- Habilite **Google**
- Configure `Client ID` e `Client Secret` do Google Cloud Console
- Adicione `https://<seu-projeto>.supabase.co/auth/v1/callback` nas URIs autorizadas do Google

### 5. Executar

```bash
npm install
npm run dev
```

## Fluxo de Deploy e Branches

O projeto adota um fluxo de Git Flow simplificado para garantir estabilidade e testes prévios:

- **`develop`**: Branch ativa para desenvolvimento e testes locais (`npm run dev`). Todas as novas features, telas e correções devem ser criadas e integradas aqui.
- **`main`**: Branch oficial de produção conectada aos deploys automáticos da Vercel. Apenas versões testadas, estáveis e homologadas em `develop` recebem merge para a `main`.

```bash
# Para iniciar o trabalho no dia a dia:
git checkout develop

# Para promover versão estável à produção:
git checkout main
git merge develop
git push origin main
git checkout develop
```

