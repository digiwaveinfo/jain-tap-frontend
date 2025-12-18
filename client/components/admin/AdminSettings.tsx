import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AdminSettingsProps {
    showToast: (message: string, type: "success" | "error") => void;
}

export function AdminSettings({ showToast }: AdminSettingsProps) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        maxBookingsPerDay: 3,
        maxBookingsPerMonth: 1000
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.getSystemSettings();
            if (response.success && response.data) {
                setSettings(response.data as any);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateSystemSettings(settings);
            showToast(t("admin.saveSuccess"), "success");
        } catch (error) {
            console.error("Failed to save settings", error);
            showToast(t("admin.saveFailed"), "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("admin.settingsTitle")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("admin.maxBookingsPerDay")}</label>
                        <Input
                            type="number"
                            value={settings.maxBookingsPerDay}
                            onChange={(e) => setSettings({ ...settings, maxBookingsPerDay: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-sm text-amber-500">{t("admin.maxBookingsPerDayDesc")}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">{t("admin.maxBookingsPerMonth")}</label>
                        <Input
                            type="number"
                            value={settings.maxBookingsPerMonth}
                            onChange={(e) => setSettings({ ...settings, maxBookingsPerMonth: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-sm text-amber-500">{t("admin.maxBookingsPerMonthDesc")}</p>
                    </div>

                    <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t("admin.saveChanges")}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
