import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (userEmail: string, answers: any[], lang: 'pt' | 'en' = 'pt') => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString(lang === 'pt' ? 'pt-PT' : 'en-GB');

  const labels = {
    pt: { 
      title: 'Relatório de Auditoria', 
      auditDate: 'Data do Diagnóstico:', 
      auditorId: 'ID do Auditor:',
      verdict: 'Veredito de Conformidade:',
      unacceptableRisk: 'RISCO INACEITÁVEL (PROIBIDO)',
      highRisk: 'ALTO RISCO (ANEXO III)',
      minimalLowRisk: 'RISCO MÍNIMO',
      assessmentCriterion: 'Critério de Avaliação',
      result: 'Resultado',
      legalReference: 'Ref. Legal',
      yes: 'SIM',
      no: 'NÃO',
      disclaimer: 'Aviso: Este documento é uma análise automática baseada nas respostas fornecidas e não constitui aconselhamento jurídico oficial.',
      fileName: 'AIACT_Master_Relatorio'
    },
    en: { 
      title: 'Compliance Audit Report', 
      auditDate: 'Audit Date:', 
      auditorId: 'Auditor ID:',
      verdict: 'Compliance Verdict:',
      unacceptableRisk: 'UNACCEPTABLE RISK (PROHIBITED)',
      highRisk: 'HIGH-RISK (ANNEX III)',
      minimalLowRisk: 'MINIMAL/LOW RISK',
      assessmentCriterion: 'Assessment Criterion',
      result: 'Result',
      legalReference: 'Legal Reference',
      yes: 'YES',
      no: 'NO',
      disclaimer: 'Disclaimer: This document is an automated preliminary assessment based on provided answers and does not constitute official legal advice under the EU 2024/1689 Regulation.',
      fileName: 'AIACT_Master_Compliance_Report'
    }
  };

  const t = labels[lang];

  // Cabeçalho
  doc.setFontSize(22);
  doc.setTextColor(20, 48, 92); // Azul Marinho Jurídico
  doc.text(`AIACT Master: ${t.title}`, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${t.auditDate} ${date}`, 14, 30);
  doc.text(`${t.auditorId} ${userEmail}`, 14, 35);

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  // Determinar o nível de risco global
  const hasUnacceptable = answers.some(a => a.category === 'cat_unacceptable' && a.value === true);
  const hasHighRisk = answers.some(a => a.category === 'cat_high_risk' && a.value === true);
  
  let riskLevel = t.minimalLowRisk;
  let color = [0, 128, 0]; // Green

  if (hasUnacceptable) {
    riskLevel = t.unacceptableRisk;
    color = [200, 0, 0]; // Red
  } else if (hasHighRisk) {
    riskLevel = t.highRisk;
    color = [255, 140, 0]; // Orange
  } else {
    riskLevel = t.minimalLowRisk;
    color = [0, 128, 0]; // Green
  }

  // Bloco de Veredito
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(t.verdict, 14, 52);
  doc.setFontSize(16);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(riskLevel, 14, 60);

  // Tabela de Respostas
  autoTable(doc, {
    startY: 70,
    head: [[t.assessmentCriterion, t.result, t.legalReference]],
    body: answers.map(item => [
      lang === 'pt' ? item.question_text : (item.question_text_en || item.question_text),
      item.value ? t.yes : t.no,
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
    format: [80, 50] // Tamanho de um cartão/badge
  });

  const isSafe = riskLevel.includes('MINIMAL') || riskLevel.includes('LOW');
  const color = isSafe ? [0, 128, 0] : [255, 140, 0]; // Verde ou Laranja

  // Fundo
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, 80, 50, 'F');

  // Borda colorida
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(2);
  doc.rect(2, 2, 76, 46);

  // Texto do Selo
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