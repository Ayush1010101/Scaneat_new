import { ArrowLeft, Zap, TrendingUp, Share2, Calendar, BarChart3, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Premium() {
  const [, navigate] = useLocation();

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: "Advanced AI", description: "99% accuracy food detection", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Insights", description: "Weekly nutrition reports", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: <Share2 className="w-6 h-6" />, title: "Social", description: "Share beautiful graphics", color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { icon: <Calendar className="w-6 h-6" />, title: "Meal Plans", description: "AI-powered suggestions", color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Dashboard", description: "Health analytics", color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="min-h-screen pb-28 bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          </button>
          <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">Premium</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        {/* Hero */}
        <div className="glass-card p-8 text-center animate-scale-in relative overflow-hidden">
          <div className="absolute inset-0 gradient-glow" />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 glow-emerald">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
              <span className="text-gradient">Coming Soon</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
              Unlock powerful features for your nutrition journey
            </p>
            <button className="px-8 py-3.5 gradient-primary text-white font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] glow-emerald">
              Notify Me
            </button>
          </div>
        </div>

        {/* Features */}
        <div>
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 px-1">What's Coming</h3>
          <div className="space-y-3">
            {features.map((feature, i) => (
              <div
                key={i}
                className="glass-card p-5 flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-[hsl(var(--foreground))] text-sm">{feature.title}</h4>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div>
          <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3 px-1">Benefits</h3>
          <div className="glass-card p-5 space-y-3">
            {[
              "99% accurate food recognition",
              "Personalized meal recommendations",
              "Weekly nutrition trends",
              "Beautiful social media graphics",
              "Priority support & early access",
            ].map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
