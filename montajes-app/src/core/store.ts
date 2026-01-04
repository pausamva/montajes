import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Presupuesto, Config, Linea, Adjunto, Cabecera } from './types';
import { DEFAULT_CONFIG } from './types';

interface AppState {
    budget: Presupuesto;
    setBudget: (budget: Presupuesto) => void;
    resetBudget: () => void;

    // Actions
    updateConfig: (config: Partial<Config>) => void;
    updateHeader: (cabecera: Partial<Cabecera>) => void;

    addLine: () => void;
    removeLine: (id: string) => void;
    updateLine: (id: string, data: Partial<Linea>) => void;
    duplicateLine: (id: string) => void;
    moveLine: (dragIndex: number, hoverIndex: number) => void; // Reorder

    addPhotoToLine: (lineId: string, adjunto: Adjunto) => void;
    removePhotoFromLine: (lineId: string, adjuntoId: string) => void;

    addGeneralPhoto: (adjunto: Adjunto) => void;
    removeGeneralPhoto: (adjuntoId: string) => void;
}

const createEmptyBudget = (): Presupuesto => ({
    id: uuidv4(),
    schemaVersion: 1,
    config: { ...DEFAULT_CONFIG },
    cabecera: {
        fecha: new Date().toISOString(),
        cliente: '',
        numero: '',
        desplazamiento: 'No',
        direccion: '',
        ciudad: '',
        cp: '',
        contacto: '',
        observaciones: '',
        montadorId: ''
    },
    lineas: [],
    fotosGenerales: []
});

export const useStore = create<AppState>((set) => ({
    budget: createEmptyBudget(),

    setBudget: (budget) => set({ budget }),

    resetBudget: () => set({ budget: createEmptyBudget() }),

    updateConfig: (newConfig) => set((state) => ({
        budget: { ...state.budget, config: { ...state.budget.config, ...newConfig } }
    })),

    updateHeader: (newHeader) => set((state) => ({
        budget: { ...state.budget, cabecera: { ...state.budget.cabecera, ...newHeader } }
    })),

    addLine: () => set((state) => ({
        budget: {
            ...state.budget,
            lineas: [
                ...state.budget.lineas,
                {
                    id: uuidv4(),
                    modelo: '',
                    descripcion: '',
                    metros: 0,
                    altura: 'No',
                    limpieza: 'No',
                    adjuntos: []
                }
            ]
        }
    })),

    removeLine: (id) => set((state) => ({
        budget: {
            ...state.budget,
            lineas: state.budget.lineas.filter(l => l.id !== id)
        }
    })),

    updateLine: (id, data) => set((state) => ({
        budget: {
            ...state.budget,
            lineas: state.budget.lineas.map(l => l.id === id ? { ...l, ...data } : l)
        }
    })),

    duplicateLine: (id) => set((state) => {
        const lineToClone = state.budget.lineas.find(l => l.id === id);
        if (!lineToClone) return {};
        const clonedLine = { ...lineToClone, id: uuidv4(), adjuntos: [] }; // Don't shallow copy attachments
        return {
            budget: {
                ...state.budget,
                lineas: [...state.budget.lineas, clonedLine]
            }
        };
    }),

    // Simple swap logic for reorder, assuming simpler than full DnD for now
    moveLine: (fromIndex, toIndex) => set((state) => {
        const lines = [...state.budget.lineas];
        const [moved] = lines.splice(fromIndex, 1);
        lines.splice(toIndex, 0, moved);
        return { budget: { ...state.budget, lineas: lines } };
    }),

    addPhotoToLine: (lineId, adjunto) => set((state) => ({
        budget: {
            ...state.budget,
            lineas: state.budget.lineas.map(l => l.id === lineId ? { ...l, adjuntos: [...(l.adjuntos || []), adjunto] } : l)
        }
    })),

    removePhotoFromLine: (lineId, adjuntoId) => set((state) => ({
        budget: {
            ...state.budget,
            lineas: state.budget.lineas.map(l => l.id === lineId ? { ...l, adjuntos: (l.adjuntos || []).filter(f => f.id !== adjuntoId) } : l)
        }
    })),

    addGeneralPhoto: (adjunto) => set((state) => ({
        budget: { ...state.budget, fotosGenerales: [...state.budget.fotosGenerales, adjunto] }
    })),

    removeGeneralPhoto: (adjuntoId) => set((state) => ({
        budget: { ...state.budget, fotosGenerales: state.budget.fotosGenerales.filter(f => f.id !== adjuntoId) }
    }))
}));
