import React from 'react';
import { Sparkles, Target, Clock, FileText } from 'lucide-react';

interface WelcomeStepProps {
  onStart: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F4E8C1] border border-[#D4AF37]/50 text-[#6B0F1A] text-sm font-bold">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          Diagnóstico Estratégico TFAZZIO
        </div>
        <h1 className="text-4xl font-black text-[#1A1A1A] leading-tight">
          Descubra o <span className="text-[#6B0F1A]">Ponto de Impacto</span>
          <br />
          que está travando seu negócio
        </h1>
        <p className="text-[#5A6270] text-lg max-w-2xl mx-auto">
          Em menos de 10 minutos, o método TFAZZIO cruza dados do seu CNPJ com a realidade da sua operação
          para gerar um relatório completo com seu Índice de Clareza e um Plano de Ação de 90 Dias.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D8D3CB] shadow-sm text-center">
          <Clock className="w-8 h-8 text-[#6B0F1A] mx-auto mb-2" />
          <h3 className="font-bold text-[#1A1A1A]">Rápido & Direto</h3>
          <p className="text-sm text-[#5A6270]">Menos de 10 minutos sem cadastros longos</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#D8D3CB] shadow-sm text-center">
          <Target className="w-8 h-8 text-[#6B0F1A] mx-auto mb-2" />
          <h3 className="font-bold text-[#1A1A1A]">Dados Oficiais</h3>
          <p className="text-sm text-[#5A6270]">Busca automática CNPJ via BrasilAPI</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-[#D8D3CB] shadow-sm text-center">
          <FileText className="w-8 h-8 text-[#6B0F1A] mx-auto mb-2" />
          <h3 className="font-bold text-[#1A1A1A]">Plano de 90 Dias</h3>
          <p className="text-sm text-[#5A6270]">Passo a passo com exportação em PDF</p>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onStart}
          className="px-8 py-4 bg-[#6B0F1A] hover:bg-[#500B13] text-white font-bold text-lg rounded-2xl shadow-lg transition hover:scale-105"
        >
          Iniciar Diagnóstico Agora
        </button>
        <p className="text-xs text-[#5A6270] mt-4 max-w-md mx-auto">
          Seus dados são seguros e impulsionam a evolução do nosso motor de diagnóstico.
          As informações serão usadas exclusivamente para gerar seu diagnóstico e, de forma anônima, aprimorar nosso sistema.
        </p>
      </div>
    </div>
  );
};