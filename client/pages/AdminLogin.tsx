import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { api } from "@/lib/api";

export default function AdminLogin() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (api.isAuthenticated()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.login(username, password);
      if (response.success) {
        // Use hard redirect to ensure ProtectedRoute re-checks auth
        window.location.href = "/admin";
      } else {
        setError(response.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading font-semibold text-2xl text-amber-900">
              {t("admin.loginTitle", "Admin Login")}
            </h1>
            <p className="font-body text-amber-600 mt-2">
              {t("admin.loginSubtitle", "Enter your credentials to access the admin panel")}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-body text-sm text-amber-700">
                {t("admin.username", "Username")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="pl-10 font-body"
                  placeholder={t("admin.usernamePlaceholder", "Enter username")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-body text-sm text-amber-700">
                {t("admin.password", "Password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 font-body"
                  placeholder={t("admin.passwordPlaceholder", "Enter password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 font-heading font-semibold text-lg"
            >
              {loading ? t("admin.loggingIn", "Logging in...") : t("admin.login", "Login")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="font-body text-sm text-blue-600 hover:underline">
              {t("admin.backToHome", "← Back to Home")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
