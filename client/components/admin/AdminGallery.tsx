import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Loader2, Plus } from "lucide-react";

interface GalleryImage {
    id: string;
    url: string;
    date: string;
    description?: string;
}

import { useTranslation } from "react-i18next";

interface AdminGalleryProps {
    showToast: (message: string, type: "success" | "error") => void;
}

export function AdminGallery({ showToast }: AdminGalleryProps) {
    const { t } = useTranslation();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Upload form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [description, setDescription] = useState("");

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const response = await api.getAnumodanaImages();
            if (response.success && response.data) {
                setImages(response.data as GalleryImage[]);
            }
        } catch (error) {
            console.error("Failed to fetch images", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !date) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('date', date);
            formData.append('description', description);

            await api.uploadAnumodanaImage(formData);

            // Reset form
            setSelectedFile(null);
            setDescription("");
            // Refresh list
            fetchImages();
            showToast(t("admin.uploadSuccess"), "success");
        } catch (error) {
            console.error("Upload failed", error);
            showToast(t("admin.uploadFailed"), "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("admin.deleteImageConfirm"))) return;
        try {
            await api.deleteAnumodanaImage(id);
            setImages(images.filter(img => img.id !== id));
            showToast(t("admin.deleteSuccess"), "success");
        } catch (error) {
            console.error("Delete failed", error);
            showToast(t("admin.deleteFailed"), "error");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("admin.uploadImage")}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">{t("admin.imageFile")}</label>
                            <Input type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <div className="space-y-2 w-full md:w-40">
                            <label className="text-sm font-medium">{t("admin.date")}</label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        {/* Description optional */}
                        <div className="space-y-2 w-full md:w-60">
                            <label className="text-sm font-medium">{t("admin.description")} ({t("admin.optional")})</label>
                            <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder={t("admin.description")} />
                        </div>
                        <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            {t("admin.upload")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-10">Loading images...</div>
                ) : (
                    images.map(image => (
                        <div key={image.id} className="relative group rounded-lg overflow-hidden border bg-white shadow-sm">
                            <img src={image.url} alt={image.description} className="w-full h-48 object-cover" />
                            <div className="absolute inset-0 bg-orange-600/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(image.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="p-2 text-xs text-amber-400 flex justify-between">
                                <span>{image.date}</span>
                                {image.description && <span className="truncate max-w-[100px]">{image.description}</span>}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
