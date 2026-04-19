"use client";

import { Component, type ReactNode } from "react";
import { MessageCircleMore, RefreshCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class CheckoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <section className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="glass-panel p-8">
          <h2 className="text-2xl font-bold text-white">Algo deu errado no checkout</h2>
          <p className="mt-3 text-white/70">
            Tente recarregar a página. Se o problema persistir, fale direto com a nossa equipe.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="btn-primary inline-flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Tentar novamente
            </button>
            <a
              href="https://wa.me/5521920137249?text=Preciso%20de%20ajuda%20com%20o%20checkout"
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp inline-flex items-center gap-2"
            >
              <MessageCircleMore className="h-4 w-4" />
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>
    );
  }
}
