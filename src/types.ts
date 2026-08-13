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
}

export type TimeInMarket = 'menos_1' | '1_3' | '3_5' | '5_10' | 'mais_10';
export type EmployeesCount = '1_5' | '6_15' | '16_30' | '31_50' | 'mais_50';
export type TaxRegime = 'Simples Nacional' | 'Lucro Presumido' | 'Lucro Real' | 'MEI';

export interface GooglePlacesEvidence {
  name?: string;
  rating: number | null;
  userRatingsTotal: number | null;
  address?: string;
  status: string;
}

export interface NewsItemEvidence {
  title: string;
  source: string;
  date: string;
  link?: string;
  snippet?: string;
}

export interface EvidenceData {
  googlePlaces?: GooglePlacesEvidence | null;
  news?: NewsItemEvidence[];
  fetchedAt?: string;
}

export interface DiagnosticFormData {
  // Step 2: CNPJ
  cnpj: string;
  cnpjData: CompanyCNPJData | null;

  // Step 3 & 4: Objectives & Difficulties
  mainGoal: string;
  biggestDifficulty: string;

  // Step 5: Company details
  companyName: string;
  segment: string;
  cityState: string;
  timeInMarket: TimeInMarket;
  employeesCount: EmployeesCount;
  taxRegime: TaxRegime;

  // Step 6: Financial data
  monthlyRevenue: number;
  fixedCosts: number;
  variableCostsPercent: number;
  taxesPercent: number;
  ownerSalary: number;
  averageTicket: number;
  monthlyClients: number;

  // Step 7: Commercial data
  conversionRate: number;
  hasCRM: boolean;
  salesTeamSize: number;

  // Step 8-13: Self Evaluation (1 to 5)
  scoreFinanceiro: number;
  scoreComercial: number;
  scoreOperacao: number;
  scoreGestao: number;
  scorePessoas: number;
  scoreEstrategia: number;

  // Step 14-17: Key Strategic Questions (Yes/No)
  runsWithoutOwner30Days: boolean;
  knowsNetMargin: boolean;
  hasProjectedCashFlow: boolean;
  hasGrowthGoalsAndPlan: boolean;

  // Contato (capturado na etapa de Revisão, antes de processar)
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  consentGiven: boolean;

  // Evidence data
  evidenceData?: EvidenceData;
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

export interface ActionPlanPhase {
  phaseNumber: 1 | 2 | 3;
  title: string;
  period: string;
  goal: string;
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'Alta' | 'Média' | 'Normal';
    completed?: boolean;
  }>;
}

export interface ActionPlan90Days {
  phase1: ActionPlanPhase;
  phase2: ActionPlanPhase;
  phase3: ActionPlanPhase;
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
  aiGenerated: boolean;
  generatedAt: string;
  evidenceData?: EvidenceData;
}
