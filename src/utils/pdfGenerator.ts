import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (userEmail: string, answers: any[]) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('en-GB'); // Alterado para formato de data internacional

  // Cabeçalho
  doc.setFontSize(22);
  doc.setTextColor(20, 48, 92); // Azul Marinho Jurídico
  doc.text('AIACT Master: Compliance Audit Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Audit Date: ${date}`, 14, 30);
  doc.text(`Auditor ID: ${userEmail}`, 14, 35);

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  // Determinar o nível de risco global
  const hasUnacceptable = answers.some(a => a.category === 'cat_unacceptable' && a.value === true);
  const hasHighRisk = answers.some(a => a.category === 'cat_high_risk' && a.value === true);
  
  let riskLevel = "MINIMAL/LOW RISK";
  let color = [0, 128, 0]; // Green

  if (hasUnacceptable) {
    riskLevel = "UNACCEPTABLE RISK (PROHIBITED)";
    color = [200, 0, 0]; // Red
  } else if (hasHighRisk) {
    riskLevel = "HIGH-RISK (ANNEX III)";
    color = [255, 140, 0]; // Orange
  } else {
    riskLevel = "MINIMAL/LOW RISK";
    color = [0, 128, 0]; // Green
  }

  // Bloco de Veredito
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Compliance Verdict:', 14, 52);
  doc.setFontSize(16);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(riskLevel, 14, 60);

  // Tabela de Respostas
  autoTable(doc, {
    startY: 70,
    head: [['Assessment Criterion', 'Result', 'Legal Reference']],
    body: answers.map(item => [
      item.question_text,
      item.value ? 'YES' : 'NO', // Alterado para YES/NO
      item.legal_reference || 'N/A'
    ]),
    headStyles: { fillColor: [20, 48, 92] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 70 }
  });

  // Rodapé com aviso legal
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Disclaimer: This document is an automated preliminary assessment based on provided answers and does not constitute official legal advice under the EU 2024/1689 Regulation.',
      14, 285
    );
  }

  doc.save(`AIACT_Master_Compliance_Report_${date.replace(/\//g, '-')}.pdf`); // Nome do arquivo atualizado
};