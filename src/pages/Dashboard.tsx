import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import SettingsModal from "@/components/dashboard/SettingsModal";
import AssessmentHistory from "@/components/dashboard/AssessmentHistory";
import { PopupModal } from "react-calendly";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  History,
  Loader2,
  LogOut,
  Settings,
  Shield,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const documents = [
  {
    id: 1,
    name: "Política de Transparência",
    description: "Template completo para divulgação de uso de IA",
    format: "DOCX",
    size: "45 KB",
    icon: Eye,
  },
  {
    id: 2,
    name: "Registro de Logs de Auditoria",
    description: "Estrutura para rastreamento de decisões",
    format: "XLSX",
    size: "32 KB",
    icon: ClipboardList,
  },
  {
    id: 3,
    name: "Documentação Técnica",
    description: "Template para descrição técnica do sistema",
    format: "DOCX",
    size: "78 KB",
    icon: FileText,
  },
  {
    id: 4,
    name: "Material de Literacia (Art. 4)",
    description: "Guia de treinamento em IA para equipes",
    format: "PDF",
    size: "2.3 MB",
    icon: BookOpen,
  },
  {
    id: 5,
    name: "Avaliação de Impacto",
    description: "Metodologia de análise de riscos",
    format: "DOCX",
    size: "56 KB",
    icon: ShieldAlert,
  },
  {
    id: 6,
    name: "Política de Supervisão Humana",
    description: "Definição de papéis e responsabilidades",
    format: "DOCX",
    size: "38 KB",
    icon: Users,
  },
];

const checklist = [
  {
    id: 1,
    task: "Realizar diagnóstico de classificação de risco",
    category: "Identificação",
    completed: true,
  },
  {
    id: 2,
    task: "Criar Política de Transparência",
    category: "Documentação",
    completed: false,
  },
  {
    id: 3,
    task: "Implementar sistema de logs de auditoria",
    category: "Técnico",
    completed: false,
  },
  {
    id: 4,
    task: "Treinar equipe em Literacia de IA (Artigo 4)",
    category: "Treinamento",
    completed: false,
  },
  {
    id: 5,
    task: "Documentar arquitetura técnica do sistema",
    category: "Documentação",
    completed: false,
  },
  {
    id: 6,
    task: "Realizar avaliação de impacto",
    category: "Análise",
    completed: false,
  },
  {
    id: 7,
    task: "Definir processos de supervisão humana",
    category: "Governança",
    completed: false,
  },
  {
    id: 8,
    task: "Testar sistema para vieses e discriminação",
    category: "Técnico",
    completed: false,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [tasks, setTasks] = useState(checklist);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendlyOpen, setCalendlyOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercentage = (completedTasks / tasks.length) * 100;

  const toggleTask = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16 px-4">
        <div className="container-legal">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Painel de Conformidade
              </h1>
              <p className="text-muted-foreground mt-1">
                Bem-vindo, {user.email}! Acompanhe seu progresso rumo à conformidade total.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {/* Assessment History Section */}
          <div className="legal-card p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <History className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Histórico de Avaliações
                </h2>
                <p className="text-xs text-muted-foreground">
                  Suas avaliações de risco anteriores
                </p>
              </div>
            </div>
            <AssessmentHistory />
          </div>

          {/* Progress Card */}
          <div className="legal-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-trust-gradient flex items-center justify-center flex-shrink-0">
                <Shield className="w-10 h-10 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Progresso de Conformidade
                  </h2>
                  <span className="text-2xl font-bold text-accent">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {completedTasks} de {tasks.length} tarefas concluídas • Prazo: Agosto 2026
                </p>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Documents Section */}
            <div className="legal-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Templates de Documentos
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {documents.map((doc) => {
                  const DocIcon = doc.icon;
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/50 hover:bg-muted/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <DocIcon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {doc.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.format} • {doc.size}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <Button variant="outline" className="w-full mt-4">
                Ver Todos os Documentos
              </Button>
            </div>

            {/* Checklist Section */}
            <div className="legal-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-accent" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Checklist de Obrigações
                  </h2>
                </div>
                <span className="text-sm text-muted-foreground">
                  {completedTasks}/{tasks.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                      task.completed
                        ? "border-accent/30 bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox
                      checked={task.completed}
                      className="mt-0.5"
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          task.completed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {task.task}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {task.category}
                      </span>
                    </div>
                    {task.completed && (
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Help Banner */}
          <div className="legal-card p-8 mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border-gold/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                  <ShieldAlert className="w-5 h-5 text-gold" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Consultoria Especializada
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Precisa de uma implementação personalizada para sistemas de Alto Risco?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fale com um especialista. Nossa equipe de advogados e engenheiros está pronta 
                  para auxiliar sua empresa em cada etapa do processo de adequação ao EU AI Act.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="gold" 
                  size="lg"
                  className="gap-2 shadow-gold"
                  onClick={() => setCalendlyOpen(true)}
                >
                  <Calendar className="w-4 h-4" />
                  Agendar Consultoria
                </Button>
                <span className="text-xs text-muted-foreground">30 min • Gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
      
      <PopupModal
        url="https://calendly.com/seu-link-aqui"
        onModalClose={() => setCalendlyOpen(false)}
        open={calendlyOpen}
        rootElement={document.getElementById("root") as HTMLElement}
        pageSettings={{
          backgroundColor: "0a1628",
          hideEventTypeDetails: false,
          hideLandingPageDetails: false,
          primaryColor: "c9a227",
          textColor: "f8fafc",
        }}
      />
    </div>
  );
};

export default Dashboard;
