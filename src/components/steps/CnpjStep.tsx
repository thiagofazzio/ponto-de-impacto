import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Building2, Users, DollarSign, Lightbulb } from 'lucide-react';

interface CnpjStepProps {
  cnpj: string;
  cnpjData: any;
  onUpdate: (cnpj: string, cnpjData: any) => void;
  onNext: () => void;
  formData: any;
  updateFormData: (data: any) => void;
}

export const CnpjStep: React.FC<CnpjStepProps> = ({ 
  cnpj, 
  cnpjData, 
  onUpdate, 
  onNext,
  formData,
  updateFormData 
}) => {
  const [localCnpj, setLocalCnpj] = useState(cnpj || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔥 Formata CNPJ
  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 14) {
      let formatted = digits;
      if (formatted.length > 2) formatted = formatted.replace(/^(\d{2})(\d)/, '$1.$2');
      if (formatted.length > 5) formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      if (formatted.length > 8) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
      if (formatted.length > 12) formatted = formatted.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
      return formatted;
    }
    return value;
  };

  // 🔥 Função para identificar o modelo de receita com base no CNAE
  const identificarModeloPorCNAE = (cnae: string): { modelo: string; icone: string; descricao: string } => {
    const cnaeLower = cnae.toLowerCase();
    
    // Mapeamento de palavras-chave para modelos
    const mapeamento: Record<string, { modelo: string; icone: string; descricao: string }> = {
      // Venda de Produtos
      'comercio': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Comércio de mercadorias e produtos' },
      'varejista': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Varejo de produtos' },
      'supermercados': { modelo: 'Venda de Produtos', icone: '🛒', descricao: 'Varejo alimentício' },
      'distribuição': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Distribuição de mercadorias' },
      'indústria': { modelo: 'Venda de Produtos', icone: '🏭', descricao: 'Indústria e manufatura' },
      'alimentício': { modelo: 'Venda de Produtos', icone: '🍎', descricao: 'Produtos alimentícios' },
      'varejo': { modelo: 'Venda de Produtos', icone: '🛍️', descricao: 'Varejo em geral' },
      'atacadista': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Atacado e distribuição' },
      'mercearia': { modelo: 'Venda de Produtos', icone: '🏪', descricao: 'Mercearia e alimentos' },
      'loja': { modelo: 'Venda de Produtos', icone: '🏬', descricao: 'Loja física ou online' },
      'e-commerce': { modelo: 'Venda de Produtos', icone: '🛒', descricao: 'Comércio eletrônico' },
      'fabricação': { modelo: 'Venda de Produtos', icone: '🏭', descricao: 'Fabricação de produtos' },
      
      // Prestação de Serviços
      'consultoria': { modelo: 'Prestação de Serviços', icone: '💼', descricao: 'Consultoria e assessoria' },
      'servicos': { modelo: 'Prestação de Serviços', icone: '💼', descricao: 'Prestação de serviços' },
      'ensino': { modelo: 'Prestação de Serviços', icone: '📚', descricao: 'Educação e treinamento' },
      'saúde': { modelo: 'Prestação de Serviços', icone: '🏥', descricao: 'Saúde e bem-estar' },
      'educação': { modelo: 'Prestação de Serviços', icone: '📚', descricao: 'Educação e ensino' },
      'treinamento': { modelo: 'Prestação de Serviços', icone: '🎯', descricao: 'Treinamento e capacitação' },
      'engenharia': { modelo: 'Prestação de Serviços', icone: '📐', descricao: 'Engenharia e projetos' },
      'advocacia': { modelo: 'Prestação de Serviços', icone: '⚖️', descricao: 'Serviços jurídicos' },
      'contabilidade': { modelo: 'Prestação de Serviços', icone: '📊', descricao: 'Contabilidade e finanças' },
      'marketing': { modelo: 'Prestação de Serviços', icone: '📱', descricao: 'Marketing e publicidade' },
      'design': { modelo: 'Prestação de Serviços', icone: '🎨', descricao: 'Design e criação' },
      'manutenção': { modelo: 'Prestação de Serviços', icone: '🔧', descricao: 'Manutenção e reparos' },
      'limpeza': { modelo: 'Prestação de Serviços', icone: '🧹', descricao: 'Serviços de limpeza' },
      'segurança': { modelo: 'Prestação de Serviços', icone: '🛡️', descricao: 'Segurança e vigilância' },
      
      // Assinatura
      'assinatura': { modelo: 'Assinatura / Recorrência', icone: '🔄', descricao: 'Modelo de assinatura' },
      'software': { modelo: 'Assinatura / Recorrência', icone: '💻', descricao: 'Software e tecnologia' },
      'saas': { modelo: 'Assinatura / Recorrência', icone: '☁️', descricao: 'SaaS e plataformas' },
      
      // Marketplace
      'plataforma': { modelo: 'Marketplace / Plataforma', icone: '🏪', descricao: 'Plataforma digital' },
      'marketplace': { modelo: 'Marketplace / Plataforma', icone: '🏪', descricao: 'Marketplace' },
    };

    // Busca a primeira palavra-chave que aparece no CNAE
    for (const [key, value] of Object.entries(mapeamento)) {
      if (cnaeLower.includes(key)) {
        return value;
      }
    }

    // Se não encontrar nenhuma, retorna genérico
    return {
      modelo: 'Modelo de negócio híbrido',
      icone: '💡',
      descricao: 'Modelo de receita personalizado'
    };
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = formatCnpj(raw);
    setLocalCnpj(formatted);
    setError(null);
    
    if (raw.length === 14) {
      handleSearch(raw);
    }
  };

  const handleSearch = async (rawCnpj: string) => {
    if (rawCnpj.length !== 14) {
      setError('CNPJ deve ter 14 dígitos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cnpj/${rawCnpj}`);
      if (!response.ok) {
        if (response.status === 444) {
          setError('CNPJ não encontrado. Verifique o número e tente novamente.');
        } else {
          setError('Erro ao buscar dados do CNPJ. Tente novamente.');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      onUpdate(rawCnpj, data);
      
      updateFormData({
        companyName: data.razaoSocial || data.nomeFantasia || '',
        segment: data.cnaeDescricao || '',
        cityState: data.municipio ? `${data.municipio} / ${data.uf}` : '',
      });
      
      setLoading(false);
    } catch (err) {
      setError('Erro ao buscar dados. Verifique sua conexão.');
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!cnpjData) {
      setError('Busque os dados do CNPJ primeiro');
      return;
    }
    onNext();
  };

  // 🔥 IDENTIFICA O MODELO DE RECEITA COM BASE NO CNAE
  const cnae = cnpjData?.cnaeDescricao || '';
  const modeloIdentificado = cnae ? identificarModeloPorCNAE(cnae) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Dados da Empresa
        </h2>
        <p className="text-gray-600 mt-2">
          Informe o CNPJ para buscar os dados automaticamente e confirme as informações.
        </p>
      </div>

      {/* Busca CNPJ */}
      <div className="bg-white border border-[#D8D3CB] rounded-2xl p-6 shadow-sm">
        <div className="flex gap-3">
          <input
            type="text"
            value={localCnpj}
            onChange={handleCnpjChange}
            placeholder="00.000.000/0000-00"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-[#6B0F1A] text-lg"
            maxLength={18}
          />
          <button
            onClick={() => handleSearch(localCnpj.replace(/\D/g, ''))}
            disabled={loading || localCnpj.replace(/\D/g, '').length !== 14}
            className="px-6 py-3 bg-[#6B0F1A] text-white rounded-lg hover:bg-[#500B13] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <span className="inline-block animate-spin">⟳</span>
            ) : (
              <Search size={20} />
            )}
            Buscar
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-3 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
            <span className="inline-block animate-spin">⟳</span>
            Buscando dados do CNPJ...
          </div>
        )}
      </div>

      {/* Dados do CNPJ (quando carregados) */}
      {cnpjData && !loading && (
        <div className="mt-6 space-y-4">
          <div className="bg-white border border-[#D8D3CB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Building2 size={18} className="text-[#6B0F1A]" />
              Dados da Empresa
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Razão Social</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-800">
                  {cnpjData.razaoSocial || 'Não informado'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Nome Fantasia</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-800">
                  {cnpjData.nomeFantasia || cnpjData.razaoSocial || 'Não informado'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Porte</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-800">
                  {cnpjData.porte || 'Não informado'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Cidade / UF</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-800">
                  {cnpjData.municipio ? `${cnpjData.municipio} / ${cnpjData.uf}` : 'Não informado'}
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600">Atividade Principal (CNAE)</label>
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-800 text-sm">
                  {cnpjData.cnaeDescricao || 'Não informado'}
                </div>
              </div>
            </div>
          </div>

          {/* 🔥 INSIGHT: Modelo de receita identificado pelo CNAE */}
          {modeloIdentificado && (
            <div className="p-4 bg-[#F4E8C1] border border-[#D4AF37] rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{modeloIdentificado.icone}</span>
                <div>
                  <span className="text-xs font-bold text-[#6B0F1A] uppercase tracking-wider">💡 Insight TFAZZIO</span>
                  <p className="text-sm text-[#1A1A1A] mt-0.5 font-medium">
                    Modelo de geração de receita de acordo com o CNAE principal:
                  </p>
                  <p className="text-base font-bold text-[#6B0F1A] mt-1">
                    {modeloIdentificado.modelo}
                  </p>
                  <p className="text-xs text-[#5A6270] mt-0.5">
                    {modeloIdentificado.descricao}
                  </p>
                  <p className="text-xs text-[#5A6270] mt-1 italic">
                    Este é o modelo de receita mais comum para empresas do seu segmento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Campos de confirmação adicionais */}
          <div className="bg-white border border-[#D8D3CB] rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Users size={18} className="text-[#6B0F1A]" />
              Confirme os dados operacionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Número de Funcionários
                </label>
                <select
                  value={formData.employeesCount || '6_15'}
                  onChange={(e) => updateFormData({ employeesCount: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-[#6B0F1A]"
                >
                  <option value="1_5">1 a 5</option>
                  <option value="6_15">6 a 15</option>
                  <option value="16_50">16 a 50</option>
                  <option value="51_100">51 a 100</option>
                  <option value="100+">Mais de 100</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 flex items-center gap-1">
                  <DollarSign size={16} />
                  Faturamento Mensal (R$)
                </label>
                <input
                  type="number"
                  value={formData.monthlyRevenue || 150000}
                  onChange={(e) => updateFormData({ monthlyRevenue: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B0F1A] focus:border-[#6B0F1A]"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full px-6 py-3 bg-[#6B0F1A] text-white rounded-lg hover:bg-[#500B13] transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={20} />
            Confirmar e Continuar
          </button>
        </div>
      )}
    </div>
  );
};