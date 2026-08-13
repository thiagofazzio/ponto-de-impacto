var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_genai = require("@google/genai");

// src/utils/diagnosticCalculator.ts
var AREA_NAMES = {
  Financeiro: "Financeiro",
  Comercial: "Comercial",
  Operacao: "Opera\xE7\xE3o & Entrega",
  Gestao: "Gest\xE3o & Processos",
  Pessoas: "Pessoas & Lideran\xE7a",
  Estrategia: "Estrat\xE9gia & Vis\xE3o"
};
var AREA_DESCRIPTIONS = {
  Financeiro: {
    description: "A empresa enfrenta fragilidades no controle de caixa, margem imprevis\xEDvel ou risco de insolv\xEAncia.",
    impact: "Risco iminente de desabastecimento financeiro, falta de capital para investimentos e depend\xEAncia de cr\xE9dito banc\xE1rio caro.",
    immediateAction: "Mapear todos os custos fixos do pr\xF3ximo m\xEAs, revisar precifica\xE7\xE3o e implantar DRE gerencial simplificado."
  },
  Comercial: {
    description: "O fluxo de novos clientes ou vendas \xE9 inconstante, dependendo excessivamente de indica\xE7\xF5es ou esfor\xE7o direto dos s\xF3cios.",
    impact: "Faturamento oscilante, vulnerabilidade a perda de clientes chave e estagna\xE7\xE3o da receita.",
    immediateAction: "Implantar um funil de vendas vis\xEDvel, definir metas semanais de prospec\xE7\xE3o e padronizar o script comercial."
  },
  Operacao: {
    description: "A opera\xE7\xE3o consome energia excessiva, apresenta gargalos de entrega, retrabalhos ou estouro de prazos.",
    impact: "Aumento de custos ocultos, insatisfa\xE7\xE3o de clientes, baixa margem operacional e depend\xEAncia do dono apagando inc\xEAndios.",
    immediateAction: "Mapear os 3 principais processos operacionais e criar Procedimentos Operacionais Padr\xE3o (POPs) vis\xEDveis."
  },
  Gestao: {
    description: "Falta de indicadores estrat\xE9gicos (KPIs), processos desestruturados e decis\xF5es tomadas por intui\xE7\xE3o sem dados.",
    impact: "Perda de efici\xEAncia, desalinhamento da equipe e incapacidade de prever os resultados dos pr\xF3ximos meses.",
    immediateAction: "Definir o Dashboard da Empresa com no m\xE1ximo 5 indicadores vitais (Receita, Margem, CAC, Reten\xE7\xE3o, NPS)."
  },
  Pessoas: {
    description: "A equipe apresenta alta rotatividade, baixa autonomia ou dificuldades de alinhamento e produtividade.",
    impact: "Sobrecarga nos s\xF3cios, erros recorrentes em tarefas b\xE1sicas e teto de crescimento por falta de lideran\xE7a qualificada.",
    immediateAction: "Alinhar pap\xE9is e responsabilidades claras (RACI) e realizar reuni\xF5es de alinhamento semanal de 30 min."
  },
  Estrategia: {
    description: "A empresa opera no piloto autom\xE1tico do dia a dia sem clareza de posicionamento, metas anuais e plano de expans\xE3o.",
    impact: "Evolu\xE7\xE3o lenta em mercado competitivo, desperd\xEDcio de recursos em iniciativas sem foco e desalinhamento de s\xF3cios.",
    immediateAction: "Definir a Meta Destino de 12 meses e desdobrar em 3 objetivos priorit\xE1rios para o trimestre atual."
  }
};
function calculateBreakEven(data) {
  const monthlyRevenue = Math.max(1, data.monthlyRevenue || 1);
  const fixedCostsTotal = (data.fixedCosts || 0) + (data.ownerSalary || 0);
  const varPercent = Math.min(95, Math.max(0, data.variableCostsPercent || 0));
  const taxPercent = Math.min(95, Math.max(0, data.taxesPercent || 0));
  const totalVarTaxPercent = Math.min(98, varPercent + taxPercent);
  const contributionMarginPercent = Math.max(2, 100 - totalVarTaxPercent);
  const variableCostsTotal = monthlyRevenue * varPercent / 100;
  const taxesTotal = monthlyRevenue * taxPercent / 100;
  const breakEvenRevenue = Math.round(fixedCostsTotal / (contributionMarginPercent / 100));
  const breakEvenPercentage = Math.min(200, Math.round(breakEvenRevenue / monthlyRevenue * 100));
  const marginOfSafetyPercent = Math.round((monthlyRevenue - breakEvenRevenue) / monthlyRevenue * 100);
  const estimatedNetProfit = Math.round(monthlyRevenue * contributionMarginPercent / 100 - fixedCostsTotal);
  const estimatedNetMarginPercent = Math.round(estimatedNetProfit / monthlyRevenue * 100);
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
    breakEvenClientsNeeded
  };
}
function calculateAreaScores(data) {
  const keys = ["Financeiro", "Comercial", "Operacao", "Gestao", "Pessoas", "Estrategia"];
  const rawScores = {
    Financeiro: data.scoreFinanceiro || 1,
    Comercial: data.scoreComercial || 1,
    Operacao: data.scoreOperacao || 1,
    Gestao: data.scoreGestao || 1,
    Pessoas: data.scorePessoas || 1,
    Estrategia: data.scoreEstrategia || 1
  };
  const areaScores = {};
  keys.forEach((key) => {
    const raw = rawScores[key];
    let adjustedScore = raw * 2;
    if (key === "Financeiro") {
      if (data.knowsNetMargin) adjustedScore += 0.5;
      if (data.hasProjectedCashFlow) adjustedScore += 0.5;
    } else if (key === "Estrategia") {
      if (data.hasGrowthGoalsAndPlan) adjustedScore += 0.5;
      if (data.runsWithoutOwner30Days) adjustedScore += 0.5;
    } else if (key === "Gestao") {
      if (data.hasCRM) adjustedScore += 0.5;
      if (data.hasProjectedCashFlow) adjustedScore += 0.5;
    }
    const finalScore = Math.min(10, Math.max(1, Number(adjustedScore.toFixed(1))));
    let status = "Green";
    if (finalScore < 5.5) status = "Vermelho";
    else if (finalScore < 7.5) status = "Amarelo";
    else status = "Verde";
    areaScores[key] = {
      key,
      name: AREA_NAMES[key],
      score: finalScore,
      rawScore: raw,
      status,
      description: AREA_DESCRIPTIONS[key].description
    };
  });
  return areaScores;
}
function calculateClarityIndex(areaScores, data) {
  const scores = Object.values(areaScores).map((a) => a.score);
  const averageAreaScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  let strategicBonus = 0;
  if (data.runsWithoutOwner30Days) strategicBonus += 2.5;
  if (data.knowsNetMargin) strategicBonus += 2.5;
  if (data.hasProjectedCashFlow) strategicBonus += 2.5;
  if (data.hasGrowthGoalsAndPlan) strategicBonus += 2.5;
  const rawClarity = averageAreaScore * 9 + strategicBonus;
  const clarityIndex = Math.min(100, Math.max(10, Math.round(rawClarity)));
  let clarityStatus = "Aten\xE7\xE3o";
  let clarityDescription = "";
  if (clarityIndex < 45) {
    clarityStatus = "Cr\xEDtico";
    clarityDescription = "Sua empresa opera em alto risco operacional e financeiro. O crescimento est\xE1 travado por falta de previsibilidade, processos e margem de manobra.";
  } else if (clarityIndex < 68) {
    clarityStatus = "Aten\xE7\xE3o";
    clarityDescription = "A empresa tem um motor funcionando, por\xE9m consome muita energia dos s\xF3cios. Existem gargalos claros retendo o potencial de faturamento e escala.";
  } else if (clarityIndex < 85) {
    clarityStatus = "Saud\xE1vel";
    clarityDescription = "Sua empresa tem boa estrutura gerencial e financeira. O desafio agora \xE9 alinhar efici\xEAncia operacional e vendas para acelerar o crescimento sem perder qualidade.";
  } else {
    clarityStatus = "Excelente";
    clarityDescription = "Excelente n\xEDvel de maturidade empresarial. A empresa possui tra\xE7\xE3o, clareza financeira e autonomia. O foco deve ser expans\xE3o estrat\xE9gica e delega\xE7\xE3o.";
  }
  return { clarityIndex, clarityStatus, clarityDescription };
}
function identifyBottlenecks(areaScores) {
  const sorted = Object.values(areaScores).sort((a, b) => a.score - b.score);
  const primary = sorted[0];
  const secondary = sorted[1];
  const primaryBottleneck = {
    key: primary.key,
    name: primary.name,
    score: primary.score,
    description: AREA_DESCRIPTIONS[primary.key].description,
    impact: AREA_DESCRIPTIONS[primary.key].impact,
    immediateAction: AREA_DESCRIPTIONS[primary.key].immediateAction
  };
  const secondaryBottleneck = {
    key: secondary.key,
    name: secondary.name,
    score: secondary.score,
    description: AREA_DESCRIPTIONS[secondary.key].description,
    impact: AREA_DESCRIPTIONS[secondary.key].impact,
    immediateAction: AREA_DESCRIPTIONS[secondary.key].immediateAction
  };
  return { primaryBottleneck, secondaryBottleneck };
}
function generateActionPlan90Days(primaryKey, companyName, breakEven) {
  const name = companyName || "sua empresa";
  const defaultPlans = {
    Financeiro: {
      phase1: {
        phaseNumber: 1,
        title: "Estabiliza\xE7\xE3o de Caixa e Precifica\xE7\xE3o",
        period: "Dias 1 a 30",
        goal: "Saber exatamente para onde vai cada centavo e garantir margem de contribui\xE7\xE3o saud\xE1vel.",
        tasks: [
          {
            id: "f1-1",
            title: "Mapeamento Geral de Custos",
            description: "Listar todos os custos fixos, assinaturas, pr\xF3-labore e despesas recorrentes.",
            priority: "Alta"
          },
          {
            id: "f1-2",
            title: "Revis\xE3o de Precifica\xE7\xE3o",
            description: `Ajustar pre\xE7os para garantir margem de contribui\xE7\xE3o acima de ${Math.max(
              30,
              breakEven.contributionMarginPercent
            )}%.`,
            priority: "Alta"
          },
          {
            id: "f1-3",
            title: "Separa\xE7\xE3o de PF e PJ",
            description: "Fixar o valor exato do Pr\xF3-Labore dos s\xF3cios e proibir retiradas aleat\xF3rias no caixa da empresa.",
            priority: "Alta"
          }
        ]
      },
      phase2: {
        phaseNumber: 2,
        title: "Fluxo de Caixa Projetado e DRE",
        period: "Dias 31 a 60",
        goal: "Implantar rotina di\xE1ria de fluxo de caixa e relat\xF3rios de DRE mensal.",
        tasks: [
          {
            id: "f2-1",
            title: "Proje\xE7\xE3o de Caixa a 90 Dias",
            description: "Criar planilha ou sistema com previs\xE3o semanal de entradas e sa\xEDdas.",
            priority: "Alta"
          },
          {
            id: "f2-2",
            title: "Renegocia\xE7\xE3o de Fornecedores",
            description: "Revisar contratos com fornecedores buscando prazos maiores ou desconto para pagamento \xE0 vista.",
            priority: "M\xE9dia"
          },
          {
            id: "f2-3",
            title: "Cria\xE7\xE3o de Reserva Operacional",
            description: "Destinar de 5% a 10% do lucro mensal para construir reserva de emerg\xEAncia equivalente a 3 meses de custos fixos.",
            priority: "M\xE9dia"
          }
        ]
      },
      phase3: {
        phaseNumber: 3,
        title: "Gest\xE3o Or\xE7ament\xE1ria e Lucratividade",
        period: "Dias 61 a 90",
        goal: "Estabelecer or\xE7amento t\xE1tico por setor e metas de lucro l\xEDquido.",
        tasks: [
          {
            id: "f3-1",
            title: "Defini\xE7\xE3o de Teto Or\xE7ament\xE1rio",
            description: "Fixar limite m\xE1ximo de gastos por setor (marketing, opera\xE7\xE3o, administrativo).",
            priority: "M\xE9dia"
          },
          {
            id: "f3-2",
            title: "Pol\xEDtica de Distribui\xE7\xE3o de Lucros",
            description: "Criar regras claras para distribui\xE7\xE3o semestral de dividendos atreladas ao cumprimento de metas.",
            priority: "Normal"
          }
        ]
      }
    },
    Comercial: {
      phase1: {
        phaseNumber: 1,
        title: "Estrutura\xE7\xE3o do Funil de Vendas",
        period: "Dias 1 a 30",
        goal: "Tornar o processo de prospec\xE7\xE3o e vendas previs\xEDvel e rastre\xE1vel.",
        tasks: [
          {
            id: "c1-1",
            title: "Mapeamento do Processo Comercial",
            description: "Definir as etapas exatas do cliente: Prospec\xE7\xE3o -> Qualifica\xE7\xE3o -> Proposta -> Fechamento.",
            priority: "Alta"
          },
          {
            id: "c1-2",
            title: "Implementa\xE7\xE3o de CRM de Vendas",
            description: "Cadastrar todas as negocia\xE7\xF5es em um CRM (ex: Pipedrive, RD Station CRM ou HubSpot) e eliminar anota\xE7\xF5es soltas.",
            priority: "Alta"
          },
          {
            id: "c1-3",
            title: "Cria\xE7\xE3o da Oferta Irresist\xEDvel",
            description: "Refinar a proposta de valor destacando diferenciais claros e reduzindo a obje\xE7\xE3o de pre\xE7o.",
            priority: "Alta"
          }
        ]
      },
      phase2: {
        phaseNumber: 2,
        title: "Padroniza\xE7\xE3o de Abordagens e Metas",
        period: "Dias 31 a 60",
        goal: "Aumentar a taxa de convers\xE3o e criar cad\xEAncia ativa de prospec\xE7\xE3o.",
        tasks: [
          {
            id: "c2-1",
            title: "Script e Playbook de Vendas",
            description: "Documentar as principais obje\xE7\xF5es de clientes e criar respostas padr\xE3o testadas.",
            priority: "Alta"
          },
          {
            id: "c2-2",
            title: "Canal Ativo de Gera\xE7\xE3o de Leads",
            description: "Ativar campanhas no Google Ads/Meta Ads ou implementar prospec\xE7\xE3o ativa B2B.",
            priority: "M\xE9dia"
          },
          {
            id: "c2-3",
            title: "Rituais Di\xE1rios de Vendas",
            description: "Realizar reuni\xF5es di\xE1rias de 15 min (Daily) para acompanhar meta de contatos e propostas enviadas.",
            priority: "M\xE9dia"
          }
        ]
      },
      phase3: {
        phaseNumber: 3,
        title: "Acelera\xE7\xE3o de Ticket M\xE9dio e Recorr\xEAncia",
        period: "Dias 61 a 90",
        goal: "Maximizar o valor gerado por cada cliente existente e novos contratos.",
        tasks: [
          {
            id: "c3-1",
            title: "Estrat\xE9gia de Upsell e Cross-sell",
            description: "Criar pacotes complementares para oferecer aos clientes no momento da compra.",
            priority: "M\xE9dia"
          },
          {
            id: "c3-2",
            title: "Programa de Indica\xE7\xE3o Sistem\xE1tica",
            description: "Pedir indica\xE7\xF5es ativas a 100% dos clientes satisfeitos logo ap\xF3s o momento do contrato/entrega.",
            priority: "Normal"
          }
        ]
      }
    },
    Operacao: {
      phase1: {
        phaseNumber: 1,
        title: "Mapeamento de Gargalos de Entrega",
        period: "Dias 1 a 30",
        goal: "Identificar onde a opera\xE7\xE3o trava e reduz a margem de lucro.",
        tasks: [
          {
            id: "o1-1",
            title: "Mapeamento de Fluxo do Cliente",
            description: "Desenhar passo a passo desde o fechamento do contrato at\xE9 a entrega final.",
            priority: "Alta"
          },
          {
            id: "o1-2",
            title: "Cria\xE7\xE3o dos 5 POPs Cruciais",
            description: "Escrever Procedimentos Operacionais Padr\xE3o para as atividades mais frequentes.",
            priority: "Alta"
          },
          {
            id: "o1-3",
            title: "Redu\xE7\xE3o de Retrabalhos",
            description: "Identificar a causa raiz das 3 reclama\xE7\xF5es ou falhas mais recorrentes e eliminar a origem.",
            priority: "Alta"
          }
        ]
      },
      phase2: {
        phaseNumber: 2,
        title: "Automa\xE7\xE3o e Padr\xE3o de Qualidade",
        period: "Dias 31 a 60",
        goal: "Automatizar tarefas repetitivas e garantir entregas sem depend\xEAncia do dono.",
        tasks: [
          {
            id: "o2-1",
            title: "Implanta\xE7\xE3o de Gest\xE3o de Tarefas",
            description: "Centralizar entregas em ferramenta como Trello, Asana, Monday ou ClickUp.",
            priority: "Alta"
          },
          {
            id: "o2-2",
            title: "Automa\xE7\xE3o de Comunica\xE7\xE3o com Cliente",
            description: "Enviar confirma\xE7\xF5es, atualiza\xE7\xF5es de status e boletos de forma automatizada.",
            priority: "M\xE9dia"
          },
          {
            id: "o2-3",
            title: "Pesquisa de Satisfa\xE7\xE3o NPS",
            description: "Coletar nota de satisfa\xE7\xE3o de todos os clientes p\xF3s-entrega para identificar melhorias.",
            priority: "M\xE9dia"
          }
        ]
      },
      phase3: {
        phaseNumber: 3,
        title: "Ganho de Escala e Capacidade Operacional",
        period: "Dias 61 a 90",
        goal: "Aumentar a capacidade de atendimento sem necessidade de contratar proporcionalmente.",
        tasks: [
          {
            id: "o3-1",
            title: "Otimiza\xE7\xE3o de Prazos de Entrega",
            description: "Reduzir em 20% o tempo total de produ\xE7\xE3o ou presta\xE7\xE3o de servi\xE7o mantendo a qualidade.",
            priority: "M\xE9dia"
          },
          {
            id: "o3-2",
            title: "Gest\xE3o de Capacidade M\xE1xima",
            description: "Definir o teto saud\xE1vel de clientes atendidos simultaneamente por funcion\xE1rio/equipe.",
            priority: "Normal"
          }
        ]
      }
    },
    Gestao: {
      phase1: {
        phaseNumber: 1,
        title: "Painel de Indicadores da Empresa (KPIs)",
        period: "Dias 1 a 30",
        goal: "Substituir achismos por n\xFAmeros exatos no acompanhamento semanal da empresa.",
        tasks: [
          {
            id: "g1-1",
            title: "Defini\xE7\xE3o dos 5 KPIs Vitais",
            description: "Estabelecer os indicadores cruciais: Faturamento, Margem L\xEDquida, CAC, Vendas Novas e Reten\xE7\xE3o.",
            priority: "Alta"
          },
          {
            id: "g1-2",
            title: "Implementa\xE7\xE3o da Reuni\xE3o de Gest\xE3o Semanal",
            description: "Agendar reuni\xE3o fixa de 45 min toda segunda-feira para analisar indicadores com a lideran\xE7a.",
            priority: "Alta"
          },
          {
            id: "g1-3",
            title: "Matriz de Responsabilidades (RACI)",
            description: "Definir quem responde exatamente por qual \xE1rea e projeto dentro da empresa.",
            priority: "Alta"
          }
        ]
      },
      phase2: {
        phaseNumber: 2,
        title: "Alinhamento T\xE1tico e Rotinas Gerenciais",
        period: "Dias 31 a 60",
        goal: "Desdobrar a estrat\xE9gia do ano em planos de a\xE7\xE3o individuais.",
        tasks: [
          {
            id: "g2-1",
            title: "Plano de Metas Trimestrais (OKRs)",
            description: "Definir 3 objetivos estrat\xE9gicos para os pr\xF3ximos 90 dias com metas mensur\xE1veis.",
            priority: "Alta"
          },
          {
            id: "g2-2",
            title: "Centraliza\xE7\xE3o de Informa\xE7\xF5es e Documentos",
            description: "Criar wiki/drive organizado com senhas, relat\xF3rios e processos acess\xEDveis.",
            priority: "M\xE9dia"
          },
          {
            id: "g2-3",
            title: "Auditoria Mensal de Resultados",
            description: "Revisar mensalmente o desvio entre o planejado vs executado.",
            priority: "M\xE9dia"
          }
        ]
      },
      phase3: {
        phaseNumber: 3,
        title: "Sistemas de Governo Corporativo Inicial",
        period: "Dias 61 a 90",
        goal: "Garantir gest\xE3o profissional s\xF3lida capaz de suportar novos investimentos.",
        tasks: [
          {
            id: "g3-1",
            title: "Conselho Consultivo Mensal",
            description: "Realizar reuni\xE3o formal com mentores ou s\xF3cios para revis\xE3o de direcionamento estrat\xE9gico.",
            priority: "M\xE9dia"
          },
          {
            id: "g3-2",
            title: "Manual da Cultura e Regimento Interno",
            description: "Documentar os valores, c\xF3digo de conduta e diretrizes da empresa para novos colaboradores.",
            priority: "Normal"
          }
        ]
      }
    },
    Pessoas: {
      phase1: {
        phaseNumber: 1,
        title: "Clareza de Pap\xE9is e Alinhamento de Expectativas",
        period: "Dias 1 a 30",
        goal: "Garantir que cada colaborador saiba exatamente o que \xE9 esperado do seu trabalho.",
        tasks: [
          {
            id: "p1-1",
            title: "Descritivos de Cargo Atualizados",
            description: "Documentar as atribui\xE7\xF5es, metas e entreg\xE1veis de 100% da equipe.",
            priority: "Alta"
          },
          {
            id: "p1-2",
            title: "Alinhamento Individual (1on1)",
            description: "Realizar conversa individual de 30 minutos com cada liderado para escutar dores e alinhar expectativas.",
            priority: "Alta"
          },
          {
            id: "p1-3",
            title: "Ajuste de Sal\xE1rios e Vari\xE1vel B\xE1sica",
            description: "Adequar a remunera\xE7\xE3o ao mercado e criar comissionamento transparente focado em resultados.",
            priority: "Alta"
          }
        ]
      },
      phase2: {
        phaseNumber: 2,
        title: "Forma\xE7\xE3o de Lideran\xE7as e Treinamento",
        period: "Dias 31 a 60",
        goal: "Capacitar a equipe para resolver problemas sem demandar interven\xE7\xE3o do dono.",
        tasks: [
          {
            id: "p2-1",
            title: "Plano de Integra\xE7\xE3o (Onboarding)",
            description: "Criar roteiro de 7 dias para novos contratados aprenderem a cultura e os processos.",
            priority: "Alta"
          },
          {
            id: "p2-2",
            title: "Trilha de Treinamento T\xE9cnico",
            description: "Implementar sess\xE3o quinzenal de treinamento pr\xE1tico de ferramentas e t\xE9cnicas de trabalho.",
            priority: "M\xE9dia"
          },
          {
            id: "p2-3",
            title: "Delega\xE7\xE3o Orientada por N\xEDveis",
            description: "Transferir formalmente 3 tarefas operacionais dos s\xF3cios para os l\xEDderes de setor.",
            priority: "M\xE9dia"
          }
        ]
      },
      phase3: {
        phaseNumber: 3,
        title: "Reten\xE7\xE3o de Talentos e Desempenho",
        period: "Dias 61 a 90",
        goal: "Criar ambiente meritocr\xE1tico e de alto rendimento.",
        tasks: [
          {
            id: "p3-1",
            title: "Avalia\xE7\xE3o de Desempenho Trimestral",
            description: "Avaliar compet\xEAncias t\xE9cnicas e comportamentais com devolutiva estruturada (Feedback).",
            priority: "M\xE9dia"
          },
          {
            id: "p3-2",
            title: "Plano de Carreira e Crescimento",
            description: "Apresentar aos destaques os crit\xE9rios para futuras promo\xE7\xF5es e b\xF4nus.",
            priority: "Normal"
          }
        ]
      }
    },
    Estrategia: {
      phase1: {
        phaseNumber: 1,
        title: "Vis\xE3o de Futuro e Posicionamento de Mercado",
        period: "Dias 1 a 30",
        goal: "Clarificar a vis\xE3o de 12 a 36 meses e a proposta de valor \xFAnica frente aos concorrentes.",
        tasks: [
          {
            id: "e1-1",
            title: "Defini\xE7\xE3o das Metas Anuais",
            description: "Fixar metas de faturamento, margem e n\xFAmero de clientes para o ano.",
            priority: "Alta"
          },
          {
            id: "e1-2",
            title: "Pesquisa com Clientes Atuais",
            description: "Entrevistar os 10 melhores clientes para entender por que escolheram a empresa e o que mais valorizam.",
            priority: "Alta"
          },
          {
            id: "e1-3",
            title: "An\xE1lise de Nicho e Especializa\xE7\xE3o",
            description: "Focar na solu\xE7\xE3o do problema mais lucrativo e com menor concorr\xEAncia direta.",
            priority: "Alta"
          }
        ]
      },
      phase2: {
        phaseNumber: 2,
        title: "Desdobramento Estrat\xE9gico em Projetos",
        period: "Dias 31 a 60",
        goal: "Transformar metas gerais em projetos com prazo, or\xE7amento e dono.",
        tasks: [
          {
            id: "e2-1",
            title: "Mapeamento de Motores de Crescimento",
            description: "Identificar quais canais (vendas diretas, parcerias, marketing digital) trar\xE3o 80% dos resultados.",
            priority: "Alta"
          },
          {
            id: "e2-2",
            title: "Comit\xEA de Inova\xE7\xE3o e Novos Produtos",
            description: "Desenvolver ou empacotar novos servi\xE7os de maior margem para a base atual de clientes.",
            priority: "M\xE9dia"
          },
          {
            id: "e2-3",
            title: "Desconex\xE3o Progressiva do Operacional",
            description: "Bloquear 2 tardes por semana na agenda do empres\xE1rio exclusivamente para planejamento e reuni\xF5es estrat\xE9gicas.",
            priority: "M\xE9dia"
          }
        ]
      },
      phase3: {
        phaseNumber: 3,
        title: "Autonomia Empresarial e Escala",
        period: "Dias 61 a 90",
        goal: "Preparar a empresa para operar com efici\xEAncia independente da presen\xE7a f\xEDsica do s\xF3cio.",
        tasks: [
          {
            id: "e3-1",
            title: "Teste de Autonomia de 7 Dias",
            description: "Empres\xE1rio se ausenta das rotinas di\xE1rias operacionais por 1 semana inteira para testar a resili\xEAncia dos processos.",
            priority: "M\xE9dia"
          },
          {
            id: "e3-2",
            title: "Plano de Expans\xE3o e Investimentos",
            description: "Reinvestir os lucros acumulados na amplia\xE7\xE3o do canal comercial e contrata\xE7\xE3o de talentos chave.",
            priority: "Normal"
          }
        ]
      }
    }
  };
  return defaultPlans[primaryKey] || defaultPlans["Financeiro"];
}
function generateTextualDiagnosis(data, clarityIndex, clarityStatus, primaryBottleneck, secondaryBottleneck, breakEven) {
  const company = data.companyName || (data.cnpjData?.razaoSocial ?? "Sua empresa");
  const segment = data.segment || (data.cnpjData?.cnaeDescricao ?? "Mercado de atua\xE7\xE3o");
  const formattedRevenue = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    data.monthlyRevenue || 0
  );
  const formattedBreakEven = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    breakEven.breakEvenRevenue
  );
  const formattedNetProfit = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    breakEven.estimatedNetProfit
  );
  const executiveSummary = `A empresa **${company}** (${segment}) apresenta atualmente um **\xCDndice de Clareza de ${clarityIndex}/100** (Classifica\xE7\xE3o: **${clarityStatus}**). O faturamento mensal de **${formattedRevenue}** exige um **Ponto de Equil\xEDbrio (Break-Even) de ${formattedBreakEven}** para cobrir todos os custos fixos (${breakEven.breakEvenPercentage}% da receita atual). A margem de contribui\xE7\xE3o m\xE9dia calculada \xE9 de **${breakEven.contributionMarginPercent}%**, resultando em um lucro l\xEDquido estimado em **${formattedNetProfit}** (${breakEven.estimatedNetMarginPercent}% de margem l\xEDquida).`;
  const textualDiagnosis = `Com base nas respostas fornecidas, o principal gargalo retendo o crescimento acelerado da **${company}** \xE9 a \xE1rea de **${primaryBottleneck.name}** (Nota: ${primaryBottleneck.score}/10). ${primaryBottleneck.description}

Al\xE9m disso, identificou-se como segundo ponto de aten\xE7\xE3o a \xE1rea de **${secondaryBottleneck.name}** (Nota: ${secondaryBottleneck.score}/10). A combina\xE7\xE3o desses dois gargalos cria uma fric\xE7\xE3o onde o empres\xE1rio investe alto volume de tempo e energia sem obter o retorno financeiro e a previsibilidade condizentes. Para reverter esse cen\xE1rio, a prioridade m\xE1xima para os pr\xF3ximos 90 dias deve ser a execu\xE7\xE3o do Plano de A\xE7\xE3o focado em **${primaryBottleneck.name}**, eliminando o desperd\xEDcio de margem e estabilizando a opera\xE7\xE3o.`;
  const strategicRecommendations = [
    `Atingir a Margem de Seguran\xE7a recomendada de pelo menos 25% acima do Break-Even (atualmente necessita de **${breakEven.breakEvenClientsNeeded} clientes/m\xEAs** com ticket m\xE9dio de R$ ${data.averageTicket}).`,
    `Atacar imediatamente o gargalo de **${primaryBottleneck.name}**: ${primaryBottleneck.immediateAction}`,
    `Formalizar rotinas de acompanhamento financeiro e comercial semanal, garantindo previsibilidade de caixa e CRM ativo.`,
    `Desenvolver autonomia da equipe para permitir que os s\xF3cios foquem na expans\xE3o estrat\xE9gica e n\xE3o apenas em resolver problemas do dia a dia.`
  ];
  return {
    textualDiagnosis,
    executiveSummary,
    strategicRecommendations
  };
}
function generateFullDiagnostic(data) {
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
  return {
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
    generatedAt: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}

// server.ts
var DATA_DIR = import_path.default.join(process.cwd(), "data");
var LEADS_FILE = import_path.default.join(DATA_DIR, "leads.jsonl");
console.log("\u{1F511} GOOGLE_PLACES_API_KEY:", process.env.GOOGLE_PLACES_API_KEY ? "\u2705 Configurada" : "\u274C N\xE3o configurada");
console.log("\u{1F511} GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "\u2705 Configurada" : "\u274C N\xE3o configurada");
function registrarLead(formData, result) {
  try {
    if (!import_fs.default.existsSync(DATA_DIR)) import_fs.default.mkdirSync(DATA_DIR, { recursive: true });
    const record = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      nome: formData.contactName || "",
      email: formData.contactEmail || "",
      telefone: formData.contactPhone || "",
      consentimento: !!formData.consentGiven,
      empresa: formData.companyName || formData.cnpjData?.razaoSocial || "",
      cnpj: formData.cnpj || "",
      segmento: formData.segment || "",
      cidade: formData.cityState || "",
      faturamentoMensal: formData.monthlyRevenue ?? null,
      indiceClareza: result?.clarityIndex ?? null,
      gargaloPrincipal: result?.primaryBottleneck?.name ?? null,
      gargaloSecundario: result?.secondaryBottleneck?.name ?? null,
      objetivoPrincipal: formData.mainGoal || "",
      maiorDificuldade: formData.biggestDifficulty || ""
    };
    import_fs.default.appendFileSync(LEADS_FILE, JSON.stringify(record) + "\n");
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
      }).catch((err) => console.warn("Falha ao enviar lead pro webhook:", err));
    }
  } catch (err) {
    console.error("Falha ao registrar lead:", err);
  }
}
async function fetchGooglePlacesEvidence(query) {
  if (!query) return { rating: null, userRatingsTotal: null, status: "not_found" };
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  console.log("\u{1F50D} Google Places - Query:", query);
  console.log("\u{1F511} API Key usada:", apiKey ? apiKey.substring(0, 10) + "..." : "\u274C NENHUMA");
  if (!apiKey) return { rating: null, userRatingsTotal: null, status: "no_api_key" };
  try {
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,rating,user_ratings_total,formatted_address&key=${apiKey}`;
    const findRes = await fetch(findUrl);
    if (!findRes.ok) return { rating: null, userRatingsTotal: null, status: "error" };
    const findData = await findRes.json();
    if (findData.candidates && findData.candidates.length > 0) {
      const place = findData.candidates[0];
      if (place.rating !== void 0) {
        return { name: place.name, rating: place.rating, userRatingsTotal: place.user_ratings_total || 0, address: place.formatted_address, status: "success" };
      }
      if (place.place_id) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,formatted_address&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          if (detailsData.result) {
            return { name: detailsData.result.name, rating: detailsData.result.rating || null, userRatingsTotal: detailsData.result.user_ratings_total || 0, address: detailsData.result.formatted_address || "", status: "success" };
          }
        }
      }
    }
    return { rating: null, userRatingsTotal: null, status: "not_found" };
  } catch (err) {
    console.warn("Google Places fetch failed:", err.message);
    return { rating: null, userRatingsTotal: null, status: "error" };
  }
}
async function fetchNewsEvidence(query) {
  if (!query) return [];
  const serpApiKey = process.env.SERP_API_KEY;
  if (serpApiKey) {
    try {
      const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&tbm=nws&hl=pt-br&gl=br&api_key=${serpApiKey}`;
      const serpRes = await fetch(serpUrl);
      if (serpRes.ok) {
        const serpData = await serpRes.json();
        if (serpData.news_results && Array.isArray(serpData.news_results)) {
          return serpData.news_results.slice(0, 5).map((item) => ({ title: item.title, source: item.source || "Not\xEDcias", date: item.date || "Recente", link: item.link, snippet: item.snippet }));
        }
      }
    } catch (serpErr) {
      console.warn("SerpAPI fetch error, using Google News RSS fallback:", serpErr);
    }
  }
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const rssRes = await fetch(rssUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (rssRes.ok) {
      const xmlText = await rssRes.text();
      const itemRegex = /<item>[\s\S]*?<\/item>/gi;
      const matches = xmlText.match(itemRegex) || [];
      return matches.slice(0, 5).map((itemXml) => {
        const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/i);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
        const sourceMatch = itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
        let title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1") : "Men\xE7\xE3o na Imprensa";
        title = title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        let source = sourceMatch ? sourceMatch[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1") : "Google News";
        let rawDate = pubDateMatch ? pubDateMatch[1] : "";
        let dateStr = rawDate ? new Date(rawDate).toLocaleDateString("pt-BR") : "Recente";
        return { title, source, date: dateStr, link: linkMatch ? linkMatch[1] : "" };
      });
    }
  } catch (rssErr) {
    console.warn("Google News RSS parse failed:", rssErr);
  }
  return [];
}
async function getEvidenceData(companyName, cityState) {
  const queryPlaces = `${companyName} ${cityState}`.trim();
  const queryNews = companyName.trim();
  const [googlePlaces, news] = await Promise.all([fetchGooglePlacesEvidence(queryPlaces), fetchNewsEvidence(queryNews)]);
  return { googlePlaces, news, fetchedAt: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR") };
}
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = process.env.PORT || 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Ponto de Impacto Diagnostic API (TFAZZIO)", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/api/cnpj/:cnpj", async (req, res) => {
    try {
      const cleanCnpj = req.params.cnpj.replace(/\D/g, "");
      if (cleanCnpj.length !== 14) return res.status(400).json({ error: "CNPJ inv\xE1lido. Deve conter 14 d\xEDgitos." });
      let data = null;
      let source = "brasilapi";
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        if (response.ok) data = await response.json();
      } catch (e) {
        console.warn("BrasilAPI fetch failed, trying fallback...");
      }
      if (!data) {
        try {
          const fallbackRes = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
          if (fallbackRes.ok) {
            const raw = await fallbackRes.json();
            source = "cnpj.ws";
            data = {
              cnpj: cleanCnpj,
              razao_social: raw.razao_social,
              nome_fantasia: raw.estabelecimento?.nome_fantasia || raw.razao_social,
              porte: raw.porte?.descricao || "PME",
              cnae_fiscal: raw.estabelecimento?.atividade_principal?.id,
              cnae_fiscal_descricao: raw.estabelecimento?.atividade_principal?.descricao,
              logradouro: `${raw.estabelecimento?.tipo_logradouro || ""} ${raw.estabelecimento?.logradouro || ""}`.trim(),
              municipio: raw.estabelecimento?.cidade?.nome,
              uf: raw.estabelecimento?.estado?.sigla,
              descricao_situacao_cadastral: raw.estabelecimento?.situacao_cadastral,
              capital_social: raw.capital_social,
              data_inicio_atividade: raw.estabelecimento?.data_inicio_atividade
            };
          }
        } catch (e) {
          console.warn("Fallback CNPJ fetch failed too");
        }
      }
      if (!data) return res.status(444).json({ error: "N\xE3o foi poss\xEDvel obter dados autom\xE1ticos do CNPJ nas bases p\xFAblicas. Voc\xEA pode preencher os dados manualmente." });
      const formattedCompany = {
        cnpj: cleanCnpj,
        razaoSocial: data.razao_social || data.nome || "Raz\xE3o Social n\xE3o informada",
        nomeFantasia: data.nome_fantasia || data.fantasia || data.razao_social || "Nome Fantasia n\xE3o informado",
        porte: data.porte || "PME",
        cnaeCodigo: String(data.cnae_fiscal || data.cnae_fiscal_principal || ""),
        cnaeDescricao: data.cnae_fiscal_descricao || data.cnae_fiscal_principal_descricao || "Atividade principal",
        logradouro: data.logradouro || "",
        municipio: data.municipio || data.cidade || "",
        uf: data.uf || data.estado || "",
        situacaoCadastral: data.descricao_situacao_cadastral || "Ativa",
        capitalSocial: Number(data.capital_social || 0),
        dataAbertura: data.data_inicio_atividade || data.data_abertura || "",
        source
      };
      return res.json(formattedCompany);
    } catch (error) {
      console.error("Error fetching CNPJ:", error);
      return res.status(500).json({ error: "Erro ao consultar CNPJ", details: error.message });
    }
  });
  app.get("/api/google-places", async (req, res) => {
    try {
      return res.json(await fetchGooglePlacesEvidence(String(req.query.query || req.query.q || "").trim()));
    } catch (err) {
      return res.json({ rating: null, userRatingsTotal: null, status: "error" });
    }
  });
  app.get("/api/google-places/:query", async (req, res) => {
    try {
      return res.json(await fetchGooglePlacesEvidence(String(req.params.query || "").trim()));
    } catch (err) {
      return res.json({ rating: null, userRatingsTotal: null, status: "error" });
    }
  });
  app.get("/api/news", async (req, res) => {
    try {
      return res.json({ news: await fetchNewsEvidence(String(req.query.query || req.query.q || "").trim()) });
    } catch (err) {
      return res.json({ news: [] });
    }
  });
  app.post("/api/diagnostico/calcular", async (req, res) => {
    try {
      const formData = req.body;
      const baseResult = generateFullDiagnostic(formData);
      const companyName = formData.companyName || formData.cnpjData?.razaoSocial || "";
      const evidence = await getEvidenceData(companyName, formData.cityState || "");
      const result = { ...baseResult, evidenceData: evidence };
      registrarLead(formData, result);
      return res.json(result);
    } catch (error) {
      console.error("Error calculating diagnostic:", error);
      return res.status(500).json({ error: "Erro ao processar diagn\xF3stico", details: error.message });
    }
  });
  app.post("/api/diagnostico/ia-gerar", async (req, res) => {
    const formData = req.body;
    const baseResult = generateFullDiagnostic(formData);
    const companyName = formData.companyName || formData.cnpjData?.razaoSocial || "";
    const evidencePromise = getEvidenceData(companyName, formData.cityState || "");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const evidence = await evidencePromise;
      const result = { ...baseResult, evidenceData: evidence };
      registrarLead(formData, result);
      return res.json(result);
    }
    try {
      const ai = new import_genai.GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
      const breakEven = baseResult.breakEven;
      const prompt = `Voc\xEA \xE9 um consultor empresarial executivo s\xEAnior do grupo TFAZZIO, especialista em reestrutura\xE7\xE3o e acelera\xE7\xE3o de PMEs brasileiras.
Analise os dados reais do diagn\xF3stico empresarial "Ponto de Impacto" para a seguinte empresa:
DADOS DA EMPRESA:
- Raz\xE3o Social/Nome: ${formData.companyName || formData.cnpjData?.razaoSocial || "Empresa PME"}
- CNPJ: ${formData.cnpj || "N\xE3o informado"}
- Porte / CNAE: ${formData.cnpjData?.porte || "PME"} - ${formData.cnpjData?.cnaeDescricao || formData.segment}
- Segmento: ${formData.segment} | Tempo no Mercado: ${formData.timeInMarket} | Funcion\xE1rios: ${formData.employeesCount} | Regime: ${formData.taxRegime}
DADOS FINANCEIROS:
- Faturamento Mensal: R$ ${formData.monthlyRevenue} | Custos Fixos Totais: R$ ${breakEven.fixedCostsTotal}
- Break-Even: R$ ${breakEven.breakEvenRevenue} (${breakEven.breakEvenPercentage}%) | Margem de Contribui\xE7\xE3o: ${breakEven.contributionMarginPercent}%
- Lucro L\xEDquido Estimado: R$ ${breakEven.estimatedNetProfit} (${breakEven.estimatedNetMarginPercent}%)
GARGALOS: Principal: ${baseResult.primaryBottleneck.name} (${baseResult.primaryBottleneck.score}) | Secund\xE1rio: ${baseResult.secondaryBottleneck.name} (${baseResult.secondaryBottleneck.score})
Objetivo: "${formData.mainGoal || "Expandir de forma estruturada"}" | Dificuldade: "${formData.biggestDifficulty || "Gargalo operacional"}"
TAREFA: Gere uma an\xE1lise executiva curta e personalizada em JSON: {"executiveSummary": "...", "textualDiagnosis": "...", "strategicRecommendations": ["...","...","...","..."]}. Responda APENAS em JSON v\xE1lido em portugu\xEAs do Brasil.`;
      const response = await ai.models.generateContent({ model: "gemini-3.6-flash", contents: prompt, config: { responseMimeType: "application/json", temperature: 0.7 } });
      const responseText = response.text || "";
      const evidence = await evidencePromise;
      try {
        const aiParsed = JSON.parse(responseText.trim());
        const mergedResult = { ...baseResult, executiveSummary: aiParsed.executiveSummary || baseResult.executiveSummary, textualDiagnosis: aiParsed.textualDiagnosis || baseResult.textualDiagnosis, strategicRecommendations: aiParsed.strategicRecommendations || baseResult.strategicRecommendations, aiGenerated: true, evidenceData: evidence };
        registrarLead(formData, mergedResult);
        return res.json(mergedResult);
      } catch (pErr) {
        const fallbackResult = { ...baseResult, evidenceData: evidence };
        registrarLead(formData, fallbackResult);
        return res.json(fallbackResult);
      }
    } catch (aiErr) {
      console.error("Gemini API call failed:", aiErr);
      const evidence = await evidencePromise;
      const fallbackResult = { ...baseResult, evidenceData: evidence };
      registrarLead(formData, fallbackResult);
      return res.json(fallbackResult);
    }
  });
  app.get("/api/admin/leads", (req, res) => {
    console.log("\u{1F50D} Token recebido:", req.query.token);
    console.log("\u{1F50D} Token esperado (ADMIN_TOKEN):", process.env.ADMIN_TOKEN);
    const token = String(req.query.token || "");
    if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
      console.log("\u274C Token inv\xE1lido!");
      return res.status(401).json({ error: "N\xE3o autorizado" });
    }
    console.log("\u2705 Token v\xE1lido!");
    try {
      if (!import_fs.default.existsSync(LEADS_FILE)) return res.json({ count: 0, leads: [] });
      const lines = import_fs.default.readFileSync(LEADS_FILE, "utf-8").trim().split("\n").filter(Boolean);
      const leads = lines.map((l) => JSON.parse(l));
      return res.json({ count: leads.length, leads });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  const distPath = import_path.default.join(process.cwd(), "dist");
  app.use(import_express.default.static(distPath));
  app.get("*", (req, res) => {
    const indexPath = import_path.default.join(distPath, "index.html");
    if (import_fs.default.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Arquivo index.html n\xE3o encontrado. Rode npm run build primeiro.");
    }
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server "Ponto de Impacto (TFAZZIO)" running on http://0.0.0.0:${PORT}`);
    console.log("\u2705 Google Places:", process.env.GOOGLE_PLACES_API_KEY ? "Configurada" : "\u274C N\xE3o configurada");
    console.log("\u2705 Gemini:", process.env.GEMINI_API_KEY ? "Configurada" : "\u274C N\xE3o configurada");
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
