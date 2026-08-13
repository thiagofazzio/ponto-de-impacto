import React from 'react';
import { DiagnosticFormData } from '../../types';
import { ArrowRight, Building, Mail } from 'lucide-react';

interface ReviewStepProps {
  formData: DiagnosticFormData;
  onUpdate: (fields: Partial<DiagnosticFormData>) => void;
  onRunDiagnostic: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ formData, onUpdate, onRunDiagnostic }) => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail);
  const isContactValid =
    formData.contactName.trim().length > 1 &&
    isValidEmail &&
    formData.contactPhone.trim().length >= 8 &&
    formData.consentGiven;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-[#6B0F1A] uppercase tracking-wider">Etapa 13 de 13 • Confirmação</span>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mt-1">Tudo pronto para gerar o seu relatório!</h2>
        <p className="text-[#5A6270] text-sm mt-1">Revise os dados da sua empresa antes do processamento do diagnóstico estratégico TFAZZIO.</p>
      </div>

      <div className="bg-white border border-[#D8D3CB] rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
        <div className="p-4 rounded-xl bg-[#F9F7F3] border border-[#D8D3CB] space-y-2">
          <div className="flex items-center gap-2 text-[#6B0F1A] font-extrabold text-sm">
            <Building className="w-4 h-4" />
            <span>{formData.companyName || formData.cnpjData?.razaoSocial || 'Empresa PME'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#1A1A1A] pt-1">
            <div><span className="text-[#5A6270] block">CNPJ:</span> {formData.cnpj || 'Não informado'}</div>
            <div><span className="text-[#5A6270] block">Segmento:</span> {formData.segment}</div>
            <div><span className="text-[#5A6270] block">Funcionários:</span> {formData.employeesCount}</div>
            <div><span className="text-[#5A6270] block">Regime:</span> {formData.taxRegime}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB] text-xs">
            <span className="text-[#5A6270] block">Faturamento Mensal</span>
            <span className="font-mono font-bold text-[#6B0F1A] text-sm">{formatCurrency(formData.monthlyRevenue || 0)}</span>
          </div>
          <div className="p-3 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB] text-xs">
            <span className="text-[#5A6270] block">Custos Fixos</span>
            <span className="font-mono font-bold text-[#1A1A1A] text-sm">{formatCurrency(formData.fixedCosts || 0)}</span>
          </div>
          <div className="p-3 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB] text-xs">
            <span className="text-[#5A6270] block">Custos Variáveis</span>
            <span className="font-mono font-bold text-[#1A1A1A] text-sm">{formData.variableCostsPercent}%</span>
          </div>
          <div className="p-3 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB] text-xs">
            <span className="text-[#5A6270] block">Impostos s/ Venda</span>
            <span className="font-mono font-bold text-[#1A1A1A] text-sm">{formData.taxesPercent}%</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6270] mb-3">Notas da Autoavaliação (1 a 5★):</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between"><span className="text-[#5A6270]">Financeiro</span><span className="font-bold text-[#6B0F1A]">{formData.scoreFinanceiro}★</span></div>
            <div className="p-2.5 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between"><span className="text-[#5A6270]">Comercial</span><span className="font-bold text-[#6B0F1A]">{formData.scoreComercial}★</span></div>
            <div className="p-2.5 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between"><span className="text-[#5A6270]">Operação</span><span className="font-bold text-[#6B0F1A]">{formData.scoreOperacao}★</span></div>
            <div className="p-2.5 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between"><span className="text-[#5A6270]">Gestão</span><span className="font-bold text-[#6B0F1A]">{formData.scoreGestao}★</span></div>
            <div className="p-2.5 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between"><span className="text-[#5A6270]">Pessoas</span><span className="font-bold text-[#6B0F1A]">{formData.scorePessoas}★</span></div>
            <div className="p-2.5 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between"><span className="text-[#5A6270]">Estratégia</span><span className="font-bold text-[#6B0F1A]">{formData.scoreEstrategia}★</span></div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#F9F7F3] border border-[#D8D3CB] space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6270] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#6B0F1A]" /> Para onde enviamos o seu diagnóstico?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Seu nome *</label>
              <input type="text" value={formData.contactName} onChange={(e) => onUpdate({ contactName: e.target.value })} placeholder="Nome completo"
                className="w-full bg-white border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">E-mail *</label>
              <input type="email" value={formData.contactEmail} onChange={(e) => onUpdate({ contactEmail: e.target.value })} placeholder="seu@email.com"
                className="w-full bg-white border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">WhatsApp *</label>
              <input type="tel" value={formData.contactPhone} onChange={(e) => onUpdate({ contactPhone: e.target.value })} placeholder="(11) 99999-9999"
                className="w-full bg-white border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20" />
            </div>
          </div>
          <label className="flex items-start gap-2.5 text-xs text-[#5A6270] leading-relaxed cursor-pointer">
            <input type="checkbox" checked={formData.consentGiven} onChange={(e) => onUpdate({ consentGiven: e.target.checked })} className="mt-0.5 accent-[#6B0F1A] w-4 h-4 shrink-0" />
            <span>Concordo em receber o diagnóstico e ser contatado pela TFAZZIO, e autorizo o uso dos dados informados para essa finalidade.</span>
          </label>
        </div>

        <div className="pt-2">
          <button id="btn-generate-report-final" onClick={onRunDiagnostic} disabled={!isContactValid}
            className="w-full py-4 bg-[#6B0F1A] hover:bg-[#500B13] disabled:opacity-40 disabled:hover:bg-[#6B0F1A] disabled:cursor-not-allowed text-white font-extrabold text-lg rounded-xl shadow-lg flex items-center justify-center gap-3 transition hover:scale-[1.01] cursor-pointer">
            <span>Processar Diagnóstico & Gerar Relatório Visual</span>
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
          {!isContactValid && <p className="text-center text-xs text-[#5A6270] mt-2">Preencha nome, e-mail, WhatsApp e aceite os termos para continuar.</p>}
        </div>
      </div>
    </div>
  );
};
