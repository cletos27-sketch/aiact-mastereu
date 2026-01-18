export interface RiskAssessment {
  id: string;
  risk_classification: string;
  risk_score: number;
  created_at: string;
  legal_justification: string | null;
  relevant_articles: string[] | null;
  priority_actions: string[] | null;
  responses: unknown;
}

export type DocumentType = 
  | "transparencia"
  | "logs"
  | "tecnica"
  | "literacia"
  | "impacto"
  | "supervisao";