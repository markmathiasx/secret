/**
 * Payment Error Boundary - Prevents payment components from crashing the page
 *
 * This component wraps all payment components (Mercado Pago Brick, Pix Card, etc.)
 * and ensures they can fail gracefully without breaking the entire checkout flow.
 */

"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { whatsappNumber } from "@/lib/constants";
import { logStructured } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    const componentName = this.props.componentName || "PaymentComponent";
    
    logStructured("error", "payment_component_error", {
      componentName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      const componentName = this.props.componentName || "Pagamento";
      
      return (
        <div className="rounded-[24px] border border-red-400/30 bg-red-400/10 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-red-300" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-200">Erro no {componentName}</h3>
              <p className="mt-2 text-sm text-red-100/80">
                Desculpe, houve um problema ao carregar o formulário de pagamento.
              </p>
              <p className="mt-3 text-xs text-red-100/60">
                {this.state.error?.message || "Erro desconhecido"}
              </p>
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="rounded-lg border border-red-300/30 bg-red-300/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-300/20"
                >
                  ↻ Recarregar página
                </button>
                <p className="text-xs text-red-100/60">
                  Se o problema persistir, entre em contato via WhatsApp: <strong>+{whatsappNumber}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.fallback || this.props.children;
  }
}
