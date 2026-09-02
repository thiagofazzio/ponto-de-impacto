import React, { useState } from 'react';
import { Pergunta } from '../../types';
import { WizardNavigation } from '../WizardNavigation';
import { Sparkles } from 'lucide-react';

interface DynamicStepProps {
  pergunta: Pergunta;
  onResponder: (resposta: any) => void;
  isGratis?: boolean;
  totalPerguntas?: number;
  perguntasRespondidas?: number;
}

export const DynamicStep: React.FC<DynamicStepProps> = ({
  pergunta,
  onResponder,
  isGratis = false,
  totalPerguntas = 15,
  perguntasRespondidas = 0,
}) => {
  const [resposta, setResposta] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [percentuais, setPercentuais] = useState<Record<string, number>>({});

  const handleSubmit = () => {
    // Validação
    if (pergunta.tipo === 'select' && !resposta) {
      setError('Por favor, selecione uma opção.');
      return;
    }
    if (pergunta.tipo === 'number' && (resposta === null || resposta === undefined || resposta === '')) {
      setError('Por favor, insira um valor válido.');
      return;
    }
    if (pergunta.tipo === 'boolean' && resposta === null) {
      setError('Por favor, selecione Sim ou Não.');
      return;
    }
    if (pergunta.tipo === 'multiselect' && (!resposta || resposta.length === 0)) {
      setError('Por favor, selecione pelo menos uma opção.');
      return;
    }
    if (pergunta.tipo === 'percentual') {
      const total = Object.values(percentuais).reduce((sum, v) => sum + v, 0);
      if (total !== 100) {
        setError(`A soma dos percentuais deve ser 100%. Atualmente: ${total}%`);
        return;
      }
      onResponder(percentuais);
      return;
    }

    setError(null);
    onResponder(resposta);
  };

  // 🔥 Detecta se é campo monetário ou percentual
  const isCurrency = pergunta.id.includes('capital') || pergunta.id.includes('giro') || pergunta.id.includes('faturamento') || pergunta.id.includes('ticket');
  const isPercent = pergunta.id.includes('percent') || pergunta.id.includes('taxa') || pergunta.id.includes('margem') || pergunta.id.includes('retencao') || pergunta.tipo === 'range';

  const renderInput = () => {
    switch (pergunta.tipo) {
      case 'select':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {pergunta.opcoes?.map((opcao) => (
              <button
                key={opcao.value}
                onClick={() => setResposta(opcao.value)}
                className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                  resposta === opcao.value
                    ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                    : 'border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                }`}
              >
                {opcao.icon && <span className="text-2xl mr-2">{opcao.icon}</span>}
                <span className="font-semibold text-[#1A1A1A]">{opcao.label}</span>
              </button>
            ))}
          </div>
        );

      case 'multiselect':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {pergunta.opcoes?.map((opcao) => {
              const isSelected = resposta?.includes(opcao.value);
              return (
                <button
                  key={opcao.value}
                  onClick={() => {
                    if (isSelected) {
                      setResposta(resposta.filter((v: string) => v !== opcao.value));
                    } else {
                      setResposta([...(resposta || []), opcao.value]);
                    }
                  }}
                  className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                    isSelected
                      ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                      : 'border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                  }`}
                >
                  {opcao.icon && <span className="text-xl mr-2">{opcao.icon}</span>}
                  <span className="font-semibold text-[#1A1A1A]">{opcao.label}</span>
                </button>
              );
            })}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setResposta(true)}
              className={`px-6 py-3 rounded-xl border-2 font-bold transition ${
                resposta === true
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-[#D8D3CB] hover:border-emerald-500'
              }`}
            >
              ✅ Sim
            </button>
            <button
              onClick={() => setResposta(false)}
              className={`px-6 py-3 rounded-xl border-2 font-bold transition ${
                resposta === false
                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-[#D8D3CB] hover:border-rose-500'
              }`}
            >
              ❌ Não
            </button>
          </div>
        );

      case 'number':
        return (
          <div className="mt-4">
            <div className="relative">
              {isCurrency && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6270] font-bold">R$</span>}
              <input
                type="number"
                value={resposta || ''}
                onChange={(e) => setResposta(Number(e.target.value))}
                placeholder={isPercent ? 'Ex: 15' : isCurrency ? 'Ex: 50000' : 'Digite o valor...'}
                className={`w-full px-4 py-3 border border-[#D8D3CB] rounded-xl focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent ${isCurrency ? 'pl-10' : ''}`}
              />
              {isPercent && !isCurrency && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6270] font-bold">%</span>}
            </div>
          </div>
        );

      case 'range':
        const rangeValue = resposta !== null && resposta !== undefined ? resposta : 50;
        return (
          <div className="mt-4">
            <input
              type="range"
              min={0}
              max={100}
              value={rangeValue}
              onChange={(e) => setResposta(Number(e.target.value))}
              className="w-full accent-[#6B0F1A] h-2 rounded-lg"
            />
            <div className="flex justify-between text-xs text-[#5A6270] mt-2">
              <span>0%</span>
              <span className="font-bold text-[#6B0F1A]">{rangeValue}%</span>
              <span>100%</span>
            </div>
          </div>
        );

      case 'percentual':
        return (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-[#5A6270]">Distribua 100% entre os canais selecionados:</p>
            {pergunta.opcoes?.map((opcao) => {
              const canalSelecionado = true;
              if (!canalSelecionado) return null;
              return (
                <div key={opcao.value} className="flex items-center gap-4">
                  <span className="w-32 text-sm font-medium">{opcao.label}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={percentuais[opcao.value] || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPercentuais(prev => ({ ...prev, [opcao.value]: val }));
                    }}
                    className="w-24 px-3 py-2 border border-[#D8D3CB] rounded-lg text-center"
                  />
                  <span className="text-sm text-[#5A6270]">%</span>
                </div>
              );
            })}
            <div className="flex items-center gap-4 p-3 bg-[#F9F7F3] rounded-lg">
              <span className="w-32 text-sm font-bold">Total</span>
              <span className={`font-bold ${Object.values(percentuais).reduce((s, v) => s + v, 0) === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {Object.values(percentuais).reduce((s, v) => s + v, 0)}%
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="mt-4">
            <input
              type="text"
              value={resposta || ''}
              onChange={(e) => setResposta(e.target.value)}
              placeholder="Digite sua resposta..."
              className="w-full px-4 py-3 border border-[#D8D3CB] rounded-xl focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent"
            />
          </div>
        );
    }
  };

  const isGratisStep = isGratis && perguntasRespondidas < 5;

  return (
    <div className="space-y-6">
      <div>
        {isGratisStep && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4E8C1] border border-[#D4AF37]/50 text-[#6B0F1A] text-xs font-extrabold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Diagnóstico Grátis • {perguntasRespondidas + 1} de 5</span>
          </div>
        )}
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mt-1">{pergunta.texto}</h2>
        {pergunta.descricao && (
          <p className="text-[#5A6270] text-sm mt-1">{pergunta.descricao}</p>
        )}
      </div>

      <div className="bg-white border border-[#D8D3CB] rounded-2xl p-6 shadow-sm">
        {renderInput()}
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      <WizardNavigation
        currentStep={2}
        totalSteps={isGratis ? 5 : 15}
        onPrevious={() => {}}
        onNext={handleSubmit}
        isNextDisabled={false}
        isLastStep={isGratisStep && perguntasRespondidas === 4}
        nextLabel={isGratisStep && perguntasRespondidas === 4 ? 'Ver Resultado Grátis' : 'Continuar'}
        showPrevious={false}
      />
    </div>
  );
};