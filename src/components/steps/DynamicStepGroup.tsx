import React, { useState, useEffect } from 'react';
import { Pergunta } from '../../types';
import { ChevronRight, ChevronLeft, HelpCircle, Sparkles } from 'lucide-react';

interface DynamicStepGroupProps {
  perguntas: Pergunta[];
  onResponderGroup: (respostas: Record<string, any>) => void;
  onVoltar?: () => void;
  isGratis?: boolean;
  totalPerguntas?: number;
  perguntasRespondidas?: number;
}

export const DynamicStepGroup: React.FC<DynamicStepGroupProps> = ({
  perguntas,
  onResponderGroup,
  onVoltar,
  isGratis = false,
  totalPerguntas = 15,
  perguntasRespondidas = 0,
}) => {
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [percentuais, setPercentuais] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    setRespostas({});
    setErrors({});
    setPercentuais({});
  }, [perguntas.map(p => p.id).join('|')]);

  const handleChange = (perguntaId: string, valor: any) => {
    setRespostas(prev => ({ ...prev, [perguntaId]: valor }));
    setErrors(prev => ({ ...prev, [perguntaId]: '' }));
  };

  const handlePercentualChange = (perguntaId: string, opcaoValue: string, valor: number) => {
    setPercentuais(prev => ({
      ...prev,
      [perguntaId]: {
        ...(prev[perguntaId] || {}),
        [opcaoValue]: valor,
      },
    }));
  };

  const validarPergunta = (pergunta: Pergunta): boolean => {
    const resposta = respostas[pergunta.id];

    if (pergunta.tipo === 'select' && !resposta) {
      setErrors(prev => ({ ...prev, [pergunta.id]: 'Selecione uma opção.' }));
      return false;
    }
    if (pergunta.tipo === 'number' && (resposta === undefined || resposta === null || resposta === '' || isNaN(resposta))) {
      setErrors(prev => ({ ...prev, [pergunta.id]: 'Informe um valor válido ou marque "Não sei".' }));
      return false;
    }
    if (pergunta.tipo === 'boolean' && resposta === null) {
      setErrors(prev => ({ ...prev, [pergunta.id]: 'Selecione Sim ou Não.' }));
      return false;
    }
    if (pergunta.tipo === 'multiselect' && (!resposta || resposta.length === 0)) {
      setErrors(prev => ({ ...prev, [pergunta.id]: 'Selecione pelo menos uma opção.' }));
      return false;
    }
    if (pergunta.tipo === 'percentual') {
      const total = Object.values(percentuais[pergunta.id] || {}).reduce((sum, v) => sum + v, 0);
      if (total !== 100) {
        setErrors(prev => ({ ...prev, [pergunta.id]: `A soma deve ser 100%. Atual: ${total}%` }));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    let isValid = true;
    for (const pergunta of perguntas) {
      if (!validarPergunta(pergunta)) {
        isValid = false;
      }
    }
    if (!isValid) return;

    // Monta objeto final com respostas
    const respostasFinais: Record<string, any> = {};
    for (const pergunta of perguntas) {
      if (pergunta.tipo === 'percentual') {
        respostasFinais[pergunta.id] = percentuais[pergunta.id] || {};
      } else {
        respostasFinais[pergunta.id] = respostas[pergunta.id];
      }
    }
    onResponderGroup(respostasFinais);
  };

  const isCurrency = (id: string) => id.includes('capital') || id.includes('giro') || id.includes('faturamento') || id.includes('ticket') || id.includes('receita') || id.includes('mensal');
  const isPercent = (id: string) => id.includes('percent') || id.includes('taxa') || id.includes('margem') || id.includes('retencao') || id.includes('capacidade');

  return (
    <div className="space-y-6">
      <div>
        {isGratis && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4E8C1] border border-[#D4AF37]/50 text-[#6B0F1A] text-xs font-extrabold uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Diagnóstico Grátis • {perguntasRespondidas + 1} a {perguntasRespondidas + perguntas.length} de {totalPerguntas}</span>
          </div>
        )}
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mt-1">Responda as perguntas abaixo</h2>
        <p className="text-[#5A6270] text-sm mt-1">Leve o tempo que precisar. Suas respostas nos ajudam a personalizar o diagnóstico.</p>
      </div>

      <div className="space-y-4">
        {perguntas.map((pergunta) => (
          <div key={pergunta.id} className="bg-white border border-[#D8D3CB] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-[#1A1A1A] text-base">{pergunta.texto}</h3>
            {pergunta.descricao && <p className="text-[#5A6270] text-sm mt-0.5">{pergunta.descricao}</p>}

            <div className="mt-3">
              {pergunta.tipo === 'select' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pergunta.opcoes?.map((opcao) => (
                    <button
                      key={opcao.value}
                      type="button"
                      onClick={() => handleChange(pergunta.id, opcao.value)}
                      className={`p-3 text-left border-2 rounded-xl transition ${
                        respostas[pergunta.id] === opcao.value
                          ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                          : 'border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                      }`}
                    >
                      {opcao.icon && <span className="text-xl mr-2">{opcao.icon}</span>}
                      <span className="font-semibold text-sm">{opcao.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {pergunta.tipo === 'multiselect' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pergunta.opcoes?.map((opcao) => {
                    const selecionado = respostas[pergunta.id]?.includes(opcao.value);
                    return (
                      <button
                        key={opcao.value}
                        type="button"
                        onClick={() => {
                          const atual = respostas[pergunta.id] || [];
                          const novo = selecionado
                            ? atual.filter((v: string) => v !== opcao.value)
                            : [...atual, opcao.value];
                          handleChange(pergunta.id, novo);
                        }}
                        className={`p-3 text-left border-2 rounded-xl transition ${
                          selecionado
                            ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                            : 'border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                        }`}
                      >
                        {opcao.icon && <span className="text-xl mr-2">{opcao.icon}</span>}
                        <span className="font-semibold text-sm">{opcao.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {pergunta.tipo === 'boolean' && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange(pergunta.id, true)}
                    className={`px-5 py-2 rounded-xl border-2 font-bold ${
                      respostas[pergunta.id] === true
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-[#D8D3CB] hover:border-emerald-500'
                    }`}
                  >
                    ✅ Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange(pergunta.id, false)}
                    className={`px-5 py-2 rounded-xl border-2 font-bold ${
                      respostas[pergunta.id] === false
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-[#D8D3CB] hover:border-rose-500'
                    }`}
                  >
                    ❌ Não
                  </button>
                </div>
              )}

              {(pergunta.tipo === 'number' || pergunta.tipo === 'range') && (
                <div className="space-y-2">
                  <div className="relative">
                    {isCurrency(pergunta.id) && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6270] font-bold">R$</span>}
                    <input
                      type="number"
                      value={respostas[pergunta.id] ?? ''}
                      onChange={(e) => handleChange(pergunta.id, Number(e.target.value))}
                      placeholder={isPercent(pergunta.id) ? 'Ex: 15' : isCurrency(pergunta.id) ? 'Ex: 50000' : 'Digite o valor...'}
                      className={`w-full px-4 py-2.5 border border-[#D8D3CB] rounded-xl focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent ${isCurrency(pergunta.id) ? 'pl-10' : ''}`}
                    />
                    {isPercent(pergunta.id) && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A6270] font-bold">%</span>}
                  </div>
                  {pergunta.allowUnknown && (
                    <button
                      type="button"
                      onClick={() => handleChange(pergunta.id, 'nao_sei')}
                      className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border ${
                        respostas[pergunta.id] === 'nao_sei'
                          ? 'bg-[#F4E8C1] border-[#D4AF37] text-[#6B0F1A]'
                          : 'bg-white border-[#D8D3CB] text-[#5A6270] hover:border-[#6B0F1A]/50'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Não sei
                    </button>
                  )}
                </div>
              )}

              {pergunta.tipo === 'percentual' && (
                <div className="space-y-2">
                  {pergunta.opcoes?.map((opcao) => {
                    const valorAtual = percentuais[pergunta.id]?.[opcao.value] || 0;
                    return (
                      <div key={opcao.value} className="flex items-center gap-3">
                        <span className="w-32 text-sm">{opcao.label}</span>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={valorAtual}
                          onChange={(e) => handlePercentualChange(pergunta.id, opcao.value, Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-[#D8D3CB] rounded-lg text-center"
                        />
                        <span className="text-sm">%</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-3 p-2 bg-[#F9F7F3] rounded">
                    <span className="w-32 text-sm font-bold">Total</span>
                    <span className={`font-bold ${Object.values(percentuais[pergunta.id] || {}).reduce((s, v) => s + v, 0) === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {Object.values(percentuais[pergunta.id] || {}).reduce((s, v) => s + v, 0)}%
                    </span>
                  </div>
                </div>
              )}

              {errors[pergunta.id] && (
                <p className="text-xs text-red-500 mt-1">{errors[pergunta.id]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-[#D8D3CB]">
        <div>
          {onVoltar && (
            <button
              onClick={onVoltar}
              className="flex items-center gap-2 px-4 py-2 text-[#6B0F1A] font-semibold hover:bg-[#F9F7F3] rounded-lg transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
          )}
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#6B0F1A] text-white font-bold rounded-lg hover:bg-[#500B13] transition"
        >
          Continuar
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};