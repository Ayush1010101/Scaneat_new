import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft, Zap, TrendingUp, Share2, Calendar, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";

export default function Premium() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Advanced AI Analysis",
      description: "Ultra-precise food detection with 99% accuracy",
      color: "from-orange-400 to-orange-600",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Personalized Insights",
      description: "Weekly nutrition reports and health trends",
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Social Sharing",
      description: "Share results with watermarked graphics",
      color: "from-green-400 to-green-600",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Meal Planning",
      description: "AI-powered meal suggestions & planning",
      color: "from-purple-400 to-purple-600",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Nutrition Dashboard",
      description: "Comprehensive health analytics & tracking",
      color: "from-pink-400 to-pink-600",
    },
  ];

  return (
    <div className={`min-h-screen pb-24 transition-colors duration-300 ${
      theme === "dark"
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        : "bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50"
    }`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-800/80" : "bg-white/80"
      } backdrop-blur-md border-b ${
        theme === "dark" ? "border-gray-700" : "border-orange-100"
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className={`p-2 rounded-full transition-colors ${
                theme === "dark"
                  ? "hover:bg-gray-700 text-gray-300"
                  : "hover:bg-orange-100 text-gray-700"
              }`}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className={`text-2xl md:text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}>
              Premium Features
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className={`rounded-3xl p-8 md:p-12 mb-12 transition-colors ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600"
            : "bg-gradient-to-br from-orange-400 to-orange-500 border border-orange-300"
        }`}>
          <div className="text-center">
            <div className="text-5xl md:text-6xl mb-4">✨</div>
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === "dark" ? "text-white" : "text-white"
            }`}>
              Coming Soon
            </h2>
            <p className={`text-lg mb-8 ${
              theme === "dark" ? "text-gray-300" : "text-white/90"
            }`}>
              Unlock powerful premium features to take your nutrition tracking to the next level
            </p>
            <button className={`px-8 py-3 rounded-full font-bold transition-all transform hover:scale-105 ${
              theme === "dark"
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "bg-white hover:bg-gray-100 text-orange-500"
            }`}>
              Notify Me When Available
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className={`text-2xl md:text-3xl font-bold mb-8 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            What's Coming
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`rounded-2xl p-6 md:p-8 transition-all transform hover:scale-105 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-gray-700 hover:border-gray-600"
                    : "bg-white border border-orange-100 hover:border-orange-300"
                }`}
              >
                <div className={`inline-block p-4 rounded-xl mb-4 bg-gradient-to-br ${feature.color} text-white`}>
                  {feature.icon}
                </div>
                <h4 className={`text-xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  {feature.title}
                </h4>
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className={`rounded-2xl p-8 md:p-12 transition-colors ${
          theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-orange-100"
        }`}>
          <h3 className={`text-2xl md:text-3xl font-bold mb-6 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}>
            Why Go Premium?
          </h3>
          <div className="space-y-4">
            {[
              "Get 99% accurate food recognition with advanced AI",
              "Receive personalized meal recommendations based on your goals",
              "Track weekly nutrition trends and health metrics",
              "Share beautiful nutrition graphics on social media",
              "Access exclusive health insights and reports",
              "Priority support and early access to new features",
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold mt-1">
                  ✓
                </div>
                <p className={`text-lg ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className={`text-lg mb-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}>
            Be the first to know when premium features launch
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold rounded-full transition-all transform hover:scale-105">
            Get Early Access
          </button>
        </div>
      </div>
    </div>
  );
}
