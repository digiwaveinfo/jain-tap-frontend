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

const BOOKED_DATES = ["17/12/2025", "25/12/2025", "01/01/2026"];

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
    email: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

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

  const isBooked = (day: number) => BOOKED_DATES.includes(formatDate(day));
  const isSelected = (day: number) => selectedDates.includes(formatDate(day));

  const handleDateSelect = (day: number | null) => {
    if (!day || isBooked(day)) return;
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

  // Convert DD/MM/YYYY to ISO format YYYY-MM-DD
  const convertToISODate = (dateStr: string): string => {
    const [dd, mm, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      setSubmitError(t("booking.alertSelectDate"));
      return;
    }
    
    setSubmitting(true);
    setSubmitError("");
    
    try {
      // Submit each date as a separate booking (backend expects single date)
      for (const date of selectedDates) {
        const response = await api.submitBooking({
          name: formData.name,
          upiNumber: formData.upiMobile,
          whatsappNumber: formData.whatsappMobile,
          ayambilShalaName: formData.schoolName,
          city: formData.city,
          email: formData.email || undefined,
          bookingDate: convertToISODate(date),
        });
        
        if (!response.success) {
          setSubmitError(response.message || t("booking.submitError"));
          return;
        }
      }
      
      setSubmitSuccess(true);
      setFormData({ name: "", upiMobile: "", whatsappMobile: "", schoolName: "", city: "", email: "" });
      setSelectedDates([]);
      // Navigate to Anumodana page after 2 seconds
      setTimeout(() => {
        navigate('/anumodana');
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("booking.submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  const selectedCountDisplay = i18n.language === 'gu' ? toGujaratiNumeral(selectedDates.length) : selectedDates.length;
  const maxDatesDisplay = i18n.language === 'gu' ? toGujaratiNumeral(maxDates) : maxDates;

  return (
    <PageLayout>
      <section className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-4xl lg:text-6xl text-black mb-6 lg:mb-8">
          {t("booking.title")}
        </h1>
        
        <p className="text-center font-body text-lg lg:text-2xl text-black mb-6 lg:mb-8 max-w-3xl mx-auto">
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
          <div className="border-[5px] border-black rounded-[20px] p-6 sm:p-8 lg:p-16 space-y-8 lg:space-y-10 bg-white">
            
            <div className="space-y-2 relative">
              <label className="block font-body text-lg lg:text-2xl text-black">
                {t("booking.dateLabel")} <span className="text-black">{t("booking.required")}</span>
              </label>
              
              <div 
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full border-b-2 border-black py-3 font-body text-lg lg:text-xl cursor-pointer"
              >
                {selectedDates.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.map((date) => (
                      <span key={date} className="bg-yellow-100 px-3 py-1 rounded text-yellow-700 border border-yellow-400">
                        {formatDateDisplay(date)}
                      </span>
                    ))}
                    {selectedDates.length < maxDates && (
                      <span className="text-gray-400 italic">{t("booking.addDate")}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-gray-400">
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
              
              <p className="text-sm text-gray-500 font-body">
                {t("booking.selectedCount")} {selectedCountDisplay} / {maxDatesDisplay} {t("booking.dates")}
              </p>
              
              {showCalendar && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-black rounded-[10px] p-4 z-50 shadow-xl">
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
                          className="flex items-center gap-2 px-4 py-2 bg-stone-100 font-body text-base min-w-[120px] rounded-l-[10px] hover:bg-stone-200 transition-colors"
                        >
                          {months[selectedMonth]}
                          <svg width="10" height="6" viewBox="0 0 10 5" fill="none" className={cn("transition-transform", showMonthDropdown && "rotate-180")}>
                            <path d="M5 5L0 0H10L5 5Z" fill="#1C1B1F"/>
                          </svg>
                        </button>
                        {showMonthDropdown && (
                          <div className="absolute top-full left-0 w-full bg-white border-2 border-stone-300 rounded-lg shadow-xl z-[60] max-h-48 overflow-y-auto mt-1">
                            {months.map((month, idx) => (
                              <button
                                key={month}
                                type="button"
                                onClick={() => { setSelectedMonth(idx); setShowMonthDropdown(false); }}
                                className={cn("w-full px-3 py-2 text-left font-body text-sm hover:bg-stone-100", selectedMonth === idx && "bg-stone-200 font-semibold")}
                              >
                                {month}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={() => { setShowYearDropdown(!showYearDropdown); setShowMonthDropdown(false); }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-200 font-['Roboto'] text-base min-w-[90px] rounded-r-[10px] hover:bg-gray-300 transition-colors"
                        >
                          {selectedYear}
                          <svg width="10" height="6" viewBox="0 0 10 5" fill="none" className={cn("transition-transform", showYearDropdown && "rotate-180")}>
                            <path d="M5 5L0 0H10L5 5Z" fill="#1C1B1F"/>
                          </svg>
                        </button>
                        {showYearDropdown && (
                          <div className="absolute top-full left-0 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl z-[60] max-h-48 overflow-y-auto mt-1">
                            {years.map((year) => (
                              <button
                                key={year}
                                type="button"
                                onClick={() => { setSelectedYear(year); setShowYearDropdown(false); }}
                                className={cn("w-full px-3 py-2 text-left font-['Roboto'] text-sm hover:bg-gray-100", selectedYear === year && "bg-gray-200 font-semibold")}
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
                    {calendarData.map((day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        disabled={day === null || isBooked(day) || (selectedDates.length >= maxDates && !isSelected(day))}
                        className={cn(
                          "h-10 rounded text-sm font-['Roboto'] transition-colors",
                          day === null && "invisible",
                          day !== null && isBooked(day) && "bg-red-200 text-red-700 cursor-not-allowed",
                          day !== null && !isBooked(day) && isSelected(day) && "bg-yellow-200 text-yellow-700 outline outline-1 outline-yellow-500",
                          day !== null && !isBooked(day) && !isSelected(day) && "bg-green-100 text-green-800 hover:bg-green-200",
                          day !== null && !isBooked(day) && !isSelected(day) && selectedDates.length >= maxDates && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {day !== null && String(day).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowCalendar(false)}
                      className="px-6 py-2 bg-black text-white rounded-lg font-body hover:bg-gray-800"
                    >
                      {t("calendar.close")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block font-body text-lg lg:text-2xl text-black">
                {t("booking.nameLabel")} <span className="text-black">{t("booking.required")}</span>
              </label>
              <Input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-black rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0" />
            </div>

            <div className="space-y-2">
              <label className="block font-body text-lg lg:text-2xl text-black">
                {t("booking.upiLabel")} <span className="text-black">{t("booking.required")}</span>
              </label>
              <Input type="tel" name="upiMobile" value={formData.upiMobile} onChange={handleChange} required className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-black rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0" />
            </div>

            <div className="space-y-2">
              <label className="block font-body text-lg lg:text-2xl text-black">
                {t("booking.whatsappLabel")} <span className="text-black">{t("booking.required")}</span>
              </label>
              <Input type="tel" name="whatsappMobile" value={formData.whatsappMobile} onChange={handleChange} required className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-black rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0" />
            </div>

            <div className="space-y-2">
              <label className="block font-body text-lg lg:text-2xl text-black">
                {t("booking.schoolLabel")} <span className="text-black">{t("booking.required")}</span>
              </label>
              <Input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-black rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0" />
            </div>

            <div className="space-y-2">
              <label className="block font-body text-lg lg:text-2xl text-black">
                {t("booking.cityLabel")} <span className="text-black">{t("booking.required")}</span>
              </label>
              <Input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-black rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0" />
            </div>

            <div className="space-y-2">
              <label className="block font-body text-lg lg:text-2xl text-black">
                {t("booking.emailLabel", "ઈમેલ")} <span className="text-gray-500">({t("booking.optional", "વૈકલ્પિક")})</span>
              </label>
              <Input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border-b-2 border-t-0 border-l-0 border-r-0 border-black rounded-none px-0 font-body text-lg lg:text-xl focus-visible:ring-0" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-8 mt-12 lg:mt-16">
            <Link to="/tapp-ni-vidhi">
              <Button type="button" variant="outline" className="bg-white hover:bg-gray-50 text-black border-2 border-black rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center">
                <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                {t("buttons.back")}
              </Button>
            </Link>
            
            <Button 
              type="submit" 
              disabled={submitting}
              className="bg-black hover:bg-gray-800 text-white rounded-2xl px-6 lg:px-8 py-5 lg:py-7 text-lg lg:text-[22px] font-heading font-semibold flex items-center gap-2 w-[180px] justify-center disabled:opacity-50"
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
