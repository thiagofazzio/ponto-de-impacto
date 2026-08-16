import React from 'react';
import { DiagnosticResult } from '../../types';
import { Building2, Target, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose: () => void;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ result, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <>
      {/* 🔥 ESTILOS DE IMPRESSÃO - MANTÉM O DESIGN */}
      <style>{`
        @media print {
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
            padding: 30px !important;
            background: white !important;
            color: #1A1A1A !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
          }
          #pdf-content .card {
            background: #F9F7F3 !important;
            border: 1px solid #D8D3CB !important;
            border-radius: 12px !important;
            padding: 16px !important;
            margin-bottom: 12px !important;
          }
          #pdf-content .card-rose {
            border: 2px solid #fca5a5 !important;
            background: #fef2f2 !important;
          }
          #pdf-content .card-gold {
            border: 2px solid #D4AF37 !important;
            background: #F4E8C1 !important;
          }
          #pdf-content .badge {
            display: inline-block !important;
            background: #F4E8C1 !important;
            color: #6B0F1A !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            padding: 2px 10px !important;
            border-radius: 20px !important;
            border: 1px solid #D4AF37 !important;
          }
          #pdf-content h1 { font-size: 24px !important; font-weight: 900 !important; color: #1A1A1A !important; }
          #pdf-content h2 { font-size: 18px !important; font-weight: 700 !important; color: #1A1A1A !important; margin-top: 16px !important; }
          #pdf-content h3 { font-size: 16px !important; font-weight: 700 !important; color: #1A1A1A !important; margin-top: 12px !important; }
          #pdf-content p { font-size: 13px !important; line-height: 1.6 !important; color: #1A1A1A !important; }
          #pdf-content .text-muted { color: #5A6270 !important; font-size: 12px !important; }
          #pdf-content .text-red { color: #6B0F1A !important; }
          #pdf-content .grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          #pdf-content .border-top { border-top: 1px solid #D8D3CB !important; padding-top: 12px !important; margin-top: 12px !important; }
          #pdf-content ul { padding-left: 20px !important; margin: 8px 0 !important; }
          #pdf-content li { font-size: 13px !important; margin-bottom: 4px !important; }
          #pdf-content .flex { display: flex !important; align-items: center !important; gap: 8px !important; }
          #pdf-content .gap-2 { gap: 8px !important; }
          #pdf-content .mb-2 { margin-bottom: 8px !important; }
          #pdf-content .mb-4 { margin-bottom: 16px !important; }
          .no-print { display: none !important; }
        }
        @page {
          margin: 1.5cm;
          size: A4;
        }
      `}</style>

      {/* 🔥 CONTEÚDO DO PDF - VISUAL BONITO */}
      <div id="pdf-content" className="max-w-3xl mx-auto" style={{ padding: '20px' }}>
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div className="badge" style={{ display: 'inline-block', background: '#F4E8C1', color: '#6B0F1A', fontSize: '10px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px', border: '1px solid #D4AF37' }}>
              Relatório Executivo TFAZZIO
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1A1A1A', marginTop: '4px' }}>
              Diagnóstico Ponto de Impacto
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#5A6270' }}>Gerado em: {result.generatedAt}</p>
          </div>
        </div>

        {/* Empresa */}
        <div className="card" style={{ background: '#F9F7F3', border: '1px solid #D8D3CB', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div className="flex" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#6B0F1A" />
            <strong style={{ fontSize: '16px', color: '#6B0F1A' }}>{result.formSummary.companyName || 'Empresa PME'}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '12px', marginTop: '4px' }}>
            <span><strong>CNPJ:</strong> {result.formSummary.cnpj || 'Não informado'}</span>
            <span><strong>Segmento:</strong> {result.formSummary.segment}</span>
            <span><strong>Porte:</strong> {result.formSummary.cnpjData?.porte || 'PME'}</span>
            <span><strong>Funcionários:</strong> {result.formSummary.employeesCount?.replace('_', ' ~ ')}</span>
          </div>
        </div>

        {/* Objetivo e Dor */}
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div className="card" style={{ background: '#F9F7F3', border: '1px solid #D8D3CB', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#5A6270', marginBottom: '4px' }}>🎯 Objetivo Reportado</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{result.formSummary.mainGoal || 'Não informado'}</p>
          </div>
          <div className="card" style={{ background: '#F9F7F3', border: '1px solid #D8D3CB', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#5A6270', marginBottom: '4px' }}>🚧 Principal Dor</p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>{result.formSummary.biggestDifficulty || 'Não informado'}</p>
          </div>
        </div>

        {/* Índice de Clareza */}
        <div className="card" style={{ background: '#F9F7F3', border: '1px solid #D8D3CB', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div className="flex" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#5A6270' }}>Índice de Clareza</span>
            <span style={{ fontSize: '32px', fontWeight: '900', color: '#6B0F1A' }}>{result.clarityIndex}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#5A6270', marginTop: '4px' }}>{result.clarityDescription}</p>
        </div>

        {/* Gargalos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          {/* Gargalo Principal */}
          <div className="card-rose" style={{ border: '2px solid #fca5a5', background: '#fef2f2', borderRadius: '12px', padding: '16px' }}>
            <div className="flex" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} color="#dc2626" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#dc2626' }}>Gargalo Principal</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>{result.primaryBottleneck.name}</p>
            <p style={{ fontSize: '13px', color: '#1A1A1A' }}>Nota: {result.primaryBottleneck.score}/10</p>
            <p style={{ fontSize: '12px', color: '#5A6270' }}>{result.primaryBottleneck.description}</p>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#6B0F1A', marginTop: '4px' }}>Ação: {result.primaryBottleneck.immediateAction}</p>
          </div>

          {/* Gargalo Secundário */}
          <div className="card-gold" style={{ border: '2px solid #D4AF37', background: '#F4E8C1', borderRadius: '12px', padding: '16px' }}>
            <div className="flex" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#6B0F1A" />
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6B0F1A' }}>Gargalo Secundário</span>
            </div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>{result.secondaryBottleneck.name}</p>
            <p style={{ fontSize: '13px', color: '#1A1A1A' }}>Nota: {result.secondaryBottleneck.score}/10</p>
            <p style={{ fontSize: '12px', color: '#5A6270' }}>{result.secondaryBottleneck.description}</p>
          </div>
        </div>

        {/* Engenharia Financeira */}
        <div className="card" style={{ background: '#F9F7F3', border: '1px solid #D8D3CB', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <div className="flex" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#6B0F1A" />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>Engenharia Financeira</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
            <div><strong>Faturamento:</strong> {formatCurrency(result.breakEven.monthlyRevenue)}</div>
            <div><strong>Break-Even:</strong> {formatCurrency(result.breakEven.breakEvenRevenue)}</div>
            <div><strong>Margem de Contribuição:</strong> {result.breakEven.contributionMarginPercent}%</div>
            <div><strong>Lucro Líquido:</strong> {formatCurrency(result.breakEven.estimatedNetProfit)}</div>
          </div>
        </div>

        {/* Síntese do Consultor */}
        <div className="card" style={{ background: '#F9F7F3', border: '1px solid #D8D3CB', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>🧠 Síntese do Consultor</h3>
          <p style={{ fontSize: '13px', color: '#5A6270', marginTop: '4px' }}>{result.executiveSummary}</p>
        </div>

        {/* Recomendações */}
        <div className="card" style={{ background: '#F9F7F3', border: '1px solid #D8D3CB', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1A1A1A' }}>🎯 Recomendações Estratégicas</h3>
          <ul style={{ paddingLeft: '20px', margin: '8px 0', fontSize: '13px' }}>
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