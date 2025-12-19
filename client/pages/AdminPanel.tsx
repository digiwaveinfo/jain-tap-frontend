import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, Submission } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LogOut, Search, Download, RefreshCw, Trash2, Eye, ChevronLeft, ChevronRight,
  Users, Calendar, FileSpreadsheet, Activity, Check, X, CheckCircle, XCircle,
  LayoutDashboard, Image as ImageIcon, Settings
} from "lucide-react";
import { AdminCalendar } from "@/components/admin/AdminCalendar";
import { AdminGallery } from "@/components/admin/AdminGallery";
import { AdminSettings } from "@/components/admin/AdminSettings";

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg font-body text-sm animate-in slide-in-from-top-2",
      type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
    )}>
      {type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  const handleCloseToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate("/admin/login");
      return;
    }
    fetchSubmissions();
    fetchStats();
  }, [page]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const response = await api.getSubmissions(page, 20);
      if (response.success) {
        setSubmissions(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotal(response.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getStatistics();
      if (response.success) {
        setStats(response.data as Record<string, unknown>);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchSubmissions();
      return;
    }
    setLoading(true);
    try {
      const response = await api.searchSubmissions(searchQuery);
      if (response.success && response.data) {
        setSubmissions(response.data);
        setTotalPages(1);
        setTotal(response.data.length);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await api.exportSubmissions();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `submissions_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      showToast(t("admin.exportSuccess", "Export successful"), "success");
    } catch (error) {
      console.error("Export failed:", error);
      showToast(t("admin.exportFailed", "Export failed"), "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.confirmDelete", "Are you sure you want to delete this submission?"))) return;
    try {
      await api.deleteSubmission(id);
      fetchSubmissions();
      fetchStats();
      showToast(t("admin.deleteSuccess", "Deleted successfully"), "success");
    } catch (error) {
      console.error("Delete failed:", error);
      showToast(t("admin.deleteFailed", "Delete failed"), "error");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.updateSubmission(id, { status: newStatus });
      fetchSubmissions();
      fetchStats();
      showToast(t("admin.statusUpdated", "Status updated"), "success");
    } catch (error) {
      console.error("Status update failed:", error);
      showToast(t("admin.statusUpdateFailed", "Status update failed"), "error");
    }
  };

  const handleLogout = () => {
    api.logout();
    navigate("/admin/login");
  };

  const viewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const { i18n } = useTranslation();
  const user = api.getUser();

  // Format date to DD/MM/YYYY based on language
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const yyyy = date.getFullYear();

      // Convert to Gujarati numerals if language is Gujarati
      if (i18n.language === 'gu') {
        const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
        const toGujarati = (str: string) => str.split('').map(d => /\d/.test(d) ? gujaratiDigits[parseInt(d)] : d).join('');
        return `${toGujarati(dd)}/${toGujarati(mm)}/${toGujarati(String(yyyy))}`;
      }

      // Convert to Hindi numerals if language is Hindi
      if (i18n.language === 'hi') {
        const hindiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
        const toHindi = (str: string) => str.split('').map(d => /\d/.test(d) ? hindiDigits[parseInt(d)] : d).join('');
        return `${toHindi(dd)}/${toHindi(mm)}/${toHindi(String(yyyy))}`;
      }

      return `${dd}/${mm}/${yyyy}`;
    } catch {
      return dateStr;
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language;

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Toast Notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={handleCloseToast} />
      )}

      {/* Header */}
      <header className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="font-heading font-semibold text-lg sm:text-xl">
              {t("admin.panelTitle", "Admin Panel")}
            </h1>
            <p className="text-orange-200 text-xs sm:text-sm font-body">
              {t("admin.welcome", "Welcome")}, {user?.username}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Language Switcher */}
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <button
                  onClick={() => changeLanguage('gu')}
                  className={cn(
                    "px-2 py-1 text-xs sm:text-sm rounded font-body transition-colors",
                    currentLang === 'gu' ? "bg-white text-amber-900" : "text-orange-200 hover:text-white"
                  )}
                >
                  ગુજ
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={cn(
                    "px-2 py-1 text-xs sm:text-sm rounded font-body transition-colors",
                    currentLang === 'en' ? "bg-white text-amber-900" : "text-orange-200 hover:text-white"
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage('hi')}
                  className={cn(
                    "px-2 py-1 text-xs sm:text-sm rounded font-body transition-colors",
                    currentLang === 'hi' ? "bg-white text-amber-900" : "text-orange-200 hover:text-white"
                  )}
                >
                  हि
                </button>
              </div>
            </div>
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-white text-white bg-transparent hover:bg-white hover:text-amber-900"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="font-body hidden sm:inline">{t("admin.logout", "Logout")}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-1 overflow-x-auto">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className="gap-2"
          >
            <LayoutDashboard className="w-4 h-4" /> {t("admin.dashboard")}
          </Button>
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('calendar')}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" /> {t("admin.calendar")}
          </Button>
          <Button
            variant={activeTab === 'gallery' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('gallery')}
            className="gap-2"
          >
            <ImageIcon className="w-4 h-4" /> {t("admin.gallery")}
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="gap-2"
          >
            <Settings className="w-4 h-4" /> {t("admin.settings")}
          </Button>
        </div>

        {activeTab === 'calendar' && <AdminCalendar showToast={showToast} />}
        {activeTab === 'gallery' && <AdminGallery showToast={showToast} />}
        {activeTab === 'settings' && <AdminSettings showToast={showToast} />}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
                <StatCard
                  icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label={t("admin.totalSubmissions", "Total Submissions")}
                  value={String((stats as { total?: number }).total || 0)}
                  color="bg-blue-500"
                />
                <StatCard
                  icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label={t("admin.todaySubmissions", "Today")}
                  value={String((stats as { today?: number }).today || 0)}
                  color="bg-green-500"
                />
                <StatCard
                  icon={<FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label={t("admin.pendingSubmissions", "Pending")}
                  value={String((stats as { pending?: number }).pending || 0)}
                  color="bg-yellow-500"
                />
                <StatCard
                  icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label={t("admin.thisMonth", "This Month")}
                  value={String((stats as { reviewed?: number }).reviewed || 0)}
                  color="bg-purple-500"
                />
              </div>
            )}

            {/* Actions Bar */}
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                <div className="flex gap-2 flex-1 min-w-0">
                  <Input
                    type="text"
                    placeholder={t("admin.searchPlaceholder", "Search by name, mobile, city...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1 min-w-0 text-sm"
                  />
                  <Button onClick={handleSearch} variant="outline" size="sm" className="shrink-0">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button onClick={fetchSubmissions} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("admin.refresh", "Refresh")}</span>
                  </Button>
                  <Button onClick={handleExport} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("admin.download", "Download")}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="block sm:hidden space-y-3">
              {loading ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-amber-500 font-body">
                  {t("admin.loading", "Loading...")}
                </div>
              ) : submissions.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-amber-500 font-body">
                  {t("admin.noData", "No submissions found")}
                </div>
              ) : (
                submissions.map((sub, idx) => (
                  <div key={sub.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-body text-xs text-amber-500">#{(page - 1) * 20 + idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-body ${sub.status === "confirmed" ? "bg-green-100 text-green-700" :
                          sub.status === "rejected" ? "bg-red-100 text-red-700" :
                            sub.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-yellow-100 text-yellow-700"
                          }`}>
                          {sub.status || "pending"}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-body font-semibold text-base mb-2">{sub.name}</h3>
                    <div className="space-y-1 text-sm font-body text-amber-600">
                      <p><span className="text-amber-400">{t("admin.bookingDate", "બુકિંગ તારીખ")}:</span> {formatDate(sub.bookingDate)}</p>
                      <p><span className="text-amber-400">{t("admin.city", "શહેર")}:</span> {sub.city}</p>
                      <p><span className="text-amber-400">{t("admin.school", "આયંબિલ શાળા")}:</span> {sub.ayambilShalaName}</p>
                    </div>
                    {/* Status Update Buttons for Mobile */}
                    {(sub.status === "pending" || !sub.status) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t">
                        <button
                          onClick={() => handleStatusUpdate(sub.id, "confirmed")}
                          className="flex-1 py-2 text-green-600 bg-green-50 rounded text-sm font-body flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" /> {t("admin.confirmed", "Confirmed")}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(sub.id, "rejected")}
                          className="flex-1 py-2 text-red-600 bg-red-50 rounded text-sm font-body flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" /> {t("admin.rejected", "Rejected")}
                        </button>
                      </div>
                    )}
                    <div className={`flex gap-2 ${(sub.status === "pending" || !sub.status) ? "mt-2" : "mt-3 pt-3 border-t"}`}>
                      <button
                        onClick={() => viewSubmission(sub)}
                        className="flex-1 py-2 text-blue-600 bg-blue-50 rounded text-sm font-body flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> {t("admin.submissionDetails", "Details")}
                      </button>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 text-red-600 bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm">#</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm">{t("admin.submissionDate", "સબમિશન તારીખ")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm">{t("admin.bookingDate", "બુકિંગ તારીખ")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm">{t("admin.name", "નામ")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm hidden lg:table-cell">{t("admin.upiNumber", "UPI નંબર")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm hidden lg:table-cell">{t("admin.whatsappNumber", "WhatsApp નંબર")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm hidden xl:table-cell">{t("admin.school", "આયંબિલ શાળા")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm">{t("admin.city", "શહેર")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm">{t("admin.status", "સ્થિતિ")}</th>
                      <th className="px-2 py-2 text-left font-body font-semibold text-xs lg:text-sm">{t("admin.actions", "ક્રિયાઓ")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-amber-500 font-body">
                          {t("admin.loading", "Loading...")}
                        </td>
                      </tr>
                    ) : submissions.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-amber-500 font-body">
                          {t("admin.noData", "No submissions found")}
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub, idx) => (
                        <tr key={sub.id} className="border-t hover:bg-amber-50">
                          <td className="px-2 py-2 font-body text-xs lg:text-sm">{(page - 1) * 20 + idx + 1}</td>
                          <td className="px-2 py-2 font-body text-xs lg:text-sm">{formatDate(sub.submissionDate || sub.createdAt)}</td>
                          <td className="px-2 py-2 font-body text-xs lg:text-sm">{formatDate(sub.bookingDate)}</td>
                          <td className="px-2 py-2 font-body text-xs lg:text-sm font-medium max-w-[100px] truncate">{sub.name}</td>
                          <td className="px-2 py-2 font-body text-xs lg:text-sm hidden lg:table-cell">{sub.upiNumber}</td>
                          <td className="px-2 py-2 font-body text-xs lg:text-sm hidden lg:table-cell">{sub.whatsappNumber}</td>
                          <td className="px-2 py-2 font-body text-xs lg:text-sm hidden xl:table-cell max-w-[150px] truncate">{sub.ayambilShalaName}</td>
                          <td className="px-2 py-2 font-body text-xs lg:text-sm">{sub.city}</td>
                          <td className="px-2 py-2">
                            <div className="flex items-center gap-1">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-body ${sub.status === "confirmed" ? "bg-green-100 text-green-700" :
                                sub.status === "rejected" ? "bg-red-100 text-red-700" :
                                  sub.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-yellow-100 text-yellow-700"
                                }`}>
                                {sub.status || "pending"}
                              </span>
                              {(sub.status === "pending" || !sub.status) && (
                                <div className="flex gap-0.5 ml-1">
                                  <button
                                    onClick={() => handleStatusUpdate(sub.id, "confirmed")}
                                    className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                                    title={t("admin.confirmed", "Confirmed")}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(sub.id, "rejected")}
                                    className="p-0.5 text-red-600 hover:bg-red-50 rounded"
                                    title={t("admin.rejected", "Rejected")}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => viewSubmission(sub)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - only show when more than 1 page */}
              {totalPages > 1 && (
                <div className="px-3 py-2 border-t flex justify-between items-center">
                  <p className="font-body text-xs lg:text-sm text-amber-600">
                    {t("admin.showing", "Showing")} {submissions.length} {t("admin.of", "of")} {total}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-2 py-1 font-body text-xs lg:text-sm">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Pagination - only show when more than 1 page */}
            {totalPages > 1 && (
              <div className="block sm:hidden mt-4 bg-white rounded-lg shadow p-3 flex justify-between items-center">
                <p className="font-body text-xs text-amber-600">
                  {submissions.length} / {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="px-2 py-1 font-body text-sm">
                    {page}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {
        showModal && selectedSubmission && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="font-heading font-semibold text-xl">
                    {t("admin.submissionDetails", "Submission Details")}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-amber-400 hover:text-amber-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 font-body">
                  <DetailRow label={t("admin.submissionDate", "સબમિશન તારીખ")} value={formatDate(selectedSubmission.submissionDate || selectedSubmission.createdAt)} />
                  <DetailRow label={t("admin.bookingDate", "બુકિંગ તારીખ")} value={formatDate(selectedSubmission.bookingDate)} />
                  <DetailRow label={t("admin.name", "નામ")} value={selectedSubmission.name} />
                  <DetailRow label={t("admin.upiNumber", "UPI નંબર")} value={selectedSubmission.upiNumber} />
                  <DetailRow label={t("admin.whatsappNumber", "WhatsApp નંબર")} value={selectedSubmission.whatsappNumber} />
                  <DetailRow label={t("admin.school", "આયંબિલ શાળા")} value={selectedSubmission.ayambilShalaName} />
                  <DetailRow label={t("admin.city", "શહેર")} value={selectedSubmission.city} />

                  {/* Status with badge */}
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-amber-600">{t("admin.status", "સ્થિતિ")}</span>
                    <span className={`px-2 py-1 rounded text-sm font-body ${selectedSubmission.status === "confirmed" ? "bg-green-100 text-green-700" :
                      selectedSubmission.status === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                      {selectedSubmission.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Status Change Section */}
                <div className="mt-6 pt-4 border-t">
                  <p className="font-body text-sm text-amber-600 mb-3">{t("admin.changeStatus", "Change Status")}:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={async () => {
                        await handleStatusUpdate(selectedSubmission.id, "pending");
                        setSelectedSubmission({ ...selectedSubmission, status: "pending" });
                      }}
                      disabled={selectedSubmission.status === "pending" || !selectedSubmission.status}
                      className={cn(
                        "px-3 py-2 rounded text-sm font-body flex items-center gap-1 transition-colors",
                        selectedSubmission.status === "pending" || !selectedSubmission.status
                          ? "bg-yellow-200 text-yellow-800 cursor-not-allowed"
                          : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                      )}
                    >
                      {t("admin.pending", "Pending")}
                    </button>
                    <button
                      onClick={async () => {
                        await handleStatusUpdate(selectedSubmission.id, "confirmed");
                        setSelectedSubmission({ ...selectedSubmission, status: "confirmed" });
                      }}
                      disabled={selectedSubmission.status === "confirmed"}
                      className={cn(
                        "px-3 py-2 rounded text-sm font-body flex items-center gap-1 transition-colors",
                        selectedSubmission.status === "confirmed"
                          ? "bg-green-200 text-green-800 cursor-not-allowed"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      )}
                    >
                      <Check className="w-4 h-4" />
                      {t("admin.confirmed", "Confirmed")}
                    </button>
                    <button
                      onClick={async () => {
                        await handleStatusUpdate(selectedSubmission.id, "rejected");
                        setSelectedSubmission({ ...selectedSubmission, status: "rejected" });
                      }}
                      disabled={selectedSubmission.status === "rejected"}
                      className={cn(
                        "px-3 py-2 rounded text-sm font-body flex items-center gap-1 transition-colors",
                        selectedSubmission.status === "rejected"
                          ? "bg-red-200 text-red-800 cursor-not-allowed"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      )}
                    >
                      <X className="w-4 h-4" />
                      {t("admin.rejected", "Rejected")}
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      handleDelete(selectedSubmission.id);
                      setShowModal(false);
                    }}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t("admin.delete", "Delete")}
                  </Button>
                  <Button onClick={() => setShowModal(false)} variant="outline">
                    {t("admin.close", "Close")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
      <div className={`${color} text-white p-2 sm:p-3 rounded-lg shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="font-body text-xs sm:text-sm text-amber-600 truncate">{label}</p>
        <p className="font-heading font-semibold text-lg sm:text-2xl">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b">
      <span className="text-amber-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
