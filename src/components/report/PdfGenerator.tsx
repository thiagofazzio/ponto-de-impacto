import React, { useRef } from 'react';
import { DiagnosticResult } from '../../types';
import { Building2, Target, TrendingUp, Zap, AlertTriangle, BarChart3 } from 'lucide-react';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose: () => void;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ result, onClose }) => {
  const printCounter = useRef(0);

  const handlePrint = () => {
    if (printCounter.current > 0) return;
    printCounter.current += 1;
    setTimeout(() => {
      window.print();
      setTimeout(() => { printCounter.current = 0; }, 2000);
    }, 300);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-xl p-4 max-w-4xl mx-auto" style={{ overflow: 'auto', maxHeight: '90vh' }}>
      {/* CSS de Impressão - Versão Definitiva com 'size: A4 portrait' */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          html, body {
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #pdf-content, #pdf-content * {
            visibility: visible !important;
          }
          #pdf-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            padding: 10px !important;
            background: white !important;
            color: #1A1A1A !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
            font-size: 10px !important;
            line-height: 1.4 !important;
            overflow: hidden !important; /* Segura o conteúdo dentro da página */
          }
          #pdf-content .card { background: #F9F7F3 !important; border: 1px solid #D8D3CB !important; border-radius: 6px !important; padding: 10px !important; margin-bottom: 6px !important; page-break-inside: avoid !important; }
          .no-print { display: none !important; }
          #pdf-content .page-break { display: none !important; }
          #pdf-content h1 { font-size: 18px !important; font-weight: 900 !important; color: #1A1A1A !important; margin-bottom: 2px !important; }
          #pdf-content h2 { font-size: 14px !important; font-weight: 700 !important; color: #1A1A1A !important; margin-top: 8px !important; margin-bottom: 2px !important; }
          #pdf-content h3 { font-size: 12px !important; font-weight: 700 !important; color: #1A1A1A !important; margin-top: 6px !important; margin-bottom: 2px !important; }
          #pdf-content p { font-size: 10px !important; line-height: 1.4 !important; color: #1A1A1A !important; margin: 0 0 2px 0 !important; }
          #pdf-content .text-muted { color: #5A6270 !important; font-size: 9px !important; }
          #pdf-content .grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          #pdf-content .flex { display: flex !important; align-items: center !important; gap: 4px !important; }
          #pdf-content .flex-between { display: flex !important; justify-content: space-between !important; align-items: center !important; }
          #pdf-content .text-right { text-align: right !important; }
          #pdf-content .font-bold { font-weight: 700 !important; }
          #pdf-content .card-rose { border: 2px solid #fca5a5 !important; background: #fef2f2 !important; }
          #pdf-content .card-gold { border: 2px solid #D4AF37 !important; background: #F4E8C1 !important; }
          #pdf-content .badge { display: inline-block !important; background: #F4E8C1 !important; color: #6B0F1A !important; font-size: 8px !important; font-weight: 700 !important; padding: 2px 8px !important; border-radius: 12px !important; border: 1px solid #D4AF37 !important; }
          #pdf-content ul { padding-left: 12px !important; margin: 2px 0 !important; }
          #pdf-content li { font-size: 10px !important; margin-bottom: 1px !important; }
        }
      `}</style>

      <div id="pdf-content" className="max-w-4xl mx-auto p-4 bg-white text-[#1A1A1A]">
        {/* Cabeçalho */}
        <div className="flex-between mb-2">
          <div>
            <div className="badge">Relatório Executivo TFAZZIO</div>
            <h1>Diagnóstico Ponto de Impacto</h1>
          </div>
          <div className="text-right">
            <p className="text-muted">Gerado em: {result.generatedAt}</p>
          </div>
        </div>

        {/* Empresa */}
        <div className="card">
          <div className="flex">
            <Building2 size={14} color="#6B0F1A" />
            <strong style={{ fontSize: '13px', color: '#6B0F1A' }}>{result.formSummary.companyName || 'Empresa PME'}</strong>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-medium mt-1">
            <div><span className="text-muted">CNPJ:</span> {result.formSummary.cnpj || 'Não informado'}</div>
            <div><span className="text-muted">Segmento:</span> {result.formSummary.segment}</div>
            <div><span className="text-muted">Porte:</span> {result.formSummary.cnpjData?.porte || 'PME'}</div>
          </div>
        </div>

        {/* Objetivo e Dor */}
        <div className="grid-2">
          <div className="card"><p className="text-muted font-bold">🎯 Objetivo</p><p className="font-semibold">{result.formSummary.mainGoal || 'Não informado'}</p></div>
          <div className="card"><p className="text-muted font-bold">🚧 Dor</p><p className="font-semibold">{result.formSummary.biggestDifficulty || 'Não informado'}</p></div>
        </div>

        {/* Índice de Clareza */}
        <div className="card">
          <div className="flex-between">
            <span className="text-muted font-bold">Índice de Clareza</span>
            <span className="text-2xl font-black text-[#6B0F1A]">{result.clarityIndex}</span>
          </div>
          <p className="text-xs text-[#5A6270]">{result.clarityDescription}</p>
        </div>

        {/* Gargalos */}
        <div className="grid-2">
          <div className="card card-rose">
            <div className="flex"><AlertTriangle size={14} color="#dc2626" /><span className="font-bold text-rose-700 text-xs">Gargalo Principal</span></div>
            <p className="font-bold text-sm">{result.primaryBottleneck.name}</p>
            <p className="text-xs">Nota: {result.primaryBottleneck.score}/10</p>
            <p className="text-xs">{result.primaryBottleneck.description}</p>
            <p className="text-xs font-bold text-[#6B0F1A] mt-1">Ação: {result.primaryBottleneck.immediateAction}</p>
          </div>
          <div className="card card-gold">
            <div className="flex"><Zap size={14} color="#6B0F1A" /><span className="font-bold text-[#6B0F1A] text-xs">Gargalo Secundário</span></div>
            <p className="font-bold text-sm">{result.secondaryBottleneck.name}</p>
            <p className="text-xs">Nota: {result.secondaryBottleneck.score}/10</p>
            <p className="text-xs">{result.secondaryBottleneck.description}</p>
          </div>
        </div>

        {/* Financeiro */}
        <div className="card">
          <div className="flex"><TrendingUp size={14} color="#6B0F1A" /><span className="font-bold text-sm">Engenharia Financeira</span></div>
          <div className="grid grid-cols-2 gap-2 text-xs mt-1">
            <div><strong>Faturamento:</strong> {formatCurrency(result.breakEven.monthlyRevenue)}</div>
            <div><strong>Break-Even:</strong> {formatCurrency(result.breakEven.breakEvenRevenue)}</div>
            <div><strong>Margem:</strong> {result.breakEven.contributionMarginPercent}%</div>
            <div><strong>Lucro:</strong> {formatCurrency(result.breakEven.estimatedNetProfit)}</div>
          </div>
        </div>

        {/* Síntese */}
        <div className="card">
          <h3>Síntese do Consultor</h3>
          <p className="text-xs text-[#5A6270]">{result.executiveSummary}</p>
        </div>

        {/* Recomendações */}
        <div className="card">
          <h3>Recomendações Estratégicas</h3>
          <ul>
            {result.strategicRecommendations.slice(0, 4).map((rec, idx) => <li key={idx}>{rec}</li>)}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3 no-print">
        <button onClick={onClose} className="px-4 py-2 border border-[#D8D3CB] rounded-lg hover:bg-[#F9F7F3] text-sm">Fechar</button>
        <button onClick={handlePrint} className="px-4 py-2 bg-[#6B0F1A] text-white rounded-lg hover:bg-[#500B13] text-sm">Baixar PDF</button>
      </div>
    </div>
  );
};