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

  // 🔥 Função para verificar divergência do modelo de receita (REATIVADA)
  const verificarDivergenciaModelo = () => {
    if (!cnpjData || !formData.revenueModel) return null;
    
    const cnae = cnpjData.cnaeDescricao || '';
    const modelo = formData.revenueModel;
    
    const palavrasChave: Record<string, string> = {
      'comercio': 'venda_produtos',
      'varejista': 'venda_produtos',
      'supermercados': 'venda_produtos',
      'consultoria': 'prestacao_servicos',
      'servicos': 'prestacao_servicos',
      'assinatura': 'assinatura',
      'plataforma': 'marketplace',
      'distribuição': 'venda_produtos',
      'indústria': 'venda_produtos',
      'ensino': 'prestacao_servicos',
      'saúde': 'prestacao_servicos',
      'alimentício': 'venda_produtos',
      'varejo': 'venda_produtos',
    };
    
    let modeloSugerido = 'outros';
    for (const [key, value] of Object.entries(palavrasChave)) {
      if (cnae.toLowerCase().includes(key)) {
        modeloSugerido = value;
        break;
      }
    }
    
    if (modelo !== modeloSugerido && modeloSugerido !== 'outros' && modelo !== 'outros') {
      const labels: Record<string, string> = {
        venda_produtos: 'Venda de Produtos',
        prestacao_servicos: 'Prestação de Serviços',
        assinatura: 'Assinatura / Recorrência',
        marketplace: 'Marketplace / Plataforma',
        hibrido: 'Híbrido',
        outros: 'Outro modelo',
      };
      
      return {
        modeloAtual: labels[modelo] || modelo,
        modeloSugerido: labels[modeloSugerido] || modeloSugerido,
        mensagem: `Seu modelo de receita (${labels[modelo] || modelo}) é diferente do usual para empresas do seu segmento (${labels[modeloSugerido] || modeloSugerido}). Isso pode indicar uma oportunidade de posicionamento!`,
      };
    }
    
    return null;
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

  const divergencia = verificarDivergenciaModelo();

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

          {/* 🔥 INSIGHT REATIVADO */}
          {divergencia && (
            <div className="p-4 bg-[#F4E8C1] border border-[#D4AF37] rounded-xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#6B0F1A] shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-[#6B0F1A] uppercase tracking-wider">💡 Insight TFAZZIO</span>
                  <p className="text-sm text-[#1A1A1A] mt-0.5 font-medium">
                    {divergencia.mensagem}
                  </p>
                  <p className="text-xs text-[#5A6270] mt-1">
                    Seu modelo atual: <span className="font-bold text-[#6B0F1A]">{divergencia.modeloAtual}</span> • 
                    Sugestão para o segmento: <span className="font-bold text-[#6B0F1A]">{divergencia.modeloSugerido}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Botão de confirmar */}
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