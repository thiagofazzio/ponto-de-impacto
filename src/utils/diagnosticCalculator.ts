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

export const AREA_DESCRIPTIONS: Record<string, { description: string; impact: string; immediateAction: string; impactoSimplificado?: string; acaoUrgente?: string }> = {
  Financeiro: {
    description: 'A empresa enfrenta fragilidades no controle de caixa, margem imprevisível ou risco de insolvência.',
    impact: 'Risco iminente de desabastecimento financeiro, falta de capital para investimentos e dependência de crédito bancário caro.',
    immediateAction: 'Mapear todos os custos fixos do próximo mês, revisar precificação e implantar DRE gerencial simplificado.',
    impactoSimplificado: 'Você pode estar perdendo R$ 10.000/mês por não saber exatamente para onde o dinheiro vai.',
    acaoUrgente: 'Pare de adivinhar. Liste todos os seus custos fixos hoje mesmo.',
  },
  Comercial: {
    description: 'O fluxo de novos clientes ou vendas é inconstante, dependendo excessivamente de indicações ou esforço direto dos sócios.',
    impact: 'Faturamento oscilante, vulnerabilidade a perda de clientes chave e estagnação da receita.',
    immediateAction: 'Implantar um funil de vendas visível, definir metas semanais de prospecção e padronizar o script comercial.',
    impactoSimplificado: 'Seu maior problema é que você não tem um processo de vendas. Você vende por "sorte", não por "sistema".',
    acaoUrgente: 'Crie um CRM hoje e comece a rastrear cada lead.',
  },
  Operacao: {
    description: 'A operação consome energia excessiva, apresenta gargalos de entrega, retrabalhos ou estouro de prazos.',
    impact: 'Aumento de custos ocultos, insatisfação de clientes, baixa margem operacional e dependência do dono apagando incêndios.',
    immediateAction: 'Mapear os 3 principais processos operacionais e criar Procedimentos Operacionais Padrão (POPs) visíveis.',
    impactoSimplificado: 'Sua operação é um "apaga incêndios" constante. Isso está matando sua margem.',
    acaoUrgente: 'Documente os 3 processos que mais dão dor de cabeça.',
  },
  Gestao: {
    description: 'Falta de indicadores estratégicos (KPIs), processos desestruturados e decisões tomadas por intuição sem dados.',
    impact: 'Perda de eficiência, desalinhamento da equipe e incapacidade de prever os resultados dos próximos meses.',
    immediateAction: 'Definir o Dashboard da Empresa com no máximo 5 indicadores vitais (Receita, Margem, CAC, Retenção, NPS).',
    impactoSimplificado: 'Você está voando no escuro. Sem dados, você não sabe o que funciona.',
    acaoUrgente: 'Defina os 5 números que você vai acompanhar toda semana.',
  },
  Pessoas: {
    description: 'A equipe apresenta alta rotatividade, baixa autonomia ou dificuldades de alinhamento e produtividade.',
    impact: 'Sobrecarga nos sócios, erros recorrentes em tarefas básicas e teto de crescimento por falta de liderança qualificada.',
    immediateAction: 'Alinhar papéis e responsabilidades claras (RACI) e realizar reuniões de alinhamento semanal de 30 min.',
    impactoSimplificado: 'Seu time não está alinhado. Você perde tempo e dinheiro com retrabalho.',
    acaoUrgente: 'Faça uma reunião de 30 minutos com sua equipe amanhã para alinhar as prioridades.',
  },
  Estrategia: {
    description: 'A empresa opera no piloto automático do dia a dia sem clareza de posicionamento, metas anuais e plano de expansão.',
    impact: 'Evolução lenta em mercado competitivo, desperdício de recursos em iniciativas sem foco e desalinhamento de sócios.',
    immediateAction: 'Definir a Meta Destino de 12 meses e desdobrar em 3 objetivos prioritários para o trimestre atual.',
    impactoSimplificado: 'Você não sabe para onde está indo. Sem destino, qualquer caminho serve, mas nenhum te leva longe.',
    acaoUrgente: 'Defina sua meta de faturamento para os próximos 12 meses. Escreva ela em um papel.',
  },
};

// ... (todo o resto do código permanece igual, só adicionei os novos campos acima)