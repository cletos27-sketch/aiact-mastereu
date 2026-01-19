-- Create system_updates table for regulatory notifications
CREATE TABLE public.system_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT NOT NULL DEFAULT 'info', -- info, warning, regulation, template
  priority INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active system updates (public notifications)
CREATE POLICY "Authenticated users can view active system updates"
ON public.system_updates
FOR SELECT
TO authenticated
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_system_updates_updated_at
BEFORE UPDATE ON public.system_updates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial regulatory updates
INSERT INTO public.system_updates (title, content, update_type, priority) VALUES
('Novo Template Anexo IV Disponível', 'Atualizámos o template do Dossiê Técnico Anexo IV com as últimas orientações da Comissão Europeia de Janeiro 2026.', 'template', 10),
('Prazo Art. 6(4) - Sistemas de Alto Risco', 'Lembre-se: O prazo para registo de sistemas de IA de alto risco no banco de dados da UE é 2 de Agosto de 2026.', 'regulation', 8),
('Guia de Literacia Art. 4 Atualizado', 'O guia de formação em literacia de IA foi atualizado para refletir as melhores práticas do mercado.', 'info', 5);