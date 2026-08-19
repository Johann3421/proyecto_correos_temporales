import React, { useState } from 'react';
import { HelpCircle, X, Send, Check, MessageSquare, ChevronDown, ChevronUp, Mail, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface SupportModalProps {
  isOpen: boolean;
  sessionToken?: string;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, sessionToken, onClose }) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "¿Por qué tarda en llegar un correo de verificación?",
      a: "La mayoría de servicios envían códigos en 2 a 10 segundos. Si el remitente tiene retrasos por colas internas o filtrado greylisting, puede tardar hasta 1 minuto. Nuestro servidor procesa los correos instantáneamente vía WebSocket.",
    },
    {
      q: "¿Cómo funciona el reenvío a Gmail u Outlook?",
      a: "En la tarjeta de tu buzón pulsa en 'Reenvío', ingresa tu correo real y activa la casilla. Cada correo recibido se reenviará con el encabezado [AirInbox] sin revelar tu dirección personal a terceros.",
    },
    {
      q: "¿Mis bandejas o mensajes se borran solos?",
      a: "No. Tus buzones permanecen activos de forma indefinida hasta que tú decidas eliminarlos. Además, los mensajes que marques como 'Guardar' se conservan permanentemente en tu historial.",
    },
    {
      q: "¿Puedo tener varios buzones abiertos a la vez?",
      a: "Sí. Puedes crear múltiples bandejas simultáneas, asignarles un nombre personalizado (ej: 'Netflix', 'Bancario') y cambiar entre ellas desde la barra de bandejas.",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.submitSupport({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'Consulta de soporte AirInbox',
        message: message.trim(),
        session_token: sessionToken,
      });
      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 2000);
    } catch {
      setError('No se pudo enviar el mensaje. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-2xl p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-2.5 rounded-lg bg-accent-50 dark:bg-accent-950/50 border border-accent-200 dark:border-accent-800/50 text-accent-600">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
              Centro de Ayuda y Soporte
            </h3>
            <p className="text-xs text-surface-500">
              Atención directa y respuestas a preguntas frecuentes
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-surface-200 dark:border-surface-800 mb-4">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'faq'
                ? 'border-accent-600 text-accent-700 dark:text-accent-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Preguntas frecuentes
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'contact'
                ? 'border-accent-600 text-accent-700 dark:text-accent-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Escribir a soporte
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'faq' ? (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {faqs.map((faq, idx) => {
              const isExpanded = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between p-3 text-left text-xs font-semibold text-surface-900 dark:text-surface-100 hover:text-accent-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0 ml-2" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-2" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 text-xs text-surface-600 dark:text-surface-400 leading-relaxed border-t border-surface-200/50 dark:border-surface-800/50 pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {isSent ? (
              <div className="p-8 text-center bg-ok-DEFAULT/10 border border-ok-DEFAULT/20 rounded-xl text-ok-DEFAULT space-y-2">
                <Check className="w-8 h-8 mx-auto" />
                <h4 className="font-bold text-sm">¡Mensaje recibido!</h4>
                <p className="text-xs text-surface-600 dark:text-surface-300">
                  Nuestro equipo de soporte revisará tu consulta a la brevedad.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-2xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                      Tu correo de contacto
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu-correo@gmail.com"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-medium text-surface-600 dark:text-surface-400 mb-1">
                    Mensaje o consulta
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    className="w-full px-3 py-2 text-xs rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
                    required
                  />
                </div>

                {error && (
                  <p className="text-2xs text-fail-light dark:text-fail-dark">{error}</p>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-700 hover:bg-accent-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSubmitting ? 'Enviando…' : 'Enviar consulta'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
