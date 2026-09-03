// ============================================================
// PONTO DE IMPACTO 2.0 - MOTOR DE HIPÓTESES
// ============================================================

import { DiagnosticFormData, Hipotese, AreaLimitadora, Limitador, ProximoLimitador } from '../types';

// ============================================================
// 1. GERADOR DE HIPÓTESES BASEADO NAS RESPOSTAS
// ============================================================

export function gerarHipoteses(data: DiagnosticFormData): Hipotese[] {
  const hipoteses: Hipotese[] = [];

  // ============================================================
  // HIPÓTESE: GARGALO COMERCIAL (DEPENDÊNCIA DE CANAL)
  // ============================================================
  if (data.canaisAquisicao && data.canaisAquisicao.length > 0) {
    const canalPrincipal = data.canaisAquisicao.reduce((a, b) => 
      (a.percentual || 0) > (b.percentual || 0) ? a : b
    );
    
    if (canalPrincipal && canalPrincipal.percentual && canalPrincipal.percentual > 50) {
      hipoteses.push({
        id: 'hip_comercial_dependencia',
        descricao: `A empresa depende de um único canal (${canalPrincipal.canal}) para ${canalPrincipal.percentual}% dos clientes. Isso pode limitar a escalabilidade.`,
        area: 'comercial',
        evidencia_favoravel: [
          `Mais de 50% dos clientes vêm do canal ${canalPrincipal.canal}`,
          `Não há diversificação de canais de aquisição`
        ],
        evidencia_contraria: [
          `O canal ${canalPrincipal.canal} tem capacidade de escala`,
          `O canal ${canalPrincipal.canal} é controlável e previsível`
        ],
        confianca: 60,
        status: 'pendente',
        proxima_pergunta: 'Qual a capacidade de escala do canal principal?'
      });
    }

    // HIPÓTESE: DEPENDÊNCIA DE INDICAÇÃO
    const indicacao = data.canaisAquisicao.find(c => c.canal === 'indicacao');
    if (indicacao && indicacao.percentual && indicacao.percentual > 50) {
      hipoteses.push({
        id: 'hip_comercial_indicacao',
        descricao: `A empresa depende de indicação para ${indicacao.percentual}% dos clientes. Indicação é ótima, mas não é previsível e não escala facilmente.`,
        area: 'comercial',
        evidencia_favoravel: [
          `Mais de 50% dos clientes vêm de indicação`,
          `Indicação não é um canal controlável ou mensurável`
        ],
        evidencia_contraria: [
          `A empresa tem um programa estruturado de indicação`,
          `A indicação é suficiente para o objetivo atual`
        ],
        confianca: 70,
        status: 'pendente',
        proxima_pergunta: 'A indicação é suficiente para atingir seu objetivo de crescimento?'
      });
    }
  }

  // ============================================================
  // HIPÓTESE: GARGALO FINANCEIRO (MARGEM BAIXA)
  // ============================================================
  if (data.monthlyRevenue && data.fixedCosts) {
    const margemAtual = ((data.monthlyRevenue - data.fixedCosts) / data.monthlyRevenue) * 100;
    
    if (margemAtual < 20) {
      hipoteses.push({
        id: 'hip_financeiro_margem',
        descricao: `A margem atual está baixa (${margemAtual.toFixed(1)}%), indicando possível gargalo financeiro.`,
        area: 'financeiro',
        evidencia_favoravel: [
          `Margem abaixo de 20%`,
          `Pouca sobra para investir em crescimento`
        ],
        evidencia_contraria: [
          `A empresa está em fase de investimento`,
          `A margem é típica do setor`
        ],
        confianca: 60,
        status: 'pendente',
        proxima_pergunta: 'Qual é a margem típica do seu setor?'
      });
    }

    // HIPÓTESE: CAPITAL DE GIRO INSUFICIENTE
    if (data.capitalGiro && data.monthlyRevenue && data.capitalGiro < data.monthlyRevenue * 0.3) {
      hipoteses.push({
        id: 'hip_financeiro_capital',
        descricao: `O capital de giro (R$ ${data.capitalGiro}) é inferior a 30% do faturamento mensal. Isso pode limitar a capacidade de crescer.`,
        area: 'financeiro',
        evidencia_favoravel: [
          `Capital de giro insuficiente para financiar crescimento`,
          `Pode gerar dificuldade em honrar compromissos`
        ],
        evidencia_contraria: [
          `A empresa tem acesso a linhas de crédito`,
          `O ciclo financeiro é curto`
        ],
        confianca: 65,
        status: 'pendente',
        proxima_pergunta: 'Qual é o ciclo financeiro médio (recebimento x pagamento)?'
      });
    }
  }

  // ============================================================
  // HIPÓTESE: DEPENDÊNCIA DO DONO
  // ============================================================
  if (data.horasDonoSemana && parseInt(data.horasDonoSemana) > 50) {
    hipoteses.push({
      id: 'hip_pessoas_dependencia',
      descricao: `O dono trabalha mais de 50 horas por semana, indicando possível dependência excessiva.`,
      area: 'pessoas',
      evidencia_favoravel: [
        `Mais de 50 horas semanais trabalhadas`,
        `Indica que a empresa depende do dono para funcionar`
      ],
      evidencia_contraria: [
        `É uma escolha pessoal trabalhar muitas horas`,
        `A empresa está em fase de crescimento acelerado`
      ],
      confianca: 55,
      status: 'pendente',
      proxima_pergunta: 'Quantas horas você gostaria de trabalhar idealmente?'
    });
  }

  if (data.runsWithoutOwner30Days === false) {
    hipoteses.push({
      id: 'hip_pessoas_autonomia',
      descricao: `A empresa não funciona sem o dono por 30 dias. Isso indica baixa autonomia e alta dependência operacional.`,
      area: 'pessoas',
      evidencia_favoravel: [
        `Empresa não funciona sem o dono`,
        `Indica que todas as decisões passam pelo dono`
      ],
      evidencia_contraria: [
        `A empresa está em fase de estruturação`,
        `O dono prefere manter o controle`
      ],
      confianca: 70,
      status: 'pendente',
      proxima_pergunta: 'Quais processos você poderia delegar hoje?'
    });
  }

  // ============================================================
  // HIPÓTESE: GARGALO OPERACIONAL (CAPACIDADE)
  // ============================================================
  if (data.capacidadeProducao && data.capacidadeProducao < 50) {
    hipoteses.push({
      id: 'hip_operacional_producao',
      descricao: `A capacidade de produção está em ${data.capacidadeProducao}%, indicando que a operação pode estar perto do limite.`,
      area: 'operacao',
      evidencia_favoravel: [
        `Capacidade produtiva abaixo de 50%`,
        `Pode limitar a capacidade de crescer`
      ],
      evidencia_contraria: [
        `A demanda atual é baixa`,
        `É possível aumentar capacidade rapidamente`
      ],
      confianca: 50,
      status: 'pendente',
      proxima_pergunta: 'Qual é a demanda atual vs capacidade instalada?'
    });
  }

  return hipoteses;
}

// ============================================================
// 2. IDENTIFICAR O LIMITADOR PRINCIPAL
// ============================================================

export function identificarLimitadorPrincipal(
  hipoteses: Hipotese[],
  data: DiagnosticFormData
): Limitador | null {
  const hipotesesFortes = hipoteses.filter(h => h.confianca >= 60);
  
  if (hipotesesFortes.length === 0) {
    return null;
  }

  const principal = hipotesesFortes.reduce((a, b) => 
    a.confianca > b.confianca ? a : b
  );

  return {
    id: principal.id,
    area: principal.area,
    nome: principal.descricao.split('.')[0] || principal.area,
    descricao: principal.descricao,
    impacto: `O ${principal.area} está limitando o crescimento da empresa.`,
    evidencia: principal.evidencia_favoravel,
    confianca: principal.confianca,
    gravidade: principal.confianca > 80 ? 'alta' : principal.confianca > 60 ? 'media' : 'baixa',
    urgencia: principal.confianca > 80 ? 'alta' : principal.confianca > 60 ? 'media' : 'baixa',
    data_identificacao: new Date().toISOString(),
  };
}

// ============================================================
// 3. PROJETAR O PRÓXIMO LIMITADOR
// ============================================================

export function projetarProximoLimitador(
  limitadorAtual: Limitador | null,
  data: DiagnosticFormData
): ProximoLimitador | null {
  if (!limitadorAtual) return null;

  const mapProximoLimitador: Record<AreaLimitadora, { area: AreaLimitadora; nome: string; descricao: string }> = {
    'comercial': {
      area: 'operacao',
      nome: 'Capacidade Operacional',
      descricao: 'Se resolver o gargalo comercial, a operação pode não dar conta do aumento de demanda.'
    },
    'operacao': {
      area: 'financeiro',
      nome: 'Capital de Giro',
      descricao: 'Se resolver o gargalo operacional, o capital de giro pode não suportar o aumento de produção.'
    },
    'financeiro': {
      area: 'comercial',
      nome: 'Capacidade Comercial',
      descricao: 'Se resolver o gargalo financeiro, a capacidade comercial pode não gerar demanda suficiente.'
    },
    'pessoas': {
      area: 'gestao',
      nome: 'Gestão de Equipe',
      descricao: 'Se resolver a dependência do dono, a gestão da equipe pode se tornar o próximo gargalo.'
    },
    'gestao': {
      area: 'estrategia',
      nome: 'Direcionamento Estratégico',
      descricao: 'Se resolver a gestão, a falta de direção estratégica pode limitar o próximo passo.'
    },
    'estrategia': {
      area: 'comercial',
      nome: 'Execução Comercial',
      descricao: 'Se resolver a estratégia, a execução comercial pode não estar alinhada com o plano.'
    },
  };

  const proximo = mapProximoLimitador[limitadorAtual.area] || mapProximoLimitador['comercial'];

  return {
    area: proximo.area,
    nome: proximo.nome,
    descricao: proximo.descricao,
    condicao_para_ativar: `Após resolver ${limitadorAtual.nome}, o próximo limitador pode ser ${proximo.nome}.`,
    estimativa_confianca: Math.min(70, limitadorAtual.confianca * 0.7),
  };
}

// ============================================================
// 4. SUGERIR PRÓXIMA INVESTIGAÇÃO (NOVO!)
// ============================================================

export function sugerirProximaInvestigacao(
  hipoteses: Hipotese[],
  data: DiagnosticFormData
): { pergunta: string; area: AreaLimitadora; confianca: number } | null {
  // Encontra a hipótese com mais potencial de ser confirmada
  const candidatas = hipoteses
    .filter(h => h.confianca >= 40 && h.confianca < 70)
    .sort((a, b) => b.confianca - a.confianca);

  if (candidatas.length === 0) return null;

  const principal = candidatas[0];
  return {
    pergunta: principal.proxima_pergunta || `Para confirmar que o gargalo está em ${principal.area}, precisamos entender melhor: qual evidência você tem sobre isso?`,
    area: principal.area,
    confianca: principal.confianca,
  };
}