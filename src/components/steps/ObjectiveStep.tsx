import React, { useState, useEffect } from 'react';
import { WizardNavigation } from '../WizardNavigation';

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

  // 🔥 Salva automaticamente quando os dados mudam
  useEffect(() => {
    if (selectedGoal && selectedDifficulty) {
      const goalValue = selectedGoal === 'outro_objetivo' ? customGoal : selectedGoal;
      const difficultyValue = selectedDifficulty === 'outro_desafio' ? customDifficulty : selectedDifficulty;
      
      if (goalValue && difficultyValue) {
        onUpdate({
          mainGoal: goalValue,
          biggestDifficulty: difficultyValue,
        });
      }
    }
  }, [selectedGoal, selectedDifficulty, customGoal, customDifficulty, onUpdate]);

  // 🔥 Verifica se o formulário está válido
  const isGoalValid = selectedGoal && (selectedGoal !== 'outro_objetivo' || customGoal.trim());
  const isDifficultyValid = selectedDifficulty && (selectedDifficulty !== 'outro_desafio' || customDifficulty.trim());
  const isFormValid = isGoalValid && isDifficultyValid;

  // 🔥 Função para avançar - CHAMA O onUpdate para salvar e depois avança
  const handleNext = () => {
    if (isFormValid) {
      const goalValue = selectedGoal === 'outro_objetivo' ? customGoal : selectedGoal;
      const difficultyValue = selectedDifficulty === 'outro_desafio' ? customDifficulty : selectedDifficulty;
      
      // Salva os dados antes de avançar
      onUpdate({
        mainGoal: goalValue,
        biggestDifficulty: difficultyValue,
      });
      
      // 🔥 Dispara o evento para o WizardContainer saber que deve avançar
      // O WizardContainer vai ouvir o onUpdate e chamar nextStep()
      // Mas como o ObjectiveStep não tem acesso ao nextStep, usamos um evento personalizado
      window.dispatchEvent(new CustomEvent('objectiveStepComplete'));
    }
  };

  // 🔥 Para compatibilidade com o WizardContainer, também expomos via props
  // Mas como o WizardContainer não passa onNext, usamos o evento acima

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#D8D3CB]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Objetivos & Desafios
          </h2>
          <p className="text-[#5A6270] mt-1 text-sm">
            Conte-nos o que você quer alcançar e qual o maior gargalo hoje.
          </p>
        </div>

        {/* Objetivo */}
        <div className="mb-8">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">
            🎯 Qual é o seu principal objetivo?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {goalOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedGoal(option.id);
                }}
                className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                  selectedGoal === option.id
                    ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                    : 'border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-[#1A1A1A]">{option.label}</div>
                    <div className="text-sm text-[#5A6270]">{option.description}</div>
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
                className="w-full px-4 py-2 border border-[#D8D3CB] rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Gargalo */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">
            🚧 Qual é o maior gargalo da sua operação?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {difficultyOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedDifficulty(option.id);
                }}
                className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                  selectedDifficulty === option.id
                    ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                    : 'border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <div className="font-semibold text-[#1A1A1A]">{option.label}</div>
                    <div className="text-sm text-[#5A6270]">{option.description}</div>
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
                className="w-full px-4 py-2 border border-[#D8D3CB] rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* 🔥 NAVEGAÇÃO - COM onNext FUNCIONANDO */}
      <WizardNavigation
        currentStep={3}
        totalSteps={13}
        onPrevious={() => {}} // Voltar será controlado pelo WizardContainer
        onNext={handleNext}
        isNextDisabled={!isFormValid}
        nextLabel="Continuar"
        showPrevious={true}
      />
    </div>
  );
};

export default ObjectiveStep;