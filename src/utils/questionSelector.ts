// ============================================================
// PONTO DE IMPACTO 2.0 - SELETOR DE PERGUNTAS
// ============================================================

import { DiagnosticFormData, Pergunta, Hipotese } from '../types';
import { getProximaPergunta, getPerguntasAtivas } from '../config/questionMap';
import { gerarHipoteses, sugerirProximaInvestigacao } from './hypothesisEngine';

// ============================================================
// 1. ESTADO DA INVESTIGAÇÃO
// ============================================================

export interface EstadoInvestigacao {
  dados: DiagnosticFormData;
  perguntasRespondidas: string[];
  hipoteses: Hipotese[];
  proximaPergunta: Pergunta | null;
  etapa: 'coletando_contexto' | 'mapeando_receita' | 'investigando_hipoteses' | 'validando_limitador' | 'concluido';
  confiancaGlobal: number;
}

// ============================================================
// 2. INICIAR INVESTIGAÇÃO
// ============================================================

export function iniciarInvestigacao(dadosIniciais: Partial<DiagnosticFormData>): EstadoInvestigacao {
  const dados: DiagnosticFormData = {
    cnpj: '',
    cnpjData: null,
    mainGoal: '',
    biggestDifficulty: '',
    companyName: '',
    segment: '',
    cityState: '',
    timeInMarket: '3_5',
    employeesCount: '6_15',
    taxRegime: 'Simples Nacional',
    monthlyRevenue: 0,
    fixedCosts: 0,
    variableCostsPercent: 30,
    taxesPercent: 8,
    ownerSalary: 0,
    averageTicket: 0,
    monthlyClients: 0,
    conversionRate: 25,
    hasCRM: false,
    salesTeamSize: 0,
    hasSalesManager: false,
    scoreFinanceiro: 3,
    scoreComercial: 3,
    scoreOperacao: 3,
    scoreGestao: 3,
    scorePessoas: 3,
    scoreEstrategia: 3,
    runsWithoutOwner30Days: false,
    knowsNetMargin: false,
    hasProjectedCashFlow: false,
    hasGrowthGoalsAndPlan: false,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    consentGiven: false,
    revenueModel: '',
    customRevenueModel: '',
    areaAtuacao: '',
    customArea: '',
    responsavelFinanceiro: '',
    responsavelComercial: '',
    responsavelOperacoes: '',
    paymentConfirmed: false,
    ...dadosIniciais
  };

  const perguntasAtivas = getPerguntasAtivas(dados);
  const proximaPergunta = getProximaPergunta(perguntasAtivas, dados);
  const hipoteses = gerarHipoteses(dados);

  const perguntasRespondidas = Object.keys(dados).filter(key => {
    const val = dados[key as keyof DiagnosticFormData];
    return val !== undefined && val !== null && val !== '' && val !== 0 && val !== false;
  });

  let etapa: EstadoInvestigacao['etapa'] = 'coletando_contexto';
  
  if (perguntasRespondidas.length >= 10 && hipoteses.length > 0) {
    etapa = 'investigando_hipoteses';
  } else if (perguntasRespondidas.length >= 6) {
    etapa = 'mapeando_receita';
  }

  if (dados.canaisAquisicao && dados.canaisAquisicao.length > 0) {
    etapa = 'mapeando_receita';
  }

  return {
    dados,
    perguntasRespondidas,
    hipoteses,
    proximaPergunta,
    etapa,
    confiancaGlobal: calcularConfiancaGlobal(dados, hipoteses),
  };
}

// ============================================================
// 3. CALCULAR CONFIANÇA GLOBAL
// ============================================================

export function calcularConfiancaGlobal(
  dados: DiagnosticFormData,
  hipoteses: Hipotese[]
): number {
  const dadosColetados = Object.keys(dados).filter(key => {
    const val = dados[key as keyof DiagnosticFormData];
    return val !== undefined && val !== null && val !== '' && val !== 0;
  }).length;
  
  const pontuacaoDados = Math.min(100, (dadosColetados / 20) * 100) * 0.3;
  
  let confiancaHipoteses = 0;
  if (hipoteses.length > 0) {
    const total = hipoteses.reduce((sum, h) => sum + h.confianca, 0);
    confiancaHipoteses = (total / hipoteses.length) * 0.4;
  }
  
  const temLimitador = hipoteses.some(h => h.confianca >= 60);
  const pontuacaoLimitador = temLimitador ? 30 : 0;
  
  return Math.min(100, pontuacaoDados + confiancaHipoteses + pontuacaoLimitador);
}

// ============================================================
// 4. AVANÇAR A INVESTIGAÇÃO
// ============================================================

export function avancarInvestigacao(
  estado: EstadoInvestigacao,
  resposta: any,
  idPergunta: string
): EstadoInvestigacao {
  const dadosAtualizados = {
    ...estado.dados,
    [idPergunta]: resposta,
  };

  const perguntasAtualizadas = [...estado.perguntasRespondidas, idPergunta];
  const perguntasAtivas = getPerguntasAtivas(dadosAtualizados);
  const proximaPergunta = getProximaPergunta(perguntasAtivas, dadosAtualizados);
  const hipotesesAtualizadas = gerarHipoteses(dadosAtualizados);

  let proximaPerguntaFinal = proximaPergunta;
  let etapa = estado.etapa;

  if (hipotesesAtualizadas.length > 0 && perguntasAtualizadas.length >= 8) {
    const investigacao = sugerirProximaInvestigacao(hipotesesAtualizadas, dadosAtualizados);
    if (investigacao && !proximaPergunta) {
      proximaPerguntaFinal = {
        id: `hip_${Date.now()}`,
        texto: investigacao.pergunta,
        descricao: `Para confirmar se o gargalo está em ${investigacao.area}`,
        tipo: 'text',
        prioridade: 100,
        mapa: investigacao.area,
      };
      etapa = 'investigando_hipoteses';
    }
  }

  const confiancaGlobal = calcularConfiancaGlobal(dadosAtualizados, hipotesesAtualizadas);
  
  if (confiancaGlobal >= 70 && hipotesesAtualizadas.some(h => h.confianca >= 70)) {
    etapa = 'concluido';
  }

  return {
    dados: dadosAtualizados,
    perguntasRespondidas: perguntasAtualizadas,
    hipoteses: hipotesesAtualizadas,
    proximaPergunta: proximaPerguntaFinal,
    etapa,
    confiancaGlobal,
  };
}

// ============================================================
// 5. VERIFICAR SE O DIAGNÓSTICO ESTÁ COMPLETO
// ============================================================

export function isDiagnosticoCompleto(estado: EstadoInvestigacao): boolean {
  if (estado.etapa === 'concluido') return true;
  
  const temHipoteseForte = estado.hipoteses.some(h => h.confianca >= 70);
  const confiancaSuficiente = estado.confiancaGlobal >= 70;
  const perguntasSuficientes = estado.perguntasRespondidas.length >= 12;
  const naoTemMaisPerguntas = estado.proximaPergunta === null;
  
  return (temHipoteseForte && confiancaSuficiente && perguntasSuficientes) || 
         (naoTemMaisPerguntas && estado.perguntasRespondidas.length >= 10);
}

// ============================================================
// 6. GERAR PERGUNTAS PARA O DIAGNÓSTICO GRÁTIS (5 PERGUNTAS)
// ============================================================

export function gerarPerguntasGratis(): Pergunta[] {
  return [
    {
      id: 'modelo_receita',
      texto: 'Como sua empresa ganha dinheiro?',
      descricao: 'Selecione o modelo de negócio principal',
      tipo: 'select',
      opcoes: [
        { value: 'produtos', label: 'Venda de Produtos', icon: '📦' },
        { value: 'servicos', label: 'Prestação de Serviços', icon: '💼' },
        { value: 'ambos', label: 'Produtos e Serviços', icon: '🔄' },
        { value: 'assinatura', label: 'Assinatura / Recorrência', icon: '🔄' },
        { value: 'outro', label: 'Outro modelo', icon: '💡' },
      ],
      prioridade: 1,
      mapa: 'estrategia',
    },
    {
      id: 'setor_atuacao',
      texto: 'Em qual setor sua empresa atua?',
      descricao: 'Isso nos ajuda a contextualizar o diagnóstico',
      tipo: 'select',
      opcoes: [
        { value: 'alimentacao', label: 'Alimentação', icon: '🍽️' },
        { value: 'saude', label: 'Saúde & Bem-estar', icon: '🏥' },
        { value: 'financas', label: 'Finanças & Seguros', icon: '💰' },
        { value: 'tecnologia', label: 'Tecnologia & Software', icon: '💻' },
        { value: 'varejo', label: 'Varejo & Comércio', icon: '🛍️' },
        { value: 'servicos', label: 'Serviços & Consultoria', icon: '💼' },
        { value: 'outro', label: 'Outro setor', icon: '💡' },
      ],
      prioridade: 2,
      mapa: 'estrategia',
    },
    {
      id: 'objetivo_principal',
      texto: 'Qual é o seu principal objetivo com a empresa?',
      descricao: 'Isso define como vamos analisar seus resultados',
      tipo: 'select',
      opcoes: [
        { value: 'crescer_faturamento', label: 'Crescer Faturamento', icon: '📈' },
        { value: 'aumentar_margem', label: 'Aumentar Margem', icon: '💰' },
        { value: 'trabalhar_menos', label: 'Trabalhar Menos', icon: '😌' },
        { value: 'profissionalizar', label: 'Profissionalizar Gestão', icon: '📊' },
        { value: 'expandir', label: 'Expandir Operação', icon: '🌍' },
        { value: 'outro', label: 'Outro objetivo', icon: '💡' },
      ],
      prioridade: 3,
      mapa: 'estrategia',
    },
    {
      id: 'faturamento_mensal',
      texto: 'Qual o faturamento mensal médio da sua empresa?',
      descricao: 'Use a média dos últimos 3-6 meses',
      tipo: 'number',
      prioridade: 4,
      mapa: 'financeiro',
    },
    {
      id: 'numero_colaboradores',
      texto: 'Quantas pessoas trabalham na empresa atualmente?',
      descricao: 'Inclua sócios e funcionários',
      tipo: 'select',
      opcoes: [
        { value: '1', label: 'Apenas eu' },
        { value: '2_5', label: '2 a 5 pessoas' },
        { value: '6_15', label: '6 a 15 pessoas' },
        { value: '16_50', label: '16 a 50 pessoas' },
        { value: '51_100', label: '51 a 100 pessoas' },
        { value: '100+', label: 'Mais de 100 pessoas' },
      ],
      prioridade: 5,
      mapa: 'pessoas',
    },
  ];
}

// ============================================================
// 7. GERAR PERGUNTAS RESTANTES PARA UPGRADE
// ============================================================

export function gerarPerguntasRestantes(
  respostasGratis: Record<string, any>,
  estado: EstadoInvestigacao
): Pergunta[] {
  const todasPerguntas = getPerguntasAtivas(estado.dados);
  const idsRespondidos = Object.keys(respostasGratis);
  return todasPerguntas.filter(p => !idsRespondidos.includes(p.id));
}