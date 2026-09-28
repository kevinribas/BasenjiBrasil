import { Metadata } from 'next';
import Link from 'next/link';
import { FileCheck, AlertCircle, Heart, Shield, CheckCircle2, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Termos de Uso | Basenji Brasil',
  description: 'Conheça os Termos de Uso e as regras de convivência comunitária da rede social Basenji Brasil.',
};

export default function TermosPage() {
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-3">
          <FileCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>Regras e Condições de Uso da Comunidade</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
          Termos de Uso
        </h1>
        <p className="text-xs text-stone-400">
          Última atualização: {ultimaAtualizacao} · Versão 1.0
        </p>
      </div>

      {/* 1. Aceitação */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">1</span>
          Aceitação dos Termos
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-0">
          Ao acessar, se cadastrar ou utilizar a plataforma <strong>Basenji Brasil</strong>, você
          declara expressamente que leu, compreendeu e concorda integralmente com estes Termos de
          Uso e com a nossa{' '}
          <Link href="/privacidade" className="text-amber-800 font-semibold underline">
            Política de Privacidade
          </Link>
          . Caso não concorde com qualquer disposição aqui estabelecida, solicitamos que não utilize
          a plataforma.
        </p>
      </section>

      {/* 2. Natureza Comunitária */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">2</span>
          Natureza Comunitária e Sem Fins Lucrativos
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-0">
          O <strong>Basenji Brasil</strong> é uma rede comunitária, colaborativa e gratuita, sem qualquer
          propósito mercantil ou societário. Seu único objetivo é conectar tutores, compartilhar
          experiências e estimular a guarda responsável da raça Basenji no território brasileiro.
        </p>
      </section>

      {/* 3. Cadastro e Segurança */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">3</span>
          Acesso e Autenticação via Login Social
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-2">
          Para garantir autenticidade e facilidade de acesso, a criação de conta no Basenji Brasil
          ocorre exclusivamente por meio de provedores de identidade social (Google e Facebook):
        </p>
        <ul className="text-sm text-stone-600 space-y-1.5 list-disc pl-5 mb-0">
          <li>Você é o único responsável pela segurança e uso de suas contas sociais associadas.</li>
          <li>É expressamente proibido criar contas falsas ou se passar por outro tutor ou criador.</li>
          <li>Cada usuário responde pela veracidade das fotos e informações dos cães cadastrados.</li>
        </ul>
      </section>

      {/* 4. Código de Conduta e Bem-estar Animal */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <Heart className="w-5 h-5 text-rose-500 shrink-0" />
          Código de Convivência e Bem-Estar Animal
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-3">
          Como membros de uma comunidade dedicada a cães, todos os usuários se comprometem a:
        </p>
        <ul className="space-y-2 text-sm text-stone-600 list-none pl-0 mb-0">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Manter tratamento respeitoso, cordial e solidário com todos os tutores da rede.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Proibição de Venda de Animais:</strong> A plataforma NÃO é um classificado comercial para venda ou comércio não regulamentado de filhotes.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Tolerância Zero para Maus-Tratos:</strong> Qualquer apologia ou registro de violência contra animais resultará na exclusão sumária da conta e eventual denúncia às autoridades competentes.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Proibição de publicação de conteúdo difamatório, ofensivo, preconceituoso ou spam publicitário.</span>
          </li>
        </ul>
      </section>

      {/* 5. Responsabilidade em Encontros */}
      <section className="mb-6 bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          Responsabilidade em Encontros Comunitários
        </h2>
        <p className="text-sm text-stone-700 leading-relaxed mb-2">
          A ferramenta de encontros (`/events`) serve unicamente para divulgação voluntária de reuniões
          entre tutores em parques e praças públicas.
        </p>
        <p className="text-sm text-stone-700 leading-relaxed font-semibold mb-2">
          Atenção especial com as particularidades da raça Basenji:
        </p>
        <ul className="text-sm text-stone-600 space-y-1.5 list-disc pl-5 mb-0">
          <li><strong>Uso Obrigatório de Guias/Coleiras:</strong> Devido ao elevado instinto de caça e velocidade do Basenji, recomenda-se fortemente o uso contínuo de guias duplas e coleiras seguras durante encontros em áreas abertas.</li>
          <li><strong>Responsabilidade Individual do Tutor:</strong> Cada tutor é integral e civilmente responsável por eventuais acidentes, danos a terceiros, comportamento e saúde (vacinação em dia) do seu respectivo cão. A plataforma Basenji Brasil não possui qualquer responsabilidade jurídica ou material por incidentes ocorridos em encontros presenciais.</li>
        </ul>
      </section>

      {/* 6. Conteúdo e Propriedade Intelectual */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">6</span>
          Conteúdo Publicado e Propriedade Intelectual
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-2">
          Ao enviar fotos e textos sobre seus Basenjis:
        </p>
        <ul className="text-sm text-stone-600 space-y-1.5 list-disc pl-5 mb-0">
          <li>Você mantém todos os direitos autorais sobre as imagens originais dos seus cães.</li>
          <li>Você concede ao Basenji Brasil uma licença gratuita e não exclusiva para exibir as imagens dentro da plataforma para outros membros da comunidade.</li>
          <li>Você garante que possui autorização para publicar as fotos enviadas.</li>
        </ul>
      </section>

      {/* 7. Suspensão e Encerramento */}
      <section className="mb-6 bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">7</span>
          Encerramento e Modificação de Serviços
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-0">
          O usuário pode a qualquer momento excluir sua conta ou cães através das opções da própria plataforma.
          A moderação da comunidade reserva-se o direito de advertir, suspender ou excluir contas que violem
          este código de conduta ou que gerem risco à integridade dos participantes.
        </p>
      </section>

      {/* 8. Foro e Legislação */}
      <section className="bg-white p-5 rounded-2xl border border-stone-200/70 shadow-xs">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2 mt-0 mb-3">
          <Shield className="w-5 h-5 text-amber-600 shrink-0" />
          Legislação Aplicável e Foro
        </h2>
        <p className="text-sm text-stone-600 leading-relaxed mb-0">
          Estes Termos de Uso são regidos e interpretados em conformidade com as leis da República Federativa
          do Brasil, em especial o Marco Civil da Internet (Lei nº 12.965/2014) e a LGPD (Lei nº 13.709/2018).
        </p>
      </section>
    </article>
  );
}
