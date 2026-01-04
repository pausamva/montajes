import { useStore } from "@/core/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label>Cliente</Label>
                        <Input
                            value={cabecera.cliente}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('cliente', e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Nº Presupuesto</Label>
                        <Input
                            value={cabecera.numero}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('numero', e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
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
                    <div className="space-y-1 md:col-span-2">
                        <Label>Dirección</Label>
                        <Input
                            value={cabecera.direccion}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextChange('direccion', e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label>Observaciones</Label>
                    <Textarea
                        className="min-h-[80px]"
                        value={cabecera.observaciones}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTextChange('observaciones', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex justify-between items-center">
                        <span>Fotos Generales / Planos</span>
                        <PhotoUpload onFileAdd={(data) => addGeneralPhoto({ id: uuidv4(), ...data, comentario: '' })} />
                    </Label>
                    <PhotoGrid
                        files={budget.fotosGenerales}
                        onRemove={removeGeneralPhoto}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
