import React, { useState, useEffect } from 'react';
import { DiagnosticFormData, DiagnosticResult, CompanyCNPJData, Pergunta } from '../types';
import { WelcomeStep } from './steps/WelcomeStep';
import { CnpjStep } from './steps/CnpjStep';
import { ReviewStep } from './steps/ReviewStep';
import { ProcessingStep } from './steps/ProcessingStep';
import { ReportDashboard } from './report/ReportDashboard';
import { PdfGenerator } from './report/PdfGenerator';
import { AlertCircle } from 'lucide-react';
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
import { gerarResultadoSimulacao } from '../utils/simulationEngine';

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

export const WizardContainer: React.FC<WizardContainerProps> = ({ onStepChange, onCompanyChange }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DiagnosticFormData>(INITIAL_FORM_DATA);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [investigacao, setInvestigacao] = useState<EstadoInvestigacao | null>(null);
  const [perguntaAtual, setPerguntaAtual] = useState<Pergunta | null>(null);
  const [modoGratis, setModoGratis] = useState(false);
  const [historicoPerguntas, setHistoricoPerguntas] = useState<Pergunta[]>([]);

  // ============================================================
  // CARREGAR DADOS DO LOCALSTORAGE
  // ============================================================
  useEffect(() => {
    const savedData = localStorage.getItem('tfazzio_diagnostic_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('📦 Dados carregados do localStorage:', parsed);
        setFormData(prev => ({ ...prev, ...parsed }));
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
  // VERIFICAR RETORNO DO PAGAMENTO
  // ============================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const sessionId = params.get('session_id');

    if (success === 'true' && sessionId) {
      console.log('✅ Pagamento confirmado! Session ID:', sessionId);
      
      const savedData = localStorage.getItem('tfazzio_diagnostic_data');
      const awaitingPayment = localStorage.getItem('tfazzio_diagnostic_awaiting_payment');
      
      console.log('📦 Aguardando pagamento:', awaitingPayment);
      
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormData(prev => ({ ...prev, ...parsed, paymentConfirmed: true }));
          console.log('✅ Estado restaurado com sucesso!');
        } catch (e) {
          console.error('❌ Erro ao restaurar estado:', e);
        }
      }
      
      localStorage.removeItem('tfazzio_diagnostic_awaiting_payment');
      setShowSuccess(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ============================================================
  // INICIAR DIAGNÓSTICO ADAPTATIVO
  // ============================================================
  const iniciarDiagnosticoAdaptativo = (dadosIniciais: Partial<DiagnosticFormData>) => {
    console.log('🔍 Iniciando diagnóstico adaptativo com:', dadosIniciais);
    const estado = iniciarInvestigacao(dadosIniciais);
    console.log('🔍 Estado da investigação:', estado);
    setInvestigacao(estado);
    setPerguntaAtual(estado.proximaPergunta);
    setModoGratis(false);
    setHistoricoPerguntas([]);
  };

  // ============================================================
  // AVANÇAR PERGUNTA (DIAGNÓSTICO ADAPTATIVO)
  // ============================================================
  const responderPergunta = (resposta: any) => {
    if (!investigacao) return;

    const campoId = perguntaAtual?.id || '';
    const dadosAtualizados = { ...formData, [campoId]: resposta };
    setFormData(dadosAtualizados);

    // 🔥 SALVAR NO HISTÓRICO PARA PODER VOLTAR
    if (perguntaAtual) {
      setHistoricoPerguntas(prev => [...prev, perguntaAtual]);
    }

    const novoEstado = avancarInvestigacao(investigacao, resposta, campoId);
    setInvestigacao(novoEstado);

    if (novoEstado.proximaPergunta) {
      setPerguntaAtual(novoEstado.proximaPergunta);
    } else {
      setPerguntaAtual(null);
      if (isDiagnosticoCompleto(novoEstado)) {
        setCurrentStep(4);
        if (onStepChange) onStepChange(4);
      }
    }

    setValidationError(null);
  };

  // ============================================================
  // VOLTAR PERGUNTA (DIAGNÓSTICO ADAPTATIVO)
  // ============================================================
  const voltarPergunta = () => {
    if (historicoPerguntas.length === 0) {
      // Se não tem histórico, volta para a etapa anterior
      prevStep();
      return;
    }

    // 🔥 REMOVER A ÚLTIMA PERGUNTA DO HISTÓRICO
    const novoHistorico = [...historicoPerguntas];
    const ultimaPergunta = novoHistorico.pop();
    setHistoricoPerguntas(novoHistorico);

    // 🔥 REMOVER A RESPOSTA DA ÚLTIMA PERGUNTA
    if (ultimaPergunta) {
      const novosDados = { ...formData };
      delete novosDados[ultimaPergunta.id as keyof DiagnosticFormData];
      setFormData(novosDados);
      
      // 🔥 VOLTAR PARA A PERGUNTA ANTERIOR
      if (novoHistorico.length > 0) {
        const perguntaAnterior = novoHistorico[novoHistorico.length - 1];
        setPerguntaAtual(perguntaAnterior);
      } else {
        // Se não tem mais perguntas no histórico, volta para a primeira
        const perguntasAtivas = investigacao?.dados ? [] : [];
        // Recria a investigação com os dados atuais
        const novoEstado = iniciarInvestigacao(novosDados);
        setInvestigacao(novoEstado);
        setPerguntaAtual(novoEstado.proximaPergunta);
      }
    }

    setValidationError(null);
  };

  // ============================================================
  // FUNÇÕES DE NAVEGAÇÃO
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
    return true;
  };

  // ============================================================
  // NEXT STEP - COM SALVAMENTO ANTES DO CHECKOUT
  // ============================================================
  const nextStep = () => {
    if (!validateStep()) return;
    
    if (currentStep === 1) {
      const dadosIniciais = {
        ...formData,
        companyName: formData.companyName || '',
        cnpj: formData.cnpj || '',
      };
      iniciarDiagnosticoAdaptativo(dadosIniciais);
      setCurrentStep(2);
      if (onStepChange) onStepChange(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (currentStep === 4 && !formData.paymentConfirmed) {
      // 🔥 SALVAR O ESTADO COMPLETO ANTES DO CHECKOUT
      localStorage.setItem('tfazzio_diagnostic_data', JSON.stringify(formData));
      localStorage.setItem('tfazzio_diagnostic_step', String(currentStep));
      localStorage.setItem('tfazzio_diagnostic_awaiting_payment', 'true');
      console.log('💳 Salvando estado antes do checkout:', formData);
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

  // ============================================================
  // CONTINUAR APÓS PAGAMENTO
  // ============================================================
  const handleContinueAfterPayment = () => {
    console.log('🔄 Continuando após pagamento...');
    
    // 🔥 GARANTIR QUE OS DADOS ESTÃO NO FORM_DATA
    const savedData = localStorage.getItem('tfazzio_diagnostic_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed, paymentConfirmed: true }));
        console.log('✅ Dados restaurados no handleContinueAfterPayment:', parsed);
      } catch (e) {
        console.error('❌ Erro ao restaurar dados:', e);
      }
    }
    
    setShowSuccess(false);
    setFormData(prev => ({ ...prev, paymentConfirmed: true }));
    setCurrentStep(5);
    if (onStepChange) onStepChange(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================
  // GERAR DIAGNÓSTICO - ROTA V2
  // ============================================================
  const runDiagnosticCalculation = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setCurrentStep(15);
    if (onStepChange) onStepChange(15);

    // 🔥 GARANTIR QUE OS DADOS ESTÃO NO FORM_DATA
    const savedData = localStorage.getItem('tfazzio_diagnostic_data');
    let dadosParaEnviar = formData;
    
    // Se o formData estiver vazio mas o localStorage tiver dados, restaura
    if (savedData && !formData.paymentConfirmed) {
      try {
        const parsed = JSON.parse(savedData);
        dadosParaEnviar = { ...formData, ...parsed };
        setFormData(dadosParaEnviar);
        console.log('✅ Dados restaurados para o diagnóstico:', dadosParaEnviar);
      } catch (e) {
        console.error('❌ Erro ao restaurar dados:', e);
      }
    }

    // Se ainda assim estiver vazio, tenta restaurar do localStorage novamente
    if (!dadosParaEnviar.companyName && savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dadosParaEnviar = parsed;
        setFormData(parsed);
        console.log('✅ Dados restaurados do localStorage (fallback):', dadosParaEnviar);
      } catch (e) {
        console.error('❌ Erro ao restaurar dados (fallback):', e);
      }
    }

    console.log('📊 Dados enviados para diagnóstico:', dadosParaEnviar);

    const hipoteses = gerarHipoteses(dadosParaEnviar);
    const limitadorPrincipal = identificarLimitadorPrincipal(hipoteses, dadosParaEnviar);
    const proximoLimitador = limitadorPrincipal ? projetarProximoLimitador(limitadorPrincipal, dadosParaEnviar) : null;
    const simulacao = gerarResultadoSimulacao(dadosParaEnviar, dadosParaEnviar.mainGoal || 'crescer_faturamento');

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_PROCESSING_MS));

    const fetchResult = (async (): Promise<DiagnosticResult> => {
      try {
        const response = await fetch('/api/diagnostico/v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ...dadosParaEnviar, 
            hipoteses, 
            limitadorPrincipal, 
            proximoLimitador, 
            simulacao 
          }),
        });
        if (response.ok) {
          return (await response.json()) as DiagnosticResult;
        }
        return generateFullDiagnostic(dadosParaEnviar);
      } catch (e) {
        console.warn('API call failed, calculating locally:', e);
        return generateFullDiagnostic(dadosParaEnviar);
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
            {currentStep === 1 && (
              <WelcomeStep onStart={nextStep} />
            )}

            {currentStep === 2 && perguntaAtual && (
              <DynamicStep
                pergunta={perguntaAtual}
                onResponder={responderPergunta}
                isGratis={modoGratis}
                totalPerguntas={modoGratis ? 5 : 15}
                perguntasRespondidas={investigacao?.perguntasRespondidas.length || 0}
                onVoltar={voltarPergunta}
              />
            )}

            {currentStep === 2 && !perguntaAtual && (
              <div className="bg-white rounded-2xl p-8 border border-[#D8D3CB] text-center">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Carregando perguntas...</h2>
                <p className="text-[#5A6270]">Aguarde um momento enquanto preparamos seu diagnóstico personalizado.</p>
                <button 
                  onClick={() => {
                    const dadosIniciais = {
                      ...formData,
                      companyName: formData.companyName || 'Empresa Teste',
                      cnpj: formData.cnpj || '00000000000000',
                    };
                    iniciarDiagnosticoAdaptativo(dadosIniciais);
                  }}
                  className="mt-4 px-6 py-2 bg-[#6B0F1A] text-white rounded-lg hover:bg-[#500B13]"
                >
                  Tentar carregar novamente
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-2xl p-6 border border-[#D8D3CB]">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Objetivos & Desafios</h2>
                <p className="text-[#5A6270] text-sm mb-6">Vamos entender melhor o que você quer alcançar.</p>
                <button onClick={nextStep} className="w-full py-3 bg-[#6B0F1A] text-white font-bold rounded-xl">
                  Continuar
                </button>
              </div>
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

            {currentStep === 14 && (
              <ReviewStep 
                formData={formData} 
                onUpdate={updateFormData} 
                onRunDiagnostic={runDiagnosticCalculation}
                onPrevious={prevStep}
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

      {showPdfModal && diagnosticResult && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#D8D3CB] rounded-2xl p-6 max-w-4xl w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#D8D3CB] pb-3">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Visualização de Impressão e PDF - TFAZZIO</h3>
              <button onClick={() => setShowPdfModal(false)} className="text-[#5A6270] hover:text-[#1A1A1A] font-bold p-1 cursor-pointer">
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