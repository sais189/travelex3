import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PDFExportProps {
  destination: {
    id: number;
    name: string;
    country: string;
    description?: string;
    price?: string;
    duration?: number;
    itinerary?: any[];
    imageUrl?: string | null;
  };
  className?: string;
}

export default function PDFExport({ destination, className }: PDFExportProps) {
  const generatePDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Add header
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text(destination.name, margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(14);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${destination.country}${destination.duration ? ` • ${destination.duration} Days` : ''}`, margin, yPosition);
      yPosition += 10;

      if (destination.price) {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text(`Price: $${destination.price}`, margin, yPosition);
        yPosition += 20;
      }

      // Add description
      if (destination.description) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const splitDescription = pdf.splitTextToSize(destination.description, pageWidth - 2 * margin);
        pdf.text(splitDescription, margin, yPosition);
        yPosition += splitDescription.length * 5 + 15;
      }

      // Add itinerary if available
      if (destination.itinerary && Array.isArray(destination.itinerary)) {
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("Day-by-Day Itinerary", margin, yPosition);
        yPosition += 15;

        destination.itinerary.forEach((day: any, index: number) => {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Day ${index + 1}: ${day.title || day.day || `Day ${index + 1}`}`, margin, yPosition);
          yPosition += 10;

          pdf.setFontSize(11);
          pdf.setFont("helvetica", "normal");
          
          if (day.description) {
            const splitDayDesc = pdf.splitTextToSize(day.description, pageWidth - 2 * margin);
            pdf.text(splitDayDesc, margin, yPosition);
            yPosition += splitDayDesc.length * 4 + 5;
          }

          if (day.activities && Array.isArray(day.activities)) {
            pdf.text("Activities:", margin, yPosition);
            yPosition += 5;
            day.activities.forEach((activity: string) => {
              pdf.text(`• ${activity}`, margin + 10, yPosition);
              yPosition += 4;
            });
            yPosition += 5;
          }

          if (day.highlights && Array.isArray(day.highlights)) {
            pdf.text("Highlights:", margin, yPosition);
            yPosition += 5;
            day.highlights.forEach((highlight: string) => {
              pdf.text(`• ${highlight}`, margin + 10, yPosition);
              yPosition += 4;
            });
            yPosition += 5;
          }

          yPosition += 10;
        });
      }

      // Add footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
          margin,
          pageHeight - 10
        );
      }

      // Save the PDF
      const fileName = `${destination.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      variant="outline"
      size="sm"
      className={className}
    >
      <Download className="w-4 h-4 mr-2" />
      Export PDF
    </Button>
  );
}