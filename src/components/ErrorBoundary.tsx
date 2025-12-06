import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Log to console for debugging - in production, this could be sent to a monitoring service
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    console.error("Error Log:", JSON.stringify(errorLog, null, 2));
    
    // Store error in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem("momster_errors") || "[]");
      errors.push(errorLog);
      // Keep only last 10 errors
      if (errors.length > 10) errors.shift();
      localStorage.setItem("momster_errors", JSON.stringify(errors));
    } catch (e) {
      console.error("Failed to store error log:", e);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Ωχ! Κάτι πήγε στραβά 🌸
            </h1>
            
            <p className="text-muted-foreground mb-6">
              Λυπούμαστε για την ταλαιπωρία. Η ομάδα μας θα ενημερωθεί αυτόματα.
            </p>
            
            <div className="flex flex-col gap-3">
              <Button onClick={this.handleReload} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Δοκίμασε ξανά
              </Button>
              
              <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                Επιστροφή στην αρχική
              </Button>
            </div>
            
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 text-left">
                <details className="bg-destructive/5 rounded-lg p-4">
                  <summary className="text-sm font-medium text-destructive cursor-pointer">
                    Λεπτομέρειες σφάλματος (dev)
                  </summary>
                  <pre className="mt-2 text-xs text-destructive/80 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
