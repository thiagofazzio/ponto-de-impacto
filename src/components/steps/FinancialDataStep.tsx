import React from 'react';
import { DiagnosticFormData } from '../../types';

interface FinancialDataStepProps {
  formData: DiagnosticFormData;
  onUpdate: (fields: Partial<DiagnosticFormData>) => void;
  onNext: () => void; // ➕ Adicionada prop para avançar
}

export const FinancialDataStep: React.FC<FinancialDataStepProps> = ({ formData, onUpdate, onNext }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mt-1">
          <span className="text-[#6B0F1A]">Números Financeiros</span> da Empresa
        </h2>
        <p className="text-[#5A6270] text-sm mt-1">
          Vamos analisar os números da sua empresa para calcular o Ponto de Equilíbrio.
        </p>
      </div>

      <div className="bg-white border border-[#D8D3CB] rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Faturamento Mensal (R$) *
            </label>
            <input
              type="number"
              value={formData.monthlyRevenue || ''}
              onChange={(e) => onUpdate({ monthlyRevenue: Number(e.target.value) })}
              placeholder="Ex: 50000"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Custos Fixos Mensais (R$) *
            </label>
            <input
              type="number"
              value={formData.fixedCosts || ''}
              onChange={(e) => onUpdate({ fixedCosts: Number(e.target.value) })}
              placeholder="Ex: 25000"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Custos Variáveis (%)
            </label>
            <input
              type="number"
              value={formData.variableCostsPercent || ''}
              onChange={(e) => onUpdate({ variableCostsPercent: Number(e.target.value) })}
              placeholder="Ex: 30"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Ticket Médio (R$)
            </label>
            <input
              type="number"
              value={formData.averageTicket || ''}
              onChange={(e) => onUpdate({ averageTicket: Number(e.target.value) })}
              placeholder="Ex: 100"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
            />
          </div>
        </div>

        <div className="border-t border-[#D8D3CB] pt-5">
          <button
            onClick={onNext} // 🔥 Agora chama a função onNext para avançar
            className="w-full py-3 bg-[#6B0F1A] text-white font-bold rounded-xl hover:bg-[#500B13] transition"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};