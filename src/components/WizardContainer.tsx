import React, { useState, useEffect } from 'react';
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
import { AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateFullDiagnostic } from '../utils/diagnosticCalculator';
import RevenueModelStep from './RevenueModelStep';
import CheckoutModal from './checkout/CheckoutModal';
import CheckoutSuccess from './pages/CheckoutSuccess';
import { WizardNavigation } from './WizardNavigation';

// 📌 ÚNICA FONTE DE VERDADE PARA O TOTAL DE ETAPAS
const TOTAL_STEPS = 13;

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
  hasSalesManager: false,
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
  responsavelFinanceiro: '',
  responsavelComercial: '',
  responsavelOperacoes: '',
  paymentConfirmed: false,
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 🔥 Carrega dados do localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('tfazzio_diagnostic_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) { /* ignora */ }
    }
  }, []);

  // 🔥 Salva dados no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('tfazzio_diagnostic_data', JSON.stringify(formData));
  }, [formData]);

  // 🔥 Verifica se o usuário voltou do Stripe com sucesso
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const sessionId = params.get('session_id');

    if (success === 'true' && sessionId) {
      setShowSuccess(true);
      setFormData(prev => ({ ...prev, paymentConfirmed: true }));
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const updateFormData = (fields: Partial<DiagnosticFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };
      if (fields.companyName && onCompanyChange) {
        onCompanyChange(fields.companyName);
      }
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
    
    if (currentStep === 3) {
      if (!formData.mainGoal || !formData.biggestDifficulty) {
        setValidationError('Por favor, selecione um objetivo e um gargalo para continuar.');
        return false;
      }
    }
    
    if (currentStep === 5) {
      if (!formData.monthlyRevenue || formData.monthlyRevenue <= 0) {
        setValidationError('Por favor, informe um faturamento mensal válido.');
        return false;
      }
      if (!formData.employeesCount) {
        setValidationError('Por favor, informe o número de funcionários.');
        return false;
      }
      if (!formData.responsavelFinanceiro) {
        setValidationError('Por favor, selecione quem é o responsável pela gestão financeira.');
        return false;
      }
    }
    
    if (currentStep === 6) {
      if (!formData.responsavelComercial) {
        setValidationError('Por favor, selecione quem é o responsável pela área comercial.');
        return false;
      }
      if (!formData.responsavelOperacoes) {
        setValidationError('Por favor, selecione quem é o responsável pelas operações.');
        return false;
      }
      if (formData.salesTeamSize === undefined || formData.salesTeamSize === null) {
        setValidationError('Por favor, selecione o tamanho da equipe comercial.');
        return false;
      }
      if (formData.hasSalesManager === undefined || formData.hasSalesManager === null) {
        setValidationError('Por favor, informe se a equipe possui um gestor comercial dedicado.');
        return false;
      }
    }
    
    if (currentStep === 14) {
      if (!formData.contactName || formData.contactName.trim() === '') {
        setValidationError('Por favor, informe seu nome completo.');
        return false;
      }
      if (!formData.contactEmail || !formData.contactEmail.includes('@')) {
        setValidationError('Por favor, informe um e-mail válido.');
        return false;
      }
      const phoneDigits = formData.contactPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 12) {
        setValidationError('Por favor, informe um WhatsApp válido (DDD + 8 ou 9 dígitos).');
        return false;
      }
      if (!formData.consentGiven) {
        setValidationError('Você precisa concordar com os termos para continuar.');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    
    if (currentStep === 4 && !formData.paymentConfirmed) {
      setShowCheckout(true);
      return;
    }

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

  const handleContinueAfterPayment = () => {
    setShowSuccess(false);
    setCurrentStep(5);
    if (onStepChange) onStepChange(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================
  // 🔥 runDiagnosticCalculation - USANDO ROTA COMPLETA
  // ============================================================
  const runDiagnosticCalculation = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setCurrentStep(15);
    if (onStepChange) onStepChange(15);

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_PROCESSING_MS));

    const fetchResult = (async (): Promise<DiagnosticResult> => {
      try {
        // 🔥 ROTA COMPLETA (COM EVIDÊNCIAS)
        const response = await fetch('/api/diagnostico/gerar', {
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
    setIsProcessing(false);
    setShowSuccess(false);
    setCurrentStep(16);
    if (onStepChange) onStepChange(16);
  };

  if (showSuccess) {
    return (
      <CheckoutSuccess 
        onContinue={handleContinueAfterPayment}
      />
    );
  }

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
            {currentStep === 1 && <WelcomeStep onStart={nextStep} />}
            
            {currentStep === 2 && (
              <RevenueModelStep
                onNext={(data) => {
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
            
            {currentStep === 3 && (
              <ObjectiveStep
                mainGoal={formData.mainGoal}
                biggestDifficulty={formData.biggestDifficulty}
                onUpdate={(data) => updateFormData(data)}
              />
            )}
            
            {currentStep === 4 && (
              <CnpjStep 
                cnpj={formData.cnpj} 
                cnpjData={formData.cnpjData} 
                onUpdate={handleCnpjUpdate} 
                onNext={nextStep}
                onPrevious={prevStep}
                formData={formData}
                updateFormData={updateFormData}
              />
            )}
            
            {currentStep === 5 && <FinancialDataStep formData={formData} onUpdate={updateFormData} />}
            
            {currentStep === 6 && <CommercialDataStep formData={formData} onUpdate={updateFormData} />}
            
            {currentStep === 7 && (
              <SelfAssessmentStep 
                areaKey="Financeiro" 
                areaTitle="Financeiro & Caixa" 
                stepNumber={7}
                currentValue={formData.scoreFinanceiro}
                onSelect={(val) => { 
                  updateFormData({ scoreFinanceiro: val }); 
                  nextStep(); 
                }} 
              />
            )}
            
            {currentStep === 8 && (
              <SelfAssessmentStep 
                areaKey="Comercial" 
                areaTitle="Comercial & Vendas" 
                stepNumber={8}
                currentValue={formData.scoreComercial}
                onSelect={(val) => { 
                  updateFormData({ scoreComercial: val }); 
                  nextStep(); 
                }} 
              />
            )}
            
            {currentStep === 9 && (
              <SelfAssessmentStep 
                areaKey="Operacao" 
                areaTitle="Operação & Entrega" 
                stepNumber={9}
                currentValue={formData.scoreOperacao}
                onSelect={(val) => { 
                  updateFormData({ scoreOperacao: val }); 
                  nextStep(); 
                }} 
              />
            )}
            
            {currentStep === 10 && (
              <SelfAssessmentStep 
                areaKey="Gestao" 
                areaTitle="Gestão & Processos" 
                stepNumber={10}
                currentValue={formData.scoreGestao}
                onSelect={(val) => { 
                  updateFormData({ scoreGestao: val }); 
                  nextStep(); 
                }} 
              />
            )}
            
            {currentStep === 11 && (
              <SelfAssessmentStep 
                areaKey="Pessoas" 
                areaTitle="Pessoas & Liderança" 
                stepNumber={11}
                currentValue={formData.scorePessoas}
                onSelect={(val) => { 
                  updateFormData({ scorePessoas: val }); 
                  nextStep(); 
                }} 
              />
            )}
            
            {currentStep === 12 && (
              <SelfAssessmentStep 
                areaKey="Estrategia" 
                areaTitle="Estratégia & Visão" 
                stepNumber={12}
                currentValue={formData.scoreEstrategia}
                onSelect={(val) => { 
                  updateFormData({ scoreEstrategia: val }); 
                  nextStep(); 
                }} 
              />
            )}
            
            {currentStep === 13 && <StrategicQuestionsStep formData={formData} onUpdate={updateFormData} />}
            
            {currentStep === 14 && (
              <ReviewStep 
                formData={formData} 
                onUpdate={updateFormData} 
                onRunDiagnostic={runDiagnosticCalculation} 
              />
            )}
            
            {currentStep === 15 && <ProcessingStep />}
            
            {currentStep === 16 && diagnosticResult && (
              <ReportDashboard 
                result={diagnosticResult} 
                onDownloadPdf={() => setShowPdfModal(true)} 
                onRestart={() => window.location.reload()} 
              />
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

      {/* 🔥 NAVEGAÇÃO - APENAS NAS ETAPAS QUE NÃO TÊM NAVEGAÇÃO PRÓPRIA */}
      {/* Etapas com navegação própria: 2 (Revenue), 4 (CNPJ), 14 (Review) */}
      {/* Etapas sem navegação: 3, 5, 6, 7, 8, 9, 10, 11, 12, 13 */}
      {currentStep >= 3 && currentStep <= 13 && currentStep !== 4 && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onPrevious={prevStep}
            onNext={nextStep}
            isNextDisabled={false}
            isLastStep={false}
            nextLabel="Avançar"
            showPrevious={currentStep > 1}
          />
        </div>
      )}

      {showPdfModal && diagnosticResult && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8D3CB] rounded-2xl p-6 max-w-4xl w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D8D3CB] pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Visualização de Impressão e PDF - TFAZZIO</h3>
              <button 
                onClick={() => setShowPdfModal(false)} 
                className="text-[#5A6270] hover:text-[#1A1A1A] font-bold p-1 cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>
            <PdfGenerator result={diagnosticResult} onClose={() => setShowPdfModal(false)} />
          </div>
        </div>
      )}

      {showCheckout && (
        <CheckoutModal
          email={formData.contactEmail}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            setFormData(prev => ({ ...prev, paymentConfirmed: true }));
            setShowSuccess(true);
          }}
        />
      )}
    </div>
  );
};