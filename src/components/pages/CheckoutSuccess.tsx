import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface CheckoutSuccessProps {
  onContinue?: () => void;
}

const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onContinue) onContinue();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F3]">
      <div className="bg-white border border-[#D8D3CB] rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-black text-[#1A1A1A]">Pagamento confirmado!</h1>
        <p className="text-[#5A6270] mt-2">Seu diagnóstico está sendo gerado...</p>
        <div className="mt-6">
          <div className="w-full bg-[#E8E2D8] h-2 rounded-full overflow-hidden">
            <div className="bg-[#6B0F1A] h-full animate-pulse w-1/2 rounded-full" />
          </div>
        </div>
        <p className="text-xs text-[#5A6270] mt-6">Você será redirecionado automaticamente.</p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;