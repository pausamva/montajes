import React from 'react';
import { useStore } from "@/core/store";
import { calculateLineCost } from "@/core/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Copy, Paperclip } from "lucide-react";
import type { Altura, Limpieza } from "@/core/types";
import { PhotoUpload, PhotoGrid } from "./photo-upload";
import { v4 as uuidv4 } from 'uuid';

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Componente para inputs numéricos que aceptan coma y punto
const DecimalInput = ({
    value,
    onChange,
    className,
    ...props
}: {
    value: number;
    onChange: (val: number) => void;
    className?: string;
    [key: string]: any;
}) => {
    const [localValue, setLocalValue] = useState(value?.toString() || "");

    // Sincronizar con el valor externo cuando cambia, si no estamos editando (opcional, pero buena práctica)
    // En este caso, confiamos en el renderizado, pero para evitar conflictos de "borrado de coma",
    // usamos el estado local como fuente de verdad mientras se escribe.
    useEffect(() => {
        setLocalValue(value?.toString() || "");
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setLocalValue(raw);

        // Reemplazar coma por punto para el parsing
        const normalized = raw.replace(',', '.');
        const parsed = parseFloat(normalized);

        if (!isNaN(parsed)) {
            onChange(parsed);
        } else if (raw === "") {
            onChange(0);
        }
    };

    const handleBlur = () => {
        // Formatear al salir si es necesario, o simplemente asegurar que coincida con el store
        // setLocalValue(value.toString()); 
        // Realmente el useEffect ya lo hará si el store cambió, pero si no cambió (ej: "10,0" vs 10),
        // querremos limpiarlo.
        let normalized = localValue.replace(',', '.');
        const parsed = parseFloat(normalized);
        if (!isNaN(parsed)) {
            setLocalValue(parsed.toString());
        }
    };

    return (
        <Input
            {...props}
            type="text"
            inputMode="decimal"
            value={localValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={(e) => e.target.select()}
            className={className}
        />
    );
};

export function LinesTable() {
    const { budget, addLine, removeLine, updateLine, duplicateLine, addPhotoToLine, removePhotoFromLine, updateConfig } = useStore();

    // State for Crane Cost Dialog
    const [isCraneDialogOpen, setIsCraneDialogOpen] = useState(false);
    const [tempCraneCost, setTempCraneCost] = useState("0");

    const handleAlturaChange = (lineId: string, val: Altura) => {
        updateLine(lineId, { altura: val });

        if (val === 'Grua' && budget.config.costeGrua === 0) {
            setTempCraneCost("0");
            setIsCraneDialogOpen(true);
        }
    };

    const handleCraneCostSave = () => {
        const cost = parseFloat(tempCraneCost);
        if (!isNaN(cost) && cost > 0) {
            updateConfig({ costeGrua: cost });
        }
        setIsCraneDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            {/* Dialog for Crane Cost */}
            <Dialog open={isCraneDialogOpen} onOpenChange={setIsCraneDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Establecer Coste de Grúa</DialogTitle>
                        <DialogDescription>
                            El coste de la grúa no ha sido definido todavía para este presupuesto. Por favor, introdúcelo :
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="crane-cost" className="text-right">
                                Coste (€)
                            </Label>
                            <Input
                                id="crane-cost"
                                type="number"
                                className="col-span-3"
                                value={tempCraneCost}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => setTempCraneCost(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCraneCostSave}>Guardar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead className="min-w-[200px]">Modelo</TableHead>
                            <TableHead className="min-w-[200px]">Descripción</TableHead>
                            <TableHead className="w-[100px]">m²</TableHead>
                            <TableHead className="w-[120px]">Altura</TableHead>
                            <TableHead className="w-[100px]">Limpieza</TableHead>
                            <TableHead className="text-right">Coste</TableHead>
                            <TableHead className="min-w-[150px]">Archivos</TableHead>
                            <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {budget.lineas.map((line) => {
                            const cost = calculateLineCost(line, budget.config);

                            return (
                                <React.Fragment key={line.id}>
                                    <TableRow>
                                        <TableCell className="w-[50px]"></TableCell>
                                        <TableCell>
                                            <Textarea
                                                value={line.modelo}
                                                onChange={(e) => updateLine(line.id, { modelo: e.target.value })}
                                                placeholder="Diseño..."
                                                className="min-h-[60px] resize-y"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Textarea
                                                value={line.descripcion}
                                                onChange={(e) => updateLine(line.id, { descripcion: e.target.value })}
                                                placeholder="Tarea..."
                                                className="min-h-[60px] resize-y"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <DecimalInput
                                                value={line.metros}
                                                onChange={(val) => updateLine(line.id, { metros: val })}
                                                className="h-8"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={line.altura}
                                                onValueChange={(val: Altura) => handleAlturaChange(line.id, val)}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="No">No</SelectItem>
                                                    <SelectItem value="Escalera">Escalera</SelectItem>
                                                    <SelectItem value="Andamio">Andamio</SelectItem>
                                                    <SelectItem value="Grua">Grúa</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={line.limpieza}
                                                onValueChange={(val: Limpieza) => updateLine(line.id, { limpieza: val })}
                                            >
                                                <SelectTrigger className="h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="No">No</SelectItem>
                                                    <SelectItem value="Si">Sí</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {cost.toFixed(2)} €
                                        </TableCell>
                                        <TableCell className="p-1">
                                            <PhotoUpload
                                                onFileAdd={(data) => addPhotoToLine(line.id, { id: uuidv4(), ...data, comentario: '' })}
                                                trigger={
                                                    <div className="border border-dashed rounded-md p-1.5 bg-muted/5 hover:bg-muted/20 hover:border-primary transition-all min-h-[60px] flex flex-col items-center justify-center relative group cursor-pointer">
                                                        <PhotoGrid
                                                            compact
                                                            files={line.adjuntos || []}
                                                            onRemove={(photoId) => removePhotoFromLine(line.id, photoId)}
                                                        />
                                                        {(!line.adjuntos || line.adjuntos.length === 0) ? (
                                                            <div className="flex flex-col items-center justify-center py-2 text-muted-foreground transition-colors group-hover:text-primary">
                                                                <Paperclip className="w-4 h-4 mb-1 opacity-50" />
                                                                <span className="text-[10px] font-medium text-center leading-tight">Pulsar o arrastrar fotos</span>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-1 pt-1 border-t w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="text-[9px] text-muted-foreground font-medium">Añadir más</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateLine(line.id)}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLine(line.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            )
                        })}
                        {budget.lineas.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center h-24 text-muted-foreground">
                                    No hay líneas de trabajo. Añade una para comenzar.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div >
            <Button onClick={addLine} variant="secondary" className="w-full">
                + Añadir Línea
            </Button>
        </div >
    );
}
