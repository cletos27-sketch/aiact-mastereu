import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (userEmail: string, answers: any[]) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('pt-PT');

  // Cabeçalho Profissional
  doc.setFontSize(22);
  doc.setTextColor(20, 48, 92); // Azul Marinho Jurídico
  doc.text('AIACT Master: Relatório de Auditoria', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Data do Diagnóstico: ${date}`, 14, 30);
  doc.text(`ID do Auditor: ${userEmail}`, 14, 35);

  // Linha divisória
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  // Determinar o nível de risco global
  const hasUnacceptable = answers.some(a => a.category === 'cat_unacceptable' && a.value === true);
  const hasHighRisk = answers.some(a => a.category === 'cat_high_risk' && a.value === true);
  
  let riskLevel = "Risco Mínimo";
  let color = [0, 128, 0]; // Verde

  if (hasUnacceptable) {
    riskLevel = "RISCO INACEITÁVEL (PROIBIDO)";
    color = [200, 0, 0]; // Vermelho
  } else if (hasHighRisk) {
    riskLevel = "ALTO RISCO (ANEXO III)";
    color = [255, 140, 0]; // Laranja Escuro
  }

  // Bloco de Veredito
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Veredito de Conformidade:', 14, 52);
  doc.setFontSize(16);
  doc.setTextColor(color[0], color[1], color[2]);
  doc.text(riskLevel, 14, 60);

  // Tabela de Respostas
  autoTable(doc, {
    startY: 70,
    head: [['Critério de Avaliação', 'Resultado', 'Ref. Legal']],
    body: answers.map(item => [
      item.question_text,
      item.value ? 'SIM' : 'NÃO',
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
      'Aviso: Este documento é uma análise automática baseada nas respostas fornecidas e não constitui aconselhamento jurídico oficial.',
      14, 285
    );
  }

  doc.save(`AIACT_Master_Relatorio_${date.replace(/\//g, '-')}.pdf`);
};