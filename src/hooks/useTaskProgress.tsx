import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Task {
  key: string;
  task: string;
  task_en?: string;
  category: string;
  category_en?: string;
  premium: boolean;
}

interface TaskState extends Task {
  completed: boolean;
  loading: boolean;
}

const initialTasks: Task[] = [
  { key: 'define_purpose', task: 'Definir a finalidade do sistema de IA', task_en: 'Define the purpose of the AI system', category: 'Governança', category_en: 'Governance', premium: false },
  { key: 'classify_risk', task: 'Classificar o nível de risco do sistema', task_en: 'Classify the risk level of the system', category: 'Avaliação de Risco', category_en: 'Risk Assessment', premium: false },
  { key: 'implement_qms', task: 'Implementar Sistema de Gestão de Qualidade (QMS)', task_en: 'Implement Quality Management System (QMS)', category: 'Alto Risco', category_en: 'High-Risk', premium: true },
  { key: 'technical_docs', task: 'Preparar documentação técnica (Anexo IV)', task_en: 'Prepare technical documentation (Annex IV)', category: 'Alto Risco', category_en: 'High-Risk', premium: true },
  { key: 'conformity_assessment', task: 'Realizar avaliação de conformidade', task_en: 'Conduct conformity assessment', category: 'Alto Risco', category_en: 'High-Risk', premium: true },
  { key: 'register_eu_db', task: 'Registar o sistema na base de dados da UE', task_en: 'Register the system in the EU database', category: 'Alto Risco', category_en: 'High-Risk', premium: true },
  { key: 'human_oversight', task: 'Estabelecer supervisão humana', task_en: 'Establish human oversight', category: 'Governança', category_en: 'Governance', premium: true },
  { key: 'transparency_obligations', task: 'Cumprir obrigações de transparência', task_en: 'Fulfill transparency obligations', category: 'Transparência', category_en: 'Transparency', premium: false },
  { key: 'data_governance', task: 'Implementar governança de dados', task_en: 'Implement data governance', category: 'Dados', category_en: 'Data', premium: true },
  { key: 'log_capabilities', task: 'Garantir capacidades de logging', task_en: 'Ensure logging capabilities', category: 'Técnico', category_en: 'Technical', premium: true },
];

export const useTaskProgress = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskState[]>(
    initialTasks.map(task => ({ ...task, completed: false, loading: false }))
  );
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .select('task, is_completed')
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(currentTasks =>
        currentTasks.map(task => {
          const savedTask = data.find(d => d.task === task.key);
          return { ...task, completed: savedTask ? savedTask.is_completed : false };
        })
      );
    } catch (error: any) { // Captura o erro para exibir a mensagem
      console.error('Error fetching task progress:', error);
      toast.error(`Erro ao carregar progresso das tarefas: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setInitialLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const toggleTask = async (taskKey: string) => {
    if (!user) return;

    const task = tasks.find(t => t.key === taskKey);
    if (!task) return;

    const newCompletedState = !task.completed;

    // Optimistically update the UI
    setTasks(currentTasks =>
      currentTasks.map(t => 
        t.key === taskKey ? { ...t, completed: newCompletedState, loading: true } : t
      )
    );

    try {
      const taskToUpdate = initialTasks.find(t => t.key === taskKey);
      if (!taskToUpdate) return;

      const { error } = await supabase
        .from('user_tasks')
        .upsert(
          { 
            user_id: user.id, 
            task: taskKey, 
            is_completed: newCompletedState,
            category: taskToUpdate.category,
            premium: taskToUpdate.premium
          },
          { onConflict: 'user_id, task' }
        );

      if (error) {
        throw error;
      }
    } catch (error: any) { // Captura o erro para exibir a mensagem
      console.error("Error updating task:", error);
      // Revert the change in UI on error
      setTasks(currentTasks =>
        currentTasks.map(t =>
          t.key === taskKey ? { ...t, completed: task.completed } : t
        )
      );
      toast.error(`Falha ao atualizar o progresso da tarefa: ${error.message || 'Erro desconhecido'}.`);
    } finally {
      // Remove loading state
      setTasks(currentTasks =>
        currentTasks.map(t =>
          t.key === taskKey ? { ...t, loading: false } : t
        )
      );
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    tasks,
    initialLoading,
    toggleTask,
    completedCount,
    totalCount,
    progressPercentage,
  };
};