-- Create table for tracking user task completion
CREATE TABLE public.user_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_key)
);

-- Enable Row Level Security
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access - users can only view their own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.user_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own tasks
CREATE POLICY "Users can insert their own tasks" 
ON public.user_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update their own tasks" 
ON public.user_tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_tasks_updated_at
BEFORE UPDATE ON public.user_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();