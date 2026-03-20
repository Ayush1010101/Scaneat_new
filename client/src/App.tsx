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
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] to-purple-900/50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-12 bg-purple-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--background))] via-purple-900/30 to-[hsl(var(--background))]">
      <Router />
      {isAuthenticated && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
