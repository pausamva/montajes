import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import type { Presupuesto, Adjunto } from "@/core/types";
import { calculateClientTotal, calculateAssemblerTotal } from "@/core/calculations";

// Helper to check if file is image based on header or type (simple check)
const isImage = (adj: Adjunto) => adj.type === 'image' || adj.url.startsWith('data:image') || (adj.type === 'pdf' && !!adj.thumbnail);

export const generatePurchaseOrderPDF = (budget: Presupuesto) => {
    const doc = new jsPDF();
    const { cabecera, lineas, fotosGenerales } = budget;

    // -- CALCULATIONS --
    const { total, craneCost } = calculateClientTotal(budget);
    const assemblerPerc = 60; // TODO: Configurable
    const assemblerTotal = calculateAssemblerTotal(total, craneCost, assemblerPerc);

    let y = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    // -- HEADER --
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ORDEN DE MONTAJE", pageWidth / 2, y, { align: "center" });

    y += 15;

    // Project Data Grid
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Left
    doc.text(`Fecha: ${new Date(cabecera.fecha).toLocaleDateString()}`, margin, y);
    doc.text(`Cliente: ${cabecera.cliente}`, margin, y + 6);
    doc.text(`Nº P.: ${cabecera.numero}`, margin, y + 12);

    // Right
    const rightX = pageWidth / 2 + 10;
    if (cabecera.direccion) {
        doc.text(`Dirección: ${cabecera.direccion}`, rightX, y);
        if (cabecera.ciudad) doc.text(`Ciudad: ${cabecera.ciudad}`, rightX, y + 6);
    }
    y += 18;

    // Observations (Moved to Header)
    if (cabecera.observaciones) {
        doc.setFont("helvetica", "bold");
        doc.text("Observaciones:", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const splitObs = doc.splitTextToSize(cabecera.observaciones, pageWidth - (margin * 2));
        doc.text(splitObs, margin, y);
        y += (splitObs.length * 5) + 5;
    }

    y += 10;

    // -- GENERAL PHOTOS / DOCS --
    if (fotosGenerales && fotosGenerales.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Documentación General / Planos", margin, y);
        y += 8;

        // Render filenames for PDFs
        const pdfs = fotosGenerales.filter(f => !isImage(f));
        if (pdfs.length > 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            pdfs.forEach(pdf => {
                doc.text(`📄 ${pdf.name || 'Documento PDF'}`, margin + 5, y);
                y += 5;
            });
            y += 3;
        }

        // Render Images
        const images = fotosGenerales.filter(isImage);
        if (images.length > 0) {
            let xPos = margin;
            const imgSize = 40;
            const gap = 5;

            images.forEach((img) => {
                // Check X space
                if (xPos + imgSize > pageWidth - margin) {
                    xPos = margin;
                    y += imgSize + gap;
                }
                // Check Y space - explicit page break check
                if (y + imgSize > 280) {
                    doc.addPage();
                    y = 20;
                    xPos = margin;
                }

                try {
                    doc.addImage(img.thumbnail || img.url, 'JPEG', xPos, y, imgSize, imgSize, undefined, 'FAST');
                    xPos += imgSize + gap;
                } catch (e) {
                    console.error("Error adding image to PDF", e);
                }
            });
            // Update Y after images
            if (images.length > 0) y += imgSize + 10;
        }
    }

    // -- TABLE --
    // Force clean start
    if (y > 250) { doc.addPage(); y = 20; }

    const tableBody = lineas.map(line => [
        line.modelo,
        line.descripcion,
        `${line.metros} m²`,
        line.altura,
        line.limpieza,
        // Hidden Cost
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Modelo', 'Descripción', 'Metros', 'Altura', 'Limpieza']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    const lastTableY = (doc as any).lastAutoTable.finalY + 10;
    y = lastTableY;

    // -- LINE ATTACHMENTS --
    // Defined as "Visualización de los documentos añadidos a cada linea"
    // We visualize them AFTER the table, grouped by line if they exist
    const linesWithAttachments = lineas.filter(l => l.adjuntos && l.adjuntos.length > 0);

    if (linesWithAttachments.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Detalle Visual de Líneas:", margin, y);
        y += 8;

        linesWithAttachments.forEach(line => {
            // Check space
            if (y > 230) { doc.addPage(); y = 20; }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text(`> Modelo: ${line.modelo || 'Línea'}  (Superficie: ${line.metros} m²)`, margin, y);
            y += 6;

            const lImages = line.adjuntos.filter(isImage);
            const lPdfs = line.adjuntos.filter(f => !isImage(f));

            // Split description to text lines
            const imgSize = 45;
            const gap = 5;

            // Calculate width available for description if images exist
            const descX = margin + (lImages.length > 0 ? imgSize + gap : 0);
            const descWidth = pageWidth - descX - margin;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);

            // If images exist, render them and description next to the first one
            if (lImages.length > 0) {
                let xPos = margin;
                let currentImgY = y;
                let maxRowY = y; // Track bottom of images row

                lImages.forEach((img, idx) => {
                    // Check page break for image
                    if (currentImgY + imgSize > 280) {
                        doc.addPage();
                        currentImgY = 20;
                        y = 20;
                        xPos = margin;
                    }

                    try {
                        doc.addImage(img.thumbnail || img.url, 'JPEG', xPos, currentImgY, imgSize, imgSize, undefined, 'FAST');

                        // If it's the first image, print description to its right
                        if (idx === 0) {
                            const splitDesc = doc.splitTextToSize(line.descripcion, descWidth);
                            doc.text(splitDesc, descX, currentImgY + 4);
                            // Ensure Y extends at least below description if longer than image
                            const descHeight = splitDesc.length * 4;
                            if (currentImgY + descHeight > maxRowY) {
                                // Don't actually extend maxRowY based on desc yet, usually image is taller.
                                // But if desc is huge, we might intersect next row. 
                                // Let's simplify: y will be set to max of (imageBottom, descBottom)
                                if (currentImgY + descHeight > currentImgY + imgSize) {
                                    maxRowY = Math.max(maxRowY, currentImgY + descHeight);
                                }
                            }
                        }

                        xPos += imgSize + gap;

                        // Wrap images if many
                        if (xPos + imgSize > pageWidth - margin) {
                            xPos = margin;
                            currentImgY += imgSize + gap;
                        }
                        maxRowY = Math.max(maxRowY, currentImgY + imgSize);
                    } catch (e) { }
                });
                // Update Main Y to below images/desc
                y = maxRowY + gap;
            } else {
                // No images, just description
                doc.text(`Descripción: ${line.descripcion}`, margin, y);
                y += 6;
            }

            // PDFs below everything
            if (lPdfs.length > 0) {
                y += 2;
                lPdfs.forEach(pdf => {
                    const name = pdf.name || "Documento PDF";
                    doc.text(`📄 ${name}`, margin + 5, y);
                    y += 5;
                });
            }

            y += 5; // Spacer between lines
        });
    }

    // -- FOOTER / OBSERVATIONS / TOTAL --
    if (y > 240) { doc.addPage(); y = 20; }

    // Observations removed from here (moved to header)
    if (y > 240) { doc.addPage(); y = 20; }

    // Total
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    // Requirement: No percentage shown, just total
    doc.text(`TOTAL A PAGAR MONTADOR (SIN IVA): ${assemblerTotal.toFixed(2)} €`, margin, y);

    // -- SAVE --
    const safeNumero = (cabecera.numero || 'Borrador').replace(/[^a-z0-9]/gi, '_');
    const fileName = `Orden_Montaje_${safeNumero}.pdf`;

    const originalBlob = doc.output('blob');
    const url = URL.createObjectURL(originalBlob);

    // Download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Print
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
        printWindow.addEventListener('load', () => {
            printWindow.print();
        });
    }

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000); // Increased timeout to ensure print window can load
};
