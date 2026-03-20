import { useState } from "react";
import { useLocation } from "wouter";
import {
  LogOut,
  User,
  Bell,
  Lock,
  CreditCard,
  Settings as SettingsIcon,
  ChevronRight,
  Zap,
  Mail,
  Moon,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

interface SettingItem {
  id: string;
  label: string;
  description: string;
  type: "toggle" | "button" | "select";
  value?: boolean;
  onChange?: (value: boolean) => void;
}

export function Settings() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<string>("account");
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: true,
    shareAnalytics: false,
    biometric: false,
    autoSave: true,
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const sections: SettingsSection[] = [
    {
      id: "account",
      title: "Account",
      icon: <User className="w-5 h-5" />,
      description: "Manage your profile and account settings",
    },
    {
      id: "preferences",
      title: "Preferences",
      icon: <SettingsIcon className="w-5 h-5" />,
      description: "Customize your experience",
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: <Lock className="w-5 h-5" />,
      description: "Control your data and privacy",
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      description: "Manage notification preferences",
    },
    {
      id: "subscription",
      title: "Subscription",
      icon: <CreditCard className="w-5 h-5" />,
      description: "Manage your subscription and billing",
    },
  ];

  // Account Settings
  const renderAccountSettings = () => (
    <div className="space-y-4">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
            Download My Data
          </Button>
          <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );

  // Preferences Settings
  const renderPreferencesSettings = () => (
    <div className="space-y-4">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white font-medium">Dark Mode</p>
                <p className="text-sm text-slate-400">Use dark theme for the app</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("darkMode")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.darkMode ? "bg-orange-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.darkMode ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white font-medium">Language</p>
                <p className="text-sm text-slate-400">Choose your preferred language</p>
              </div>
            </div>
            <select className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-orange-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">App Behavior</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white font-medium">Auto-Save Scans</p>
                <p className="text-sm text-slate-400">Automatically save scan history</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("autoSave")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.autoSave ? "bg-orange-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.autoSave ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Privacy & Security Settings
  const renderPrivacySettings = () => (
    <div className="space-y-4">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white font-medium">Share Analytics</p>
                <p className="text-sm text-slate-400">Help improve ScanEat by sharing usage data</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("shareAnalytics")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.shareAnalytics ? "bg-orange-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.shareAnalytics ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white font-medium">Biometric Authentication</p>
                <p className="text-sm text-slate-400">Use fingerprint or face ID to unlock</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("biometric")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.biometric ? "bg-orange-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.biometric ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Privacy Documents</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700 justify-between">
            Privacy Policy <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700 justify-between">
            Terms of Service <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700 justify-between">
            Cookie Policy <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );

  // Notifications Settings
  const renderNotificationsSettings = () => (
    <div className="space-y-4">
      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-sm text-slate-400">Receive app notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("notifications")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.notifications ? "bg-orange-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-white font-medium">Email Updates</p>
                <p className="text-sm text-slate-400">Receive weekly nutrition tips and updates</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("emailUpdates")}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                settings.emailUpdates ? "bg-orange-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  settings.emailUpdates ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Notification Types</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-white">New features and updates</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-white">Nutrition tips and recommendations</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-white">Marketing and promotional offers</span>
          </label>
        </div>
      </Card>
    </div>
  );

  // Subscription Settings
  const renderSubscriptionSettings = () => (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-br from-orange-900 to-orange-800 border-orange-700">
        <h3 className="text-lg font-semibold text-white mb-4">Current Plan</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-200">Premium Tier</span>
            <span className="text-2xl font-bold text-white">$9.99/mo</span>
          </div>
          <p className="text-sm text-slate-300">
            You have unlimited scans and access to all premium features.
          </p>
          <Button className="w-full bg-white text-orange-600 hover:bg-slate-100">
            Upgrade to Premium+
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Billing Information</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400">Next Billing Date</p>
            <p className="text-white font-medium">April 1, 2026</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Payment Method</p>
            <p className="text-white font-medium">Visa ending in 4242</p>
          </div>
          <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
            Update Payment Method
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Subscription Actions</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full border-slate-600 hover:bg-slate-700">
            View Invoice History
          </Button>
          <Button variant="outline" className="w-full border-red-600 hover:bg-red-900 text-red-400">
            Cancel Subscription
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-orange-500" />
            Settings
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    activeSection === section.id
                      ? "bg-orange-500 text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {section.icon}
                  <span className="font-medium">{section.title}</span>
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeSection === "account" && renderAccountSettings()}
            {activeSection === "preferences" && renderPreferencesSettings()}
            {activeSection === "privacy" && renderPrivacySettings()}
            {activeSection === "notifications" && renderNotificationsSettings()}
            {activeSection === "subscription" && renderSubscriptionSettings()}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 max-w-sm mx-4">
            <h2 className="text-xl font-bold text-white mb-2">Confirm Logout</h2>
            <p className="text-slate-300 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 border-slate-600 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
