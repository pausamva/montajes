import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import type { Presupuesto, Adjunto } from "@/core/types";
import { calculateClientTotal, calculateAssemblerTotal } from "@/core/calculations";

// Helper to check if file is image based on header or type (simple check)
const isImage = (adj: Adjunto) => adj.type === 'image' || adj.url.startsWith('data:image') || (adj.type === 'pdf' && !!adj.thumbnail);

export const generatePurchaseOrderPDF = async (budget: Presupuesto) => {
    const doc = new jsPDF();
    const { cabecera, lineas, fotosGenerales } = budget;

    // -- CALCULATIONS --
    const { total, craneCost } = calculateClientTotal(budget);
    const assemblerPerc = 60; // TODO: Configurable
    const assemblerTotal = calculateAssemblerTotal(total, craneCost, assemblerPerc);

    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const orange = [234, 88, 12]; // #ea580c

    // -- HELPER FOR ADDING LOGO --
    const addLogo = async () => {
        try {
            const response = await fetch('/logo.png');
            const blob = await response.blob();
            const reader = new FileReader();
            return new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Could not load logo for PDF", e);
            return null;
        }
    };

    const logoData = await addLogo();
    if (logoData) {
        doc.addImage(logoData, 'PNG', margin, y, 20, 20);
    }

    // -- TITLE --
    doc.setFontSize(22);
    doc.setTextColor(orange[0], orange[1], orange[2]);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEN DE MONTAJE", pageWidth - margin, y + 12, { align: "right" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date(cabecera.fecha).toLocaleDateString()}`, pageWidth - margin, y + 18, { align: "right" });

    y += 25;

    // -- PROJECT DATA BOX --
    doc.setDrawColor(230);
    doc.setFillColor(248, 250, 252); // Very light blue/gray
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 42, 2, 2, 'F');

    y += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50);

    // Column 1
    const col1 = margin + 5;
    doc.text("DATOS DEL PROYECTO", col1, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Responsable:", col1, y);
    doc.setFont("helvetica", "normal");
    doc.text(cabecera.responsable || '---', col1 + 25, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Presupuesto:", col1, y);
    doc.setFont("helvetica", "normal");
    doc.text(cabecera.numero || 'Borrador', col1 + 25, y);

    y += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", col1, y);
    doc.setFont("helvetica", "normal");
    doc.text(cabecera.cliente || '---', col1 + 25, y);

    // Column 2
    const col2 = pageWidth / 2;
    let yCol2 = y - 12;

    doc.setFont("helvetica", "bold");
    doc.text("Ciudad:", col2, yCol2);
    doc.setFont("helvetica", "normal");
    doc.text(cabecera.ciudad || '---', col2 + 15, yCol2);

    yCol2 += 6;
    doc.setFont("helvetica", "bold");
    doc.text("Dirección:", col2, yCol2);
    yCol2 += 5;
    doc.setFont("helvetica", "normal");
    const addr = cabecera.direccion || '---';
    const splitAddr = doc.splitTextToSize(addr, (pageWidth / 2) - margin - 5);
    doc.text(splitAddr, col2, yCol2);

    y = Math.max(y + 12, yCol2 + (splitAddr.length * 5) + 5);

    // -- OBSERVATIONS --
    if (cabecera.observaciones) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(orange[0], orange[1], orange[2]);
        doc.text("OBSERVACIONES:", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50);
        const splitObs = doc.splitTextToSize(cabecera.observaciones, pageWidth - (margin * 2));
        doc.text(splitObs, margin, y);
        y += (splitObs.length * 5) + 5;
    }

    y += 5;

    // -- TABLE --
    autoTable(doc, {
        startY: y,
        head: [['Modelo', 'Descripción', 'Metros', 'Altura', 'Limpieza']],
        body: lineas.map(line => [
            line.modelo,
            line.descripcion,
            `${line.metros} m²`,
            line.altura,
            line.limpieza,
        ]),
        theme: 'grid',
        headStyles: {
            fillColor: [51, 65, 85], // Slate-700
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
        },
        columnStyles: {
            2: { halign: 'center' },
            3: { halign: 'center' },
            4: { halign: 'center' },
        }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // -- GENERAL PHOTOS / DOCS --
    if (fotosGenerales && fotosGenerales.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(orange[0], orange[1], orange[2]);
        doc.text("DOCUMENTACIÓN GENERAL / PLANOS", margin, y);
        y += 8;

        const images = fotosGenerales.filter(isImage);
        const pdfs = fotosGenerales.filter(f => !isImage(f));

        if (images.length > 0) {
            let xPos = margin;
            const imgSize = 42;
            const gap = 4;

            images.forEach((img) => {
                if (xPos + imgSize > pageWidth - margin) {
                    xPos = margin;
                    y += imgSize + gap;
                }
                if (y + imgSize > 275) {
                    doc.addPage();
                    y = 20;
                    xPos = margin;
                }
                try {
                    doc.addImage(img.thumbnail || img.url, 'JPEG', xPos, y, imgSize, imgSize, undefined, 'FAST');
                    xPos += imgSize + gap;
                } catch (e) { }
            });
            y += imgSize + 10;
        }

        if (pdfs.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(100);
            pdfs.forEach(pdf => {
                if (y > 280) { doc.addPage(); y = 20; }
                doc.text(`📄 ${pdf.name || 'Documento PDF'}`, margin + 5, y);
                y += 5;
            });
            y += 5;
        }
    }

    // -- LINE ATTACHMENTS --
    const linesWithAttachments = lineas.filter(l => l.adjuntos && l.adjuntos.length > 0);
    if (linesWithAttachments.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(orange[0], orange[1], orange[2]);
        doc.text("DETALLE VISUAL DE LÍNEAS", margin, y);
        y += 10;

        linesWithAttachments.forEach(line => {
            if (y > 230) { doc.addPage(); y = 20; }

            doc.setFillColor(241, 245, 249); // Slate-100
            doc.rect(margin, y - 5, pageWidth - (margin * 2), 7, 'F');
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(51, 65, 85);
            doc.text(`MOD: ${line.modelo || '---'}`, margin + 2, y);
            doc.text(`${line.metros} m²`, pageWidth - margin - 2, y, { align: 'right' });
            y += 8;

            const lImages = line.adjuntos.filter(isImage);
            const lPdfs = line.adjuntos.filter(f => !isImage(f));
            const imgSize = 40;
            const gap = 4;

            if (lImages.length > 0) {
                let xPos = margin;
                lImages.forEach(img => {
                    if (xPos + imgSize > pageWidth - margin) {
                        xPos = margin;
                        y += imgSize + gap;
                    }
                    if (y + imgSize > 275) {
                        doc.addPage();
                        y = 20;
                        xPos = margin;
                    }
                    try {
                        doc.addImage(img.thumbnail || img.url, 'JPEG', xPos, y, imgSize, imgSize, undefined, 'FAST');
                        xPos += imgSize + gap;
                    } catch (e) { }
                });
                y += imgSize + 6;
            }

            if (line.descripcion) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(80);
                const splitDesc = doc.splitTextToSize(`Descripción: ${line.descripcion}`, pageWidth - (margin * 2));
                if (y + (splitDesc.length * 4) > 285) { doc.addPage(); y = 20; }
                doc.text(splitDesc, margin, y);
                y += (splitDesc.length * 4) + 4;
            }

            if (lPdfs.length > 0) {
                lPdfs.forEach(pdf => {
                    if (y > 280) { doc.addPage(); y = 20; }
                    doc.text(`📄 ${pdf.name || "Documento PDF"}`, margin + 5, y);
                    y += 5;
                });
            }
            y += 4;
        });
    }

    // -- TOTAL BOX --
    if (y > 250) { doc.addPage(); y = 20; }
    y += 10;

    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 15, 1, 1, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255);
    doc.text(`TOTAL A PAGAR MONTADOR (SIN IVA):`, margin + 5, y + 10);
    doc.text(`${assemblerTotal.toFixed(2)} €`, pageWidth - margin - 5, y + 10, { align: 'right' });

    // -- SAVE & PRINT --
    const safeNumero = (cabecera.numero || 'Borrador').replace(/[^a-z0-9]/gi, '_');
    const fileName = `Orden_Montaje_${safeNumero}.pdf`;
    const url = URL.createObjectURL(doc.output('blob'));

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    const printWindow = window.open(url, '_blank');
    if (printWindow) {
        printWindow.addEventListener('load', () => printWindow.print());
    }

    setTimeout(() => URL.revokeObjectURL(url), 2000);
};
