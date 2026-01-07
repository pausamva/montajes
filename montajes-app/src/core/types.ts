
export type Altura = 'No' | 'Escalera' | 'Andamio' | 'Grua';
export type Limpieza = 'No' | 'Si';
export type Desplazamiento = 'No' | 'Valencia' | 'Fuera';

export interface Montador {
    id: string;
    nombre: string;
    porcentaje: number;
    activo: boolean;
}

export interface Config {
    costeVinilo: number;
    costeLimpieza: number;
    costeGrua: number;
    recargoEscalera: number;
    recargoAndamio: number;
    despValencia: number;
    despFuera: number;
    montadores: Montador[];
}

export interface Adjunto {
    id: string;
    url: string; // Base64 or Blob URL
    type: 'image' | 'pdf'; // New field to distinguish
    name: string; // Filename for PDFs
    thumbnail?: string; // Preview for PDFs
    comentario: string;
}

export interface Linea {
    id: string;
    modelo: string;
    descripcion: string;
    metros: number;
    altura: Altura;
    limpieza: Limpieza;
    adjuntos: Adjunto[];
}

export interface Cabecera {
    fecha: string;
    cliente: string;
    numero: string;
    desplazamiento: Desplazamiento;
    direccion: string;
    ciudad: string; // Added mainly for structure, but req says just "Direccion simple" + "Ciudad"
    cp: string;
    contacto: string;
    observaciones: string;
    montadorId: string;
    responsable: string;
}

export interface Presupuesto {
    id: string;
    schemaVersion: number;
    cabecera: Cabecera;
    config: Config;
    lineas: Linea[];
    fotosGenerales: Adjunto[];
}

// Default constants
export const DEFAULT_CONFIG: Config = {
    costeVinilo: 15,
    costeLimpieza: 5,
    costeGrua: 0,
    recargoEscalera: 50,
    recargoAndamio: 100,
    despValencia: 30,
    despFuera: 50,
    montadores: [
        { id: '1', nombre: 'Montador Default', porcentaje: 60, activo: true }
    ]
};
