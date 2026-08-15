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

  // Identifica o modelo do CNAE
  const identificarModeloPorCNAE = (cnae: string): string => {
    const cnaeLower = cnae.toLowerCase();
    
    const mapeamento: Record<string, string> = {
      'comercio': 'Venda de Produtos',
      'varejista': 'Venda de Produtos',
      'supermercados': 'Venda de Produtos',
      'distribuição': 'Venda de Produtos',
      'indústria': 'Venda de Produtos',
      'alimentício': 'Venda de Produtos',
      'varejo': 'Venda de Produtos',
      'atacadista': 'Venda de Produtos',
      'mercearia': 'Venda de Produtos',
      'loja': 'Venda de Produtos',
      'e-commerce': 'Venda de Produtos',
      'fabricação': 'Venda de Produtos',
      'consultoria': 'Prestação de Serviços',
      'servicos': 'Prestação de Serviços',
      'ensino': 'Prestação de Serviços',
      'saúde': 'Prestação de Serviços',
      'educação': 'Prestação de Serviços',
      'treinamento': 'Prestação de Serviços',
      'engenharia': 'Prestação de Serviços',
      'advocacia': 'Prestação de Serviços',
      'contabilidade': 'Prestação de Serviços',
      'marketing': 'Prestação de Serviços',
      'design': 'Prestação de Serviços',
      'assinatura': 'Assinatura / Recorrência',
      'software': 'Assinatura / Recorrência',
      'saas': 'Assinatura / Recorrência',
      'plataforma': 'Marketplace / Plataforma',
      'marketplace': 'Marketplace / Plataforma',
    };

    for (const [key, value] of Object.entries(mapeamento)) {
      if (cnaeLower.includes(key)) {
        return value;
      }
    }

    return 'Modelo de negócio híbrido';
  };

  const getModeloLabel = (modeloId: string): string => {
    const labels: Record<string, string> = {
      venda_produtos: 'Venda de Produtos',
      prestacao_servicos: 'Prestação de Serviços',
      assinatura: 'Assinatura / Recorrência',
      marketplace: 'Marketplace / Plataforma',
      hibrido: 'Híbrido',
      outros: 'Outro modelo',
    };
    return labels[modeloId] || modeloId;
  };

  const gerarInsight = () => {
    if (!cnpjData || loading) return null;
    
    const modeloSelecionado = formData.revenueModel;
    const cnae = cnpjData.cnaeDescricao || '';
    const modeloSugeridoPorCNAE = cnae ? identificarModeloPorCNAE(cnae) : null;
    const modeloSelecionadoLabel = modeloSelecionado ? getModeloLabel(modeloSelecionado) : null;

    // Caso 1: Usuário ainda não selecionou um modelo de receita (não deveria acontecer, mas seguro)
    if (!modeloSelecionado || modeloSelecionado === '') {
      return {
        icone: '💡',
        cor: 'bg-blue-50 border-blue-200 text-blue-800',
        titulo: 'Seu negócio, seu modelo',
        mensagem: `Empresas do seu segmento geralmente operam com ${modeloSugeridoPorCNAE || 'um modelo híbrido'}.`,
        detalhe: 'Na etapa anterior você poderá confirmar qual modelo faz mais sentido para sua realidade.',
      };
    }

    // Caso 2: Modelo selecionado é "Outro"
    if (modeloSelecionado === 'outros') {
      return {
        icone: '🚀',
        cor: 'bg-purple-50 border-purple-200 text-purple-800',
        titulo: 'Modelo personalizado detectado',
        mensagem: `Você escolheu um modelo de receita único para sua empresa.`,
        detalhe: `"${formData.customRevenueModel || 'Modelo personalizado'}" , isso mostra que você tem uma visão clara do seu negócio.`,
        tag: '🎯 Estratégia sob medida'
      };
    }

    // Caso 3: Modelo selecionado é igual ao sugerido pelo CNAE
    if (modeloSelecionadoLabel === modeloSugeridoPorCNAE) {
      return {
        icone: '🎯',
        cor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        titulo: 'Alinhamento perfeito com seu segmento',
        mensagem: `Seu modelo de receita (${modeloSelecionadoLabel}) está completamente alinhado com o mercado onde você atua.`,
        detalhe: 'Isso significa que você está no caminho certo e pode focar em escalar o que já funciona.',
        tag: '✅ Modelo validado pelo mercado'
      };
    }

    // Caso 4: Modelo selecionado é DIFERENTE do sugerido pelo CNAE (O CASO MAIS INTERESSANTE!)
    return {
      icone: '🔥',
      cor: 'bg-amber-50 border-amber-200 text-amber-800',
      titulo: 'Estratégia diferenciada detectada!',
      mensagem: `Enquanto a maioria das empresas do seu setor opera com ${modeloSugeridoPorCNAE}, você escolheu ${modeloSelecionadoLabel}.`,
      detalhe: 'Isso é um sinal de que você está inovando, se reposicionando ou aproveitando uma oportunidade única. Vamos analisar seu negócio com base na sua escolha.',
      tag: '🚀 Inovação ou reposicionamento estratégico'
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

          {/* 🔥 INSIGHT SEMPRE VISÍVEL - COM CONTEÚDO DE VERDADE */}
          {insight && (
            <div className={`p-4 rounded-xl border ${insight.cor}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icone}</span>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {insight.titulo}
                  </span>
                  <p className="text-sm font-medium mt-0.5">
                    {insight.mensagem}
                  </p>
                  {insight.detalhe && (
                    <p className="text-sm opacity-90 mt-1">
                      {insight.detalhe}
                    </p>
                  )}
                  {insight.tag && (
                    <div className="mt-2">
                      <span className="text-xs bg-white/70 px-2 py-0.5 rounded border border-current/20">
                        {insight.tag}
                      </span>
                    </div>
                  )}
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