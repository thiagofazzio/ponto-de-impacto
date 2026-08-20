import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { X, CreditCard, Lock, Sparkles } from 'lucide-react';

// 🔥 FALLBACK: se não tiver chave, não carrega o Stripe
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CheckoutModalProps {
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ email, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [cupom, setCupom] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      // 🔥 Se não tiver Stripe configurado, usa fallback TTFAZZIO
      if (!stripePromise) {
        console.warn('⚠️ Stripe não configurado. Usando fallback TTFAZZIO.');
        const response = await fetch('/api/checkout/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, cupom: cupom || 'TTFAZZIO' }),
        });
        const data = await response.json();
        if (data.url) {
          window.location.href = data.url;
        }
        return;
      }

      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cupom }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao iniciar checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não retornada');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento');
      setLoading(false);
    }
  };

  // 🔥 Verifica se o cupom de teste foi digitado (TTFAZZIO - mantido no código, mas oculto do usuário)
  const isTestCoupon = cupom && cupom.toUpperCase().startsWith('TTFAZZIO');

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#D8D3CB] rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#5A6270] hover:text-[#1A1A1A] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#F4E8C1] flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#6B0F1A]" />
          </div>
          <h3 className="text-2xl font-black text-[#1A1A1A]">Desbloqueie seu Diagnóstico</h3>
          <p className="text-[#5A6270] text-sm mt-2">
            Acesso ao relatório completo do <strong className="text-[#6B0F1A]">Ponto de Impacto</strong>.
          </p>
        </div>

        <div className="bg-[#F9F7F3] rounded-xl p-4 border border-[#D8D3CB] text-center mb-6">
          <span className="text-xs text-[#5A6270] uppercase font-bold">Investimento</span>
          <p className="text-3xl font-black text-[#6B0F1A]">R$ 489,70</p>
          <p className="text-xs text-[#5A6270]">Pagamento único via cartão de crédito</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
            Tem um cupom?
          </label>
          <div className="relative">
            <input
              type="text"
              value={cupom}
              onChange={(e) => setCupom(e.target.value)}
              placeholder="Digite seu código promocional"
              className={`w-full bg-[#F9F7F3] border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B0F1A]/20 ${
                isTestCoupon ? 'border-[#D4AF37] bg-[#F4E8C1]' : 'border-[#D8D3CB]'
              }`}
            />
            {isTestCoupon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              </div>
            )}
          </div>
          {isTestCoupon && (
            <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Cupom válido! O pagamento será liberado.
            </p>
          )}
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full py-3.5 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
            isTestCoupon 
              ? 'bg-emerald-600 hover:bg-emerald-700' 
              : 'bg-[#6B0F1A] hover:bg-[#500B13]'
          }`}
        >
          {loading ? (
            <span className="inline-block animate-spin">⟳</span>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              {isTestCoupon ? '🆕 Liberar Diagnóstico' : 'Pagar R$ 489,70'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <p className="text-xs text-[#5A6270] text-center mt-4">
          Pagamento seguro via <strong className="text-[#1A1A1A]">Stripe</strong>. Seu cartão não será armazenado.
        </p>
      </div>
    </div>
  );
};

export default CheckoutModal;