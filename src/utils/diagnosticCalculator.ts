import {
  DiagnosticFormData,
  DiagnosticResult,
  AreaScoreInfo,
  BottleneckInfo,
  BreakEvenAnalysis,
  ActionPlan90Days,
} from '../types';

export const AREA_NAMES: Record<string, string> = {
  Financeiro: 'Financeiro',
  Comercial: 'Comercial',
  Operacao: 'Operação & Entrega',
  Gestao: 'Gestão & Processos',
  Pessoas: 'Pessoas & Liderança',
  Estrategia: 'Estratégia & Visão',
};

export const AREA_DESCRIPTIONS: Record<string, { description: string; impact: string; immediateAction: string }> = {
  Financeiro: {
    description: 'A empresa enfrenta fragilidades no controle de caixa, margem imprevisível ou risco de insolvência.',
    impact: 'Risco iminente de desabastecimento financeiro, falta de capital para investimentos e dependência de crédito bancário caro.',
    immediateAction: 'Mapear todos os custos fixos do próximo mês, revisar precificação e implantar DRE gerencial simplificado.',
  },
  Comercial: {
    description: 'O fluxo de novos clientes ou vendas é inconstante, dependendo excessivamente de indicações ou esforço direto dos sócios.',
    impact: 'Faturamento oscilante, vulnerabilidade a perda de clientes chave e estagnação da receita.',
    immediateAction: 'Implantar um funil de vendas visível, definir metas semanais de prospecção e padronizar o script comercial.',
  },
  Operacao: {
    description: 'A operação consome energia excessiva, apresenta gargalos de entrega, retrabalhos ou estouro de prazos.',
    impact: 'Aumento de custos ocultos, insatisfação de clientes, baixa margem operacional e dependência do dono apagando incêndios.',
    immediateAction: 'Mapear os 3 principais processos operacionais e criar Procedimentos Operacionais Padrão (POPs) visíveis.',
  },
  Gestao: {
    description: 'Falta de indicadores estratégicos (KPIs), processos desestruturados e decisões tomadas por intuição sem dados.',
    impact: 'Perda de eficiência, desalinhamento da equipe e incapacidade de prever os resultados dos próximos meses.',
    immediateAction: 'Definir o Dashboard da Empresa com no máximo 5 indicadores vitais (Receita, Margem, CAC, Retenção, NPS).',
  },
  Pessoas: {
    description: 'A equipe apresenta alta rotatividade, baixa autonomia ou dificuldades de alinhamento e produtividade.',
    impact: 'Sobrecarga nos sócios, erros recorrentes em tarefas básicas e teto de crescimento por falta de liderança qualificada.',
    immediateAction: 'Alinhar papéis e responsabilidades claras (RACI) e realizar reuniões de alinhamento semanal de 30 min.',
  },
  Estrategia: {
    description: 'A empresa opera no piloto automático do dia a dia sem clareza de posicionamento, metas anuais e plano de expansão.',
    impact: 'Evolução lenta em mercado competitivo, desperdício de recursos em iniciativas sem foco e desalinhamento de sócios.',
    immediateAction: 'Definir a Meta Destino de 12 meses e desdobrar em 3 objetivos prioritários para o trimestre atual.',
  },
};

// 🔥 Função para obter o nome do setor (prioriza o campo personalizado se "outros_setor")
function getNomeSetor(areaId: string, customArea: string): string {
  const setores: Record<string, string> = {
    alimentacao: 'Alimentação',
    saude: 'Saúde & Bem-estar',
    financas: 'Finanças & Seguros',
    tecnologia: 'Tecnologia & Software',
    educacao: 'Educação & Treinamento',
    consultoria: 'Consultoria & Serviços',
    varejo: 'Varejo & Comércio',
    imobiliario: 'Imobiliário & Construção',
    logistica: 'Logística & Transporte',
    entretenimento: 'Entretenimento & Mídia',
    outros_setor: 'Personalizado',
  };
  if (areaId === 'outros_setor') {
    return customArea || 'Personalizado';
  }
  return setores[areaId] || areaId;
}

// 🔥 Função para recomendações específicas por setor
function getRecomendacoesPorSetor(setor: string, modelo: string): string[] {
  const setorMap: Record<string, string[]> = {
    alimentacao: [
      'Otimizar gestão de perdas e quebras de produtos perecíveis',
      'Revisar mix de produtos (curva ABC) para aumentar margem',
      'Implementar programas de fidelização para aumentar recorrência',
      'Avaliar precificação dinâmica por horário e demanda',
    ],
    saude: [
      'Estruturar pacotes de serviços para aumentar ticket médio',
      'Implementar gestão de agenda e redução de faltas',
      'Fortalecer retenção de pacientes com programas de acompanhamento',
      'Otimizar custos com insumos e materiais',
    ],
    financas: [
      'Digitalizar processos para reduzir custos operacionais',
      'Implementar gestão de carteira e redução de inadimplência',
      'Otimizar precificação de produtos financeiros',
      'Fortalecer canais digitais de aquisição',
    ],
    tecnologia: [
      'Estruturar modelo de assinatura ou recorrência',
      'Otimizar custos de infraestrutura e cloud',
      'Implementar gestão de produto e roadmap',
      'Fortalecer retenção de clientes com customer success',
    ],
    educacao: [
      'Criar programas de fidelização para alunos',
      'Otimizar custos com infraestrutura e materiais',
      'Implementar gestão de turmas e professores',
      'Expandir canais digitais de venda',
    ],
    consultoria: [
      'Padronizar entregáveis e metodologias',
      'Aumentar horas faturáveis por consultor',
      'Estruturar programas de retenção de clientes',
      'Implementar gestão de projetos e prazos',
    ],
    varejo: [
      'Otimizar gestão de estoque e giro de mercadorias',
      'Revisar precificação e margem por categoria',
      'Implementar estratégias de trade marketing local',
      'Estruturar programa de fidelização',
    ],
    imobiliario: [
      'Digitalizar processos de prospecção e atendimento',
      'Otimizar gestão de carteira e inadimplência',
      'Implementar estratégias de marketing digital',
      'Estruturar gestão de contratos e prazos',
    ],
    logistica: [
      'Otimizar rotas e redução de custos operacionais',
      'Implementar gestão de frota e manutenção',
      'Digitalizar processos de rastreamento',
      'Estruturar contratos com fornecedores',
    ],
    entretenimento: [
      'Criar programas de fidelização e recorrência',
      'Otimizar gestão de eventos e produção',
      'Implementar estratégias de marketing digital',
      'Estruturar parcerias e patrocínios',
    ],
  };
  return setorMap[setor] || [
    'Estruturar modelo de negócio com clareza e métricas',
    'Definir KPIs específicos para seu setor',
    'Validar escalabilidade do modelo atual',
    'Criar plano de ação para os próximos 12 meses',
  ];
}

// 🔥 Função que aplica ajustes baseados no modelo de receita E setor
function aplicarModeloESetor(resultado: any, modeloReceita: string, areaAtuacao: string, customArea: string): any {
  const ajustesPorModelo: Record<string, any> = {
    venda_produtos: {
      recomendacoes: [
        'Otimizar gestão de estoque e giro de mercadorias',
        'Revisar precificação e margem bruta por categoria',
        'Estruturar negociação com fornecedores para melhorar custo',
        'Implementar gestão de categorias (GC) para aumentar ticket médio',
      ],
      prioridade: 'Eficiência operacional e margem',
    },
    prestacao_servicos: {
      recomendacoes: [
        'Aumentar horas faturáveis por colaborador',
        'Estruturar pacotes e precificação por projeto',
        'Fortalecer retenção de clientes recorrentes',
        'Criar processos de entrega padronizados para escalar',
      ],
      prioridade: 'Produtividade e ticket médio',
    },
    assinatura: {
      recomendacoes: [
        'Reduzir churn (taxa de cancelamento) com programa de fidelização',
        'Aumentar Lifetime Value (LTV) com upsell e cross-sell',
        'Otimizar custo de aquisição (CAC) com marketing de performance',
        'Criar planos e níveis de serviço para diferentes perfis',
      ],
      prioridade: 'Recorrência e retenção',
    },
    marketplace: {
      recomendacoes: [
        'Aumentar volume de transações e liquidez da plataforma',
        'Equilibrar oferta e demanda com campanhas direcionadas',
        'Otimizar comissão e taxa de conversão por categoria',
        'Investir em ferramentas de precificação dinâmica',
      ],
      prioridade: 'Volume e escala',
    },
    hibrido: {
      recomendacoes: [
        'Integrar fluxos de receita (produtos + serviços) para sinergia',
        'Criar ofertas combinadas para aumentar ticket médio',
        'Diversificar fontes de receita para reduzir riscos',
        'Estruturar equipes especializadas por modelo',
      ],
      prioridade: 'Sinergia entre modelos',
    },
    outros: {
      recomendacoes: [
        'Estruturar modelo de receita com clareza e métricas',
        'Definir KPIs específicos para o modelo identificado',
        'Validar escalabilidade do modelo atual',
        'Criar plano de migração para modelo mais previsível',
      ],
      prioridade: 'Estruturação do modelo',
    },
  };

  const ajusteModelo = ajustesPorModelo[modeloReceita] || ajustesPorModelo.outros;

  // 🔥 Combina recomendações do modelo com recomendações do setor
  const nomeSetor = getNomeSetor(areaAtuacao, customArea);
  const recomendacoesSetor = getRecomendacoesPorSetor(areaAtuacao, modeloReceita);

  const recomendacoesCombinadas = [
    ...ajusteModelo.recomendacoes.slice(0, 2),
    ...recomendacoesSetor.slice(0, 2),
  ];

  return {
    ...resultado,
    recomendacoesPersonalizadas: recomendacoesCombinadas,
    prioridadeModelo: ajusteModelo.prioridade,
    modeloReceitaAplicado: modeloReceita,
    setorIdentificado: nomeSetor,
  };
}

export function calculateBreakEven(data: DiagnosticFormData): BreakEvenAnalysis {
  // ... (mantém o mesmo código que você já tem)
  const monthlyRevenue = Math.max(1, data.monthlyRevenue || 1);
  const fixedCostsTotal = (data.fixedCosts || 0) + (data.ownerSalary || 0);
  const varPercent = Math.min(95, Math.max(0, data.variableCostsPercent || 0));
  const taxPercent = Math.min(95, Math.max(0, data.taxesPercent || 0));

  const totalVarTaxPercent = Math.min(98, varPercent + taxPercent);
  const contributionMarginPercent = Math.max(2, 100 - totalVarTaxPercent);

  const variableCostsTotal = (monthlyRevenue * varPercent) / 100;
  const taxesTotal = (monthlyRevenue * taxPercent) / 100;

  const breakEvenRevenue = Math.round(fixedCostsTotal / (contributionMarginPercent / 100));
  const breakEvenPercentage = Math.min(200, Math.round((breakEvenRevenue / monthlyRevenue) * 100));
  const marginOfSafetyPercent = Math.round(((monthlyRevenue - breakEvenRevenue) / monthlyRevenue) * 100);
  const estimatedNetProfit = Math.round((monthlyRevenue * contributionMarginPercent) / 100 - fixedCostsTotal);
  const estimatedNetMarginPercent = Math.round((estimatedNetProfit / monthlyRevenue) * 100);

  const avgTicket = Math.max(1, data.averageTicket || 1);
  const breakEvenClientsNeeded = Math.ceil(breakEvenRevenue / avgTicket);

  return {
    monthlyRevenue,
    fixedCostsTotal,
    variableCostsTotal,
    taxesTotal,
    contributionMarginPercent,
    breakEvenRevenue,
    breakEvenPercentage,
    estimatedNetProfit,
    estimatedNetMarginPercent,
    marginOfSafetyPercent,
    breakEvenClientsNeeded,
  };
}

export function calculateAreaScores(data: DiagnosticFormData): Record<string, AreaScoreInfo> {
  // ... (mantém o mesmo código que você já tem)
  const keys = ['Financeiro', 'Comercial', 'Operacao', 'Gestao', 'Pessoas', 'Estrategia'];
  const rawScores: Record<string, number> = {
    Financeiro: data.scoreFinanceiro || 1,
    Comercial: data.scoreComercial || 1,
    Operacao: data.scoreOperacao || 1,
    Gestao: data.scoreGestao || 1,
    Pessoas: data.scorePessoas || 1,
    Estrategia: data.scoreEstrategia || 1,
  };

  const areaScores: Record<string, AreaScoreInfo> = {};

  keys.forEach((key) => {
    const raw = rawScores[key];
    let adjustedScore = raw * 2;

    if (key === 'Financeiro') {
      if (data.knowsNetMargin) adjustedScore += 0.5;
      if (data.hasProjectedCashFlow) adjustedScore += 0.5;
    } else if (key === 'Estrategia') {
      if (data.hasGrowthGoalsAndPlan) adjustedScore += 0.5;
      if (data.runsWithoutOwner30Days) adjustedScore += 0.5;
    } else if (key === 'Gestao') {
      if (data.hasCRM) adjustedScore += 0.5;
      if (data.hasProjectedCashFlow) adjustedScore += 0.5;
    }

    const finalScore = Math.min(10, Math.max(1, Number(adjustedScore.toFixed(1))));

    let status: 'Verde' | 'Amarelo' | 'Vermelho' = 'Green' as any;
    if (finalScore < 5.5) status = 'Vermelho';
    else if (finalScore < 7.5) status = 'Amarelo';
    else status = 'Verde';

    areaScores[key] = {
      key,
      name: AREA_NAMES[key],
      score: finalScore,
      rawScore: raw,
      status,
      description: AREA_DESCRIPTIONS[key].description,
    };
  });

  return areaScores;
}

export function calculateClarityIndex(areaScores: Record<string, AreaScoreInfo>, data: DiagnosticFormData): {
  clarityIndex: number;
  clarityStatus: 'Crítico' | 'Atenção' | 'Saudável' | 'Excelente';
  clarityDescription: string;
} {
  // ... (mantém o mesmo código que você já tem)
  const scores = Object.values(areaScores).map((a) => a.score);
  const averageAreaScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  let strategicBonus = 0;
  if (data.runsWithoutOwner30Days) strategicBonus += 2.5;
  if (data.knowsNetMargin) strategicBonus += 2.5;
  if (data.hasProjectedCashFlow) strategicBonus += 2.5;
  if (data.hasGrowthGoalsAndPlan) strategicBonus += 2.5;

  const rawClarity = averageAreaScore * 9 + strategicBonus;
  const clarityIndex = Math.min(100, Math.max(10, Math.round(rawClarity)));

  let clarityStatus: 'Crítico' | 'Atenção' | 'Saudável' | 'Excelente' = 'Atenção';
  let clarityDescription = '';

  if (clarityIndex < 45) {
    clarityStatus = 'Crítico';
    clarityDescription =
      'Sua empresa opera em alto risco operacional e financeiro. O crescimento está travado por falta de previsibilidade, processos e margem de manobra.';
  } else if (clarityIndex < 68) {
    clarityStatus = 'Atenção';
    clarityDescription =
      'A empresa tem um motor funcionando, porém consome muita energia dos sócios. Existem gargalos claros retendo o potencial de faturamento e escala.';
  } else if (clarityIndex < 85) {
    clarityStatus = 'Saudável';
    clarityDescription =
      'Sua empresa tem boa estrutura gerencial e financeira. O desafio agora é alinhar eficiência operacional e vendas para acelerar o crescimento sem perder qualidade.';
  } else {
    clarityStatus = 'Excelente';
    clarityDescription =
      'Excelente nível de maturidade empresarial. A empresa possui tração, clareza financeira e autonomia. O foco deve ser expansão estratégica e delegação.';
  }

  return { clarityIndex, clarityStatus, clarityDescription };
}

export function identifyBottlenecks(areaScores: Record<string, AreaScoreInfo>): {
  primaryBottleneck: BottleneckInfo;
  secondaryBottleneck: BottleneckInfo;
} {
  // ... (mantém o mesmo código que você já tem)
  const sorted = Object.values(areaScores).sort((a, b) => a.score - b.score);
  const primary = sorted[0];
  const secondary = sorted[1];

  const primaryBottleneck: BottleneckInfo = {
    key: primary.key,
    name: primary.name,
    score: primary.score,
    description: AREA_DESCRIPTIONS[primary.key].description,
    impact: AREA_DESCRIPTIONS[primary.key].impact,
    immediateAction: AREA_DESCRIPTIONS[primary.key].immediateAction,
  };

  const secondaryBottleneck: BottleneckInfo = {
    key: secondary.key,
    name: secondary.name,
    score: secondary.score,
    description: AREA_DESCRIPTIONS[secondary.key].description,
    impact: AREA_DESCRIPTIONS[secondary.key].impact,
    immediateAction: AREA_DESCRIPTIONS[secondary.key].immediateAction,
  };

  return { primaryBottleneck, secondaryBottleneck };
}

export function generateActionPlan90Days(
  primaryKey: string,
  companyName: string,
  breakEven: BreakEvenAnalysis
): ActionPlan90Days {
  // ... (mantém o mesmo código que você já tem - é grande, mantenha o que está no seu arquivo)
  const name = companyName || 'sua empresa';

  const defaultPlans: Record<string, ActionPlan90Days> = {
    // ... (mantenha todo o seu código existente aqui)
  };

  return defaultPlans[primaryKey] || defaultPlans['Financeiro'];
}

export function generateTextualDiagnosis(
  data: DiagnosticFormData,
  clarityIndex: number,
  clarityStatus: string,
  primaryBottleneck: BottleneckInfo,
  secondaryBottleneck: BottleneckInfo,
  breakEven: BreakEvenAnalysis
): { textualDiagnosis: string; executiveSummary: string; strategicRecommendations: string[] } {
  // ... (mantém o mesmo código que você já tem)
  const company = data.companyName || (data.cnpjData?.razaoSocial ?? 'Sua empresa');
  const segment = data.segment || (data.cnpjData?.cnaeDescricao ?? 'Mercado de atuação');

  const formattedRevenue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    data.monthlyRevenue || 0
  );
  const formattedBreakEven = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    breakEven.breakEvenRevenue
  );
  const formattedNetProfit = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    breakEven.estimatedNetProfit
  );

  const executiveSummary = `A empresa **${company}** (${segment}) apresenta atualmente um **Índice de Clareza de ${clarityIndex}/100** (Classificação: **${clarityStatus}**). O faturamento mensal de **${formattedRevenue}** exige um **Ponto de Equilíbrio (Break-Even) de ${formattedBreakEven}** para cobrir todos os custos fixos (${breakEven.breakEvenPercentage}% da receita atual). A margem de contribuição média calculada é de **${breakEven.contributionMarginPercent}%**, resultando em um lucro líquido estimado em **${formattedNetProfit}** (${breakEven.estimatedNetMarginPercent}% de margem líquida).`;

  const textualDiagnosis = `Com base nas respostas fornecidas, o principal gargalo retendo o crescimento acelerado da **${company}** é a área de **${primaryBottleneck.name}** (Nota: ${primaryBottleneck.score}/10). ${primaryBottleneck.description}\n\nAlém disso, identificou-se como segundo ponto de atenção a área de **${secondaryBottleneck.name}** (Nota: ${secondaryBottleneck.score}/10). A combinação desses dois gargalos cria uma fricção onde o empresário investe alto volume de tempo e energia sem obter o retorno financeiro e a previsibilidade condizentes. Para reverter esse cenário, a prioridade máxima para os próximos 90 dias deve ser a execução do Plano de Ação focado em **${primaryBottleneck.name}**, eliminando o desperdício de margem e estabilizando a operação.`;

  const strategicRecommendations = [
    `Atingir a Margem de Segurança recomendada de pelo menos 25% acima do Break-Even (atualmente necessita de **${breakEven.breakEvenClientsNeeded} clientes/mês** com ticket médio de R$ ${data.averageTicket}).`,
    `Atacar imediatamente o gargalo de **${primaryBottleneck.name}**: ${primaryBottleneck.immediateAction}`,
    `Formalizar rotinas de acompanhamento financeiro e comercial semanal, garantindo previsibilidade de caixa e CRM ativo.`,
    `Desenvolver autonomia da equipe para permitir que os sócios foquem na expansão estratégica e não apenas em resolver problemas do dia a dia.`,
  ];

  return {
    textualDiagnosis,
    executiveSummary,
    strategicRecommendations,
  };
}

export function generateFullDiagnostic(data: DiagnosticFormData): DiagnosticResult {
  const areaScores = calculateAreaScores(data);
  const { clarityIndex, clarityStatus, clarityDescription } = calculateClarityIndex(areaScores, data);
  const { primaryBottleneck, secondaryBottleneck } = identifyBottlenecks(areaScores);
  const breakEven = calculateBreakEven(data);
  const actionPlan90Days = generateActionPlan90Days(primaryBottleneck.key, data.companyName, breakEven);
  const { textualDiagnosis, executiveSummary, strategicRecommendations } = generateTextualDiagnosis(
    data,
    clarityIndex,
    clarityStatus,
    primaryBottleneck,
    secondaryBottleneck,
    breakEven
  );

  // 🔥 APLICA O MODELO DE RECEITA E SETOR
  const modeloReceita = data.revenueModel || 'outros';
  const areaAtuacao = data.areaAtuacao || 'outros_setor';
  const customArea = data.customArea || '';

  const resultadoBase = {
    formSummary: data,
    clarityIndex,
    clarityStatus,
    clarityDescription,
    areaScores,
    primaryBottleneck,
    secondaryBottleneck,
    breakEven,
    actionPlan90Days,
    textualDiagnosis,
    executiveSummary,
    strategicRecommendations,
    aiGenerated: false,
    generatedAt: new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // 🔥 Chama a função que combina modelo + setor
  const resultadoComModeloESetor = aplicarModeloESetor(
    resultadoBase,
    modeloReceita,
    areaAtuacao,
    customArea
  );

  return {
    ...resultadoComModeloESetor,
    // Mantém os campos originais
    formSummary: resultadoBase.formSummary,
    clarityIndex: resultadoBase.clarityIndex,
    clarityStatus: resultadoBase.clarityStatus,
    clarityDescription: resultadoBase.clarityDescription,
    areaScores: resultadoBase.areaScores,
    primaryBottleneck: resultadoBase.primaryBottleneck,
    secondaryBottleneck: resultadoBase.secondaryBottleneck,
    breakEven: resultadoBase.breakEven,
    actionPlan90Days: resultadoBase.actionPlan90Days,
    textualDiagnosis: resultadoBase.textualDiagnosis,
    executiveSummary: resultadoBase.executiveSummary,
    strategicRecommendations: resultadoBase.strategicRecommendations,
    aiGenerated: resultadoBase.aiGenerated,
    generatedAt: resultadoBase.generatedAt,
    // Campos adicionados pelo modelo + setor
    revenueModel: modeloReceita,
    recomendacoesPersonalizadas: resultadoComModeloESetor.recomendacoesPersonalizadas,
    prioridadeModelo: resultadoComModeloESetor.prioridadeModelo,
    modeloReceitaAplicado: resultadoComModeloESetor.modeloReceitaAplicado,
    setorIdentificado: resultadoComModeloESetor.setorIdentificado,
  };
}