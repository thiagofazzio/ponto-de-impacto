// ============================================================
// PONTO DE IMPACTO 2.0 - MAPA DE PERGUNTAS
// ============================================================

import { Pergunta, MapaPerguntas, CanalAquisicao, SetorAtuacao } from '../types';

// ============================================================
// 1. PERGUNTAS UNIVERSAIS (SEMPRE APARECEM)
// ============================================================

export const PERGUNTAS_UNIVERSAIS: Pergunta[] = [
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
      { value: 'marketplace', label: 'Marketplace / Plataforma', icon: '🏪' },
      { value: 'hibrido', label: 'Híbrido', icon: '🔀' },
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
      { value: 'educacao', label: 'Educação & Treinamento', icon: '📚' },
      { value: 'consultoria', label: 'Consultoria & Serviços', icon: '💼' },
      { value: 'varejo', label: 'Varejo & Comércio', icon: '🛍️' },
      { value: 'imobiliario', label: 'Imobiliário & Construção', icon: '🏗️' },
      { value: 'logistica', label: 'Logística & Transporte', icon: '🚚' },
      { value: 'entretenimento', label: 'Entretenimento & Mídia', icon: '🎬' },
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
      { value: 'reduzir_dependencia', label: 'Reduzir Dependência do Dono', icon: '🔄' },
      { value: 'outro', label: 'Outro objetivo', icon: '💡' },
    ],
    prioridade: 3,
    mapa: 'estrategia',
  },
  {
    id: 'horizonte',
    texto: 'Em quanto tempo você quer alcançar esse objetivo?',
    descricao: 'Isso ajuda a definir o ritmo das ações',
    tipo: 'select',
    opcoes: [
      { value: '6_meses', label: 'Até 6 meses' },
      { value: '12_meses', label: 'Até 1 ano' },
      { value: '24_meses', label: 'Até 2 anos' },
      { value: '36_meses', label: 'Até 3 anos' },
    ],
    prioridade: 4,
    mapa: 'estrategia',
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
    prioridade: 6,
    mapa: 'pessoas',
  },
];

// ============================================================
// 2. PERGUNTAS DA MÁQUINA DE RECEITA
// ============================================================

export const PERGUNTAS_RECEITA: Pergunta[] = [
  {
    id: 'canais_aquisicao',
    texto: 'Como sua empresa consegue novos clientes atualmente?',
    descricao: 'Selecione todos os canais que geram novos clientes',
    tipo: 'multiselect',
    opcoes: [
      { value: 'indicacao', label: 'Indicação de clientes', icon: '👥' },
      { value: 'clientes_recorrentes', label: 'Clientes recorrentes', icon: '🔄' },
      { value: 'instagram', label: 'Instagram', icon: '📸' },
      { value: 'facebook', label: 'Facebook', icon: '👍' },
      { value: 'google_ads', label: 'Google Ads', icon: '🔍' },
      { value: 'google_organico', label: 'Google Orgânico (SEO)', icon: '🌐' },
      { value: 'trafico_pago', label: 'Tráfego Pago', icon: '💰' },
      { value: 'conteudo', label: 'Marketing de Conteúdo', icon: '📝' },
      { value: 'marketplace', label: 'Marketplace', icon: '🏪' },
      { value: 'loja_fisica', label: 'Loja Física / Fluxo', icon: '🏬' },
      { value: 'vendedores', label: 'Vendedores / Equipe', icon: '🤝' },
      { value: 'prospeccao_ativa', label: 'Prospecção Ativa', icon: '🎯' },
      { value: 'parceiros', label: 'Parceiros / Indicações B2B', icon: '🤝' },
      { value: 'eventos', label: 'Eventos / Feiras', icon: '🎪' },
      { value: 'networking', label: 'Networking', icon: '🌐' },
      { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
      { value: 'outro', label: 'Outro canal', icon: '💡' },
    ],
    prioridade: 10,
    mapa: 'receita',
  },
  {
    id: 'percentual_canais',
    texto: 'Qual a distribuição percentual de cada canal?',
    descricao: 'A soma deve dar 100%',
    tipo: 'percentual',
    prioridade: 11,
    mapa: 'receita',
    condicao: (data) => data.canaisAquisicao && data.canaisAquisicao.length > 0,
  },
  {
    id: 'frequencia_compra',
    texto: 'Com que frequência seus clientes compram de vocês?',
    descricao: 'Média de compras por cliente por ano',
    tipo: 'select',
    opcoes: [
      { value: '1', label: '1 vez por ano' },
      { value: '2_3', label: '2 a 3 vezes por ano' },
      { value: '4_6', label: '4 a 6 vezes por ano' },
      { value: 'mensal', label: 'Todo mês' },
      { value: 'semanal', label: 'Toda semana' },
    ],
    prioridade: 13,
    mapa: 'receita',
  },
  {
    id: 'taxa_retencao',
    texto: 'Qual a sua taxa de retenção de clientes?',
    descricao: '% de clientes que continuam comprando depois de 12 meses (0% = nenhum, 100% = todos)',
    tipo: 'number',
    allowUnknown: true,
    prioridade: 14,
    mapa: 'receita',
  },
  {
    id: 'ciclo_venda_dias',
    texto: 'Quantos dias leva, em média, desde o primeiro contato até o fechamento da venda?',
    descricao: 'Considere o ciclo médio de vendas',
    tipo: 'select',
    opcoes: [
      { value: '1', label: 'Até 1 dia' },
      { value: '3', label: '3 dias' },
      { value: '7', label: '1 semana' },
      { value: '15', label: '15 dias' },
      { value: '30', label: '30 dias' },
      { value: '60', label: '60 dias' },
      { value: '90+', label: 'Mais de 90 dias' },
      { value: 'nao_tem_fluxo', label: 'Não tenho fluxo comercial ativo' },
    ],
    prioridade: 15,
    mapa: 'receita',
  },
];

// ============================================================
// 3. PERGUNTAS FINANCEIRAS
// ============================================================

export const PERGUNTAS_FINANCEIRAS: Pergunta[] = [
  {
    id: 'margem_liquida',
    texto: 'Qual a sua margem líquida atual?',
    descricao: 'Lucro líquido / Faturamento x 100 (ex: 15 = 15%). Se não souber, marque "Não sei".',
    tipo: 'number',
    allowUnknown: true,
    prioridade: 20,
    mapa: 'financeiro',
  },
  {
    id: 'capital_giro',
    texto: 'Qual o seu capital de giro disponível?',
    descricao: 'Recursos em caixa para financiar o dia a dia (R$). Se não souber, marque "Não sei".',
    tipo: 'number',
    allowUnknown: true,
    prioridade: 21,
    mapa: 'financeiro',
  },
  {
    id: 'prazo_recebimento',
    texto: 'Qual o prazo médio de recebimento dos clientes?',
    descricao: 'Em dias, desde a venda até o dinheiro cair na conta',
    tipo: 'select',
    opcoes: [
      { value: '0', label: 'Pagamento à vista' },
      { value: '15', label: '15 dias' },
      { value: '30', label: '30 dias' },
      { value: '45', label: '45 dias' },
      { value: '60', label: '60 dias' },
      { value: '90+', label: 'Mais de 90 dias' },
    ],
    prioridade: 22,
    mapa: 'financeiro',
  },
  {
    id: 'prazo_pagamento',
    texto: 'Qual o prazo médio de pagamento dos fornecedores?',
    descricao: 'Em dias, desde a compra até o pagamento',
    tipo: 'select',
    opcoes: [
      { value: '0', label: 'Pagamento à vista' },
      { value: '15', label: '15 dias' },
      { value: '30', label: '30 dias' },
      { value: '45', label: '45 dias' },
      { value: '60', label: '60 dias' },
      { value: '90+', label: 'Mais de 90 dias' },
    ],
    prioridade: 23,
    mapa: 'financeiro',
  },
  {
    id: 'tem_emprestimos',
    texto: 'A empresa possui empréstimos ou financiamentos ativos?',
    descricao: 'Considere dívidas bancárias ou com sócios',
    tipo: 'boolean',
    prioridade: 24,
    mapa: 'financeiro',
  },
];

// ============================================================
// 4. PERGUNTAS DE CAPACIDADE
// ============================================================

export const PERGUNTAS_CAPACIDADE: Pergunta[] = [
  {
    id: 'capacidade_producao',
    texto: 'Qual a sua capacidade atual de produção / entrega?',
    descricao: 'Se a demanda aumentasse hoje, quanto você conseguiria atender? (0% = não consigo atender mais, 100% = consigo dobrar)',
    tipo: 'range',
    allowUnknown: true,
    prioridade: 30,
    mapa: 'operacional',
  },
  {
    id: 'capacidade_atendimento',
    texto: 'Qual a sua capacidade de atendimento comercial?',
    descricao: 'Se os leads aumentassem, quantos sua equipe conseguiria atender? (0% = não consigo atender mais, 100% = consigo dobrar)',
    tipo: 'range',
    allowUnknown: true,
    prioridade: 31,
    mapa: 'comercial',
  },
  {
    id: 'capacidade_distribuicao',
    texto: 'Qual a sua capacidade de distribuição/entrega?',
    descricao: 'Se as vendas aumentassem, a entrega suportaria? (0% = não suporta mais, 100% = suporta o dobro)',
    tipo: 'range',
    allowUnknown: true,
    prioridade: 32,
    mapa: 'operacional',
  },
  {
    id: 'capacidade_financeira',
    texto: 'Qual a sua capacidade financeira para investir?',
    descricao: 'Quanto você conseguiria investir para crescer sem comprometer o caixa? (0% = nada, 100% = muito)',
    tipo: 'range',
    allowUnknown: true,
    prioridade: 33,
    mapa: 'financeiro',
  },
];

// ============================================================
// 5. PERGUNTAS DE DEPENDÊNCIA DO DONO
// ============================================================

export const PERGUNTAS_DEPENDENCIA: Pergunta[] = [
  {
    id: 'horas_dono_semana',
    texto: 'Quantas horas por semana você trabalha na empresa?',
    descricao: 'Média de horas dedicadas à empresa',
    tipo: 'select',
    opcoes: [
      { value: '20', label: 'Menos de 20 horas' },
      { value: '30', label: '20 a 30 horas' },
      { value: '40', label: '30 a 40 horas' },
      { value: '50', label: '40 a 50 horas' },
      { value: '60', label: '50 a 60 horas' },
      { value: '60+', label: 'Mais de 60 horas' },
    ],
    prioridade: 40,
    mapa: 'pessoas',
    condicao: (data) => data.objetivo_principal === 'trabalhar_menos' || data.objetivo_principal === 'reduzir_dependencia',
  },
  {
    id: 'tarefas_dono',
    texto: 'Quais dessas tarefas você ainda faz pessoalmente?',
    descricao: 'Selecione tudo que depende de você para acontecer',
    tipo: 'multiselect',
    opcoes: [
      { value: 'vendas', label: 'Vendas / Fechamento' },
      { value: 'producao', label: 'Produção / Entrega' },
      { value: 'financeiro', label: 'Financeiro / Contas' },
      { value: 'gestao', label: 'Gestão da equipe' },
      { value: 'marketing', label: 'Marketing / Aquisição' },
      { value: 'atendimento', label: 'Atendimento ao cliente' },
      { value: 'estrategia', label: 'Planejamento estratégico' },
    ],
    prioridade: 41,
    mapa: 'pessoas',
  },
  {
    id: 'funciona_sem_dono',
    texto: 'Sua empresa funcionaria normalmente se você tirasse 30 dias de férias?',
    descricao: 'Sem você, a operação continuaria fluindo?',
    tipo: 'boolean',
    prioridade: 42,
    mapa: 'pessoas',
  },
];

// ============================================================
// 6. PERGUNTAS DE OPERAÇÕES
// ============================================================

export const PERGUNTAS_OPERACOES: Pergunta[] = [
  {
    id: 'tem_terceirizados',
    texto: 'Sua empresa utiliza terceirizados ou prestadores de serviço?',
    descricao: 'Inclua freelancers, parceiros operacionais, etc.',
    tipo: 'boolean',
    prioridade: 50,
    mapa: 'operacional',
  },
  {
    id: 'gestao_operacional',
    texto: 'Quem é o responsável pela operação do dia a dia?',
    descricao: 'Quem toma as decisões operacionais?',
    tipo: 'select',
    opcoes: [
      { value: 'socio', label: 'O próprio sócio' },
      { value: 'gerente', label: 'Gerente / Coordenador' },
      { value: 'analista', label: 'Analista / Assistente' },
      { value: 'terceirizado', label: 'Empresa terceirizada' },
    ],
    prioridade: 51,
    mapa: 'operacional',
  },
];

// ============================================================
// 7. MAPAS DE PERGUNTAS POR CONTEXTO
// ============================================================

export const MAPAS: MapaPerguntas[] = [
  {
    id: 'mapa_base',
    nome: 'Mapa Base',
    descricao: 'Perguntas universais para todas as empresas',
    perguntas: PERGUNTAS_UNIVERSAIS,
  },
  {
    id: 'mapa_receita',
    nome: 'Máquina de Receita',
    descricao: 'Como a empresa gera e captura valor',
    perguntas: PERGUNTAS_RECEITA,
    condicao_ativacao: () => true, // 👈 SEMPRE ATIVO
  },
  {
    id: 'mapa_financeiro',
    nome: 'Mapa Financeiro',
    descricao: 'Saúde financeira e capital de giro',
    perguntas: PERGUNTAS_FINANCEIRAS,
    condicao_ativacao: () => true, // 👈 SEMPRE ATIVO
  },
  {
    id: 'mapa_capacidade',
    nome: 'Mapa de Capacidade',
    descricao: 'O que a empresa consegue suportar',
    perguntas: PERGUNTAS_CAPACIDADE,
    condicao_ativacao: (data) => data.objetivo_principal === 'crescer_faturamento' || data.objetivo_principal === 'expandir',
  },
  {
    id: 'mapa_dependencia',
    nome: 'Mapa de Dependência',
    descricao: 'Dependência do dono e estrutura de pessoas',
    perguntas: PERGUNTAS_DEPENDENCIA,
    condicao_ativacao: (data) => 
      data.objetivo_principal === 'trabalhar_menos' || 
      data.objetivo_principal === 'reduzir_dependencia' ||
      data.objetivo_principal === 'profissionalizar',
  },
  {
    id: 'mapa_operacoes',
    nome: 'Mapa de Operações',
    descricao: 'Estrutura operacional e processos',
    perguntas: PERGUNTAS_OPERACOES,
    condicao_ativacao: (data) => data.numero_colaboradores !== undefined && parseInt(data.numero_colaboradores) >= 6,
  },
];

// ============================================================
// 8. FUNÇÃO PARA SELECIONAR PERGUNTAS
// ============================================================

export function getPerguntasAtivas(data: any): Pergunta[] {
  const perguntas: Pergunta[] = [];
  const perguntasIds = new Set<string>();

  for (const mapa of MAPAS) {
    if (mapa.condicao_ativacao && !mapa.condicao_ativacao(data)) {
      continue;
    }

    for (const pergunta of mapa.perguntas) {
      if (perguntasIds.has(pergunta.id)) {
        continue;
      }

      if (pergunta.condicao && !pergunta.condicao(data)) {
        continue;
      }

      perguntasIds.add(pergunta.id);
      perguntas.push(pergunta);
    }
  }

  return perguntas.sort((a, b) => a.prioridade - b.prioridade);
}

// ============================================================
// 9. FUNÇÃO PARA ENCONTRAR A PRÓXIMA PERGUNTA
// ============================================================

export function getProximaPergunta(
  perguntas: Pergunta[],
  respostas: Record<string, any>
): Pergunta | null {
  for (const pergunta of perguntas) {
    if (respostas[pergunta.id] !== undefined && respostas[pergunta.id] !== null && respostas[pergunta.id] !== '') {
      continue;
    }

    if (pergunta.condicao && !pergunta.condicao(respostas)) {
      continue;
    }

    return pergunta;
  }

  return null;
}