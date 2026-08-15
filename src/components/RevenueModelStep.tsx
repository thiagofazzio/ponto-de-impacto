import React, { useState } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface RevenueModelStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

const models = [
  {
    id: 'venda_produtos',
    label: 'Venda de Produtos',
    description: 'Loja física, e-commerce, distribuição de mercadorias',
    icon: '📦',
  },
  {
    id: 'prestacao_servicos',
    label: 'Prestação de Serviços',
    description: 'Consultoria, mão de obra, serviços especializados',
    icon: '💼',
  },
  {
    id: 'assinatura',
    label: 'Assinatura / Recorrência',
    description: 'Planos mensais, SaaS, clubes de assinatura',
    icon: '🔄',
  },
  {
    id: 'marketplace',
    label: 'Marketplace / Plataforma',
    description: 'Conectando oferta e demanda, comissão sobre transações',
    icon: '🏪',
  },
  {
    id: 'hibrido',
    label: 'Híbrido',
    description: 'Combinação de dois ou mais modelos acima',
    icon: '🔀',
  },
  {
    id: 'outros',
    label: 'Outro modelo',
    description: 'Modelo de receita não listado acima',
    icon: '💡',
  },
];

// Áreas de atuação
const areas = [
  { id: 'alimentacao', label: 'Alimentação', icon: '🍽️', description: 'Restaurantes, supermercados, delivery' },
  { id: 'saude', label: 'Saúde & Bem-estar', icon: '🏥', description: 'Clínicas, hospitais, fitness' },
  { id: 'financas', label: 'Finanças & Seguros', icon: '💰', description: 'Bancos, corretoras, seguros' },
  { id: 'tecnologia', label: 'Tecnologia & Software', icon: '💻', description: 'SaaS, desenvolvimento, TI' },
  { id: 'educacao', label: 'Educação & Treinamento', icon: '📚', description: 'Escolas, cursos, coaching' },
  { id: 'consultoria', label: 'Consultoria & Serviços', icon: '💼', description: 'Assessoria, B2B, projetos' },
  { id: 'varejo', label: 'Varejo & Comércio', icon: '🛍️', description: 'Lojas, e-commerce, atacado' },
  { id: 'imobiliario', label: 'Imobiliário & Construção', icon: '🏗️', description: 'Imobiliárias, construção, incorporação' },
  { id: 'logistica', label: 'Logística & Transporte', icon: '🚚', description: 'Entregas, frete, supply chain' },
  { id: 'entretenimento', label: 'Entretenimento & Mídia', icon: '🎬', description: 'Streaming, eventos, produção' },
  { id: 'outros_setor', label: 'Outro setor', icon: '💡', description: 'Descreva seu setor de atuação' },
];

const RevenueModelStep: React.FC<RevenueModelStepProps> = ({ onNext, initialData }) => {
  const [selectedModel, setSelectedModel] = useState<string>(initialData?.revenueModel || '');
  const [selectedArea, setSelectedArea] = useState<string>(initialData?.areaAtuacao || '');
  const [customModel, setCustomModel] = useState<string>(initialData?.customRevenueModel || '');
  const [customArea, setCustomArea] = useState<string>(initialData?.customArea || '');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<1 | 2>(1);

  const handleModelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) {
      setError('Selecione um modelo de receita para continuar');
      return;
    }
    if (selectedModel === 'outros' && !customModel.trim()) {
      setError('Descreva o modelo de receita da sua empresa');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea) {
      setError('Selecione a área de atuação da sua empresa');
      return;
    }
    if (selectedArea === 'outros_setor' && !customArea.trim()) {
      setError('Descreva o setor de atuação da sua empresa');
      return;
    }

    onNext({
      revenueModel: selectedModel,
      customModel: selectedModel === 'outros' ? customModel : undefined,
      areaAtuacao: selectedArea,
      customArea: selectedArea === 'outros_setor' ? customArea : undefined,
    });
  };

  const getModelLabel = (id: string) => {
    const found = models.find(m => m.id === id);
    return found ? found.label : id;
  };

  return (
    <div className="max-w-2xl mx-auto">
      {step === 1 ? (
        // ===== ETAPA 1: MODELO DE RECEITA =====
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Como sua empresa realmente ganha a maior parte do dinheiro?
            </h2>
            <p className="text-gray-600 mt-2">
              Isso nos ajuda a entender melhor seu negócio e personalizar o diagnóstico.
            </p>
          </div>

          <form onSubmit={handleModelSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.id);
                    setError('');
                  }}
                  className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                    selectedModel === model.id
                      ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                      : 'border-gray-200 hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{model.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{model.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{model.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedModel === 'outros' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descreva o modelo de receita da sua empresa:
                </label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="Ex: Franquia, Licenciamento, Royalties..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-[#6B0F1A]"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-[#6B0F1A] text-white rounded-lg hover:bg-[#500B13] transition-colors"
              >
                Continuar
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        </>
      ) : (
        // ===== ETAPA 2: ÁREA DE ATUAÇÃO =====
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-[#5A6270] mb-2">
              <span className="font-bold text-[#6B0F1A]">Passo 2 de 2</span>
              <span>•</span>
              <span>Modelo selecionado: <span className="font-bold text-[#6B0F1A]">{getModelLabel(selectedModel)}</span></span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Em qual setor sua empresa atua?
            </h2>
            <p className="text-gray-600 mt-2">
              Isso nos ajuda a contextualizar o diagnóstico para sua realidade.
            </p>
          </div>

          <form onSubmit={handleAreaSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {areas.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => {
                    setSelectedArea(area.id);
                    setError('');
                  }}
                  className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                    selectedArea === area.id
                      ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                      : 'border-gray-200 hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{area.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800">{area.label}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{area.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedArea === 'outros_setor' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descreva o setor de atuação da sua empresa:
                </label>
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  placeholder="Ex: Energia, Mineração, Governo..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-[#6B0F1A]"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-[#5A6270] hover:text-[#1A1A1A] transition"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-[#6B0F1A] text-white rounded-lg hover:bg-[#500B13] transition-colors"
              >
                Finalizar
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RevenueModelStep;