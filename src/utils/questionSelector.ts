// ============================================================
// PONTO DE IMPACTO 2.0 - SELETOR DE PERGUNTAS
// ============================================================

import { 
  DiagnosticFormData, 
  Pergunta, 
  Hipotese,
  CanalReceita,
  CanalAquisicao
} from '../types';
import { getProximaPergunta, getPerguntasAtivas } from '../config/questionMap';
import { gerarHipoteses, sugerirProximaInvestigacao } from './hypothesisEngine';

// ============================================================
// 1. ESTADO DA INVESTIGAÇÃO
// ============================================================

export interface EstadoInvestigacao {
  // Dados já coletados
  dados: DiagnosticFormData;
  
  // Perguntas já respondidas
  perguntasRespondidas: string[];
  
  // Hipóteses atuais
  hipoteses: Hipotese[];
  
  // Próxima pergunta a fazer
  proximaPergunta: Pergunta | null;
  
  // Status da investigação
  etapa: 'coletando_contexto' | 'mapeando_receita' | 'investigando_hipoteses' | 'validando_limitador' | 'concluido';
  
  // Nível de confiança global
  confiancaGlobal: number;
}

// ============================================================
// 2. INICIAR INVESTIGAÇÃO
// ============================================================

export function iniciarInvestigacao(dadosIniciais: Partial<DiagnosticFormData>): EstadoInvestigacao {
  const dados: DiagnosticFormData = {
    cnpj: '',
    cnpjData: null,
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

  // Obtém todas as perguntas ativas
  const perguntasAtivas = getPerguntasAtivas(dados);
  
  // Encontra a primeira pergunta não respondida
  const proximaPergunta = getProximaPergunta(perguntasAtivas, dados);

  // Gera hipóteses iniciais (se houver dados suficientes)
  const hipoteses = gerarHipoteses(dados);

  // Determina a etapa
  let etapa: 'coletando_contexto' | 'mapeando_receita' | 'investigando_hipoteses' | 'validando_limitador' | 'concluido' = 'coletando_contexto';
  
  const perguntasRespondidas = Object.keys(dados).filter(key => {
    const val = dados[key as keyof DiagnosticFormData];
    return val !== undefined && val !== null && val !== '' && val !== 0 && val !== false;
  }).length;

  if (perguntasRespondidas >= 10 && hipoteses.length > 0) {
    etapa = 'investigando_hipoteses';
  } else if (perguntasRespondidas >= 6) {
    etapa = 'mapeando_receita';
  }

  if (dados.canaisAquisicao && dados.canaisAquisicao.length > 0) {
    etapa = 'mapeando_receita';
  }

  return {
    dados,
    perguntasRespondidas: Object.keys(dados).filter(key => {
      const val = dados[key as keyof DiagnosticFormData];
      return val !== undefined && val !== null && val !== '' && val !== 0;
    }),
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
  // Quantidade de dados coletados (peso 30%)
  const dadosColetados = Object.keys(dados).filter(key => {
    const val = dados[key as keyof DiagnosticFormData];
    return val !== undefined && val !== null && val !== '' && val !== 0;
  }).length;
  
  const pontuacaoDados = Math.min(100, (dadosColetados / 20) * 100) * 0.3;
  
  // Confiança das hipóteses (peso 40%)
  let confiancaHipoteses = 0;
  if (hipoteses.length > 0) {
    const total = hipoteses.reduce((sum, h) => sum + h.confianca, 0);
    confiancaHipoteses = (total / hipoteses.length) * 0.4;
  }
  
  // Existência de limitador identificado (peso 30%)
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
  // Atualiza os dados com a resposta
  const dadosAtualizados = {
    ...estado.dados,
    [idPergunta]: resposta,
  };

  // Marca a pergunta como respondida
  const perguntasAtualizadas = [...estado.perguntasRespondidas, idPergunta];

  // Obtém todas as perguntas ativas
  const perguntasAtivas = getPerguntasAtivas(dadosAtualizados);
  
  // Encontra a próxima pergunta
  const proximaPergunta = getProximaPergunta(perguntasAtivas, dadosAtualizados);

  // Gera hipóteses atualizadas
  const hipotesesAtualizadas = gerarHipoteses(dadosAtualizados);

  // Verifica se a próxima pergunta deve vir das hipóteses
  let proximaPerguntaFinal = proximaPergunta;
  let etapa = estado.etapa;

  if (hipotesesAtualizadas.length > 0 && perguntasAtualizadas.length >= 8) {
    // Se já temos algumas respostas, tenta investigar a hipótese mais promissora
    const investigacao = sugerirProximaInvestigacao(hipotesesAtualizadas, dadosAtualizados);
    if (investigacao && !proximaPergunta) {
      // Cria uma pergunta dinâmica baseada na hipótese
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

  // Verifica se já temos confiança suficiente para concluir
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
  // Condições para considerar o diagnóstico completo:
  // 1. Temos confiança global >= 70%
  // 2. Temos pelo menos uma hipótese com confiança >= 70%
  // 3. Já respondemos pelo menos 12 perguntas
  // 4. OU a etapa está em 'concluido'
  
  if (estado.etapa === 'concluido') return true;
  
  const temHipoteseForte = estado.hipoteses.some(h => h.confianca >= 70);
  const confiancaSuficiente = estado.confiancaGlobal >= 70;
  const perguntasSuficientes = estado.perguntasRespondidas.length >= 12;
  
  // Se não tem mais perguntas para fazer
  const naoTemMaisPerguntas = estado.proximaPergunta === null;
  
  return (temHipoteseForte && confiancaSuficiente && perguntasSuficientes) || 
         (naoTemMaisPerguntas && estado.perguntasRespondidas.length >= 10);
}

// ============================================================
// 6. OBTER RESUMO DA INVESTIGAÇÃO
// ============================================================

export function obterResumoInvestigacao(estado: EstadoInvestigacao): string {
  const linhas: string[] = [];
  
  linhas.push(`📊 Status: ${estado.etapa.toUpperCase()}`);
  linhas.push(`🎯 Confiança: ${estado.confiancaGlobal}%`);
  linhas.push(`📝 Perguntas respondidas: ${estado.perguntasRespondidas.length}`);
  
  if (estado.hipoteses.length > 0) {
    linhas.push('\n🔍 Hipóteses ativas:');
    for (const h of estado.hipoteses) {
      linhas.push(`  - ${h.descricao.substring(0, 80)}... (${h.confianca}%)`);
    }
  }
  
  if (estado.proximaPergunta) {
    linhas.push(`\n❓ Próxima pergunta: ${estado.proximaPergunta.texto}`);
  } else {
    linhas.push('\n✅ Nenhuma pergunta pendente.');
  }
  
  return linhas.join('\n');
}

// ============================================================
// 7. GERAR PERGUNTAS PARA O DIAGNÓSTICO GRÁTIS (5 PERGUNTAS)
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
// 8. GERAR PERGUNTAS RESTANTES PARA UPGRADE
// ============================================================

export function gerarPerguntasRestantes(
  respostasGratis: Record<string, any>,
  estado: EstadoInvestigacao
): Pergunta[] {
  // Todas as perguntas ativas
  const todasPerguntas = getPerguntasAtivas(estado.dados);
  
  // Perguntas já respondidas no diagnóstico grátis
  const idsRespondidos = Object.keys(respostasGratis);
  
  // Retorna apenas as perguntas que não foram respondidas
  return todasPerguntas.filter(p => !idsRespondidos.includes(p.id));
}