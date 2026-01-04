import { useStore } from "@/core/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function ConfigEditor() {
    const { budget, updateConfig } = useStore();
    const { config } = budget;

    const handleChange = (key: keyof typeof config, value: string) => {
        updateConfig({ [key]: parseFloat(value) || 0 });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Precios</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <Label>Coste Vinilo (€/m²)</Label>
                    <Input
                        type="number"
                        value={config.costeVinilo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('costeVinilo', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Coste Limpieza (€/m²)</Label>
                    <Input
                        type="number"
                        value={config.costeLimpieza}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('costeLimpieza', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Coste Grúa (€)</Label>
                    <Input
                        type="number"
                        value={config.costeGrua}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('costeGrua', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Despl. Valencia (€)</Label>
                    <Input
                        type="number"
                        value={config.despValencia}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('despValencia', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Despl. Fuera (€)</Label>
                    <Input
                        type="number"
                        value={config.despFuera}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('despFuera', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Recargo Escalera (%)</Label>
                    <Input
                        type="number"
                        value={config.recargoEscalera}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('recargoEscalera', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <Label>Recargo Andamio (%)</Label>
                    <Input
                        type="number"
                        value={config.recargoAndamio}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('recargoAndamio', e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
