import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { cn } from "@/lib/utils";

const toGujaratiNumeral = (num: number): string => {
  const gujaratiDigits = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  return String(num).split('').map(d => gujaratiDigits[parseInt(d)]).join('');
};

const BOOKED_DATES = ["17/12/2025", "25/12/2025", "01/01/2026"];

export default function AvailableDates() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const months = t("calendar.months", { returnObjects: true }) as string[];
  const weekdays = t("calendar.weekdays", { returnObjects: true }) as string[];
  
  const initialDates = (location.state as { selectedDates?: string[] })?.selectedDates || [];
  
  const [selectedMonth, setSelectedMonth] = useState(11);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const maxDates = 3;

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

  const handleDateClick = (day: number | null) => {
    if (!day || isBooked(day)) return;
    const dateStr = formatDate(day);
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else if (selectedDates.length < maxDates) {
      const newDates = [...selectedDates, dateStr];
      setSelectedDates(newDates);
      if (newDates.length === maxDates) {
        navigate('/booking', { state: { selectedDates: newDates } });
      }
    }
  };

  const handleBackToForm = () => {
    navigate('/booking', { state: { selectedDates } });
  };

  const years = [2025, 2026, 2027, 2028, 2029, 2030];
  const selectedCountDisplay = i18n.language === 'gu' ? toGujaratiNumeral(selectedDates.length) : selectedDates.length;
  const maxDatesDisplay = i18n.language === 'gu' ? toGujaratiNumeral(maxDates) : maxDates;

  return (
    <PageLayout>
      <section className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-8 lg:py-20 relative z-10">
        <h1 className="text-center font-heading font-semibold text-3xl sm:text-4xl lg:text-6xl text-black mb-4 lg:mb-8">
          {t("availableDates.title")}
        </h1>
        
        <p className="text-center font-body text-base sm:text-lg lg:text-2xl text-black mb-6 lg:mb-12 px-2">
          {t("availableDates.subtitle")}
        </p>

        <div className="border-[3px] sm:border-[5px] border-black rounded-[15px] sm:rounded-[20px] p-3 sm:p-6 lg:p-10 bg-white">
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 lg:gap-10 mb-4 lg:mb-8 font-body text-sm sm:text-base lg:text-2xl">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-green-500 rounded border-2 border-green-700"></div>
              <span className="text-green-800">{t("availableDates.available")}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-300 rounded border-2 border-red-600"></div>
              <span className="text-red-700">{t("availableDates.fullyBooked")}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-yellow-300 rounded border-2 border-yellow-600"></div>
              <span className="text-yellow-700">{t("availableDates.selected")}</span>
            </div>
          </div>

          <div className="border-t border-gray-300 mb-4 lg:mb-8"></div>

          <div className="flex justify-center items-center mb-4 lg:mb-8 relative z-30">
            <div className="flex rounded-lg overflow-visible border border-gray-300">
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => { setShowMonthDropdown(!showMonthDropdown); setShowYearDropdown(false); }}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 lg:px-10 py-2 sm:py-3 bg-stone-100 font-body text-sm sm:text-lg lg:text-2xl text-black min-w-[100px] sm:min-w-[140px] lg:min-w-[200px] hover:bg-stone-200 transition-colors"
                >
                  <span className="truncate">{months[selectedMonth]}</span>
                  <svg width="10" height="6" viewBox="0 0 10 5" fill="none" className={cn("flex-shrink-0 transition-transform", showMonthDropdown && "rotate-180")}>
                    <path d="M5 5L0 0H10L5 5Z" fill="#1C1B1F"/>
                  </svg>
                </button>
                {showMonthDropdown && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto mt-1">
                    {months.map((month, idx) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => { setSelectedMonth(idx); setShowMonthDropdown(false); }}
                        className={cn("w-full px-3 py-2 text-left font-body text-sm sm:text-base hover:bg-stone-100", selectedMonth === idx && "bg-stone-200 font-semibold")}
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
                  className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 lg:px-10 py-2 sm:py-3 bg-gray-200 font-['Roboto'] text-sm sm:text-lg lg:text-2xl text-black min-w-[70px] sm:min-w-[100px] lg:min-w-[140px] hover:bg-gray-300 transition-colors"
                >
                  {selectedYear}
                  <svg width="10" height="6" viewBox="0 0 10 5" fill="none" className={cn("flex-shrink-0 transition-transform", showYearDropdown && "rotate-180")}>
                    <path d="M5 5L0 0H10L5 5Z" fill="#1C1B1F"/>
                  </svg>
                </button>
                {showYearDropdown && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto mt-1">
                    {years.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => { setSelectedYear(year); setShowYearDropdown(false); }}
                        className={cn("w-full px-3 py-2 text-left font-['Roboto'] text-sm sm:text-base hover:bg-gray-100", selectedYear === year && "bg-gray-200 font-semibold")}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 mb-2 sm:mb-4">
            {weekdays.map((day) => (
              <div key={day} className="flex justify-center items-center py-1.5 sm:py-2 lg:py-3 bg-orange-200 rounded-md sm:rounded-lg font-body text-xs sm:text-sm lg:text-xl text-black font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 mb-4 lg:mb-8">
            {calendarData.map((day, index) => {
              if (day === null) return <div key={index} className="aspect-square"></div>;
              const booked = isBooked(day);
              const selected = isSelected(day);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  disabled={booked}
                  className={cn(
                    "aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center transition-all border sm:border-2",
                    booked && "bg-red-100 border-red-400 cursor-not-allowed",
                    selected && "bg-yellow-100 border-yellow-500",
                    !booked && !selected && "bg-green-100 border-green-500 hover:bg-green-200 cursor-pointer"
                  )}
                >
                  <span className={cn(
                    "font-['Roboto'] text-sm sm:text-lg lg:text-2xl font-medium",
                    booked && "text-red-600",
                    selected && "text-yellow-700",
                    !booked && !selected && "text-green-700"
                  )}>
                    {String(day).padStart(2, '0')}
                  </span>
                  <span className={cn(
                    "font-body text-[8px] sm:text-xs lg:text-sm leading-tight",
                    booked && "text-red-500",
                    selected && "text-yellow-600",
                    !booked && !selected && "text-green-600"
                  )}>
                    {booked ? t("availableDates.isBooked") : t("availableDates.isAvailable")}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-gray-300 mb-4 lg:mb-6"></div>

          <div className="text-center space-y-2 sm:space-y-3">
            <p className="font-body text-base sm:text-lg lg:text-2xl text-black">
              {t("availableDates.selectedDates")} {selectedCountDisplay} {t("availableDates.outOf")} {maxDatesDisplay}
            </p>
            {selectedDates.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 lg:gap-3">
                {selectedDates.map((date) => (
                  <span key={date} className="font-body text-sm sm:text-base lg:text-xl text-yellow-800 bg-yellow-100 px-2 sm:px-3 py-1 rounded-lg border border-yellow-400">
                    {formatDateDisplay(date)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mt-8 lg:mt-16">
          <button 
            onClick={handleBackToForm}
            className="flex items-center gap-2 border-2 border-black rounded-2xl px-5 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-black font-heading font-semibold text-base sm:text-lg lg:text-[22px] hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            {t("availableDates.backToForm")}
          </button>
        </div>
      </section>
    </PageLayout>
  );
}
