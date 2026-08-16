import React from 'react';
import { DiagnosticResult } from '../../types';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose: () => void;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ result, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl p-6 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          #pdf-content { 
            max-width: 100% !important;
            padding: 20px !important;
            font-size: 12px !important;
          }
          #pdf-content h1 { font-size: 18px !important; }
          #pdf-content h2 { font-size: 16px !important; }
          #pdf-content h3 { font-size: 14px !important; }
          #pdf-content .break-inside { page-break-inside: avoid; }
        }
        @page {
          margin: 2cm;
          size: A4;
        }
      `}</style>

      <div id="pdf-content" className="space-y-4 text-[#1A1A1A]">
        <h1 className="text-2xl font-bold text-[#6B0F1A]">
          Relatório Executivo TFAZZIO
        </h1>
        <p className="text-sm text-[#5A6270]">
          Gerado em: {result.generatedAt}
        </p>

        <div className="border-t border-[#D8D3CB] pt-4">
          <h2 className="text-xl font-bold">Diagnóstico Ponto de Impacto</h2>
          <p><strong>Empresa:</strong> {result.formSummary.companyName || 'Não informado'}</p>
          <p><strong>CNPJ:</strong> {result.formSummary.cnpj || 'Não informado'}</p>
          <p><strong>Segmento:</strong> {result.formSummary.segment || 'Não informado'}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">🎯 Objetivo Reportado</h3>
          <p className="text-sm">{result.formSummary.mainGoal || 'Não informado'}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">🚧 Principal Dor</h3>
          <p className="text-sm">{result.formSummary.biggestDifficulty || 'Não informado'}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">Índice de Clareza: {result.clarityIndex}/100</h3>
          <p className="text-sm">{result.clarityDescription}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">Gargalo Principal</h3>
          <p><strong>Área:</strong> {result.primaryBottleneck.name}</p>
          <p><strong>Nota:</strong> {result.primaryBottleneck.score}/10</p>
          <p className="text-sm">{result.primaryBottleneck.description}</p>
          <p className="text-sm font-bold text-[#6B0F1A]">Ação Imediata: {result.primaryBottleneck.immediateAction}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">Gargalo Secundário</h3>
          <p><strong>Área:</strong> {result.secondaryBottleneck.name}</p>
          <p><strong>Nota:</strong> {result.secondaryBottleneck.score}/10</p>
          <p className="text-sm">{result.secondaryBottleneck.description}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">Engenharia Financeira</h3>
          <p><strong>Faturamento Mensal:</strong> R$ {result.breakEven.monthlyRevenue.toLocaleString('pt-BR')}</p>
          <p><strong>Break-Even:</strong> R$ {result.breakEven.breakEvenRevenue.toLocaleString('pt-BR')}</p>
          <p><strong>Margem de Contribuição:</strong> {result.breakEven.contributionMarginPercent}%</p>
          <p><strong>Lucro Líquido Estimado:</strong> R$ {result.breakEven.estimatedNetProfit.toLocaleString('pt-BR')}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">Síntese do Consultor</h3>
          <p className="text-sm">{result.executiveSummary}</p>
        </div>

        <div className="border-t border-[#D8D3CB] pt-4 break-inside">
          <h3 className="font-bold text-lg">Recomendações Estratégicas</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {result.strategicRecommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 no-print">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-[#D8D3CB] rounded-lg hover:bg-[#F9F7F3]"
        >
          Fechar
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#6B0F1A] text-white rounded-lg hover:bg-[#500B13]"
        >
          Baixar PDF (Imprimir)
        </button>
      </div>
    </div>
  );
};

export default PdfGenerator;