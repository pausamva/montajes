import type { Presupuesto, Linea, Config } from './types';

export const calculateLineCost = (line: Linea, config: Config): number => {
    const { metros, altura, limpieza } = line;
    const { costeVinilo, costeLimpieza, recargoEscalera, recargoAndamio } = config;

    let base = metros * costeVinilo;
    let surcharge = 0;

    // Altura logic
    if (altura === 'Escalera') {
        surcharge = base * (recargoEscalera / 100);
    } else if (altura === 'Andamio') {
        surcharge = base * (recargoAndamio / 100);
    }
    // 'Grua' does not affect line price, only global trigger

    // Limpieza logic
    let cleaningCost = 0;
    if (limpieza === 'Si') {
        cleaningCost = metros * costeLimpieza;
    }

    return base + surcharge + cleaningCost;
};

export const calculateTravelCost = (desplazamiento: string, config: Config): number => {
    if (desplazamiento === 'Valencia') return config.despValencia;
    if (desplazamiento === 'Fuera') return config.despFuera;
    return 0;
};

export const hasCrane = (lines: Linea[]): boolean => {
    return lines.some(l => l.altura === 'Grua');
};

export const calculateClientTotal = (budget: Presupuesto): {
    totalLines: number,
    travelCost: number,
    craneCost: number,
    total: number
} => {
    const { config, lineas, cabecera } = budget;

    const totalLines = lineas.reduce((sum, line) => sum + calculateLineCost(line, config), 0);
    const travelCost = calculateTravelCost(cabecera.desplazamiento, config);

    // Crane logic: Applied if ANY line has 'Grua'
    const craneCost = hasCrane(lineas) ? config.costeGrua : 0;

    return {
        totalLines,
        travelCost,
        craneCost,
        total: totalLines + travelCost + craneCost
    };
};

export const calculateAssemblerTotal = (clientTotal: number, craneCost: number, selectedPercentage: number): number => {
    // Crane cost is kept by the company/installer who paid for it, it is NOT subject to the commission split
    // Usually the commission is on the PROFITable part.
    // If the client pays 100 + 50(crane), and assembler gets 60%...
    // Does assembler get 60% of 100? Yes.
    // So base = clientTotal - craneCost.
    const base = clientTotal - craneCost;
    return base * (selectedPercentage / 100);
};
