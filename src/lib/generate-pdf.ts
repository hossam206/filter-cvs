import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CVData } from '@/types/cv';
import { formatYears } from './calculate-company-years';

export function generateCVPDF(cv: CVData): void {
  const doc = new jsPDF();

  const primaryColor = [41, 128, 185] as [number, number, number]; // Blue
  const secondaryColor = [52, 73, 94] as [number, number, number]; // Dark gray
  const lightGray = [236, 240, 241] as [number, number, number];

  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Title - Candidate Name
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(cv.name, margin, yPosition);
  yPosition += 10;

  // Years of Experience
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'normal');
  doc.text(`${cv.yearsOfExperience} years of experience`, margin, yPosition);
  yPosition += 3;

  // Horizontal line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Contact Information
  if (cv.email || cv.phone) {
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Information', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');

    if (cv.email) {
      doc.text(`Email: ${cv.email}`, margin + 5, yPosition);
      yPosition += 5;
    }

    if (cv.phone) {
      doc.text(`Phone: ${cv.phone}`, margin + 5, yPosition);
      yPosition += 5;
    }

    yPosition += 5;
  }

  // Professional Summary
  if (cv.summary) {
    checkPageBreak(30);

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Professional Summary', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');

    const summaryLines = doc.splitTextToSize(cv.summary, contentWidth - 5);
    doc.text(summaryLines, margin + 5, yPosition);
    yPosition += summaryLines.length * 5 + 8;
  }

  // Skills
  if (cv.skills && cv.skills.length > 0) {
    checkPageBreak(30);

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Skills', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont('helvetica', 'normal');

    // Display skills in a grid-like format
    const skillsText = cv.skills.join(' • ');
    const skillsLines = doc.splitTextToSize(skillsText, contentWidth - 5);
    doc.text(skillsLines, margin + 5, yPosition);
    yPosition += skillsLines.length * 5 + 8;
  }

  // Work Experience
  if (cv.companies && cv.companies.length > 0) {
    checkPageBreak(40);

    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Work Experience', margin, yPosition);
    yPosition += 10;

    cv.companies.forEach((company, index) => {
      checkPageBreak(35);

      // Company background box
      doc.setFillColor(...lightGray);
      doc.rect(margin, yPosition - 5, contentWidth, 12, 'F');

      // Position
      doc.setFontSize(12);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text(company.position, margin + 3, yPosition);
      yPosition += 6;

      // Company name and duration
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${company.name} | ${company.duration}`, margin + 3, yPosition);
      yPosition += 8;

      // Achievements
      if (company.achievements && company.achievements.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(...secondaryColor);

        company.achievements.forEach(achievement => {
          checkPageBreak(10);

          const achievementLines = doc.splitTextToSize(achievement, contentWidth - 15);
          doc.text('•', margin + 5, yPosition);
          doc.text(achievementLines, margin + 10, yPosition);
          yPosition += achievementLines.length * 4.5;
        });
      }

      yPosition += 5;

      // Separator line between companies (except for last one)
      if (index < cv.companies.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(margin + 5, yPosition, pageWidth - margin - 5, yPosition);
        yPosition += 5;
      }
    });
  }

  // Footer
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Generated from CV Filters App | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Generate filename from candidate name
  const fileName = `${cv.name.replace(/\s+/g, '_')}_CV.pdf`;

  // Download the PDF
  doc.save(fileName);
}
