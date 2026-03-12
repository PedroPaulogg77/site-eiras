import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in application:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="bg-destructive/10 text-destructive p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-foreground">
                                Oops! Algo deu errado.
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Desculpe, encontramos um erro inesperado ao carregar esta página. Nossa equipe técnica já pode ter sido notificada.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="p-4 bg-secondary border border-border rounded-md text-left overflow-auto max-h-40">
                                <p className="text-xs text-destructive font-mono">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Button
                                variant="default"
                                onClick={() => window.location.reload()}
                                className="w-full sm:w-auto"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Tentar Novamente
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/'}
                                className="w-full sm:w-auto"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Voltar para Início
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
