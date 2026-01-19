-- Create risk_assessments table to store questionnaire results and AI analysis
CREATE TABLE public.risk_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_classification TEXT NOT NULL,
  ai_analysis JSONB,
  legal_justification TEXT,
  relevant_articles TEXT[],
  priority_actions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for secure access
CREATE POLICY "Users can view their own risk assessments"
ON public.risk_assessments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk assessments"
ON public.risk_assessments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk assessments"
ON public.risk_assessments
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_risk_assessments_updated_at
BEFORE UPDATE ON public.risk_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries by user
CREATE INDEX idx_risk_assessments_user_id ON public.risk_assessments(user_id);
CREATE INDEX idx_risk_assessments_created_at ON public.risk_assessments(created_at DESC);