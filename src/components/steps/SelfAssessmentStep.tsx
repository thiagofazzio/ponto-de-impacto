import React from 'react';
import { AlertCircle, CheckCircle2, TrendingUp, AlertTriangle, HelpCircle } from 'lucide-react';

interface SelfAssessmentStepProps {
  areaKey: string;
  areaTitle: string;
  stepNumber: number;
  currentValue: number;
  onSelect: (val: number) => void;
}

const LEVEL_CONFIG: Record<number, { color: string; bg: string; border: string; icon: React.ReactNode; label: string }> = {
  1: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    label: 'Crítico',
  },
  2: {
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    label: 'Atenção',
  },
  3: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: <HelpCircle className="w-5 h-5 text-yellow-600" />,
    label: 'Regular',
  },
  4: {
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
    label: 'Bom',
  },
  5: {
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    label: 'Excelente',
  },
};

const AREA_GUIDES: Record<string, { subtitle: string; levels: Record<number, { title: string; desc: string }> }> = {
  Financeiro: {
    subtitle: 'Avalie a saúde financeira, clareza de caixa, precificação e controle de margem.',
    levels: {
      1: { title: 'Crítico', desc: 'Sem controle de caixa. Misturamos contas PF/PJ e não sabemos se há lucro.' },
      2: { title: 'Inconstante', desc: 'Anotamos entradas e saídas em planilha, mas precificação é chutada e caixa vive apertado.' },
      3: { title: 'Regular', desc: 'Controle financeiro básico funcional, pagamos contas em dia, mas falta DRE.' },
      4: { title: 'Bom', desc: 'Previsão de caixa, DRE mensal organizada, pró-labore definido e margem saudável.' },
      5: { title: 'Excelente', desc: 'Caixa previsível com reserva de 3+ meses, margem alta e orçamento por setores.' },
    },
  },
  Comercial: {
    subtitle: 'Avalie a atração de clientes, previsibilidade de vendas e funil comercial.',
    levels: {
      1: { title: 'Crítico', desc: 'Sem processo comercial. Vendas por indicação sem previsibilidade.' },
      2: { title: 'Inconstante', desc: 'Tentamos vender de vez em quando, mas sem metas nem funil claro.' },
      3: { title: 'Regular', desc: 'Fluxo mínimo de contatos, mas taxa de fechamento varia sem CRM.' },
      4: { title: 'Bom', desc: 'Processo padronizado com CRM, metas semanais e vendedores treinados.' },
      5: { title: 'Excelente', desc: 'Máquina de vendas com atração previsível, playbook e cadência automatizada.' },
    },
  },
  Operacao: {
    subtitle: 'Avalie a capacidade de entrega, padrão de qualidade, prazos e erros.',
    levels: {
      1: { title: 'Crítico', desc: 'Operação depende 100% dos sócios. Erros e atrasos frequentes.' },
      2: { title: 'Inconstante', desc: 'Entregamos, mas equipe vive no limite e ocorrem muitos retrabalhos.' },
      3: { title: 'Regular', desc: 'Entregas em dia, mas sem POPs. Se alguém falta, gera travamento.' },
      4: { title: 'Bom', desc: 'Processos mapeados com POPs, baixo índice de erros e gestão de tarefas.' },
      5: { title: 'Excelente', desc: 'Operação autônoma, rápida e com alto padrão de qualidade.' },
    },
  },
  Gestao: {
    subtitle: 'Avalie os indicadores (KPIs), rotinas de acompanhamento e sistemas da empresa.',
    levels: {
      1: { title: 'Crítico', desc: 'Decisões por intuição. Não medimos nenhum KPI.' },
      2: { title: 'Inconstante', desc: 'Acompanhamos apenas faturamento bruto, sem reuniões estruturadas.' },
      3: { title: 'Regular', desc: 'Acompanhamos 2 a 3 metas, mas falta rotina semanal de gestão.' },
      4: { title: 'Bom', desc: 'Dashboard de indicadores atualizado semanalmente com reuniões fixas.' },
      5: { title: 'Excelente', desc: 'Gestão por OKRs, indicadores em tempo real e cultura de melhoria contínua.' },
    },
  },
  Pessoas: {
    subtitle: 'Avalie o alinhamento da equipe, autonomia, liderança e rotatividade.',
    levels: {
      1: { title: 'Crítico', desc: 'Equipe desmotivada e dependente. Tudo passa pelo dono.' },
      2: { title: 'Inconstante', desc: 'Equipe faz o básico, com pouca proatividade e erros por falta de treinamento.' },
      3: { title: 'Regular', desc: 'Boa convivência e papéis definidos, mas falta liderança intermediária.' },
      4: { title: 'Bom', desc: 'Pessoas com metas, reuniões de feedback e pouca rotatividade.' },
      5: { title: 'Excelente', desc: 'Líderes formados internamente que gerenciam os times com autonomia.' },
    },
  },
  Estrategia: {
    subtitle: 'Avalie a clareza de visão de futuro, diferenciais de mercado e plano de expansão.',
    levels: {
      1: { title: 'Crítico', desc: 'Sobrevivendo ao dia a dia sem saber onde a empresa estará daqui a 1 ano.' },
      2: { title: 'Inconstante', desc: 'Temos vontade de crescer, mas nos distraímos com projetos sem foco.' },
      3: { title: 'Regular', desc: 'Metas anuais traçadas, mas falta desdobramento em planos de 90 dias.' },
      4: { title: 'Bom', desc: 'Posicionamento único, nicho definido e metas trimestrais alinhadas.' },
      5: { title: 'Excelente', desc: 'Plano de expansão agressivo validado, empresa preparada para escalar.' },
    },
  },
};

export const SelfAssessmentStep: React.FC<SelfAssessmentStepProps> = ({
  areaKey,
  areaTitle,
  stepNumber,
  currentValue,
  onSelect,
}) => {
  const guide = AREA_GUIDES[areaKey] || AREA_GUIDES['Financeiro'];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-[#6B0F1A] uppercase tracking-wider">Autoavaliação</span>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mt-1">
          Como você avalia a área de <span className="text-[#6B0F1A]">{areaTitle}</span>?
        </h2>
        <p className="text-[#5A6270] text-sm mt-1">{guide.subtitle}</p>
      </div>

      <div className="bg-white border border-[#D8D3CB] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
          Selecione a nota de 1 a 5 que melhor reflete a realidade atual da sua empresa:
        </label>

        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = currentValue === star;
            const level = guide.levels[star];
            const config = LEVEL_CONFIG[star];

            return (
              <button
                key={star}
                type="button"
                onClick={() => onSelect(star)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-start gap-4 cursor-pointer ${
                  isSelected
                    ? `${config.bg} ${config.border} shadow-md`
                    : 'bg-white border-[#D8D3CB] hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
                }`}
              >
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className={`text-2xl ${isSelected ? config.color : 'text-[#5A6270]'}`}>
                    {config.icon}
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm border ${
                      isSelected
                        ? `${config.bg} ${config.border} ${config.color}`
                        : 'bg-[#F9F7F3] text-[#5A6270] border-[#D8D3CB]'
                    }`}
                  >
                    {star}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${isSelected ? config.color : 'text-[#1A1A1A]'}`}>
                      {level.title}
                    </span>
                    {isSelected ? (
                      <span className="text-xs font-bold text-[#6B0F1A] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Selecionado
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-[#5A6270]">{config.label}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#5A6270] mt-0.5 leading-relaxed">{level.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};