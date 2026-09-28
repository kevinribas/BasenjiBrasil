import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, FileText, CheckCircle2, Mail, Trash2, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Basenji Brasil',
  description: 'Conheça como o Basenji Brasil protege seus dados pessoais de acordo com a LGPD e as diretrizes do Google e Meta.',
};

export default function PrivacidadePage() {
  const ultimaAtualizacao = '28 de setembro de 2026';

  return (
    <article className="prose prose-stone max-w-none">
      {/* Botão voltar */}
      <div className="mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-amber-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o Login
        </Link>
      </div>

      {/* Título e Badge */}
      <div className="border-b border-stone-200/80 pb-5 mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Em conformidade com a LGPD (Lei nº 13.709/2018)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
          Política de Privacidade
        </h1>
        <p className="text-xs text-stone-400">
          Última atualização: {ultimaAtualizacao} · Versão 1.0
        </p>
      </div>

      {/* Introdução */}
      <section className="mb-6">
        <p className="text-sm text-stone-600 leading-relaxed">
          O <strong>Basenji Brasil</strong> é uma plataforma comunitária, sem fins lucrativos,
          desenvolvida por tutores e amantes da raça Basenji no Brasil. Esta Política de Privacidade
          descreve de forma transparente e acessível como coletamos, utilizamos, armazenamos e
          protegemos os seus dados pessoais, em estrita conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (Lei Federal nº 13.709/2018 - LGPD)</strong> e as
          diretrizes de proteção de dados das plataformas <strong>Google Cloud Platform</strong> e{' '}
          <strong>Meta for Developers (Facebook Login)</strong>.
        </p>
      </section>

      {/* 1. Controlador e Contato */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-2">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">1</span>
          Controlador dos Dados e Canal de Comunicação
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-2">
          A comunidade <strong>Basenji Brasil</strong> atua como controladora dos dados pessoais fornecidos
          pelos usuários. Para quaisquer dúvidas, solicitações ou exercício de direitos relacionados à sua
          privacidade, disponibilizamos o seguinte canal:
        </p>
        <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl text-xs text-stone-700 font-medium">
          <Mail className="w-4 h-4 text-amber-600 shrink-0" />
          <span>E-mail de Contato & Encarregado (DPO):</span>
          <a href="mailto:contato@basenjibrasil.com" className="text-amber-800 font-semibold underline">
            contato@basenjibrasil.com
          </a>
        </div>
      </section>

      {/* 2. Dados Coletados */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">2</span>
          Quais Dados Coletamos
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">
          Coletamos apenas os dados estritamente necessários para permitir o funcionamento da rede comunitária:
        </p>
        <ul className="space-y-2 text-sm text-stone-600 list-none pl-0">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Dados de Autenticação Social (Google / Facebook):</strong> Nome completo, endereço de e-mail e foto pública de perfil (avatar).{' '}
              <span className="text-stone-500 text-xs block mt-0.5">
                *Não solicitamos, não temos acesso e não armazenamos senhas de acesso aos provedores de identidade.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Dados de Localização Básica do Tutor:</strong> Cidade e Estado (UF), informados voluntariamente no onboarding para conectar tutores próximos.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Dados dos Cães (Basenjis):</strong> Nome do cão, data de nascimento/idade, sexo, cor/pelagem, breve biografia e fotografias enviadas pelo tutor.
            </div>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Encontros e Eventos:</strong> Título, data/hora, local e confirmação de presença voluntária em encontros da raça.
            </div>
          </li>
        </ul>
      </section>

      {/* 3. Finalidade do Tratamento */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">3</span>
          Finalidade e Base Legal do Tratamento
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-2">
          Utilizamos seus dados exclusivamente para os seguintes propósitos legítimos:
        </p>
        <ul className="text-sm text-stone-600 space-y-1.5 list-disc pl-5">
          <li>Autenticação e verificação de identidade segura via login social.</li>
          <li>Criação e exibição do perfil público do Basenji na comunidade.</li>
          <li>Filtro e aproximação de tutores por estado e cidade.</li>
          <li>Organização de encontros e eventos locais da raça.</li>
          <li>Comunicação sobre atualizações de segurança e termos da plataforma.</li>
        </ul>
        <p className="text-xs text-stone-500 mt-3 font-medium bg-amber-50/70 p-3 rounded-xl border border-amber-200/50">
          🔒 <strong>Compromisso de Não Comercialização:</strong> O Basenji Brasil NÃO vende, NÃO aluga e NÃO monetiza dados pessoais de seus membros para terceiros sob nenhuma hipótese.
        </p>
      </section>

      {/* 4. Compartilhamento e Operadores */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">4</span>
          Compartilhamento com Terceiros
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">
          Os dados são compartilhados unicamente com provedores de infraestrutura essenciais para a operação do sistema:
        </p>
        <ul className="text-sm text-stone-600 space-y-1.5 list-disc pl-5">
          <li><strong>Supabase Inc.:</strong> Provedor seguro de banco de dados, armazenamento de imagens e gestão de autenticação.</li>
          <li><strong>Vercel Inc.:</strong> Hospedagem e entrega da aplicação web via servidores seguros.</li>
          <li><strong>Google LLC e Meta Platforms Inc.:</strong> Provedores de identidade para viabilizar o login OAuth seguro solicitado pelo próprio usuário.</li>
        </ul>
      </section>

      {/* 5. Direitos dos Titulares (LGPD) */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">5</span>
          Seus Direitos como Titular de Dados (Art. 18 da LGPD)
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">
          De acordo com a Lei Geral de Proteção de Dados, você tem o direito de, a qualquer momento e mediante solicitação:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
          <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/60">✓ Confirmar a existência de tratamento</div>
          <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/60">✓ Acessar seus dados pessoais</div>
          <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/60">✓ Corrigir dados incompletos ou desatualizados</div>
          <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/60">✓ Excluir seus cães ou sua conta permanentemente</div>
          <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/60">✓ Revogar consentimentos anteriormente concedidos</div>
          <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200/60">✓ Solicitar a portabilidade dos dados</div>
        </div>
      </section>

      {/* 6. Exclusão de Dados (Diretrizes Meta / Facebook) */}
      <section className="mb-6 bg-rose-50/50 p-5 rounded-2xl border border-rose-200/80 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-2">
          <Trash2 className="w-5 h-5 text-rose-600 shrink-0" />
          Instruções para Exclusão de Dados do Usuário (Meta / Facebook)
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">
          Em cumprimento aos termos de plataforma da Meta/Facebook e à LGPD, disponibilizamos métodos diretos e rápidos para exclusão completa de todos os seus dados:
        </p>
        <ol className="text-sm text-stone-600 space-y-2 list-decimal pl-5">
          <li>
            <strong>Exclusão Direta pela Plataforma:</strong> Acesse seu <strong>Perfil</strong> no Basenji Brasil, onde você pode excluir individualmente os perfis e fotos dos seus cães. Para exclusão integral da sua conta de usuário, basta clicar em &ldquo;Excluir minha conta&rdquo; ou enviar uma mensagem através do e-mail de suporte.
          </li>
          <li>
            <strong>Revogação via Configurações do Facebook:</strong> Você pode revogar o acesso do Basenji Brasil acessando: <em>Configurações do Facebook &gt; Configurações e Privacidade &gt; Aplicativos e Sites</em>, localizando o aplicativo <strong>Basenji Brasil</strong> e clicando em <strong>Remover</strong>.
          </li>
          <li>
            <strong>Solicitação Expressa por E-mail:</strong> Envie um e-mail para{' '}
            <a href="mailto:contato@basenjibrasil.com?subject=Solicitacao%20de%20Exclusao%20de%20Dados" className="text-rose-700 font-bold underline">
              contato@basenjibrasil.com
            </a>{' '}
            com o assunto <em>&ldquo;Exclusão de Dados Pessoais&rdquo;</em> utilizando o e-mail associado à sua conta. Seus dados e registros serão eliminados definitivamente dos nossos servidores em até 5 dias úteis.
          </li>
        </ol>
      </section>

      {/* 7. Segurança e Armazenamento */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          Segurança das Informações
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          Adotamos medidas técnicas e administrativas aptas a proteger seus dados pessoais de acessos não autorizados
          e de situações acidentais ou ilícitas. Todo o tráfego de dados é protegido por criptografia de ponta a ponta
          via protocolo HTTPS/TLS, e os dados de aplicação são protegidos por políticas rigorosas de Row Level Security (RLS)
          no banco de dados gerenciado pelo Supabase.
        </p>
      </section>

      {/* 8. Alterações desta Política */}
      <section className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-2">
          <FileText className="w-5 h-5 text-amber-600 shrink-0" />
          Alterações nesta Política de Privacidade
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-0">
          Podemos atualizar esta Política periodicamente para refletir melhorias no sistema ou mudanças legais.
          Recomendamos a revisão regular deste documento. O uso contínuo da plataforma após atualizações constitui
          a aceitação das práticas descritas.
        </p>
      </section>
    </article>
  );
}
