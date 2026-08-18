import React, { useRef, useState } from 'react';
import { DiagnosticResult } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose?: () => void;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ result, onClose }) => {
  const [generating, setGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const form = result.formSummary;
  const breakEven = result.breakEven;
  const primary = result.primaryBottleneck;
  const secondary = result.secondaryBottleneck;
  const evidence = result.evidenceData;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setGenerating(true);

    try {
      // Configuração robusta do html2canvas
      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Relatorio_TFAZZIO_Ponto_de_Impacto_${(form.companyName || 'Empresa').replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF com html2canvas. Usando fallback de impressão.', err);
      // Fallback: Caso html2canvas falhe, usa a impressão nativa do navegador
      window.print();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* CSS DE IMPRESSÃO DE FALLBACK */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
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
            background: white !important;
            color: #1A1A1A !important;
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif !important;
            font-size: 11px !important;
            line-height: 1.4 !important;
          }
          #pdf-content .card { background: #F9F7F3 !important; border: 1px solid #D8D3CB !important; border-radius: 6px !important; padding: 8px !important; margin-bottom: 6px !important; page-break-inside: avoid !important; }
          .no-print { display: none !important; }
          #pdf-content h1 { font-size: 20px !important; font-weight: 900 !important; color: #1A1A1A !important; }
          #pdf-content h2 { font-size: 16px !important; font-weight: 700 !important; color: #1A1A1A !important; }
          #pdf-content h3 { font-size: 14px !important; font-weight: 700 !important; color: #1A1A1A !important; }
          #pdf-content p { font-size: 11px !important; }
          #pdf-content .text-muted { color: #5A6270 !important; }
          #pdf-content .flex-between { display: flex !important; justify-content: space-between !important; }
          #pdf-content .grid-2 { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          #pdf-content .grid-3 { display: grid !important; grid-template-columns: 1fr 1fr 1fr !important; gap: 8px !important; }
          #pdf-content .badge { display: inline-block !important; background: #F4E8C1 !important; color: #6B0F1A !important; font-size: 10px !important; font-weight: 700 !important; padding: 2px 8px !important; border-radius: 12px !important; border: 1px solid #D4AF37 !important; }
        }
      `}</style>

      {/* Botão de download */}
      <div className="flex justify-end gap-3 no-print">
        {onClose && (
          <button onClick={onClose} className="px-4 py-2 border border-[#D8D3CB] rounded-lg hover:bg-[#F9F7F3] text-sm">Fechar</button>
        )}
        <button
          onClick={handleDownloadPdf}
          disabled={generating}
          className="px-6 py-3 bg-[#6B0F1A] hover:bg-[#500B13] text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer no-print"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-[#D4AF37]" />}
          <span>{generating ? 'Gerando PDF...' : 'Baixar PDF Agora (TFAZZIO)'}</span>
        </button>
      </div>

      {/* Conteúdo do PDF */}
      <div className="overflow-auto max-h-[80vh] border border-[#D8D3CB] rounded-2xl bg-[#F9F7F3] p-4 no-print">
        <div ref={pdfRef} id="pdf-content" className="w-[210mm] min-h-[297mm] bg-white text-[#1A1A1A] p-8 mx-auto space-y-4 font-sans shadow-xl text-xs">
          
          {/* Header */}
          <div className="border-b-4 border-[#6B0F1A] pb-4 flex justify-between items-end">
            <div>
              <span className="font-black text-lg tracking-tight text-[#6B0F1A]">TFAZZIO • PONTO DE IMPACTO</span>
              <h1 className="text-2xl font-black text-[#1A1A1A] uppercase">Diagnóstico Estratégico</h1>
            </div>
            <div className="text-right text-[10px] text-[#5A6270]">
              <p>Emissão: <strong className="text-[#1A1A1A]">{result.generatedAt}</strong></p>
              <p className="font-bold text-[#6B0F1A]">Relatório Executivo</p>
            </div>
          </div>

          {/* Empresa */}
          <div className="bg-[#F9F7F3] p-4 rounded-xl border border-[#D8D3CB] grid grid-cols-2 gap-3">
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">Empresa</span><strong className="text-sm font-black">{form.companyName || form.cnpjData?.razaoSocial || 'Empresa PME'}</strong></div>
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">CNPJ / Porte</span><strong className="text-[#1A1A1A]">{form.cnpj || 'Não informado'} • {form.cnpjData?.porte || 'PME'}</strong></div>
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">Segmento</span><span className="font-semibold">{form.segment}</span></div>
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">Localidade</span><span className="font-semibold">{form.cityState || 'Brasil'}</span></div>
          </div>

          {/* Clareza */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-[#6B0F1A] text-white rounded-xl text-center space-y-1">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase block">Índice de Clareza</span>
              <div className="text-4xl font-black">{result.clarityIndex}/100</div>
              <span className="text-[10px] bg-[#D4AF37] text-[#1A1A1A] font-extrabold px-2 py-0.5 rounded-full inline-block">Status: {result.clarityStatus}</span>
            </div>
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-950 rounded-xl space-y-1 col-span-2">
              <span className="text-[10px] text-rose-800 font-extrabold uppercase block">Gargalo Principal</span>
              <div className="text-sm font-black text-rose-950">{primary.name} (Nota: {primary.score}/10)</div>
              <p className="text-[11px] text-rose-900">{primary.description}</p>
            </div>
          </div>

          {/* Evidências */}
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">1. Evidências Coletadas</h3>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div className="p-2 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB]">
                <span className="font-bold text-[#6B0F1A] block">CNPJ</span>
                <p className="font-semibold">{form.cnpjData?.razaoSocial || form.companyName}</p>
                <p className="text-[10px] text-[#5A6270]">Porte: {form.cnpjData?.porte || 'PME'}</p>
              </div>
              <div className="p-2 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB]">
                <span className="font-bold text-[#6B0F1A] block">Google Places</span>
                {evidence?.googlePlaces?.rating ? <p className="font-bold">{evidence.googlePlaces.rating} ★</p> : <p className="text-[10px] text-[#5A6270]">Perfil não localizado.</p>}
              </div>
              <div className="p-2 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB]">
                <span className="font-bold text-[#6B0F1A] block">Imprensa</span>
                <p className="font-semibold">{evidence?.news?.length ? `${evidence.news.length} matérias` : 'Sem notícias'}</p>
              </div>
            </div>
          </div>

          {/* Financeiro */}
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">2. Engenharia Financeira</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead><tr className="bg-[#F9F7F3]"><th className="p-2 border">Métrica</th><th className="p-2 border">Valor</th></tr></thead>
              <tbody>
                <tr><td className="p-2 border">Faturamento Mensal</td><td className="p-2 border font-mono font-bold text-[#6B0F1A]">{formatCurrency(breakEven.monthlyRevenue)}</td></tr>
                <tr className="bg-[#F9F7F3]/50"><td className="p-2 border">Custos Fixos Totais</td><td className="p-2 border font-mono font-bold text-rose-900">{formatCurrency(breakEven.fixedCostsTotal)}</td></tr>
                <tr><td className="p-2 border">Ponto de Equilíbrio</td><td className="p-2 border font-mono font-bold text-[#6B0F1A]">{formatCurrency(breakEven.breakEvenRevenue)}</td></tr>
                <tr className="bg-[#F9F7F3]/50"><td className="p-2 border">Lucro Líquido Estimado</td><td className="p-2 border font-mono font-bold text-emerald-900">{formatCurrency(breakEven.estimatedNetProfit)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* Áreas */}
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">3. Pontuação das 6 Áreas</h3>
            <div className="grid grid-cols-3 gap-2">
              {(Object.values(result.areaScores)).map((area: any) => (
                <div key={area.key} className="p-2 bg-[#F9F7F3] rounded-lg border border-[#D8D3CB] flex justify-between">
                  <span className="font-bold">{area.name}</span>
                  <span className="font-mono font-bold text-[#6B0F1A]">{area.score}/10</span>
                </div>
              ))}
            </div>
          </div>

          {/* Plano de Ação */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">4. Plano de Ação de 90 Dias</h3>
            {[result.actionPlan90Days.phase1, result.actionPlan90Days.phase2, result.actionPlan90Days.phase3].map((phase) => (
              <div key={phase.phaseNumber} className="p-3 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB]">
                <div className="flex justify-between font-bold text-xs">
                  <span className="text-[#6B0F1A]">{phase.period}: {phase.title}</span>
                  <span className="text-[10px]">Meta: {phase.goal}</span>
                </div>
                <ul className="list-disc pl-4 text-[11px]">
                  {phase.tasks.map((t) => <li key={t.id}><strong>{t.title}:</strong> {t.description}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};