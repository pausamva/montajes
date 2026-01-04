import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
import type { Presupuesto } from '@/core/types';

// Helper to detect if running in Tauri
const isTauri = () => !!(window as any).__TAURI__;

export const saveBudgetToFile = async (budget: Presupuesto) => {
    const fileName = `${budget.cabecera.cliente.replace(/\s+/g, '_')}_${budget.cabecera.numero}.json`;
    const content = JSON.stringify(budget, null, 2);

    if (isTauri()) {
        try {
            const filePath = await save({
                defaultPath: fileName,
                filters: [{
                    name: 'Montajes JSON',
                    extensions: ['json']
                }]
            });

            if (filePath) {
                await writeTextFile(filePath, content);
                return true;
            }
        } catch (e) {
            console.error('Error saving file with Tauri:', e);
            return false;
        }
    } else {
        // Web Fallback: Download as blob
        // Using octet-stream to force download
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = fileName.replace(/[^a-z0-9\._-]/gi, '_'); // Sanitize
        a.download = safeName;
        document.body.appendChild(a); // REQUIRED for Firefox/some Browsers
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return true;
    }
    return false;
};

export const loadBudgetFromFile = async (): Promise<Presupuesto | null> => {
    if (isTauri()) {
        try {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Montajes JSON',
                    extensions: ['json']
                }]
            });

            if (selected && typeof selected === 'string') {
                const content = await readTextFile(selected);
                return JSON.parse(content) as Presupuesto;
            }
        } catch (e) {
            console.error('Error loading file with Tauri:', e);
        }
    } else {
        // Web Fallback: File Input trigger
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const data = JSON.parse(ev.target?.result as string);
                            resolve(data);
                        } catch (err) {
                            console.error('Error parsing JSON', err);
                            resolve(null);
                        }
                    };
                    reader.readAsText(file);
                } else {
                    resolve(null);
                }
                document.body.removeChild(input);
            };
            document.body.appendChild(input);
            input.click();
        });
    }
    return null;
};
