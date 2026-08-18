import React, { useRef, useState } from 'react';
import { DiagnosticResult } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Download, Loader2 } from 'lucide-react';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose?: () => void;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ result, onClose }) => {
  const [generating, setGenerating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const form = result.formSummary;
  const breakEven = result.breakEven;
  const primary = result.primaryBottleneck;
  const evidence = result.evidenceData;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const handleDownloadPdf = async () => {
    if (!contentRef.current) return;
    setGenerating(true);

    try {
      // 🔥 Dá um tempo para o CSS ser renderizado antes de capturar
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(contentRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: contentRef.current.scrollWidth,
        height: contentRef.current.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Relatorio_TFAZZIO_Ponto_de_Impacto_${(form.companyName || 'Empresa').replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="overflow-auto max-h-[75vh] bg-[#EDEAE3] rounded-xl border border-[#D8D3CB] p-4 no-print">
        <div
          ref={contentRef}
          id="pdf-content"
          className="bg-white text-[#1A1A1A] p-8 mx-auto space-y-4 font-sans shadow-2xl"
          style={{
            width: '210mm',
            minHeight: '297mm',
          }}
        >
          {/* HEADER */}
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

          {/* EMPRESA */}
          <div className="bg-[#F9F7F3] p-4 rounded-xl border border-[#D8D3CB] grid grid-cols-2 gap-3">
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">Empresa</span><strong className="text-sm font-black">{form.companyName || form.cnpjData?.razaoSocial || 'Empresa PME'}</strong></div>
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">CNPJ / Porte</span><strong className="text-[#1A1A1A]">{form.cnpj || 'Não informado'} • {form.cnpjData?.porte || 'PME'}</strong></div>
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">Segmento</span><span className="font-semibold">{form.segment}</span></div>
            <div><span className="text-[#5A6270] block text-[10px] uppercase font-bold">Localidade</span><span className="font-semibold">{form.cityState || 'Brasil'}</span></div>
          </div>

          {/* ÍNDICE DE CLAREZA */}
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

          {/* EVIDÊNCIAS */}
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

          {/* FINANCEIRO */}
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#6B0F1A] uppercase text-xs border-b border-[#D8D3CB] pb-1">2. Engenharia Financeira</h3>
            <table>
              <thead><tr><th>Métrica</th><th>Valor</th></tr></thead>
              <tbody>
                <tr><td>Faturamento Mensal</td><td className="font-mono font-bold text-[#6B0F1A]">{formatCurrency(breakEven.monthlyRevenue)}</td></tr>
                <tr className="bg-[#F9F7F3]/50"><td>Custos Fixos Totais</td><td className="font-mono font-bold text-rose-900">{formatCurrency(breakEven.fixedCostsTotal)}</td></tr>
                <tr><td>Ponto de Equilíbrio</td><td className="font-mono font-bold text-[#6B0F1A]">{formatCurrency(breakEven.breakEvenRevenue)}</td></tr>
                <tr className="bg-[#F9F7F3]/50"><td>Lucro Líquido Estimado</td><td className="font-mono font-bold text-emerald-900">{formatCurrency(breakEven.estimatedNetProfit)}</td></tr>
              </tbody>
            </table>
          </div>

          {/* ÁREAS */}
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

          {/* PLANO DE AÇÃO */}
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