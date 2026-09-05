// ============================================================
// PONTO DE IMPACTO 2.0 - TYPES
// ============================================================

// ============================================================
// 1. IDENTIDADE E CONTEXTO DA EMPRESA
// ============================================================

export interface CompanyCNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  porte: string;
  cnaeCodigo: string;
  cnaeDescricao: string;
  logradouro: string;
  municipio: string;
  uf: string;
  situacaoCadastral: string;
  capitalSocial: number;
  dataAbertura: string;
  source: string;
}

export type ModeloReceita = 
  | 'produtos' 
  | 'servicos' 
  | 'ambos' 
  | 'assinatura' 
  | 'marketplace' 
  | 'hibrido' 
  | 'outro';

export type SetorAtuacao = 
  | 'alimentacao' 
  | 'saude' 
  | 'financas' 
  | 'tecnologia' 
  | 'educacao' 
  | 'consultoria' 
  | 'varejo' 
  | 'imobiliario' 
  | 'logistica' 
  | 'entretenimento' 
  | 'outro';

export type PorteEmpresa = 'MEI' | 'ME' | 'EPP' | 'Demais' | 'Grande';

// ============================================================
// 2. OBJETIVO
// ============================================================

export type TipoObjetivo = 
  | 'crescer_faturamento'
  | 'aumentar_margem'
  | 'trabalhar_menos'
  | 'profissionalizar'
  | 'expandir'
  | 'reduzir_dependencia'
  | 'outro';

export interface Objetivo {
  tipo: TipoObjetivo;
  descricao: string;
  horizonte: '6_meses' | '12_meses' | '24_meses' | '36_meses';
  meta?: {
    faturamento?: number;
    margem?: number;
    horas_trabalhadas?: number;
    numero_clientes?: number;
    outras?: string;
  };
}

// ============================================================
// 3. MÁQUINA DE RECEITA (CANAL DE AQUISIÇÃO)
// ============================================================

export type CanalAquisicao = 
  | 'indicacao'
  | 'clientes_recorrentes'
  | 'instagram'
  | 'facebook'
  | 'google_ads'
  | 'google_organico'
  | 'trafico_pago'
  | 'conteudo'
  | 'marketplace'
  | 'loja_fisica'
  | 'vendedores'
  | 'prospeccao_ativa'
  | 'representantes'
  | 'parceiros'
  | 'eventos'
  | 'networking'
  | 'whatsapp'
  | 'telefone'
  | 'outbound'
  | 'outro';

export interface CanalReceita {
  id: string;
  canal: CanalAquisicao;
  percentual: number; // 0-100, soma de todos os canais = 100
  descricao?: string;
  
  // Campos opcionais preenchidos conforme aprofundamento
  investimento_mensal?: number;
  leads_gerados?: number;
  taxa_conversao?: number; // 0-100
  ticket_medio?: number;
  cac?: number; // Custo de Aquisição por Cliente
  roas?: number; // Return on Ad Spend
  tempo_retorno?: number; // dias
  dependencia?: 'baixa' | 'media' | 'alta';
}

// ============================================================
// 4. CAPACIDADES DA EMPRESA
// ============================================================

export interface Capacidades {
  producao: number;        // % de capacidade atual (ex: 60 = 60%)
  atendimento: number;     // % de capacidade atual
  distribuicao: number;    // % de capacidade atual
  financeiro: number;      // % de capacidade atual (capital de giro)
  comercial: number;       // % de capacidade atual
  gestao: number;          // % de capacidade atual
  operacional: number;     // % de capacidade atual
}

export interface CapacidadeNecessaria {
  producao: number;
  atendimento: number;
  distribuicao: number;
  financeiro: number;
  comercial: number;
  gestao: number;
  operacional: number;
}

export interface GapCapacidade {
  producao: number;        // negativo = deficit, positivo = excesso
  atendimento: number;
  distribuicao: number;
  financeiro: number;
  comercial: number;
  gestao: number;
  operacional: number;
}

// ============================================================
// 5. LIMITADORES
// ============================================================

export type AreaLimitadora = 
  | 'financeiro'
  | 'comercial'
  | 'operacao'
  | 'gestao'
  | 'pessoas'
  | 'estrategia'
  | 'marketing'
  | 'producao'
  | 'distribuicao'
  | 'atendimento'
  | 'capital_giro'
  | 'dependencia_dono'
  | 'tecnologia'
  | 'outro';

export interface Limitador {
  id: string;
  area: AreaLimitadora;
  nome: string;
  descricao: string;
  impacto: string; // Como impacta o objetivo
  evidencia: string[]; // Evidências que sustentam a hipótese
  confianca: number; // 0-100, nível de confiança na hipótese
  gravidade: 'baixa' | 'media' | 'alta' | 'critica';
  urgência: 'baixa' | 'media' | 'alta' | 'critica';
  data_identificacao: string;
}

export interface ProximoLimitador {
  area: AreaLimitadora;
  nome: string;
  descricao: string;
  condicao_para_ativar: string; // "Se crescer X%, Y quebra"
  estimativa_confianca: number;
}

// ============================================================
// 6. HIPÓTESES
// ============================================================

export interface Hipotese {
  id: string;
  descricao: string;
  area: AreaLimitadora;
  evidencia_favoravel: string[];
  evidencia_contraria: string[];
  confianca: number; // 0-100
  status: 'pendente' | 'confirmada' | 'refutada' | 'parcial';
  proxima_pergunta?: string; // O que perguntar para confirmar/refutar
}

// ============================================================
// 7. EVIDÊNCIAS
// ============================================================

export interface Evidencia {
  id: string;
  tipo: 'dado' | 'percepcao' | 'fato' | 'indicador';
  fonte: string;
  descricao: string;
  valor?: string | number | boolean;
  confiabilidade: 'baixa' | 'media' | 'alta';
  data_coleta: string;
}

// ============================================================
// 8. SIMULAÇÃO (O QUE QUEBRA PRIMEIRO)
// ============================================================

export interface SimulacaoCenario {
  id: string;
  nome: string;
  descricao: string;
  gatilho: string; // "Aumento de X% em Y"
  impacto_esperado: string;
  capacidade_necessaria: CapacidadeNecessaria;
  gap_resultante: GapCapacidade;
  primeiro_limitador: {
    area: AreaLimitadora;
    descricao: string;
    quando: string; // "Quando faturamento chegar a R$ X"
    confianca: number;
  };
  proximo_limitador: {
    area: AreaLimitadora;
    descricao: string;
    quando: string;
    confianca: number;
  };
}

export interface SimulacaoResultado {
  objetivos_alinhados: boolean;
  cenarios: SimulacaoCenario[];
  melhor_caminho: SimulacaoCenario | null;
  riscos_identificados: string[];
  recomendacoes: string[];
}

// ============================================================
// 9. INTERVENÇÕES E TESTES
// ============================================================

export type TipoIntervencao = 'teste' | 'implementacao' | 'experimento';

export interface Intervencao {
  id: string;
  descricao: string;
  tipo: TipoIntervencao;
  area: AreaLimitadora;
  alavancagem: 'baixa' | 'media' | 'alta' | 'muito_alta';
  custo_estimado: number;
  esforco_estimado: 'baixo' | 'medio' | 'alto';
  risco: 'baixo' | 'medio' | 'alto';
  tempo_estimado: string; // "2 semanas", "1 mês"
  impacto_estimado: string;
  metricas_para_medir: string[];
  condicao_sucesso: string;
  proximo_limitador_esperado: string;
}

// ============================================================
// 10. DIAGNÓSTICO ADAPTATIVO (ESTADO DA INVESTIGAÇÃO)
// ============================================================

export interface DiagnosticoAdaptativo {
  // Contexto
  contexto: {
    empresa: string;
    setor: SetorAtuacao;
    modelo: ModeloReceita;
    porte: PorteEmpresa;
  };
  
  // Objetivo
  objetivo: Objetivo | null;
  
  // Estado atual
  estado: {
    faturamento_mensal: number;
    margem_liquida: number;
    numero_colaboradores: number;
    capital_giro: number;
    horas_dono_semana: number;
  };
  
  // Máquina de Receita
  canais: CanalReceita[];
  ticket_medio: number;
  frequencia_compra: number;
  taxa_retencao: number;
  ciclo_venda_dias: number;
  
  // Capacidades
  capacidades: Capacidades;
  
  // Hipóteses ativas
  hipoteses: Hipotese[];
  
  // Limitadores identificados
  limitador_atual: Limitador | null;
  limitador_projetado: ProximoLimitador | null;
  
  // Evidências coletadas
  evidencias: Evidencia[];
  
  // Estado da investigação
  etapa_atual: 'contexto' | 'mapeamento' | 'investigacao' | 'analise' | 'conclusao';
  perguntas_respondidas: number;
  nivel_confianca_global: number;
  status: 'em_andamento' | 'parcial' | 'concluido';
}

// ============================================================
// 11. RESULTADO DO DIAGNÓSTICO 2.0
// ============================================================

export interface DiagnosticResultV2 {
  // Versão
  version: '2.0';
  
  // Contexto
  empresa: string;
  cnpj: string;
  setor: string;
  modelo: string;
  
  // Resumo
  indiceClareza: number;
  statusClareza: 'Crítico' | 'Atenção' | 'Saudável' | 'Excelente';
  
  // O que você descreveu
  mapa_limitadores: {
    objetivo: Objetivo;
    estado_atual: string;
    limitador_principal: Limitador;
    limitador_projetado: ProximoLimitador | null;
    evidencia_principal: string;
    confianca: number;
  };
  
  // Máquina de Receita
  maquina_receita: {
    canais: CanalReceita[];
    ticket_medio: number;
    concentracao: number; // % do principal canal
    dependencia_canal: 'baixa' | 'media' | 'alta';
  };
  
  // Capacidades e Gaps
  capacidades: Capacidades;
  gaps: GapCapacidade;
  
  // Simulação
  simulacao: SimulacaoResultado | null;
  
  // Plano de Ação
  acoes: Intervencao[];
  
  // Recomendações (legado para compatibilidade)
  recomendações: string[];
  
  // Metadados
  geradoEm: string;
  aiGenerated: boolean;
  versao: string;
}

// ============================================================
// 12. FORMULÁRIO DE DIAGNÓSTICO (LEGADO + NOVO)
// ============================================================

export interface DiagnosticFormData {
  // ===== DADOS DA EMPRESA (LEGADO) =====
  cnpj: string;
  cnpjData: CompanyCNPJData | null;
  companyName: string;
  segment: string;
  cityState: string;
  timeInMarket: string;
  employeesCount: string;
  taxRegime: string;

  // ===== DADOS FINANCEIROS (LEGADO) =====
  monthlyRevenue: number;
  fixedCosts: number;
  variableCostsPercent: number;
  taxesPercent: number;
  ownerSalary: number;
  averageTicket: number;
  monthlyClients: number;

  // ===== DADOS COMERCIAIS (LEGADO) =====
  conversionRate: number;
  hasCRM: boolean;
  salesTeamSize: number;
  hasSalesManager?: boolean;

  // ===== AUTOAVALIAÇÃO (LEGADO) =====
  scoreFinanceiro: number;
  scoreComercial: number;
  scoreOperacao: number;
  scoreGestao: number;
  scorePessoas: number;
  scoreEstrategia: number;

  // ===== PERGUNTAS ESTRATÉGICAS (LEGADO) =====
  runsWithoutOwner30Days: boolean;
  knowsNetMargin: boolean;
  hasProjectedCashFlow: boolean;
  hasGrowthGoalsAndPlan: boolean;

  // ===== OBJETIVO E DOR (LEGADO) =====
  mainGoal: string;
  biggestDifficulty: string;

  // ===== CONTATO (LEGADO) =====
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  consentGiven: boolean;

  // ===== MODELO DE RECEITA E SETOR (LEGADO) =====
  revenueModel: string;
  customRevenueModel: string;
  areaAtuacao: string;
  customArea: string;

  // ===== RESPONSÁVEIS POR ÁREA (LEGADO) =====
  responsavelFinanceiro: string;
  responsavelComercial: string;
  responsavelOperacoes: string;

  // ===== PAGAMENTO (LEGADO) =====
  paymentConfirmed?: boolean;
  paymentStatus?: 'pending' | 'paid' | 'test' | 'failed';
  stripeSessionId?: string;

  // ============================================================
  // NOVOS CAMPOS DO DIAGNÓSTICO 2.0
  // ============================================================

  // === MÁQUINA DE RECEITA ===
  canaisAquisicao?: CanalReceita[];
  ticketMedio?: number;
  frequenciaCompra?: number;
  taxaRetencao?: number;
  cicloVendaDias?: number;

  // === CAPACIDADES ===
  capacidadeProducao?: number; // %
  capacidadeAtendimento?: number; // %
  capacidadeDistribuicao?: number; // %
  capacidadeFinanceiro?: number; // %
  capacidadeComercial?: number; // %
  capacidadeGestao?: number; // %

  // === CAPITAL DE GIRO ===
  capitalGiro?: number;
  prazoRecebimentoMedia?: number; // dias
  prazoPagamentoFornecedores?: number; // dias
  temEmprestimos?: boolean;
  valorEmprestimos?: number;
  custoFinanceiro?: number; // % ao mês

  // === OPERAÇÕES ===
  temTerceirizados?: boolean;
  percentualTerceirizados?: number;
  gestaoOperacional?: 'socio' | 'gerente' | 'analista' | 'terceirizado';

  // === DEPENDÊNCIA DO DONO ===
  horasDonoSemana?: number;
  tarefasDono?: string[]; // "vendas", "operações", "financeiro", etc.
  temSucessor?: boolean;

  // === ESTRUTURA ===
  estruturaSocietaria?: {
    socios: number;
    socios_ativos: number;
    divisao_tarefas: string;
  };
}

// ============================================================
// 13. MAPA DE PERGUNTAS (CONFIGURAÇÃO)
// ============================================================

export interface Pergunta {
  id: string;
  texto: string;
  descricao?: string;
  tipo: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'percentual' | 'range';
  opcoes?: Array<{ value: string; label: string; icon?: string }>;
  condicao?: (data: DiagnosticFormData) => boolean;
  mapa?: 'receita' | 'comercial' | 'financeiro' | 'operacional' | 'pessoas' | 'gestao' | 'estrategia';
  prioridade: number;
  canais?: CanalAquisicao[];
  setores?: SetorAtuacao[];
}

export interface MapaPerguntas {
  id: string;
  nome: string;
  descricao: string;
  perguntas: Pergunta[];
  condicao_ativacao?: (data: DiagnosticFormData) => boolean;
}

// ============================================================
// 14. LEAD (PARA INTEGRAÇÃO COM ZAPIER)
// ============================================================

export interface LeadRecord {
  id: string;
  companyName: string;
  cnpj: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  paymentStatus: 'pending' | 'paid' | 'test' | 'failed';
  paymentConfirmed: boolean;
  stripeSessionId?: string;
  diagnosticResult?: DiagnosticResultV2;
  formData: DiagnosticFormData;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 15. LEGADO (Compatibilidade)
// ============================================================

export interface BreakEvenAnalysis {
  monthlyRevenue: number;
  fixedCostsTotal: number;
  variableCostsTotal: number;
  taxesTotal: number;
  contributionMarginPercent: number;
  breakEvenRevenue: number;
  breakEvenPercentage: number;
  estimatedNetProfit: number;
  estimatedNetMarginPercent: number;
  marginOfSafetyPercent: number;
  breakEvenClientsNeeded: number;
}

export interface AreaScoreInfo {
  key: string;
  name: string;
  score: number;
  rawScore: number;
  status: 'Verde' | 'Amarelo' | 'Vermelho';
  description: string;
}

export interface BottleneckInfo {
  key: string;
  name: string;
  score: number;
  description: string;
  impact: string;
  immediateAction: string;
  impactoSimplificado?: string;
  acaoUrgente?: string;
}

export interface ActionPlanTask {
  id: string;
  title: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Normal';
}

export interface ActionPlanPhase {
  phaseNumber: number;
  title: string;
  period: string;
  goal: string;
  tasks: ActionPlanTask[];
}

export interface ActionPlan90Days {
  phase1: ActionPlanPhase;
  phase2: ActionPlanPhase;
  phase3: ActionPlanPhase;
}

export interface GooglePlacesEvidence {
  name?: string;
  rating: number | null;
  userRatingsTotal: number | null;
  address?: string;
  status: 'success' | 'not_found' | 'error' | 'no_api_key';
}

export interface NewsItemEvidence {
  title: string;
  source: string;
  date: string;
  link?: string;
  snippet?: string;
}

export interface EvidenceData {
  googlePlaces: GooglePlacesEvidence;
  news: NewsItemEvidence[];
  fetchedAt: string;
}

export interface DiagnosticResult {
  formSummary: DiagnosticFormData;
  clarityIndex: number;
  clarityStatus: 'Crítico' | 'Atenção' | 'Saudável' | 'Excelente';
  clarityDescription: string;
  areaScores: Record<string, AreaScoreInfo>;
  primaryBottleneck: BottleneckInfo;
  secondaryBottleneck: BottleneckInfo;
  breakEven: BreakEvenAnalysis;
  actionPlan90Days: ActionPlan90Days;
  textualDiagnosis: string;
  executiveSummary: string;
  strategicRecommendations: string[];
  evidenceData?: EvidenceData;
  aiGenerated: boolean;
  generatedAt: string;
  revenueModel?: string;
  recomendacoesPersonalizadas?: string[];
  prioridadeModelo?: string;
  modeloReceitaAplicado?: string;
  responsaveis?: {
    financeiro: string;
    comercial: string;
    operacoes: string;
  };
  costAnalysis?: {
    topCost: { name: string; value: number };
    distribution: Array<{ name: string; value: number; percent: number }>;
    hasConcentration: boolean;
    costPerEmployee: number;
    rentPercentOfRevenue: number;
    totalItems: number;
    concentrationMessage: string | null;
    rentInsight: string | null;
  };
}