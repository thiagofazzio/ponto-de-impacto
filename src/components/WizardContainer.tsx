import React, { useState, useEffect } from 'react';
import { DiagnosticFormData, DiagnosticResult, CompanyCNPJData, Pergunta } from '../types';
import { WelcomeStep } from './steps/WelcomeStep';
import { CnpjStep } from './steps/CnpjStep';
import { ReviewStep } from './steps/ReviewStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { ReportDashboard } from './report/ReportDashboard';
import { PdfGenerator } from './report/PdfGenerator';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateFullDiagnostic } from '../utils/diagnosticCalculator';
import CheckoutModal from './checkout/CheckoutModal';
import CheckoutSuccess from './pages/CheckoutSuccess';
import { WizardNavigation } from './WizardNavigation';
import { DynamicStep } from './steps/DynamicStep';
import { 
  iniciarInvestigacao, 
  avancarInvestigacao, 
  isDiagnosticoCompleto,
  EstadoInvestigacao,
  gerarPerguntasGratis
} from '../utils/questionSelector';
import { gerarHipoteses, identificarLimitadorPrincipal, projetarProximoLimitador } from '../utils/hypothesisEngine';
import { gerarResultadoSimulacao, gerarTextoSimulacao } from '../utils/simulationEngine';
import { getPerguntasAtivas } from '../config/questionMap';

// ============================================================
// CONSTANTES
// ============================================================

const TOTAL_STEPS = 13;
const MIN_PROCESSING_MS = 3600;

// ============================================================
// ESTADO INICIAL
// ============================================================

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
  monthlyRevenue: 0,
  fixedCosts: 0,
  variableCostsPercent: 30,
  taxesPercent: 8,
  ownerSalary: 0,
  averageTicket: 0,
  monthlyClients: 0,
  conversionRate: 25,
  hasCRM: false,
  salesTeamSize: 0,
  hasSalesManager: false,
  scoreFinanceiro: 3,
  scoreComercial: 3,
  scoreOperacao: 3,
  scoreGestao: 3,
  scorePessoas: 3,
  scoreEstrategia: 3,
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

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const WizardContainer: React.FC<WizardContainerProps> = ({ onStepChange, onCompanyChange }) => {
  // ===== ESTADOS =====
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DiagnosticFormData>(INITIAL_FORM_DATA);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // ===== ESTADOS DO DIAGNÓSTICO 2.0 =====
  const [investigacao, setInvestigacao] = useState<EstadoInvestigacao | null>(null);
  const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
  const [isUpgradeMode, setIsUpgradeMode] = useState(false);
  const [respostasGratis, setRespostasGratis] = useState<Record<string, any>>({});
  const [modoGratis, setModoGratis] = useState(false);

  // ============================================================
  // CARREGAR DADOS DO LOCALSTORAGE
  // ============================================================
  useEffect(() => {
    const savedData = localStorage.getItem('tfazzio_diagnostic_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
        
        // Se já tem dados, inicia a investigação
        if (parsed.companyName || parsed.cnpj) {
          iniciarDiagnosticoAdaptativo(parsed);
        }
      } catch (e) { /* ignora */ }
    }
  }, []);

  // ============================================================
  // SALVAR DADOS NO LOCALSTORAGE
  // ============================================================
  useEffect(() => {
    localStorage.setItem('tfazzio_diagnostic_data', JSON.stringify(formData));
  }, [formData]);

  // ============================================================
  // INICIAR DIAGNÓSTICO ADAPTATIVO
  // ============================================================
  const iniciarDiagnosticoAdaptativo = (dadosIniciais: Partial<DiagnosticFormData>) => {
    const estado = iniciarInvestigacao(dadosIniciais);
    setInvestigacao(estado);
    setPerguntaAtual(estado.proximaPergunta);
    setModoGratis(false);
    setIsUpgradeMode(false);
  };

  // ============================================================
  // INICIAR DIAGNÓSTICO GRÁTIS
  // ============================================================
  const iniciarDiagnosticoGratis = () => {
    const perguntas = gerarPerguntasGratis();
    setModoGratis(true);
    setPerguntaAtual(perguntas[0]);
    setInvestigacao(null);
    setCurrentStep(2);
  };

  // ============================================================
  // AVANÇAR PERGUNTA (DIAGNÓSTICO ADAPTATIVO)
  // ============================================================
  const responderPergunta = (resposta: any) => {
    if (!investigacao) return;

    // Atualiza o formData com a resposta
    const campoId = perguntaAtual?.id || '';
    const dadosAtualizados = { ...formData, [campoId]: resposta };
    setFormData(dadosAtualizados);

    // Avança a investigação
    const novoEstado = avancarInvestigacao(investigacao, resposta, campoId);
    setInvestigacao(novoEstado);

    // Atualiza a pergunta atual
    if (novoEstado.proximaPergunta) {
      setPerguntaAtual(novoEstado.proximaPergunta);
    } else {
      setPerguntaAtual(null);
      // Se não tem mais perguntas, verifica se está completo
      if (isDiagnosticoCompleto(novoEstado)) {
        setCurrentStep(14); // Vai para revisão
      }
    }

    setValidationError(null);
  };

  // ============================================================
  // FUNÇÕES DE NAVEGAÇÃO (LEGACY)
  // ============================================================
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
    // Validações adaptativas serão feitas no momento da resposta
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
  // GERAR DIAGNÓSTICO - USANDO ROTA V2
  // ============================================================
  const runDiagnosticCalculation = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setCurrentStep(15);
    if (onStepChange) onStepChange(15);

    // Gera hipóteses e simulações (para enviar ao backend)
    const hipoteses = gerarHipoteses(formData);
    const limitadorPrincipal = identificarLimitadorPrincipal(hipoteses, formData);
    const proximoLimitador = limitadorPrincipal ? projetarProximoLimitador(limitadorPrincipal, formData) : null;
    const simulacao = gerarResultadoSimulacao(formData, formData.mainGoal || 'crescer_faturamento');

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_PROCESSING_MS));

    const fetchResult = (async (): Promise<DiagnosticResult> => {
      try {
        // 🔥 USANDO ROTA V2
        const response = await fetch('/api/diagnostico/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...formData, 
            hipoteses, 
            limitadorPrincipal, 
            proximoLimitador, 
            simulacao 
          }),
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

  // ============================================================
  // TELA DE SUCESSO
  // ============================================================
  if (showSuccess) {
    return (
      <CheckoutSuccess 
        onContinue={handleContinueAfterPayment}
      />
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
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
            {/* STEP 1 - WELCOME */}
            {currentStep === 1 && (
              <WelcomeStep onStart={nextStep} />
            )}

            {/* STEP 2 - PERGUNTA DINÂMICA (DIAGNÓSTICO 2.0) */}
            {currentStep === 2 && perguntaAtual && (
              <DynamicStep
                pergunta={perguntaAtual}
                onResponder={responderPergunta}
                isGratis={modoGratis}
                totalPerguntas={modoGratis ? 5 : 15}
                perguntasRespondidas={investigacao?.perguntasRespondidas.length || 0}
              />
            )}

            {/* STEP 3 - OBJETIVO & DESAFIOS (LEGACY) */}
            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-6 border border-[#D8D3CB]">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
                  Objetivos & Desafios
                </h2>
                <p className="text-[#5A6270] text-sm mb-6">
                  Vamos entender melhor o que você quer alcançar.
                </p>
                <button
                  onClick={nextStep}
                  className="w-full py-3 bg-[#6B0F1A] text-white font-bold rounded-xl"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* STEP 4 - CNPJ */}
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

            {/* STEP 14 - REVIEW */}
            {currentStep === 14 && (
              <ReviewStep 
                formData={formData} 
                onUpdate={updateFormData} 
                onRunDiagnostic={runDiagnosticCalculation}
                onPrevious={prevStep}
              />
            )}

            {/* STEP 15 - PROCESSING */}
            {currentStep === 15 && <ProcessingStep />}

            {/* STEP 16 - RESULT */}
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

      {/* NAVEGAÇÃO - APENAS PARA ETAPAS LEGACY */}
      {currentStep >= 3 && currentStep <= 14 && currentStep !== 4 && currentStep !== 2 && (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
          <WizardNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onPrevious={prevStep}
            onNext={nextStep}
            isNextDisabled={false}
            isLastStep={currentStep === 14}
            nextLabel={currentStep === 14 ? 'Processar Diagnóstico' : 'Avançar'}
            showPrevious={currentStep > 1}
          />
        </div>
      )}

      {/* MODAL PDF */}
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

      {/* CHECKOUT MODAL */}
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