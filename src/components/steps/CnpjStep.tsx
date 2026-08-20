import React, { useState } from 'react';
import { DiagnosticFormData, CompanyCNPJData } from '../../types';
import { Search, Building2, MapPin, Briefcase, Calendar, Users, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { WizardNavigation } from '../WizardNavigation';

interface CnpjStepProps {
  cnpj: string;
  cnpjData: CompanyCNPJData | null;
  onUpdate: (cnpj: string, data: CompanyCNPJData | null) => void;
  onNext: () => void;
  onPrevious: () => void; // 🔥 NOVO: recebe a função de voltar
  formData: DiagnosticFormData;
  updateFormData: (fields: Partial<DiagnosticFormData>) => void;
}

export const CnpjStep: React.FC<CnpjStepProps> = ({
  cnpj,
  cnpjData,
  onUpdate,
  onNext,
  onPrevious,
  formData,
  updateFormData,
}) => {
  const [localCnpj, setLocalCnpj] = useState(cnpj || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 14) {
      setLocalCnpj(formatCnpj(raw));
      setError(null);
      // 🔥 Só busca se tiver 14 dígitos
      if (raw.length === 14) {
        fetchCnpj(raw);
      }
    }
  };

  const fetchCnpj = async (rawCnpj: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/cnpj/${rawCnpj}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'CNPJ não encontrado');
      }
      const data = await response.json();
      onUpdate(rawCnpj, data);
      // 🔥 Se encontrou dados, desativa o modo manual
      setManualMode(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar CNPJ. Preencha os dados manualmente.');
      // 🔥 Se deu erro, ativa o modo manual
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Função para avançar
  const handleNext = () => {
    // Se tem CNPJ preenchido, valida
    if (cnpjData) {
      onNext();
      return;
    }
    // Se está em modo manual, valida os campos
    if (manualMode && formData.companyName && formData.segment) {
      onNext();
      return;
    }
    setError('Preencha os dados da empresa para continuar.');
  };

  // 🔥 Verifica se pode avançar
  const canProceed = () => {
    if (cnpjData) return true;
    if (manualMode && formData.companyName && formData.segment) return true;
    return false;
  };

  // 🔥 Ativa modo manual
  const enableManualMode = () => {
    setManualMode(true);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mt-1">
          <span className="text-[#6B0F1A]">Dados</span> da Empresa
        </h2>
        <p className="text-[#5A6270] text-sm mt-1">
          Informe o CNPJ para preencher automaticamente.
        </p>
      </div>

      <div className="bg-white border border-[#D8D3CB] rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
        
        {/* 🔥 Campo CNPJ */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
            CNPJ
          </label>
          <div className="relative">
            <input
              type="text"
              value={localCnpj}
              onChange={handleCnpjChange}
              placeholder="00.000.000/0000-00"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
              maxLength={18}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-[#6B0F1A] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#5A6270] mt-1">
            Digite o CNPJ para buscar dados automaticamente.
          </p>
        </div>

        {/* 🔥 ERRO */}
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 🔥 DADOS DO CNPJ (quando encontrado) - SEMPRE VISÍVEL */}
        {cnpjData && !manualMode && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dados encontrados automaticamente!</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#5A6270] block font-medium">Razão Social</span>
                <span className="font-bold text-[#1A1A1A]">{cnpjData.razaoSocial}</span>
              </div>
              <div>
                <span className="text-[#5A6270] block font-medium">Nome Fantasia</span>
                <span className="font-semibold">{cnpjData.nomeFantasia || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-[#5A6270] block font-medium">Porte</span>
                <span className="font-semibold text-[#6B0F1A]">{cnpjData.porte || 'PME'}</span>
              </div>
              <div>
                <span className="text-[#5A6270] block font-medium">CNAE</span>
                <span className="font-semibold">{cnpjData.cnaeDescricao || 'Não informado'}</span>
              </div>
              {cnpjData.logradouro && (
                <div className="sm:col-span-2">
                  <span className="text-[#5A6270] block font-medium">Endereço</span>
                  <span className="font-semibold">{cnpjData.logradouro}, {cnpjData.municipio} - {cnpjData.uf}</span>
                </div>
              )}
            </div>
            <button
              onClick={enableManualMode}
              className="text-xs text-[#6B0F1A] font-semibold hover:underline"
            >
              Corrigir dados manualmente
            </button>
          </div>
        )}

        {/* 🔥 MODO MANUAL - SÓ APARECE SE CLICOU EM "Corrigir" OU SE DEU ERRO */}
        {(manualMode || (!cnpjData && localCnpj.length > 0)) && (
          <div className="space-y-4">
            <div className="p-3 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB]">
              <p className="text-xs text-[#5A6270]">
                {cnpjData ? '✏️ Editando dados manualmente' : '📝 Preencha os dados manualmente'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData({ companyName: e.target.value })}
                  placeholder="Ex: ACME Soluções"
                  className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Segmento de Atuação *
                </label>
                <input
                  type="text"
                  value={formData.segment}
                  onChange={(e) => updateFormData({ segment: e.target.value })}
                  placeholder="Ex: Tecnologia, Comércio, Serviços..."
                  className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Cidade / Estado
                </label>
                <input
                  type="text"
                  value={formData.cityState}
                  onChange={(e) => updateFormData({ cityState: e.target.value })}
                  placeholder="Ex: São Paulo / SP"
                  className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Porte da Empresa
                </label>
                <select
                  value={formData.employeesCount || '6_15'}
                  onChange={(e) => updateFormData({ employeesCount: e.target.value })}
                  className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
                >
                  <option value="1_5">1 a 5 funcionários</option>
                  <option value="6_15">6 a 15 funcionários</option>
                  <option value="16_50">16 a 50 funcionários</option>
                  <option value="51_100">51 a 100 funcionários</option>
                  <option value="100+">Mais de 100 funcionários</option>
                </select>
              </div>
            </div>

            {cnpjData && (
              <button
                onClick={() => {
                  setManualMode(false);
                  setError(null);
                }}
                className="text-xs text-[#6B0F1A] font-semibold hover:underline"
              >
                Voltar aos dados automáticos
              </button>
            )}
          </div>
        )}
      </div>

      {/* 🔥 NAVEGAÇÃO */}
      <WizardNavigation
        currentStep={4}
        totalSteps={13}
        onPrevious={onPrevious}
        onNext={handleNext}
        isNextDisabled={!canProceed()}
        nextLabel="Continuar"
        showPrevious={true}
      />
    </div>
  );
};