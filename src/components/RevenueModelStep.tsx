import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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

const RevenueModelStep: React.FC<RevenueModelStepProps> = ({ onNext, initialData }) => {
  const [selectedModel, setSelectedModel] = useState<string>(initialData?.revenueModel || '');
  const [customModel, setCustomModel] = useState<string>(initialData?.customModel || '');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) {
      setError('Selecione um modelo de receita para continuar');
      return;
    }
    if (selectedModel === 'outros' && !customModel.trim()) {
      setError('Descreva qual é o modelo de receita da sua empresa');
      return;
    }
    onNext({
      revenueModel: selectedModel,
      customModel: selectedModel === 'outros' ? customModel : undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Como sua empresa ganha dinheiro?
        </h2>
        <p className="text-gray-600 mt-2">
          Isso nos ajuda a entender melhor seu negócio e personalizar o diagnóstico.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                selectedModel === model.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
    </div>
  );
};

export default RevenueModelStep;