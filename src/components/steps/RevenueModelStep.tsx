import React, { useState } from 'react';
import { WizardNavigation } from '../WizardNavigation';

interface RevenueModelStepProps {
  onNext: (data: {
    revenueModel: string;
    customModel: string;
    areaAtuacao: string;
    customArea: string;
  }) => void;
  initialData: {
    revenueModel?: string;
    customRevenueModel?: string;
    areaAtuacao?: string;
    customArea?: string;
  };
}

const RevenueModelStep: React.FC<RevenueModelStepProps> = ({ onNext, initialData }) => {
  const [revenueModel, setRevenueModel] = useState(initialData.revenueModel || '');
  const [customModel, setCustomModel] = useState(initialData.customRevenueModel || '');
  const [areaAtuacao, setAreaAtuacao] = useState(initialData.areaAtuacao || '');
  const [customArea, setCustomArea] = useState(initialData.customArea || '');

  const revenueOptions = [
    { value: 'produtos', label: 'Venda de Produtos', icon: '📦' },
    { value: 'servicos', label: 'Prestação de Serviços', icon: '💼' },
    { value: 'assinatura', label: 'Assinatura / Recorrência', icon: '🔄' },
    { value: 'marketplace', label: 'Marketplace / Plataforma', icon: '🏪' },
    { value: 'hibrido', label: 'Híbrido', icon: '🔀' },
    { value: 'outro', label: 'Outro modelo', icon: '💡' },
  ];

  const areaOptions = [
    { value: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
    { value: 'saude', label: 'Saúde & Bem-estar', icon: '🏥' },
    { value: 'financas', label: 'Finanças & Seguros', icon: '💰' },
    { value: 'tecnologia', label: 'Tecnologia & Software', icon: '💻' },
    { value: 'educacao', label: 'Educação & Treinamento', icon: '📚' },
    { value: 'consultoria', label: 'Consultoria & Serviços', icon: '💼' },
    { value: 'varejo', label: 'Varejo & Comércio', icon: '🛍️' },
    { value: 'imobiliario', label: 'Imobiliário & Construção', icon: '🏗️' },
    { value: 'logistica', label: 'Logística & Transporte', icon: '🚚' },
    { value: 'entretenimento', label: 'Entretenimento & Mídia', icon: '🎬' },
    { value: 'outro', label: 'Outro setor', icon: '💡' },
  ];

  const handleNext = () => {
    onNext({
      revenueModel,
      customModel: revenueModel === 'outro' ? customModel : '',
      areaAtuacao,
      customArea: areaAtuacao === 'outro' ? customArea : '',
    });
  };

  const isFormValid = revenueModel && areaAtuacao;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-[#D8D3CB]">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">
          Como sua empresa realmente ganha a maior parte do dinheiro?
        </h2>
        <p className="text-[#5A6270] text-sm mb-6">
          Isso nos ajuda a entender melhor seu negócio e personalizar o diagnóstico.
        </p>

        {/* Modelo de Receita */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Modelo de Receita *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {revenueOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setRevenueModel(option.value);
                  if (option.value !== 'outro') setCustomModel('');
                }}
                className={`
                  px-4 py-2.5 text-sm font-medium rounded-lg border transition text-left
                  ${revenueModel === option.value
                    ? 'bg-[#6B0F1A] text-white border-[#6B0F1A]'
                    : 'bg-white text-[#1A1A1A] border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                  }
                `}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          {revenueModel === 'outro' && (
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="Descreva seu modelo de receita..."
              className="mt-2 w-full px-4 py-2 border border-[#D8D3CB] rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent"
            />
          )}
        </div>

        {/* Área de Atuação */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
            Em qual setor sua empresa atua? *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {areaOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setAreaAtuacao(option.value);
                  if (option.value !== 'outro') setCustomArea('');
                }}
                className={`
                  px-4 py-2.5 text-sm font-medium rounded-lg border transition text-left
                  ${areaAtuacao === option.value
                    ? 'bg-[#6B0F1A] text-white border-[#6B0F1A]'
                    : 'bg-white text-[#1A1A1A] border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                  }
                `}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          {areaAtuacao === 'outro' && (
            <input
              type="text"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              placeholder="Descreva seu setor de atuação..."
              className="mt-2 w-full px-4 py-2 border border-[#D8D3CB] rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent"
            />
          )}
        </div>
      </div>

      {/* 🔥 NAVEGAÇÃO - RevenueModelStep NÃO TEM VOLTAR (não há etapa anterior) */}
      <WizardNavigation
        currentStep={2}
        totalSteps={13}
        onPrevious={() => {}}
        onNext={handleNext}
        isNextDisabled={!isFormValid}
        nextLabel="Continuar"
        showPrevious={false}
      />
    </div>
  );
};

export default RevenueModelStep;