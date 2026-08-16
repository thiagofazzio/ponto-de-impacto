import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface ObjectiveStepProps {
  mainGoal: string;
  biggestDifficulty: string;
  onUpdate: (data: { mainGoal: string; biggestDifficulty: string }) => void;
}

const goalOptions = [
  { id: 'crescer_faturamento', label: 'Crescer Faturamento', icon: '📈', description: 'Aumentar a receita total do negócio' },
  { id: 'aumentar_margem', label: 'Aumentar Margem', icon: '💰', description: 'Melhorar a rentabilidade e lucratividade' },
  { id: 'profissionalizar_gestao', label: 'Profissionalizar Gestão', icon: '📊', description: 'Estruturar processos e governança' },
  { id: 'reduzir_dependencia', label: 'Reduzir Dependência', icon: '🔄', description: 'Diminuir dependência do sócio/fundador' },
  { id: 'expandir_operacao', label: 'Expandir Operação', icon: '🌍', description: 'Abrir novas unidades ou canais' },
  { id: 'outro_objetivo', label: 'Outro', icon: '💡', description: 'Descreva seu objetivo específico' },
];

const difficultyOptions = [
  { id: 'comercial', label: 'Comercial', icon: '📞', description: 'Vendas, prospecção, ticket médio' },
  { id: 'financeiro', label: 'Financeiro', icon: '💳', description: 'Fluxo de caixa, margem, custos' },
  { id: 'operacional', label: 'Operacional', icon: '⚙️', description: 'Processos, logística, entrega' },
  { id: 'gestao', label: 'Gestão', icon: '📋', description: 'Processos, indicadores, planejamento' },
  { id: 'pessoas', label: 'Pessoas', icon: '👥', description: 'Liderança, times, cultura' },
  { id: 'outro_desafio', label: 'Outro', icon: '💡', description: 'Descreva seu desafio específico' },
];

const ObjectiveStep: React.FC<ObjectiveStepProps> = ({ mainGoal, biggestDifficulty, onUpdate }) => {
  const [selectedGoal, setSelectedGoal] = useState<string>(mainGoal || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(biggestDifficulty || '');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [customDifficulty, setCustomDifficulty] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔥 VALIDAÇÃO
    if (!selectedGoal) {
      setError('Selecione um objetivo para continuar');
      return;
    }
    if (selectedGoal === 'outro_objetivo' && !customGoal.trim()) {
      setError('Descreva seu objetivo');
      return;
    }
    if (!selectedDifficulty) {
      setError('Selecione um gargalo para continuar');
      return;
    }
    if (selectedDifficulty === 'outro_desafio' && !customDifficulty.trim()) {
      setError('Descreva seu gargalo');
      return;
    }

    const goalValue = selectedGoal === 'outro_objetivo' ? customGoal : selectedGoal;
    const difficultyValue = selectedDifficulty === 'outro_desafio' ? customDifficulty : selectedDifficulty;
    
    onUpdate({
      mainGoal: goalValue,
      biggestDifficulty: difficultyValue,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Objetivos & Desafios
        </h2>
        <p className="text-gray-600 mt-2">
          Conte-nos o que você quer alcançar e qual o maior gargalo hoje.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Objetivo */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            🎯 Qual é o seu principal objetivo?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedGoal(option.id);
                  setError('');
                }}
                className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                  selectedGoal === option.id
                    ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                    : 'border-gray-200 hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {selectedGoal === 'outro_objetivo' && (
            <div className="mt-3">
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Descreva seu objetivo..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-[#6B0F1A]"
              />
            </div>
          )}
        </div>

        {/* Gargalo */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            🚧 Qual é o maior gargalo da sua operação?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {difficultyOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedDifficulty(option.id);
                  setError('');
                }}
                className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                  selectedDifficulty === option.id
                    ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                    : 'border-gray-200 hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {selectedDifficulty === 'outro_desafio' && (
            <div className="mt-3">
              <input
                type="text"
                value={customDifficulty}
                onChange={(e) => setCustomDifficulty(e.target.value)}
                placeholder="Descreva seu gargalo..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-[#6B0F1A]"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default ObjectiveStep;