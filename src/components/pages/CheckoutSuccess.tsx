import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface CheckoutSuccessProps {
  onContinue: () => void;
}

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ onContinue }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Preparando seu diagnóstico...');

  useEffect(() => {
    const steps = [
      { progress: 20, text: 'Pagamento confirmado!' },
      { progress: 40, text: 'Preparando seu diagnóstico...' },
      { progress: 60, text: 'Analisando os dados da empresa...' },
      { progress: 80, text: 'Quase lá...' },
      { progress: 100, text: 'Pronto! Redirecionando...' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setStatus(steps[currentStep].text);
      }
      if (currentStep === steps.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          onContinue();
        }, 800);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [onContinue]);

  return (
    <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-[#D8D3CB] rounded-3xl shadow-xl text-center space-y-8">
      {/* 🔥 SPINNER ANIMADO - SEM QUADRADO VERDE */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        {/* Anel externo pulsante - TFAZZIO */}
        <div className="absolute inset-0 bg-[#6B0F1A]/5 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        
        {/* Anel médio girando - TFAZZIO */}
        <div className="absolute inset-1 rounded-full border-4 border-[#D8D3CB] border-t-[#6B0F1A] animate-spin" style={{ animationDuration: '1.5s' }} />
        
        {/* Anel interno girando em sentido oposto - Dourado */}
        <div className="absolute inset-3 rounded-full border-4 border-[#D8D3CB]/50 border-b-[#D4AF37] animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        
        {/* 🔥 ÍCONE CENTRAL - SEM QUADRADO, APENAS O ÍCONE */}
        <div className="relative z-10">
          {progress < 100 ? (
            <Loader2 className="w-10 h-10 text-[#6B0F1A] animate-spin" strokeWidth={2} />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2} />
          )}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-black text-[#1A1A1A]">
          {progress === 100 ? '✅ Diagnóstico Liberado!' : 'Pagamento Confirmado!'}
        </h3>
        <p className="text-[#5A6270] text-sm mt-1">
          {status}
        </p>
      </div>

      {/* Barra de progresso com brilho - TFAZZIO */}
      <div className="relative w-full bg-[#E8E2D8] h-3 rounded-full overflow-hidden border border-[#D8D3CB]">
        <div 
          className="bg-[#6B0F1A] h-full transition-all duration-500 rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        </div>
      </div>

      {/* Status atual */}
      <div className="text-xs text-[#5A6270] font-medium">
        {progress < 100 ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#6B0F1A] rounded-full animate-pulse" />
            Processando...
          </span>
        ) : (
          <span className="text-emerald-700 font-bold">✅ Redirecionando para o diagnóstico...</span>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default CheckoutSuccess;