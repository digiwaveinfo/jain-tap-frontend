import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const toGujaratiNumeral = (num: number): string => {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(num).split('').map(d => gujaratiDigits[parseInt(d)]).join('');
};

// Removed static BOOKED_DATES

// Convert DD/MM/YYYY to ISO format YYYY-MM-DD
const convertToISODate = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const [dd, mm, yyyy] = dateStr.split('/');
  return `${yyyy}-${mm}-${dd}`;
};


export default function Booking() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const maxDates = 3;

  const months = t("calendar.months", { returnObjects: true }) as string[];
  const weekdays = t("calendar.weekdays", { returnObjects: true }) as string[];

  const initialDates = (location.state as { selectedDates?: string[] })?.selectedDates || [];

  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates);
  const [formData, setFormData] = useState({
    name: "",
    upiMobile: "",
    whatsappMobile: "",
    schoolName: "",
    city: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [showCalendar, setShowCalendar] = useState(false);
  const selectedDateObj = initialDates.length > 0
    ? new Date(convertToISODate(initialDates[0]))
    : new Date();

  const [selectedMonth, setSelectedMonth] = useState(selectedDateObj.getMonth());
  const [selectedYear, setSelectedYear] = useState(selectedDateObj.getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // New state for dynamic data
  const [openDates, setOpenDates] = useState<string[]>([]); // Dates explicitly opened by admin (YYYY-MM-DD)
  const [fullDates, setFullDates] = useState<string[]>([]); // Dates fully booked (YYYY-MM-DD)
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({}); // Booking counts per date
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(3); // Max bookings allowed per day
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  // Fetch calendar data when month/year changes
  useEffect(() => {
    fetchCalendarData();
  }, [selectedMonth, selectedYear]);

  const fetchCalendarData = async () => {
    setLoadingCalendar(true);
    try {
      // Calculate start and end of month
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0); // Last day of month

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Parallel fetch
      const [settingsRes, countsRes] = await Promise.all([
        api.getCalendarSettings(startStr, endStr),
        api.getBookingCounts(startStr, endStr)
      ]);

      // Process Open Dates
      if (settingsRes.success && settingsRes.data) {
        // data is array of {date, status}
        const settings = settingsRes.data as { date: string, status: string }[];
        const opens = settings
          .filter(s => s.status === 'open')
          .map(s => s.date);
        setOpenDates(opens);
      }

      // Process Full Dates
      // api.getBookingCounts returns { bookingCounts, maxBookingsPerDay } (any type really)
      if (countsRes.success) {
        // Fix type or cast
        const data = countsRes as any;
        const counts = data.bookingCounts || {};
        const max = data.maxBookingsPerDay || 3;

        setBookingCounts(counts);
        setMaxBookingsPerDay(max);

        const fulls = Object.keys(counts).filter(date => counts[date] >= max);
        setFullDates(fulls);
      }

    } catch (error) {
      console.error("Failed to fetch calendar data", error);
    } finally {
      setLoadingCalendar(false);
    }
  };

  useEffect(() => {
    if (initialDates.length > 0) {
      setSelectedDates(initialDates);
    }
  }, [location.state]);

  const calendarData = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [selectedMonth, selectedYear]);

  const formatDate = (day: number) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(selectedMonth + 1).padStart(2, '0');
    return `${dd}/${mm}/${selectedYear}`;
  };

  const formatDateDisplay = (dateStr: string): string => {
    const [dd, mm, yyyy] = dateStr.split('/');
    const monthIndex = parseInt(mm) - 1;
    if (i18n.language === 'gu') {
      return `${toGujaratiNumeral(parseInt(dd))} ${months[monthIndex]} ${toGujaratiNumeral(parseInt(yyyy))}`;
    }
    return `${dd} ${months[monthIndex]} ${yyyy}`;
  };

  const isFull = (day: number) => {
    const dateStr = convertToIsoFromParts(day, selectedMonth, selectedYear);
    return fullDates.includes(dateStr);
  }

  const isOpen = (day: number) => {
    const dateStr = convertToIsoFromParts(day, selectedMonth, selectedYear);
    // Check if past
    const d = new Date(selectedYear, selectedMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) return false;

    return openDates.includes(dateStr);
  }

  const isSelected = (day: number) => selectedDates.includes(formatDate(day));

  const getRemainingCount = (day: number) => {
    const dateStr = convertToIsoFromParts(day, selectedMonth, selectedYear);
    const booked = bookingCounts[dateStr] || 0;
    return maxBookingsPerDay - booked;
  };

  const convertToIsoFromParts = (d: number, m: number, y: number) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const handleDateSelect = (day: number | null) => {
    if (!day) return;

    // Check constraints
    if (!isOpen(day)) return; // Not open (coming soon / disabled)
    if (isFull(day)) return; // Fully booked

    const dateStr = formatDate(day);
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else if (selectedDates.length < maxDates) {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleGoToAvailableDates = () => {
    navigate('/available-dates', { state: { selectedDates } });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});
    setSubmitError("");
    
    // Frontend validation using translations
    const errors: Record<string, string> = {};
    
    if (selectedDates.length === 0) {
      errors.date = t("booking.validation.dateRequired");
    }
    if (!formData.name.trim()) {
      errors.name = t("booking.validation.nameRequired");
    }
    if (!formData.upiMobile.trim()) {
      errors.upiMobile = t("booking.validation.upiRequired");
    } else if (!/^\d{10}$/.test(formData.upiMobile.trim())) {
      errors.upiMobile = t("booking.validation.upiInvalid");
    }
    if (!formData.whatsappMobile.trim()) {
      errors.whatsappMobile = t("booking.validation.whatsappRequired");
    } else if (!/^\d{10}$/.test(formData.whatsappMobile.trim())) {
      errors.whatsappMobile = t("booking.validation.whatsappInvalid");
    }
    if (!formData.schoolName.trim()) {
      errors.schoolName = t("booking.validation.schoolRequired");
    }
    if (!formData.city.trim()) {
      errors.city = t("booking.validation.cityRequired");
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      // Submit each date as a separate booking (backend expects single date)
      for (const date of selectedDates) {
        const response = await api.submitBooking({
          name: formData.name,
          upiNumber: formData.upiMobile,
          whatsappNumber: formData.whatsappMobile,
          ayambilShalaName: formData.schoolName,
          city: formData.city,
          bookingDate: convertToISODate(date),
        });

        if (!response.success) {
          // Check if response has field-specific errors
          const apiErrors = (response as any).errors;
          if (apiErrors && Array.isArray(apiErrors)) {
            const fieldErrs: Record<string, string> = {};
            apiErrors.forEach((err: { field: string; message: string }) => {
              // Map backend field names to frontend field names and use translations
              const fieldMap: Record<string, string> = {
                'upiNumber': 'upiMobile',
                'whatsappNumber': 'whatsappMobile',
                'ayambilShalaName': 'schoolName',
                'bookingDate': 'date',
                'name': 'name',
                'city': 'city'
              };
              const frontendField = fieldMap[err.field] || err.field;
              
              // Map to translation keys based on field and error type
              if (frontendField === 'upiMobile') {
                fieldErrs[frontendField] = err.message.includes('10') ? t("booking.validation.upiInvalid") : t("booking.validation.upiRequired");
              } else if (frontendField === 'whatsappMobile') {
                fieldErrs[frontendField] = err.message.includes('10') ? t("booking.validation.whatsappInvalid") : t("booking.validation.whatsappRequired");
              } else if (frontendField === 'name') {
                fieldErrs[frontendField] = t("booking.validation.nameRequired");
              } else if (frontendField === 'schoolName') {
                fieldErrs[frontendField] = t("booking.validation.schoolRequired");
              } else if (frontendField === 'city') {
                fieldErrs[frontendField] = t("booking.validation.cityRequired");
              } else if (frontendField === 'date') {
                fieldErrs[frontendField] = t("booking.validation.dateRequired");
              } else {
                fieldErrs[frontendField] = err.message;
              }
            });
            setFieldErrors(fieldErrs);
          } else {
            setSubmitError(response.message || t("booking.submitError"));
          }
          return;
        }
      }

      setSubmitSuccess(true);
      setFormData({ name: "", upiMobile: "", whatsappMobile: "", schoolName: "", city: "" });
      setSelectedDates([]);
      // Navigate to Anumodana page after 2 seconds
      setTimeout(() => {
        navigate('/anumodana');
      }, 2000);
    } catch (error) {
      // Try to parse backend validation errors from the error message
      const errorMessage = error instanceof Error ? error.message : t("booking.submitError");
      
      // Check if it's a field-specific error based on message content and use translations
      if (errorMessage.includes('UPI') || errorMessage.includes('યુપીઆઈ')) {
        setFieldErrors({ upiMobile: errorMessage.includes('10') ? t("booking.validation.upiInvalid") : t("booking.validation.upiRequired") });
      } else if (errorMessage.includes('WhatsApp') || errorMessage.includes('વોટ્સએપ')) {
        setFieldErrors({ whatsappMobile: errorMessage.includes('10') ? t("booking.validation.whatsappInvalid") : t("booking.validation.whatsappRequired") });
      } else if (errorMessage.includes('નામ') || errorMessage.includes('Name') || errorMessage.includes('नाम')) {
        setFieldErrors({ name: t("booking.validation.nameRequired") });
      } else if (errorMessage.includes('શાળા') || errorMessage.includes('Shala') || errorMessage.includes('शाला')) {
        setFieldErrors({ schoolName: t("booking.validation.schoolRequired") });
      } else if (errorMessage.includes('શહેર') || errorMessage.includes('City') || errorMessage.includes('शहर')) {
        setFieldErrors({ city: t("booking.validation.cityRequired") });
      } else if (errorMessage.includes('તારીખ') || errorMessage.includes('date') || errorMessage.includes('तारीख')) {
        setFieldErrors({ date: t("booking.validation.dateRequired") });
      } else {
        setSubmitError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const years = [currentYear, currentYear + 1, currentYear + 2];
  const selectedCountDisplay = i18n.language === 'gu' ? toGujaratiNumeral(selectedDates.length) : selectedDates.length;
  const maxDatesDisplay = i18n.language === 'gu' ? toGujaratiNumeral(maxDates) : maxDates;

  return (
    <PageLayout>
      <section className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-4xl lg:text-6xl text-amber-900 mb-6 lg:mb-8">
          {t("booking.title")}
        </h1>

        <p className="text-center font-body text-lg lg:text-2xl text-amber-900 mb-6 lg:mb-8 max-w-3xl mx-auto">
          {t("booking.subtitle")} <span className="font-bold">{t("booking.subtitleBold")}</span> {t("booking.subtitleMid")} <span className="font-bold">{t("booking.subtitleEnd")}</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8 lg:mb-12">
          <button
            onClick={handleGoToAvailableDates}
            className="border-2 border-blue-600 rounded-2xl px-6 lg:px-10 py-4 lg:py-5 text-blue-600 font-body text-xl lg:text-2xl underline hover:bg-blue-50 transition-colors"
          >
            {t("booking.viewDates")}
          </button>

          {selectedDates.length > 0 && selectedDates.length < maxDates && (
            <button
              onClick={() => setShowCalendar(true)}
              className="border-2 border-blue-700 rounded-[20px] px-6 lg:px-10 py-4 lg:py-5 text-blue-700 font-body text-xl lg:text-2xl underline hover:bg-blue-50 transition-colors"
            >
              {t("booking.addMoreDates")}
            </button>
          )}
        </div>

        {submitSuccess ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="border-[5px] border-green-500 rounded-[20px] p-8 lg:p-16 bg-green-50">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-heading font-semibold text-2xl lg:text-4xl text-green-700 mb-4">
                {t("booking.successTitle", "બુકિંગ સફળ!")}
              </h2>
              <p className="font-body text-lg lg:text-xl text-green-600 mb-8">
                {t("booking.successMessage", "તમારું બુકિંગ સફળતાપૂર્વક સબમિટ થયું છે. અમે ટૂંક સમયમાં તમારો સંપર્ક કરીશું.")}
              </p>
              <Button
                onClick={() => setSubmitSuccess(false)}
                className="bg-green-600 hover:bg-green-700 text-white rounded-2xl px-8 py-6 text-lg font-heading font-semibold"
              >
                {t("booking.newBooking", "નવું બુકિંગ કરો")}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            {submitError && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 font-body">
                {submitError}
              </div>
            )}
            <div className="border-[5px] border-amber-700 rounded-[20px] p-6 sm:p-8 lg:p-16 space-y-8 lg:space-y-10 bg-white">

              <div className="space-y-2 relative">
                <label className="block font-body text-lg lg:text-2xl text-amber-900">
                  {t("booking.dateLabel")} <span className="text-amber-900">{t("booking.required")}</span>
                </label>

                <div
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={cn(
                    "w-full border-b-2 py-3 font-body text-lg lg:text-xl cursor-pointer",
                    fieldErrors.date ? "border-red-500" : "border-amber-700"
                  )}
                >
                  {selectedDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedDates.map((date) => (
                        <span key={date} className="bg-yellow-100 px-3 py-1 rounded text-yellow-700 border border-yellow-400">
                          {formatDateDisplay(date)}
                        </span>
                      ))}
                      {selectedDates.length < maxDates && (
                        <span className="text-amber-400 italic">{t("booking.addDate")}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-amber-400">
                      <span>{t("booking.selectDate")}</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                  )}
                </div>
                {fieldErrors.date && (
                  <p className="text-red-500 text-sm font-body mt-1">{fieldErrors.date}</p>
                )}

                <p className="text-sm text-amber-500 font-body">
                  {t("booking.selectedCount")} {selectedCountDisplay} / {maxDatesDisplay} {t("booking.dates")}
                </p>

                {showCalendar && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-amber-700 rounded-[10px] p-4 z-50 shadow-xl">
                    <div className="flex flex-wrap gap-4 mb-4 text-sm font-body">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-200 border border-green-600 rounded"></div>
                        <span className="text-green-800">{t("availableDates.available")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-200 border border-red-600 rounded"></div>
                        <span className="text-red-700">{t("availableDates.fullyBooked")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-200 border border-yellow-500 rounded"></div>
                        <span className="text-yellow-700">{t("availableDates.selected")}</span>
                      </div>
                    </div>

                    <div className="flex justify-center mb-4 relative z-50">
                      <div className="flex rounded-[10px] overflow-visible shadow-sm">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false); }}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 font-body text-base min-w-[120px] rounded-l-[10px] hover:bg-orange-100 transition-colors"
                          >
                            {months[selectedMonth]}
                            <svg width="10" height="6" viewBox="0 0 10 5" fill="none" className={cn("transition-transform", showMonthDropdown && "rotate-180")}>
                              <path d="M5 5L0 0H10L5 5Z" fill="#1C1B1F" />
                            </svg>
                          </button>
                          {showMonthDropdown && (
                            <div className="absolute top-full left-0 w-full bg-white border-2 border-amber-300 rounded-lg shadow-xl z-[60] max-h-48 overflow-y-auto mt-1">
                              {months.map((month, idx) => {
                                if (selectedYear === currentYear && idx < currentMonth) return null;
                                return (
                                  <button
                                    key={month}
                                    type="button"
                                    onClick={() => { setSelectedMonth(idx); setShowMonthDropdown(false); }}
                                    className={cn("w-full px-3 py-2 text-left font-body text-sm hover:bg-orange-50", selectedMonth === idx && "bg-orange-100 font-semibold")}
                                  >
                                    {month}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false); }}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-100 font-['Roboto'] text-base min-w-[90px] rounded-r-[10px] hover:bg-gray-300 transition-colors"
                          >
                            {selectedYear}
                            <svg width="10" height="6" viewBox="0 0 10 5" fill="none" className={cn("transition-transform", showYearDropdown && "rotate-180")}>
                              <path d="M5 5L0 0H10L5 5Z" fill="#1C1B1F" />
                            </svg>
                          </button>
                          {showYearDropdown && (
                            <div className="absolute top-full left-0 w-full bg-white border-2 border-amber-300 rounded-lg shadow-xl z-[60] max-h-48 overflow-y-auto mt-1">
                              {years.map((year) => (
                                <button
                                  key={year}
                                  type="button"
                                  onClick={() => { setSelectedYear(year); setShowYearDropdown(false); }}
                                  className={cn("w-full px-3 py-2 text-left font-['Roboto'] text-sm hover:bg-orange-50", selectedYear === year && "bg-amber-100 font-semibold")}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekdays.map((day) => (
                        <div key={day} className="text-center py-1 bg-orange-200 rounded text-xs font-body">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {calendarData.map((day, index) => {
                        if (day === null) {
                          return <div key={index} className="h-10"></div>;
                        }

                        const open = isOpen(day);
                        const full = isFull(day);
                        const selected = isSelected(day);
                        const remaining = getRemainingCount(day);
                        const past = new Date(selectedYear, selectedMonth, day) < new Date(new Date().setHours(0, 0, 0, 0));

                        let btnClass = "bg-amber-50 border border-gray-100 text-amber-400 cursor-not-allowed"; // Default disabled/coming soon
                        let title = "Coming Soon";

                        if (past) {
                          btnClass = "bg-orange-50/50 border border-amber-200 text-amber-400 cursor-not-allowed opacity-50";
                          title = "Past Date";
                        } else if (open) {
                          if (selected) {
                            btnClass = "bg-yellow-100 border border-yellow-500 text-yellow-700";
                            title = "Selected";
                          } else if (full) {
                            btnClass = "bg-red-50 border border-red-200 text-red-600 cursor-not-allowed";
                            title = "Fully Booked";
                          } else {
                            btnClass = "bg-green-50 border border-green-500 text-green-700 hover:bg-green-100 cursor-pointer";
                            title = `Available - ${remaining} remaining`;
                          }
                        }

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleDateSelect(day)}
                            disabled={!open || full || (selectedDates.length >= maxDates && !selected)}
                            className={cn(
                              "h-12 rounded text-xs font-['Roboto'] transition-colors flex flex-col items-center justify-center relative",
                              btnClass
                            )}
                            title={title}
                          >
                            <span className="font-semibold">{String(day).padStart(2, '0')}</span>
                            {open && !full && !past && remaining < maxBookingsPerDay && (
                              <span className="text-[9px] leading-none">{remaining} {t("booking.remaining")}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setShowCalendar(false)}
                        className="px-6 py-2 bg-orange-600 text-white rounded-lg font-body hover:bg-orange-700"
                      >
                        {t("calendar.close")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-body text-lg lg:text-2xl text-amber-900">
                  {t("booking.nameLabel")} <span className="text-amber-900">{t("booking.required")}</span>
                </label>
                <Input type="text" name="name" value={formData.name} onChange={handleChange} className={cn("w-full border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0", fieldErrors.name ? "border-red-500" : "border-amber-700")} />
                {fieldErrors.name && (
                  <p className="text-red-500 text-sm font-body mt-1">{fieldErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-body text-lg lg:text-2xl text-amber-900">
                  {t("booking.upiLabel")} <span className="text-amber-900">{t("booking.required")}</span>
                </label>
                <Input type="tel" name="upiMobile" value={formData.upiMobile} onChange={handleChange} className={cn("w-full border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0", fieldErrors.upiMobile ? "border-red-500" : "border-amber-700")} />
                {fieldErrors.upiMobile && (
                  <p className="text-red-500 text-sm font-body mt-1">{fieldErrors.upiMobile}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-body text-lg lg:text-2xl text-amber-900">
                  {t("booking.whatsappLabel")} <span className="text-amber-900">{t("booking.required")}</span>
                </label>
                <Input type="tel" name="whatsappMobile" value={formData.whatsappMobile} onChange={handleChange} className={cn("w-full border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0", fieldErrors.whatsappMobile ? "border-red-500" : "border-amber-700")} />
                {fieldErrors.whatsappMobile && (
                  <p className="text-red-500 text-sm font-body mt-1">{fieldErrors.whatsappMobile}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-body text-lg lg:text-2xl text-amber-900">
                  {t("booking.schoolLabel")} <span className="text-amber-900">{t("booking.required")}</span>
                </label>
                <Input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} className={cn("w-full border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0", fieldErrors.schoolName ? "border-red-500" : "border-amber-700")} />
                {fieldErrors.schoolName && (
                  <p className="text-red-500 text-sm font-body mt-1">{fieldErrors.schoolName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-body text-lg lg:text-2xl text-amber-900">
                  {t("booking.cityLabel")} <span className="text-amber-900">{t("booking.required")}</span>
                </label>
                <Input type="text" name="city" value={formData.city} onChange={handleChange} className={cn("w-full border-b-2 border-t-0 border-l-0 border-r-0 rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0", fieldErrors.city ? "border-red-500" : "border-amber-700")} />
                {fieldErrors.city && (
                  <p className="text-red-500 text-sm font-body mt-1">{fieldErrors.city}</p>
                )}
              </div>


            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-8 mt-12 lg:mt-16">
              <Link to="/tapp-ni-vidhi">
                <Button type="button" variant="outline" className="bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-700 rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center">
                  <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                  {t("buttons.back")}
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" />
                    {t("booking.submitting", "સબમિટ થઈ રહ્યું છે...")}
                  </>
                ) : (
                  <>
                    {t("booking.submit")}
                    <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </section>
    </PageLayout>
  );
}
