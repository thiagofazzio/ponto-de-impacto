import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isLastStep?: boolean;
  showPrevious?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  nextLabel = 'Avançar',
  isNextDisabled = false,
  isLastStep = false,
  showPrevious = true,
}) => {
  return (
    <div className="flex justify-between items-center pt-6 border-t border-[#D8D3CB] mt-6">
      <div>
        {showPrevious && currentStep > 1 && (
          <button
            onClick={onPrevious}
            className="
              flex items-center gap-2
              px-4 py-2
              text-[#6B0F1A] font-semibold
              hover:bg-[#F9F7F3] rounded-lg
              transition
            "
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[#5A6270]">
          Etapa {currentStep} de {totalSteps}
        </span>
        
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`
            flex items-center gap-2
            px-6 py-2.5
            bg-[#6B0F1A] text-white font-bold
            rounded-lg
            hover:bg-[#500B13]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition
          `}
        >
          {isLastStep ? 'Finalizar' : nextLabel}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};