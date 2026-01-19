import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (tasks: any[]) => {
  try {
    const doc = new jsPDF();
    
    // Detecta o idioma de forma segura sem quebrar o código
    const isEnglish = document.cookie.includes('googtrans=/pt/en') || document.documentElement.lang === 'en';
    const lang = isEnglish ? 'en' : 'pt';

    const content = {
      pt: { title: "Relatório de Conformidade IA", task: "Tarefa", status: "Status", done: "Concluído", todo: "Pendente" },
      en: { title: "AI Compliance Report", task: "Task", status: "Status", done: "Completed", todo: "Pending" }
    };

    const t = content[lang];

    doc.setFontSize(18);
    doc.text(t.title, 14, 22);

    const tableRows = tasks.map(task => [
      task.task || "N/A",
      task.is_completed ? t.done : t.todo
    ]);

    autoTable(doc, {
      startY: 30,
      head: [[t.col1 || t.task, t.col2 || t.status]], // Fallback caso algum nome mude
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`Relatorio_IA_${lang.toUpperCase()}.pdf`);
    console.log("PDF gerado com sucesso!");
  } catch (err) {
    console.error("Erro crítico ao gerar PDF:", err);
    alert("Erro ao gerar PDF. Verifique o console.");
  }
};