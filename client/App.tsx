import "./global.css";
import "./i18n";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import TappNiVidhi from "./pages/TappNiVidhi";
import Booking from "./pages/Booking";
import AvailableDates from "./pages/AvailableDates";
import Anumodana from "./pages/Anumodana";
import Vidhinav from "./pages/Vidhinav";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle language changes on document
function LanguageHandler() {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.className = `lang-${i18n.language}`;
  }, [i18n.language]);
  
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageHandler />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/tapp-ni-vidhi" element={<TappNiVidhi />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/available-dates" element={<AvailableDates />} />
          <Route path="/anumodana" element={<Anumodana />} />
          <Route path="/vidhinav" element={<Vidhinav />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
