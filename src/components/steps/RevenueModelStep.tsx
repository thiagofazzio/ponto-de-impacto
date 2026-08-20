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
    { value: 'produtos', label: 'Venda de Produtos' },
    { value: 'servicos', label: 'Prestação de Serviços' },
    { value: 'ambos', label: 'Produtos e Serviços' },
    { value: 'assinatura', label: 'Assinatura / Recorrência' },
    { value: 'outro', label: 'Outro modelo' },
  ];

  const areaOptions = [
    { value: 'varejo', label: 'Varejo' },
    { value: 'industria', label: 'Indústria' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'tecnologia', label: 'Tecnologia' },
    { value: 'alimentos', label: 'Alimentos' },
    { value: 'saude', label: 'Saúde' },
    { value: 'educacao', label: 'Educação' },
    { value: 'consultoria', label: 'Consultoria' },
    { value: 'outro', label: 'Outro' },
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
          Selecione o modelo de negócio principal e o setor da sua empresa.
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
          <div className="grid grid-cols-3 gap-2">
            {areaOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setAreaAtuacao(option.value);
                  if (option.value !== 'outro') setCustomArea('');
                }}
                className={`
                  px-3 py-2 text-sm font-medium rounded-lg border transition text-left
                  ${areaAtuacao === option.value
                    ? 'bg-[#6B0F1A] text-white border-[#6B0F1A]'
                    : 'bg-white text-[#1A1A1A] border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                  }
                `}
              >
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

      {/* 🔥 NAVEGAÇÃO - APENAS WIZARD NAVIGATION */}
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