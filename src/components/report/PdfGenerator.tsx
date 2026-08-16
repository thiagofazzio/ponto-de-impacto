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
    <>
      {/* 🔥 ESTILOS DE IMPRESSÃO - FORÇADOS */}
      <style>{`
        @media print {
          /* Esconde tudo que não está dentro do #pdf-content */
          body * {
            visibility: hidden !important;
          }
          #pdf-content, #pdf-content * {
            visibility: visible !important;
          }
          #pdf-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 40px !important;
            background: white !important;
            color: #1A1A1A !important;
            font-size: 12px !important;
            font-family: Arial, Helvetica, sans-serif !important;
            line-height: 1.6 !important;
          }
          #pdf-content h1 {
            font-size: 22px !important;
            color: #6B0F1A !important;
            margin-bottom: 12px !important;
          }
          #pdf-content h2 {
            font-size: 18px !important;
            margin-top: 16px !important;
            margin-bottom: 8px !important;
          }
          #pdf-content h3 {
            font-size: 16px !important;
            margin-top: 12px !important;
            margin-bottom: 6px !important;
          }
          #pdf-content p {
            margin-bottom: 4px !important;
          }
          #pdf-content .border-t {
            border-top: 1px solid #D8D3CB !important;
            padding-top: 12px !important;
            margin-top: 12px !important;
          }
          #pdf-content ul {
            padding-left: 24px !important;
            margin: 8px 0 !important;
          }
          #pdf-content li {
            margin-bottom: 4px !important;
          }
          #pdf-content .break-inside {
            page-break-inside: avoid !important;
          }
          #pdf-content .text-sm {
            font-size: 12px !important;
          }
          #pdf-content .text-xs {
            font-size: 10px !important;
          }
          #pdf-content strong {
            color: #1A1A1A !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @page {
          margin: 1.5cm;
          size: A4;
        }
      `}</style>

      {/* 🔥 CONTEÚDO DO PDF - ISOLADO */}
      <div id="pdf-content" className="bg-white rounded-xl p-6 max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#6B0F1A' }}>
            Relatório Executivo TFAZZIO
          </h1>
          <p style={{ fontSize: '12px', color: '#5A6270' }}>
            Gerado em: {result.generatedAt}
          </p>
        </div>

        {/* Diagnóstico */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Diagnóstico Ponto de Impacto</h2>
          <p><strong>Empresa:</strong> {result.formSummary.companyName || 'Não informado'}</p>
          <p><strong>CNPJ:</strong> {result.formSummary.cnpj || 'Não informado'}</p>
          <p><strong>Segmento:</strong> {result.formSummary.segment || 'Não informado'}</p>
        </div>

        {/* Objetivo e Dor */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>🎯 Objetivo Reportado</h3>
          <p style={{ fontSize: '12px' }}>{result.formSummary.mainGoal || 'Não informado'}</p>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '8px' }}>🚧 Principal Dor</h3>
          <p style={{ fontSize: '12px' }}>{result.formSummary.biggestDifficulty || 'Não informado'}</p>
        </div>

        {/* Clareza */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Índice de Clareza: {result.clarityIndex}/100</h3>
          <p style={{ fontSize: '12px' }}>{result.clarityDescription}</p>
        </div>

        {/* Gargalo Principal */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Gargalo Principal</h3>
          <p><strong>Área:</strong> {result.primaryBottleneck.name}</p>
          <p><strong>Nota:</strong> {result.primaryBottleneck.score}/10</p>
          <p style={{ fontSize: '12px' }}>{result.primaryBottleneck.description}</p>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#6B0F1A' }}>
            Ação Imediata: {result.primaryBottleneck.immediateAction}
          </p>
        </div>

        {/* Gargalo Secundário */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Gargalo Secundário</h3>
          <p><strong>Área:</strong> {result.secondaryBottleneck.name}</p>
          <p><strong>Nota:</strong> {result.secondaryBottleneck.score}/10</p>
          <p style={{ fontSize: '12px' }}>{result.secondaryBottleneck.description}</p>
        </div>

        {/* Financeiro */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Engenharia Financeira</h3>
          <p><strong>Faturamento Mensal:</strong> R$ {result.breakEven.monthlyRevenue.toLocaleString('pt-BR')}</p>
          <p><strong>Break-Even:</strong> R$ {result.breakEven.breakEvenRevenue.toLocaleString('pt-BR')}</p>
          <p><strong>Margem de Contribuição:</strong> {result.breakEven.contributionMarginPercent}%</p>
          <p><strong>Lucro Líquido Estimado:</strong> R$ {result.breakEven.estimatedNetProfit.toLocaleString('pt-BR')}</p>
        </div>

        {/* Síntese */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Síntese do Consultor</h3>
          <p style={{ fontSize: '12px' }}>{result.executiveSummary}</p>
        </div>

        {/* Recomendações */}
        <div style={{ borderTop: '1px solid #D8D3CB', paddingTop: '12px', marginTop: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Recomendações Estratégicas</h3>
          <ul style={{ paddingLeft: '24px', margin: '8px 0', fontSize: '12px' }}>
            {result.strategicRecommendations.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 🔥 BOTÕES - NÃO APARECEM NA IMPRESSÃO */}
      <div className="mt-6 flex justify-end gap-3 no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
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
    </>
  );
};

export default PdfGenerator;