import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';



// Função que lê o cookie do Google Tradutor para saber o idioma atual do site

const getCurrentLanguage = () => {

  try {

    const cookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));

    if (cookie) {

      const lang = cookie.split('/').pop(); // Extrai 'en', 'es', etc.

      return lang === 'en' ? 'en' : 'pt'; 

    }

  } catch (e) {

    console.error("Erro ao ler idioma do Google:", e);

  }

  return 'pt'; // Se não encontrar nada, o padrão é Português

};



export const generatePDF = (tasks: any[]) => {

  const lang = getCurrentLanguage();

  const doc = new jsPDF();



  // Dicionário de tradução fixo APENAS para o PDF

  const content = {

    pt: { 

      title: "Relatório de Conformidade EU AI Act", 

      col1: "Tarefa", 

      col2: "Status", 

      done: "Concluído", 

      todo: "Pendente" 

    },

    en: { 

      title: "EU AI Act Compliance Report", 

      col1: "Task", 

      col2: "Status", 

      done: "Completed", 

      todo: "Pending" 

    }

  };



  const t = content[lang as keyof typeof content] || content.pt;



  // Título do Documento

  doc.setFontSize(18);

  doc.setTextColor(15, 23, 42); // Cor Slate-900 do seu site

  doc.text(t.title, 14, 22);



  // Gerar a Tabela

  autoTable(doc, {

    startY: 30,

    head: [[t.col1, t.col2]],

    body: tasks.map(task => [

      task.task, // Texto da tarefa vindo do banco

      task.is_completed ? t.done : t.todo

    ]),

    headStyles: { fillColor: [15, 23, 42] }, // Cabeçalho com a cor do site

    theme: 'striped'

  });



  doc.save(`Relatorio_AI_${lang.toUpperCase()}.pdf`);

};