import React, { useRef, useState } from 'react';
import { DiagnosticResult } from '../../types';
import { Download, Loader2, FileText, Building2, Star, Newspaper, TrendingUp, AlertTriangle, Target } from 'lucide-react';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose?: () => void;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ result, onClose }) => {
  const [generating, setGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const form = result.formSummary;
  const breakEven = result.breakEven;
  const evidence = result.evidenceData;
  const primary = result.primaryBottleneck;
  const secondary = result.secondaryBottleneck;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setGenerating(true);

    // Pequeno delay para garantir que o React renderizou o conteúdo
    setTimeout(() => {
      window.print();
      setGenerating(false);
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* CSS DE IMPRESSÃO - AQUI É O SEGREDO PARA O PDF FICAR BONITO */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.2cm;
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
            padding: 20px !important;
            background: white !important;
            color: #1A1A1A !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
            overflow: hidden !important;
          }
          #pdf-content .card { background: #F9F7F3 !important; border: 1px solid #D8D3CB !important; border-radius: 6px !important; padding: 10px !important; margin-bottom: 6px !important; page-break-inside: avoid !important; }
          .no-print { display: none !important; }
          #pdf-content .page-break { display: none !important; }
          #pdf-content h1 { font-size: 20px !important; font-weight: 900 !important; color: #1A1A1A !important; margin-bottom: 4px !important; }
          #pdf-content h2 { font-size: 14px !important; font-weight: 700 !important; color: #1A1A1A !important; margin-top: 8px !important; margin-bottom: 2px !important; }
          #pdf-content h3 { font-size: 12px !important; font-weight: 700 !important; color: #1A1A1A !important; margin-top: 6px !important; margin-bottom: 2px !important; }
          #pdf-content p { font-size: 11px !important; line-height: 1.5 !important; color: #1A1A1A !important; margin: 2px 0 !important; }
          #pdf-content .text-muted { color: #5A6270 !important; font-size: 10px !important; }
          #pdf-content .text-red { color: #6B0F1A !important; }
          #pdf-content .grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          #pdf-content .grid-3 { display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; gap: 8px !important; }
          #pdf-content .flex { display: flex !important; align-items: center !important; gap: 6px !important; }
          #pdf-content .flex-between { display: flex !important; justify-content: space-between !important; align-items: center !important; }
          #pdf-content .text-right { text-align: right !important; }
          #pdf-content .font-bold { font-weight: 700 !important; }
          #pdf-content .card-rose { border: 2px solid #fca5a5 !important; background: #fef2f2 !important; }
          #pdf-content .card-gold { border: 2px solid #D4AF37 !important; background: #F4E8C1 !important; }
          #pdf-content .badge { display: inline-block !important; background: #F4E8C1 !important; color: #6B0F1A !important; font-size: 8px !important; font-weight: 700 !important; padding: 2px 8px !important; border-radius: 12px !important; border: 1px solid #D4AF37 !important; }
          #pdf-content ul { padding-left: 16px !important; margin: 4px 0 !important; }
          #pdf-content li { font-size: 11px !important; margin-bottom: 2px !important; }
        }
      `}</style>

      {/* Action Button */}
      <div className="flex justify-end gap-3 no-print">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#D8D3CB] rounded-lg hover:bg-[#F9F7F3] text-sm transition"
          >
            Fechar
          </button>
        )}
        <button
          onClick={handleDownloadPdf}
          disabled={generating}
          className="px-6 py-3 bg-[#6B0F1A] hover:bg-[#500B13] text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer no-print"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4 text-[#D4AF37]" />}
          <span>{generating ? 'Gerando PDF...' : 'Baixar Relatório PDF (TFAZZIO)'}</span>
        </button>
      </div>

      {/* Printable Content */}
      <div className="overflow-auto max-h-[80vh] border border-[#D8D3CB] rounded-2xl bg-[#F9F7F3] p-4">
        <div
          ref={pdfRef}
          id="pdf-content"
          className="w-[210mm] min-h-[297mm] bg-white text-[#1A1A1A] p-10 mx-auto space-y-5 font-sans shadow-xl text-xs leading-relaxed"
        >
          {/* HEADER */}
          <div className="border-b-4 border-[#6B0F1A] pb-4 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-[#6B0F1A] flex items-center justify-center font-black text-[#D4AF37] text-base border border-[#500B13]">T</div>
                <span className="font-black text-lg tracking-tight text-[#6B0F1A]">TFAZZIO • PONTO DE IMPACTO</span>
              </div>
              <h1 className="text-2xl font-black text-[#1A1A1A] uppercase">Diagnóstico Estratégico</h1>
              <p className="text-[#5A6270] font-semibold text-xs mt-0.5">Análise de Gargalos, Break-Even & Plano de 90 Dias</p>
            </div>
            <div className="text-right text-[10px] text-[#5A6270]">
              <p>Emissão: <strong className="text-[#1A1A1A]">{result.generatedAt}</strong></p>
              <p className="font-bold text-[#6B0F1A]">Relatório Executivo</p>
            </div>
          </div>

          {/* EMPRESA */}
          <div className="bg-[#F9F7F3] p-4 rounded-xl border border-[#D8D3CB] grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[#5A6270] block text-[10px] uppercase font-bold">Empresa</span>
              <strong className="text-sm font-black text-[#1A1A1A]">{form.companyName || form.cnpjData?.razaoSocial || 'Empresa PME'}</strong>
            </div>
            <div>
              <span className="text-[#5A6270] block text-[10px] uppercase font-bold">CNPJ / Porte</span>
              <strong className="text-[#1A1A1A]">{form.cnpj || 'Não informado'} • {form.cnpjData?.porte || 'PME'}</strong>
            </div>
            <div>
              <span className="text-[#5A6270] block text-[10px] uppercase font-bold">Segmento</span>
              <span className="text-[#1A1A1A] font-semibold">{form.segment}</span>
            </div>
            <div>
              <span className="text-[#5A6270] block text-[10px] uppercase font-bold">Localidade</span>
              <span className="text-[#1A1A1A] font-semibold">{form.cityState || 'Brasil'}</span>
            </div>
          </div>

          {/* ÍNDICE DE CLAREZA */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#6B0F1A] text-white rounded-xl text-center space-y-1 border border-[#500B13]">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase block">Índice de Clareza</span>
              <div className="text-4xl font-black">{result.clarityIndex}/100</div>
              <span className="text-[10px] bg-[#D4AF37] text-[#1A1A1A] font-extrabold px-2 py-0.5 rounded-full inline-block">Status: {result.clarityStatus}</span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl space-y-1 col-span-2">
              <span className="text-[10px] text-rose-800 font-extrabold uppercase block">Gargalo Principal</span>
              <div className="text-sm font-black text-rose-950">{primary.name} (Nota: {primary.score}/10)</div>
              <p className="text-[11px] text-rose-900">{primary.description}</p>
              <p className="text-[11px] font-bold text-[#6B0F1A] mt-1">Ação: {primary.immediateAction}</p>
            </div>
          </div>

          {/* EVIDÊNCIAS */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">1. Evidências Coletadas</h3>
            <div className="grid grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] space-y-1">
                <span className="font-bold text-[#6B0F1A] block">CNPJ</span>
                <p className="font-semibold text-[#1A1A1A]">{form.cnpjData?.razaoSocial || form.companyName}</p>
                <p className="text-[10px] text-[#5A6270]">Porte: {form.cnpjData?.porte || 'PME'}</p>
              </div>
              <div className="p-3 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] space-y-1">
                <span className="font-bold text-[#6B0F1A] block">Google Places</span>
                {evidence?.googlePlaces?.rating ? (
                  <p className="font-bold text-[#1A1A1A]">{evidence.googlePlaces.rating} ★ ({evidence.googlePlaces.userRatingsTotal} avaliações)</p>
                ) : (
                  <p className="text-[10px] text-[#5A6270]">Perfil público não localizado.</p>
                )}
              </div>
              <div className="p-3 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] space-y-1">
                <span className="font-bold text-[#6B0F1A] block">Imprensa</span>
                <p className="font-semibold text-[#1A1A1A]">{evidence?.news?.length ? `${evidence.news.length} matérias encontradas` : 'Sem notícias recentes'}</p>
              </div>
            </div>
          </div>

          {/* FINANCEIRO */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">2. Engenharia Financeira</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead><tr className="bg-[#F9F7F3] text-[#1A1A1A]"><th className="p-2 border border-[#D8D3CB] font-bold">Métrica</th><th className="p-2 border border-[#D8D3CB] font-mono font-bold">Valor</th></tr></thead>
              <tbody>
                <tr><td className="p-2 border border-[#D8D3CB] font-semibold">Faturamento Mensal</td><td className="p-2 border border-[#D8D3CB] font-mono font-bold text-[#6B0F1A]">{formatCurrency(breakEven.monthlyRevenue)}</td></tr>
                <tr className="bg-[#F9F7F3]/50"><td className="p-2 border border-[#D8D3CB] font-semibold text-rose-900">Custos Fixos Totais</td><td className="p-2 border border-[#D8D3CB] font-mono font-bold text-rose-900">{formatCurrency(breakEven.fixedCostsTotal)}</td></tr>
                <tr><td className="p-2 border border-[#D8D3CB] font-semibold text-[#6B0F1A]">Ponto de Equilíbrio (Break-Even)</td><td className="p-2 border border-[#D8D3CB] font-mono font-bold text-[#6B0F1A]">{formatCurrency(breakEven.breakEvenRevenue)}</td></tr>
                <tr className="bg-[#F9F7F3]/50"><td className="p-2 border border-[#D8D3CB] font-semibold text-emerald-900">Lucro Líquido Estimado</td><td className="p-2 border border-[#D8D3CB] font-mono font-bold text-emerald-900">{formatCurrency(breakEven.estimatedNetProfit)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* ÁREAS */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">3. Pontuação das 6 Áreas</h3>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              {(Object.values(result.areaScores)).map((area: any) => (
                <div key={area.key} className="p-2.5 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between items-center">
                  <span className="font-bold text-[#1A1A1A]">{area.name}</span>
                  <span className="font-mono font-bold text-[#6B0F1A]">{area.score}/10</span>
                </div>
              ))}
            </div>
          </div>

          {/* PLANO DE AÇÃO */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">4. Plano de Ação de 90 Dias</h3>
            <div className="space-y-3">
              {[result.actionPlan90Days.phase1, result.actionPlan90Days.phase2, result.actionPlan90Days.phase3].map((phase) => (
                <div key={phase.phaseNumber} className="p-3 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB] space-y-1.5">
                  <div className="flex justify-between font-bold text-[#1A1A1A] text-xs">
                    <span className="text-[#6B0F1A]">{phase.period}: {phase.title}</span>
                    <span className="text-[#1A1A1A] text-[10px]">Meta: {phase.goal}</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#5A6270]">
                    {phase.tasks.map((t) => (
                      <li key={t.id}><strong className="text-[#1A1A1A]">{t.title}:</strong> {t.description}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* RODAPÉ */}
          <div className="border-t border-[#D8D3CB] pt-4 text-center text-[10px] text-[#5A6270]">
            <p>Grupo TFAZZIO • Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
};