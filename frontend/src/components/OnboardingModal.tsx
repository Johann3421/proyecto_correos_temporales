import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Zap, Forward, Check, X, Sparkles } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Zap className="w-8 h-8 text-accent-500" />,
      tag: "Buzón al instante",
      title: "Tu correo temporal listo en 1 segundo",
      description: "Genera direcciones limpias con subdominios dinámicos. Recibe correos de confirmación y registros sin exponer tu dirección personal.",
      highlight: "Sincronización en vivo con WebSockets: los mensajes llegan de inmediato.",
    },
    {
      icon: <Forward className="w-8 h-8 text-ok-DEFAULT" />,
      tag: "Reenvío Inteligente",
      title: "Reenvía a tu Gmail o Outlook real",
      description: "Usa tus bandejas temporales como un escudo de privacidad: todos los correos importantes se redirigen automáticamente a tu bandeja principal.",
      highlight: "Tú decides cuándo activar o pausar el reenvío con un solo clic.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-accent-400" />,
      tag: "Control Total",
      title: "Múltiples bandejas, reglas y exportación",
      description: "Gestiona varios buzones simultáneos, crea alertas automáticas para dominios específicos y descarga tus correos en formato .eml o PDF.",
      highlight: "Sin publicidad invasiva. Privacidad real y permanente.",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator pills */}
        <div className="flex items-center gap-1.5 mb-6">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-accent-600'
                  : idx < currentStep
                  ? 'w-3 bg-accent-400/50'
                  : 'w-3 bg-surface-200 dark:bg-surface-800'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="space-y-4 min-h-[220px]">
          <div className="inline-flex p-3 rounded-xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
            {current.icon}
          </div>

          <div>
            <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-accent-700 dark:text-accent-400">
              {current.tag}
            </span>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 mt-1 leading-snug">
              {current.title}
            </h2>
          </div>

          <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
            {current.description}
          </p>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-xs text-surface-700 dark:text-surface-300">
            <Sparkles className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
            <span>{current.highlight}</span>
          </div>
        </div>

        {/* Action footer */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-surface-200 dark:border-surface-800">
          <button
            onClick={onClose}
            className="text-xs font-medium text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
          >
            Saltar introducción
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-700 hover:bg-accent-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <span>{currentStep === steps.length - 1 ? 'Empezar ahora' : 'Siguiente'}</span>
            {currentStep === steps.length - 1 ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
