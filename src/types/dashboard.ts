export interface RiskCategory {
  id: string;
  name: string;
  name_en?: string;
  description: string;
  risk_level: 'unacceptable' | 'high' | 'medium' | 'low';
}

export interface RiskQuestion {
  id: string;
  category_id: string;
  question_text: string;
  question_text_en?: string;
  explanation: string;
  explanation_en?: string;
  legal_reference: string;
}

export interface UserAnswer {
  question_id: string;
  value: boolean;
}