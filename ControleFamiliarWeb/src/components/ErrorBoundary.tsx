import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  temErro: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { temErro: false };

  static getDerivedStateFromError(): State {
    return { temErro: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro não tratado na aplicação:", error, info);
  }

  render() {
    if (this.state.temErro) {
      return (
        <div className="auth-page">
          <div className="auth-card">
            <h1 className="auth-title">Algo deu errado</h1>
            <p className="auth-subtitle">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>

            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
