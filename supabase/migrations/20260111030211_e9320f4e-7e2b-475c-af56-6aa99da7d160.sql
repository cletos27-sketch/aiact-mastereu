-- Add DELETE policy for risk_assessments to allow users to delete their own data (GDPR compliance)
CREATE POLICY "Users can delete their own risk assessments"
ON public.risk_assessments
FOR DELETE
USING (auth.uid() = user_id);