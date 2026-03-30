import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import ScanHistory from "./pages/ScanHistory";
import ScanDetail from "./pages/ScanDetail";
import UserProfile from "./pages/UserProfile";
import Premium from "./pages/Premium";
import AdminPanel from "./pages/AdminPanel";
import { Settings } from "./pages/Settings";
import BottomNavigation from "./components/BottomNavigation";
import { Sparkles } from "lucide-react";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {isAuthenticated && (
        <>
          <Route path={"/scanner"} component={Scanner} />
          <Route path={"/history"} component={ScanHistory} />
          <Route path={"/scan/:id"} component={ScanDetail} />
          <Route path={"/profile"} component={UserProfile} />
          <Route path={"/premium"} component={Premium} />
          <Route path={"/admin"} component={AdminPanel} />
          <Route path={"/settings"} component={Settings} />
        </>
      )}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-[hsl(var(--muted-foreground))] text-sm font-medium">ScanEat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Router />
      {isAuthenticated && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "hsl(222 47% 9%)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "hsl(210 20% 95%)",
              },
            }}
          />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
