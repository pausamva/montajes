import { useStore } from "@/core/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip } from "lucide-react";

import { PhotoUpload, PhotoGrid } from "./photo-upload";
import { v4 as uuidv4 } from 'uuid';

export function BudgetHeader() {
    const { budget, updateHeader, addGeneralPhoto, removeGeneralPhoto } = useStore();
    const { cabecera } = budget;

    // Helper for text inputs
    const handleTextChange = (key: keyof typeof cabecera, value: string) => {
        updateHeader({ [key]: value });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Datos del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-1 w-40">
                        <Label>Responsable</Label>
                        <Select
                            value={cabecera.responsable}
                            onValueChange={(val: any) => handleTextChange('responsable', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Elegir..." />
                            </SelectTrigger>
                            <SelectContent>
                                {['Leo', 'Jordi', 'Joan', 'Elena', 'Mª Jose', 'Felipe', 'Medina', 'Pau'].map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1 w-28">
                        <Label>Presupuesto</Label>
                        <Input
                            placeholder="Ej. 1234"
                            maxLength={10}
                            value={cabecera.numero}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('numero', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[200px]">
                        <Label>Cliente</Label>
                        <Input
                            placeholder="Nombre del cliente"
                            maxLength={300}
                            value={cabecera.cliente}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('cliente', e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 items-end">
                    <div className="space-y-1 w-40">
                        <Label>Desplazamiento</Label>
                        <Select
                            value={cabecera.desplazamiento}
                            onValueChange={(val: any) => handleTextChange('desplazamiento', val)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="No">No</SelectItem>
                                <SelectItem value="Valencia">Valencia</SelectItem>
                                <SelectItem value="Fuera">Fuera</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1 w-40">
                        <Label>Ciudad</Label>
                        <Input
                            placeholder="Ej. Valencia"
                            value={cabecera.ciudad}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('ciudad', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1 flex-1 min-w-[200px]">
                        <Label>Dirección</Label>
                        <Input
                            placeholder="Calle, Número..."
                            value={cabecera.direccion}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('direccion', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-1 flex flex-col">
                        <Label>Observaciones</Label>
                        <Textarea
                            placeholder="Notas adicionales..."
                            className="flex-1 min-h-[120px] resize-none"
                            value={cabecera.observaciones}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTextChange('observaciones', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Fotos / Planos</Label>
                        <PhotoUpload
                            onFileAdd={(data) => addGeneralPhoto({ id: uuidv4(), ...data, comentario: '' })}
                            trigger={
                                <div className="border border-dashed rounded-lg p-3 bg-muted/10 hover:bg-muted/20 hover:border-primary transition-all min-h-[120px] flex flex-col items-center justify-center relative group">
                                    <PhotoGrid
                                        files={budget.fotosGenerales}
                                        onRemove={removeGeneralPhoto}
                                    />
                                    {budget.fotosGenerales.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground transition-colors group-hover:text-primary">
                                            <Paperclip className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-sm font-medium">Pulsar para adjuntar archivos o arrastrar aquí</span>
                                            <span className="text-[10px] opacity-70 mt-1">Imágenes o PDFs</span>
                                        </div>
                                    ) : (
                                        <div className="mt-3 pt-3 border-t w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] text-muted-foreground font-medium">Pulsar o arrastrar más archivos</span>
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
