import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner'; // Import sonner toast

export const generatePDF = (tasks: any[]) => {
  try {
    const doc = new jsPDF();
    
    // Detecta o idioma de forma segura sem quebrar o código
    // Prioriza o cookie do Google Translate, depois o atributo lang do HTML
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
      head: [[t.task, t.status]],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save(`Relatorio_IA_${lang.toUpperCase()}.pdf`);
    toast.success("PDF gerado com sucesso!"); // Use sonner toast for consistency
    console.log("PDF gerado com sucesso!");
  } catch (err: any) { // Catch error as 'any' to access message property
    console.error("Erro crítico ao gerar PDF:", err);
    toast.error(`Erro ao gerar PDF: ${err.message || 'Erro desconhecido'}`); // Provide more specific error message
    // alert("Erro ao gerar PDF. Verifique o console."); // Removido alert, usando toast
  }
};