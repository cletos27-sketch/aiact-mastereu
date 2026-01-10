import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Define the checklist items with unique keys
export const CHECKLIST_ITEMS = [
  {
    key: "diagnostico_risco",
    task: "Realizar diagnóstico de classificação de risco",
    category: "Identificação",
  },
  {
    key: "politica_transparencia",
    task: "Criar Política de Transparência",
    category: "Documentação",
  },
  {
    key: "logs_auditoria",
    task: "Implementar sistema de logs de auditoria",
    category: "Técnico",
  },
  {
    key: "treinar_literacia",
    task: "Treinar equipe em Literacia de IA (Artigo 4)",
    category: "Treinamento",
  },
  {
    key: "documentar_arquitetura",
    task: "Documentar arquitetura técnica do sistema",
    category: "Documentação",
  },
  {
    key: "avaliacao_impacto",
    task: "Realizar avaliação de impacto",
    category: "Análise",
  },
  {
    key: "supervisao_humana",
    task: "Definir processos de supervisão humana",
    category: "Governança",
  },
  {
    key: "testar_vieses",
    task: "Testar sistema para vieses e discriminação",
    category: "Técnico",
  },
];

export interface TaskState {
  key: string;
  task: string;
  category: string;
  completed: boolean;
  loading: boolean;
}

export const useTaskProgress = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskState[]>(
    CHECKLIST_ITEMS.map((item) => ({
      ...item,
      completed: false,
      loading: false,
    }))
  );
  const [initialLoading, setInitialLoading] = useState(true);

  // Load initial task states from database
  const loadTasks = useCallback(async () => {
    if (!user) {
      setInitialLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_tasks")
        .select("task_key, completed")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading tasks:", error);
        return;
      }

      // Create a map of task_key -> completed status
      const completedMap = new Map<string, boolean>();
      data?.forEach((row) => {
        completedMap.set(row.task_key, row.completed);
      });

      // Update tasks state with database values
      setTasks((prev) =>
        prev.map((task) => ({
          ...task,
          completed: completedMap.get(task.key) ?? false,
          loading: false,
        }))
      );
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setInitialLoading(false);
    }
  }, [user]);

  // Load tasks on mount and when user changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Toggle a task's completion status with optimistic update
  const toggleTask = useCallback(
    async (taskKey: string) => {
      if (!user) return;

      // Find the current task
      const currentTask = tasks.find((t) => t.key === taskKey);
      if (!currentTask) return;

      const newCompleted = !currentTask.completed;

      // Optimistic update - set loading and new value
      setTasks((prev) =>
        prev.map((task) =>
          task.key === taskKey
            ? { ...task, completed: newCompleted, loading: true }
            : task
        )
      );

      try {
        // Upsert the task status in database
        const { error } = await supabase.from("user_tasks").upsert(
          {
            user_id: user.id,
            task_key: taskKey,
            completed: newCompleted,
          },
          {
            onConflict: "user_id,task_key",
          }
        );

        if (error) {
          console.error("Error saving task:", error);
          // Revert on error
          setTasks((prev) =>
            prev.map((task) =>
              task.key === taskKey
                ? { ...task, completed: !newCompleted, loading: false }
                : task
            )
          );
          return;
        }

        // Success - remove loading state
        setTasks((prev) =>
          prev.map((task) =>
            task.key === taskKey ? { ...task, loading: false } : task
          )
        );
      } catch (error) {
        console.error("Error saving task:", error);
        // Revert on error
        setTasks((prev) =>
          prev.map((task) =>
            task.key === taskKey
              ? { ...task, completed: !newCompleted, loading: false }
              : task
          )
        );
      }
    },
    [user, tasks]
  );

  // Calculate progress
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return {
    tasks,
    initialLoading,
    toggleTask,
    completedCount,
    totalCount,
    progressPercentage,
    refresh: loadTasks,
  };
};
