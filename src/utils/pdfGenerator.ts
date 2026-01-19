import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CompliancePDFData {
  user: {
    email?: string;
  };
  tasks: any[];
}

export const generateCompliancePDF = (data: CompliancePDFData, lang: 'pt' | 'en' = 'pt') => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString(lang === 'pt' ? 'pt-PT' : 'en-GB');
  const userEmail = data.user.email || 'N/A';

  const labels = {
    pt: { 
      title: 'Relatório de Conformidade', 
      auditDate: 'Data do Diagnóstico:', 
      auditorId: 'ID do Auditor:',
      verdict: 'Veredito de Conformidade:',
      unacceptableRisk: 'RISCO INACEITÁVEL (PROIBIDO)',
      highRisk: 'ALTO RISCO (ANEXO III)',
      minimalLowRisk: 'RISCO MÍNIMO',
      assessmentCriterion: 'Tarefa de Conformidade',
      result: 'Status',
      legalReference: 'Ref. Legal',
      completed: 'Concluído',
      pending: 'Pendente',
      disclaimer: 'Aviso: Este documento é uma análise automática baseada nas respostas fornecidas e não constitui aconselhamento jurídico oficial.',
      fileName: 'AIACT_Master_Relatorio'
    },
    en: { 
      title: 'Compliance Report', 
      auditDate: 'Audit Date:', 
      auditorId: 'Auditor ID:',
      verdict: 'Compliance Verdict:',
      unacceptableRisk: 'UNACCEPTABLE RISK (PROHIBITED)',
      highRisk: 'HIGH-RISK (ANNEX III)',
      minimalLowRisk: 'MINIMAL/LOW RISK',
      assessmentCriterion: 'Compliance Task',
      result: 'Status',
      legalReference: 'Legal Reference',
      completed: 'Completed',
      pending: 'Pending',
      disclaimer: 'Disclaimer: This document is an automated preliminary assessment based on provided answers and does not constitute official legal advice under the EU 2024/1689 Regulation.',
      fileName: 'AIACT_Master_Compliance_Report'
    }
  };

  const t = labels[lang];

  // Header
  doc.setFontSize(22);
  doc.setTextColor(20, 48, 92);
  doc.text(`AIACT Master: ${t.title}`, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${t.auditDate} ${date}`, 14, 30);
  doc.text(`${t.auditorId} ${userEmail}`, 14, 35);

  // Table of Tasks
  autoTable(doc, {
    startY: 45,
    head: [[t.assessmentCriterion, t.result]],
    body: data.tasks.map(task => [
      lang === 'en' ? (task.task_en || task.task) : task.task,
      task.completed ? t.completed : t.pending
    ]),
    headStyles: { fillColor: [20, 48, 92] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      t.disclaimer,
      14, 285
    );
  }

  doc.save(`${t.fileName}_${date.replace(/\//g, '-')}.pdf`);
};

export const generateComplianceBadge = (riskLevel: string) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [80, 50]
  });

  const isSafe = riskLevel.includes('MINIMAL') || riskLevel.includes('LOW');
  const color = isSafe ? [0, 128, 0] : [255, 140, 0];

  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 80, 50, 'F');

  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(2);
  doc.rect(2, 2, 76, 46);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('EU AI ACT PRE-ASSESSMENT', 40, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(riskLevel, 40, 28, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont('helvetica', 'normal');
  doc.text('Verified by AIACT Master', 40, 42, { align: 'center' });

  doc.save('AI_Compliance_Badge.pdf');
};