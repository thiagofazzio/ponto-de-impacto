import React from 'react';
import { ArrowRight, Shield, Zap, BarChart3, Users, Target, Sparkles } from 'lucide-react';

interface WelcomeStepProps {
  onStart: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-[#F9F7F3] border border-[#D8D3CB] rounded-full px-4 py-1.5 text-xs font-medium text-[#1A1A1A] mb-6">
        <Sparkles className="w-4 h-4 text-[#6B0F1A]" />
        Diagnóstico Estratégico TFAZZIO • Clareza para sua próxima decisão
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1A1A1A] leading-tight">
        Descubra o <span className="text-[#6B0F1A]">Ponto de Impacto</span> que está travando o crescimento da sua empresa.
      </h1>

      <p className="text-base text-[#5A6270] mt-4 max-w-2xl mx-auto">
        Em menos de 10 minutos, o método TFAZZIO cruza dados oficiais do seu CNPJ com a realidade da sua operação para gerar um relatório completo com seu Índice de Clareza, cálculo do Ponto de Equilíbrio, avaliação de reputação online e um Plano de Ação de 90 Dias.
      </p>

      {/* Grid de Benefícios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 text-left">
        <div className="bg-white border border-[#D8D3CB] rounded-xl p-4 shadow-sm flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#6B0F1A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm text-[#1A1A1A] block">Rápido & Direto</span>
            <span className="text-xs text-[#5A6270]">Menos de 10 minutos sem cadastros longos</span>
          </div>
        </div>
        <div className="bg-white border border-[#D8D3CB] rounded-xl p-4 shadow-sm flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-[#6B0F1A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm text-[#1A1A1A] block">Dados Oficiais</span>
            <span className="text-xs text-[#5A6270]">Busca automática CNPJ via BrasilAPI</span>
          </div>
        </div>
        <div className="bg-white border border-[#D8D3CB] rounded-xl p-4 shadow-sm flex items-start gap-3">
          <Target className="w-5 h-5 text-[#6B0F1A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm text-[#1A1A1A] block">Ponto de Equilíbrio</span>
            <span className="text-xs text-[#5A6270]">Cálculo de margem e faturamento alvo</span>
          </div>
        </div>
        <div className="bg-white border border-[#D8D3CB] rounded-xl p-4 shadow-sm flex items-start gap-3">
          <Users className="w-5 h-5 text-[#6B0F1A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm text-[#1A1A1A] block">Plano de 90 Dias</span>
            <span className="text-xs text-[#5A6270]">Passo a passo com exportação em PDF</span>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="mt-8 px-8 py-4 bg-[#6B0F1A] hover:bg-[#500B13] text-white font-bold rounded-xl text-base shadow-lg transition-all flex items-center gap-3 mx-auto"
      >
        Iniciar Diagnóstico Agora
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* ============================================ */}
      {/* 🆕 NOVO DISCLAIMER DE DADOS */}
      {/* ============================================ */}
      <div className="mt-8 p-4 bg-[#F9F7F3] border border-[#D8D3CB] rounded-xl text-left">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#6B0F1A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-sm text-[#1A1A1A] block">Seus dados são seguros e impulsionam a evolução do nosso motor de diagnóstico</span>
            <p className="text-xs text-[#5A6270] mt-0.5">
              As informações que você compartilhar serão usadas exclusivamente para gerar seu diagnóstico e, de forma anônima, aprimorar nosso sistema de IA, permitindo que a TFAZZIO ofereça análises cada vez mais precisas para todos os negócios. 
              <br />
              <span className="font-semibold text-[#1A1A1A]">Você concorda em contribuir com essa evolução ao realizar o diagnóstico.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};