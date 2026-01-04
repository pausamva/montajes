import { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, FileText, Paperclip } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Adjunto } from '@/core/types';
import * as pdfjsLib from 'pdfjs-dist';

// Helper to set worker (run once)
// Helper to set worker (run once)
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Use local worker from public folder to avoid CDN issues
    // Renamed to .js to ensure correct MIME type serving in Docker/Nginx
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface AttachmentUploadProps {
    onFileAdd: (data: { url: string, type: 'image' | 'pdf', name: string, thumbnail?: string }) => void;
    trigger?: React.ReactNode;
}

export function PhotoUpload({ onFileAdd, trigger }: AttachmentUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const optimizeImage = async (blob: Blob, maxWidth: number, quality: number): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const scale = Math.min(1.0, maxWidth / img.width);
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width * scale;
                    canvas.height = img.height * scale;

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        resolve(canvas.toDataURL('image/jpeg', quality));
                    } else {
                        resolve(e.target?.result as string);
                    }
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(blob);
        });
    };

    const generatePdfThumbnail = async (file: File): Promise<string> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            // Optimize: Limit width to 1024px for better quality (as requested)
            const originalViewport = page.getViewport({ scale: 1.0 });
            const desiredWidth = 1024;
            const scale = Math.min(1.0, desiredWidth / originalViewport.width);
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                } as any).promise;
                // High quality but reasonable size
                return canvas.toDataURL('image/jpeg', 0.8);
            }
        } catch (error) {
            console.error("Error generating PDF thumbnail:", error);
        }
        return "";
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input immediately
        if (fileInputRef.current) fileInputRef.current.value = '';

        const isPdf = file.type === 'application/pdf';
        const type = isPdf ? 'pdf' : 'image';

        let url = "";
        let thumbnail = "";

        if (isPdf) {
            thumbnail = await generatePdfThumbnail(file);
            // Only keep thumbnail, discard original PDF (save space)
            url = thumbnail;
        } else {
            // Optimize regular image
            // Max width 1024px, Quality 0.8
            url = await optimizeImage(file, 1024, 0.8);
        }

        if (!url) return;

        onFileAdd({
            url,
            type,
            name: file.name,
            thumbnail: thumbnail || undefined
        });
    };

    return (
        <>
            <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {trigger ? (
                <div onClick={() => fileInputRef.current?.click()}>
                    {trigger}
                </div>
            ) : (
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="w-4 h-4 mr-2" />
                    Adjuntar
                </Button>
            )}
        </>
    );
}

interface AttachmentGridProps {
    files: Adjunto[];
    onRemove: (id: string) => void;
}

export function PhotoGrid({ files, onRemove }: AttachmentGridProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!files || files.length === 0) return null;

    return (
        <>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mt-2">
                {files.map(file => (
                    <div
                        key={file.id}
                        className="relative group border rounded-lg overflow-hidden bg-muted aspect-square flex items-center justify-center p-1 cursor-pointer hover:border-primary transition-colors"
                        title="Click para ampliar"
                        onClick={() => setSelectedImage(file.thumbnail || file.url)}
                    >
                        {file.type === 'pdf' && !file.thumbnail ? (
                            <div className="flex flex-col items-center justify-center text-center p-2">
                                <FileText className="w-8 h-8 text-primary mb-1" />
                                <span className="text-[10px] leading-tight line-clamp-2 break-all">{file.name}</span>
                            </div>
                        ) : (
                            <img
                                src={file.thumbnail || file.url}
                                alt={file.name}
                                className="w-full h-full object-cover rounded"
                            />
                        )}

                        <div className="absolute top-1 right-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 z-10"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(file.id);
                                }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none flex items-center justify-center pointer-events-none">
                    {selectedImage && (
                        <div className="relative pointer-events-auto">
                            <img
                                src={selectedImage}
                                alt="Vista ampliada"
                                className="max-h-[85vh] max-w-[90vw] rounded-md shadow-2xl object-contain bg-black/50 backdrop-blur-sm"
                            />
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute -top-2 -right-2 rounded-full shadow-lg"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
