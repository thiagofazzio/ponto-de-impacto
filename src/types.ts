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

export interface DiagnosticFormData {
  // Dados da empresa
  cnpj: string;
  cnpjData: CompanyCNPJData | null;
  companyName: string;
  segment: string;
  cityState: string;
  timeInMarket: string;
  employeesCount: string;
  taxRegime: string;

  // Dados financeiros
  monthlyRevenue: number;
  fixedCosts: number;
  variableCostsPercent: number;
  taxesPercent: number;
  ownerSalary: number;
  averageTicket: number;
  monthlyClients: number;

  // Dados comerciais
  conversionRate: number;
  hasCRM: boolean;
  salesTeamSize: number;
  hasSalesManager?: boolean;

  // Autoavaliação (1 a 5)
  scoreFinanceiro: number;
  scoreComercial: number;
  scoreOperacao: number;
  scoreGestao: number;
  scorePessoas: number;
  scoreEstrategia: number;

  // Perguntas estratégicas
  runsWithoutOwner30Days: boolean;
  knowsNetMargin: boolean;
  hasProjectedCashFlow: boolean;
  hasGrowthGoalsAndPlan: boolean;

  // Objetivo e Dor
  mainGoal: string;
  biggestDifficulty: string;

  // Contato
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  consentGiven: boolean;

  // Modelo de receita e setor
  revenueModel: string;
  customRevenueModel: string;
  areaAtuacao: string;
  customArea: string;

  // Responsáveis por área
  responsavelFinanceiro: string;
  responsavelComercial: string;
  responsavelOperacoes: string;

  // Pagamento (NOVO)
  paymentConfirmed?: boolean;
}

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