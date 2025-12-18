import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminCalendarProps {
    showToast: (message: string, type: "success" | "error") => void;
}

export function AdminCalendar({ showToast }: AdminCalendarProps) {
    const { t } = useTranslation();
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [dateStatuses, setDateStatuses] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Range selection
    const [selectionAnchor, setSelectionAnchor] = useState<string | null>(null);
    const [rangeStart, setRangeStart] = useState<string | null>(null);
    const [rangeEnd, setRangeEnd] = useState<string | null>(null);
    const [savingRange, setSavingRange] = useState(false);

    useEffect(() => {
        fetchCalendarStatus();
    }, [selectedMonth, selectedYear]);

    const fetchCalendarStatus = async () => {
        setLoading(true);
        try {
            const startDate = new Date(selectedYear, selectedMonth, 1);
            const endDate = new Date(selectedYear, selectedMonth + 1, 0);

            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            const response = await api.getCalendarSettings(startStr, endStr);
            if (response.success && response.data) {
                const map: Record<string, string> = {};
                (response.data as { date: string, status: string }[]).forEach(item => {
                    map[item.date] = item.status;
                });
                setDateStatuses(map);
            }
        } catch (error) {
            console.error("Failed to fetch calendar", error);
            showToast("Failed to fetch calendar data", "error");
        } finally {
            setLoading(false);
        }
    };

    const convertToIso = (day: number) => {
        return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handleDateClick = (dateStr: string) => {
        if (isPastDate(dateStr)) return;

        if (selectionAnchor) {
            // Complete selection
            // Determine min/max
            const d1 = new Date(selectionAnchor);
            const d2 = new Date(dateStr);
            const s = d1 < d2 ? selectionAnchor : dateStr;
            const e = d1 < d2 ? dateStr : selectionAnchor;

            setRangeStart(s);
            setRangeEnd(e);
            setSelectionAnchor(null);
        } else {
            // Start selection
            setSelectionAnchor(dateStr);
            setRangeStart(null);
            setRangeEnd(null);
        }
    };

    const handleDateHover = (dateStr: string) => {
        if (selectionAnchor) {
            if (isPastDate(dateStr)) return;
            // Visual feedback only? Or update rangeStart/End for visual?
            // Let's use rangeStart/End as current visual state if anchor is set
            const d1 = new Date(selectionAnchor);
            const d2 = new Date(dateStr);
            const s = d1 < d2 ? selectionAnchor : dateStr;
            const e = d1 < d2 ? dateStr : selectionAnchor;
            setRangeStart(s);
            setRangeEnd(e);
        }
    };

    // Helper to get all dates in range
    const getDatesInRange = (start: string, end: string) => {
        const d1 = new Date(start);
        const d2 = new Date(end);
        const dates = [];
        // Ensure d1 is before d2
        const s = d1 < d2 ? d1 : d2;
        const e = d1 < d2 ? d2 : d1;

        for (let dt = new Date(s); dt <= e; dt.setDate(dt.getDate() + 1)) {
            dates.push(dt.toISOString().split('T')[0]);
        }
        return dates;
    };

    const applyRangeStatus = async (status: 'open' | 'closed') => {
        if (!rangeStart || !rangeEnd) return;

        setSavingRange(true);
        try {
            const dates = getDatesInRange(rangeStart, rangeEnd);

            // We need a bulk update API, for now we can iterate or add bulk endpoint. 
            // The user summary mentioned "Bulk update" router exists: router.post('/bulk', ...)
            // Let's use it. We need to implement it in api.ts first? 
            // Wait, previous summary said "Admin: Bulk update router.post('/bulk', ...)"
            // But api.ts might not have it. Let's check api.ts or use loop.
            // Using loop is safer if api.ts update is tricky, but bulk is better.
            // Let's assume we can add bulk to api.ts or use loop.
            // Loop for now to be safe with existing client code unless we update api.ts

            // Actually, let's update api.ts to support bulk as it's cleaner.
            // But strict instructions "The user performed: npm start" -> server running.
            // Modifying client code is fine.

            // Let's use loop for safety if I can't confirm api.ts has bulk. 
            // The previous turn added setCalendarDateStatus but NOT bulk in api.ts explicitly?
            // "Updated api.ts to include new methods... setCalendarDateStatus"
            // It did NOT explicitly mention bulk in api.ts summary.
            // I'll implement a loop for now or add bulk to api.ts. Add to api.ts is better.

            // Wait, checking previous turn... "Admin: Bulk update router.post('/bulk'..." was added to backend.
            // I should add bulkUpdateDates to api.ts.

            // For now, let's just do sequential requests to avoid editing api.ts again if possible, or edit it if needed.
            // Given user constraints ("fix this then continue"), improving Range Selection is key.

            const promises = dates.map(d => api.setCalendarDateStatus(d, status));
            await Promise.all(promises);

            // Optimistic update
            const newStatuses = { ...dateStatuses };
            dates.forEach(d => {
                if (status === 'open') newStatuses[d] = 'open';
                else delete newStatuses[d];
            });
            setDateStatuses(newStatuses);

            setRangeStart(null);
            setRangeEnd(null);
            showToast("Range updated successfully", "success");

        } catch (error) {
            console.error("Bulk update failed", error);
            showToast("Failed to update range", "error");
        } finally {
            setSavingRange(false);
        }
    };

    const isPastDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
    };

    // Check if date is in current selection range
    // Check if date is in current selection range
    const isInSelection = (dateStr: string) => {
        if (!rangeStart || !rangeEnd) return false;
        const d = new Date(dateStr);
        const s = new Date(rangeStart);
        const e = new Date(rangeEnd);
        return d >= s && d <= e;
    };

    const calendarData = useMemo(() => {
        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    }, [selectedMonth, selectedYear]);

    const months = t("calendar.months", { returnObjects: true }) as string[];
    const weekdays = t("calendar.weekdays", { returnObjects: true }) as string[];

    // Navigation constraints
    const canGoPrev = new Date(selectedYear, selectedMonth, 1) > new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>{t("admin.manageAvailability")}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!canGoPrev}
                            onClick={() => {
                                if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
                                else { setSelectedMonth(m => m - 1); }
                            }}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="font-semibold min-w-[120px] text-center">
                            {months[selectedMonth]} {selectedYear}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                            if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
                            else { setSelectedMonth(m => m + 1); }
                        }}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading && Object.keys(dateStatuses).length === 0 ? (
                        <div className="text-center py-10">{t("admin.loading")}</div>
                    ) : (
                        <div>
                            {/* Range Actions - Show only when range is fully selected and NOT selecting */}
                            {rangeStart && rangeEnd && !selectionAnchor && (
                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <span className="font-medium text-blue-800">{t("admin.rangeSelection")}:</span>
                                        <span className="ml-2 text-blue-600">{rangeStart} - {rangeEnd}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => applyRangeStatus('open')} disabled={savingRange} className="bg-green-600 hover:bg-green-700">
                                            {savingRange ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.open")}
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => applyRangeStatus('closed')} disabled={savingRange}>
                                            {savingRange ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.closed")}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => { setRangeStart(null); setRangeEnd(null); setSelectionAnchor(null); }}>
                                            {t("calendar.close")}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Selection Instruction - Show when selecting */}
                            {selectionAnchor && (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                        <span className="font-medium text-yellow-800">{t("admin.selectEndDate", "Select end date to complete range")}</span>
                                    </div>
                                    <Button size="sm" variant="ghost" className="text-yellow-800 hover:bg-yellow-100" onClick={() => { setRangeStart(null); setRangeEnd(null); setSelectionAnchor(null); }}>
                                        {t("calendar.close")}
                                    </Button>
                                </div>
                            )}

                            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm font-medium text-amber-500">
                                {weekdays.map(d => <div key={d}>{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-2 select-none">
                                {calendarData.map((day, idx) => {
                                    if (!day) return <div key={idx} />;

                                    const dateStr = convertToIso(day);
                                    const status = dateStatuses[dateStr] || 'closed';
                                    const isOpen = status === 'open';
                                    const isPast = isPastDate(dateStr);
                                    const inSelection = isInSelection(dateStr);

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleDateClick(dateStr)}
                                            onMouseEnter={() => handleDateHover(dateStr)}
                                            className={cn(
                                                "h-14 rounded-md border flex flex-col items-center justify-center transition-colors relative cursor-pointer",
                                                isPast ? "bg-orange-50 text-amber-300 cursor-not-allowed" :
                                                    inSelection ? "bg-blue-100 border-blue-500 ring-2 ring-blue-300 z-10" :
                                                        isOpen ? "bg-green-100 border-green-200 text-green-700 hover:bg-green-200" :
                                                            "bg-amber-50 border-amber-200 text-amber-400 hover:bg-orange-50"
                                            )}
                                        >
                                            <span className="text-sm font-bold">{day}</span>
                                            <span className="text-[10px] uppercase">
                                                {isPast ? t("admin.closed") : (isOpen ? t("admin.open") : t("admin.closed"))}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 text-sm text-amber-500">
                                <p>{t("admin.clickToToggle")}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
