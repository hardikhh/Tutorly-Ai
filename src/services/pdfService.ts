import { jsPDF } from 'jspdf';
import { QuizQuestion } from './topicGenerator';

export function generateQuizPDF(
  topic: string,
  questions: QuizQuestion[],
  options?: { score?: number; studentName?: string; timeSpent?: string }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = margin;
      renderHeader(false);
    }
  };

  const renderHeader = (isCover: boolean = false) => {
    // Top banner
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, currentY, contentWidth, 16, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TUTORLY AI LEARNING COACH  |  UN SDG 4: QUALITY EDUCATION', margin + 6, currentY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Smart Concept Mastery & Verified Answer Key', margin + 6, currentY + 12);

    currentY += 22;

    if (isCover) {
      // Document Title
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(`Mastery Quiz: ${topic}`, margin, currentY);
      currentY += 7;

      // Metadata Bar
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, currentY, contentWidth, 13, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');

      const lowCount = questions.filter(q => q.difficulty === 'Low').length;
      const medCount = questions.filter(q => q.difficulty === 'Medium').length;
      const hardCount = questions.filter(q => q.difficulty === 'Hard').length;
      const breakdownText =
        lowCount || medCount || hardCount
          ? `Structure: ${lowCount} Low  |  ${medCount} Medium  |  ${hardCount} Hard`
          : `Total: ${questions.length} Questions`;

      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin + 5, currentY + 8);
      doc.text(breakdownText, margin + 42, currentY + 8);

      if (options?.timeSpent) {
        doc.text(`Time: ${options.timeSpent}`, margin + 115, currentY + 8);
      }

      if (options?.score !== undefined) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Mastered green
        doc.text(`Score: ${options.score} / ${questions.length}`, contentWidth - 8, currentY + 8);
      }

      currentY += 19;
    }
  };

  // Initial Cover Header
  renderHeader(true);

  // ==========================================
  // SECTION 1: QUESTIONS & MULTIPLE CHOICE
  // ==========================================
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, currentY, 4, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PART 1: PRACTICE QUESTIONS', margin + 8, currentY + 7);
  currentY += 14;

  questions.forEach((q, idx) => {
    const diff = q.difficulty ? `[${q.difficulty.toUpperCase()} LEVEL] ` : '';
    const questionHeader = `Q${idx + 1}. ${diff}${q.prompt}`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);

    const qLines = doc.splitTextToSize(questionHeader, contentWidth);
    checkPageBreak(qLines.length * 5 + q.options.length * 6 + 8);

    doc.text(qLines, margin, currentY);
    currentY += qLines.length * 4.8 + 2;

    // Options A, B, C, D
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    q.options.forEach((opt, oIdx) => {
      const label = String.fromCharCode(65 + oIdx); // A, B, C, D
      const optText = `   [  ]  ${label})  ${opt}`;
      const optLines = doc.splitTextToSize(optText, contentWidth - 4);

      checkPageBreak(optLines.length * 4.2 + 2);
      doc.text(optLines, margin + 2, currentY);
      currentY += optLines.length * 4.2 + 1.2;
    });

    currentY += 4; // Space between questions
  });

  // ==========================================
  // SECTION 2: ANSWER KEY & DETAILED EXPLANATIONS
  // ==========================================
  doc.addPage();
  currentY = margin;
  renderHeader(false);

  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(margin, currentY, 4, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('PART 2: VERIFIED ANSWER KEY & STEP EXPLANATIONS', margin + 8, currentY + 7);
  currentY += 14;

  questions.forEach((q, idx) => {
    const correctLetter = String.fromCharCode(65 + q.correctIndex);
    const correctText = q.options[q.correctIndex];
    const diffTag = q.difficulty ? ` (${q.difficulty} Level)` : '';

    const answerTitle = `Question ${idx + 1}${diffTag}: Correct Answer is Option ${correctLetter}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(16, 185, 129);

    const titleLines = doc.splitTextToSize(answerTitle, contentWidth);
    const explanationLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, contentWidth - 4);
    const optSummaryLines = doc.splitTextToSize(`Chosen Answer: "${correctText}"`, contentWidth - 4);

    const totalBlockHeight =
      titleLines.length * 4.5 + explanationLines.length * 4.2 + optSummaryLines.length * 4.2 + 8;
    checkPageBreak(totalBlockHeight);

    doc.text(titleLines, margin, currentY);
    currentY += titleLines.length * 4.5 + 1.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    doc.setTextColor(71, 85, 105);

    doc.text(optSummaryLines, margin + 4, currentY);
    currentY += optSummaryLines.length * 4 + 1.5;

    doc.setTextColor(15, 23, 42);
    doc.text(explanationLines, margin + 4, currentY);
    currentY += explanationLines.length * 4.2 + 5;
  });

  // Add page numbers on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Tutorly AI Learning Platform  •  UN SDG 4 Quality Education  •  Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 8
    );
  }

  // Save and download PDF
  const cleanName = topic.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
  doc.save(`Tutorly_Quiz_${cleanName}.pdf`);
}
