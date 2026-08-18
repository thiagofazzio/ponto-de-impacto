import React, { useRef, useState, useEffect } from 'react';
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
  const [contentReady, setContentReady] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const form = result.formSummary;
  const breakEven = result.breakEven;
  const primary = result.primaryBottleneck;
  const evidence = result.evidenceData;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // ------------------------------------------------------------
  // GARANTE QUE O HTML ESTEJA TOTALMENTE RENDERIZADO
  // ANTES DE LIBERAR O BOTÃO DE PDF
  // ------------------------------------------------------------
  useEffect(() => {
    const prepareContent = async () => {
      if (!contentRef.current) return;

      // Força o navegador a calcular o layout
      contentRef.current.getBoundingClientRect();

      // Aguarda fontes
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // Aguarda alguns frames para garantir pintura completa
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
      });

      setContentReady(true);
    };

    prepareContent();
  }, []);

  // ------------------------------------------------------------
  // GERA O PDF
  // ------------------------------------------------------------
  const handleDownloadPdf = async () => {
    if (!contentRef.current || !contentReady || generating) return;

    setGenerating(true);

    try {
      // --------------------------------------------------------
      // 1. GARANTE FONTES CARREGADAS
      // --------------------------------------------------------
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // --------------------------------------------------------
      // 2. ESPERA O NAVEGADOR TERMINAR DE PINTAR
      // --------------------------------------------------------
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        });
      });

      const node = contentRef.current;

      // --------------------------------------------------------
      // 3. DIMENSÕES REAIS DO RELATÓRIO
      // --------------------------------------------------------
      const width = node.scrollWidth;
      const height = node.scrollHeight;

      console.log('Dimensões do relatório:', {
        width,
        height,
        clientWidth: node.clientWidth,
        clientHeight: node.clientHeight,
        scrollWidth: node.scrollWidth,
        scrollHeight: node.scrollHeight,
      });

      // --------------------------------------------------------
      // 4. CAPTURA DO HTML
      //
      // O ponto importante aqui:
      // NÃO usamos o canvas gigante diretamente dentro do PDF.
      //
      // Primeiro criamos a imagem completa.
      // Depois cortamos essa imagem em páginas A4.
      // --------------------------------------------------------
      const canvas = await html2canvas(node, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',

        width,
        height,

        windowWidth: width,
        windowHeight: height,

        scrollX: 0,
        scrollY: 0,

        x: 0,
        y: 0,

        imageTimeout: 15000,
      });

      // --------------------------------------------------------
      // 5. CRIA O PDF A4
      // --------------------------------------------------------
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const A4_WIDTH_MM = 210;
      const A4_HEIGHT_MM = 297;

      // --------------------------------------------------------
      // 6. CALCULA QUANTOS PIXELS DO CANVAS REPRESENTAM
      // UMA PÁGINA A4.
      //
      // Isso é MUITO importante.
      //
      // Em vez de simplesmente pegar qualquer pedaço do canvas,
      // usamos a mesma proporção 210 x 297 do PDF.
      // --------------------------------------------------------
      const pageHeightPx =
        canvas.width * (A4_HEIGHT_MM / A4_WIDTH_MM);

      const totalPages = Math.ceil(canvas.height / pageHeightPx);

      console.log('PDF:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        pageHeightPx,
        totalPages,
      });

      // --------------------------------------------------------
      // 7. CORTA O CANVAS EM PÁGINAS A4
      // --------------------------------------------------------
      for (let page = 0; page < totalPages; page++) {
        const sourceY = page * pageHeightPx;

        const remainingHeight = canvas.height - sourceY;

        const currentPageHeightPx = Math.min(
          pageHeightPx,
          remainingHeight
        );

        // ------------------------------------------------------
        // Cria um canvas temporário para cada página
        // ------------------------------------------------------
        const pageCanvas = document.createElement('canvas');

        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.ceil(currentPageHeightPx);

        const ctx = pageCanvas.getContext('2d');

        if (!ctx) {
          throw new Error('Não foi possível criar o contexto do canvas.');
        }

        // Fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        );

        // ------------------------------------------------------
        // Copia somente a área correspondente à página atual
        // ------------------------------------------------------
        ctx.drawImage(
          canvas,

          // origem
          0,
          sourceY,
          canvas.width,
          currentPageHeightPx,

          // destino
          0,
          0,
          canvas.width,
          currentPageHeightPx
        );

        // ------------------------------------------------------
        // Converte a página para imagem
        // PNG preserva melhor textos pequenos e linhas.
        // ------------------------------------------------------
        const pageImage = pageCanvas.toDataURL('image/png');

        // ------------------------------------------------------
        // Página nova a partir da segunda
        // ------------------------------------------------------
        if (page > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // ------------------------------------------------------
        // Altura proporcional da imagem.
        //
        // A primeira página sempre ocupa exatamente:
        // 210 x 297 mm.
        //
        // A última página pode ser menor se o conteúdo terminar
        // antes do final da página.
        // ------------------------------------------------------
        const pageImageHeight =
          (currentPageHeightPx / canvas.width) *
          A4_WIDTH_MM;

        pdf.addImage(
          pageImage,
          'PNG',
          0,
          0,
          A4_WIDTH_MM,
          pageImageHeight,
          undefined,
          'FAST'
        );
      }

      // --------------------------------------------------------
      // 8. NOME DO ARQUIVO
      // --------------------------------------------------------
      const safeCompanyName = (
        form.companyName ||
        form.cnpjData?.razaoSocial ||
        'Empresa'
      )
        .replace(/[\\/:*?"<>|]+/g, '')
        .replace(/\s+/g, '_');

      const fileName = `Relatorio_TFAZZIO_Ponto_de_Impacto_${safeCompanyName}.pdf`;

      // --------------------------------------------------------
      // 9. SALVA
      // --------------------------------------------------------
      pdf.save(fileName);

    } catch (err) {
      console.error('Erro ao gerar PDF:', err);

      alert(
        'Não foi possível gerar o PDF. Tente novamente.'
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* ======================================================
          BOTÕES
      ======================================================= */}
      <div className="flex justify-end gap-3 no-print">

        {onClose && (
          <button
            onClick={onClose}
            className="
              px-4
              py-2
              border
              border-[#D8D3CB]
              rounded-lg
              hover:bg-[#F9F7F3]
              text-sm
            "
          >
            Fechar
          </button>
        )}

        <button
          onClick={handleDownloadPdf}
          disabled={generating || !contentReady}
          className="
            px-6
            py-3
            bg-[#6B0F1A]
            hover:bg-[#500B13]
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-white
            font-extrabold
            text-sm
            rounded-xl
            shadow-lg
            flex
            items-center
            gap-2
            transition
            cursor-pointer
            no-print
          "
        >
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4 text-[#D4AF37]" />
          )}

          <span>
            {generating
              ? 'Gerando PDF...'
              : 'Baixar PDF Agora (TFAZZIO)'}
          </span>
        </button>
      </div>


      {/* ======================================================
          ÁREA DE PRÉ-VISUALIZAÇÃO
      ======================================================= */}
      <div
        className="
          overflow-auto
          max-h-[75vh]
          bg-[#EDEAE3]
          rounded-xl
          border
          border-[#D8D3CB]
          p-4
          no-print
        "
      >

        {/* ====================================================
            DOCUMENTO
        ===================================================== */}
        <div
          ref={contentRef}
          id="pdf-content"
          className="
            bg-white
            text-[#1A1A1A]
            p-8
            mx-auto
            space-y-4
            font-sans
            shadow-2xl
          "
          style={{
            width: '210mm',
            minHeight: '297mm',
            boxSizing: 'border-box',
          }}
        >

          {/* ==================================================
              HEADER
          =================================================== */}
          <div
            className="
              border-b-4
              border-[#6B0F1A]
              pb-4
              flex
              justify-between
              items-end
            "
          >
            <div>
              <span
                className="
                  font-black
                  text-lg
                  tracking-tight
                  text-[#6B0F1A]
                "
              >
                TFAZZIO • PONTO DE IMPACTO
              </span>

              <h1
                className="
                  text-2xl
                  font-black
                  text-[#1A1A1A]
                  uppercase
                "
              >
                Diagnóstico Estratégico
              </h1>
            </div>

            <div
              className="
                text-right
                text-[10px]
                text-[#5A6270]
              "
            >
              <p>
                Emissão:{' '}
                <strong className="text-[#1A1A1A]">
                  {result.generatedAt}
                </strong>
              </p>

              <p className="font-bold text-[#6B0F1A]">
                Relatório Executivo
              </p>
            </div>
          </div>


          {/* ==================================================
              EMPRESA
          =================================================== */}
          <div
            className="
              bg-[#F9F7F3]
              p-4
              rounded-xl
              border
              border-[#D8D3CB]
              grid
              grid-cols-2
              gap-3
            "
          >

            <div>
              <span
                className="
                  text-[#5A6270]
                  block
                  text-[10px]
                  uppercase
                  font-bold
                "
              >
                Empresa
              </span>

              <strong className="text-sm font-black">
                {form.companyName ||
                  form.cnpjData?.razaoSocial ||
                  'Empresa PME'}
              </strong>
            </div>


            <div>
              <span
                className="
                  text-[#5A6270]
                  block
                  text-[10px]
                  uppercase
                  font-bold
                "
              >
                CNPJ / Porte
              </span>

              <strong className="text-[#1A1A1A]">
                {form.cnpj || 'Não informado'} •{' '}
                {form.cnpjData?.porte || 'PME'}
              </strong>
            </div>


            <div>
              <span
                className="
                  text-[#5A6270]
                  block
                  text-[10px]
                  uppercase
                  font-bold
                "
              >
                Segmento
              </span>

              <span className="font-semibold">
                {form.segment}
              </span>
            </div>


            <div>
              <span
                className="
                  text-[#5A6270]
                  block
                  text-[10px]
                  uppercase
                  font-bold
                "
              >
                Localidade
              </span>

              <span className="font-semibold">
                {form.cityState || 'Brasil'}
              </span>
            </div>

          </div>


          {/* ==================================================
              ÍNDICE DE CLAREZA
          =================================================== */}
          <div className="grid grid-cols-3 gap-4">

            <div
              className="
                p-4
                bg-[#6B0F1A]
                text-white
                rounded-xl
                text-center
                space-y-1
              "
            >
              <span
                className="
                  text-[10px]
                  text-[#D4AF37]
                  font-bold
                  uppercase
                  block
                "
              >
                Índice de Clareza
              </span>

              <div className="text-4xl font-black">
                {result.clarityIndex}/100
              </div>

              <span
                className="
                  text-[10px]
                  bg-[#D4AF37]
                  text-[#1A1A1A]
                  font-extrabold
                  px-2
                  py-0.5
                  rounded-full
                  inline-block
                "
              >
                Status: {result.clarityStatus}
              </span>
            </div>


            <div
              className="
                p-4
                bg-rose-50
                border
                border-rose-200
                text-rose-950
                rounded-xl
                space-y-1
                col-span-2
              "
            >
              <span
                className="
                  text-[10px]
                  text-rose-800
                  font-extrabold
                  uppercase
                  block
                "
              >
                Gargalo Principal
              </span>

              <div className="text-sm font-black text-rose-950">
                {primary.name} (Nota: {primary.score}/10)
              </div>

              <p className="text-[11px] text-rose-900">
                {primary.description}
              </p>
            </div>

          </div>


          {/* ==================================================
              EVIDÊNCIAS
          =================================================== */}
          <div className="space-y-1">

            <h3
              className="
                font-extrabold
                text-[#6B0F1A]
                uppercase
                text-xs
                border-b
                border-[#D8D3CB]
                pb-1
              "
            >
              1. Evidências Coletadas
            </h3>


            <div
              className="
                grid
                grid-cols-3
                gap-2
                text-[10px]
              "
            >

              <div
                className="
                  p-2
                  bg-[#F9F7F3]
                  rounded-lg
                  border
                  border-[#D8D3CB]
                "
              >
                <span
                  className="
                    font-bold
                    text-[#6B0F1A]
                    block
                  "
                >
                  CNPJ
                </span>

                <p className="font-semibold">
                  {form.cnpjData?.razaoSocial ||
                    form.companyName}
                </p>

                <p className="text-[10px] text-[#5A6270]">
                  Porte: {form.cnpjData?.porte || 'PME'}
                </p>
              </div>


              <div
                className="
                  p-2
                  bg-[#F9F7F3]
                  rounded-lg
                  border
                  border-[#D8D3CB]
                "
              >
                <span
                  className="
                    font-bold
                    text-[#6B0F1A]
                    block
                  "
                >
                  Google Places
                </span>

                {evidence?.googlePlaces?.rating ? (
                  <p className="font-bold">
                    {evidence.googlePlaces.rating} ★
                  </p>
                ) : (
                  <p className="text-[10px] text-[#5A6270]">
                    Perfil não localizado.
                  </p>
                )}
              </div>


              <div
                className="
                  p-2
                  bg-[#F9F7F3]
                  rounded-lg
                  border
                  border-[#D8D3CB]
                "
              >
                <span
                  className="
                    font-bold
                    text-[#6B0F1A]
                    block
                  "
                >
                  Imprensa
                </span>

                <p className="font-semibold">
                  {evidence?.news?.length
                    ? `${evidence.news.length} matérias`
                    : 'Sem notícias'}
                </p>
              </div>

            </div>
          </div>


          {/* ==================================================
              FINANCEIRO
          =================================================== */}
          <div className="space-y-1">

            <h3
              className="
                font-extrabold
                text-[#6B0F1A]
                uppercase
                text-xs
                border-b
                border-[#D8D3CB]
                pb-1
              "
            >
              2. Engenharia Financeira
            </h3>


            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">
                    Métrica
                  </th>

                  <th className="text-left">
                    Valor
                  </th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>
                    Faturamento Mensal
                  </td>

                  <td className="font-mono font-bold text-[#6B0F1A]">
                    {formatCurrency(
                      breakEven.monthlyRevenue
                    )}
                  </td>
                </tr>


                <tr className="bg-[#F9F7F3]/50">
                  <td>
                    Custos Fixos Totais
                  </td>

                  <td className="font-mono font-bold text-rose-900">
                    {formatCurrency(
                      breakEven.fixedCostsTotal
                    )}
                  </td>
                </tr>


                <tr>
                  <td>
                    Ponto de Equilíbrio
                  </td>

                  <td className="font-mono font-bold text-[#6B0F1A]">
                    {formatCurrency(
                      breakEven.breakEvenRevenue
                    )}
                  </td>
                </tr>


                <tr className="bg-[#F9F7F3]/50">
                  <td>
                    Lucro Líquido Estimado
                  </td>

                  <td className="font-mono font-bold text-emerald-900">
                    {formatCurrency(
                      breakEven.estimatedNetProfit
                    )}
                  </td>
                </tr>

              </tbody>
            </table>

          </div>


          {/* ==================================================
              ÁREAS
          =================================================== */}
          <div className="space-y-1">

            <h3
              className="
                font-extrabold
                text-[#6B0F1A]
                uppercase
                text-xs
                border-b
                border-[#D8D3CB]
                pb-1
              "
            >
              3. Pontuação das 6 Áreas
            </h3>


            <div className="grid grid-cols-3 gap-2">

              {Object.values(result.areaScores).map(
                (area: any) => (
                  <div
                    key={area.key}
                    className="
                      p-2
                      bg-[#F9F7F3]
                      rounded-lg
                      border
                      border-[#D8D3CB]
                      flex
                      justify-between
                    "
                  >
                    <span className="font-bold">
                      {area.name}
                    </span>

                    <span
                      className="
                        font-mono
                        font-bold
                        text-[#6B0F1A]
                      "
                    >
                      {area.score}/10
                    </span>
                  </div>
                )
              )}

            </div>

          </div>


          {/* ==================================================
              PLANO DE AÇÃO
          =================================================== */}
          <div className="space-y-2">

            <h3
              className="
                font-extrabold
                text-[#6B0F1A]
                uppercase
                text-xs
                border-b
                border-[#D8D3CB]
                pb-1
              "
            >
              4. Plano de Ação de 90 Dias
            </h3>


            {[
              result.actionPlan90Days.phase1,
              result.actionPlan90Days.phase2,
              result.actionPlan90Days.phase3,
            ].map((phase) => (

              <div
                key={phase.phaseNumber}
                className="
                  p-3
                  bg-[#F9F7F3]
                  rounded-xl
                  border
                  border-[#D8D3CB]
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    font-bold
                    text-xs
                  "
                >
                  <span className="text-[#6B0F1A]">
                    {phase.period}: {phase.title}
                  </span>

                  <span className="text-[10px]">
                    Meta: {phase.goal}
                  </span>
                </div>


                <ul
                  className="
                    list-disc
                    pl-4
                    text-[11px]
                  "
                >
                  {phase.tasks.map((task) => (
                    <li key={task.id}>
                      <strong>
                        {task.title}:
                      </strong>{' '}
                      {task.description}
                    </li>
                  ))}
                </ul>

              </div>

            ))}

          </div>

        </div>
      </div>
    </div>
  );
};