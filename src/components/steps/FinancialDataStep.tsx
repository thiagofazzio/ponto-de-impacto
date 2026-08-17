import React, { useState, useEffect } from 'react';
import { DiagnosticFormData } from '../../types';
import { DollarSign, PieChart, Info, Landmark, Users, User, Briefcase, Clipboard, Plus, Trash2, ChevronDown, ChevronRight, Percent } from 'lucide-react';

interface FinancialDataStepProps {
  formData: DiagnosticFormData;
  onUpdate: (fields: Partial<DiagnosticFormData>) => void;
}

// Categorias de custo predefinidas
const CATEGORIAS_CUSTO = [
  'Aluguel',
  'Salários operacionais',
  'Pró-labore',
  'Softwares e assinaturas',
  'Contabilidade',
  'Marketing e publicidade',
  'Energia e utilidades',
  'Manutenção',
  'Seguros',
  'Transporte e frete',
  'Material de escritório',
  'Consultorias',
  'Outros'
];

// 🔥 Categorias de custos variáveis (SEM Impostos)
const CATEGORIAS_VARIAVEIS = [
  'Insumos / Matéria-prima',
  'Comissões de vendas',
  'Taxas de cartão de crédito',
  'Frete e entregas',
  'Embalagens',
  'Royalties',
  'Outros'
];

export const FinancialDataStep: React.FC<FinancialDataStepProps> = ({ formData, onUpdate }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const [showCostDetails, setShowCostDetails] = useState(false);
  const [costItems, setCostItems] = useState<Array<{ id: string; name: string; value: number }>>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newValue, setNewValue] = useState('');

  // 🔥 Estado para detalhamento de custos variáveis
  const [showVariableDetails, setShowVariableDetails] = useState(false);
  const [variableItems, setVariableItems] = useState<Array<{ id: string; name: string; percent: number }>>([]);
  const [newVariableCategory, setNewVariableCategory] = useState('');
  const [newVariablePercent, setNewVariablePercent] = useState('');

  const monthlyRevenue = formData.monthlyRevenue || 150000;
  const monthlyClients = formData.monthlyClients || 60;
  const suggestedTicket = monthlyClients > 0 ? Math.round(monthlyRevenue / monthlyClients) : 0;

  // Inicializa itens de custo fixo
  useEffect(() => {
    if (formData.fixedCosts && formData.fixedCosts > 0 && costItems.length === 0) {
      setCostItems([{
        id: Date.now().toString(),
        name: 'Outros custos',
        value: formData.fixedCosts
      }]);
    }
  }, []);

  // Inicializa itens de custo variável a partir do percentual total
  useEffect(() => {
    if (formData.variableCostsPercent && formData.variableCostsPercent > 0 && variableItems.length === 0) {
      setVariableItems([{
        id: Date.now().toString(),
        name: 'Outros variáveis',
        percent: formData.variableCostsPercent
      }]);
    }
  }, []);

  // Atualiza o total de custos fixos
  useEffect(() => {
    const total = costItems.reduce((sum, item) => sum + (item.value || 0), 0);
    onUpdate({ fixedCosts: total });
  }, [costItems]);

  // 🔥 Atualiza o total de custos variáveis
  useEffect(() => {
    const total = variableItems.reduce((sum, item) => sum + (item.percent || 0), 0);
    onUpdate({ variableCostsPercent: Math.min(95, Math.round(total)) });
  }, [variableItems]);

  const addCostItem = () => {
    if (!newCategory) return;
    const value = parseFloat(newValue) || 0;
    if (value <= 0) return;
    
    setCostItems([...costItems, {
      id: Date.now().toString(),
      name: newCategory,
      value: value
    }]);
    setNewCategory('');
    setNewValue('');
  };

  const removeCostItem = (id: string) => {
    setCostItems(costItems.filter(item => item.id !== id));
  };

  const updateCostItem = (id: string, value: number) => {
    setCostItems(costItems.map(item => 
      item.id === id ? { ...item, value: value } : item
    ));
  };

  // 🔥 Funções para custos variáveis
  const addVariableItem = () => {
    if (!newVariableCategory) return;
    const percent = parseFloat(newVariablePercent) || 0;
    if (percent <= 0) return;
    
    setVariableItems([...variableItems, {
      id: Date.now().toString(),
      name: newVariableCategory,
      percent: percent
    }]);
    setNewVariableCategory('');
    setNewVariablePercent('');
  };

  const removeVariableItem = (id: string) => {
    setVariableItems(variableItems.filter(item => item.id !== id));
  };

  const updateVariableItem = (id: string, percent: number) => {
    setVariableItems(variableItems.map(item => 
      item.id === id ? { ...item, percent: percent } : item
    ));
  };

  const totalFixedCosts = costItems.reduce((sum, item) => sum + (item.value || 0), 0);
  const totalVariablePercent = variableItems.reduce((sum, item) => sum + (item.percent || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-[#6B0F1A] uppercase tracking-wider">Etapa 5 de 16</span>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] mt-1">
          <span className="text-[#6B0F1A]">Números Financeiros</span> da Empresa
        </h2>
        <p className="text-[#5A6270] text-sm mt-1">
          Usamos esses números para calcular com precisão o seu <strong className="text-[#6B0F1A] font-bold">Ponto de Equilíbrio (Break-Even)</strong> e Margem de Segurança.
        </p>
      </div>

      <div className="bg-white border border-[#D8D3CB] rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
        
        {/* Número de Funcionários e Faturamento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Número de Funcionários *
            </label>
            <select
              value={formData.employeesCount || '6_15'}
              onChange={(e) => onUpdate({ employeesCount: e.target.value })}
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
            >
              <option value="1_5">1 a 5</option>
              <option value="6_15">6 a 15</option>
              <option value="16_50">16 a 50</option>
              <option value="51_100">51 a 100</option>
              <option value="100+">Mais de 100</option>
            </select>
            <p className="text-[11px] text-[#5A6270]">Total de colaboradores na empresa.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                Faturamento Mensal Médio (R$) *
              </label>
              <span className="text-xs font-mono font-bold text-[#6B0F1A]">{formatCurrency(monthlyRevenue)}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#5A6270] font-semibold text-sm">R$</span>
              <input
                id="input-monthly-revenue"
                type="number"
                min={0}
                step={1000}
                value={monthlyRevenue}
                onChange={(e) => onUpdate({ monthlyRevenue: Number(e.target.value) })}
                placeholder="Ex: 150000"
                className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
              />
            </div>
            <p className="text-[11px] text-[#5A6270]">Média bruta dos últimos 3 a 6 meses.</p>
          </div>
        </div>

        {/* Custos Fixos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-[#D8D3CB] pt-5">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                2. Custos Fixos Mensais (R$) *
              </label>
              <span className="text-xs font-mono font-bold text-[#6B0F1A]">{formatCurrency(totalFixedCosts)}</span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-[#5A6270] font-semibold text-sm">R$</span>
              <input
                id="input-fixed-costs"
                type="number"
                min={0}
                step={500}
                value={totalFixedCosts}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (costItems.length > 1) {
                    setCostItems([{ id: Date.now().toString(), name: 'Outros custos', value: val }]);
                  } else {
                    onUpdate({ fixedCosts: val });
                  }
                }}
                placeholder="Ex: 45000"
                className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCostDetails(!showCostDetails)}
                className="text-xs text-[#6B0F1A] font-semibold flex items-center gap-1 hover:underline"
              >
                {showCostDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                {showCostDetails ? 'Ocultar' : 'Detalhar'} custos
              </button>
              <span className="text-[11px] text-[#5A6270]">
                {costItems.length > 1 ? `${costItems.length} itens detalhados` : 'Insira os valores detalhadamente'}
              </span>
            </div>
          </div>
        </div>

        {/* 🔥 Estímulo para detalhar custos fixos */}
        {!showCostDetails && costItems.length === 1 && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>💡 Clique em "Detalhar custos" para uma análise mais precisa do seu break-even.</span>
          </div>
        )}

        {/* Detalhamento de Custos Fixos */}
        {showCostDetails && (
          <div className="border-t border-[#D8D3CB] pt-5 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                📋 Detalhamento dos Custos Fixos
              </h4>
              <span className="text-xs font-bold text-[#6B0F1A]">
                Total: {formatCurrency(totalFixedCosts)}
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {costItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-[#F9F7F3] p-2 rounded-lg border border-[#D8D3CB]">
                  <span className="text-xs font-medium text-[#1A1A1A] flex-1 truncate">
                    {item.name}
                  </span>
                  <div className="relative w-32">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#5A6270]">R$</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={item.value || ''}
                      onChange={(e) => updateCostItem(item.id, Number(e.target.value))}
                      className="w-full bg-white border border-[#D8D3CB] rounded-lg pl-7 pr-2 py-1 text-xs font-mono focus:border-[#6B0F1A] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCostItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    disabled={costItems.length === 1}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-3">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 bg-white border border-[#D8D3CB] rounded-lg px-3 py-1.5 text-xs focus:border-[#6B0F1A] focus:outline-none"
              >
                <option value="">Selecione uma categoria...</option>
                {CATEGORIAS_CUSTO.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="relative w-28">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-[#5A6270]">R$</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Valor"
                  className="w-full bg-white border border-[#D8D3CB] rounded-lg pl-7 pr-2 py-1.5 text-xs focus:border-[#6B0F1A] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={addCostItem}
                disabled={!newCategory || !newValue}
                className="px-3 py-1.5 bg-[#6B0F1A] text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#500B13] transition flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar
              </button>
            </div>
          </div>
        )}

        {/* 🔥 Custos Variáveis - SEM BARRINHA (apenas input numérico) */}
        <div className="border-t border-[#D8D3CB] pt-5 mt-2">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  3. Custos Variáveis (%)
                </label>
                <span className="text-xs font-mono font-bold text-[#6B0F1A]">{Math.round(totalVariablePercent)}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={95}
                step={0.5}
                value={Math.round(totalVariablePercent)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (variableItems.length > 1) {
                    setVariableItems([{ id: Date.now().toString(), name: 'Outros variáveis', percent: val }]);
                  } else {
                    onUpdate({ variableCostsPercent: val });
                  }
                }}
                className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20"
              />
              <div className="flex justify-between text-[11px] text-[#5A6270] mt-1">
                <span>Insumos / Comissões / Taxas de cartão</span>
                <span>Atualmente: {Math.round(totalVariablePercent)}%</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowVariableDetails(!showVariableDetails)}
              className="text-xs text-[#6B0F1A] font-semibold flex items-center gap-1 hover:underline ml-4 shrink-0"
            >
              {showVariableDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {showVariableDetails ? 'Ocultar' : 'Detalhar'} variáveis
            </button>
          </div>

          {/* 🔥 Estímulo para detalhar custos variáveis */}
          {!showVariableDetails && variableItems.length === 1 && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>💡 Clique em "Detalhar variáveis" para entender o impacto de cada custo na sua margem.</span>
            </div>
          )}

          {/* Detalhamento de Custos Variáveis */}
          {showVariableDetails && (
            <div className="mt-3 pt-3 border-t border-[#D8D3CB]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                  📊 Detalhamento dos Custos Variáveis
                </h4>
                <span className="text-xs font-bold text-[#6B0F1A]">
                  Total: {Math.round(totalVariablePercent)}%
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {variableItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 bg-[#F9F7F3] p-2 rounded-lg border border-[#D8D3CB]">
                    <span className="text-xs font-medium text-[#1A1A1A] flex-1 truncate">
                      {item.name}
                    </span>
                    <div className="relative w-24">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={item.percent || ''}
                        onChange={(e) => updateVariableItem(item.id, Number(e.target.value))}
                        className="w-full bg-white border border-[#D8D3CB] rounded-lg px-2 py-1 text-xs font-mono focus:border-[#6B0F1A] focus:outline-none text-right"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#5A6270]">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariableItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      disabled={variableItems.length === 1}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3">
                <select
                  value={newVariableCategory}
                  onChange={(e) => setNewVariableCategory(e.target.value)}
                  className="flex-1 bg-white border border-[#D8D3CB] rounded-lg px-3 py-1.5 text-xs focus:border-[#6B0F1A] focus:outline-none"
                >
                  <option value="">Selecione uma categoria...</option>
                  {CATEGORIAS_VARIAVEIS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="relative w-20">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={newVariablePercent}
                    onChange={(e) => setNewVariablePercent(e.target.value)}
                    placeholder="%"
                    className="w-full bg-white border border-[#D8D3CB] rounded-lg px-2 py-1.5 text-xs focus:border-[#6B0F1A] focus:outline-none text-right pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#5A6270]">%</span>
                </div>
                <button
                  type="button"
                  onClick={addVariableItem}
                  disabled={!newVariableCategory || !newVariablePercent}
                  className="px-3 py-1.5 bg-[#6B0F1A] text-white rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#500B13] transition flex items-center gap-1"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Impostos sobre Venda */}
        <div className="border-t border-[#D8D3CB] pt-5">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              4. Impostos sobre Venda (%)
            </label>
            <span className="text-xs font-mono font-bold text-[#6B0F1A]">{formData.taxesPercent}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={40}
            step={0.5}
            value={formData.taxesPercent}
            onChange={(e) => onUpdate({ taxesPercent: Number(e.target.value) })}
            className="w-full accent-[#6B0F1A] cursor-pointer mt-2"
          />
          <div className="flex justify-between text-[11px] text-[#5A6270]">
            <span>Alíquota efetiva de imposto na Nota Fiscal</span>
            <span>Atualmente: {formData.taxesPercent}%</span>
          </div>
        </div>

        {/* Owner Salary, Ticket & Clients */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#D8D3CB] pt-5">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Pró-labore dos Sócios (R$)
            </label>
            <input
              type="number"
              min={0}
              step={500}
              value={formData.ownerSalary || ''}
              onChange={(e) => onUpdate({ ownerSalary: Number(e.target.value) })}
              placeholder="Ex: 15000"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Ticket Médio (R$)
            </label>
            <input
              type="number"
              min={0}
              step={50}
              value={formData.averageTicket || ''}
              onChange={(e) => onUpdate({ averageTicket: Number(e.target.value) })}
              placeholder="Ex: 2500"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
              Clientes Atendidos/mês
            </label>
            <input
              type="number"
              min={1}
              value={formData.monthlyClients || ''}
              onChange={(e) => onUpdate({ monthlyClients: Number(e.target.value) })}
              placeholder="Ex: 60"
              className="w-full bg-[#F9F7F3] border border-[#D8D3CB] focus:border-[#6B0F1A] text-[#1A1A1A] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none"
            />
          </div>

        </div>

        {/* Ticket médio info */}
        {monthlyRevenue > 0 && monthlyClients > 0 && (
          <div className="mt-4 p-4 bg-[#F9F7F3] rounded-xl border border-[#D8D3CB]">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#6B0F1A] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-[#1A1A1A]">💡 Ticket Médio Atual</span>
                <p className="text-xs text-[#5A6270] mt-1">
                  Com {monthlyClients} clientes/mês e faturamento de {formatCurrency(monthlyRevenue)}, 
                  seu ticket médio é de <strong className="text-[#6B0F1A]">{formatCurrency(suggestedTicket)}</strong>.
                  {suggestedTicket > 0 && (
                    <span className="block mt-1 text-[#5A6270]">
                      {suggestedTicket < 1000 
                        ? '🔍 Ticket médio baixo. Considere estratégias de upsell e cross-sell para aumentar o valor por cliente.'
                        : suggestedTicket < 5000
                        ? '📈 Ticket médio saudável. Continue investindo em relacionamento e fidelização.'
                        : '🚀 Ticket médio alto! Foque em manter a qualidade e explorar novos canais de aquisição.'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Responsável pelo Financeiro */}
        <div className="border-t border-[#D8D3CB] pt-5 mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">
            🧑‍💼 Quem é o responsável pela gestão financeira?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => onUpdate({ responsavelFinanceiro: 'socio' })}
              className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                formData.responsavelFinanceiro === 'socio'
                  ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                  : 'border-gray-200 hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">🧑‍💼</span>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">Sócio</div>
                  <div className="text-xs text-gray-500">Decisões financeiras passam pelo dono</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onUpdate({ responsavelFinanceiro: 'head' })}
              className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                formData.responsavelFinanceiro === 'head'
                  ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                  : 'border-gray-200 hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">CFO / Head / Gerente</div>
                  <div className="text-xs text-gray-500">Gestor dedicado da área financeira</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onUpdate({ responsavelFinanceiro: 'analista' })}
              className={`p-3 text-left border-2 rounded-xl transition-all duration-200 ${
                formData.responsavelFinanceiro === 'analista'
                  ? 'border-[#6B0F1A] bg-[#F9F7F3] shadow-md'
                  : 'border-gray-200 hover:border-[#6B0F1A] hover:bg-[#F9F7F3]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl">📋</span>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">Analista / Assistente</div>
                  <div className="text-xs text-gray-500">Suporte operacional financeiro</div>
                </div>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};