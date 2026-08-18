import React, { useRef, useState } from 'react';
import { DiagnosticResult } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Loader2 } from 'lucide-react';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose?: () => void;
}

// Dimensões fixas do A4 em mm — usadas tanto na captura quanto no PDF
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

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
      // Espera as fontes carregarem de verdade antes de capturar.
      // Sem isso, o html2canvas pode fotografar o DOM no meio de um
      // reflow (fonte ainda com fallback), o que causa texto
      // sobreposto/desalinhado no resultado final.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // Um frame extra para garantir que o layout já assentou
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const node = contentRef.current;

      const canvas = await html2canvas(node, {
        scale: 2, // 3 é exagero: aumenta muito o custo de memória sem ganho perceptível no A4
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        // Usa o tamanho real do próprio elemento (já é 210mm fixo),
        // nunca scrollWidth/scrollHeight — isso evita capturar área
        // "fantasma" fora do conteúdo real.
        width: node.offsetWidth,
        height: node.offsetHeight,
        windowWidth: node.offsetWidth,
        windowHeight: node.offsetHeight,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');

      // Proporção real de pixels do canvas por mm de página.
      // É isso que faltava no cálculo anterior: sem essa razão exata,
      // o corte de páginas ficava impreciso e sobrava conteúdo
      // repetido na página seguinte.
      const pxPerMm = canvas.width / A4_WIDTH_MM;
      const pageHeightPx = Math.floor(A4_HEIGHT_MM * pxPerMm);
      const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

      for (let page = 0; page < totalPages; page++) {
        const sourceY = page * pageHeightPx;
        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - sourceY);
        if (sliceHeightPx <= 0) break;

        // Recorta a fatia real dessa página em um canvas separado,
        // em vez de reaproveitar a imagem inteira deslocada.
        // Isso garante que cada página mostre exatamente o seu
        // trecho, sem repetir nem sobrepor conteúdo de outra página.
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;
        const ctx = pageCanvas.getContext('2d');
        if (!ctx) continue;
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, sliceHeightPx,
          0, 0, canvas.width, sliceHeightPx
        );

        const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHeightMm = sliceHeightPx / pxPerMm;

        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH_MM, sliceHeightMm);
      }

      const fileName = `Relatorio_TFAZZIO_Ponto_de_Impacto_${(form.companyName || 'Empresa').replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF com html2canvas.', err);
      alert('Não foi possível gerar o PDF automaticamente. Tente novamente ou use Ctrl+P.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    // Container externo controla o espaço disponível na tela.
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

      {/*
        PRÉVIA NA TELA
        --------------
        Este é o bug do "abre com zoom e sem barra de rolagem": antes,
        o div de 210mm ficava solto no fluxo normal da página, sem
        nenhum container com scroll — o navegador não tinha opção a
        não ser encolher tudo (zoom).

        A correção: um container próprio com `overflow-auto` e altura
        limitada à viewport, e dentro dele o conteúdo é exibido em
        escala reduzida via `transform: scale()`. O elemento real
        (contentRef) continua com o tamanho A4 completo no DOM — é só
        a APARÊNCIA na tela que é menor. Isso não afeta a captura do
        html2canvas, que sempre trabalha com o tamanho real do nó.
      */}
      <div className="overflow-auto max-h-[75vh] bg-[#EDEAE3] rounded-xl border border-[#D8D3CB] p-4">
        <div
          style={{
            width: '210mm',
            transform: 'scale(0.55)',
            transformOrigin: 'top center',
            // compensa visualmente o espaço "vazio" deixado pela escala,
            // para o container de scroll não ficar com sobra enorme embaixo
            marginBottom: '-45%',
          }}
        >
          <div
            ref={contentRef}
            id="pdf-content"
            className="bg-white text-[#1A1A1A] p-8 mx-auto space-y-4 font-sans text-xs shadow-2xl"
            style={{
              backgroundColor: '#ffffff',
              width: '210mm',
              minHeight: '297mm',
            }}
          >
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
    </div>
  );
};