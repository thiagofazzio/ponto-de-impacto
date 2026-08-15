import React, { useState } from 'react';
import { DiagnosticFormData, DiagnosticResult, CompanyCNPJData } from '../types';
import { WelcomeStep } from './steps/WelcomeStep';
import { CnpjStep } from './steps/CnpjStep';
import ObjectiveStep from './steps/ObjectiveStep';
import { FinancialDataStep } from './steps/FinancialDataStep';
import { CommercialDataStep } from './steps/CommercialDataStep';
import { SelfAssessmentStep } from './steps/SelfAssessmentStep';
import { StrategicQuestionsStep } from './steps/StrategicQuestionsStep';
import { ReviewStep } from './steps/ReviewStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { ReportDashboard } from './report/ReportDashboard';
import { PdfGenerator } from './report/PdfGenerator';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateFullDiagnostic } from '../utils/diagnosticCalculator';
import RevenueModelStep from './RevenueModelStep';

const MIN_PROCESSING_MS = 3600;

const INITIAL_FORM_DATA: DiagnosticFormData = {
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
  monthlyRevenue: 150000,
  fixedCosts: 45000,
  variableCostsPercent: 30,
  taxesPercent: 8,
  ownerSalary: 12000,
  averageTicket: 2500,
  monthlyClients: 60,
  conversionRate: 25,
  hasCRM: true,
  salesTeamSize: 2,
  scoreFinanceiro: 3,
  scoreComercial: 2,
  scoreOperacao: 3,
  scoreGestao: 2,
  scorePessoas: 3,
  scoreEstrategia: 2,
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
};

interface WizardContainerProps {
  onStepChange?: (step: number) => void;
  onCompanyChange?: (name: string) => void;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({ onStepChange, onCompanyChange }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DiagnosticFormData>(INITIAL_FORM_DATA);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalWizardSteps = 16;

  const updateFormData = (fields: Partial<DiagnosticFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };
      if (fields.companyName && onCompanyChange) {
        onCompanyChange(fields.companyName);
      }
      console.log('📝 updateFormData:', fields); // DEBUG
      return updated;
    });
    setValidationError(null);
  };

  const handleCnpjUpdate = (cnpj: string, cnpjData: CompanyCNPJData | null) => {
    setFormData((prev) => ({
      ...prev,
      cnpj,
      cnpjData,
      companyName: prev.companyName || cnpjData?.razaoSocial || cnpjData?.nomeFantasia || '',
      segment: prev.segment || cnpjData?.cnaeDescricao || '',
      cityState: prev.cityState || (cnpjData?.municipio ? `${cnpjData.municipio} / ${cnpjData.uf}` : ''),
    }));

    if (cnpjData?.razaoSocial && onCompanyChange) {
      onCompanyChange(cnpjData.razaoSocial);
    }
  };

  const validateStep = (): boolean => {
    setValidationError(null);
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    const next = currentStep + 1;
    setCurrentStep(next);
    if (onStepChange) onStepChange(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setValidationError(null);
    const prev = Math.max(1, currentStep - 1);
    setCurrentStep(prev);
    if (onStepChange) onStepChange(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetAll = () => {
    setFormData(INITIAL_FORM_DATA);
    setDiagnosticResult(null);
    setCurrentStep(1);
    setShowPdfModal(false);
    setValidationError(null);
    if (onStepChange) onStepChange(1);
    if (onCompanyChange) onCompanyChange('');
  };

  const runDiagnosticCalculation = async () => {
    setCurrentStep(15);
    if (onStepChange) onStepChange(15);

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_PROCESSING_MS));

    const fetchResult = (async (): Promise<DiagnosticResult> => {
      try {
        const response = await fetch('/api/diagnostico/ia-gerar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          return (await response.json()) as DiagnosticResult;
        }
        return generateFullDiagnostic(formData);
      } catch (e) {
        console.warn('API call failed, calculating locally:', e);
        return generateFullDiagnostic(formData);
      }
    })();

    const [result] = await Promise.all([fetchResult, minDelay]);
    setDiagnosticResult(result);
    setCurrentStep(16);
    if (onStepChange) onStepChange(16);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Etapa 1: Boas-vindas */}
            {currentStep === 1 && <WelcomeStep onStart={nextStep} />}

            {/* Etapa 2: Modelo de Receita + Área */}
            {currentStep === 2 && (
              <RevenueModelStep
                onNext={(data) => {
                  console.log('📦 Dados do RevenueModelStep:', data);
                  updateFormData({
                    revenueModel: data.revenueModel,
                    customRevenueModel: data.customModel,
                    areaAtuacao: data.areaAtuacao,
                    customArea: data.customArea,
                  });
                  nextStep();
                }}
                initialData={formData}
              />
            )}

            {/* Etapa 3: Objetivo */}
            {currentStep === 3 && (
              <ObjectiveStep
                mainGoal={formData.mainGoal}
                biggestDifficulty={formData.biggestDifficulty}
                onUpdate={(data) => updateFormData(data)}
              />
            )}

            {/* Etapa 4: CNPJ + Dados da Empresa */}
            {currentStep === 4 && (
              <CnpjStep 
                cnpj={formData.cnpj} 
                cnpjData={formData.cnpjData} 
                onUpdate={handleCnpjUpdate} 
                onNext={nextStep}
                formData={formData}
                updateFormData={updateFormData}
              />
            )}

            {/* Etapa 5: Dados Financeiros */}
            {currentStep === 5 && <FinancialDataStep formData={formData} onUpdate={updateFormData} />}
            
            {/* Etapa 6: Dados Comerciais */}
            {currentStep === 6 && <CommercialDataStep formData={formData} onUpdate={updateFormData} />}

            {/* Etapas 7-12: Autoavaliação */}
            {currentStep === 7 && (
              <SelfAssessmentStep areaKey="Financeiro" areaTitle="Financeiro & Caixa" stepNumber={7}
                currentValue={formData.scoreFinanceiro}
                onSelect={(val) => { updateFormData({ scoreFinanceiro: val }); nextStep(); }} />
            )}
            {currentStep === 8 && (
              <SelfAssessmentStep areaKey="Comercial" areaTitle="Comercial & Vendas" stepNumber={8}
                currentValue={formData.scoreComercial}
                onSelect={(val) => { updateFormData({ scoreComercial: val }); nextStep(); }} />
            )}
            {currentStep === 9 && (
              <SelfAssessmentStep areaKey="Operacao" areaTitle="Operação & Entrega" stepNumber={9}
                currentValue={formData.scoreOperacao}
                onSelect={(val) => { updateFormData({ scoreOperacao: val }); nextStep(); }} />
            )}
            {currentStep === 10 && (
              <SelfAssessmentStep areaKey="Gestao" areaTitle="Gestão & Processos" stepNumber={10}
                currentValue={formData.scoreGestao}
                onSelect={(val) => { updateFormData({ scoreGestao: val }); nextStep(); }} />
            )}
            {currentStep === 11 && (
              <SelfAssessmentStep areaKey="Pessoas" areaTitle="Pessoas & Liderança" stepNumber={11}
                currentValue={formData.scorePessoas}
                onSelect={(val) => { updateFormData({ scorePessoas: val }); nextStep(); }} />
            )}
            {currentStep === 12 && (
              <SelfAssessmentStep areaKey="Estrategia" areaTitle="Estratégia & Visão" stepNumber={12}
                currentValue={formData.scoreEstrategia}
                onSelect={(val) => { updateFormData({ scoreEstrategia: val }); nextStep(); }} />
            )}

            {/* Etapa 13: Perguntas Estratégicas */}
            {currentStep === 13 && <StrategicQuestionsStep formData={formData} onUpdate={updateFormData} />}

            {/* Etapa 14: Revisão */}
            {currentStep === 14 && (
              <ReviewStep formData={formData} onUpdate={updateFormData} onRunDiagnostic={runDiagnosticCalculation} />
            )}

            {/* Etapa 15: Processando */}
            {currentStep === 15 && <ProcessingStep />}

            {/* Etapa 16: Relatório */}
            {currentStep === 16 && diagnosticResult && (
              <ReportDashboard result={diagnosticResult} onDownloadPdf={() => setShowPdfModal(true)} onRestart={resetAll} />
            )}
          </motion.div>
        </AnimatePresence>

        {validationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Rodapé com navegação - SEM CONTADOR DUPLICADO */}
      {currentStep > 1 && currentStep < 15 && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-6 mt-6 border-t border-[#D8D3CB] flex items-center justify-between">
          <button type="button" onClick={prevStep}
            className="px-5 py-2.5 bg-white hover:bg-[#F9F7F3] border border-[#D8D3CB] text-[#1A1A1A] font-bold text-xs rounded-lg flex items-center gap-2 transition cursor-pointer shadow-sm">
            <ArrowLeft className="w-4 h-4" /><span>Voltar</span>
          </button>
          {currentStep !== 14 && (
            <button type="button" onClick={nextStep}
              className="px-6 py-2.5 bg-[#6B0F1A] hover:bg-[#500B13] text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer">
              <span>Avançar</span><ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      )}

      {/* Modal PDF */}
      {showPdfModal && diagnosticResult && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8D3CB] rounded-2xl p-6 max-w-4xl w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D8D3CB] pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Visualização de Impressão e PDF - TFAZZIO</h3>
              <button onClick={() => setShowPdfModal(false)} className="text-[#5A6270] hover:text-[#1A1A1A] font-bold p-1 cursor-pointer">✕ Fechar</button>
            </div>
            <PdfGenerator result={diagnosticResult} onClose={() => setShowPdfModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};