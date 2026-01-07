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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Cliente Card */}
            <Card className="flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Presupuesto Cliente</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
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

                        <div className="flex justify-between text-lg font-bold text-orange-600 dark:text-orange-400">
                            <span>TOTAL CLIENTE (SIN IVA)</span>
                            <span>{total.toFixed(2)} €</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Montador Card */}
            <Card className="bg-muted/20 flex flex-col border-orange-200/20">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Resumen Montador</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">% Aplicado</span>
                            <span>{defaultAssemblerPerc}%</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Base Imp.</span>
                            <span>{(total - craneCost).toFixed(2)} €</span>
                        </div>

                        <Separator className="my-2" />

                        <div className="flex justify-between text-lg font-bold text-foreground">
                            <span>TOTAL MONTADOR</span>
                            <span>{assemblerTotal.toFixed(2)} €</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-right italic">(SIN IVA)</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
