// ============================================================
// PONTO DE IMPACTO 2.0 - MOTOR DE SIMULAÇÃO
// ============================================================

import { 
  DiagnosticFormData, 
  Capacidades, 
  CapacidadeNecessaria, 
  GapCapacidade,
  SimulacaoCenario,
  SimulacaoResultado,
  AreaLimitadora,
  CanalReceita
} from '../types';

// ============================================================
// 1. CALCULAR CAPACIDADE ATUAL
// ============================================================

export function calcularCapacidadeAtual(data: DiagnosticFormData): Capacidades {
  return {
    producao: data.capacidadeProducao || 60,
    atendimento: data.capacidadeAtendimento || 60,
    distribuicao: data.capacidadeDistribuicao || 60,
    financeiro: data.capacidadeFinanceiro || 60,
    comercial: data.capacidadeComercial || 60,
    gestao: data.capacidadeGestao || 60,
    operacional: 60,
  };
}

// ============================================================
// 2. CALCULAR CAPACIDADE NECESSÁRIA PARA O OBJETIVO
// ============================================================

export function calcularCapacidadeNecessaria(
  data: DiagnosticFormData,
  objetivo: string,
  percentualCrescimento: number
): CapacidadeNecessaria {
  // Fator de crescimento
  const fator = 1 + (percentualCrescimento / 100);

  // Base: capacidade atual
  const base = calcularCapacidadeAtual(data);

  // Cada área escala de forma diferente
  return {
    producao: Math.min(100, base.producao * fator * 0.9),
    atendimento: Math.min(100, base.atendimento * fator * 0.95),
    distribuicao: Math.min(100, base.distribuicao * fator * 0.85),
    financeiro: Math.min(100, base.financeiro * fator * 1.2),
    comercial: Math.min(100, base.comercial * fator * 0.9),
    gestao: Math.min(100, base.gestao * fator * 0.8),
    operacional: Math.min(100, base.operacional * fator * 0.85),
  };
}

// ============================================================
// 3. CALCULAR GAP DE CAPACIDADE
// ============================================================

export function calcularGap(
  atual: Capacidades,
  necessario: CapacidadeNecessaria
): GapCapacidade {
  return {
    producao: necessario.producao - atual.producao,
    atendimento: necessario.atendimento - atual.atendimento,
    distribuicao: necessario.distribuicao - atual.distribuicao,
    financeiro: necessario.financeiro - atual.financeiro,
    comercial: necessario.comercial - atual.comercial,
    gestao: necessario.gestao - atual.gestao,
    operacional: necessario.operacional - atual.operacional,
  };
}

// ============================================================
// 4. IDENTIFICAR "O QUE QUEBRA PRIMEIRO"
// ============================================================

export function identificarPrimeiroLimitador(
  gap: GapCapacidade
): { area: AreaLimitadora; descricao: string; deficit: number } | null {
  const areas: Array<{ key: keyof GapCapacidade; area: AreaLimitadora; label: string }> = [
    { key: 'financeiro', area: 'financeiro', label: 'Capital de Giro' },
    { key: 'comercial', area: 'comercial', label: 'Capacidade Comercial' },
    { key: 'producao', area: 'producao', label: 'Capacidade de Produção' },
    { key: 'atendimento', area: 'atendimento', label: 'Capacidade de Atendimento' },
    { key: 'distribuicao', area: 'distribuicao', label: 'Capacidade de Distribuição' },
    { key: 'gestao', area: 'gestao', label: 'Capacidade de Gestão' },
    { key: 'operacional', area: 'operacao', label: 'Capacidade Operacional' },
  ];

  // Encontra a área com maior déficit (gap mais negativo)
  let piorArea: { key: keyof GapCapacidade; area: AreaLimitadora; label: string } | null = null;
  let piorDeficit = 0;

  for (const area of areas) {
    const deficit = gap[area.key];
    if (deficit < piorDeficit) {
      piorDeficit = deficit;
      piorArea = area;
    }
  }

  if (!piorArea || piorDeficit >= 0) {
    return null;
  }

  return {
    area: piorArea.area,
    descricao: `${piorArea.label} é o primeiro a quebrar. Déficit de ${Math.abs(piorDeficit).toFixed(0)}% de capacidade.`,
    deficit: piorDeficit,
  };
}

// ============================================================
// 5. GERAR CENÁRIOS DE SIMULAÇÃO
// ============================================================

export function gerarCenariosSimulacao(
  data: DiagnosticFormData,
  objetivo: string
): SimulacaoCenario[] {
  const cenarios: SimulacaoCenario[] = [];
  
  // Determina o percentual de crescimento baseado no objetivo
  let percentuais: number[] = [];
  
  if (objetivo === 'crescer_faturamento') {
    percentuais = [20, 50, 100, 200];
  } else if (objetivo === 'expandir') {
    percentuais = [30, 60, 120];
  } else if (objetivo === 'aumentar_margem') {
    percentuais = [10, 20, 30];
  } else {
    percentuais = [10, 25, 50, 100];
  }

  // Capacidade atual
  const capacidadeAtual = calcularCapacidadeAtual(data);

  for (const pct of percentuais) {
    const necessario = calcularCapacidadeNecessaria(data, objetivo, pct);
    const gap = calcularGap(capacidadeAtual, necessario);
    const primeiro = identificarPrimeiroLimitador(gap);

    // Projeta o próximo limitador (depois de resolver o primeiro)
    let proximoLimitador = null;
    if (primeiro) {
      const mapProximo: Record<string, { area: AreaLimitadora; descricao: string }> = {
        'financeiro': { area: 'comercial', descricao: 'Após resolver o capital de giro, a capacidade comercial pode ser o próximo limitador.' },
        'comercial': { area: 'operacao', descricao: 'Após resolver a capacidade comercial, a operação pode não dar conta da demanda.' },
        'producao': { area: 'distribuicao', descricao: 'Após resolver a produção, a distribuição pode ser o próximo gargalo.' },
        'atendimento': { area: 'comercial', descricao: 'Após resolver o atendimento, a geração de demanda pode ser o próximo limitador.' },
        'distribuicao': { area: 'operacao', descricao: 'Após resolver a distribuição, a eficiência operacional pode ser o próximo gargalo.' },
        'gestao': { area: 'pessoas', descricao: 'Após resolver a gestão, a liderança da equipe pode ser o próximo limitador.' },
        'operacao': { area: 'financeiro', descricao: 'Após resolver a operação, o capital de giro pode não suportar o crescimento.' },
      };

      const proximoMap = mapProximo[primeiro.area] || mapProximo['operacao'];
      proximoLimitador = {
        area: proximoMap.area,
        descricao: proximoMap.descricao,
        quando: `Quando o faturamento crescer ${pct}%`,
        confianca: 60,
      };
    }

    const faturamentoAtual = data.monthlyRevenue || 0;
    const faturamentoProjetado = faturamentoAtual * (1 + pct / 100);

    cenarios.push({
      id: `cenario_${pct}pct`,
      nome: `Crescimento de ${pct}%`,
      descricao: `Simulação para ${pct}% de crescimento no faturamento (R$ ${faturamentoProjetado.toLocaleString('pt-BR')})`,
      gatilho: `Aumento de ${pct}% no faturamento`,
      impacto_esperado: `Faturamento projetado: R$ ${faturamentoProjetado.toLocaleString('pt-BR')}`,
      capacidade_necessaria: necessario,
      gap_resultante: gap,
      primeiro_limitador: primeiro ? {
        area: primeiro.area,
        descricao: primeiro.descricao,
        quando: `Quando faturamento chegar a R$ ${faturamentoProjetado.toLocaleString('pt-BR')}`,
        confianca: 70,
      } : {
        area: 'nenhum',
        descricao: 'Nenhum limitador identificado para este cenário',
        quando: 'N/A',
        confianca: 0,
      },
      proximo_limitador: proximoLimitador || {
        area: 'outro',
        descricao: 'Não foi possível projetar o próximo limitador',
        quando: 'N/A',
        confianca: 0,
      },
    });
  }

  return cenarios;
}

// ============================================================
// 6. ENCONTRAR O MELHOR CAMINHO
// ============================================================

export function encontrarMelhorCaminho(
  cenarios: SimulacaoCenario[]
): SimulacaoCenario | null {
  if (cenarios.length === 0) return null;

  // Critérios:
  // 1. Prioriza cenários com gap financeiro positivo (capital de giro suficiente)
  // 2. Prioriza cenários com menos limitadores
  // 3. Prioriza cenários com maior crescimento

  const cenariosValidos = cenarios.filter(c => {
    // Verifica se o financeiro não é o primeiro limitador
    const financeiroGap = c.gap_resultante.financeiro;
    return financeiroGap >= -20; // Permite até 20% de déficit
  });

  if (cenariosValidos.length === 0) {
    // Se nenhum cenário for válido, pega o com menor déficit financeiro
    return cenarios.reduce((a, b) => 
      a.gap_resultante.financeiro > b.gap_resultante.financeiro ? a : b
    );
  }

  // Pega o cenário com maior crescimento e que não quebra financeiro
  return cenariosValidos.reduce((a, b) => {
    const aPct = parseInt(a.id.replace('cenario_', '').replace('pct', ''));
    const bPct = parseInt(b.id.replace('cenario_', '').replace('pct', ''));
    return aPct > bPct ? a : b;
  });
}

// ============================================================
// 7. GERAR RESULTADO DA SIMULAÇÃO
// ============================================================

export function gerarResultadoSimulacao(
  data: DiagnosticFormData,
  objetivo: string
): SimulacaoResultado {
  const cenarios = gerarCenariosSimulacao(data, objetivo);
  const melhorCaminho = encontrarMelhorCaminho(cenarios);

  // Identifica riscos
  const riscos: string[] = [];
  
  if (data.capitalGiro && data.monthlyRevenue) {
    const giroMeses = data.capitalGiro / data.monthlyRevenue;
    if (giroMeses < 1) {
      riscos.push('Capital de giro insuficiente para 1 mês de faturamento');
    }
  }

  if (data.canaisAquisicao) {
    const canalPrincipal = data.canaisAquisicao.reduce((a, b) => 
      (a.percentual || 0) > (b.percentual || 0) ? a : b
    );
    if (canalPrincipal && canalPrincipal.percentual && canalPrincipal.percentual > 60) {
      riscos.push(`Dependência excessiva do canal ${canalPrincipal.canal} (${canalPrincipal.percentual}%)`);
    }
  }

  if (data.runsWithoutOwner30Days === false) {
    riscos.push('Alta dependência do dono - a empresa não funciona sem ele');
  }

  // Gera recomendações
  const recomendacoes: string[] = [];

  if (riscos.length > 0) {
    recomendacoes.push(`Priorize a mitigação dos seguintes riscos: ${riscos.join('; ')}`);
  }

  if (melhorCaminho && melhorCaminho.primeiro_limitador.area !== 'nenhum') {
    recomendacoes.push(
      `Foque em resolver o gargalo de ${melhorCaminho.primeiro_limitador.area} antes de escalar.`,
      `O próximo limitador projetado é ${melhorCaminho.proximo_limitador.area}. Planeje-se para isso.`
    );
  }

  return {
    objetivos_alinhados: cenarios.length > 0 && !!melhorCaminho,
    cenarios,
    melhor_caminho: melhorCaminho,
    riscos_identificados: riscos,
    recomendacoes,
  };
}

// ============================================================
// 8. GERAR RELATÓRIO DE SIMULAÇÃO (TEXTO)
// ============================================================

export function gerarTextoSimulacao(
  resultado: SimulacaoResultado,
  data: DiagnosticFormData
): string {
  let texto = '';

  // Resumo
  texto += '## ANÁLISE DE CENÁRIOS DE CRESCIMENTO\n\n';

  if (resultado.melhor_caminho) {
    texto += `### Melhor Caminho: ${resultado.melhor_caminho.nome}\n`;
    texto += `${resultado.melhor_caminho.descricao}\n\n`;
  }

  // Cenários
  texto += '### Cenários Simulados\n\n';
  for (const cenario of resultado.cenarios) {
    texto += `**${cenario.nome}**\n`;
    texto += `- ${cenario.descricao}\n`;
    texto += `- Primeiro limitador: ${cenario.primeiro_limitador.descricao}\n`;
    texto += `- Próximo limitador: ${cenario.proximo_limitador.descricao}\n\n`;
  }

  // Riscos
  if (resultado.riscos_identificados.length > 0) {
    texto += '### Riscos Identificados\n\n';
    for (const risco of resultado.riscos_identificados) {
      texto += `- ⚠️ ${risco}\n`;
    }
    texto += '\n';
  }

  // Recomendações
  if (resultado.recomendacoes.length > 0) {
    texto += '### Recomendações\n\n';
    for (const rec of resultado.recomendacoes) {
      texto += `- ✅ ${rec}\n`;
    }
    texto += '\n';
  }

  return texto;
}