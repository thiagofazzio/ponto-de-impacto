import React, { useState } from 'react';
import { Search, CheckCircle, AlertTriangle, Building2, Users, DollarSign, Lightbulb, Sparkles, Check, TrendingUp, Rocket } from 'lucide-react';

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

  // 🔥 Identifica o modelo do CNAE
  const identificarModeloPorCNAE = (cnae: string): { modelo: string; icone: string; descricao: string } => {
    const cnaeLower = cnae.toLowerCase();
    
    const mapeamento: Record<string, { modelo: string; icone: string; descricao: string }> = {
      // Venda de Produtos
      'comercio': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Comércio e distribuição de mercadorias' },
      'varejista': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Varejo e comércio' },
      'supermercados': { modelo: 'Venda de Produtos', icone: '🛒', descricao: 'Varejo alimentício' },
      'distribuição': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Distribuição e logística' },
      'indústria': { modelo: 'Venda de Produtos', icone: '🏭', descricao: 'Indústria e manufatura' },
      'alimentício': { modelo: 'Venda de Produtos', icone: '🍎', descricao: 'Alimentos e bebidas' },
      'varejo': { modelo: 'Venda de Produtos', icone: '🛍️', descricao: 'Varejo em geral' },
      'atacadista': { modelo: 'Venda de Produtos', icone: '📦', descricao: 'Atacado e distribuição' },
      'mercearia': { modelo: 'Venda de Produtos', icone: '🏪', descricao: 'Mercearia e alimentos' },
      'loja': { modelo: 'Venda de Produtos', icone: '🏬', descricao: 'Comércio varejista' },
      
      // Prestação de Serviços
      'consultoria': { modelo: 'Prestação de Serviços', icone: '💼', descricao: 'Consultoria e assessoria empresarial' },
      'servicos': { modelo: 'Prestação de Serviços', icone: '💼', descricao: 'Prestação de serviços especializados' },
      'ensino': { modelo: 'Prestação de Serviços', icone: '📚', descricao: 'Educação e capacitação' },
      'saúde': { modelo: 'Prestação de Serviços', icone: '🏥', descricao: 'Saúde e bem-estar' },
      'educação': { modelo: 'Prestação de Serviços', icone: '📚', descricao: 'Educação e ensino' },
      'treinamento': { modelo: 'Prestação de Serviços', icone: '🎯', descricao: 'Treinamento e desenvolvimento' },
      'engenharia': { modelo: 'Prestação de Serviços', icone: '📐', descricao: 'Engenharia e projetos' },
      'advocacia': { modelo: 'Prestação de Serviços', icone: '⚖️', descricao: 'Serviços jurídicos' },
      'contabilidade': { modelo: 'Prestação de Serviços', icone: '📊', descricao: 'Finanças e contabilidade' },
      
      // Assinatura
      'assinatura': { modelo: 'Assinatura / Recorrência', icone: '🔄', descricao: 'Modelo de receita recorrente' },
      'software': { modelo: 'Assinatura / Recorrência', icone: '💻', descricao: 'Tecnologia e software' },
      'saas': { modelo: 'Assinatura / Recorrência', icone: '☁️', descricao: 'SaaS e plataformas' },
      
      // Marketplace
      'plataforma': { modelo: 'Marketplace / Plataforma', icone: '🏪', descricao: 'Plataforma digital' },
      'marketplace': { modelo: 'Marketplace / Plataforma', icone: '🏪', descricao: 'Marketplace' },
    };

    for (const [key, value] of Object.entries(mapeamento)) {
      if (cnaeLower.includes(key)) {
        return value;
      }
    }

    return { modelo: 'Modelo de negócio híbrido', icone: '💡', descricao: 'Modelo personalizado' };
  };

  // 🔥 Gera insight com texto ajustado
  const gerarInsight = () => {
    if (!cnpjData || loading) return null;
    
    const cnae = cnpjData.cnaeDescricao || '';
    const info = identificarModeloPorCNAE(cnae);
    const nomeEmpresa = cnpjData.razaoSocial || cnpjData.nomeFantasia || 'Sua empresa';
    
    // Diferentes mensagens para diferentes modelos
    const mensagens: Record<string, { titulo: string; mensagem: string; detalhe: string }> = {
      'Venda de Produtos': {
        titulo: 'Modelo de negócio identificado: Venda de Produtos',
        mensagem: `A ${nomeEmpresa} atua no mercado de produtos, onde o giro de estoque, a margem por categoria e a gestão de fornecedores são os motores do resultado.`,
        detalhe: 'Empresas do seu segmento geralmente crescem acelerando o giro, otimizando a precificação e expandindo canais de venda.'
      },
      'Prestação de Serviços': {
        titulo: 'Modelo de negócio identificado: Prestação de Serviços',
        mensagem: `A ${nomeEmpresa} atua no mercado de serviços, onde a produtividade da equipe, a retenção de clientes e o ticket médio são os motores do resultado.`,
        detalhe: 'Empresas do seu segmento geralmente crescem aumentando a eficiência operacional, fidelizando clientes e escalando a entrega.'
      },
      'Assinatura / Recorrência': {
        titulo: 'Modelo de negócio identificado: Assinatura e Recorrência',
        mensagem: `A ${nomeEmpresa} atua com receita recorrente, onde a retenção de clientes (churn), o Lifetime Value (LTV) e o custo de aquisição (CAC) são os motores do resultado.`,
        detalhe: 'Empresas do seu segmento geralmente crescem reduzindo cancelamentos, aumentando o valor do cliente e otimizando a aquisição.'
      },
      'Marketplace / Plataforma': {
        titulo: 'Modelo de negócio identificado: Marketplace / Plataforma',
        mensagem: `A ${nomeEmpresa} atua como plataforma ou marketplace, onde o volume de transações, a liquidez e a taxa de conversão são os motores do resultado.`,
        detalhe: 'Empresas do seu segmento geralmente crescem equilibrando oferta e demanda, aumentando a base de usuários e otimizando a comissão.'
      },
    };

    const padrao = mensagens[info.modelo] || {
      titulo: 'Modelo de negócio identificado',
      mensagem: `A ${nomeEmpresa} tem um modelo de negócio único, com características próprias que merecem uma análise personalizada.`,
      detalhe: 'Vamos aprofundar a análise para entender como sua empresa gera valor e onde estão as alavancas de crescimento.'
    };

    return {
      icone: info.icone,
      cor: 'bg-blue-50 border-blue-200 text-blue-800',
      titulo: padrao.titulo,
      mensagem: padrao.mensagem,
      detalhe: padrao.detalhe,
      tag: info.descricao
    };
  };

  const insight = gerarInsight();

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

          {/* 🔥 INSIGHT COM TEXTO AJUSTADO */}
          {insight && (
            <div className={`p-4 rounded-xl border ${insight.cor}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icone}</span>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    💡 Insight TFAZZIO
                  </span>
                  <p className="text-sm font-bold mt-0.5 text-blue-900">
                    {insight.titulo}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    {insight.mensagem}
                  </p>
                  <p className="text-sm text-blue-700 mt-1 opacity-90">
                    {insight.detalhe}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs bg-white/70 px-2 py-0.5 rounded border border-blue-200 text-blue-600">
                      📌 {insight.tag}
                    </span>
                  </div>
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