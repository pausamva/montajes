import { useStore } from "@/core/store";
import { calculateClientTotal, calculateAssemblerTotal } from "@/core/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TotalsSummary() {
    const { budget } = useStore();
    const { totalLines, travelCost, craneCost, total } = calculateClientTotal(budget);

    // Default assembler percentage for now (take from first configured or config default)
    const defaultAssemblerPerc = 60; // TODO: Make dynamic from config
    const assemblerTotal = calculateAssemblerTotal(total, craneCost, defaultAssemblerPerc);

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle>Resumen Económico</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Suma Líneas</span>
                        <span>{totalLines.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Desplazamiento</span>
                        <span>{travelCost.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Grúa</span>
                        <span>{craneCost.toFixed(2)} €</span>
                    </div>

                    <Separator className="my-2" />

                    <div className="flex justify-between text-lg font-bold text-primary">
                        <span>TOTAL (SIN IVA)</span>
                        <span>{total.toFixed(2)} €</span>
                    </div>

                    <Separator className="my-2" />

                    <div className="pt-2">
                        <h4 className="font-semibold mb-2 text-xs uppercase text-muted-foreground">Datos Internos Montador</h4>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">% Aplicado</span>
                            <span>{defaultAssemblerPerc}%</span>
                        </div>
                        <div className="flex justify-between font-medium">
                            <span>A pagar montador (SIN IVA)</span>
                            <span>{assemblerTotal.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
