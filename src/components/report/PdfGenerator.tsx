import React, { useRef, useState, useEffect } from 'react';
import { DiagnosticResult } from '../../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { Download, Loader2 } from 'lucide-react';

interface PdfGeneratorProps {
  result: DiagnosticResult;
  onClose?: () => void;
}

// ============================================================
// PALETA DE CORES (mesmos valores usados nas classes Tailwind
// originais). Centralizar aqui evita "cor mágica" espalhada
// e garante consistência entre tela e PDF.
// ============================================================
const COLORS = {
  maroon: '#6B0F1A',
  maroonDark: '#500B13',
  gold: '#D4AF37',
  offWhite: '#F9F7F3',
  border: '#D8D3CB',
  text: '#1A1A1A',
  gray: '#5A6270',
  roseBg: '#FFF1F2',
  roseBorder: '#FECDD3',
  roseTextDark: '#4C0519',
  roseTextLabel: '#9F1239',
  roseTextBody: '#881337',
  emerald: '#064E3B',
};

// ============================================================
// ESTILOS INLINE DA ÁREA QUE SERÁ CAPTURADA PELO html2canvas.
//
// IMPORTANTE: por que inline e não Tailwind aqui?
// O html2canvas (mesmo o fork "pro") nem sempre resolve
// corretamente classes utilitárias geradas dinamicamente
// (custom properties, @layer, seletores modernos). Isso faz
// com que o "print" saia só com o texto (HTML puro), sem
// nenhuma cor/borda/grid — exatamente o sintoma relatado.
// Usando style={{}} inline, o navegador aplica o estilo
// diretamente no elemento (propriedade style do DOM), que o
// html2canvas SEMPRE lê corretamente, garantindo que o PDF
// fique idêntico à pré-visualização.
// ============================================================
const styles: Record<string, React.CSSProperties> = {
  document: {
    backgroundColor: '#ffffff',
    color: COLORS.text,
    padding: 32,
    margin: '0 auto',
    width: '210mm',
    minHeight: '297mm',
    boxSizing: 'border-box',
    fontFamily:
      "'Inter', 'Helvetica Neue', Arial, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
  },
  header: {
    borderBottom: `4px solid ${COLORS.maroon}`,
    paddingBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerBrand: {
    fontWeight: 900,
    fontSize: 18,
    letterSpacing: '-0.02em',
    color: COLORS.maroon,
    display: 'block',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: COLORS.text,
    textTransform: 'uppercase',
    margin: 0,
  },
  headerMeta: {
    textAlign: 'right',
    fontSize: 10,
    color: COLORS.gray,
  },
  headerMetaStrong: {
    color: COLORS.text,
  },
  headerMetaLabel: {
    fontWeight: 700,
    color: COLORS.maroon,
    margin: 0,
  },
  companyBox: {
    backgroundColor: COLORS.offWhite,
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  fieldLabel: {
    color: COLORS.gray,
    display: 'block',
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  fieldValueStrong: {
    fontSize: 14,
    fontWeight: 900,
  },
  fieldValue: {
    color: COLORS.text,
    fontWeight: 700,
  },
  fieldValueSemibold: {
    fontWeight: 600,
  },
  clarityRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 16,
  },
  clarityCard: {
    padding: 16,
    backgroundColor: COLORS.maroon,
    color: '#ffffff',
    borderRadius: 12,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'center',
  },
  clarityLabel: {
    fontSize: 10,
    color: COLORS.gold,
    fontWeight: 700,
    textTransform: 'uppercase',
    display: 'block',
  },
  clarityValue: {
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1.1,
  },
  clarityBadge: {
    fontSize: 10,
    backgroundColor: COLORS.gold,
    color: COLORS.text,
    fontWeight: 800,
    padding: '2px 8px',
    borderRadius: 9999,
    display: 'inline-block',
    alignSelf: 'center',
  },
  bottleneckCard: {
    padding: 16,
    backgroundColor: COLORS.roseBg,
    border: `1px solid ${COLORS.roseBorder}`,
    color: COLORS.roseTextDark,
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    justifyContent: 'center',
  },
  bottleneckLabel: {
    fontSize: 10,
    color: COLORS.roseTextLabel,
    fontWeight: 800,
    textTransform: 'uppercase',
    display: 'block',
  },
  bottleneckTitle: {
    fontSize: 14,
    fontWeight: 900,
    color: COLORS.roseTextDark,
  },
  bottleneckDesc: {
    fontSize: 11,
    color: COLORS.roseTextBody,
    margin: 0,
  },
  sectionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  sectionTitle: {
    fontWeight: 800,
    color: COLORS.maroon,
    textTransform: 'uppercase',
    fontSize: 12,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 4,
    margin: 0,
  },
  evidenceGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
    fontSize: 10,
  },
  evidenceCard: {
    padding: 8,
    backgroundColor: COLORS.offWhite,
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
  },
  evidenceCardLabel: {
    fontWeight: 700,
    color: COLORS.maroon,
    display: 'block',
  },
  evidenceCardValue: {
    fontWeight: 600,
    margin: '2px 0 0 0',
  },
  evidenceCardMuted: {
    fontSize: 10,
    color: COLORS.gray,
    margin: '2px 0 0 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
  },
  th: {
    textAlign: 'left',
    padding: '6px 4px',
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: 10,
    color: COLORS.gray,
    textTransform: 'uppercase',
  },
  td: {
    padding: '6px 4px',
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tdAlt: {
    backgroundColor: COLORS.offWhite,
  },
  valueMaroon: {
    fontFamily: 'monospace',
    fontWeight: 700,
    color: COLORS.maroon,
  },
  valueRose: {
    fontFamily: 'monospace',
    fontWeight: 700,
    color: COLORS.roseTextBody,
  },
  valueEmerald: {
    fontFamily: 'monospace',
    fontWeight: 700,
    color: COLORS.emerald,
  },
  areaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 8,
  },
  areaCard: {
    padding: 8,
    backgroundColor: COLORS.offWhite,
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
  },
  areaCardLabel: {
    fontWeight: 700,
  },
  areaCardValue: {
    fontFamily: 'monospace',
    fontWeight: 700,
    color: COLORS.maroon,
  },
  phaseCard: {
    padding: 12,
    backgroundColor: COLORS.offWhite,
    borderRadius: 12,
    border: `1px solid ${COLORS.border}`,
    marginBottom: 8,
  },
  phaseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: 700,
    fontSize: 12,
  },
  phaseTitle: {
    color: COLORS.maroon,
  },
  phaseGoal: {
    fontSize: 10,
  },
  phaseList: {
    listStyleType: 'disc',
    paddingLeft: 16,
    fontSize: 11,
    margin: '4px 0 0 0',
  },
};

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
      // Como agora TODO o conteúdo de "node" usa estilos inline
      // (style={{...}}) em vez de classes Tailwind, o html2canvas
      // consegue ler corretamente cada propriedade visual
      // (cor, borda, grid, padding etc.), então a captura sai
      // idêntica ao que é mostrado na pré-visualização.
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

        // Reforço extra: garante que o clone usado internamente
        // pelo html2canvas mantenha exatamente o mesmo tamanho
        // e não sofra reflow por causa de containers pais
        // (ex: overflow-auto / max-h-[75vh]) que não fazem parte
        // da captura.
        onclone: (clonedDoc) => {
          const clonedNode = clonedDoc.getElementById('pdf-content');
          if (clonedNode) {
            clonedNode.style.width = `${width}px`;
            clonedNode.style.minHeight = `${height}px`;
          }
        },
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
          BOTÕES (fora da área capturada — Tailwind normal,
          sem impacto no PDF)
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
            DOCUMENTO — a partir daqui, tudo usa style={{}}
            inline em vez de className Tailwind. É essa mudança
            que resolve a perda de formatação no PDF.
        ===================================================== */}
        <div
          ref={contentRef}
          id="pdf-content"
          style={styles.document}
        >

          {/* ==================================================
              HEADER
          =================================================== */}
          <div style={styles.header}>
            <div>
              <span style={styles.headerBrand}>
                TFAZZIO • PONTO DE IMPACTO
              </span>

              <h1 style={styles.headerTitle}>
                Diagnóstico Estratégico
              </h1>
            </div>

            <div style={styles.headerMeta}>
              <p style={{ margin: 0 }}>
                Emissão:{' '}
                <strong style={styles.headerMetaStrong}>
                  {result.generatedAt}
                </strong>
              </p>

              <p style={styles.headerMetaLabel}>
                Relatório Executivo
              </p>
            </div>
          </div>


          {/* ==================================================
              EMPRESA
          =================================================== */}
          <div style={styles.companyBox}>

            <div>
              <span style={styles.fieldLabel}>Empresa</span>
              <strong style={styles.fieldValueStrong}>
                {form.companyName ||
                  form.cnpjData?.razaoSocial ||
                  'Empresa PME'}
              </strong>
            </div>

            <div>
              <span style={styles.fieldLabel}>CNPJ / Porte</span>
              <strong style={styles.fieldValue}>
                {form.cnpj || 'Não informado'} •{' '}
                {form.cnpjData?.porte || 'PME'}
              </strong>
            </div>

            <div>
              <span style={styles.fieldLabel}>Segmento</span>
              <span style={styles.fieldValueSemibold}>
                {form.segment}
              </span>
            </div>

            <div>
              <span style={styles.fieldLabel}>Localidade</span>
              <span style={styles.fieldValueSemibold}>
                {form.cityState || 'Brasil'}
              </span>
            </div>

          </div>


          {/* ==================================================
              ÍNDICE DE CLAREZA
          =================================================== */}
          <div style={styles.clarityRow}>

            <div style={styles.clarityCard}>
              <span style={styles.clarityLabel}>
                Índice de Clareza
              </span>

              <div style={styles.clarityValue}>
                {result.clarityIndex}/100
              </div>

              <span style={styles.clarityBadge}>
                Status: {result.clarityStatus}
              </span>
            </div>

            <div style={styles.bottleneckCard}>
              <span style={styles.bottleneckLabel}>
                Gargalo Principal
              </span>

              <div style={styles.bottleneckTitle}>
                {primary.name} (Nota: {primary.score}/10)
              </div>

              <p style={styles.bottleneckDesc}>
                {primary.description}
              </p>
            </div>

          </div>


          {/* ==================================================
              EVIDÊNCIAS
          =================================================== */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.sectionTitle}>
              1. Evidências Coletadas
            </h3>

            <div style={styles.evidenceGrid}>

              <div style={styles.evidenceCard}>
                <span style={styles.evidenceCardLabel}>CNPJ</span>
                <p style={styles.evidenceCardValue}>
                  {form.cnpjData?.razaoSocial || form.companyName}
                </p>
                <p style={styles.evidenceCardMuted}>
                  Porte: {form.cnpjData?.porte || 'PME'}
                </p>
              </div>

              <div style={styles.evidenceCard}>
                <span style={styles.evidenceCardLabel}>
                  Google Places
                </span>
                {evidence?.googlePlaces?.rating ? (
                  <p style={{ ...styles.evidenceCardValue, fontWeight: 700 }}>
                    {evidence.googlePlaces.rating} ★
                  </p>
                ) : (
                  <p style={styles.evidenceCardMuted}>
                    Perfil não localizado.
                  </p>
                )}
              </div>

              <div style={styles.evidenceCard}>
                <span style={styles.evidenceCardLabel}>Imprensa</span>
                <p style={styles.evidenceCardValue}>
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
          <div style={styles.sectionBlock}>
            <h3 style={styles.sectionTitle}>
              2. Engenharia Financeira
            </h3>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Métrica</th>
                  <th style={styles.th}>Valor</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td style={styles.td}>Faturamento Mensal</td>
                  <td style={{ ...styles.td, ...styles.valueMaroon }}>
                    {formatCurrency(breakEven.monthlyRevenue)}
                  </td>
                </tr>

                <tr>
                  <td style={{ ...styles.td, ...styles.tdAlt }}>
                    Custos Fixos Totais
                  </td>
                  <td style={{ ...styles.td, ...styles.tdAlt, ...styles.valueRose }}>
                    {formatCurrency(breakEven.fixedCostsTotal)}
                  </td>
                </tr>

                <tr>
                  <td style={styles.td}>Ponto de Equilíbrio</td>
                  <td style={{ ...styles.td, ...styles.valueMaroon }}>
                    {formatCurrency(breakEven.breakEvenRevenue)}
                  </td>
                </tr>

                <tr>
                  <td style={{ ...styles.td, ...styles.tdAlt }}>
                    Lucro Líquido Estimado
                  </td>
                  <td style={{ ...styles.td, ...styles.tdAlt, ...styles.valueEmerald }}>
                    {formatCurrency(breakEven.estimatedNetProfit)}
                  </td>
                </tr>
              </tbody>
            </table>

          </div>


          {/* ==================================================
              ÁREAS
          =================================================== */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.sectionTitle}>
              3. Pontuação das 6 Áreas
            </h3>

            <div style={styles.areaGrid}>
              {Object.values(result.areaScores).map((area: any) => (
                <div key={area.key} style={styles.areaCard}>
                  <span style={styles.areaCardLabel}>{area.name}</span>
                  <span style={styles.areaCardValue}>{area.score}/10</span>
                </div>
              ))}
            </div>
          </div>


          {/* ==================================================
              PLANO DE AÇÃO
          =================================================== */}
          <div style={styles.sectionBlock}>
            <h3 style={styles.sectionTitle}>
              4. Plano de Ação de 90 Dias
            </h3>

            {[
              result.actionPlan90Days.phase1,
              result.actionPlan90Days.phase2,
              result.actionPlan90Days.phase3,
            ].map((phase) => (
              <div key={phase.phaseNumber} style={styles.phaseCard}>
                <div style={styles.phaseHeader}>
                  <span style={styles.phaseTitle}>
                    {phase.period}: {phase.title}
                  </span>
                  <span style={styles.phaseGoal}>
                    Meta: {phase.goal}
                  </span>
                </div>

                <ul style={styles.phaseList}>
                  {phase.tasks.map((task) => (
                    <li key={task.id}>
                      <strong>{task.title}:</strong> {task.description}
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