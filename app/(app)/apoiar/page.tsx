'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, Heart, Sparkles, Coffee } from 'lucide-react';

const CHAVE_PIX = '+5555999010131';

export default function ApoiarPage() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(CHAVE_PIX);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Erro ao copiar chave:', err);
    }
  }

  return (
    <div className="px-4 pt-3 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/feed"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 text-stone-500 active:bg-stone-200 transition-colors shrink-0"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-bold text-stone-800 text-lg leading-tight flex items-center gap-1.5">
            Apoiar a Comunidade
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
          </h1>
          <p className="text-xs text-stone-400">Projeto sem fins lucrativos feito para tutores</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Card de Mensagem Transparente */}
        <div className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-amber-500/5 rounded-3xl p-5 border border-amber-200/60 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wide mb-1.5">
                Comunitário & Voluntário
              </span>
              <h2 className="text-base font-bold text-stone-800 leading-snug">
                Feito com amor pela nossa comunidade
              </h2>
            </div>
          </div>

          <p className="mt-3 text-sm text-stone-600 leading-relaxed">
            O <strong>Basenji Brasil</strong> é uma iniciativa totalmente sem fins lucrativos,
            criada exclusivamente para unir tutores, organizar encontros e celebrar a vida dos
            nossos amados cães.
          </p>
        </div>

        {/* Card do QR Code e Chave Pix */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 flex flex-col items-center">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
            Contribuição via Pix
          </span>

          {/* Container do QR Code */}
          <div className="relative w-56 h-56 rounded-2xl overflow-hidden p-3 bg-white border-2 border-amber-100 shadow-md flex items-center justify-center">
            <Image
              src="/images/pix-qrcode.png"
              alt="QR Code Pix Basenji Brasil"
              width={200}
              height={200}
              className="object-contain rounded-xl"
              priority
            />
          </div>

          <p className="text-xs text-stone-400 mt-3 text-center">
            Abra o app do seu banco e aponte a câmera para ler o QR Code
          </p>

          {/* Divisor */}
          <div className="w-full flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-[11px] font-medium text-stone-400 uppercase">ou copie a chave</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          {/* Caixa da Chave Pix */}
          <div className="w-full bg-stone-50 rounded-2xl p-3 border border-stone-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1 pl-1">
              <span className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Chave Pix (Telefone)
              </span>
              <span className="font-mono text-sm font-semibold text-stone-800 tracking-wide select-all truncate block">
                {CHAVE_PIX}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-95 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
              }`}
              aria-label="Copiar Chave Pix"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Chave</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback temporário */}
          {copied && (
            <p className="text-xs font-medium text-emerald-600 mt-2 text-center animate-fade-in flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" /> Chave copiada para a área de transferência!
            </p>
          )}
        </div>

        {/* Mensagem de Gratidão */}
        <div className="text-center py-3 px-4">
          <p className="text-xs text-stone-400 flex items-center justify-center gap-1.5">
            <Coffee className="w-3.5 h-3.5 text-amber-500" />
            Qualquer valor faz a diferença na continuidade do projeto.
          </p>
          <p className="text-xs font-medium text-stone-500 mt-1">
            Muito obrigado pelo carinho com a raça Basenji no Brasil! 🐾
          </p>
        </div>
      </div>
    </div>
  );
}
