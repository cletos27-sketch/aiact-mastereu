"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DocumentsModal from '@/components/dashboard/DocumentsModal';
import { useTaskProgress } from '@/hooks/useTaskProgress';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateCompliancePDF } from '@/utils/pdfGenerator';

const Dashboard = () => {
  const t = {
    title: "Painel de Conformidade",
    subtitle: "Acompanhe seu progresso de conformidade e gerencie seus documentos.",
    updateAccess: "Atualizar Acesso",
    library: "Biblioteca de Documentos",
    progress: "Seu Progresso de Conformidade"
  };

  const { tasks, toggleTask } = useTaskProgress();
  const { user } = useAuth();
  const [isDocumentsOpen, setDocumentsOpen] = useState(false);

  const handleUpdateAccess = async () => {
    const { data, error } = await supabase.functions.invoke('customer-portal');
    if (error) {
      toast.error('Failed to open customer portal.');
      return;
    }
    window.location.href = data.url;
  };

  const handleDownload = (lang: 'pt' | 'en') => {
    const pdfData = {
      user: { email: user?.email },
      tasks: tasks,
    };
    generateCompliancePDF(pdfData, lang);
    toast.success(`Generating Compliance Report PDF in ${lang.toUpperCase()}...`);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold">
            {t.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t.subtitle}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleUpdateAccess}>
            {t.updateAccess}
          </Button>
          <Button onClick={() => setDocumentsOpen(true)}>
            {t.library}
          </Button>
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-6">
          {t.progress}
        </h2>
        
        <div className="space-y-3">
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.key} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                <Checkbox 
                  id={`task-${task.key}`}
                  checked={task.completed} 
                  onCheckedChange={() => toggleTask(task.key)}
                  className="mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <label
                    htmlFor={`task-${task.key}`}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {task.task}
                  </label>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic">Carregando tarefas...</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-2">
        <Button onClick={() => handleDownload('pt')}>Baixar PDF (PT)</Button>
        <Button onClick={() => handleDownload('en')} variant="outline">Download PDF (EN)</Button>
      </div>

      <DocumentsModal open={isDocumentsOpen} onOpenChange={setDocumentsOpen} />
    </div>
  );
};

export default Dashboard;