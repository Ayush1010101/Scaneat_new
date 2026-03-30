import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Camera, Clock, Crown, Settings, Sparkles, TrendingUp, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin-slow" />
          </div>
          <p className="text-[hsl(var(--muted-foreground))] text-sm">Loading ScanEat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[hsl(var(--background))] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-glow pointer-events-none" />

        <div className="text-center max-w-sm relative z-10 animate-slide-up">
          {/* Logo */}
          <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-8 glow-emerald">
            <Sparkles className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-5xl font-extrabold mb-3 tracking-tight">
            <span className="text-gradient">Scan</span>
            <span className="text-[hsl(var(--foreground))]">Eat</span>
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] text-lg mb-10">
            Scan. Analyze. Eat Smart.
          </p>

          <a href={getLoginUrl()} className="block">
            <Button className="w-full h-14 gradient-primary text-white font-bold text-lg rounded-2xl border-0 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] glow-emerald">
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </Button>
          </a>

          <p className="text-[hsl(var(--muted-foreground))] text-xs mt-6 opacity-60">
            AI-powered nutrition analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-[hsl(var(--background))]">
      {/* Top glow effect */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] gradient-glow pointer-events-none z-0" />

      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">ScanEat</h1>
          </div>
          <button
            onClick={() => setLocation("/settings")}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Settings className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-5 py-6 relative z-10 space-y-6">
        {/* Greeting */}
        <div className="animate-slide-up">
          <p className="text-[hsl(var(--muted-foreground))] text-sm mb-1">{getGreeting()}</p>
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))]">
            {user.name?.split(" ")[0]} 👋
          </h2>
        </div>

        {/* Scan CTA - Hero Button */}
        <button
          onClick={() => setLocation("/scanner")}
          className="w-full rounded-3xl p-8 gradient-primary text-white text-center transition-all hover:scale-[1.02] active:scale-[0.98] animate-scale-in glow-emerald relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Scan Food</h3>
            <p className="text-white/80 text-sm">Take a photo and get instant nutrition info</p>
          </div>
        </button>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3 animate-slide-up stagger-2">
          <div className="glass-card p-4 text-center">
            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">0</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs">Scans Today</p>
          </div>
          <div className="glass-card p-4 text-center">
            <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">0</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs">Calories</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Crown className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">0</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs">Streak</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 animate-slide-up stagger-3">
          <button
            onClick={() => setLocation("/history")}
            className="w-full glass-card p-5 flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[hsl(var(--foreground))]">Scan History</h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">View your past scans</p>
            </div>
            <svg className="w-5 h-5 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <button
            onClick={() => setLocation("/premium")}
            className="w-full glass-card p-5 flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[hsl(var(--foreground))]">Premium</h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Unlock advanced features</p>
            </div>
            <svg className="w-5 h-5 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <button
            onClick={() => setLocation("/profile")}
            className="w-full glass-card p-5 flex items-center gap-4 text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-[hsl(var(--foreground))]">Profile & Settings</h4>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Manage your preferences</p>
            </div>
            <svg className="w-5 h-5 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
